# Harekat LMS Dashboard — Architecture

## 1. Directory Structure

```text
dashboard/
├── docs/                      # Persistent agent context & specifications
│   ├── PROJECT_CONTEXT.md
│   ├── API_MAP.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── PROGRESS.md
│   ├── ARCHITECTURE.md
│   └── DECISIONS.md
├── public/                    # Static assets (favicons, icons)
├── src/
│   ├── api/                   # Normalized API client & endpoint modules
│   │   ├── client.js          # Base fetch wrapper, bearer auth, session handling
│   │   ├── authApi.js         # OTP request & validation
│   │   ├── coursesApi.js      # Courses & categories
│   │   ├── cartApi.js         # Shopping cart operations
│   │   ├── ordersApi.js       # Orders & checkout
│   │   ├── subscriptionsApi.js# Membership & subscription plans
│   │   └── userApi.js         # User profile & progress
│   ├── contexts/              # Global application state via React Context
│   │   ├── AuthContext.jsx    # User session, JWT token, login/logout
│   │   ├── CartContext.jsx    # Shopping cart items, drawer state, add/remove
│   │   └── NotificationContext.jsx # Notification badge & popover items
│   ├── theme/                 # Material UI theme customizations
│   │   └── theme.js           # Palette, rounded shapes (32px, 20px, pills), typography
│   ├── layouts/               # High-level layouts
│   │   ├── DashboardLayout.jsx# Floating card container, responsive sidebar & header
│   │   ├── Sidebar.jsx        # User progress widget + navigation links
│   │   └── Header.jsx         # Breadcrumb, chat, notifications popover, avatar
│   ├── components/            # Reusable UI components
│   │   ├── common/            # StatCard, StatusBadge, NotificationPopover, States
│   │   ├── courses/           # LessonKanban, CourseCard, SyllabusViewer
│   │   └── cart/              # CartDrawer, OrderSummary
│   ├── pages/                 # Route views
│   │   ├── LoginPage.jsx      # Mobile OTP login with dev helper
│   │   ├── OverviewPage.jsx   # Dribbble-inspired overview with lesson kanban
│   │   ├── MyCoursesPage.jsx  # Enrolled courses list
│   │   ├── CourseDetailPage.jsx # Video player, teacher info, syllabus
│   │   ├── CatalogPage.jsx    # Explore all courses & filter by category
│   │   ├── SubscriptionsPage.jsx # Subscriptions list
│   │   ├── OrdersPage.jsx     # Purchase history
│   │   └── ProfilePage.jsx    # Edit personal info & stats
│   ├── utils/                 # Utility helpers (pricing, dates, assets)
│   ├── App.jsx                # Router & protected route guards
│   └── main.jsx               # Root entry with ThemeProvider & CssBaseline
├── index.html                 # HTML shell with Vazirmatn font
├── vite.config.js             # Vite configuration with /api/v1 proxy
└── package.json               # JavaScript only, React 19 + MUI 6/7
```

## 2. Component Design Principles
1. **Isolated Responsibilities:** Pages fetch data through Context or API services; components receive clean props.
2. **Design Fidelity:** Custom styled MUI components recreate the Dribbble reference (rounded 24px/32px corners, soft shadows, pill badges).
3. **Graceful Loading & Fallbacks:** Every data-fetching screen includes Skeleton loaders and friendly empty states.
4. **Resilience:** If user has no enrolled courses yet, the dashboard shows quick action to explore catalog and continue learning.
