export default function ClientPortalTopbar() {
  return (
    <nav className="client-portal-topbar">
      <div className="client-portal-topbar-brand">
        <div className="client-portal-topbar-mark">PM</div>
        <div className="client-portal-topbar-name">
          <span>PRIME</span>
          <span>POWER</span>
        </div>
        <div className="client-portal-topbar-sep" aria-hidden="true" />
        <div className="client-portal-topbar-module">Client Portal</div>
      </div>
      <div className="client-portal-topbar-actions">
        <button
          id="client-portal-notification-btn"
          className="client-portal-notif-btn"
          type="button"
          title="View Notifications"
          aria-label="Notifications"
        >
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          <span className="client-portal-notif-dot" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
