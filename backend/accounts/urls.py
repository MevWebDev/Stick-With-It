from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.user_info, name="user_info"),
    path("refresh/", views.refresh_token_view, name="refresh_token"),
    path("daily-challenge/", views.get_daily_challenge, name="daily_challenge"),
    path('complete-challenge/', views.complete_challenge, name='complete_challenge'),
    path('stats/', views.get_user_stats, name='user_stats'),
    path('blacklist/', views.manage_blacklist, name='manage_blacklist'),
    path('badges/', views.get_all_badges, name='all_badges'),
]