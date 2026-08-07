import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientPortalSettingsPage from './ClientPortalSettingsPage';
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

const MOCK_ACCOUNT_MANAGER = {
  name: 'Mark Anthony Dela Cruz',
  title: 'Senior Account Manager',
  branch: 'PRIMEPOWER Head Office (QC)',
  email: 'm.delacruz@primepower.ph',
  phone: '+63 917 888 4321',
  officeLine: '(02) 8923-4567 ext. 104',
};

const MOCK_ENDORSED_CANDIDATES = [
  {
    id: 'cand-101',
    name: 'Rodrigo P. Estrada',
    position: 'Production Supervisor',
    jobRef: 'PRF-2026-0081',
    matchScore: 94,
    experience: '6 years in electronics assembly & plant supervision',
    skills: ['Line Balancing', '5S Methodology', 'Shift Scheduling', 'PLC Basic'],
    endorsedDate: 'Aug 05, 2026',
    status: 'Pending Review',
    recruiter: 'M. Dela Cruz',
  },
  {
    id: 'cand-102',
    name: 'Maria C. Torres',
    position: 'Quality Control Analyst',
    jobRef: 'PRF-2026-0079',
    matchScore: 89,
    experience: '4 years in ISO 9001 quality inspection & lab analysis',
    skills: ['Calipers & Micrometer', 'Chemical Testing', 'Defect Reporting', 'ISO Audit'],
    endorsedDate: 'Aug 04, 2026',
    status: 'Accepted for Interview',
    recruiter: 'J. Santos',
  },
  {
    id: 'cand-103',
    name: 'Joel R. Abad',
    position: 'Forklift Operator',
    jobRef: 'PRF-2026-0066',
    matchScore: 91,
    experience: '5 years heavy material handling & warehouse logistics',
    skills: ['Reach Truck License', 'Inventory Stacking', 'WMS Entry', 'Safety OSHA'],
    endorsedDate: 'Aug 02, 2026',
    status: 'Pending Review',
    recruiter: 'M. Dela Cruz',
  },
];

const MOCK_DEPLOYED_ROSTER = [
  {
    id: 'dep-501',
    employeeName: 'Eduardo M. Santos',
    position: 'Production Line Operator',
    site: 'Valenzuela Plant 2',
    startDate: 'Feb 15, 2026',
    expiryDate: 'Aug 15, 2026',
    status: 'Expiring Soon',
    contractType: '6-Month Project',
  },
  {
    id: 'dep-502',
    employeeName: 'Analyn S. Mendoza',
    position: 'Quality Control Analyst',
    site: 'Main Lab - QC Bldg',
    startDate: 'Jan 10, 2026',
    expiryDate: 'Jan 10, 2027',
    status: 'Active',
    contractType: '1-Year Contract',
  },
  {
    id: 'dep-503',
    employeeName: 'Benjamin K. Cruz',
    position: 'Warehouse Associate',
    site: 'Bulacan Logistics Hub',
    startDate: 'Mar 01, 2026',
    expiryDate: 'Sep 01, 2026',
    status: 'Active',
    contractType: '6-Month Project',
  },
  {
    id: 'dep-504',
    employeeName: 'Carla D. Reyes',
    position: 'Forklift Operator',
    site: 'Bulacan Logistics Hub',
    startDate: 'Feb 20, 2026',
    expiryDate: 'Aug 20, 2026',
    status: 'Expiring Soon',
    contractType: '6-Month Project',
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'job-orders' | 'endorsements' | 'deployed-roster' | 'settings'
  const [showJobModal, setShowJobModal] = useState(false);
  const [jobRequests, setJobRequests] = useState(INITIAL_JOB_REQUESTS);
  const [endorsedCandidates, setEndorsedCandidates] = useState(MOCK_ENDORSED_CANDIDATES);
  const [deployedRoster, setDeployedRoster] = useState(MOCK_DEPLOYED_ROSTER);
  const [endorsementFilter, setEndorsementFilter] = useState('ALL');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('ALL');
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

  // Account Information Edit State
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [showAccountSuccessModal, setShowAccountSuccessModal] = useState(false);
  const [accountForm, setAccountForm] = useState({
    company: '',
    industry: '',
    contactPerson: '',
    designation: '',
    email: '',
    mobile: '',
    logo: '',
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [accountSaving, setAccountSaving] = useState(false);

  const startEditingAccount = () => {
    setAccountForm({
      company: session?.company || 'Sunshine Manufacturing Corp.',
      industry: session?.industry || 'Manufacturing & Assembly',
      contactPerson: session?.contactPerson || 'Juanita Dela Cruz',
      designation: session?.designation || 'Human Resources Manager',
      email: session?.email || 'hr@sunshinemfg.com.ph',
      mobile: session?.mobile || '+63 917 555 1234',
      logo: session?.logo || '',
    });
    setAccountErrors({});
    setIsEditingAccount(true);
  };

  const cancelEditingAccount = () => {
    setIsEditingAccount(false);
    setAccountErrors({});
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setAccountErrors((prev) => ({ ...prev, logo: 'Logo image file size must be under 3MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      setAccountForm((prev) => ({ ...prev, logo: evt.target.result }));
      if (accountErrors.logo) {
        setAccountErrors((prev) => ({ ...prev, logo: '' }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setAccountForm((prev) => ({ ...prev, logo: '' }));
  };

  const handleAccountFormChange = (field) => (e) => {
    const val = e.target.value;
    setAccountForm((prev) => ({ ...prev, [field]: val }));
    if (accountErrors[field]) {
      setAccountErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAccountFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!accountForm.company.trim()) errors.company = 'Company name is required.';
    if (!accountForm.contactPerson.trim()) errors.contactPerson = 'Contact person is required.';
    if (!accountForm.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(accountForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!accountForm.mobile.trim()) errors.mobile = 'Mobile number is required.';

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      return;
    }

    setAccountSaving(true);

    setTimeout(() => {
      const updatedSession = {
        ...session,
        company: accountForm.company.trim(),
        industry: accountForm.industry.trim() || 'Manufacturing & Assembly',
        contactPerson: accountForm.contactPerson.trim(),
        designation: accountForm.designation.trim(),
        email: accountForm.email.trim(),
        mobile: accountForm.mobile.trim(),
        logo: accountForm.logo || '',
      };

      setSession(updatedSession);

      try {
        localStorage.setItem('cp_session', JSON.stringify(updatedSession));

        // Also update in registered account list if exists
        const rawAccounts = localStorage.getItem('cp_accounts');
        if (rawAccounts) {
          const accounts = JSON.parse(rawAccounts);
          const updatedAccounts = accounts.map((acc) => {
            if (acc.email === session?.email || acc.company === session?.company) {
              return { ...acc, ...updatedSession };
            }
            return acc;
          });
          localStorage.setItem('cp_accounts', JSON.stringify(updatedAccounts));
        }
      } catch {
        /* ignore */
      }

      setAccountSaving(false);
      setIsEditingAccount(false);
      setShowAccountSuccessModal(true);
    }, 400);
  };

  const handleAcceptCandidate = (candId) => {
    setEndorsedCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: 'Accepted for Interview' } : c))
    );
    setSuccessBanner('Candidate accepted for interview. Notification sent to recruiter.');
  };

  const handleDeclineCandidate = (candId) => {
    setEndorsedCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: 'Declined' } : c))
    );
    setSuccessBanner('Candidate status updated to Declined.');
  };

  const handleRenewRosterContract = (rosterId) => {
    setDeployedRoster((prev) =>
      prev.map((r) => (r.id === rosterId ? { ...r, status: 'Renewal Requested' } : r))
    );
    setSuccessBanner('Contract renewal request submitted to your Account Manager.');
  };

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
        <aside className={`client-portal-sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''}`}>
          {/* SIDEBAR COLLAPSE TOGGLE BUTTON ON BORDER LINE */}
          <button
            type="button"
            id="cp-sidebar-collapse-btn"
            className={`cp-sidebar-collapse-btn ${sidebarCollapsed ? 'collapsed' : ''}`}
            onClick={() => setSidebarCollapsed((c) => !c)}
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg className="icon" viewBox="0 0 24 24">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          {/* CLIENT BRAND / PROFILE HEADER (AT VERY TOP - NO BORDER) */}
          <div className="client-portal-sidebar-top-profile" title={sidebarCollapsed ? (session?.company || 'Sunshine Mfg. Corp.') : undefined}>
            <div className="client-portal-sidebar-user-avatar">
              {session?.logo ? (
                <img src={session.logo} alt={session?.company || 'Company Logo'} className="client-portal-sidebar-logo-img" />
              ) : (
                (session?.company || 'S')[0]
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="client-portal-sidebar-user-info">
                <div className="client-portal-sidebar-user-company">
                  {session?.company || 'Sunshine Mfg. Corp.'}
                </div>
              </div>
            )}
          </div>

          <div className="client-portal-sidebar-section">
            <div className="client-portal-sidebar-label">Navigation</div>
            <nav className="client-portal-nav-list">
              <button
                type="button"
                id="nav-dashboard"
                className={`client-portal-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
                title={sidebarCollapsed ? 'Dashboard' : undefined}
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
                title={sidebarCollapsed ? `Job Orders (${jobRequests.length})` : undefined}
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
                id="nav-endorsements"
                className={`client-portal-nav-item ${activeTab === 'endorsements' ? 'active' : ''}`}
                onClick={() => setActiveTab('endorsements')}
                title={sidebarCollapsed ? `Endorsements (${endorsedCandidates.filter((c) => c.status === 'Pending Review').length})` : undefined}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <polyline points="17 11 19 13 23 9" />
                </svg>
                <span>Endorsements</span>
                <span className="client-portal-nav-count client-portal-nav-count--amber">
                  {endorsedCandidates.filter((c) => c.status === 'Pending Review').length}
                </span>
              </button>

              <button
                type="button"
                id="nav-deployed-roster"
                className={`client-portal-nav-item ${activeTab === 'deployed-roster' ? 'active' : ''}`}
                onClick={() => setActiveTab('deployed-roster')}
                title={sidebarCollapsed ? `Deployed Roster (${deployedRoster.length})` : undefined}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Deployed Roster</span>
                <span className="client-portal-nav-count">{deployedRoster.length}</span>
              </button>

              <button
                type="button"
                id="nav-settings"
                className={`client-portal-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
                title={sidebarCollapsed ? 'Settings' : undefined}
              >
                <svg className="icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* SIDEBAR ACCOUNT MANAGER WIDGET */}
          <div className="client-portal-sidebar-section client-portal-sidebar-section--am" title={sidebarCollapsed ? `Account Manager: ${MOCK_ACCOUNT_MANAGER.name}` : undefined}>
            <div className="client-portal-sidebar-label">Assigned Account Manager</div>
            <div className="client-portal-am-card">
              <div className="client-portal-am-avatar">
                {MOCK_ACCOUNT_MANAGER.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="client-portal-am-info">
                <div className="client-portal-am-name">{MOCK_ACCOUNT_MANAGER.name}</div>
                <div className="client-portal-am-title">{MOCK_ACCOUNT_MANAGER.title}</div>
                <a href={`mailto:${MOCK_ACCOUNT_MANAGER.email}`} className="client-portal-am-email">
                  {MOCK_ACCOUNT_MANAGER.email}
                </a>
                <div className="client-portal-am-phone">{MOCK_ACCOUNT_MANAGER.phone}</div>
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

                  {/* EXPIRING DEPLOYMENTS ALERT WIDGET */}
                  <div className="client-portal-card client-portal-sidebar-card">
                    <div className="client-portal-card-head">
                      <div className="client-portal-card-title client-portal-card-title--amber">
                        <svg className="icon" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Expiring Deployment Alerts
                      </div>
                    </div>
                    <div className="client-portal-expiry-list">
                      {deployedRoster
                        .filter((r) => r.status === 'Expiring Soon' || r.status === 'Renewal Requested')
                        .map((item) => (
                          <div key={item.id} className="client-portal-expiry-item">
                            <div className="client-portal-expiry-header">
                              <span className="client-portal-expiry-name">{item.employeeName}</span>
                              <span className={`client-portal-badge ${item.status === 'Renewal Requested' ? 'client-portal-badge--active' : 'client-portal-badge--pending'}`}>
                                {item.status === 'Renewal Requested' ? 'Renewal Requested' : `Expires ${item.expiryDate}`}
                              </span>
                            </div>
                            <div className="client-portal-expiry-sub">{item.position} &middot; {item.site}</div>
                            {item.status !== 'Renewal Requested' && (
                              <button
                                type="button"
                                className="client-portal-expiry-renew-btn"
                                onClick={() => handleRenewRosterContract(item.id)}
                              >
                                Request Contract Renewal
                              </button>
                            )}
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

          {/* ── VIEW: CANDIDATE ENDORSEMENTS ── */}
          {activeTab === 'endorsements' && (
            <div className="client-portal-view-container">
              <div className="client-portal-header">
                <div className="client-portal-header-left">
                  <div className="client-portal-eyebrow">Recruitment Pipeline</div>
                  <h1 className="client-portal-title">Candidate Endorsements</h1>
                  <div className="client-portal-date">Qualified candidates vetted by PRIMEPOWER recruiters ready for client interview approval</div>
                </div>
              </div>

              <div className="client-portal-card client-portal-controls-card">
                <div className="client-portal-status-pills">
                  {['ALL', 'Pending Review', 'Accepted for Interview', 'Declined'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`client-portal-pill ${endorsementFilter === st ? 'active' : ''}`}
                      onClick={() => setEndorsementFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="client-portal-endorsement-grid">
                {endorsedCandidates
                  .filter((c) => endorsementFilter === 'ALL' || c.status === endorsementFilter)
                  .map((cand) => (
                    <div key={cand.id} className="client-portal-card cp-endorsement-card">
                      <div className="cp-endorsement-card-header">
                        <div className="cp-endorsement-avatar">{cand.name[0]}</div>
                        <div className="cp-endorsement-title-block">
                          <div className="cp-endorsement-name">{cand.name}</div>
                          <div className="cp-endorsement-role">{cand.position} &middot; <span className="client-portal-ref-id">{cand.jobRef}</span></div>
                        </div>
                        <div className="cp-endorsement-score">
                          <span className="cp-score-badge">{cand.matchScore}% Match Score</span>
                        </div>
                      </div>

                      <div className="cp-endorsement-card-body">
                        <div className="cp-endorsement-section">
                          <label>Work Experience Summary</label>
                          <p>{cand.experience}</p>
                        </div>
                        <div className="cp-endorsement-section">
                          <label>Validated Competencies</label>
                          <div className="cp-skill-tags">
                            {cand.skills.map((sk) => (
                              <span key={sk} className="cp-skill-tag">{sk}</span>
                            ))}
                          </div>
                        </div>
                        <div className="cp-endorsement-meta-row">
                          <span>Endorsed on {cand.endorsedDate} by {cand.recruiter}</span>
                          <span className={`client-portal-badge ${cand.status === 'Accepted for Interview' ? 'client-portal-badge--filled' : cand.status === 'Declined' ? 'cp-badge--declined' : 'client-portal-badge--review'}`}>
                            {cand.status}
                          </span>
                        </div>
                      </div>

                      {cand.status === 'Pending Review' && (
                        <div className="cp-endorsement-card-actions">
                          <button
                            type="button"
                            className="cp-btn-decline"
                            onClick={() => handleDeclineCandidate(cand.id)}
                          >
                            Decline Candidate
                          </button>
                          <button
                            type="button"
                            className="client-portal-btn-primary cp-btn-accept"
                            onClick={() => handleAcceptCandidate(cand.id)}
                          >
                            Accept for Interview
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── VIEW: DEPLOYED WORKFORCE ROSTER ── */}
          {activeTab === 'deployed-roster' && (
            <div className="client-portal-view-container">
              <div className="client-portal-header">
                <div className="client-portal-header-left">
                  <div className="client-portal-eyebrow">Workforce Operations</div>
                  <h1 className="client-portal-title">Deployed Personnel Roster</h1>
                  <div className="client-portal-date">Active manpower deployed across your plant and site facilities</div>
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
                    placeholder="Search by Employee Name, Position, or Site Location..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                  />
                </div>
                <div className="client-portal-status-pills">
                  {['ALL', 'Active', 'Expiring Soon'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`client-portal-pill ${rosterStatusFilter === st ? 'active' : ''}`}
                      onClick={() => setRosterStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="client-portal-card client-portal-table-card">
                <div className="client-portal-table-wrap">
                  <table className="client-portal-table">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Assigned Position</th>
                        <th>Deployment Site</th>
                        <th>Contract Type</th>
                        <th>Start Date</th>
                        <th>Contract Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deployedRoster
                        .filter(
                          (r) =>
                            (rosterStatusFilter === 'ALL' || r.status === rosterStatusFilter) &&
                            (r.employeeName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                              r.position.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                              r.site.toLowerCase().includes(rosterSearch.toLowerCase()))
                        )
                        .map((emp) => (
                          <tr key={emp.id}>
                            <td className="client-portal-table-position">{emp.employeeName}</td>
                            <td>{emp.position}</td>
                            <td className="client-portal-table-muted">{emp.site}</td>
                            <td className="client-portal-table-muted">{emp.contractType}</td>
                            <td className="client-portal-table-muted">{emp.startDate}</td>
                            <td className="client-portal-table-muted">{emp.expiryDate}</td>
                            <td>
                              <span
                                className={`client-portal-badge ${emp.status === 'Active'
                                    ? 'client-portal-badge--active'
                                    : emp.status === 'Renewal Requested'
                                      ? 'client-portal-badge--filled'
                                      : 'client-portal-badge--pending'
                                  }`}
                              >
                                {emp.status}
                              </span>
                            </td>
                            <td>
                              {emp.status !== 'Renewal Requested' ? (
                                <button
                                  type="button"
                                  className="cp-table-renew-btn"
                                  onClick={() => handleRenewRosterContract(emp.id)}
                                >
                                  Request Renewal
                                </button>
                              ) : (
                                <span className="cp-table-renew-done">Submitted</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── VIEW: SETTINGS ── */}
          {activeTab === 'settings' && (
            <ClientPortalSettingsPage
              session={session}
              onUpdateSession={(updated) => {
                setSession(updated);
                localStorage.setItem('cp_session', JSON.stringify(updated));
              }}
            />
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

      {/* ── ACCOUNT SUCCESS POPUP MODAL ── */}
      {showAccountSuccessModal && (
        <>
          <div className="cp-modal-overlay" onClick={() => setShowAccountSuccessModal(false)} />
          <div className="cp-popup-modal" role="dialog" aria-modal="true" aria-label="Account Updated">
            <div className="cp-popup-modal-icon">
              <svg className="icon" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className="cp-popup-modal-title">Account Information Updated</div>
            <div className="cp-popup-modal-message">
              Your company profile details and branding preferences have been successfully updated in the system.
            </div>
            <div className="cp-popup-modal-actions">
              <button
                type="button"
                id="cp-account-success-confirm-btn"
                className="client-portal-btn-primary cp-popup-modal-btn"
                onClick={() => setShowAccountSuccessModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
