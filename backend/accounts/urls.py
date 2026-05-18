from django.urls import path
from . import views
from .views import PushSubscriptionView, NotificationPreferenceView
urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("check-email/", views.check_email_view, name="check_email"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.user_info, name="user_info"),
    path("refresh/", views.refresh_token_view, name="refresh_token"),
    
    # Zmiana danych użytkownika (wymaga hasła)
    path("change-password/", views.change_password, name="change_password"),
    path("change-email/", views.change_email, name="change_email"),
    path("change-username/", views.change_username, name="change_username"),
    
    # Reset hasła przez email
    path("password-reset/request/", views.request_password_reset, name="request_password_reset"),
    path("password-reset/confirm/", views.confirm_password_reset, name="confirm_password_reset"),
    
    # Daily challenges i statystyki
    path("daily-challenge/", views.get_daily_challenge, name="daily_challenge"),
    path('complete-challenge/', views.complete_challenge, name='complete_challenge'),
    path('stats/', views.get_user_stats, name='user_stats'),
    path('pomodoro/complete/', views.complete_pomodoro, name='complete_pomodoro'),
    path('blacklist/', views.manage_blacklist, name='manage_blacklist'),
    path('badges/', views.get_all_badges, name='all_badges'),
    path('push/subscribe/', PushSubscriptionView.as_view(), name='push_subscribe'),
    
    # Notification preferences
    path('notification-preferences/', NotificationPreferenceView.as_view(), name='notification_preferences'),
    path('notification-preferences/test/', views.send_test_notification, name='send_test_notification'),
    
    # Debug & Test endpoints (for development)
    path('test/simulate-habits/', views.test_simulate_habit_notifications, name='test_simulate_habits'),
    path('test/simulate-challenges/', views.test_simulate_challenge_notifications, name='test_simulate_challenges'),
    path('test/debug-preferences/', views.debug_notification_preferences, name='debug_preferences'),
    path('test/debug-subscriptions/', views.debug_all_subscriptions_public, name='debug_subscriptions'),
    path('test/send-test/', views.debug_send_test_to_user, name='send_test'),
]