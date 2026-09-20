# Harekat LMS — Project Context & Implementation Reference

## 1. System Architecture Overview

Harekat LMS is an enterprise multi-role Learning Management System built using JavaScript (ESM).

The codebase is organized into four main modules:

1. **`harekat-backend`**: Node.js Express server running SQLite / Sequelize with multi-domain host routing:
   - `api.domain.tld` or `/api/v1/*` → REST API endpoints
   - `admin.domain.tld` → Serves `harekat-admin/dist`
   - `dashboard.domain.tld` → Serves `harekat-dashboard/dist`
   - `domain.tld` → Serves `harekat-landing/dist`
2. **`harekat-admin`**: React + Material UI (MUI) administration and teaching assistant (TA) panel.
3. **`harekat-dashboard`**: React + Material UI (MUI) student learning dashboard.
4. **`harekat-landing`**: React + Tailwind/Framer storefront and landing page.

---

## 2. Core LMS Capabilities Implemented

### A. TA Ownership Model & Server-Side Course Isolation
- **Role Hierarchy**:
  - `superadmin` / `admin`: Full global system access across all courses, users, orders, payments, coupons, and system settings.
  - `ta` (Teaching Assistant): Strictly scoped to courses assigned via `TACourses`. TAs can only manage sessions, assignments, quizzes, final exams, student grades, and certificates for their assigned courses.
- **Middleware**:
  - `checkTaCourseAccess`: Verifies that a TA is assigned to the course referenced in params/body.
  - `checkTaAssignmentAccess`: Resolves the parent course of an assignment and enforces TA scoping.
  - `checkTaQuizAccess`: Resolves the parent course of a quiz and enforces TA scoping.

### B. Assignments & Submissions
- **Models**: `Assignments`, `AssignmentSubmissions`.
- **Capabilities**:
  - TAs and Admins can create assignments with title, description, max score, due date, and file attachments.
  - Students can view assignments for their enrolled courses, submit answers with text and attachment links, and view graded scores with teacher feedback.
  - TAs can review student submissions, grade them, and provide feedback.

### C. Quizzes & Automatic Grading
- **Models**: `Quizzes`, `QuizAttempts`.
- **Capabilities**:
  - TAs and Admins can build multiple-choice quizzes with custom duration, passing threshold, and question options.
  - Student payload redacts the correct option index during quiz taking.
  - Server evaluates answers upon submission, computes score percentage, and marks attempt as passed or failed.

### D. Final Exams & Certification
- **Models**: `Exams`, `ExamResults`, `Licenses`.
- **Capabilities**:
  - Final exams can be submitted by students upon course completion.
  - Certificates (`Licenses`) are issued manually or automatically upon exam passing with a unique serial number (`HRK-XXXXXX-XXXX`).
  - Public verification endpoint `GET /api/v1/licenses/verify/:licenseNumber` allows anyone to verify authentic certificates.

### E. Instructor Evaluation Gate
- **Models**: `CourseEvaluations`, `CourseEvaluationResponses`, and columns in `Courses` (`evaluationRequired`, `evaluationTriggerSession`).
- **Gate Logic**:
  - Configurable per course. When `evaluationRequired` is true, sessions at or beyond `evaluationTriggerSession` (default 4) are marked `isLocked: true`, and stream URLs are redacted (`null`) by the backend until the student submits the course evaluation form (`overallRating`, `teachingRating`, `contentRating`, `feedback`).
  - AccessService checks evaluation status in `checkCourseProgressAccess`.

### F. Dual RSA Authentication Flow
- **Challenge-Response**: Challenge requested via `POST /api/v1/admins/auth/challenge`, signed in browser via WebCrypto `window.crypto.subtle`, and verified via `POST /api/v1/admins/auth/rsa-login`.
- **Direct Fallback**: For plain HTTP contexts where `window.crypto.subtle` is unavailable in browsers, fallback to `POST /api/v1/admins/auth/rsa-direct-login`.

---

## 3. Database Models & Schema

- **Users**: Student accounts (phone number OTP authentication).
- **Admins**: Superadmin and TA accounts (passwords + optional RSA-2048 keys).
- **Courses**: Courses with pricing, categories, teachers, and evaluation gate settings.
- **Sessions**: Video sessions with links, attachments, drive links, and porsline links.
- **TACourses**: Association table between TAs and Courses.
- **Assignments** & **AssignmentSubmissions**: Course assignments and student submissions.
- **Quizzes** & **QuizAttempts**: Quizzes and student attempt scores.
- **Exams** & **ExamResults**: Final exams and graded results.
- **Licenses**: Official course completion certificates.
- **CourseEvaluations** & **CourseEvaluationResponses**: Instructor and course feedback responses.
- **Orders**, **Payments**, **Coupon**, **Subscriptions**, **Tickets**, **Notifications**, **Banners**, **SiteContent**, **HeaderMenu**.

---

## 4. Verification & Testing

To run the full backend test suite:
```bash
cd harekat-backend
npm test
```

To build all frontend projects:
```bash
cd harekat-admin && npm run build
cd ../harekat-dashboard && npm run build
cd ../harekat-landing && npm run build
```

To run the backend with PM2 in staging/production:
```bash
cd harekat-backend
pm2 start ecosystem.config.cjs
```
