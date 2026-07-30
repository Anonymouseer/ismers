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

import { createContext, useContext, useEffect, useState } from 'react';
import { SEED_CANDIDATES } from '../services/ApplicantRegistrationService';

const STORAGE_KEY = 'ismers.applicantRegistration.candidates';

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

export function ApplicantRegistrationProvider({ children }) {
  const [candidates, setCandidates] = useState(loadInitialCandidates);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidates));
    } catch (err) {
      console.warn('Could not persist applicant data.', err);
    }
  }, [candidates]);

  const getCandidate = (regId) => candidates.find((c) => c.regId === regId);

  const upsertCandidate = (regId, patch) => {
    setCandidates((prev) => prev.map((c) => (c.regId === regId ? { ...c, ...patch } : c)));
  };

  const addSkill = (regId, skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const c = getCandidate(regId);
    if (!c) return;
    upsertCandidate(regId, { skills: [...c.skills, trimmed] });
  };

  const removeSkill = (regId, index) => {
    const c = getCandidate(regId);
    if (!c) return;
    const skills = c.skills.slice();
    skills.splice(index, 1);
    upsertCandidate(regId, { skills });
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
  };

  const removeWorkHistory = (regId, index) => {
    const c = getCandidate(regId);
    if (!c) return;
    const workHistory = c.workHistory.slice();
    workHistory.splice(index, 1);
    upsertCandidate(regId, { workHistory });
  };

  const startProfiling = (regId) => upsertCandidate(regId, { stage: 'profiling' });

  // Returns { ok: true } or { ok: false, message } instead of showing a DOM
  // warning directly, so the component decides how to display it.
  const completeProfile = (regId) => {
    const c = getCandidate(regId);
    if (!c) return { ok: false, message: 'Applicant not found.' };
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
    return { ok: true };
  };

  const sendToRecruitment = (regId) => upsertCandidate(regId, { sentToRecruitment: true });

  const value = {
    candidates,
    getCandidate,
    upsertCandidate,
    addSkill,
    removeSkill,
    addWorkHistory,
    removeWorkHistory,
    startProfiling,
    completeProfile,
    sendToRecruitment,
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
