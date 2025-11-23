# Backend API - Django REST

## Uruchomienie Backendu
Backend jest aktualnie zdockeryzowany, a więc aby go uruchomić wystarczy wpisać  ```docker compose up --build```

## Endpointy API

Bazowy URL: `/api/auth/`

### 1. Rejestracja

**POST** `/api/auth/register/`

Tworzy nowego użytkownika i zwraca tokeny JWT.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "tokens": {
    "access": "treść tokenu",
    "refresh": "treść tokenu"
  }
}
```

**Błędy:**
- `400` - Brak wymaganych pól lub użytkownik już istnieje
---
### 2. Logowanie

**POST** `/api/auth/login/`

Loguje użytkownika i zwraca tokeny JWT.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "tokens": {
    "access": "treść tokenu",
    "refresh": "treść tokenu"
  }
}
```

**Błędy:**
- `401` - Nieprawidłowe dane logowania

---

### 3. Wylogowanie

**POST** `/api/auth/logout/`

Dodaje refresh token do blacklisty (unieważnia token).

**Request Body:**
```json
{
  "refresh": "token"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

**Błędy:**
- `400` - Nieprawidłowy token

---

### 4. Informacje o użytkowniku

**GET** `/api/auth/me/`

Zwraca dane zalogowanego użytkownika. **Wymaga autoryzacji JWT.**

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com"
}
```

**Błędy:**
- `401` - Brak tokenu, token wygasły lub nieprawidłowy

---

### 5. Odświeżanie tokenu

**POST** `/api/auth/refresh/`

Odświeża access token używając refresh tokena.

**Request Body:**
```json
{
  "refresh": "refresh_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "access": "nowy_access_token"
}
```

**Błędy:**
- `400` - Refresh token jest wymagany
- `401` - Nieprawidłowy lub wygasły refresh token

---

## 🔐 Autentykacja JWT

### Jak działa?

1. **Rejestracja/Logowanie** → Otrzymujesz 2 tokeny:
   - `access` - token dostępu (ważny 60 min)
   - `refresh` - token odświeżania (ważny 7 dni)

2. **Każdy chroniony request** → Dodaj header:
   ```
   Authorization: Bearer <access_token>
   ```

3. **Access token wygasł?** → Użyj endpointu `/api/auth/refresh/` z refresh tokenem do uzyskania nowego access tokena

4. **Wylogowanie** → Refresh token trafia na blacklistę (nie można go już użyć)

### Konfiguracja JWT

```python
# settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

---

## 🌐 CORS (Cross-Origin Resource Sharing)

Backend jest skonfigurowany do przyjmowania requestów z frontendu Next.js.

**Dozwolone Origins:**
- `http://localhost:3000` (Next.js dev server)
- `http://127.0.0.1:3000`

**Ustawienia:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

---

## 🧪 Testowanie API

### Przykład z cURL:

**Rejestracja:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

**Logowanie:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "securepassword123"
  }'
```

**Sprawdź profil (z tokenem):**
```bash
curl http://127.0.0.1:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Odśwież token:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

---
## ⚠️ TODO

### ✅ Zakończone:
- [x] Testy jednostkowe (48 testów)
  - [x] Rejestracja użytkownika (poprawne dane)
  - [x] Rejestracja użytkownika (duplikat username/email)
  - [x] Logowanie (poprawne dane)
  - [x] Logowanie (błędne hasło)
  - [x] Endpoint `/me/` bez tokena
  - [x] Endpoint `/me/` z prawidłowym tokenem
  - [x] Endpoint `/me/` z wygasłym tokenem
  - [x] Wylogowanie (blacklisting tokena)
- [x] Refresh token endpoint (12 testów)
- [x] CORS configuration dla frontendu

### kroki w ramach tego brancha:
- [X] Rozwój bazy danych użytkownika, dodanie tabeli z challenges {title, description, category, difficulty}
- [x] Dodanie osobnej tabeli dla statystyk użytkownika, a więc listę jego postanowień wraz z ich streakiem, streak i ilość wypełniowych daily challengy, listę zblacklistowanych kategorii, etc. 
- [ ] Dodanie endpointu API umożliwiającego komunikację z bazą i losowanie challengy na dany dzień
- [ ] Dodanie odznak 
- [ ] Obsługa AdminPanel z łatwą możliwością dodawania nowych elementów do bazy

### 🔜 Następne kroki:
- [ ] Reset hasła
- [ ] Weryfikacja email
- [ ] Migracja z SQLite do PostgreSQL

