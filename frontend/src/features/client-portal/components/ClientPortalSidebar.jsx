import { useState } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

export default function ClientPortalSidebar({
  session,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  endorsementFilter = 'ALL',
  setEndorsementFilter = () => {},
  jobRequests = [],
  endorsedCandidates = [],
  deployedRoster = [],
  accountManager,
  onLogout,
}) {
  const [endorsementsOpen, setEndorsementsOpen] = useState(true);

  const pendingCount = endorsedCandidates.filter((c) => c.status === 'Pending Review').length;
  const acceptedCount = endorsedCandidates.filter((c) => c.status === 'Accepted for Interview').length;
  const passedCount = endorsedCandidates.filter((c) => c.status === 'Passed Interview' || c.status === 'Passed Client Interview' || c.status === 'Hired').length;
  const declinedCount = endorsedCandidates.filter((c) => c.status === 'Declined').length;
  const totalCount = endorsedCandidates.length;

  const handleEndorsementsClick = () => {
    setActiveTab('endorsements');
    setEndorsementsOpen((prev) => !prev);
  };

  const handleSubStageClick = (stageKey) => {
    setActiveTab('endorsements');
    setEndorsementFilter(stageKey);
  };

  return (
    <aside className={`client-portal-sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* COLLAPSE TOGGLE BUTTON ON SIDEBAR EDGE */}
      <button
        type="button"
        id="cp-sidebar-collapse-btn"
        className={`cp-sidebar-collapse-btn ${sidebarCollapsed ? 'collapsed' : ''}`}
        onClick={() => setSidebarCollapsed((c) => !c)}
        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <svg className="icon" viewBox="0 0 24 24">
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>

      {/* BRAND LOGO HEADER */}
      <div className="client-portal-brand">
        <img src={primepowerLogo} alt="Prime Power Logo" className="client-portal-brand-logo-img" />
        {!sidebarCollapsed && (
          <div className="client-portal-brand-text">
            <div className="client-portal-brand-name">PRIMEPOWER MANPOWER</div>
            <div className="client-portal-brand-sub">Client Portal</div>
          </div>
        )}
      </div>

      {/* CLIENT COMPANY PROFILE CARD */}
      <div
        className="client-portal-sidebar-company-card"
        title={sidebarCollapsed ? (session?.company || 'ABC Manufacturing Corp.') : undefined}
      >
        <div className="client-portal-sidebar-company-avatar">
          {session?.logo ? (
            <img src={session.logo} alt={session?.company || 'Company Logo'} className="client-portal-sidebar-company-logo-img" />
          ) : (
            (session?.company || 'A')[0]
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="client-portal-sidebar-company-info">
            <div className="client-portal-sidebar-company-name">
              {session?.company || 'ABC Manufacturing Corp.'}
            </div>
            <div className="client-portal-sidebar-company-sub" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--primary, #007dcc)',
                background: 'rgba(0, 125, 204, 0.1)',
                padding: '1px 5px',
                borderRadius: 4,
              }}>
                {session?.companyId || 'CLT-2026-0001'}
              </span>
              <span>{session?.industry || 'Client Account'}</span>
            </div>
          </div>
        )}
      </div>

      {/* NAVIGATION SECTION */}
      <div className="client-portal-sidebar-section">
        <div className="client-portal-sidebar-label">Navigation</div>
        <nav className="client-portal-nav-list">
          <button
            type="button"
            id="nav-dashboard"
            className={`client-portal-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title={sidebarCollapsed ? 'Dashboard' : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            id="nav-job-orders"
            className={`client-portal-nav-item ${activeTab === 'job-orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('job-orders')}
            title={sidebarCollapsed ? `Job Orders (${jobRequests.length})` : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span>Job orders</span>
            <span className="client-portal-nav-count">{jobRequests.length}</span>
          </button>

          {/* ENDORSEMENTS WITH SUBMENU ACCORDION */}
          <div className="client-portal-nav-group">
            <button
              type="button"
              id="nav-endorsements"
              className={`client-portal-nav-item ${activeTab === 'endorsements' ? 'active' : ''}`}
              onClick={handleEndorsementsClick}
              title={sidebarCollapsed ? `Endorsements (${pendingCount})` : undefined}
            >
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <polyline points="17 11 19 13 23 9" />
              </svg>
              <span>Endorsements</span>
              <span className="client-portal-nav-count client-portal-nav-count--amber">
                {pendingCount}
              </span>
              {!sidebarCollapsed && (
                <svg
                  className={`client-portal-chevron ${endorsementsOpen ? 'open' : ''}`}
                  viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {!sidebarCollapsed && endorsementsOpen && (
              <div className="client-portal-submenu">
                <button
                  type="button"
                  className={`client-portal-submenu-item ${activeTab === 'endorsements' && endorsementFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => handleSubStageClick('ALL')}
                >
                  <span className="client-portal-submenu-dot" />
                  <span className="client-portal-submenu-label">All Endorsements</span>
                  <span className="client-portal-submenu-count">{totalCount}</span>
                </button>
                <button
                  type="button"
                  className={`client-portal-submenu-item ${activeTab === 'endorsements' && endorsementFilter === 'Pending Review' ? 'active' : ''}`}
                  onClick={() => handleSubStageClick('Pending Review')}
                >
                  <span className="client-portal-submenu-dot dot--amber" />
                  <span className="client-portal-submenu-label">Pending Review</span>
                  <span className="client-portal-submenu-count count--amber">{pendingCount}</span>
                </button>
                <button
                  type="button"
                  className={`client-portal-submenu-item ${activeTab === 'endorsements' && endorsementFilter === 'Accepted for Interview' ? 'active' : ''}`}
                  onClick={() => handleSubStageClick('Accepted for Interview')}
                >
                  <span className="client-portal-submenu-dot dot--blue" style={{ background: '#3D7DD6' }} />
                  <span className="client-portal-submenu-label">Accepted for Interview</span>
                  <span className="client-portal-submenu-count count--blue" style={{ background: 'rgba(61, 125, 214, 0.12)', color: '#3D7DD6' }}>{acceptedCount}</span>
                </button>
                <button
                  type="button"
                  className={`client-portal-submenu-item ${activeTab === 'endorsements' && endorsementFilter === 'Passed Interview' ? 'active' : ''}`}
                  onClick={() => handleSubStageClick('Passed Interview')}
                >
                  <span className="client-portal-submenu-dot dot--green" />
                  <span className="client-portal-submenu-label">Passed Interview</span>
                  <span className="client-portal-submenu-count count--green">{passedCount}</span>
                </button>
                <button
                  type="button"
                  className={`client-portal-submenu-item ${activeTab === 'endorsements' && endorsementFilter === 'Declined' ? 'active' : ''}`}
                  onClick={() => handleSubStageClick('Declined')}
                >
                  <span className="client-portal-submenu-dot dot--red" />
                  <span className="client-portal-submenu-label">Declined</span>
                  <span className="client-portal-submenu-count count--red">{declinedCount}</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            id="nav-deployed-roster"
            className={`client-portal-nav-item ${activeTab === 'deployed-roster' ? 'active' : ''}`}
            onClick={() => setActiveTab('deployed-roster')}
            title={sidebarCollapsed ? `Deployed Roster (${deployedRoster.length})` : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Deployed Roster</span>
            <span className="client-portal-nav-count">{deployedRoster.length}</span>
          </button>

          <button
            type="button"
            id="nav-feedback"
            className={`client-portal-nav-item ${activeTab === 'feedback' ? 'active' : ''}`}
            onClick={() => setActiveTab('feedback')}
            title={sidebarCollapsed ? 'Feedback' : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Feedback</span>
          </button>

          <button
            type="button"
            id="nav-settings"
            className={`client-portal-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* ASSIGNED ACCOUNT MANAGER SECTION */}
      <div
        className="client-portal-sidebar-section client-portal-sidebar-section--am"
        title={sidebarCollapsed ? `Account Manager: ${accountManager.name}` : undefined}
      >
        <div className="client-portal-sidebar-label">Assigned Account Manager</div>
        <div className="client-portal-am-card">
          <div className="client-portal-am-avatar">
            {accountManager.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          {!sidebarCollapsed && (
            <div className="client-portal-am-info">
              <div className="client-portal-am-name">{accountManager.name}</div>
              <div className="client-portal-am-title">{accountManager.title}</div>
              <a href={`mailto:${accountManager.email}`} className="client-portal-am-email">
                {accountManager.email}
              </a>
              <div className="client-portal-am-phone">{accountManager.phone}</div>
            </div>
          )}
        </div>
      </div>

      {/* SIGN OUT BUTTON */}
      <button
        id="client-portal-logout-btn"
        className="client-portal-logout-btn"
        type="button"
        onClick={onLogout}
        title="Sign Out"
        aria-label="Sign Out"
      >
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {!sidebarCollapsed && <span>Sign Out</span>}
      </button>
    </aside>
  );
}
