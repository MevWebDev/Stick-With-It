from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User

class Challenge(models.Model):
    title = models.CharField(max_length=20)
    category = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    difficulty = models.IntegerField(validators=[MinValueValidator(1),MaxValueValidator(3)])



class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    blacklisted_categories = models.JSONField(default=list)
    goals_list = models.JSONField(default=list)
    level1_completed = models.IntegerField(default=0)
    level2_completed = models.IntegerField(default=0)
    level3_completed = models.IntegerField(default=0)
    total_completed = models.IntegerField(default=0)
    earned_badges = models.ManyToManyField('Badges', blank=True, related_name='users_earned')

class DailyChallenge(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    class Meta:
        unique_together = ['user', 'assigned_date']
class Badges(models.Model):
    title = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    class Rarity(models.TextChoices):
        BRONZE = 'BRONZE', 'Bronze'
        SILVER = 'SILVER', 'Silver'
        GOLD = 'GOLD', 'Gold'
        ULTIMATE = 'ULTIMATE', 'Ultimate'
    rarity = models.CharField(max_length=10, choices=Rarity.choices, default=Rarity.BRONZE)
class CompletedChallenge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='completed_challenges')
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    completed_date = models.DateTimeField(auto_now_add=True)
    points_earned = models.IntegerField()
    challenge_category = models.CharField(max_length=20)
    challenge_difficulty = models.IntegerField()
    class Meta:
        ordering = ['-completed_date']
    def __str__(self):
        return f"{self.user.username} - {self.challenge.title}"