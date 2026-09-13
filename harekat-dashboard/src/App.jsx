import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Overview from './pages/Overview.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import Orders from './pages/Orders.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const to = isAuthenticated ? '/overview' : '/login';
  return <Navigate to={to} state={{ from: location }} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/overview"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
      </Route>
      <Route
        path="/courses"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Courses />} />
        <Route path=":id" element={<CourseDetail />} />
      </Route>
      <Route
        path="/subscriptions"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Subscriptions />} />
      </Route>
      <Route
        path="/orders"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Orders />} />
      </Route>
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
