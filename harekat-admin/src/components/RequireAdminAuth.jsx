import { useEffect, useState, useCallback } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAdminAuthenticated, getTokenExpiry, adminLogout } from '../services/api.js';

export default function RequireAdminAuth({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(() => isAdminAuthenticated());

  const handleExpired = useCallback(() => {
    adminLogout();
    setAuthenticated(false);
    navigate('/login', { replace: true, state: { from: location, expired: true } });
  }, [navigate, location]);

  useEffect(() => {
    // 1. Initial check on mount or path change
    if (!isAdminAuthenticated()) {
      handleExpired();
      return;
    }

    // 2. Schedule timeout for the exact moment the JWT token expires
    const msLeft = getTokenExpiry();
    let timeoutId;
    if (msLeft > 0) {
      timeoutId = setTimeout(() => {
        handleExpired();
      }, msLeft);
    } else {
      handleExpired();
      return;
    }

    // 3. Periodic safety check every 3 seconds
    const intervalId = setInterval(() => {
      if (!isAdminAuthenticated()) {
        handleExpired();
      }
    }, 3000);

    // 4. Focus and visibilitychange listener (user returns to tab or wakes computer)
    const onFocusOrVisible = () => {
      if (!isAdminAuthenticated()) {
        handleExpired();
      }
    };
    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', onFocusOrVisible);

    // 5. Unauthorized event dispatched by API interceptor
    const onUnauthorized = () => {
      handleExpired();
    };
    window.addEventListener('admin:unauthorized', onUnauthorized);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocusOrVisible);
      document.removeEventListener('visibilitychange', onFocusOrVisible);
      window.removeEventListener('admin:unauthorized', onUnauthorized);
    };
  }, [location.pathname, handleExpired]);

  // Synchronous guard during render:
  // If not authenticated, NEVER render children (no AdminLayout, no Outlet, no admin pages)
  if (!authenticated || !isAdminAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location, expired: true }} />;
  }

  return children;
}
