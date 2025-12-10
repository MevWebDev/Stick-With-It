# Aplikacja Habits (Nawyki)

Ta aplikacja zarządza nawykami definiowanymi przez użytkownika oraz śledzi ukończenia nawyków (serie).

## Przegląd

Każdy użytkownik może tworzyć własne nawyki z nazwą i ikoną. Aplikacja śledzi:
- **Serie**: Kolejne dni, w które nawyk został ukończony
- **Data ostatniego ukończenia**: Kiedy nawyk został ostatnio ukończony
- **Dzienne ukończenia**: Czy nawyk został ukończony dzisiaj

Aplikacja używa **leniwego resetu**: serie są resetowane do 0 tylko wtedy, gdy użytkownik uzyskuje dostęp do swoich nawyków, a ostatnie ukończenie było przed wczoraj.

## Modele

### Habit
- `user`: ForeignKey do User (właściciel nawyku)
- `name`: Nazwa nawyku (np. "Pij wodę", "Czytaj książkę")
- `icon_slug`: Identyfikator ikony (np. "water", "book")
- `current_streak`: Liczba kolejnych dni ukończenia
- `last_completion_date`: Data ostatniego ukończenia
- `last_completion_at`: Znacznik czasu ostatniego ukończenia
- `created_at`, `updated_at`: Znaczniki czasu

### HabitCompletion
- `habit`: ForeignKey do Habit
- `completion_date`: Data, kiedy nawyk został ukończony
- `completion_at`: Znacznik czasu ukończenia
- **Ograniczenie unikalności**: (habit, completion_date) - zapobiega duplikatom ukończeń na dzień

## Endpointy API

Wszystkie endpointy wymagają uwierzytelnienia przez token JWT.

### `GET /api/habits`
Pobiera wszystkie nawyki należące do uwierzytelnionego użytkownika.

**Odpowiedź:**
```json
[
  {
    "id": 1,
    "name": "Pij wodę",
    "icon_slug": "water",
    "current_streak": 5,
    "last_completion_date": "2025-12-04",
    "last_completion_at": "2025-12-04T10:30:00Z",
    "created_at": "2025-12-01T08:00:00Z",
    "updated_at": "2025-12-04T10:30:00Z",
    "completed_today": true
  }
]
```

### `POST /api/habits`
Tworzy nowy nawyk dla uwierzytelnionego użytkownika.

**Żądanie:**
```json
{
  "name": "Czytaj książkę",
  "icon_slug": "book"
}
```

**Odpowiedź:** (201 Created)
```json
{
  "id": 2,
  "name": "Czytaj książkę",
  "icon_slug": "book",
  "current_streak": 0,
  "last_completion_date": null,
  "last_completion_at": null,
  "created_at": "2025-12-04T14:00:00Z",
  "updated_at": "2025-12-04T14:00:00Z",
  "completed_today": false
}
```

### `POST /api/habits/{id}/check`
Oznacza nawyk jako ukończony na dzisiaj. Aktualizuje serię odpowiednio:
- Jeśli ukończono wczoraj: seria += 1
- W przeciwnym razie: seria = 1

**Odpowiedź:**
```json
{
  "success": true,
  "streak": 6,
  "completed_today": true
}
```

Jeśli już ukończono dzisiaj:
```json
{
  "success": true,
  "streak": 6,
  "completed_today": true,
  "message": "Already completed today"
}
```

### `DELETE /api/habits/{id}/check`
Usuwa dzisiejsze ukończenie (odznacz). Przelicza serię na podstawie pozostałej historii ukończeń.

**Odpowiedź:**
```json
{
  "success": true,
  "streak": 5,
  "completed_today": false
}
```

## Wsparcie stref czasowych

Wszystkie endpointy akceptują opcjonalny parametr zapytania `timezone` (np. `?timezone=America/New_York`). Określa to, co oznacza "dzisiaj" dla użytkownika. Domyślnie UTC, jeśli nie podano.

Przykład:
```
GET /api/habits?timezone=Europe/Warsaw
POST /api/habits/1/check?timezone=America/Los_Angeles
```

## Logika serii

**Inkrementacja:** Przy zaznaczaniu nawyku:
1. Jeśli ostatnie ukończenie było wczoraj → zwiększ serię
2. Jeśli ostatnie ukończenie było wcześniej lub nigdy → zresetuj serię do 1

**Leniwy reset:** Przy pobieraniu nawyków (GET /api/habits):
- Jeśli `last_completion_date < wczoraj` i `current_streak > 0` → ustaw serię na 0

**Przeliczanie (przy odznaczaniu):**
- Znajdź nową datę ostatniego ukończenia
- Policz kolejne dni wstecz od tej daty

## Testowanie

Uruchom testy za pomocą:
```bash
python manage.py test habits
```

Obecne pokrycie testów obejmuje:
- Tworzenie nawyków
- Zaznaczanie/odznaczanie nawyków
- Obliczanie serii

## TODO

- [ ] **Migracja z SQLite do PostgreSQL**: Dla lepszego wsparcia współbieżności (klauzule ON CONFLICT, blokady na poziomie wierszy) przy skalowaniu do wielu równoczesnych użytkowników.
