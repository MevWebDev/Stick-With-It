from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
import pytz

from .models import DailyWaterLog, UserWaterSettings
from .serializers import DailyWaterLogSerializer


def get_user_date(request):
    tz_name = request.query_params.get('timezone', 'UTC')
    try:
        user_tz = pytz.timezone(tz_name)
    except pytz.UnknownTimeZoneError:
        user_tz = pytz.UTC
    return timezone.now().astimezone(user_tz).date()


def get_or_create_settings(user):
    settings_obj, _ = UserWaterSettings.objects.get_or_create(user=user)
    return settings_obj


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def today(request):
    today_date = get_user_date(request)
    user_settings = get_or_create_settings(request.user)

    log, _ = DailyWaterLog.objects.get_or_create(
        user=request.user,
        date=today_date,
        defaults={'current_amount': 0}
    )

    return Response({
        'date': str(today_date),
        'current_amount': log.current_amount,
        'daily_goal': user_settings.daily_goal,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_water(request):
    amount = request.data.get('amount')

    if amount is None:
        return Response({'error': 'amount is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return Response({'error': 'amount must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

    if amount < 0:
        return Response({'error': 'amount cannot be negative'}, status=status.HTTP_400_BAD_REQUEST)

    today_date = get_user_date(request)
    user_settings = get_or_create_settings(request.user)

    log, _ = DailyWaterLog.objects.update_or_create(
        user=request.user,
        date=today_date,
        defaults={'current_amount': amount}
    )

    return Response({
        'date': str(today_date),
        'current_amount': log.current_amount,
        'daily_goal': user_settings.daily_goal,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_goal(request):
    daily_goal = request.data.get('daily_goal')

    if daily_goal is None:
        return Response({'error': 'daily_goal is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        daily_goal = int(daily_goal)
    except (ValueError, TypeError):
        return Response({'error': 'daily_goal must be an integer'}, status=status.HTTP_400_BAD_REQUEST)

    if daily_goal <= 0:
        return Response({'error': 'daily_goal must be positive'}, status=status.HTTP_400_BAD_REQUEST)

    user_settings = get_or_create_settings(request.user)
    user_settings.daily_goal = daily_goal
    user_settings.save()

    return Response({'daily_goal': user_settings.daily_goal})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def history(request):
    try:
        days = int(request.query_params.get('days', 7))
        days = max(1, min(days, 90))
    except (ValueError, TypeError):
        days = 7

    today_date = get_user_date(request)
    user_settings = get_or_create_settings(request.user)

    logs = DailyWaterLog.objects.filter(
        user=request.user,
        date__lte=today_date
    ).order_by('-date')[:days]

    serializer = DailyWaterLogSerializer(logs, many=True)

    return Response({
        'daily_goal': user_settings.daily_goal,
        'logs': serializer.data,
    })
