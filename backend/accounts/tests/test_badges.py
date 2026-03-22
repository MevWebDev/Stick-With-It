from django.test import TestCase
from django.contrib.auth.models import User
from accounts.models import Badges, UserStats
from accounts.services import check_and_award_badges, evaluate_badge_condition

class BadgesLogicTestCase(TestCase):
    """Tests for Badge evaluation logic and awarding"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='badgeuser', password='password')
        self.stats = self.user.stats
        
        # Create test badges
        self.badge_simple = Badges.objects.create(
            key='test_badge_1',
            title='Test Badge',
            description='Test Description',
            condition='challenges_completed_total >= 10',
            icon='T1',
            rarity='BRONZE'
        )
        
        self.badge_complex = Badges.objects.create(
            key='test_badge_2',
            title='Complex Badge',
            description='Test Complex',
            condition='challenges_completed_total >= 10 and habits_created >= 5',
            icon='T2',
            rarity='SILVER'
        )
        
    def test_evaluate_condition_true(self):
        """Test simple condition evaluation returns True when met"""
        self.stats.challenges_completed_total = 15
        self.stats.save()
        
        result = evaluate_badge_condition('challenges_completed_total >= 10', self.stats)
        self.assertTrue(result)
        
    def test_evaluate_condition_false(self):
        """Test simple condition evaluation returns False when not met"""
        self.stats.challenges_completed_total = 5
        self.stats.save()
        
        result = evaluate_badge_condition('challenges_completed_total >= 10', self.stats)
        self.assertFalse(result)
        
    def test_evaluate_condition_complex(self):
        """Test complex condition with multiple variables"""
        self.stats.challenges_completed_total = 15
        self.stats.habits_created = 6
        self.stats.save()
        
        result = evaluate_badge_condition('challenges_completed_total >= 10 and habits_created >= 5', self.stats)
        self.assertTrue(result)

    def test_evaluate_condition_complex_fail(self):
        """Test complex condition fails if one part is false"""
        self.stats.challenges_completed_total = 15
        self.stats.habits_created = 3
        self.stats.save()
        
        result = evaluate_badge_condition('challenges_completed_total >= 10 and habits_created >= 5', self.stats)
        self.assertFalse(result)

    def test_evaluate_condition_invalid_syntax(self):
        """Test that invalid python syntax in condition returns False safely"""
        result = evaluate_badge_condition('challenges_completed_total >>-- 10', self.stats)
        self.assertFalse(result)
        
    def test_evaluate_condition_unknown_variable(self):
        """Test that unknown variables result in False (via exception handling in service)"""
        # Note: eval() would raise NameError, service should catch it
        result = evaluate_badge_condition('unknown_var >= 10', self.stats)
        self.assertFalse(result)

    def test_check_and_award_badges(self):
        """Test that service correctly awards badges"""
        self.stats.challenges_completed_total = 20
        self.stats.save()
        
        new_badges = check_and_award_badges(self.user)
        
        self.assertEqual(len(new_badges), 1)
        self.assertEqual(new_badges[0], self.badge_simple)
        self.assertIn(self.badge_simple, self.stats.earned_badges.all())
        
        # Verify complex badge was NOT awarded
        self.assertNotIn(self.badge_complex, self.stats.earned_badges.all())

    def test_check_and_award_badges_idempotency(self):
        """Test that badges are not awarded twice"""
        self.stats.challenges_completed_total = 20
        self.stats.earned_badges.add(self.badge_simple)
        self.stats.save()

        
        new_badges = check_and_award_badges(self.user)
        self.assertEqual(len(new_badges), 0)
