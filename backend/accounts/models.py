from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User

class Challenge(models.Model):
    title = models.CharField(max_length=20)
    category = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    difficulty = models.IntegerField(validators=[MinValueValidator(1),MaxValueValidator(3)])
    
    def __str__(self):
        return f"{self.title} (Level {self.difficulty})"



class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    points = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_completed_date = models.DateTimeField(null=True, blank=True)
    blacklisted_categories = models.JSONField(default=list)
    goals_list = models.JSONField(default=list)
    level1_completed = models.IntegerField(default=0)
    level2_completed = models.IntegerField(default=0)
    level3_completed = models.IntegerField(default=0)
    total_completed = models.IntegerField(default=0)
    earned_badges = models.ManyToManyField('Badges', blank=True, related_name='users_earned')
    
    # Leveling System
    level = models.IntegerField(default=1)
    current_exp = models.IntegerField(default=0)
    total_exp = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - Lvl {self.level} ({self.points} pts)"

class XpLog(models.Model):
    """Log of XP gains to enforce daily limits"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='xp_logs')
    date = models.DateField(auto_now_add=True)
    source = models.CharField(max_length=50)  # 'habit', 'pomodoro', 'challenge'
    amount = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'date', 'source']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.amount} XP ({self.source})"

class DailyChallenge(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    completed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'assigned_date']
    
    def __str__(self):
        status = "✅" if self.completed else "⏳"
        return f"{status} {self.user.username} - {self.challenge.title} ({self.assigned_date})"

class Badges(models.Model):
    key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    icon = models.CharField(max_length=10, default='🥳')
    class Rarity(models.TextChoices):
        BRONZE = 'BRONZE', 'Bronze'
        SILVER = 'SILVER', 'Silver'
        GOLD = 'GOLD', 'Gold'
        ULTIMATE = 'ULTIMATE', 'Ultimate'
    rarity = models.CharField(max_length=10, choices=Rarity.choices, default=Rarity.BRONZE)
    
    def __str__(self):
        return f"{self.icon} {self.title} ({self.rarity})"

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