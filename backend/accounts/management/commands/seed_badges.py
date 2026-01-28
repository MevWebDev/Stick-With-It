from django.core.management.base import BaseCommand
from accounts.models import Badges

class Command(BaseCommand):
    def handle(self, *args, **options):
        badges_data = [
            # Pomodoro badges
            {
                'key': 'pomodoro_novice',
                'title': 'Pomodoro Novice',
                'description': 'Complete 1 Pomodoro session',
                'icon': '🍅',
                'rarity': 'BRONZE',
                'condition': 'pomodoro_sessions_completed >= 1'
            },
            {
                'key': 'pomodoro_master',
                'title': 'Pomodoro Master',
                'description': 'Complete 10 Pomodoro sessions',
                'icon': '🍅',
                'rarity': 'SILVER',
                'condition': 'pomodoro_sessions_completed >= 10'
            },
            {
                'key': 'pomodoro_legend',
                'title': 'Pomodoro Legend',
                'description': 'Complete 50 Pomodoro sessions',
                'icon': '🍅',
                'rarity': 'GOLD',
                'condition': 'pomodoro_sessions_completed >= 50'
            },
            # Challenge badges
            {
                'key': 'first_steps',
                'title': 'First Steps',
                'description': 'Complete your first challenge',
                'icon': '👣',
                'rarity': 'BRONZE',
                'condition': 'challenges_completed_total >= 1'
            },
            {
                'key': 'challenge_chaser',
                'title': 'Challenge Chaser',
                'description': 'Complete 25 challenges',
                'icon': '🎯',
                'rarity': 'SILVER',
                'condition': 'challenges_completed_total >= 25'
            },
            {
                'key': 'challenge_conqueror',
                'title': 'Challenge Conqueror',
                'description': 'Complete 100 challenges',
                'icon': '👑',
                'rarity': 'GOLD',
                'condition': 'challenges_completed_total >= 100'
            },
            # Difficulty-specific
            {
                'key': 'easy_champion',
                'title': 'Easy Champion',
                'description': 'Complete 10 easy challenges',
                'icon': '🌟',
                'rarity': 'BRONZE',
                'condition': 'challenges_completed_easy >= 10'
            },
            {
                'key': 'hardcore_player',
                'title': 'Hardcore Player',
                'description': 'Complete 10 hard challenges',
                'icon': '⚡',
                'rarity': 'ULTIMATE',
                'condition': 'challenges_completed_hard >= 10'
            },
            # Streak badges
            {
                'key': 'week_warrior',
                'title': 'Week Warrior',
                'description': 'Achieve a 7-day streak',
                'icon': '🔥',
                'rarity': 'SILVER',
                'condition': 'max_streak_days >= 7'
            },
            {
                'key': 'month_master',
                'title': 'Month Master',
                'description': 'Achieve a 30-day streak',
                'icon': '🌙',
                'rarity': 'GOLD',
                'condition': 'max_streak_days >= 30'
            },
            # Habit badges
            {
                'key': 'habit_builder',
                'title': 'Habit Builder',
                'description': 'Create your first habit',
                'icon': '🏗️',
                'rarity': 'BRONZE',
                'condition': 'habits_created >= 1'
            },
        ]
        
        for badge_data in badges_data:
            Badges.objects.get_or_create(
                key=badge_data['key'],
                defaults={
                    'title': badge_data['title'],
                    'description': badge_data['description'],
                    'icon': badge_data['icon'],
                    'rarity': badge_data['rarity'],
                }
            )