from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
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


# LOGOWANIE
@csrf_exempt
@require_http_methods(["POST"])
def login_view(request):
    """Logowanie użytkownika - zwraca JWT tokeny"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
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