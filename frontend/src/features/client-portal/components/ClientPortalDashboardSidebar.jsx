export default function ClientPortalDashboardSidebar({ announcements, interviews, deployedRoster, onRenewRosterContract }) {
  return (
    <aside className="client-portal-sidebar">
      <div className="client-portal-card client-portal-sidebar-card">
        <div className="client-portal-card-head">
          <div className="client-portal-card-title">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            Announcements
          </div>
        </div>
        <div className="client-portal-announce-list">
          {announcements.map((item) => (
            <div key={item.id} className="client-portal-announce-item">
              <div className="client-portal-announce-date">{item.date}</div>
              <div className="client-portal-announce-title">{item.title}</div>
              <div className="client-portal-announce-body">{item.body}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="client-portal-card client-portal-sidebar-card">
        <div className="client-portal-card-head">
          <div className="client-portal-card-title">
            <svg className="icon" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Upcoming Interviews
          </div>
        </div>
        <div className="client-portal-interview-list">
          {interviews.length === 0 ? (
            <div style={{ padding: '14px 10px', fontSize: 12, color: 'var(--muted, #888)', textAlign: 'center' }}>
              No upcoming interviews scheduled.
            </div>
          ) : (
            interviews.map((iv) => (
              <div key={iv.id} className="client-portal-interview-item">
                <div className="client-portal-interview-avatar">{iv.candidate[0]}</div>
                <div className="client-portal-interview-info">
                  <div className="client-portal-interview-candidate">{iv.candidate}</div>
                  <div className="client-portal-interview-position">{iv.position}</div>
                  <div className="client-portal-interview-meta">
                    <span>{iv.date} &middot; {iv.time}</span>
                    <span className="client-portal-interview-type">{iv.type}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="client-portal-card client-portal-sidebar-card">
        <div className="client-portal-card-head">
          <div className="client-portal-card-title client-portal-card-title--amber">
            <svg className="icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Expiring Deployment Alerts
          </div>
        </div>
        <div className="client-portal-expiry-list">
          {deployedRoster
            .filter((r) => r.status === 'Expiring Soon' || r.status === 'Renewal Requested')
            .map((item) => (
              <div key={item.id} className="client-portal-expiry-item">
                <div className="client-portal-expiry-header">
                  <span className="client-portal-expiry-name">{item.employeeName}</span>
                  <span className={`client-portal-badge ${item.status === 'Renewal Requested' ? 'client-portal-badge--active' : 'client-portal-badge--pending'}`}>
                    {item.status === 'Renewal Requested' ? 'Renewal Requested' : `Expires ${item.expiryDate}`}
                  </span>
                </div>
                <div className="client-portal-expiry-sub">{item.position} &middot; {item.site}</div>
                {item.status !== 'Renewal Requested' && (
                  <button
                    type="button"
                    className="client-portal-expiry-renew-btn"
                    onClick={() => onRenewRosterContract(item.id)}
                  >
                    Request Contract Renewal
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
}
