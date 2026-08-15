// JobOrderManagementService.js
// API calls, domain constants, and canonical data builder for Job Order Management
import api from '../../../services/apiClient';
import { CLIENTS } from '../../client-management/data/mockClients';
import { mergeClientsWithDeployments } from '../../client-management/store/ClientManagementStore';
import { getDeployments } from '../../deployment-assignment/services/DeploymentAssignmentService';

const BASE_URL = '/job-orders';

export const jobOrderManagementService = {
  getAll: () => api.get(BASE_URL),
  getById: (id) => api.get(`${BASE_URL}/${id}`),
  create: (data) => api.post(BASE_URL, data),
  update: (id, data) => api.put(`${BASE_URL}/${id}`, data),
  remove: (id) => api.delete(`${BASE_URL}/${id}`),
};

// ---- Domain constants used by the board / drawer / modal ----
export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026 — matches app "current date"

export const STATUS_META = {
  review:  { label: 'Review',  color: '#805AD5', soft: '#F3E8FF', order: 0 },
  open:    { label: 'Open',    color: '#3D7DD6', soft: '#E7EFFB', order: 1 },
  filling: { label: 'Filling', color: '#D98A2B', soft: '#FBF0E1', order: 2 },
  urgent:  { label: 'Urgent',  color: '#D45B5B', soft: '#FBEAEA', order: 3 },
  filled:  { label: 'Filled',  color: '#149E6E', soft: '#E4F5EE', order: 4 },
};
export const STATUS_ORDER = ['review', 'open', 'filling', 'urgent', 'filled'];

export const PRIORITY_META = {
  urgent: { label: 'Urgent', color: '#D45B5B' },
  high:   { label: 'High',   color: '#E53E3E' },
  medium: { label: 'Medium', color: '#D98A2B' },
  normal: { label: 'Normal', color: '#8A8578' },
};

export const RECRUITERS = ['Karla Reyes', 'Dennis Ocampo', 'Maria Santos', 'John Dela Cruz', 'Angela Reyes'];

// ---- JOB ORDER LIFECYCLE / WORKFLOW ENGINE ----
export const TRACK_NODES = [
  { id: 'created',     label: 'Job Order Created' },
  { id: 'review',      label: 'Manager Reviews Job Order' },
  { id: 'approved',    label: 'Approved', rejectId: 'rejected', rejectLabel: 'Rejected' },
  { id: 'activated',   label: 'Job Order Activated' },
  { id: 'checking',    label: 'Check Available Employees' },
  { id: 'staffing',    label: 'Deploy Staff / Send to Recruitment', dynamic: true },
  { id: 'assigned',    label: 'Selected Employees Assigned' },
  { id: 'scheduled',   label: 'Deployment Schedule Created' },
  { id: 'reporting',   label: 'Employees Report to Client' },
  { id: 'in_progress', label: 'Job Order In Progress' },
  { id: 'monitoring',  label: 'Monitor Performance & Attendance' },
  { id: 'completed',   label: 'Job Order Completed' },
  { id: 'closed',      label: 'Job Order Closed' },
];

export const STAGE_INDEX = {
  created: 0, review: 1, approved: 2, rejected: 2, activated: 3, checking: 4,
  deploying: 5, recruiting: 5, assigned: 6, scheduled: 7, reporting: 8, in_progress: 9,
  monitoring: 10, completed: 11, closed: 12,
};

// ---- helpers ----
export function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return h;
}

export function daysLeft(deadlineStr) {
  if (!deadlineStr || deadlineStr === 'TBD') return 30;
  if (deadlineStr.toLowerCase().includes('closed')) return -1;
  const d = new Date(deadlineStr);
  if (isNaN(d.getTime())) return 30;
  return Math.ceil((d - TODAY) / 86400000);
}

export function countdownLabel(deadlineStr) {
  const diff = daysLeft(deadlineStr);
  if (diff < 0) return { text: 'Closed / Fulfilled', color: 'var(--green)', soft: 'var(--green-soft)' };
  if (diff === 0) return { text: 'Due today', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 5) return { text: diff + 'd left', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 14) return { text: diff + 'd left', color: 'var(--amber)', soft: 'var(--amber-soft)' };
  return { text: diff + 'd left', color: 'var(--muted)', soft: 'var(--border-soft)' };
}

export function nowStamp() {
  return TODAY.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function initials(name) {
  return (name || '').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}
export function pillClass(status) {
  return { hired: 'hired', interview: 'interview', screening: 'screening', rejected: 'rejected', applied: 'applied' }[status] || 'applied';
}
export function pillLabel(status) {
  return { hired: 'Hired', interview: 'Interview', screening: 'Screening', rejected: 'Rejected', applied: 'Applied' }[status] || 'Applied';
}
export function scoreClass(score) {
  return score >= 80 ? 'high' : 'mid';
}

export function recomputeStatus(j) {
  if (j.status === 'review' || j.stage === 'review') return j;
  if (j.filled >= j.total) {
    j.status = 'filled';
  } else if (j.badge === 'urgent' || (j.deadline && daysLeft(j.deadline) <= 5 && !j.deadline.toLowerCase().includes('closed'))) {
    j.status = 'urgent';
  } else if (j.filled > 0) {
    j.status = 'filling';
  } else {
    j.status = 'open';
  }
  return j;
}

export function assignDefaults(j) {
  const job = { ...j };
  if (!job.stage) {
    job.stage = job.status === 'review' ? 'review' : job.status === 'filled' ? 'completed' : 'in_progress';
  }
  if (!job.recruiter) job.recruiter = RECRUITERS[Math.abs(hashCode(job.ref || job.id || 'rec')) % RECRUITERS.length];
  if (!job.priority) job.priority = job.status === 'urgent' ? 'urgent' : 'normal';
  if (!job.activityLog || !job.activityLog.length) {
    job.activityLog = [{ date: job.deadline || nowStamp(), text: 'Job order requisition initialized in system.', type: 'system' }];
  }
  if (!job.createdAt) job.createdAt = job.ref || nowStamp();
  return job;
}

export function nextRef(jobOrders) {
  const nums = jobOrders.map((j) => parseInt(String(j.ref || '').replace(/[^0-9]/g, ''), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'JO-' + String(next).padStart(3, '0');
}

/**
 * Loads and builds the complete, synchronized list of Job Orders across:
 * 1. Canonical clients from mockClients.js
 * 2. Live deployments from DeploymentAssignmentStore
 * 3. Client Portal PRF submissions from localStorage (ismers_client_job_orders)
 */
export function buildSynchronizedJobOrders() {
  let deployments = [];
  if (typeof window !== 'undefined') {
    try {
      for (const key of ['ismers.deployments.v7', 'ismers.deployments.v6']) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            deployments = parsed;
            break;
          }
        }
      }
    } catch {}
  }
  if (!deployments.length) deployments = getDeployments();

  const result = [];
  let refCounter = 1;

  // 1. Process Client Portal submissions FIRST (Review Queue)
  let cpJobOrders = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ismers_client_job_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) cpJobOrders = parsed;
      }

      // Also inspect scoped cp_jobs_ keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('cp_jobs_')) {
          const rawScoped = localStorage.getItem(k);
          if (rawScoped) {
            const parsedScoped = JSON.parse(rawScoped);
            if (Array.isArray(parsedScoped)) {
              parsedScoped.forEach((item) => {
                const itemRef = item.ref || item.id;
                if (!cpJobOrders.some((x) => (x.ref || x.id) === itemRef)) {
                  cpJobOrders.push(item);
                }
              });
            }
          }
        }
      }
    } catch {}
  }

  function resolveClientAM(clientName) {
    if (!clientName) return 'Karla Reyes';
    const norm = clientName.toLowerCase().trim();
    const match = CLIENTS.find((c) => {
      const cNorm = (c.name || '').toLowerCase().trim();
      return cNorm === norm || cNorm.includes(norm) || norm.includes(cNorm);
    });
    return match?.am || (norm.includes('northline') || norm.includes('coastal') || norm.includes('everwell') ? 'Dennis Ocampo' : 'Karla Reyes');
  }

  cpJobOrders.forEach((cpJob) => {
    const ref = cpJob.ref || cpJob.id || `PRF-2026-${String(refCounter++).padStart(4, '0')}`;
    const clientName = cpJob.client || cpJob.company || 'Northline BPO';
    const isApproved =
      cpJob.status === 'open' ||
      cpJob.stage === 'activated' ||
      cpJob.status === 'filling' ||
      cpJob.status === 'filled';
    const status = isApproved ? (cpJob.status || 'open') : 'review';
    const stage = isApproved ? (cpJob.stage || 'activated') : 'review';
    const recruiter = (cpJob.recruiter && !cpJob.recruiter.toLowerCase().includes('unassigned'))
      ? cpJob.recruiter
      : resolveClientAM(clientName);

    result.push(assignDefaults({
      id: cpJob.id || `jo-cp-${refCounter++}`,
      ref,
      client: clientName,
      title: cpJob.title || cpJob.position || 'Requisition Position',
      status,
      stage,
      location: cpJob.location || 'Metro Manila',
      type: cpJob.type || 'Full-time · Contractual',
      rate: cpJob.rate || '₱22,000 / mo',
      deadline: cpJob.deadline || 'Aug 30, 2026',
      filled: cpJob.filled || 0,
      total: cpJob.total || 1,
      priority: cpJob.priority || 'normal',
      recruiter,
      description: cpJob.description || 'Job order request submitted via Client Portal.',
      requirements: Array.isArray(cpJob.requirements) ? cpJob.requirements : [cpJob.requirements || 'DOLE DO-174 Compliant Requirements'],
      tags: ['Client Portal', status === 'review' ? 'Under Review' : 'Active Requisition', cpJob.priority || 'Normal'],
      applicants: cpJob.applicants || [],
      source: 'client_portal',
      activityLog: cpJob.activityLog || [
        {
          date: cpJob.requested || nowStamp(),
          text: 'Job order request submitted from Client Portal. Awaiting HR Manager review.',
          type: 'system',
        },
      ],
    }));
  });

  // 2. Process canonical client jobs
  const augmentedClients = mergeClientsWithDeployments(CLIENTS, deployments);

  augmentedClients.forEach((client) => {
    (client.jobs || []).forEach((job) => {
      const ref = job.ref || `JO-${String(refCounter++).padStart(3, '0')}`;

      // If already added from cpJobOrders, skip
      if (result.some((r) => r.ref === ref || (r.title.toLowerCase() === (job.title || '').toLowerCase() && r.client.toLowerCase() === (client.name || '').toLowerCase()))) {
        return;
      }

      const filled = job.filled || 0;
      const total = Math.max(job.total || 1, filled);

      let status = 'open';
      let stage = 'in_progress';

      if (job.badge === 'review' || job.status === 'review' || job.stage === 'review') {
        status = 'review';
        stage = 'review';
      } else if (filled >= total) {
        status = 'filled';
        stage = 'completed';
      } else if (job.badge === 'urgent' || (job.deadline && daysLeft(job.deadline) <= 5 && !job.deadline.toLowerCase().includes('closed'))) {
        status = 'urgent';
        stage = 'in_progress';
      } else if (filled > 0) {
        status = 'filling';
        stage = 'in_progress';
      } else {
        status = 'open';
        stage = 'activated';
      }

      result.push(assignDefaults({
        id: job.id || `jo${refCounter}`,
        ref,
        client: client.name,
        companyId: client.companyId,
        title: job.title,
        status,
        stage,
        location: job.location || client.address || 'Metro Manila',
        type: job.type || 'Full-time · Contractual',
        rate: job.rate || client.rate || '₱22,000/mo',
        deadline: job.deadline || 'Aug 30, 2026',
        filled,
        total,
        priority: job.badge === 'urgent' ? 'urgent' : (job.badge === 'filling' ? 'high' : 'normal'),
        recruiter: client.am || 'Karla Reyes',
        description: job.description || `Job requisition for ${job.title} at ${client.name}.`,
        requirements: Array.isArray(job.requirements) ? job.requirements : [job.requirements || 'DOLE DO-174 Compliant Requirements'],
        tags: job.tags || ['On-site', 'Contractual'],
        applicants: job.applicants || [],
        activityLog: [
          {
            date: job.deadline || 'Jul 15, 2026',
            text: `Job order requisition active for ${client.name}. Headcount fulfillment: ${filled} / ${total}.`,
            type: 'system',
          },
        ],
      }));
    });
  });

  return result;
}

export default jobOrderManagementService;