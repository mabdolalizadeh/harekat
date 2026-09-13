# Dashboard Agent State

> Persistent handoff document for the **standalone Harekat dashboard** being built in `harekat-dashboard/`. This file, together with `DASHBOARD_AGENT_CHECKPOINT.md`, is the single source of truth for future agents. Read both before continuing.

## Project Goal

Build a **completely separate, standalone dashboard frontend** for the Harekat Learning Platform. It lives in `harekat-dashboard/` and is independent from the existing public site (`harekat-landing/`) and admin panel (`harekat-admin/`). It must NOT replace or modify the existing dashboards.

The new dashboard is an **authenticated user-facing** space (students) showing: my learning profile, enrolled courses, orders/purchase history, subscriptions catalog + my subscriptions, cart/checkout, and account settings. It communicates with the **existing backend** (`harekat-backend/`) over real HTTP REST APIs — no mock data.

Reference design (Dribbble shot):
https://cdn.dribbble.com/userupload/43546319/file/original-8571bbcca1b46259be8223ed411c4b7a.jpg?resize=1024x1024&vertical=center

## Reference Design

A clean, premium SaaS/LMS aesthetic:
- Soft neutral background (`#f5f6f7` / `#f7f8fa`), off-white.
- White floating cards on a muted background.
- Subtle 1px borders (`rgba(0,0,0,0.06)`).
- Large rounded corners (16–20px; `rounded-2xl`/`rounded-[20px]`).
- Restrained, soft drop shadows (`0 4px 12px rgba(0,0,0,0.04)`, `0 1px 3px rgba(0,0,0,0.05)`), not heavy.
- Generous whitespace / roomy grid layouts.
- Strong information hierarchy: large heading, muted secondary text, bold figures in stat cards.
- Modern typography: Vazirmatn (Persian), Inter fallback, font-weight contrast (700 headings, 400/500 body).
- Clean navigation: persistent left sidebar (desktop) + top header with profile/actions; collapses to mobile drawer.
- Minimal accent color: a single warm orange (`--color-brand-500 = #f47c20` from the landing theme) used sparingly for accents, links, active states. Neutral icons otherwise.
- Polished responsive behavior: desktop 2-column/4-stat grid; tablet 2-column; mobile single column, sidebar off-canvas.

## Repository Architecture

```
/Users/mohammad/WebstormProjects/harekat/   # workspace root (git monorepo, branch: master, clean)
├── harekat-backend/        # Express + SQLite (Sequelize) backend API
│   ├── src/
│   │   ├── app.js          # Express app, CORS, helmet, static SPA fallback, /api/v1 routes
│   │   ├── server.js       # entry: sync DB, listen on PORT (default 3000, .env overrides to 80)
│   │   ├── config/config.js  # loads .env, validates JWT_KEY (>=32 chars)
│   │   ├── models/         # Sequelize models (SQLite, storage: database.db [gitignored])
│   │   ├── controllers/    # route controllers
│   │   ├── routes/         # Express routers, mounted at /api/v1 via routes/index.js
│   │   ├── middleware/     # auth.js, adminAuth.js, ownerCheck.js, rateLimiter.js
│   │   └── utils/          # logger.js, seedDemoData.js (BROKEN — see Known Issues), seedCmsData.js
│   ├── .env                # gitignored — JWT_KEY, JWT_EXPIRY, USER_JWT_EXPIRY, CORS_ORIGIN, ADMIN_HOSTNAME, PORT
│   ├── .env.example
│   ├── API.md              # full API reference (authoritative-ish, verify behavior in code)
│   └── database.db         # gitignored local SQLite dev DB
│
├── harekat-landing/        # existing public storefront SPA (React 19 + Vite + Tailwind v4) — DO NOT MODIFY
├── harekat-admin/          # existing admin SPA (React + Vite + Tailwind v4) — DO NOT MODIFY
├── harekat-dashboard/      # NEW standalone user dashboard SPA (this work) — React 19 + Vite + Tailwind v4
│   ├── .gitignore
│   ├── package.json        # currently the bare Vite+React template
│   ├── vite.config.js      # currently bare Vite+React config
│   ├── index.html
│   ├── public/             # favicon.svg, icons.svg
│   └── src/                # currently the bare Vite template (App.jsx, App.css, main.jsx, index.css, assets/)
├── AGENT_PROGRESS.md       # legacy progress file from a prior unrelated integration effort
└── .git/
```

Frameworks / package managers:
- Backend: Node.js (v26), Express 5, Sequelize 6 + sqlite3, JWT auth. `npm` (package-lock.json present).
- `harekat-landing` & `harekat-admin`: React 19, Vite 8, Tailwind CSS 4 (`@tailwindcss/vite` + `tailwindcss`), `motion`, `lucide-react@^1.x`, `react-router-dom@^7`, `clsx`, `tw-merge`. `npm`.
- `harekat-dashboard` (new): will adopt the same stack for consistency — React 19, Vite, Tailwind v4, React Router v7, lucide-react, clsx, tw-merge. `npm`.

Important configuration files:
- `harekat-backend/.env` — dev env (gitignored): `PORT=80`, `JWT_EXPIRY=7d`, `USER_JWT_EXPIRY=7d`, `CORS_ORIGIN=https://schoolharekat.ir,https://www.schoolharekat.ir,https://admin.schoolharekat.ir` (NOT localhost), `ADMIN_HOSTNAME=admin.schoolharekat.ir`. The backend is run for local dev with `PORT=3000 npm run dev` (env override; dotenv does not override existing env vars) so the dev dashboard proxy can target `http://localhost:3000`.
- `harekat-dashboard/vite.config.js` — will add a `/api/v1` → `http://localhost:3000` dev proxy (bypasses backend CORS which is production-domains-only) and `VITE_API_BASE` env.
- `harekat-dashboard/.env` — `VITE_API_BASE=/api/v1` (relative; resolved against the Vite proxy in dev and the backend in prod).
- Tailwind v4 config lives inside `src/index.css` via `@import "tailwindcss"` + `@theme { ... }` (no separate `tailwind.config.js`).

## Backend Understanding

The backend is an Express 5 + Sequelize(SQLite) API. All JSON responses use the envelope `{ ok: boolean, data?: T, message?: string }`. Errors use `{ ok: false, message }` (validation errors add `errors` array). JWT Bearer tokens are sent in `Authorization`. Two middlewares: `auth` (any authenticated user/admin) and `adminAuth`/`adminOnly` (role === 'admin'). There is also `optionalAuth` (attaches `req.user` if a valid token is present, otherwise continues anonymous) — used by cart routes.

Base URL: `http://localhost:3000/api/v1` (dev). Public reads (no auth) are explicitly marked in the routes.

### Auth flow (`/auth`, `/admins`)
- `POST /auth` — Request OTP. Body: `{ phoneNumber }`. Dev-only: returns `{ ok:true, data:{ userId } }` (NOTE: does NOT return the OTP to the client in code, even though API.md claims it does; in dev `NODE_ENV=development` and OTP `123456` always validates). Public. Rate-limited (`authLimiter`).
- `POST /auth/validate-otp` — Body: `{ phoneNumber, otp }`. Returns `{ ok:true, data:{ token, user } }`. Dev bypass: any OTP string equal to `"123456"` succeeds regardless of the stored OTP. `nodeEnv==='development' && String(otp)==='123456'`. Strict rate-limited (`strictAuthLimiter`, 20/15min).
- `POST /auth/change-phone-number` — Auth required. Body `{ phoneNumber }`. Returns `{ ok:true, data:{ userId, otp } }` (sends OTP to the new number).
- `POST /admins/auth` — Admin login. Body `{ username, password }`. Returns `{ ok:true, data:{ token, admin:{ id, username } } }`. Admin token role === 'admin'.
- `POST /admins/register` — Body `{ username, password }`. Returns `{ ok:true, data:{ id, username } }`.
- Users model has `otp`, `otpExpiresAt`; OTP is single-use and cleared on successful validate. In dev the expiry check is skipped when the OTP bypass matches.
Backend implementation: `src/controllers/authController.js`, `src/middleware/auth.js`, `src/middleware/adminAuth.js`, `src/models/users.js`.

### User profile / enrolled courses
- `GET /users/:id` — Auth required, owner-or-admin (`ownerOrAdmin`). Returns the user including associations: `courses` (the `UserCourses` many-to-many, join fields hidden via `through:{attributes:[]}` — but **NOT** including teacher or categories on the nested courses) and `payments[]`. This is how "enrolled courses" are read. Response `data`: `{ id, firstName, lastName, phoneNumber, avatar, otp, otpExpiresAt, createdAt, updatedAt, courses:[...], payments:[...] }`.
- `PUT /users/:id` — Auth, owner-or-admin. Body all optional: `{ firstName, lastName, phoneNumber, avatar, courseIds[], paymentIds[] }`. Re-sets courses/payments via `setCourses`/`setPayments`.
- `POST /users` — Public. Body `{ phoneNumber }`.
- `GET /users` — Admin-auth only.
- Backend implementation: `src/controllers/usersController.js`, `src/routes/users.js`, `src/models/index.js` (Users<->Courses via `UserCourses` join; Users->Payments).

### Courses (the sellable product)
- `GET /courses` — Public. Returns all courses with `teacher` (Teachers), `teachers[]`, `categories[]`. `courseIncludes()` = teacher + teachers + categories.
- `GET /courses/:id` — Public. Same includes. 404 if not found.
- `POST/PUT/DELETE` — auth+adminOnly.
Course fields: `id(UUID)`, `name`, `price`(string), `salePrice`(string|null), `description`(text|null), `isActive`(bool), `sortOrder`(int), `image`(string, **required**), `level`(enum: '', 'پایه', 'مقدماتی', 'پیشرفته', 'مبتدی'), `duration`, `typeOfAttendence`('آنلاین'|'آفلاین'), `kind`('regular'|'capsule'|'skill'), `statusOfRegistration`, `videoUrl`(string|null), `longDescription`(text|null), `teacherId`, timestamps.
Validation: non-numeric `price`→400; `salePrice>price`→400. `kind==='skill'` requires ≥1 teacher.
Backend: `src/controllers/coursesController.js`, `src/routes/courses.js`, `src/models/courses.js`.
NOTE: The seed script (`seedDemoData.js`) uses invalid `level: 'متوسط'` which fails validation — the seed script is BROKEN (see Known Issues). Demo data was seeded manually via a standalone script instead; the DB schema/models themselves are fine.

### Subscriptions
- `GET /subscriptions` — Public (admin route also returns all). Query: none. Returns `[{ id, name, price, salePrice, description, isActive, sortOrder, image, buttonLink, buttonText, createdAt, updatedAt }]` ordered by sortOrder asc.
- `GET /subscriptions/:id` — Public.
- `POST/PUT/DELETE` — auth+adminOnly.
Backend: `src/controllers/subscriptionsController.js`, `src/routes/subscriptions.js`, `src/models/subscriptions.js`.

### Categories
- `GET /categories` — Public. Returns `[{ id(int PK, autoincrement), name, slug, isActive, sortOrder, createdAt, updatedAt, courses:[...] }]`.
- `GET /categories/:id` — Public.
Canonical seeded slugs: `capsule-training`, `beginner-courses`, `skill-packages`, `subscriptions`, `programming`, `ui-ux`, `content-creation`, `digital-marketing`, `photography`.
Backend: `src/controllers/categoriesController.js`, `src/routes/categories.js`, `src/models/categories.js`.

### Teachers
- `GET /teachers` — Public. `[{ id, firstName, lastName, avatar, resume, resumeFile, email, showOnLanding, createdAt, updatedAt, courses:[{...}], categories:[...] }]`.
- `GET /teachers/:id` — Public.
Backend: `src/controllers/teachersController.js`, `src/routes/teachers.js`, `src/models/teachers.js`.

### Cart (auth optional)
- `GET /cart` — optionalAuth. Returns `{ ok:true, data:{ ...cart, items:[{ id, cartId, productId, productType('course'|'subscription'), quantity, price, createdAt, updatedAt }] } }`. Creates a cart on first hit if none exists (uses `req.user.id` or `x-session-id` header; the landing client sends a UUID in `x-session-id` header and also reads/writes a `cartSessionId` localStorage key).
- `POST /cart/add` — optionalAuth. Body `{ productId, productType, quantity?, price }`. productType must be 'course'|'subscription'. Returns the cart + items.
- `PUT /cart/item/:itemId` — optionalAuth. Body `{ quantity }` (>=1).
- `DELETE /cart/item/:itemId` — optionalAuth.
- `DELETE /cart/clear` — optionalAuth.
Backend: `src/controllers/cartController.js`, `src/routes/cart.js`.

### Orders (auth required)
- `GET /orders` — auth. Returns the authenticated user's orders (scoped by `userId`), newest first, each with `items:[{ id, orderId, productId, productType, quantity, price, productName, productImage }]`. Order fields: `id, userId, status('pending'|'paid'|'failed'|'cancelled'|'refunded'), totalAmount, discountAmount, finalAmount, couponCode, paymentId, createdAt, updatedAt`.
- `GET /orders/:id` — auth. Order is scoped by the `userId` in the WHERE clause, so a user can only fetch their own (no separate ownerCheck).
- `POST /orders` — auth. Body `{ couponCode? }`. Reads the caller's cart, computes subtotal server-side, creates the order + order items (resolves productName/productImage from Courses/Subscriptions by productId/productType), clears the cart. Returns the created order. (NOTE: coupon logic is currently a no-op stub in this controller — `createOrder` ignores `couponCode` for discount; validated coupons are applied via `/coupons/validate`+`/redeem` on the frontend.)
- `PUT /orders/:id/status` — auth (NOT adminOnly). Body `{ status, paymentId? }`. `status` must be in valid statuses. NOTE: this lets any authenticated user set ANY order's status (only `req.user?.id` is logged, not enforced) — a backend quirk/limitation.
Backend: `src/controllers/ordersController.js`, `src/routes/orders.js`, `src/models/orders.js`.

### Coupons
- `POST /coupons/validate` — Public. Body `{ code, orderAmount }`. Returns `{ ok:true, data:{ valid, coupon, discount, finalAmount } }` (server-side math; frontend must NOT compute discounts).
- `POST /coupons/redeem` — auth. Body `{ code, orderAmount }`. Increments `usageCount`. Returns `{ valid, coupon, discount?, finalAmount? }`.
- Admin CRUD: `POST/GET/GET/:id/PUT/DELETE /coupons` — auth+adminOnly. `GET /coupons?active=&page=&limit=&search=`.
Coupon fields: `code`(unique uppercased), `discountType`('percent'|'fixed'), `discountValue`(DECIMAL), `isActive`, `expiresAt`, `usageLimit`, `usageCount`, `minimumOrderAmount`, timestamps.
Backend: `src/controllers/couponsController.js` (exports `computeDiscount`/`checkUsable` helpers), `src/routes/coupons.js`, `src/models/coupon.js`.

### CMS (header menu + site content)
- `GET /cms/header-menu` — Public. Active items sorted by sortOrder. `[{ id, label, link, scrollId, sortOrder, isActive, createdAt, updatedAt }]`.
- `GET /cms/content?key=` — Public. Active SiteContent blocks. `[{ id, key, title, body, imageUrl, linkUrl, linkText, sortOrder, isActive, createdAt, updatedAt }]`.
- `GET /cms/content/:key` — Public. 404 if missing/inactive.
- Admin: `GET/PUT/DELETE /cms/admin/...` — auth+adminOnly (admin view includes inactive).
Backend: `src/controllers/cmsController.js`, `src/routes/cms.js`, `src/models/headerMenuItem.js`, `src/models/siteContent.js`.

### Banners
- `GET /banners` — Public (active, sorted). `[{ id, imageUrl, tabletImageUrl, mobileImageUrl, linkUrl, duration, sortOrder, isActive, createdAt, updatedAt }]`. (Empty in seeded demo data.)
- Admin CRUD at `/banners/admin` etc.
Backend: `src/controllers/bannersController.js`, `src/routes/banners.js`, `src/models/banners.js`.

### Uploads (admin only)
- `POST /api/v1/uploads/image` — auth+adminOnly, raw image bytes. Returns `{ data:{ imageUrl } }` (served at `/uploads/:file` via `express.static(UPLOADS_DIR)`; UPLOADS_DIR = env `UPLOADS_DIR` or `harekat-backend/uploads`, persisted outside dist).
- `POST /api/v1/uploads/file` — auth+adminOnly, raw PDF/doc bytes. Returns `{ data:{ fileUrl } }`.

### Payments
- `GET /payments` — auth (adminAuth). Admin-only read of all payments.
- `POST /payments` — auth. Body `{ userId, type('paid'|'pending'|'failed'|'refunded') }`.
- User-scoped payment read is indirect: `GET /users/:id` returns the user's `payments[]`.
Backend: `src/controllers/paymentsController.js`, `src/routes/payments.js`, `src/models/payments.js`.

### Response envelope & errors
All success: `{ ok:true, data }`. Errors: `{ ok:false, message }`. HTTP codes: 400 bad-request/validation, 401 missing/invalid token, 403 admin-required / forbidden, 404 not-found, 409 duplicate, 500 internal. The client treats `!response.ok || data.ok===false` as an error (per existing `services/api.js`).

## Authentication

Mechanism: stateless JWT (Bearer). `auth` middleware verifies `Authorization: Bearer <token>` against `configs.jwtKey`, sets `req.user = { id, role }`.
- Login flow: `POST /auth { phoneNumber }` → server generates/rotates OTP on the user (creates user if missing) and returns `{ userId }`. Then `POST /auth/validate-otp { phoneNumber, otp }` → verifies OTP (dev bypass if otp==="123456"), clears OTP, returns `{ token, user }`. Client stores token + user.
- Token/session: token stored in `localStorage` under key `token`; user object under `user`. No httpOnly cookie — pure localStorage JWT. (This is the existing behavior; the new dashboard mirrors it, do NOT change.) There is no refresh token; `USER_JWT_EXPIRY=7d` in dev. Logout = remove `token`/`user` from localStorage.
- Refresh mechanism: none/invisible — token expiry is 7d in dev; the app simply clears auth state on 401.
- Protected routes: any route/page that needs the user checks `auth` on the backend; on the frontend, protected routes redirect to `/login` when no valid token exists. The token is sent via `Authorization: Bearer` header on every auth request.
- Frontend requirements: an auth context that reads `token`/`user` from localStorage on init, exposes `login(phoneNumber)`, `verifyOtp(...)` → store token+user, `logout` → clear storage + reset context, and a boolean `isAuthenticated`. A protected-route guard redirects unauthenticated users to login (preserving an intended return destination). The cart endpoints use `optionalAuth` so they work for authenticated users (token sent) and fall back to an `x-session-id` header for guests — the client always sends both the Bearer token (if present) and an `x-session-id` header (a persisted localStorage UUID) so the cart merges correctly.
- Dev shortcut: during local development the OTP can be submitted as `123456` to get a real token for the seeded phone `09123456789`.

## Dashboard Architecture

Framework: React 19 + Vite 8. Routing: `react-router-dom@^7`. Styling: Tailwind CSS v4 (v4, `@tailwindcss/vite` plugin, config-in-CSS `@theme`), Vazirmatn font for Persian. Icons: `lucide-react`. Class-merge utility: `clsx` + `tw-merge`.

Structure (to be created under `src/`):
```
src/
  index.css        # @tailwind base/components/utilities + @theme design tokens (CSS vars)
  main.jsx         # ReactDOM createRoot, BrowserRouter, AuthProvider, ToastContainer
  App.jsx          # <Routes> with public + protected routes, cart drawer outlet
  api/
    client.js      # typed-ish fetch wrapper: base URL, bearer token, x-session-id, assetUrl, error throwing
  contexts/
    AuthContext.jsx   # auth state + login/verify/logout, localStorage persistence, current-user cache
    CartContext.jsx   # cart state (fetch/create, add, update, remove, clear) shared across pages
    ThemeContext.jsx  # light/dark mode toggle (persisted to localStorage), matches reference "theme toggle"
  hooks/
    useApi.js         # small fetch hook (loading/error/data) — optional, minimal
    useCart.js
  components/
    layout/           # Sidebar, Header, DashboardLayout
    ui/               # Button, Input, StatCard, Card, Badge, Avatar, Loading, ErrorState, EmptyState
    courses/          # CourseCard (enrolled + catalog variant)
    subscriptions/    # SubscriptionCard
    orders/           # OrderCard / OrderItemRow
    cart/             # CartDrawer (slide-over)
    auth/             # LoginForm / OtpForm
  pages/
    Overview.jsx       # welcome + 4 stat cards + enrolled courses (continue learning) + completed
    Courses.jsx        # catalog of all public courses (filter by category)
    CourseDetail.jsx   # /courses/:id — image, teacher, price, add-to-cart
    Subscriptions.jsx  # catalog + my subscriptions
    Orders.jsx         # purchase history
    Cart.jsx (or drawer)
    Settings.jsx       # profile (GET/PUT /users/:id) — name, phone, avatar; theme toggle lives here too
    Login.jsx          # phone entry → OTP verify
  routes/
    RequireAuth.jsx   # guard + redirect to /login with return location
```
API layer: single `api/client.js` (modelled on `harekat-landing/src/services/api.js`) with `get/post/put/del`, automatic `Authorization` header from the auth context token, and the cart `x-session-id` header. All responses unwrapped from the `{ ok, data }` envelope and errors thrown as typed `ApiError` so components can render loading/error/empty states.

State management: React Context for auth + theme + cart (lightweight, no extra deps). Components are small and composable.

Styling / design tokens (CSS variables in `:root`, light + dark):
- Background: `--color-bg` (soft neutral `#f7f8fa` light / `#111216` dark).
- Surface/card: `--color-card` (`#ffffff` / `#1b1c21`), border `--color-border` (`rgba(0,0,0,.06)` / `rgba(255,255,255,.08)`), shadow `--shadow-card` (restrained).
- Radius: `--radius-lg 12px`, `--radius-xl 16px`, `--radius-2xl 20px`.
- Accent: `--color-brand-500 #f47c20` (warm orange, from the landing theme), plus `--color-accent` for link/primary.
- Text: `--color-text`, `--color-text-muted`, `--color-text-secondary`.
- Typography: Vazirmatn (Persian), Inter fallback.

Responsive: desktop 1200px max-width container; sidebar desktop-fixed, mobile off-canvas; stat cards grid `sm:grid-cols-2 lg:grid-cols-4`; course grid `sm:grid-cols-2 lg:grid-cols-3`.

Reusable components: `DashboardLayout`, `Sidebar`, `Header`, `StatCard`, `Card`, `Button`, `Input`, `Avatar`, `Badge`, `Loading`, `ErrorState`, `EmptyState`, `CartDrawer`, `CourseCard`, `SubscriptionCard`, `OrderCard`, `RequireAuth`.

## Implemented Features

- [x] Project initialized (Vite + React template exists in `harekat-dashboard`)
- [x] Backend analyzed (all routes/controllers/models read & APIs verified live against port 3000)
- [ ] Authentication integrated (OTP login flow, token/user persistence, auth context)
- [ ] API client (`src/api/client.js`) wired to real backend
- [ ] Routing + protected routes
- [ ] Dashboard shell (layout: sidebar + header + content area, responsive)
- [ ] Sidebar
- [ ] Header
- [ ] Theme toggle (light/dark)
- [ ] Overview dashboard (stat cards + enrolled courses + my orders snapshot)
- [ ] Courses catalog
- [ ] Course detail
- [ ] Subscriptions catalog + my subscriptions
- [ ] Orders (purchase history)
- [ ] Cart drawer + checkout/order creation
- [ ] Settings / profile (view + update)
- [ ] Loading / error / empty states
- [ ] Production build + lint + typecheck passing

## Current Progress

Fresh start — no prior agent work in this repo folder beyond the bare Vite template. Backend thoroughly analyzed and APIs verified live (dev server running on `http://localhost:3000`, demo data seeded). See `DASHBOARD_AGENT_CHECKPOINT.md` for the live checkpoint.

## Known Issues

1. `harekat-backend/src/utils/seedDemoData.js` is BROKEN: it uses `level: 'متوسط'` which violates the `Courses.level` enum (`['', 'پایه', 'مقدماتی', 'پیشرفته', 'مبتدی']`). Running `npm run seed` from the backend fails partway. The models/routes are fine. For local dev data, demo DB was seeded via a standalone script (`/var/folders/.../kilo/seed-demo.mjs`, run from the backend dir) that uses valid level values; `database.db` is gitignored so this is purely local. A future agent can re-run that script or fix the seed's level values. The new dashboard does NOT depend on the broken seed.
2. `POST /orders` ignores coupon discounts (stub: `couponCode` is stored but not applied to `finalAmount`). The frontend applies coupon validation via `/coupons/validate` (server-side math) before creating the order, but the order total itself is computed from the cart server-side without the coupon. Document this as a backend limitation; do NOT hack around it in the frontend beyond showing the discount at checkout via the validate endpoint.
3. `PUT /orders/:id/status` is auth-protected but NOT admin-scoped — any authenticated user can change any order's status. Backend quirk; the dashboard will not expose arbitrary status editing (read-only order history).
4. Backend `CORS_ORIGIN` (`.env`, gitignored) is set to production domains only (`schoolharekat.ir` etc.), not localhost. The dashboard dev server avoids this via the Vite `/api/v1` proxy to `localhost:3000`.
5. Backend `.env` sets `PORT=80`; for local dev the backend is run with `PORT=3000 npm run dev` (dotenv does not override existing env vars). The dashboard proxy targets `http://localhost:3000`.
6. The backend serves static SPA fallbacks for `harekat-landing/dist` and `harekat-admin/dist`. The new dashboard is a separate Vite app (served independently); it does NOT need backend static serving. Ensure backend static-fallback paths are not affected (they aren't).

## Do Not Change

- The existing `harekat-landing/` and `harekat-admin/` frontends and their code.
- Backend API contracts/routes/controllers/models. Do NOT add fields, change response shapes, or weaken auth/middleware to make the frontend easier. (The two pre-existing backend bugs above are out of scope for the dashboard task.)
- Backend auth behavior: JWT Bearer, localStorage token storage, OTP dev bypass `123456`, token expiry handling, CORS config.
- The git-tracked backend source. (`database.db` and `.env` are gitignored local dev state.)
- The Vite `motion`/`lucide-react`/`clsx`/`tw-merge` versions are optional; prefer the same major versions as `harekat-landing` for consistency but it is not required.
