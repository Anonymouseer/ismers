import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SkeletonLoader from '../common/SkeletonLoader';
import './Sidebar.css';

export default function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Route & Submodule transition shimmer loading state
  const [navTransition, setNavTransition] = useState(false);
  const prevRouteRef = useRef(location.pathname + location.search);

  // Trigger brief transition on route or submodule change
  useEffect(() => {
    const currentRoute = location.pathname + location.search;
    if (prevRouteRef.current !== currentRoute) {
      prevRouteRef.current = currentRoute;
      setNavTransition(true);
    }
  }, [location.pathname, location.search]);

  // Guaranteed dismissal: navTransition ALWAYS auto-expires within 280ms
  useEffect(() => {
    if (!navTransition) return;
    const timer = setTimeout(() => {
      setNavTransition(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [navTransition]);

  // Auto-close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  // Global Theme & Density Sync across all pages and route refreshes
  useEffect(() => {
    const syncTheme = () => {
      try {
        const theme = localStorage.getItem('theme') || 'light';
        const density = localStorage.getItem('density') || 'comfortable';
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.setAttribute('data-density', density);
        if (theme === 'dark') {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      } catch {
        // ignore
      }
    };

    syncTheme();
    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  // Determine active item based on current pathname
  const path = location.pathname;
  let activeItem = 'dashboard';
  if (path.includes('client-management')) activeItem = 'client-management';
  else if (path.includes('job-order-management')) activeItem = 'job-order-management';
  else if (path.includes('applicant-registration')) activeItem = 'applicant-registration';
  else if (path.includes('recruitment-selection')) activeItem = 'recruitment-selection';
  else if (path.includes('deployment-assignment')) activeItem = 'deployment-assignment';
  else if (path.includes('ai-analytics')) activeItem = 'ai-analytics';
  else if (path.includes('settings')) activeItem = 'settings';
  else if (path.includes('profile')) activeItem = 'profile';
  else if (path.includes('dashboard') || path === '/') activeItem = 'dashboard';

  // Dynamic Browser Tab Title
  useEffect(() => {
    const titles = {
      'dashboard': 'Operational Dashboard | PRIMEPOWER MANPOWER',
      'client-management': 'Client Management | PRIMEPOWER MANPOWER',
      'job-order-management': 'Job Orders | PRIMEPOWER MANPOWER',
      'applicant-registration': 'Applicant Registration | PRIMEPOWER MANPOWER',
      'recruitment-selection': 'Recruitment & Selection | PRIMEPOWER MANPOWER',
      'deployment-assignment': 'Deployment & Assignment | PRIMEPOWER MANPOWER',
      'ai-analytics': 'AI Analytics & Scoring | PRIMEPOWER MANPOWER',
      'settings': 'System Settings | PRIMEPOWER MANPOWER',
      'profile': 'My Profile & Preferences | PRIMEPOWER MANPOWER',
    };
    const matched = Object.keys(titles).find((k) => location.pathname.includes(k));
    document.title = matched ? titles[matched] : 'PRIMEPOWER MANPOWER | HR Smart Recruitment System';
  }, [location.pathname]);

  return (
    <div className="root-layout-shell" style={{ height: '100vh', width: '100vw', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar
        activeItem={activeItem}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className="main-viewport-pane"
        style={{
          marginLeft: window.innerWidth < 1024 ? 0 : collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'var(--bg)',
        }}
      >
        <Header onToggleMobileMenu={() => setMobileOpen((m) => !m)} />
        <div className="main-content-slot" style={{ flex: '1 0 auto', minWidth: 0, padding: '18px 26px 26px 26px' }}>
          {navTransition ? (
            <SkeletonLoader variant="auto" />
          ) : (
            <Outlet context={{ collapsed, setCollapsed }} />
          )}
        </div>
      </div>
    </div>
  );
}
