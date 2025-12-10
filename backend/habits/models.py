from django.db import models
from django.conf import settings

class Habit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=255)
    icon_slug = models.CharField(max_length=100)
    is_custom = models.BooleanField(default=False)
    
    # Streak tracking fields (moved from UserHabit)
    current_streak = models.IntegerField(default=0)
    last_completion_date = models.DateField(null=True, blank=True)
    last_completion_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class HabitCompletion(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='completions')
    completion_date = models.DateField()
    completion_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['habit', 'completion_date']
        ordering = ['-completion_date']

    def __str__(self):
        return f"{self.habit.name} - {self.completion_date}"
