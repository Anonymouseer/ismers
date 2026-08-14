import { ISMERSBridge } from './ismersBridge';

// Reference date used throughout the mock data (matches the rest of the app's "today").
export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026

// ---- 6-POINT MANDATORY PRE-DEPLOYMENT COMPLIANCE CHECKLIST ----
export const PRE_DEPLOYMENT_ITEMS = [
  { key: 'medicalClearance', label: 'Medical Clearance & Fit-to-Work', desc: 'Valid medical exam certificate and negative 10-panel drug test' },
  { key: 'nbiClearance', label: 'NBI / Police Clearance', desc: 'Official background and criminal record clearance certificate' },
  { key: 'govtIds', label: 'Government Mandated IDs', desc: 'Verified SSS, PhilHealth, Pag-IBIG (HDMF), and TIN registrations' },
  { key: 'signedContract', label: 'Signed Employment & Deployment Contract', desc: 'Executed deployment agreement specifying client, wage rate, and terms' },
  { key: 'ppeIssued', label: 'PPE & Uniform Gear Issuance', desc: 'Standard client-specified safety gear, identification badge, and uniforms' },
  { key: 'clientOrientation', label: 'Client Site & Safety Orientation', desc: 'Briefing on client facility rules, safety protocols, and shift schedules' },
];

export function complianceReadiness(d) {
  const checklist = d.compliance || {};
  const total = PRE_DEPLOYMENT_ITEMS.length;
  let count = 0;
  PRE_DEPLOYMENT_ITEMS.forEach((item) => {
    if (checklist[item.key]) count += 1;
  });
  const percent = Math.round((count / total) * 100);
  return {
    count,
    total,
    percent,
    isReady: count === total,
  };
}

// ---- OPERATIONAL STATUS GROUPINGS ----
export const STATUS_META = {
  pending_clearance: { label: 'Pending Clearance', color: 'var(--purple)', soft: 'var(--purple-soft)', order: 1 },
  scheduled_dispatch: { label: 'Scheduled / Dispatched', color: 'var(--blue)', soft: 'var(--blue-soft)', order: 2 },
  active_onsite: { label: 'Active On-Site', color: 'var(--green)', soft: 'var(--green-soft)', order: 3 },
  renewal_review: { label: '3-Month Renewal Review', color: 'var(--amber)', soft: 'var(--amber-soft)', order: 4 },
  completed: { label: 'Completed / Released', color: 'var(--muted-fg)', soft: 'var(--border-soft)', order: 5 },
};

export const STATUS_ORDER = ['pending_clearance', 'scheduled_dispatch', 'active_onsite', 'renewal_review', 'completed'];

export function stageToStatus(stage) {
  if (stage === 'assigned' || stage === 'pre_deployment') return 'pending_clearance';
  if (stage === 'scheduled' || stage === 'dispatched' || stage === 'reporting') return 'scheduled_dispatch';
  if (stage === 'on_site' || stage === 'active' || stage === 'in_progress' || stage === 'monitoring') return 'active_onsite';
  if (stage === 'for_renewal' || stage === 'renewal_due' || stage === 'ending') return 'renewal_review';
  return 'completed'; // completed | closed
}

// ---- DEPLOYMENT LIFECYCLE / WORKFLOW ----
export const TRACK_NODES = [
  { id: 'assigned', label: '1. Candidate Assigned' },
  { id: 'pre_deployment', label: '2. Pre-Deployment Clearance' },
  { id: 'scheduled', label: '3. Deployment Scheduled' },
  { id: 'dispatched', label: '4. Dispatched / Endorsed' },
  { id: 'on_site', label: '5. Confirmed Active On-Site' },
  { id: 'for_renewal', label: '6. 3-Month Renewal Review' },
  { id: 'completed', label: '7. Contract Concluded' },
  { id: 'closed', label: '8. Record Archived' },
];

export const STAGE_INDEX = {
  assigned: 0,
  pre_deployment: 1,
  scheduled: 2,
  dispatched: 3,
  on_site: 4,
  for_renewal: 5,
  completed: 6,
  closed: 7,
};

// Job orders referenced by deployments
export const JOB_ORDER_OPTIONS = [
  { ref: 'JO-001', client: 'ABC Logistics', title: 'Warehouse Associate', supervisor: 'Mario Santos (Operations Mgr)' },
  { ref: 'JO-002', client: 'ABC Logistics', title: 'Forklift Operator', supervisor: 'Mario Santos (Operations Mgr)' },
  { ref: 'JO-003', client: 'Nova Retail Group', title: 'Visual Merchandiser', supervisor: 'Karen David (Store Mgr)' },
  { ref: 'JO-004', client: 'Nova Retail Group', title: 'Store Associate', supervisor: 'Karen David (Store Mgr)' },
  { ref: 'JO-005', client: 'Meridian BPO Solutions', title: 'Customer Service Representative', supervisor: 'Arnel Cruz (Team Lead)' },
  { ref: 'JO-006', client: 'Meridian BPO Solutions', title: 'Technical Support Specialist', supervisor: 'Arnel Cruz (Team Lead)' },
  { ref: 'JO-007', client: 'Golden Harvest Agri Corp', title: 'Farm Technician', supervisor: 'Danilo Aquino (Farm Supervisor)' },
  { ref: 'JO-008', client: 'CarePlus Health Staffing', title: 'Home Care Aide', supervisor: 'Dr. Elena Reyes (Director)' },
  { ref: 'JO-009', client: 'Swift Freight Logistics', title: 'Delivery Driver', supervisor: 'Ramon Dela Cruz (Logistics Head)' },
  { ref: 'JO-010', client: 'Summit Manufacturing Inc.', title: 'Production Line Worker', supervisor: 'Engr. Victor Tan (Plant Head)' },
  { ref: 'JO-011', client: 'Swift Freight Logistics', title: 'Warehouse Supervisor', supervisor: 'Ramon Dela Cruz (Logistics Head)' },
  { ref: 'JO-012', client: 'Northline BPO', title: 'Customer Service Rep', supervisor: 'Cynthia Soriano (Operations)' },
  { ref: 'JO-013', client: 'Northline BPO', title: 'Technical Support Agent', supervisor: 'Cynthia Soriano (Operations)' },
  { ref: 'JO-014', client: 'Delta Manufacturing', title: 'Machine Operator', supervisor: 'Manuel Sy (Production Supv)' },
  { ref: 'JO-015', client: 'Sunrise Hospitality Group', title: 'Front Desk Associate', supervisor: 'Cecille Lim (Hotel GM)' },
];

// ---- MOCK DATA (Primepower Client Deployments) ----
const MOCK_DEPLOYMENTS = [
  {
    id: 'DEP-001',
    employee: 'Andrea Molina',
    client: 'Seda Vertis North',
    jobOrderRef: 'JO-015',
    position: 'Front Desk Associate',
    supervisor: 'Cecille Lim (Hotel GM)',
    supervisorContact: '+63 917 555 0192',
    site: 'Vertis North, Quezon City',
    start: 'Jul 03, 2026',
    end: 'Oct 03, 2026',
    stage: 'on_site',
    shift: 'Morning Shift (06:00 - 15:00)',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    applicantKey: ISMERSBridge.keyFor('Andrea Molina', 'JO-015'),
    history: [
      { date: 'Jul 01, 2026', event: 'Candidate Assigned', note: 'Hired via Recruitment & Selection for JO-015.' },
      { date: 'Jul 02, 2026', event: 'Pre-Deployment Cleared', note: 'All 6/6 mandatory compliance requirements verified.' },
      { date: 'Jul 03, 2026', event: 'Dispatched & Confirmed On-Site', note: 'Reported to Hotel GM Cecille Lim; active deployment started.' },
    ],
  },
  {
    id: 'DEP-002',
    employee: 'Jomar Villagracia',
    client: 'ABC Logistics',
    jobOrderRef: 'JO-001',
    position: 'Warehouse Associate',
    supervisor: 'Mario Santos (Operations Mgr)',
    supervisorContact: '+63 918 444 7890',
    site: 'Valenzuela Logistics Hub, NCR',
    start: 'Jul 03, 2026',
    end: 'Jan 03, 2027',
    stage: 'on_site',
    shift: 'Night Shift (22:00 - 07:00)',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    applicantKey: ISMERSBridge.keyFor('Jomar Villagracia', 'JO-001'),
    history: [
      { date: 'Jul 01, 2026', event: 'Assigned', note: 'Selected for ABC Logistics warehouse operations.' },
      { date: 'Jul 03, 2026', event: 'On-Site Deployment', note: 'Night shift staging and inventory handler.' },
    ],
  },
  {
    id: 'DEP-003',
    employee: 'Danilo Ferrer',
    client: 'ABC Logistics',
    jobOrderRef: 'JO-002',
    position: 'Forklift Operator',
    supervisor: 'Mario Santos (Operations Mgr)',
    supervisorContact: '+63 918 444 7890',
    site: 'Valenzuela Logistics Hub, NCR',
    start: 'Jul 05, 2026',
    end: 'Oct 05, 2026',
    stage: 'on_site',
    shift: 'Day Shift (08:00 - 17:00)',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    applicantKey: ISMERSBridge.keyFor('Danilo Ferrer', 'JO-002'),
    history: [
      { date: 'Jul 04, 2026', event: 'TESDA Heavy Equipment Verified', note: 'NC II Certificate verified.' },
      { date: 'Jul 05, 2026', event: 'On-Site Deployment', note: 'Active forklift operations.' },
    ],
  },
  {
    id: 'DEP-004',
    employee: 'Patricia Gomez',
    client: 'Vikings Luxury Buffet',
    jobOrderRef: 'JO-003',
    position: 'Kitchen Staff / Food Prep',
    supervisor: 'Marco Santos (Executive Chef)',
    supervisorContact: '+63 917 222 3456',
    site: 'SM Mall of Asia, Pasay City',
    start: 'Jul 10, 2026',
    end: 'Oct 10, 2026',
    stage: 'for_renewal',
    shift: 'Mid Shift (11:00 - 20:00)',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    applicantKey: ISMERSBridge.keyFor('Patricia Gomez', 'JO-003'),
    history: [
      { date: 'Jul 09, 2026', event: 'Sanitation Clearance Verified', note: 'Food handler medical certificate cleared.' },
      { date: 'Jul 10, 2026', event: 'Active Deployment', note: 'Kitchen prep and dining support.' },
      { date: 'Jul 24, 2026', event: '3-Month Renewal Alert', note: 'Contract nearing 90-day threshold.' },
    ],
  },
  {
    id: 'DEP-005',
    employee: 'Joyce Manalastas',
    client: 'City Garden Hotel',
    jobOrderRef: 'JO-004',
    position: 'Housekeeping Attendant',
    supervisor: 'Dennis Ocampo (Hotel Manager)',
    supervisorContact: '+63 919 888 1234',
    site: 'P Burgos St, Makati City',
    start: 'Jul 26, 2026',
    end: 'Jan 26, 2027',
    stage: 'dispatched',
    shift: 'Regular Shift (07:00 - 16:00)',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    applicantKey: ISMERSBridge.keyFor('Joyce Manalastas', 'JO-004'),
    history: [
      { date: 'Jul 22, 2026', event: 'Pre-Deployment Cleared', note: 'All items 6/6 verified.' },
      { date: 'Jul 24, 2026', event: 'Deployment Pass Issued', note: 'Dispatched to City Garden Hotel Makati.' },
    ],
  },
  {
    id: 'DEP-006',
    employee: 'Nikki Fernandez',
    client: 'Seda Vertis North',
    jobOrderRef: 'JO-015',
    position: 'Front Desk Associate',
    supervisor: 'Cecille Lim (Hotel GM)',
    supervisorContact: '+63 917 555 0192',
    site: 'Vertis North, Quezon City',
    start: 'Jul 28, 2026',
    end: 'Oct 28, 2026',
    stage: 'pre_deployment',
    shift: 'Rotating Shift',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: false,
      clientOrientation: false,
    },
    applicantKey: ISMERSBridge.keyFor('Nikki Fernandez', 'JO-015'),
    history: [
      { date: 'Jul 23, 2026', event: 'Assigned', note: 'Selected for Front Desk position.' },
      { date: 'Jul 24, 2026', event: 'Compliance Verification', note: 'PPE issuance and orientation pending.' },
    ],
  },
  {
    id: 'DEP-007',
    employee: 'Ben Alvarez',
    client: 'Vikings Luxury Buffet',
    jobOrderRef: 'JO-003',
    position: 'Dining Service Associate',
    supervisor: 'Marco Santos (Executive Chef)',
    supervisorContact: '+63 917 222 3456',
    site: 'SM Mall of Asia, Pasay City',
    start: 'Jul 30, 2026',
    end: 'Jul 30, 2027',
    stage: 'assigned',
    shift: 'Evening Shift (15:00 - 00:00)',
    compliance: {
      medicalClearance: false,
      nbiClearance: true,
      govtIds: true,
      signedContract: false,
      ppeIssued: false,
      clientOrientation: false,
    },
    history: [
      { date: 'Jul 24, 2026', event: 'Assigned from Pool', note: 'Pending pre-employment medical and fit-to-work clearance.' },
    ],
  },
  {
    id: 'DEP-008',
    employee: 'Rodel Panganiban',
    client: 'Y2 Hotel Residence',
    jobOrderRef: 'JO-007',
    position: 'Maintenance Technician',
    supervisor: 'Gina Alcantara (Head of Operations)',
    supervisorContact: '+63 922 555 9012',
    site: 'Makati City',
    start: 'Jun 22, 2026',
    end: 'Jul 22, 2026',
    stage: 'completed',
    shift: 'Morning Shift (06:00 - 15:00)',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    history: [
      { date: 'Jun 22, 2026', event: 'Deployed On-Site', note: 'Maintenance contract started.' },
      { date: 'Jul 22, 2026', event: 'Contract Concluded', note: 'Completed 1-month emergency coverage smoothly; cleared for redeployment.' },
    ],
  },
];

export function getDeployments() {
  return MOCK_DEPLOYMENTS.map((d) => ({
    ...d,
    compliance: { ...d.compliance },
    history: d.history.map((h) => ({ ...h })),
  }));
}

// ---- pure helpers ----

export function initials(name) {
  if (!name) return 'EM';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export function daysLeft(dateStr) {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / 86400000);
}

export function countdownLabel(dateStr) {
  const diff = daysLeft(dateStr);
  if (diff < 0) return { text: 'Ended', color: 'var(--muted-fg)', soft: 'var(--border-soft)' };
  if (diff === 0) return { text: 'Ends today', color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 14) return { text: `Urgent: ${diff}d left`, color: 'var(--red)', soft: 'var(--red-soft)' };
  if (diff <= 30) return { text: `${diff}d left`, color: 'var(--amber)', soft: 'var(--amber-soft)' };
  if (diff <= 90) return { text: `${diff}d to renewal`, color: 'var(--amber)', soft: 'var(--amber-soft)' };
  return { text: `${diff}d remaining`, color: 'var(--muted-fg)', soft: 'var(--border-soft)' };
}

export function nextDepId(deployments) {
  const nums = deployments
    .map((d) => parseInt(d.id.replace('DEP-', ''), 10))
    .filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return 'DEP-' + String(next).padStart(3, '0');
}

export function renderStageActionsText(d) {
  const read = complianceReadiness(d);
  switch (d.stage) {
    case 'assigned':
      return {
        note: `${d.employee} has been assigned to ${d.client} (${d.jobOrderRef}). Verify mandatory pre-deployment requirements.`,
        action: { label: 'Begin Pre-Deployment Verification', next: 'pre_deployment', kind: 'go' },
      };
    case 'pre_deployment':
      return {
        note: read.isReady
          ? `All 6/6 compliance items verified! Ready to finalize deployment schedule and dispatch.`
          : `Pre-deployment compliance in progress (${read.count}/${read.total} complete). Verify remaining items below before dispatch.`,
        action: read.isReady
          ? { label: 'Finalize Schedule & Site Details', next: 'scheduled', kind: 'go' }
          : null,
      };
    case 'scheduled':
      return {
        note: `Schedule finalized for ${d.site} (${d.start} → ${d.end}). Issue official deployment pass and dispatch employee.`,
        action: { label: 'Issue Deployment Pass & Dispatch', next: 'dispatched', kind: 'go' },
      };
    case 'dispatched':
      return {
        note: `${d.employee} has been dispatched with Endorsement Pass. Awaiting confirmation of on-site arrival from ${d.supervisor || 'Client Supervisor'}.`,
        action: { label: 'Confirm Client Site Arrival (Active)', next: 'on_site', kind: 'go' },
      };
    case 'on_site':
      return {
        note: `Active deployment ongoing at ${d.site}. Monitor contract term and prepare for 3-month renewal review.`,
        action: { label: 'Initiate 3-Month Renewal Review', next: 'for_renewal', kind: 'go' },
      };
    case 'for_renewal':
      return {
        note: `Contract is within the 90-day review period. Process contract renewal extension or release worker for redeployment upon end date.`,
        action: { label: 'Mark Contract Concluded / Release', next: 'completed', kind: 'go' },
      };
    case 'completed':
      return {
        note: `Contract concluded smoothly. Worker is cleared for redeployment to another open Job Order or archive.`,
        action: { label: 'Archive Deployment Record', next: 'closed', kind: 'go' },
      };
    case 'closed':
      return { note: 'This deployment record is closed and archived for audit compliance.', action: null };
    default:
      return { note: '', action: null };
  }
}
