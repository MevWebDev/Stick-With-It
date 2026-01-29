from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
import json
from accounts.models import Challenge, DailyChallenge

class ChallengeModelTestCase(TestCase):
    """Tests for Challenge model"""
    
    def setUp(self):
        self.challenge = Challenge.objects.create(
            title="Test Challenge",
            category="Health",
            description="Do something healthy",
            difficulty=1
        )

    def test_challenge_creation(self):
        self.assertEqual(self.challenge.title, "Test Challenge")
        self.assertEqual(self.challenge.difficulty, 1)
        self.assertEqual(str(self.challenge), "Test Challenge (Level 1)")


class DailyChallengeViewTestCase(TestCase):
    """Tests for Daily Challenge endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='dailyuser', password='password')
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.challenge = Challenge.objects.create(
            title="Daily Task",
            category="Productivity",
            description="Work hard",
            difficulty=2
        )
        self.url = reverse('daily_challenge') 

    def test_get_daily_challenge_creates_new(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['challenge']['title'], "Daily Task")
        
        # Verify it exists in DB
        self.assertTrue(DailyChallenge.objects.filter(user=self.user).exists())

    def test_get_daily_challenge_returns_existing(self):
        # Create one first
        DailyChallenge.objects.create(user=self.user, challenge=self.challenge)
        
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['challenge']['id'], self.challenge.id)


class CompleteChallengeViewTestCase(TestCase):
    """Tests for completing challenges"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='compuser', password='password')
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.challenge = Challenge.objects.create(
            title="Complete Me",
            category="Fun",
            description="Just do it",
            difficulty=1
        )
        self.daily = DailyChallenge.objects.create(user=self.user, challenge=self.challenge)
        self.url = reverse('complete_challenge')

    def test_complete_challenge_success(self):
        response = self.client.post(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['points_earned'], 1) # Difficulty 1
        
        # Check stats updated
        self.user.stats.refresh_from_db()
        self.assertEqual(self.user.stats.points, 1)
        self.assertEqual(self.user.stats.total_completed, 1)
        
        # Check DailyChallenge marked completed
        self.daily.refresh_from_db()
        self.assertTrue(self.daily.completed)

    def test_complete_challenge_already_completed(self):
        # Complete it once
        self.client.post(self.url, HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Try again
        response = self.client.post(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
