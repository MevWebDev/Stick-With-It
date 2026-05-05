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
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.response import Response
from .serializers import PushSubscriptionSerializer, NotificationPreferenceSerializer
from rest_framework.views import APIView
import json
from django.utils import timezone
from datetime import timedelta
from django.db import IntegrityError
from .models import Challenge, UserStats, DailyChallenge, CompletedChallenge, Badges, NotificationPreference, PushSubscription
from .services import XpService
from .serializers import (
    ChangePasswordSerializer,
    ChangeEmailSerializer,
    ChangeUsernameSerializer,
    RequestPasswordResetSerializer,
    ConfirmPasswordResetSerializer
)
import random
import secrets
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from accounts.services import check_and_award_badges
from habits.models import Habit, HabitCompletion

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

        stats.challenges_completed_total += 1
        if challenge.difficulty == 'EASY':
            stats.challenges_completed_easy += 1
        elif challenge.difficulty == 'MEDIUM':
            stats.challenges_completed_medium += 1
        elif challenge.difficulty == 'HARD':
            stats.challenges_completed_hard += 1
        stats.save()

        # Oblicz streak
        if stats.last_completed_date:
            # Konwertuj na date jeśli to datetime
            last_date = stats.last_completed_date
            if hasattr(last_date, 'date'):
                last_date = last_date.date()
            
            yesterday = today - timedelta(days=1)
            if last_date == yesterday:
                # Kontynuacja streaku
                stats.current_streak += 1
            elif last_date == today:
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
        
        # Sprawdź nowe badges
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
        
        # Lazy reset - wyzeruj Daily Challenge streak jeśli minął więcej niż 1 dzień
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        if stats.last_completed_date:
            # Konwertuj na date jeśli to datetime
            last_date = stats.last_completed_date
            if hasattr(last_date, 'date'):
                last_date = last_date.date()
            
            if last_date < yesterday:
                stats.current_streak = 0
                stats.save(update_fields=['current_streak'])
        
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
        
        # Update stats
        user.stats.pomodoro_sessions_completed += 1
        user.stats.save(update_fields=['pomodoro_sessions_completed'])
        
        xp_result = XpService.award_xp(user, 10, 'pomodoro')
        
        # Check badges
        new_badges = check_and_award_badges(user)
        
        return JsonResponse({
            'success': True,
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
        return JsonResponse({'success': False, 'error': str(e)}, status=500)


# ============================================
# ZMIANA HASŁA
# ============================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Zmienia hasło użytkownika - wymaga potwierdzenia obecnym hasłem"""
    serializer = ChangePasswordSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'success': True,
            'message': 'Hasło zostało zmienione pomyślnie'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ZMIANA EMAILA
# ============================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_email(request):
    """Zmienia email użytkownika - wymaga potwierdzenia hasłem"""
    serializer = ChangeEmailSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.email = serializer.validated_data['new_email']
        user.save()
        
        return Response({
            'success': True,
            'message': 'Email został zmieniony pomyślnie',
            'new_email': user.email
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# ZMIANA NAZWY UŻYTKOWNIKA
# ============================================

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_username(request):
    """Zmienia nazwę użytkownika - wymaga potwierdzenia hasłem"""
    serializer = ChangeUsernameSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        user = request.user
        user.username = serializer.validated_data['new_username']
        user.save()
        
        return Response({
            'success': True,
            'message': 'Nazwa użytkownika została zmieniona pomyślnie',
            'new_username': user.username
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# RESET HASŁA - ŻĄDANIE
# ============================================

@csrf_exempt
@api_view(['POST'])
def request_password_reset(request):
    """Wysyła email z linkiem do resetu hasła"""
    serializer = RequestPasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Wygeneruj token resetu (64 znaki hex)
            reset_token = secrets.token_urlsafe(32)
            
            # Zapisz token w cache na 1 godzinę
            cache_key = f'password_reset_{reset_token}'
            cache.set(cache_key, user.id, timeout=3600)
            
            # Przygotuj link resetu
            reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
            
            # Wyślij email
            send_mail(
                subject='Reset hasła - Habit Tracker',
                message=f'Kliknij w link aby zresetować hasło:\n\n{reset_url}\n\nLink jest ważny przez 1 godzinę.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
        except User.DoesNotExist:
            # Dla bezpieczeństwa nie ujawniamy czy email istnieje
            pass
        
        # Zawsze zwracaj sukces (nie ujawniaj czy email istnieje)
        return Response({
            'success': True,
            'message': 'Jeśli podany email istnieje w systemie, wysłaliśmy link do resetu hasła'
        }, status=status.HTTP_200_OK)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# RESET HASŁA - POTWIERDZENIE
# ============================================

@csrf_exempt
@api_view(['POST'])
def confirm_password_reset(request):
    """Resetuje hasło używając tokena z emaila"""
    serializer = ConfirmPasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        # Sprawdź token w cache
        cache_key = f'password_reset_{token}'
        user_id = cache.get(cache_key)
        
        if user_id is None:
            return Response({
                'success': False,
                'error': 'Nieprawidłowy lub wygasły token resetu hasła'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(id=user_id)
            user.set_password(new_password)
            user.save()
            
            # Usuń token z cache
            cache.delete(cache_key)
            
            return Response({
                'success': True,
                'message': 'Hasło zostało zresetowane pomyślnie'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Użytkownik nie istnieje'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)




class PushSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check if user is subscribed to push notifications"""
        subscriptions = PushSubscription.objects.filter(user=request.user)
        return Response({
            "is_subscribed": subscriptions.exists(),
            "subscription_count": subscriptions.count()
        }, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PushSubscriptionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"status": "subscribed"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        """Unsubscribe from push notifications by deleting all subscriptions for this user"""
        deleted_count, _ = PushSubscription.objects.filter(user=request.user).delete()
        return Response({
            "status": "unsubscribed",
            "subscriptions_removed": deleted_count
        }, status=status.HTTP_200_OK)


class NotificationPreferenceView(APIView):
    """API view for managing user notification preferences"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Retrieve user's notification preferences"""
        try:
            pref = NotificationPreference.objects.get(user=request.user)
            serializer = NotificationPreferenceSerializer(pref)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except NotificationPreference.DoesNotExist:
            # Create default preferences if they don't exist
            pref = NotificationPreference.objects.create(user=request.user)
            serializer = NotificationPreferenceSerializer(pref)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Update user's notification preferences"""
        try:
            pref = NotificationPreference.objects.get(user=request.user)
        except NotificationPreference.DoesNotExist:
            pref = NotificationPreference.objects.create(user=request.user)
        
        serializer = NotificationPreferenceSerializer(pref, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_notification(request):
    """Send a test notification to the user"""
    try:
        subscriptions = PushSubscription.objects.filter(user=request.user)
        
        if not subscriptions.exists():
            return Response(
                {'error': 'No push subscriptions found. Please enable push notifications first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Test notification message
        test_message = {
            'title': 'Test Notification',
            'body': 'This is a test notification from your app!',
            'icon': '/icon.png'
        }
        
        # Actually send the test notification to all subscriptions
        from .utils import send_push_notification
        successful_sends = 0
        
        for subscription in subscriptions:
            try:
                result = send_push_notification(subscription, test_message)
                if result:
                    successful_sends += 1
            except Exception as e:
                print(f"Failed to send test notification to subscription {subscription.id}: {str(e)}")
        
        if successful_sends > 0:
            return Response(
                {'success': True, 'message': f'Test notification sent to {successful_sends} device(s)'},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {'error': 'Failed to send test notification to any device'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_simulate_habit_notifications(request):
    """
    Test endpoint: Simulate sending habit notifications to ALL users
    This bypasses the time check and sends immediately for debugging
    """
    try:
        from .utils import send_push_notification
        
        users = User.objects.all()
        notification_sent_count = 0
        users_checked = 0
        
        for user in users:
            users_checked += 1
            
            try:
                # Get user's notification preferences
                pref = NotificationPreference.objects.get(user=user)
                
                if not pref.is_enabled_habits:
                    continue
                
                # Check for incomplete habits
                user_habits = Habit.objects.filter(user=user)
                today = timezone.now().date()
                incomplete_count = 0
                
                for habit in user_habits:
                    completed_today = HabitCompletion.objects.filter(
                        habit=habit,
                        completion_date=today
                    ).exists()
                    
                    if not completed_today:
                        incomplete_count += 1
                
                # If there are incomplete habits, send notification
                if incomplete_count > 0:
                    subscriptions = PushSubscription.objects.filter(user=user)
                    
                    if subscriptions.exists():
                        message = {
                            "title": "🎯 TEST: Don't forget your habits!",
                            "body": f"TEST: You have {incomplete_count} incomplete habit(s) today!"
                        }
                        
                        for subscription in subscriptions:
                            try:
                                send_push_notification(subscription, message)
                                notification_sent_count += 1
                                print(f"TEST HABIT: Sent notification to {user.username} ({subscription.endpoint[:50]}...)")
                            except Exception as e:
                                print(f"TEST HABIT: Failed to send to {user.username}: {str(e)}")
            
            except NotificationPreference.DoesNotExist:
                # User doesn't have notification preferences
                pass
            except Exception as e:
                print(f"TEST HABIT: Error processing user {user.username}: {str(e)}")
        
        return Response({
            'success': True,
            'message': f'Test habit notifications sent',
            'users_checked': users_checked,
            'notifications_sent': notification_sent_count,
            'details': 'Simulated sending habit reminders to all users with incomplete habits'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"TEST HABIT ERROR: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def test_simulate_challenge_notifications(request):
    """
    Test endpoint: Simulate sending challenge notifications to ALL users
    This bypasses the time check and sends immediately for debugging
    """
    try:
        from .utils import send_push_notification
        
        users = User.objects.all()
        notification_sent_count = 0
        users_checked = 0
        
        for user in users:
            users_checked += 1
            
            try:
                # Get user's notification preferences
                pref = NotificationPreference.objects.get(user=user)
                
                if not pref.is_enabled_challenges:
                    continue
                
                # Check for incomplete daily challenge
                today = timezone.now().date()
                daily_challenge = DailyChallenge.objects.filter(
                    user=user,
                    assigned_date=today,
                    completed=False
                ).first()
                
                # If there's an incomplete challenge, send notification
                if daily_challenge:
                    subscriptions = PushSubscription.objects.filter(user=user)
                    
                    if subscriptions.exists():
                        message = {
                            "title": "⚡ TEST: Daily Challenge Waiting",
                            "body": f"TEST: {daily_challenge.challenge.title} is waiting for you! Earn points today!"
                        }
                        
                        for subscription in subscriptions:
                            try:
                                send_push_notification(subscription, message)
                                notification_sent_count += 1
                                print(f"TEST CHALLENGE: Sent notification to {user.username} ({subscription.endpoint[:50]}...)")
                            except Exception as e:
                                print(f"TEST CHALLENGE: Failed to send to {user.username}: {str(e)}")
            
            except NotificationPreference.DoesNotExist:
                # User doesn't have notification preferences
                pass
            except Exception as e:
                print(f"TEST CHALLENGE: Error processing user {user.username}: {str(e)}")
        
        return Response({
            'success': True,
            'message': f'Test challenge notifications sent',
            'users_checked': users_checked,
            'notifications_sent': notification_sent_count,
            'details': 'Simulated sending challenge reminders to all users with incomplete challenges'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"TEST CHALLENGE ERROR: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def debug_notification_preferences(request):
    """
    Debug endpoint: Get information about notification setup for diagnosis
    Returns details about user's preferences, subscriptions, habits, and challenges
    """
    try:
        user = request.user
        today = timezone.now().date()
        
        # Get preferences
        try:
            pref = NotificationPreference.objects.get(user=user)
            pref_data = {
                'is_enabled_habits': pref.is_enabled_habits,
                'notification_time_habits': str(pref.notification_time_habits),
                'is_enabled_challenges': pref.is_enabled_challenges,
                'notification_time_challenges': str(pref.notification_time_challenges),
                'is_enabled_pomodoro': pref.is_enabled_pomodoro,
                'timezone': pref.timezone,
            }
        except NotificationPreference.DoesNotExist:
            pref_data = {'error': 'No notification preferences found'}
        
        # Get subscriptions
        subscriptions = PushSubscription.objects.filter(user=user)
        sub_count = subscriptions.count()
        sub_endpoints = [f"{sub.endpoint[:60]}..." for sub in subscriptions]
        
        # Get habits
        habits = Habit.objects.filter(user=user)
        incomplete_habits = []
        
        for habit in habits:
            completed_today = HabitCompletion.objects.filter(
                habit=habit,
                completion_date=today
            ).exists()
            
            if not completed_today:
                incomplete_habits.append({
                    'name': habit.name,
                    'completed_today': False
                })
        
        # Get challenges
        daily_challenge = DailyChallenge.objects.filter(
            user=user,
            assigned_date=today,
            completed=False
        ).first()
        
        challenge_data = None
        if daily_challenge:
            challenge_data = {
                'title': daily_challenge.challenge.title,
                'completed': False
            }
        
        return Response({
            'user': user.username,
            'date_today': str(today),
            'preferences': pref_data,
            'push_subscriptions': {
                'count': sub_count,
                'endpoints': sub_endpoints
            },
            'habits': {
                'total': habits.count(),
                'incomplete_today': len(incomplete_habits),
                'incomplete_list': incomplete_habits
            },
            'challenges': {
                'has_incomplete_today': daily_challenge is not None,
                'challenge': challenge_data
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])  # PUBLIC - no auth needed
def debug_all_subscriptions_public(request):
    """
    PUBLIC Debug endpoint: Check ALL subscriptions and key validity
    Use this to diagnose notification issues
    """
    import base64
    
    subscriptions = PushSubscription.objects.all()
    
    result = {
        'total_subscriptions': subscriptions.count(),
        'subscriptions': []
    }
    
    for sub in subscriptions:
        # Check if keys are valid base64
        try:
            p256dh_decoded = base64.b64decode(sub.p256dh)
            p256_valid = True
            p256_len = len(p256dh_decoded)
        except Exception as e:
            p256_valid = False
            p256_len = 0
            p256_err = str(e)
        
        try:
            auth_decoded = base64.b64decode(sub.auth)
            auth_valid = True
            auth_len = len(auth_decoded)
        except Exception as e:
            auth_valid = False
            auth_len = 0
            auth_err = str(e)
        
        result['subscriptions'].append({
            'id': sub.id,
            'user': sub.user.username,
            'endpoint': sub.endpoint[:80] + '...',
            'p256dh': {
                'valid': p256_valid,
                'length': len(sub.p256dh),
                'decoded_bytes': p256_len,
                'error': p256_err if not p256_valid else None
            },
            'auth': {
                'valid': auth_valid,
                'length': len(sub.auth),
                'decoded_bytes': auth_len,
                'error': auth_err if not auth_valid else None
            },
            'all_keys_valid': p256_valid and auth_valid
        })
    
    return Response(result, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])  # PUBLIC - no auth needed  
def debug_send_test_to_user(request):
    """
    PUBLIC Debug endpoint: Send test notification to a specific user
    POST data: {"username": "asd"}
    """
    from .utils import send_push_notification
    
    username = request.data.get('username')
    
    if not username:
        return Response({'error': 'username required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(username=username)
        subscriptions = PushSubscription.objects.filter(user=user)
        
        if not subscriptions.exists():
            return Response({
                'error': f'No subscriptions found for user {username}',
                'subscription_count': 0
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Send test notification
        sent_count = 0
        errors = []
        
        message = {
            'title': '🧪 TEST NOTIFICATION',
            'body': f'This is a test notification for {username} - If you see this, notifications work!'
        }
        
        for subscription in subscriptions:
            try:
                send_push_notification(subscription, message)
                sent_count += 1
            except Exception as e:
                errors.append({
                    'subscription_id': subscription.id,
                    'error': str(e)
                })
        
        return Response({
            'user': username,
            'subscriptions_total': subscriptions.count(),
            'notifications_sent': sent_count,
            'errors': errors if errors else None,
            'message': f'✅ Sent to {sent_count}/{subscriptions.count()} subscriptions'
        }, status=status.HTTP_200_OK)
    
    except User.DoesNotExist:
        return Response({'error': f'User {username} not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
