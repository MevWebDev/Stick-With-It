from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Challenge(models.Model):
    title = models.CharField(max_length=20)
    category = models.CharField(max_length=20)
    description = models.CharField(max_length=200)
    difficulty = models.IntegerField(validators=[MinValueValidator(1),MaxValueValidator(3)])

class UserStats(models.Model):
    user = models.OneToOneField()
    points = models.IntegerField(default=0)
    currentStreak = models.IntegerField(default=0)
    blacklistedCategories = models.JSONField()

class DailyChallange(models.Model):
    user = models.ForeignKey()
    challenge = models.ForeignKey
    assignedDate = models.DateField()
    completed = models.BooleanField(default=False)
    