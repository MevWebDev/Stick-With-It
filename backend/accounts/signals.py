from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserStats

@receiver(post_save, sender=User)
def create_user_stats(sender, instance, created, **kwargs):
    if created: 
        UserStats.objects.create(user=instance)