# Harekat LMS Dashboard — Technical Decisions Log

## Decision 1: Complete Isolation in `dashboard/` Directory
- **Context:** The prompt strictly forbids modifying, deleting, renaming, or refactoring existing project files.
- **Decision:** Place all LMS Dashboard files, configs, and documentation inside a self-contained subdirectory `dashboard/`.
- **Outcome:** The existing Landing Page, Backend, and root files remain 100% untouched.

## Decision 2: JavaScript Only (.js/.jsx)
- **Context:** Rule 2 explicitly forbids TypeScript (`.ts`, `.tsx`, `tsconfig.json`).
- **Decision:** Use modern ECMAScript with JSX for all components and modules.

## Decision 3: Material UI (MUI) Customized for Dribbble Reference
- **Context:** Must be React + MUI, but must closely replicate the provided Dribbble design reference rather than looking like standard stock MUI.
- **Decision:** Customize the MUI Theme (`theme.js`) with custom component overrides (`MuiCard`, `MuiButton`, `MuiChip`, `MuiPaper`), soft multi-layered box-shadows, high border radiuses (16px to 32px), pill badges, and the warm educational color palette (slate neutral background `#eef2f6`, white floating container, blue/orange brand accents).

## Decision 4: Handling Lessons & Progress with Real Backend Data
- **Context:** In `harekat-backend`, courses have `videoUrl`, `duration`, `longDescription`, `level`, and `typeOfAttendence`. There is no separate SQL `lessons` table; `longDescription` holds the syllabus and `videoUrl` holds the video material.
- **Decision:** To accurately present the Dribbble kanban layout ("All lessons" in SOON, IN PROGRESS, ON CHECK, COMPLETED):
  1. Map the user's enrolled courses (`GET /users/:id` -> `courses`) to active learning items.
  2. Parse course chapters / modules from the syllabus and course metadata to populate real lesson cards with true course data (names, durations, teachers, and video links).
  3. Support persistent client-side completion tracking for lessons, synced with the user session.
  4. Ensure all catalog courses, subscriptions, and orders are 100% real backend records.

## Decision 5: Mandatory `x-session-id` on All API Requests
- **Context:** In `harekat-backend/src/controllers/cartController.js`, `req.headers['x-session-id'] || req.body.sessionId` is read. On GET requests without `req.body`, this can throw a TypeError if the header is absent.
- **Decision:** Generate a UUID in `localStorage.getItem('cartSessionId')` and attach it as `x-session-id` on every API call.
