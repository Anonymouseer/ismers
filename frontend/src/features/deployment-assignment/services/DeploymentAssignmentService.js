import { ISMERSBridge } from './ismersBridge';

// Reference date used throughout the mock data (matches the rest of the app's "today").
// TODO: swap for `new Date()` once this is wired to live data.
export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026

// ---- BOARD STATUS (coarse grouping, derived from lifecycle stage) ----
export const STATUS_META = {
  scheduled: { label: 'Scheduled', color: 'var(--blue)', soft: 'var(--blue-soft)', order: 1 },
  reporting: { label: 'Reporting', color: 'var(--purple)', soft: 'var(--purple-soft)', order: 2 },
  active: { label: 'Active', color: 'var(--amber)', soft: 'var(--amber-soft)', order: 3 },
  completed: { label: 'Completed', color: 'var(--green)', soft: 'var(--green-soft)', order: 4 },
};
export const STATUS_ORDER = ['scheduled', 'reporting', 'active', 'completed'];

export function stageToStatus(stage) {
  if (stage === 'assigned' || stage === 'scheduled') return 'scheduled';
  if (stage === 'reporting') return 'reporting';
  if (stage === 'in_progress' || stage === 'monitoring') return 'active';
  return 'completed'; // completed | closed
}

// ---- DEPLOYMENT LIFECYCLE / WORKFLOW ----
// Selected Employees Assigned -> Deployment Schedule Created -> Employees Report to Client
// -> Job Order In Progress -> Monitor Performance & Attendance -> Completed -> Closed
export const TRACK_NODES = [
  { id: 'assigned', label: 'Employee Assigned' },
  { id: 'scheduled', label: 'Deployment Schedule Created' },
  { id: 'reporting', label: 'Employee Reports to Client' },
  { id: 'in_progress', label: 'Job Order In Progress' },
  { id: 'monitoring', label: 'Monitor Performance & Attendance' },
  { id: 'completed', label: 'Deployment Completed' },
  { id: 'closed', label: 'Deployment Closed' },
];
export const STAGE_INDEX = {
  assigned: 0,
  scheduled: 1,
  reporting: 2,
  in_progress: 3,
  monitoring: 4,
  completed: 5,
  closed: 6,
};

// Job orders referenced by deployments (kept local to this feature for the "New Deployment" form).
export const JOB_ORDER_OPTIONS = [
  { ref: 'JO-001', client: 'ABC Logistics', title: 'Warehouse Associate' },
  { ref: 'JO-002', client: 'ABC Logistics', title: 'Forklift Operator' },
  { ref: 'JO-003', client: 'Nova Retail Group', title: 'Visual Merchandiser' },
  { ref: 'JO-004', client: 'Nova Retail Group', title: 'Store Associate' },
  { ref: 'JO-005', client: 'Meridian BPO Solutions', title: 'Customer Service Representative' },
  { ref: 'JO-006', client: 'Meridian BPO Solutions', title: 'Technical Support Specialist' },
  { ref: 'JO-007', client: 'Golden Harvest Agri Corp', title: 'Farm Technician' },
  { ref: 'JO-008', client: 'CarePlus Health Staffing', title: 'Home Care Aide' },
  { ref: 'JO-009', client: 'Swift Freight Logistics', title: 'Delivery Driver' },
  { ref: 'JO-010', client: 'Summit Manufacturing Inc.', title: 'Production Line Worker' },
  { ref: 'JO-011', client: 'Swift Freight Logistics', title: 'Warehouse Supervisor' },
  // JO-012+ cross-reference the job orders defined in Recruitment & Selection's
  // JOB_ORDERS list (see that feature's `depRef` field) so hired candidates from
  // there resolve to a client/job order here.
  { ref: 'JO-012', client: 'Northline BPO', title: 'Customer Service Rep' },
  { ref: 'JO-013', client: 'Northline BPO', title: 'Technical Support Agent' },
  { ref: 'JO-014', client: 'Delta Manufacturing', title: 'Machine Operator' },
  { ref: 'JO-015', client: 'Sunrise Hospitality Group', title: 'Front Desk Associate' },
];

// ---- MOCK DATA (static preview — wire to POST/GET /api/v1/deployments next) ----
const MOCK_DEPLOYMENTS = [
  { id: 'DEP-001', employee: 'Andrea Molina', client: 'ABC Logistics', jobOrderRef: 'JO-001', position: 'Warehouse Associate',
    site: 'Valenzuela City, NCR', start: 'Jul 03, 2026', end: 'Jan 03, 2027', stage: 'monitoring', score: 92,
    attendance: { present: 16, late: 2, absent: 1 },
    applicantKey: ISMERSBridge.keyFor('Andrea Molina', 'JO-001'),
    logs: [
      { date: 'Jul 22, 2026', type: 'present', note: 'Reported on time.' },
      { date: 'Jul 15, 2026', type: 'late', note: 'Arrived 20 minutes late.' },
      { date: 'Jul 08, 2026', type: 'absent', note: 'Did not report — sick leave filed.' },
    ] },
  { id: 'DEP-002', employee: 'Jomar Villagracia', client: 'ABC Logistics', jobOrderRef: 'JO-001', position: 'Warehouse Associate',
    site: 'Valenzuela City, NCR', start: 'Jul 03, 2026', end: 'Jan 03, 2027', stage: 'monitoring', score: 88,
    attendance: { present: 17, late: 1, absent: 0 },
    applicantKey: ISMERSBridge.keyFor('Jomar Villagracia', 'JO-001'),
    logs: [{ date: 'Jul 22, 2026', type: 'present', note: 'Reported on time.' }] },
  { id: 'DEP-003', employee: 'Danilo Ferrer', client: 'ABC Logistics', jobOrderRef: 'JO-002', position: 'Forklift Operator',
    site: 'Valenzuela City, NCR', start: 'Jul 05, 2026', end: 'Jan 05, 2027', stage: 'in_progress', score: 90,
    attendance: { present: 0, late: 0, absent: 0 },
    applicantKey: ISMERSBridge.keyFor('Danilo Ferrer', 'JO-002'),
    logs: [] },
  { id: 'DEP-004', employee: 'Patricia Gomez', client: 'Nova Retail Group', jobOrderRef: 'JO-003', position: 'Visual Merchandiser',
    site: 'Makati City, NCR', start: 'Jul 10, 2026', end: 'Oct 10, 2026', stage: 'monitoring', score: 81,
    attendance: { present: 8, late: 0, absent: 2 },
    logs: [
      { date: 'Jul 21, 2026', type: 'absent', note: 'Did not report — no call, no show.' },
      { date: 'Jul 12, 2026', type: 'present', note: 'Reported on time.' },
    ] },
  { id: 'DEP-005', employee: 'Joyce Manalastas', client: 'Nova Retail Group', jobOrderRef: 'JO-004', position: 'Store Associate',
    site: 'Quezon City, NCR', start: 'Jul 08, 2026', end: 'Jan 08, 2027', stage: 'reporting', score: 0,
    attendance: { present: 0, late: 0, absent: 0 }, logs: [] },
  { id: 'DEP-006', employee: 'Nikki Fernandez', client: 'Meridian BPO Solutions', jobOrderRef: 'JO-005', position: 'Customer Service Representative',
    site: 'Ortigas, Pasig City', start: 'Jul 06, 2026', end: 'Jul 06, 2027', stage: 'monitoring', score: 88,
    attendance: { present: 14, late: 3, absent: 0 },
    logs: [{ date: 'Jul 20, 2026', type: 'late', note: 'Arrived late — traffic.' }] },
  { id: 'DEP-007', employee: 'Ben Alvarez', client: 'Meridian BPO Solutions', jobOrderRef: 'JO-006', position: 'Technical Support Specialist',
    site: 'Ortigas, Pasig City', start: 'Jul 09, 2026', end: 'Jul 09, 2027', stage: 'scheduled', score: 0,
    attendance: { present: 0, late: 0, absent: 0 }, logs: [] },
  { id: 'DEP-008', employee: 'Rodel Panganiban', client: 'Golden Harvest Agri Corp', jobOrderRef: 'JO-007', position: 'Farm Technician',
    site: 'Nueva Ecija', start: 'Jun 22, 2026', end: 'Jul 22, 2026', stage: 'completed', score: 80,
    attendance: { present: 28, late: 1, absent: 1 },
    logs: [{ date: 'Jul 20, 2026', type: 'present', note: 'Final day on-site — engagement ended.' }] },
  { id: 'DEP-009', employee: 'Grace Villanueva', client: 'CarePlus Health Staffing', jobOrderRef: 'JO-008', position: 'Home Care Aide',
    site: 'Cebu City', start: 'Jul 09, 2026', end: 'Jan 09, 2027', stage: 'monitoring', score: 85,
    attendance: { present: 12, late: 0, absent: 0 }, logs: [{ date: 'Jul 19, 2026', type: 'present', note: 'Reported on time.' }] },
  { id: 'DEP-010', employee: 'Ronald Mendoza', client: 'Swift Freight Logistics', jobOrderRef: 'JO-009', position: 'Delivery Driver',
    site: 'Caloocan City, NCR', start: 'Jul 11, 2026', end: 'Jan 11, 2027', stage: 'in_progress', score: 83,
    attendance: { present: 0, late: 0, absent: 0 }, logs: [] },
  { id: 'DEP-011', employee: 'Ferdie Cabahug', client: 'Summit Manufacturing Inc.', jobOrderRef: 'JO-010', position: 'Production Line Worker',
    site: 'Sta. Rosa, Laguna', start: 'Jul 07, 2026', end: 'Oct 07, 2026', stage: 'monitoring', score: 79,
    attendance: { present: 13, late: 2, absent: 1 }, logs: [{ date: 'Jul 18, 2026', type: 'late', note: 'Arrived late.' }] },
  { id: 'DEP-012', employee: 'Marlon Isip', client: 'Swift Freight Logistics', jobOrderRef: 'JO-011', position: 'Warehouse Supervisor',
    site: 'Caloocan City, NCR', start: 'Jun 20, 2026', end: 'Jun 20, 2027', stage: 'completed', score: 90,
    attendance: { present: 24, late: 0, absent: 0 }, logs: [{ date: 'Jul 05, 2026', type: 'present', note: 'Consistently on time.' }] },
];

/**
 * getDeployments — returns the seed dataset.
 * TODO: replace with `apiClient.get('/deployments')` once the backend route exists.
 * Kept synchronous-but-cloned so callers can safely mutate their own copy.
 */
export function getDeployments() {
  return MOCK_DEPLOYMENTS.map((d) => ({
    ...d,
    attendance: { ...d.attendance },
    logs: d.logs.map((l) => ({ ...l })),
  }));
}

// ---- pure helpers (ported 1:1 from the original inline <script>) ----

export function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function scoreClass(score) {
  return score >= 80 ? 'high' : 'mid';
}

export function daysLeft(dateStr) {
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / 86400000);
}

export function countdownLabel(dateStr) {
  const diff = daysLeft(dateStr);
  if (diff < 0) return { text: 'Ended', color: 'var(--muted)', soft: 'var(--border-soft)' };
  if (diff === 0) return { text: 'Ends today', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 14) return { text: diff + 'd left', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 30) return { text: diff + 'd left', color: 'var(--amber)', soft: 'var(--amber-soft)' };
  return { text: diff + 'd left', color: 'var(--muted)', soft: 'var(--border-soft)' };
}

export function attendanceRate(d) {
  const a = d.attendance;
  const total = (a.present || 0) + (a.late || 0) + (a.absent || 0);
  if (!total) return 100;
  return Math.round(((a.present || 0) + (a.late || 0) * 0.5) / total * 100);
}

export function nextDepId(deployments) {
  const nums = deployments
    .map((d) => parseInt(d.id.replace('DEP-', ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'DEP-' + String(next).padStart(3, '0');
}

export function renderStageActionsText(d) {
  switch (d.stage) {
    case 'assigned':
      return { note: 'Employee has been assigned. Create the deployment schedule.', action: { label: 'Create Deployment Schedule', next: 'scheduled', kind: 'go' } };
    case 'scheduled':
      return { note: `Schedule set for ${d.site}, ${d.start} \u2192 ${d.end}. Confirm once the employee reports.`, action: { label: 'Confirm Employee Reported', next: 'reporting', kind: 'go' } };
    case 'reporting':
      return { note: `${d.employee} has reported to ${d.client}. Start the deployment.`, action: { label: 'Start Deployment', next: 'in_progress', kind: 'go' } };
    case 'in_progress':
      return { note: 'Deployment is running. Begin tracking performance and attendance.', action: { label: 'Begin Monitoring', next: 'monitoring', kind: 'go' } };
    case 'monitoring':
      return { note: 'Log attendance below. Mark completed once the engagement ends.', action: { label: 'Mark Deployment Completed', next: 'completed', kind: 'go' } };
    case 'completed':
      return { note: 'Deployment completed. Close it out to archive the record.', action: { label: 'Close Deployment', next: 'closed', kind: 'go' } };
    case 'closed':
      return { note: 'This deployment is closed and archived.', action: null };
    default:
      return { note: '', action: null };
  }
}
