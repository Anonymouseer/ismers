import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthStore';

/**
 * ModuleRoute — Enforces module-level RBAC on top of authentication.
 * If the logged-in user does not have access to the given moduleKey,
 * they are redirected to their assigned defaultRoute instead of seeing the page.
 *
 * @param {string}    moduleKey  - The module key to check (e.g. 'recruitment-selection')
 * @param {ReactNode} children   - The page component to render if access is granted
 */
export default function ModuleRoute({ moduleKey, children }) {
  const { user, canAccess } = useAuth();

  if (!canAccess(moduleKey)) {
    // Redirect to the user's own default module, not a generic 404
    const fallback = user?.defaultRoute || '/client-management';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
