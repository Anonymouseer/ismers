import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/apiClient';
import { clientPortalService } from '../services/ClientPortalService';
import ClientPortalSidebar from '../components/ClientPortalSidebar';
import ClientPortalTopbar from '../components/ClientPortalTopbar';
import ClientPortalSuccessToast from '../components/ClientPortalSuccessToast';
import ClientPortalSummaryCards from '../components/ClientPortalSummaryCards';
import ClientPortalDashboardSidebar from '../components/ClientPortalDashboardSidebar';
import ClientPortalSettingsPage from './ClientPortalSettingsPage';
import ClientCandidateModal from '../components/ClientCandidateModal';
import ClientScheduleInterviewModal from '../components/ClientScheduleInterviewModal';
import ClientFeedbackPage from '../components/ClientFeedbackPage';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../../../utils/realtimeSync';
import { CLIENTS } from '../../client-management/data/mockClients';
import { mergeClientsWithDeployments } from '../../client-management/store/ClientManagementStore';
import { getDeployments } from '../../deployment-assignment/services/DeploymentAssignmentService';
import { getCachedApplications, saveCachedApplications, getStoredStages, saveStoredStage } from '../../recruitment-selection/services/RecruitmentSelectionService';
import { targetById, computeMatchScore } from '../../applicant-registration/services/ApplicantRegistrationService';
import './ClientPortalPage.css';

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

function getStoredDeployments() {
  let list = [];
  if (typeof window !== 'undefined') {
    try {
      for (const key of ['ismers.deployments.v7', 'ismers.deployments.v6']) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
            break;
          }
        }
      }
    } catch { }
  }
  if (!list.length) list = getDeployments();
  return list;
}

export function getInitialClientData(currentSession) {
  let sess = currentSession;
  if (!sess && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('cp_session');
      if (raw) sess = JSON.parse(raw);
    } catch {
      sess = null;
    }
  }

  // No authenticated client session — return empty data to prevent
  // unauthenticated data exposure via mock fallback.
  if (!sess || (!sess.company && !sess.email && !sess.id)) {
    return { jobs: [], roster: [], client: null, allClients: [] };
  }

  const clientCompName = sess?.company?.trim() || '';
  const clientEmail = sess?.email?.trim() || '';

  const deployments = getStoredDeployments();
  const liveClients = mergeClientsWithDeployments(CLIENTS, deployments);

  const matchedCm = liveClients.find(
    (c) =>
      (clientCompName && c.name.toLowerCase() === clientCompName.toLowerCase()) ||
      (clientEmail && c.email && c.email.toLowerCase() === clientEmail.toLowerCase())
  ) || liveClients[0];

  const jobs = (matchedCm.jobs || []).map((j, idx) => {
    const isFilled = (j.filled || 0) >= (j.total || 1);
    const isReview = j.status === 'review' || j.stage === 'review' || j.badge === 'review' || j.status === 'In Review';
    const isFilling = !isReview && (j.badge === 'filling' || (j.filled > 0 && !isFilled));
    const isUrgent = !isReview && j.badge === 'urgent';
    const status = isReview ? 'In Review' : (isFilled ? 'Filled' : (isUrgent || isFilling) ? 'Active' : 'Open');
    const statusClass = isReview ? 'client-portal-badge--review' : (isFilled ? 'client-portal-badge--filled' : (isUrgent || isFilling) ? 'client-portal-badge--active' : 'client-portal-badge--open');

    return {
      id: j.ref || `PRF-2026-${String(idx + 1).padStart(4, '0')}`,
      ref: j.ref || `PRF-2026-${String(idx + 1).padStart(4, '0')}`,
      position: j.title,
      type: j.type?.split('·')[0]?.trim() || 'Full-time',
      total: j.total,
      filled: j.filled || 0,
      location: j.location || matchedCm.address || 'Metro Manila',
      requested: 'Jul 15, 2026',
      deadline: j.deadline || 'Aug 30, 2026',
      status,
      statusClass,
      recruiter: isReview ? 'Unassigned' : matchedCm.am,
      priority: isUrgent ? 'urgent' : isFilling ? 'high' : 'normal',
      rate: j.rate || matchedCm.rate || '₱22,000 / mo',
    };
  });

  // Ensure any custom PRFs for this client are included in jobs
  let cpJobOrders = [];
  try {
    const raw = localStorage.getItem('ismers_client_job_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) cpJobOrders = parsed;
    }
  } catch { }

  const normalizedClientName = (matchedCm.name || clientCompName || '').trim().toLowerCase();

  cpJobOrders.forEach((cpJob) => {
    const cpClient = (cpJob.client || cpJob.company || '').trim().toLowerCase();
    if (!cpClient) return;
    const isForClient =
      cpClient === normalizedClientName ||
      cpClient.includes(normalizedClientName) ||
      normalizedClientName.includes(cpClient);
    if (!isForClient) return;

    const cpRef = cpJob.ref || cpJob.id;
    const alreadyIncluded = jobs.some(
      (j) =>
        (cpRef && (j.id === cpRef || j.ref === cpRef)) ||
        (j.position && j.position.toLowerCase() === (cpJob.title || cpJob.position || '').toLowerCase())
    );

    if (!alreadyIncluded && (cpJob.title || cpJob.position)) {
      const isApproved =
        cpJob.status === 'open' ||
        cpJob.stage === 'activated' ||
        cpJob.status === 'filling' ||
        cpJob.status === 'filled';
      const status = isApproved ? (cpJob.status || 'Active') : 'In Review';
      const statusClass = isApproved ? 'client-portal-badge--active' : 'client-portal-badge--review';

      jobs.push({
        id: cpRef || `PRF-2026-${String(jobs.length + 1).padStart(4, '0')}`,
        ref: cpRef || `PRF-2026-${String(jobs.length + 1).padStart(4, '0')}`,
        position: cpJob.title || cpJob.position,
        type: cpJob.type || 'Full-time',
        total: cpJob.total || 1,
        filled: cpJob.filled || 0,
        location: cpJob.location || matchedCm.address || 'Metro Manila',
        requested: cpJob.requested || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        deadline: cpJob.deadline || 'Aug 30, 2026',
        status,
        statusClass,
        recruiter: isApproved ? (cpJob.recruiter || matchedCm.am) : 'Unassigned',
        priority: cpJob.priority || 'normal',
        rate: cpJob.rate || matchedCm.rate || '₱22,000 / mo',
      });
    }
  });

  const rosterItems = [];
  (matchedCm.jobs || []).forEach((j, jIdx) => {
    (j.applicants || []).filter((a) => a.status === 'hired').forEach((a, aIdx) => {
      rosterItems.push({
        id: `dep-${matchedCm.name.slice(0, 3).toLowerCase()}-${jIdx + 1}-${aIdx + 1}`,
        employeeName: a.name,
        position: j.title,
        site: j.location || matchedCm.address || 'Client Facility',
        startDate: a.applied || 'Jul 01, 2026',
        expiryDate: matchedCm.renewal || 'Jan 15, 2027',
        status: 'Active',
        contractType: j.type || 'Full-time · Contractual',
      });
    });
  });

  return { jobs, roster: rosterItems, client: matchedCm, allClients: liveClients };
}

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

const AM_DIRECTORY = {
  'Karla Reyes': {
    name: 'Karla Reyes',
    title: 'Senior Account Manager (Industrial & Logistics)',
    branch: 'PRIMEPOWER Head Office (QC)',
    email: 'k.reyes@primepower.ph',
    phone: '+63 917 888 4321',
    officeLine: '(02) 8923-4567 ext. 104',
  },
  'Dennis Ocampo': {
    name: 'Dennis Ocampo',
    title: 'Senior Account Manager (Corporate & Services)',
    branch: 'PRIMEPOWER Makati Operations Center',
    email: 'd.ocampo@primepower.ph',
    phone: '+63 918 777 5432',
    officeLine: '(02) 8923-4567 ext. 108',
  },
  'Jasmine Uy': {
    name: 'Jasmine Uy',
    title: 'Client Relations Officer',
    branch: 'PRIMEPOWER Ortigas Branch',
    email: 'j.uy@primepower.ph',
    phone: '+63 919 666 3210',
    officeLine: '(02) 8923-4567 ext. 112',
  },
};

const MOCK_ACCOUNT_MANAGER = AM_DIRECTORY['Karla Reyes'];

export function resolveAccountManager(amName) {
  if (!amName) return MOCK_ACCOUNT_MANAGER;
  return AM_DIRECTORY[amName] || {
    name: amName,
    title: 'Senior Account Manager',
    branch: 'PRIMEPOWER Head Office (QC)',
    email: `${amName.toLowerCase().replace(/[^a-z]/g, '.')}@primepower.ph`,
    phone: '+63 917 888 4321',
    officeLine: '(02) 8923-4567 ext. 100',
  };
}

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contractual', 'Project-based', 'Others'];
const PRIORITIES = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High Priority' },
  { value: 'urgent', label: 'Urgent / Critical' },
];

export default function ClientPortalPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cp_session') : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'job-orders' | 'endorsements' | 'deployed-roster' | 'settings'
  const [showJobModal, setShowJobModal] = useState(false);

  const [jobRequests, setJobRequests] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cp_session') : null;
      const s = raw ? JSON.parse(raw) : null;
      return getInitialClientData(s).jobs;
    } catch {
      return getInitialClientData(null).jobs;
    }
  });

  const [endorsedCandidates, setEndorsedCandidates] = useState([]);
  const [deployedRoster, setDeployedRoster] = useState(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cp_session') : null;
      const s = raw ? JSON.parse(raw) : null;
      return getInitialClientData(s).roster;
    } catch {
      return getInitialClientData(null).roster;
    }
  });
  const [endorsementFilter, setEndorsementFilter] = useState('ALL');
  const [endorsementSearch, setEndorsementSearch] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [schedulingCandidate, setSchedulingCandidate] = useState(null);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [successBanner, setSuccessBanner] = useState('');

  // Auto-dismiss notification banner
  useEffect(() => {
    if (!successBanner) return;
    const timer = setTimeout(() => setSuccessBanner(''), 6000);
    return () => clearTimeout(timer);
  }, [successBanner]);

  // ── NOTIFICATION STATE ──────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState(() => {
    // Seed with system announcements
    return ANNOUNCEMENTS.map((ann) => ({
      id: ann.id,
      type: 'announcement',
      title: ann.title,
      body: ann.body,
      time: ann.date,
      read: false,
    }));
  });

  const handleMarkNotifRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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

      let nextStage = null;
      if (newStatus === 'Passed Interview') {
        nextStage = 'hr_requirements';
      } else if (newStatus === 'Declined') {
        nextStage = 're_pooling';
      }

      if (nextStage) {
        saveStoredStage(candId, nextStage);
        if (targetCand?.id) saveStoredStage(targetCand.id, nextStage);
        if (targetCand?.dbId) saveStoredStage(targetCand.dbId, nextStage);
        if (targetCand?.regId) saveStoredStage(targetCand.regId, nextStage);
        if (targetCand?.name) saveStoredStage(targetCand.name, nextStage);
      }

      // Also update recruitment cached applications in localStorage
      const cached = getCachedApplications();
      if (cached && Array.isArray(cached)) {
        const updated = cached.map((a) => {
          const isMatch =
            String(a.id) === String(candId) ||
            a.regId === candId ||
            a.name === candId ||
            (targetCand?.dbId && (String(a.id) === String(targetCand.dbId) || a.id === `cand-${targetCand.dbId}`)) ||
            (targetCand?.regId && a.regId === targetCand.regId) ||
            (targetCand?.name && a.name === targetCand.name);
          if (isMatch) {
            return {
              ...a,
              clientEndorsementStatus: newStatus,
              status: nextStage || a.status,
            };
          }
          return a;
        });
        saveCachedApplications(updated);
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
    const clientName = session?.company || company?.name || 'Client Partner';
    broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
      candidateId: candId,
      dbId: targetCand?.dbId,
      regId: targetCand?.regId,
      name: targetCand?.name,
      client: clientName,
      status: newStatus,
      stage: newStatus === 'Passed Interview' ? 'hr_requirements' : newStatus === 'Declined' ? 're_pooling' : undefined,
    });

    try {
      const feedKey = 'ismers_notifications_feed_v1';
      const rawFeed = localStorage.getItem(feedKey);
      const feed = rawFeed ? JSON.parse(rawFeed) : [];
      let notifTitle = `Client Endorsement: ${newStatus}`;
      let notifMsg = `${clientName} updated ${targetCand?.name || 'candidate'} endorsement to "${newStatus}".`;
      let notifType = 'info';

      if (newStatus === 'Passed Interview') {
        notifTitle = 'Client Interview Passed';
        notifMsg = `${clientName} passed ${targetCand?.name || 'candidate'} for pre-employment requirements clearance.`;
        notifType = 'success';
      } else if (newStatus === 'Declined') {
        notifTitle = 'Client Candidate Declined';
        notifMsg = `${clientName} declined ${targetCand?.name || 'candidate'} for reassignment to pooling.`;
        notifType = 'warning';
      }

      const notifItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        module: 'Client Portal',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
        timestamp: Date.now(),
        read: false,
      };
      localStorage.setItem(feedKey, JSON.stringify([notifItem, ...(Array.isArray(feed) ? feed : []).slice(0, 49)]));
    } catch {
      // ignore
    }

    const lookupKey = targetCand?.name || targetCand?.regId || targetCand?.dbId || String(candId).replace(/^cand-/, '');
    api.patch(`/applicants/${encodeURIComponent(lookupKey)}/client-endorsement-status`, {
      client_endorsement_status: newStatus,
      stage: newStatus === 'Passed Interview' ? 'hr_requirements' : newStatus === 'Declined' ? 're_pooling' : undefined
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

    // Push a live notification for endorsement status changes
    setNotifications((prev) => [{
      id: `endorse-${candId}-${Date.now()}`,
      type: 'endorsement',
      title: `Endorsement Updated: ${newStatus}`,
      body: `Status for ${targetCand?.name || 'candidate'} has been updated to "${newStatus}".`,
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      read: false,
    }, ...prev]);
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
      const cachedRec = getCachedApplications();
      if (cachedRec && Array.isArray(cachedRec)) {
        const updated = cachedRec.map((a) => {
          if (
            (targetCand?.dbId && (String(a.id) === String(targetCand.dbId) || a.id === `cand-${targetCand.dbId}`)) ||
            (targetCand?.regId && a.regId === targetCand.regId) ||
            (targetCand?.name && a.name === targetCand.name) ||
            String(a.id) === String(candId) ||
            a.name === candId
          ) {
            return { ...a, clientEndorsementStatus: 'Accepted for Interview', interview: scheduleData };
          }
          return a;
        });
        saveCachedApplications(updated);
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
    const clientName = session?.company || company?.name || 'Client Partner';
    broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
      candidateId: candId,
      dbId: targetCand?.dbId,
      regId: targetCand?.regId,
      name: targetCand?.name,
      client: clientName,
      status: 'Accepted for Interview',
      interview: scheduleData,
    });

    // Also persist into notification feed in localStorage for immediate reflection in the bell
    try {
      const feedKey = 'ismers_notifications_feed_v1';
      const rawFeed = localStorage.getItem(feedKey);
      const feed = rawFeed ? JSON.parse(rawFeed) : [];
      const notifItem = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: 'Client Interview Scheduled',
        message: `${clientName} accepted endorsement & scheduled interview for ${targetCand?.name || 'Candidate'} on ${scheduleData.date} at ${scheduleData.time} (${scheduleData.mode || 'Virtual'}).`,
        type: 'success',
        module: 'Client Portal',
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
        timestamp: Date.now(),
        read: false,
      };
      localStorage.setItem(feedKey, JSON.stringify([notifItem, ...(Array.isArray(feed) ? feed : []).slice(0, 49)]));
    } catch {
      // ignore
    }

    const lookupKey = targetCand?.name || targetCand?.regId || targetCand?.dbId || String(candId).replace(/^cand-/, '');
    api.patch(`/applicants/${encodeURIComponent(lookupKey)}/client-endorsement-status`, {
      client_endorsement_status: 'Accepted for Interview',
      interview_schedule: scheduleData,
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


  // Auth guard — redirect to login if no active session & load company-specific data
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

        // Purge test entry for Technical Support Specialist
        try {
          const rawCp = localStorage.getItem('ismers_client_job_orders');
          if (rawCp) {
            const parsedCp = JSON.parse(rawCp);
            if (Array.isArray(parsedCp)) {
              const cleaned = parsedCp.filter(
                (j) => !/technical support specialist/i.test(j.title || j.position || '')
              );
              localStorage.setItem('ismers_client_job_orders', JSON.stringify(cleaned));
            }
          }
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('cp_jobs_')) {
              const rawScoped = localStorage.getItem(k);
              if (rawScoped) {
                const parsedScoped = JSON.parse(rawScoped);
                if (Array.isArray(parsedScoped)) {
                  const cleaned = parsedScoped.filter(
                    (j) => !/technical support specialist/i.test(j.title || j.position || '')
                  );
                  localStorage.setItem(k, JSON.stringify(cleaned));
                }
              }
            }
          }
        } catch { }

        // Look up corresponding live Client Management profile
        const { jobs: liveJobs, roster: liveRoster, client: matchedCm } = getInitialClientData(parsed);

        // 1. Load Job Orders: merge live Client Management jobs with backend API job orders
        let apiJobs = [];
        if (parsed?.id) {
          try {
            const res = await clientPortalService.getJobOrders(parsed.id);
            if (!cancelled && res?.data?.length) {
              apiJobs = res.data.map((j) => {
                const isReview = j.status === 'review' || j.stage === 'review' || j.status === 'In Review';
                const isFilled = j.status === 'filled' || (j.filled || 0) >= (j.total || 1);
                const isUrgent = j.status === 'urgent';
                const isFilling = j.status === 'filling' || (j.filled > 0 && !isFilled);
                const status = isReview ? 'In Review' : (isFilled ? 'Filled' : (isUrgent || isFilling) ? 'Active' : 'Open');
                const statusClass = isReview ? 'client-portal-badge--review' : (isFilled ? 'client-portal-badge--filled' : (isUrgent || isFilling) ? 'client-portal-badge--active' : 'client-portal-badge--open');

                return {
                  id: j.ref || `JO-${j.id}`,
                  ref: j.ref || `JO-${j.id}`,
                  position: j.title,
                  type: j.type || 'Full-time',
                  total: j.total,
                  filled: j.filled || 0,
                  location: j.location || matchedCm?.address || 'Metro Manila',
                  requested: j.createdAt
                    ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                    : new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                  deadline: j.deadline,
                  status,
                  statusClass,
                  recruiter: isReview ? 'Unassigned' : (j.recruiter || matchedCm?.am || 'PRIMEPOWER Recruitment'),
                  priority: j.priority || 'normal',
                  rate: j.rate || matchedCm?.rate || '₱22,000 / mo',
                };
              });
            }
          } catch {
            // Non-fatal fallback
          }
        }

        // Merge liveJobs (all client positions) with apiJobs (backend DB jobs)
        const mergedJobsMap = new Map();
        (liveJobs || []).forEach((j) => {
          mergedJobsMap.set((j.position || j.title || '').toLowerCase().trim(), j);
        });
        apiJobs.forEach((j) => {
          const key = (j.position || j.title || '').toLowerCase().trim();
          mergedJobsMap.set(key, { ...(mergedJobsMap.get(key) || {}), ...j });
        });

        const finalJobs = Array.from(mergedJobsMap.values());
        if (!cancelled && finalJobs.length > 0) {
          setJobRequests(finalJobs);
        }

        // 2. Load Deployed Roster: extract hired employees from live Client Management jobs
        if (!cancelled && liveRoster?.length > 0) {
          setDeployedRoster(liveRoster);
        }

        // 3. Load Candidate Endorsements (Scoped to this Client only)
        const companyKey = (matchedCm?.name || clientCompName || '').trim();
        const clientJobTitles = (matchedCm?.jobs || []).map((j) => (j.title || '').toLowerCase().trim());
        const dynamicEndorsed = [];

        try {
          let apps = [];
          try {
            const recRes = await api.get('/recruitment/applications');
            if (recRes.data && Array.isArray(recRes.data) && recRes.data.length > 0) {
              apps = recRes.data;
            }
          } catch {
            // Non-fatal, fallback to cached / mock
          }

          const cachedApps = getCachedApplications();
          if (cachedApps && Array.isArray(cachedApps) && cachedApps.length > 0) {
            const appMap = new Map();
            apps.forEach((a) => appMap.set(String(a.id || a.name), a));
            cachedApps.forEach((ca) => {
              const key = String(ca.id || ca.name);
              appMap.set(key, { ...(appMap.get(key) || {}), ...ca });
            });
            apps = Array.from(appMap.values());
          } else if (!apps.length) {
            apps = APPLICATIONS || [];
          }

          // Read stored stages from localStorage to ensure immediate reflection
          let storedStages = getStoredStages() || {};
          try {
            const rawStages = localStorage.getItem('ismers_recruitment_stages');
            if (rawStages) storedStages = { ...storedStages, ...JSON.parse(rawStages) };
          } catch { }

          const endorsedStages = ['client_interview', 'hr_requirements', 'contract_signing', 'for_deployment', 'hired', 're_pooling'];

          // Filter candidates that are in an endorsed stage
          const matchedApps = apps.filter((a) => {
            const effectiveStage = storedStages[a.id] || (a.regId && storedStages[a.regId]) || storedStages[a.name] || a.status;
            if (!endorsedStages.includes(effectiveStage)) return false;

            const candClient = (a.client || '').toLowerCase().trim();
            const candJob = (a.jobTitle || a.position || '').toLowerCase().trim();
            const compLower = companyKey.toLowerCase();

            // Match if:
            // 1. Candidate is explicitly assigned to this client
            // 2. Or candidate has no client specified but matches one of this client's active job requisitions
            const matchesClient =
              !companyKey ||
              (candClient && (candClient === compLower || candClient.includes(compLower) || compLower.includes(candClient))) ||
              (!candClient && clientJobTitles.includes(candJob));

            return matchesClient;
          });

          matchedApps.forEach((a) => {
            const effectiveStage = storedStages[a.id] || (a.regId && storedStages[a.regId]) || storedStages[a.name] || a.status;

            // Resolve Endorsement Status:
            // When candidate is in 'client_interview', they are actively awaiting client review.
            // If they were previously declined and re-endorsed, status resets to 'Pending Review'.
            let cpStatus = 'Pending Review';
            const localStatus =
              localStorage.getItem(`cp_endorsement_${a.name}`) ||
              localStorage.getItem(`cp_endorsement_cand-${a.id}`) ||
              (a.regId && localStorage.getItem(`cp_endorsement_cand-${a.regId}`)) ||
              localStorage.getItem(`cp_endorsement_${a.id}`) ||
              (a.regId && localStorage.getItem(`cp_endorsement_${a.regId}`));

            if (effectiveStage === 'client_interview') {
              if (localStatus === 'Accepted for Interview' || a.clientEndorsementStatus === 'Accepted for Interview') {
                cpStatus = 'Accepted for Interview';
              } else {
                cpStatus = 'Pending Review';
              }
            } else if (['hr_requirements', 'contract_signing', 'for_deployment', 'hired'].includes(effectiveStage)) {
              cpStatus = 'Passed Interview';
            } else if (effectiveStage === 're_pooling') {
              cpStatus = 'Declined';
            } else {
              cpStatus = localStatus || a.clientEndorsementStatus || 'Pending Review';
            }

            const skillsArr = Array.isArray(a.skills) && a.skills.length > 0
              ? a.skills.map((s) => (typeof s === 'string' ? s : s.name))
              : ['Technical Proficiency', 'Communications', 'Operations Protocol'];

            const targetJob = targetById(a.jobId) || targetById(a.targetJobId);
            const computedScore = targetJob ? computeMatchScore(a, targetJob) : (typeof a.score === 'number' ? a.score : 0);

            dynamicEndorsed.push({
              id: a.id ? (String(a.id).startsWith('cand-') ? a.id : `cand-${a.id}`) : `cand-${a.regId || Date.now()}`,
              dbId: a.id,
              regId: a.regId,
              name: a.name,
              position: a.jobTitle || a.position || 'Operations Candidate',
              jobRef: a.jobId ? `PRF-2026-${String(a.jobId).replace(/\D/g, '').padStart(4, '0')}` : 'PRF-2026-0081',
              jobId: a.jobId,
              targetJobId: a.targetJobId,
              matchScore: computedScore,
              experience: a.experience || '3 years relevant industry experience',
              skills: skillsArr,
              workHistory: a.workHistory || [],
              education: a.education || [],
              documents: a.documents || [],
              breakdown: a.breakdown || null,
              phone: a.phone || null,
              email: a.email || null,
              endorsedDate: a.applied || 'Aug 14, 2026',
              status: cpStatus,
              recruiter: a.assignedManager || matchedCm?.am || 'M. Dela Cruz (Lead Recruiter)',
              client: a.client || companyKey,
              interview: a.interview || null,
            });
          });
        } catch (err) {
          console.warn('Could not load candidates in Client Portal:', err);
        }

        if (!cancelled) {
          setEndorsedCandidates(dynamicEndorsed);
        }
      } catch {
        navigate('/client-portal/login', { replace: true });
      }
    };
    init();

    const handleSyncEvent = (evt) => {
      const data = evt.data || evt.detail;
      if (!data) return;

      // 1. Auto-refresh Job Orders & Deployed Roster on any live deployment or status change
      if (
        data.type === 'DEPLOYMENT_CREATED' ||
        data.type === 'DEPLOYMENT_CHANGED' ||
        data.type === 'EMPLOYEE_DEPLOYED' ||
        data.type === 'candidate_deployed' ||
        data.type === 'STAGE_CHANGED' ||
        data.type === 'APPLICANT_STATUS_UPDATED'
      ) {
        const rawCurrent = localStorage.getItem('cp_session');
        const currentSession = rawCurrent ? JSON.parse(rawCurrent) : null;
        const { jobs: updatedJobs, roster: updatedRoster } = getInitialClientData(currentSession);
        if (!cancelled && updatedJobs.length > 0) setJobRequests(updatedJobs);
        if (!cancelled && updatedRoster.length > 0) setDeployedRoster(updatedRoster);
      }

      // 2. Candidate Endorsements real-time update
      if (
        data.type === 'ENDORSEMENT_STATUS_CHANGED' ||
        data.type === 'STAGE_CHANGED' ||
        data.type === 'CANDIDATE_ENDORSED' ||
        data.type === 'APPLICANT_STATUS_UPDATED'
      ) {
        const payload = data.payload || {};
        const { candidateId, dbId, regId, name, status, stage, applicant, candidate, interview } = payload;
        const cleanCandId = candidateId ? String(candidateId).replace(/^cand-/, '') : '';
        const candName = name || applicant?.name || candidate?.name;
        const effectiveStage = stage || applicant?.status || applicant?.recruitmentStage;

        // Compute resolved endorsement status
        let resolvedStatus = status;
        if (!resolvedStatus) {
          if (effectiveStage === 'client_interview' || data.type === 'CANDIDATE_ENDORSED') {
            resolvedStatus = 'Pending Review';
          } else if (['hr_requirements', 'contract_signing', 'for_deployment', 'hired'].includes(effectiveStage)) {
            resolvedStatus = 'Passed Interview';
          } else if (effectiveStage === 're_pooling') {
            resolvedStatus = 'Declined';
          } else {
            resolvedStatus = 'Pending Review';
          }
        }

        // If candidate stage changed to pooling or area_manager, reset status to Pending Review
        if (effectiveStage === 'pooling' || effectiveStage === 'area_manager') {
          resolvedStatus = 'Pending Review';
        }

        const isEndorsedStage = ['client_interview', 'hr_requirements', 'contract_signing', 'for_deployment', 'hired', 're_pooling'].includes(effectiveStage) || data.type === 'CANDIDATE_ENDORSED' || data.type === 'ENDORSEMENT_STATUS_CHANGED';

        setEndorsedCandidates((prev) => {
          const index = prev.findIndex(
            (c) =>
              (dbId && String(c.dbId) === String(dbId)) ||
              (regId && c.regId && c.regId.toLowerCase() === regId.toLowerCase()) ||
              (candName && c.name && c.name.toLowerCase().trim() === candName.toLowerCase().trim()) ||
              (cleanCandId && (String(c.dbId) === cleanCandId || c.id === candidateId || c.id === `cand-${cleanCandId}`)) ||
              (candidateId && (String(c.id) === String(candidateId) || String(c.dbId) === String(candidateId)))
          );

          if (index !== -1) {
            const copy = [...prev];
            const oldStatus = copy[index].status;
            copy[index] = {
              ...copy[index],
              status: resolvedStatus,
              ...(interview !== undefined ? { interview } : {}),
            };

            if (resolvedStatus && resolvedStatus !== oldStatus) {
              const targetName = copy[index].name || 'Candidate';
              setSuccessBanner(`Endorsement Status: ${targetName} is now "${resolvedStatus}".`);
              setNotifications((prevNotifs) => [
                {
                  id: `notif-status-${Date.now()}`,
                  type: 'status',
                  title: 'Endorsement Status Updated',
                  body: `${targetName} status updated to "${resolvedStatus}".`,
                  time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
                  read: false,
                },
                ...prevNotifs,
              ]);
            }

            return copy;
          }

          if (!isEndorsedStage) return prev;

          // Scope real-time candidate additions to this client
          const candClient = (payload.client || applicant?.client || candidate?.client || '').toLowerCase().trim();
          const candJob = (applicant?.jobTitle || applicant?.position || candidate?.position || '').toLowerCase().trim();
          const currentCompName = (session?.company || matchedCm?.name || clientCompName || '').toLowerCase().trim();
          const matchesCurrentClient =
            !currentCompName ||
            (candClient && (candClient === currentCompName || candClient.includes(currentCompName) || currentCompName.includes(candClient))) ||
            (!candClient && clientJobTitles.includes(candJob));

          if (!matchesCurrentClient) return prev;

          // If new candidate endorsed to Client Portal (0ms instant addition)
          const skillsArr = Array.isArray(applicant?.skills || candidate?.skills) && (applicant?.skills || candidate?.skills).length > 0
            ? (applicant?.skills || candidate?.skills).map((s) => (typeof s === 'string' ? s : s.name))
            : ['Technical Proficiency', 'Communications', 'Operations Protocol'];

          const targetJob = targetById(applicant?.jobId || candidate?.jobId) || targetById(applicant?.targetJobId);
          const computedScore = (typeof candidate?.matchScore === 'number' && candidate.matchScore > 0)
            ? candidate.matchScore
            : (typeof applicant?.score === 'number' && applicant.score > 0
              ? applicant.score
              : (targetJob ? computeMatchScore(applicant || candidate, targetJob) : 88));

          const rawJobId = applicant?.jobId || candidate?.jobId;
          const formattedJobRef = candidate?.jobRef || (rawJobId ? `PRF-2026-${String(rawJobId).replace(/\D/g, '').padStart(4, '0')}` : 'PRF-2026-0081');

          const newCand = {
            id: candidateId ? (String(candidateId).startsWith('cand-') ? candidateId : `cand-${candidateId}`) : `cand-${dbId || regId || Date.now()}`,
            dbId: dbId || candidateId || candidate?.dbId,
            regId: regId || applicant?.regId || candidate?.regId,
            name: candName || 'Candidate',
            position: candidate?.position || applicant?.jobTitle || applicant?.position || 'Operations Candidate',
            jobRef: formattedJobRef,
            jobId: rawJobId,
            targetJobId: applicant?.targetJobId || candidate?.targetJobId,
            matchScore: computedScore,
            experience: candidate?.experience || applicant?.experience || '3 years relevant industry experience',
            skills: skillsArr,
            workHistory: candidate?.workHistory || applicant?.workHistory || [],
            education: candidate?.education || applicant?.education || [],
            documents: candidate?.documents || applicant?.documents || [],
            breakdown: candidate?.breakdown || applicant?.breakdown || null,
            phone: candidate?.phone || applicant?.phone || null,
            email: candidate?.email || applicant?.email || null,
            endorsedDate: candidate?.endorsedDate || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            status: resolvedStatus,
            recruiter: candidate?.recruiter || applicant?.assignedManager || 'M. Dela Cruz (Lead Recruiter)',
            client: candClient || currentCompName || 'Client Organization',
            interview: interview || applicant?.interview || candidate?.interview || null,
          };

          // 0ms instant visual notification in Client Portal
          setSuccessBanner(`New Candidate Endorsed: ${newCand.name} for ${newCand.position} (${newCand.matchScore}% Match).`);
          setNotifications((prevNotifs) => [
            {
              id: `notif-endorsed-${Date.now()}`,
              type: 'endorsement',
              title: 'New Candidate Endorsed',
              body: `${newCand.name} has been endorsed by recruitment for ${newCand.position} (${newCand.matchScore}% Match).`,
              time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
              read: false,
            },
            ...prevNotifs,
          ]);

          return [newCand, ...prev];
        });

        setSelectedCandidate((prev) => {
          if (!prev) return prev;
          const matches =
            (dbId && String(prev.dbId) === String(dbId)) ||
            (regId && prev.regId && prev.regId.toLowerCase() === regId.toLowerCase()) ||
            (candName && prev.name && prev.name.toLowerCase().trim() === candName.toLowerCase().trim()) ||
            (cleanCandId && (String(prev.dbId) === cleanCandId || prev.id === candidateId || prev.id === `cand-${cleanCandId}`)) ||
            (candidateId && (String(prev.id) === String(candidateId) || String(prev.dbId) === String(candidateId)));
          return matches ? { ...prev, status: resolvedStatus, ...(interview !== undefined ? { interview } : {}) } : prev;
        });
      }
    };

    const handleStorage = (e) => {
      if (
        !e ||
        !e.key ||
        e.key.startsWith('ismers.deployments') ||
        e.key === 'ismers_bridge_hires_v2' ||
        e.key === 'ismers_sync_beacon' ||
        e.key === 'cp_session'
      ) {
        const rawCurrent = localStorage.getItem('cp_session');
        // Session cleared in another tab — force redirect to login
        if (!rawCurrent) {
          if (!cancelled) navigate('/client-portal/login', { replace: true });
          return;
        }
        const currentSession = JSON.parse(rawCurrent);
        const { jobs: updatedJobs, roster: updatedRoster } = getInitialClientData(currentSession);
        if (!cancelled && updatedJobs.length > 0) setJobRequests(updatedJobs);
        if (!cancelled && updatedRoster.length > 0) setDeployedRoster(updatedRoster);
      }
    };

    const handleDeploymentsUpdated = () => {
      const rawCurrent = localStorage.getItem('cp_session');
      const currentSession = rawCurrent ? JSON.parse(rawCurrent) : null;
      const { jobs: updatedJobs, roster: updatedRoster } = getInitialClientData(currentSession);
      if (!cancelled && updatedJobs.length > 0) setJobRequests(updatedJobs);
      if (!cancelled && updatedRoster.length > 0) setDeployedRoster(updatedRoster);
    };

    const unsubscribe = subscribeRealtimeEvents(handleSyncEvent);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('ismers:deployments-updated', handleDeploymentsUpdated);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ismers:deployments-updated', handleDeploymentsUpdated);
    };
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('cp_session');
      localStorage.removeItem('cp_token');
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

    const clientName = session?.company || 'Sunshine Manufacturing Corp.';
    const randomSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const refId = `PRF-2026-${randomSuffix}`;
    const deadlineFormatted = jobForm.deadline
      ? new Date(jobForm.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      : 'Aug 30, 2026';
    const rateFormatted = jobForm.rate
      ? `₱${jobForm.rate}${jobForm.ratePeriod === 'daily' ? '/day' : '/mo'}`
      : (matchedClient?.rate || '₱22,000 / mo');

    const newRequest = {
      id: refId,
      ref: refId,
      client: clientName,
      company: clientName,
      client_account_id: typeof session?.id === 'number' ? session.id : null,
      position: jobForm.title.trim(),
      title: jobForm.title.trim(),
      type: jobForm.type === 'Others' ? jobForm.typeOther.trim() : jobForm.type,
      total: parseInt(jobForm.total, 10) || 1,
      filled: 0,
      location: jobForm.location.trim(),
      requested: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      deadline: deadlineFormatted,
      status: 'review',
      stage: 'review',
      displayStatus: 'In Review',
      statusClass: 'client-portal-badge--review',
      badge: 'review',
      priority: jobForm.priority || 'normal',
      rate: rateFormatted,
      recruiter: matchedClient?.am || (clientName.toLowerCase().includes('northline') || clientName.toLowerCase().includes('coastal') || clientName.toLowerCase().includes('everwell') ? 'Dennis Ocampo' : 'Karla Reyes'),
      description: jobForm.description.trim(),
      requirements: jobForm.requirements.trim()
        ? jobForm.requirements.trim().split('\n').map(r => r.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
        : ['High school graduate or relevant vocational background', 'Good communication and attendance record'],
      specialInstructions: jobForm.specialInstructions.trim(),
      createdAt: new Date().toISOString(),
      source: 'client_portal',
    };

    // Attempt backend API persistence if available
    try {
      const payload = {
        client_account_id: typeof session?.id === 'number' ? session.id : null,
        client: clientName,
        title: newRequest.title,
        type: newRequest.type,
        total: newRequest.total,
        location: newRequest.location,
        deadline: deadlineFormatted,
        priority: newRequest.priority,
        rate: rateFormatted,
        description: newRequest.description,
        requirements: typeof jobForm.requirements === 'string' ? jobForm.requirements : null,
        source: 'client_portal',
      };
      const res = await clientPortalService.createJobOrder(payload);
      if (res?.data?.ref) {
        newRequest.id = res.data.ref;
        newRequest.ref = res.data.ref;
      }
    } catch (err) {
      console.warn('Backend job order API offline or unavailable, continuing with local persistence:', err);
    }

    // 1. Save to persistent global client job orders cache
    try {
      const existingRaw = localStorage.getItem('ismers_client_job_orders');
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [newRequest, ...existingList.filter(item => item.id !== newRequest.id && item.ref !== newRequest.ref)];
      localStorage.setItem('ismers_client_job_orders', JSON.stringify(updatedList));

      if (session?.email) {
        localStorage.setItem(`cp_jobs_${session.email}`, JSON.stringify(updatedList.filter(j => j.client === clientName)));
      }
    } catch (saveErr) {
      console.warn('Could not write to localStorage:', saveErr);
    }

    // 2. Broadcast events for real-time synchronization across modules
    broadcastRealtimeEvent('JOB_ORDER_CREATED', {
      jobOrder: newRequest,
      client: clientName,
    });
    window.dispatchEvent(new CustomEvent('ismers:job-orders-updated', { detail: newRequest }));

    // 3. Update component state with ALL jobs
    const refreshed = getInitialClientData(session);
    setJobRequests(refreshed.jobs);
    setStatusFilter('ALL');
    setSubmitting(false);
    setSuccessBanner(`Job Order Request ${newRequest.id} has been submitted successfully and is now under review.`);
    setShowJobModal(false);
    setActiveTab('job-orders');
  };

  // Filtered requests for 'job-orders' tab
  const filteredRequests = jobRequests.filter((req) => {
    const matchesSearch =
      (req.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const rawSt = (req.status || '').toUpperCase().replace(/\s+/g, '_');
    const isReviewMatch = (statusFilter === 'IN_REVIEW' || statusFilter === 'REVIEW') && (rawSt === 'IN_REVIEW' || rawSt === 'REVIEW');
    const matchesStatus = statusFilter === 'ALL' || isReviewMatch || rawSt === statusFilter;
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

  const matchedClient = useMemo(() => {
    return getInitialClientData(session).client;
  }, [session]);

  const currentAccountManager = useMemo(() => {
    return resolveAccountManager(matchedClient?.am);
  }, [matchedClient]);

  const upcomingInterviews = useMemo(() => {
    return endorsedCandidates
      .filter((c) => c.status === 'Accepted for Interview')
      .map((c, idx) => ({
        id: `iv-${c.id || idx}`,
        candidate: c.name,
        position: c.position,
        date: c.interview?.date || c.endorsedDate || 'TBD',
        time: c.interview?.time || '10:00 AM',
        type: c.interview?.mode || c.interview?.title || 'Video Call',
      }));
  }, [endorsedCandidates]);

  // Null-session render gate — placed after all hooks to comply with React Rules of Hooks.
  // Prevents any client data from rendering for unauthenticated visitors while
  // the useEffect auth guard fires its redirect to /client-portal/login.
  if (!session) return null;

  return (
    <div className="client-portal-shell">
      <ClientPortalTopbar
        notifications={notifications}
        onMarkRead={handleMarkNotifRead}
        onMarkAllRead={handleMarkAllNotifsRead}
      />

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
          accountManager={currentAccountManager}
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
                <div className="client-portal-header-right">
                  <button
                    id="dashboard-new-request-btn"
                    type="button"
                    className="client-portal-btn-primary"
                    onClick={openJobModal}
                  >
                    + New Job Order Request
                  </button>
                </div>
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
                  interviews={upcomingInterviews}
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
                  }).length === 0 ? (
                  <div style={{
                    gridColumn: '1 / -1',
                    padding: '48px 24px',
                    background: 'var(--panel, #0f172a)',
                    border: '1px dashed var(--border, #1e293b)',
                    borderRadius: 12,
                    textAlign: 'center',
                    color: 'var(--muted, #888)',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 44, height: 44, margin: '0 auto 12px', opacity: 0.45 }}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text, #fff)', marginBottom: 6 }}>
                      No Endorsed Candidates
                    </div>
                    <div style={{ fontSize: 12, maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
                      {endorsementFilter === 'ALL'
                        ? 'There are currently no candidates in the endorsement pipeline for your organization. When PRIMEPOWER recruiters endorse qualified applicants for your job orders, they will appear here.'
                        : `No candidate records currently found under '${endorsementFilter}'.`}
                    </div>
                  </div>
                ) : (
                  endorsedCandidates
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
                            <span className={`client-portal-badge ${cand.status === 'Accepted for Interview'
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

                          <div className="cp-card-actions">
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
                    ))
                )}
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

          {/* ── VIEW: CLIENT FEEDBACK ── */}
          {activeTab === 'feedback' && (
            <ClientFeedbackPage
              session={session}
              deployedRoster={deployedRoster}
            />
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
