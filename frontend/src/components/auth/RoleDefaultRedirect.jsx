import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthStore';

/**
 * RoleDefaultRedirect — Redirects the root "/" path to the logged-in user's
 * assigned default module so each role lands on the right page automatically.
 */
export default function RoleDefaultRedirect() {
  return <Navigate to="/dashboard" replace />;
}
