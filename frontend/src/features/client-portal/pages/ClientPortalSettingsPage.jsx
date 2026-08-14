import { useState, useEffect, useMemo } from 'react';
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

              <div className="table-responsive">
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
