# System Doświadczenia (XP) i Poziomów (Leveling)

Dokumentacja techniczna systemu grywalizacji wprowadzonego w backendzie.

## 1. Koncepcja Ogólna

System opiera się na **liniowej progresji z przyrostem** (Linear Progression with Increment). Użytkownik zdobywa punkty doświadczenia (XP) za aktywności w aplikacji (Nawyki, Pomodoro, Wyzwania). Po uzbieraniu odpowiedniej ilości XP, poziom użytkownika wzrasta.

### Formuła Levelowania
Wymagany EXP do awansu z poziomu $L$ do $L+1$:

$$ D_L = 150 + (L-1) \cdot 25 $$

*   **Poziom 1 -> 2**: 150 XP
*   **Poziom 2 -> 3**: 175 XP
*   **Poziom 3 -> 4**: 200 XP
*   ...

## 2. Źródła XP i Limity

| Źródło | XP | Mnożniki | Limity |
| :--- | :--- | :--- | :--- |
| **Habit (Nawyk)** | **10 XP** | Brak | 1x na nawyk / dzień (wymuszone przez logikę bazy) |
| **Pomodoro** | **10 XP** | Brak | **Max 50 XP / dzień** (5 sesji) |
| **Daily Challenge** | Zmienne | **Streak Multiplier** | 1x na dzień |

### Szczegóły Daily Challenge
XP za wyzwanie zależy od poziomu trudności i aktualnego streaku (serii dni).

**Baza XP:**
*   Easy (1): **20 XP**
*   Medium (2): **40 XP**
*   Hard (3): **80 XP**

**Mnożnik:**
$$ Multiplier = 1 + (Streak \cdot 0.01) $$
*   Przykład: Streak 5 dni = mnożnik 1.05x (+5%)
*   Przykład: Streak 100 dni = mnożnik 2.00x (+100%)

## 3. Zmiany w Bazie Danych

### Tabela `accounts_userstats`
Dodano nowe kolumny do śledzenia postępu:
*   `level` (Integer, default: 1) - Aktualny poziom.
*   `current_exp` (Integer, default: 0) - XP zdobyte w *obecnym* poziomie.
*   `total_exp` (Integer, default: 0) - Suma XP od początku istnienia konta (do rankingów).

### Nowa Tabela `accounts_xplog`
Służy do audytu i wymuszania limitów dziennych (np. dla Pomodoro).
*   `user` (FK)
*   `date` (Date)
*   `source` (String: 'habit', 'pomodoro', 'challenge')
*   `amount` (Integer)

## 4. Endpointy API

### A. Profil Użytkownika (Statystyki)
`GET /api/accounts/stats/`

Zwraca pełne informacje o poziomie, potrzebne do paska postępu.

**Response:**
```json
{
    "success": true,
    "stats": {
        "level": 5,
        "current_exp": 45,          // Ile ma teraz
        "exp_to_next_level": 250,   // Ile potrzeba łącznie na ten poziom (cel paska)
        "total_exp": 1250,
        "points": 150,              // Stare punkty (legacy)
        ...
    }
}
```

### B. Ukończenie Pomodoro (Nowy Endpoint)
`POST /api/accounts/pomodoro/complete/`

Wymaga autoryzacji. Rejestruje sesję i przyznaje XP (jeśli limit nie został osiągnięty).

**Response:**
```json
{
    "success": true,
    "xp_earned": 10,
    "level_info": {
        "leveled_up": false,
        "new_level": 5,
        "current_exp": 55,
        "xp_to_next": 250
    }
}
```

### C. Ukończenie Nawyku
`POST /api/my-habits/{id}/check`

Teraz zwraca również informację o zdobytym XP.

**Response:**
```json
{
    "success": true,
    "streak": 12,
    "completed_today": true,
    "xp_earned": 10,
    "level_info": { ... }
}
```

### D. Ukończenie Wyzwania
`POST /api/accounts/complete-challenge/`

Zwraca XP obliczone z uwzględnieniem mnożnika.

**Response:**
```json
{
    "success": true,
    "xp_earned": 42,    // Np. 40 base * 1.05 streak
    "level_info": { ... }
}
```

## 5. Logika Backendowa (Services)

Cała logika znajduje się w `backend/accounts/services.py` w klasie `XpService`.
*   `award_xp(user, amount, source)`: Główna metoda. Sprawdza limity, dodaje XP, obsługuje awans na kolejny poziom (w pętli, jeśli użytkownik zdobył tyle XP, że awansował o kilka poziomów naraz).
*   `get_xp_required_for_next_level(level)`: Oblicza próg XP dla danego poziomu.

## 6. Instrukcja dla Frontendu

1.  **Pasek Postępu (Profile Page)**:
    *   Wartość: `stats.current_exp`
    *   Max: `stats.exp_to_next_level`
    *   Label: `Lvl {stats.level}`

2.  **Pomodoro Timer**:
    *   Po zakończeniu odliczania (tryb Focus), wyślij `POST` na `/api/accounts/pomodoro/complete/`.
    *   Wyświetl powiadomienie (Toast): `+10 XP` (lub `+0 XP (Limit osiągnięty)` jeśli `xp_earned` == 0).

3.  **Habits / Challenges**:
    *   Po sukcesie, sprawdź pole `level_info.leveled_up`. Jeśli `true`, wyświetl modal/animację "LEVEL UP!".
