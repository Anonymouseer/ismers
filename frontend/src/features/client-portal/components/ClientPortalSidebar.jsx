export default function ClientPortalSidebar({
  session,
  sidebarCollapsed,
  setSidebarCollapsed,
  activeTab,
  setActiveTab,
  jobRequests,
  endorsedCandidates,
  deployedRoster,
  accountManager,
  onLogout,
}) {
  return (
    <aside className={`client-portal-sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''}`}>
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

      <div
        className="client-portal-sidebar-top-profile"
        title={sidebarCollapsed ? (session?.company || 'Sunshine Mfg. Corp.') : undefined}
      >
        <div className="client-portal-sidebar-user-avatar">
          {session?.logo ? (
            <img src={session.logo} alt={session?.company || 'Company Logo'} className="client-portal-sidebar-logo-img" />
          ) : (
            (session?.company || 'S')[0]
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="client-portal-sidebar-user-info">
            <div className="client-portal-sidebar-user-company">
              {session?.company || 'Sunshine Mfg. Corp.'}
            </div>
          </div>
        )}
      </div>

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
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
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

          <button
            type="button"
            id="nav-endorsements"
            className={`client-portal-nav-item ${activeTab === 'endorsements' ? 'active' : ''}`}
            onClick={() => setActiveTab('endorsements')}
            title={sidebarCollapsed ? `Endorsements (${endorsedCandidates.filter((c) => c.status === 'Pending Review').length})` : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
            <span>Endorsements</span>
            <span className="client-portal-nav-count client-portal-nav-count--amber">
              {endorsedCandidates.filter((c) => c.status === 'Pending Review').length}
            </span>
          </button>

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

      <div
        className="client-portal-sidebar-section client-portal-sidebar-section--am"
        title={sidebarCollapsed ? `Account Manager: ${accountManager.name}` : undefined}
      >
        <div className="client-portal-sidebar-label">Assigned Account Manager</div>
        <div className="client-portal-am-card">
          <div className="client-portal-am-avatar">
            {accountManager.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="client-portal-am-info">
            <div className="client-portal-am-name">{accountManager.name}</div>
            <div className="client-portal-am-title">{accountManager.title}</div>
            <a href={`mailto:${accountManager.email}`} className="client-portal-am-email">
              {accountManager.email}
            </a>
            <div className="client-portal-am-phone">{accountManager.phone}</div>
          </div>
        </div>
      </div>

      <button
        id="client-portal-logout-btn"
        className="client-portal-logout-btn"
        type="button"
        onClick={onLogout}
        title="Sign Out"
        aria-label="Sign Out"
        style={{ marginTop: '12px' }}
      >
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Sign Out</span>
      </button>
    </aside>
  );
}
