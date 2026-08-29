import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthStore';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 * Unauthenticated visitors are redirected to /login with the
 * attempted path preserved in location state for post-login redirect.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
