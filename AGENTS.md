# Repository Guidelines

## Project Structure & Module Organization

This is a React 19 + Vite personal finance PWA using Firebase, Cloudinary uploads, Recharts, and component-level CSS. Main application code lives in `src/`.

- `src/pages/`: route-level screens such as `HomePage.jsx`, `AddPage.jsx`, and `BudgetPage.jsx`.
- `src/components/`: reusable UI grouped by domain (`transactions/`, `budget/`, `goals/`, `charts/`, `layout/`, `common/`).
- `src/hooks/`: feature hooks such as `useTransactions`, `useBudget`, and `useSavingsGoals`.
- `src/services/`: Firebase/Cloudinary service wrappers and CRUD modules.
- `src/constants/` and `src/utils/`: shared data and pure helpers.
- `docs/screenshots/`: README screenshots and visual reference assets.
- `public/` and `dev-dist/`: static and generated PWA assets; avoid editing generated service worker files unless rebuilding PWA output.

## Build, Test, and Development Commands

Run commands from the repository root.

```bash
npm install       # install dependencies from package-lock.json
npm run dev       # start the Vite dev server
npm run build     # create a production build
npm run preview   # preview the production build locally
npm run lint      # run ESLint across the project
```

Create `.env` from `.env.example` before running the app locally. Firebase and Cloudinary values are required for auth, Firestore, and receipt image uploads.

## Coding Style & Naming Conventions

Use ES modules, React function components, and JSX files for UI. Keep component names in PascalCase (`TransactionForm.jsx`) and hooks in camelCase with a `use` prefix (`useBudget.js`). Place CSS beside the related component or page and match the component filename (`GoalCard.jsx`, `GoalCard.css`). Prefer existing hooks and service modules over direct Firebase access inside components.

ESLint is configured in `eslint.config.js` for JavaScript/JSX, React hooks, and Vite React Refresh. Fix lint errors before handoff.

## Testing Guidelines

There is no dedicated test script yet. For now, use `npm run lint` plus targeted manual checks in `npm run dev`. When adding tests, prefer colocated specs named `*.test.jsx` or `*.test.js`, and add a matching npm script so future contributors can run them consistently.

## Commit & Pull Request Guidelines

Recent history uses short conventional-style messages such as `feat: ...`, `fix: ...`, and `update: docs`. Keep commits focused and imperative.

Pull requests should include a concise description, screenshots or screen recordings for UI changes, notes about Firebase/Cloudinary configuration changes, and the verification performed (`npm run lint`, `npm run build`, manual flows tested).

## Security & Configuration Tips

Never commit `.env`, API secrets, Firebase admin credentials, local database exports, or generated caches. Keep `.env.example` updated when adding required environment variables.
