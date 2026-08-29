import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthStore';

/**
 * ProtectedRoute — Guards all internal pages behind authentication.
 * Unauthenticated users are redirected to /login, preserving their intended destination.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
