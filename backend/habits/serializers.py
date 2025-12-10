from rest_framework import serializers
from .models import Habit

class HabitSerializer(serializers.ModelSerializer):
    completed_today = serializers.BooleanField(read_only=True, default=False)
    
    class Meta:
        model = Habit
        fields = ['id', 'name', 'icon_slug', 'is_custom', 'current_streak', 'last_completion_date', 'last_completion_at', 'created_at', 'updated_at', 'completed_today']
        read_only_fields = ['current_streak', 'last_completion_date', 'last_completion_at', 'completed_today', 'created_at', 'updated_at']
