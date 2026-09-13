# Current Checkpoint

## Last Completed Task

Backend analysis and live API verification complete. Demo database seeded (valid data) and backend dev server confirmed running on `http://localhost:3000`. Persistent state files created. Existing `harekat-dashboard/` is still the bare Vite+React template (no dashboard code yet).

## Currently Working On

Phase 0 — Scaffold the new dashboard stack: install Tailwind/CSS v4, React Router v7, lucide-react, clsx, tw-merge; add Vite proxy + `VITE_API_BASE` env; reset `src/` to a clean dashboard baseline (index.css design tokens, main.jsx entry).

## Files Changed

- `harekat-dashboard/DASHBOARD_AGENT_STATE.md` — created (full backend/API/auth/architecture handoff doc).
- `harekat-dashboard/DASHBOARD_AGENT_CHECKPOINT.md` — this file.

`harekat-dashboard` source still at template state (App.jsx/index.css/App.css are untouched templates).

## APIs Added/Integrated

None in the dashboard yet. Verified-live backend endpoints (dev server on :3000):
- `POST /auth`, `POST /auth/validate-otp` (OTP=123456 bypass works in dev) → `{ token, user }`.
- `GET /users/:id` (owner) → user + enrolled `courses[]` + `payments[]`.
- `GET /orders` (auth) → orders with `items[]`.
- `GET /subscriptions`, `GET /courses` (with teacher+categories), `GET /categories`, `GET /teachers`, `GET /cms/header-menu`, `GET /cms/content`, `GET /banners`, `GET /cart`, `POST /cart/add`, `POST /orders`, `POST /coupons/validate`, `POST /coupons/redeem`, `PUT /users/:id`.

## What Works

- Backend API responds on `http://localhost:3000/api/v1` with real seeded data.
- Auth OTP flow returns a real JWT for `09123456789` / otp `123456`.
- User profile returns 2 enrolled courses + payments for the seeded user.
- Orders return with line items (course + subscription product types).
- `git status` clean; `database.db`/`.env` are gitignored (safe, local only).

## What Does Not Work

- `harekat-backend` seed script (`npm run seed`) is broken (invalid `level` enum `متوسط`). Demo DB was seeded via a standalone temp script instead.
- Dashboard code itself: not built yet.

## Exact Next Action

1. Install dashboard deps: `tailwindcss@^4.x @tailwindcss/vite@^4.x tailwindcss@^4.x react-router-dom@^7 lucide-react clsx tw-merge` (plus dev deps stay).
2. Replace `src/index.css` with Tailwind v4 base + `@theme` design tokens (light/dark) matching the reference (soft neutral bg, white cards, large radius, minimal orange accent, Vazirmatn).
3. Add `.env` with `VITE_API_BASE=/api/v1`.
4. Update `vite.config.js`: add `@tailwindcss/vite` plugin + `server.proxy` `/api/v1` → `http://localhost:3000` + `fs.allow` for the backend.
5. Scaffold `src/api/client.js`, `src/contexts/AuthContext.jsx`, `src/main.jsx`, `src/App.jsx` (router shell).
6. Run `npm run dev`, verify dev server compiles and proxies to backend; verify auth login obtains a token.

## Verification

- dev server:
  - harekat-backend: running on `http://localhost:3000` (started with `PORT=3000 npm run dev`; see background_process bgp_09b6586810013qyjBE3AiDr9iQ).
- build: pending (no dashboard code yet)
- typecheck: n/a (project is plain JS, no TS)
- lint: `npm run lint` — pending
- API integration: verified live via curl (see APIs Added/Integrated). Dashboard integration pending.
