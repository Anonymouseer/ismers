import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/store/AuthStore';
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
}) {
  const location = useLocation();
  const { user, logout, canAccess } = useAuth();
  const adminName = user?.name || 'HR Administrator';
  const adminRole = user?.roleLabel || 'HR Administrator';

  // Menu state is NOT persisted across sessions.
  // Submenus are closed by default; only the active route's menu is open.
  const [openMenus, setOpenMenus] = useState(() => {
    const initial = {
      'client-management': false,
      'job-order-management': false,
      'applicant-registration': false,
      'recruitment-selection': false,
      'deployment-assignment': false,
      'ai-analytics': false,
    };
    if (activeItem) {
      initial[activeItem] = true;
    }
    return initial;
  });


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
          {(canAccess('client-management') || canAccess('job-order-management')) && (
          <div className="nav-group">
            <div className="nav-label">Recruitment Operations</div>

            {/* Client Management */}
            {canAccess('client-management') && (
            <Link
              to="/client-management"
              className={`nav-item${activeItem === 'client-management' ? ' active' : ''}`}
            >
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </span>
              <span className="label">Client Management</span>
            </Link>
            )}

            {/* Job Order Management */}
            {canAccess('job-order-management') && (
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
                  <Link
                    to="/job-order-management?status=all"
                    className={`submenu-item${(!location.search || location.search === '?status=all') && location.pathname === '/job-order-management' ? ' active' : ''}`}
                  >
                    All Job Orders
                  </Link>
                  <Link
                    to="/job-order-management?status=review"
                    className={`submenu-item${location.search.includes('status=review') ? ' active' : ''}`}
                  >
                    Under Review
                  </Link>
                  <Link
                    to="/job-order-management?status=open"
                    className={`submenu-item${location.search.includes('status=open') ? ' active' : ''}`}
                  >
                    Open
                  </Link>
                  <Link
                    to="/job-order-management?status=filling"
                    className={`submenu-item${location.search.includes('status=filling') ? ' active' : ''}`}
                  >
                    Filling
                  </Link>
                  <Link
                    to="/job-order-management?status=urgent"
                    className={`submenu-item${location.search.includes('status=urgent') ? ' active' : ''}`}
                  >
                    Urgent
                  </Link>
                  <Link
                    to="/job-order-management?status=filled"
                    className={`submenu-item${location.search.includes('status=filled') ? ' active' : ''}`}
                  >
                    Filled
                  </Link>
                </div>
              </div>
            </div>
            )}
          </div>
          )}

          {/* TALENT & DEPLOYMENT */}
          {(canAccess('applicant-registration') || canAccess('recruitment-selection') || canAccess('deployment-assignment')) && (
          <div className="nav-group">
            <div className="nav-label">Talent &amp; Deployment</div>

            {/* Applicant Registration */}
            {canAccess('applicant-registration') && (
            <div className="nav-menu-wrapper">
              <Link
                to="/applicant-registration"
                className={`nav-item${activeItem === 'applicant-registration' ? ' active' : ''}`}
                onClick={() => handleParentClick('applicant-registration')}
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
                <button
                  type="button"
                  className="chevron-slot"
                  onClick={(e) => toggleSubmenu('applicant-registration', e)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <svg className={`chevron ${openMenus['applicant-registration'] ? 'open' : ''}`} viewBox="0 0 24 24">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
              </Link>

              <div className={`submenu-wrapper ${openMenus['applicant-registration'] && !collapsed ? 'open' : ''}`}>
                <div className="submenu-inner">
                  <Link
                    to="/applicant-registration?view=register"
                    className={`submenu-item${new URLSearchParams(location.search).get('view') === 'register' ? ' active' : ''}`}
                  >
                    Register New Applicant
                  </Link>
                  <Link
                    to="/applicant-registration"
                    className={`submenu-item${(!new URLSearchParams(location.search).get('view') || new URLSearchParams(location.search).get('view') === 'all') ? ' active' : ''}`}
                  >
                    Intake &amp; Profiling Board
                  </Link>
                  <Link
                    to="/applicant-registration?view=registered"
                    className={`submenu-item${new URLSearchParams(location.search).get('view') === 'registered' ? ' active' : ''}`}
                  >
                    Registered
                  </Link>
                  <Link
                    to="/applicant-registration?view=profiling"
                    className={`submenu-item${new URLSearchParams(location.search).get('view') === 'profiling' ? ' active' : ''}`}
                  >
                    Profiling
                  </Link>
                  <Link
                    to="/applicant-registration?view=profiled"
                    className={`submenu-item${new URLSearchParams(location.search).get('view') === 'profiled' ? ' active' : ''}`}
                  >
                    Profiled — Ready
                  </Link>
                  <Link
                    to="/applicant-registration?view=sent"
                    className={`submenu-item${new URLSearchParams(location.search).get('view') === 'sent' ? ' active' : ''}`}
                  >
                    Sent to Recruitment
                  </Link>
                </div>
              </div>
            </div>
            )}

            {/* Recruitment & Selection */}
            {canAccess('recruitment-selection') && (
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
                  <Link
                    to="/recruitment-selection"
                    className={`submenu-item${location.pathname === '/recruitment-selection' && !new URLSearchParams(location.search).get('stage') ? ' active' : ''}`}
                  >
                    Selection Pipeline
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=pooling"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 'pooling' ? ' active' : ''}`}
                  >
                    Pooling and Initial Screening
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=area_manager"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 'area_manager' ? ' active' : ''}`}
                  >
                    Area Manager 2nd Interview
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=client_interview"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 'client_interview' ? ' active' : ''}`}
                  >
                    Client Final Interview
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=hr_requirements"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 'hr_requirements' ? ' active' : ''}`}
                  >
                    HR Pre-Employment Requirements
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=contract_signing"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 'contract_signing' ? ' active' : ''}`}
                  >
                    Orientation and Contract Signing
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=for_deployment"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 'for_deployment' ? ' active' : ''}`}
                  >
                    For Deployment
                  </Link>
                  <Link
                    to="/recruitment-selection?stage=re_pooling"
                    className={`submenu-item${new URLSearchParams(location.search).get('stage') === 're_pooling' ? ' active' : ''}`}
                  >
                    Re-Pooling (Line Up)
                  </Link>
                </div>
              </div>
            </div>
            )}

            {/* Deployment & Assignment */}
            {canAccess('deployment-assignment') && (
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
            </Link>
            )}
          </div>
          )}

          {/* AI & ANALYTICS — Tab-level visibility by role */}
          {canAccess('ai-analytics') && (
          <div className="nav-group">
            <div className="nav-label">AI &amp; Analytics</div>

            {/* AI Candidate Scoring — visible to: hr_administrator, registration_officer, recruitment_officer, job_order_coordinator */}
            {(!user?.role || ['hr_administrator', 'registration_officer', 'recruitment_officer', 'job_order_coordinator'].includes(user.role)) && (
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
            )}

            {/* Recruitment Intelligence — visible to: hr_administrator, job_order_coordinator */}
            {(!user?.role || ['hr_administrator', 'job_order_coordinator'].includes(user.role)) && (
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
            )}

            {/* Workforce Retention Analysis — visible to: hr_administrator, deployment_officer */}
            {(!user?.role || ['hr_administrator', 'deployment_officer'].includes(user.role)) && (
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
            )}
          </div>
          )}

          {/* SYSTEM */}
          {canAccess('settings') && (
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
          )}
        </div>

        {/* FOOTER USER SUMMARY & INTEGRATED PROFILE SETTINGS */}
        <Link
          to="/profile"
          className={`sidebar-foot${location.pathname === '/profile' ? ' active' : ''}`}
          title="Profile Settings & Preferences"
        >
          <div className="avatar">{adminName.charAt(0)}</div>
          <div className="foot-text">
            <div className="foot-name">{adminName}</div>
            <div className="foot-role">Profile Settings</div>
          </div>
          <div className="foot-action-icon" title="Open Profile Settings">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </Link>

        <button type="button" onClick={logout} className="signout" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="label">Sign Out</span>
        </button>
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