import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import RequireAdminAuth from './components/RequireAdminAuth.jsx';

// Lazy-loaded pages for optimal performance and chunking
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons.jsx'));
const AdminHeader = lazy(() => import('./pages/admin/AdminHeader.jsx'));
const AdminContent = lazy(() => import('./pages/admin/AdminContent.jsx'));
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers.jsx'));
const AdminMarquee = lazy(() => import('./pages/admin/AdminMarquee.jsx'));
const AdminSubscriptions = lazy(() => import('./pages/admin/AdminSubscriptions.jsx'));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents.jsx'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments.jsx'));
const AdminTickets = lazy(() => import('./pages/admin/AdminTickets.jsx'));
const AdminExams = lazy(() => import('./pages/admin/AdminExams.jsx'));
const AdminLicenses = lazy(() => import('./pages/admin/AdminLicenses.jsx'));
const AdminTAs = lazy(() => import('./pages/admin/AdminTAs.jsx'));

function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        width: '100%',
      }}
    >
      <CircularProgress size={36} thickness={4} />
    </Box>
  );
}

export default function App({ mode, onToggleTheme }) {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/"
        element={
          <RequireAdminAuth>
            <AdminLayout mode={mode} onToggleTheme={onToggleTheme} />
          </RequireAdminAuth>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="students"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminStudents />
            </Suspense>
          }
        />
        <Route
          path="courses"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts defaultTab="products" />
            </Suspense>
          }
        />
        <Route
          path="capsules"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts defaultTab="capsule" />
            </Suspense>
          }
        />
        <Route
          path="packages"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts defaultTab="skill" />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts defaultTab="categories" />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminProducts />
            </Suspense>
          }
        />
        <Route
          path="subscriptions"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminSubscriptions />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminOrders />
            </Suspense>
          }
        />
        <Route
          path="payments"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminPayments />
            </Suspense>
          }
        />
        <Route
          path="tickets"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminTickets />
            </Suspense>
          }
        />
        <Route
          path="exams"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminExams />
            </Suspense>
          }
        />
        <Route
          path="licenses"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminLicenses />
            </Suspense>
          }
        />
        <Route
          path="tas"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminTAs />
            </Suspense>
          }
        />
        <Route
          path="teachers"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminTeachers />
            </Suspense>
          }
        />
        <Route
          path="coupons"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminCoupons />
            </Suspense>
          }
        />
        <Route
          path="marquee"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminMarquee />
            </Suspense>
          }
        />
        <Route
          path="banners"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminBanners />
            </Suspense>
          }
        />
        <Route
          path="header"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminHeader />
            </Suspense>
          }
        />
        <Route
          path="content"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminContent />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<PageLoader />}>
              <AdminSettings />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
