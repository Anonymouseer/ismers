// RecruitmentSelectionService.js
// Handles Recruitment & Selection candidate pipeline and stage mutations.
//
// Canonical API base: /api/v1/recruitment/*  (RecruitmentController)
// Legacy aliases under /api/v1/applicants/* are kept server-side for backward
// compatibility and will be removed in a future release.
import api from '../../../services/apiClient';
import { APPLICATIONS } from '../data/mockApplications';
import { ISMERSBridge } from '../../deployment-assignment/services/ismersBridge';

export function keyFor(name, depRef) {
  return ISMERSBridge.keyFor(name, depRef);
}

export function getHire(key) {
  return ISMERSBridge.getHire(key) || null;
}

export function upsertHire(key, data) {
  ISMERSBridge.upsertHire(key, data);
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
    const res = await api.get('/recruitment/applications');
    const data = res.data;

    const mappedDb = (Array.isArray(data) ? data : []).map((app) => {
      return {
        ...app,
        status: app.status || 'pooling',
        clientEndorsementStatus: app.clientEndorsementStatus || 'Pending Review',
        checklist: app.checklist || {
          requirements: false,
          identity: false,
          history: false,
          reference: false,
        },
        docStatus: app.docStatus || {
          resume: false,
          certificate: false,
          portfolio: false,
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
    const res = await api.patch(`/recruitment/${target}/stage`, {
      recruitment_stage: stage,
      ...(status ? { status } : {}),
    });
    return res.data;
  } catch (err) {
    if (applicantId && applicantId !== appName) {
      try {
        const fallbackTarget = encodeURIComponent(applicantId);
        const res2 = await api.patch(`/recruitment/${fallbackTarget}/stage`, {
          recruitment_stage: stage,
          ...(status ? { status } : {}),
        });
        return res2.data;
      } catch {
        return { ok: false };
      }
    }
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
    const res = await api.patch(`/recruitment/${target}/screening`, body);
    return res.data;
  } catch (err) {
    if (applicantId && applicantId !== appName) {
      try {
        const fallbackTarget = encodeURIComponent(applicantId);
        const res2 = await api.patch(`/recruitment/${fallbackTarget}/screening`, body);
        return res2.data;
      } catch {
        return { ok: false };
      }
    }
    return { ok: false };
  }
}
