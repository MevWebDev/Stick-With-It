# Zmiany na backendzie dla Dziennika (Journal)

Aby przepiąć nowo powstałą u nas zakładkę "Journal" (Dziennik) z prostej przeglądarkowej pamięci podręcznej (`localStorage`) na prawdziwy serwer, konieczne będzie dodanie dedykowanego punktu końcowego (endpointu) dla notatek oraz modelu.

Sugeruję umieścić to w aplikacji `habits/`, ewentualnie stworzeniu nowej mniejszej aplikacji Django na sam notatnik.

## 1. Modele w bazie danych (`models.py`)

Konieczne jest dodanie tabeli grupującej dni z odpowiednimi notatkami oraz identyfikatorem użytkownika.

```python
from django.db import models
from django.conf import settings

class DailyNote(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_notes')
    date = models.DateField()
    content = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Zapewnia, że dany użytkownik ma max. jedną notatkę przypisaną do danego dnia
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Note by {self.user.username} on {self.date}"
```

Następnie pamiętaj o utworzeniu migracji:
```bash
python manage.py makemigrations habits
python manage.py migrate
```

## 2. Serializacja danych (`serializers.py`)

Aby poprawnie wymieniać obiekty bazy danych z frontendem, musisz dodać odpowiedni Serializer.

```python
from rest_framework import serializers
from .models import DailyNote

class DailyNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyNote
        fields = ['id', 'date', 'content', 'updated_at']
```

## 3. Endpointy / Widoki API (`views.py`)

Najprościej będzie utworzyć jeden główny widok obsługujący żądania do danej daty. Frontend zawsze będzie podawał nam datę jako parametr zapytania. Spodziewany URL: `/api/habits/journal/?date=YYYY-MM-DD`

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils.dateparse import parse_date
from .models import DailyNote
from .serializers import DailyNoteSerializer

@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def daily_note_view(request):
    # Data spływa z Query Params (GET) lub JSON Body (POST)
    date_str = request.query_params.get('date') or request.data.get('date')
    
    if not date_str:
        return Response({'success': False, 'error': 'Parametr "date" (w formacie YYYY-MM-DD) jest bezwzględnie konieczny'}, status=400)
    
    # Przeanalizuj format napisu na faktyczny obiekt Django Date 
    try:
        note_date = parse_date(date_str)
        if not note_date:
            raise ValueError
    except ValueError:
         return Response({'success': False, 'error': 'Nieprawidłowy format daty!'}, status=400)

    # Pobiera istniejącą notatkę, a jeśli nie istnieje dla tego dnia: tworzy ją jako pustą
    note, created = DailyNote.objects.get_or_create(
        user=request.user, 
        date=note_date
    )

    if request.method == 'GET':
        serializer = DailyNoteSerializer(note)
        return Response({'success': True, 'note': serializer.data})
        
    elif request.method in ['POST', 'PUT']:
        content = request.data.get('content', '')
        
        note.content = content
        note.save() # Trigger updated_at
        
        serializer = DailyNoteSerializer(note)
        return Response({'success': True, 'note': serializer.data})
```

## 4. Rejestracja Url (`urls.py`)

W pliku konfigurującym routing aplikacji dodaj ścieżkę do endpointu:

```python
from django.urls import path
from . import views

urlpatterns = [
    # ... inne endpointy
    path('journal/', views.daily_note_view, name='daily_note'),
]
```

## Co zostaje do zmiany na Frontendzie po skończeniu implementacji backendowej?

1. W pliku `frontend/src/app/components/Journal/Journal.tsx` znajdują się dwa hooki `useEffect()`. 
2. Pierwszy służy do pobierania tekstu przez `localStorage.getItem` -> Zamienimy to na `await apiClient.get('/api/habits/journal/?date=X')`.
3. Drugi służy do auto-zapisu w tle co 1 sekundę przez `localStorage.setItem` -> Zamienimy to na `await apiClient.post('/api/habits/journal/', { date: X, content: Y })`.

Wszystko! Reszta frontendowej obsługi, UI, kalendarza oraz zachowania okna nie będzie musiała ulec modyfikacji.
