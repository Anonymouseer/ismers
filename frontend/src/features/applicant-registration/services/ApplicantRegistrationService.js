// ApplicantRegistrationService.js
//
// For now this exports static mock data + pure helpers, mirroring the
// original static HTML prototype. Once the Laravel API is ready
// (`/api/v1/applicants`), replace SEED_CANDIDATES with real fetch calls
// (e.g. getAll(), create(), update()) and keep the same shapes so the
// store and components don't need to change.

// Each job target carries a category (for filtering matches to an
// applicant's category) and a small keyword list representing typical
// skills/duties for that role. computeMatchScore() below checks how many
// of these keywords show up in the applicant's skills + work history —
// a transparent, explainable heuristic. This is NOT real AI/resume
// parsing (no backend/file storage exists yet to read an actual resume) —
// swap this function out once that's built, keeping the same 0-100
// output shape so the UI doesn't need to change.
export const JOB_TARGETS = [
  {
    id: 'jo1', title: 'Warehouse Associate', client: 'ABC Logistics', category: 'Warehouse & Logistics',
    keywords: ['inventory', 'warehouse', 'pallet', 'logistics', 'stock', 'picking', 'packing'],
  },
  {
    id: 'jo2', title: 'Forklift Operator', client: 'ABC Logistics', category: 'Warehouse & Logistics',
    keywords: ['forklift', 'warehouse', 'logistics', 'pallet', 'material handling', 'inventory'],
  },
  {
    id: 'jo3', title: 'Customer Service Rep', client: 'Northline BPO', category: 'Customer Service',
    keywords: ['customer service', 'crm', 'english proficiency', 'call center', 'customer support', 'communication'],
  },
  {
    id: 'jo4', title: 'Technical Support Agent', client: 'Northline BPO', category: 'Customer Service',
    keywords: ['technical troubleshooting', 'ticketing', 'networking', 'technical support', 'troubleshooting'],
  },
  {
    id: 'jo5', title: 'Machine Operator', client: 'Delta Manufacturing', category: 'Other',
    keywords: ['machine operation', 'quality inspection', 'safety compliance', 'production', 'troubleshooting'],
  },
  {
    id: 'jo6', title: 'Front Desk Associate', client: 'Sunrise Hospitality Group', category: 'Hospitality',
    keywords: ['front desk', 'guest relations', 'booking systems', 'hospitality', 'customer service', 'front office'],
  },
];

// Computes a 0-100 keyword-overlap score between an applicant and a job
// target. Checks the applicant's skills + work history (role/company text)
// against the job's keyword list.
export function computeMatchScore(candidate, job) {
  if (!job.keywords || !job.keywords.length) return 0;
  const searchable = [
    ...(candidate.skills || []),
    ...(candidate.workHistory || []).map((w) => `${w.role} ${w.company}`),
  ].join(' ').toLowerCase();

  const matched = job.keywords.filter((kw) => searchable.includes(kw.toLowerCase())).length;
  return Math.round((matched / job.keywords.length) * 100);
}

// Returns job targets in the applicant's category, each with a computed
// score, sorted highest-match first.
export function jobMatchesForCandidate(candidate) {
  if (!candidate.category) return [];
  return JOB_TARGETS
    .filter((j) => j.category === candidate.category)
    .map((j) => ({ job: j, score: computeMatchScore(candidate, j) }))
    .sort((a, b) => b.score - a.score);
}

// Matches the paper process's "segregate" step (Housekeeping/F&B/Cook),
// plus a few extra categories to cover the existing mock job targets.
export const CATEGORIES = [
  'Housekeeping',
  'F&B',
  'Cook',
  'Warehouse & Logistics',
  'Customer Service',
  'Hospitality',
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

// board column is derived, not stored directly, since "sent" overrides "profiled"
export function boardColumn(candidate) {
  if (candidate.sentToRecruitment) return 'sent';
  return candidate.stage; // 'registered' | 'profiling' | 'profiled'
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

// ---- APPLICANT STATUS (separate from workflow stage) ----
// A candidate's board column tells you where they are in the pipeline.
// Status tells you their overall standing regardless of pipeline position
// (e.g. Stage: Profiled + Status: On Hold is valid and expected).
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

// ---- ROLES / PERMISSIONS ----
// NOTE: this is a frontend-only stand-in until real auth/roles exist on the
// backend. There is no login system yet, so the "current role" is just a
// dev switcher in the topbar (see RoleSwitcher.jsx) — swap this for real
// session/user data once auth is wired up.
export const ROLES = ['admin', 'registration_staff', 'recruiter'];

export const ROLE_LABELS = {
  admin: 'Admin',
  registration_staff: 'Registration Staff',
  recruiter: 'Recruiter',
};

// Matches the permissions table from the planning doc. `true` = allowed,
// false = not allowed. ("Maybe" for Recruiter/Change Stage was resolved to
// true — allowed — matching the note that recruiters may still need to
// advance a stage; revisit once real business rules are confirmed.)
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

// The paper application form has 4 fixed education rows (Elementary, High
// School, College, Vocational) rather than a free-form list — the intake
// form uses these; profiling can still add more freely via EducationSection.
export const EDUCATION_LEVELS = ['Elementary', 'High School', 'College', 'Vocational'];

// Generates the next REG-### id by looking at the highest existing number.
// A real backend would do this server-side (e.g. an auto-increment column)
// — this is a stand-in until then.
export function nextRegId(candidates) {
  const nums = candidates
    .map((c) => parseInt(c.regId.replace('REG-', ''), 10))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `REG-${String(next).padStart(3, '0')}`;
}

// ---- SEED DATA (mock — as if these people already registered externally) ----
// Every applicant below has at least one entry in skills, work history,
// education, and documents — even ones still at "Registered" — since in
// practice a walk-in applicant usually hands over a resume/ID at intake.
export const SEED_CANDIDATES = [
  // ---- REGISTERED ----
  {
    regId: 'REG-001', name: 'Maricel Andrade', email: 'maricel.andrade@email.com', phone: '0917-201-3345',
    alternateContact: '0917-201-9900', address: '18 Mabini St.', location: 'Valenzuela City',
    middleName: 'Santiago', suffix: '', dateOfBirth: '2002-03-14', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'No formal work experience yet',
    targetJobId: null,
    skills: ['Basic computer literacy'],
    workHistory: [{ role: 'On-the-job Trainee', company: 'Valenzuela City Hall', duration: '2024 (OJT, 3 months)' }],
    education: [{ id: 'e1', school: 'Valenzuela City NHS', degree: 'General Academic Strand', level: 'Senior High School', startYear: '2020', endYear: '2022' }],
    documents: [{ id: 'd1', name: 'Maricel_Andrade_ValidID.jpg', type: 'Valid ID', uploadedDate: 'Jul 20, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 20, 2026',
    history: [
      { id: 'h1', date: 'Jul 20, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 20, 2026', text: 'Valid ID uploaded' },
    ],
  },
  {
    regId: 'REG-002', name: 'Cherry Bacani', email: 'cherry.bacani@email.com', phone: '0918-442-9981',
    alternateContact: '', address: '', location: 'Caloocan City',
    middleName: 'Lopez', suffix: '', dateOfBirth: '2001-08-05', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '6 months retail experience',
    targetJobId: null,
    skills: ['Cash handling', 'Customer assistance'],
    workHistory: [{ role: 'Sales Clerk', company: 'Puregold Caloocan', duration: '2025 (6 months)' }],
    education: [{ id: 'e1', school: 'Caloocan City Science HS', degree: 'STEM Strand', level: 'Senior High School', startYear: '2019', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Cherry_Bacani_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 21, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 21, 2026',
    history: [
      { id: 'h1', date: 'Jul 21, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 21, 2026', text: 'Resume uploaded' },
    ],
  },
  {
    regId: 'REG-003', name: 'Mark Villaruel', email: 'mark.villaruel@email.com', phone: '0920-113-7762',
    alternateContact: '', address: '', location: 'Quezon City',
    middleName: 'Dizon', suffix: '', dateOfBirth: '1999-12-01', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year call center experience',
    targetJobId: null,
    skills: ['Customer service', 'Basic troubleshooting'],
    workHistory: [{ role: 'Customer Support Associate', company: 'ConnectPH BPO', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'University of the East', degree: 'BS Psychology (2 yrs completed)', level: "Bachelor's Degree (undergrad)", startYear: '2019', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Mark_Villaruel_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 22, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 22, 2026',
    history: [
      { id: 'h1', date: 'Jul 22, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 22, 2026', text: 'Resume uploaded' },
    ],
  },
  {
    regId: 'REG-009', name: 'Kevin Manalo', email: 'kevin.manalo@email.com', phone: '0921-556-3345',
    alternateContact: '', address: '', location: 'Marikina City',
    middleName: 'Torres', suffix: '', dateOfBirth: '2000-05-22', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '8 months food service experience',
    targetJobId: null,
    skills: ['Food handling', 'POS systems'],
    workHistory: [{ role: 'Crew Member', company: 'Jollibee Marikina', duration: '2025 (8 months)' }],
    education: [{ id: 'e1', school: 'Marikina Polytechnic College', degree: 'Food & Beverage Services NC II', level: 'TESDA / Vocational', startYear: '2023', endYear: '2024' }],
    documents: [{ id: 'd1', name: 'Kevin_Manalo_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 23, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 23, 2026',
    history: [
      { id: 'h1', date: 'Jul 23, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 23, 2026', text: 'Resume uploaded' },
    ],
  },
  {
    regId: 'REG-010', name: 'Trisha Gomez', email: 'trisha.gomez@email.com', phone: '0922-889-1147',
    alternateContact: '0922-889-2200', address: '', location: 'Pasig City',
    middleName: 'Villamor', suffix: '', dateOfBirth: '2003-01-09', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'Fresh graduate, internship experience only',
    targetJobId: null,
    skills: ['MS Office', 'Data entry'],
    workHistory: [{ role: 'Admin Intern', company: 'Pasig City Cooperative', duration: '2025 (OJT, 4 months)' }],
    education: [{ id: 'e1', school: 'Rizal Technological University', degree: 'BS Office Administration', level: "Bachelor's Degree", startYear: '2021', endYear: '2025' }],
    documents: [{ id: 'd1', name: 'Trisha_Gomez_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 24, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 24, 2026',
    history: [
      { id: 'h1', date: 'Jul 24, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 24, 2026', text: 'Resume uploaded' },
    ],
  },

  // ---- PROFILING ----
  {
    regId: 'REG-004', name: 'Julius Tabora', email: 'julius.tabora@email.com', phone: '0917-556-2210',
    alternateContact: '0917-990-1122', address: '12 Rizal St.', location: 'Valenzuela City',
    middleName: 'Santos', suffix: '', dateOfBirth: '1998-04-12', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years warehouse experience',
    targetJobId: 'jo1',
    skills: ['Inventory tallying', 'Pallet jack operation'],
    workHistory: [{ role: 'Warehouse Helper', company: 'CitiMart Distribution', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Valenzuela City NHS', degree: 'General Academic Strand', level: 'Senior High School', startYear: '2020', endYear: '2022' }],
    documents: [{ id: 'd1', name: 'Julius_Tabora_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 15, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 15, 2026',
    history: [
      { id: 'h1', date: 'Jul 15, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 15, 2026', text: 'Target job assigned: Warehouse Associate' },
      { id: 'h3', date: 'Jul 16, 2026', text: 'Started profiling' },
    ],
  },
  {
    regId: 'REG-005', name: 'Paolo Rivera', email: 'paolo.rivera@email.com', phone: '0919-887-4432',
    alternateContact: '', address: '', location: 'Malabon City',
    middleName: 'Cruz', suffix: '', dateOfBirth: '1996-11-02', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '1.5 years forklift operation',
    targetJobId: 'jo2',
    skills: ['Forklift certified'],
    workHistory: [{ role: 'Forklift Operator', company: 'Nova Freight Corp.', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Malabon City NHS', degree: 'TVL Strand', level: 'Senior High School', startYear: '2018', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Paolo_Rivera_ForkliftCert.pdf', type: 'Training Certificates', uploadedDate: 'Jul 16, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 16, 2026',
    history: [
      { id: 'h1', date: 'Jul 16, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 17, 2026', text: 'Started profiling' },
    ],
  },
  {
    regId: 'REG-011', name: 'Bianca Ramos', email: 'bianca.ramos@email.com', phone: '0918-334-7789',
    alternateContact: '', address: '', location: 'Pasay City',
    middleName: 'Uy', suffix: '', dateOfBirth: '1997-06-19', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '3 years hotel front office experience',
    targetJobId: 'jo6',
    skills: ['Guest relations', 'Booking systems', 'Basic conversational Mandarin'],
    workHistory: [{ role: 'Front Office Associate', company: 'Pasay Bay Hotel', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'Philippine Women\'s University', degree: 'BS Tourism Management', level: "Bachelor's Degree", startYear: '2016', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Bianca_Ramos_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 17, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 17, 2026',
    history: [
      { id: 'h1', date: 'Jul 17, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 17, 2026', text: 'Target job assigned: Front Desk Associate' },
      { id: 'h3', date: 'Jul 18, 2026', text: 'Started profiling' },
    ],
  },
  {
    regId: 'REG-012', name: 'Ronnie Castillo', email: 'ronnie.castillo@email.com', phone: '0917-772-6650',
    alternateContact: '', address: '', location: 'Cabuyao, Laguna',
    middleName: 'Bautista', suffix: '', dateOfBirth: '1994-10-25', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '4 years factory line experience',
    targetJobId: 'jo5',
    skills: ['Machine operation', 'Quality inspection'],
    workHistory: [
      { role: 'Line Operator', company: 'Delta Manufacturing', duration: '2021 – 2025' },
      { role: 'Production Helper', company: 'Sta. Rosa Industrial Corp.', duration: '2019 – 2021' },
    ],
    education: [{ id: 'e1', school: 'Laguna State Polytechnic University', degree: 'Industrial Technology', level: "Bachelor's Degree", startYear: '2015', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Ronnie_Castillo_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 18, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 18, 2026',
    history: [
      { id: 'h1', date: 'Jul 18, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 19, 2026', text: 'Started profiling' },
    ],
  },

  // ---- PROFILED / READY ----
  {
    regId: 'REG-006', name: 'Shaira Domingo', email: 'shaira.domingo@email.com', phone: '0917-330-8891',
    alternateContact: '', address: '45 Kalayaan Ave.', location: 'Quezon City',
    middleName: 'Reyes', suffix: '', dateOfBirth: '1999-02-18', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years BPO customer service',
    targetJobId: 'jo3',
    skills: ['Customer service', 'CRM tools', 'English proficiency'],
    workHistory: [
      { role: 'Customer Service Rep', company: 'Northline BPO (previous account)', duration: '2023 – 2025' },
      { role: 'Retail Associate', company: 'ShopWise Quezon Ave.', duration: '2022 – 2023' },
    ],
    education: [{ id: 'e1', school: 'Polytechnic University of the Philippines', degree: 'BS Office Administration', level: "Bachelor's Degree", startYear: '2018', endYear: '2022' }],
    documents: [{ id: 'd1', name: 'Shaira_Domingo_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 10, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 10, 2026',
    history: [
      { id: 'h1', date: 'Jul 10, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 10, 2026', text: 'Resume uploaded' },
      { id: 'h3', date: 'Jul 11, 2026', text: 'Started profiling' },
      { id: 'h4', date: 'Jul 12, 2026', text: 'Profile marked complete' },
    ],
  },
  {
    regId: 'REG-007', name: 'Wendell Aquino', email: 'wendell.aquino@email.com', phone: '0918-221-6650',
    alternateContact: '', address: '', location: 'Cabuyao, Laguna',
    middleName: 'Ferrer', suffix: 'Jr.', dateOfBirth: '1995-07-30', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year machine operations',
    targetJobId: 'jo5',
    skills: ['Machine operation', 'Basic troubleshooting', 'Safety compliance'],
    workHistory: [{ role: 'Machine Operator', company: 'Delta Manufacturing (contractual)', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Laguna NHS', degree: 'TVL Strand', level: 'Senior High School', startYear: '2018', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Wendell_Aquino_SafetyCert.pdf', type: 'Training Certificates', uploadedDate: 'Jul 13, 2026' }],
    stage: 'profiled', status: 'on_hold', sentToRecruitment: false, registeredDate: 'Jul 11, 2026',
    history: [
      { id: 'h1', date: 'Jul 11, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 12, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 13, 2026', text: 'Profile marked complete' },
      { id: 'h4', date: 'Jul 14, 2026', text: 'Status changed to On Hold' },
    ],
  },
  {
    regId: 'REG-013', name: 'Michael Santos', email: 'michael.santos@email.com', phone: '0919-445-7712',
    alternateContact: '', address: '', location: 'Taguig City',
    middleName: 'Ong', suffix: '', dateOfBirth: '1998-09-14', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years technical support experience',
    targetJobId: 'jo4',
    skills: ['Technical troubleshooting', 'Ticketing systems', 'Networking basics'],
    workHistory: [{ role: 'Technical Support Agent', company: 'GlobalConnect BPO', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Technological Institute of the Philippines', degree: 'BS Information Technology', level: "Bachelor's Degree", startYear: '2018', endYear: '2022' }],
    documents: [
      { id: 'd1', name: 'Michael_Santos_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 09, 2026' },
      { id: 'd2', name: 'Michael_Santos_CompTIA_A+.pdf', type: 'Certificates', uploadedDate: 'Jul 09, 2026' },
    ],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 08, 2026',
    history: [
      { id: 'h1', date: 'Jul 08, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 09, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 09, 2026', text: 'Profile marked complete' },
    ],
  },
  {
    regId: 'REG-014', name: 'Liza Fernandez', email: 'liza.fernandez@email.com', phone: '0920-661-3398',
    alternateContact: '', address: '', location: 'Quezon City',
    middleName: 'Alvarez', suffix: '', dateOfBirth: '2000-01-27', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year customer service experience',
    targetJobId: 'jo3',
    skills: ['Customer service', 'Conflict resolution'],
    workHistory: [{ role: 'Customer Care Associate', company: 'Northline BPO', duration: '2025 (1 year)' }],
    education: [{ id: 'e1', school: 'Far Eastern University', degree: 'BS Communication', level: "Bachelor's Degree", startYear: '2019', endYear: '2023' }],
    documents: [{ id: 'd1', name: 'Liza_Fernandez_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 07, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 06, 2026',
    history: [
      { id: 'h1', date: 'Jul 06, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 07, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 07, 2026', text: 'Profile marked complete' },
    ],
  },

  // ---- SENT TO RECRUITMENT ----
  {
    regId: 'REG-008', name: 'Angeline Cortez', email: 'angeline.cortez@email.com', phone: '0920-774-2298',
    alternateContact: '', address: '', location: 'Boracay, Aklan',
    middleName: 'Padilla', suffix: '', dateOfBirth: '1993-09-09', gender: 'Female', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3 years hospitality front desk',
    targetJobId: 'jo6',
    skills: ['Front desk operations', 'Guest relations', 'Booking systems'],
    workHistory: [{ role: 'Front Desk Associate', company: 'Boracay Sands Resort', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'Aklan State University', degree: 'BS Hospitality Management', level: "Bachelor's Degree", startYear: '2017', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Angeline_Cortez_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 05, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 05, 2026',
    history: [
      { id: 'h1', date: 'Jul 05, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 06, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 07, 2026', text: 'Profile marked complete' },
      { id: 'h4', date: 'Jul 08, 2026', text: 'Sent to Recruitment & Selection' },
    ],
  },
  {
    regId: 'REG-015', name: 'Carlo Mendoza', email: 'carlo.mendoza@email.com', phone: '0921-889-4471',
    alternateContact: '', address: '', location: 'Valenzuela City',
    middleName: 'Rivas', suffix: '', dateOfBirth: '1997-03-03', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years warehouse and logistics experience',
    targetJobId: 'jo1',
    skills: ['Inventory management', 'Forklift certified', 'Basic Excel'],
    workHistory: [{ role: 'Warehouse Associate', company: 'ABC Logistics (previous contract)', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Valenzuela City Polytechnic College', degree: 'Logistics Management', level: 'Associate Degree', startYear: '2019', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Carlo_Mendoza_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 03, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 02, 2026',
    history: [
      { id: 'h1', date: 'Jul 02, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 03, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 04, 2026', text: 'Profile marked complete' },
      { id: 'h4', date: 'Jul 04, 2026', text: 'Sent to Recruitment & Selection' },
    ],
  },
];