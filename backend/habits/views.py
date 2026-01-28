from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction, IntegrityError
from django.utils import timezone
from datetime import datetime, timedelta
import pytz

from .models import Habit, HabitCompletion
from .serializers import HabitSerializer
from accounts.services import XpService, check_and_award_badges

def get_user_date(request):
    """
    Pomocnicza funkcja do pobierania aktualnej daty w strefie czasowej użytkownika.
    Domyślnie UTC, jeśli nie podano strefy czasowej w parametrach zapytania.
    """
    tz_name = request.query_params.get('timezone', 'UTC')
    try:
        user_tz = pytz.timezone(tz_name)
    except pytz.UnknownTimeZoneError:
        user_tz = pytz.UTC
    
    return timezone.now().astimezone(user_tz).date()

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def habits_list_create(request):
    """
    GET: List all user's habits with completed_today flag
    POST: Create a new habit for the user
    """
    if request.method == 'GET':
        user = request.user
        today = get_user_date(request)
        yesterday = today - timedelta(days=1)
        
        # Get user's habits
        habits = Habit.objects.filter(user=user)
        
        # Prepare response data
        data = []
        
        for habit in habits:
            # Lazy reset - if last completion was before yesterday, reset streak
            if habit.last_completion_date and habit.last_completion_date < yesterday:
                if habit.current_streak > 0:
                    habit.current_streak = 0
                    habit.save(update_fields=['current_streak'])
            
            # Check if completed today
            completed_today = HabitCompletion.objects.filter(
                habit=habit, 
                completion_date=today
            ).exists()
            
            serializer = HabitSerializer(habit)
            habit_data = serializer.data
            habit_data['completed_today'] = completed_today
            data.append(habit_data)
            
        return Response(data)
    
    elif request.method == 'POST':
        # Create new habit
        name = request.data.get('name')
        icon_slug = request.data.get('icon_slug')
        is_custom = request.data.get('is_custom', False)
        
        if not name or not icon_slug:
            return Response({'error': 'name and icon_slug are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                habit = Habit.objects.create(
                    user=request.user,
                    name=name,
                    icon_slug=icon_slug,
                    is_custom=is_custom
                )
                
                # Update stats
                user_stats = request.user.stats
                user_stats.habits_created += 1
                user_stats.save()
                
                # Check badges (e.g. Habit Builder)
                new_badges = check_and_award_badges(request.user)
                
                serializer = HabitSerializer(habit)
                data = serializer.data
                
                # Add badge info if any
                if new_badges:
                    data['new_badges'] = [
                        {
                            'key': badge.key,
                            'title': badge.title,
                            'icon': badge.icon,
                            'rarity': badge.rarity
                        }
                        for badge in new_badges
                    ]
                
                return Response(data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def habit_check_toggle(request, id):
    """
    Widok dispatchera do obsługi zarówno zaznaczania (POST), jak i odznaczania (DELETE)
    na tym samym punkcie końcowym URL.
    """
    if request.method == 'POST':
        return check_habit(request, id)
    elif request.method == 'DELETE':
        return uncheck_habit(request, id)

def check_habit(request, id):
    habit = get_object_or_404(Habit, id=id, user=request.user)
    today = get_user_date(request)
    yesterday = today - timedelta(days=1)
    
    try:
        with transaction.atomic():
            # 1. Utwórz ukończenie (Idempotentne dzięki unikalnemu ograniczeniu)
            completion, created = HabitCompletion.objects.get_or_create(
                habit=habit,
                completion_date=today
            )
            
            if not created:
                # Już ukończono dzisiaj
                return Response({
                    'success': True,
                    'streak': habit.current_streak,
                    'completed_today': True,
                    'message': 'Already completed today'
                })
            
            # 2. Zaktualizuj streak
            # Pobierz wszystkie daty ukończeń w kolejności malejącej
            completion_dates = list(HabitCompletion.objects.filter(
                habit=habit
            ).values_list('completion_date', flat=True).order_by('-completion_date'))
            
            # Oblicz streak od dzisiaj wstecz
            streak = 1  # Dzisiaj
            current_date = today
            
            for i in range(1, len(completion_dates)):
                expected_date = current_date - timedelta(days=1)
                if completion_dates[i] == expected_date:
                    streak += 1
                    current_date = expected_date
                else:
                    # Przerwa w serii
                    break
            
            habit.current_streak = streak
            habit.last_completion_date = today
            habit.last_completion_at = timezone.now()
            habit.save()
            
            # Award XP
            xp_result = XpService.award_xp(request.user, 10, 'habit')
            
            # Check badges (e.g. Week Warrior)
            # Longest streak is updated in model save or handled via sync?
            # UserStats.longest_streak is updated in check_and_award_badges? No, logic is in service eval.
            # But we need to update user stats longest_streak somewhere if it's not done automatically.
            # Wait, `check_and_award_badges` only reads.
            # We need to update user.stats.longest_streak explicitly if habit streak > user max streak.
            # Let's do it here.
            
            user_stats = request.user.stats
            if habit.current_streak > user_stats.longest_streak:
                user_stats.longest_streak = habit.current_streak
                user_stats.save(update_fields=['longest_streak'])
                
            new_badges = check_and_award_badges(request.user)
            
            return Response({
                'success': True,
                'streak': habit.current_streak,
                'completed_today': True,
                'xp_earned': xp_result['earned'],
                'level_info': xp_result,
                'new_badges': [
                    {
                        'key': badge.key,
                        'title': badge.title,
                        'icon': badge.icon,
                        'rarity': badge.rarity
                    }
                    for badge in new_badges
                ]
            })
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def uncheck_habit(request, id):
    habit = get_object_or_404(Habit, id=id, user=request.user)
    today = get_user_date(request)
    
    try:
        with transaction.atomic():
            # 1. Usuń ukończenie
            deleted_count, _ = HabitCompletion.objects.filter(
                habit=habit,
                completion_date=today
            ).delete()
            
            if deleted_count == 0:
                return Response({
                    'success': True,
                    'streak': habit.current_streak,
                    'completed_today': False,
                    'message': 'Not completed today'
                })
            
            # 2. Przelicz streak
            # Znajdź nową datę ostatniego ukończenia
            last_completion = HabitCompletion.objects.filter(
                habit=habit
            ).order_by('-completion_date').first()
            
            if not last_completion:
                # Brak pozostałych ukończeń
                habit.last_completion_date = None
                habit.last_completion_at = None
                habit.current_streak = 0
            else:
                habit.last_completion_date = last_completion.completion_date
                habit.last_completion_at = last_completion.completion_at
                
                # Przelicz streak od nowej ostatniej daty wstecz
                # Jest to kosztowne, ale dokładne.
                # Optymalizacja: jeśli właśnie usunęliśmy dzisiaj, a wczoraj było ukończone,
                # moglibyśmy po prostu zmniejszyć. Ale jeśli wczoraj NIE było ukończone, streak wynosił 1 (dzisiaj), teraz 0.
                # Zróbmy solidne sprawdzenie.
                
                current_check_date = last_completion.completion_date
                streak = 0
                
                # Pobierz wszystkie ukończenia, aby uniknąć zapytań N+1 w pętli,
                # ale ogranicz do current_streak + bufor, jeśli ufaliśmy starej wartości.
                # Dla poprawności pobierzmy wszystkie daty malejąco.
                dates = list(HabitCompletion.objects.filter(
                    habit=habit
                ).values_list('completion_date', flat=True).order_by('-completion_date'))
                
                # dates[0] is last_completion.completion_date
                streak = 1
                for i in range(len(dates) - 1):
                    expected_prev = dates[i] - timedelta(days=1)
                    if dates[i+1] == expected_prev:
                        streak += 1
                    else:
                        break
                
                habit.current_streak = streak

            habit.save()
            
            return Response({
                'success': True,
                'streak': habit.current_streak,
                'completed_today': False
            })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
