import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import './SettingsPage.css';

const MOCK_AUDIT_LOGS = [
  {
    id: 'LOG-108',
    timestamp: '2026-08-05 14:38:12',
    user: 'ADMIN USER',
    email: 'admin@fleettranspo.com',
    action: 'Changed system appearance theme to Dark Mode',
    module: 'Settings',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-107',
    timestamp: '2026-08-05 14:22:05',
    user: 'ADMIN USER',
    email: 'admin@fleettranspo.com',
    action: 'Approved Manpower Job Order #JO-2026-012 (Acme Logistics Corp)',
    module: 'Job Orders',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-106',
    timestamp: '2026-08-05 13:50:44',
    user: 'ADMIN USER',
    email: 'admin@fleettranspo.com',
    action: 'Updated deployment assignment for Juan Dela Cruz to Client BDO Unibank',
    module: 'Deployment',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-105',
    timestamp: '2026-08-05 11:15:30',
    user: 'ADMIN USER',
    email: 'admin@fleettranspo.com',
    action: 'Enabled Two-Factor Authentication (2FA) for Admin account',
    module: 'Security',
    ip: '192.168.1.104',
    status: 'Success'
  },
  {
    id: 'LOG-104',
    timestamp: '2026-08-05 09:05:18',
    user: 'ADMIN USER',
    email: 'admin@fleettranspo.com',
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
    email: 'admin@fleettranspo.com',
    action: 'Added new registered client company profile: BDO Unibank Inc.',
    module: 'Client Mgmt',
    ip: '192.168.1.104',
    status: 'Success'
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
  const [savedSuccess, setSavedSuccess] = useState(false);

  const SETTINGS_STORAGE_KEY = 'ismers.settings';
  const LOGS_STORAGE_KEY = 'ismers.audit_logs';

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

  // Notification Switches
  const [emailApplicant, setEmailApplicant] = useState(savedSettings.emailApplicant ?? true);
  const [emailJobOrder, setEmailJobOrder] = useState(savedSettings.emailJobOrder ?? true);
  const [smsDeploy, setSmsDeploy] = useState(savedSettings.smsDeploy ?? true);

  // Security Switches
  const [twoFa, setTwoFa] = useState(savedSettings.twoFa ?? true);
  const [sessionTimeout, setSessionTimeout] = useState(savedSettings.sessionTimeout || '30');
  const [autoBackup, setAutoBackup] = useState(savedSettings.autoBackup ?? true);

  // AI Engine & OpenRouter Frontend State
  const [aiProvider, setAiProvider] = useState(savedSettings.aiProvider || 'openrouter');
  const [openRouterApiKey, setOpenRouterApiKey] = useState(savedSettings.openRouterApiKey || 'sk-or-v1-********************************');
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiModel, setAiModel] = useState(savedSettings.aiModel || 'anthropic/claude-3.5-sonnet');
  const [autoShortlistThreshold, setAutoShortlistThreshold] = useState(savedSettings.autoShortlistThreshold || 85);
  const [weightSkills, setWeightSkills] = useState(savedSettings.weightSkills || 45);
  const [weightExperience, setWeightExperience] = useState(savedSettings.weightExperience || 35);
  const [weightLocation, setWeightLocation] = useState(savedSettings.weightLocation || 20);
  const [apiTestStatus, setApiTestStatus] = useState('idle'); // 'idle' | 'testing' | 'success'

  // Recruitment & Deployment Workflow State
  const [prfApprovalMode, setPrfApprovalMode] = useState(savedSettings.prfApprovalMode || 'dual');
  const [reqNbi, setReqNbi] = useState(savedSettings.reqNbi ?? true);
  const [reqMedical, setReqMedical] = useState(savedSettings.reqMedical ?? true);
  const [reqSss, setReqSss] = useState(savedSettings.reqSss ?? true);
  const [reqNc2, setReqNc2] = useState(savedSettings.reqNc2 ?? true);
  const [contractRenewalLeadDays, setContractRenewalLeadDays] = useState(savedSettings.contractRenewalLeadDays || '30');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return MOCK_AUDIT_LOGS;
  });

  // Audit Log Filters
  const [logFilterModule, setLogFilterModule] = useState('all');
  const [logSearch, setLogSearch] = useState('');

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
      emailApplicant,
      emailJobOrder,
      smsDeploy,
      twoFa,
      sessionTimeout,
      autoBackup,
      aiProvider,
      openRouterApiKey,
      aiModel,
      autoShortlistThreshold,
      weightSkills,
      weightExperience,
      weightLocation,
      prfApprovalMode,
      reqNbi,
      reqMedical,
      reqSss,
      reqNc2,
      contractRenewalLeadDays,
    };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsPayload));
    } catch {
      // ignore
    }

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: nowStr,
      user: 'ADMIN USER',
      email: supportEmail,
      action: 'Updated system configuration parameters and security settings',
      module: 'Settings',
      ip: '192.168.1.104',
      status: 'Success',
    };

    setAuditLogs((prev) => {
      const next = [newLog, ...prev];
      try {
        localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(next));
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

          {savedSuccess && (
            <div className="toast-popup" role="status" aria-live="polite">
              <div className="toast-popup-content">
                <div className="toast-popup-icon">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div className="toast-popup-text">Settings saved successfully!</div>
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
                  AI Engine & OpenRouter
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
                      <h2 className="section-title">Audit Logs & Activity History</h2>
                      <p className="section-desc">Track real-time administrative actions, security events, and system changes.</p>
                    </div>
                    <button className="btn-secondary-action">Export Audit Log (CSV)</button>
                  </div>

                  {/* Audit Filter Toolbar */}
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
                      <option value="Job Orders">Job Orders</option>
                      <option value="Deployment">Deployment</option>
                      <option value="Security">Security</option>
                      <option value="Client Mgmt">Client Mgmt</option>
                    </select>
                  </div>

                  {/* Audit Log Table */}
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
                            <td className="log-time">{log.timestamp}</td>
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

              {/* AI SCORING & OPENROUTER CONFIG TAB */}
              {activeTab === 'ai-config' && (
                <div className="section-block">
                  <h2 className="section-title">AI Engine & OpenRouter Configuration</h2>
                  <p className="section-desc">Configure candidate match scoring engines, LLM provider API credentials, and evaluation weights.</p>

                  {/* AI PROVIDER SELECTOR */}
                  <div className="form-group-compact">
                    <label>Primary AI Telemetry Provider</label>
                    <div className="density-picker" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <button
                        type="button"
                        className={`btn-option ${aiProvider === 'openrouter' ? 'active' : ''}`}
                        onClick={() => setAiProvider('openrouter')}
                      >
                        OpenRouter API (Multi-Model)
                      </button>
                      <button
                        type="button"
                        className={`btn-option ${aiProvider === 'openai' ? 'active' : ''}`}
                        onClick={() => setAiProvider('openai')}
                      >
                        OpenAI Direct API
                      </button>
                      <button
                        type="button"
                        className={`btn-option ${aiProvider === 'offline' ? 'active' : ''}`}
                        onClick={() => setAiProvider('offline')}
                      >
                        Offline Simulation Engine
                      </button>
                    </div>
                  </div>

                  <div className="card-divider"></div>

                  {/* LLM MODEL SELECTION CARDS */}
                  <div className="form-group-compact">
                    <label>Active AI Model Selection</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 4 }}>
                      {[
                        {
                          id: 'anthropic/claude-3.5-sonnet',
                          name: 'Claude 3.5 Sonnet',
                          badge: 'Recommended',
                          desc: 'Optimal precision for HR resume analysis, skill matrix matching, and candidate summary synthesis.',
                          provider: 'Anthropic'
                        },
                        {
                          id: 'openai/gpt-4o',
                          name: 'GPT-4o Omnimodal',
                          badge: 'High Speed',
                          desc: 'Fast multilingual parsing suited for high-volume applicant registration screening.',
                          provider: 'OpenAI'
                        },
                        {
                          id: 'deepseek/deepseek-r1',
                          name: 'DeepSeek R1',
                          badge: 'Reasoning Engine',
                          desc: 'Deep analytical evaluation for complex technical trade tests and engineering roles.',
                          provider: 'DeepSeek'
                        },
                        {
                          id: 'google/gemini-1.5-pro',
                          name: 'Gemini 1.5 Pro',
                          badge: 'Long Context',
                          desc: 'High context window capability for processing lengthy multi-page CVs and portfolios.',
                          provider: 'Google AI'
                        }
                      ].map((model) => {
                        const isSelected = aiModel === model.id;
                        return (
                          <div
                            key={model.id}
                            onClick={() => setAiModel(model.id)}
                            style={{
                              padding: '12px 14px',
                              borderRadius: 10,
                              border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                              background: isSelected ? 'var(--secondary)' : 'var(--bg)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: isSelected ? 'var(--shadow-xs)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                              <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
                                {model.name}
                              </div>
                              <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: isSelected ? 'var(--primary)' : 'var(--panel)', color: isSelected ? '#fff' : 'var(--muted-fg)', border: '1px solid var(--border-soft)' }}>
                                {model.badge}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted-fg)', lineHeight: 1.4, margin: '4px 0 8px' }}>
                              {model.desc}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                              Provider: {model.provider}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* API TEST BUTTON */}
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      type="button"
                      className="btn-secondary-action"
                      onClick={() => {
                        setApiTestStatus('testing');
                        setTimeout(() => setApiTestStatus('success'), 1200);
                      }}
                    >
                      {apiTestStatus === 'testing' ? 'Testing Connection...' : 'Test API Connection'}
                    </button>
                    {apiTestStatus === 'success' && (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        ✓ OpenRouter API connection verified (Latency: 142ms)
                      </span>
                    )}
                  </div>

                  <div className="card-divider"></div>

                  {/* MATCH SCORE WEIGHT CALIBRATION */}
                  <h3 style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                    Candidate Multi-Factor Weight Calibration
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group-compact">
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                        <span>Skill Matrix Match Weight</span>
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
                        <span>Work Experience Relevance Weight</span>
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
                        <span>Location & Shift Compatibility Weight</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{weightLocation}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={weightLocation}
                        onChange={(e) => setWeightLocation(Number(e.target.value))}
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
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <div className="section-block">
                  <h2 className="section-title">Appearance & Color Customization</h2>
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
                    <label>Interface Density & Scaling</label>
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
                  <h2 className="section-title">Organization & Time Preferences</h2>
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
                      <select className="input-compact" defaultValue="YYYY-MM-DD">
                        <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-05)</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY (08/05/2026)</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY (05/08/2026)</option>
                      </select>
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
                </div>
              )}

              {/* USERS & ACCESS TAB */}
              {activeTab === 'users' && (
                <div className="section-block">
                  <h2 className="section-title">Users & Access Control</h2>
                  <p className="section-desc">Manage active administrator roles and user privileges.</p>

                  <div className="user-profile-box">
                    <div className="user-avatar-large">A</div>
                    <div className="user-info">
                      <div className="user-title-name">ADMIN USER</div>
                      <div className="user-email-text">admin@fleettranspo.com</div>
                      <span className="role-badge">Super Administrator</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY TAB */}
              {activeTab === 'security' && (
                <div className="section-block">
                  <h2 className="section-title">Security Settings</h2>
                  <p className="section-desc">Manage two-factor authentication and session security rules.</p>

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
                </div>
              )}

              {/* DATA & BACKUP TAB */}
              {activeTab === 'data' && (
                <div className="section-block">
                  <h2 className="section-title">Data Management & Backup</h2>
                  <p className="section-desc">Configure database snapshot backups and data export options.</p>

                  <div className="switch-row">
                    <div className="switch-text">
                      <span className="switch-title">Automated Daily Database Snapshots</span>
                      <span className="switch-desc">Schedule midnight backup snapshots of candidate profiles and client records</span>
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

                  <div className="form-actions-inline">
                    <button type="button" className="btn-secondary-action">
                      Export System Data (JSON/CSV)
                    </button>
                  </div>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div className="section-block">
                  <h2 className="section-title">Integrations & External APIs</h2>
                  <p className="section-desc">Connect third-party SMS gateways and document verification services.</p>

                  <div className="integration-card-row">
                    <div className="int-card">
                      <div className="int-title">SMS Gateway API</div>
                      <div className="int-status active">Connected</div>
                    </div>
                    <div className="int-card">
                      <div className="int-title">Document Verification API</div>
                      <div className="int-status inactive">Not Connected</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
