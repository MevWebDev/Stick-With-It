from rest_framework import serializers
from .models import DailyWaterLog, UserWaterSettings


class DailyWaterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWaterLog
        fields = ['date', 'current_amount']


class UserWaterSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserWaterSettings
        fields = ['daily_goal']
