import { Link } from 'react-router-dom';
import './Sidebar.css';

/**
 * Shared left navigation for all Core Transaction 1 (Client Acquisition,
 * Recruitment & Deployment) pages.
 *
 * Props:
 *  - activeItem: one of 'client-management' | 'applicant-registration' |
 *    'recruitment-selection' | 'job-order-management' | 'deployment-assignment'
 *  - collapsed: boolean — collapsed/expanded state (owned by the parent page
 *    so it can also shift the main content's margin)
 *  - onToggleCollapse: () => void
 *  - adminName / adminEmail: current user info shown in the footer
 */
export default function Sidebar({
  activeItem = 'client-management',
  collapsed = false,
  onToggleCollapse,
  adminName = 'Name of Administrator',
  adminEmail = 'admin@example.com',
}) {
  const navItems = [
    {
      key: 'client-management',
      label: 'Client Management',
      href: '/client-management',
      icon: (
        <>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M3 12h18" />
        </>
      ),
    },
    {
      key: 'applicant-registration',
      label: 'Applicant Registration & Profiling',
      href: '/applicant-registration',
      icon: (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
          <path d="M18 8v6" />
          <path d="M15 11h6" />
        </>
      ),
    },
    {
      key: 'recruitment-selection',
      label: 'Recruitment & Selection',
      href: '/recruitment-selection',
      icon: (
        <>
          <circle cx="8" cy="8" r="3" />
          <path d="M2.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
          <path d="M16.5 7.5 18 9l3-3" />
        </>
      ),
    },
    {
      key: 'job-order-management',
      label: 'Job Order Management',
      href: '/job-order-management',
      icon: (
        <>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 3h6a1 1 0 0 1 1 1v1H8V4a1 1 0 0 1 1-1Z" />
          <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
        </>
      ),
    },
    {
      key: 'deployment-assignment',
      label: 'Deployment & Assignment',
      href: '/deployment-assignment',
      icon: <path d="M21 3 3 10.5l7 2.5 2.5 7L21 3Z" />,
    },
  ];

  return (
    <>
      <div className={`sidebar${collapsed ? ' collapsed' : ''}`} id="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <div className="row"><span></span><span></span><span></span></div>
            <div className="row"><span></span><span></span></div>
            <div className="row"><span></span></div>
          </div>
          <div className="brand-text">
            <div className="brand-name">COMPANY NAME</div>
            <div className="brand-sub">HR Smart Recruitment System</div>
          </div>
        </div>

        <div className="nav-scroll">
          <div className="nav-group">
            <a className="nav-item">
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M3 11.5 12 4l9 7.5" />
                  <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
                </svg>
              </span>
              <span className="label">Dashboard</span>
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-label">Core 1 · Recruitment</div>
            {navItems.map((item) => (
              <Link
                key={item.key}
                className={`nav-item${activeItem === item.key ? ' active' : ''}`}
                to={item.href}
              >
                <span className="icon-slot">
                  <svg className="icon" viewBox="0 0 24 24">{item.icon}</svg>
                </span>
                <span className="label">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="nav-group">
            <div className="nav-label">AI & Analytics</div>
            <a className="nav-item">
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" />
                  <path d="M19 15.5 19.7 17.5 21.5 18.2 19.7 19 19 21 18.3 19 16.5 18.2 18.3 17.5Z" />
                </svg>
              </span>
              <span className="label">Smart Recruitment & Scoring</span>
            </a>
          </div>

          <div className="nav-group">
            <div className="nav-label">System</div>
            <a className="nav-item">
              <span className="icon-slot">
                <svg className="icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.6 1Z" />
                </svg>
              </span>
              <span className="label">Settings</span>
            </a>
          </div>
        </div>

        <div className="sidebar-foot">
          <div className="avatar">{adminName.charAt(0)}</div>
          <div className="foot-text">
            <div className="foot-name">{adminName}</div>
            <div className="foot-role">{adminEmail}</div>
          </div>
        </div>
        <a className="signout">
          <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span className="label">Sign Out</span>
        </a>
      </div>
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