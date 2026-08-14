// ApplicantRegistrationService.js
//
// Service layer for Applicant Registration & Profiling. Communicates with the
// Laravel REST API (/api/v1/applicants) for persistence while maintaining
// pure helper functions for match scoring, status metadata, and permission checks.

const API_BASE = 'http://localhost:8000/api/v1/applicants';

// ── API CLIENT FUNCTIONS ──

export async function fetchApplicantsApi() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error('Failed to fetch applicants');
  return res.json();
}

export async function fetchApplicantApi(regId) {
  const res = await fetch(`${API_BASE}/${regId}`);
  if (!res.ok) throw new Error(`Failed to fetch applicant ${regId}`);
  return res.json();
}

export async function createApplicantApi(formData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, duplicate: data.duplicate, message: data.message || 'Error creating applicant' };
  }
  return data;
}

export async function updateBasicInfoApi(regId, patchData) {
  const res = await fetch(`${API_BASE}/${regId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(patchData),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, duplicate: data.duplicate, message: data.message || 'Error updating applicant' };
  }
  return data;
}

export async function deleteApplicantApi(regId) {
  const res = await fetch(`${API_BASE}/${regId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete applicant');
  return res.json();
}

// ── Sub-resource API Calls ──

export async function addSkillApi(regId, skill) {
  const res = await fetch(`${API_BASE}/${regId}/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill }),
  });
  return res.json();
}

export async function removeSkillApi(regId, skillId) {
  const res = await fetch(`${API_BASE}/${regId}/skills/${skillId}`, { method: 'DELETE' });
  return res.json();
}

export async function addWorkHistoryApi(regId, entry) {
  const res = await fetch(`${API_BASE}/${regId}/work-history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function removeWorkHistoryApi(regId, workId) {
  const res = await fetch(`${API_BASE}/${regId}/work-history/${workId}`, { method: 'DELETE' });
  return res.json();
}

export async function addEducationApi(regId, entry) {
  const res = await fetch(`${API_BASE}/${regId}/education`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function removeEducationApi(regId, eduId) {
  const res = await fetch(`${API_BASE}/${regId}/education/${eduId}`, { method: 'DELETE' });
  return res.json();
}

export async function addDocumentApi(regId, docData) {
  // Supports either JSON or FormData (for real file upload)
  let body;
  let headers = {};

  if (docData instanceof FormData) {
    body = docData;
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(docData);
  }

  const res = await fetch(`${API_BASE}/${regId}/documents`, {
    method: 'POST',
    headers,
    body,
  });
  return res.json();
}

export async function removeDocumentApi(regId, docId) {
  const res = await fetch(`${API_BASE}/${regId}/documents/${docId}`, { method: 'DELETE' });
  return res.json();
}

export async function addReferenceApi(regId, entry) {
  const res = await fetch(`${API_BASE}/${regId}/references`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  return res.json();
}

export async function removeReferenceApi(regId, refId) {
  const res = await fetch(`${API_BASE}/${regId}/references/${refId}`, { method: 'DELETE' });
  return res.json();
}

// ── Workflow Stage & Status API Calls ──

export async function updateStageApi(regId, stage) {
  const res = await fetch(`${API_BASE}/${regId}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
  return res.json();
}

export async function updateStatusApi(regId, status) {
  const res = await fetch(`${API_BASE}/${regId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function updateCategoryApi(regId, category) {
  const res = await fetch(`${API_BASE}/${regId}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  });
  return res.json();
}

export async function updateTargetJobApi(regId, targetJobId, jobLabel) {
  const res = await fetch(`${API_BASE}/${regId}/target-job`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetJobId, jobLabel }),
  });
  return res.json();
}

export async function sendToRecruitmentApi(regId) {
  const res = await fetch(`${API_BASE}/${regId}/send-to-recruitment`, { method: 'POST' });
  return res.json();
}

export async function returnToProfilingApi(regId) {
  const res = await fetch(`${API_BASE}/${regId}/return-to-profiling`, { method: 'POST' });
  return res.json();
}

export async function bulkReturnToProfilingApi() {
  const res = await fetch(`${API_BASE}/bulk-return-to-profiling`, { method: 'POST' });
  return res.json();
}

// ── MATCH SCORING & STATIC CONSTANTS ──

export const JOB_TARGETS = [
  // --- ABC Logistics ---
  { id: 'jo1', title: 'Warehouse Associate', client: 'ABC Logistics', category: 'Warehousing & Logistics', keywords: ['inventory', 'warehouse', 'pallet', 'logistics', 'stock', 'picking', 'packing'] },
  { id: 'jo2', title: 'Forklift Operator', client: 'ABC Logistics', category: 'Warehousing & Logistics', keywords: ['forklift', 'warehouse', 'logistics', 'pallet', 'material handling', 'inventory'] },
  { id: 'jo3', title: 'Inventory Clerk', client: 'ABC Logistics', category: 'Warehousing & Logistics', keywords: ['inventory', 'stock', 'wms', 'cycle count', 'data entry', 'clerk'] },
  { id: 'jo4', title: 'Delivery Driver', client: 'ABC Logistics', category: 'Warehousing & Logistics', keywords: ['driver', 'delivery', 'license', 'courier', 'transport', 'logistics'] },

  // --- Northline BPO ---
  { id: 'jo5', title: 'Customer Service Rep', client: 'Northline BPO', category: 'Customer Service (BPO)', keywords: ['customer service', 'crm', 'english proficiency', 'call center', 'customer support', 'communication'] },
  { id: 'jo6', title: 'Technical Support Agent', client: 'Northline BPO', category: 'Customer Service (BPO)', keywords: ['technical troubleshooting', 'ticketing', 'networking', 'technical support', 'troubleshooting'] },
  { id: 'jo7', title: 'Sales Development Representative', client: 'Northline BPO', category: 'Customer Service (BPO)', keywords: ['sales', 'outbound', 'inbound', 'crm', 'cold calling', 'leads'] },
  { id: 'jo8', title: 'Team Leader - Customer Experience', client: 'Northline BPO', category: 'Customer Service (BPO)', keywords: ['team leader', 'supervisor', 'bpo', 'coaching', 'kpi', 'csat'] },

  // --- Delta Manufacturing ---
  { id: 'jo9', title: 'Machine Operator', client: 'Delta Manufacturing', category: 'Manufacturing', keywords: ['machine operation', 'quality inspection', 'safety compliance', 'production', 'troubleshooting'] },
  { id: 'jo10', title: 'Quality Control Inspector', client: 'Delta Manufacturing', category: 'Manufacturing', keywords: ['quality control', 'inspection', 'qc', 'calipers', 'manufacturing', 'specifications'] },
  { id: 'jo11', title: 'Production Line Supervisor', client: 'Delta Manufacturing', category: 'Manufacturing', keywords: ['supervisor', 'production line', 'kpi', 'line balancing', 'manufacturing'] },
  { id: 'jo12', title: 'Packaging Associate', client: 'Delta Manufacturing', category: 'Manufacturing', keywords: ['packaging', 'sorting', 'labeling', 'finished goods', 'packing'] },

  // --- Coastal Retail Group ---
  { id: 'jo13', title: 'Admin Assistant', client: 'Coastal Retail Group', category: 'Retail & Store Operations', keywords: ['admin', 'office', 'excel', 'documentation', 'scheduling', 'clerical'] },
  { id: 'jo14', title: 'Sales Associate', client: 'Coastal Retail Group', category: 'Retail & Store Operations', keywords: ['sales associate', 'retail', 'customer service', 'stocking', 'replenishment'] },
  { id: 'jo15', title: 'Store Cashier', client: 'Coastal Retail Group', category: 'Retail & Store Operations', keywords: ['cashier', 'pos', 'cash handling', 'retail', 'customer service'] },
  { id: 'jo16', title: 'Visual Merchandiser', client: 'Coastal Retail Group', category: 'Retail & Store Operations', keywords: ['merchandiser', 'visual', 'display', 'retail layout', 'branding'] },

  // --- Sunrise Hospitality Group ---
  { id: 'jo17', title: 'Front Desk Associate', client: 'Sunrise Hospitality Group', category: 'Hospitality & Front Desk', keywords: ['front desk', 'guest relations', 'booking systems', 'hospitality', 'customer service', 'front office'] },
  { id: 'jo18', title: 'Housekeeping Staff', client: 'Sunrise Hospitality Group', category: 'Hospitality & Front Desk', keywords: ['housekeeping', 'cleaning', 'room turnaround', 'resort', 'hospitality'] },
  { id: 'jo19', title: 'Food & Beverage Server', client: 'Sunrise Hospitality Group', category: 'Food & Beverage (F&B / Cook)', keywords: ['f&b', 'server', 'waiter', 'restaurant', 'dining', 'hospitality'] },
  { id: 'jo20', title: 'Maintenance Technician', client: 'Sunrise Hospitality Group', category: 'Hospitality & Front Desk', keywords: ['maintenance', 'technician', 'electrical', 'plumbing', 'repairs'] },

  // --- Prime Realty Corp ---
  { id: 'jo21', title: 'Leasing Consultant', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', keywords: ['leasing', 'real estate', 'sales', 'viewings', 'property', 'contracts'] },
  { id: 'jo22', title: 'Property Administrator', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', keywords: ['property administrator', 'tenant records', 'lease renewals', 'admin'] },
  { id: 'jo23', title: 'Front Desk Officer', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', keywords: ['front desk', 'reception', 'lobby', 'concierge', 'visitor logs'] },
  { id: 'jo24', title: 'Maintenance Coordinator', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', keywords: ['maintenance coordinator', 'repairs', 'facilities', 'building systems'] },

  // --- Metro Health Diagnostics ---
  { id: 'jo25', title: 'Medical Technologist', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', keywords: ['medical technologist', 'medtech', 'lab testing', 'specimen analysis', 'doh'] },
  { id: 'jo26', title: 'Radiologic Technologist', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', keywords: ['radiologic', 'x-ray', 'imaging', 'radtech', 'radiation safety'] },
  { id: 'jo27', title: 'Patient Service Representative', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', keywords: ['patient service', 'registration', 'healthcare front desk', 'appointments'] },
  { id: 'jo28', title: 'Billing Clerk', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', keywords: ['billing', 'hmo', 'insurance claims', 'patient accounts', 'accounting'] },

  // --- GreenFields Agri Export ---
  { id: 'jo29', title: 'Packing Associate', client: 'GreenFields Agri Export', category: 'Agriculture & Export', keywords: ['packing', 'produce', 'grading', 'harvest', 'hygiene', 'export'] },
  { id: 'jo30', title: 'QA Inspector (Agri)', client: 'GreenFields Agri Export', category: 'Agriculture & Export', keywords: ['qa inspector', 'quality control', 'export-grade', 'agri', 'produce'] },
  { id: 'jo31', title: 'Logistics Coordinator', client: 'GreenFields Agri Export', category: 'Agriculture & Export', keywords: ['logistics coordinator', 'container bookings', 'freight', 'export documentation'] },
  { id: 'jo32', title: 'Farm Supervisor', client: 'GreenFields Agri Export', category: 'Agriculture & Export', keywords: ['farm supervisor', 'harvest scheduling', 'field crews', 'agriculture'] },

  // --- Apex Construction Builders ---
  { id: 'jo33', title: 'Construction Laborer', client: 'Apex Construction Builders', category: 'Construction & Engineering', keywords: ['construction', 'laborer', 'material handling', 'masonry', 'site work'] },
  { id: 'jo34', title: 'Site Engineer Assistant', client: 'Apex Construction Builders', category: 'Construction & Engineering', keywords: ['site engineer', 'autocad', 'civil engineering', 'inspections', 'plans'] },
  { id: 'jo35', title: 'Safety Officer', client: 'Apex Construction Builders', category: 'Construction & Engineering', keywords: ['safety officer', 'bosh', 'ppe', 'oshs', 'hazard inspection'] },
  { id: 'jo36', title: 'Heavy Equipment Operator', client: 'Apex Construction Builders', category: 'Construction & Engineering', keywords: ['heavy equipment', 'backhoe', 'excavator', 'operator license', 'grading'] },
];

export function computeMatchScore(candidate, job) {
  if (!job.keywords || !job.keywords.length) return 0;
  const searchable = [
    ...(candidate.skills || []),
    ...(candidate.workHistory || []).map((w) => `${w.role} ${w.company}`),
  ].join(' ').toLowerCase();

  const matched = job.keywords.filter((kw) => searchable.includes(kw.toLowerCase())).length;
  return Math.round((matched / job.keywords.length) * 100);
}

export function jobMatchesForCandidate(candidate) {
  if (!candidate.category) return [];
  return JOB_TARGETS
    .filter((j) => j.category === candidate.category)
    .map((j) => ({ job: j, score: computeMatchScore(candidate, j) }))
    .sort((a, b) => b.score - a.score);
}

export const CATEGORIES = [
  'Warehousing & Logistics',
  'Customer Service (BPO)',
  'Manufacturing',
  'Retail & Store Operations',
  'Hospitality & Front Desk',
  'Real Estate & Property Management',
  'Healthcare & Diagnostics',
  'Agriculture & Export',
  'Construction & Engineering',
  'Food & Beverage (F&B / Cook)',
  'Housekeeping',
  'Admin & Technical Support',
  'Other',
];

export function targetById(id) {
  return JOB_TARGETS.find((j) => j.id === id);
}

export const STAGE_META = {
  registered: { label: 'Registered', color: 'var(--muted-fg)' },
  profiling: { label: 'Profiling', color: 'var(--blue)' },
  profiled: { label: 'Profiled — Ready', color: 'var(--primary)' },
  sent: { label: 'Sent to Recruitment', color: 'var(--green)' },
};

export function boardColumn(candidate) {
  if (candidate.sentToRecruitment) return 'sent';
  return candidate.stage;
}

export const COLUMN_ORDER = ['registered', 'profiling', 'profiled', 'sent'];

export function initials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const STATUS_META = {
  active: { label: 'Active', color: 'var(--green)' },
  inactive: { label: 'Inactive', color: 'var(--muted-fg)' },
  on_hold: { label: 'On Hold', color: 'var(--amber)' },
  hired: { label: 'Hired', color: 'var(--green)' },
  rejected: { label: 'Rejected', color: 'var(--red)' },
  withdrawn: { label: 'Withdrawn', color: 'var(--muted-fg)' },
  blacklisted: { label: 'Blacklisted', color: 'var(--red)' },
};

export const STATUS_OPTIONS = Object.keys(STATUS_META);

export const ROLES = ['admin', 'registration_staff', 'recruiter'];

export const ROLE_LABELS = {
  admin: 'Admin',
  registration_staff: 'Registration Staff',
  recruiter: 'Recruiter',
};

export const PERMISSIONS = {
  registerApplicant: { admin: true, registration_staff: true, recruiter: true },
  editBasicInfo: { admin: true, registration_staff: true, recruiter: true },
  editSkills: { admin: true, registration_staff: true, recruiter: true },
  editWorkHistory: { admin: true, registration_staff: true, recruiter: true },
  editEducation: { admin: true, registration_staff: true, recruiter: true },
  uploadDocuments: { admin: true, registration_staff: true, recruiter: true },
  changeStage: { admin: true, registration_staff: true, recruiter: true },
  changeStatus: { admin: true, registration_staff: true, recruiter: true },
  sendToRecruitment: { admin: true, registration_staff: true, recruiter: true },
  deleteApplicant: { admin: true, registration_staff: false, recruiter: false },
};

export function hasPermission(role, action) {
  const rule = PERMISSIONS[action];
  if (!rule) return false;
  return Boolean(rule[role]);
}

export function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function nextRegId(candidates = []) {
  if (!candidates || !candidates.length) return 'APP-001';
  const numbers = candidates
    .map((c) => {
      const match = c.regId?.match(/APP-(\d+)/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));
  const max = numbers.length > 0 ? Math.max(...numbers) : 0;
  return `APP-${String(max + 1).padStart(3, '0')}`;
}

export const EDUCATION_LEVELS = ['Elementary', 'High School', 'College', 'Vocational'];