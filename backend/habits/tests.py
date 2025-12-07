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

    def test_streak_multiple_consecutive_days(self):
        """Test that streak increments correctly across consecutive days"""
        url = reverse('habit_check_toggle', args=[self.habit.id])
        
        # Day 1 - Complete habit
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['streak'], 1)
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 1)
        
        # Simulate Day 2 - Move yesterday's completion back by 1 day
        completion = HabitCompletion.objects.get(habit=self.habit)
        completion.completion_date = (timezone.now() - timedelta(days=1)).date()
        completion.save()
        
        # Complete habit on Day 2
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['streak'], 2)
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 2)
        
        # Simulate Day 3 - Move completions back
        completions = list(HabitCompletion.objects.filter(habit=self.habit).order_by('-completion_date'))
        # At this point we have 2 completions:
        # completions[0] is today (from Day 2 POST above)
        # completions[1] is yesterday (from Day 1, moved back)
        # We need them to be yesterday and 2 days ago, so Day 3 POST creates today's
        today = timezone.now().date()
        
        if len(completions) >= 2:
            # Move in reverse order to avoid unique constraint violations
            completions[1].completion_date = today - timedelta(days=2)
            completions[1].save()
            completions[0].completion_date = today - timedelta(days=1)
            completions[0].save()
        
        # Complete habit on Day 3
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['streak'], 3)
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 3)

    def test_streak_breaks_on_missed_day(self):
        """Test that streak resets to 1 when a day is missed"""
        url = reverse('habit_check_toggle', args=[self.habit.id])
        
        # Create completion 2 days ago
        HabitCompletion.objects.create(
            habit=self.habit,
            completion_date=(timezone.now() - timedelta(days=2)).date()
        )
        self.habit.current_streak = 1
        self.habit.save()
        
        # Check today (missed yesterday - breaks streak)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['streak'], 1)  # Should reset to 1
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 1)

    def test_streak_persists_with_same_day_completion(self):
        """Test that checking the same habit multiple times on the same day doesn't break streak"""
        url = reverse('habit_check_toggle', args=[self.habit.id])
        
        # Day 1 - Complete habit
        self.client.post(url)
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 1)
        
        # Uncheck and recheck same day
        self.client.delete(url)
        response = self.client.post(url)
        self.assertEqual(response.data['streak'], 1)
        
        # Move to Day 2
        completion = HabitCompletion.objects.get(habit=self.habit)
        completion.completion_date = (timezone.now() - timedelta(days=1)).date()
        completion.save()
        
        # Complete on Day 2
        response = self.client.post(url)
        self.assertEqual(response.data['streak'], 2)

    def test_streak_with_three_day_gap(self):
        """Test that streak resets after a 3-day gap"""
        url = reverse('habit_check_toggle', args=[self.habit.id])
        
        # Create completion 4 days ago with streak of 5
        HabitCompletion.objects.create(
            habit=self.habit,
            completion_date=(timezone.now() - timedelta(days=4)).date()
        )
        self.habit.current_streak = 5
        self.habit.save()
        
        # Check today (3-day gap)
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['streak'], 1)  # Should reset to 1
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 1)

    def test_streak_calculation_after_uncheck_and_recheck(self):
        """Test that unchecking and rechecking doesn't artificially inflate streak"""
        url = reverse('habit_check_toggle', args=[self.habit.id])
        
        # Day 1 - Check
        self.client.post(url)
        
        # Move to Day 2
        completion = HabitCompletion.objects.get(habit=self.habit)
        completion.completion_date = (timezone.now() - timedelta(days=1)).date()
        completion.save()
        
        # Day 2 - Check, uncheck, check again
        self.client.post(url)  # streak should be 2
        self.client.delete(url)  # removes today's completion
        response = self.client.post(url)  # streak should still be 2
        
        self.assertEqual(response.data['streak'], 2)
        self.habit.refresh_from_db()
        self.assertEqual(self.habit.current_streak, 2)
