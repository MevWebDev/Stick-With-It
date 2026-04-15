from django.contrib import admin

from .models import DailyNote, Habit, HabitCompletion


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'name', 'is_custom', 'current_streak', 'created_at')
    list_filter = ('is_custom', 'created_at')
    search_fields = ('name', 'user__username')


@admin.register(HabitCompletion)
class HabitCompletionAdmin(admin.ModelAdmin):
    list_display = ('id', 'habit', 'completion_date', 'completion_at')
    list_filter = ('completion_date',)
    search_fields = ('habit__name', 'habit__user__username')


@admin.register(DailyNote)
class DailyNoteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'date', 'updated_at')
    list_filter = ('date',)
    search_fields = ('user__username',)
    date_hierarchy = 'date'
