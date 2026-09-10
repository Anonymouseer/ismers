import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUIFeedback } from '../common/UIFeedback';
import { useAuth } from '../../features/auth/store/AuthStore';
import './Header.css';

function formatNotifTime(item) {
  if (item?.timestamp) {
    const d = new Date(item.timestamp);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      if (isToday) return timeStr;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    }
  }
  if (item?.time && item.time !== 'Just now') {
    return item.time;
  }
  return 'Recent';
}

export default function Header({ onToggleMobileMenu }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { user, logout, canAccess } = useAuth();

  const [openNotifs, setOpenNotifs] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const notifRef = useRef(null);

  const [openUserMenu, setOpenUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const { notifications, unreadCount, markAllAsRead, markAsRead, clearNotifications } = useUIFeedback();

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotifs(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setOpenUserMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setOpenNotifs(false);
        setOpenUserMenu(false);
      }
    };

    if (openNotifs || openUserMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openNotifs, openUserMenu]);

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
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; PRF Operations &nbsp;›&nbsp; </span><b>Job Order Management</b>
        </>
      );
    }
    if (path.includes('applicant-registration')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Talent Sourcing &nbsp;›&nbsp; </span><b>Applicant Registration Board</b>
        </>
      );
    }
    if (path.includes('recruitment-selection')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Selection Process &nbsp;›&nbsp; </span><b>Recruitment &amp; Selection</b>
        </>
      );
    }
    if (path.includes('deployment-assignment')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Manpower Mobilization &nbsp;›&nbsp; </span><b>Deployment &amp; Assignment</b>
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
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; System Administration &nbsp;›&nbsp; </span><b>System Settings</b>
        </>
      );
    }
    if (path.includes('profile')) {
      return (
        <>
          <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; User Account &nbsp;›&nbsp; </span><b>My Profile &amp; Preferences</b>
        </>
      );
    }
    return (
      <>
        <span className="crumb-hide-mobile">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Overview &nbsp;›&nbsp; </span><b>Dashboard</b>
      </>
    );
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const filteredNotifs = (notifications || []).filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    return true;
  });

  const userName = user?.name || 'Administrator';
  const userInitial = userName.charAt(0).toUpperCase();

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

        {/* NOTIFICATION BELL CONTAINER */}
        <div className="global-bell-wrap" ref={notifRef}>
          <button
            type="button"
            className={`global-icon-btn ${openNotifs ? 'active' : ''}`}
            title="System Notification Center"
            onClick={() => setOpenNotifs((v) => !v)}
            aria-label="Toggle notifications"
          >
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="global-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {/* NOTIFICATION DROPDOWN POPUP */}
          {openNotifs && (
            <div className="notif-dropdown-card" role="dialog" aria-label="System Notifications">
              <div className="notif-head">
                <div className="notif-head-title-wrap">
                  <span className="notif-eyebrow">Audit &amp; Activity Log</span>
                  <div className="notif-head-title">
                    System Notifications
                    {unreadCount > 0 && <span className="notif-count-pill">{unreadCount} New</span>}
                  </div>
                </div>
                <div className="notif-head-actions">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-action-text-btn"
                      onClick={markAllAsRead}
                    >
                      Mark All Read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      className="notif-action-text-btn danger"
                      onClick={clearNotifications}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* FILTER TABS */}
              <div className="notif-tabs-bar">
                <button
                  type="button"
                  className={`notif-tab-item ${notifFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('all')}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  className={`notif-tab-item ${notifFilter === 'unread' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('unread')}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* NOTIFICATION LIST */}
              <div className="notif-scroll-list">
                {filteredNotifs.length === 0 ? (
                  <div className="notif-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 28, height: 28, color: 'var(--muted-fg)' }}>
                      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                    <div className="notif-empty-title">All Caught Up</div>
                    <div className="notif-empty-sub">No recent transaction notifications at this time.</div>
                  </div>
                ) : (
                  filteredNotifs.map((item) => (
                    <div
                      key={item.id}
                      className={`notif-item-row ${item.read ? 'read' : 'unread'} type-${item.type || 'info'}`}
                      onClick={() => markAsRead(item.id)}
                    >
                      <div className="notif-strip" />
                      <div className="notif-item-content">
                        <div className="notif-meta-row">
                          <span className="notif-module-tag">{item.module || 'Workflow'}</span>
                          <span className="notif-time-ago" title={item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}>
                            {formatNotifTime(item)}
                          </span>
                        </div>
                        <div className="notif-item-title">{item.title}</div>
                        <div className="notif-item-desc">{item.message}</div>
                      </div>
                      {!item.read && <span className="notif-unread-dot" title="Unread" />}
                    </div>
                  ))
                )}
              </div>

              <div className="notif-foot">
                <span className="notif-foot-note">DOLE D.O. 174 &middot; Real-time Workflow Synchronization</span>
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE CARD WITH DROPDOWN */}
        <div className="global-who-wrap" ref={userMenuRef}>
          <button
            type="button"
            className={`global-who-btn ${openUserMenu ? 'active' : ''}`}
            onClick={() => setOpenUserMenu((v) => !v)}
            aria-label="User Account Menu"
          >
            <div className="global-avatar">
              {user?.photo ? (
                <img src={user.photo} alt={userName} className="global-avatar-img" />
              ) : (
                userInitial
              )}
            </div>
            <div className="global-who-info">
              <div className="global-who-name">{userName}</div>
              <div className="global-who-date">
                <span className="who-date-prefix">Today,</span>
                <span className="who-date-val">{formattedDate}</span>
              </div>
            </div>
          </button>

          {openUserMenu && (
            <div className="user-dropdown-card" role="dialog" aria-label="User Menu">
              <div className="user-dropdown-head">
                <div className="user-dropdown-name">{userName}</div>
                <div className="user-dropdown-email">{user?.email || 'staff@primepower.ph'}</div>
                <span className="user-dropdown-role-pill">{user?.roleLabel || 'Staff Member'}</span>
              </div>

              <div className="user-dropdown-menu">
                <Link
                  to="/profile"
                  className="user-dropdown-item"
                  onClick={() => setOpenUserMenu(false)}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile &amp; Preferences
                </Link>

                {canAccess('settings') && (
                  <Link
                    to="/settings"
                    className="user-dropdown-item"
                    onClick={() => setOpenUserMenu(false)}
                  >
                    <svg className="icon" viewBox="0 0 24 24">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    System Settings (Admin)
                  </Link>
                )}

                <div className="user-dropdown-divider"></div>

                <button
                  type="button"
                  className="user-dropdown-item danger"
                  onClick={() => {
                    setOpenUserMenu(false);
                    logout();
                  }}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
