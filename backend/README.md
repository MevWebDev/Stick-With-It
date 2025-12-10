# Backend API - Django REST

## 🚀 Szybki Start

Backend jest zdockeryzowany. Aby go uruchomić:

```bash
docker compose up --build
```

Serwer dostępny pod: `http://127.0.0.1:8000`
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

### 🔑 Zarządzanie Kontem (wymaga hasła)

| Metoda | Endpoint | Opis | Auth | Wymaga Hasła |
|--------|----------|------|------|--------------|
| `POST` | `/change-password/` | Zmiana hasła (wymaga obecnego hasła) | ✅ | ✅ |
| `POST` | `/change-email/` | Zmiana adresu email (wymaga hasła) | ✅ | ✅ |
| `POST` | `/change-username/` | Zmiana nazwy użytkownika (wymaga hasła) | ✅ | ✅ |
| `POST` | `/password-reset/request/` | Żądanie resetu hasła (wysyła email z tokenem) | ❌ | ❌ |
| `POST` | `/password-reset/confirm/` | Potwierdzenie resetu hasła (z tokenem z emaila) | ❌ | ❌ |

### 🖼️ Zarządzanie Avatarem

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `POST` | `/avatar/upload/` | Upload/aktualizacja avatara (max 2MB, JPG/PNG/GIF/WebP) | ✅ |
| `DELETE` | `/avatar/delete/` | Usunięcie avatara | ✅ |

### 🎯 Wyzwania (Challenges)

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `GET`  | `/daily-challenge/` | Pobierz dzisiejsze wyzwanie (lub wylosuj nowe) | ✅ |
| `POST` | `/complete-challenge/` | Oznacz dzisiejsze wyzwanie jako ukończone | ✅ |
| `POST` | `/blacklist/` | Dodaj/usuń kategorię z blacklisty | ✅ |

### ✅ Nawyki (Habits)
Szczegóły nawyków znajdują się w osobnym README, w dedykowanym mu folderze habits/

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `GET`  | `/habits` | Lista wszystkich dostępnych nawyków | ✅ |
| `GET`  | `/my-habits` | Lista subskrybowanych nawyków użytkownika | ✅ |
| `POST` | `/my-habits/{id}/check` | Oznacz nawyk jako wykonany dzisiaj | ✅ |
| `DELETE` | `/my-habits/{id}/check` | Cofnij wykonanie nawyku dzisiaj | ✅ |
| `POST` | `/habits/subscribe` | Zasubskrybuj nowy nawyk | ✅ |

### 🏆 Statystyki i Odznaki

| Metoda | Endpoint | Opis | Auth |
|--------|----------|------|------|
| `GET`  | `/stats/` | Statystyki użytkownika (punkty, streak) | ✅ |
| `GET`  | `/badges/` | Lista wszystkich odznak (zdobyte/niezdobyte) | ✅ |

---

## 📖 Przykłady Użycia Nowych Endpointów

### 1. Zmiana Hasła
**Endpoint:** `POST /api/auth/change-password/`  
**Wymaga:** JWT Token + Aktualne hasło

```json
{
  "current_password": "stareHaslo123",
  "new_password": "noweHaslo456"
}
```

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Hasło zostało zmienione pomyślnie"
}
```

**Odpowiedź (błąd):**
```json
{
  "success": false,
  "errors": {
    "current_password": ["Nieprawidłowe obecne hasło"]
  }
}
```

---

### 2. Zmiana Emaila
**Endpoint:** `POST /api/auth/change-email/`  
**Wymaga:** JWT Token + Hasło

```json
{
  "new_email": "nowy@email.com",
  "password": "mojeHaslo123"
}
```

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Email został zmieniony pomyślnie",
  "new_email": "nowy@email.com"
}
```

**Odpowiedź (błąd - email zajęty):**
```json
{
  "success": false,
  "errors": {
    "new_email": ["Ten adres email jest już zajęty"]
  }
}
```

---

### 3. Zmiana Nazwy Użytkownika
**Endpoint:** `POST /api/auth/change-username/`  
**Wymaga:** JWT Token + Hasło

```json
{
  "new_username": "nowaNazwa",
  "password": "mojeHaslo123"
}
```

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Nazwa użytkownika została zmieniona pomyślnie",
  "new_username": "nowaNazwa"
}
```

**Odpowiedź (błąd - nazwa zajęta):**
```json
{
  "success": false,
  "errors": {
    "new_username": ["Ta nazwa użytkownika jest już zajęta"]
  }
}
```

---

### 4. Reset Hasła - Żądanie (Wysyłka Emaila)
**Endpoint:** `POST /api/auth/password-reset/request/`  
**Wymaga:** Nic (endpoint publiczny)

```json
{
  "email": "user@example.com"
}
```

**Odpowiedź (zawsze sukces - bezpieczeństwo):**
```json
{
  "success": true,
  "message": "Jeśli podany email istnieje w systemie, wysłaliśmy link do resetu hasła"
}
```

**Uwaga:** Dla bezpieczeństwa endpoint zawsze zwraca sukces, nawet jeśli email nie istnieje w systemie. To zapobiega sprawdzaniu czy dany email jest zarejestrowany.

---

### 5. Reset Hasła - Potwierdzenie (Z Tokenem)
**Endpoint:** `POST /api/auth/password-reset/confirm/`  
**Wymaga:** Token z emaila

```json
{
  "token": "abc123xyz789_token_z_emaila",
  "new_password": "noweSuperbezpieczneHaslo123"
}
```

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Hasło zostało zresetowane pomyślnie"
}
```

**Odpowiedź (błąd - wygasły token):**
```json
{
  "success": false,
  "error": "Nieprawidłowy lub wygasły token resetu hasła"
}
```

**Uwaga:** Token resetu hasła jest ważny przez 1 godzinę od wygenerowania.

---

### 6. Upload Avatara
**Endpoint:** `POST /api/auth/avatar/upload/`  
**Wymaga:** JWT Token + Multipart Form Data  
**Content-Type:** `multipart/form-data`

**Walidacja:**
- Max rozmiar: **2MB**
- Formaty: **JPEG, PNG, GIF, WebP**
- Min wymiary: **100x100 px**
- Max wymiary: **4000x4000 px**
- Automatyczna kompresja do **800x800 px** (zachowuje proporcje)
- Konwersja do **JPEG** (quality 85%)

**Request (Form Data):**
```
avatar: [plik obrazu]
```

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "avatar_url": "http://127.0.0.1:8000/media/avatars/2025/12/1_1702234567.jpg"
}
```

**Odpowiedź (błąd - zbyt duży plik):**
```json
{
  "success": false,
  "errors": {
    "avatar": ["Avatar file size cannot exceed 2MB. Current size: 3.45MB"]
  }
}
```

**Odpowiedź (błąd - zły format):**
```json
{
  "success": false,
  "errors": {
    "avatar": ["Unsupported file type: application/pdf. Allowed: JPEG, PNG, GIF, WebP"]
  }
}
```

**Uwaga:** Upload nowego avatara automatycznie usuwa poprzedni.

---

### 7. Usunięcie Avatara
**Endpoint:** `DELETE /api/auth/avatar/delete/`  
**Wymaga:** JWT Token

**Odpowiedź (sukces):**
```json
{
  "success": true,
  "message": "Avatar deleted successfully"
}
```

**Odpowiedź (błąd - brak avatara):**
```json
{
  "success": false,
  "error": "No avatar to delete"
}
```

---

### 8. Informacje o Użytkowniku (z avatarem)
**Endpoint:** `GET /api/auth/me/`  
**Wymaga:** JWT Token

**Odpowiedź:**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "avatar_url": "http://127.0.0.1:8000/media/avatars/2025/12/1_1702234567.jpg"
}
```

**Uwaga:** Jeśli użytkownik nie ma avatara, `avatar_url` będzie `null`. Frontend może wtedy wyświetlić inicjały użytkownika.
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
- `avatar` - ImageField (opcjonalne, max 2MB, auto-resize do 800x800)
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

### `Habit` (App: habits)
Słownik dostępnych nawyków.
- `name`, `icon_slug`, `metadata`

### `UserHabit` (App: habits)
Subskrypcja użytkownika do nawyku.
- `user`, `habit`, `current_streak`, `last_completion_date`

### `HabitCompletion` (App: habits)
Logi wykonania nawyku.
- `user_habit`, `completion_date`

---

## ⚠️ Status Projektu (TODO)

### 🚧 Do Zrobienia
- [ ] **Migracja z SQLite na PostgreSQL**: Obecnie projekt używa SQLite. Dla lepszej obsługi współbieżności (szczególnie klauzule `ON CONFLICT` i blokowanie na poziomie wiersza), musimy zmigrować do PostgreSQL. Jest to kluczowe dla skalowania funkcji śledzenia nawyków przy wielu użytkownikach.

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
- [x] **Zmiana hasła** - endpoint z walidacją obecnego hasła
- [x] **Zmiana emaila** - endpoint z walidacją hasła
- [x] **Zmiana nazwy użytkownika** - endpoint z walidacją hasła
- [x] **Reset hasła przez email** - system tokenów i wysyłka emaili
- [x] **System avatarów** - upload, usuwanie, walidacja (rozmiar, format, wymiary), auto-kompresja

### 🟡 Do zrobienia (Next Steps)
- [ ] **Walidacja:** Sprawdzanie czy kategoria istnieje przy dodawaniu do blacklisty
- [ ] **Limity:** Zwiększenie limitów znaków dla tytułów wyzwań (obecnie 20 znaków)
- [ ] **Historia:** Endpoint `/challenge-history/` (ostatnie 20 wyzwań)
- [ ] **Testy:** Rozszerzenie testów jednostkowych o nowe funkcjonalności challenges
- [ ] **Konfiguracja email:** Ustawienie SMTP w production dla wysyłki emaili resetujących hasło

### 🔜 Roadmap
- [ ] Weryfikacja adresu email
- [ ] Migracja na PostgreSQL (produkcja)
- [ ] Powiadomienia WebSocket o zdobytych odznakach
