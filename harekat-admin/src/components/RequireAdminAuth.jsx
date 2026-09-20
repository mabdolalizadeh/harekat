import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../services/api.js';

export default function RequireAdminAuth({ children }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
