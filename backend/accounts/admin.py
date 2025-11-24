from django.contrib import admin
from .models import Challenge, UserStats, DailyChallenge, Badges, CompletedChallenge

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'difficulty', 'id')  
    list_filter = ('difficulty', 'category')  
    search_fields = ('title', 'description', 'category')  

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'points', 'current_streak', 'longest_streak', 'total_completed')
    list_filter = ('current_streak',)
    search_fields = ('user__username',)
    readonly_fields = ('points', 'total_completed', 'level1_completed', 'level2_completed', 'level3_completed')
    filter_horizontal = ('earned_badges',)  

@admin.register(DailyChallenge)
class DailyChallengeAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'assigned_date', 'completed')
    list_filter = ('completed', 'assigned_date')
    search_fields = ('user__username', 'challenge__title')
    date_hierarchy = 'assigned_date'  

@admin.register(Badges)
class BadgesAdmin(admin.ModelAdmin):
    list_display = ('icon', 'title', 'rarity', 'key', 'id')
    list_filter = ('rarity',)
    search_fields = ('title', 'key')

@admin.register(CompletedChallenge)
class CompletedChallengeAdmin(admin.ModelAdmin):
    list_display = ('user', 'challenge', 'completed_date', 'points_earned', 'challenge_difficulty')
    list_filter = ('challenge_difficulty', 'challenge_category', 'completed_date')
    search_fields = ('user__username', 'challenge__title')
    date_hierarchy = 'completed_date'
    readonly_fields = ('completed_date',)