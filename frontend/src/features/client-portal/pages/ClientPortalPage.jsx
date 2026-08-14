import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import ClientPortalSidebar from '../components/ClientPortalSidebar';
import ClientPortalTopbar from '../components/ClientPortalTopbar';
import ClientPortalSuccessToast from '../components/ClientPortalSuccessToast';
import ClientPortalSummaryCards from '../components/ClientPortalSummaryCards';
import ClientPortalDashboardSidebar from '../components/ClientPortalDashboardSidebar';
import ClientPortalSettingsPage from './ClientPortalSettingsPage';
import ClientCandidateModal from '../components/ClientCandidateModal';
import ClientScheduleInterviewModal from '../components/ClientScheduleInterviewModal';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../../../utils/realtimeSync';
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
  const [endorsementSearch, setEndorsementSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [schedulingCandidate, setSchedulingCandidate] = useState(null);
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

  useEffect(() => {
    // 1. Initial Session Load
    const rawSession = localStorage.getItem('cp_session');
    if (rawSession) {
      try {
        setSession(JSON.parse(rawSession));
      } catch {
        /* ignore */
      }
    }

    // 2. Fetch candidates & synchronize endorsements
    fetch('http://localhost:8000/api/v1/recruitment/applications')
      .then((res) => (res.ok ? res.json() : []))
      .then((dbApps) => {
        if (dbApps && dbApps.length > 0) {
          const clientCandidates = dbApps
            .filter((a) => a.status === 'client_interview' || a.status === 'hr_requirements' || a.status === 're_pooling')
            .map((a) => {
              const cpStatus =
                a.status === 're_pooling' && (!a.clientEndorsementStatus || a.clientEndorsementStatus === 'Pending Review')
                  ? 'Declined'
                  : a.clientEndorsementStatus ||
                    localStorage.getItem(`cp_endorsement_${a.name}`) ||
                    localStorage.getItem(`cp_endorsement_cand-${a.id}`) ||
                    'Pending Review';

              return {
                id: `cand-${a.id}`,
                dbId: a.id,
                regId: a.regId,
                name: a.name,
                position: a.jobTitle || 'Operations Candidate',
                jobRef: a.jobId ? `PRF-2026-${String(a.jobId).padStart(4, '0')}` : 'PRF-2026-0081',
                matchScore: a.score || 88,
                experience: a.experience || '3 years relevant industry experience',
                skills: ['Technical Proficiency', 'Communications', 'Operations Protocol'],
                endorsedDate: a.applied || 'Aug 14, 2026',
                status: cpStatus,
                recruiter: 'M. Dela Cruz (Lead Recruiter)',
              };
            });

          if (clientCandidates.length > 0) {
            setEndorsedCandidates((prev) => {
              const existingMap = new Map(prev.map((c) => [c.name, c]));
              clientCandidates.forEach((c) => {
                existingMap.set(c.name, { ...(existingMap.get(c.name) || {}), ...c });
              });
              return Array.from(existingMap.values());
            });
          }
        }
      })
      .catch(() => {});

    // 3. Realtime Cross-Tab and Subsystem Synchronization
    const handleSync = (data) => {
      if (!data) return;

      if (data.type === 'ENDORSEMENT_STATUS_CHANGED' || (data.type === 'STAGE_CHANGED' && data.payload?.stage === 'client_interview')) {
        const { candidateId, dbId, regId, name, status, stage, applicant, candidate } = data.payload || {};
        const cleanCandId = candidateId ? String(candidateId).replace(/^cand-/, '') : '';
        const candName = name || applicant?.name || candidate?.name;
        const resolvedStatus = status || 'Pending Review';

        setEndorsedCandidates((prev) => {
          const index = prev.findIndex(
            (c) =>
              (dbId && String(c.dbId) === String(dbId)) ||
              (regId && c.regId && c.regId.toLowerCase() === regId.toLowerCase()) ||
              (candName && c.name && c.name.toLowerCase().trim() === candName.toLowerCase().trim()) ||
              (cleanCandId && (String(c.dbId) === cleanCandId || c.id === candidateId || c.id === `cand-${cleanCandId}`))
          );

          if (index !== -1) {
            const copy = [...prev];
            copy[index] = { ...copy[index], status: resolvedStatus };
            return copy;
          }

          // If new candidate endorsed to Client Portal (0ms instant addition)
          const newCand = candidate || {
            id: candidateId ? (String(candidateId).startsWith('cand-') ? candidateId : `cand-${candidateId}`) : `cand-${dbId || Date.now()}`,
            dbId: dbId || candidateId,
            regId: regId || applicant?.regId,
            name: candName || 'Candidate',
            position: applicant?.jobTitle || 'Operations Candidate',
            jobRef: applicant?.jobId ? `PRF-2026-${String(applicant.jobId).padStart(4, '0')}` : 'PRF-2026-0081',
            matchScore: applicant?.score || 88,
            experience: applicant?.experience || '3 years relevant industry experience',
            skills: ['Technical Proficiency', 'Communications', 'Operations Protocol'],
            endorsedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: resolvedStatus,
            recruiter: 'M. Dela Cruz (Lead Recruiter)',
          };

          return [newCand, ...prev];
        });

        setSelectedCandidate((prev) => {
          if (!prev) return prev;
          const matches =
            (dbId && String(prev.dbId) === String(dbId)) ||
            (regId && prev.regId && prev.regId.toLowerCase() === regId.toLowerCase()) ||
            (candName && prev.name && prev.name.toLowerCase().trim() === candName.toLowerCase().trim()) ||
            (cleanCandId && (String(prev.dbId) === cleanCandId || prev.id === candidateId || prev.id === `cand-${cleanCandId}`));
          return matches ? { ...prev, status: resolvedStatus } : prev;
        });
      } else if (data.type === 'STAGE_CHANGED') {
        const { candidateId, dbId, regId, name, stage } = data.payload || {};
        const cleanCandId = candidateId ? String(candidateId).replace(/^cand-/, '') : '';

        if (stage === 'pooling' || stage === 'area_manager') {
          setEndorsedCandidates((prev) =>
            prev.map((c) => {
              const matches =
                (dbId && String(c.dbId) === String(dbId)) ||
                (regId && c.regId && c.regId.toLowerCase() === regId.toLowerCase()) ||
                (name && c.name && c.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
                (cleanCandId && (String(c.dbId) === cleanCandId || c.id === candidateId || c.id === `cand-${cleanCandId}`));
              if (matches) {
                return { ...c, status: 'Pending Review' };
              }
              return c;
            })
          );
        }
      }
    };

    const unsub = subscribeRealtimeEvents(handleSync);
    return () => unsub();
  }, []);

  const handleEndorsementStatusChange = (candId, newStatus) => {
    const targetCand = endorsedCandidates.find((c) => c.id === candId || c.dbId === candId || c.regId === candId || c.name === candId);

    try {
      localStorage.setItem(`cp_endorsement_${candId}`, newStatus);
      if (targetCand?.id) localStorage.setItem(`cp_endorsement_${targetCand.id}`, newStatus);
      if (targetCand?.dbId) {
        localStorage.setItem(`cp_endorsement_cand-${targetCand.dbId}`, newStatus);
        localStorage.setItem(`cp_endorsement_${targetCand.dbId}`, newStatus);
      }
      if (targetCand?.regId) {
        localStorage.setItem(`cp_endorsement_cand-${targetCand.regId}`, newStatus);
        localStorage.setItem(`cp_endorsement_${targetCand.regId}`, newStatus);
      }
      if (targetCand?.name) {
        localStorage.setItem(`cp_endorsement_${targetCand.name}`, newStatus);
      }

      if (newStatus === 'Passed Interview') {
        const nextStage = 'hr_requirements';
        localStorage.setItem(`recruitment_stage_${candId}`, nextStage);
        if (targetCand?.id) localStorage.setItem(`recruitment_stage_${targetCand.id}`, nextStage);
        if (targetCand?.dbId) localStorage.setItem(`recruitment_stage_${targetCand.dbId}`, nextStage);
        if (targetCand?.regId) localStorage.setItem(`recruitment_stage_${targetCand.regId}`, nextStage);
        if (targetCand?.name) localStorage.setItem(`recruitment_stage_${targetCand.name}`, nextStage);
      } else if (newStatus === 'Declined') {
        const nextStage = 're_pooling';
        localStorage.setItem(`recruitment_stage_${candId}`, nextStage);
        if (targetCand?.id) localStorage.setItem(`recruitment_stage_${targetCand.id}`, nextStage);
        if (targetCand?.dbId) localStorage.setItem(`recruitment_stage_${targetCand.dbId}`, nextStage);
        if (targetCand?.regId) localStorage.setItem(`recruitment_stage_${targetCand.regId}`, nextStage);
        if (targetCand?.name) localStorage.setItem(`recruitment_stage_${targetCand.name}`, nextStage);
      }

      // Also update recruitment cached applications in localStorage
      const cachedRec = localStorage.getItem('ismers_recruitment_applications');
      if (cachedRec) {
        try {
          const parsed = JSON.parse(cachedRec);
          const updated = parsed.map((a) => {
            const isMatch =
              a.id === candId ||
              a.regId === candId ||
              a.name === candId ||
              (targetCand?.dbId && a.id === `cand-${targetCand.dbId}`) ||
              (targetCand?.regId && a.regId === targetCand.regId) ||
              (targetCand?.name && a.name === targetCand.name);
            if (isMatch) {
              return {
                ...a,
                clientEndorsementStatus: newStatus,
                status: newStatus === 'Passed Interview' ? 'hr_requirements' : newStatus === 'Declined' ? 're_pooling' : a.status,
              };
            }
            return a;
          });
          localStorage.setItem('ismers_recruitment_applications', JSON.stringify(updated));
        } catch (e) {
          console.warn('Could not update cached recruitment applications:', e);
        }
      }
    } catch (err) {
      console.warn('Could not save endorsement status locally:', err);
    }

    setEndorsedCandidates((prev) =>
      prev.map((c) =>
        c.id === candId || c.dbId === candId || c.regId === candId || c.name === candId
          ? { ...c, status: newStatus }
          : c
      )
    );

    setSelectedCandidate((prev) =>
      prev && (prev.id === candId || prev.dbId === candId || prev.regId === candId || prev.name === candId)
        ? { ...prev, status: newStatus }
        : prev
    );

    // 0ms instant broadcast across all tabs and windows
    broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
      candidateId: candId,
      dbId: targetCand?.dbId,
      regId: targetCand?.regId,
      name: targetCand?.name,
      status: newStatus,
      stage: newStatus === 'Passed Interview' ? 'hr_requirements' : newStatus === 'Declined' ? 're_pooling' : undefined,
    });

    const lookupKey = targetCand?.name || targetCand?.regId || targetCand?.dbId || String(candId).replace(/^cand-/, '');
    fetch(`http://localhost:8000/api/v1/applicants/${encodeURIComponent(lookupKey)}/client-endorsement-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ 
        client_endorsement_status: newStatus,
        stage: newStatus === 'Passed Interview' ? 'hr_requirements' : newStatus === 'Declined' ? 're_pooling' : undefined
      }),
    }).catch((err) => {
      console.warn('Could not sync endorsement status to backend:', err);
    });

    if (newStatus === 'Passed Interview') {
      setSuccessBanner('Candidate passed final interview! Recruiter notified to initiate HR requirements & deployment.');
    } else if (newStatus === 'Accepted for Interview') {
      setSuccessBanner('Candidate accepted for client interview. Notification dispatched to recruiter.');
    } else if (newStatus === 'Declined') {
      setSuccessBanner('Candidate declined. Profile automatically returned to Re-Pooling for line up to other clients.');
    } else {
      setSuccessBanner(`Candidate endorsement status updated to ${newStatus}.`);
    }
  };

  const handlePassCandidate = (candId) => {
    handleEndorsementStatusChange(candId, 'Passed Interview');
  };

  const handleAcceptCandidate = (candId) => {
    const targetCand = endorsedCandidates.find((c) => c.id === candId || c.dbId === candId || c.regId === candId || c.name === candId);
    setSchedulingCandidate(targetCand || { id: candId, name: candId, position: 'Candidate', jobRef: 'PRF-2026' });
  };

  const handleConfirmInterviewSchedule = (candId, scheduleData) => {
    const targetCand = endorsedCandidates.find((c) => c.id === candId || c.dbId === candId || c.regId === candId || c.name === candId);

    try {
      localStorage.setItem(`cp_endorsement_${candId}`, 'Accepted for Interview');
      localStorage.setItem(`cp_interview_${candId}`, JSON.stringify(scheduleData));
      if (targetCand?.id) {
        localStorage.setItem(`cp_endorsement_${targetCand.id}`, 'Accepted for Interview');
        localStorage.setItem(`cp_interview_${targetCand.id}`, JSON.stringify(scheduleData));
      }
      if (targetCand?.dbId) {
        localStorage.setItem(`cp_endorsement_cand-${targetCand.dbId}`, 'Accepted for Interview');
        localStorage.setItem(`cp_endorsement_${targetCand.dbId}`, 'Accepted for Interview');
        localStorage.setItem(`cp_interview_${targetCand.dbId}`, JSON.stringify(scheduleData));
      }
      if (targetCand?.regId) {
        localStorage.setItem(`cp_endorsement_cand-${targetCand.regId}`, 'Accepted for Interview');
        localStorage.setItem(`cp_endorsement_${targetCand.regId}`, 'Accepted for Interview');
        localStorage.setItem(`cp_interview_${targetCand.regId}`, JSON.stringify(scheduleData));
      }
      if (targetCand?.name) {
        localStorage.setItem(`cp_endorsement_${targetCand.name}`, 'Accepted for Interview');
        localStorage.setItem(`cp_interview_${targetCand.name}`, JSON.stringify(scheduleData));
      }

      // Also update recruitment cached applications in localStorage
      const cachedRec = localStorage.getItem('ismers_recruitment_apps');
      if (cachedRec) {
        const parsed = JSON.parse(cachedRec);
        const updated = parsed.map((a) => {
          if (
            (targetCand?.dbId && String(a.id) === String(targetCand.dbId)) ||
            (targetCand?.regId && a.regId === targetCand.regId) ||
            (targetCand?.name && a.name === targetCand.name) ||
            String(a.id) === String(candId) ||
            a.name === candId
          ) {
            return { ...a, clientEndorsementStatus: 'Accepted for Interview', interview: scheduleData };
          }
          return a;
        });
        localStorage.setItem('ismers_recruitment_apps', JSON.stringify(updated));
      }
    } catch {
      // ignore
    }

    setEndorsedCandidates((prev) =>
      prev.map((c) => (c.id === candId ? { ...c, status: 'Accepted for Interview', interview: scheduleData } : c))
    );

    setSelectedCandidate((prev) =>
      prev && (prev.id === candId || prev.dbId === candId || prev.regId === candId || prev.name === candId)
        ? { ...prev, status: 'Accepted for Interview', interview: scheduleData }
        : prev
    );

    // 0ms instant broadcast across all tabs and windows
    broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
      candidateId: candId,
      dbId: targetCand?.dbId,
      regId: targetCand?.regId,
      name: targetCand?.name,
      status: 'Accepted for Interview',
      interview: scheduleData,
    });

    const lookupKey = targetCand?.name || targetCand?.regId || targetCand?.dbId || String(candId).replace(/^cand-/, '');
    fetch(`http://localhost:8000/api/v1/applicants/${encodeURIComponent(lookupKey)}/client-endorsement-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_endorsement_status: 'Accepted for Interview',
        interview_schedule: scheduleData,
      }),
    }).catch((err) => {
      console.warn('Could not sync endorsement status to backend:', err);
    });

    setSchedulingCandidate(null);
    setSuccessBanner(`Interview scheduled with ${targetCand?.name || 'candidate'} on ${scheduleData.date} at ${scheduleData.time} via ${scheduleData.mode}. Automated invites dispatched.`);
  };

  const handleDeclineCandidate = (candId) => {
    handleEndorsementStatusChange(candId, 'Declined');
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
          const storedJobs = localStorage.getItem(`cp_jobs_${parsed?.email}`);
          if (storedJobs && !cancelled) {
            setJobRequests(JSON.parse(storedJobs));
          }
        }

        // Load dynamic candidate endorsements from recruitment
        try {
          const recRes = await fetch('http://localhost:8000/api/v1/recruitment/applications');
          if (recRes.ok) {
            const apps = await recRes.json();
            const endorsedStages = ['client_interview', 'hr_requirements', 'contract_signing', 'for_deployment', 'hired'];
            const dynamicEndorsed = apps
              .filter((a) => endorsedStages.includes(a.status))
              .map((a) => {
                const skillsArr = Array.isArray(a.skills) && a.skills.length > 0
                  ? a.skills.map((s) => (typeof s === 'string' ? s : s.name))
                  : ['BOSH Certified', 'PPE Compliance', 'Hazard Inspection', 'OSHS'];
                return {
                  id: `cand-${a.id || a.regId}`,
                  dbId: a.id,
                  regId: a.regId,
                  name: a.name,
                  position: a.jobTitle || 'Safety Officer',
                  jobRef: a.jobId ? `PRF-2026-${String(a.jobId).replace('jo', '00')}` : 'PRF-2026-0035',
                  matchScore: a.score || 80,
                  experience: a.experience || '4 years accredited safety officer in construction site projects',
                  skills: skillsArr,
                  workHistory: a.workHistory || [],
                  education: a.education || [],
                  documents: a.documents || [],
                  breakdown: a.breakdown || null,
                  phone: a.phone || null,
                  email: a.email || null,
                  endorsedDate: a.applied || 'Aug 14, 2026',
                  status: (a.clientEndorsementStatus && a.clientEndorsementStatus !== 'Pending Review')
                    ? a.clientEndorsementStatus
                    : (localStorage.getItem(`cp_endorsement_${a.name}`) ||
                       localStorage.getItem(`cp_endorsement_cand-${a.id}`) ||
                       localStorage.getItem(`cp_endorsement_cand-${a.regId}`) ||
                       localStorage.getItem(`cp_endorsement_${a.id}`) ||
                       localStorage.getItem(`cp_endorsement_${a.regId}`) ||
                       a.clientEndorsementStatus ||
                       'Pending Review'),
                  recruiter: a.assignedManager || 'PRIMEPOWER Recruitment',
                  client: a.client,
                };
              });

            if (!cancelled && dynamicEndorsed.length > 0) {
              setEndorsedCandidates(() => {
                const combined = [...dynamicEndorsed];
                MOCK_ENDORSED_CANDIDATES.forEach((m) => {
                  if (!combined.some((c) => c.name === m.name)) {
                    combined.push(m);
                  }
                });
                return combined;
              });
            }
          }
        } catch {
          // Fallback to initial mock data
        }
      } catch {
        navigate('/client-portal/login', { replace: true });
      }
    };
    init();

    const handleSyncEvent = (evt) => {
      const data = evt.data || evt.detail;
      if (!data) return;

      if (data.type === 'CANDIDATE_ENDORSED' || data.type === 'STAGE_CHANGED') {
        const { applicant } = data.payload || {};
        if (applicant) {
          setEndorsedCandidates((prev) => {
            if (prev.some((c) => c.name === applicant.name || (applicant.id && c.dbId === applicant.id))) {
              return prev.map((c) => {
                if (c.name === applicant.name || (applicant.id && c.dbId === applicant.id)) {
                  return { ...c, status: applicant.clientEndorsementStatus || c.status };
                }
                return c;
              });
            }
            const skillsArr = Array.isArray(applicant.skills) && applicant.skills.length > 0
              ? applicant.skills.map((s) => (typeof s === 'string' ? s : s.name))
              : ['BOSH Certified', 'PPE Compliance', 'Hazard Inspection', 'OSHS'];
            return [
              {
                id: `cand-${applicant.id || applicant.regId || Date.now()}`,
                dbId: applicant.id,
                regId: applicant.regId,
                name: applicant.name,
                position: applicant.jobTitle || 'Safety Officer',
                jobRef: applicant.jobId ? `PRF-2026-${String(applicant.jobId).replace('jo', '00')}` : 'PRF-2026-0035',
                matchScore: applicant.score || 80,
                experience: applicant.experience || '4 years accredited safety officer in construction site projects',
                skills: skillsArr,
                endorsedDate: applicant.applied || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                status: applicant.clientEndorsementStatus || 'Pending Review',
                recruiter: applicant.assignedManager || 'PRIMEPOWER Recruitment',
                client: applicant.client,
              },
              ...prev,
            ];
          });
        }
      }
    };

    const unsubscribe = subscribeRealtimeEvents(handleSyncEvent);

    return () => {
      cancelled = true;
      unsubscribe();
    };
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
          endorsementFilter={endorsementFilter}
          setEndorsementFilter={setEndorsementFilter}
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
                <div className="client-portal-search-wrap">
                  <svg className="icon" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="client-portal-search-input"
                    placeholder="Search endorsed candidates by name, position, or ref ID..."
                    value={endorsementSearch}
                    onChange={(e) => setEndorsementSearch(e.target.value)}
                  />
                </div>
                <div className="client-portal-dropdown-filter-wrap">
                  <label htmlFor="cp-endorsement-stage-filter" className="client-portal-filter-label">Endorsement Stage:</label>
                  <select
                    id="cp-endorsement-stage-filter"
                    className="client-portal-filter-select"
                    value={endorsementFilter}
                    onChange={(e) => setEndorsementFilter(e.target.value)}
                  >
                    <option value="ALL">All Stages ({endorsedCandidates.length})</option>
                    <option value="Pending Review">Pending Review ({endorsedCandidates.filter((c) => c.status === 'Pending Review').length})</option>
                    <option value="Accepted for Interview">Accepted for Interview ({endorsedCandidates.filter((c) => c.status === 'Accepted for Interview').length})</option>
                    <option value="Passed Interview">Passed Interview ({endorsedCandidates.filter((c) => c.status === 'Passed Interview' || c.status === 'Passed Client Interview' || c.status === 'Hired').length})</option>
                    <option value="Declined">Declined ({endorsedCandidates.filter((c) => c.status === 'Declined').length})</option>
                  </select>
                </div>
              </div>

              <div className="client-portal-endorsement-grid">
                {endorsedCandidates
                  .filter((c) => {
                    const matchesStatus = endorsementFilter === 'ALL' || c.status === endorsementFilter;
                    const q = endorsementSearch.trim().toLowerCase();
                    if (!q) return matchesStatus;
                    const matchesSearch =
                      (c.name && c.name.toLowerCase().includes(q)) ||
                      (c.position && c.position.toLowerCase().includes(q)) ||
                      (c.jobRef && c.jobRef.toLowerCase().includes(q)) ||
                      (c.skills && c.skills.some((sk) => sk.toLowerCase().includes(q)));
                    return matchesStatus && matchesSearch;
                  })
                  .map((cand) => (
                    <div
                      key={cand.id}
                      className="client-portal-card cp-endorsement-card"
                      onClick={() => setSelectedCandidate(cand)}
                      title="Click to view full AI Profile & validated credentials"
                    >
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
                          <span className={`client-portal-badge ${
                            cand.status === 'Accepted for Interview'
                              ? 'client-portal-badge--filled'
                              : cand.status === 'Declined'
                              ? 'cp-badge--declined'
                              : 'client-portal-badge--review'
                          }`}>
                            {cand.status}
                          </span>
                        </div>
                      </div>

                      <div className="cp-endorsement-card-footer" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="cp-card-review-btn"
                          onClick={() => setSelectedCandidate(cand)}
                        >
                          <span>Review Full AI Profile &amp; Credentials</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </button>

                        <div className="cp-endorsement-actions-row">
                          {cand.status === 'Pending Review' && (
                            <>
                              <button
                                type="button"
                                className="cp-btn-decline"
                                onClick={() => handleDeclineCandidate(cand.id)}
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                className="client-portal-btn-primary cp-btn-accept"
                                onClick={() => handleAcceptCandidate(cand.id)}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                  <line x1="16" y1="2" x2="16" y2="6" />
                                  <line x1="8" y1="2" x2="8" y2="6" />
                                </svg>
                                Accept &amp; Schedule
                              </button>
                            </>
                          )}
                          {cand.status === 'Accepted for Interview' && (
                            <>
                              <button
                                type="button"
                                className="cp-btn-decline"
                                onClick={() => handleDeclineCandidate(cand.id)}
                              >
                                Decline
                              </button>
                              <button
                                type="button"
                                className="cp-btn-reschedule"
                                onClick={() => handleAcceptCandidate(cand.id)}
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                className="client-portal-btn-primary cp-btn-pass"
                                onClick={() => handlePassCandidate(cand.id)}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Pass Candidate
                              </button>
                            </>
                          )}
                          {(cand.status === 'Passed Interview' || cand.status === 'Passed Client Interview' || cand.status === 'Hired') && (
                            <div className="cp-passed-pill" style={{ width: '100%', justifyContent: 'center' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', color: 'var(--green, #149e6e)' }}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>Passed Client Final Interview &middot; Approved</span>
                            </div>
                          )}
                          {cand.status === 'Declined' && (
                            <button
                              type="button"
                              className="client-portal-btn-primary cp-btn-accept"
                              style={{ width: '100%', justifyContent: 'center' }}
                              onClick={() => handleAcceptCandidate(cand.id)}
                            >
                              Reopen &amp; Schedule Interview
                            </button>
                          )}
                        </div>
                      </div>
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

      {/* ── CANDIDATE PROFILE & AI MATCH DOSSIER MODAL ── */}
      {selectedCandidate && (
        <ClientCandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onAccept={(candId) => handleAcceptCandidate(candId)}
          onDecline={(candId) => handleDeclineCandidate(candId)}
          onPass={(candId) => handlePassCandidate(candId)}
          onReschedule={(candId) => handleAcceptCandidate(candId)}
          onStatusChange={(candId, newStatus) => handleEndorsementStatusChange(candId, newStatus)}
        />
      )}

      {/* ── AUTOMATIC INTERVIEW SCHEDULER MODAL ── */}
      {schedulingCandidate && (
        <ClientScheduleInterviewModal
          candidate={schedulingCandidate}
          onClose={() => setSchedulingCandidate(null)}
          onConfirm={(scheduleData) => handleConfirmInterviewSchedule(schedulingCandidate.id, scheduleData)}
        />
      )}
    </div>
  );
}
