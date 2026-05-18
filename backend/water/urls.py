from django.urls import path
from . import views

urlpatterns = [
    path('water/today/', views.today, name='water_today'),
    path('water/log/', views.log_water, name='water_log'),
    path('water/goal/', views.update_goal, name='water_goal'),
    path('water/history/', views.history, name='water_history'),
]
