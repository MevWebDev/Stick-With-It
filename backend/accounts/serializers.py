from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
import os
from PIL import Image


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer do zmiany hasła - wymaga potwierdzenia obecnym hasłem"""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    
    def validate_current_password(self, value):
        """Sprawdź czy obecne hasło jest poprawne"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Nieprawidłowe obecne hasło")
        return value
    
    def validate_new_password(self, value):
        """Walidacja nowego hasła"""
        if len(value) < 8:
            raise serializers.ValidationError("Hasło musi mieć minimum 8 znaków")
        return value
    
    def validate(self, attrs):
        """Sprawdź czy nowe hasło różni się od obecnego"""
        if attrs['current_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                "new_password": "Nowe hasło musi być inne niż obecne"
            })
        return attrs


class ChangeEmailSerializer(serializers.Serializer):
    """Serializer do zmiany emaila - wymaga potwierdzenia hasłem"""
    new_email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate_password(self, value):
        """Sprawdź czy hasło jest poprawne"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Nieprawidłowe hasło")
        return value
    
    def validate_new_email(self, value):
        """Sprawdź czy email jest prawidłowy i dostępny"""
        user = self.context['request'].user
        
        # Sprawdź czy to ten sam email
        if user.email == value:
            raise serializers.ValidationError("Nowy email musi być inny niż obecny")
        
        # Sprawdź czy email jest już zajęty
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ten adres email jest już zajęty")
        
        return value


class ChangeUsernameSerializer(serializers.Serializer):
    """Serializer do zmiany nazwy użytkownika - wymaga potwierdzenia hasłem"""
    new_username = serializers.CharField(required=True, min_length=3, max_length=150)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate_password(self, value):
        """Sprawdź czy hasło jest poprawne"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Nieprawidłowe hasło")
        return value
    
    def validate_new_username(self, value):
        """Sprawdź czy username jest prawidłowy i dostępny"""
        user = self.context['request'].user
        
        # Sprawdź czy to ta sama nazwa
        if user.username == value:
            raise serializers.ValidationError("Nowa nazwa użytkownika musi być inna niż obecna")
        
        # Sprawdź czy username nie jest emailem
        try:
            validate_email(value)
            raise serializers.ValidationError("Nazwa użytkownika nie może być adresem email")
        except DjangoValidationError:
            pass
        
        # Sprawdź czy username jest już zajęty
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ta nazwa użytkownika jest już zajęta")
        
        return value


class RequestPasswordResetSerializer(serializers.Serializer):
    """Serializer do żądania resetu hasła przez email"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Sprawdź czy email istnieje w systemie"""
        if not User.objects.filter(email=value).exists():
            # Dla bezpieczeństwa nie ujawniamy czy email istnieje
            # ale musimy go zwrócić, żeby móc go zignorować w widoku
            pass
        return value


class ConfirmPasswordResetSerializer(serializers.Serializer):
    """Serializer do potwierdzenia resetu hasła z tokenem"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    
    def validate_new_password(self, value):
        """Walidacja nowego hasła"""
        if len(value) < 8:
            raise serializers.ValidationError("Hasło musi mieć minimum 8 znaków")
        return value


class AvatarUploadSerializer(serializers.Serializer):
    """Serializer for avatar upload with validation"""
    avatar = serializers.ImageField(
        max_length=None,
        allow_empty_file=False,
        use_url=True,
        required=True
    )
    
    def validate_avatar(self, value):
        # File size validation (2MB max)
        MAX_SIZE = 2 * 1024 * 1024
        if value.size > MAX_SIZE:
            raise serializers.ValidationError(
                f"Avatar file size cannot exceed 2MB. Current size: {value.size / (1024*1024):.2f}MB"
            )
        
        # File type validation
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Unsupported file type: {value.content_type}. Allowed: JPEG, PNG, GIF, WebP"
            )
        
        # Extension check
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(f"Unsupported file extension: {ext}")
        
        # Verify it's actually an image and check dimensions
        try:
            img = Image.open(value)
            img.verify()
            
            # Re-open for dimension check (verify closes file)
            value.seek(0)
            img = Image.open(value)
            
            width, height = img.size
            MAX_DIM = (4000, 4000)
            MIN_DIM = (100, 100)
            
            if width > MAX_DIM[0] or height > MAX_DIM[1]:
                raise serializers.ValidationError(
                    f"Image dimensions {width}x{height} exceed maximum {MAX_DIM[0]}x{MAX_DIM[1]}"
                )
            if width < MIN_DIM[0] or height < MIN_DIM[1]:
                raise serializers.ValidationError(
                    f"Image dimensions {width}x{height} below minimum {MIN_DIM[0]}x{MIN_DIM[1]}"
                )
        except Exception as e:
            raise serializers.ValidationError(f"Invalid image file: {str(e)}")
        
        # Reset file pointer
        value.seek(0)
        return value
