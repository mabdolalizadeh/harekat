import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import RequireAuth from './components/common/RequireAuth.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import MyCoursesPage from './pages/MyCoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import PackagesPage from './pages/PackagesPage.jsx';
import SubscriptionsPage from './pages/SubscriptionsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import FaqPage from './pages/FaqPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Main LMS Dashboard Routes (Student Panel) */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/overview" replace />} />
        {/* The 7 Canonical Student Panel Views */}
        <Route path="overview" element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="tickets" element={<SupportPage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="payments" element={<OrdersPage />} />

        {/* Aliases for links and redirections */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="catalog" element={<Navigate to="/courses" replace />} />
        <Route path="faq" element={<FaqPage />} />
      </Route>

      {/* Direct /dashboard routes to support landing page redirects */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="tickets" element={<SupportPage />} />
        <Route path="packages" element={<PackagesPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="payments" element={<OrdersPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="catalog" element={<Navigate to="/courses" replace />} />
        <Route path="faq" element={<FaqPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
