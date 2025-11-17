# Notatki - Prototyp Habit Tracker

## Co zrobilem

- Stworzyliśmy klikalny prototyp UI z "fałszywymi" danymi.
- Działa dodawanie nawyków przez modal i podstawowa interakcja (klikanie zwiększa `streak`).
- Mamy gotowy "blueprint" pod bazę danych (`myTrackedHabits` i `allAvailableHabits`).

---

## Do Zrobienia i Przemyślenia (Next Steps)

### 1. UI/UX i Animacje

- **Dopracować wygląd modala** (obecny jest sredni sorson).
- Dodać subtelne **efekty `hover`** na kartach.
- **Animacja "Zaliczenia"**: Po kliknięciu nawyku **dodać animację płonącego ognia**, żeby pokazać, że jest "w serii".

### 2. Logika Trackowania

- Zaimplementować logikę **"zaliczenia na dziś"** - jedno kliknięcie dziennie zwiększa `streak`, kolejne może odznaczać. Stan musi się resetować o północy.

---

## Plan na Bazę Danych (Wersja Skrócona) do przeanalizowania z Specialistą Ds. Baz Danych Jankiem

Potrzebujemy 3 głównych tabel, aby przenieść logikę na backend.

1.  **`Habits`**: Globalna lista wszystkich nawyków (np. `id`, `name`, `icon_name`).
2.  **`UserHabits`**: Tabela łącząca, który użytkownik śledzi który nawyk (`user_id`, `habit_id`, `current_streak`).
3.  **`HabitCompletions`**: **NAJWAŻNIEJSZA** - dziennik zaliczeń. Każde kliknięcie tworzy tu wpis (`user_habit_id`, `completion_date`).

**Kluczowa logika musi być na backendzie:** `streak` jest obliczany na podstawie ciągłości dat w tabeli `HabitCompletions`. Frontend ma tylko wysyłać żądania i wyświetlać dane.
