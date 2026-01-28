from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
import json

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
