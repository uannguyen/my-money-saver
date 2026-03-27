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

Copy `.env.example` to `.env` and fill in Firebase credentials:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_MEASUREMENT_ID=
```

## Architecture

**Stack:** React 19 + Vite + Tailwind CSS 4 + Firebase (Firestore + Google Auth) + React Router 7 + Recharts

### Data Flow

```
AuthContext (Google Auth user)
    ↓
Custom Hooks (useTransactions, useBudget, useCategories)
    ↓
Services layer (src/services/)
    ↓
Firestore: /users/{userId}/{transactions|budgets|categories}
```

### Key Patterns

- **Services** (`src/services/`): All Firestore CRUD lives here. Each domain has its own file (`transactionService.js`, `budgetService.js`, `categoryService.js`).
- **Custom Hooks** (`src/hooks/`): Wrap services with React state. Page components consume hooks, not services directly.
- **Pages** (`src/pages/`): Container components — they use hooks and compose feature components.
- **Components** (`src/components/`): Organized by domain (`budget/`, `transactions/`, `categories/`, `charts/`) plus `common/` and `layout/`.

### Firestore Data Model

```
users/{userId}/
  transactions/  { type: 'income'|'expense', amount, categoryId, note, date, createdAt }
  budgets/       { categoryId, amount, month: 'YYYY-MM' }
  categories/    (custom user categories)
```

Transactions are filtered by `monthKey` (`YYYY-MM` format) and ordered by date descending.

### Category System

Two-level hierarchy defined in `src/constants/categories.js`: parent categories contain sub-categories. Transactions store only the sub-category ID. Use the constants for lookups — don't hardcode category strings.

### Auth

`AuthContext` wraps the app and provides the Firebase user. `ProtectedRoute` redirects unauthenticated users to `/login`. Google Sign-In via `signInWithPopup`.

### PWA

Configured via `vite-plugin-pwa`. Service worker auto-updates. App name: "Chi Tiêu Cá Nhân". Theme color: `#6366f1`.

### Currency

This app uses Vietnamese Dong (VND). Use `src/utils/formatCurrency.js` for all currency formatting.
