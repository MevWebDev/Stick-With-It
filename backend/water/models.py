from django.db import models
from django.conf import settings


class UserWaterSettings(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_settings')
    daily_goal = models.IntegerField(default=2000)

    def __str__(self):
        return f"{self.user.username} - goal: {self.daily_goal}ml"


class DailyWaterLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    date = models.DateField()
    current_amount = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.current_amount}ml"
