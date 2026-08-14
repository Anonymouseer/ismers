import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import ClientPortalSidebar from '../components/ClientPortalSidebar';
import ClientPortalTopbar from '../components/ClientPortalTopbar';
import ClientPortalSuccessToast from '../components/ClientPortalSuccessToast';
import ClientPortalSummaryCards from '../components/ClientPortalSummaryCards';
import ClientPortalDashboardSidebar from '../components/ClientPortalDashboardSidebar';
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
    let cancelled = false;
    const init = async () => {
      try {
        const raw = localStorage.getItem('cp_session');
        if (!raw) {
          navigate('/client-portal/login', { replace: true });
          return;
        }
        const parsed = JSON.parse(raw);
        if (!cancelled) setSession(parsed);

        // Load job orders from the API if the account has an id
        if (parsed?.id) {
          try {
            const res = await clientPortalService.getJobOrders(parsed.id);
            if (!cancelled && res?.data?.length) {
              // Map the API shape to the Client Portal display shape
              const mapped = res.data.map((j) => ({
                id: j.ref,
                position: j.title,
                type: j.type,
                total: j.total,
                filled: j.filled,
                location: j.location,
                requested: j.createdAt
                  ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                  : '',
                deadline: j.deadline,
                status: j.status === 'open' ? 'In Review'
                  : j.status === 'filling' ? 'Active'
                  : j.status === 'filled'  ? 'Filled'
                  : j.status === 'urgent'  ? 'Active'
                  : 'Pending',
                statusClass: j.status === 'open' ? 'client-portal-badge--review'
                  : j.status === 'filling' ? 'client-portal-badge--active'
                  : j.status === 'filled'  ? 'client-portal-badge--filled'
                  : j.status === 'urgent'  ? 'client-portal-badge--active'
                  : 'client-portal-badge--pending',
                recruiter: j.recruiter || 'Unassigned',
                priority: j.priority,
                rate: j.rate || 'Undisclosed',
              }));
              setJobRequests(mapped);
            }
          } catch {
            // Non-fatal: fall back to initial mock data
          }
        } else {
          // Fallback: load from localStorage cache if no account id
          const storedJobs = localStorage.getItem(`cp_jobs_${parsed.email}`);
          if (storedJobs && !cancelled) {
            setJobRequests(JSON.parse(storedJobs));
          }
        }
      } catch {
        navigate('/client-portal/login', { replace: true });
      }
    };
    init();
    return () => { cancelled = true; };
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

  const handleJobFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateJobForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        client_account_id: session?.id ?? null,
        client:     session?.company || 'Unknown Client',
        title:      jobForm.title.trim(),
        type:       jobForm.type === 'Others' ? jobForm.typeOther.trim() : jobForm.type,
        total:      parseInt(jobForm.total, 10),
        location:   jobForm.location.trim(),
        deadline:   new Date(jobForm.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        priority:   jobForm.priority,
        rate:       jobForm.rate
          ? `₱${jobForm.rate}${jobForm.ratePeriod === 'daily' ? '/day' : '/mo'}`
          : null,
        description:  jobForm.description.trim(),
        requirements: jobForm.requirements.trim() || null,
        source:       'client_portal',
      };

      const res = await clientPortalService.createJobOrder(payload);
      const created = res.data;

      const newRequest = {
        id:         created.ref,
        position:   created.title,
        type:       created.type,
        total:      created.total,
        filled:     0,
        location:   created.location,
        requested:  new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        deadline:   created.deadline,
        status:     'In Review',
        statusClass:'client-portal-badge--review',
        recruiter:  'Unassigned',
        priority:   created.priority,
        rate:       created.rate || 'Undisclosed',
      };

      setJobRequests((prev) => [newRequest, ...prev]);
      setSubmitting(false);
      setSuccessBanner(`Job Order Request ${created.ref} has been submitted successfully and is now under review.`);
      setShowJobModal(false);
      setActiveTab('job-orders');
    } catch (err) {
      setSubmitting(false);
      const msg = err?.response?.data?.message || 'An error occurred while submitting your job order. Please try again.';
      setSuccessBanner('');
      setFormErrors((prev) => ({ ...prev, _api: msg }));
    }
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
      <ClientPortalTopbar />

      <div className="client-portal-main-container">
        <ClientPortalSidebar
          session={session}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          jobRequests={jobRequests}
          endorsedCandidates={endorsedCandidates}
          deployedRoster={deployedRoster}
          accountManager={MOCK_ACCOUNT_MANAGER}
          onLogout={handleLogout}
        />

        {/* MAIN CONTENT AREA */}
        <main className="client-portal-content-area">
          {/* SUCCESS TOAST */}
          <ClientPortalSuccessToast message={successBanner} onClose={() => setSuccessBanner('')} />

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
              <ClientPortalSummaryCards cards={summaryCards} />

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

                <ClientPortalDashboardSidebar
                  announcements={ANNOUNCEMENTS}
                  interviews={UPCOMING_INTERVIEWS}
                  deployedRoster={deployedRoster}
                  onRenewRosterContract={handleRenewRosterContract}
                />
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

              {formErrors._api && (
                <div className="cp-modal-api-error" role="alert">
                  {formErrors._api}
                </div>
              )}
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
