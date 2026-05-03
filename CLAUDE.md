# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build
```

No test framework is configured.

## Environment Setup

Copy `.env.example` to `.env` and fill in credentials:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_MEASUREMENT_ID=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_API_KEY=
VITE_CLOUDINARY_API_SECRET=
```

## Architecture

**Stack:** React 19 + Vite + Tailwind CSS 4 + Firebase (Firestore + Google Auth) + React Router 7 + Recharts

### Data Flow

```
AuthContext (Google Auth user)
    ↓
PrivacyContext (PIN lock, amount masking)
    ↓
Custom Hooks (useTransactions, useBudget, useCategories, ...)
    ↓
Services layer (src/services/)
    ↓
Firestore: /users/{userId}/{transactions|budgets|categories|recurringTransactions|savingsGoals}
Cloudinary: receipt image upload/delete (src/services/imageService.js)
```

### Key Patterns

- **Services** (`src/services/`): All Firestore CRUD and external API calls live here. Domains: `transactionService.js`, `budgetService.js`, `categoryService.js`, `imageService.js`, `recurringService.js`, `savingsService.js`, `authService.js`, `privacyService.js`.
- **Custom Hooks** (`src/hooks/`): Wrap services with React state. Page components consume hooks, not services directly. Key hooks: `useTransactions`, `useBudget`, `useBudgetAlerts`, `useCategories`, `useCategorySuggestion`, `useRecurring`, `useSavingsGoals`, `useImageUpload`, `useInsights`, `useMostUsedCategories`, `useRecentTransactions`.
- **Pages** (`src/pages/`): Container components — they use hooks and compose feature components.
- **Components** (`src/components/`): Organized by domain (`budget/`, `transactions/`, `categories/`, `charts/`, `goals/`, `privacy/`) plus `common/` and `layout/`.

### Routes

| Path | Page | Notes |
|---|---|---|
| `/add` | AddPage | Default start URL; also `hideNav` layout |
| `/edit/:id` | AddPage | Edit mode; `hideNav` layout |
| `/transaction` | HomePage | Transaction list |
| `/` | StatsPage | Charts/stats |
| `/budget` | BudgetPage | Monthly budgets |
| `/goals` | GoalsPage | Savings goals |
| `/settings` | SettingsPage | App settings |

`AppLayout` in `App.jsx` wires up `useBudgetAlerts` globally and passes the alert badge count to `BottomNav`. On first visit, `/` redirects to `/add` via `sessionStorage`.

### Firestore Data Model

```
users/{userId}/
  transactions/          { type: 'income'|'expense', amount, categoryId, note, date, createdAt, imageUrl?, isSplit?, splits? }
  budgets/               { categoryId, amount, month: 'YYYY-MM' }
  categories/            (custom user categories)
  recurringTransactions/ { ...transaction fields, frequency, nextDueDate, isActive }
  savingsGoals/          { name, fundType, balance, targetAmount, maturityDate, note,
                           movements: [{ type, amount, delta, note, date, balanceAfter }] }
  privacySettings/       { enabled, pinHash, salt, sensitiveCategoryIds }
```

Transactions are filtered by `monthKey` (`YYYY-MM` format) and ordered by date descending.

Savings goals use atomic Firestore `increment` + `arrayUnion` for balance updates — never update `balance` manually, always use `addSavingsMovement` from `savingsService.js`.

### Category System

Two-level hierarchy defined in `src/constants/categories.js`: parent categories contain `subs: []`. Transactions store only the sub-category ID. `useBudget` aggregates sub-category spending up to parent categories. Use the constants for lookups — don't hardcode category strings.

### Image Uploads

Receipt images upload to Cloudinary via `src/services/imageService.js` (unsigned upload preset). Deletion uses an authenticated server-side call with `VITE_CLOUDINARY_API_KEY`/`VITE_CLOUDINARY_API_SECRET`. Use `useImageUpload` hook in components — it handles compression, preview URL, and cleanup. Images can be viewed full-size via lightbox in transaction details.

### Calculator Keyboard

`CalcKeyboard` component (`src/components/transactions/CalcKeyboard.jsx`) provides a calculator-style input for amounts. Supports basic arithmetic (+, -, ×, ÷) and decimal numbers. Results are rounded to 2 decimal places.

### Utilities

- `src/utils/formatCurrency.js` — VND formatting; use for all currency display
- `src/utils/dateHelpers.js` — `getMonthKey`, `formatDate`, `formatDayLabel`, `prevMonth`, `nextMonth`, etc.
- `src/utils/exportExcel.js` — export transactions to `.xlsx` via the `xlsx` package

### Privacy System

`PrivacyContext` / `PrivacyProvider` (in `src/contexts/PrivacyContext.jsx`) wraps the entire app inside `AuthProvider`. The context value is exported separately from `src/contexts/privacyContextValue.js` — always import `usePrivacy` from there, not from `PrivacyContext.jsx`.

Key API:
- `privacyEnabled` — whether privacy mode is on
- `isUnlocked` / `sessionAuthorized` — session lock state
- `shouldMaskAmount({ type, categoryId })` — returns `true` if the amount should be hidden (used by `PrivacyAmount`)
- `setupPin(pin)` / `changePin(currentPin, newPin)` / `verifyPin(pin)` / `unlock()` / `lock()` / `requestUnlock()`

PIN is hashed with PBKDF2-SHA256 (120k iterations) client-side; only the hash+salt are stored in Firestore (`privacyService.js`). Sensitive categories default to `['salary', 'income_salary']`.

**`PrivacyAmount` component** (`src/components/privacy/PrivacyAmount.jsx`): wraps any currency value — renders masked `••••` when locked. Use this instead of raw `formatVND` wherever amounts could be sensitive. Already applied to: `TransactionList`, `RecurringManager`, `GoalCard`, `ForecastCard`, `StatsPage`, `useInsights`.

**`PrivacyUnlockDialog`** is rendered at the `App` level and triggered via `requestUnlock()`.

Settings section `PrivacySettingsSection` in `SettingsPage` handles enable/disable toggle and PIN setup/change.

### Auth

`AuthContext` wraps the app and provides the Firebase user. `ProtectedRoute` redirects unauthenticated users to `/login`. Google Sign-In via `signInWithPopup`.

### PWA

Configured via `vite-plugin-pwa`. Service worker auto-updates. App name: "Chi Tiêu Cá Nhân". Theme color: `#6366f1`. Start URL: `/add`.

### Savings Goals

Goals are "savings funds" with types: `cash`, `bank`, `emergency`, `investment`, `sinking`, `other`. Balance changes are tracked as movements with types: `initial`, `deposit`, `withdraw`, `adjustment`.

`DepositSheet` provides a bottom sheet UI for deposit/withdraw with quick-amount buttons (500K, 1M, 2M, 5M) and a note field. `GoalCard` shows history via a dialog. Both use `PrivacyAmount` for privacy masking.

Service functions: `depositToGoal`, `addSavingsMovement`, `getSavingsGoals`, `addSavingsGoal`, `updateSavingsGoal`, `deleteSavingsGoal` in `src/services/savingsService.js`.

### Key UI Components

- **Transaction flow**: `TransactionForm`, `CalcKeyboard`, `CategoryPicker`, `CategorySuggestionChips`, `MostUsedCategories`, `ImageAttachment`, `DateTimePickerModal`, `SplitEditor`
- **Charts**: `CategoryPieChart`, `MonthlyBarChart`, `WeekdayChart`, `MonthComparisonCard`, `ForecastCard`, `MonthlySummaryCard`, `TopTransactions`
- **Goals**: `GoalCard`, `GoalForm`, `DepositSheet`
- **Budget**: `BudgetCard` with alert badges
- **Privacy**: `PrivacyAmount`, `PrivacyUnlockDialog`
- **Common**: `ConfirmDialog`, `InsightCard`, `ErrorBoundary`
