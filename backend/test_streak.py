import os
import django
from django.utils import timezone
from datetime import timedelta
import sys
import json

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Challenge, DailyChallenge, UserStats
from rest_framework.test import APIRequestFactory, force_authenticate
from accounts.views import complete_challenge

def test_streak_update():
    print("\n--- Starting Streak Logic Test ---")
    
    # 1. Setup User and Challenge
    username = 'streak_tester_v2'
    # Clean up previous run
    User.objects.filter(username=username).delete()
    
    print(f"Creating test user: {username}")
    user = User.objects.create_user(username=username, password='password')
    
    # Ensure UserStats exists
    if not hasattr(user, 'stats'):
        print("Creating UserStats manually...")
        UserStats.objects.create(user=user)
    
    # Create a dummy challenge
    challenge, _ = Challenge.objects.get_or_create(
        title='Test Challenge',
        defaults={
            'category': 'Test',
            'description': 'Test',
            'difficulty': 1
        }
    )
    
    # 2. Simulate Day 1 Completion (Yesterday)
    print("Simulating Day 1 completion (Yesterday)...")
    yesterday = timezone.now() - timedelta(days=1)
    
    # Manually set stats as if completed yesterday
    stats = user.stats
    stats.points = 10
    stats.current_streak = 1
    stats.last_completed_date = yesterday # This is a datetime
    stats.save()
    
    print(f"User stats before Day 2: Streak={stats.current_streak}, Last Date={stats.last_completed_date}")

    # 3. Simulate Day 2 Completion (Today)
    print("Simulating Day 2 completion (Today)...")
    
    # Create a DailyChallenge for today
    DailyChallenge.objects.create(
        user=user,
        challenge=challenge,
        completed=False
    )
    
    # Prepare Request
    factory = APIRequestFactory()
    request = factory.post('/api/complete-challenge/')
    request.user = user
    force_authenticate(request, user=user)
    
    # Call the view
    response = complete_challenge(request)
    
    # 4. Verify Results
    stats.refresh_from_db()
    
    if response.status_code == 200:
        data = json.loads(response.content)
        print(f"Response success: {data.get('success')}")
        print(f"Response streak: {data.get('current_streak')}")
    else:
        print(f"Response error: {response.status_code} - {response.content}")
    
    print(f"User stats after Day 2: Streak={stats.current_streak}, Last Date={stats.last_completed_date}")
    
    if stats.current_streak == 2:
        print("\n✅ SUCCESS: Streak incremented to 2!")
    else:
        print("\n❌ FAILURE: Streak did not increment correctly.")

    # Cleanup
    print("Cleaning up test user...")
    user.delete()

if __name__ == '__main__':
    test_streak_update()
