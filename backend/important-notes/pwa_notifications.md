# PWA Push Notifications

## Overview
This feature adds push notifications to the PWA (Progressive Web App). Users can choose to get reminders for habits and daily challenges at a time they set. Notifications only fire when there are uncompleted items and only once per day.

## How it works

### 1. User subscribes to notifications
- The frontend asks permission to send notifications.
- If allowed, the browser creates a subscription (endpoint + keys) and sends it to the backend.
- The backend saves this subscription in the `PushSubscription` model.

### 2. User sets preferences
- In settings, users pick:
  - What tools to get notified for (habits, challenges)
  - What time they want the notification
  - Their timezone
- These are saved in the `NotificationPreference` model.

### 3. Celery Beat triggers the check
- A periodic task (`process_user_notifications`) runs every minute via Celery Beat.
- It uses Django Celery Beat's database scheduler, so schedules can be managed via the Django admin if needed.

### 4. Celery Worker processes users
For each user with preferences:
1. Convert current UTC time to the user's timezone.
2. Check if the current minute matches their scheduled minute **exactly**.
3. If yes, check if a notification was already sent today (using Redis cache).
4. If not sent today, check if there are incomplete habits or challenges.
5. If there are incomplete items, send a push notification to all of the user's subscriptions.
6. Cache the send status for 24 hours to prevent duplicates.

### 5. Push notification delivery
- The backend uses `pywebpush` with VAPID keys to send the notification.
- The browser receives it and shows it via the Service Worker.

## What was added/changed

### Backend changes
- **`accounts/models.py`**: Added `PushSubscription` and `NotificationPreference` models.
- **`accounts/tasks.py`**: Complete rewrite of the notification logic:
  - Only triggers at the exact scheduled minute (no more "every minute" spam).
  - Uses Redis cache to prevent duplicate sends per day.
  - Modular helper functions for checking incomplete items and building messages.
  - Clean, readable code with proper logging.
- **`accounts/utils.py`**: Added `send_push_notification()` function using `pywebpush`.
- **`accounts/views.py`**: Added API endpoints to save subscriptions and update preferences.
- **`backend/celery.py`**: Removed hardcoded beat schedule (now using DatabaseScheduler).
- **`backend/settings.py`**: Added VAPID configuration and Celery settings.
- **`docker-compose.yml`**: Fixed VAPID key consistency across all services.

### Frontend changes
- **`frontend/src/app/lib/pushNotifications/`**: Service Worker and subscription helpers.
- **`frontend/src/app/components/NotificationPreferencesForm.tsx`**: UI for setting notification preferences.
- **`frontend/src/app/(main)/settings/page.tsx`**: Integrated the preferences form.

### Deleted files
- **`accounts/celery.py`**: Outdated config referencing a non-existent task.

## How to extend for new tools (e.g., Water, Notes)

If you add new models like `WaterTracker` or `Notes`, follow these steps:

### 1. Add a new toggle in `NotificationPreference`
In `accounts/models.py`:
```python
class NotificationPreference(models.Model):
    # existing fields...
    is_enabled_water = models.BooleanField(default=False)
    notification_time_water = models.TimeField(default=time(9, 0))
```

Run migrations:
```bash
python manage.py makemigrations accounts
python manage.py migrate
```

### 2. Update the frontend form
In `NotificationPreferencesForm.tsx`, add a new section for Water with a toggle and time picker.

### 3. Add logic in `tasks.py`
In `process_user_notifications()`:
```python
if pref.is_enabled_water:
    _send_notification_for_user(
        user, user_time, user_date, 'water',
        pref.notification_time_water
    )
```

In `_check_incomplete_items()`:
```python
elif tool_type == 'water':
    return WaterTracker.objects.filter(
        user=user, date=user_date, completed=False
    ).exists()
```

In `_build_notification_message()`:
```python
elif tool_type == 'water':
    return {"title": "Water Reminder", "body": "Don't forget to log your water intake today!"}
```

That's it! The rest of the system (caching, exact-minute check, sending) works automatically.

## Testing
1. Create an account and enable notifications for habits at a specific time.
2. Leave a habit incomplete for today.
3. Wait for that minute – you should receive exactly one notification.
4. Check logs: `docker logs celery-worker --tail=50`
5. Verify no duplicates: the next minute should show "Already sent today, skipping".
