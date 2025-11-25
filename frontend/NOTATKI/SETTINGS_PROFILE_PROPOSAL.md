# 📋 Propozycja funkcjonalności – Settings i Profile

## 🎯 Cel
Przedstawienie zespołowi, co będzie dostępne po kliknięciu w przyciski **Settings** (Ustawienia) oraz **Profile** (Profil) w naszej aplikacji. Dokument ma służyć jako punkt wyjścia do dyskusji, planowania i podziału zadań.

---

## 1️⃣ Settings (Ustawienia)

| Kategoria | Opis | Przykładowe pola / przełączniki |
|-----------|------|---------------------------------|
| **Konto** | Zarządzanie danymi konta i bezpieczeństwem. | - **Wyloguj** (przycisk)  \n- **Zmień hasło** (przejście do formularza)  \n- **Dwuskładnikowe uwierzytelnianie** (toggle) |
| **Wygląd** | Personalizacja wyglądu aplikacji. | - **Motyw (Theme)** – Light / Dark / System (toggle lub radio)  \n- **Rozmiar czcionki** – Small / Medium / Large (select)  \n- **Kolor akcentu** – wybór z palety (opcjonalnie) |
| **Dźwięki / Muzyka** | Kontrola odtwarzania dźwięków w aplikacji. | - **Włącz/wyłącz muzykę w tle** (toggle)  \n- **Dźwięki powiadomień** (toggle) |
| **Powiadomienia** | Ustawienia, które powiadomienia mają być wysyłane. | - **Email** (toggle)  \n- **Push (przeglądarka / mobile)** (toggle)  \n- **Częstotliwość** – natychmiast / codziennie / tygodniowo (select) |
| **Język** | Wybór języka interfejsu. | - **Język aplikacji** (select – np. PL, EN, DE) |
| **Prywatność** | Kontrola danych udostępnianych innym użytkownikom. | - **Widoczność profilu** – publiczny / prywatny (toggle)  \n- **Udostępnianie statystyk** (toggle) |
| **Bezpieczeństwo** | Opcje związane z sesją i dostępem. | - **Automatyczne wylogowanie po** – 15 min / 30 min / 1 h (select)  \n- **Zarządzanie sesjami** – lista aktywnych sesji z możliwością ich zakończenia (lista + przycisk „Zakończ”) |
| **Usuwanie konta** | Trwałe usunięcie konta. | - **Przycisk „Usuń konto”** (czerwony, z potwierdzeniem modalnym) |

### Dodatkowe uwagi
- **Zapis** – wszystkie zmiany są zapisywane przyciskiem **Zapisz** lub automatycznie po zmianie (debounce + API `PUT /api/settings/`).
- **Walidacja** – przy zmianie hasła lub usuwaniu konta wymagana jest weryfikacja hasła.
- **Responsywność** – karty ustawień układają się w jedną kolumnę na mobile, w dwie kolumny na szerokich ekranach.

---

## 2️⃣ Profile (Profil)

| Pole / Sekcja | Opis | Typ danych | Potencjalne akcje |
|---------------|------|------------|-------------------|
| **Avatar** | Zdjęcie profilowe | `File` (obraz) | Upload / podgląd, przycinanie |
| **Nazwa użytkownika** | Unikalna nazwa wyświetlana | `string` | Edycja (inline) |
| **Pełne imię i nazwisko** | Opcjonalne | `string` | Edycja |
| **Bio / opis** | Krótki opis o sobie | `string` (textarea) | Edycja |
| **Poziom (Level)** | System progresji (np. XP) | `number` (read‑only) | Wyświetlanie, ewentualny pasek postępu |
| **Odznaki (Badges)** | Lista zdobytych odznak | `Array<Badge>` (ikony + tooltip) | Wyświetlanie, możliwość kliknięcia po szczegóły |
| **Statystyki** | Liczba ukończonych wyzwań, liczba sesji pomodoro, itp. | `object` (read‑only) | Prezentacja w formie kafelków |
| **Preferencje wyświetlania** | Czy wyświetlać poziom/odznaki publicznie | toggle | Zmiana widoczności |
| **Linki społecznościowe** | URL do profili (GitHub, LinkedIn, itp.) | `string` (optional) | Edycja |
| **Data rejestracji** | Informacja tylko do odczytu | `date` | Wyświetlanie |
| **Ustawienia prywatności profilu** | Czy inni mogą widzieć Twoje statystyki, odznaki | toggle | Zmiana |

### Przykładowa struktura UI
```
<ProfilePage>
  ├─ <ProfileHeader> (Avatar + Nazwa + Edytuj przycisk)
  ├─ <ProfileInfoCard>
  │    ├─ Bio
  │    ├─ Pełne imię i nazwisko
  │    └─ Linki społecznościowe
  ├─ <ProgressCard>
  │    ├─ Poziom + pasek XP
  │    └─ Statystyki (wyzwania, pomodoro, itp.)
  ├─ <BadgesCard>
  │    └─ Siatka odznak (hover → tooltip)
  └─ <SaveButton> (lub automatyczny zapis)
</ProfilePage>
```

### Dodatkowe uwagi
- **Avatar** jest przechowywany w backendzie (np. w `/media/avatars/`) i zwracany jako URL w `UserProfileSerializer`.
- **Poziom i odznaki** są wyliczane po stronie serwera na podstawie danych z tabel `ChallengeHistory` i `PomodoroSession`.
- **Edycja** odbywa się poprzez `PUT /api/profile/` – frontend wysyła `FormData` (dla avatar) oraz JSON dla pozostałych pól.
- **Walidacja**: nazwa użytkownika musi być unikalna, linki muszą być poprawnym URL, rozmiar avatar ≤ 2 MB.

---

## 3️⃣ Podsumowanie dla zespołu

| Przycisk | Co się otwiera | Najważniejsze elementy |
|----------|----------------|------------------------|
| **Settings** | Strona z kilkoma sekcjami (Konto, Wygląd, Dźwięki, Powiadomienia, Język, Prywatność, Bezpieczeństwo, Usuwanie konta). | - Logout <br> - Toggle muzyki <br> - Theme (Light/Dark) <br> - Powiadomienia (email/push) <br> - Dwuskładnikowe uwierzytelnianie <br> - Automatyczne wylogowanie <br> - Usuwanie konta |
| **Profile** | Strona profilu użytkownika z danymi osobistymi i statystykami. | - Avatar + edycja <br> - Nazwa, bio, linki <br> - Poziom (XP) <br> - Odznaki (badges) <br> - Statystyki (ukończone wyzwania, sesje pomodoro) <br> - Ustawienia prywatności profilu |

Te elementy zapewnią **pełną kontrolę** nad kontem oraz **przejrzysty podgląd** postępów i osiągnięć użytkownika, jednocześnie zachowując spójny, nowoczesny design (glass‑morphism, mobile‑first) używany w reszcie aplikacji.

---

### Co dalej?
1. **Zatwierdzić listę funkcji** – ustalić priorytety (np. najpierw Logout, Theme, Avatar).
2. **Rozdzielić zadania** – UI (komponenty kart, toggle), API (endpointy `/api/settings/` i `/api/profile/`), backend (serializery, modele).
3. **Ustalić terminy** – sprint planowanie.

Gotowe do przedstawienia zespołowi! 🚀
