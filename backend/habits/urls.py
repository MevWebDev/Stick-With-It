from django.urls import path
from . import views

urlpatterns = [
    path('habits', views.habits_list_create, name='habits_list_create'),
    path('habits/<int:id>/check', views.habit_check_toggle, name='habit_check_toggle'),
]
