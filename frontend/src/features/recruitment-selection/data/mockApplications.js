import { JOB_TARGETS } from '../../applicant-registration/services/ApplicantRegistrationService';

// Mock data for PRIMEPOWER MANPOWER Recruitment & Selection subsystem.
// Exactly aligns with Primepower's official 8-Step Hiring & Endorsement Procedure:
// Pooling -> Area Manager 2nd Interview -> Client Final Interview -> HR Pre-Employment -> Contract Signing -> For Deployment

export const CURRENT_ADMIN = 'Name of Administrator';
export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026

export const JOB_ORDERS = [
  // --- ABC Logistics ---
  { id: 'jo1', title: 'Warehouse Associate', client: 'ABC Logistics', depRef: 'JO-001', category: 'Warehousing & Logistics' },
  { id: 'jo2', title: 'Forklift Operator', client: 'ABC Logistics', depRef: 'JO-002', category: 'Warehousing & Logistics' },
  { id: 'jo3', title: 'Inventory Clerk', client: 'ABC Logistics', depRef: 'JO-003', category: 'Warehousing & Logistics' },
  { id: 'jo4', title: 'Delivery Driver', client: 'ABC Logistics', depRef: 'JO-004', category: 'Warehousing & Logistics' },

  // --- Partner Clients ---
  { id: 'jo-seda-1', title: 'Housekeeping Supervisor', client: 'Seda Vertis North', depRef: 'JO-011', category: 'Hospitality & Front Desk' },
  { id: 'jo-vikings-1', title: 'F&B Service Crew', client: 'Vikings Luxury Buffet', depRef: 'JO-003', category: 'Food & Beverage (F&B / Cook)' },
  { id: 'jo-y2-1', title: 'Cook / Kitchen Staff', client: 'Y2 Hotel Residence', depRef: 'JO-006', category: 'Food & Beverage (F&B / Cook)' },
  { id: 'jo-citygarden-1', title: 'Front Desk Associate', client: 'City Garden Hotel', depRef: 'JO-005', category: 'Hospitality & Front Desk' },

  // Map remainder of JOB_TARGETS
  ...JOB_TARGETS.filter((j) => !['jo1', 'jo2', 'jo3', 'jo4'].includes(j.id)).map((j) => ({
    ...j,
    depRef: j.depRef || `JO-${String(j.id).replace(/\D/g, '').padStart(3, '0')}`,
  })),
];

export function jobById(id) {
  if (!id) return null;
  const matchInOrders = JOB_ORDERS.find((j) => j.id === id);
  if (matchInOrders) return matchInOrders;

  const targetMatch = JOB_TARGETS.find((j) => j.id === id);
  if (targetMatch) {
    return {
      ...targetMatch,
      depRef: targetMatch.depRef || `JO-${String(id).replace(/\D/g, '').padStart(3, '0')}`,
    };
  }
  return null;
}

export const STAGES = [
  { key: 'pooling', label: 'Pooling & Initial Screening', dot: '#8A8578' },
  { key: 'area_manager', label: 'Area Manager 2nd Interview', dot: '#3D7DD6' },
  { key: 'client_interview', label: 'Client Final Interview', dot: '#8B6FD1' },
  { key: 'hr_requirements', label: 'HR Pre-Employment Requirements', dot: '#D98A2B' },
  { key: 'contract_signing', label: 'Orientation & Contract Signing', dot: '#C77DBB' },
  { key: 'for_deployment', label: 'For Deployment', dot: '#149E6E' },
  { key: 're_pooling', label: 'Re-Pooling (Line Up)', dot: '#D45B5B' },
];

export const PIPELINE_ORDER = [
  'pooling',
  'area_manager',
  'client_interview',
  'hr_requirements',
  'contract_signing',
  'for_deployment',
];

export const INTERVIEW_STAGES = {
  pooling: 'Initial Guard & HR Logging',
  area_manager: 'Area Manager / Supervisor 2nd Interview',
  client_interview: 'Client Final Interview (Zoom/In-Person)',
};

export const CHECKLIST_ITEMS = [
  { key: 'requirements', label: 'PRF & Security Guard logging verified' },
  { key: 'identity', label: 'Resume & Application Form submitted' },
  { key: 'history', label: 'Area Supervisor 2nd interview endorsed' },
  { key: 'reference', label: 'Client Final Interview result confirmed' },
];

export const DOC_DEFS = [
  { type: 'resume', name: 'Resume_Form.pdf' },
  { type: 'certificate', name: 'Medical_FitToWork.pdf' },
  { type: 'portfolio', name: 'NBI_Clearance.pdf' },
];

export const SLOT_TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

export const APPLICATIONS = [
  { name: 'Andrea Molina', jobId: 'jo-seda-1', status: 'for_deployment', score: 94, applied: 'Jul 01, 2026', experience: '3 yrs Housekeeping', location: 'Quezon City',
    breakdown: { skills: 95, experience: 92, screening: 94, availability: 98 }, interview: null,
    notes: [{ text: 'Passed Client Final Interview at Seda Vertis. Pre-employment requirements and contract signing completed.', meta: 'Area Manager · Jul 20, 2026' }] },
  
  { name: 'Jomar Villagracia', jobId: 'jo-vikings-1', status: 'contract_signing', score: 89, applied: 'Jul 05, 2026', experience: '2 yrs F&B', location: 'Pasig City',
    breakdown: { skills: 88, experience: 85, screening: 90, availability: 95 }, interview: null,
    notes: [{ text: 'Endorsed by Area Manager to HR. Scheduled for Client Orientation and Contract & ID signing.', meta: 'HR Dept · Jul 22, 2026' }] },
  
  { name: 'Michael Tan', jobId: 'jo-vikings-1', status: 'hr_requirements', score: 85, applied: 'Jul 10, 2026', experience: '1.5 yrs F&B', location: 'Mandaluyong',
    breakdown: { skills: 82, experience: 80, screening: 88, availability: 90 }, interview: null,
    notes: [{ text: 'Client confirmed PASSED interview result. Currently completing NBI clearance & Medical Fit-to-work.', meta: 'Area Supervisor · Jul 23, 2026' }] },

  { name: 'Carlo Dizon', jobId: 'jo-y2-1', status: 'client_interview', score: 88, applied: 'Jul 12, 2026', experience: '2 yrs Line Cook', location: 'Makati City',
    breakdown: { skills: 90, experience: 85, screening: 86, availability: 92 },
    interview: { title: 'Client Final Interview', date: 'Jul 26, 2026', time: '2:00 PM', recruiter: 'Y2 Hotel HR Manager' },
    notes: [{ text: 'Endorsed by Area Manager for Final Interview with Client Y2 Hotel.', meta: 'Area Manager · Jul 18, 2026' }] },

  { name: 'Bea Fernandez', jobId: 'jo-citygarden-1', status: 'area_manager', score: 79, applied: 'Jul 15, 2026', experience: '1 yr Front Desk', location: 'Manila',
    breakdown: { skills: 78, experience: 75, screening: 82, availability: 85 },
    interview: { title: 'Area Manager 2nd Interview', date: 'Jul 25, 2026', time: '10:00 AM', recruiter: 'Area Supervisor' },
    notes: [{ text: 'Initial screening passed. Endorsed to Area Manager for 2nd interview evaluation.', meta: 'Recruiter · Jul 16, 2026' }] },

  { name: 'Rico Manalo', jobId: 'jo1', status: 'pooling', score: 75, applied: 'Jul 20, 2026', experience: '1 yr Warehouse', location: 'Valenzuela',
    breakdown: { skills: 72, experience: 70, screening: 78, availability: 88 }, interview: null,
    notes: [{ text: 'Logged by Guard & front desk. Resumed screened and categorized for Warehouse pooling.', meta: 'Front Desk · Jul 20, 2026' }] },

  { name: 'Vince Ocampo', jobId: 'jo-seda-1', status: 're_pooling', score: 62, applied: 'Jul 08, 2026', experience: '0.5 yr', location: 'Caloocan',
    breakdown: { skills: 60, experience: 50, screening: 68, availability: 75 }, interview: null,
    notes: [{ text: 'Client interview result: Failed. Returned to Main Office Pooling for line-up to other clients within 3 days.', meta: 'Area Manager · Jul 19, 2026' }] }
];