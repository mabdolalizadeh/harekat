# Harekat LMS Dashboard — Implementation Plan

Legend:
- `[ ]` Not started
- `[-]` In progress
- `[x]` Completed

---

## Phase 1: Backend Analysis
- [x] Inspect routes, controllers, middleware, models in `harekat-backend`
- [x] Verify API responses live against port 3000
- [x] Document authentication endpoints (`/auth`, `/auth/validate-otp`)
- [x] Document user, courses, categories, cart, orders, subscriptions, banners
- [x] Create comprehensive `API_MAP.md`

## Phase 2: Existing Frontend Analysis
- [x] Read existing `harekat-landing` setup (React 19, Vite, API patterns)
- [x] Verify no changes needed to existing files
- [x] Note asset URL patterns, session ID generation, local storage keys

## Phase 3: Design Reference Analysis
- [x] Download and inspect Dribbble reference (`original-a98838525fe61645754c091333ecd0f8.png`)
- [x] Extract color palette, border radius, typography, layout cards, header popover
- [x] Map LMS data to the reference layout (lessons kanban, points, rubies, notifications)

## Phase 4: Dashboard Architecture & Setup
- [x] Initialize isolated `dashboard/` directory
- [x] Set up `package.json` with React, MUI, Emotion, React Router DOM (NO TypeScript)
- [x] Configure `vite.config.js` with API proxy to port 3000
- [x] Install dependencies cleanly
- [x] Create MUI theme matching the reference design (rounded radii, custom palette, shadows)

## Phase 5: Core API Client & Authentication
- [x] Implement `src/api/client.js` with Bearer auth and `x-session-id`
- [x] Implement `src/contexts/AuthContext.jsx` (login, OTP validation, user state, persistence, logout)
- [x] Implement `src/contexts/CartContext.jsx` (cart sync, add item, update, remove, clear)
- [x] Implement `src/contexts/NotificationContext.jsx` (notification dropdown state)
- [x] Create `LoginPage.jsx` (phone entry + OTP verification with dev convenience)

## Phase 6: Reference-Based Layout Components
- [x] Implement `Sidebar.jsx` with user progress card (points, milestones 100/200/300, medal, study links)
- [x] Implement `Header.jsx` with breadcrumb context, chat badge, notification popover, and avatar
- [x] Implement `DashboardLayout.jsx` with floating rounded container on soft background
- [x] Implement responsive mobile navigation drawer and collapse toggle

## Phase 7: Dashboard Overview Page (Dribbble Reference Fidelity)
- [x] Header banner with active course & context
- [x] Kanban columns by status: SOON, IN PROGRESS, ON CHECK, COMPLETED
- [x] Lesson cards with playtime, tags, action buttons (play, exercise, resources)
- [x] Live data integration: enrolled courses from `GET /users/:id`, courses from `GET /courses`
- [x] Interactive lesson modal / player preview
- [x] Superfocus mode toggle

## Phase 8: Courses & Learning Management
- [x] Implement `MyCoursesPage.jsx` (enrolled courses with real progress)
- [x] Implement `CourseDetailPage.jsx` (video player, teacher details, longDescription markdown syllabus, enrollment/cart action)
- [x] Implement `CatalogPage.jsx` (course catalog with category tabs, search, price formatting)

## Phase 9: Subscriptions, Cart & Orders
- [x] Implement `SubscriptionsPage.jsx` (monthly/annual plans from `GET /subscriptions`)
- [x] Implement `CartDrawer.jsx` (slide-out cart, quantity adjustment, coupon validation, checkout via `POST /orders`)
- [x] Implement `OrdersPage.jsx` (orders list with status badges, line items, order detail modal)

## Phase 10: Profile & Account Settings
- [x] Implement `ProfilePage.jsx` (edit first name, last name, phone number, avatar URL)
- [x] Save profile via `PUT /users/:id` and reflect in real time
- [x] Display learning achievements and points

## Phase 11: Error, Loading & Empty States
- [x] Implement MUI skeleton/spinners for cards and lists
- [x] Implement graceful error alerts and feedback
- [x] Implement friendly empty states for no courses, empty cart, and no orders

## Phase 12: Production Build & Git Milestone Commits
- [x] Verify `npm run build` succeeds without warnings/errors
- [x] Test dev server and all user journeys
- [x] Verify zero modified files outside `dashboard/`
- [x] Maintain `PROGRESS.md` with exact next steps
