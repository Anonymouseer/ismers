import { useLocation } from 'react-router-dom';
import './Header.css';

export default function Header({ onToggleMobileMenu }) {
  const location = useLocation();
  const path = location.pathname;

  // Dynamic system breadcrumbs based on route and query parameters
  const getBreadcrumb = () => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (path.includes('client-management')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Management Operations &nbsp;›&nbsp; </span><b>Client Management</b>
        </>
      );
    }
    if (path.includes('job-order-management')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Management Operations &nbsp;›&nbsp; </span><b>Job Order Management</b>
        </>
      );
    }
    if (path.includes('applicant-registration')) {
      if (path.includes('/register')) {
        return (
          <>
            <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Recruitment Operations &nbsp;›&nbsp; </span><b>Register Applicant</b>
          </>
        );
      }
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Recruitment Operations &nbsp;›&nbsp; </span><b>Applicant Profiling</b>
        </>
      );
    }
    if (path.includes('recruitment-selection')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Recruitment Operations &nbsp;›&nbsp; </span><b>Recruitment &amp; Selection</b>
        </>
      );
    }
    if (path.includes('deployment-assignment')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Talent &amp; Deployment &nbsp;›&nbsp; </span><b>Deployment &amp; Assignment</b>
        </>
      );
    }
    if (path.includes('ai-analytics')) {
      let activeTabTitle = 'AI Candidate Scoring';
      if (tabParam === 'pipeline') activeTabTitle = 'Recruitment Intelligence';
      else if (tabParam === 'retention') activeTabTitle = 'Workforce Retention';
      else if (tabParam === 'scoring') activeTabTitle = 'AI Candidate Scoring';

      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; AI &amp; Analytics &nbsp;›&nbsp; </span><b>{activeTabTitle}</b>
        </>
      );
    }
    if (path.includes('settings')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; System &nbsp;›&nbsp; </span><b>Settings</b>
        </>
      );
    }
    return (
      <>
        <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Overview &nbsp;›&nbsp; </span><b>Dashboard</b>
      </>
    );
  };

  // Formatted date string aligned with system settings
  const formattedToday = `Today, ${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase()}`;

  return (
    <header className="global-topbar">
      <div className="global-topbar-left">
        <button
          type="button"
          className="global-mobile-toggle"
          onClick={onToggleMobileMenu}
          title="Toggle Navigation Menu"
        >
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="global-crumb">{getBreadcrumb()}</div>
      </div>

      <div className="global-topbar-actions">
        <div className="global-search">
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search candidate, job order, client..."
            className="global-search-input"
          />
        </div>

        <div className="global-icon-btn" title="System Notifications">
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="global-bell-dot" />
        </div>

        <div className="global-who">
          <div className="global-avatar">N</div>
          <div className="global-who-info">
            <div className="global-who-name">Name of Administrator</div>
            <div className="global-who-date">{formattedToday}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
