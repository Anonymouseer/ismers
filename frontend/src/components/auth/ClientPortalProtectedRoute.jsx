import { Navigate, useLocation } from 'react-router-dom';

/**
 * ClientPortalProtectedRoute — Route guard for the PRIMEPOWER Client Portal.
 * Unauthenticated visitors are redirected to /client-portal/login with the
 * attempted path preserved in location state for seamless post-login redirect.
 */
export default function ClientPortalProtectedRoute({ children }) {
  const location = useLocation();

  let isAuthenticated = false;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('cp_session');
      if (raw) {
        const session = JSON.parse(raw);
        if (session && (session.loggedIn || session.email || session.company || session.id)) {
          isAuthenticated = true;
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/client-portal/login" state={{ from: location }} replace />;
  }

  return children;
}
