from django.test import TestCase
from django.contrib.auth.models import User
from accounts.models import UserStats

class UserStatsModelTestCase(TestCase):
    """Tests for UserStats model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='statuser', password='password')
        # UserStats should be created by signal
        self.stats = UserStats.objects.get(user=self.user)

    def test_user_stats_creation_signal(self):
        self.assertIsNotNone(self.stats)
        self.assertEqual(self.stats.points, 0)
        self.assertEqual(self.stats.current_streak, 0)

    def test_user_stats_str(self):
        self.assertEqual(str(self.stats), "statuser - Lvl 1 (0 pts, Streak: 0)")
