import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUIFeedback } from '../common/UIFeedback';
import './Header.css';

export default function Header({ onToggleMobileMenu }) {
  const location = useLocation();
  const path = location.pathname;
  const [openNotifs, setOpenNotifs] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const notifRef = useRef(null);

  const { notifications, unreadCount, markAllAsRead, markAsRead, clearNotifications } = useUIFeedback();

  // Close dropdown on click outside or escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotifs(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpenNotifs(false);
    };

    if (openNotifs) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openNotifs]);

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

  const formattedToday = `Today, ${new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).toUpperCase()}`;

  const filteredNotifs = (notifications || []).filter((n) => {
    if (notifFilter === 'unread') return !n.read;
    return true;
  });

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
                          <span className="notif-time-ago">{item.time || 'Recent'}</span>
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
