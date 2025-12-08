import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.views import recalculate_streak

def run_recalculation():
    print("--- Starting Global Streak Recalculation ---")
    users = User.objects.all()
    total_users = users.count()
    print(f"Found {total_users} users.")
    
    updated_count = 0
    for user in users:
        try:
            if hasattr(user, 'stats'):
                old_streak = user.stats.current_streak
                recalculate_streak(user)
                user.stats.refresh_from_db()
                new_streak = user.stats.current_streak
                
                if old_streak != new_streak:
                    print(f"User {user.username}: Streak updated {old_streak} -> {new_streak}")
                else:
                    print(f"User {user.username}: Streak unchanged ({new_streak})")
                
                updated_count += 1
            else:
                print(f"Skipping user {user.username} (no stats)")
        except Exception as e:
            print(f"Error processing user {user.username}: {e}")
            
    print(f"\nDone! Processed {updated_count} users.")

if __name__ == '__main__':
    run_recalculation()
