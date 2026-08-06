// ApplicantRegistrationStore.jsx
//
// Feature-scoped state for the Applicant Registration & Profiling board.
// Replaces the original static prototype's `ISMERSBridge` (a localStorage
// hack used to fake shared state between separate .html pages). Inside the
// real React app, other subsystems should read this feature's data through
// ApplicantRegistrationService (once it calls the real API) rather than
// reaching into this store directly — see "Frontend cross-feature calls" in
// the project conventions.
//
// NOTE: this file needs a .jsx extension (not .js) because it renders a
// Provider component with JSX. If your Vite config already parses JSX in
// .js files project-wide, feel free to rename it back to .js to match the
// naming convention used elsewhere.
//
// NOTE on roles: there is no auth/backend yet, so `role` here is just local
// state defaulting to 'admin', switchable via RoleSwitcher.jsx in the
// topbar for demoing permission gating. Replace with real session data once
// auth exists.

import { createContext, useContext, useEffect, useState } from 'react';
import {
  SEED_CANDIDATES,
  STATUS_META,
  generateId,
  nextRegId,
} from '../services/ApplicantRegistrationService';

const STORAGE_KEY = 'ismers.applicantRegistration.candidates';
const ROLE_STORAGE_KEY = 'ismers.applicantRegistration.role';

const ApplicantRegistrationContext = createContext(null);

function loadInitialCandidates() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.warn('Could not read persisted applicant data, falling back to seed data.', err);
  }
  return SEED_CANDIDATES;
}

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
  const [candidates, setCandidates] = useState(loadInitialCandidates);
  const [role, setRole] = useState(loadInitialRole);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    } catch (err) {
      console.warn('Could not persist applicant data.', err);
    }
  }, [candidates]);

  useEffect(() => {
    try {
      window.localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch (err) {
      console.warn('Could not persist role.', err);
    }
  }, [role]);

  const getCandidate = (regId) => candidates.find((c) => c.regId === regId);

  const upsertCandidate = (regId, patch) => {
    setCandidates((prev) => prev.map((c) => (c.regId === regId ? { ...c, ...patch } : c)));
  };

  // Appends a line to the applicant's activity history. Internal helper —
  // every mutating action below calls this so the timeline stays accurate
  // without every component having to remember to log it themselves.
  const logHistory = (regId, text) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.regId === regId
          ? { ...c, history: [...(c.history || []), { id: generateId('h'), date: today(), text }] }
          : c
      )
    );
  };

  const addSkill = (regId, skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const c = getCandidate(regId);
    if (!c) return;
    upsertCandidate(regId, { skills: [...c.skills, trimmed] });
    logHistory(regId, `Skill added: ${trimmed}`);
  };

  const removeSkill = (regId, index) => {
    const c = getCandidate(regId);
    if (!c) return;
    const removed = c.skills[index];
    const skills = c.skills.slice();
    skills.splice(index, 1);
    upsertCandidate(regId, { skills });
    if (removed) logHistory(regId, `Skill removed: ${removed}`);
  };

  const addWorkHistory = (regId, entry) => {
    if (!entry.role.trim() || !entry.company.trim()) return;
    const c = getCandidate(regId);
    if (!c) return;
    const workHistory = [
      ...c.workHistory,
      {
        role: entry.role.trim(),
        company: entry.company.trim(),
        duration: entry.duration.trim() || '—',
      },
    ];
    upsertCandidate(regId, { workHistory });
    logHistory(regId, `Work history added: ${entry.role.trim()} at ${entry.company.trim()}`);
  };

  const removeWorkHistory = (regId, index) => {
    const c = getCandidate(regId);
    if (!c) return;
    const workHistory = c.workHistory.slice();
    workHistory.splice(index, 1);
    upsertCandidate(regId, { workHistory });
    logHistory(regId, 'Work history entry removed');
  };

  // ---- Education ----
  const addEducation = (regId, entry) => {
    if (!entry.school.trim() || !entry.degree.trim()) return;
    const c = getCandidate(regId);
    if (!c) return;
    const education = [
      ...(c.education || []),
      {
        id: generateId('e'),
        school: entry.school.trim(),
        degree: entry.degree.trim(),
        level: entry.level.trim() || '—',
        startYear: entry.startYear.trim(),
        endYear: entry.endYear.trim() || 'Present',
      },
    ];
    upsertCandidate(regId, { education });
    logHistory(regId, `Education added: ${entry.degree.trim()} at ${entry.school.trim()}`);
  };

  const removeEducation = (regId, entryId) => {
    const c = getCandidate(regId);
    if (!c) return;
    const education = (c.education || []).filter((e) => e.id !== entryId);
    upsertCandidate(regId, { education });
    logHistory(regId, 'Education entry removed');
  };

  // ---- Documents ----
  // NOTE: no backend yet, so this only stores file metadata (name, type,
  // upload date) — not the actual file bytes. View/download won't work
  // for real until a backend + file storage exists; this just gets the
  // UI and data shape ready for that.
  const addDocument = (regId, doc) => {
    if (!doc.name.trim()) return;
    const c = getCandidate(regId);
    if (!c) return;
    const documents = [
      ...(c.documents || []),
      {
        id: generateId('d'),
        name: doc.name.trim(),
        type: doc.type || 'Other Documents',
        uploadedDate: today(),
      },
    ];
    upsertCandidate(regId, { documents });
    logHistory(regId, `Document uploaded: ${doc.name.trim()}`);
  };

  const removeDocument = (regId, docId) => {
    const c = getCandidate(regId);
    if (!c) return;
    const removed = (c.documents || []).find((d) => d.id === docId);
    const documents = (c.documents || []).filter((d) => d.id !== docId);
    upsertCandidate(regId, { documents });
    if (removed) logHistory(regId, `Document removed: ${removed.name}`);
  };

  // ---- Basic info edit + duplicate detection ----
  // Checks email/mobile against every OTHER candidate before saving.
  // Returns { ok, message, duplicate } instead of throwing so the caller
  // (component) decides how to surface the warning.
  const updateBasicInfo = (regId, patch) => {
    const email = (patch.email || '').trim().toLowerCase();
    const phone = (patch.phone || '').trim();

    const duplicate = candidates.find(
      (c) =>
        c.regId !== regId &&
        ((email && c.email.trim().toLowerCase() === email) ||
          (phone && c.phone.trim() === phone))
    );

    if (duplicate) {
      return {
        ok: false,
        duplicate: true,
        message: `Possible existing applicant found: ${duplicate.name} (${duplicate.regId}) already uses this email or mobile number.`,
      };
    }

    upsertCandidate(regId, patch);
    logHistory(regId, 'Basic information updated');
    return { ok: true };
  };

  // ---- Stage / status ----
  const startProfiling = (regId) => {
    upsertCandidate(regId, { stage: 'profiling' });
    logHistory(regId, 'Started profiling');
  };

  // Returns { ok: true } or { ok: false, message } instead of showing a DOM
  // warning directly, so the component decides how to display it.
  const completeProfile = (regId) => {
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
    upsertCandidate(regId, { stage: 'profiled' });
    logHistory(regId, 'Profile marked complete');
    return { ok: true };
  };

  const sendToRecruitment = (regId) => {
    upsertCandidate(regId, { sentToRecruitment: true });
    logHistory(regId, 'Sent to Recruitment & Selection');
  };

  const updateStatus = (regId, status) => {
    upsertCandidate(regId, { status });
    logHistory(regId, `Status changed to ${STATUS_META[status]?.label || status}`);
  };

  const updateCategory = (regId, category) => {
    upsertCandidate(regId, { category });
    logHistory(regId, category ? `Category assigned: ${category}` : 'Category unassigned');
  };

  const updateTargetJob = (regId, targetJobId, jobLabel) => {
    upsertCandidate(regId, { targetJobId });
    logHistory(regId, targetJobId ? `Target job assigned: ${jobLabel}` : 'Target job unassigned');
  };

  const deleteCandidate = (regId) => {
    setCandidates((prev) => prev.filter((c) => c.regId !== regId));
  };

  // ---- New applicant intake (staff-assisted registration form) ----
  // Same duplicate check as updateBasicInfo — checked against email/phone
  // before the record is created. Returns { ok, regId } or { ok, duplicate, message }.
  const addApplicant = (formData) => {
    const email = (formData.email || '').trim().toLowerCase();
    const phone = (formData.phone || '').trim();

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
    const registeredDate = today();

    const newCandidate = {
      regId,
      name: formData.name || '',
      lastName: formData.lastName || '',
      middleName: formData.middleName || '',
      suffix: formData.suffix || '',
      dateOfBirth: formData.dateOfBirth || '',
      gender: formData.gender || '',
      civilStatus: formData.civilStatus || '',
      nationality: formData.nationality || '',
      placeOfBirth: formData.placeOfBirth || '',
      height: formData.height || '',
      weight: formData.weight || '',
      religion: formData.religion || '',
      email: formData.email || '',
      phone: formData.phone || '',
      alternateContact: formData.alternateContact || '',
      address: formData.address || '',
      location: formData.location || '',
      spouseName: formData.spouseName || '',
      spouseOccupation: formData.spouseOccupation || '',
      fatherName: formData.fatherName || '',
      fatherOccupation: formData.fatherOccupation || '',
      motherName: formData.motherName || '',
      motherOccupation: formData.motherOccupation || '',
      familyAddress: formData.familyAddress || '',
      emergencyContactName: formData.emergencyContactName || '',
      emergencyContactAddress: formData.emergencyContactAddress || '',
      experienceSummary: formData.experienceSummary || '',
      targetJobId: null,
      category: null,
      skills: [],
      workHistory: formData.workHistory || [],
      education: (formData.education || []).map((e) => ({ id: generateId('e'), ...e })),
      documents: [],
      references: (formData.references || []).map((r) => ({ id: generateId('r'), ...r })),
      stage: 'registered',
      status: 'active',
      sentToRecruitment: false,
      registeredDate,
      history: [{ id: generateId('h'), date: registeredDate, text: 'Applicant registered' }],
    };

    setCandidates((prev) => [...prev, newCandidate]);
    return { ok: true, regId };
  };

  // ---- References ----
  const addReference = (regId, entry) => {
    if (!entry.name.trim()) return;
    const c = getCandidate(regId);
    if (!c) return;
    const references = [
      ...(c.references || []),
      {
        id: generateId('r'),
        name: entry.name.trim(),
        occupation: entry.occupation.trim() || '—',
        contact: entry.contact.trim() || '—',
      },
    ];
    upsertCandidate(regId, { references });
    logHistory(regId, `Reference added: ${entry.name.trim()}`);
  };

  const removeReference = (regId, refId) => {
    const c = getCandidate(regId);
    if (!c) return;
    const references = (c.references || []).filter((r) => r.id !== refId);
    upsertCandidate(regId, { references });
    logHistory(regId, 'Reference removed');
  };

  const value = {
    candidates,
    role,
    setRole,
    getCandidate,
    upsertCandidate,
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