import api from '../../../services/apiClient';

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
import { CLIENTS } from '../../client-management/data/mockClients';
import { buildSynchronizedJobOrders } from '../../job-order-management/services/JobOrderManagementService';

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

export function getAllJobTargets() {
  const map = new Map();

  // 1. Read all real client job orders directly from Client Management (CLIENTS)
  (CLIENTS || []).forEach((client) => {
    (client.jobs || []).forEach((job, idx) => {
      const title = job.title || '';
      if (!title) return;
      const key = `${title.toLowerCase()}|${client.name.toLowerCase()}`;
      const category = mapCategoryForJob({ title, client: client.name });
      const keywords = (job.requirements && job.requirements.length > 0)
        ? job.requirements.map((r) => r.toLowerCase().split(/\s+/)).flat().filter((w) => w.length > 3)
        : (job.tags || []).map((t) => t.toLowerCase());

      map.set(key, {
        id: job.ref || `jo-${client.name.slice(0, 3).toLowerCase()}-${idx + 1}`,
        ref: job.ref || `jo-${client.name.slice(0, 3).toLowerCase()}-${idx + 1}`,
        title,
        client: client.name,
        category,
        keywords: Array.from(new Set([
          ...title.toLowerCase().split(/[\s·,-/()]+/).filter((w) => w.length > 2),
          ...(job.tags || []).map((t) => t.toLowerCase()),
          ...keywords,
        ])),
        rate: job.rate || client.rate,
        location: job.location || client.address,
        status: job.badge || 'open',
      });
    });
  });

  // 2. Read live synchronized and submitted job orders (including approved PRFs)
  try {
    const synched = buildSynchronizedJobOrders();
    (synched || []).forEach((j) => {
      const title = j.title || '';
      const client = j.client || '';
      if (!title || !client) return;
      const key = `${title.toLowerCase()}|${client.toLowerCase()}`;
      const category = mapCategoryForJob(j);
      const existing = map.get(key);

      map.set(key, {
        id: j.ref || j.id || `jo-sync-${key}`,
        ref: j.ref || j.id,
        title,
        client,
        category: j.category || existing?.category || category,
        keywords: existing?.keywords || Array.from(new Set([
          ...title.toLowerCase().split(/[\s·,-/()]+/).filter((w) => w.length > 2),
          ...(j.tags || []).map((t) => t.toLowerCase()),
        ])),
        rate: j.rate,
        location: j.location,
        status: j.status,
      });
    });
  } catch {}

  // 3. Inspect localStorage for freshly created/approved job orders
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ismers_client_job_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((j) => {
            const title = j.title || j.position || '';
            const client = j.client || j.company || '';
            if (!title || !client) return;
            const key = `${title.toLowerCase()}|${client.toLowerCase()}`;
            const category = mapCategoryForJob(j);
            const existing = map.get(key);
            map.set(key, {
              id: j.ref || j.id || `jo-custom-${key}`,
              ref: j.ref || j.id,
              title,
              client,
              category: j.category || existing?.category || category,
              keywords: existing?.keywords || Array.from(new Set([
                ...title.toLowerCase().split(/[\s·,-/()]+/).filter((w) => w.length > 2),
                ...(j.tags || []).map((t) => t.toLowerCase()),
              ])),
              rate: j.rate,
              location: j.location,
              status: j.status,
            });
          });
        }
      }
    } catch {}
  }

  return Array.from(map.values());
}

export const JOB_TARGETS = getAllJobTargets();

export function computeMatchScore(candidate, job) {
  if (!job || !candidate) return 0;

  const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase().trim()).filter(Boolean);
  const workHistory = candidate.workHistory || [];
  const workHistoryText = workHistory.map((w) => `${w.role || ''} ${w.company || ''}`).join(' ').toLowerCase().trim();
  const summaryText = (candidate.summary || candidate.headline || '').toLowerCase().trim();

  // 1. Strict zero start: if candidate has no skills, work history, or summary text -> 0%
  if (candidateSkills.length === 0 && !workHistoryText && !summaryText) {
    return 0;
  }

  const candCat = (candidate.category || '').toLowerCase().trim();
  const jobCat = (job.category || '').toLowerCase().trim();
  const jobTitle = (job.title || '').toLowerCase().trim();

  // Extract core keywords from job title & tags
  const rawKeywords = [
    ...jobTitle.split(/[\s·,-/()]+/).filter((w) => w.length > 2 && !['and', 'for', 'the', 'with', 'associate', 'officer', 'staff', 'operator', 'attendant', 'crew'].includes(w)),
    ...(job.tags || []).map((t) => t.toLowerCase()),
  ];

  const filler = new Set(['high', 'school', 'graduate', 'least', 'year', 'years', 'month', 'months', 'willing', 'work', 'able', 'plus', 'preferred', 'good', 'with', 'must', 'have', 'experience', 'relocate', 'provided', 'housing']);
  const coreKeywords = Array.from(new Set(
    rawKeywords
      .map((k) => k.toLowerCase().trim())
      .filter((k) => k.length > 2 && !filler.has(k))
  ));

  const allCandidateText = [...candidateSkills, workHistoryText, summaryText].join(' ');

  // 2. Count matching skills against job title, tags, and category keywords
  let matchingSkillCount = 0;
  candidateSkills.forEach((skill) => {
    const directHit = coreKeywords.some((kw) => skill.includes(kw) || kw.includes(skill));
    const catHit = jobCat && jobCat.split(/[\s&/()]+/).some((cw) => cw.length > 2 && (skill.includes(cw) || cw.includes(skill)));
    const titleHit = jobTitle && jobTitle.split(/[\s&/()]+/).some((tw) => tw.length > 2 && (skill.includes(tw) || tw.includes(skill)));

    if (directHit || titleHit || catHit) {
      matchingSkillCount += 1;
    }
  });

  // 3. Keyword hit count from all text
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

  // 4. Progressive scoring starting from 0%
  // Each matching skill adds ~18% points
  const skillsScore = Math.min(matchingSkillCount * 18, 70);

  // Keyword coverage (up to 15 pts)
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
    }
  }

  // Work history bonus
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
  const targets = getAllJobTargets();
  const idStr = String(id).trim().toLowerCase();

  // 1. Direct match on id, ref, depRef
  let found = targets.find(
    (j) =>
      (j.id && j.id.toLowerCase() === idStr) ||
      (j.ref && j.ref.toLowerCase() === idStr) ||
      (j.depRef && j.depRef.toLowerCase() === idStr)
  );
  if (found) return found;

  // 2. Direct match on job title
  found = targets.find((j) => j.title && j.title.toLowerCase() === idStr);
  if (found) return found;

  // 3. Numeric extraction: e.g. 'jo22' -> 22, 'JO-022' -> 22, 'PRF-2026-0022' -> 22
  const numMatch = idStr.match(/(?:jo|prf|dep|prf-2026-)?-?0*(\d+)/i);
  if (numMatch && numMatch[1]) {
    const num = parseInt(numMatch[1], 10);
    found = targets.find((j) => {
      const jNumMatch = (j.ref || j.id || j.depRef || '').toLowerCase().match(/(?:jo|prf|dep|prf-2026-)?-?0*(\d+)/i);
      return jNumMatch && parseInt(jNumMatch[1], 10) === num;
    });
    if (found) return found;
  }

  // 4. Substring title match
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