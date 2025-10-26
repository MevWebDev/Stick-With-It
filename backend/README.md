# Backend API - Django REST



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

## 🔐 Autentykacja JWT

### Jak działa?

1. **Rejestracja/Logowanie** → Otrzymujesz 2 tokeny:
   - `access` - token dostępu (ważny 60 min)
   - `refresh` - token odświeżania (ważny 7 dni)

2. **Każdy chroniony request** → Dodaj header:
   ```
   Authorization: Bearer <access_token>
   ```

3. **Access token wygasł?** → Użyj refresh tokena do uzyskania nowego access tokena (endpoint do dodania)

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

---
## ⚠️ TODO

### 🔴 PILNE: Testy jednostkowe

**Co trzeba przetestować:**
- [ ] Rejestracja użytkownika (poprawne dane)
- [ ] Rejestracja użytkownika (duplikat username/email)
- [ ] Logowanie (poprawne dane)
- [ ] Logowanie (błędne hasło)
- [ ] Endpoint `/me/` bez tokena
- [ ] Endpoint `/me/` z prawidłowym tokenem
- [ ] Endpoint `/me/` z wygasłym tokenem
- [ ] Wylogowanie (blacklisting tokena)

### Rozszerzenia do dodanie w pierwszej kolejności:
- [ ] Refresh token endpoint
- [ ] Reset hasła
- [ ] Weryfikacja email
- [ ] CORS configuration dla frontendu

### Sidenote
 Na razie jako baza danych będzie służył SQLite, później planuję migrację do Postgresa
