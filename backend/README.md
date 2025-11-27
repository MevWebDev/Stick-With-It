# Backend API - Django REST

## 🚀 Szybki Start

Backend jest zdockeryzowany. Aby go uruchomić:

```bash
docker compose up --build
```

Serwer dostępny pod: `http://127.0.0.1:8000`

### 🌱 Seeding Bazy Danych (Wypełnianie danymi)

Aby wypełnić bazę danych przykładowymi wyzwaniami (Health, Productivity, Education, Mindfulness), użyj komendy:

```bash
# Jeśli używasz Dockera:
docker compose exec backend python manage.py seed_challenges

# Jeśli uruchamiasz lokalnie:
python3 manage.py seed_challenges
```

---

## 📚 Dokumentacja API

Bazowy URL: `/api/auth/`

### 🔐 Autentykacja (JWT)

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `POST` | `/register/` | Rejestracja (blokada emaila jako nicku) | ❌ |
| `POST` | `/check-email/` | Sprawdzenie dostępności emaila | ❌ |
| `POST` | `/login/` | Logowanie (nick lub email) | ❌ |
| `POST` | `/logout/` | Wylogowanie (blacklist refresh token) | ❌ |
| `POST` | `/refresh/` | Odświeżenie access tokena | ❌ |
| `GET`  | `/me/` | Dane zalogowanego użytkownika | ✅ |

### 🎯 Wyzwania (Challenges)

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `GET`  | `/daily-challenge/` | Pobierz dzisiejsze wyzwanie (lub wylosuj nowe) | ✅ |
| `POST` | `/complete-challenge/` | Oznacz dzisiejsze wyzwanie jako ukończone | ✅ |
| `POST` | `/blacklist/` | Dodaj/usuń kategorię z blacklisty | ✅ |

### 🏆 Statystyki i Odznaki

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `GET`  | `/stats/` | Statystyki użytkownika (punkty, streak) | ✅ |
| `GET`  | `/badges/` | Lista wszystkich odznak (zdobyte/niezdobyte) | ✅ |

---

## 🛠️ Szczegóły Implementacji

### Walidacja i Logowanie (QoL)
- **Logowanie:** Użytkownik może zalogować się podając swój **nick** lub **adres email**.
- **Rejestracja:** System blokuje możliwość ustawienia poprawnego adresu email jako nazwy użytkownika (nicku).
- **Weryfikacja:** Dostępny endpoint do sprawdzania w czasie rzeczywistym czy email jest zajęty.

### System Streaku
- **Zasada:** Ukończenie wyzwania codziennie zwiększa `current_streak`.
- **Reset:** Brak aktywności przez >1 dzień resetuje streak do 1.
- **Rekord:** `longest_streak` przechowuje najlepszy wynik.

### Punktacja
- Poziom 1 (Łatwy) = **1 pkt**
- Poziom 2 (Średni) = **2 pkt**
- Poziom 3 (Trudny) = **3 pkt**

### System Odznak (Badges)
Odznaki są przyznawane automatycznie po spełnieniu warunków (np. "First Steps" za pierwsze wyzwanie).

---

## 📊 Modele Bazy Danych

### `Challenge`
Wyzwania dostępne w systemie.
- `title`, `description`, `category`, `difficulty` (1-3)

### `UserStats`
Statystyki użytkownika (OneToOne z User).
- `points`, `current_streak`, `longest_streak`
- `total_completed`, `level1_completed`, `level2_completed`, `level3_completed`
- `blacklisted_categories` (JSON)
- `earned_badges` (ManyToMany)

### `DailyChallenge`
Przypisanie wyzwania do użytkownika na dany dzień.
- `user`, `challenge`, `assigned_date`, `completed`

### `Badges`
Definicje odznak.
- `key`, `title`, `description`, `icon`, `rarity`

---

## ⚠️ Status Projektu (TODO)

### ✅ Zakończone
- [x] Pełna autentykacja JWT (Register, Login, Logout, Refresh)
- [x] Konfiguracja CORS dla frontendu Next.js
- [x] Modele bazy danych (Challenges, Stats, Badges)
- [x] Logika losowania wyzwań (z uwzględnieniem blacklisty)
- [x] System punktacji i streaków
- [x] Automatyczne przyznawanie odznak
- [x] Panel Administratora (Django Admin)
- [x] Optymalizacja zapytań do bazy (`select_related`, `order_by("?")`)
- [x] Seed Data: Skrypt do automatycznego wypełniania bazy przykładowymi wyzwaniami (`seed_challenges`)

### 🟡 Do zrobienia (Next Steps)
- [ ] **Walidacja:** Sprawdzanie czy kategoria istnieje przy dodawaniu do blacklisty
- [ ] **Limity:** Zwiększenie limitów znaków dla tytułów wyzwań (obecnie 20 znaków)
- [ ] **Historia:** Endpoint `/challenge-history/` (ostatnie 20 wyzwań)
- [ ] **Testy:** Rozszerzenie testów jednostkowych o nowe funkcjonalności challenges

### 🔜 Roadmap
- [ ] Reset hasła (email)
- [ ] Weryfikacja adresu email
- [ ] Migracja na PostgreSQL (produkcja)
- [ ] Powiadomienia WebSocket o zdobytych odznakach
