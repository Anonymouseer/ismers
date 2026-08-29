import { useState, useEffect, useRef } from 'react';

/**
 * ClientPortalTopbar
 *
 * Props:
 *  - notifications: Array<{ id, type, title, body, time, read }>
 *  - onMarkRead: (id) => void
 *  - onMarkAllRead: () => void
 */
export default function ClientPortalTopbar({
  notifications = [],
  onMarkRead = () => {},
  onMarkAllRead = () => {},
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close panel when clicking outside
  useEffect(() => {
    if (!panelOpen) return;
    const handleClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [panelOpen]);

  // Close on Escape
  useEffect(() => {
    if (!panelOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') setPanelOpen(false); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [panelOpen]);

  const handleToggle = () => setPanelOpen((p) => !p);

  const handleMarkRead = (id) => {
    onMarkRead(id);
  };

  const handleMarkAllRead = () => {
    onMarkAllRead();
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'endorsement':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <polyline points="17 11 19 13 23 9" />
          </svg>
        );
      case 'job':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
      case 'interview':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'announcement':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        );
    }
  };

  const typeColorClass = (type) => {
    switch (type) {
      case 'endorsement': return 'cp-notif-icon--amber';
      case 'job':         return 'cp-notif-icon--blue';
      case 'interview':   return 'cp-notif-icon--green';
      default:            return 'cp-notif-icon--default';
    }
  };

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

      <div className="client-portal-topbar-actions" style={{ position: 'relative' }}>
        <button
          ref={btnRef}
          id="client-portal-notification-btn"
          className={`client-portal-notif-btn ${panelOpen ? 'active' : ''}`}
          type="button"
          title="View Notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          aria-expanded={panelOpen}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="client-portal-notif-badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* ── NOTIFICATION DROPDOWN PANEL ── */}
        {panelOpen && (
          <div
            ref={panelRef}
            className="cp-notif-panel"
            role="dialog"
            aria-modal="false"
            aria-label="Notifications"
          >
            {/* Panel Header */}
            <div className="cp-notif-panel-header">
              <div className="cp-notif-panel-title">
                Notifications
                {unreadCount > 0 && (
                  <span className="cp-notif-panel-count">{unreadCount} unread</span>
                )}
              </div>
              <div className="cp-notif-panel-actions">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="cp-notif-mark-all-btn"
                    onClick={handleMarkAllRead}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  className="cp-notif-close-btn"
                  aria-label="Close notifications"
                  onClick={() => setPanelOpen(false)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="cp-notif-list" role="list">
              {notifications.length === 0 ? (
                <div className="cp-notif-empty">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                  </svg>
                  <p>No notifications at this time.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    role="listitem"
                    className={`cp-notif-item ${n.read ? 'read' : 'unread'}`}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <div className={`cp-notif-item-icon ${typeColorClass(n.type)}`}>
                      {typeIcon(n.type)}
                    </div>
                    <div className="cp-notif-item-body">
                      <div className="cp-notif-item-title">{n.title}</div>
                      <div className="cp-notif-item-desc">{n.body}</div>
                      <div className="cp-notif-item-time">{n.time}</div>
                    </div>
                    {!n.read && <span className="cp-notif-unread-dot" aria-hidden="true" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
