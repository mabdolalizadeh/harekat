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

## 5. Authentication Mechanism
- Flow: SMS OTP (Phone Number -> OTP -> JWT Token).
- Request OTP: `POST /api/v1/auth` with `{ phoneNumber }`.
- Validate OTP: `POST /api/v1/auth/validate-otp` with `{ phoneNumber, otp }`.
- Token Storage: `localStorage.getItem('token')` as Bearer token in `Authorization` header.
- Current User: `GET /api/v1/users/:id` using `user.id` obtained from login response.
- Local Dev Note: OTP is bypassed with `123456` or returned in the API response during development.

## 6. Architecture & Technology Stack
- **Framework:** React 19 + Vite 8
- **UI Library:** Material UI (MUI v6 / v7 with Emotion)
- **Icons:** Material UI Icons (`@mui/icons-material`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Language:** JavaScript only (`.js`, `.jsx`) — STRICTLY NO TYPESCRIPT
- **State Management:** React Context (`AuthContext`, `CartContext`, `NotificationContext`)
- **API Client:** Native fetch with auto-bearer auth, error normalization, asset URL resolution, and mandatory `x-session-id` header.

## 7. Design Reference
- Reference Image: `https://cdn.dribbble.com/userupload/29264810/file/original-a98838525fe61645754c091333ecd0f8.png?resize=752x&vertical=center`
- Visual Characteristics:
  - Floating high-radius white surface (`border-radius: 32px`) on a soft neutral slate background (`#eef2f6`).
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

## 9. Current Route Strategy
- `/login`: Dedicated phone OTP login page.
- `/`: Redirects to `/overview` if authenticated, else `/login`.
- `/overview`: Main dashboard overview following the Dribbble layout (study stats, active lessons kanban, enrolled courses).
- `/courses`: Enrolled courses & my learning paths.
- `/courses/:id`: Course details, video player, syllabus markdown, teacher info.
- `/catalog`: Explore new courses & categories with search/filters.
- `/subscriptions`: Subscription plans and active memberships.
- `/orders`: Purchase and payment history.
- `/profile`: Profile editing (name, phone, avatar) and learning statistics.

## 10. Known Backend Nuances & Limitations
1. `GET /cart` requires `x-session-id` header: In `cartController.js`, `req.body.sessionId` is checked without safe navigation on GET requests. Supplying `x-session-id` in all requests prevents this TypeError.
2. Orders Coupon Handling: In `ordersController.js`, coupon code is accepted and stored, but backend discount computation inside `createOrder` is currently a stub; coupon calculation can be validated via `POST /coupons/validate`.
3. Course Level Enum: Course levels in backend are restricted to `['', 'پایه', 'مقدماتی', 'پیشرفته', 'مبتدی']`.

## 11. What the Next Agent Should Do
- Check `PROGRESS.md` for `Next exact step`.
- Run `npm run build` inside `dashboard/` to verify zero build errors.
- Continue implementing the next scheduled phase in `IMPLEMENTATION_PLAN.md`.
