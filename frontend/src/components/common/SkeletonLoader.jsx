import { useLocation } from 'react-router-dom';
import './SkeletonLoader.css';

/**
 * Resolves the appropriate skeleton variant based on current URL route and search parameters.
 */
export function getSkeletonVariantForRoute(pathname, search) {
  if (!pathname || pathname === '/' || pathname.includes('dashboard')) {
    return 'dashboard';
  }
  if (pathname.includes('client-management')) {
    return 'table';
  }
  if (pathname.includes('deployment-assignment')) {
    return 'table';
  }
  if (pathname.includes('applicant-registration/register') || (pathname.includes('applicant-registration') && search?.includes('view=register'))) {
    return 'form';
  }
  if (pathname.includes('applicant-registration')) {
    if (search && search.includes('view=') && !search.includes('view=all')) {
      return 'table';
    }
    return 'board';
  }
  if (pathname.includes('recruitment-selection')) {
    if (search && search.includes('stage=')) {
      return 'table';
    }
    return 'board';
  }
  if (pathname.includes('job-order-management')) {
    if (search && search.includes('view=board')) {
      return 'board';
    }
    return 'table';
  }
  if (pathname.includes('ai-analytics')) {
    return 'analytics';
  }
  if (pathname.includes('settings') || pathname.includes('profile')) {
    return 'form';
  }
  return 'table';
}

export default function SkeletonLoader({
  variant = 'auto',
  rows = 7,
  columns = 4,
  title,
  subtitle,
  showHeader = true,
  showFilter = true,
}) {
  const location = useLocation();
  const activeVariant =
    variant === 'auto'
      ? getSkeletonVariantForRoute(location.pathname, location.search)
      : variant;

  return (
    <div className="skeleton-wrapper" aria-busy="true" aria-label="Loading module interface">
      {showHeader && (
        <div className="skel-header">
          <div className="skel-header-left">
            <div className="skeleton-shimmer-block skel-title" />
            <div className="skeleton-shimmer-block skel-subtitle" />
          </div>
          <div className="skeleton-shimmer-block skel-header-right" />
        </div>
      )}

      {/* ── VARIANT: DASHBOARD ── */}
      {activeVariant === 'dashboard' && (
        <>
          <div className="skel-dash-cards">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer-block skel-dash-card" />
            ))}
          </div>
          <div className="skeleton-shimmer-block skel-dash-bar" />
          <div className="skel-dash-charts">
            <div className="skeleton-shimmer-block skel-dash-chart" />
            <div className="skeleton-shimmer-block skel-dash-chart" />
            <div className="skeleton-shimmer-block skel-dash-chart" />
          </div>
        </>
      )}

      {/* ── VARIANT: TABLE (Clients, Deployments, Job Orders) ── */}
      {activeVariant === 'table' && (
        <>
          {showFilter && (
            <div className="skel-filter-bar">
              <div className="skeleton-shimmer-block skel-search-input" />
              <div className="skeleton-shimmer-block skel-chip" />
              <div className="skeleton-shimmer-block skel-chip" />
            </div>
          )}
          <div className="skel-table-container">
            <div className="skeleton-shimmer-block skel-table-head" />
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="skeleton-shimmer-block skel-table-row" />
            ))}
          </div>
        </>
      )}

      {/* ── VARIANT: BOARD (Recruitment, Applicant Registration, Job Kanban) ── */}
      {activeVariant === 'board' && (
        <>
          {showFilter && (
            <div className="skel-filter-bar">
              <div className="skeleton-shimmer-block skel-search-input" />
              <div className="skeleton-shimmer-block skel-chip" />
              <div className="skeleton-shimmer-block skel-chip" />
            </div>
          )}
          <div className="skeleton-shimmer-block skel-stages-strip" />
          <div className="skel-board-columns">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <div key={colIdx} className="skel-column">
                <div className="skeleton-shimmer-block skel-col-header" />
                <div className="skeleton-shimmer-block skel-col-card" />
                <div className="skeleton-shimmer-block skel-col-card" />
                <div className="skeleton-shimmer-block skel-col-card" />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── VARIANT: ANALYTICS (AI Intelligence, Candidate Scoring) ── */}
      {activeVariant === 'analytics' && (
        <>
          <div className="skel-analytics-cards">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton-shimmer-block skel-analytics-card" />
            ))}
          </div>
          <div className="skel-analytics-grid">
            <div className="skeleton-shimmer-block skel-analytics-chart" />
            <div className="skeleton-shimmer-block skel-analytics-chart" />
          </div>
        </>
      )}

      {/* ── VARIANT: FORM (Settings, User Profile, Registration) ── */}
      {activeVariant === 'form' && (
        <div className="skel-form-container">
          <div className="skeleton-shimmer-block skel-form-card" />
          <div className="skeleton-shimmer-block skel-form-card" />
        </div>
      )}
    </div>
  );
}
