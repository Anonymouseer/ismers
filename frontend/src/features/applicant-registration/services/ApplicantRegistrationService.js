import api from '../../../services/apiClient.js';

// ── API CLIENT FUNCTIONS ──

export async function fetchApplicantsApi() {
  const res = await api.get('/applicants');
  return res.data;
}

export async function fetchApplicantApi(regId) {
  const res = await api.get(`/applicants/${regId}`);
  return res.data;
}

export async function createApplicantApi(formData) {
  try {
    const res = await api.post('/applicants', formData);
    return res.data;
  } catch (err) {
    const data = err.response?.data || {};
    return { ok: false, duplicate: data.duplicate, message: data.message || 'Error creating applicant' };
  }
}

export async function updateBasicInfoApi(regId, patchData) {
  try {
    const res = await api.put(`/applicants/${regId}`, patchData);
    return res.data;
  } catch (err) {
    const data = err.response?.data || {};
    return { ok: false, duplicate: data.duplicate, message: data.message || 'Error updating applicant' };
  }
}

export async function deleteApplicantApi(regId) {
  const res = await api.delete(`/applicants/${regId}`);
  return res.data;
}

// ── Sub-resource API Calls ──

export async function addSkillApi(regId, skill) {
  const res = await api.post(`/applicants/${regId}/skills`, { skill });
  return res.data;
}

export async function removeSkillApi(regId, skillId) {
  const res = await api.delete(`/applicants/${regId}/skills/${skillId}`);
  return res.data;
}

export async function addWorkHistoryApi(regId, entry) {
  const res = await api.post(`/applicants/${regId}/work-history`, entry);
  return res.data;
}

export async function removeWorkHistoryApi(regId, workId) {
  const res = await api.delete(`/applicants/${regId}/work-history/${workId}`);
  return res.data;
}

export async function addEducationApi(regId, entry) {
  const res = await api.post(`/applicants/${regId}/education`, entry);
  return res.data;
}

export async function removeEducationApi(regId, eduId) {
  const res = await api.delete(`/applicants/${regId}/education/${eduId}`);
  return res.data;
}

export async function addDocumentApi(regId, docData) {
  const res = await api.post(`/applicants/${regId}/documents`, docData);
  return res.data;
}

export async function removeDocumentApi(regId, docId) {
  const res = await api.delete(`/applicants/${regId}/documents/${docId}`);
  return res.data;
}

export async function addReferenceApi(regId, entry) {
  const res = await api.post(`/applicants/${regId}/references`, entry);
  return res.data;
}

export async function removeReferenceApi(regId, refId) {
  const res = await api.delete(`/applicants/${regId}/references/${refId}`);
  return res.data;
}

// ── Workflow Stage & Status API Calls ──

export async function updateStageApi(regId, stage) {
  const res = await api.patch(`/applicants/${regId}/stage`, { stage });
  return res.data;
}

export async function updateStatusApi(regId, status) {
  const res = await api.patch(`/applicants/${regId}/status`, { status });
  return res.data;
}

export async function updateCategoryApi(regId, category) {
  const res = await api.patch(`/applicants/${regId}/category`, { category });
  return res.data;
}

export async function updateTargetJobApi(regId, targetJobId, jobLabel) {
  const res = await api.patch(`/applicants/${regId}/target-job`, { targetJobId, jobLabel });
  return res.data;
}

export async function sendToRecruitmentApi(regId) {
  const res = await api.post(`/applicants/${regId}/send-to-recruitment`);
  return res.data;
}

export async function returnToProfilingApi(regId) {
  const res = await fetch(`${API_BASE}/${regId}/return-to-profiling`, { method: 'POST' });
  return res.json();
}

export async function bulkReturnToProfilingApi() {
  const res = await fetch(`${API_BASE}/bulk-return-to-profiling`, { method: 'POST' });
  return res.json();
}

// ── MATCH SCORING & CLIENT MANAGEMENT DATA SYNC ──
import { CLIENTS } from '../../client-management/data/mockClients.js';
import { buildSynchronizedJobOrders } from '../../job-order-management/services/JobOrderManagementService.js';

export function mapCategoryForJob(job) {
  if (job.category) return job.category;
  const title = (job.title || '').toLowerCase();
  const client = (job.client || '').toLowerCase();

  if (title.includes('warehouse') || title.includes('forklift') || title.includes('driver') || title.includes('inventory') || title.includes('logistics') || client.includes('logistics') || client.includes('abc')) {
    return 'Warehousing & Logistics';
  }
  if (title.includes('csr') || title.includes('customer service') || title.includes('bpo') || title.includes('technical support') || title.includes('sales dev') || title.includes('team leader') || title.includes('tier') || client.includes('bpo') || client.includes('northline')) {
    return 'Customer Service (BPO)';
  }
  if (title.includes('machine') || title.includes('quality') || title.includes('production') || title.includes('packaging') || title.includes('assembly') || client.includes('manufacturing') || client.includes('delta')) {
    return 'Manufacturing';
  }
  if (title.includes('retail') || title.includes('cashier') || title.includes('merchandiser') || title.includes('sales associate') || title.includes('store') || client.includes('retail') || client.includes('coastal')) {
    return 'Retail & Store Operations';
  }
  if (title.includes('cook') || title.includes('chef') || title.includes('f&b') || title.includes('server') || title.includes('dining') || title.includes('kitchen') || title.includes('food')) {
    return 'Food & Beverage (F&B / Cook)';
  }
  if (title.includes('hotel') || title.includes('front desk') || title.includes('guest relations') || title.includes('concierge') || title.includes('housekeeping') || title.includes('hospitality') || client.includes('hospitality') || client.includes('sunrise')) {
    return 'Hospitality & Front Desk';
  }
  if (title.includes('construction') || title.includes('engineer') || title.includes('welder') || title.includes('heavy equipment') || title.includes('crane') || title.includes('safety officer') || client.includes('builders') || client.includes('apex')) {
    return 'Construction & Engineering';
  }
  if (title.includes('developer') || title.includes('devops') || title.includes('qa automation') || title.includes('it support') || client.includes('vantage') || client.includes('tech')) {
    return 'Admin & Technical Support';
  }
  if (title.includes('nurse') || title.includes('medical') || title.includes('clinic') || title.includes('pharmacy') || client.includes('everwell') || client.includes('health')) {
    return 'Healthcare & Diagnostics';
  }
  return 'Customer Service (BPO)';
}

export const CANONICAL_JOB_ORDERS = [
  { id: 'jo1', ref: 'JO-001', title: 'Warehouse Associate', client: 'ABC Logistics', category: 'Warehousing & Logistics', tags: ['Warehousing', 'Entry-level', 'Shifting Schedule', 'On-site'], keywords: ['warehouse', 'associate', 'logistics', 'pallet', 'stock', 'picking', 'packing', 'inventory'], aliases: ['jo-abc-1'] },
  { id: 'jo2', ref: 'JO-002', title: 'Forklift Operator', client: 'ABC Logistics', category: 'Warehousing & Logistics', tags: ['Warehousing', 'Licensed', 'Heavy Equipment', 'On-site'], keywords: ['forklift', 'operator', 'warehouse', 'logistics', 'pallet', 'stacking', 'material handling', 'wms', 'inventory'], aliases: ['jo-abc-2'] },
  { id: 'jo3', ref: 'JO-003', title: 'Inventory Clerk', client: 'ABC Logistics', category: 'Warehousing & Logistics', tags: ['Warehousing', 'Inventory', 'Completed'], keywords: ['inventory', 'clerk', 'stock', 'wms', 'cycle count', 'sorting', 'packing', 'pallet', 'barcode', 'scanning', 'counting', 'tallying', 'warehouse', 'logistics'], aliases: ['jo-abc-3'] },
  { id: 'jo4', ref: 'JO-004', title: 'Delivery Driver', client: 'ABC Logistics', category: 'Warehousing & Logistics', tags: ['Logistics', 'Driving', 'On-site'], keywords: ['driver', 'delivery', 'license', 'courier', 'transport', 'logistics', 'warehouse'], aliases: ['jo-abc-4'] },
  { id: 'jo5', ref: 'JO-005', title: 'Customer Service Representative', client: 'Northline BPO', category: 'Customer Service (BPO)', tags: ['BPO', 'Voice/Non-Voice', 'Night Shift', 'Urgent'], keywords: ['customer service', 'csr', 'crm', 'english proficiency', 'call center', 'customer support', 'communication', 'bpo', 'voice'] },
  { id: 'jo6', ref: 'JO-006', title: 'Technical Support Agent', client: 'Northline BPO', category: 'Customer Service (BPO)', tags: ['BPO', 'Technical', 'Night Shift'], keywords: ['technical support', 'troubleshooting', 'ticketing', 'networking', 'bpo', 'it support'] },
  { id: 'jo7', ref: 'JO-007', title: 'Sales Development Representative', client: 'Northline BPO', category: 'Customer Service (BPO)', tags: ['BPO', 'Sales', 'Night Shift'], keywords: ['sales', 'outbound', 'inbound', 'crm', 'cold calling', 'leads', 'bpo', 'sdr'] },
  { id: 'jo8', ref: 'JO-008', title: 'Team Leader - Customer Experience', client: 'Northline BPO', category: 'Customer Service (BPO)', tags: ['BPO', 'Leadership', 'Night Shift'], keywords: ['team leader', 'supervisor', 'bpo', 'coaching', 'kpi', 'csat', 'leadership'] },
  { id: 'jo9', ref: 'JO-009', title: 'Machine Operator', client: 'Delta Manufacturing', category: 'Manufacturing', tags: ['Manufacturing', 'Urgent', 'Rotating Shift', 'On-site'], keywords: ['machine operation', 'quality inspection', 'safety compliance', 'production', 'troubleshooting', 'manufacturing', 'assembly'] },
  { id: 'jo10', ref: 'JO-010', title: 'Quality Control Inspector', client: 'Delta Manufacturing', category: 'Manufacturing', tags: ['Manufacturing', 'Quality Control', 'Technical'], keywords: ['quality control', 'inspection', 'qc', 'calipers', 'manufacturing', 'specifications', 'qa'] },
  { id: 'jo11', ref: 'JO-011', title: 'Production Line Supervisor', client: 'Delta Manufacturing', category: 'Manufacturing', tags: ['Manufacturing', 'Leadership', 'Industrial'], keywords: ['supervisor', 'production line', 'kpi', 'line balancing', 'manufacturing', 'leadership'] },
  { id: 'jo12', ref: 'JO-012', title: 'Packaging Associate', client: 'Delta Manufacturing', category: 'Manufacturing', tags: ['Manufacturing', 'Packaging', 'Entry-level'], keywords: ['packaging', 'sorting', 'labeling', 'finished goods', 'packing', 'manufacturing'] },
  { id: 'jo13', ref: 'JO-013', title: 'Admin Assistant', client: 'Coastal Retail Group', category: 'Retail & Store Operations', tags: ['Retail', 'Administrative', 'Office'], keywords: ['admin', 'assistant', 'clerical', 'data entry', 'scheduling', 'office', 'retail'] },
  { id: 'jo14', ref: 'JO-014', title: 'Sales Associate', client: 'Coastal Retail Group', category: 'Retail & Store Operations', tags: ['Retail', 'Sales', 'Customer Facing'], keywords: ['sales', 'associate', 'retail', 'customer facing', 'stocking', 'upselling'] },
  { id: 'jo15', ref: 'JO-015', title: 'Store Cashier', client: 'Coastal Retail Group', category: 'Retail & Store Operations', tags: ['Retail', 'Cashier', 'POS'], keywords: ['cashier', 'pos', 'cash handling', 'retail', 'receipt issuance', 'customer service'] },
  { id: 'jo16', ref: 'JO-016', title: 'Visual Merchandiser', client: 'Coastal Retail Group', category: 'Retail & Store Operations', tags: ['Retail', 'Visual Merchandising', 'Creative'], keywords: ['merchandiser', 'visual', 'display', 'retail layout', 'branding', 'retail'] },
  { id: 'jo17', ref: 'JO-017', title: 'Front Desk Associate', client: 'Sunrise Hospitality Group', category: 'Hospitality & Front Desk', tags: ['Hospitality', 'Front Desk', 'Resort'], keywords: ['front desk', 'guest relations', 'booking systems', 'hospitality', 'customer service', 'reception', 'visitor log'] },
  { id: 'jo18', ref: 'JO-018', title: 'Housekeeping Staff', client: 'Sunrise Hospitality Group', category: 'Hospitality & Front Desk', tags: ['Hospitality', 'Housekeeping', 'Resort'], keywords: ['housekeeping', 'cleaning', 'room turnaround', 'resort', 'hospitality', 'sanitation'] },
  { id: 'jo19', ref: 'JO-019', title: 'Food & Beverage Server', client: 'Sunrise Hospitality Group', category: 'Food & Beverage (F&B / Cook)', tags: ['Hospitality', 'F&B', 'Resort'], keywords: ['f&b', 'server', 'waiter', 'restaurant', 'dining', 'hospitality', 'table service', 'banquet'] },
  { id: 'jo20', ref: 'JO-020', title: 'Maintenance Technician', client: 'Sunrise Hospitality Group', category: 'Hospitality & Front Desk', tags: ['Hospitality', 'Facilities', 'Maintenance'], keywords: ['maintenance', 'technician', 'electrical', 'plumbing', 'repairs', 'facilities'] },
  { id: 'jo21', ref: 'JO-021', title: 'Leasing Consultant', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', tags: ['Real Estate', 'Leasing', 'Commercial'], keywords: ['leasing', 'real estate', 'sales', 'viewings', 'property', 'contracts'] },
  { id: 'jo22', ref: 'JO-022', title: 'Property Administrator', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', tags: ['Real Estate', 'Property Management', 'Admin'], keywords: ['property administrator', 'tenant records', 'lease renewals', 'admin', 'real estate'] },
  { id: 'jo23', ref: 'JO-023', title: 'Front Desk Officer', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', tags: ['Real Estate', 'Front Desk', 'Concierge'], keywords: ['front desk', 'reception', 'lobby', 'concierge', 'visitor logs', 'real estate'] },
  { id: 'jo24', ref: 'JO-024', title: 'Maintenance Coordinator', client: 'Prime Realty Corp', category: 'Real Estate & Property Management', tags: ['Real Estate', 'Facilities', 'Operations'], keywords: ['maintenance coordinator', 'repairs', 'facilities', 'building systems', 'real estate'] },
  { id: 'jo25', ref: 'JO-025', title: 'Medical Technologist', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', tags: ['Healthcare', 'PRC Licensed', 'Laboratory'], keywords: ['medical technologist', 'medtech', 'lab testing', 'specimen analysis', 'doh', 'healthcare'] },
  { id: 'jo26', ref: 'JO-026', title: 'Radiologic Technologist', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', tags: ['Healthcare', 'RadTech', 'PRC Licensed'], keywords: ['radiologic', 'x-ray', 'imaging', 'radtech', 'radiation safety', 'healthcare'] },
  { id: 'jo27', ref: 'JO-027', title: 'Patient Service Representative', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', tags: ['Healthcare', 'Patient Care', 'HMO'], keywords: ['patient service', 'registration', 'healthcare front desk', 'appointments', 'hmo'] },
  { id: 'jo28', ref: 'JO-028', title: 'Billing Clerk', client: 'Metro Health Diagnostics', category: 'Healthcare & Diagnostics', tags: ['Healthcare', 'Billing', 'Finance'], keywords: ['billing', 'hmo', 'insurance claims', 'patient accounts', 'accounting', 'medical records'] },
  { id: 'jo29', ref: 'JO-029', title: 'Packing Associate', client: 'GreenFields Agri Export', category: 'Agriculture & Export', tags: ['Agriculture', 'Cold Chain', 'Export'], keywords: ['packing', 'produce', 'grading', 'harvest', 'hygiene', 'export', 'cold chain'] },
  { id: 'jo30', ref: 'JO-030', title: 'QA Inspector (Agri)', client: 'GreenFields Agri Export', category: 'Agriculture & Export', tags: ['Agriculture', 'Quality Assurance', 'Export'], keywords: ['qa inspector', 'quality control', 'export-grade', 'agri', 'produce', 'standards'] },
  { id: 'jo31', ref: 'JO-031', title: 'Logistics Coordinator', client: 'GreenFields Agri Export', category: 'Agriculture & Export', tags: ['Agriculture', 'Logistics', 'Shipping'], keywords: ['logistics coordinator', 'container bookings', 'freight', 'export documentation', 'shipping'] },
  { id: 'jo32', ref: 'JO-032', title: 'Farm Supervisor', client: 'GreenFields Agri Export', category: 'Agriculture & Export', tags: ['Agriculture', 'Supervision', 'Field Ops'], keywords: ['farm supervisor', 'harvest scheduling', 'field crews', 'agriculture', 'supervision'] },
  { id: 'jo33', ref: 'JO-033', title: 'Construction Laborer', client: 'Apex Construction Builders', category: 'Construction & Engineering', tags: ['Construction', 'Labor', 'On-site'], keywords: ['construction', 'laborer', 'material handling', 'masonry', 'site work', 'safety'] },
  { id: 'jo34', ref: 'JO-034', title: 'Site Engineer Assistant', client: 'Apex Construction Builders', category: 'Construction & Engineering', tags: ['Construction', 'Engineering', 'AutoCAD'], keywords: ['site engineer', 'autocad', 'civil engineering', 'inspections', 'plans', 'construction'] },
  { id: 'jo35', ref: 'JO-035', title: 'Safety Officer 2', client: 'Apex Construction Builders', category: 'Construction & Engineering', tags: ['Construction', 'Safety', 'Completed'], keywords: ['safety officer', 'bosh', 'ppe', 'oshs', 'hazard inspection', 'safety'] },
  { id: 'jo36', ref: 'JO-036', title: 'Tower Crane Operator', client: 'Apex Construction Builders', category: 'Construction & Engineering', tags: ['Construction', 'Heavy Equipment', 'Licensed'], keywords: ['tower crane', 'crane operator', 'heavy equipment', 'tesda', 'rigging', 'construction'] },
];

export function getAllJobTargets() {
  const map = new Map();
  const makeKey = (title, client) => `${(title || '').trim().toLowerCase()}|${(client || '').trim().toLowerCase()}`;

  // 1. Seed with canonical 36 database job orders first
  CANONICAL_JOB_ORDERS.forEach((canonical) => {
    const key = makeKey(canonical.title, canonical.client);
    map.set(key, {
      ...canonical,
      tags: canonical.tags || [],
      keywords: canonical.keywords || [],
      rate: canonical.rate || '₱610/day',
      location: canonical.location || 'Metro Manila',
      status: 'open',
    });
  });

  // 2. Read all client job orders directly from Client Management (CLIENTS)
  (CLIENTS || []).forEach((client) => {
    (client.jobs || []).forEach((job, idx) => {
      const title = (job.title || '').trim();
      const clientName = (client.name || '').trim();
      if (!title || !clientName) return;
      const key = makeKey(title, clientName);
      const category = mapCategoryForJob({ title, client: clientName });
      const existing = map.get(key);

      const resolvedId = job.ref || (clientName.toLowerCase().includes('abc') ? `jo-abc-${idx + 1}` : `jo-${clientName.slice(0, 3).toLowerCase()}-${idx + 1}`);

      map.set(key, {
        ...(existing || {}),
        id: existing?.id || resolvedId,
        ref: existing?.ref || job.ref || resolvedId,
        title,
        client: clientName,
        category: existing?.category || category,
        tags: existing?.tags?.length ? existing.tags : (job.tags || []),
        keywords: existing?.keywords?.length ? existing.keywords : (job.keywords || Array.from(new Set([
          ...title.toLowerCase().split(/[\s·,-/()]+/).filter((w) => w.length > 2),
          ...(job.tags || []).map((t) => t.toLowerCase()),
        ]))),
        rate: job.rate || client.rate || existing?.rate || '₱610/day',
        location: job.location || client.address || existing?.location || 'Metro Manila',
        status: job.badge || existing?.status || 'open',
      });
    });
  });

  // 3. Read live synchronized and submitted job orders (including approved PRFs)
  try {
    const synched = buildSynchronizedJobOrders();
    (synched || []).forEach((j) => {
      const title = (j.title || '').trim();
      const client = (j.client || '').trim();
      if (!title || !client) return;
      const key = makeKey(title, client);
      const category = mapCategoryForJob(j);
      const existing = map.get(key);

      map.set(key, {
        ...(existing || {}),
        id: existing?.id || j.ref || j.id || `jo-sync-${key}`,
        ref: existing?.ref || j.ref || j.id,
        title,
        client,
        category: existing?.category || j.category || category,
        tags: existing?.tags?.length ? existing.tags : (j.tags || []),
        keywords: existing?.keywords?.length ? existing.keywords : (j.keywords || Array.from(new Set([
          ...title.toLowerCase().split(/[\s·,-/()]+/).filter((w) => w.length > 2),
          ...(j.tags || []).map((t) => t.toLowerCase()),
        ]))),
        rate: j.rate || existing?.rate || '₱610/day',
        location: j.location || existing?.location || 'Metro Manila',
        status: j.status || existing?.status || 'open',
      });
    });
  } catch {}

  // 4. Inspect localStorage for freshly created/approved job orders
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ismers_client_job_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((j) => {
            const title = (j.title || j.position || '').trim();
            const client = (j.client || j.company || '').trim();
            if (!title || !client) return;
            const key = makeKey(title, client);
            const category = mapCategoryForJob(j);
            const existing = map.get(key);
            map.set(key, {
              ...(existing || {}),
              id: existing?.id || j.ref || j.id || `jo-custom-${key}`,
              ref: existing?.ref || j.ref || j.id,
              title,
              client,
              category: existing?.category || j.category || category,
              tags: existing?.tags?.length ? existing.tags : (j.tags || []),
              keywords: existing?.keywords?.length ? existing.keywords : (j.keywords || Array.from(new Set([
                ...title.toLowerCase().split(/[\s·,-/()]+/).filter((w) => w.length > 2),
                ...(j.tags || []).map((t) => t.toLowerCase()),
              ]))),
              rate: j.rate || existing?.rate || '₱610/day',
              location: j.location || existing?.location || 'Metro Manila',
              status: j.status || existing?.status || 'open',
            });
          });
        }
      }
    } catch {}
  }

  // Deduplicate strictly by title and client name
  const deduplicated = [];
  const seenKeys = new Set();
  for (const j of map.values()) {
    const k = makeKey(j.title, j.client);
    if (!seenKeys.has(k)) {
      seenKeys.add(k);
      deduplicated.push(j);
    }
  }

  return deduplicated;
}

export const JOB_TARGETS = getAllJobTargets();

export function computeMatchScore(candidate, job) {
  if (!job || !candidate) return 0;

  // Extract candidate skills: support string array and object array { name: string }
  const candidateSkills = (candidate.skills || []).map((s) => {
    if (typeof s === 'string') return s.toLowerCase().trim();
    if (s && typeof s === 'object' && s.name) return String(s.name).toLowerCase().trim();
    return '';
  }).filter(Boolean);

  const workHistory = candidate.workHistory || [];
  const workHistoryText = workHistory.map((w) => `${w.role || ''} ${w.company || ''}`).join(' ').toLowerCase().trim();
  const summaryText = (
    candidate.summary ||
    candidate.headline ||
    candidate.experienceSummary ||
    candidate.experience ||
    ''
  ).toLowerCase().trim();

  // Strict zero start: if candidate has no skills, work history, or summary text -> 0%
  if (candidateSkills.length === 0 && !workHistoryText && !summaryText) {
    return 0;
  }

  const candCat = (candidate.category || '').toLowerCase().trim();
  const jobCat = (job.category || '').toLowerCase().trim();
  const jobTitle = (job.title || '').toLowerCase().trim();

  // Extract core keywords from job title, tags, and keywords
  const rawKeywords = [
    ...jobTitle.split(/[\s·,-/()]+/).filter((w) => w.length > 2 && !['and', 'for', 'the', 'with', 'associate', 'officer', 'staff', 'operator', 'attendant', 'crew'].includes(w)),
    ...(job.tags || []).map((t) => (typeof t === 'string' ? t.toLowerCase().trim() : '')),
    ...(job.keywords || []).map((k) => (typeof k === 'string' ? k.toLowerCase().trim() : '')),
  ];

  const filler = new Set(['high', 'school', 'graduate', 'least', 'year', 'years', 'month', 'months', 'willing', 'work', 'able', 'plus', 'preferred', 'good', 'with', 'must', 'have', 'experience', 'relocate', 'provided', 'housing']);
  const coreKeywords = Array.from(new Set(
    rawKeywords
      .map((k) => k.toLowerCase().trim())
      .filter((k) => k.length > 2 && !filler.has(k))
  ));

  const allCandidateText = [...candidateSkills, workHistoryText, summaryText].join(' ');

  // 1. Count matching skills against job title, tags, category, and core keywords
  let matchingSkillCount = 0;
  candidateSkills.forEach((skill) => {
    const directHit = coreKeywords.some((kw) => skill.includes(kw) || kw.includes(skill));
    const catHit = jobCat && jobCat.split(/[\s&/()]+/).some((cw) => cw.length > 2 && (skill.includes(cw) || cw.includes(skill)));
    const titleHit = jobTitle && jobTitle.split(/[\s&/()]+/).some((tw) => tw.length > 2 && (skill.includes(tw) || tw.includes(skill)));

    if (directHit || titleHit || catHit) {
      matchingSkillCount += 1;
    }
  });

  // 2. Keyword hit count from all candidate text
  let keywordHits = 0;
  coreKeywords.forEach((kw) => {
    if (allCandidateText.includes(kw)) {
      keywordHits += 1;
    }
  });

  // If candidate has ZERO matching skills and ZERO keyword hits for this job -> strictly 0%
  if (matchingSkillCount === 0 && keywordHits === 0) {
    return 0;
  }

  // 3. Progressive scoring
  // Skills component: each matching skill adds ~18 points (up to 70)
  const skillsScore = Math.min(matchingSkillCount * 18, 70);

  // Keyword coverage: up to 15 points
  const keywordScore = coreKeywords.length > 0
    ? (keywordHits / coreKeywords.length) * 15
    : 0;

  // Category alignment bonus (only earned if candidate has active matching skills)
  let categoryBonus = 0;
  if (candCat && jobCat && matchingSkillCount > 0) {
    if (candCat === jobCat) {
      categoryBonus = 10;
    } else if (
      (candCat.includes('hospitality') || candCat.includes('food') || candCat.includes('f&b')) &&
      (jobCat.includes('hospitality') || jobCat.includes('food') || jobCat.includes('f&b'))
    ) {
      categoryBonus = 8;
    } else if (
      (candCat.includes('bpo') || candCat.includes('customer')) &&
      (jobCat.includes('bpo') || jobCat.includes('customer'))
    ) {
      categoryBonus = 8;
    } else if (
      (candCat.includes('logistics') || candCat.includes('warehousing')) &&
      (jobCat.includes('logistics') || jobCat.includes('warehousing'))
    ) {
      categoryBonus = 8;
    } else if (
      candCat.includes('manufacturing') && jobCat.includes('manufacturing')
    ) {
      categoryBonus = 8;
    } else if (
      candCat.includes('retail') && jobCat.includes('retail')
    ) {
      categoryBonus = 8;
    }
  }

  // Work history relevance bonus
  let historyBonus = 0;
  if (workHistoryText && coreKeywords.some((kw) => workHistoryText.includes(kw))) {
    historyBonus = 8;
  }

  const total = Math.round(skillsScore + keywordScore + categoryBonus + historyBonus);
  return Math.min(Math.max(total, 0), 98);
}

export function jobMatchesForCandidate(candidate) {
  if (!candidate?.category) return [];

  const candCatNorm = candidate.category.trim().toLowerCase();
  const targets = getAllJobTargets();

  return targets
    .filter((j) => {
      const jobCatNorm = (j.category || '').trim().toLowerCase();
      if (!jobCatNorm) return false;

      if (jobCatNorm === candCatNorm) return true;

      // Hospitality & Food & Beverage cross-match
      if (
        (candCatNorm.includes('hospitality') || candCatNorm.includes('food') || candCatNorm.includes('f&b')) &&
        (jobCatNorm.includes('hospitality') || jobCatNorm.includes('food') || jobCatNorm.includes('f&b'))
      ) {
        return true;
      }

      // Customer Service & BPO cross-match
      if (
        (candCatNorm.includes('bpo') || candCatNorm.includes('customer service') || candCatNorm.includes('tech')) &&
        (jobCatNorm.includes('bpo') || jobCatNorm.includes('customer service') || jobCatNorm.includes('tech'))
      ) {
        return true;
      }

      // Logistics & Warehousing cross-match
      if (
        (candCatNorm.includes('logistics') || candCatNorm.includes('warehousing')) &&
        (jobCatNorm.includes('logistics') || jobCatNorm.includes('warehousing'))
      ) {
        return true;
      }

      if (candCatNorm.includes('retail') && jobCatNorm.includes('retail')) return true;
      if (candCatNorm.includes('manufacturing') && jobCatNorm.includes('manufacturing')) return true;
      if (candCatNorm.includes('health') && jobCatNorm.includes('health')) return true;
      if (candCatNorm.includes('construction') && jobCatNorm.includes('construction')) return true;
      if (candCatNorm.includes('agri') && jobCatNorm.includes('agri')) return true;
      if (candCatNorm.includes('real estate') && jobCatNorm.includes('real estate')) return true;

      return false;
    })
    .map((j) => ({ job: j, score: computeMatchScore(candidate, j) }))
    .filter((item, index, self) => {
      const key = `${(item.job.title || '').trim().toLowerCase()}|${(item.job.client || '').trim().toLowerCase()}`;
      return index === self.findIndex((other) => `${(other.job.title || '').trim().toLowerCase()}|${(other.job.client || '').trim().toLowerCase()}` === key);
    })
    .sort((a, b) => b.score - a.score || (a.job.title || '').localeCompare(b.job.title || ''));
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
  if (!id) return null;
  const idStr = String(id).trim().toLowerCase();

  // 1. Direct explicit ABC Logistics matches
  if (idStr === 'jo-abc-1') return CANONICAL_JOB_ORDERS[0];
  if (idStr === 'jo-abc-2') return CANONICAL_JOB_ORDERS[1];
  if (idStr === 'jo-abc-3') return CANONICAL_JOB_ORDERS[2];
  if (idStr === 'jo-abc-4') return CANONICAL_JOB_ORDERS[3];

  const targets = getAllJobTargets();

  // 2. Direct match on id, ref, depRef
  let found = targets.find(
    (j) =>
      (j.id && j.id.toLowerCase() === idStr) ||
      (j.ref && j.ref.toLowerCase() === idStr) ||
      (j.depRef && j.depRef.toLowerCase() === idStr)
  );
  if (found) return found;

  // 3. Direct match on canonical collection
  found = CANONICAL_JOB_ORDERS.find(
    (j) =>
      (j.id && j.id.toLowerCase() === idStr) ||
      (j.ref && j.ref.toLowerCase() === idStr)
  );
  if (found) return found;

  // 4. Direct match on job title
  found = targets.find((j) => j.title && j.title.toLowerCase() === idStr);
  if (found) return found;

  // 5. Numeric extraction: e.g. 'jo22' -> 22, 'JO-022' -> 22, 'jo-abc-3' -> 3
  const numMatch = idStr.match(/(?:jo|prf|dep|prf-2026-)?-?0*(\d+)/i);
  if (numMatch && numMatch[1]) {
    const num = parseInt(numMatch[1], 10);
    found = CANONICAL_JOB_ORDERS.find((j) => {
      const jNumMatch = (j.ref || j.id || '').toLowerCase().match(/(?:jo|prf|dep|prf-2026-)?-?0*(\d+)/i);
      return jNumMatch && parseInt(jNumMatch[1], 10) === num;
    });
    if (found) return found;

    found = targets.find((j) => {
      const jNumMatch = (j.ref || j.id || j.depRef || '').toLowerCase().match(/(?:jo|prf|dep|prf-2026-)?-?0*(\d+)/i);
      return jNumMatch && parseInt(jNumMatch[1], 10) === num;
    });
    if (found) return found;
  }

  // 6. Substring title match
  found = targets.find(
    (j) =>
      j.title &&
      (j.title.toLowerCase().includes(idStr) || idStr.includes(j.title.toLowerCase()))
  );
  if (found) return found;

  return null;
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
  change_stage: { admin: true, registration_staff: true, recruiter: true },
  changeStatus: { admin: true, registration_staff: true, recruiter: true },
  sendToRecruitment: { admin: true, registration_staff: true, recruiter: true },
  deleteApplicant: { admin: true, registration_staff: true, recruiter: true },
  delete_candidate: { admin: true, registration_staff: true, recruiter: true },
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