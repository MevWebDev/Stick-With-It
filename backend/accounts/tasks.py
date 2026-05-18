from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache
import pytz
from habits.models import Habit, HabitCompletion
from .models import PushSubscription, NotificationPreference, DailyChallenge
from .utils import send_push_notification
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


@shared_task
def send_pomodoro_completion_push(user_id):
    """Deprecated: Frontend now handles Pomodoro notifications via Service Worker"""
    pass


@shared_task
def process_user_notifications():
    """
    Scheduled task (every minute via Celery Beat) that checks and sends notifications
    for habits and daily challenges based on each user's preferences and timezone.
    """
    now_utc = timezone.now()
    logger.info("🔔 Starting notification check at %s UTC", now_utc)

    users = User.objects.all()
    logger.info("👥 Found %d users to check", users.count())

    for user in users:
        try:
            pref = NotificationPreference.objects.get(user=user)
            
            # Get user's timezone with fallback to UTC
            try:
                tz = pytz.timezone(pref.timezone)
            except pytz.exceptions.UnknownTimeZoneError:
                logger.warning("  ⚠️  User %s has invalid timezone '%s', skipping",
                              user.username, pref.timezone)
                continue
            
            user_now = now_utc.astimezone(tz)
            user_time = user_now.time()
            user_date = user_now.date()

            logger.info("👤 Checking user=%s, time=%s, tz=%s",
                       user.username, user_time, pref.timezone)

            if pref.is_enabled_habits:
                _send_notification_for_user(
                    user, user_time, user_date, 'habits',
                    pref.notification_time_habits
                )

            if pref.is_enabled_challenges:
                _send_notification_for_user(
                    user, user_time, user_date, 'challenges',
                    pref.notification_time_challenges
                )

        except NotificationPreference.DoesNotExist:
            pass  # User hasn't set up notifications yet
        except Exception as e:
            logger.error("❌ Error processing user %s: %s", user.id, str(e), exc_info=True)


def _send_notification_for_user(user, user_time, user_date, tool_type, scheduled_time):
    """
    Sends a push notification for a specific tool if:
    - Current time matches the scheduled minute exactly
    - Notification hasn't been sent today
    - User has incomplete items (habits/challenges)
    """
    # Only trigger at the exact scheduled minute
    current_minutes = user_time.hour * 60 + user_time.minute
    scheduled_minutes = scheduled_time.hour * 60 + scheduled_time.minute

    if current_minutes != scheduled_minutes:
        logger.debug("  ⏰ %s: current=%s, scheduled=%s - skipping",
                     tool_type, user_time, scheduled_time)
        return

    # Prevent duplicate sends today
    cache_key = f"notification_sent_{user.id}_{tool_type}_{user_date}"
    if cache.get(cache_key):
        logger.info("  ℹ️  %s: Already sent today, skipping", tool_type)
        return

    # Check for incomplete items
    has_incomplete = _check_incomplete_items(user, user_date, tool_type)
    logger.info("  📊 %s: has_incomplete=%s", tool_type, has_incomplete)

    if not has_incomplete:
        logger.info("  ℹ️  %s: No incomplete items, skipping", tool_type)
        return

    # Send notification
    subscriptions = PushSubscription.objects.filter(user=user)
    logger.info("  🔌 Found %d subscriptions for user=%s",
                subscriptions.count(), user.username)

    if not subscriptions.exists():
        logger.warning("  ⚠️  %s: No subscriptions found for user %s",
                       tool_type, user.username)
        return

    message = _build_notification_message(tool_type)
    sent_count = 0

    for subscription in subscriptions:
        try:
            send_push_notification(subscription, message)
            logger.info("  📬 Sent %s notification to subscription %d",
                       tool_type, subscription.id)
            sent_count += 1
        except Exception as e:
            logger.error("  ❌ Failed to send to subscription %d: %s",
                        subscription.id, str(e))

    if sent_count > 0:
        cache.set(cache_key, True, timeout=86400)  # 24 hours
        logger.info("  📬 Notification sent and cached for %s", tool_type)


def _check_incomplete_items(user, user_date, tool_type):
    """Check if user has incomplete habits or challenges for today"""
    if tool_type == 'habits':
        user_habits = Habit.objects.filter(user=user)
        for habit in user_habits:
            completed_today = HabitCompletion.objects.filter(
                habit=habit, completion_date=user_date
            ).exists()
            if not completed_today:
                return True
        return False

    elif tool_type == 'challenges':
        return DailyChallenge.objects.filter(
            user=user, assigned_date=user_date, completed=False
        ).exists()

    return False


def _build_notification_message(tool_type):
    """Build the notification message based on tool type"""
    if tool_type == 'habits':
        return {"title": "Habit Reminder", "body": "You have uncompleted habits today!"}
    else:  # challenges
        return {"title": "Challenge Reminder",
                "body": "You have an uncompleted daily challenge!"}
