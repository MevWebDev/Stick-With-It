from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Habit, HabitCompletion
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class HabitTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        
        self.habit = Habit.objects.create(user=self.user, name="Drink Water", icon_slug="water")
        
    def test_create_habit(self):
        url = reverse('habits_list_create')
        data = {'name': 'Read Book', 'icon_slug': 'book'}
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Habit.objects.count(), 2)
        self.assertEqual(Habit.objects.last().user, self.user)

    def test_check_habit(self):
        url = reverse('habit_check_toggle', args=[self.habit.id])
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['completed_today'])
        self.assertEqual(response.data['streak'], 1)
        
        self.assertTrue(HabitCompletion.objects.filter(habit=self.habit).exists())
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 1)
        
    def test_uncheck_habit(self):
        url = reverse('habit_check_toggle', args=[self.habit.id])
        self.client.post(url)
        
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['completed_today'])
        self.assertEqual(response.data['streak'], 0)
        
        self.assertFalse(HabitCompletion.objects.filter(habit=self.habit).exists())
