from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Habit, HabitCompletion, DailyNote
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


class DailyNoteTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='journal_user', password='password')
        self.other_user = User.objects.create_user(username='other_user', password='password')

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.unauthenticated_client = APIClient()

    def test_auth_required_for_journal_endpoints(self):
        detail_url = reverse('daily_note')
        range_url = reverse('daily_notes_range')

        response = self.unauthenticated_client.get(f'{detail_url}?date=2026-04-07')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.unauthenticated_client.put(
            detail_url,
            {'date': '2026-04-07', 'content': 'x'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.unauthenticated_client.get(f'{range_url}?start=2026-04-01&end=2026-04-07')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_single_note_creates_empty_note_if_missing(self):
        url = reverse('daily_note')
        response = self.client.get(f'{url}?date=2026-04-07')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['note']['date'], '2026-04-07')
        self.assertEqual(response.data['note']['content'], '')
        self.assertEqual(DailyNote.objects.filter(user=self.user, date='2026-04-07').count(), 1)

    def test_put_note_upserts_without_duplicates(self):
        url = reverse('daily_note')

        create_response = self.client.put(
            url,
            {'date': '2026-04-07', 'content': 'First version'},
            format='json',
        )
        self.assertEqual(create_response.status_code, status.HTTP_200_OK)

        update_response = self.client.put(
            url,
            {'date': '2026-04-07', 'content': 'Updated version'},
            format='json',
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        self.assertEqual(DailyNote.objects.filter(user=self.user, date='2026-04-07').count(), 1)
        note = DailyNote.objects.get(user=self.user, date='2026-04-07')
        self.assertEqual(note.content, 'Updated version')

    def test_put_allows_empty_content(self):
        url = reverse('daily_note')
        response = self.client.put(
            url,
            {'date': '2026-04-07', 'content': ''},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['note']['content'], '')

    def test_invalid_date_validation(self):
        url = reverse('daily_note')

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get(f'{url}?date=07-04-2026')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.put(url, {'date': 'invalid-date', 'content': 'x'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_range_returns_only_authenticated_user_notes(self):
        DailyNote.objects.create(user=self.user, date='2026-04-01', content='A')
        DailyNote.objects.create(user=self.user, date='2026-04-03', content='B')
        DailyNote.objects.create(user=self.other_user, date='2026-04-02', content='SHOULD_NOT_BE_VISIBLE')

        url = reverse('daily_notes_range')
        response = self.client.get(f'{url}?start=2026-04-01&end=2026-04-05')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['notes']), 2)
        self.assertEqual(response.data['notes'][0]['date'], '2026-04-01')
        self.assertEqual(response.data['notes'][1]['date'], '2026-04-03')

    def test_range_validates_input(self):
        url = reverse('daily_notes_range')

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get(f'{url}?start=2026-04-10&end=2026-04-01')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get(f'{url}?start=2026-01-01&end=2026-04-07')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_content_length_limit(self):
        url = reverse('daily_note')
        too_long_content = 'a' * 10001

        response = self.client.put(
            url,
            {'date': '2026-04-07', 'content': too_long_content},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
