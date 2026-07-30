// ApplicantRegistrationService.js
//
// For now this exports static mock data + pure helpers, mirroring the
// original static HTML prototype. Once the Laravel API is ready
// (`/api/v1/applicants`), replace SEED_CANDIDATES with real fetch calls
// (e.g. getAll(), create(), update()) and keep the same shapes so the
// store and components don't need to change.

export const JOB_TARGETS = [
  { id: 'jo1', title: 'Warehouse Associate', client: 'ABC Logistics' },
  { id: 'jo2', title: 'Forklift Operator', client: 'ABC Logistics' },
  { id: 'jo3', title: 'Customer Service Rep', client: 'Northline BPO' },
  { id: 'jo4', title: 'Technical Support Agent', client: 'Northline BPO' },
  { id: 'jo5', title: 'Machine Operator', client: 'Delta Manufacturing' },
  { id: 'jo6', title: 'Front Desk Associate', client: 'Sunrise Hospitality Group' },
];

export function targetById(id) {
  return JOB_TARGETS.find((j) => j.id === id);
}

export const STAGE_META = {
  registered: { label: 'Registered', color: 'var(--muted)' },
  profiling: { label: 'Profiling', color: 'var(--blue)' },
  profiled: { label: 'Profiled — Ready', color: 'var(--purple)' },
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

// ---- SEED DATA (mock — as if these people already registered externally) ----
export const SEED_CANDIDATES = [
  {
    regId: 'REG-001', name: 'Maricel Andrade', email: 'maricel.andrade@email.com', phone: '0917-201-3345',
    location: 'Valenzuela City', experienceSummary: 'No formal work experience yet',
    targetJobId: null, skills: [], workHistory: [], stage: 'registered', sentToRecruitment: false, registeredDate: 'Jul 20, 2026',
  },
  {
    regId: 'REG-002', name: 'Cherry Bacani', email: 'cherry.bacani@email.com', phone: '0918-442-9981',
    location: 'Caloocan City', experienceSummary: '6 months retail experience',
    targetJobId: null, skills: [], workHistory: [], stage: 'registered', sentToRecruitment: false, registeredDate: 'Jul 21, 2026',
  },
  {
    regId: 'REG-003', name: 'Mark Villaruel', email: 'mark.villaruel@email.com', phone: '0920-113-7762',
    location: 'Quezon City', experienceSummary: '1 year call center experience',
    targetJobId: null, skills: [], workHistory: [], stage: 'registered', sentToRecruitment: false, registeredDate: 'Jul 22, 2026',
  },
  {
    regId: 'REG-004', name: 'Julius Tabora', email: 'julius.tabora@email.com', phone: '0917-556-2210',
    location: 'Valenzuela City', experienceSummary: '2 years warehouse experience',
    targetJobId: 'jo1', skills: ['Inventory tallying', 'Pallet jack operation'],
    workHistory: [{ role: 'Warehouse Helper', company: 'CitiMart Distribution', duration: '2023 – 2025' }],
    stage: 'profiling', sentToRecruitment: false, registeredDate: 'Jul 15, 2026',
  },
  {
    regId: 'REG-005', name: 'Paolo Rivera', email: 'paolo.rivera@email.com', phone: '0919-887-4432',
    location: 'Malabon City', experienceSummary: '1.5 years forklift operation',
    targetJobId: 'jo2', skills: ['Forklift certified'],
    workHistory: [{ role: 'Forklift Operator', company: 'Nova Freight Corp.', duration: '2024 – 2025' }],
    stage: 'profiling', sentToRecruitment: false, registeredDate: 'Jul 16, 2026',
  },
  {
    regId: 'REG-006', name: 'Shaira Domingo', email: 'shaira.domingo@email.com', phone: '0917-330-8891',
    location: 'Quezon City', experienceSummary: '2 years BPO customer service',
    targetJobId: 'jo3', skills: ['Customer service', 'CRM tools', 'English proficiency'],
    workHistory: [
      { role: 'Customer Service Rep', company: 'Northline BPO (previous account)', duration: '2023 – 2025' },
      { role: 'Retail Associate', company: 'ShopWise Quezon Ave.', duration: '2022 – 2023' },
    ],
    stage: 'profiled', sentToRecruitment: false, registeredDate: 'Jul 10, 2026',
  },
  {
    regId: 'REG-007', name: 'Wendell Aquino', email: 'wendell.aquino@email.com', phone: '0918-221-6650',
    location: 'Cabuyao, Laguna', experienceSummary: '1 year machine operations',
    targetJobId: 'jo5', skills: ['Machine operation', 'Basic troubleshooting', 'Safety compliance'],
    workHistory: [{ role: 'Machine Operator', company: 'Delta Manufacturing (contractual)', duration: '2024 – 2025' }],
    stage: 'profiled', sentToRecruitment: false, registeredDate: 'Jul 11, 2026',
  },
  {
    regId: 'REG-008', name: 'Angeline Cortez', email: 'angeline.cortez@email.com', phone: '0920-774-2298',
    location: 'Boracay, Aklan', experienceSummary: '3 years hospitality front desk',
    targetJobId: 'jo6', skills: ['Front desk operations', 'Guest relations', 'Booking systems'],
    workHistory: [{ role: 'Front Desk Associate', company: 'Boracay Sands Resort', duration: '2022 – 2025' }],
    stage: 'profiled', sentToRecruitment: true, registeredDate: 'Jul 05, 2026',
  },
];
