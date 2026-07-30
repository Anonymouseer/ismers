// JobOrderManagementService.js
// Static/mock data + domain helpers for Core 1 · Job Order Management.
// Wire the CRUD functions at the bottom to /api/v1/job-orders when the
// Laravel endpoints are ready — the shape returned already matches what
// the UI expects, so components shouldn't need to change.

export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026 — matches app "current date"

export const STATUS_META = {
  open:    { label: 'Open',    color: '#3D7DD6', soft: '#E7EFFB', order: 1 },
  filling: { label: 'Filling', color: '#D98A2B', soft: '#FBF0E1', order: 2 },
  urgent:  { label: 'Urgent',  color: '#D45B5B', soft: '#FBEAEA', order: 3 },
  filled:  { label: 'Filled',  color: '#149E6E', soft: '#E4F5EE', order: 4 },
};
export const STATUS_ORDER = ['open', 'filling', 'urgent', 'filled'];

export const PRIORITY_META = {
  high:   { label: 'High',   color: '#D45B5B' },
  medium: { label: 'Medium', color: '#D98A2B' },
  normal: { label: 'Normal', color: '#8A8578' },
};

export const RECRUITERS = ['Maria Santos', 'John Dela Cruz', 'Angela Reyes', 'Mark Tuazon'];

// ---- JOB ORDER LIFECYCLE / WORKFLOW ENGINE ----
// Client Requests Personnel/Service -> Create Job Order -> Manager Review -> Approve/Reject
// -> Activated -> Check Available Employees -> (Deploy Staff | Send to Recruitment)
// -> Selected Employees Assigned -> Deployment Schedule Created -> Employees Report to Client
// -> In Progress -> Monitor Performance & Attendance -> Completed -> Closed
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
  const d = new Date(deadlineStr);
  return Math.ceil((d - TODAY) / 86400000);
}

export function countdownLabel(deadlineStr) {
  const diff = daysLeft(deadlineStr);
  if (diff < 0) return { text: 'Overdue', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff === 0) return { text: 'Due today', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 5) return { text: diff + 'd left', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 14) return { text: diff + 'd left', color: 'var(--amber)', soft: 'var(--amber-soft)' };
  return { text: diff + 'd left', color: 'var(--muted)', soft: 'var(--border-soft)' };
}

export function nowStamp() {
  return TODAY.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
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
  if (j.filled >= j.total) j.status = 'filled';
  else if (daysLeft(j.deadline) <= 5) j.status = 'urgent';
  else if (j.filled > 0) j.status = 'filling';
  else j.status = 'open';
  return j;
}

export function assignDefaults(j) {
  const job = { ...j };
  if (!job.stage) job.stage = job.status === 'filled' ? 'completed' : 'in_progress';
  if (!job.recruiter) job.recruiter = RECRUITERS[Math.abs(hashCode(job.ref)) % RECRUITERS.length];
  if (!job.priority) job.priority = job.status === 'urgent' ? 'high' : 'normal';
  if (!job.activityLog) job.activityLog = [{ date: job.deadline, text: 'Job order created.', type: 'system' }];
  if (!job.createdAt) job.createdAt = job.ref;
  return job;
}

export function nextRef(jobOrders) {
  const nums = jobOrders.map((j) => parseInt(j.ref.replace('JO-', ''), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'JO-' + String(next).padStart(3, '0');
}

// ---- MOCK DATA (wire to /api/v1/job-orders next) ----
const RAW_JOB_ORDERS = [
  { ref: 'JO-001', client: 'ABC Logistics', title: 'Warehouse Associate', status: 'filling',
    location: 'Valenzuela City, NCR', type: 'Full-time · Contractual', rate: '₱610/day', deadline: 'Jul 28, 2026', filled: 12, total: 15,
    description: 'ABC Logistics is looking for Warehouse Associates to support inbound and outbound operations at their Valenzuela distribution center, handling receiving, sorting, and staging of goods.',
    requirements: ['At least high school graduate; college level an advantage', '6 months of warehouse or logistics experience preferred', 'Able to lift up to 25kg and stand for extended periods', 'Willing to work rotating shifts including weekends'],
    tags: ['Warehousing', 'Entry-level', 'Shifting', 'On-site'],
    applicants: [
      { name: 'Andrea Molina', score: 92, status: 'hired', applied: 'Jul 01, 2026' },
      { name: 'Jomar Villagracia', score: 89, status: 'hired', applied: 'Jul 01, 2026' },
      { name: 'Rhea Castillo', score: 88, status: 'hired', applied: 'Jul 02, 2026' },
      { name: 'Michael Tan', score: 78, status: 'interview', applied: 'Jul 12, 2026' },
      { name: 'Carlo Dizon', score: 70, status: 'screening', applied: 'Jul 14, 2026' },
      { name: 'Ella Ramos', score: 55, status: 'applied', applied: 'Jul 16, 2026' },
    ] },
  { ref: 'JO-002', client: 'ABC Logistics', title: 'Forklift Operator', status: 'open',
    location: 'Valenzuela City, NCR', type: 'Full-time · Contractual', rate: '₱650/day', deadline: 'Aug 01, 2026', filled: 3, total: 5,
    description: 'ABC Logistics needs licensed Forklift Operators to move palletized goods within the warehouse and load/unload delivery trucks safely and efficiently.',
    requirements: ['Valid forklift operator certification/license', 'At least 1 year of forklift operating experience', 'Good understanding of warehouse safety protocols', 'Willing to work rotating shifts'],
    tags: ['Warehousing', 'Licensed', 'Shifting'],
    applicants: [
      { name: 'Danilo Ferrer', score: 90, status: 'hired', applied: 'Jul 02, 2026' },
      { name: 'Ramil Cabrera', score: 87, status: 'hired', applied: 'Jul 03, 2026' },
      { name: 'Wilfredo Santos', score: 85, status: 'hired', applied: 'Jul 04, 2026' },
      { name: 'Vince Ocampo', score: 80, status: 'interview', applied: 'Jul 10, 2026' },
      { name: 'Rico Manalo', score: 77, status: 'screening', applied: 'Jul 13, 2026' },
    ] },
  { ref: 'JO-003', client: 'Nova Retail Group', title: 'Visual Merchandiser', status: 'urgent',
    location: 'Makati City, NCR', type: 'Full-time · Regular', rate: '₱19,500/mo', deadline: 'Jul 26, 2026', filled: 1, total: 6,
    description: "Visual Merchandisers will set up in-store displays and window layouts according to brand guidelines to drive foot traffic ahead of the client's mall-wide relaunch.",
    requirements: ['At least 1 year of retail or merchandising experience', 'Creative eye for layout, color, and product placement', 'Willing to be assigned across NCR branches', 'Available to start within 2 weeks'],
    tags: ['Retail', 'Creative', 'On-site', 'Rush'],
    applicants: [
      { name: 'Patricia Gomez', score: 81, status: 'hired', applied: 'Jul 08, 2026' },
      { name: 'Renz Aldover', score: 74, status: 'interview', applied: 'Jul 15, 2026' },
      { name: 'Shane Bautista', score: 66, status: 'screening', applied: 'Jul 18, 2026' },
    ] },
  { ref: 'JO-004', client: 'Nova Retail Group', title: 'Store Associate', status: 'filling',
    location: 'Quezon City, NCR', type: 'Full-time · Contractual', rate: '₱610/day', deadline: 'Aug 10, 2026', filled: 8, total: 12,
    description: "Store Associates handle customer assistance, inventory replenishment, and point-of-sale transactions across Nova Retail's Quezon City branches.",
    requirements: ['At least high school graduate', 'Good communication and customer service skills', 'Willing to work retail hours including weekends and holidays'],
    tags: ['Retail', 'Customer Service', 'Shifting'],
    applicants: [
      { name: 'Joyce Manalastas', score: 86, status: 'hired', applied: 'Jul 05, 2026' },
      { name: 'Kim Salazar', score: 83, status: 'hired', applied: 'Jul 06, 2026' },
      { name: 'Dennis Roque', score: 72, status: 'interview', applied: 'Jul 14, 2026' },
    ] },
  { ref: 'JO-005', client: 'Meridian BPO Solutions', title: 'Customer Service Representative', status: 'open',
    location: 'Ortigas, Pasig City', type: 'Full-time · Regular', rate: '₱24,000/mo', deadline: 'Aug 15, 2026', filled: 6, total: 20,
    description: 'Meridian BPO is ramping up a new voice account and needs Customer Service Representatives to handle inbound queries for a US-based telco client.',
    requirements: ['At least 2 years college or SHS graduate', 'Excellent English communication skills', 'Willing to work night shift / graveyard schedule', 'Prior BPO/call center experience is a plus'],
    tags: ['BPO', 'Night Shift', 'Voice'],
    applicants: [
      { name: 'Nikki Fernandez', score: 88, status: 'hired', applied: 'Jul 03, 2026' },
      { name: 'Aaron Villareal', score: 84, status: 'hired', applied: 'Jul 04, 2026' },
      { name: 'Marielle Cruz', score: 79, status: 'interview', applied: 'Jul 12, 2026' },
      { name: 'Jopay Santos', score: 69, status: 'screening', applied: 'Jul 17, 2026' },
    ] },
  { ref: 'JO-006', client: 'Meridian BPO Solutions', title: 'Technical Support Specialist', status: 'urgent',
    location: 'Ortigas, Pasig City', type: 'Full-time · Regular', rate: '₱27,000/mo', deadline: 'Jul 25, 2026', filled: 2, total: 10,
    description: 'Technical Support Specialists will troubleshoot hardware and connectivity issues for a home-internet account, with a hard ramp deadline set by the client.',
    requirements: ['At least 1 year of technical support experience', 'Strong troubleshooting and problem-solving skills', 'Willing to work night shift', 'Basic understanding of networking concepts'],
    tags: ['BPO', 'Technical', 'Night Shift', 'Rush'],
    applicants: [
      { name: 'Ben Alvarez', score: 82, status: 'hired', applied: 'Jul 06, 2026' },
      { name: 'Trisha Ong', score: 76, status: 'interview', applied: 'Jul 16, 2026' },
    ] },
  { ref: 'JO-007', client: 'Golden Harvest Agri Corp', title: 'Farm Technician', status: 'filled',
    location: 'Nueva Ecija', type: 'Seasonal · Project-based', rate: '₱480/day', deadline: 'Jul 10, 2026', filled: 10, total: 10,
    description: "Farm Technicians supported the harvest-season operations for Golden Harvest's rice production sites, from planting assistance to post-harvest handling.",
    requirements: ['Willing to relocate to Nueva Ecija for the season', 'Prior farm or agricultural work experience preferred', 'Physically fit for fieldwork'],
    tags: ['Agriculture', 'Seasonal', 'Provincial'],
    applicants: [
      { name: 'Rodel Panganiban', score: 80, status: 'hired', applied: 'Jun 20, 2026' },
      { name: 'Lito Mercado', score: 78, status: 'hired', applied: 'Jun 21, 2026' },
    ] },
  { ref: 'JO-008', client: 'CarePlus Health Staffing', title: 'Home Care Aide', status: 'filling',
    location: 'Cebu City', type: 'Full-time · Contractual', rate: '₱16,500/mo', deadline: 'Aug 20, 2026', filled: 5, total: 9,
    description: "Home Care Aides provide daily living assistance and basic health monitoring for elderly clients under CarePlus's home-care program in Cebu.",
    requirements: ['Caregiving NC II or equivalent training preferred', 'Patient, compassionate disposition', 'Willing to be assigned to client residences', 'Basic first-aid knowledge is a plus'],
    tags: ['Healthcare', 'Caregiving', 'On-site'],
    applicants: [
      { name: 'Grace Villanueva', score: 85, status: 'hired', applied: 'Jul 07, 2026' },
      { name: 'Noel Espino', score: 73, status: 'interview', applied: 'Jul 15, 2026' },
      { name: 'Vilma Torres', score: 64, status: 'screening', applied: 'Jul 19, 2026' },
    ] },
  { ref: 'JO-009', client: 'Swift Freight Logistics', title: 'Delivery Driver', status: 'open',
    location: 'Caloocan City, NCR', type: 'Full-time · Contractual', rate: '₱620/day', deadline: 'Aug 12, 2026', filled: 4, total: 8,
    description: "Delivery Drivers handle last-mile delivery routes for Swift Freight's NCR distribution network, ensuring on-time and damage-free deliveries.",
    requirements: ["Valid non-professional or professional driver's license", 'At least 1 year of driving experience', 'Familiar with NCR roads and routes', 'No major traffic violations on record'],
    tags: ['Logistics', 'Driving', 'Shifting'],
    applicants: [
      { name: 'Ronald Mendoza', score: 83, status: 'hired', applied: 'Jul 09, 2026' },
      { name: 'Arnel Custodio', score: 71, status: 'interview', applied: 'Jul 17, 2026' },
    ] },
  { ref: 'JO-010', client: 'Summit Manufacturing Inc.', title: 'Production Line Worker', status: 'urgent',
    location: 'Sta. Rosa, Laguna', type: 'Full-time · Contractual', rate: '₱590/day', deadline: 'Jul 27, 2026', filled: 6, total: 25,
    description: "Production Line Workers will support Summit Manufacturing's assembly line ramp-up ahead of a major client order, with an urgent headcount target this month.",
    requirements: ['At least high school graduate', 'Willing to work in a factory environment with rotating shifts', 'No experience necessary; training provided', 'Willing to be assigned in Sta. Rosa, Laguna'],
    tags: ['Manufacturing', 'Entry-level', 'Shifting', 'Rush'],
    applicants: [
      { name: 'Ferdie Cabahug', score: 79, status: 'hired', applied: 'Jul 05, 2026' },
      { name: 'Sheila Marasigan', score: 75, status: 'hired', applied: 'Jul 06, 2026' },
      { name: 'Jun Villaruel', score: 68, status: 'screening', applied: 'Jul 18, 2026' },
      { name: 'Dexter Amistad', score: 60, status: 'applied', applied: 'Jul 20, 2026' },
    ] },
  { ref: 'JO-011', client: 'Swift Freight Logistics', title: 'Warehouse Supervisor', status: 'filled',
    location: 'Caloocan City, NCR', type: 'Full-time · Regular', rate: '₱28,000/mo', deadline: 'Jul 05, 2026', filled: 2, total: 2,
    description: "Warehouse Supervisors oversee daily inbound/outbound operations and manage a team of warehouse associates at Swift Freight's Caloocan hub.",
    requirements: ['At least 2 years of warehouse supervisory experience', 'Working knowledge of inventory systems', 'Strong people-management skills'],
    tags: ['Logistics', 'Supervisory', 'On-site'],
    applicants: [
      { name: 'Marlon Isip', score: 90, status: 'hired', applied: 'Jun 18, 2026' },
      { name: 'Cherry Aban', score: 88, status: 'hired', applied: 'Jun 19, 2026' },
    ] },
];

// ---- "API" surface — swap the bodies for real axios/apiClient calls later ----
const JobOrderManagementService = {
  /** GET /api/v1/job-orders */
  async getAll() {
    return RAW_JOB_ORDERS.map(assignDefaults);
  },
  /** POST /api/v1/job-orders */
  async create(payload, existingJobOrders) {
    const job = assignDefaults({
      ref: nextRef(existingJobOrders),
      stage: 'created',
      activityLog: [],
      applicants: [],
      ...payload,
    });
    recomputeStatus(job);
    return job;
  },
  /** PUT /api/v1/job-orders/{ref} */
  async update(ref, payload) {
    return { ref, ...payload };
  },
  /** DELETE /api/v1/job-orders/{ref} */
  async remove(ref) {
    return { ref, deleted: true };
  },
};

export default JobOrderManagementService;