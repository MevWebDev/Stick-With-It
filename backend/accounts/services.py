from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from .models import UserStats, XpLog

class XpService:
    BASE_XP_REQ = 150
    XP_REQ_INC = 25
    
    POMODORO_XP = 10
    POMODORO_DAILY_LIMIT = 50
    
    HABIT_XP = 10
    
    @staticmethod
    def get_xp_required_for_next_level(current_level):
        """
        Calculates XP needed to go from current_level to current_level + 1
        Formula: D_L = 150 + (L-1) * 25
        """
        return XpService.BASE_XP_REQ + (current_level - 1) * XpService.XP_REQ_INC

    @staticmethod
    def award_xp(user, amount, source):
        """
        Awards XP to user, handles leveling up, and enforces limits.
        Returns a dict with result info.
        """
        today = timezone.now().date()
        
        # 1. Check Limits
        if source == 'pomodoro':
            # Calculate total XP earned from pomodoro today
            today_xp = XpLog.objects.filter(
                user=user, 
                date=today, 
                source='pomodoro'
            ).aggregate(Sum('amount'))['amount__sum'] or 0
            
            if today_xp >= XpService.POMODORO_DAILY_LIMIT:
                return {
                    'success': False, 
                    'reason': 'daily_limit_reached',
                    'earned': 0
                }
            
            # Cap the amount if it would exceed limit
            remaining = XpService.POMODORO_DAILY_LIMIT - today_xp
            if amount > remaining:
                amount = remaining

        # 2. Award XP
        with transaction.atomic():
            # Lock the user stats row
            stats = UserStats.objects.select_for_update().get(user=user)
            
            stats.current_exp += amount
            stats.total_exp += amount
            
            # 3. Check Level Up
            leveled_up = False
            xp_needed = XpService.get_xp_required_for_next_level(stats.level)
            
            # Handle multiple level ups at once (rare but possible)
            while stats.current_exp >= xp_needed:
                stats.current_exp -= xp_needed
                stats.level += 1
                leveled_up = True
                xp_needed = XpService.get_xp_required_for_next_level(stats.level)
            
            stats.save()
            
            # 4. Log it
            XpLog.objects.create(
                user=user,
                source=source,
                amount=amount
            )
            
        return {
            'success': True,
            'earned': amount,
            'leveled_up': leveled_up,
            'new_level': stats.level,
            'current_exp': stats.current_exp,
            'xp_to_next': xp_needed
        }
