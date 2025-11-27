Specyfikacja Techniczna: Backend Habit Trackera
1. Założenia Ogólne (Authentication)
Identyfikacja Użytkownika: Nie przesyłamy userId w URL ani w body JSON. Backend musi pobierać ID aktualnego użytkownika z tokena autoryzacyjnego (np. JWT w nagłówku Authorization) lub sesji.

Strefy czasowe: Wszystkie daty (YYYY-MM-DD) operują na strefie czasowej użytkownika (frontend może wysyłać parametr ?timezone= lub backend zakłada UTC - do ustalenia).

2. Struktura Bazy Danych (Schema)
Potrzebujemy 3 tabel relacyjnych.

Tabela A: habits (Słownik)
Globalna lista definicji nawyków dostępnych w aplikacji.

id (Primary Key, Auto Increment)

name (String, np. "Pij wodę")

icon_slug (String, np. "droplet")

Tabela B: user_habits (Subskrypcje)
Stan konkretnego nawyku dla konkretnego użytkownika. To są "kafelki" na dashboardzie.

id (Primary Key)

user_id (Foreign Key -> Users)

habit_id (Foreign Key -> Habits)

current_streak (Integer, Default: 0) – Cache aktualnej serii.

last_completion_date (Date, Nullable) – Data ostatniego zaliczenia. Kluczowe do logiki "Lazy Reset".

Tabela C: habit_completions (Logi)
Historia wykonań.

id (Primary Key)

user_habit_id (Foreign Key -> UserHabits)

completion_date (Date)

Constraint: Unikalność pary (user_habit_id, completion_date) – nie można zaliczyć tego samego nawyku 2 razy w jeden dzień.

3. Endpointy API (REST)
A. Pobierz Dashboard (Główny widok)
Zwraca listę subskrybowanych nawyków wraz ze stanem na dzisiaj.

Metoda: GET

URL: /api/my-habits

Nagłówki: Authorization: Bearer <token>

Logika Backendowa (Critical Path):

Pobierz wszystkie rekordy z user_habits dla tego usera.

Lazy Reset Logic: Dla każdego nawyku sprawdź last_completion_date:

Jeśli data jest starsza niż "wczoraj" (np. przedwczoraj) -> zaktualizuj w bazie current_streak = 0.

Completed Today Logic: Sprawdź w tabeli habit_completions czy istnieje wpis z datą CURRENT_DATE.

Zwróć JSON.

Response JSON:

JSON

[
  {
    "id": 101,              // ID subskrypcji (user_habit_id)
    "name": "Pij Wodę",     // Z tabeli habits
    "icon": "droplet",      // Z tabeli habits
    "streak": 5,            // Z tabeli user_habits (po ew. wyzerowaniu)
    "completedToday": true  // Boolean wyliczony na podstawie tabeli habit_completions
  },
  {
    "id": 102,
    "name": "Bieganie",
    "icon": "run",
    "streak": 0,
    "completedToday": false
  }
]
B. Zaznacz jako Zrobione (Check)
Użytkownik klika w szary kafelek.

Metoda: POST

URL: /api/my-habits/{id}/check

{id} to ID subskrypcji (user_habit_id), np. 101

Logika Backendowa:

Sprawdź, czy nawyk nie jest już zrobiony dzisiaj (idempotentność).

Insert: Dodaj rekord do habit_completions z dzisiejszą datą.

Streak Update:

Pobierz last_completion_date z user_habits.

Jeśli data to "wczoraj" -> current_streak += 1.

Jeśli data starsza lub null -> current_streak = 1.

Meta Update: Zaktualizuj w user_habits: last_completion_date = TODAY.

Zwróć nowy stan (nowy streak).

C. Cofnij Zaznaczenie (Uncheck)
Użytkownik klika w świecący kafelek (anuluje).

Metoda: DELETE

URL: /api/my-habits/{id}/check

Logika Backendowa:

Delete: Usuń rekord z habit_completions dla dzisiejszej daty.

Restore Last Date: Znajdź nową ostatnią datę: SELECT MAX(completion_date) FROM habit_completions WHERE user_habit_id = {id}.

Meta Update:

Zaktualizuj user_habits.last_completion_date na datę znalezioną wyżej (lub NULL).

Zaktualizuj current_streak (zmniejsz o 1 lub przelicz na podstawie nowej daty).

D. Dodaj Nowy Nawyk (Subskrypcja)
Użytkownik wybiera nawyk z listy, żeby dodać go do dashboardu.

Metoda: POST

URL: /api/habits/subscribe

Body:

JSON

{
  "habit_id": 5  // ID z globalnego słownika
}
Logika: Tworzy nowy wpis w user_habits z streak: 0.