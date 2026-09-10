import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../auth/store/AuthStore';
import auditLogService from '../../../services/auditLogService';
import './UserProfilePage.css';

const PROFILE_STORAGE_KEY = 'ismers.user_preferences';

export default function UserProfilePage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // User details state
  const [fullName, setFullName] = useState(user?.name || 'Administrator');
  const [contactPhone, setContactPhone] = useState('+63 (917) 849-2041');
  const [emailSignature, setEmailSignature] = useState(
    `${user?.name || 'Staff Member'}\n${user?.roleLabel || 'HR Recruiter'}\nPRIMEPOWER MANPOWER RECRUITMENT\nAyala Avenue, Makati City | www.primepower.ph`
  );

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [personal2Fa, setPersonal2Fa] = useState(true);

  // Notifications state
  const [notifAssignedPrf, setNotifAssignedPrf] = useState(true);
  const [notifCandidateClearance, setNotifCandidateClearance] = useState(true);
  const [notifDailyDigest, setNotifDailyDigest] = useState(true);
  const [notifSoundAlerts, setNotifSoundAlerts] = useState(false);

  // Workspace display state
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable');
  const [syncWithSystem, setSyncWithSystem] = useState(false);
  const [defaultRoute, setDefaultRoute] = useState(user?.defaultRoute || '/dashboard');

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') document.body.classList.add('dark');
    else document.body.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Sync density with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('density', density);
  }, [density]);

  // Handle Save Profile
  const handleSaveProfile = (e) => {
    if (e) e.preventDefault();
    const oldName = user?.name || 'Administrator';
    if (updateUser) {
      updateUser({ name: fullName });
    }
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        contactPhone,
        emailSignature,
        notifAssignedPrf,
        notifCandidateClearance,
        notifDailyDigest,
        notifSoundAlerts,
        defaultRoute
      }));
    } catch {
      // ignore
    }

    const isNameChanged = oldName !== fullName;
    const actionText = isNameChanged
      ? `Updated personal profile: Changed staff name from "${oldName}" to "${fullName}" (Phone: ${contactPhone})`
      : `Updated personal profile identification & signature (Phone: ${contactPhone})`;

    auditLogService.recordLog(
      actionText,
      'Authentication',
      {
        previous_name: oldName,
        new_name: fullName,
        contact_phone: contactPhone,
        default_route: defaultRoute,
      },
      'Success'
    );

    showToast('Personal profile and signature updated successfully!');
  };

  // Handle Change Password
  const handleChangePassword = (e) => {
    if (e) e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.');
      return;
    }

    auditLogService.recordLog(
      `User updated personal security password credentials`,
      'Security & Governance',
      { user_email: user?.email },
      'Success'
    );

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully! Next login requires new credentials.');
  };

  // Handle Save Notifications
  const handleSaveNotifications = () => {
    try {
      const current = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || '{}');
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify({
        ...current,
        notifAssignedPrf,
        notifCandidateClearance,
        notifDailyDigest,
        notifSoundAlerts
      }));
    } catch {}

    auditLogService.recordLog(
      `Updated personal notification alert subscriptions (PRF Alerts: ${notifAssignedPrf ? 'ON' : 'OFF'}, Clearance Alerts: ${notifCandidateClearance ? 'ON' : 'OFF'})`,
      'Communication & Alerts',
      { notifAssignedPrf, notifCandidateClearance, notifDailyDigest, notifSoundAlerts },
      'Success'
    );

    showToast('Personal notification preferences saved!');
  };

  // Handle Save Workspace
  const handleSaveWorkspace = () => {
    try {
      if (updateUser) {
        updateUser({ defaultRoute });
      }
      const storedUser = JSON.parse(localStorage.getItem('primepower_admin_user') || '{}');
      const updatedUser = { ...storedUser, defaultRoute };
      localStorage.setItem('primepower_admin_user', JSON.stringify(updatedUser));
    } catch {}

    auditLogService.recordLog(
      `Updated personal workspace display preferences (Theme: ${theme}, Density: ${density}, Route: ${defaultRoute})`,
      'System Administration',
      { theme, density, defaultRoute },
      'Success'
    );

    showToast('Workspace display and startup route saved!');
  };

  return (
    <div className="app">
      <main className={`profile-main-wrapper ${collapsed ? 'collapsed' : ''}`}>
        <div className="profile-page-body">
          {/* Header Title */}
          <div className="profile-header">
            <div className="header-text">
              <span className="crumb">Account &amp; Profile</span>
              <h1 className="page-title">My Account &amp; Personal Preferences</h1>
              <p className="page-subtitle">Manage your personal identification, security credentials, and workspace settings.</p>
            </div>
            <button type="button" className="btn-save" onClick={handleSaveProfile}>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Profile
            </button>
          </div>

          {/* Identity Card Banner */}
          <div className="profile-identity-card">
            <div className="identity-left">
              <div className="identity-avatar-slot">
                {(fullName || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="identity-info">
                <div className="identity-name">{fullName}</div>
                <div className="identity-email">{user?.email || 'staff@primepower.ph'}</div>
                <div className="identity-badges">
                  <span className="identity-role-badge">{user?.roleLabel || 'Staff Member'}</span>
                  <span className="identity-dept-badge">{user?.department || 'Talent Acquisition'}</span>
                </div>
              </div>
            </div>

            <div className="identity-right">
              <div className="identity-stat-box">
                <span className="identity-stat-label">Staff ID</span>
                <span className="identity-stat-value">EMP-2026-0842</span>
              </div>
              <div className="identity-stat-box">
                <span className="identity-stat-label">Account Status</span>
                <span className="identity-stat-value" style={{ color: 'var(--green)' }}>Verified Active</span>
              </div>
            </div>
          </div>

          {/* Layout Grid (Left Nav + Right Content) */}
          <div className="profile-layout">
            {/* Sidebar Nav */}
            <div className="profile-sidebar-nav">
              <button
                type="button"
                className={`profile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Personal Profile
              </button>

              <button
                type="button"
                className={`profile-nav-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Security &amp; Password
              </button>

              <button
                type="button"
                className={`profile-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                Notifications &amp; Alerts
              </button>

              <button
                type="button"
                className={`profile-nav-btn ${activeTab === 'workspace' ? 'active' : ''}`}
                onClick={() => setActiveTab('workspace')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
                Workspace Display
              </button>
            </div>

            {/* Content Area */}
            <div className="profile-content-card">
              {/* TAB 1: PERSONAL PROFILE */}
              {activeTab === 'profile' && (
                <div className="section-block">
                  <h2 className="section-title">Personal Identification &amp; Contact</h2>
                  <p className="section-desc">Manage your displayed staff name, contact details, and outbound email signature.</p>

                  <div className="form-grid-2col">
                    <div className="form-group-compact">
                      <label>Full Staff Name</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>

                    <div className="form-group-compact">
                      <label>Corporate Email (Assigned by Administrator)</label>
                      <input
                        type="email"
                        className="input-compact disabled"
                        disabled
                        value={user?.email || 'staff@primepower.ph'}
                      />
                    </div>

                    <div className="form-group-compact">
                      <label>Official Contact / Mobile Number</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>

                    <div className="form-group-compact">
                      <label>Assigned Department &amp; Role</label>
                      <input
                        type="text"
                        className="input-compact disabled"
                        disabled
                        value={`${user?.roleLabel || 'HR Recruiter'} (${user?.department || 'Talent Acquisition'})`}
                      />
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <div className="form-group-compact">
                    <label>Outbound Candidate Email Signature</label>
                    <textarea
                      rows="4"
                      className="input-compact text-area"
                      value={emailSignature}
                      onChange={(e) => setEmailSignature(e.target.value)}
                    ></textarea>
                    <span style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 3 }}>
                      This signature will be appended to candidate interview invitations, endorsement letters, and job offer notices.
                    </span>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button type="button" className="btn-save" onClick={handleSaveProfile}>
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <div className="section-block">
                  <h2 className="section-title">Personal Security &amp; Access Credentials</h2>
                  <p className="section-desc">Update your account password and configure personal two-factor authentication.</p>

                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group-compact">
                      <label>Current Access Password</label>
                      <input
                        type="password"
                        className="input-compact"
                        placeholder="••••••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group-compact">
                        <label>New Password (Min 8 Characters)</label>
                        <input
                          type="password"
                          className="input-compact"
                          placeholder="••••••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group-compact">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          className="input-compact"
                          placeholder="••••••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <button type="submit" className="btn-save" style={{ marginTop: 4 }}>
                        Update Access Password
                      </button>
                    </div>
                  </form>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Personal Two-Factor Authentication (2FA)</span>
                      <span className="switch-desc">Require one-time verification PIN sent to your corporate email upon login</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${personal2Fa ? 'on' : ''}`}
                      onClick={() => {
                        setPersonal2Fa(!personal2Fa);
                        showToast(`Personal 2FA ${!personal2Fa ? 'enabled' : 'disabled'}.`);
                      }}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                      Current Active Browser Session
                    </h3>
                    <div
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '12px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>
                          Windows 11 &nbsp;·&nbsp; Chrome Desktop
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                          IP: 192.168.1.104 &nbsp;·&nbsp; Metro Manila, Philippines &nbsp;·&nbsp; <span style={{ color: 'var(--green)', fontWeight: 700 }}>Active Now</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="section-block">
                  <h2 className="section-title">Personal Notification &amp; Alert Filters</h2>
                  <p className="section-desc">Customize which recruitment events trigger email or in-app alerts for your account.</p>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Assigned PRF Job Order Match Alerts</span>
                      <span className="switch-desc">Receive email alerts when a candidate scores above 85% on Job Orders assigned to you</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${notifAssignedPrf ? 'on' : ''}`}
                      onClick={() => setNotifAssignedPrf(!notifAssignedPrf)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Candidate Clearance Document Uploads</span>
                      <span className="switch-desc">Notify me when shortlisted applicants upload verified NBI or Medical Fit-to-Work PDFs</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${notifCandidateClearance ? 'on' : ''}`}
                      onClick={() => setNotifCandidateClearance(!notifCandidateClearance)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Daily Morning Task &amp; Interview Digest</span>
                      <span className="switch-desc">Receive a 08:00 AM summary of pending interviews and active deployment schedules</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${notifDailyDigest ? 'on' : ''}`}
                      onClick={() => setNotifDailyDigest(!notifDailyDigest)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">In-App Audio Chime Alerts</span>
                      <span className="switch-desc">Play subtle notification chime for high-priority candidate approvals</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${notifSoundAlerts ? 'on' : ''}`}
                      onClick={() => setNotifSoundAlerts(!notifSoundAlerts)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button type="button" className="btn-save" onClick={handleSaveNotifications}>
                      Save Notification Preferences
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: WORKSPACE DISPLAY */}
              {activeTab === 'workspace' && (
                <div className="section-block">
                  <h2 className="section-title">Workspace Theme &amp; Display Preferences</h2>
                  <p className="section-desc">Personalize the visual appearance and default landing module on your device.</p>

                  <div className="theme-compact-grid">
                    <div
                      className={`compact-theme-card ${theme === 'light' ? 'selected' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="compact-preview light-mode-prev">
                        <div className="prev-sidebar"></div>
                        <div className="prev-body">
                          <div className="prev-top-bar"></div>
                          <div className="prev-card-large"></div>
                        </div>
                      </div>
                      <span className="compact-label">Light Mode</span>
                      {theme === 'light' && (
                        <div className="check-badge">
                          <svg viewBox="0 0 24 24" className="check-icon">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div
                      className={`compact-theme-card ${theme === 'dark' ? 'selected' : ''}`}
                      onClick={() => setTheme('dark')}
                    >
                      <div className="compact-preview dark-mode-prev">
                        <div className="prev-sidebar"></div>
                        <div className="prev-body">
                          <div className="prev-top-bar"></div>
                          <div className="prev-card-large"></div>
                        </div>
                      </div>
                      <span className="compact-label">Dark Mode</span>
                      {theme === 'dark' && (
                        <div className="check-badge">
                          <svg viewBox="0 0 24 24" className="check-icon">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <div className="form-group-compact">
                    <label>Interface Density &amp; Scaling</label>
                    <div className="density-picker">
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

                  <div className="card-divider"></div>

                  <div className="form-group-compact">
                    <label>Default Startup Landing Portal</label>
                    <select
                      className="input-compact"
                      value={defaultRoute}
                      onChange={(e) => setDefaultRoute(e.target.value)}
                    >
                      <option value="/client-management">Client Management Portal</option>
                      <option value="/applicant-registration">Applicant Registration &amp; Profiling Board</option>
                      <option value="/recruitment-selection">Recruitment &amp; Selection Pipeline</option>
                      <option value="/job-order-management">Job Order PRF Management</option>
                      <option value="/deployment-assignment">Deployment &amp; Assignment</option>
                      <option value="/ai-analytics">AI Scoring &amp; Recruitment Intelligence</option>
                    </select>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <button type="button" className="btn-save" onClick={handleSaveWorkspace}>
                      Save Workspace Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="toast-popup" role="status" aria-live="polite">
              <div className="toast-popup-content">
                <div className="toast-popup-icon">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div className="toast-popup-text">{toastMessage}</div>
              </div>
              <button
                type="button"
                className="toast-popup-close"
                aria-label="Close notification"
                onClick={() => setToastMessage(null)}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
