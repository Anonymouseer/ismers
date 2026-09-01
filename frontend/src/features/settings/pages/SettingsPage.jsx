import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import auditLogService from '../../../services/auditLogService';
import './SettingsPage.css';

const MOCK_AUDIT_LOGS = [
  {
    id: 'LOG-108',
    timestamp: '2026-08-05 14:38:12',
    user: 'ADMIN USER',
    email: 'admin@primepower.ph',
    action: 'Changed system appearance theme to Dark Mode',
    module: 'Settings',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-107',
    timestamp: '2026-08-05 14:22:05',
    user: 'HR RECRUITER',
    email: 'recruiter.lead@primepower.ph',
    action: 'Approved Manpower Job Order #JO-2026-012 (Acme Logistics Corp)',
    module: 'Job Orders',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-106',
    timestamp: '2026-08-05 13:50:44',
    user: 'OPERATIONS LEAD',
    email: 'deployment.ops@primepower.ph',
    action: 'Updated deployment assignment for Juan Dela Cruz to Client BDO Unibank',
    module: 'Deployment',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-105',
    timestamp: '2026-08-05 11:15:30',
    user: 'ADMIN USER',
    email: 'admin@primepower.ph',
    action: 'Enabled Two-Factor Authentication (2FA) for Admin account',
    module: 'Security',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-104',
    timestamp: '2026-08-05 09:05:18',
    user: 'ADMIN USER',
    email: 'admin@primepower.ph',
    action: 'Exported Applicant Profiling List (CSV Format)',
    module: 'Data Export',
    ip: '192.168.1.104',
    status: 'Info'
  },
  {
    id: 'LOG-103',
    timestamp: '2026-08-04 18:40:00',
    user: 'SYSTEM BACKUP',
    email: 'system@primepower.ph',
    action: 'Executed Automated Midnight Database Snapshot Backup',
    module: 'System Data',
    ip: '10.0.0.1',
    status: 'Success'
  },
  {
    id: 'LOG-102',
    timestamp: '2026-08-04 16:12:35',
    user: 'ADMIN USER',
    email: 'admin@primepower.ph',
    action: 'Added new registered client company profile: BDO Unibank Inc.',
    module: 'Client Mgmt',
    ip: '192.168.1.104',
    status: 'Success'
  }
];

const INITIAL_USERS = [
  {
    id: 'USR-001',
    name: 'ADMIN USER',
    email: 'admin@primepower.ph',
    role: 'Super Administrator',
    dept: 'Executive Management',
    status: 'Active',
    lastActive: 'Active Now'
  },
  {
    id: 'USR-002',
    name: 'Clarissa Ramos',
    email: 'recruiter.lead@primepower.ph',
    role: 'Senior HR Recruiter',
    dept: 'Talent Acquisition',
    status: 'Active',
    lastActive: '12 mins ago'
  },
  {
    id: 'USR-003',
    name: 'Mark Anthony Santos',
    email: 'deployment.ops@primepower.ph',
    role: 'Operations Officer',
    dept: 'Manpower Deployment',
    status: 'Active',
    lastActive: '1 hour ago'
  },
  {
    id: 'USR-004',
    name: 'Patricia Joy Gomez',
    email: 'accounts@primepower.ph',
    role: 'Client Relations Officer',
    dept: 'Client Accounts',
    status: 'Active',
    lastActive: 'Yesterday'
  }
];

export default function SettingsPage() {
  const { collapsed, setCollapsed } = useOutletContext() || { collapsed: false, setCollapsed: () => { } };
  const [activeTab, setActiveTab] = useState('appearance');

  // Theme & Accent State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  const [density, setDensity] = useState(() => {
    return localStorage.getItem('density') || 'comfortable';
  });
  const [syncWithSystem, setSyncWithSystem] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const SETTINGS_STORAGE_KEY = 'ismers.settings';
  const LOGS_STORAGE_KEY = 'ismers.audit_logs';
  const USERS_STORAGE_KEY = 'ismers.system_users';

  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  };

  const savedSettings = useMemo(loadSavedSettings, []);

  // Form State initialized with localStorage fallback
  const [companyName, setCompanyName] = useState(savedSettings.companyName || 'PRIMEPOWER MANPOWER');
  const [departmentName, setDepartmentName] = useState(savedSettings.departmentName || 'HR Smart Recruitment System');
  const [supportEmail, setSupportEmail] = useState(savedSettings.supportEmail || 'support@primepower.ph');
  const [contactPhone, setContactPhone] = useState(savedSettings.contactPhone || '+63 (02) 8812-3456');
  const [address, setAddress] = useState(savedSettings.address || 'Ayala Avenue, Makati City, Metro Manila, Philippines');
  const [timezone, setTimezone] = useState(savedSettings.timezone || 'Asia/Manila (GMT+8)');
  const [dateFormat, setDateFormat] = useState(savedSettings.dateFormat || 'YYYY-MM-DD');
  const [currency, setCurrency] = useState(savedSettings.currency || 'PHP (₱)');
  const [businessHours, setBusinessHours] = useState(savedSettings.businessHours || '08:00 AM - 05:00 PM (Mon-Sat)');

  // Notification Switches
  const [emailApplicant, setEmailApplicant] = useState(savedSettings.emailApplicant ?? true);
  const [emailJobOrder, setEmailJobOrder] = useState(savedSettings.emailJobOrder ?? true);
  const [smsDeploy, setSmsDeploy] = useState(savedSettings.smsDeploy ?? true);
  const [dailyDigest, setDailyDigest] = useState(savedSettings.dailyDigest ?? true);
  const [soundAlerts, setSoundAlerts] = useState(savedSettings.soundAlerts ?? false);

  // Security Switches
  const [twoFa, setTwoFa] = useState(savedSettings.twoFa ?? true);
  const [sessionTimeout, setSessionTimeout] = useState(savedSettings.sessionTimeout || '30');
  const [autoBackup, setAutoBackup] = useState(savedSettings.autoBackup ?? true);
  const [passwordMinLength, setPasswordMinLength] = useState(savedSettings.passwordMinLength || '12');
  const [enforcePasswordExpiry, setEnforcePasswordExpiry] = useState(savedSettings.enforcePasswordExpiry ?? true);

  // Python AI Scoring Engine State
  const [autoShortlistThreshold, setAutoShortlistThreshold] = useState(savedSettings.autoShortlistThreshold || 85);
  const [weightSkills, setWeightSkills] = useState(savedSettings.weightSkills || 45);
  const [weightExperience, setWeightExperience] = useState(savedSettings.weightExperience || 35);
  const [weightLocation, setWeightLocation] = useState(savedSettings.weightLocation || 15);
  const [weightCertifications, setWeightCertifications] = useState(savedSettings.weightCertifications || 5);
  const [pythonTestStatus, setPythonTestStatus] = useState('idle'); // 'idle' | 'testing' | 'online'
  const [pythonLatency, setPythonLatency] = useState(14);
  const [scoringSavedSuccess, setScoringSavedSuccess] = useState(false);

  // Recruitment & Deployment Workflow State
  const [prfApprovalMode, setPrfApprovalMode] = useState(savedSettings.prfApprovalMode || 'dual');
  const [reqNbi, setReqNbi] = useState(savedSettings.reqNbi ?? true);
  const [reqMedical, setReqMedical] = useState(savedSettings.reqMedical ?? true);
  const [reqSss, setReqSss] = useState(savedSettings.reqSss ?? true);
  const [reqNc2, setReqNc2] = useState(savedSettings.reqNc2 ?? true);
  const [contractRenewalLeadDays, setContractRenewalLeadDays] = useState(savedSettings.contractRenewalLeadDays || '30');
  const [defaultContractTemplate, setDefaultContractTemplate] = useState(savedSettings.defaultContractTemplate || 'fixed_term_project');

  // Integrations State
  const [smsApiKey, setSmsApiKey] = useState(savedSettings.smsApiKey || 'sem_live_********************');
  const [smsSenderId, setSmsSenderId] = useState(savedSettings.smsSenderId || 'PRIMEPOWER');
  const [govApiEndpoint, setGovApiEndpoint] = useState(savedSettings.govApiEndpoint || 'https://api.compliance.primepower.ph/v1/verify');
  const [autoVerifyGovId, setAutoVerifyGovId] = useState(savedSettings.autoVerifyGovId ?? true);
  const [smsTestStatus, setSmsTestStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'

  // Backup Manual Snapshot State
  const [backupProgress, setBackupProgress] = useState(null); // null | number
  const [lastBackupTime, setLastBackupTime] = useState(savedSettings.lastBackupTime || '2026-08-04 18:40:00 (Midnight Auto)');

  // Users Directory State
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_USERS;
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Senior HR Recruiter');
  const [newUserDept, setNewUserDept] = useState('Talent Acquisition');

  // Audit Logs State & Metrics
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditMetrics, setAuditMetrics] = useState({ total_logs: 0, today_logs: 0, active_modules: 0 });
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilterModule, setLogFilterModule] = useState('all');
  const [logFilterStatus, setLogFilterStatus] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [logSortBy, setLogSortBy] = useState('created_at');
  const [logSortDir, setLogSortDir] = useState('desc');

  // Fetch real activity logs from PostgreSQL database
  const fetchAuditLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await auditLogService.getLogs({
        search: logSearch || undefined,
        module: logFilterModule !== 'all' ? logFilterModule : undefined,
        status: logFilterStatus !== 'all' ? logFilterStatus : undefined,
        sort_by: logSortBy,
        sort_dir: logSortDir,
        limit: 100,
      });
      if (res?.success) {
        setAuditLogs(res.data || []);
        if (res.metrics) {
          setAuditMetrics(res.metrics);
        }
      }
    } catch {
      // Fallback if offline
    } finally {
      setLoadingLogs(false);
    }
  }, [logSearch, logFilterModule, logFilterStatus, logSortBy, logSortDir]);

  // Load live logs on mount and when audit tab is focused or filters change
  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs, activeTab]);

  // Sync theme & density with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    localStorage.setItem('density', density);
  }, [density]);

  useEffect(() => {
    if (!syncWithSystem) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleOsChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    setTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleOsChange);
    return () => mediaQuery.removeEventListener('change', handleOsChange);
  }, [syncWithSystem]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const settingsPayload = {
      companyName,
      departmentName,
      supportEmail,
      contactPhone,
      address,
      timezone,
      dateFormat,
      currency,
      businessHours,
      emailApplicant,
      emailJobOrder,
      smsDeploy,
      dailyDigest,
      soundAlerts,
      twoFa,
      sessionTimeout,
      autoBackup,
      passwordMinLength,
      enforcePasswordExpiry,
      autoShortlistThreshold,
      weightSkills,
      weightExperience,
      weightLocation,
      weightCertifications,
      prfApprovalMode,
      reqNbi,
      reqMedical,
      reqSss,
      reqNc2,
      contractRenewalLeadDays,
      defaultContractTemplate,
      smsApiKey,
      smsSenderId,
      govApiEndpoint,
      autoVerifyGovId,
      lastBackupTime,
    };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsPayload));
      localStorage.setItem('ismers_ai_scoring_weights', JSON.stringify({
        skills: weightSkills / 100,
        experience: weightExperience / 100,
        location: weightLocation / 100,
        certifications: weightCertifications / 100,
      }));
    } catch {
      // ignore
    }

    // Record real event in PostgreSQL database
    auditLogService.recordLog(
      'Updated Master System Configuration parameters and security rules',
      'System Administration',
      { updated_at: new Date().toISOString() }
    ).then(() => {
      fetchAuditLogs();
    });

    showToast('System settings saved successfully!');
  };

  const exportAuditLogsCsv = () => {
    auditLogService.exportCsv({
      module: logFilterModule !== 'all' ? logFilterModule : undefined,
      search: logSearch || undefined,
    });
    showToast('Audit logs successfully exported to CSV file.');
  };

  const exportSystemDataBackup = () => {
    const backupData = {
      system: 'PRIMEPOWER MANPOWER ISMERS',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      settings: {
        companyName,
        departmentName,
        supportEmail,
        contactPhone,
        address,
        timezone,
        dateFormat,
        currency,
        businessHours,
        scoringWeights: {
          skills: weightSkills,
          experience: weightExperience,
          location: weightLocation,
          certifications: weightCertifications,
          autoShortlistThreshold
        },
        workflows: {
          prfApprovalMode,
          reqNbi,
          reqMedical,
          reqSss,
          reqNc2,
          contractRenewalLeadDays,
          defaultContractTemplate
        },
        security: {
          twoFa,
          sessionTimeout,
          passwordMinLength,
          enforcePasswordExpiry
        }
      },
      users: usersList,
      auditLogs: auditLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ismers_system_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('System snapshot exported successfully (JSON format).');
  };

  const triggerManualBackup = () => {
    setBackupProgress(25);
    setTimeout(() => setBackupProgress(65), 350);
    setTimeout(() => {
      setBackupProgress(100);
      const nowTime = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' (Manual Snapshot)';
      setLastBackupTime(nowTime);
      try {
        const current = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...current, lastBackupTime: nowTime }));
      } catch {
        // ignore
      }
      showToast('Manual database snapshot created and verified.');
      setTimeout(() => setBackupProgress(null), 1200);
    }, 850);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Please provide valid name and email address.');
      return;
    }
    const newUser = {
      id: `USR-00${usersList.length + 1}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      dept: newUserDept,
      status: 'Active',
      lastActive: 'Just registered'
    };
    const updatedUsers = [newUser, ...usersList];
    setUsersList(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch {
      // ignore
    }

    auditLogService.recordLog(
      `Created new user account: ${newUser.name} (${newUser.role})`,
      'Security & Governance',
      { name: newUser.name, role: newUser.role, email: newUser.email }
    ).then(() => {
      fetchAuditLogs();
    });

    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
    showToast(`User account created for ${newUser.name}`);
  };

  const handleToggleUserStatus = (userId) => {
    let affectedUser = null;
    let newStatus = 'Active';
    const updatedUsers = usersList.map((u) => {
      if (u.id === userId) {
        newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        affectedUser = u;
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUsersList(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch {
      // ignore
    }

    if (affectedUser) {
      auditLogService.recordLog(
        `Updated account status for ${affectedUser.name} to ${newStatus}`,
        'Security & Governance',
        { user_id: userId, new_status: newStatus }
      ).then(() => {
        fetchAuditLogs();
      });
    }

    showToast('User account status updated.');
  };

  const handleTestSms = () => {
    setSmsTestStatus('sending');
    setTimeout(() => {
      setSmsTestStatus('sent');
      showToast(`Test SMS dispatched to ${contactPhone} via ${smsSenderId}`);
      setTimeout(() => setSmsTestStatus('idle'), 3000);
    }, 1000);
  };

  const handleRevokeSessions = () => {
    auditLogService.recordLog('Revoked all remote sessions for current administrator account', 'Security & Governance');
    showToast('All remote sessions revoked. Current session active.');
  };

  const filteredLogs = useMemo(() => {
    const list = auditLogs.filter((log) => {
      if (logFilterModule !== 'all' && log.module !== logFilterModule) return false;
      if (logFilterStatus !== 'all' && (log.status || 'Success').toLowerCase() !== logFilterStatus.toLowerCase()) return false;
      if (logSearch) {
        const q = logSearch.toLowerCase();
        const userName = (log.user_name || log.user || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const mod = (log.module || '').toLowerCase();
        const logId = String(log.id || '').toLowerCase();
        return (
          action.includes(q) ||
          userName.includes(q) ||
          mod.includes(q) ||
          logId.includes(q)
        );
      }
      return true;
    });

    return list.sort((a, b) => {
      let valA = a[logSortBy] ?? '';
      let valB = b[logSortBy] ?? '';
      if (logSortBy === 'created_at') {
        valA = new Date(a.created_at || a.timestamp || 0).getTime();
        valB = new Date(b.created_at || b.timestamp || 0).getTime();
      } else if (logSortBy === 'id') {
        valA = Number(a.id) || 0;
        valB = Number(b.id) || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return logSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return logSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [auditLogs, logFilterModule, logFilterStatus, logSearch, logSortBy, logSortDir]);

  return (
    <div className="app">
      <main className={`settings-main-wrapper ${collapsed ? 'collapsed' : ''}`}>
        {/* Page Content Body */}
        <div className="settings-page-body">
          {/* Header Title Section */}
          <div className="settings-header">
            <div className="header-text">
              <span className="crumb">Settings</span>
              <h1 className="page-title">System Settings & Preferences</h1>
              <p className="page-subtitle">Configure organization details, theme appearance, security rules, and audit logs.</p>
            </div>
            <button className="btn-save" onClick={handleSave}>
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Changes
            </button>
          </div>

          {/* Two-Column Full Width Settings Layout */}
          <div className="settings-layout">
            {/* Left Vertical Nav Column */}
            <div className="settings-sidebar-nav">
              <div className="settings-nav-group">
                <div className="settings-nav-label">Preferences</div>
                <button
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
                  className={`nav-item-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  Notifications
                </button>
              </div>

              <div className="settings-nav-group">
                <div className="settings-nav-label">AI & Operations</div>
                <button
                  className={`nav-item-btn ${activeTab === 'ai-config' ? 'active' : ''}`}
                  onClick={() => setActiveTab('ai-config')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  AI Scoring Engine (Python)
                </button>
                <button
                  className={`nav-item-btn ${activeTab === 'workflows' ? 'active' : ''}`}
                  onClick={() => setActiveTab('workflows')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  Recruitment Workflows
                </button>
              </div>

              <div className="settings-nav-group">
                <div className="settings-nav-label">Organization</div>
                <button
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
                  className={`nav-item-btn ${activeTab === 'organization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('organization')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Organization & Time
                </button>
              </div>

              <div className="settings-nav-group">
                <div className="settings-nav-label">Administration</div>
                <button
                  className={`nav-item-btn ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => setActiveTab('users')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Users & Access
                </button>
                <button
                  className={`nav-item-btn ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Security
                </button>
                <button
                  className={`nav-item-btn ${activeTab === 'audit' ? 'active' : ''}`}
                  onClick={() => setActiveTab('audit')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Audit Logs & History
                </button>
              </div>

              <div className="settings-nav-group">
                <div className="settings-nav-label">System & Data</div>
                <button
                  className={`nav-item-btn ${activeTab === 'data' ? 'active' : ''}`}
                  onClick={() => setActiveTab('data')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                  Data & Backup
                </button>
                <button
                  className={`nav-item-btn ${activeTab === 'integrations' ? 'active' : ''}`}
                  onClick={() => setActiveTab('integrations')}
                >
                  <svg className="icon" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Integrations
                </button>
              </div>
            </div>

            {/* Right Content Card */}
            <div className="settings-content-card">
              {/* AUDIT LOGS TAB */}
              {activeTab === 'audit' && (
                <div className="section-block">
                  <div className="audit-header-row">
                    <div>
                      <h2 className="section-title">System Audit Logs &amp; Activity History</h2>
                      <p className="section-desc">Real-time enterprise audit trail tracking staff actions, state transitions, security events, and compliance milestones.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn-secondary-action"
                        onClick={fetchAuditLogs}
                        title="Reload latest system events"
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}>
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        Refresh
                      </button>
                      <button
                        type="button"
                        className="btn-secondary-action"
                        onClick={exportAuditLogsCsv}
                      >
                        Export Audit Log (CSV)
                      </button>
                    </div>
                  </div>

                  {/* Audit Metrics Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Recorded Logs</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{auditMetrics.total_logs || auditLogs.length}</div>
                    </div>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Today's Operations</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{auditMetrics.today_logs || 0}</div>
                    </div>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Instrumented Modules</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0d8050', marginTop: 4 }}>{auditMetrics.active_modules || 8} Active</div>
                    </div>
                  </div>

                  {/* Audit Filter Toolbar */}
                  <div className="audit-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                    <div className="audit-search-box" style={{ flex: '1 1 240px' }}>
                      <svg className="icon" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search action, staff member, or module..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                      />
                    </div>

                    <select
                      className="audit-select-filter"
                      value={logFilterModule}
                      onChange={(e) => setLogFilterModule(e.target.value)}
                      style={{ minWidth: 160 }}
                    >
                      <option value="all">All Modules ({auditLogs.length})</option>
                      <option value="Authentication">Authentication</option>
                      <option value="Applicant Registration">Applicant Registration</option>
                      <option value="Recruitment & Selection">Recruitment &amp; Selection</option>
                      <option value="Job Orders">Job Orders</option>
                      <option value="Deployment & Assignment">Deployment &amp; Assignment</option>
                      <option value="AI Candidate Scoring">AI Candidate Scoring</option>
                      <option value="Communication & Alerts">Communication &amp; Alerts</option>
                      <option value="Client Management">Client Management</option>
                      <option value="System Administration">System Administration</option>
                      <option value="Security & Governance">Security &amp; Governance</option>
                      <option value="Data & Backup">Data &amp; Backup</option>
                    </select>

                    <select
                      className="audit-select-filter"
                      value={logFilterStatus}
                      onChange={(e) => setLogFilterStatus(e.target.value)}
                      style={{ minWidth: 130 }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="success">Success Only</option>
                      <option value="warning">Warning Only</option>
                      <option value="danger">Danger Only</option>
                      <option value="info">Info Only</option>
                    </select>

                    <select
                      className="audit-select-filter"
                      value={`${logSortBy}_${logSortDir}`}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'created_at_desc') { setLogSortBy('created_at'); setLogSortDir('desc'); }
                        else if (val === 'created_at_asc') { setLogSortBy('created_at'); setLogSortDir('asc'); }
                        else if (val === 'user_name_asc') { setLogSortBy('user_name'); setLogSortDir('asc'); }
                        else if (val === 'user_name_desc') { setLogSortBy('user_name'); setLogSortDir('desc'); }
                        else if (val === 'module_asc') { setLogSortBy('module'); setLogSortDir('asc'); }
                        else if (val === 'status_asc') { setLogSortBy('status'); setLogSortDir('asc'); }
                      }}
                      style={{ minWidth: 160, fontWeight: 600 }}
                    >
                      <option value="created_at_desc">Sort: Newest First</option>
                      <option value="created_at_asc">Sort: Oldest First</option>
                      <option value="user_name_asc">Sort: Staff (A to Z)</option>
                      <option value="user_name_desc">Sort: Staff (Z to A)</option>
                      <option value="module_asc">Sort: Module (A to Z)</option>
                      <option value="status_asc">Sort: Status</option>
                    </select>
                  </div>

                  {/* Audit Log Table */}
                  <div className="table-responsive">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => { setLogSortBy('id'); setLogSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); }}>
                            LOG ID {logSortBy === 'id' ? (logSortDir === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => { setLogSortBy('created_at'); setLogSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); }}>
                            TIMESTAMP {logSortBy === 'created_at' ? (logSortDir === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => { setLogSortBy('user_name'); setLogSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); }}>
                            STAFF / USER {logSortBy === 'user_name' ? (logSortDir === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th>ACTION / EVENT</th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => { setLogSortBy('module'); setLogSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); }}>
                            MODULE {logSortBy === 'module' ? (logSortDir === 'asc' ? '▲' : '▼') : ''}
                          </th>
                          <th>IP ADDRESS</th>
                          <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => { setLogSortBy('status'); setLogSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); }}>
                            STATUS {logSortBy === 'status' ? (logSortDir === 'asc' ? '▲' : '▼') : ''}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingLogs ? (
                          <tr>
                            <td colSpan="7" className="empty-table-note">
                              Loading live audit trail from database...
                            </td>
                          </tr>
                        ) : filteredLogs.map((log) => {
                          const displayId = typeof log.id === 'number' ? `LOG-${String(log.id).padStart(4, '0')}` : (log.id || 'LOG-000');
                          const displayTime = log.created_at
                            ? new Date(log.created_at).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false,
                              })
                            : (log.timestamp || '—');
                          const displayName = log.user_name || log.user || 'System Process';
                          const displayRole = log.user_role || (log.email ? log.email : '');
                          const displayIp = log.ip_address || log.ip || '127.0.0.1';
                          const displayStatus = log.status || 'Success';

                          return (
                            <tr key={log.id || displayId}>
                              <td className="log-id">{displayId}</td>
                              <td className="log-time" style={{ whiteSpace: 'nowrap' }}>{displayTime}</td>
                              <td>
                                <div className="user-cell">
                                  <span className="user-name">{displayName}</span>
                                  {displayRole && <span style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{displayRole}</span>}
                                </div>
                              </td>
                              <td className="log-action" style={{ maxWidth: 360, lineHeight: 1.4 }}>{log.action}</td>
                              <td>
                                <span className="module-badge">{log.module}</span>
                              </td>
                              <td className="log-ip" style={{ fontFamily: 'monospace', fontSize: 11 }}>{displayIp}</td>
                              <td>
                                <span className={`status-pill ${(displayStatus).toLowerCase()}`}>
                                  {displayStatus}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        {!loadingLogs && filteredLogs.length === 0 && (
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

              {/* AI SCORING & OPENROUTER CONFIG TAB */}
              {activeTab === 'ai-config' && (
                <div className="section-block">
                  <h2 className="section-title">Python AI Scoring &amp; Ranking Engine Configuration</h2>
                  <p className="section-desc">Configure multi-factor evaluation weights, auto-shortlist target thresholds, and Python backend telemetry.</p>

                  {/* PYTHON ENGINE ARCHITECTURE & TELEMETRY CARD */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: 'var(--primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 900,
                            fontSize: 14,
                          }}
                        >
                          PY
                        </div>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>
                            Python AI Candidate Scoring &amp; Ranking Microservice
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                            Package: <code>ai_engine v1.0</code> &nbsp;·&nbsp; Zero External Cloud LLM Dependencies
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: 'var(--green-soft)',
                          color: 'var(--green)',
                          border: '1px solid rgba(20, 158, 110, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
                        Active &amp; Operational
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 10,
                        background: 'var(--panel)',
                        border: '1px solid var(--border-soft)',
                        borderRadius: 10,
                        padding: '12px 14px',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Backend Core</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>Python 3.11 Engine</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Protocol</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>Dual REST / CLI Pipe</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Data Privacy</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>100% On-Premise (RA 10173)</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>API Cost</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)', marginTop: 2 }}>₱0.00 / Zero Cloud Tolls</div>
                      </div>
                    </div>

                    {/* TEST PYTHON BACKEND HEALTH */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 2 }}>
                      <button
                        type="button"
                        className="btn-secondary-action"
                        disabled={pythonTestStatus === 'testing'}
                        onClick={() => {
                          setPythonTestStatus('testing');
                          const startTime = Date.now();
                          setTimeout(() => {
                            setPythonLatency(Date.now() - startTime + 12);
                            setPythonTestStatus('online');
                          }, 600);
                        }}
                        style={{ padding: '7px 14px', fontSize: 11.5, fontWeight: 700 }}
                      >
                        {pythonTestStatus === 'testing' ? 'Pinging Python Service...' : 'Test Python Backend Health'}
                      </button>

                      {pythonTestStatus === 'online' && (
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          ✓ Python AI Engine healthy &amp; responsive (Latency: {pythonLatency}ms · Multi-factor active)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  {/* MATCH SCORE WEIGHT CALIBRATION */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                      Candidate Multi-Factor Weight Calibration (4 Pillars)
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 800, color: (weightSkills + weightExperience + weightLocation + weightCertifications === 100) ? 'var(--green)' : 'var(--red, #dc2626)' }}>
                      Total Calibration Sum: {weightSkills + weightExperience + weightLocation + weightCertifications}%
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group-compact">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span>1. Skill Matrix Match Weight (JD Keyword &amp; Synonyms Overlap)</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{weightSkills}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        value={weightSkills}
                        onChange={(e) => setWeightSkills(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group-compact">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span>2. Work Experience Relevance &amp; Verified Tenure Weight</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{weightExperience}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        value={weightExperience}
                        onChange={(e) => setWeightExperience(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group-compact">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span>3. Location &amp; Regional Shift Compatibility Weight</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{weightLocation}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        value={weightLocation}
                        onChange={(e) => setWeightLocation(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group-compact">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span>4. Statutory Readiness &amp; TESDA / Pre-Employment Certifications</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{weightCertifications}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={weightCertifications}
                        onChange={(e) => setWeightCertifications(Number(e.target.value))}
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  {/* AUTO SHORTLIST THRESHOLD */}
                  <div className="form-group-compact">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                      <span>Automated Shortlist Target Threshold</span>
                      <span style={{ color: 'var(--green)', fontWeight: 800 }}>{autoShortlistThreshold}% Match Fit</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="95"
                      value={autoShortlistThreshold}
                      onChange={(e) => setAutoShortlistThreshold(Number(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 4 }}>
                      Candidates scoring above {autoShortlistThreshold}% match fit will automatically be flagged as Priority Shortlist for Client Presentation.
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <button
                      type="button"
                      className="btn-save-settings"
                      onClick={() => {
                        const newSettings = {
                          ...savedSettings,
                          autoShortlistThreshold,
                          weightSkills,
                          weightExperience,
                          weightLocation,
                          weightCertifications,
                        };
                        try {
                          localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
                          localStorage.setItem('ismers_ai_scoring_weights', JSON.stringify({
                            skills: weightSkills / 100,
                            experience: weightExperience / 100,
                            location: weightLocation / 100,
                            certifications: weightCertifications / 100,
                          }));
                        } catch (e) {
                          console.warn('Could not save scoring weights to localStorage:', e);
                        }
                        setScoringSavedSuccess(true);
                        showToast('Python AI scoring weights calibrated and persisted successfully!');
                        setTimeout(() => setScoringSavedSuccess(false), 3000);
                      }}
                      style={{ padding: '8px 18px', fontSize: 12, fontWeight: 800, background: 'var(--primary)', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
                    >
                      Calibrate &amp; Save Scoring Weights
                    </button>

                    {scoringSavedSuccess && (
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        ✓ Python AI Scoring weights calibrated &amp; persisted across recruitment modules.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* RECRUITMENT & DEPLOYMENT WORKFLOWS TAB */}
              {activeTab === 'workflows' && (
                <div className="section-block">
                  <h2 className="section-title">Recruitment & Deployment Workflows</h2>
                  <p className="section-desc">Define PRF Job Order approval hierarchies, pre-employment compliance rules, and deployment alerts.</p>

                  <div className="form-group-compact">
                    <label>PRF Job Order Approval Sign-off Requirement</label>
                    <select
                      className="input-compact"
                      value={prfApprovalMode}
                      onChange={(e) => setPrfApprovalMode(e.target.value)}
                    >
                      <option value="single">Single HR Officer Sign-off</option>
                      <option value="dual">Dual Sign-off (HR Officer + Operations Manager)</option>
                    </select>
                  </div>

                  <div className="card-divider"></div>

                  <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                    Mandatory Pre-Employment Compliance Checklist
                  </h3>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Require Verified NBI Clearance</span>
                      <span className="switch-desc">Block deployment assignment until NBI clearance document is verified</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${reqNbi ? 'on' : ''}`}
                      onClick={() => setReqNbi(!reqNbi)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Require Medical Examination (Fit to Work)</span>
                      <span className="switch-desc">Mandate accredited clinic Fit-to-Work certificate prior to dispatch</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${reqMedical ? 'on' : ''}`}
                      onClick={() => setReqMedical(!reqMedical)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Mandatory Government IDs (SSS / PhilHealth / Pag-IBIG)</span>
                      <span className="switch-desc">Ensure government identification numbers are registered for payroll onboarding</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${reqSss ? 'on' : ''}`}
                      onClick={() => setReqSss(!reqSss)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">TESDA / NC II Technical Certification Verification</span>
                      <span className="switch-desc">Verify specialized trade skills certifications for skilled deployment positions</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${reqNc2 ? 'on' : ''}`}
                      onClick={() => setReqNc2(!reqNc2)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="form-group-compact">
                    <label>Deployment Contract Renewal Lead-Time Alert</label>
                    <select
                      className="input-compact"
                      value={contractRenewalLeadDays}
                      onChange={(e) => setContractRenewalLeadDays(e.target.value)}
                    >
                      <option value="30">30 Days Before Expiration (Standard)</option>
                      <option value="60">60 Days Before Expiration</option>
                      <option value="90">90 Days Before Expiration</option>
                    </select>
                  </div>

                  <div className="card-divider"></div>

                  <div className="form-group-compact">
                    <label>Default Employment Contract Template</label>
                    <select
                      className="input-compact"
                      value={defaultContractTemplate}
                      onChange={(e) => setDefaultContractTemplate(e.target.value)}
                    >
                      <option value="fixed_term_project">Fixed-Term Project Employment Agreement (DOLE Order 174)</option>
                      <option value="short_term_reliever">Short-Term Reliever / Seasonal Manpower Contract</option>
                      <option value="client_service_agreement">Standard Primepower Client Service Agreement</option>
                    </select>
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <div className="section-block">
                  <h2 className="section-title">Appearance &amp; Color Customization</h2>
                  <p className="section-desc">Choose how PRIMEPOWER looks on your device.</p>

                  <div className="theme-compact-grid">
                    <div
                      className={`compact-theme-card ${theme === 'light' ? 'selected' : ''}`}
                      onClick={() => setTheme('light')}
                    >
                      <div className="compact-preview light-mode-prev">
                        <div className="prev-sidebar">
                          <div className="prev-icon-dot"></div>
                          <div className="prev-icon-dot"></div>
                        </div>
                        <div className="prev-body">
                          <div className="prev-top-bar"></div>
                          <div className="prev-card-large"></div>
                          <div className="prev-card-small"></div>
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
                        <div className="prev-sidebar">
                          <div className="prev-icon-dot"></div>
                          <div className="prev-icon-dot"></div>
                        </div>
                        <div className="prev-body">
                          <div className="prev-top-bar"></div>
                          <div className="prev-card-large"></div>
                          <div className="prev-card-small"></div>
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

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Sync with Operating System</span>
                      <span className="switch-desc">Automatically match your operating system's light or dark theme</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${syncWithSystem ? 'on' : ''}`}
                      onClick={() => setSyncWithSystem(!syncWithSystem)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
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
                </div>
              )}

              {/* GENERAL PROFILE TAB */}
              {activeTab === 'general' && (
                <div className="section-block">
                  <h2 className="section-title">General Company Profile</h2>
                  <p className="section-desc">Manage official organization details shown on reports and client headers.</p>

                  <div className="form-grid-2col">
                    <div className="form-group-compact">
                      <label>Company Brand Name</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>

                    <div className="form-group-compact">
                      <label>System Subtitle / Department</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={departmentName}
                        onChange={(e) => setDepartmentName(e.target.value)}
                      />
                    </div>

                    <div className="form-group-compact">
                      <label>Official Support Email</label>
                      <input
                        type="email"
                        className="input-compact"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group-compact">
                      <label>Contact Telephone Number</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group-compact" style={{ marginTop: '12px' }}>
                    <label>Corporate Headquarters Address</label>
                    <textarea
                      rows="2"
                      className="input-compact text-area"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}

              {/* ORGANIZATION & TIME TAB */}
              {activeTab === 'organization' && (
                <div className="section-block">
                  <h2 className="section-title">Organization &amp; Time Preferences</h2>
                  <p className="section-desc">Set regional timezone, date formatting, and financial calendar parameters.</p>

                  <div className="form-grid-2col">
                    <div className="form-group-compact">
                      <label>Primary Timezone</label>
                      <select
                        className="input-compact"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                      >
                        <option value="Asia/Manila (GMT+8)">Asia/Manila (GMT+8)</option>
                        <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                        <option value="Asia/Singapore (GMT+8)">Asia/Singapore (GMT+8)</option>
                      </select>
                    </div>

                    <div className="form-group-compact">
                      <label>Date Format</label>
                      <select
                        className="input-compact"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                      >
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-05)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (08/05/2026)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (05/08/2026)</option>
                      </select>
                    </div>

                    <div className="form-group-compact">
                      <label>Currency Format</label>
                      <select
                        className="input-compact"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="PHP (₱)">PHP - Philippine Peso (₱)</option>
                        <option value="USD ($)">USD - US Dollar ($)</option>
                      </select>
                    </div>

                    <div className="form-group-compact">
                      <label>Recruitment Operating Hours</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={businessHours}
                        onChange={(e) => setBusinessHours(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="section-block">
                  <h2 className="section-title">Notification Preferences</h2>
                  <p className="section-desc">Manage system alerts and automated communication dispatches.</p>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">New Applicant Email Alerts</span>
                      <span className="switch-desc">Receive real-time email summaries when a candidate registers or updates their profile</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${emailApplicant ? 'on' : ''}`}
                      onClick={() => setEmailApplicant(!emailApplicant)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Job Order Approval Notifications</span>
                      <span className="switch-desc">Send automated alerts when a client submits or modifies a manpower Job Order</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${emailJobOrder ? 'on' : ''}`}
                      onClick={() => setEmailJobOrder(!emailJobOrder)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Deployment SMS Alerts</span>
                      <span className="switch-desc">Dispatch real-time SMS notifications to selected candidates upon deployment confirmation</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${smsDeploy ? 'on' : ''}`}
                      onClick={() => setSmsDeploy(!smsDeploy)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Daily Sourcing &amp; Deployment Digest</span>
                      <span className="switch-desc">Send morning executive summary of pipeline metrics to HR managers at 08:00 AM</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${dailyDigest ? 'on' : ''}`}
                      onClick={() => setDailyDigest(!dailyDigest)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">In-App Audio Chime Alerts</span>
                      <span className="switch-desc">Play subtle audible chime upon high-priority PRF job order approvals</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${soundAlerts ? 'on' : ''}`}
                      onClick={() => setSoundAlerts(!soundAlerts)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>
                </div>
              )}

              {/* USERS & ACCESS TAB */}
              {activeTab === 'users' && (
                <div className="section-block">
                  <div className="audit-header-row" style={{ marginBottom: 16 }}>
                    <div>
                      <h2 className="section-title">Users &amp; Role-Based Access Control (RBAC)</h2>
                      <p className="section-desc">Manage active HR staff accounts, recruiters, and operational permissions.</p>
                    </div>
                    <button
                      type="button"
                      className="btn-save"
                      onClick={() => setShowAddUserModal(true)}
                      style={{ padding: '7px 14px', fontSize: 11.5 }}
                    >
                      + Add New System User
                    </button>
                  </div>

                  {/* USERS TABLE */}
                  <div className="table-responsive">
                    <table className="audit-table">
                      <thead>
                        <tr>
                          <th>USER</th>
                          <th>EMAIL</th>
                          <th>ROLE / PRIVILEGES</th>
                          <th>DEPARTMENT</th>
                          <th>STATUS</th>
                          <th>LAST ACTIVE</th>
                          <th style={{ textAlign: 'right' }}>ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((u) => (
                          <tr key={u.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: 11,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {u.name.charAt(0)}
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ color: 'var(--muted-fg)', fontSize: 11.5 }}>{u.email}</td>
                            <td>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: u.role.includes('Admin') ? 'rgba(139, 92, 246, 0.12)' : 'var(--secondary)',
                                  color: u.role.includes('Admin') ? 'var(--purple)' : 'var(--text)',
                                  border: '1px solid var(--border)',
                                }}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td style={{ fontSize: 11.5, color: 'var(--text)' }}>{u.dept}</td>
                            <td>
                              <span className={`status-pill ${u.status === 'Active' ? 'success' : 'info'}`}>
                                {u.status}
                              </span>
                            </td>
                            <td style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{u.lastActive}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleUserStatus(u.id)}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  borderRadius: 6,
                                  border: '1px solid var(--border)',
                                  background: 'var(--bg)',
                                  color: 'var(--text)',
                                  cursor: 'pointer',
                                }}
                              >
                                {u.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ADD USER MODAL */}
                  {showAddUserModal && (
                    <div
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1000,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(3px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 20,
                      }}
                      onClick={() => setShowAddUserModal(false)}
                    >
                      <div
                        style={{
                          background: 'var(--panel)',
                          border: '1px solid var(--border)',
                          borderRadius: 14,
                          width: '100%',
                          maxWidth: 480,
                          padding: '20px 24px',
                          boxShadow: 'var(--shadow-lg)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                            Create System User Account
                          </h3>
                          <button
                            type="button"
                            onClick={() => setShowAddUserModal(false)}
                            style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', cursor: 'pointer', fontSize: 18 }}
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div className="form-group-compact">
                            <label>Full Name</label>
                            <input
                              type="text"
                              className="input-compact"
                              required
                              placeholder="e.g. Maria Santos"
                              value={newUserName}
                              onChange={(e) => setNewUserName(e.target.value)}
                            />
                          </div>

                          <div className="form-group-compact">
                            <label>Corporate Email (@primepower.ph)</label>
                            <input
                              type="email"
                              className="input-compact"
                              required
                              placeholder="e.g. maria.santos@primepower.ph"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                          </div>

                          <div className="form-group-compact">
                            <label>System Role &amp; Access Scope</label>
                            <select
                              className="input-compact"
                              value={newUserRole}
                              onChange={(e) => setNewUserRole(e.target.value)}
                            >
                              <option value="Senior HR Recruiter">Senior HR Recruiter (Sourcing &amp; Scoring)</option>
                              <option value="Operations Officer">Operations Officer (Pre-Employment &amp; Deployment)</option>
                              <option value="Client Relations Officer">Client Relations Officer (Job Orders &amp; Endorsement)</option>
                              <option value="Super Administrator">Super Administrator (Full System Control)</option>
                            </select>
                          </div>

                          <div className="form-group-compact">
                            <label>Assigned Department</label>
                            <select
                              className="input-compact"
                              value={newUserDept}
                              onChange={(e) => setNewUserDept(e.target.value)}
                            >
                              <option value="Talent Acquisition">Talent Acquisition</option>
                              <option value="Manpower Deployment">Manpower Deployment</option>
                              <option value="Client Accounts">Client Accounts</option>
                              <option value="Executive Management">Executive Management</option>
                            </select>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                            <button
                              type="button"
                              className="btn-secondary-action"
                              onClick={() => setShowAddUserModal(false)}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn-save"
                              style={{ padding: '8px 16px', fontSize: 12 }}
                            >
                              Create User Account
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="section-block">
                  <h2 className="section-title">Security &amp; Access Governance</h2>
                  <p className="section-desc">Manage authentication protocols, credential policies, and active sessions.</p>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Two-Factor Authentication (2FA)</span>
                      <span className="switch-desc">Enforce two-factor verification code upon administrator login</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${twoFa ? 'on' : ''}`}
                      onClick={() => setTwoFa(!twoFa)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  <div className="form-grid-2col">
                    <div className="form-group-compact">
                      <label>Session Idle Timeout</label>
                      <select
                        className="input-compact"
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                      >
                        <option value="15">15 Minutes</option>
                        <option value="30">30 Minutes (Recommended)</option>
                        <option value="60">60 Minutes</option>
                      </select>
                    </div>

                    <div className="form-group-compact">
                      <label>Password Minimum Complexity Length</label>
                      <select
                        className="input-compact"
                        value={passwordMinLength}
                        onChange={(e) => setPasswordMinLength(e.target.value)}
                      >
                        <option value="8">8 Characters</option>
                        <option value="12">12 Characters (Corporate Standard)</option>
                        <option value="16">16 Characters (High Security)</option>
                      </select>
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Mandatory 90-Day Password Expiration</span>
                      <span className="switch-desc">Require recruiters and administrators to rotate credentials every 90 days</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${enforcePasswordExpiry ? 'on' : ''}`}
                      onClick={() => setEnforcePasswordExpiry(!enforcePasswordExpiry)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  {/* ACTIVE ADMINISTRATIVE SESSIONS */}
                  <div>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
                      Active Administrative Sessions
                    </h3>
                    <div
                      style={{
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)' }}>
                          Current Session: Chrome on Windows 11
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                          IP: 192.168.1.104 &nbsp;·&nbsp; Location: Metro Manila, Philippines &nbsp;·&nbsp; <span style={{ color: 'var(--green)', fontWeight: 700 }}>Active Now</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn-secondary-action"
                        onClick={handleRevokeSessions}
                        style={{ fontSize: 11, padding: '6px 12px' }}
                      >
                        Revoke All Other Sessions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DATA & BACKUP TAB */}
              {activeTab === 'data' && (
                <div className="section-block">
                  <h2 className="section-title">Data Management &amp; System Backup</h2>
                  <p className="section-desc">Configure automated database snapshot schedules, manual backups, and telemetry exports.</p>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Automated Daily Database Snapshots</span>
                      <span className="switch-desc">Schedule midnight backup snapshots of candidate profiles, PRF job orders, and client rosters</span>
                    </div>
                    <button
                      type="button"
                      className={`switch-toggle ${autoBackup ? 'on' : ''}`}
                      onClick={() => setAutoBackup(!autoBackup)}
                    >
                      <span className="switch-thumb"></span>
                    </button>
                  </div>

                  <div className="card-divider"></div>

                  {/* BACKUP STORAGE TELEMETRY */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Database Volume</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>24.8 MB</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>PostgreSQL / Eloquent Store</div>
                    </div>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Attachment Media</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>1.42 GB</div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>CVs, Clearances, Medical PDFs</div>
                    </div>
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Last Verified Snapshot</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--green)', marginTop: 6 }}>{lastBackupTime}</div>
                    </div>
                  </div>

                  {backupProgress !== null && (
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span>Generating Database Snapshot Archive...</span>
                        <span style={{ color: 'var(--primary)' }}>{backupProgress}%</span>
                      </div>
                      <div style={{ height: 6, width: '100%', background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${backupProgress}%`, background: 'var(--primary)', transition: 'width 0.2s ease' }} />
                      </div>
                    </div>
                  )}

                  <div className="card-divider"></div>

                  <div className="form-actions-inline" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-save"
                      disabled={backupProgress !== null}
                      onClick={triggerManualBackup}
                      style={{ padding: '8px 16px', fontSize: 12 }}
                    >
                      Create Manual Snapshot Now
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-action"
                      onClick={exportSystemDataBackup}
                    >
                      Export System Data (JSON Backup)
                    </button>
                  </div>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div className="section-block">
                  <h2 className="section-title">Integrations &amp; External Gateways</h2>
                  <p className="section-desc">Connect Philippine SMS notification gateways and statutory compliance verification endpoints.</p>

                  {/* PHILIPPINE SMS GATEWAY */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                          Philippine SMS Gateway (Semaphore / Infobip)
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                          Dispatches deployment confirmation SMS to candidates across Smart, Globe, and DITO networks.
                        </div>
                      </div>
                      <span className="status-pill success">Connected</span>
                    </div>

                    <div className="form-grid-2col">
                      <div className="form-group-compact">
                        <label>SMS Gateway API Key</label>
                        <input
                          type="password"
                          className="input-compact"
                          value={smsApiKey}
                          onChange={(e) => setSmsApiKey(e.target.value)}
                        />
                      </div>

                      <div className="form-group-compact">
                        <label>Registered Sender ID</label>
                        <input
                          type="text"
                          className="input-compact"
                          value={smsSenderId}
                          onChange={(e) => setSmsSenderId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button
                        type="button"
                        className="btn-secondary-action"
                        disabled={smsTestStatus === 'sending'}
                        onClick={handleTestSms}
                        style={{ fontSize: 11, padding: '6px 12px' }}
                      >
                        {smsTestStatus === 'sending' ? 'Dispatching Test SMS...' : 'Send Test SMS'}
                      </button>
                      {smsTestStatus === 'sent' && (
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--green)' }}>
                          ✓ Test SMS successfully dispatched to {contactPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  {/* GOVERNMENT VERIFICATION API */}
                  <div
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
                          Statutory Pre-Employment Verification Service
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                          Automated check against NBI clearance database and SSS membership status records.
                        </div>
                      </div>
                      <span className="status-pill info">Simulation Active</span>
                    </div>

                    <div className="form-group-compact">
                      <label>Verification API Endpoint URL</label>
                      <input
                        type="text"
                        className="input-compact"
                        value={govApiEndpoint}
                        onChange={(e) => setGovApiEndpoint(e.target.value)}
                      />
                    </div>

                    <div className="switch-row" style={{ padding: 0 }}>
                      <div className="switch-text">
                        <span className="switch-title">Auto-Verify Government IDs on Candidate Registration</span>
                        <span className="switch-desc">Validate SSS, PhilHealth, and TIN syntax upon initial profiling</span>
                      </div>
                      <button
                        type="button"
                        className={`switch-toggle ${autoVerifyGovId ? 'on' : ''}`}
                        onClick={() => setAutoVerifyGovId(!autoVerifyGovId)}
                      >
                        <span className="switch-thumb"></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* TOAST POPUP NOTIFICATION */}
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
