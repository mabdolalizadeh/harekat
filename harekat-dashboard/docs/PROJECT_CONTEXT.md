# Harekat LMS Dashboard — Project Context

## 1. Project Purpose
Harekat Media (حرکت مدیا) is an educational media platform offering online/offline courses, skill packages, capsule trainings, and subscriptions.

## 2. Dashboard Purpose
This project is the dedicated **User Dashboard / LMS Panel** for students and registered users.
It empowers users to:
- Access their enrolled courses and track learning progress.
- Watch lessons and review syllabus materials.
- Browse the full course and subscription catalog.
- Manage shopping cart, checkout, and order history.
- View achievements, reward points / rubies, and study milestones.
- Manage user profile details (name, avatar, phone number).
- Experience an interface closely aligned with the provided Dribbble design reference.

## 3. Directory Layout & Locations
- **Backend Location:** `/Users/mohammad/WebstormProjects/harekat/harekat-backend` (Node.js/Express/Sequelize on `http://localhost:3000`)
- **Landing Page Location:** `/Users/mohammad/WebstormProjects/harekat/harekat-landing` (Read-only, MUST NOT BE MODIFIED)
- **Admin Panel Location:** `/Users/mohammad/WebstormProjects/harekat/harekat-admin`
- **Dashboard Location:** `/Users/mohammad/WebstormProjects/harekat/harekat-dashboard/dashboard` (Self-contained, isolated React + MUI LMS application)
- **Dashboard Documentation:** `/Users/mohammad/WebstormProjects/harekat/harekat-dashboard/dashboard/docs/`

## 4. Current Implementation State
- Backend running on `http://localhost:3000` (SQLite `database.db`, verified live).
- APIs thoroughly mapped and documented in `API_MAP.md`.
- Isolated dashboard scaffold initialized under `dashboard/`.
- React + Material UI (MUI) architecture with JavaScript only (`.js`, `.jsx`).
- No TypeScript files (`.ts`, `.tsx`, `tsconfig.json`) anywhere in dashboard.
- Zero modifications made to any existing project files in `harekat-landing`, `harekat-backend`, or root `harekat-dashboard`.

## 5. Authentication Mechanism & Landing Page Integration
- **Primary Auth Portal:** User authentication occurs on the **Landing Page** (`/auth`).
- **Post-Login Redirection:** After validating OTP (`POST /api/v1/auth/validate-otp`), the landing page sets the auth token and redirects to this dashboard (e.g. `/dashboard`, `/?token=<jwt>`, or shared `localStorage`).
- **Token Ingestion in Dashboard:**
  - `AuthContext.jsx` automatically scans `window.location.search` (`?token=...`, `?auth_token=...`, `?jwt=...`) and `window.location.hash` (`#token=...`) on startup.
  - If a token is provided in the URL, it persists it into `localStorage`, decodes the JWT payload to extract `userId`, immediately loads the user's profile and enrolled courses via `GET /api/v1/users/:id`, and cleans the URL via `window.history.replaceState`.
  - If no token is in the URL, it reads `localStorage.getItem('token')`.
- **Unauthenticated Handling:** If a user accesses protected dashboard pages without a valid token, `RequireAuth.jsx` seamlessly redirects them to the Landing Page login URL (`${LANDING_URL}/auth`).
- **Logout:** Clears `localStorage` and redirects to the Landing Page root.

## 6. Architecture & Technology Stack
- **Framework:** React 19 + Vite 8
- **UI Library:** Material UI (MUI v6 with Emotion)
- **Icons:** Material UI Icons (`@mui/icons-material`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Language:** JavaScript only (`.js`, `.jsx`) — STRICTLY NO TYPESCRIPT
- **State Management:** React Context (`AuthContext`, `CartContext`, `NotificationContext`)
- **API Client:** Native fetch with auto-bearer auth, error normalization, asset URL resolution, and mandatory `x-session-id` header.

## 7. Design Reference
- Reference Image: `https://cdn.dribbble.com/userupload/29264810/file/original-a98838525fe61645754c091333ecd0f8.png?resize=752x&vertical=center`
- Visual Characteristics:
  - Floating high-radius white surface (`border-radius: 32px`) on a soft neutral slate background (`#edf1f7`).
  - Left Sidebar featuring user progress card (points, milestones 100/200/300, medal, "My progress >" link), clean categorized navigation ("MY STUDY", "SUPPORT").
  - Top Header with brand logo, breadcrumb / active context, chat badge, notification popover with "+8 points for homework", and user avatar.
  - Main Content with "All lessons", superfocus toggle, and kanban-style categorized progress columns:
    - SOON (upcoming lessons with date/time)
    - IN PROGRESS (active lessons with card lift, action buttons, playtime, quiz prompts)
    - ON CHECK (submitted/pending reviews)
    - COMPLETED (finished lessons with scores e.g. 20/20)

## 8. Non-Negotiable Constraints
1. **DO NOT MODIFY EXISTING FILES:** All files in `harekat-landing/`, `harekat-backend/`, and preexisting root files must never be modified. All LMS work is strictly isolated in `dashboard/`.
2. **JAVASCRIPT ONLY:** Strictly `.js` and `.jsx`. No `.ts`, `.tsx`, or `tsconfig.json`.
3. **REAL DATA ONLY:** No mock course lists, fake progress percentages, or hardcoded users. Connected to real backend endpoints.
4. **PERSISTENT DOCUMENTATION:** Maintain `PROJECT_CONTEXT.md`, `API_MAP.md`, `IMPLEMENTATION_PLAN.md`, and `PROGRESS.md` after every milestone.

## 9. Route Strategy
- `/login`: Landing page redirect helper with dev fallback.
- `/` & `/dashboard`: Main entry points with token extraction.
- `/overview` & `/dashboard/overview`: Dribbble kanban board with active lessons and status columns.
- `/courses` & `/dashboard/courses`: Enrolled courses & my learning paths.
- `/courses/:id` & `/dashboard/courses/:id`: Course details, video player, syllabus markdown, teacher info.
- `/catalog` & `/dashboard/catalog`: Explore new courses & categories with search/filters.
- `/subscriptions` & `/dashboard/subscriptions`: Subscription plans and active memberships.
- `/orders` & `/dashboard/orders`: Purchase and payment history.
- `/profile` & `/dashboard/profile`: Profile editing and learning statistics.

## 10. Known Backend Nuances & Limitations
1. `GET /cart` requires `x-session-id` header: In `cartController.js`, `req.headers['x-session-id'] || req.body.sessionId` is read without safe navigation on GET requests. Supplying `x-session-id` prevents this TypeError.
2. Orders Coupon Handling: In `ordersController.js`, coupon code is accepted and stored, but backend discount computation inside `createOrder` is currently a stub; coupon calculation can be validated via `POST /coupons/validate`.
3. Course Level Enum: Course levels in backend are restricted to `['', 'پایه', 'مقدماتی', 'پیشرفته', 'مبتدی']`.

## 11. What the Next Agent Should Do
- Check `PROGRESS.md` for `Next exact step`.
- Run `npm run build` inside `dashboard/` to verify zero build errors.
- Continue testing with real users or adding features as requested.
