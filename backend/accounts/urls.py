from django.urls import path
from . import views

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
    
    # Avatar management
    path("avatar/upload/", views.upload_avatar, name="upload_avatar"),
    path("avatar/delete/", views.delete_avatar, name="delete_avatar"),
    
    # Daily challenges i statystyki
    path("daily-challenge/", views.get_daily_challenge, name="daily_challenge"),
    path('complete-challenge/', views.complete_challenge, name='complete_challenge'),
    path('stats/', views.get_user_stats, name='user_stats'),
    path('pomodoro/complete/', views.complete_pomodoro, name='complete_pomodoro'),
    path('blacklist/', views.manage_blacklist, name='manage_blacklist'),
    path('badges/', views.get_all_badges, name='all_badges'),
]