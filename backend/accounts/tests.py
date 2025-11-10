from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timezone, timedelta
from rest_framework_simplejwt.tokens import AccessToken
import json


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

