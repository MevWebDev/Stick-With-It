# Jak Uruchomić Testy

## Testy Streak (Nowe)

Dodano testy sprawdzające poprawność działania systemu streak dla Daily Challenge.

### Uruchamianie Testów

#### 1. Wszystkie testy w aplikacji `accounts`:
```bash
cd backend
docker compose exec web python3 manage.py test accounts
```

#### 2. Tylko testy streak:
```bash
docker compose exec web python3 manage.py test accounts.tests.StreakTestCase
```

#### 3. Konkretny test:
```bash
docker compose exec web python3 manage.py test accounts.tests.StreakTestCase.test_streak_progression_over_5_days
```

### Testy Streak - Co Sprawdzają?

1. **`test_streak_progression_over_5_days`**
   - Symuluje ukończenie challenge przez 5 dni z rzędu
   - Sprawdza czy streak rośnie: 1 → 2 → 3 → 4 → 5

2. **`test_streak_resets_after_gap`**
   - Symuluje przerwę (5 dni bez ukończenia)
   - Sprawdza czy streak resetuje się do 1

3. **`test_streak_continues_after_yesterday`**
   - Sprawdza czy streak kontynuuje się gdy wczoraj było ukończone
   - Sprawdza wzrost: 2 → 3

### Przykładowy Output

```
Creating test database for alias 'default'...
System check identified no issues (0 silenced).
✅ Test passed: Streak correctly progresses from 1 to 5
.✅ Test passed: Streak resets to 1 after gap
.✅ Test passed: Streak continues after yesterday
.
----------------------------------------------------------------------
Ran 3 tests in 0.245s

OK
```

### Debugowanie Testów

Jeśli test się nie powiedzie, zobaczysz szczegółowy komunikat:
```
AssertionError: Dzień 3: Oczekiwano streak=3, otrzymano 1
```

To oznacza problem z logiką streak - wtedy trzeba sprawdzić `complete_challenge` w `views.py`.
