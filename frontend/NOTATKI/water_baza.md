# Water Tracker

## 1. Założenia Architektoniczne
* Backend trzyma tylko surowe wartości w mililitrach.
* Frontend oblicza procenty `(current / goal) * 100` na żywo.
* Podział Danych: Oddzielamy cel użytkownika (konfiguracja) od historii picia (logi).

## 2. Baza Danych (Schema)

### Tabela A: `UserSettings`
Przechowuje domyślny cel użytkownika.
* `user_id` (PK/FK)
* `daily_goal` (Int) - domyślnie np. 2000 ml.

### Tabela B: `DailyWaterLog`
Przechowuje postępy z konkretnych dni.
* `id` (PK)
* `user_id` (FK)
* `date` (Date/String) - klucz unikalny pary [user_id, date].
* `current_amount` (Int) - ile wypił danego dnia.

---

## 3. Endpointy API

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `GET`  | `/water/today/` | Pobiera dzisiejszy `current_amount` oraz `daily_goal` | ✅ |
| `POST` | `/water/log/` | Aktualizuje (UPSERT) ilość wypitej wody dzisiaj | ✅ |
| `POST` | `/water/goal/` | Zmienia domyślny cel dzienny (nie wpływa na historię) | ✅ |
| `GET`  | `/water/history/` | Pobiera historię (np. ostatnie 7 dni) do wykresów | ✅ |

---

## 📖 Przykłady Request / Response

### 1. Pobranie danych na start (Dashboard)
Frontend pobiera to przy wejściu. Jeśli brak wpisu na dziś, backend zwraca `current_amount: 0`. Frontend sam dzieli `current` przez `goal`, by wyrysować wodę w butelce.

**Endpoint:** `GET /api/water/today/`

**Odpowiedź (sukces):**
```json
{
  "date": "2026-01-25",
  "current_amount": 1500,
  "daily_goal": 2000
}