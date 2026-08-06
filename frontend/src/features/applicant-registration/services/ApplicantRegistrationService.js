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

// Categories directly matched with Client Management Job Orders & Client Industries
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
    category: 'Hospitality & Front Desk',
    targetJobId: 'jo17',
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
    category: 'Warehousing & Logistics',
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

  // ---- NEWLY ADDED REGISTERED CANDIDATES ----
  {
    regId: 'REG-016', name: 'Rhea Valenzuela', email: 'rhea.valenzuela@email.com', phone: '0917-882-9901',
    alternateContact: '', address: '', location: 'Taguig City, Metro Manila',
    middleName: 'Bautista', suffix: '', dateOfBirth: '2001-04-10', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year property leasing assistant experience',
    category: 'Real Estate & Property Management',
    targetJobId: 'jo21',
    skills: ['Leasing documentation', 'Client viewings', 'MS Excel'],
    workHistory: [{ role: 'Leasing Assistant', company: 'Megaworld Property Sales', duration: '2025 (1 year)' }],
    education: [{ id: 'e1', school: 'UP Diliman', degree: 'BS Business Administration', level: "Bachelor's Degree", startYear: '2019', endYear: '2023' }],
    documents: [{ id: 'd1', name: 'Rhea_Valenzuela_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 25, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 25, 2026',
    history: [{ id: 'h1', date: 'Jul 25, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-017', name: 'Gabriel Navarro', email: 'gabriel.navarro@email.com', phone: '0919-331-5582',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Santos', suffix: '', dateOfBirth: '1998-11-15', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'Licensed Medical Technologist with 1.5 yrs hospital lab experience',
    category: 'Healthcare & Diagnostics',
    targetJobId: 'jo25',
    skills: ['Specimen analysis', 'Clinical lab testing', 'PRC Licensed'],
    workHistory: [{ role: 'Junior MedTech', company: 'St. Luke\'s Medical Center', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'UST', degree: 'BS Medical Technology', level: "Bachelor's Degree", startYear: '2017', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Gabriel_Navarro_PRC_License.pdf', type: 'Professional License', uploadedDate: 'Jul 26, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 26, 2026',
    history: [{ id: 'h1', date: 'Jul 26, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-018', name: 'Jayson Delos Santos', email: 'jayson.ds@email.com', phone: '0922-114-8890',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Alvarez', suffix: '', dateOfBirth: '1995-02-28', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3 years site construction helper',
    category: 'Construction & Engineering',
    targetJobId: 'jo33',
    skills: ['Material handling', 'Masonry helper', 'Site safety'],
    workHistory: [{ role: 'Site Laborer', company: 'DMCI Homes Project', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'Imus National High School', degree: 'High School Diploma', level: 'High School', startYear: '2010', endYear: '2014' }],
    documents: [{ id: 'd1', name: 'Jayson_DelosSantos_ID.jpg', type: 'Valid ID', uploadedDate: 'Jul 27, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 27, 2026',
    history: [{ id: 'h1', date: 'Jul 27, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-019', name: 'Marivel Capistrano', email: 'marivel.c@email.com', phone: '0920-551-7744',
    alternateContact: '', address: '', location: 'Sto. Tomas, Batangas',
    middleName: 'Reyes', suffix: '', dateOfBirth: '2000-08-12', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year produce grading and packaging experience',
    category: 'Agriculture & Export',
    targetJobId: 'jo29',
    skills: ['Produce grading', 'Hygiene standards', 'Export packing'],
    workHistory: [{ role: 'Packing House Helper', company: 'Batangas Agri Corp', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Sto. Tomas NHS', degree: 'Senior High School TVL', level: 'Senior High School', startYear: '2016', endYear: '2018' }],
    documents: [{ id: 'd1', name: 'Marivel_Capistrano_Resume.pdf', type: 'Resume / CV', uploadedDate: 'Jul 28, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 28, 2026',
    history: [{ id: 'h1', date: 'Jul 28, 2026', text: 'Applicant registered' }],
  },

  // ---- NEWLY ADDED PROFILING CANDIDATES ----
  {
    regId: 'REG-020', name: 'Dexter Alcantara', email: 'dexter.alcantara@email.com', phone: '0918-990-1123',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Mendoza', suffix: '', dateOfBirth: '1997-09-03', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'Civil Engineering graduate, 1 yr assistant site engineer',
    category: 'Construction & Engineering',
    targetJobId: 'jo34',
    skills: ['AutoCAD', 'Site inspection', 'Civil plan reading'],
    workHistory: [{ role: 'Junior Site Engineer', company: 'MDC Construction', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Mapua University', degree: 'BS Civil Engineering', level: "Bachelor's Degree", startYear: '2016', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Dexter_Alcantara_Diploma.pdf', type: 'Diploma', uploadedDate: 'Jul 19, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 19, 2026',
    history: [
      { id: 'h1', date: 'Jul 19, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 20, 2026', text: 'Started profiling & AutoCAD skill verification' },
    ],
  },
  {
    regId: 'REG-021', name: 'Patricia Consunji', email: 'patricia.consunji@email.com', phone: '0917-440-2211',
    alternateContact: '', address: '', location: 'BGC, Taguig City',
    middleName: 'Aquino', suffix: '', dateOfBirth: '1999-01-22', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years tenant relations and property admin',
    category: 'Real Estate & Property Management',
    targetJobId: 'jo22',
    skills: ['Tenant records', 'Lease processing', 'MS Excel'],
    workHistory: [{ role: 'Property Admin Assistant', company: 'Ayala Land Offices', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'De La Salle University', degree: 'BS Business Management', level: "Bachelor's Degree", startYear: '2017', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Patricia_Consunji_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 20, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 20, 2026',
    history: [
      { id: 'h1', date: 'Jul 20, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 21, 2026', text: 'Started profiling' },
    ],
  },
  {
    regId: 'REG-022', name: 'Jonathan Sison', email: 'jonathan.sison@email.com', phone: '0921-667-8899',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Villareal', suffix: '', dateOfBirth: '1996-05-18', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: 'Licensed RadTech with 2 yrs X-ray imaging experience',
    category: 'Healthcare & Diagnostics',
    targetJobId: 'jo26',
    skills: ['X-ray procedure', 'Radiation safety', 'PRC Licensed'],
    workHistory: [{ role: 'RadTech Staff', company: 'Medical City QC', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Emilio Aguinaldo College', degree: 'BS Radiologic Technology', level: "Bachelor's Degree", startYear: '2015', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Jonathan_Sison_PRC.pdf', type: 'Professional License', uploadedDate: 'Jul 21, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 21, 2026',
    history: [
      { id: 'h1', date: 'Jul 21, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 22, 2026', text: 'Started profiling' },
    ],
  },
  {
    regId: 'REG-023', name: 'Eduardo Panganiban', email: 'eduardo.p@email.com', phone: '0919-772-4411',
    alternateContact: '', address: '', location: 'Sto. Tomas, Batangas',
    middleName: 'Castillo', suffix: '', dateOfBirth: '1992-12-04', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '5 years farm crew supervisor experience',
    category: 'Agriculture & Export',
    targetJobId: 'jo32',
    skills: ['Field crew management', 'Harvest scheduling', 'Agri logistics'],
    workHistory: [{ role: 'Farm Supervisor', company: 'Calabarzon Fresh Produce', duration: '2020 – 2025' }],
    education: [{ id: 'e1', school: 'UPLB', degree: 'BS Agriculture', level: "Bachelor's Degree", startYear: '2010', endYear: '2015' }],
    documents: [{ id: 'd1', name: 'Eduardo_Panganiban_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 22, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 22, 2026',
    history: [
      { id: 'h1', date: 'Jul 22, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 23, 2026', text: 'Started profiling' },
    ],
  },

  // ---- NEWLY ADDED PROFILED / READY CANDIDATES ----
  {
    regId: 'REG-024', name: 'Samantha Evora', email: 'samantha.evora@email.com', phone: '0917-112-9988',
    alternateContact: '', address: '', location: 'Mandaluyong City, Metro Manila',
    middleName: 'Reyes', suffix: '', dateOfBirth: '2000-03-30', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years patient reception and HMO billing coordination',
    category: 'Healthcare & Diagnostics',
    targetJobId: 'jo27',
    skills: ['Patient registration', 'HMO coordination', 'Front desk'],
    workHistory: [{ role: 'Patient Service Rep', company: 'Healthway Clinic', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'PUP', degree: 'BS Health Administration', level: "Bachelor's Degree", startYear: '2018', endYear: '2022' }],
    documents: [{ id: 'd1', name: 'Samantha_Evora_Cert.pdf', type: 'Certificates', uploadedDate: 'Jul 14, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 14, 2026',
    history: [
      { id: 'h1', date: 'Jul 14, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 15, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 16, 2026', text: 'Profile marked complete — Ready' },
    ],
  },
  {
    regId: 'REG-025', name: 'Ferdinand Almeda', email: 'ferdinand.almeda@email.com', phone: '0918-332-6699',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Torres', suffix: '', dateOfBirth: '1993-07-12', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: 'BOSH SO2 certified safety officer with 4 yrs construction site experience',
    category: 'Construction & Engineering',
    targetJobId: 'jo35',
    skills: ['BOSH Certified', 'PPE enforcement', 'Hazardous inspection'],
    workHistory: [{ role: 'Safety Officer', company: 'Megawide Construction', duration: '2021 – 2025' }],
    education: [{ id: 'e1', school: 'TUP Manila', degree: 'BS Industrial Technology', level: "Bachelor's Degree", startYear: '2011', endYear: '2016' }],
    documents: [{ id: 'd1', name: 'Ferdinand_Almeda_BOSH_Cert.pdf', type: 'Training Certificates', uploadedDate: 'Jul 15, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 15, 2026',
    history: [
      { id: 'h1', date: 'Jul 15, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 16, 2026', text: 'Started profiling & BOSH cert verified' },
      { id: 'h3', date: 'Jul 17, 2026', text: 'Profile marked complete — Ready' },
    ],
  },
  {
    regId: 'REG-026', name: 'Vanessa Tolentino', email: 'vanessa.t@email.com', phone: '0920-449-1122',
    alternateContact: '', address: '', location: 'Alabang, Muntinlupa City',
    middleName: 'Cruz', suffix: '', dateOfBirth: '2002-10-05', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1.5 years retail sales associate',
    category: 'Retail & Store Operations',
    targetJobId: 'jo14',
    skills: ['Customer assistance', 'POS operations', 'Stocking'],
    workHistory: [{ role: 'Sales Associate', company: 'SM Department Store', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Muntinlupa NHS', degree: 'Senior High School', level: 'Senior High School', startYear: '2018', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Vanessa_Tolentino_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 16, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 16, 2026',
    history: [
      { id: 'h1', date: 'Jul 16, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 17, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 18, 2026', text: 'Profile marked complete — Ready' },
    ],
  },
  {
    regId: 'REG-027', name: 'Jericho Manansala', email: 'jericho.m@email.com', phone: '0919-881-2244',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Dizon', suffix: '', dateOfBirth: '1994-06-25', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'Licensed backhoe & excavator operator with 3 yrs experience',
    category: 'Construction & Engineering',
    targetJobId: 'jo36',
    skills: ['Excavator operator', 'Backhoe operator', 'TESDA Certified'],
    workHistory: [{ role: 'Heavy Equipment Operator', company: 'Monark Equipment', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'TESDA Cavite', degree: 'Heavy Equipment Operation NC II', level: 'TESDA / Vocational', startYear: '2019', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Jericho_Manansala_TESDA.pdf', type: 'Certificates', uploadedDate: 'Jul 17, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 17, 2026',
    history: [
      { id: 'h1', date: 'Jul 17, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 18, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 19, 2026', text: 'Profile marked complete — Ready' },
    ],
  },

  // ---- NEWLY ADDED SENT TO RECRUITMENT CANDIDATES ----
  {
    regId: 'REG-028', name: 'Kristine Bernadette Cruz', email: 'kristine.cruz@email.com', phone: '0917-551-8899',
    alternateContact: '', address: '', location: 'BGC, Taguig City',
    middleName: 'Flores', suffix: '', dateOfBirth: '1998-02-14', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '3 years front desk and lobby concierge experience',
    category: 'Real Estate & Property Management',
    targetJobId: 'jo23',
    skills: ['Lobby reception', 'Visitor logs', 'Concierge services'],
    workHistory: [{ role: 'Front Desk Officer', company: 'Rockwell Land Corp', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'College of St. Benilde', degree: 'BS Hotel & Restaurant Management', level: "Bachelor's Degree", startYear: '2016', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Kristine_Cruz_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 10, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 10, 2026',
    history: [
      { id: 'h1', date: 'Jul 10, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 11, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 12, 2026', text: 'Profile marked complete' },
      { id: 'h4', date: 'Jul 13, 2026', text: 'Sent to Recruitment & Selection' },
    ],
  },
  {
    regId: 'REG-029', name: 'Arnaldo Bathan', email: 'arnaldo.bathan@email.com', phone: '0918-220-4455',
    alternateContact: '', address: '', location: 'Sto. Tomas, Batangas',
    middleName: 'Santos', suffix: '', dateOfBirth: '1995-11-09', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3 years food technology & export QA inspection experience',
    category: 'Agriculture & Export',
    targetJobId: 'jo30',
    skills: ['Export QA standards', 'Hygiene audits', 'Document logging'],
    workHistory: [{ role: 'Agri QA Inspector', company: 'Dole Philippines', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'Batangas State University', degree: 'BS Food Technology', level: "Bachelor's Degree", startYear: '2014', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Arnaldo_Bathan_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 11, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 11, 2026',
    history: [
      { id: 'h1', date: 'Jul 11, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 12, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 13, 2026', text: 'Profile marked complete' },
      { id: 'h4', date: 'Jul 14, 2026', text: 'Sent to Recruitment & Selection' },
    ],
  },
  {
    regId: 'REG-030', name: 'Gladys Montemayor', email: 'gladys.m@email.com', phone: '0922-331-6677',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Villareal', suffix: '', dateOfBirth: '1999-08-20', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years medical billing clerk and HMO claims processing',
    category: 'Healthcare & Diagnostics',
    targetJobId: 'jo28',
    skills: ['HMO claims', 'Medical billing', 'Patient accounting'],
    workHistory: [{ role: 'Billing Clerk', company: 'Capitol Medical Center', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Far Eastern University', degree: 'BS Accountancy (2 yrs undergrad)', level: 'Undergraduate', startYear: '2018', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Gladys_Montemayor_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 12, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 12, 2026',
    history: [
      { id: 'h1', date: 'Jul 12, 2026', text: 'Applicant registered' },
      { id: 'h2', date: 'Jul 13, 2026', text: 'Started profiling' },
      { id: 'h3', date: 'Jul 14, 2026', text: 'Profile marked complete' },
      { id: 'h4', date: 'Jul 15, 2026', text: 'Sent to Recruitment & Selection' },
    ],
  },

  // ---- REGISTERED BATCH 2 ----
  {
    regId: 'REG-031', name: 'Alfonso Bermudez', email: 'alfonso.b@email.com', phone: '0917-550-1122',
    alternateContact: '', address: '', location: 'Valenzuela City, Metro Manila',
    middleName: 'Gomez', suffix: '', dateOfBirth: '2001-02-11', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year warehouse helper experience', category: 'Warehousing & Logistics', targetJobId: 'jo1',
    skills: ['Inventory tallying', 'Pallet jack operation'],
    workHistory: [{ role: 'Warehouse Helper', company: 'Royal Cargo Logistics', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Valenzuela NHS', degree: 'Senior High School', level: 'Senior High School', startYear: '2018', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Alfonso_Bermudez_ID.pdf', type: 'Valid ID', uploadedDate: 'Jul 29, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 29, 2026',
    history: [{ id: 'h1', date: 'Jul 29, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-032', name: 'Bernadette Solis', email: 'bernadette.solis@email.com', phone: '0918-662-3344',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Lopez', suffix: '', dateOfBirth: '2000-05-19', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '6 months call center representative experience', category: 'Customer Service (BPO)', targetJobId: 'jo5',
    skills: ['Customer support', 'Voice support', 'English communication'],
    workHistory: [{ role: 'CSR Trainee', company: 'Teleperformance QC', duration: '2025 (6 months)' }],
    education: [{ id: 'e1', school: 'New Era University', degree: 'BS Mass Communication (undergrad)', level: 'Undergraduate', startYear: '2019', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Bernadette_Solis_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 30, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 30, 2026',
    history: [{ id: 'h1', date: 'Jul 30, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-033', name: 'Cesar Castaneda', email: 'cesar.castaneda@email.com', phone: '0919-443-8899',
    alternateContact: '', address: '', location: 'Cabuyao, Laguna',
    middleName: 'Navarro', suffix: '', dateOfBirth: '1996-10-04', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '2 years industrial machine assistant', category: 'Manufacturing', targetJobId: 'jo9',
    skills: ['Machine operation', 'Safety protocols', 'Quality check'],
    workHistory: [{ role: 'Factory Helper', company: 'Universal Robina Corp', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Laguna State Polytech', degree: 'Machine Technology NC II', level: 'TESDA / Vocational', startYear: '2016', endYear: '2017' }],
    documents: [{ id: 'd1', name: 'Cesar_Castaneda_NC2.pdf', type: 'Certificates', uploadedDate: 'Jul 31, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 31, 2026',
    history: [{ id: 'h1', date: 'Jul 31, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-034', name: 'Dianne Pascual', email: 'dianne.pascual@email.com', phone: '0920-112-4455',
    alternateContact: '', address: '', location: 'Makati City, Metro Manila',
    middleName: 'Cruz', suffix: '', dateOfBirth: '2002-12-14', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year store cashier experience', category: 'Retail & Store Operations', targetJobId: 'jo15',
    skills: ['POS system', 'Cash count', 'Customer service'],
    workHistory: [{ role: 'Store Cashier', company: 'Robinsons Supermarket', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Makati High School', degree: 'ABM Strand', level: 'Senior High School', startYear: '2018', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Dianne_Pascual_CV.pdf', type: 'Resume / CV', uploadedDate: 'Aug 01, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Aug 01, 2026',
    history: [{ id: 'h1', date: 'Aug 01, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-035', name: 'Enrique Soriano', email: 'enrique.soriano@email.com', phone: '0921-773-6622',
    alternateContact: '', address: '', location: 'Tagaytay City, Cavite',
    middleName: 'Mendoza', suffix: '', dateOfBirth: '1999-07-25', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1.5 years resort dining server', category: 'Food & Beverage (F&B / Cook)', targetJobId: 'jo19',
    skills: ['Table service', 'Order taking', 'Food hygiene'],
    workHistory: [{ role: 'F&B Server', company: 'Taal Vista Hotel', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Cavite State University', degree: 'BS HRM (undergrad)', level: 'Undergraduate', startYear: '2018', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Enrique_Soriano_Cert.pdf', type: 'Training Certificates', uploadedDate: 'Aug 01, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Aug 01, 2026',
    history: [{ id: 'h1', date: 'Aug 01, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-036', name: 'Francisca Nepomuceno', email: 'francisca.n@email.com', phone: '0917-334-9988',
    alternateContact: '', address: '', location: 'BGC, Taguig City',
    middleName: 'Villamin', suffix: '', dateOfBirth: '1997-01-30', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years condo reception & lobby security desk', category: 'Real Estate & Property Management', targetJobId: 'jo23',
    skills: ['Concierge desk', 'Visitor registration', 'Front desk'],
    workHistory: [{ role: 'Lobby Receptionist', company: 'Megaworld Fort', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'St. Scholastica\'s College', degree: 'BS Tourism', level: "Bachelor's Degree", startYear: '2015', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Francisca_Nepomuceno_CV.pdf', type: 'Resume / CV', uploadedDate: 'Aug 02, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Aug 02, 2026',
    history: [{ id: 'h1', date: 'Aug 02, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-037', name: 'Gerardo Alcantara', email: 'gerardo.a@email.com', phone: '0918-223-5511',
    alternateContact: '', address: '', location: 'Mandaluyong City, Metro Manila',
    middleName: 'Castillo', suffix: '', dateOfBirth: '1998-06-14', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year clinic reception and patient queue assistant', category: 'Healthcare & Diagnostics', targetJobId: 'jo27',
    skills: ['Patient assistance', 'Queue system', 'Medical records'],
    workHistory: [{ role: 'Clinic Assistant', company: 'QualiMed Clinic', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Rizal Technological University', degree: 'BS Office Admin', level: "Bachelor's Degree", startYear: '2016', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Gerardo_Alcantara_CV.pdf', type: 'Resume / CV', uploadedDate: 'Aug 02, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Aug 02, 2026',
    history: [{ id: 'h1', date: 'Aug 02, 2026', text: 'Applicant registered' }],
  },
  {
    regId: 'REG-038', name: 'Helen Macaraeg', email: 'helen.macaraeg@email.com', phone: '0919-880-4433',
    alternateContact: '', address: '', location: 'Sto. Tomas, Batangas',
    middleName: 'Torres', suffix: '', dateOfBirth: '1996-03-22', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years agricultural export logistics clerical assistant', category: 'Agriculture & Export', targetJobId: 'jo31',
    skills: ['Container manifest', 'Export doc prep', 'Logistics coordination'],
    workHistory: [{ role: 'Export Clerk', company: 'Southern Batangas Fruit Export', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Batangas State University', degree: 'BS Customs Administration', level: "Bachelor's Degree", startYear: '2014', endYear: '2018' }],
    documents: [{ id: 'd1', name: 'Helen_Macaraeg_CV.pdf', type: 'Resume / CV', uploadedDate: 'Aug 03, 2026' }],
    stage: 'registered', status: 'active', sentToRecruitment: false, registeredDate: 'Aug 03, 2026',
    history: [{ id: 'h1', date: 'Aug 03, 2026', text: 'Applicant registered' }],
  },

  // ---- PROFILING BATCH 2 ----
  {
    regId: 'REG-039', name: 'Ignacio Valerio', email: 'ignacio.v@email.com', phone: '0920-664-1188',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Aquino', suffix: '', dateOfBirth: '1994-09-08', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '4 years residential construction laborer', category: 'Construction & Engineering', targetJobId: 'jo33',
    skills: ['Concrete pouring', 'Rebar tying', 'Site cleanup'],
    workHistory: [{ role: 'Site Helper', company: 'First Balfour Construction', duration: '2021 – 2025' }],
    education: [{ id: 'e1', school: 'Cavite National HS', degree: 'High School Diploma', level: 'High School', startYear: '2008', endYear: '2012' }],
    documents: [{ id: 'd1', name: 'Ignacio_Valerio_Cert.pdf', type: 'Training Certificates', uploadedDate: 'Jul 22, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 22, 2026',
    history: [{ id: 'h1', date: 'Jul 22, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 23, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-040', name: 'Josefina Calimbas', email: 'josefina.c@email.com', phone: '0921-992-3300',
    alternateContact: '', address: '', location: 'Valenzuela City, Metro Manila',
    middleName: 'Santos', suffix: '', dateOfBirth: '1995-12-19', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'TESDA certified forklift operator with 2 yrs warehouse experience', category: 'Warehousing & Logistics', targetJobId: 'jo2',
    skills: ['Forklift operation NC II', 'Pallet stacking', 'Safety protocol'],
    workHistory: [{ role: 'Forklift Driver', company: 'LF Logistics', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'TESDA Valenzuela', degree: 'Forklift Operation NC II', level: 'TESDA / Vocational', startYear: '2021', endYear: '2022' }],
    documents: [{ id: 'd1', name: 'Josefina_Calimbas_TESDA.pdf', type: 'Certificates', uploadedDate: 'Jul 23, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 23, 2026',
    history: [{ id: 'h1', date: 'Jul 23, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 24, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-041', name: 'Kristian Dizon', email: 'kristian.dizon@email.com', phone: '0917-441-8822',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Guevarra', suffix: '', dateOfBirth: '1999-04-05', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1.5 years Tier-1 technical support representative', category: 'Customer Service (BPO)', targetJobId: 'jo6',
    skills: ['Hardware troubleshooting', 'Router setup', 'Zendesk ticketing'],
    workHistory: [{ role: 'TSR Agent', company: 'Conduent Philippines', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'T.I.P. Quezon City', degree: 'BS Computer Science (undergrad)', level: 'Undergraduate', startYear: '2017', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Kristian_Dizon_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 24, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 24, 2026',
    history: [{ id: 'h1', date: 'Jul 24, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 25, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-042', name: 'Lilia Buenaventura', email: 'lilia.b@email.com', phone: '0918-335-7799',
    alternateContact: '', address: '', location: 'Cabuyao, Laguna',
    middleName: 'Alvarez', suffix: '', dateOfBirth: '1997-08-30', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years electronic assembly quality control inspector', category: 'Manufacturing', targetJobId: 'jo10',
    skills: ['Quality inspection', 'Caliper measurement', 'ISO standards'],
    workHistory: [{ role: 'QC Inspector', company: 'Nidec Philippines', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Laguna State Polytech', degree: 'Industrial Tech', level: "Bachelor's Degree", startYear: '2015', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Lilia_Buenaventura_Cert.pdf', type: 'Certificates', uploadedDate: 'Jul 25, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 25, 2026',
    history: [{ id: 'h1', date: 'Jul 25, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 26, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-043', name: 'Manuel Roxas Jr.', email: 'manuel.roxas@email.com', phone: '0919-224-6600',
    alternateContact: '', address: '', location: 'Alabang, Muntinlupa City',
    middleName: 'Fernandez', suffix: 'Jr.', dateOfBirth: '2000-11-12', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1 year store window and display layout assistant', category: 'Retail & Store Operations', targetJobId: 'jo16',
    skills: ['Display staging', 'Retail aesthetics', 'Prop mounting'],
    workHistory: [{ role: 'Merchandising Helper', company: 'Rustan\'s Commercial Corp', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'PWU', degree: 'BS Fine Arts (undergrad)', level: 'Undergraduate', startYear: '2019', endYear: '2022' }],
    documents: [{ id: 'd1', name: 'Manuel_Roxas_Portfolio.pdf', type: 'Portfolio', uploadedDate: 'Jul 26, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 26, 2026',
    history: [{ id: 'h1', date: 'Jul 26, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 27, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-044', name: 'Norberto Trinidad', email: 'norberto.t@email.com', phone: '0920-881-3344',
    alternateContact: '', address: '', location: 'Boracay, Aklan',
    middleName: 'Salazar', suffix: '', dateOfBirth: '1994-03-17', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3 years resort room attendant & linen turnover staff', category: 'Hospitality & Front Desk', targetJobId: 'jo18',
    skills: ['Room cleaning', 'Linen management', 'Housekeeping standards'],
    workHistory: [{ role: 'Room Attendant', company: 'Henann Regency Resort', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'Aklan NHS', degree: 'High School Diploma', level: 'High School', startYear: '2008', endYear: '2012' }],
    documents: [{ id: 'd1', name: 'Norberto_Trinidad_ID.jpg', type: 'Valid ID', uploadedDate: 'Jul 27, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 27, 2026',
    history: [{ id: 'h1', date: 'Jul 27, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 28, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-045', name: 'Ofelia Gatchalian', email: 'ofelia.g@email.com', phone: '0921-550-9988',
    alternateContact: '', address: '', location: 'BGC, Taguig City',
    middleName: 'Rios', suffix: '', dateOfBirth: '1996-07-09', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years residential building maintenance tickets coordinator', category: 'Real Estate & Property Management', targetJobId: 'jo24',
    skills: ['Work order tracking', 'Contractor dispatch', 'Facility maintenance'],
    workHistory: [{ role: 'Maintenance Coordinator', company: 'Century Properties', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'TUP Taguig', degree: 'Associate in Facilities Management', level: 'Associate Degree', startYear: '2015', endYear: '2018' }],
    documents: [{ id: 'd1', name: 'Ofelia_Gatchalian_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 28, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 28, 2026',
    history: [{ id: 'h1', date: 'Jul 28, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 29, 2026', text: 'Started profiling' }],
  },
  {
    regId: 'REG-046', name: 'Pedro Arboleda', email: 'pedro.arboleda@email.com', phone: '0917-993-2211',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Tolentino', suffix: '', dateOfBirth: '1995-01-25', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: 'PRC Licensed Radiologic Technologist with 2.5 yrs diagnostic center experience', category: 'Healthcare & Diagnostics', targetJobId: 'jo26',
    skills: ['X-ray procedure', 'CT Scan operation', 'PRC Licensed'],
    workHistory: [{ role: 'RadTech Staff', company: 'Hi-Precision Diagnostics QC', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Family Clinic Colleges', degree: 'BS Radiologic Technology', level: "Bachelor's Degree", startYear: '2014', endYear: '2018' }],
    documents: [{ id: 'd1', name: 'Pedro_Arboleda_PRC.pdf', type: 'Professional License', uploadedDate: 'Jul 29, 2026' }],
    stage: 'profiling', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 29, 2026',
    history: [{ id: 'h1', date: 'Jul 29, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 30, 2026', text: 'Started profiling' }],
  },

  // ---- PROFILED / READY BATCH 2 ----
  {
    regId: 'REG-047', name: 'Quirino Escalante', email: 'quirino.e@email.com', phone: '0918-112-7744',
    alternateContact: '', address: '', location: 'Sto. Tomas, Batangas',
    middleName: 'Mendoza', suffix: '', dateOfBirth: '1993-04-18', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3 years agri-export fruit QA inspector & hygiene audit lead', category: 'Agriculture & Export', targetJobId: 'jo30',
    skills: ['Export QA standards', 'Brix testing', 'Hygiene audit'],
    workHistory: [{ role: 'QA Inspector', company: 'Sumifru Philippines', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'CLSU', degree: 'BS Agriculture', level: "Bachelor's Degree", startYear: '2011', endYear: '2015' }],
    documents: [{ id: 'd1', name: 'Quirino_Escalante_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 18, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 18, 2026',
    history: [{ id: 'h1', date: 'Jul 18, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 19, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 20, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-048', name: 'Rosalinda Macaspac', email: 'rosalinda.m@email.com', phone: '0919-335-1100',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Pineda', suffix: '', dateOfBirth: '1991-10-09', gender: 'Female', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: 'SO3 certified construction safety officer with 5 yrs high-rise experience', category: 'Construction & Engineering', targetJobId: 'jo35',
    skills: ['BOSH SO3 Certified', 'DOLE compliance', 'Site safety audit'],
    workHistory: [{ role: 'Senior Safety Officer', company: 'EEI Corp', duration: '2020 – 2025' }],
    education: [{ id: 'e1', school: 'Mapua University', degree: 'BS Environmental Engineering', level: "Bachelor's Degree", startYear: '2009', endYear: '2014' }],
    documents: [{ id: 'd1', name: 'Rosalinda_Macaspac_SO3.pdf', type: 'Training Certificates', uploadedDate: 'Jul 19, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 19, 2026',
    history: [{ id: 'h1', date: 'Jul 19, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 20, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 21, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-049', name: 'Salvador Panlilio', email: 'salvador.p@email.com', phone: '0920-771-4433',
    alternateContact: '', address: '', location: 'Valenzuela City, Metro Manila',
    middleName: 'Reyes', suffix: '', dateOfBirth: '1997-05-02', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years warehouse inventory clerk and SAP WMS encoder', category: 'Warehousing & Logistics', targetJobId: 'jo3',
    skills: ['SAP WMS', 'Cycle counting', 'Stock reconciliation'],
    workHistory: [{ role: 'Inventory Encoder', company: 'Fast Logistics Group', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'PLVal', degree: 'BS Information Technology', level: "Bachelor's Degree", startYear: '2016', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Salvador_Panlilio_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 20, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 20, 2026',
    history: [{ id: 'h1', date: 'Jul 20, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 21, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 22, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-050', name: 'Teresa Dimaculangan', email: 'teresa.d@email.com', phone: '0921-224-8877',
    alternateContact: '', address: '', location: 'Ortigas Center, Pasig City',
    middleName: 'Batungbacal', suffix: '', dateOfBirth: '1998-11-28', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years BPO sales development rep with outbound lead generation experience', category: 'Customer Service (BPO)', targetJobId: 'jo7',
    skills: ['Outbound sales', 'Salesforce CRM', 'Cold calling'],
    workHistory: [{ role: 'SDR Agent', company: 'Sykes Asia', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'RTU Pasig', degree: 'BS Marketing Management', level: "Bachelor's Degree", startYear: '2016', endYear: '2020' }],
    documents: [{ id: 'd1', name: 'Teresa_Dimaculangan_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 21, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 21, 2026',
    history: [{ id: 'h1', date: 'Jul 21, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 22, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 23, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-051', name: 'Urbano Guinto', email: 'urbano.guinto@email.com', phone: '0917-884-3322',
    alternateContact: '', address: '', location: 'Cabuyao, Laguna',
    middleName: 'Santos', suffix: '', dateOfBirth: '1992-02-16', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '4 years production line supervisor in plastics manufacturing', category: 'Manufacturing', targetJobId: 'jo11',
    skills: ['Production line balancing', 'Shift output KPI', 'Machine safety'],
    workHistory: [{ role: 'Line Supervisor', company: 'Toshiba Information Equipment', duration: '2021 – 2025' }],
    education: [{ id: 'e1', school: 'LSPU Cabuyao', degree: 'BS Industrial Tech', level: "Bachelor's Degree", startYear: '2010', endYear: '2014' }],
    documents: [{ id: 'd1', name: 'Urbano_Guinto_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 22, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 22, 2026',
    history: [{ id: 'h1', date: 'Jul 22, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 23, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 24, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-052', name: 'Vicente Laurel', email: 'vicente.laurel@email.com', phone: '0918-991-5544',
    alternateContact: '', address: '', location: 'Makati City, Metro Manila',
    middleName: 'Paterno', suffix: '', dateOfBirth: '1999-08-01', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years corporate admin assistant and office documentation', category: 'Retail & Store Operations', targetJobId: 'jo13',
    skills: ['MS Office Specialist', 'Office filing', 'Scheduling'],
    workHistory: [{ role: 'Admin Assistant', company: 'BDO Unibank HQ', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'San Beda University', degree: 'BS Business Admin', level: "Bachelor's Degree", startYear: '2017', endYear: '2021' }],
    documents: [{ id: 'd1', name: 'Vicente_Laurel_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 23, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 23, 2026',
    history: [{ id: 'h1', date: 'Jul 23, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 24, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 25, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-053', name: 'Wilma Panganiban', email: 'wilma.p@email.com', phone: '0919-440-7788',
    alternateContact: '', address: '', location: 'Tagaytay City, Cavite',
    middleName: 'Reyes', suffix: '', dateOfBirth: '1995-03-12', gender: 'Female', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3 years resort electrical & plumbing maintenance technician', category: 'Hospitality & Front Desk', targetJobId: 'jo20',
    skills: ['Electrical wiring', 'Plumbing repair', 'Resort maintenance'],
    workHistory: [{ role: 'Maintenance Staff', company: 'Crosswinds Tagaytay', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'TESDA Cavite', degree: 'Electrical Installation NC II', level: 'TESDA / Vocational', startYear: '2018', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Wilma_Panganiban_Cert.pdf', type: 'Certificates', uploadedDate: 'Jul 24, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 24, 2026',
    history: [{ id: 'h1', date: 'Jul 24, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 25, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 26, 2026', text: 'Profile marked complete — Ready' }],
  },
  {
    regId: 'REG-054', name: 'Xavier Monteclaro', email: 'xavier.m@email.com', phone: '0920-552-3311',
    alternateContact: '', address: '', location: 'BGC, Taguig City',
    middleName: 'Santos', suffix: '', dateOfBirth: '1997-12-05', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '2 years residential leasing consultant and condo sales viewings', category: 'Real Estate & Property Management', targetJobId: 'jo21',
    skills: ['Leasing viewings', 'Contract drafting', 'Client relations'],
    workHistory: [{ role: 'Leasing Specialist', company: 'Robinsons Land Corp', duration: '2023 – 2025' }],
    education: [{ id: 'e1', school: 'Ateneo de Manila', degree: 'BS Management', level: "Bachelor's Degree", startYear: '2015', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Xavier_Monteclaro_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 25, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: false, registeredDate: 'Jul 25, 2026',
    history: [{ id: 'h1', date: 'Jul 25, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 26, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 27, 2026', text: 'Profile marked complete — Ready' }],
  },

  // ---- SENT TO RECRUITMENT BATCH 2 ----
  {
    regId: 'REG-055', name: 'Yolanda Carandang', email: 'yolanda.c@email.com', phone: '0921-119-4455',
    alternateContact: '', address: '', location: 'Quezon City, Metro Manila',
    middleName: 'Aquino', suffix: '', dateOfBirth: '1996-09-18', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '3 years PRC Licensed MedTech in diagnostic laboratory testing', category: 'Healthcare & Diagnostics', targetJobId: 'jo25',
    skills: ['Blood chemistry', 'Specimen analysis', 'PRC Licensed MedTech'],
    workHistory: [{ role: 'Senior MedTech', company: 'Metropolitan Medical Center', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'FEU Nicanor Reyes', degree: 'BS Medical Technology', level: "Bachelor's Degree", startYear: '2014', endYear: '2018' }],
    documents: [{ id: 'd1', name: 'Yolanda_Carandang_PRC.pdf', type: 'Professional License', uploadedDate: 'Jul 15, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 15, 2026',
    history: [{ id: 'h1', date: 'Jul 15, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 16, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 17, 2026', text: 'Profile marked complete' }, { id: 'h4', date: 'Jul 18, 2026', text: 'Sent to Recruitment & Selection' }],
  },
  {
    regId: 'REG-056', name: 'Zacharias Formoso', email: 'zacharias.f@email.com', phone: '0917-662-8811',
    alternateContact: '', address: '', location: 'Sto. Tomas, Batangas',
    middleName: 'Bautista', suffix: '', dateOfBirth: '1991-04-03', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '6 years farm supervisor & export crop harvest manager', category: 'Agriculture & Export', targetJobId: 'jo32',
    skills: ['Harvest management', 'Field crew leadership', 'Agri supply chain'],
    workHistory: [{ role: 'Field Operations Manager', company: 'Del Monte Philippines', duration: '2019 – 2025' }],
    education: [{ id: 'e1', school: 'CLSU', degree: 'BS Agricultural Engineering', level: "Bachelor's Degree", startYear: '2008', endYear: '2013' }],
    documents: [{ id: 'd1', name: 'Zacharias_Formoso_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 16, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 16, 2026',
    history: [{ id: 'h1', date: 'Jul 16, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 17, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 18, 2026', text: 'Profile marked complete' }, { id: 'h4', date: 'Jul 19, 2026', text: 'Sent to Recruitment & Selection' }],
  },
  {
    regId: 'REG-057', name: 'Arthur Pendelton', email: 'arthur.p@email.com', phone: '0918-774-2200',
    alternateContact: '', address: '', location: 'Imus, Cavite',
    middleName: 'Guzman', suffix: '', dateOfBirth: '1993-01-29', gender: 'Male', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '4 years licensed heavy excavator & bulldozer operator', category: 'Construction & Engineering', targetJobId: 'jo36',
    skills: ['Excavator certified', 'Bulldozer operator', 'TESDA NC II'],
    workHistory: [{ role: 'Heavy Equipment Driver', company: 'First Crop Earthmovers', duration: '2021 – 2025' }],
    education: [{ id: 'e1', school: 'TESDA Manila', degree: 'Heavy Equipment Operator NC II', level: 'TESDA / Vocational', startYear: '2018', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Arthur_Pendelton_TESDA.pdf', type: 'Certificates', uploadedDate: 'Jul 17, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 17, 2026',
    history: [{ id: 'h1', date: 'Jul 17, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 18, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 19, 2026', text: 'Profile marked complete' }, { id: 'h4', date: 'Jul 20, 2026', text: 'Sent to Recruitment & Selection' }],
  },
  {
    regId: 'REG-058', name: 'Beatriz Legazpi', email: 'beatriz.legazpi@email.com', phone: '0919-553-1177',
    alternateContact: '', address: '', location: 'Caloocan City, Metro Manila',
    middleName: 'Villareal', suffix: '', dateOfBirth: '1995-10-14', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '3 years logistics delivery driver with professional restriction code 1,2,3', category: 'Warehousing & Logistics', targetJobId: 'jo4',
    skills: ['Professional Driver License', 'Route navigation', 'Logistics delivery'],
    workHistory: [{ role: 'Delivery Driver', company: 'Lalamove Fleet Operations', duration: '2022 – 2025' }],
    education: [{ id: 'e1', school: 'Caloocan High School', degree: 'High School Diploma', level: 'High School', startYear: '2009', endYear: '2013' }],
    documents: [{ id: 'd1', name: 'Beatriz_Legazpi_License.pdf', type: 'Driver License', uploadedDate: 'Jul 18, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 18, 2026',
    history: [{ id: 'h1', date: 'Jul 18, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 19, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 20, 2026', text: 'Profile marked complete' }, { id: 'h4', date: 'Jul 21, 2026', text: 'Sent to Recruitment & Selection' }],
  },
  {
    regId: 'REG-059', name: 'Christian Villaflor', email: 'christian.v@email.com', phone: '0920-441-9988',
    alternateContact: '', address: '', location: 'Ortigas Center, Pasig City',
    middleName: 'Cruz', suffix: '', dateOfBirth: '1994-07-07', gender: 'Male', civilStatus: 'Married', nationality: 'Filipino',
    experienceSummary: '3.5 years BPO Team Leader managing 18 CSR voice agents', category: 'Customer Service (BPO)', targetJobId: 'jo8',
    skills: ['BPO pod leadership', 'CSAT coaching', 'Performance monitoring'],
    workHistory: [{ role: 'Team Leader', company: 'Alorica Pasig', duration: '2021 – 2025' }],
    education: [{ id: 'e1', school: 'PUP Manila', degree: 'BS Communication', level: "Bachelor's Degree", startYear: '2012', endYear: '2016' }],
    documents: [{ id: 'd1', name: 'Christian_Villaflor_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 19, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 19, 2026',
    history: [{ id: 'h1', date: 'Jul 19, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 20, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 21, 2026', text: 'Profile marked complete' }, { id: 'h4', date: 'Jul 22, 2026', text: 'Sent to Recruitment & Selection' }],
  },
  {
    regId: 'REG-060', name: 'Daria Montelibano', email: 'daria.m@email.com', phone: '0921-883-2211',
    alternateContact: '', address: '', location: 'Cabuyao, Laguna',
    middleName: 'Salcedo', suffix: '', dateOfBirth: '2001-03-21', gender: 'Female', civilStatus: 'Single', nationality: 'Filipino',
    experienceSummary: '1.5 years automated packaging line operator', category: 'Manufacturing', targetJobId: 'jo12',
    skills: ['Packaging machinery', 'Labeling inspection', 'Shift packing'],
    workHistory: [{ role: 'Packaging Associate', company: 'Nestle Philippines Cabuyao', duration: '2024 – 2025' }],
    education: [{ id: 'e1', school: 'Cabuyao NHS', degree: 'Senior High School TVL', level: 'Senior High School', startYear: '2017', endYear: '2019' }],
    documents: [{ id: 'd1', name: 'Daria_Montelibano_CV.pdf', type: 'Resume / CV', uploadedDate: 'Jul 20, 2026' }],
    stage: 'profiled', status: 'active', sentToRecruitment: true, registeredDate: 'Jul 20, 2026',
    history: [{ id: 'h1', date: 'Jul 20, 2026', text: 'Applicant registered' }, { id: 'h2', date: 'Jul 21, 2026', text: 'Started profiling' }, { id: 'h3', date: 'Jul 22, 2026', text: 'Profile marked complete' }, { id: 'h4', date: 'Jul 23, 2026', text: 'Sent to Recruitment & Selection' }],
  },
];