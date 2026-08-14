import { ISMERSBridge } from './ismersBridge';

const API_BASE = 'http://localhost:8000/api/v1';

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
  completed: { label: 'Deployment Concluded', color: 'var(--muted-fg)', soft: 'var(--border-soft)', order: 4 },
};

export const STATUS_ORDER = ['pending_clearance', 'scheduled_dispatch', 'active_onsite', 'completed'];

export function stageToStatus(stage) {
  if (stage === 'assigned' || stage === 'pre_deployment') return 'pending_clearance';
  if (stage === 'scheduled' || stage === 'dispatched' || stage === 'reporting') return 'scheduled_dispatch';
  if (stage === 'on_site' || stage === 'active' || stage === 'in_progress' || stage === 'monitoring' || stage === 'for_renewal') return 'active_onsite';
  return 'completed'; // completed | closed
}

// ---- DEPLOYMENT LIFECYCLE / WORKFLOW ----
export const TRACK_NODES = [
  { id: 'assigned', label: '1. Candidate Assigned' },
  { id: 'pre_deployment', label: '2. Pre-Deployment Clearance' },
  { id: 'scheduled', label: '3. Deployment Scheduled' },
  { id: 'dispatched', label: '4. Dispatched / Endorsed' },
  { id: 'on_site', label: '5. Confirmed Active On-Site' },
  { id: 'completed', label: '6. Deployment Concluded' },
  { id: 'closed', label: '7. Record Archived' },
];

export const STAGE_INDEX = {
  assigned: 0,
  pre_deployment: 1,
  scheduled: 2,
  dispatched: 3,
  on_site: 4,
  completed: 5,
  closed: 6,
};

// Job orders referenced by deployments
export const JOB_ORDER_OPTIONS = [
  { ref: 'JO-001', client: 'ABC Logistics', title: 'Warehouse Associate', site: 'Valenzuela Logistics Hub, NCR', supervisor: 'Mario Santos (Operations Mgr)' },
  { ref: 'JO-002', client: 'ABC Logistics', title: 'Forklift Operator', site: 'Valenzuela Logistics Hub, NCR', supervisor: 'Mario Santos (Operations Mgr)' },
  { ref: 'JO-003', client: 'Nova Retail Group', title: 'Visual Merchandiser', site: 'SM Megamall, Mandaluyong', supervisor: 'Karen David (Store Mgr)' },
  { ref: 'JO-004', client: 'Nova Retail Group', title: 'Store Associate', site: 'Ayala Malls Manila Bay, Paranaque', supervisor: 'Karen David (Store Mgr)' },
  { ref: 'JO-005', client: 'Meridian BPO Solutions', title: 'Customer Service Representative', site: 'Cyberpark Tower 1, Cubao, Quezon City', supervisor: 'Arnel Cruz (Team Lead)' },
  { ref: 'JO-006', client: 'Meridian BPO Solutions', title: 'Technical Support Specialist', site: 'Cyberpark Tower 1, Cubao, Quezon City', supervisor: 'Arnel Cruz (Team Lead)' },
  { ref: 'JO-007', client: 'Golden Harvest Agri Corp', title: 'Farm Technician', site: 'San Ildefonso Plantation Site, Bulacan', supervisor: 'Danilo Aquino (Farm Supervisor)' },
  { ref: 'JO-008', client: 'CarePlus Health Staffing', title: 'Home Care Aide', site: 'St. Luke’s Medical Extension Site, BGC', supervisor: 'Dr. Elena Reyes (Director)' },
  { ref: 'JO-009', client: 'Swift Freight Logistics', title: 'Delivery Driver', site: 'North Harbor Hub, Port Area, Manila', supervisor: 'Ramon Dela Cruz (Logistics Head)' },
  { ref: 'JO-010', client: 'Summit Manufacturing Inc.', title: 'Production Line Worker', site: 'Light Industry & Science Park, Laguna', supervisor: 'Engr. Victor Tan (Plant Head)' },
  { ref: 'JO-011', client: 'Swift Freight Logistics', title: 'Warehouse Supervisor', site: 'North Harbor Hub, Port Area, Manila', supervisor: 'Ramon Dela Cruz (Logistics Head)' },
  { ref: 'JO-012', client: 'Northline BPO', title: 'Customer Service Rep', site: 'PBCom Tower, Ayala Ave, Makati City', supervisor: 'Cynthia Soriano (Operations)' },
  { ref: 'JO-013', client: 'Northline BPO', title: 'Technical Support Agent', site: 'PBCom Tower, Ayala Ave, Makati City', supervisor: 'Cynthia Soriano (Operations)' },
  { ref: 'JO-014', client: 'Delta Manufacturing', title: 'Machine Operator', site: 'Caloocan Industrial Estate, Metro Manila', supervisor: 'Manuel Sy (Production Supv)' },
  { ref: 'JO-015', client: 'Seda Vertis North', title: 'Front Desk Associate', site: 'Vertis North, Astra cor. Lux Drive, QC', supervisor: 'Cecille Lim (Hotel GM)' },
];

// ---- MOCK DATA (Primepower Client Deployments Fallback) ----
const MOCK_DEPLOYMENTS = [
  {
    id: 'DEP-001',
    employee: 'Andrea Molina',
    client: 'Seda Vertis North',
    jobOrderRef: 'JO-015',
    position: 'Front Desk Associate',
    supervisor: 'Cecille Lim (Hotel GM)',
    supervisorContact: '+63 917 555 0192',
    site: 'Vertis North, Astra cor. Lux Drive, QC',
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
    preEmployment: {
      medicalClinic: 'HealthHub Diagnostics QC',
      fitToWork: 'Class A - Fit for Duty',
      drugTestResult: 'Negative (10-Panel)',
      sss: '34-8901234-5',
      philhealth: '12-050678901-2',
      pagibig: '1210-9876-5432',
      tin: '345-678-901-000',
      contractSignedDate: 'Jul 02, 2026',
      ppeGear: 'Uniform Shirt (M), ID Badge, Safety Shoes (38)',
      bankEndorsement: 'BDO Payroll Endorsement Ref #BDO-2026-089',
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
    preEmployment: {
      medicalClinic: 'Hi-Precision Diagnostics Valenzuela',
      fitToWork: 'Class A - Heavy Duty Cleared',
      drugTestResult: 'Negative (10-Panel)',
      sss: '09-1234567-8',
      philhealth: '04-123456789-0',
      pagibig: '1210-4455-6677',
      tin: '234-567-890-000',
      contractSignedDate: 'Jul 02, 2026',
      ppeGear: 'High-Vis Vest, Steel Toe Shoes (43), Hard Hat',
      bankEndorsement: 'BPI Payroll Endorsement Ref #BPI-2026-112',
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
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    preEmployment: {
      medicalClinic: 'HealthHub Diagnostics QC',
      fitToWork: 'Class A - Heavy Equipment Cleared',
      drugTestResult: 'Negative (10-Panel)',
      sss: '03-9876543-2',
      philhealth: '08-765432109-8',
      pagibig: '1210-9988-7766',
      tin: '123-456-789-000',
      contractSignedDate: 'Jul 04, 2026',
      ppeGear: 'High-Vis Vest, Safety Shoes (42), Gloves, Ear Protection',
      bankEndorsement: 'BDO Payroll Endorsement Ref #BDO-2026-104',
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
    site: 'SM Mall of Asia, Seaside Blvd, Pasay City',
    start: 'Jul 10, 2026',
    end: 'Oct 10, 2026',
    stage: 'on_site',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    preEmployment: {
      medicalClinic: 'St. Martin Clinic Pasay',
      fitToWork: 'Food Handler Clearance & Fit to Work',
      drugTestResult: 'Negative (10-Panel)',
      sss: '04-5566778-9',
      philhealth: '11-334455667-8',
      pagibig: '1210-3322-1100',
      tin: '456-789-012-000',
      contractSignedDate: 'Jul 09, 2026',
      ppeGear: 'Chef Apron, Hair Net, Non-Slip Kitchen Shoes (37)',
      bankEndorsement: 'UnionBank Payroll Ref #UB-2026-045',
    },
    applicantKey: ISMERSBridge.keyFor('Patricia Gomez', 'JO-003'),
    history: [
      { date: 'Jul 09, 2026', event: 'Sanitation Clearance Verified', note: 'Food handler medical certificate cleared.' },
      { date: 'Jul 10, 2026', event: 'Active Deployment', note: 'Kitchen prep and dining support.' },
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
    site: 'P. Burgos cor. Makati Ave, Makati City',
    start: 'Jul 26, 2026',
    end: 'Jan 26, 2027',
    stage: 'dispatched',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    preEmployment: {
      medicalClinic: 'Makati Medical Center OPD',
      fitToWork: 'Class A - Fit for Duty',
      drugTestResult: 'Negative (10-Panel)',
      sss: '07-3344112-3',
      philhealth: '09-223344556-7',
      pagibig: '1210-5544-3322',
      tin: '567-890-123-000',
      contractSignedDate: 'Jul 22, 2026',
      ppeGear: 'Housekeeping Uniform, Rubber Gloves, Service Shoes (38)',
      bankEndorsement: 'BDO Payroll Endorsement Ref #BDO-2026-198',
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
    site: 'Vertis North, Astra cor. Lux Drive, QC',
    start: 'Jul 28, 2026',
    end: 'Oct 28, 2026',
    stage: 'pre_deployment',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: false,
      clientOrientation: false,
    },
    preEmployment: {
      medicalClinic: 'HealthHub Diagnostics QC',
      fitToWork: 'Class A - Fit for Duty',
      drugTestResult: 'Negative (10-Panel)',
      sss: '05-9988776-5',
      philhealth: '10-998877665-4',
      pagibig: '1210-7788-9900',
      tin: '678-901-234-000',
      contractSignedDate: 'Jul 24, 2026',
      ppeGear: 'Uniform Blazer (Pending Size S fitting)',
      bankEndorsement: 'BDO Payroll Endorsement Ref #BDO-2026-211',
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
    site: 'SM Mall of Asia, Seaside Blvd, Pasay City',
    start: 'Jul 30, 2026',
    end: 'Jul 30, 2027',
    stage: 'assigned',
    compliance: {
      medicalClearance: false,
      nbiClearance: true,
      govtIds: true,
      signedContract: false,
      ppeIssued: false,
      clientOrientation: false,
    },
    preEmployment: {
      medicalClinic: 'Pending Clinic Appointment',
      fitToWork: 'Pending Medical Result',
      drugTestResult: 'Pending Drug Test',
      sss: '02-1122334-4',
      philhealth: '03-556677889-0',
      pagibig: '1210-1122-3344',
      tin: '789-012-345-000',
      contractSignedDate: 'Pending Execution',
      ppeGear: 'Not yet issued',
      bankEndorsement: 'Pending Account Opening',
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
    site: 'Santiago cor. Valdez St, Makati City',
    start: 'Jun 22, 2026',
    end: 'Jul 22, 2026',
    stage: 'completed',
    compliance: {
      medicalClearance: true,
      nbiClearance: true,
      govtIds: true,
      signedContract: true,
      ppeIssued: true,
      clientOrientation: true,
    },
    preEmployment: {
      medicalClinic: 'Makati Medical Center OPD',
      fitToWork: 'Class A - Maintenance & Technical Fit',
      drugTestResult: 'Negative (10-Panel)',
      sss: '01-4455667-8',
      philhealth: '06-990011223-4',
      pagibig: '1210-6677-8899',
      tin: '890-123-456-000',
      contractSignedDate: 'Jun 20, 2026',
      ppeGear: 'Safety Boots (44), Tool Vest, Hard Hat, Insulated Gloves',
      bankEndorsement: 'BDO Payroll Endorsement Ref #BDO-2026-077',
    },
    history: [
      { date: 'Jun 22, 2026', event: 'Deployed On-Site', note: 'Maintenance contract started.' },
      { date: 'Jul 22, 2026', event: 'Deployment Concluded', note: 'Completed 1-month deployment period smoothly.' },
    ],
  },
];

// ---- ASYNC REST API METHODS (Connected to Laravel Backend) ----

export async function fetchDeploymentsApi() {
  try {
    const res = await fetch(`${API_BASE}/deployments`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline or loading; using local fallback dataset.', err);
    return getDeployments();
  }
}

export async function fetchPendingHiresApi() {
  try {
    const res = await fetch(`${API_BASE}/deployments/pending-hires`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline; using bridge pending hires.', err);
    return ISMERSBridge.getPendingHires();
  }
}

export async function createDeploymentApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline; storing locally.', err);
    return null;
  }
}

export async function updateDeploymentStageApi(id, stage) {
  try {
    const res = await fetch(`${API_BASE}/deployments/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline; updating locally.', err);
    return null;
  }
}

export async function toggleDeploymentComplianceApi(id, reqKey) {
  try {
    const res = await fetch(`${API_BASE}/deployments/${id}/compliance`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ key: reqKey }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline; updating locally.', err);
    return null;
  }
}

export function getDeployments() {
  return MOCK_DEPLOYMENTS.map((d) => ({
    ...d,
    compliance: { ...d.compliance },
    preEmployment: { ...(d.preEmployment || {}) },
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
        note: `Active deployment ongoing at ${d.site}. Staff is on-site and reporting daily.`,
        action: { label: 'Conclude Deployment Term', next: 'completed', kind: 'go' },
      };
    case 'completed':
      return {
        note: `Deployment term concluded smoothly at ${d.site}. Record is ready for archiving.`,
        action: { label: 'Archive Deployment Record', next: 'closed', kind: 'go' },
      };
    case 'closed':
      return { note: 'This deployment record is closed and archived for audit compliance.', action: null };
    default:
      return { note: '', action: null };
  }
}
