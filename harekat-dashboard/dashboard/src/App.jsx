import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import RequireAuth from './components/common/RequireAuth.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx';
import MyCoursesPage from './pages/MyCoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import SubscriptionsPage from './pages/SubscriptionsPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import SupportPage from './pages/SupportPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="courses" element={<MyCoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="faq" element={<FaqPage />} />
        <Route path="support" element={<SupportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
