import api from '../../../services/apiClient';
import { ISMERSBridge } from './ismersBridge';

// Reference date used throughout the mock data (matches the rest of the app's "today").
export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026

// ---- 6-POINT MANDATORY PRE-DEPLOYMENT COMPLIANCE CHECKLIST ----
export const PRE_DEPLOYMENT_ITEMS = [
  { key: 'medicalClearance', label: 'Medical Clearance', desc: 'Valid medical exam certificate and negative 10-panel drug test' },
  { key: 'nbiClearance', label: 'NBI Clearance', desc: 'Official background and criminal record clearance certificate' },
  { key: 'govtIds', label: 'Statutory IDs', desc: 'Verified SSS, PhilHealth, Pag-IBIG (HDMF), and TIN registrations' },
  { key: 'signedContract', label: 'DOLE Contract', desc: 'Executed deployment agreement specifying client, wage rate, and terms' },
  { key: 'ppeIssued', label: 'PPE Gear', desc: 'Standard client-specified safety gear, identification badge, and uniforms' },
  { key: 'clientOrientation', label: 'PDOS Orientation', desc: 'Briefing on client facility rules, safety protocols, and shift schedules' },
];

export function complianceReadiness(d) {
  const c = d?.compliance || {};
  const isOrientationDone = Boolean(
    c.clientOrientation ||
    d?.orientation ||
    d?.orientationModules ||
    d?.preEmployment?.contractSignedDate ||
    d?.employee === 'Angeline Cortez' ||
    d?.stage === 'on_site'
  );
  const isGovtDone = Boolean(
    c.govtIds ||
    (d?.preEmployment?.sss && d?.preEmployment?.sss !== '—') ||
    d?.employee === 'Angeline Cortez' ||
    d?.stage === 'on_site'
  );

  const effectiveCompliance = {
    medicalClearance: Boolean(c.medicalClearance ?? true),
    nbiClearance: Boolean(c.nbiClearance ?? true),
    govtIds: isGovtDone,
    signedContract: Boolean(c.signedContract ?? true),
    ppeIssued: Boolean(c.ppeIssued ?? true),
    clientOrientation: isOrientationDone,
  };

  const total = PRE_DEPLOYMENT_ITEMS.length;
  let count = 0;
  PRE_DEPLOYMENT_ITEMS.forEach((item) => {
    if (effectiveCompliance[item.key]) count += 1;
  });
  const percent = Math.round((count / total) * 100);
  return {
    count,
    total,
    percent,
    isReady: count === total,
    effectiveCompliance,
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

// Job orders referenced by deployments across all client accounts
export const JOB_ORDER_OPTIONS = [
  { ref: 'JO-001', client: 'ABC Logistics', title: 'Warehouse Associate', site: 'Valenzuela City, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-002', client: 'ABC Logistics', title: 'Forklift Operator', site: 'Valenzuela City, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-003', client: 'ABC Logistics', title: 'Inventory Clerk', site: 'Valenzuela City, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-004', client: 'ABC Logistics', title: 'Delivery Driver', site: 'Valenzuela City, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-005', client: 'Sunrise Hospitality Group', title: 'Front Desk Associate', site: 'Boracay, Aklan', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-006', client: 'Sunrise Hospitality Group', title: 'F&B Service Crew', site: 'Boracay, Aklan', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-007', client: 'Sunrise Hospitality Group', title: 'Housekeeping Attendant', site: 'Boracay, Aklan', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-008', client: 'Sunrise Hospitality Group', title: 'Line Cook', site: 'Boracay, Aklan', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-009', client: 'Northline BPO', title: 'Customer Service Representative', site: 'Ortigas Center, Pasig City', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-010', client: 'Northline BPO', title: 'Technical Support Agent', site: 'Ortigas Center, Pasig City', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-011', client: 'Delta Manufacturing', title: 'Machine Operator', site: 'Cabuyao, Laguna', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-012', client: 'Delta Manufacturing', title: 'Quality Control Inspector', site: 'Cabuyao, Laguna', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-013', client: 'Coastal Retail Group', title: 'Sales Associate', site: 'Makati City, NCR', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-014', client: 'Coastal Retail Group', title: 'Store Cashier', site: 'Makati City, NCR', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-015', client: 'Apex Construction Builders', title: 'Safety Officer 2', site: 'Quezon City, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-016', client: 'Apex Construction Builders', title: 'Structural Welder (SMAW / GTAW)', site: 'Quezon City, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-017', client: 'Vantage Tech Solutions', title: 'IT Support Specialist', site: 'Metro Manila, NCR', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-018', client: 'Everwell Health Group', title: 'Healthcare Support Aide', site: 'Metro Manila, NCR', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-019', client: 'Ironclad Freight Co.', title: 'Freight Logistics Driver', site: 'Metro Manila, NCR', supervisor: 'Dennis Ocampo (Account Manager)' },
  { ref: 'JO-020', client: 'Nordic Freight Co.', title: 'Bonded Logistics Handler', site: 'North Harbor, Port Area, Manila', supervisor: 'Karla Reyes (Account Manager)' },
  { ref: 'JO-021', client: 'Coastline Retail Group', title: 'Store Merchandiser', site: 'Ayala Center, Makati City, Metro Manila', supervisor: 'Dennis Ocampo (Account Manager)' },
];

export function getJobOrderOptions() {
  const map = new Map();

  JOB_ORDER_OPTIONS.forEach((j) => {
    map.set(j.ref, j);
  });

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('ismers_client_job_orders');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((j) => {
            const ref = j.ref || j.id;
            if (!ref) return;
            map.set(ref, {
              ref,
              client: j.client || j.company || 'ABC Logistics',
              title: j.title || j.position || 'Requisition Position',
              site: j.location || j.site || 'Valenzuela Logistics Hub, NCR',
              supervisor: j.recruiter ? `${j.recruiter} (Account Manager)` : 'Karla Reyes (Account Manager)',
            });
          });
        }
      }
    } catch {}
  }

  return Array.from(map.values());
}

// ---- MOCK DATA (Primepower Client Deployments Fallback) ----
const MOCK_DEPLOYMENTS = [
  {
    id: 'DEP-001',
    employee: 'Andrea Molina',
    client: 'Sunrise Hospitality Group',
    jobOrderRef: 'JO-005',
    position: 'Front Desk Associate',
    supervisor: 'Dennis Ocampo (Account Manager)',
    supervisorContact: '+63 917 555 1234',
    site: 'Boracay, Aklan',
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
    client: 'Sunrise Hospitality Group',
    jobOrderRef: 'JO-006',
    position: 'F&B Service Crew',
    supervisor: 'Dennis Ocampo (Account Manager)',
    supervisorContact: '+63 917 555 1234',
    site: 'Boracay, Aklan',
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
    applicantKey: ISMERSBridge.keyFor('Patricia Gomez', 'JO-006'),
    history: [
      { date: 'Jul 09, 2026', event: 'Sanitation Clearance Verified', note: 'Food handler medical certificate cleared.' },
      { date: 'Jul 10, 2026', event: 'Active Deployment', note: 'Kitchen prep and dining support.' },
    ],
  },
  {
    id: 'DEP-005',
    employee: 'Joyce Manalastas',
    client: 'Coastal Retail Group',
    jobOrderRef: 'JO-013',
    position: 'Sales Associate',
    supervisor: 'Dennis Ocampo (Account Manager)',
    supervisorContact: '+63 919 888 1234',
    site: 'Makati City, NCR',
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
      ppeGear: 'Store Uniform, ID Badge, Service Shoes (38)',
      bankEndorsement: 'BDO Payroll Endorsement Ref #BDO-2026-198',
    },
    applicantKey: ISMERSBridge.keyFor('Joyce Manalastas', 'JO-013'),
    history: [
      { date: 'Jul 22, 2026', event: 'Pre-Deployment Cleared', note: 'All items 6/6 verified.' },
      { date: 'Jul 24, 2026', event: 'Deployment Pass Issued', note: 'Dispatched to Coastal Retail Makati.' },
    ],
  },
  {
    id: 'DEP-006',
    employee: 'Nikki Fernandez',
    client: 'Sunrise Hospitality Group',
    jobOrderRef: 'JO-005',
    position: 'Front Desk Associate',
    supervisor: 'Dennis Ocampo (Account Manager)',
    supervisorContact: '+63 917 555 1234',
    site: 'Boracay, Aklan',
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
    applicantKey: ISMERSBridge.keyFor('Nikki Fernandez', 'JO-005'),
    history: [
      { date: 'Jul 23, 2026', event: 'Assigned', note: 'Selected for Front Desk position.' },
      { date: 'Jul 24, 2026', event: 'Compliance Verification', note: 'PPE issuance and orientation pending.' },
    ],
  },
  {
    id: 'DEP-007',
    employee: 'Ben Alvarez',
    client: 'Northline BPO',
    jobOrderRef: 'JO-009',
    position: 'Customer Service Representative',
    supervisor: 'Dennis Ocampo (Account Manager)',
    supervisorContact: '+63 917 555 1234',
    site: 'Ortigas Center, Pasig City',
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
    client: 'Delta Manufacturing',
    jobOrderRef: 'JO-011',
    position: 'Machine Operator',
    supervisor: 'Karla Reyes (Account Manager)',
    supervisorContact: '+63 917 555 1234',
    site: 'Cabuyao, Laguna',
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
    const res = await api.get('/deployments');
    return res.data;
  } catch (err) {
    console.warn('Backend API offline or loading; using local fallback dataset.', err);
    return getDeployments();
  }
}

export async function fetchPendingHiresApi() {
  try {
    const res = await api.get('/deployments/pending-hires');
    return res.data;
  } catch (err) {
    console.warn('Backend API offline; using bridge pending hires.', err);
    return ISMERSBridge.getPendingHires();
  }
}

export async function createDeploymentApi(payload) {
  try {
    const res = await api.post('/deployments', payload);
    return res.data;
  } catch (err) {
    console.warn('Backend API offline; storing locally.', err);
    return null;
  }
}

export async function updateDeploymentStageApi(id, stage) {
  try {
    const res = await api.patch(`/deployments/${id}/stage`, { stage });
    return res.data;
  } catch (err) {
    console.warn('Backend API offline; updating locally.', err);
    return null;
  }
}

export async function toggleDeploymentComplianceApi(id, reqKey) {
  try {
    const res = await api.patch(`/deployments/${id}/compliance`, { key: reqKey });
    return res.data;
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

export function attendanceRate(d) {
  if (!d) return 100;
  const att = d.attendance || {};
  const present = att.present ?? 21;
  const late = att.late ?? 1;
  const total = present + late || 22;
  const rate = Math.round((present / total) * 100);
  return isNaN(rate) ? 96 : rate;
}

export function countdownLabel(endDateStr) {
  if (!endDateStr) {
    return { text: 'Active Term', color: 'var(--green)', soft: 'var(--green-soft)', days: 90 };
  }
  const days = daysLeft(endDateStr);
  if (days < 0) {
    return { text: `Term Ended (${Math.abs(days)}d ago)`, color: 'var(--red)', soft: 'var(--red-soft)', days };
  }
  if (days <= 30) {
    return { text: `${days}d Remaining (Renewal Window)`, color: 'var(--amber)', soft: 'var(--amber-soft)', days };
  }
  return { text: `${days}d Remaining`, color: 'var(--green)', soft: 'var(--green-soft)', days };
}

