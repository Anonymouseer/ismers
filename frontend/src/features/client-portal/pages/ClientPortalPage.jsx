import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientPortalPage.css';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const INITIAL_JOB_REQUESTS = [
  {
    id: 'PRF-2026-0081',
    position: 'Production Supervisor',
    type: 'Full-time',
    total: 3,
    filled: 1,
    location: 'Valenzuela Plant 2',
    requested: 'Aug 01, 2026',
    deadline: 'Aug 25, 2026',
    status: 'Active',
    statusClass: 'client-portal-badge--active',
    recruiter: 'M. Dela Cruz',
    priority: 'high',
    rate: '₱28,000 / mo',
  },
  {
    id: 'PRF-2026-0079',
    position: 'Quality Control Analyst',
    type: 'Full-time',
    total: 2,
    filled: 0,
    location: 'Main Lab - QC Bldg',
    requested: 'Jul 28, 2026',
    deadline: 'Aug 20, 2026',
    status: 'In Review',
    statusClass: 'client-portal-badge--review',
    recruiter: 'J. Santos',
    priority: 'medium',
    rate: '₱22,000 / mo',
  },
  {
    id: 'PRF-2026-0075',
    position: 'Warehouse Associate',
    type: 'Contractual',
    total: 10,
    filled: 10,
    location: 'Bulacan Logistics Hub',
    requested: 'Jul 22, 2026',
    deadline: 'Aug 05, 2026',
    status: 'Filled',
    statusClass: 'client-portal-badge--filled',
    recruiter: 'A. Reyes',
    priority: 'normal',
    rate: '₱610 / day',
  },
  {
    id: 'PRF-2026-0070',
    position: 'Maintenance Technician',
    type: 'Full-time',
    total: 2,
    filled: 0,
    location: 'Valenzuela Plant 1',
    requested: 'Jul 15, 2026',
    deadline: 'Aug 15, 2026',
    status: 'Pending',
    statusClass: 'client-portal-badge--pending',
    recruiter: 'R. Navarro',
    priority: 'high',
    rate: '₱25,000 / mo',
  },
  {
    id: 'PRF-2026-0066',
    position: 'Forklift Operator',
    type: 'Contractual',
    total: 5,
    filled: 3,
    location: 'Bulacan Logistics Hub',
    requested: 'Jul 08, 2026',
    deadline: 'Aug 10, 2026',
    status: 'Active',
    statusClass: 'client-portal-badge--active',
    recruiter: 'M. Dela Cruz',
    priority: 'normal',
    rate: '₱650 / day',
  },
];

const ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    date: 'Aug 06, 2026',
    title: 'System Maintenance Notice',
    body: 'The portal will be briefly unavailable on Aug 10, 2026 from 12:00 AM to 2:00 AM for scheduled maintenance.',
  },
  {
    id: 'ann-2',
    date: 'Jul 30, 2026',
    title: 'Updated Manpower Request Form',
    body: 'A revised PRF template is now available. All new requests submitted online are directly assigned to your designated recruitment manager.',
  },
  {
    id: 'ann-3',
    date: 'Jul 20, 2026',
    title: 'Holiday Coverage Advisory',
    body: 'Please coordinate with your assigned recruiter for manpower requirements during the upcoming National Heroes Day holiday.',
  },
];

const UPCOMING_INTERVIEWS = [
  {
    id: 'iv-1',
    candidate: 'Rodrigo P. Estrada',
    position: 'Production Supervisor',
    date: 'Aug 08, 2026',
    time: '10:00 AM',
    type: 'On-site',
  },
  {
    id: 'iv-2',
    candidate: 'Maria C. Torres',
    position: 'QC Analyst',
    date: 'Aug 09, 2026',
    time: '2:00 PM',
    type: 'Video Call',
  },
  {
    id: 'iv-3',
    candidate: 'Joel R. Abad',
    position: 'Warehouse Associate',
    date: 'Aug 11, 2026',
    time: '9:00 AM',
    type: 'On-site',
  },
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractual', 'Project-based', 'Others'];
const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent / Critical' },
];

export default function ClientPortalPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'job-orders' | 'account'
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobRequests, setJobRequests] = useState(INITIAL_JOB_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [successBanner, setSuccessBanner] = useState('');

  // New Job Order Form State
  const [jobForm, setJobForm] = useState({
    title: '',
    type: 'Full-time',
    typeOther: '',
    total: 1,
    rate: '',
    ratePeriod: 'monthly',
    location: '',
    deadline: '',
    priority: 'normal',
    description: '',
    requirements: '',
    specialInstructions: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const openJobModal = () => {
    setJobForm({
      title: '',
      type: 'Full-time',
      typeOther: '',
      total: 1,
      rate: '',
      ratePeriod: 'monthly',
      location: '',
      deadline: '',
      priority: 'normal',
      description: '',
      requirements: '',
      specialInstructions: '',
    });
    setFormErrors({});
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setFormErrors({});
  };

  // Sync design system theme & density tokens
  useEffect(() => {
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
  }, []);

  // Auth guard — redirect to login if no active session
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cp_session');
      if (!raw) {
        navigate('/client-portal/login', { replace: true });
        return;
      }
      const parsed = JSON.parse(raw);
      setSession(parsed);

      // Load client's stored job requests if available
      const storedJobs = localStorage.getItem(`cp_jobs_${parsed.email}`);
      if (storedJobs) {
        setJobRequests(JSON.parse(storedJobs));
      }
    } catch {
      navigate('/client-portal/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('cp_session');
    } catch {
      /* ignore */
    }
    navigate('/client-portal/login', { replace: true });
  };

  const handleJobFormChange = (field) => (e) => {
    const val = e.target.value;
    setJobForm((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateJobForm = () => {
    const errors = {};
    if (!jobForm.title.trim()) errors.title = 'Position title is required.';
    if (jobForm.type === 'Others' && !jobForm.typeOther.trim()) errors.typeOther = 'Please specify employment type.';
    if (!jobForm.total || parseInt(jobForm.total, 10) < 1) errors.total = 'Quantity must be at least 1.';
    if (!jobForm.location.trim()) errors.location = 'Work location is required.';
    if (!jobForm.deadline) errors.deadline = 'Target start date / deadline is required.';
    if (!jobForm.description.trim()) errors.description = 'Job description is required.';
    return errors;
  };

  const handleJobFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateJobForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const refNum = `PRF-2026-00${82 + jobRequests.length - 5}`;
      const newRequest = {
        id: refNum,
        position: jobForm.title.trim(),
        type: jobForm.type === 'Others' ? jobForm.typeOther.trim() : jobForm.type,
        total: parseInt(jobForm.total, 10),
        filled: 0,
        location: jobForm.location.trim(),
        requested: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        deadline: new Date(jobForm.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: 'In Review',
        statusClass: 'client-portal-badge--review',
        recruiter: 'Assigned Recruiter',
        priority: jobForm.priority,
        rate: jobForm.rate ? `₱${jobForm.rate} ${jobForm.ratePeriod === 'daily' ? '/ day' : '/ mo'}` : 'Undisclosed',
      };

      const updated = [newRequest, ...jobRequests];
      setJobRequests(updated);

      if (session?.email) {
        try {
          localStorage.setItem(`cp_jobs_${session.email}`, JSON.stringify(updated));
        } catch {
          /* ignore */
        }
      }

      setSubmitting(false);
      setSuccessBanner(`Job Order Request ${refNum} has been created and submitted for review.`);
      setShowJobModal(false);
      setActiveTab('job-orders');
    }, 600);
  };

  // Filtered requests for 'job-orders' tab
  const filteredRequests = jobRequests.filter((req) => {
    const matchesSearch =
      req.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status.toUpperCase().replace(/\s+/g, '_') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = jobRequests.filter((r) => r.status === 'Active').length;
  const inReviewCount = jobRequests.filter((r) => r.status === 'In Review').length;
  const pendingCount = jobRequests.filter((r) => r.status === 'Pending').length;
  const filledCount = jobRequests.filter((r) => r.status === 'Filled').length;

  const summaryCards = [
    {
      id: 'active-job-requests',
      label: 'Active Job Requests',
      value: activeCount,
      trend: `${activeCount} in fulfillment`,
      trendUp: true,
      icon: (
        <svg className="icon" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <line x1="12" y1="12" x2="12" y2="16" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      ),
      colorClass: 'client-portal-card-icon--primary',
      accentClass: 'client-portal-summary-accent--primary',
    },
    {
      id: 'requests-in-review',
      label: 'Requests Under Review',
      value: inReviewCount,
      trend: `${inReviewCount} pending approval`,
      trendUp: true,
      icon: (
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
      colorClass: 'client-portal-card-icon--purple',
      accentClass: 'client-portal-summary-accent--purple',
    },
    {
      id: 'positions-filled',
      label: 'Positions Filled',
      value: filledCount,
      trend: 'Completed orders',
      trendUp: true,
      icon: (
        <svg className="icon" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      colorClass: 'client-portal-card-icon--green',
      accentClass: 'client-portal-summary-accent--green',
    },
    {
      id: 'pending-requests',
      label: 'Action Required',
      value: pendingCount,
      trend: 'Awaiting client response',
      trendUp: false,
      icon: (
        <svg className="icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      colorClass: 'client-portal-card-icon--amber',
      accentClass: 'client-portal-summary-accent--amber',
    },
  ];

  return (
    <div className="client-portal-shell">
      {/* STICKY TOP NAV BAR */}
      <nav className="client-portal-topbar">
        <div className="client-portal-topbar-brand">
          <div className="client-portal-topbar-mark">PM</div>
          <div className="client-portal-topbar-name">
            <span>PRIME</span>
            <span>POWER</span>
          </div>
          <div className="client-portal-topbar-sep" aria-hidden="true" />
          <div className="client-portal-topbar-module">Client Portal</div>
        </div>
        <div className="client-portal-topbar-actions">
          <button
            id="client-portal-notification-btn"
            className="client-portal-notif-btn"
            type="button"
            title="View Notifications"
            aria-label="Notifications"
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
            <span className="client-portal-notif-dot" aria-hidden="true" />
          </button>
          <button
            id="client-portal-logout-btn"
            className="client-portal-logout-btn"
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER: SIDEBAR + CONTENT */}
      <div className="client-portal-main-container">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="client-portal-sidebar-nav">
          <div className="client-portal-sidebar-section">
            <div className="client-portal-sidebar-label">Navigation</div>
            <nav className="client-portal-nav-list">
              <button
                type="button"
                id="nav-dashboard"
                className={`client-portal-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>Dashboard</span>
              </button>

              <button
                type="button"
                id="nav-job-orders"
                className={`client-portal-nav-item ${activeTab === 'job-orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('job-orders')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>Job orders</span>
                <span className="client-portal-nav-count">{jobRequests.length}</span>
              </button>

              <button
                type="button"
                id="nav-account"
                className={`client-portal-nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Account</span>
              </button>
            </nav>
          </div>

          {/* SIDEBAR USER FOOTER */}
          <div className="client-portal-sidebar-footer-card">
            <div className="client-portal-sidebar-user-avatar">
              {(session?.company || 'S')[0]}
            </div>
            <div className="client-portal-sidebar-user-info">
              <div className="client-portal-sidebar-user-company">
                {session?.company || 'Sunshine Mfg. Corp.'}
              </div>
              <div className="client-portal-sidebar-user-email">
                {session?.contactPerson || 'Client User'}
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="client-portal-content-area">
          {/* SUCCESS TOAST */}
          {successBanner && (
            <div className="client-portal-success-toast" role="status">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successBanner}</span>
              <button type="button" className="client-portal-toast-close" onClick={() => setSuccessBanner('')}>
                ✕
              </button>
            </div>
          )}

          {/* ── VIEW: DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className="client-portal-view-container">
              <div className="client-portal-header">
                <div className="client-portal-header-left">
                  <div className="client-portal-eyebrow">Dashboard Overview</div>
                  <h1 className="client-portal-title">
                    Welcome, {session?.company || 'Sunshine Manufacturing Corp.'}
                  </h1>
                  <div className="client-portal-date">{TODAY}</div>
                </div>
                <div className="client-portal-header-right" />
              </div>

              {/* SUMMARY STAT CARDS */}
              <div className="client-portal-summary-grid">
                {summaryCards.map((card) => (
                  <div key={card.id} id={card.id} className="client-portal-card client-portal-summary-card">
                    <div className={`client-portal-summary-accent ${card.accentClass}`} aria-hidden="true" />
                    <div className="client-portal-summary-body">
                      <div className="client-portal-summary-card-top">
                        <div className={`client-portal-card-icon ${card.colorClass}`}>{card.icon}</div>
                        <span className={`client-portal-trend ${card.trendUp ? 'client-portal-trend--up' : 'client-portal-trend--warn'}`}>
                          {card.trend}
                        </span>
                      </div>
                      <div className="client-portal-summary-value">{card.value}</div>
                      <div className="client-portal-summary-label">{card.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* TWO-COLUMN GRID: TABLE + SIDEBAR */}
              <div className="client-portal-content-grid">
                {/* RECENT JOB REQUESTS TABLE */}
                <div className="client-portal-main-col">
                  <div className="client-portal-card client-portal-table-card">
                    <div className="client-portal-card-head">
                      <div className="client-portal-card-title">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Recent Job Requests
                      </div>
                      <button
                        type="button"
                        className="client-portal-link-btn"
                        onClick={() => setActiveTab('job-orders')}
                      >
                        View All ({jobRequests.length}) →
                      </button>
                    </div>
                    <div className="client-portal-table-wrap">
                      <table className="client-portal-table">
                        <thead>
                          <tr>
                            <th>Request ID</th>
                            <th>Position / Title</th>
                            <th>Qty</th>
                            <th>Location</th>
                            <th>Date Requested</th>
                            <th>Status</th>
                            <th>Recruiter</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobRequests.slice(0, 5).map((req) => (
                            <tr key={req.id}>
                              <td><span className="client-portal-ref-id">{req.id}</span></td>
                              <td className="client-portal-table-position">{req.position}</td>
                              <td>{req.filled} / {req.total}</td>
                              <td className="client-portal-table-muted">{req.location}</td>
                              <td className="client-portal-table-muted">{req.requested}</td>
                              <td><span className={`client-portal-badge ${req.statusClass}`}>{req.status}</span></td>
                              <td className="client-portal-table-muted">{req.recruiter}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDEBAR: ANNOUNCEMENTS + UPCOMING INTERVIEWS */}
                <aside className="client-portal-sidebar">
                  <div className="client-portal-card client-portal-sidebar-card">
                    <div className="client-portal-card-head">
                      <div className="client-portal-card-title">
                        <svg className="icon" viewBox="0 0 24 24">
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        Announcements
                      </div>
                    </div>
                    <div className="client-portal-announce-list">
                      {ANNOUNCEMENTS.map((item) => (
                        <div key={item.id} className="client-portal-announce-item">
                          <div className="client-portal-announce-date">{item.date}</div>
                          <div className="client-portal-announce-title">{item.title}</div>
                          <div className="client-portal-announce-body">{item.body}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="client-portal-card client-portal-sidebar-card">
                    <div className="client-portal-card-head">
                      <div className="client-portal-card-title">
                        <svg className="icon" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Upcoming Interviews
                      </div>
                    </div>
                    <div className="client-portal-interview-list">
                      {UPCOMING_INTERVIEWS.map((iv) => (
                        <div key={iv.id} className="client-portal-interview-item">
                          <div className="client-portal-interview-avatar">{iv.candidate[0]}</div>
                          <div className="client-portal-interview-info">
                            <div className="client-portal-interview-candidate">{iv.candidate}</div>
                            <div className="client-portal-interview-position">{iv.position}</div>
                            <div className="client-portal-interview-meta">
                              <span>{iv.date} &middot; {iv.time}</span>
                              <span className="client-portal-interview-type">{iv.type}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* ── VIEW: JOB ORDERS ── */}
          {activeTab === 'job-orders' && (
            <div className="client-portal-view-container">
              <div className="client-portal-header">
                <div className="client-portal-header-left">
                  <div className="client-portal-eyebrow">Manpower Requisitions</div>
                  <h1 className="client-portal-title">Job Orders</h1>
                  <div className="client-portal-date">Track status, fulfillment progress, and assigned recruiters</div>
                </div>
                <div className="client-portal-header-right">
                  <button
                    id="job-orders-new-request-btn"
                    type="button"
                    className="client-portal-btn-primary"
                    onClick={openJobModal}
                  >
                    + New Job Order Request
                  </button>
                </div>
              </div>

              <div className="client-portal-card client-portal-controls-card">
                <div className="client-portal-search-wrap">
                  <svg className="icon" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="client-portal-search-input"
                    placeholder="Search by Job Title, Reference ID, or Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="client-portal-status-pills">
                  {['ALL', 'ACTIVE', 'IN_REVIEW', 'PENDING', 'FILLED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`client-portal-pill ${statusFilter === st ? 'active' : ''}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="client-portal-card client-portal-table-card">
                <div className="client-portal-table-wrap">
                  <table className="client-portal-table">
                    <thead>
                      <tr>
                        <th>Request ID</th>
                        <th>Position Title</th>
                        <th>Type</th>
                        <th>Progress (Filled / Total)</th>
                        <th>Rate / Salary</th>
                        <th>Location</th>
                        <th>Date Submitted</th>
                        <th>Target Date</th>
                        <th>Status</th>
                        <th>Assigned Recruiter</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="client-portal-empty-cell">
                            No job order requests match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => (
                          <tr key={req.id}>
                            <td><span className="client-portal-ref-id">{req.id}</span></td>
                            <td className="client-portal-table-position">{req.position}</td>
                            <td>{req.type}</td>
                            <td>
                              <div className="client-portal-progress-cell">
                                <span>{req.filled} / {req.total}</span>
                                <div className="client-portal-progress-bar">
                                  <div
                                    className="client-portal-progress-fill"
                                    style={{ width: `${(req.filled / req.total) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="client-portal-table-muted">{req.rate}</td>
                            <td className="client-portal-table-muted">{req.location}</td>
                            <td className="client-portal-table-muted">{req.requested}</td>
                            <td className="client-portal-table-muted">{req.deadline}</td>
                            <td><span className={`client-portal-badge ${req.statusClass}`}>{req.status}</span></td>
                            <td className="client-portal-table-muted">{req.recruiter}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW: ACCOUNT / COMPANY PROFILE ── */}
          {activeTab === 'account' && (
            <div className="client-portal-view-container">
              <div className="client-portal-header">
                <div className="client-portal-header-left">
                  <div className="client-portal-eyebrow">My Account</div>
                  <h1 className="client-portal-title">Company Profile</h1>
                  <div className="client-portal-date">Verified employer details and agency contact information</div>
                </div>
              </div>

              <div className="client-portal-card client-portal-profile-card">
                <div className="client-portal-profile-header">
                  <div className="client-portal-profile-avatar">
                    {(session?.company || 'S')[0]}
                  </div>
                  <div className="client-portal-profile-title-block">
                    <h2>{session?.company || 'Sunshine Manufacturing Corp.'}</h2>
                    <span className="client-portal-profile-badge">Active Client Account</span>
                  </div>
                </div>

                <div className="client-portal-profile-grid">
                  <div className="client-portal-profile-item">
                    <label>Industry</label>
                    <div>{session?.industry || 'Manufacturing & Assembly'}</div>
                  </div>
                  <div className="client-portal-profile-item">
                    <label>Primary Contact Person</label>
                    <div>{session?.contactPerson || 'Juanita Dela Cruz'}</div>
                  </div>
                  <div className="client-portal-profile-item">
                    <label>Position / Designation</label>
                    <div>{session?.designation || 'Human Resources Manager'}</div>
                  </div>
                  <div className="client-portal-profile-item">
                    <label>Official Email Address</label>
                    <div>{session?.email || 'hr@sunshinemfg.com.ph'}</div>
                  </div>
                  <div className="client-portal-profile-item">
                    <label>Mobile Number</label>
                    <div>{session?.mobile || '+63 917 555 1234'}</div>
                  </div>
                  <div className="client-portal-profile-item">
                    <label>Servicing Branch</label>
                    <div>PRIMEPOWER Head Office (QC Branch)</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── JOB ORDER REQUEST MODAL ── */}
      {showJobModal && (
        <>
          <div className="cp-modal-overlay" onClick={closeJobModal} />
          <div className="cp-modal-panel" role="dialog" aria-modal="true" aria-label="New Job Order Request">
            <div className="cp-modal-head">
              <div className="cp-modal-title">New Job Order Request</div>
              <button type="button" className="cp-modal-close" onClick={closeJobModal} aria-label="Close">
                <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <form className="cp-modal-body" onSubmit={handleJobFormSubmit}>
              <div className="cp-modal-section">
                <div className="cp-modal-section-title">Company &amp; Position Details</div>
                <div className="cp-modal-row">
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-company">Client / Requesting Entity</label>
                    <input id="cpmod-company" type="text" className="cp-modal-input cp-modal-input--disabled"
                      value={session?.company || 'Sunshine Manufacturing Corp.'} disabled readOnly />
                  </div>
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-title">Position / Job Title <span className="cp-modal-req">*</span></label>
                    <input id="cpmod-title" type="text" autoFocus
                      className={`cp-modal-input ${formErrors.title ? 'cp-modal-input--error' : ''}`}
                      placeholder="e.g. Production Line Supervisor"
                      value={jobForm.title} onChange={handleJobFormChange('title')} />
                    {formErrors.title && <span className="cp-modal-error">{formErrors.title}</span>}
                  </div>
                </div>
                <div className="cp-modal-row cp-modal-row--3">
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-type">Employment Type <span className="cp-modal-req">*</span></label>
                    <select id="cpmod-type" className="cp-modal-input"
                      value={jobForm.type} onChange={handleJobFormChange('type')}>
                      {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {jobForm.type === 'Others' && (
                      <input type="text"
                        className={`cp-modal-input cp-modal-input--mt ${formErrors.typeOther ? 'cp-modal-input--error' : ''}`}
                        placeholder="Specify employment type"
                        value={jobForm.typeOther} onChange={handleJobFormChange('typeOther')} />
                    )}
                    {formErrors.typeOther && <span className="cp-modal-error">{formErrors.typeOther}</span>}
                  </div>
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-total">Quantity Needed <span className="cp-modal-req">*</span></label>
                    <input id="cpmod-total" type="number" min="1"
                      className={`cp-modal-input ${formErrors.total ? 'cp-modal-input--error' : ''}`}
                      value={jobForm.total} onChange={handleJobFormChange('total')} />
                    {formErrors.total && <span className="cp-modal-error">{formErrors.total}</span>}
                  </div>
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-priority">Fulfillment Priority</label>
                    <select id="cpmod-priority" className="cp-modal-input"
                      value={jobForm.priority} onChange={handleJobFormChange('priority')}>
                      {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="cp-modal-section">
                <div className="cp-modal-section-title">Compensation &amp; Deployment Location</div>
                <div className="cp-modal-row cp-modal-row--3">
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-rate">Offer Rate / Salary</label>
                    <div className="cp-modal-prefix-wrap">
                      <span className="cp-modal-prefix">₱</span>
                      <input id="cpmod-rate" type="text" className="cp-modal-input" placeholder="e.g. 25,000"
                        value={jobForm.rate} onChange={handleJobFormChange('rate')} />
                    </div>
                  </div>
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-rate-period">Rate Period</label>
                    <select id="cpmod-rate-period" className="cp-modal-input"
                      value={jobForm.ratePeriod} onChange={handleJobFormChange('ratePeriod')}>
                      <option value="monthly">Per Month</option>
                      <option value="daily">Per Day (Daily Wage)</option>
                    </select>
                  </div>
                  <div className="cp-modal-field">
                    <label htmlFor="cpmod-deadline">Target Start Date <span className="cp-modal-req">*</span></label>
                    <input id="cpmod-deadline" type="date"
                      className={`cp-modal-input ${formErrors.deadline ? 'cp-modal-input--error' : ''}`}
                      value={jobForm.deadline} onChange={handleJobFormChange('deadline')} />
                    {formErrors.deadline && <span className="cp-modal-error">{formErrors.deadline}</span>}
                  </div>
                </div>
                <div className="cp-modal-field">
                  <label htmlFor="cpmod-location">Deployment Address / Site Location <span className="cp-modal-req">*</span></label>
                  <input id="cpmod-location" type="text"
                    className={`cp-modal-input ${formErrors.location ? 'cp-modal-input--error' : ''}`}
                    placeholder="e.g. Valenzuela Industrial Complex, Plant 3"
                    value={jobForm.location} onChange={handleJobFormChange('location')} />
                  {formErrors.location && <span className="cp-modal-error">{formErrors.location}</span>}
                </div>
              </div>

              <div className="cp-modal-section">
                <div className="cp-modal-section-title">Job Description &amp; Requirements</div>
                <div className="cp-modal-field">
                  <label htmlFor="cpmod-desc">Job Description / Core Responsibilities <span className="cp-modal-req">*</span></label>
                  <textarea id="cpmod-desc" rows={4}
                    className={`cp-modal-input cp-modal-textarea ${formErrors.description ? 'cp-modal-input--error' : ''}`}
                    placeholder="Provide a detailed summary of key duties, work schedule, shift details..."
                    value={jobForm.description} onChange={handleJobFormChange('description')} />
                  {formErrors.description && <span className="cp-modal-error">{formErrors.description}</span>}
                </div>
                <div className="cp-modal-field">
                  <label htmlFor="cpmod-reqs">Requirements &amp; Qualifications (one per line)</label>
                  <textarea id="cpmod-reqs" rows={4} className="cp-modal-input cp-modal-textarea"
                    placeholder={'• At least High School Graduate or Vocational\n• 1-2 years relevant experience'}
                    value={jobForm.requirements} onChange={handleJobFormChange('requirements')} />
                </div>
                <div className="cp-modal-field">
                  <label htmlFor="cpmod-notes">Special Instructions / Notes for Recruiter</label>
                  <textarea id="cpmod-notes" rows={2} className="cp-modal-input cp-modal-textarea"
                    placeholder="Any urgent notes or preferred candidate contact details..."
                    value={jobForm.specialInstructions} onChange={handleJobFormChange('specialInstructions')} />
                </div>
              </div>

              <div className="cp-modal-actions">
                <button type="button" className="cp-modal-btn-cancel" onClick={closeJobModal}>Cancel</button>
                <button type="submit" className="cp-modal-btn-submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Job Order Request'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
