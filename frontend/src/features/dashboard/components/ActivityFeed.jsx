/**
 * ActivityFeed — Scrollable list of recent system activity log entries.
 * Each entry shows actor avatar, action description, module, and relative timestamp.
 */

function timeAgo(isoString) {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

const MODULE_COLORS = {
  'Applicant Registration': 'var(--primary)',
  'Recruitment & Selection': '#6366F1',
  'Job Order Management': '#D98A2B',
  'Deployment & Assignment': '#10B981',
  'Client Management': '#8B5CF6',
  'Authentication': '#94A3B8',
  'System Settings': '#94A3B8',
};

export default function ActivityFeed({ activities = [] }) {
  return (
    <div className="activity-feed-container">
      <div className="activity-feed-header">
        <h3 className="activity-feed-title">Recent Activity</h3>
        <span className="activity-feed-count">{activities.length} entries</span>
      </div>

      {activities.length === 0 ? (
        <div className="activity-feed-empty">No recent activity recorded.</div>
      ) : (
        <div className="activity-feed-list">
          {activities.map((item) => (
            <div key={item.id} className="activity-feed-item">
              <div
                className="activity-feed-avatar"
                style={{
                  background: MODULE_COLORS[item.module] || 'var(--muted)',
                }}
              >
                {(item.actor || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="activity-feed-body">
                <div className="activity-feed-action">
                  <span className="activity-feed-actor">{item.actor}</span>
                  <span className="activity-feed-text">{item.action}</span>
                </div>
                <div className="activity-feed-meta">
                  <span
                    className="activity-feed-module"
                    style={{ color: MODULE_COLORS[item.module] || 'var(--muted)' }}
                  >
                    {item.module}
                  </span>
                  <span className="activity-feed-time">{timeAgo(item.timestamp)}</span>
                </div>
              </div>
              <div className={`activity-feed-status ${item.status === 'Success' ? 'success' : 'error'}`}>
                {item.status === 'Success' ? (
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <path d="M13.5 4.5 L6.5 11.5 L2.5 7.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" width="14" height="14">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M8 5 L8 8.5 M8 10.5 L8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
