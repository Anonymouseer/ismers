// RecruitmentSelectionService.js
// Talks to /api/v1/applications once the Laravel backend is wired up.
// For now these wrap the local mock data so the page can run standalone.
//
// NOTE on cross-feature sync: the original prototype used a page-level
// "ISMERSBridge" (localStorage + events) to let Applicant Registration push
// candidates into this board, and to let Deployment & Assignment report
// deployment status back onto a hired candidate's card. In the SPA, that
// becomes: call ApplicantRegistrationService/DeploymentAssignmentService
// directly for reads, and let each subsystem own writes to its own table
// (see the ISMERS "shared entity ownership" rule). Below is a minimal
// in-memory placeholder so the UI has something to render — swap the
// body of each function for a real service/store call when that
// subsystem's service file exists.

import { APPLICATIONS, PIPELINE_ORDER } from '../data/mockApplications';

const hireDeploymentMock = new Map();

export function keyFor(name, depRef) {
  return `${name}::${depRef}`;
}

export function getHire(key) {
  return hireDeploymentMock.get(key) || null;
}

export function upsertHire(key, data) {
  hireDeploymentMock.set(key, { ...hireDeploymentMock.get(key), ...data });
}

const STAGE_CACHE_KEY = 'ismers_recruitment_stages_v5';
const APPS_CACHE_KEY = 'ismers_recruitment_apps_cache_v5';

export function getStoredStages() {
  try {
    const raw = localStorage.getItem(STAGE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredStage(id, stage) {
  try {
    const stages = getStoredStages();
    stages[String(id)] = stage;
    localStorage.setItem(STAGE_CACHE_KEY, JSON.stringify(stages));
  } catch (e) {
    console.warn('Could not save stage to localStorage:', e);
  }
}

export function getCachedApplications() {
  try {
    const raw = localStorage.getItem(APPS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCachedApplications(apps) {
  try {
    localStorage.setItem(APPS_CACHE_KEY, JSON.stringify(apps));
  } catch (e) {
    console.warn('Could not cache applications:', e);
  }
}

export async function fetchRecruitmentApplications() {
  try {
    const res = await fetch('http://localhost:8000/api/v1/recruitment/applications');
    if (!res.ok) throw new Error('Failed to fetch recruitment applications');
    const data = await res.json();

    const mappedDb = data.map((app) => {
      return {
        ...app,
        status: app.status || 'pooling',
        clientEndorsementStatus: app.clientEndorsementStatus || 'Pending Review',
        checklist: app.checklist || {
          resumeVerified: false,
          contactVerified: false,
          locationFit: false,
          skillsMatched: false,
          notesAdded: false,
        },
        docStatus: app.docStatus || {
          resume: false,
          id: false,
          nbi: false,
          med: false,
        },
        preEmploymentChecklist: app.preEmploymentChecklist || {
          medical_exam: false,
          nbi_clearance: false,
          sss_document: false,
          philhealth_mdr: false,
          pagibig_mid: false,
          bir_tin: false,
          psa_birth_cert: false,
        },
        medicalReferral: app.medicalReferral || null,
        statutoryNumbers: app.statutoryNumbers || {
          sss: '',
          philhealth: '',
          pagibig: '',
          tin: '',
        },
        employmentContract: app.employmentContract || null,
        orientationModules: app.orientationModules || {
          module1: false,
          module2: false,
          module3: false,
          module4: false,
          module5: false,
        },
        atmEndorsement: app.atmEndorsement || null,
        deploymentDetails: app.deploymentDetails || null,
        ppeIssuance: app.ppeIssuance || {
          uniformShirt: false,
          shirtSize: 'L',
          safetyShoes: false,
          shoeSize: '42',
          safetyVest: false,
          idBadge: false,
          whistleKit: false,
        },
        recruiterRating: app.recruiterRating || 0,
        assignedManager: app.assignedManager || 'Area Manager 1 (North NCR)',
        interviewPlatform: app.interviewPlatform || 'Zoom Meeting',
      };
    });

    saveCachedApplications(mappedDb);
    return mappedDb;
  } catch (err) {
    console.warn('Fetch from server failed, falling back to cached applications:', err);
    const cached = getCachedApplications();
    if (cached && cached.length > 0) return cached;
    return [];
  }
}

export async function updateRecruitmentStage(applicantId, stage, status = null, appName = null) {
  if (applicantId) saveStoredStage(applicantId, stage);
  if (appName) saveStoredStage(appName, stage);

  const cached = getCachedApplications();
  if (cached) {
    const updated = cached.map((a) => {
      if (String(a.id) === String(applicantId) || String(a.regId) === String(applicantId) || (appName && a.name === appName)) {
        return { ...a, status: stage };
      }
      return a;
    });
    saveCachedApplications(updated);
  }

  const target = encodeURIComponent(appName || applicantId);
  try {
    const res = await fetch(`http://localhost:8000/api/v1/applicants/${target}/recruitment-stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ recruitment_stage: stage, ...(status ? { status } : {}) }),
    });
    if (res.ok) {
      return await res.json();
    } else if (applicantId && applicantId !== appName) {
      const fallbackTarget = encodeURIComponent(applicantId);
      const res2 = await fetch(`http://localhost:8000/api/v1/applicants/${fallbackTarget}/recruitment-stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ recruitment_stage: stage, ...(status ? { status } : {}) }),
      });
      return res2.ok ? await res2.json() : { ok: false };
    }
    return { ok: false };
  } catch (err) {
    console.warn('Network error updating recruitment stage to server:', err);
    return { ok: false };
  }
}

export async function updateRecruitmentScreening(applicantId, fields, appName = null) {
  const {
    checklist,
    screening_checklist,
    docStatus,
    document_status,
    preEmploymentChecklist,
    pre_employment_checklist,
    medicalReferral,
    medical_referral,
    statutoryNumbers,
    statutory_numbers,
    employmentContract,
    employment_contract,
    orientationModules,
    orientation_modules,
    atmEndorsement,
    atm_endorsement,
    deploymentDetails,
    deployment_details,
    ppeIssuance,
    ppe_issuance,
    recruiterRating,
    recruiter_rating,
    assignedManager,
    assigned_manager,
    interviewPlatform,
    interview_platform,
    clientEndorsementStatus,
    client_endorsement_status,
  } = fields || {};

  const resolvedPreChecklist = pre_employment_checklist !== undefined ? pre_employment_checklist : preEmploymentChecklist;
  const resolvedMedReferral = medical_referral !== undefined ? medical_referral : medicalReferral;
  const resolvedStatNumbers = statutory_numbers !== undefined ? statutory_numbers : statutoryNumbers;
  const resolvedContract = employment_contract !== undefined ? employment_contract : employmentContract;
  const resolvedOrientation = orientation_modules !== undefined ? orientation_modules : orientationModules;
  const resolvedAtm = atm_endorsement !== undefined ? atm_endorsement : atmEndorsement;
  const resolvedDeployment = deployment_details !== undefined ? deployment_details : deploymentDetails;
  const resolvedPpe = ppe_issuance !== undefined ? ppe_issuance : ppeIssuance;
  const resolvedChecklist = screening_checklist !== undefined ? screening_checklist : checklist;
  const resolvedDocStatus = document_status !== undefined ? document_status : docStatus;
  const resolvedRating = recruiter_rating !== undefined ? recruiter_rating : recruiterRating;
  const resolvedManager = assigned_manager !== undefined ? assigned_manager : assignedManager;
  const resolvedPlatform = interview_platform !== undefined ? interview_platform : interviewPlatform;
  const resolvedEndorsement = client_endorsement_status !== undefined ? client_endorsement_status : clientEndorsementStatus;

  const cached = getCachedApplications();
  if (cached) {
    const updated = cached.map((a) => {
      if (String(a.id) === String(applicantId) || String(a.regId) === String(applicantId) || (appName && a.name === appName)) {
        return {
          ...a,
          ...(resolvedChecklist !== undefined ? { checklist: resolvedChecklist } : {}),
          ...(resolvedDocStatus !== undefined ? { docStatus: resolvedDocStatus } : {}),
          ...(resolvedPreChecklist !== undefined ? { preEmploymentChecklist: resolvedPreChecklist } : {}),
          ...(resolvedMedReferral !== undefined ? { medicalReferral: resolvedMedReferral } : {}),
          ...(resolvedStatNumbers !== undefined ? { statutoryNumbers: resolvedStatNumbers } : {}),
          ...(resolvedContract !== undefined ? { employmentContract: resolvedContract } : {}),
          ...(resolvedOrientation !== undefined ? { orientationModules: resolvedOrientation } : {}),
          ...(resolvedAtm !== undefined ? { atmEndorsement: resolvedAtm } : {}),
          ...(resolvedDeployment !== undefined ? { deploymentDetails: resolvedDeployment } : {}),
          ...(resolvedPpe !== undefined ? { ppeIssuance: resolvedPpe } : {}),
          ...(resolvedRating !== undefined ? { recruiterRating: resolvedRating } : {}),
          ...(resolvedManager !== undefined ? { assignedManager: resolvedManager } : {}),
          ...(resolvedPlatform !== undefined ? { interviewPlatform: resolvedPlatform } : {}),
          ...(resolvedEndorsement !== undefined ? { clientEndorsementStatus: resolvedEndorsement } : {}),
        };
      }
      return a;
    });
    saveCachedApplications(updated);
  }

  const body = {};
  if (resolvedChecklist !== undefined) body.screening_checklist = resolvedChecklist;
  if (resolvedDocStatus !== undefined) body.document_status = resolvedDocStatus;
  if (resolvedPreChecklist !== undefined) body.pre_employment_checklist = resolvedPreChecklist;
  if (resolvedMedReferral !== undefined) body.medical_referral = resolvedMedReferral;
  if (resolvedStatNumbers !== undefined) body.statutory_numbers = resolvedStatNumbers;
  if (resolvedContract !== undefined) body.employment_contract = resolvedContract;
  if (resolvedOrientation !== undefined) body.orientation_modules = resolvedOrientation;
  if (resolvedAtm !== undefined) body.atm_endorsement = resolvedAtm;
  if (resolvedDeployment !== undefined) body.deployment_details = resolvedDeployment;
  if (resolvedPpe !== undefined) body.ppe_issuance = resolvedPpe;
  if (resolvedRating !== undefined) body.recruiter_rating = resolvedRating;
  if (resolvedManager !== undefined) body.assigned_manager = resolvedManager;
  if (resolvedPlatform !== undefined) body.interview_platform = resolvedPlatform;
  if (resolvedEndorsement !== undefined) body.client_endorsement_status = resolvedEndorsement;

  const target = encodeURIComponent(appName || applicantId);
  try {
    const res = await fetch(`http://localhost:8000/api/v1/applicants/${target}/recruitment-screening`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      return await res.json();
    } else if (applicantId && applicantId !== appName) {
      const fallbackTarget = encodeURIComponent(applicantId);
      const res2 = await fetch(`http://localhost:8000/api/v1/applicants/${fallbackTarget}/recruitment-screening`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
      });
      return res2.ok ? await res2.json() : { ok: false };
    }
    return { ok: false };
  } catch (err) {
    console.warn('Network error updating recruitment screening to server:', err);
    return { ok: false };
  }
}

// Example real-API shape for later:
// export async function getApplications() {
//   const res = await apiClient.get('/applications');
//   return res.data.data;
// }
// export async function updateApplicationStatus(id, status) {
//   const res = await apiClient.patch(`/applications/${id}`, { status });
//   return res.data.data;
// }
