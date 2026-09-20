# Agent Progress — Harekat LMS Full System Integration & Audit Fixes

## System Overview & Architecture
The Harekat LMS project is a unified modern learning management system composed of four applications:
1. **`harekat-backend`**: Node.js ESM / Express 5 REST API using SQLite3 (`database.db`) via Sequelize ORM.
2. **`harekat-landing`**: Public React + Vite showcase portal (Courses, Skill Packages, Subscriptions, Mentors, Cart Drawer).
3. **`harekat-dashboard`**: Student React + Vite LMS workspace (Overview, My Courses, Course Detail & Video Player, Exam Submissions, Notifications, Orders & Invoices, Dark Mode).
4. **`harekat-admin`**: SuperAdmin & TA administrative control center (Course Management, Sessions, Exam Grading, Role-Based Access Control, Admin Notifications, Content Management).

---

## Completed Implementations & Audit Fixes

### 1. Test OTP & Authentication Security
- **OTP Console Logging**: Configured clear console logging: `[TEST OTP] Phone: <phone> OTP: <code>` in `authController.js`.
- **Response Privacy**: Completely removed `otp` and `code` fields from all HTTP responses (Login, Register, and Phone change).
- **Session Duration**: Set `jwtExpiry` and `userJwtExpiry` default to `'7d'`.

### 2. SuperAdmin Account & RBAC Enforcement
- **Single Superadmin Seed**: Seeded exactly one root superadmin:
  - **Username**: `superadmin`
  - **Password**: `superadmin` (bcrypt hashed with salt rounds 10)
  - **Role**: `'superadmin'`
- **Admin Management Security**: Restricted `POST /api/v1/admins` and `POST /api/v1/admins/register` endpoints to `superAdminOnly`.
- **TA Course Boundaries**: Enforced `checkTaCourseAccess` and `checkTaSessionAccess` across course and session editing/deletion endpoints.

### 3. Fake Payment Gateway & Automated Course Provisioning
- **Simulated Bank Gateway**: Built `FakePaymentModal.jsx` and backend `POST /api/v1/payments/fake/process`.
- **Actions**:
  - `[ پرداخت آزمایشی (تایید) ]` (`action: 'pay'`): Marks payment as `paid`, order as `paid`, increments coupon usage count, and invokes `AccessService.grantCourseAccess` / package / subscription provisioning.
  - `[ لغو پرداخت و بازگشت ]` (`action: 'cancel'`): Marks payment as `cancelled` and order as `pending` with safe rollback.
- **Cart & Order Pricing**: Server-side coupon discount calculation (percentage and fixed amounts) based on database records, eliminating client-side price tampering.

### 4. Notification System (SuperAdmin / TA to Students)
- **Backend Architecture**: `Notifications` and `UserNotificationRead` models with relational integrity.
- **Targeting Types**: `'all'`, `'course'`, `'user'`.
- **TA Safety**: TAs can only send notifications to students enrolled in their assigned courses.
- **Sender Attribution**: Correctly tags notifications with `"مدیریت حرکت"` (SuperAdmin) or `"استادیار (نام دوره)"` (TA).
- **Admin Panel**: `AdminNotifications.jsx` with recipient targeting and live compose dialog.
- **Student Dashboard**: `NotificationPopover.jsx` and `NotificationContext.jsx` integrated with real backend API.

### 5. LMS Lesson Progress & Completion Tracking
- **Model**: `UserLessonProgress` with unique compound index `['userId', 'sessionId']`.
- **Endpoints**:
  - `GET /api/v1/sessions/course/:courseId/student`: Returns sessions with student completion states (`isCompleted`, `progressPercent`, `lastWatchedAt`) and overall stats (`totalSessions`, `completedSessions`, `completionPercentage`).
  - `POST /api/v1/sessions/:sessionId/progress`: Upserts progress records with access verification.
- **UI Integration**:
  - `CourseDetailPage.jsx`: Added course progress bar, session completion toggles, and interactive playlist checkmarks.
  - `MyCoursesPage.jsx` & `OverviewPage.jsx`: Connected progress bars and Kanban column states to real backend progress data.

### 6. Dashboard Dark Mode Support
- **Provider**: `ThemeModeContext.jsx` with `localStorage` persistence.
- **Theme Tokens**: `getDashboardTheme(mode)` in `theme.js` supporting both clean light palette and high-contrast dark palette (`#0f172a`, `#1e293b`).
- **Header Toggle**: Added dark mode icon button in `Header.jsx`.

### 7. Full System Audit Checklist Fixes
- **MED-01**: Safe cart session retrieval supporting headers, body, and query parameters.
- **MED-02**: Added `rubies` integer column to `Users` model with migration support.
- **MED-03 & MED-04**: Canonical `typeOfAttendence` (`'آنلاین'`, `'آفلاین'`, `'حضوری'`, `'ترکیبی'`) and `statusOfRegistration` enum validations; added `'متوسط'`, `'همه سطوح'`, `'جامع'` to `Courses.level`.
- **MED-06**: Absolute path for SQLite storage via `path.resolve(__dirname, '../../database.db')`.
- **MED-07**: Server-side coupon discount calculation and canonical course/subscription pricing.
- **MED-08**: Omitted OTP in phone change response.
- **Privilege Escalation**: Blocked student modifications to `courseIds`, `paymentIds`, and `rubies` in `UsersController`.

---

## Test Credentials & Environment

| Role | Username / Identifier | Password / Auth | Purpose |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `superadmin` | `superadmin` | Root admin panel management & system configuration |
| **Student** | Any Iranian Mobile (e.g. `09121112233`) | Test OTP (printed to backend console) | Student dashboard learning, cart checkout & fake payments |
| **TA** | Configured via Admin Panel | Admin Auth Password | Assigned course session & exam management |

---

## Key Ports
- **Backend API**: `http://localhost:3000/api/v1`
- **Landing App**: `http://localhost:5173`
- **Admin Panel**: `http://localhost:5174`
- **Student Dashboard**: `http://localhost:5175`