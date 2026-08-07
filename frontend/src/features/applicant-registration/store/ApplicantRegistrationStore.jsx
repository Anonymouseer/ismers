import { createContext, useContext, useEffect, useState } from 'react';
import {
  addDocumentApi,
  addEducationApi,
  addReferenceApi,
  addSkillApi,
  addWorkHistoryApi,
  createApplicantApi,
  deleteApplicantApi,
  fetchApplicantsApi,
  nextRegId,
  removeDocumentApi,
  removeEducationApi,
  removeReferenceApi,
  removeSkillApi,
  removeWorkHistoryApi,
  sendToRecruitmentApi,
  updateBasicInfoApi,
  updateCategoryApi,
  updateStageApi,
  updateStatusApi,
  updateTargetJobApi,
} from '../services/ApplicantRegistrationService';

const ROLE_STORAGE_KEY = 'ismers.applicantRegistration.role';

const ApplicantRegistrationContext = createContext(null);

function loadInitialRole() {
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    if (stored) return stored;
  } catch (err) {
    console.warn('Could not read persisted role.', err);
  }
  return 'admin';
}

function today() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function ApplicantRegistrationProvider({ children }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(loadInitialRole);

  const loadCandidates = async () => {
    try {
      const data = await fetchApplicantsApi();
      setCandidates(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load applicants from backend:', err);
      setError('Could not connect to the recruitment backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch (err) {
      console.warn('Could not persist role.', err);
    }
  }, [role]);

  const getCandidate = (regId) => candidates.find((c) => c.regId === regId);

  // Helper for instant local state update (0ms optimistic UI)
  const patchCandidateLocal = (regId, patchFn) => {
    setCandidates((prev) =>
      prev.map((c) => (c.regId === regId ? patchFn(c) : c))
    );
  };

  // ── 1. ADD APPLICANT (0ms Instant Response) ──
  const addApplicant = async (formData) => {
    const email = (formData.email || '').trim().toLowerCase();
    const phone = (formData.phone || '').trim();

    // Fast local duplicate check first
    const duplicate = candidates.find(
      (c) =>
        (email && c.email.trim().toLowerCase() === email) ||
        (phone && c.phone.trim() === phone)
    );
    if (duplicate) {
      return {
        ok: false,
        duplicate: true,
        message: `Possible existing applicant found: ${duplicate.name} (${duplicate.regId}) already uses this email or mobile number.`,
      };
    }

    const regId = nextRegId(candidates);
    const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');

    const newCandidate = {
      id: Date.now(),
      regId,
      name: fullName || 'New Applicant',
      firstName: formData.firstName || '',
      middleName: formData.middleName || '',
      lastName: formData.lastName || '',
      suffix: formData.suffix || '',
      email: formData.email || '',
      phone: formData.phone || '',
      alternateContact: formData.alternateContact || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || '',
      civilStatus: formData.civilStatus || '',
      nationality: formData.nationality || '',
      placeOfBirth: formData.placeOfBirth || '',
      height: formData.height || '',
      weight: formData.weight || '',
      religion: formData.religion || '',
      location: formData.location || '',
      address: formData.address || '',
      spouseName: formData.spouseName || '',
      spouseOccupation: formData.spouseOccupation || '',
      fatherName: formData.fatherName || '',
      fatherOccupation: formData.fatherOccupation || '',
      motherName: formData.motherName || '',
      motherOccupation: formData.motherOccupation || '',
      familyAddress: formData.familyAddress || '',
      emergencyContactName: formData.emergencyContactName || '',
      emergencyContactAddress: formData.emergencyContactAddress || '',
      category: formData.category || null,
      experienceSummary: formData.experienceSummary || '',
      targetJobId: null,
      stage: 'registered',
      status: 'active',
      sentToRecruitment: false,
      submissionSource: formData.submissionSource || 'staff',
      registeredDate: today(),
      skills: [],
      workHistory: formData.workHistory || [],
      education: formData.education || [],
      documents: [],
      references: formData.references || [],
      history: [{ id: `h-${Date.now()}`, date: today(), text: 'Applicant registered' }],
    };

    // 0ms Instant UI update
    setCandidates((prev) => [newCandidate, ...prev]);

    // Async backend sync
    try {
      const res = await createApplicantApi(formData);
      if (!res.ok) {
        await loadCandidates();
        return { ok: false, duplicate: res.duplicate, message: res.message };
      }
      return { ok: true, regId: res.regId };
    } catch (err) {
      await loadCandidates();
      return { ok: false, message: 'Server error creating applicant.' };
    }
  };

  // ── 2. UPDATE BASIC INFO (0ms Instant Response) ──
  const updateBasicInfo = async (regId, patch) => {
    patchCandidateLocal(regId, (c) => ({ ...c, ...patch }));
    try {
      const res = await updateBasicInfoApi(regId, patch);
      if (!res.ok) {
        await loadCandidates();
        return { ok: false, duplicate: res.duplicate, message: res.message };
      }
      return { ok: true };
    } catch (err) {
      await loadCandidates();
      return { ok: false, message: 'Server error updating information.' };
    }
  };

  // ── 3. DELETE APPLICANT (0ms Instant Response) ──
  const deleteCandidate = async (regId) => {
    setCandidates((prev) => prev.filter((c) => c.regId !== regId));
    try {
      await deleteApplicantApi(regId);
    } catch (err) {
      await loadCandidates();
    }
  };

  // ── 4. SKILLS (0ms Instant Response) ──
  const addSkill = async (regId, skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;

    patchCandidateLocal(regId, (c) => ({
      ...c,
      skills: [...c.skills, trimmed],
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: `Skill added: ${trimmed}` }],
    }));

    try {
      await addSkillApi(regId, trimmed);
    } catch (err) {
      await loadCandidates();
    }
  };

  const removeSkill = async (regId, index) => {
    const c = getCandidate(regId);
    if (!c || !c.skills[index]) return;

    const skillName = c.skills[index];

    patchCandidateLocal(regId, (cand) => ({
      ...cand,
      skills: cand.skills.filter((_, i) => i !== index),
      history: [...cand.history, { id: `h-${Date.now()}`, date: today(), text: `Skill removed: ${skillName}` }],
    }));

    try {
      await removeSkillApi(regId, encodeURIComponent(skillName));
    } catch (err) {
      await loadCandidates();
    }
  };

  // ── 5. WORK HISTORY (0ms Instant Response) ──
  const addWorkHistory = async (regId, entry) => {
    if (!entry.role.trim() || !entry.company.trim()) return;

    const newWork = {
      id: `temp-${Date.now()}`,
      role: entry.role.trim(),
      company: entry.company.trim(),
      duration: entry.duration.trim() || '—',
    };

    patchCandidateLocal(regId, (c) => ({
      ...c,
      workHistory: [...c.workHistory, newWork],
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: `Work history added: ${newWork.role} at ${newWork.company}` }],
    }));

    try {
      await addWorkHistoryApi(regId, entry);
    } catch (err) {
      await loadCandidates();
    }
  };

  const removeWorkHistory = async (regId, index) => {
    const c = getCandidate(regId);
    if (!c || !c.workHistory[index]) return;
    const workId = c.workHistory[index].id;

    patchCandidateLocal(regId, (cand) => ({
      ...cand,
      workHistory: cand.workHistory.filter((_, i) => i !== index),
      history: [...cand.history, { id: `h-${Date.now()}`, date: today(), text: 'Work history entry removed' }],
    }));

    try {
      await removeWorkHistoryApi(regId, workId);
    } catch (err) {
      await loadCandidates();
    }
  };

  // ── 6. EDUCATION (0ms Instant Response) ──
  const addEducation = async (regId, entry) => {
    if (!entry.school.trim()) return;

    const newEdu = {
      id: `temp-${Date.now()}`,
      school: entry.school.trim(),
      degree: entry.degree?.trim() || '',
      level: entry.level?.trim() || '—',
      startYear: entry.startYear?.trim() || '',
      endYear: entry.endYear?.trim() || 'Present',
    };

    patchCandidateLocal(regId, (c) => ({
      ...c,
      education: [...(c.education || []), newEdu],
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: `Education added: ${newEdu.degree} at ${newEdu.school}` }],
    }));

    try {
      await addEducationApi(regId, entry);
    } catch (err) {
      await loadCandidates();
    }
  };

  const removeEducation = async (regId, entryId) => {
    patchCandidateLocal(regId, (c) => ({
      ...c,
      education: (c.education || []).filter((e) => e.id !== entryId),
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: 'Education entry removed' }],
    }));

    try {
      await removeEducationApi(regId, entryId);
    } catch (err) {
      await loadCandidates();
    }
  };

  // ── 7. DOCUMENTS (0ms Instant Response) ──
  const addDocument = async (regId, doc) => {
    const docName = doc instanceof FormData ? (doc.get('name') || 'Document') : doc.name;
    const docType = doc instanceof FormData ? (doc.get('type') || 'Other Documents') : (doc.type || 'Other Documents');

    const tempDoc = {
      id: `temp-${Date.now()}`,
      name: docName,
      type: docType,
      uploadedDate: today(),
    };

    patchCandidateLocal(regId, (c) => ({
      ...c,
      documents: [...(c.documents || []), tempDoc],
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: `Document uploaded: ${docName}` }],
    }));

    try {
      await addDocumentApi(regId, doc);
    } catch (err) {
      await loadCandidates();
    }
  };

  const removeDocument = async (regId, docId) => {
    patchCandidateLocal(regId, (c) => ({
      ...c,
      documents: (c.documents || []).filter((d) => d.id !== docId),
    }));

    try {
      await removeDocumentApi(regId, docId);
    } catch (err) {
      await loadCandidates();
    }
  };

  // ── 8. REFERENCES (0ms Instant Response) ──
  const addReference = async (regId, entry) => {
    if (!entry.name.trim()) return;

    const tempRef = {
      id: `temp-${Date.now()}`,
      name: entry.name.trim(),
      occupation: entry.occupation?.trim() || '—',
      contact: entry.contact?.trim() || '—',
    };

    patchCandidateLocal(regId, (c) => ({
      ...c,
      references: [...(c.references || []), tempRef],
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: `Reference added: ${tempRef.name}` }],
    }));

    try {
      await addReferenceApi(regId, entry);
    } catch (err) {
      await loadCandidates();
    }
  };

  const removeReference = async (regId, refId) => {
    patchCandidateLocal(regId, (c) => ({
      ...c,
      references: (c.references || []).filter((r) => r.id !== refId),
    }));
    try {
      await removeReferenceApi(regId, refId);
    } catch (err) {
      await loadCandidates();
    }
  };

  // ── 9. STAGE & STATUS ACTIONS (0ms Instant Response) ──
  const startProfiling = async (regId) => {
    patchCandidateLocal(regId, (c) => ({
      ...c,
      stage: 'profiling',
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: 'Started profiling' }],
    }));
    try {
      await updateStageApi(regId, 'profiling');
    } catch (err) {
      await loadCandidates();
    }
  };

  const completeProfile = async (regId) => {
    const c = getCandidate(regId);
    if (!c) return { ok: false, message: 'Applicant not found.' };
    if (!c.category) {
      return { ok: false, message: 'Assign a category before marking the profile complete.' };
    }
    if (!c.targetJobId) {
      return { ok: false, message: 'Assign a target job order before marking the profile complete.' };
    }
    if (!c.skills.length) {
      return { ok: false, message: 'Add at least one skill before marking the profile complete.' };
    }
    if (!c.workHistory.length) {
      return { ok: false, message: 'Add at least one work history entry before marking the profile complete.' };
    }

    patchCandidateLocal(regId, (cand) => ({
      ...cand,
      stage: 'profiled',
      history: [...cand.history, { id: `h-${Date.now()}`, date: today(), text: 'Profile marked complete' }],
    }));

    try {
      const res = await updateStageApi(regId, 'profiled');
      if (res.ok === false) {
        await loadCandidates();
        return { ok: false, message: res.message };
      }
      return { ok: true };
    } catch (err) {
      await loadCandidates();
      return { ok: false, message: 'Failed to update stage on server.' };
    }
  };

  const sendToRecruitment = async (regId) => {
    patchCandidateLocal(regId, (c) => ({
      ...c,
      sentToRecruitment: true,
      history: [...c.history, { id: `h-${Date.now()}`, date: today(), text: 'Sent to Recruitment & Selection' }],
    }));
    try {
      await sendToRecruitmentApi(regId);
    } catch (err) {
      await loadCandidates();
    }
  };

  const updateStatus = async (regId, status) => {
    patchCandidateLocal(regId, (c) => ({ ...c, status }));
    try {
      await updateStatusApi(regId, status);
    } catch (err) {
      await loadCandidates();
    }
  };

  const updateCategory = async (regId, category) => {
    patchCandidateLocal(regId, (c) => ({ ...c, category }));
    try {
      await updateCategoryApi(regId, category);
    } catch (err) {
      await loadCandidates();
    }
  };

  const updateTargetJob = async (regId, targetJobId, jobLabel) => {
    patchCandidateLocal(regId, (c) => ({ ...c, targetJobId }));
    try {
      await updateTargetJobApi(regId, targetJobId, jobLabel);
    } catch (err) {
      await loadCandidates();
    }
  };

  const value = {
    candidates,
    loading,
    error,
    role,
    setRole,
    getCandidate,
    addApplicant,
    addSkill,
    removeSkill,
    addWorkHistory,
    removeWorkHistory,
    addEducation,
    removeEducation,
    addDocument,
    removeDocument,
    addReference,
    removeReference,
    updateBasicInfo,
    startProfiling,
    completeProfile,
    sendToRecruitment,
    updateStatus,
    updateCategory,
    updateTargetJob,
    deleteCandidate,
    refreshCandidates: loadCandidates,
  };

  return (
    <ApplicantRegistrationContext.Provider value={value}>
      {children}
    </ApplicantRegistrationContext.Provider>
  );
}

export function useApplicantRegistration() {
  const ctx = useContext(ApplicantRegistrationContext);
  if (!ctx) {
    throw new Error('useApplicantRegistration must be used within an ApplicantRegistrationProvider');
  }
  return ctx;
}