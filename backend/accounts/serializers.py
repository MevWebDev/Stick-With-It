from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import PushSubscription, NotificationPreference

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


class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ['endpoint', 'p256dh', 'auth']

    def create(self, validated_data):
        user = self.context['request'].user
        endpoint = validated_data['endpoint']
        
        # Use update_or_create with user + endpoint (now allows same endpoint for different users)
        subscription, created = PushSubscription.objects.update_or_create(
            user=user,
            endpoint=endpoint,
            defaults={
                'p256dh': validated_data['p256dh'],
                'auth': validated_data['auth']
            }
        )
        return subscription


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'timezone',
            'is_enabled_habits',
            'notification_time_habits',
            'is_enabled_challenges',
            'notification_time_challenges',
            'is_enabled_pomodoro',
        ]
    
    def update(self, instance, validated_data):
        """Update notification preferences"""
        instance.timezone = validated_data.get('timezone', instance.timezone)
        instance.is_enabled_habits = validated_data.get('is_enabled_habits', instance.is_enabled_habits)
        instance.notification_time_habits = validated_data.get('notification_time_habits', instance.notification_time_habits)
        instance.is_enabled_challenges = validated_data.get('is_enabled_challenges', instance.is_enabled_challenges)
        instance.notification_time_challenges = validated_data.get('notification_time_challenges', instance.notification_time_challenges)
        instance.is_enabled_pomodoro = validated_data.get('is_enabled_pomodoro', instance.is_enabled_pomodoro)
        instance.save()
        return instance