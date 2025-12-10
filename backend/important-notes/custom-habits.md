# Custom Habits - Dokumentacja implementacji

## Opis funkcjonalności

System pozwala użytkownikom tworzyć własne nawyki (custom habits) z dowolnym tekstem i emoji, które działają identycznie jak predefiniowane nawyki stockowe.

## Backend - Zmiany w modelach

### Model `Habit` (`backend/habits/models.py`)

Dodano nowe pole:
```python
is_custom = models.BooleanField(default=False)  
```

- **Nawyki stockowe** (`is_custom=False`): Używają `icon_slug` do wyświetlania ikon FontAwesome
- **Nawyki custom** (`is_custom=True`): Pole `icon_slug` przechowuje emoji (np. "🏃", "📚", "🎨")

### Serializer

Pole `is_custom` jest dostępne w `HabitSerializer`:
```python
fields = ['id', 'name', 'icon_slug', 'is_custom', 'current_streak', ...]
```

## API Endpoints

### Tworzenie custom nawyk

**POST** `/api/habits/`

```json
{
  "name": "Czytanie książek",
  "icon_slug": "📚",
  "is_custom": true
}
```

**Odpowiedź:**
```json
{
  "id": 123,
  "name": "Czytanie książek",
  "icon_slug": "📚",
  "is_custom": true,
  "current_streak": 0,
  "last_completion_date": null,
  "last_completion_at": null,
  "completed_today": false,
  "created_at": "2025-12-10T12:00:00Z",
  "updated_at": "2025-12-10T12:00:00Z"
}
```

### Tworzenie nawyk stockowy

**POST** `/api/habits/`

```json
{
  "name": "Morning Run",
  "icon_slug": "running",
  "is_custom": false
}
```

## Frontend - Wymagania implementacji

### 1. Rozróżnienie w UI

W komponencie wyświetlającym habit card:

```typescript
interface Habit {
  id: number;
  name: string;
  icon_slug: string;
  is_custom: boolean;
  current_streak: number;
  // ... inne pola
}

// W komponencie:
{habit.is_custom ? (
  <span className="text-2xl">{habit.icon_slug}</span>  // Emoji
) : (
  <FontAwesomeIcon icon={iconMap[habit.icon_slug]} />  // FontAwesome
)}
```

### 2. Modal tworzenia nawyk

Modal powinien mieć dwa tryby:

#### Tryb "Stockowe" (domyślny):
- Lista predefiniowanych nawyków z ikonami FontAwesome
- Pole wyboru ikony (np. dropdown lub grid z ikonami)
- Pole tekstowe z nazwą

#### Tryb "Własny":
- Pole tekstowe na nazwę nawyk
- Emoji picker do wyboru emoji
- Przycisk submit wysyłający request z `is_custom: true`

Po dodaniu pola `is_custom` do modelu, należy utworzyć i zastosować migrację:

```bash
python manage.py makemigrations habits
python manage.py migrate habits
```

Istniejące nawyki automatycznie otrzymają `is_custom=False` (domyślna wartość).

## Walidacja

Backend automatycznie waliduje:
- Pole `name` nie może być puste (max 255 znaków)
- Pole `icon_slug` nie może być puste (max 100 znaków)
- Pole `is_custom` jest opcjonalne (domyślnie `False`)

## Bezpieczeństwo

- Każdy użytkownik widzi tylko własne nawyki (filtry na `user=request.user`)
- Nie można modyfikować nawyków innych użytkowników
- Authorization przez `IsAuthenticated` permission

## Testowanie

### Test tworzenia custom nawyk:

```bash
curl -X POST http://localhost:8000/api/habits/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Medytacja",
    "icon_slug": "🧘",
    "is_custom": true
  }'
```

### Test pobierania nawyków:

```bash
curl -X GET http://localhost:8000/api/habits/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```