import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import primepowerLogo from '../../assets/primepower-logo.svg';

/**
 * Shared left navigation for PRIMEPOWER HR Smart Recruitment System.
 * Features ultra-smooth CSS grid accordion animations and 0.3s cubic-bezier sidebar collapse transitions.
 */
export default function Sidebar({
  activeItem,
  collapsed = false,
  onToggleCollapse = () => { },
  mobileOpen = false,
  onCloseMobile = () => { },
  adminName = 'Name of Administrator',
  adminEmail = 'admin@example.com',
}) {
  const location = useLocation();

  // Persistent Collapsible Sub-menu States in localStorage
  const [openMenus, setOpenMenus] = useState(() => {
    let initial = {
      'client-management': true,
      'job-order-management': true,
      'applicant-registration': true,
      'recruitment-selection': true,
      'deployment-assignment': true,
      'ai-analytics': true,
    };
    try {
      const saved = localStorage.getItem('primepower_open_menus');
      if (saved) {
        initial = { ...initial, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    if (activeItem) {
      initial[activeItem] = true;
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem('primepower_open_menus', JSON.stringify(openMenus));
    } catch {
      // ignore
    }
  }, [openMenus]);

  const toggleSubmenu = (menuKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const handleParentClick = (menuKey) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: true,
    }));
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={onCloseMobile}
      />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} id="sidebar">
        {/* BRAND LOGO HEADER */}
        <div className="brand">
          <img src={primepowerLogo} alt="Prime Power Logo" className="brand-logo-img" />
          <div className="brand-text">
            <div className="brand-name">PRIMEPOWER MANPOWER</div>
            <div className="brand-sub">HR Smart Recruitment System</div>
          </div>
        </div>

        <div className="nav-scroll">
          {/* DASHBOARD */}
          <div className="nav-group">
            <Link
              to="/client-management"
              className={`nav-item${activeItem === 'dashboard' ? ' active' : ''}`}
            >
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" />
                </svg>
              </span>
              <span className="label">Dashboard</span>
            </Link>
          </div>

          {/* RECRUITMENT OPERATIONS */}
          <div className="nav-group">
            <div className="nav-label">Recruitment Operations</div>

            {/* Client Management */}
            <div className="nav-menu-wrapper">
              <Link
                to="/client-management"
                className={`nav-item${activeItem === 'client-management' ? ' active' : ''}`}
                onClick={() => handleParentClick('client-management')}
              >
                <span className="icon-slot">
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </span>
                <span className="label">Client Management</span>
                <button
                  type="button"
                  className="chevron-slot"
                  onClick={(e) => toggleSubmenu('client-management', e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <svg className={`chevron ${openMenus['client-management'] ? 'open' : ''}`} viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </Link>

              <div className={`submenu-wrapper ${openMenus['client-management'] && !collapsed ? 'open' : ''}`}>
                <div className="submenu-inner">
                  <Link to="/client-management" className="submenu-item active">
                    Client Directory
                  </Link>
                  <Link to="/client-management" className="submenu-item">
                    Account Contracts
                  </Link>
                </div>
              </div>
            </div>

            {/* Job Order Management */}
            <div className="nav-menu-wrapper">
              <Link
                to="/job-order-management"
                className={`nav-item${activeItem === 'job-order-management' ? ' active' : ''}`}
                onClick={() => handleParentClick('job-order-management')}
              >
                <span className="icon-slot">
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <path d="M12 11h4" />
                    <path d="M12 16h4" />
                    <path d="M8 11h.01" />
                    <path d="M8 16h.01" />
                  </svg>
                </span>
                <span className="label">Job Order Management</span>
                <button
                  type="button"
                  className="chevron-slot"
                  onClick={(e) => toggleSubmenu('job-order-management', e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <svg className={`chevron ${openMenus['job-order-management'] ? 'open' : ''}`} viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </Link>

              <div className={`submenu-wrapper ${openMenus['job-order-management'] && !collapsed ? 'open' : ''}`}>
                <div className="submenu-inner">
                  <Link to="/job-order-management" className="submenu-item active">
                    Job Orders (PRFs)
                  </Link>
                  <Link to="/job-order-management" className="submenu-item">
                    Position Requisitions
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* TALENT & DEPLOYMENT */}
          <div className="nav-group">
            <div className="nav-label">Talent &amp; Deployment</div>

            {/* Applicant Registration */}
            <div className="nav-menu-wrapper">
              <Link
                to="/applicant-registration"
                className={`nav-item${activeItem === 'applicant-registration' ? ' active' : ''}`}
              >
                <span className="icon-slot">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="16" y1="11" x2="22" y2="11" />
                  </svg>
                </span>
                <span className="label">Applicant Registration</span>
              </Link>
            </div>

            {/* Recruitment & Selection */}
            <div className="nav-menu-wrapper">
              <Link
                to="/recruitment-selection"
                className={`nav-item${activeItem === 'recruitment-selection' ? ' active' : ''}`}
                onClick={() => handleParentClick('recruitment-selection')}
              >
                <span className="icon-slot">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="16 11 18 13 22 9" />
                  </svg>
                </span>
                <span className="label">Recruitment &amp; Selection</span>
                <button
                  type="button"
                  className="chevron-slot"
                  onClick={(e) => toggleSubmenu('recruitment-selection', e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <svg className={`chevron ${openMenus['recruitment-selection'] ? 'open' : ''}`} viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </Link>

              <div className={`submenu-wrapper ${openMenus['recruitment-selection'] && !collapsed ? 'open' : ''}`}>
                <div className="submenu-inner">
                  <Link to="/recruitment-selection" className="submenu-item active">
                    Selection Pipeline
                  </Link>
                  <Link to="/recruitment-selection" className="submenu-item">
                    Interview Schedules
                  </Link>
                  <Link to="/recruitment-selection" className="submenu-item">
                    Candidate Evaluations
                  </Link>
                </div>
              </div>
            </div>

            {/* Deployment & Assignment */}
            <div className="nav-menu-wrapper">
              <Link
                to="/deployment-assignment"
                className={`nav-item${activeItem === 'deployment-assignment' ? ' active' : ''}`}
                onClick={() => handleParentClick('deployment-assignment')}
              >
                <span className="icon-slot">
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.5.5 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.112z" />
                    <path d="m21.854 2.146-10.94 10.94" />
                  </svg>
                </span>
                <span className="label">Deployment &amp; Assignment</span>
                <button
                  type="button"
                  className="chevron-slot"
                  onClick={(e) => toggleSubmenu('deployment-assignment', e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <svg className={`chevron ${openMenus['deployment-assignment'] ? 'open' : ''}`} viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </Link>

              <div className={`submenu-wrapper ${openMenus['deployment-assignment'] && !collapsed ? 'open' : ''}`}>
                <div className="submenu-inner">
                  <Link
                    to="/deployment-assignment?view=board"
                    className={`submenu-item${location.search.includes('view=board') ? ' active' : ''}`}
                  >
                    Deployment Dispatch Board
                  </Link>
                  <Link
                    to="/deployment-assignment?view=table"
                    className={`submenu-item${(!location.search || location.search.includes('view=table')) ? ' active' : ''}`}
                  >
                    Staff Assignments
                  </Link>
                  <Link
                    to="/deployment-assignment?view=renewals"
                    className={`submenu-item${location.search.includes('view=renewals') ? ' active' : ''}`}
                  >
                    Contract Renewals
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* AI & ANALYTICS */}
          <div className="nav-group">
            <div className="nav-label">AI &amp; Analytics</div>

            {/* AI Candidate Scoring */}
            <Link
              to="/ai-analytics?tab=scoring"
              className={`nav-item${activeItem === 'ai-analytics' && (!location.search || location.search.includes('tab=scoring')) ? ' active' : ''}`}
            >
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.937A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
                  <path d="M20 3v4" />
                  <path d="M22 5h-4" />
                </svg>
              </span>
              <span className="label">AI Candidate Scoring</span>
            </Link>

            {/* Recruitment Intelligence */}
            <Link
              to="/ai-analytics?tab=pipeline"
              className={`nav-item${activeItem === 'ai-analytics' && location.search.includes('tab=pipeline') ? ' active' : ''}`}
            >
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </span>
              <span className="label">Recruitment Intelligence</span>
            </Link>

            {/* Workforce Retention Analysis */}
            <Link
              to="/ai-analytics?tab=retention"
              className={`nav-item${activeItem === 'ai-analytics' && location.search.includes('tab=retention') ? ' active' : ''}`}
            >
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              <span className="label">Workforce Retention Analysis</span>
            </Link>
          </div>

          {/* SYSTEM */}
          <div className="nav-group">
            <div className="nav-label">System</div>
            <Link
              to="/settings"
              className={`nav-item${activeItem === 'settings' ? ' active' : ''}`}
            >
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <span className="label">Settings</span>
            </Link>
          </div>
        </div>

        {/* FOOTER USER SUMMARY */}
        <div className="sidebar-foot">
          <div className="avatar">{adminName.charAt(0)}</div>
          <div className="foot-text">
            <div className="foot-name">{adminName}</div>
            <div className="foot-role">{adminEmail}</div>
          </div>
        </div>

        <Link to="/settings" className="signout">
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="label">Sign Out</span>
        </Link>
      </aside>

      {/* COLLAPSE TOGGLE BUTTON WITH SMOOTH SLIDE */}
      <div
        className={`collapse-btn${collapsed ? ' collapsed' : ''}`}
        id="collapseBtn"
        onClick={onToggleCollapse}
      >
        <svg className="icon" viewBox="0 0 24 24" style={{ width: 12, height: 12 }}>
          <path d="m15 6-6 6 6 6" />
        </svg>
      </div>
    </>
  );
}