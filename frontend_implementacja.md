# Implementacja Frontend – Stick With It!!!

## 1. Przegląd technologii

### Język i framework
- **TypeScript 5** – statyczne typowanie, wszystkie pliki `.tsx` / `.ts`
- **React 19** – biblioteka UI, hooks (useState, useEffect, useContext, useRef, useCallback)
- **Next.js 15.5** – framework z App Router (katalog `src/app/`), obsługuje routing, SSR/SSG, PWA
  - Dev server uruchamiany przez **Turbopack** (`next dev --turbopack`)

### Stylowanie
- **Tailwind CSS 4** – utility-first CSS, wszystkie klasy bezpośrednio w JSX
- **PostCSS + Autoprefixer** – przetwarzanie CSS do cross-browser
- **CSS Variables** – zmienne kolorów (`--color-primary`, `--color-secondary`, `--font-geologica`, `--font-figtree`) definiowane w `globals.css`
- Tryb ciemny (dark mode) przez `data-theme` + klasy `dark:`

### Czcionki
- **Geologica** (Google Fonts) – nagłówki, zmienne `--font-geologica`
- **Figtree** (Google Fonts) – tekst ogólny, zmienne `--font-figtree`
- Ładowane przez `next/font/google` (bez zewnętrznych żądań w runtime)

### Animacje
- **Framer Motion 12** – animowane przejścia, `AnimatePresence`, `motion.div`  
  Użycie: pasek XP (profile), modal badges, toast notifications, slide-in efekty
- CSS transitions (`transition-all`, `duration-300`) – hover scale, opacity

### UI / Komponenty
- **react-icons 5** – ikony (FontAwesome, Feather, Ionicons itp.)
- **emoji-picker-react 4** – picker emoji przy tworzeniu nawyku
- **react-day-picker 9** – kalendarz (Journal)
- **react-textarea-autosize 8** – auto-rosnący textarea (Journal)
- **date-fns 4** – formatowanie dat

### Zarządzanie stanem
- React Context API (własne konteksty, bez Redux):
  - `AuthContext` – dane zalogowanego użytkownika, login/logout/register
  - `UserStatsContext` – statystyki gracza (XP, level, streak), `refreshStats()`
  - `ToastContext` – globalny system powiadomień toast
- Tokeny JWT przechowywane w **localStorage** (`access_token`, `refresh_token`)

### PWA
- **next-pwa 5** – Service Worker, manifest, offline support
- Konfiguracja w `next.config.ts`; w production rejestruje SW i cachuje zasoby
- Skonfigurowane meta `appleWebApp`, `themeColor`, viewport dla mobile

### Motyw (Dark/Light Mode)
- **next-themes 0.4** – provider ThemeProvider, `attribute="data-theme"`, `defaultTheme="system"`
- Automatyczne wykrywanie preferencji systemowych

### Narzędzia deweloperskie
- **ESLint 9** + `eslint-config-next` – linting
- **TypeScript** – kompilacja i typechecking
- `tsconfig.json` – aliasy `@/` → `src/`

---

## 2. Struktura katalogów

```
frontend/
├── src/app/
│   ├── layout.tsx              ← Root layout: Providers, czcionki, PWA meta
│   ├── globals.css             ← Design tokens (CSS vars, dark mode)
│   ├── (auth)/                 ← Grupa tras publicznych (login, register)
│   │   ├── login/page.tsx
│   │   └── register/
│   ├── (main)/                 ← Chronione trasy (ProtectedRoute)
│   │   ├── layout.tsx          ← Navbar + Topbar wrapper
│   │   ├── page.tsx            ← Dashboard (Home)
│   │   ├── profile/page.tsx    ← Profil użytkownika + badges
│   │   ├── settings/
│   │   └── (tools)/
│   │       ├── habittracker/
│   │       ├── pomodoro/
│   │       ├── journal/
│   │       └── watertracker/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Topbar.tsx
│   │   ├── RandomTask.tsx      ← Daily Challenge widget
│   │   ├── Toast.tsx           ← Powiadomienie toast (animowane)
│   │   ├── ChangeSettingPopup.tsx
│   │   ├── Streak.tsx
│   │   ├── HabitTracker/
│   │   │   ├── HabitTracker.tsx
│   │   │   └── HabitCard.tsx
│   │   ├── PomodoroTimer/
│   │   │   ├── pomodoroTimer.tsx
│   │   │   ├── startStopButton.tsx
│   │   │   ├── sessionTimePopup.tsx
│   │   │   └── endSessionPopup.tsx
│   │   ├── Badges/
│   │   │   └── BadgeCard.tsx
│   │   ├── Journal/
│   │   ├── WaterTracker/
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       ├── RegisterForm.tsx
│   │       └── ProtectedRoute.tsx
│   └── lib/
│       ├── api/client.ts       ← Generyczny klient HTTP (fetch wrapper)
│       ├── auth/
│       │   ├── authContext.tsx
│       │   ├── authService.ts
│       │   └── types.ts
│       ├── habits/habitService.ts
│       ├── challenges/challengeService.ts
│       ├── badges/
│       ├── toast/ToastContext.tsx
│       └── userStats/UserStatsContext.tsx
├── next.config.ts              ← PWA konfiguracja
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Routing – App Router (Next.js)

Aplikacja używa **grupowania tras** (`(auth)`, `(main)`):

| Ścieżka URL       | Plik                            | Dostęp       |
|-------------------|---------------------------------|--------------|
| `/login`          | `(auth)/login/page.tsx`         | Publiczny    |
| `/register`       | `(auth)/register/page.tsx`      | Publiczny    |
| `/` (Dashboard)   | `(main)/page.tsx`               | Chroniony    |
| `/profile`        | `(main)/profile/page.tsx`       | Chroniony    |
| `/habittracker`   | `(main)/(tools)/habittracker/`  | Chroniony    |
| `/pomodoro`       | `(main)/(tools)/pomodoro/`      | Chroniony    |
| `/journal`        | `(main)/(tools)/journal/`       | Chroniony    |
| `/watertracker`   | `(main)/(tools)/watertracker/`  | Chroniony    |

**ProtectedRoute** – komponent opakowujący layout `(main)`. Jeśli użytkownik nie jest zalogowany (brak tokena w localStorage), przekierowuje do `/login`.

---

## 4. Warstwa komunikacji z API

### Klient HTTP (`lib/api/client.ts`)

Własny, lekki wrapper na `fetch` z trzema metodami: `get`, `post`, `delete`.  
- Bazowy URL z env: `NEXT_PUBLIC_API_URL` (domyślnie `http://127.0.0.1:8000`)
- Nagłówek `Authorization: Bearer <token>` dołączany opcjonalnie
- `cache: "no-store"` – wyłączone cache Next.js (dane zawsze świeże)
- Błędy HTTP parsowane z JSON i rzucane jako `Error`

```ts
export const apiClient = {
  async post<T>(endpoint, data, token?): Promise<T>,
  async get<T>(endpoint, token?): Promise<T>,
  async delete<T>(endpoint, token?): Promise<T>
};
```

### Serwisy domenowe

| Serwis                        | Odpowiedzialność                                               |
|-------------------------------|----------------------------------------------------------------|
| `authService.ts`              | Login, register, logout, refresh token, getStats, getBadges, changePassword/Email/Username |
| `habitService.ts`             | Pobieranie nawyków, check/uncheck habit, tworzenie nowych     |
| `challengeService.ts`         | Pobieranie daily challenge, oznaczanie jako done, blacklist   |

### Zarządzanie tokenami JWT
- `access_token` i `refresh_token` w `localStorage`
- `authService.refreshToken()` – wywoływane ręcznie lub przez interceptor
- `authService.clearTokens()` – przy wylogowaniu

---

## 5. Zarządzanie stanem – Context API

### AuthContext (`lib/auth/authContext.tsx`)

Dostarcza globalnie: `user`, `isLoading`, `login()`, `register()`, `logout()`, `refreshToken()`.  
Przy starcie sprawdza localStorage → jeśli token istnieje, pobiera dane użytkownika z API (`/api/auth/me/`).

```tsx
// Użycie w komponentach:
const { user, login, logout } = useAuth();
```

### UserStatsContext (`lib/userStats/UserStatsContext.tsx`)

Trzyma w stanie statystyki gracza (level, XP, streak). Eksponuje `refreshStats()` – wywoływane po każdej akcji generującej XP (ukończenie nawyku, pomodoro, challenge).

### ToastContext (`lib/toast/ToastContext.tsx`)

Globalny system powiadomień. Eksponuje:
- `showToast(message, type)` – success / error / info / warning
- `showXpToast(amount, label)` – specjalny toast z animowaną kwotą XP
- `showBadgeToast(badgeInfo)` – toast z odznaką (kolor zależny od rarity)

---

## 6. Kluczowe komponenty

### Root Layout (`app/layout.tsx`)
Ładuje czcionki Geologica i Figtree, opakowuje drzewo w:
```
AuthProvider → UserStatsProvider → ToastProvider → ThemeProvider → children
```
Zawiera meta PWA (manifest, apple-web-app, viewport mobile).

### Main Layout (`(main)/layout.tsx`)
Chroniony przez `<ProtectedRoute>`. Struktura:
- `<Topbar />` – górny pasek (tytuł/akcje)
- `<div flex-grow>` – scrollowalny content
- `<Navbar />` – dolna nawigacja (mobile-first)

### RandomTask (Daily Challenge) (`components/RandomTask.tsx`)
- Pobiera challenge dnia z API przy montowaniu (jeśli user zalogowany)
- Mały widget → klik otwiera **full-screen modal** (slide-in from bottom)
- Akcje: **Done** (oznacza ukończone, pokazuje XP/badge toast) i **Blacklist** (wyklucza kategorię)
- Kolory karty zależne od trudności: zielony (easy), żółty (medium), czerwony (hard)
- Obsługuje stan ładowania (skeleton `animate-pulse`)

### HabitTracker (`components/HabitTracker/`)
- Siatka kart `HabitCard` – 2 kolumny, karta 160×160px
- **Optimistic update** – stan UI aktualizowany przed odpowiedzią serwera, rollback przy błędzie
- Modal dodawania nawyku: dwa tryby – **template** (lista predefiniowana) i **custom** (emoji picker + nazwa)
- Po zaznaczeniu nawyku: wywołanie API, odbiór XP i badge, pokazanie toastów z opóźnieniem (`setTimeout` co 600ms na kolejne badge)

### PomodoroTimer (`components/PomodoroTimer/pomodoroTimer.tsx`)
- Stany timera: `idle`, `running`, `paused`
- **Persystencja między nawigacją** – stan zapisywany w `localStorage` (endTimestamp, pausedTime, mode, status)
- Czas odliczany przez `window.setInterval`, obliczany z różnicy `endTimestamp - Date.now()` (odporność na nieaktywność karty)
- Po zakończeniu fazy **focus** automatycznie startuje **break**; po zakończeniu break wywołuje `POST /api/auth/pomodoro/complete/` → XP
- Trzy popup'y: `SessionTimePopup` (ustawienie czasu), `confirm` (reset), `EndSessionPopup` (koniec sesji)
- Motyw wizualny zmienia się: szary (idle), czerwony (focus), zielony (break)

### Profile (`(main)/profile/page.tsx`)
- Pobiera stats i badges równolegle przy montowaniu
- Animowany pasek XP (Framer Motion: `initial={{ width: 0 }}` → `animate={{ width: X% }}`)
- 3 karty statystyk: Longest Streak, Total EXP, Badges Earned
- Przewijalna lista badge'y; przycisk „See All" otwiera **modal full-screen** (spring animation slide-in from bottom)
- `BadgeCard` – zablokowane odznaki wyświetlane wyszarzone

### Toast (`components/Toast.tsx`)
- Animacja wejście/wyjście: `x: 100 → 0` (slide from right), spring 300/20
- Auto-zamknięcie: badge=5s, xp=4s, inne=3s
- Typy z różnym motywem lewej ramki: green (success), red (error), yellow (warning), purple (XP), amber/złoty zależnie od rarity (badge)
- Klikalny – zamknięcie na tap

---

## 7. PWA (Progressive Web App)

- Skonfigurowane przez `next-pwa` w `next.config.ts`
- Service Worker rejestrowany automatycznie w production
- Manifest (`/manifest.json`) z ikonami 192x192
- Viewport i meta `apple-web-app` umożliwiają dodanie do ekranu głównego na iOS/Android
- Wyłączone w dev (`disable: process.env.NODE_ENV === 'development'`)

---

## 8. Zestawienie zależności (package.json)

### Produkcyjne
| Paczka                 | Wersja  | Zastosowanie                          |
|------------------------|---------|---------------------------------------|
| `next`                 | 15.5.9  | Framework React (App Router)          |
| `react`                | 19.1.0  | Biblioteka UI                         |
| `react-dom`            | 19.1.0  | DOM rendering                         |
| `framer-motion`        | ^12     | Animacje, AnimatePresence             |
| `next-themes`          | ^0.4    | Dark/Light mode                       |
| `next-pwa`             | ^5.6    | Progressive Web App                   |
| `emoji-picker-react`   | ^4.16   | Picker emoji (nawyki)                 |
| `react-icons`          | ^5.5    | Ikony (FA, Feather, Ionicons)         |
| `react-day-picker`     | ^9.14   | Kalendarz (Journal)                   |
| `react-textarea-autosize` | ^8.5 | Auto-resize textarea                 |
| `date-fns`             | ^4.1    | Formatowanie dat                      |

### Deweloperskie
| Paczka                   | Zastosowanie                   |
|--------------------------|--------------------------------|
| `typescript` ^5          | Typowanie statyczne            |
| `tailwindcss` ^4         | Narzędzie CSS                  |
| `@tailwindcss/postcss`   | Integracja PostCSS             |
| `postcss` ^8             | Przetwarzanie CSS              |
| `autoprefixer` ^10       | Cross-browser CSS              |
| `eslint` ^9              | Linting                        |
| `eslint-config-next`     | Reguły ESLint dla Next.js      |

---

## 9. Wzorce architektoniczne

- **Mobile-first** – UI projektowane na ekrany ~375px, responsywne przez klasy `sm:`, `md:`
- **Grupowanie tras** – `(auth)` vs `(main)` zamiast middleware, jawne wrapowanie layoutem
- **Separacja warstw** – `components/` (UI), `lib/` (logika, API, konteksty)
- **Optimistic UI** – HabitTracker aktualizuje stan lokalnie przed potwierdzeniem serwera
- **Persystentny timer** – Pomodoro działa w tle (zapis do localStorage), nie traci stanu przy zmianie trasy
- **Lazy-loading modali** – modale renderowane warunkowo (`{isOpen && (<Modal />)}`), nie ładowane wstępnie
- **Context > Props drilling** – dane globalne (auth, stats, toast) przekazywane przez kontekst, nie przez props
