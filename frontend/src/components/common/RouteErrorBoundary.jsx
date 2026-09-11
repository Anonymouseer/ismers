import { useRouteError, isRouteErrorResponse, Link, useNavigate } from 'react-router-dom';
import primepowerLogo from '../../assets/primepower-logo.svg';
import './RouteErrorBoundary.css';

/**
 * Corporate Error Boundary for PRIMEPOWER MANPOWER HR System.
 * Adheres strictly to enterprise guidelines: no emojis, executive styling, clear navigation recovery.
 */
export default function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let statusCode = 500;
  let title = 'System Application Error';
  let description = 'An unexpected exception occurred while rendering the requested view. Please try again or return to the main dashboard.';

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = '404 — Page or Feature Not Found';
      description = 'The requested resource or module path could not be located on the PRIMEPOWER HR Smart Recruitment System.';
    } else if (error.status === 401 || error.status === 403) {
      title = 'Access Restricted';
      description = 'You do not have the required authorization or permissions to view this internal module.';
    } else {
      title = `Error ${error.status}: ${error.statusText || 'Application Notice'}`;
      description = error.data?.message || description;
    }
  } else if (error instanceof Error) {
    description = error.message || description;
  }

  return (
    <div className="error-boundary-shell" id="error-boundary-root">
      <div className="error-boundary-card">
        <div className="error-boundary-brand">
          <img src={primepowerLogo} alt="PRIMEPOWER MANPOWER" className="error-boundary-logo" />
          <div className="error-boundary-brand-text">
            <span className="error-boundary-company">PRIMEPOWER MANPOWER SERVICES</span>
            <span className="error-boundary-sub">HR Smart Recruitment System</span>
          </div>
        </div>

        <div className="error-boundary-divider" />

        <div className="error-boundary-badge">Status {statusCode}</div>

        <h1 className="error-boundary-title">{title}</h1>
        <p className="error-boundary-desc">{description}</p>

        <div className="error-boundary-actions">
          <button
            type="button"
            className="error-btn error-btn--primary"
            onClick={() => navigate('/dashboard')}
          >
            Go to HR Dashboard
          </button>
          <button
            type="button"
            className="error-btn error-btn--secondary"
            onClick={() => navigate('/')}
          >
            Corporate Home
          </button>
          <button
            type="button"
            className="error-btn error-btn--ghost"
            onClick={() => window.location.reload()}
          >
            Reload Window
          </button>
        </div>

        <div className="error-boundary-footer">
          Technical Support: IT Operations Desk &bull; Enterprise HRIS Platform
        </div>
      </div>
    </div>
  );
}
