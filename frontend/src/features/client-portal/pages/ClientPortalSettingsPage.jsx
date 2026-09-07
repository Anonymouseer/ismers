import { useState, useEffect, useMemo } from 'react';
import { clientPortalService } from '../services/ClientPortalService';
import '../../settings/pages/SettingsPage.css';

const MOCK_CLIENT_AUDIT_LOGS = [
  {
    id: 'LOG-821',
    timestamp: '2026-08-07 09:22:10',
    user: 'Engr. Ferdinand Ramos',
    email: 'f.ramos@sunshinemfg.ph',
    action: 'Logged in to Client Portal dashboard',
    module: 'Access',
    ip: '203.0.113.18',
    status: 'Success',
  },
  {
    id: 'LOG-820',
    timestamp: '2026-08-06 18:03:42',
    user: 'Engr. Ferdinand Ramos',
    email: 'f.ramos@sunshinemfg.ph',
    action: 'Updated company profile and corporate branding details',
    module: 'Settings',
    ip: '203.0.113.18',
    status: 'Success',
  },
  {
    id: 'LOG-819',
    timestamp: '2026-08-06 15:14:29',
    user: 'Engr. Ferdinand Ramos',
    email: 'f.ramos@sunshinemfg.ph',
    action: 'Enabled new interview confirmation alerts for recruitment updates',
    module: 'Notifications',
    ip: '203.0.113.18',
    status: 'Success',
  },
  {
    id: 'LOG-818',
    timestamp: '2026-08-05 11:48:07',
    user: 'Engr. Ferdinand Ramos',
    email: 'f.ramos@sunshinemfg.ph',
    action: 'Reviewed endorsed candidate shortlist for Job Order #PRJ-2048',
    module: 'Client Portal',
    ip: '203.0.113.18',
    status: 'Info',
  },
];

const formatAuditTimestamp = (value) => {
  if (!value) return '—';

  const normalizedValue = typeof value === 'string' && value.includes(' ') && !value.includes('T')
    ? value.replace(' ', 'T')
    : value;

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const INDUSTRIES = [
  'Manufacturing',
  'Electronics & Precision Assembly',
  'Construction',
  'Logistics & Warehousing',
  'Food & Beverage',
  'Retail & Trade',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'Information Technology',
  'Business Process Outsourcing',
  'Finance & Banking',
  'Real Estate',
  'Agriculture',
  'Other',
];

export default function ClientPortalSettingsPage({ session, onUpdateSession }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'notifications' | 'appearance' | 'audit'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('ismers.client_portal.audit_logs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_CLIENT_AUDIT_LOGS;
  });
  const [logFilterModule, setLogFilterModule] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  // Client Company Account Profile State
  const [company, setCompany] = useState(session?.company || 'Sunshine Manufacturing Corp.');
  const [industry, setIndustry] = useState(session?.industry || 'Electronics & Precision Assembly');
  const [contactPerson, setContactPerson] = useState(session?.contactPerson || 'Engr. Ferdinand Ramos');
  const [designation, setDesignation] = useState(session?.designation || 'VP of Human Resources & Operations');
  const [email, setEmail] = useState(session?.email || 'f.ramos@sunshinemfg.ph');
  const [mobile, setMobile] = useState(session?.mobile || '+63 917 882 4910');
  const [logo, setLogo] = useState(session?.logo || '');

  // Keep state synced with session prop
  useEffect(() => {
    if (session) {
      setCompany(session.company || 'Sunshine Manufacturing Corp.');
      setIndustry(session.industry || 'Electronics & Precision Assembly');
      setContactPerson(session.contactPerson || 'Engr. Ferdinand Ramos');
      setDesignation(session.designation || 'VP of Human Resources & Operations');
      setEmail(session.email || 'f.ramos@sunshinemfg.ph');
      setMobile(session.mobile || '+63 917 882 4910');
      setLogo(session.logo || '');
    }
  }, [session]);

  // Client Portal Notification Settings
  const [notifEndorsement, setNotifEndorsement] = useState(true);
  const [notifJobStatus, setNotifJobStatus] = useState(true);
  const [notifContractExpiry, setNotifContractExpiry] = useState(true);
  const [notifInterview, setNotifInterview] = useState(true);

  // Appearance Theme & Density State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable');

  // Security & Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmNewPw, setShowConfirmNewPw] = useState(false);
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (!currentPassword) {
      setPwError('Current password is required.');
      return;
    }
    if (!newPassword) {
      setPwError('New password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError('New passwords do not match. Please verify.');
      return;
    }

    setPwSubmitting(true);

    try {
      const res = await clientPortalService.changePassword({
        email: session?.email || email,
        currentPassword,
        newPassword,
      });

      if (res?.data?.success) {
        setPwSuccess('Your portal access password has been successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');

        const newLog = {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          user: contactPerson || 'Client User',
          email: email || session?.email || 'client@primepower.ph',
          action: 'Updated Client Portal login access password',
          module: 'Access',
          ip: '203.0.113.18',
          status: 'Success',
        };
        setAuditLogs((prev) => {
          const next = [newLog, ...prev];
          try {
            localStorage.setItem('ismers.client_portal.audit_logs', JSON.stringify(next));
          } catch { /* ignore */ }
          return next;
        });
      } else {
        setPwError(res?.data?.message || 'Password update failed.');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Current password entered is incorrect.');
    } finally {
      setPwSubmitting(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('density', density);
  }, [density]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogo(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const updatedProfile = {
      company,
      industry,
      contactPerson,
      designation,
      email,
      mobile,
      logo,
    };
    if (onUpdateSession) {
      onUpdateSession(updatedProfile);
    }

    const newLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      user: contactPerson || 'Engr. Ferdinand Ramos',
      email: email || 'f.ramos@sunshinemfg.ph',
      action: 'Updated company profile, notification settings, and portal preferences',
      module: 'Settings',
      ip: '203.0.113.18',
      status: 'Success',
    };

    setAuditLogs((prev) => {
      const next = [newLog, ...prev];
      try {
        localStorage.setItem('ismers.client_portal.audit_logs', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    setSavedSuccess(true);
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (logFilterModule !== 'all' && log.module !== logFilterModule) return false;
      if (logSearch) {
        const q = logSearch.toLowerCase();
        return (
          log.action.toLowerCase().includes(q) ||
          log.user.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, logFilterModule, logSearch]);

  return (
    <div className="client-portal-view-container">
      {/* Header Title Section */}
      <div className="settings-header" style={{ marginBottom: '20px' }}>
        <div className="header-text">
          <span className="crumb">Client Portal</span>
          <h1 className="page-title">Portal Settings &amp; Company Account</h1>
          <p className="page-subtitle">Manage company registration details, branding logo, notification alerts, and appearance.</p>
        </div>
        <button type="button" className="btn-save" onClick={handleSave}>
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save Changes
        </button>
      </div>

      {savedSuccess && (
        <div className="toast-popup" role="status" aria-live="polite">
          <div className="toast-popup-content">
            <div className="toast-popup-icon">
              <svg className="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <div className="toast-popup-text">Client Portal settings and company profile saved successfully!</div>
          </div>
          <button
            type="button"
            className="toast-popup-close"
            aria-label="Close notification"
            onClick={() => setSavedSuccess(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Two-Column Full Width Settings Layout */}
      <div className="settings-layout">
        {/* Left Vertical Navigation */}
        <div className="settings-sidebar-nav">
          <div className="settings-nav-group">
            <div className="settings-nav-label">Company Account</div>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="7" y1="8" x2="17" y2="8" />
                <line x1="7" y1="12" x2="13" y2="12" />
              </svg>
              General Profile
            </button>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => { setActiveTab('security'); setPwError(''); setPwSuccess(''); }}
            >
              <svg className="icon" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Security &amp; Password
            </button>
          </div>

          <div className="settings-nav-group">
            <div className="settings-nav-label">Preferences</div>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Notifications
            </button>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              Appearance
            </button>
            <button
              type="button"
              className={`nav-item-btn ${activeTab === 'audit' ? 'active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              Audit Logs
            </button>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="settings-content-card">
          {/* TAB 1: GENERAL COMPANY PROFILE */}
          {activeTab === 'general' && (
            <div className="section-block">
              <h2 className="section-title">General Company Profile</h2>
              <p className="section-desc">Manage registered employer details, primary contact credentials, and official company logo.</p>

              {/* COMPANY LOGO SECTION */}
              <div className="cp-logo-field-container" style={{ marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid var(--border)' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>
                  Company Logo &amp; Corporate Avatar
                </label>
                <div className="cp-logo-upload-wrap">
                  <div className="client-portal-sidebar-user-avatar cp-logo-preview" style={{ width: 56, height: 56, fontSize: 22, borderRadius: '12px' }}>
                    {logo ? (
                      <img src={logo} alt={company} className="client-portal-sidebar-logo-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    ) : (
                      (company || 'S')[0]
                    )}
                  </div>
                  <div className="cp-logo-upload-controls">
                    <label htmlFor="cp-settings-logo-input" className="cp-logo-upload-btn">
                      <svg className="icon" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>{logo ? 'Change Logo' : 'Upload Logo'}</span>
                    </label>
                    <input
                      id="cp-settings-logo-input"
                      type="file"
                      accept="image/*"
                      className="cp-logo-file-input"
                      onChange={handleLogoUpload}
                    />
                    {logo && (
                      <button type="button" className="cp-logo-remove-btn" onClick={() => setLogo('')}>
                        Remove Logo
                      </button>
                    )}
                    <span className="cp-logo-hint">Upload PNG, JPG, or SVG (Max 2MB)</span>
                  </div>
                </div>
              </div>

              {/* CLIENT ACCOUNT REGISTRATION DETAILS */}
              <div className="form-grid-2col">
                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>PRIMEPOWER Corporate Client ID</label>
                  <input
                    type="text"
                    className="input-compact"
                    value={session?.companyId || 'CLT-2026-0001'}
                    disabled
                    style={{
                      fontFamily: 'ui-monospace, monospace',
                      fontWeight: 700,
                      color: 'var(--primary, #007dcc)',
                      background: 'rgba(0, 125, 204, 0.06)',
                      border: '1px solid rgba(0, 125, 204, 0.2)',
                    }}
                  />
                </div>

                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>Registered Corporate Name <span style={{ color: '#e53935' }}>*</span></label>
                  <input
                    type="text"
                    className="input-compact"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Sunshine Manufacturing Corp."
                  />
                </div>

                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>Industry Sector <span style={{ color: '#e53935' }}>*</span></label>
                  <select
                    className="input-compact"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>Primary Contact Person <span style={{ color: '#e53935' }}>*</span></label>
                  <input
                    type="text"
                    className="input-compact"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Engr. Ferdinand Ramos"
                  />
                </div>

                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>Position / Designation</label>
                  <input
                    type="text"
                    className="input-compact"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. VP of Human Resources & Operations"
                  />
                </div>

                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>Official Email Address <span style={{ color: '#e53935' }}>*</span></label>
                  <input
                    type="email"
                    className="input-compact"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. f.ramos@sunshinemfg.ph"
                  />
                </div>

                <div className="form-group-compact">
                  <label style={{ fontSize: '11.5px', fontWeight: 700 }}>Mobile / Phone Number <span style={{ color: '#e53935' }}>*</span></label>
                  <input
                    type="text"
                    className="input-compact"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. +63 917 882 4910"
                  />
                </div>
              </div>

              {/* ACCOUNT STATUS & AGENCY REPRESENTATIVE DETAILS */}
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Account Registration Status
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="client-portal-badge client-portal-badge--active" style={{ fontSize: '11px' }}>Verified Active Client Account</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '8px' }}>
                    Servicing Branch: PRIMEPOWER Head Office (QC Branch)
                  </div>
                </div>

                <div style={{ padding: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                    Assigned PRIMEPOWER Representative
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>Mark Anthony Dela Cruz</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>Senior Account Manager &middot; Enterprise Recruitment</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--primary)', marginTop: '4px' }}>m.delacruz@primepower.ph &middot; +63 917 554 1029</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY & PASSWORD */}
          {activeTab === 'security' && (
            <div className="section-block">

              {/* ── Section Header ── */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0,125,204,0.12), rgba(0,125,204,0.06))',
                  border: '1px solid rgba(0,125,204,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h2 className="section-title" style={{ marginBottom: '4px' }}>Account Security &amp; Credentials</h2>
                  <p className="section-desc" style={{ margin: 0 }}>
                    Manage your Client Portal login credentials. All passwords are encrypted using bcrypt hashing in compliance with RA 10173 (Philippine Data Privacy Act).
                  </p>
                </div>
              </div>

              {/* ── Alerts ── */}
              {pwSuccess && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '13px 16px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.22)',
                  borderLeft: '3px solid #10b981',
                  borderRadius: '10px',
                  marginBottom: '24px',
                  animation: 'fadeInDown 0.25s ease',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', marginBottom: '1px' }}>Password Updated Successfully</div>
                    <div style={{ fontSize: '12px', color: '#059669', opacity: 0.85 }}>{pwSuccess}</div>
                  </div>
                </div>
              )}

              {pwError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '13px 16px',
                  background: 'rgba(239, 68, 68, 0.07)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderLeft: '3px solid #ef4444',
                  borderRadius: '10px',
                  marginBottom: '24px',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', marginBottom: '1px' }}>Update Failed</div>
                    <div style={{ fontSize: '12px', color: '#dc2626', opacity: 0.85 }}>{pwError}</div>
                  </div>
                </div>
              )}

              {/* ── Password Form Card ── */}
              <div style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '24px',
                maxWidth: '540px',
                marginBottom: '24px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '20px' }}>
                  Change Access Password
                </div>

                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                  {/* Current Password */}
                  <div>
                    <label htmlFor="cp-curr-password" style={{
                      display: 'block', fontSize: '12px', fontWeight: 700,
                      color: 'var(--text)', marginBottom: '7px', letterSpacing: '0.1px',
                    }}>
                      Current Password <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--muted)', pointerEvents: 'none', display: 'flex',
                      }}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <input
                        id="cp-curr-password"
                        type={showCurrentPw ? 'text' : 'password'}
                        placeholder="Enter your current access password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={{
                          width: '100%', height: '40px',
                          padding: '0 40px 0 36px',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: '9px',
                          fontSize: '13px', fontWeight: 500,
                          color: 'var(--text)',
                          outline: 'none',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                          fontFamily: 'var(--font-display)',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,125,204,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '4px' }}
                        aria-label="Toggle password visibility">
                        {showCurrentPw
                          ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />

                  {/* New Password */}
                  <div>
                    <label htmlFor="cp-new-password" style={{
                      display: 'block', fontSize: '12px', fontWeight: 700,
                      color: 'var(--text)', marginBottom: '7px',
                    }}>
                      New Password <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--muted)', pointerEvents: 'none', display: 'flex',
                      }}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <input
                        id="cp-new-password"
                        type={showNewPw ? 'text' : 'password'}
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        style={{
                          width: '100%', height: '40px',
                          padding: '0 40px 0 36px',
                          background: 'var(--bg)',
                          border: `1px solid ${newPassword.length > 0 && newPassword.length < 8 ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                          borderRadius: '9px',
                          fontSize: '13px', fontWeight: 500,
                          color: 'var(--text)',
                          outline: 'none',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                          fontFamily: 'var(--font-display)',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,125,204,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '4px' }}
                        aria-label="Toggle password visibility">
                        {showNewPw
                          ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {/* Password strength bar */}
                    {newPassword.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                          {[1, 2, 3, 4].map(i => {
                            const strength = newPassword.length < 6 ? 1 : newPassword.length < 8 ? 2 : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4 : 3;
                            const colors = { 1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#10b981' };
                            return (
                              <div key={i} style={{
                                flex: 1, height: '3px', borderRadius: '2px',
                                background: i <= strength ? colors[strength] : 'var(--border)',
                                transition: 'background 0.2s ease',
                              }} />
                            );
                          })}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                          {newPassword.length < 6 ? 'Weak — too short'
                            : newPassword.length < 8 ? 'Fair — must be at least 8 characters'
                            : /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 'Strong — excellent password strength'
                            : 'Good — add uppercase, numbers, or symbols for stronger security'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="cp-confirm-new-password" style={{
                      display: 'block', fontSize: '12px', fontWeight: 700,
                      color: 'var(--text)', marginBottom: '7px',
                    }}>
                      Confirm New Password <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--muted)', pointerEvents: 'none', display: 'flex',
                      }}>
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                      </div>
                      <input
                        id="cp-confirm-new-password"
                        type={showConfirmNewPw ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                        style={{
                          width: '100%', height: '40px',
                          padding: '0 40px 0 36px',
                          background: 'var(--bg)',
                          border: `1px solid ${confirmNewPassword.length > 0 && confirmNewPassword !== newPassword ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                          borderRadius: '9px',
                          fontSize: '13px', fontWeight: 500,
                          color: 'var(--text)',
                          outline: 'none',
                          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                          fontFamily: 'var(--font-display)',
                        }}
                        onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,125,204,0.1)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                      />
                      <button type="button" onClick={() => setShowConfirmNewPw(!showConfirmNewPw)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '4px' }}
                        aria-label="Toggle password visibility">
                        {showConfirmNewPw
                          ? <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {confirmNewPassword.length > 0 && confirmNewPassword !== newPassword && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                        Passwords do not match
                      </span>
                    )}
                    {confirmNewPassword.length > 0 && confirmNewPassword === newPassword && newPassword.length >= 8 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        Passwords match
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div style={{ paddingTop: '4px' }}>
                    <button
                      type="submit"
                      disabled={pwSubmitting}
                      style={{
                        height: '40px',
                        padding: '0 24px',
                        background: pwSubmitting ? 'var(--muted-bg)' : 'var(--primary)',
                        color: pwSubmitting ? 'var(--muted)' : '#fff',
                        border: 'none',
                        borderRadius: '9px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: pwSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'opacity 0.15s ease, transform 0.1s ease',
                        fontFamily: 'var(--font-display)',
                      }}
                      onMouseEnter={e => { if (!pwSubmitting) e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      {pwSubmitting && (
                        <span style={{
                          width: 14, height: 14, borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          animation: 'spin 0.7s linear infinite',
                          display: 'inline-block',
                        }} />
                      )}
                      {pwSubmitting ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* ── Compliance Badges ── */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {[
                  {
                    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                    accent: 'rgba(0,125,204,0.18)',
                    accentBorder: 'rgba(0,125,204,0.2)',
                    label: 'RA 10173 Compliant',
                    desc: 'Credentials stored with bcrypt encryption and strict role-based access isolation.',
                  },
                  {
                    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>,
                    accent: 'rgba(16,185,129,0.08)',
                    accentBorder: 'rgba(16,185,129,0.2)',
                    label: '60-Minute Token Expiry',
                    desc: 'Reset tokens are single-use and automatically invalidated after 60 minutes.',
                  },
                  {
                    icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#8b6fd1" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,
                    accent: 'rgba(139,111,209,0.08)',
                    accentBorder: 'rgba(139,111,209,0.2)',
                    label: 'bcrypt Encrypted',
                    desc: 'All passwords are one-way hashed. PRIMEPOWER staff cannot view or recover raw passwords.',
                  },
                ].map((badge) => (
                  <div key={badge.label} style={{
                    padding: '14px 16px',
                    background: badge.accent,
                    border: `1px solid ${badge.accentBorder}`,
                    borderRadius: '11px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                      {badge.icon}
                      <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', letterSpacing: '0.1px' }}>{badge.label}</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                      {badge.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="section-block">
              <h2 className="section-title">Notification Preferences</h2>
              <p className="section-desc">Configure dispatch rules for candidate endorsements, job requisition updates, and contract expirations.</p>

              <div className="switch-row">
                <div className="switch-text">
                  <span className="switch-title">Candidate Endorsement Alerts</span>
                  <span className="switch-desc">Receive real-time notifications when PRIMEPOWER recruiters endorse candidate profiles to your job requisitions</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifEndorsement ? 'on' : ''}`}
                  onClick={() => setNotifEndorsement(!notifEndorsement)}
                >
                  <span className="switch-thumb"></span>
                </button>
              </div>

              <div className="card-divider"></div>

              <div className="switch-row">
                <div className="switch-text">
                  <span className="switch-title">Job Order Status &amp; Fulfillment Updates</span>
                  <span className="switch-desc">Instant alerts when PRF job orders change status (In Review, Approved, Filled)</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifJobStatus ? 'on' : ''}`}
                  onClick={() => setNotifJobStatus(!notifJobStatus)}
                >
                  <span className="switch-thumb"></span>
                </button>
              </div>

              <div className="card-divider"></div>

              <div className="switch-row">
                <div className="switch-text">
                  <span className="switch-title">Contract Expiry &amp; Renewal Warnings</span>
                  <span className="switch-desc">Advance alerts 30 days prior to site personnel deployment contract expiration</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifContractExpiry ? 'on' : ''}`}
                  onClick={() => setNotifContractExpiry(!notifContractExpiry)}
                >
                  <span className="switch-thumb"></span>
                </button>
              </div>

              <div className="card-divider"></div>

              <div className="switch-row">
                <div className="switch-text">
                  <span className="switch-title">Candidate Interview Confirmation Alerts</span>
                  <span className="switch-desc">Automated email and portal alerts when candidate interview slots are confirmed or updated</span>
                </div>
                <button
                  type="button"
                  className={`switch-toggle ${notifInterview ? 'on' : ''}`}
                  onClick={() => setNotifInterview(!notifInterview)}
                >
                  <span className="switch-thumb"></span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="section-block">
              <h2 className="section-title">Appearance &amp; Theme Customization</h2>
              <p className="section-desc">Choose how the Client Portal interface looks on your device.</p>

              <div className="theme-compact-grid">
                <div
                  className={`compact-theme-card ${theme === 'light' ? 'selected' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <div className="compact-preview light-mode-prev">
                    <div className="prev-sidebar"></div>
                    <div className="prev-body">
                      <div className="prev-line short"></div>
                      <div className="prev-line long"></div>
                    </div>
                  </div>
                  <div className="theme-title-row">
                    <span className="theme-title">Corporate Light</span>
                    {theme === 'light' && <span className="active-tag">Active</span>}
                  </div>
                </div>

                <div
                  className={`compact-theme-card ${theme === 'dark' ? 'selected' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <div className="compact-preview dark-mode-prev">
                    <div className="prev-sidebar"></div>
                    <div className="prev-body">
                      <div className="prev-line short"></div>
                      <div className="prev-line long"></div>
                    </div>
                  </div>
                  <div className="theme-title-row">
                    <span className="theme-title">Executive Dark</span>
                    {theme === 'dark' && <span className="active-tag">Active</span>}
                  </div>
                </div>
              </div>

              <div className="card-divider" style={{ margin: '20px 0' }}></div>

              <div className="form-group-compact">
                <label>Interface Layout Density</label>
                <div className="density-toggle-group" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className={`btn-option ${density === 'compact' ? 'active' : ''}`}
                    onClick={() => setDensity('compact')}
                  >
                    Compact
                  </button>
                  <button
                    type="button"
                    className={`btn-option ${density === 'comfortable' ? 'active' : ''}`}
                    onClick={() => setDensity('comfortable')}
                  >
                    Comfortable (Default)
                  </button>
                  <button
                    type="button"
                    className={`btn-option ${density === 'spacious' ? 'active' : ''}`}
                    onClick={() => setDensity('spacious')}
                  >
                    Spacious
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="section-block">
              <div className="audit-header-row">
                <div>
                  <h2 className="section-title">Audit Logs &amp; Activity History</h2>
                  <p className="section-desc">Track portal access, profile updates, and action history for your company account.</p>
                </div>
                <button type="button" className="btn-secondary-action">Export Audit Log (CSV)</button>
              </div>

              <div className="audit-toolbar">
                <div className="audit-search-box">
                  <svg className="icon" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search action or user..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>

                <select
                  className="audit-select-filter"
                  value={logFilterModule}
                  onChange={(e) => setLogFilterModule(e.target.value)}
                >
                  <option value="all">All Modules</option>
                  <option value="Settings">Settings</option>
                  <option value="Access">Access</option>
                  <option value="Notifications">Notifications</option>
                  <option value="Client Portal">Client Portal</option>
                </select>
              </div>

              <div className="table-responsive audit-table-scroll">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>LOG ID</th>
                      <th>TIMESTAMP</th>
                      <th>USER</th>
                      <th>ACTION / EVENT</th>
                      <th>MODULE</th>
                      <th>IP ADDRESS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="log-id">{log.id}</td>
                        <td className="log-time">{formatAuditTimestamp(log.timestamp)}</td>
                        <td>
                          <div className="user-cell">
                            <span className="user-name">{log.user}</span>
                          </div>
                        </td>
                        <td className="log-action">{log.action}</td>
                        <td>
                          <span className="module-badge">{log.module}</span>
                        </td>
                        <td className="log-ip">{log.ip}</td>
                        <td>
                          <span className={`status-pill ${log.status.toLowerCase()}`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredLogs.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table-note">
                          No matching audit logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
