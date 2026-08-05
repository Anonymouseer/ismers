import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Sidebar.css';

export default function RootLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Determine active item based on current pathname
  const path = location.pathname;
  let activeItem = 'dashboard';
  if (path.includes('client-management')) activeItem = 'client-management';
  else if (path.includes('job-order-management')) activeItem = 'job-order-management';
  else if (path.includes('applicant-registration')) activeItem = 'applicant-registration';
  else if (path.includes('recruitment-selection')) activeItem = 'recruitment-selection';
  else if (path.includes('deployment-assignment')) activeItem = 'deployment-assignment';
  else if (path.includes('settings')) activeItem = 'settings';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg)', overflow: 'hidden' }}>
      <Sidebar
        activeItem={activeItem}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <Outlet context={{ collapsed, setCollapsed }} />
      </div>
    </div>
  );
}
