// Mock data for the Recruitment & Selection subsystem.
// Mirrors the structure from the original recruitment.html prototype.
// Swap this out for a real API call (RecruitmentSelectionService.getApplications())
// once the Laravel endpoint (/api/v1/applications) is wired up.

export const CURRENT_ADMIN = 'Name of Administrator';
export const TODAY = new Date(2026, 6, 24); // Jul 24, 2026

// depRef cross-references the same job order in the Deployment & Assignment
// subsystem's job order list — this is what lets a hired candidate here
// resolve to the right client/job order over there.
export const JOB_ORDERS = [
  { id: 'jo1', title: 'Warehouse Associate', client: 'ABC Logistics', depRef: 'JO-001' },
  { id: 'jo2', title: 'Forklift Operator', client: 'ABC Logistics', depRef: 'JO-002' },
  { id: 'jo3', title: 'Customer Service Rep', client: 'Northline BPO', depRef: 'JO-012' },
  { id: 'jo4', title: 'Technical Support Agent', client: 'Northline BPO', depRef: 'JO-013' },
  { id: 'jo5', title: 'Machine Operator', client: 'Delta Manufacturing', depRef: 'JO-014' },
  { id: 'jo6', title: 'Front Desk Associate', client: 'Sunrise Hospitality Group', depRef: 'JO-015' },
];

export function jobById(id) {
  return JOB_ORDERS.find((j) => j.id === id);
}

export const STAGES = [
  { key: 'applied', label: 'Applied', dot: '#8A8578' },
  { key: 'shortlisted', label: 'Shortlisted', dot: '#8B6FD1' },
  { key: 'interview', label: 'Interview Scheduled', dot: '#3D7DD6' },
  { key: 'technical', label: 'Technical Assessment', dot: '#D98A2B' },
  { key: 'final_interview', label: 'Final Interview', dot: '#2F8F7A' },
  { key: 'background', label: 'Background Check', dot: '#6E7B8B' },
  { key: 'offer', label: 'Job Offer', dot: '#C77DBB' },
  { key: 'hired', label: 'Hired', dot: '#149E6E' },
  { key: 'rejected', label: 'Rejected', dot: '#D45B5B' },
];

export const PIPELINE_ORDER = [
  'applied', 'shortlisted', 'interview', 'technical',
  'final_interview', 'background', 'offer', 'hired',
];

// stages that involve a meeting and should get an auto-scheduled slot
// when a candidate moves into them
export const INTERVIEW_STAGES = {
  interview: 'Screening Interview',
  technical: 'Technical Assessment',
  final_interview: 'Final Interview',
};

export const CHECKLIST_ITEMS = [
  { key: 'requirements', label: 'Meets minimum job requirements' },
  { key: 'identity', label: 'Identity documents verified' },
  { key: 'history', label: 'Employment history confirmed' },
  { key: 'reference', label: 'Reference / background check completed' },
];

export const DOC_DEFS = [
  { type: 'resume', name: 'Resume.pdf' },
  { type: 'certificate', name: 'Certificates.pdf' },
  { type: 'portfolio', name: 'Portfolio.pdf' },
];

export const SLOT_TIMES = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

// Raw seed applications (ids get assigned when loaded into state — see
// RecruitmentSelectionPage's buildInitialApplications()).
export const APPLICATIONS = [
  { name: 'Andrea Molina', jobId: 'jo1', status: 'hired', score: 92, applied: 'Jul 01, 2026', experience: '2 yrs', location: 'Valenzuela City',
    breakdown: { skills: 94, experience: 88, screening: 93, availability: 96 }, interview: null,
    notes: [{ text: 'Strong hands-on warehouse experience, confident during screening call.', meta: 'Karla Reyes · Jul 3, 2026' }] },
  { name: 'Jomar Villagracia', jobId: 'jo1', status: 'hired', score: 89, applied: 'Jul 01, 2026', experience: '1.5 yrs', location: 'Valenzuela City',
    breakdown: { skills: 88, experience: 82, screening: 90, availability: 95 }, interview: null,
    notes: [{ text: 'Passed initial screening, references verified.', meta: 'System · Jul 2, 2026' }] },
  { name: 'Michael Tan', jobId: 'jo1', status: 'technical', score: 78, applied: 'Jul 12, 2026', experience: '1 yr', location: 'Caloocan City',
    breakdown: { skills: 75, experience: 70, screening: 82, availability: 85 },
    interview: { title: 'On-site Interview', date: 'Jul 26, 2026', time: '2:00 PM', recruiter: 'Karla Reyes' },
    notes: [{ text: 'Good communication, slightly limited warehouse tenure but eager to learn.', meta: 'Karla Reyes · Jul 14, 2026' }] },
  { name: 'Carlo Dizon', jobId: 'jo1', status: 'shortlisted', score: 70, applied: 'Jul 14, 2026', experience: '0.5 yr', location: 'Valenzuela City',
    breakdown: { skills: 68, experience: 55, screening: 75, availability: 90 }, interview: null,
    notes: [{ text: 'Awaiting document verification before scheduling interview.', meta: 'System · Jul 15, 2026' }] },
  { name: 'Ella Ramos', jobId: 'jo1', status: 'applied', score: 55, applied: 'Jul 16, 2026', experience: 'No exp.', location: 'Quezon City',
    breakdown: { skills: 50, experience: 35, screening: 60, availability: 75 }, interview: null, notes: [] },
  { name: 'Bea Fernandez', jobId: 'jo1', status: 'rejected', score: 61, applied: 'Jul 09, 2026', experience: '0.5 yr', location: 'Manila',
    breakdown: { skills: 58, experience: 45, screening: 65, availability: 70 }, interview: null,
    notes: [{ text: 'Did not meet minimum physical requirement for the role.', meta: 'Karla Reyes · Jul 10, 2026' }] },

  { name: 'Danilo Ferrer', jobId: 'jo2', status: 'hired', score: 90, applied: 'Jul 02, 2026', experience: '3 yrs', location: 'Valenzuela City',
    breakdown: { skills: 92, experience: 90, screening: 88, availability: 92 }, interview: null,
    notes: [{ text: 'Certified operator, excellent safety record from previous employer.', meta: 'Karla Reyes · Jul 3, 2026' }] },
  { name: 'Vince Ocampo', jobId: 'jo2', status: 'final_interview', score: 80, applied: 'Jul 10, 2026', experience: '1.5 yrs', location: 'Malabon City',
    breakdown: { skills: 78, experience: 75, screening: 85, availability: 88 },
    interview: { title: 'Panel Interview', date: 'Jul 25, 2026', time: '10:00 AM', recruiter: 'Karla Reyes, Ops Lead' }, notes: [] },
  { name: 'Rico Manalo', jobId: 'jo2', status: 'shortlisted', score: 77, applied: 'Jul 13, 2026', experience: '1 yr', location: 'Valenzuela City',
    breakdown: { skills: 74, experience: 68, screening: 80, availability: 85 }, interview: null, notes: [] },

  { name: 'Bianca Reyes', jobId: 'jo3', status: 'hired', score: 90, applied: 'Jul 01, 2026', experience: '2 yrs BPO', location: 'Quezon City',
    breakdown: { skills: 90, experience: 88, screening: 92, availability: 94 }, interview: null, notes: [] },
  { name: 'Ramon Guevarra', jobId: 'jo3', status: 'interview', score: 88, applied: 'Jul 08, 2026', experience: '1 yr BPO', location: 'Quezon City',
    breakdown: { skills: 86, experience: 80, screening: 90, availability: 93 },
    interview: { title: 'Final Interview', date: 'Jul 27, 2026', time: '3:00 PM', recruiter: 'Dennis Ocampo' }, notes: [] },
  { name: 'Jerome Villanueva', jobId: 'jo3', status: 'background', score: 81, applied: 'Jul 09, 2026', experience: '6 mos BPO', location: 'Caloocan City',
    breakdown: { skills: 80, experience: 65, screening: 88, availability: 90 }, interview: null, notes: [] },
  { name: 'Patricia Lim', jobId: 'jo3', status: 'shortlisted', score: 66, applied: 'Jul 13, 2026', experience: 'No BPO exp.', location: 'Manila',
    breakdown: { skills: 60, experience: 40, screening: 75, availability: 85 }, interview: null, notes: [] },
  { name: 'Noel Castro', jobId: 'jo3', status: 'applied', score: 74, applied: 'Jul 15, 2026', experience: '3 mos BPO', location: 'Quezon City',
    breakdown: { skills: 70, experience: 55, screening: 80, availability: 88 }, interview: null, notes: [] },

  { name: 'Aldrin Cruz', jobId: 'jo4', status: 'hired', score: 86, applied: 'Jul 02, 2026', experience: '2 yrs Technical', location: 'Quezon City',
    breakdown: { skills: 88, experience: 85, screening: 86, availability: 90 }, interview: null, notes: [] },
  { name: 'Mark Espino', jobId: 'jo4', status: 'offer', score: 75, applied: 'Jul 09, 2026', experience: '1 yr Technical', location: 'Caloocan City',
    breakdown: { skills: 72, experience: 65, screening: 80, availability: 85 }, interview: null, notes: [] },

  { name: 'Rodel Manalastas', jobId: 'jo5', status: 'hired', score: 79, applied: 'Jul 05, 2026', experience: '1 yr Machine Ops', location: 'Cabuyao, Laguna',
    breakdown: { skills: 78, experience: 70, screening: 82, availability: 88 }, interview: null,
    notes: [{ text: 'Urgent slot — expedited to hire given deadline pressure.', meta: 'Karla Reyes · Jul 6, 2026' }] },
  { name: 'Kristine Ong', jobId: 'jo5', status: 'shortlisted', score: 74, applied: 'Jul 11, 2026', experience: '6 mos Machine Ops', location: 'Sta. Rosa, Laguna',
    breakdown: { skills: 70, experience: 60, screening: 78, availability: 85 }, interview: null, notes: [] },
  { name: 'John Bautista', jobId: 'jo5', status: 'applied', score: 69, applied: 'Jul 14, 2026', experience: 'No exp.', location: 'Cabuyao, Laguna',
    breakdown: { skills: 62, experience: 40, screening: 75, availability: 80 }, interview: null, notes: [] },

  { name: 'Joyce Villamor', jobId: 'jo6', status: 'interview', score: 84, applied: 'Jul 11, 2026', experience: '2 yrs Hospitality', location: 'Boracay, Aklan',
    breakdown: { skills: 85, experience: 80, screening: 86, availability: 90 },
    interview: { title: 'On-site Interview', date: 'Jul 25, 2026', time: '1:00 PM', recruiter: 'Dennis Ocampo' }, notes: [] },
  { name: 'Nico Salvador', jobId: 'jo6', status: 'hired', score: 87, applied: 'Jul 05, 2026', experience: '3 yrs Hospitality', location: 'Boracay, Aklan',
    breakdown: { skills: 88, experience: 85, screening: 86, availability: 90 }, interview: null,
    notes: [{ text: 'Excellent front-desk presentation, strong guest-service track record.', meta: 'Dennis Ocampo · Jul 6, 2026' }] },
  { name: 'Erwin Salcedo', jobId: 'jo6', status: 'shortlisted', score: 72, applied: 'Jul 14, 2026', experience: '1 yr Hospitality', location: 'Kalibo, Aklan',
    breakdown: { skills: 70, experience: 62, screening: 78, availability: 85 }, interview: null, notes: [] },
  { name: 'Lorna Bautista', jobId: 'jo6', status: 'applied', score: 65, applied: 'Jul 15, 2026', experience: '6 mos Hospitality', location: 'Boracay, Aklan',
    breakdown: { skills: 60, experience: 50, screening: 70, availability: 80 }, interview: null, notes: [] },
  { name: 'Ferdie Cortez', jobId: 'jo6', status: 'applied', score: 60, applied: 'Jul 16, 2026', experience: 'No exp.', location: 'Boracay, Aklan',
    breakdown: { skills: 55, experience: 35, screening: 65, availability: 78 }, interview: null, notes: [] },
];