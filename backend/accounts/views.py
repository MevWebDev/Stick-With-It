from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from django.utils import timezone
from datetime import timedelta
from django.db import IntegrityError
from .models import Challenge, UserStats, DailyChallenge, CompletedChallenge, Badges
from .services import XpService
import random
# REJESTRACJA
@csrf_exempt
@require_http_methods(["POST"])
def register_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        # Walidacja
        if not username or not email or not password:
            return JsonResponse({
                'success': False,
                'error': 'Wszystkie pola są wymagane'
            }, status=400)
        
        # Sprawdź czy username nie jest emailem
        try:
            validate_email(username)
            return JsonResponse({
                'success': False,
                'error': 'Nazwa użytkownika nie może być adresem email'
            }, status=400)
        except ValidationError:
            pass

        # Sprawdź czy user już istnieje
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'error': 'Użytkownik o tej nazwie już istnieje'
            }, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'error': 'Email jest już zajęty'
            }, status=400)
        
        # Utwórz użytkownika
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password  # Django automatycznie hashuje hasło
        )
        
        # Wygeneruj tokeny JWT
        refresh = RefreshToken.for_user(user)
        
        return JsonResponse({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


# SPRAWDZANIE DOSTĘPNOŚCI EMAILA
@csrf_exempt
@require_http_methods(["POST"])
def check_email_view(request):
    """Sprawdza czy email jest już zajęty"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({
                'success': False,
                'error': 'Email jest wymagany'
            }, status=400)
            
        is_taken = User.objects.filter(email=email).exists()
        
        return JsonResponse({
            'success': True,
            'is_taken': is_taken,
            'message': 'Email jest zajęty' if is_taken else 'Email jest dostępny'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


# LOGOWANIE
@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """Logowanie użytkownika - zwraca JWT tokeny"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        # Obsługa logowania przez email
        if username and '@' in username:
            user_obj = User.objects.filter(email=username).first()
            if user_obj:
                username = user_obj.username

        # Sprawdź czy dane są poprawne
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            # Wygeneruj tokeny JWT
            refresh = RefreshToken.for_user(user)
            
            return JsonResponse({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                },
                'tokens': {
                    'access': str(refresh.access_token),  # Token dostępu (krótki)
                    'refresh': str(refresh)                # Token odświeżania (długi)
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Nieprawidłowe dane logowania'
            }, status=401)
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)


# WYLOGOWANIE (opcjonalne z JWT, ale możemy blacklistować token)
@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request):
    """Wylogowanie - dodaje refresh token do blacklisty"""
    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh')
        
        # Sprawdź czy token został podany i nie jest pusty
        if refresh_token is not None and refresh_token != '':
            token = RefreshToken(refresh_token)
            token.blacklist()  # Dodaj token do czarnej listy
        elif refresh_token == '':
            # Pusty string to błąd
            raise ValueError('Empty token')
        
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Nieprawidłowy token'
        }, status=400)


# INFO O UŻYTKOWNIKU
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Wymaga ważnego JWT tokena
def user_info(request):
    """Zwraca info o zalogowanym użytkowniku"""
    user = request.user
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email
    })


# ODŚWIEŻANIE TOKENA
@csrf_exempt
@require_http_methods(["POST"])
def refresh_token_view(request):
    """Odświeża access token używając refresh tokena"""
    try:
        data = json.loads(request.body)
        refresh_token = data.get('refresh')
        
        if not refresh_token:
            return JsonResponse({
                'success': False,
                'error': 'Refresh token jest wymagany'
            }, status=400)
        
        # Utwórz obiekt RefreshToken i wygeneruj nowy access token
        token = RefreshToken(refresh_token)
        
        return JsonResponse({
            'success': True,
            'access': str(token.access_token)
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': 'Nieprawidłowy lub wygasły refresh token'
        }, status=401)
# ============================================
# DAILY CHALLENGE - Losowanie wyzwania na dzień
# ============================================

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_challenge(request):
    """Zwraca dzisiejsze wyzwanie lub losuje nowe"""
    try:
        user = request.user
        today = timezone.now().date()
        
        # Sprawdź czy user ma już challenge na dziś
        existing = DailyChallenge.objects.filter(
            user=user, 
            assigned_date=today
        ).select_related('challenge').first()
        
        if existing:
            # Zwróć istniejące
            return JsonResponse({
                'success': True,
                'challenge': {
                    'id': existing.challenge.id,
                    'title': existing.challenge.title,
                    'description': existing.challenge.description,
                    'category': existing.challenge.category,
                    'difficulty': existing.challenge.difficulty,
                    'completed': existing.completed
                },
                'assigned_date': existing.assigned_date.isoformat()
            })
        
        # Losuj nowe wyzwanie
        stats = user.stats
        blacklist = stats.blacklisted_categories
        
        # Pobierz dostępne challenges (wykluczając blacklistowane)
        available = Challenge.objects.exclude(category__in=blacklist)
        
        if not available.exists():
            return JsonResponse({
                'success': False,
                'error': 'Brak dostępnych wyzwań (wszystkie kategorie na blackliście)'
            }, status=400)
        
        # Losuj challenge (na poziomie bazy danych)
        random_challenge = available.order_by('?').first()
        
        try:
            # Utwórz DailyChallenge
            daily = DailyChallenge.objects.create(
                user=user,
                challenge=random_challenge
            )
            
            return JsonResponse({
                'success': True,
                'challenge': {
                    'id': random_challenge.id,
                    'title': random_challenge.title,
                    'description': random_challenge.description,
                    'category': random_challenge.category,
                    'difficulty': random_challenge.difficulty,
                    'completed': False
                },
                'assigned_date': daily.assigned_date.isoformat()
            }, status=201)

        except IntegrityError:
            # Race condition: challenge was created by another request in the meantime
            existing = DailyChallenge.objects.filter(
                user=user, 
                assigned_date=today
            ).select_related('challenge').first()
            
            if existing:
                return JsonResponse({
                    'success': True,
                    'challenge': {
                        'id': existing.challenge.id,
                        'title': existing.challenge.title,
                        'description': existing.challenge.description,
                        'category': existing.challenge.category,
                        'difficulty': existing.challenge.difficulty,
                        'completed': existing.completed
                    },
                    'assigned_date': existing.assigned_date.isoformat()
                })
            else:
                # Should not happen if IntegrityError was due to unique constraint
                raise
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# COMPLETE CHALLENGE - Ukończenie wyzwania
# ============================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_challenge(request):
    """Oznacz dzisiejsze wyzwanie jako ukończone"""
    try:
        user = request.user
        today = timezone.now().date()
        
        # Znajdź dzisiejsze wyzwanie
        daily = DailyChallenge.objects.filter(
            user=user,
            assigned_date=today,
            completed=False
        ).select_related('challenge').first()
        
        if not daily:
            return JsonResponse({
                'success': False,
                'error': 'Brak wyzwania do ukończenia lub już ukończone'
            }, status=400)
        
        challenge = daily.challenge
        
        # Oznacz jako ukończone
        daily.completed = True
        daily.save()
        
        # Dodaj do historii
        CompletedChallenge.objects.create(
            user=user,
            challenge=challenge,
            points_earned=challenge.difficulty,
            challenge_category=challenge.category,
            challenge_difficulty=challenge.difficulty
        )
        
        # Aktualizuj statystyki
        stats = user.stats
        stats.points += challenge.difficulty
        stats.total_completed += 1
        
        # Aktualizuj liczniki per difficulty
        if challenge.difficulty == 1:
            stats.level1_completed += 1
        elif challenge.difficulty == 2:
            stats.level2_completed += 1
        elif challenge.difficulty == 3:
            stats.level3_completed += 1
        
        # Oblicz streak
        if stats.last_completed_date:
            yesterday = today - timedelta(days=1)
            if stats.last_completed_date == yesterday:
                # Kontynuacja streaku
                stats.current_streak += 1
            elif stats.last_completed_date == today:
                # Już ukończył coś dzisiaj - nie zmieniaj streaku
                pass
            else:
                # Przerwa - reset streaku
                stats.current_streak = 1
        else:
            # Pierwsze ukończenie
            stats.current_streak = 1
        
        # Aktualizuj longest_streak
        if stats.current_streak > stats.longest_streak:
            stats.longest_streak = stats.current_streak
        
        stats.last_completed_date = today
        stats.save()
        
        # Calculate and Award XP
        # Base XP: Easy=20, Medium=40, Hard=80
        base_xp_map = {1: 20, 2: 40, 3: 80}
        base_xp = base_xp_map.get(challenge.difficulty, 20)
        
        # Multiplier: 1 + (streak * 0.01) -> e.g. streak 5 = 1.05x
        multiplier = 1 + (stats.current_streak * 0.01)
        xp_amount = int(base_xp * multiplier)
        
        xp_result = XpService.award_xp(user, xp_amount, 'challenge')
        
        # Sprawdź nowe badges (funkcję napiszemy za chwilę)
        new_badges = check_and_award_badges(user)
        
        return JsonResponse({
            'success': True,
            'points_earned': challenge.difficulty, # Legacy
            'xp_earned': xp_amount,
            'total_points': stats.points,
            'current_streak': stats.current_streak,
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
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# USER STATS - Statystyki użytkownika
# ============================================

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stats(request):
    """Zwraca statystyki użytkownika"""
    try:
        user = request.user
        stats = user.stats
        
        # Policzy badges
        earned_badges = stats.earned_badges.all()
        
        xp_needed = XpService.get_xp_required_for_next_level(stats.level)
        
        return JsonResponse({
            'success': True,
            'stats': {
                'points': stats.points,
                'level': stats.level,
                'current_exp': stats.current_exp,
                'exp_to_next_level': xp_needed,
                'total_exp': stats.total_exp,
                'current_streak': stats.current_streak,
                'longest_streak': stats.longest_streak,
                'total_completed': stats.total_completed,
                'level1_completed': stats.level1_completed,
                'level2_completed': stats.level2_completed,
                'level3_completed': stats.level3_completed,
                'blacklisted_categories': stats.blacklisted_categories,
                'earned_badges_count': earned_badges.count(),
                'earned_badges': [
                    {
                        'key': badge.key,
                        'title': badge.title,
                        'description': badge.description,
                        'icon': badge.icon,
                        'rarity': badge.rarity
                    }
                    for badge in earned_badges
                ]
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# BLACKLIST - Zarządzanie blacklistą kategorii
# ============================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def manage_blacklist(request):
    """Dodaj lub usuń kategorię z blacklisty"""
    try:
        data = json.loads(request.body)
        category = data.get('category')
        action = data.get('action')  # 'add' lub 'remove'
        
        if not category or not action:
            return JsonResponse({
                'success': False,
                'error': 'Wymagane pola: category, action (add/remove)'
            }, status=400)
        
        stats = request.user.stats
        blacklist = stats.blacklisted_categories
        
        if action == 'add':
            if category not in blacklist:
                blacklist.append(category)
                stats.blacklisted_categories = blacklist
                stats.save()
        elif action == 'remove':
            if category in blacklist:
                blacklist.remove(category)
                stats.blacklisted_categories = blacklist
                stats.save()
        else:
            return JsonResponse({
                'success': False,
                'error': 'action musi być "add" lub "remove"'
            }, status=400)
        
        return JsonResponse({
            'success': True,
            'blacklisted_categories': stats.blacklisted_categories
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# BADGES - Lista wszystkich badges
# ============================================

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_badges(request):
    """Zwraca wszystkie badges (zdobyte i niezdobyte)"""
    try:
        user = request.user
        all_badges = Badges.objects.all()
        earned_ids = user.stats.earned_badges.values_list('id', flat=True)
        
        badges_data = [
            {
                'id': badge.id,
                'key': badge.key,
                'title': badge.title,
                'description': badge.description,
                'icon': badge.icon,
                'rarity': badge.rarity,
                'earned': badge.id in earned_ids
            }
            for badge in all_badges
        ]
        
        return JsonResponse({
            'success': True,
            'badges': badges_data,
            'total': len(badges_data),
            'earned': len(earned_ids)
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# POMODORO - Ukończenie sesji
# ============================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_pomodoro(request):
    """Zapisuje ukończoną sesję pomodoro i przyznaje XP"""
    try:
        user = request.user
        
        xp_result = XpService.award_xp(user, 10, 'pomodoro')
        
        return JsonResponse({
            'success': True,
            'xp_earned': xp_result['earned'],
            'level_info': xp_result
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# HELPER - Sprawdzanie i przyznawanie badges
# ============================================

def check_and_award_badges(user):
    """Sprawdza warunki i przyznaje nowe badges"""
    stats = user.stats
    new_badges = []
    
    # Pobierz badges które user już ma
    earned_keys = set(stats.earned_badges.values_list('key', flat=True))
    
    # Badge: First Steps - pierwsze wyzwanie
    if stats.total_completed >= 1 and 'first_steps' not in earned_keys:
        try:
            badge = Badges.objects.get(key='first_steps')
            stats.earned_badges.add(badge)
            new_badges.append(badge)
        except Badges.DoesNotExist:
            pass
    return new_badges