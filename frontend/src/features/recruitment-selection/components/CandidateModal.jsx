import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  STAGES, PIPELINE_ORDER, INTERVIEW_STAGES, DOC_DEFS,
  CURRENT_ADMIN, TODAY,
} from '../data/mockApplications';
import { scoreColor, formatDate, addDays, assignedRecruiter, findNextAvailableSlot } from '../utils/recruitmentUtils';
import { upsertHire, keyFor, updateRecruitmentStage, updateRecruitmentScreening, saveStoredStage } from '../services/RecruitmentSelectionService';
import { createDeploymentApi } from '../../deployment-assignment/services/DeploymentAssignmentService';
import DocViewerModal, { DOC_ICONS } from './DocViewerModal';
import { targetById, computeMatchScore } from '../../applicant-registration/services/ApplicantRegistrationService';
import PersonAvatar from '../../../components/common/PersonAvatar';
import MedicalReferralModal from './MedicalReferralModal';
import ContractSigningModal from './ContractSigningModal';
import OrientationModal from './OrientationModal';
import BankEndorsementModal from './BankEndorsementModal';
import NoticeToReportModal from './NoticeToReportModal';
import EmployeeIdModal from './EmployeeIdModal';
import PpeIssuanceModal from './PpeIssuanceModal';
import { broadcastRealtimeEvent } from '../../../utils/realtimeSync';
import auditLogService from '../../../services/auditLogService';
import { useUIFeedback } from '../../../components/common/UIFeedback';

const SCORE_ROWS = [
  { key: 'skills', label: 'Skills Match' },
  { key: 'experience', label: 'Experience' },
  { key: 'screening', label: 'Screening' },
  { key: 'availability', label: 'Availability' },
];

export const PRE_EMPLOYMENT_ITEMS = [
  {
    key: 'medical_exam',
    name: 'Pre-Employment Medical Exam & 10-Panel Drug Screen',
    sub: 'Physical Exam, Chest X-Ray, CBC, Urinalysis, Fecalysis, Drug Test (Fit-to-Work)',
    isMedical: true,
  },
  {
    key: 'nbi_clearance',
    name: 'NBI Clearance / Police Clearance',
    sub: 'Valid for employment with zero derogatory or pending legal records',
  },
  {
    key: 'sss_document',
    name: 'SSS E-1 Form / UMID / Online Portal Verification',
    sub: 'Verified Social Security System Number & Registration',
  },
  {
    key: 'philhealth_mdr',
    name: 'PhilHealth Member Data Record (MDR)',
    sub: 'Verified Philippine Health Insurance Corporation PIN',
  },
  {
    key: 'pagibig_mid',
    name: 'Pag-IBIG Member Identification (MID)',
    sub: 'Verified Home Development Mutual Fund Member ID',
  },
  {
    key: 'bir_tin',
    name: 'BIR Form 1902 / Taxpayer Identification Number (TIN)',
    sub: 'Bureau of Internal Revenue registered TIN',
  },
  {
    key: 'psa_birth_cert',
    name: 'PSA Birth Certificate & Valid Government Photo ID',
    sub: 'Philippine Statistics Authority official birth record',
  },
];

export default function CandidateModal({ app, job, applications, onClose, onUpdate, onDelete }) {
  const navigate = useNavigate();
  const { executeWithFeedback } = useUIFeedback();
  const targetJob = job ||
    targetById(app?.targetJobId) ||
    targetById(app?.jobId) ||
    (app?.jobTitle ? { id: app.jobId || app.targetJobId, title: app.jobTitle, client: app.client, category: app.category, tags: app.tags || [] } : null);
  const calculated = targetJob ? computeMatchScore(app, targetJob) : 0;
  const currentScore = calculated > 0 ? calculated : (app?.score ?? 0);

  const [docViewerType, setDocViewerType] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showMedReferralModal, setShowMedReferralModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showNtrModal, setShowNtrModal] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
  const [showPpeModal, setShowPpeModal] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [warning, setWarning] = useState('');
  const [assignedManager, setAssignedManager] = useState(app?.assignedManager || 'Area Manager 1 (North NCR)');
  const [interviewPlatform, setInterviewPlatform] = useState(app?.interviewPlatform || 'Zoom Meeting');

  const handleDeleteCandidate = async () => {
    if (!onDelete) return;
    await executeWithFeedback({
      confirmConfig: {
        title: 'Confirm Candidate Deletion',
        message: `Permanently delete candidate file for ${app.name} (${app.regId || app.id})?`,
        description: 'This high-risk action cannot be undone. All submitted documents, interview records, and pipeline data will be permanently erased.',
        confirmLabel: 'Permanently Delete Record',
        variant: 'danger',
        details: [
          { label: 'Candidate Name', value: app.name },
          { label: 'Registration ID', value: app.regId || app.id },
          { label: 'Job Order', value: job?.title || app.jobTitle || 'Unassigned' },
        ],
      },
      busyMessage: `Deleting record for ${app.name}...`,
      actionFn: async () => {
        await onDelete(app.id, app.regId, app.name);
        onClose();
      },
      successTitle: 'Candidate Deleted',
      successMessage: `${app.name}'s file has been permanently removed from the system.`,
      delayMs: 400,
    });
  };

  if (!app) return null;

  const isRejected = app.status === 'rejected';
  const isHired = app.status === 'hired';
  const currentIdx = PIPELINE_ORDER.indexOf(app.status);
  const stageKeys = isRejected ? ['applied', 'shortlisted', 'rejected'] : PIPELINE_ORDER;
  const persistId = app.regId || app.id;

  const isPreEmploymentStage =
    app.status === 'hr_requirements' ||
    app.status === 'contract_signing' ||
    app.status === 'for_deployment' ||
    app.status === 'hired';

  const isContractStage =
    app.status === 'contract_signing' ||
    app.status === 'for_deployment' ||
    app.status === 'hired';

  const isDeploymentStage =
    app.status === 'for_deployment' ||
    app.status === 'hired';

  const [preChecklist, setPreChecklist] = useState(
    app.preEmploymentChecklist || {
      medical_exam: false,
      nbi_clearance: false,
      sss_document: false,
      philhealth_mdr: false,
      pagibig_mid: false,
      bir_tin: false,
      psa_birth_cert: false,
    }
  );

  const [statNumbers, setStatNumbers] = useState(
    app.statutoryNumbers || {
      sss: '',
      philhealth: '',
      pagibig: '',
      tin: '',
    }
  );

  const completedPreCount = Object.values(preChecklist).filter(Boolean).length;
  const allPreDone = completedPreCount === PRE_EMPLOYMENT_ITEMS.length;

  const isContractSigned = Boolean(app?.employmentContract?.status === 'Signed');
  const isOrientationDone = Boolean(
    app?.orientationModules?.status === 'Certified Completed' ||
    (app?.orientationModules && Object.values(app.orientationModules).filter((v) => typeof v === 'boolean' && v).length >= 5)
  );

  function update(updater) {
    onUpdate(app.id, updater);
  }

  function togglePreEmploymentItem(key) {
    const nextChecklist = { ...preChecklist, [key]: !preChecklist[key] };
    setPreChecklist(nextChecklist);
    update((a) => ({ ...a, preEmploymentChecklist: nextChecklist }));
    updateRecruitmentScreening(persistId, { pre_employment_checklist: nextChecklist }, app.name).catch((err) => {
      console.warn('Could not save pre-employment checklist:', err);
    });
  }

  function handleStatNumberChange(field, val) {
    const nextNumbers = { ...statNumbers, [field]: val };
    setStatNumbers(nextNumbers);
    update((a) => ({ ...a, statutoryNumbers: nextNumbers }));
    updateRecruitmentScreening(persistId, { statutory_numbers: nextNumbers }, app.name).catch((err) => {
      console.warn('Could not save statutory numbers:', err);
    });
  }

  function handleMedicalReferralIssued(referralData) {
    update((a) => ({
      ...a,
      medicalReferral: referralData,
      notes: [
        {
          text: `Diagnostic Clinic Referral Slip issued for ${referralData.clinic} (Control Ref: ${referralData.refCode}).`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));
    updateRecruitmentScreening(persistId, { medical_referral: referralData }, app.name).catch(() => { });
  }

  function handleContractSigned(contractData) {
    if (contractData?.signatureData && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`contract_signature_${app.name}`, contractData.signatureData);
        if (persistId) {
          localStorage.setItem(`contract_signature_${persistId}`, contractData.signatureData);
        }
      } catch (e) {
        console.warn('Failed to save signature to localStorage:', e);
      }
    }
    update((a) => ({
      ...a,
      employmentContract: contractData,
      notes: [
        {
          text: `DOLE DO-174 Employment Contract E-Signed & verified (Contract No: ${contractData.contractNo}).`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));
    updateRecruitmentScreening(persistId, { employment_contract: contractData }, app.name).catch(() => { });
  }

  function handleOrientationCertified(orientationData) {
    update((a) => ({
      ...a,
      orientationModules: orientationData,
      notes: [
        {
          text: `Pre-Deployment Orientation Seminar (PDOS) certified completed (${orientationData.completedCount || 5}/5 modules).`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));
    updateRecruitmentScreening(persistId, { orientation_modules: orientationData }, app.name).catch(() => { });
  }

  function handleBankEndorsed(bankData) {
    update((a) => ({
      ...a,
      atmEndorsement: bankData,
      notes: [
        {
          text: `Corporate Payroll ATM Endorsement Letter issued for ${bankData.bankName} (Ref: ${bankData.refCode}).`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));
    updateRecruitmentScreening(persistId, { atm_endorsement: bankData }, app.name).catch(() => { });
  }

  function handleNtrIssued(ntrData) {
    update((a) => ({
      ...a,
      deploymentDetails: ntrData,
      notes: [
        {
          text: `Notice to Report (NTR) issued for ${ntrData.siteAddress} on ${ntrData.reportingDate} at ${ntrData.callTime} (Control No: ${ntrData.ntrCode}).`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));
    updateRecruitmentScreening(persistId, { deployment_details: ntrData }, app.name).catch(() => { });
  }

  function handlePpeIssued(ppeData) {
    update((a) => ({
      ...a,
      ppeIssuance: ppeData,
      notes: [
        {
          text: `PPE Uniform & Safety Gear issued and sign-off acknowledged (Item Set: ${ppeData.selectedGear?.join(', ') || 'Standard Issue'}).`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));
    updateRecruitmentScreening(persistId, { ppe_issuance: ppeData }, app.name).catch(() => { });
  }

  function handleDeployHandover() {
    const targetJob = job || targetById(app.jobId) || targetById(app.targetJobId) || (app.jobId ? jobById(app.jobId) : null);

    const clientName = targetJob?.client || app.client || app.deploymentDetails?.client || 'Sunrise Hospitality Group';
    const positionTitle = targetJob?.title || app.jobTitle || app.position || app.category || 'Operations Associate';
    const siteLocation = targetJob?.site || targetJob?.location || app.site || app.location || app.deploymentDetails?.site || 'NCR';
    const jobOrderRef = targetJob?.ref || targetJob?.depRef || app.jobOrderRef || 'JO-018';

    const signatureData = app.employmentContract?.signatureData || (typeof window !== 'undefined' ? (localStorage.getItem(`contract_signature_${app.name}`) || localStorage.getItem(`contract_signature_${persistId}`)) : null);

    const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    const newHireRecord = {
      applicantId: persistId,
      name: app.name,
      jobTitle: positionTitle,
      client: clientName,
      jobOrderRef: jobOrderRef,
      site: siteLocation,
      hiredDate: todayFormatted,
      medical: app.medicalReferral,
      statutory: app.statutoryNumbers,
      contract: {
        ...app.employmentContract,
        signatureData: signatureData,
      },
      orientation: app.orientationModules,
      bank: app.bankEndorsement || app.atmEndorsement,
      ppe: app.ppeIssuance,
      ntr: app.deploymentDetails || app.noticeToReport,
      compliance: {
        medicalClearance: true,
        nbiClearance: true,
        govtIds: true,
        signedContract: true,
        ppeIssued: true,
        clientOrientation: true,
      },
    };

    upsertHire(keyFor(app.name, jobOrderRef), newHireRecord);

    // Save directly into ismers.deployments.v7
    if (typeof window !== 'undefined') {
      try {
        const STORAGE_KEY = 'ismers.deployments.v7';
        let currentDeps = [];
        const rawDeps = localStorage.getItem(STORAGE_KEY);
        if (rawDeps) {
          try { currentDeps = JSON.parse(rawDeps) || []; } catch(e) {}
        }
        const existingIdx = currentDeps.findIndex(d => d.employee === app.name && d.client === clientName);
        const depId = existingIdx >= 0 ? currentDeps[existingIdx].id : `DEP-${String(currentDeps.length + 1).padStart(3, '0')}`;
        const newDepRecord = {
          id: depId,
          applicantId: persistId,
          employee: app.name,
          client: clientName,
          jobOrderRef: jobOrderRef,
          position: positionTitle,
          site: siteLocation,
          supervisor: 'Operations Supervisor',
          supervisorContact: '+63 917 555 0000',
          shift: app.shift || 'Regular Day Shift (08:00 - 17:00)',
          start: todayFormatted,
          end: 'Jan 2027',
          stage: 'on_site',
          compliance: {
            medicalClearance: true,
            nbiClearance: true,
            govtIds: true,
            signedContract: true,
            ppeIssued: true,
            clientOrientation: true,
          },
          signatureData: signatureData,
          preEmployment: {
            medicalClinic: app.medicalReferral?.clinic || 'HealthHub Diagnostics',
            fitToWork: app.medicalReferral?.fitToWork || 'Class A - Fit for Duty',
            drugTestResult: 'Negative (10-Panel)',
            sss: app.statutoryNumbers?.sss || '34-8899001-2',
            philhealth: app.statutoryNumbers?.philhealth || '12-998877665-0',
            pagibig: app.statutoryNumbers?.pagibig || '1210-9988-7766',
            tin: app.statutoryNumbers?.tin || '456-789-012-000',
            contractSignedDate: app.employmentContract?.signedDate || todayFormatted,
            signatureData: signatureData,
            ppeGear: app.ppeIssuance?.selectedGear?.join(', ') || 'Standard Uniform Polo, High-Vis Vest, Safety Shoes',
            bankEndorsement: app.bankEndorsement?.bankName ? `${app.bankEndorsement.bankName} (Ref #2026)` : 'BDO Corporate Payroll Endorsement',
          },
          history: [
            {
              date: todayFormatted,
              event: 'Mobilized from Recruitment',
              note: `Candidate officially deployed to ${clientName} (${siteLocation}).`,
            },
          ],
          applicantKey: keyFor(app.name, jobOrderRef),
        };

        if (existingIdx >= 0) {
          currentDeps[existingIdx] = newDepRecord;
        } else {
          currentDeps.push(newDepRecord);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentDeps));

        const alertData = {
          name: app.name,
          client: clientName,
          site: siteLocation,
          jobOrderRef: jobOrderRef,
          position: positionTitle,
          time: Date.now(),
        };
        localStorage.setItem('ismers_latest_deployment_alert', JSON.stringify(alertData));
        localStorage.setItem('ismers_newly_deployed_name', app.name);
        localStorage.setItem('ismers_newly_deployed_client', clientName);
      } catch (e) {}
    }

    update((a) => ({
      ...a,
      status: 'hired',
      notes: [
        {
          text: `Candidate officially mobilized and deployed to ${clientName} (${siteLocation}). Handed over to Deployment & Assignment board.`,
          meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
        },
        ...a.notes,
      ],
    }));

    // 1. Post to Backend REST API for persistent database storage on deployed server
    const deployApiPayload = {
      applicantId: app.dbId || app.id || persistId,
      employee: app.name,
      client: clientName,
      jobOrderRef: jobOrderRef,
      position: positionTitle,
      site: siteLocation,
      supervisor: 'Operations Supervisor',
      supervisorContact: '+63 917 555 0000',
      shift: app.shift || 'Regular Day Shift (08:00 - 17:00)',
      start: todayFormatted,
      end: 'Jan 2027',
      stage: 'on_site',
    };
    createDeploymentApi(deployApiPayload).catch((err) => {
      console.warn('Could not post to /deployments API:', err);
    });

    // 2. Persist stage updates in local and cached pipeline stores
    saveStoredStage(app.id, 'hired');
    if (app.regId) saveStoredStage(app.regId, 'hired');
    if (app.name) saveStoredStage(app.name, 'hired');
    updateRecruitmentStage(persistId, 'hired', 'hired', app.name).catch(() => {});

    // 3. Broadcast real-time 0ms events
    broadcastRealtimeEvent('candidate_deployed', {
      applicantId: persistId,
      name: app.name,
      jobOrderRef,
      client: clientName,
      site: siteLocation,
      position: positionTitle,
    });
    broadcastRealtimeEvent('STAGE_CHANGED', {
      candidateId: app.id,
      dbId: app.id,
      regId: app.regId,
      name: app.name,
      stage: 'hired',
      applicant: { ...app, status: 'hired' },
    });

    auditLogService.recordLog(
      `Officially mobilized and deployed candidate ${app.name} to ${clientName} (${siteLocation}) for ${positionTitle} [${jobOrderRef}]`,
      'Deployment & Assignment',
      { candidate: app.name, client: clientName, job_order: jobOrderRef, site: siteLocation }
    );

    onClose();
    if (typeof navigate === 'function') {
      navigate('/deployment-assignment');
    } else {
      window.location.href = '/deployment-assignment';
    }
  }


  function setRating(val) {
    const nextRating = app.recruiterRating === val ? 0 : val;
    update((a) => ({ ...a, recruiterRating: nextRating }));
    updateRecruitmentScreening(persistId, { recruiterRating: nextRating }, app.name).catch(() => { });
  }

  function addNote() {
    const text = noteText.trim();
    if (!text) return;
    update((a) => ({
      ...a,
      notes: [...a.notes, { text, meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}` }],
    }));
    setNoteText('');
  }

  // Derive authentic application documents submitted by candidate or fallback to placeholder for mock applicants
  const activeDocs = useMemo(() => {
    if (Array.isArray(app?.documents) && app.documents.length > 0) {
      return app.documents.map((d, i) => {
        const docKey = String(d.id || d.name || d.fileName || `doc-${i}`);
        const docTypeLower = (d.type || '').toLowerCase();
        const typeKey = docTypeLower.includes('resume') || docTypeLower.includes('cv')
          ? 'resume'
          : (docTypeLower.includes('cert') || docTypeLower.includes('tesda') || docTypeLower.includes('med'))
            ? 'certificate'
            : 'portfolio';

        const isVerified = Boolean(
          app?.docStatus?.[docKey] ??
          app?.docStatus?.[d.name] ??
          app?.docStatus?.[d.fileName] ??
          app?.docStatus?.[typeKey] ??
          d.verified
        );

        return {
          id: docKey,
          typeKey,
          name: d.name || d.fileName || `${d.type || 'Document'}.pdf`,
          fileName: d.fileName || d.name,
          type: d.type || 'Submitted Document',
          downloadUrl: d.downloadUrl || null,
          previewUrl: d.previewUrl || (d.downloadUrl ? `${d.downloadUrl}?inline=1` : null),
          uploadedAt: d.uploadedAt || d.uploadedDate || 'Verified File',
          isVerified,
          isPlaceholder: false,
        };
      });
    }

    // Placeholder fallback for mock applicants who have no submitted files
    const status = app?.docStatus || { resume: false, certificate: false, portfolio: false };
    return DOC_DEFS.map((d) => ({
      id: d.type,
      typeKey: d.type,
      name: d.name,
      fileName: d.name,
      type: d.type === 'resume' ? 'Resume / CV' : (d.type === 'certificate' ? 'Medical / Certificate' : 'Clearance / ID'),
      downloadUrl: null,
      uploadedAt: null,
      isVerified: Boolean(status[d.type]),
      isPlaceholder: true,
    }));
  }, [app?.documents, app?.docStatus]);

  function toggleDocVerified(key, docTitle = null) {
    const currentDocStatus = app.docStatus || {};
    const nextStatus = { ...currentDocStatus, [key]: !currentDocStatus[key] };
    update((a) => {
      let notes = a.notes || [];
      if (nextStatus[key]) {
        const docName = docTitle || 'Document';
        notes = [...notes, { text: `${docName} verified.`, meta: `${assignedRecruiter(job)} · ${formatDate(TODAY)}` }];
        if (Object.values(nextStatus).every(Boolean)) {
          notes = notes.filter((n) => !/awaiting document verification/i.test(n.text));
        }
      }
      return { ...a, docStatus: nextStatus, notes };
    });
    updateRecruitmentScreening(persistId, { docStatus: nextStatus }, app.name).catch(() => { });
  }

  function handleManagerChange(val) {
    setAssignedManager(val);
    update((a) => ({ ...a, assignedManager: val }));
    updateRecruitmentScreening(persistId, { assignedManager: val }).catch(() => { });
  }

  function handlePlatformChange(val) {
    setInterviewPlatform(val);
    update((a) => ({ ...a, interviewPlatform: val }));
    updateRecruitmentScreening(persistId, { interviewPlatform: val }).catch(() => { });
  }

  function allDocsVerified() {
    return activeDocs.every((d) => d.isVerified);
  }

  function flashWarning(msg) {
    setWarning(msg);
    setTimeout(() => setWarning(''), 3400);
  }

  function handleAdvance() {
    const nextKey = PIPELINE_ORDER[currentIdx + 1];
    if (!nextKey) return;

    if (app.status === 'shortlisted') {
      if (!allDocsVerified()) { flashWarning('Verify all documents before scheduling the interview.'); return; }
    }

    if (app.status === 'hr_requirements') {
      if (!allPreDone) {
        flashWarning(`Complete all ${PRE_EMPLOYMENT_ITEMS.length} mandatory pre-employment clearance documents before proceeding to Contract Signing.`);
        return;
      }
    }

    if (app.status === 'contract_signing') {
      if (!isContractSigned) {
        flashWarning('Execute and E-sign the DOLE DO-174 Employment Contract before advancing candidate to deployment.');
        return;
      }
      if (!isOrientationDone) {
        flashWarning('Conduct and certify the Pre-Deployment Orientation Seminar (PDOS) before advancing to deployment.');
        return;
      }
    }

    update((a) => {
      let interview = a.interview;
      let notes = a.notes;
      if (INTERVIEW_STAGES[nextKey]) {
        const recruiter = assignedRecruiter(job);
        const searchFrom = interview ? addDays(new Date(interview.date), 1) : addDays(new Date(TODAY), 2);
        const slot = findNextAvailableSlot(applications, recruiter, searchFrom);
        const title = INTERVIEW_STAGES[nextKey];
        if (slot) {
          interview = { title, date: slot.date, time: slot.time, recruiter };
          notes = notes.filter((n) => !/awaiting document verification/i.test(n.text));
          notes = [...notes, { text: `${title} auto-scheduled for the next available slot with ${recruiter}: ${slot.date}, ${slot.time}.`, meta: `System · ${formatDate(TODAY)}` }];
        } else {
          notes = [...notes, { text: `Could not find an open slot for ${recruiter} in the next 30 days — schedule manually.`, meta: `System · ${formatDate(TODAY)}` }];
        }
      }
      if (a.status === 'final_interview') {
        interview = null;
        notes = [...notes, { text: 'Interview cycle complete — proceeding to background check.', meta: `System · ${formatDate(TODAY)}` }];
      }
      const isResettingToReview = nextKey === 'client_interview';
      const nextCpStatus = isResettingToReview ? 'Pending Review' : a.clientEndorsementStatus;

      if (isResettingToReview) {
        try {
          localStorage.setItem(`cp_endorsement_${a.name}`, 'Pending Review');
          localStorage.setItem(`cp_endorsement_${a.id}`, 'Pending Review');
          if (a.regId) localStorage.setItem(`cp_endorsement_cand-${a.regId}`, 'Pending Review');
        } catch (e) { }
      }

      const nextApp = { ...a, status: nextKey, clientEndorsementStatus: nextCpStatus, interview, notes };
      if (nextKey === 'hired' && job) {
        upsertHire(keyFor(a.name, job.depRef), {
          name: a.name, jobTitle: job.title, client: job.client, jobOrderRef: job.depRef, hiredDate: a.applied,
        });
      }
      return nextApp;
    });

    const persistStage = nextKey;
    updateRecruitmentStage(persistId, persistStage, null, app.name).catch((err) => {
      console.warn('Could not persist recruitment stage:', err);
    });

    if (nextKey === 'client_interview') {
      const targetJob = targetById(app.jobId) || targetById(app.targetJobId) || jobById(app.jobId) || job;
      const clientName = app.client || targetJob?.client || job?.client || 'Prime Realty Corp';
      const positionName = app.jobTitle || targetJob?.title || job?.title || 'Operations Associate';
      const jobRefCode = targetJob?.ref || targetJob?.id || job?.id || app.jobId || 'PRF-2026-0001';
      const formattedJobRef = String(jobRefCode).startsWith('PRF-')
        ? jobRefCode
        : `PRF-2026-${String(jobRefCode).replace(/\D/g, '').padStart(4, '0')}`;

      updateRecruitmentScreening(persistId, { client_endorsement_status: 'Pending Review' }, app.name).catch(() => { });

      broadcastRealtimeEvent('CANDIDATE_ENDORSED', {
        candidateId: app.id,
        dbId: app.id,
        regId: app.regId,
        name: app.name,
        client: clientName,
        status: 'Pending Review',
        stage: nextKey,
        applicant: {
          ...app,
          status: nextKey,
          clientEndorsementStatus: 'Pending Review',
          client: clientName,
          jobTitle: positionName,
          jobId: jobRefCode,
        },
        candidate: {
          id: `cand-${app.id}`,
          dbId: app.id,
          regId: app.regId,
          name: app.name,
          client: clientName,
          position: positionName,
          jobRef: formattedJobRef,
          matchScore: app.score || 88,
          experience: app.experience || '3 years relevant industry experience',
          skills: Array.isArray(app.skills) && app.skills.length > 0 ? app.skills : ['Technical Proficiency', 'Communications', 'Operations Protocol'],
          endorsedDate: app.applied || 'Aug 14, 2026',
          status: 'Pending Review',
          recruiter: app.assignedManager || 'M. Dela Cruz (Lead Recruiter)',
        },
      });

      broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
        candidateId: app.id,
        dbId: app.id,
        regId: app.regId,
        name: app.name,
        client: clientName,
        status: 'Pending Review',
        stage: nextKey,
      });
    }

    broadcastRealtimeEvent('STAGE_CHANGED', {
      candidateId: app.id,
      dbId: app.id,
      regId: app.regId,
      name: app.name,
      stage: nextKey,
      applicant: { ...app, status: nextKey, clientEndorsementStatus: nextKey === 'client_interview' ? 'Pending Review' : app.clientEndorsementStatus },
    });

    onClose();
  }

  function handleReject() {
    const nextStatus = app.status === 'client_interview' ? 're_pooling' : 'rejected';
    const nextStage = app.status === 'client_interview' ? 're_pooling' : 'pooling';
    if (app.status === 'client_interview') {
      update((a) => ({
        ...a,
        status: 're_pooling',
        interview: null,
        notes: [
          {
            text: 'Client Final Interview result: Failed. Returned to pooling for re-assignment to other clients within 3 days.',
            meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
          },
          ...a.notes,
        ],
      }));
    } else {
      update((a) => ({
        ...a,
        status: 'rejected',
        interview: null,
        notes: [
          {
            text: `Failed at ${STAGES.find((s) => s.key === a.status)?.label || 'this stage'}. Candidate rejected from this position.`,
            meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
          },
          ...a.notes,
        ],
      }));
    }

    const persistRejectId = app.regId || app.id;
    updateRecruitmentStage(persistRejectId, nextStage, nextStatus, app.name).catch((err) => {
      console.warn('Could not persist recruitment stage:', err);
    });
    onClose();
  }

  const nextKey = PIPELINE_ORDER[currentIdx + 1];
  const nextLabel = nextKey ? STAGES.find((s) => s.key === nextKey)?.label : null;

  return (
    <>
      <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-box" style={{ maxWidth: isPreEmploymentStage ? '800px' : '700px' }}>

        {/* MODAL HEADER */}
        <div className="modal-head">
          <PersonAvatar
            name={app.name}
            gender={app.gender}
            photo={app.photo || app.avatar}
            size="lg"
            variant="blue"
          />
          <div className="modal-title-wrap">
            <div className="modal-jo-title">{app.name}</div>
            <div className="modal-jo-sub">{job?.title || app.jobTitle || app.jobId || 'Unassigned'} &middot; {job?.client || app.client || '\u2014'}</div>
          </div>
          {onDelete && (
            <button
              className="modal-close"
              onClick={handleDeleteCandidate}
              type="button"
              title="Permanently Delete Candidate"
              style={{
                marginRight: '8px',
                color: 'var(--red, #ef4444)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg className="icon" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          )}
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="modal-scroll">
          {/* CANDIDATE INFO STRIP */}
          <div className="modal-info-grid">
            <div className="modal-info-item"><div className="modal-info-label">Applied</div><div className="modal-info-value">{app.applied}</div></div>
            <div className="modal-info-item"><div className="modal-info-label">Job Order</div><div className="modal-info-value" style={{ fontSize: 11 }}>{job?.title || app.jobTitle || app.jobId || '\u2014'}</div></div>
            <div className="modal-info-item"><div className="modal-info-label">Experience</div><div className="modal-info-value">{app.experience}</div></div>
            <div className="modal-info-item"><div className="modal-info-label">Location</div><div className="modal-info-value" style={{ fontSize: 11 }}>{app.location}</div></div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              ── FOR DEPLOYMENT: PRE-DEPLOYMENT READINESS & MOBILIZATION ──
              ══════════════════════════════════════════════════════════════ */}
          {isDeploymentStage && (
            <div className="modal-section" style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border)', marginBottom: '14px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--green, #149e6e)' }}>
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>Pre-Deployment Readiness &amp; Site Mobilization Hub</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  Notice to Report (NTR), Company Security ID Pass, and Onsite PPE Kit Issuance
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {/* 1. NOTICE TO REPORT CARD */}
                <div style={{ background: 'var(--panel)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Notice to Report</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: app?.deploymentDetails ? 'var(--green-soft, #e8f5e9)' : 'var(--blue-soft, #e0f2fe)', color: app?.deploymentDetails ? 'var(--green, #149e6e)' : 'var(--primary, #007dcc)' }}>
                        {app?.deploymentDetails ? '✓ Issued' : 'Ready'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                      Site Deployment Directive
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      {app?.deploymentDetails?.ntrCode ? `Ref: ${app.deploymentDetails.ntrCode}` : 'Call time, reporting address & onsite supervisor'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rs-stage-btn"
                    style={{ width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700, fontSize: '11px' }}
                    onClick={() => setShowNtrModal(true)}
                  >
                    {app?.deploymentDetails ? 'View / Print Notice to Report' : 'Issue Notice to Report (NTR)'}
                  </button>
                </div>

                {/* 2. COMPANY ID PASS */}
                <div style={{ background: 'var(--panel)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Security ID Card</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)' }}>
                        ✓ Generated
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                      Company ID &amp; Turnstile Pass
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      Employee ID: PPM-EMP-2026-{(app.regId || app.id || '001').replace(/\D/g, '').padStart(4, '0')}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rs-stage-btn"
                    style={{ width: '100%', fontWeight: 700, fontSize: '11px' }}
                    onClick={() => setShowIdModal(true)}
                  >
                    View / Print Employee ID Badge
                  </button>
                </div>

                {/* 3. PPE KIT ISSUANCE */}
                <div style={{ background: 'var(--panel)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Uniform &amp; PPE</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: app?.ppeIssuance ? 'var(--green-soft, #e8f5e9)' : 'var(--amber-soft, #fef3c7)', color: app?.ppeIssuance ? 'var(--green, #149e6e)' : 'var(--amber, #d97706)' }}>
                        {app?.ppeIssuance ? '✓ Issued' : 'Pending Sign-Off'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                      Site Protective Equipment
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      Safety shoes, uniform polo, high-vis vest
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rs-stage-btn"
                    style={{ width: '100%', fontWeight: 700, fontSize: '11px' }}
                    onClick={() => setShowPpeModal(true)}
                  >
                    {app?.ppeIssuance ? 'View PPE Kit Sign-Off' : 'Issue Uniform & PPE Kit'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ── HYBRID CONTRACT SIGNING & ORIENTATION SEMINAR HUB ──
              ══════════════════════════════════════════════════════════════ */}
          {isContractStage && !isDeploymentStage && (
            <div className="modal-section" style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border)', marginBottom: '14px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--primary)' }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                  <span>DOLE DO-174 Employment Contract &amp; PDOS Orientation Hub</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                  Digital on-screen E-signature, 201 filing, and pre-deployment orientation certification
                </div>
              </div>

              {/* 3 ONBOARDING ACTION CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {/* 1. EMPLOYMENT CONTRACT CARD */}
                <div style={{ background: 'var(--panel)', padding: '12px', borderRadius: '8px', border: `1px solid ${isContractSigned ? 'rgba(20, 158, 110, 0.3)' : 'var(--border)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Employment Contract</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isContractSigned ? 'var(--green-soft, #e8f5e9)' : 'var(--amber-soft, #fef3c7)', color: isContractSigned ? 'var(--green, #149e6e)' : 'var(--amber, #d97706)' }}>
                        {isContractSigned ? '✓ E-Signed' : 'Pending Signature'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                      DOLE DO-174 Project Contract
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      {app?.employmentContract?.contractNo ? `Ref: ${app.employmentContract.contractNo}` : 'NCR Min. Wage ₱645/day + Statutory Benefits'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rs-stage-btn"
                    style={{ width: '100%', borderColor: isContractSigned ? 'var(--green, #149e6e)' : 'var(--primary)', color: isContractSigned ? 'var(--green, #149e6e)' : 'var(--primary)', fontWeight: 700, fontSize: '11px' }}
                    onClick={() => setShowContractModal(true)}
                  >
                    {isContractSigned ? 'View / Print Signed Contract' : 'Open Contract & E-Sign Pad'}
                  </button>
                </div>

                {/* 2. PDOS ORIENTATION CARD */}
                <div style={{ background: 'var(--panel)', padding: '12px', borderRadius: '8px', border: `1px solid ${isOrientationDone ? 'rgba(20, 158, 110, 0.3)' : 'var(--border)'}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>PDOS Seminar</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isOrientationDone ? 'var(--green-soft, #e8f5e9)' : 'var(--amber-soft, #fef3c7)', color: isOrientationDone ? 'var(--green, #149e6e)' : 'var(--amber, #d97706)' }}>
                        {isOrientationDone ? '✓ Certified' : 'Pending Briefing'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                      Pre-Deployment Orientation
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      DOLE DO-174, OSH Standards, Safe Spaces Act
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rs-stage-btn"
                    style={{ width: '100%', borderColor: isOrientationDone ? 'var(--green, #149e6e)' : 'var(--primary)', color: isOrientationDone ? 'var(--green, #149e6e)' : 'var(--primary)', fontWeight: 700, fontSize: '11px' }}
                    onClick={() => setShowOrientationModal(true)}
                  >
                    {isOrientationDone ? 'View Orientation Certificate' : 'Conduct PDOS & Certify'}
                  </button>
                </div>

                {/* 3. ATM PAYROLL CARD */}
                <div style={{ background: 'var(--panel)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Payroll ATM</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: app?.atmEndorsement ? 'var(--green-soft, #e8f5e9)' : 'var(--border-soft, #f1f5f9)', color: app?.atmEndorsement ? 'var(--green, #149e6e)' : 'var(--muted)' }}>
                        {app?.atmEndorsement ? '✓ Issued' : 'Optional'}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text)' }}>
                      Bank ATM Endorsement
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      {app?.atmEndorsement ? `${app.atmEndorsement.bankName}` : 'BDO / BPI / UnionBank Corporate Payroll'}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rs-stage-btn"
                    style={{ width: '100%', fontSize: '11px', fontWeight: 700 }}
                    onClick={() => setShowBankModal(true)}
                  >
                    {app?.atmEndorsement ? 'View / Print Bank Letter' : 'Issue Bank Endorsement Letter'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              ── DIGITAL HR PRE-EMPLOYMENT REQUIREMENTS & COMPLIANCE HUB ──
              ══════════════════════════════════════════════════════════════ */}
          {isPreEmploymentStage && !isContractStage && (
            <div className="modal-section" style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--primary)' }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span>HR Pre-Employment Requirements &amp; Clearance Hub</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                    Mandatory DOLE statutory clearances, diagnostic medical fit-to-work, and government records
                  </div>
                </div>

                <button
                  type="button"
                  className="rs-stage-btn"
                  style={{ background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setShowMedReferralModal(true)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  {app.medicalReferral ? 'View / Print Medical Referral' : 'Issue Diagnostic Clinic Referral'}
                </button>
              </div>

              {/* MEDICAL REFERRAL STATUS BANNER IF ISSUED */}
              {app.medicalReferral && (
                <div style={{ background: 'var(--panel)', border: '1px solid rgba(0, 125, 204, 0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>&#9679;</span>
                    <span>Diagnostic Referral Issued: <strong style={{ color: 'var(--text)' }}>{app.medicalReferral.refCode}</strong> &middot; {app.medicalReferral.clinic}</span>
                  </div>
                  <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Valid until {app.medicalReferral.validUntil}</span>
                </div>
              )}

              {/* 7 PRE-EMPLOYMENT CLEARANCES CHECKLIST */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {PRE_EMPLOYMENT_ITEMS.map((item) => {
                  const isChecked = Boolean(preChecklist[item.key]);
                  return (
                    <div
                      key={item.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: isChecked ? 'var(--green-soft, rgba(20, 158, 110, 0.08))' : 'var(--panel)',
                        border: `1px solid ${isChecked ? 'rgba(20, 158, 110, 0.3)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.14s var(--ease)',
                      }}
                      onClick={() => togglePreEmploymentItem(item.key)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: `1.5px solid ${isChecked ? 'var(--green, #149e6e)' : 'var(--border)'}`,
                          background: isChecked ? 'var(--green, #149e6e)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          flexShrink: 0,
                        }}>
                          {isChecked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: isChecked ? 'var(--green, #149e6e)' : 'var(--text)' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--muted)', marginTop: '1px' }}>
                            {item.sub}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                        {item.isMedical && (
                          <button
                            type="button"
                            className="rs-stage-btn"
                            style={{ padding: '4px 10px', fontSize: '10.5px', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            onClick={() => setShowMedReferralModal(true)}
                          >
                            Referral Slip
                          </button>
                        )}
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: isChecked ? 'var(--green-soft, #e8f5e9)' : 'var(--border-soft, #f1f5f9)',
                          color: isChecked ? 'var(--green, #149e6e)' : 'var(--muted)',
                        }}>
                          {isChecked ? 'Verified & Cleared' : 'Pending Submission'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PROGRESS BAR & STATUTORY NUMBERS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px' }}>
                  <span style={{ fontWeight: 700, color: allPreDone ? 'var(--green, #149e6e)' : 'var(--muted)' }}>
                    {allPreDone ? '✓ All 7 Pre-Employment Clearances Verified' : `${completedPreCount} of ${PRE_EMPLOYMENT_ITEMS.length} Clearances Verified`}
                  </span>
                  <span style={{ fontWeight: 800, color: allPreDone ? 'var(--green, #149e6e)' : 'var(--primary)' }}>
                    {Math.round((completedPreCount / PRE_EMPLOYMENT_ITEMS.length) * 100)}% Complete
                  </span>
                </div>

                <div style={{ height: '6px', borderRadius: '4px', background: 'var(--border-soft, #e2e8f0)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(completedPreCount / PRE_EMPLOYMENT_ITEMS.length) * 100}%`,
                      background: allPreDone ? 'var(--green, #149e6e)' : 'var(--primary, #007dcc)',
                      transition: 'width 0.2s var(--ease)',
                    }}
                  />
                </div>

                {/* STATUTORY NUMBERS ENCODING (DATA PRIVACY MASKED) */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Statutory Government Identification Numbers:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>SSS Number</label>
                      <input
                        type="text"
                        placeholder="34-XXXXXXX-1"
                        value={statNumbers.sss}
                        onChange={(e) => handleStatNumberChange('sss', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>PhilHealth PIN</label>
                      <input
                        type="text"
                        placeholder="12-XXXXXXXX-9"
                        value={statNumbers.philhealth}
                        onChange={(e) => handleStatNumberChange('philhealth', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>Pag-IBIG MID</label>
                      <input
                        type="text"
                        placeholder="1210-XXXX-XXXX"
                        value={statNumbers.pagibig}
                        onChange={(e) => handleStatNumberChange('pagibig', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>BIR TIN</label>
                      <input
                        type="text"
                        placeholder="XXX-XXX-XXX-000"
                        value={statNumbers.tin}
                        onChange={(e) => handleStatNumberChange('tin', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPLICATION DOCUMENTS (FOR INITIAL SCREENING) */}
          {!isPreEmploymentStage && (
            <div className="modal-section">
              <div className="modal-section-label">Application Documents</div>
              <div className="doc-list">
                {activeDocs.map((d) => (
                  <button
                    key={d.id}
                    className="doc-chip"
                    onClick={() => {
                      setSelectedDoc(d);
                      setDocViewerType(d.typeKey);
                    }}
                    title={`${d.name} (${d.type}) — Click to review`}
                  >
                    <svg className="icon" viewBox="0 0 24 24">
                      {DOC_ICONS[d.typeKey] || DOC_ICONS.portfolio}
                    </svg>
                    <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.name}
                    </span>
                    <span className={`doc-badge ${d.isVerified ? 'verified' : 'pending'}`} title={d.isVerified ? 'Verified' : 'Pending verification'}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {d.isVerified ? <path d="M20 6 9 17l-5-5" /> : <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>}
                      </svg>
                    </span>
                  </button>
                ))}
              </div>
              <div className={`doc-verify-summary ${allDocsVerified() ? 'all-verified' : ''}`}>
                {allDocsVerified()
                  ? 'All documents verified'
                  : `${activeDocs.filter((d) => d.isVerified).length} of ${activeDocs.length} documents verified — click a document to review and verify`}
              </div>
            </div>
          )}


          {/* AI CANDIDATE SCORE */}
          <div className="modal-section">
            <div className="modal-section-label">AI Candidate Score</div>
            <div className="score-overall">
              <div><div className="score-overall-num" style={{ color: scoreColor(currentScore) }}>{currentScore}%</div></div>
              <div><div className="score-overall-label">Direct keyword and requirement match percentage for the assigned job order.</div></div>
            </div>
            <div>
              {SCORE_ROWS.map((r) => {
                let val = app.breakdown?.[r.key];
                if (val == null || (currentScore > 0 && (!val || val === 0))) {
                  if (r.key === 'skills') val = Math.min(98, Math.max(35, Math.round(currentScore * 1.02)));
                  else if (r.key === 'experience') val = Math.min(98, Math.max(30, Math.round(currentScore * 0.96)));
                  else if (r.key === 'screening') val = Math.min(98, Math.max(40, Math.round(currentScore * 0.98)));
                  else if (r.key === 'availability') val = Math.min(98, Math.max(45, Math.round(currentScore * 0.94)));
                  else val = currentScore;
                }
                return (
                  <div key={r.key} className="score-row">
                    <div className="score-label">{r.label}</div>
                    <div className="score-track"><div className="score-fill" style={{ width: `${val}%`, background: scoreColor(val) }} /></div>
                    <div className="score-num">{val}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECRUITER RATING */}
          <div className="rating-row">
            <div className="rating-label-block">
              <div className="rating-label">Your Assessment</div>
              <div className="rating-sub">{app.recruiterRating > 0 ? `You rated this candidate ${app.recruiterRating}/5` : 'Rate this candidate after reviewing their profile'}</div>
            </div>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={`star-btn ${n <= app.recruiterRating ? 'filled' : ''}`} onClick={() => setRating(n)}>
                  <svg viewBox="0 0 24 24"><path d="m12 3 2.6 5.6 6.1.6-4.6 4.2 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.2 6.1-.6Z" /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* SCREENING NOTES */}
          <div className="modal-section">
            <div className="modal-section-label">Screening Notes</div>
            <div className="notes-list">
              {app.notes.length ? app.notes.map((n, i) => (
                <div key={i} className={`note-item ${n.meta.startsWith(CURRENT_ADMIN) ? 'admin-note' : ''}`}>
                  <div className="note-text">{n.text}</div>
                  <div className="note-meta">{n.meta}</div>
                </div>
              )) : <div className="empty-note">No screening notes yet.</div>}
            </div>
            <div className="add-note-box">
              <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a screening note or observation..." />
              <button className="btn primary" onClick={addNote}>Add Note</button>
            </div>
          </div>
        </div>

        {/* MODAL ACTIONS FOOTER */}
        <div className="modal-actions">
          {warning && (
            <div style={{ width: '100%', textAlign: 'center', fontSize: 11, fontWeight: 800, color: 'var(--amber, #d97706)', background: 'var(--amber-soft, #fef3c7)', padding: '6px 12px', borderRadius: '6px', order: -1 }}>
              {warning}
            </div>
          )}
          {app.status === 'for_deployment' ? (
            <button
              type="button"
              className="btn primary"
              style={{ width: '100%', background: 'var(--green, #149e6e)', borderColor: 'var(--green, #149e6e)', padding: '12px', fontSize: '13px', fontWeight: 800 }}
              onClick={handleDeployHandover}
            >
              Execute Deployment and Hand Over to Deployment Board
            </button>
          ) : app.status === 're_pooling' ? (
            <button
              className="btn primary"
              style={{ width: '100%' }}
              onClick={() => {
                const nextStatus = 'Pending Review';
                try {
                  localStorage.setItem(`cp_endorsement_${app.name}`, nextStatus);
                  localStorage.setItem(`cp_endorsement_${app.id}`, nextStatus);
                  localStorage.setItem(`cp_endorsement_cand-${app.id}`, nextStatus);
                  if (app.regId) localStorage.setItem(`cp_endorsement_cand-${app.regId}`, nextStatus);
                } catch (e) { }

                update((a) => ({
                  ...a,
                  status: 'pooling',
                  clientEndorsementStatus: nextStatus,
                  notes: [
                    {
                      text: 'Candidate returned to Pooling for line-up to other client job orders. Endorsement status reset to Pending Review.',
                      meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}`,
                    },
                    ...a.notes,
                  ],
                }));

                updateRecruitmentStage(persistId, 'pooling', 'active', app.name).catch(() => { });
                updateRecruitmentScreening(persistId, { client_endorsement_status: nextStatus }, app.name).catch(() => { });
                onClose();
              }}
            >
              Re-Line Up Candidate to Another Client (Return to Pooling)
            </button>
          ) : (
            <>
              <button className="btn" style={{ color: 'var(--red)' }} onClick={handleReject}>
                Failed (Re-Pool for Line Up)
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="btn"
                  style={{ color: 'var(--red, #ef4444)', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}
                  onClick={handleDeleteCandidate}
                  title="Permanently Delete Candidate"
                >
                  Delete Record
                </button>
              )}
              <button
                className={`btn primary ${app.status === 'hr_requirements' && !allPreDone ? 'btn-needs-clearance' : ''}`}
                style={
                  (app.status === 'hr_requirements' && allPreDone) || (app.status === 'contract_signing' && isContractSigned && isOrientationDone)
                    ? { background: 'var(--green, #149e6e)', borderColor: 'var(--green, #149e6e)' }
                    : {}
                }
                onClick={handleAdvance}
              >
                {app.status === 'hr_requirements'
                  ? allPreDone ? '✓ Proceed to Orientation & Contract Signing' : `Verify Requirements (${completedPreCount}/7)`
                  : app.status === 'contract_signing'
                    ? isContractSigned && isOrientationDone ? '✓ Advance to Ready for Deployment' : 'Complete Contract & Orientation'
                    : `Endorse / Advance to ${nextLabel || 'Next Step'}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>


      {docViewerType && (
        <DocViewerModal
          app={app}
          job={job}
          type={docViewerType}
          doc={selectedDoc}
          isVerified={Boolean(selectedDoc?.isVerified ?? app?.docStatus?.[docViewerType])}
          onClose={() => {
            setDocViewerType(null);
            setSelectedDoc(null);
          }}
          onToggleVerified={() => {
            if (selectedDoc) {
              toggleDocVerified(selectedDoc.id, selectedDoc.name);
            } else {
              toggleDocVerified(docViewerType);
            }
          }}
        />
      )}

      {showMedReferralModal && (
        <MedicalReferralModal
          candidate={app}
          job={job}
          onClose={() => setShowMedReferralModal(false)}
          onIssued={handleMedicalReferralIssued}
        />
      )}

      {showContractModal && (
        <ContractSigningModal
          candidate={app}
          job={job}
          onClose={() => setShowContractModal(false)}
          onSigned={handleContractSigned}
        />
      )}

      {showOrientationModal && (
        <OrientationModal
          candidate={app}
          job={job}
          onClose={() => setShowOrientationModal(false)}
          onCertified={handleOrientationCertified}
        />
      )}

      {showBankModal && (
        <BankEndorsementModal
          candidate={app}
          job={job}
          onClose={() => setShowBankModal(false)}
          onEndorsed={handleBankEndorsed}
        />
      )}

      {showNtrModal && (
        <NoticeToReportModal
          candidate={app}
          job={job}
          onClose={() => setShowNtrModal(false)}
          onIssued={handleNtrIssued}
        />
      )}

      {showIdModal && (
        <EmployeeIdModal
          candidate={app}
          job={job}
          onClose={() => setShowIdModal(false)}
        />
      )}

      {showPpeModal && (
        <PpeIssuanceModal
          candidate={app}
          job={job}
          onClose={() => setShowPpeModal(false)}
          onIssued={handlePpeIssued}
        />
      )}
    </>
  );
}