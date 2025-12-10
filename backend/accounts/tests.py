from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timezone, timedelta
from rest_framework_simplejwt.tokens import AccessToken
import json
from .models import Challenge, UserStats, DailyChallenge, Badges, CompletedChallenge


class RegisterViewTestCase(TestCase):
    """Tests for user registration endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('register')
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepassword123'
        }
    
    def test_register_with_valid_data_returns_201(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
    
    def test_register_with_valid_data_returns_success_true(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_register_creates_user_in_database(self):
        self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        user_exists = User.objects.filter(username='testuser').exists()
        self.assertTrue(user_exists)
    
    def test_register_returns_user_id(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertIn('id', data['user'])
    
    def test_register_returns_username(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['user']['username'], 'testuser')
    
    def test_register_returns_email(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['user']['email'], 'test@example.com')
    
    def test_register_returns_access_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertIn('access', data['tokens'])
    
    def test_register_returns_refresh_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertIn('refresh', data['tokens'])
    
    def test_register_without_username_returns_400(self):
        invalid_data = self.valid_data.copy()
        invalid_data.pop('username')
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_register_without_username_returns_error_message(self):
        invalid_data = self.valid_data.copy()
        invalid_data.pop('username')
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Wszystkie pola są wymagane')
    
    def test_register_without_email_returns_400(self):
        invalid_data = self.valid_data.copy()
        invalid_data.pop('email')
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_register_without_password_returns_400(self):
        invalid_data = self.valid_data.copy()
        invalid_data.pop('password')
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_register_with_existing_username_returns_400(self):
        User.objects.create_user(username='testuser', email='other@example.com', password='pass123')
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_register_with_existing_username_returns_error_message(self):
        User.objects.create_user(username='testuser', email='other@example.com', password='pass123')
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Użytkownik o tej nazwie już istnieje')
    
    def test_register_with_existing_email_returns_400(self):
        User.objects.create_user(username='otheruser', email='test@example.com', password='pass123')
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_register_with_existing_email_returns_error_message(self):
        User.objects.create_user(username='otheruser', email='test@example.com', password='pass123')
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Email jest już zajęty')
    
    def test_register_with_get_method_returns_405(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)
    
    def test_register_stores_hashed_password(self):
        self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        user = User.objects.get(username='testuser')
        self.assertNotEqual(user.password, 'securepassword123')
    
    def test_register_password_can_be_verified(self):
        self.client.post(
            self.url,
            data=json.dumps(self.valid_data),
            content_type='application/json'
        )
        user = User.objects.get(username='testuser')
        self.assertTrue(user.check_password('securepassword123'))

    def test_register_with_email_as_username_returns_400(self):
        invalid_data = self.valid_data.copy()
        invalid_data['username'] = 'email@as.username.com'
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_register_with_email_as_username_returns_error_message(self):
        invalid_data = self.valid_data.copy()
        invalid_data['username'] = 'email@as.username.com'
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_data),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Nazwa użytkownika nie może być adresem email')


class LoginViewTestCase(TestCase):
    """Tests for user login endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepassword123'
        )
        self.valid_credentials = {
            'username': 'testuser',
            'password': 'securepassword123'
        }
    
    def test_login_with_valid_credentials_returns_200(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
    
    def test_login_with_valid_credentials_returns_success_true(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_login_returns_user_id(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['user']['id'], self.user.id)
    
    def test_login_returns_username(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['user']['username'], 'testuser')
    
    def test_login_returns_email(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['user']['email'], 'test@example.com')
    
    def test_login_returns_access_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertIn('access', data['tokens'])
    
    def test_login_returns_refresh_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps(self.valid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertIn('refresh', data['tokens'])
    
    def test_login_with_wrong_password_returns_401(self):
        invalid_credentials = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_credentials),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_login_with_wrong_password_returns_error_message(self):
        invalid_credentials = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Nieprawidłowe dane logowania')
    
    def test_login_with_nonexistent_user_returns_401(self):
        invalid_credentials = {
            'username': 'nonexistentuser',
            'password': 'somepassword'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_credentials),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_login_with_nonexistent_user_returns_error_message(self):
        invalid_credentials = {
            'username': 'nonexistentuser',
            'password': 'somepassword'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Nieprawidłowe dane logowania')
    
    def test_login_with_get_method_returns_405(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)
    
    def test_login_with_empty_username_returns_401(self):
        invalid_credentials = {
            'username': '',
            'password': 'securepassword123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_credentials),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_login_with_empty_password_returns_401(self):
        invalid_credentials = {
            'username': 'testuser',
            'password': ''
        }
        response = self.client.post(
            self.url,
            data=json.dumps(invalid_credentials),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

    def test_login_with_email_returns_200(self):
        credentials = {
            'username': 'test@example.com',
            'password': 'securepassword123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(credentials),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)

    def test_login_with_email_returns_success_true(self):
        credentials = {
            'username': 'test@example.com',
            'password': 'securepassword123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertTrue(data['success'])

    def test_login_with_email_returns_user_data(self):
        credentials = {
            'username': 'test@example.com',
            'password': 'securepassword123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(credentials),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['user']['username'], 'testuser')
        self.assertEqual(data['user']['email'], 'test@example.com')


class LogoutViewTestCase(TestCase):
    """Tests for user logout endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('logout')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepassword123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
    
    def test_logout_with_valid_token_returns_200(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
    
    def test_logout_with_valid_token_returns_success_true(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_logout_with_invalid_token_returns_400(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': 'invalid_token_string'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_logout_with_invalid_token_returns_error_message(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': 'invalid_token_string'}),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Nieprawidłowy token')
    
    def test_logout_without_token_returns_200(self):
        response = self.client.post(
            self.url,
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
    
    def test_logout_with_get_method_returns_405(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)
    
    def test_logout_with_empty_string_token_returns_400(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': ''}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)


class UserInfoViewTestCase(TestCase):
    """Tests for authenticated user info endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('user_info')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepassword123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
    
    def test_user_info_with_valid_token_returns_200(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
    
    def test_user_info_returns_user_id(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        data = response.json()
        self.assertEqual(data['id'], self.user.id)
    
    def test_user_info_returns_username(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        data = response.json()
        self.assertEqual(data['username'], 'testuser')
    
    def test_user_info_returns_email(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        data = response.json()
        self.assertEqual(data['email'], 'test@example.com')
    
    def test_user_info_without_token_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)
    
    def test_user_info_with_invalid_token_returns_401(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION='Bearer invalid_token_string'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_user_info_with_expired_token_returns_401(self):
        

        #tworzę token z datą wygaśnięcia na przeszłość
        token = AccessToken.for_user(self.user)
        
        token.set_exp(lifetime=-timedelta(seconds=1))
        expired_token = str(token)
        
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {expired_token}'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_user_info_with_post_method_returns_405(self):
        response = self.client.post(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 405)


class RefreshTokenViewTestCase(TestCase):
    """Tests for refresh token endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('refresh_token')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepassword123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.refresh_token = str(refresh)
        self.access_token = str(refresh.access_token)
    
    def test_refresh_with_valid_token_returns_200(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
    
    def test_refresh_with_valid_token_returns_success_true(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        data = response.json()
        self.assertTrue(data['success'])
    
    def test_refresh_returns_new_access_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        data = response.json()
        self.assertIn('access', data)
    
    def test_refresh_returns_different_access_token(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        data = response.json()
        new_access_token = data['access']
        self.assertNotEqual(new_access_token, self.access_token)
    
    def test_refresh_without_token_returns_400(self):
        response = self.client.post(
            self.url,
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_refresh_without_token_returns_error_message(self):
        response = self.client.post(
            self.url,
            data=json.dumps({}),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Refresh token jest wymagany')
    
    def test_refresh_with_invalid_token_returns_401(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': 'invalid_token_string'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_refresh_with_invalid_token_returns_error_message(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': 'invalid_token_string'}),
            content_type='application/json'
        )
        data = response.json()
        self.assertEqual(data['error'], 'Nieprawidłowy lub wygasły refresh token')
    
    def test_refresh_with_access_token_returns_401(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.access_token}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_refresh_with_blacklisted_token_returns_401(self):
        # Blacklist the token first
        token = RefreshToken(self.refresh_token)
        token.blacklist()
        
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': self.refresh_token}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
    
    def test_refresh_with_get_method_returns_405(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)
    
    def test_refresh_with_empty_string_token_returns_400(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'refresh': ''}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)


class CheckEmailViewTestCase(TestCase):
    """Tests for check email endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.url = reverse('check_email')
        self.user = User.objects.create_user(
            username='testuser',
            email='taken@example.com',
            password='password'
        )
    
    def test_check_email_with_available_email(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'email': 'available@example.com'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertFalse(data['is_taken'])
        self.assertEqual(data['message'], 'Email jest dostępny')

    def test_check_email_with_taken_email(self):
        response = self.client.post(
            self.url,
            data=json.dumps({'email': 'taken@example.com'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertTrue(data['is_taken'])
        self.assertEqual(data['message'], 'Email jest zajęty')

    def test_check_email_without_email_returns_400(self):
        response = self.client.post(
            self.url,
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertEqual(data['error'], 'Email jest wymagany')

    def test_check_email_with_get_method_returns_405(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)


class ChallengeModelTestCase(TestCase):
    """Tests for Challenge model"""
    
    def setUp(self):
        self.challenge = Challenge.objects.create(
            title="Test Challenge",
            category="Health",
            description="Do something healthy",
            difficulty=1
        )

    def test_challenge_creation(self):
        self.assertEqual(self.challenge.title, "Test Challenge")
        self.assertEqual(self.challenge.difficulty, 1)
        self.assertEqual(str(self.challenge), "Test Challenge (Level 1)")


class UserStatsModelTestCase(TestCase):
    """Tests for UserStats model"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='statuser', password='password')
        # UserStats should be created by signal
        self.stats = UserStats.objects.get(user=self.user)

    def test_user_stats_creation_signal(self):
        self.assertIsNotNone(self.stats)
        self.assertEqual(self.stats.points, 0)
        self.assertEqual(self.stats.current_streak, 0)

    def test_user_stats_str(self):
        self.assertEqual(str(self.stats), "statuser - Lvl 1 (0 pts, Streak: 0)")


class DailyChallengeViewTestCase(TestCase):
    """Tests for Daily Challenge endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='dailyuser', password='password')
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.challenge = Challenge.objects.create(
            title="Daily Task",
            category="Productivity",
            description="Work hard",
            difficulty=2
        )
        self.url = reverse('daily_challenge') 

    def test_get_daily_challenge_creates_new(self):
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data['challenge']['title'], "Daily Task")
        
        # Verify it exists in DB
        self.assertTrue(DailyChallenge.objects.filter(user=self.user).exists())

    def test_get_daily_challenge_returns_existing(self):
        # Create one first
        DailyChallenge.objects.create(user=self.user, challenge=self.challenge)
        
        response = self.client.get(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['challenge']['id'], self.challenge.id)


class CompleteChallengeViewTestCase(TestCase):
    """Tests for completing challenges"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(username='compuser', password='password')
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        
        self.challenge = Challenge.objects.create(
            title="Complete Me",
            category="Fun",
            description="Just do it",
            difficulty=1
        )
        self.daily = DailyChallenge.objects.create(user=self.user, challenge=self.challenge)
        self.url = reverse('complete_challenge')

    def test_complete_challenge_success(self):
        response = self.client.post(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data['success'])
        self.assertEqual(data['points_earned'], 1) # Difficulty 1
        
        # Check stats updated
        self.user.stats.refresh_from_db()
        self.assertEqual(self.user.stats.points, 1)
        self.assertEqual(self.user.stats.total_completed, 1)
        
        # Check DailyChallenge marked completed
        self.daily.refresh_from_db()
        self.assertTrue(self.daily.completed)

    def test_complete_challenge_already_completed(self):
        # Complete it once
        self.client.post(self.url, HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        
        # Try again
        response = self.client.post(
            self.url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)


# ============================================
# TESTY DLA ZMIANY HASŁA
# ============================================

class ChangePasswordViewTestCase(TestCase):
    """Tests for password change endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpassword123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.url = reverse('change_password')
    
    def test_change_password_success(self):
        """Test zmiany hasła z prawidłowymi danymi"""
        data = {
            'current_password': 'oldpassword123',
            'new_password': 'newpassword456'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
        
        # Sprawdź czy hasło rzeczywiście się zmieniło
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword456'))
    
    def test_change_password_wrong_current_password(self):
        """Test zmiany hasła z błędnym obecnym hasłem"""
        data = {
            'current_password': 'wrongpassword',
            'new_password': 'newpassword456'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_change_password_same_as_current(self):
        """Test zmiany hasła na takie samo"""
        data = {
            'current_password': 'oldpassword123',
            'new_password': 'oldpassword123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_password_too_short(self):
        """Test zmiany hasła na zbyt krótkie"""
        data = {
            'current_password': 'oldpassword123',
            'new_password': 'short'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_password_unauthorized(self):
        """Test zmiany hasła bez tokena"""
        data = {
            'current_password': 'oldpassword123',
            'new_password': 'newpassword456'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)


# ============================================
# TESTY DLA ZMIANY EMAILA
# ============================================

class ChangeEmailViewTestCase(TestCase):
    """Tests for email change endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='old@example.com',
            password='password123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.url = reverse('change_email')
    
    def test_change_email_success(self):
        """Test zmiany emaila z prawidłowymi danymi"""
        data = {
            'new_email': 'new@example.com',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['new_email'], 'new@example.com')
        
        # Sprawdź czy email rzeczywiście się zmienił
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'new@example.com')
    
    def test_change_email_wrong_password(self):
        """Test zmiany emaila z błędnym hasłem"""
        data = {
            'new_email': 'new@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_change_email_already_taken(self):
        """Test zmiany emaila na już zajęty"""
        # Stwórz innego użytkownika z emailem który chcemy użyć
        User.objects.create_user(
            username='otheruser',
            email='taken@example.com',
            password='password'
        )
        
        data = {
            'new_email': 'taken@example.com',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_email_same_as_current(self):
        """Test zmiany emaila na ten sam"""
        data = {
            'new_email': 'old@example.com',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_email_unauthorized(self):
        """Test zmiany emaila bez tokena"""
        data = {
            'new_email': 'new@example.com',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)


# ============================================
# TESTY DLA ZMIANY USERNAME
# ============================================

class ChangeUsernameViewTestCase(TestCase):
    """Tests for username change endpoint"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='oldusername',
            email='test@example.com',
            password='password123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.url = reverse('change_username')
    
    def test_change_username_success(self):
        """Test zmiany username z prawidłowymi danymi"""
        data = {
            'new_username': 'newusername',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
        self.assertEqual(response_data['new_username'], 'newusername')
        
        # Sprawdź czy username rzeczywiście się zmienił
        self.user.refresh_from_db()
        self.assertEqual(self.user.username, 'newusername')
    
    def test_change_username_wrong_password(self):
        """Test zmiany username z błędnym hasłem"""
        data = {
            'new_username': 'newusername',
            'password': 'wrongpassword'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_change_username_already_taken(self):
        """Test zmiany username na już zajęty"""
        # Stwórz innego użytkownika z username który chcemy użyć
        User.objects.create_user(
            username='takenusername',
            email='other@example.com',
            password='password'
        )
        
        data = {
            'new_username': 'takenusername',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_username_same_as_current(self):
        """Test zmiany username na ten sam"""
        data = {
            'new_username': 'oldusername',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_username_is_email(self):
        """Test zmiany username na adres email"""
        data = {
            'new_username': 'email@example.com',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_username_too_short(self):
        """Test zmiany username na zbyt krótki"""
        data = {
            'new_username': 'ab',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
    
    def test_change_username_unauthorized(self):
        """Test zmiany username bez tokena"""
        data = {
            'new_username': 'newusername',
            'password': 'password123'
        }
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)


# ============================================
# TESTY DLA RESETU HASŁA
# ============================================

class PasswordResetViewTestCase(TestCase):
    """Tests for password reset endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='oldpassword123'
        )
        self.request_url = reverse('request_password_reset')
        self.confirm_url = reverse('confirm_password_reset')
    
    def test_request_password_reset_success(self):
        """Test żądania resetu hasła z istniejącym emailem"""
        data = {'email': 'test@example.com'}
        response = self.client.post(
            self.request_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
    
    def test_request_password_reset_nonexistent_email(self):
        """Test żądania resetu hasła z nieistniejącym emailem - dla bezpieczeństwa zwraca sukces"""
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(
            self.request_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        # Dla bezpieczeństwa nie ujawniamy czy email istnieje
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
    
    def test_confirm_password_reset_invalid_token(self):
        """Test potwierdzenia resetu hasła z nieprawidłowym tokenem"""
        data = {
            'token': 'invalidtoken123',
            'new_password': 'newpassword456'
        }
        response = self.client.post(
            self.confirm_url,
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])


# ============================================
# TESTY DLA AVATARA
# ============================================

class AvatarUploadViewTestCase(TestCase):
    """Tests for avatar upload and management endpoints"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password123'
        )
        refresh = RefreshToken.for_user(self.user)
        self.access_token = str(refresh.access_token)
        self.upload_url = reverse('upload_avatar')
        self.delete_url = reverse('delete_avatar')
        
    def create_test_image(self, size=(200, 200), format='JPEG', color='red'):
        """Helper method to create test image"""
        from PIL import Image
        from io import BytesIO
        
        file = BytesIO()
        image = Image.new('RGB', size, color)
        image.save(file, format)
        file.seek(0)
        file.name = f'test.{format.lower()}'
        return file
    
    def test_upload_avatar_success(self):
        """Test uploadowania poprawnego avatara"""
        image = self.create_test_image()
        response = self.client.post(
            self.upload_url,
            {'avatar': image},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
        self.assertIn('avatar_url', response_data)
        
        # Sprawdź czy avatar został zapisany
        self.user.stats.refresh_from_db()
        self.assertIsNotNone(self.user.stats.avatar)
    
    def test_upload_avatar_replaces_old(self):
        """Test że nowy avatar zastępuje stary"""
        # Upload pierwszego avatara
        image1 = self.create_test_image(color='red')
        self.client.post(
            self.upload_url,
            {'avatar': image1},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        self.user.stats.refresh_from_db()
        old_avatar_name = self.user.stats.avatar.name
        
        # Upload drugiego avatara
        image2 = self.create_test_image(color='blue')
        response = self.client.post(
            self.upload_url,
            {'avatar': image2},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        self.user.stats.refresh_from_db()
        new_avatar_name = self.user.stats.avatar.name
        
        # Sprawdź że nazwa się zmieniła
        self.assertNotEqual(old_avatar_name, new_avatar_name)
    
    def test_upload_avatar_too_large(self):
        """Test uploadowania zbyt dużego pliku (>2MB)"""
        # Stwórz duży obraz (około 3MB)
        image = self.create_test_image(size=(3000, 3000))
        
        # Sprawdź czy faktycznie jest większy niż 2MB
        image.seek(0, 2)  # Przesuń do końca
        file_size = image.tell()
        image.seek(0)
        
        # Jeśli plik jest mniejszy niż 2MB, zwiększ rozmiar
        if file_size < 2 * 1024 * 1024:
            image = self.create_test_image(size=(4000, 4000))
        
        response = self.client.post(
            self.upload_url,
            {'avatar': image},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_upload_avatar_wrong_format(self):
        """Test uploadowania pliku w niewłaściwym formacie"""
        from io import BytesIO
        
        # Stwórz plik tekstowy zamiast obrazu
        file = BytesIO(b'This is not an image')
        file.name = 'test.txt'
        
        response = self.client.post(
            self.upload_url,
            {'avatar': file},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_upload_avatar_too_small(self):
        """Test uploadowania zbyt małego obrazu (<100x100)"""
        image = self.create_test_image(size=(50, 50))
        response = self.client.post(
            self.upload_url,
            {'avatar': image},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_upload_avatar_unauthorized(self):
        """Test uploadowania avatara bez tokena"""
        image = self.create_test_image()
        response = self.client.post(
            self.upload_url,
            {'avatar': image}
        )
        self.assertEqual(response.status_code, 401)
    
    def test_delete_avatar_success(self):
        """Test usuwania avatara"""
        # Najpierw upload avatara
        image = self.create_test_image()
        self.client.post(
            self.upload_url,
            {'avatar': image},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        # Sprawdź że avatar istnieje
        self.user.stats.refresh_from_db()
        self.assertIsNotNone(self.user.stats.avatar)
        
        # Usuń avatar
        response = self.client.delete(
            self.delete_url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
        
        # Sprawdź że avatar został usunięty
        self.user.stats.refresh_from_db()
        self.assertFalse(self.user.stats.avatar)
    
    def test_delete_avatar_no_avatar(self):
        """Test usuwania avatara gdy użytkownik go nie ma"""
        response = self.client.delete(
            self.delete_url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertFalse(response_data['success'])
    
    def test_delete_avatar_unauthorized(self):
        """Test usuwania avatara bez tokena"""
        response = self.client.delete(self.delete_url)
        self.assertEqual(response.status_code, 401)
    
    def test_user_info_includes_avatar_url(self):
        """Test że endpoint /me/ zwraca avatar_url"""
        # Upload avatara
        image = self.create_test_image()
        self.client.post(
            self.upload_url,
            {'avatar': image},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        # Pobierz info o użytkowniku
        me_url = reverse('user_info')
        response = self.client.get(
            me_url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('avatar_url', response_data)
        self.assertIsNotNone(response_data['avatar_url'])
        self.assertIn('/media/', response_data['avatar_url'])
    
    def test_user_info_no_avatar(self):
        """Test że endpoint /me/ zwraca null gdy brak avatara"""
        me_url = reverse('user_info')
        response = self.client.get(
            me_url,
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertIn('avatar_url', response_data)
        self.assertIsNone(response_data['avatar_url'])
    
    def test_upload_png_with_transparency(self):
        """Test uploadowania PNG z przezroczystością (konwersja do JPEG)"""
        from PIL import Image
        from io import BytesIO
        
        # Stwórz PNG z przezroczystością
        file = BytesIO()
        image = Image.new('RGBA', (200, 200), (255, 0, 0, 128))  # Czerwony z alpha
        image.save(file, 'PNG')
        file.seek(0)
        file.name = 'test.png'
        
        response = self.client.post(
            self.upload_url,
            {'avatar': file},
            HTTP_AUTHORIZATION=f'Bearer {self.access_token}'
        )
        
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertTrue(response_data['success'])
        
        # Sprawdź że plik został zapisany jako JPEG
        self.user.stats.refresh_from_db()
        self.assertTrue(self.user.stats.avatar.name.endswith('.jpg'))
