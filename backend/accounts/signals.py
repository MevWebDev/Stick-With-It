from django.db.models.signals import post_save, post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserStats, Challenge
from django.core.management import call_command
import sys


@receiver(post_save, sender=User)
def create_user_stats(sender, instance, created, **kwargs):
    if created:
        UserStats.objects.create(user=instance)


@receiver(post_migrate)
def seed_challenges_after_migrate(sender, **kwargs):
    """Seed initial challenges once after migrations run.

    This runs `seed_challenges` management command only when the
    `Challenge` table is empty. It is skipped during test runs
    (when `test` is present in `sys.argv`).
    """
    # Don't auto-seed during tests
    if any(arg.startswith('test') for arg in sys.argv):
        return

    try:
        # If there are no challenges, call the seeder command
        if not Challenge.objects.exists():
            call_command('seed_challenges')
    except Exception:
        # Be conservative: if anything goes wrong (e.g. migrations not applied yet), skip
        pass