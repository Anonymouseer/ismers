import { useState } from 'react';
import {
  CATEGORIES,
  STAGE_META,
  COLUMN_ORDER,
  boardColumn,
  hasPermission,
} from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
import { useUIFeedback } from '../../../components/common/UIFeedback';
import PersonAvatar from '../../../components/common/PersonAvatar';
import BasicInfoSection from './BasicInfoSection';
import PersonalDetailsSection from './PersonalDetailsSection';
import EducationSection from './EducationSection';
import DocumentsSection from './DocumentsSection';
import ReferencesSection from './ReferencesSection';
import ActivityHistory from './ActivityHistory';
import StatusSelect from './StatusSelect';
import JobMatchList from './JobMatchList';

export default function ProfileDrawer({ regId, onClose }) {
  const {
    role,
    getCandidate,
    updateBasicInfo,
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
    updateStatus,
    updateCategory,
    updateTargetJob,
    startProfiling,
    completeProfile,
    sendToRecruitment,
    returnToProfiling,
    deleteCandidate,
  } = useApplicantRegistration();

  const { showToast, confirmAction, executeWithFeedback } = useUIFeedback();

  const [skillInput, setSkillInput] = useState('');
  const [whRole, setWhRole] = useState('');
  const [whCompany, setWhCompany] = useState('');
  const [whDuration, setWhDuration] = useState('');
  const [warning, setWarning] = useState('');

  const isOpen = Boolean(regId);
  const candidate = regId ? getCandidate(regId) : null;

  if (!isOpen || !candidate) {
    return (
      <>
        <div className="drawer-overlay" />
        <div className="drawer" />
      </>
    );
  }

  const col = boardColumn(candidate);
  const canChangeStage = hasPermission(role, 'changeStage') || hasPermission(role, 'change_stage');
  const canDelete = hasPermission(role, 'deleteApplicant') || hasPermission(role, 'delete_candidate');
  const canEditSkills = hasPermission(role, 'editSkills');
  const canEditWorkHistory = hasPermission(role, 'editWorkHistory');
  const locked = Boolean(candidate.locked);
  const stageIndex = COLUMN_ORDER.indexOf(col);
  const meta = STAGE_META[col] || STAGE_META.registered;

  const flashWarning = (msg) => {
    setWarning(msg);
    setTimeout(() => setWarning(''), 3000);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    addSkill(candidate.regId, skillInput.trim());
    setSkillInput('');
  };

  const handleAddWorkHistory = (e) => {
    e.preventDefault();
    if (!whRole.trim()) return;
    addWorkHistory(candidate.regId, {
      role: whRole.trim(),
      company: whCompany.trim() || '—',
      duration: whDuration.trim() || '—',
    });
    setWhRole('');
    setWhCompany('');
    setWhDuration('');
  };

  const handleStartProfiling = async () => {
    await executeWithFeedback({
      confirmConfig: {
        title: 'Start Candidate Profiling',
        message: `Begin active intake profiling workflow for ${candidate.name}?`,
        confirmLabel: 'Start Profiling',
        details: [
          { label: 'Candidate', value: candidate.name },
          { label: 'Registration ID', value: candidate.regId },
          { label: 'Current Stage', value: 'Registered' },
          { label: 'Target Stage', value: 'Profiling' },
        ],
      },
      busyMessage: 'Initializing candidate profiling record...',
      actionFn: async () => {
        startProfiling(candidate.regId);
      },
      successTitle: 'Profiling Started',
      successMessage: `${candidate.name} has moved to Active Profiling stage.`,
      delayMs: 380,
    });
  };

  const handleCompleteProfile = async () => {
    await executeWithFeedback({
      confirmConfig: {
        title: 'Confirm Profile Verification',
        message: `Mark ${candidate.name}'s profile as verified and ready for recruitment?`,
        confirmLabel: 'Mark Profiled & Ready',
        details: [
          { label: 'Candidate', value: candidate.name },
          { label: 'Skills Logged', value: `${candidate.skills?.length || 0} skills` },
          { label: 'Work History', value: `${candidate.workHistory?.length || 0} entries` },
        ],
      },
      busyMessage: 'Verifying candidate compliance credentials...',
      actionFn: async () => {
        const result = await completeProfile(candidate.regId);
        if (result && !result.ok) {
          flashWarning(result.message);
          throw new Error(result.message);
        }
        return result;
      },
      successTitle: 'Profile Marked Complete',
      successMessage: `${candidate.name} is verified and ready for recruitment placement.`,
      delayMs: 400,
    });
  };

  const handleSendToRecruitment = async () => {
    await executeWithFeedback({
      confirmConfig: {
        title: 'Confirm Handoff to Recruitment',
        message: `Endorse and transfer ${candidate.name} to Recruitment & Selection?`,
        description: 'The candidate will enter the 6-stage hiring pipeline for screening checklist validation and interview scheduling.',
        confirmLabel: 'Endorse & Transfer Candidate',
        details: [
          { label: 'Candidate', value: candidate.name },
          { label: 'Registration ID', value: candidate.regId },
          { label: 'Assigned Category', value: candidate.category || 'General Staffing' },
          { label: 'Target Job', value: candidate.targetJobId || 'Pending Placement' },
        ],
      },
      busyMessage: `Transferring ${candidate.name} to Recruitment & Selection...`,
      actionFn: async () => {
        const result = await sendToRecruitment(candidate.regId);
        if (result && !result.ok) {
          flashWarning(result.message);
          throw new Error(result.message);
        }
        return result;
      },
      successTitle: 'Candidate Endorsed to Recruitment',
      successMessage: `${candidate.name} has been transferred to Recruitment & Selection (Applied Stage).`,
      delayMs: 450,
    });
  };

  const handleReturnToProfiling = async () => {
    await executeWithFeedback({
      confirmConfig: {
        title: 'Confirm Return to Profiling',
        message: `Return ${candidate.name} from Recruitment back to Profiling?`,
        confirmLabel: 'Return to Profiling',
        variant: 'warning',
        details: [
          { label: 'Candidate', value: candidate.name },
          { label: 'Registration ID', value: candidate.regId },
          { label: 'Current Stage', value: 'Sent to Recruitment' },
          { label: 'Target Stage', value: 'Profiling' },
        ],
      },
      busyMessage: `Returning ${candidate.name} to profiling...`,
      actionFn: async () => {
        returnToProfiling(candidate.regId);
      },
      successTitle: 'Returned to Profiling',
      successMessage: `${candidate.name} has been returned to Profiling.`,
      delayMs: 380,
    });
  };

  const handleDelete = async () => {
    await executeWithFeedback({
      confirmConfig: {
        title: 'Confirm Candidate Deletion',
        message: `Permanently delete candidate file for ${candidate.name} (${candidate.regId})?`,
        description: 'This high-risk action cannot be undone. All skills, work history, and profiling records will be permanently erased.',
        confirmLabel: 'Permanently Delete Record',
        variant: 'danger',
        details: [
          { label: 'Candidate Name', value: candidate.name },
          { label: 'Registration ID', value: candidate.regId },
          { label: 'Registered Date', value: candidate.registeredDate || 'N/A' },
        ],
      },
      busyMessage: `Deleting record for ${candidate.name}...`,
      actionFn: async () => {
        await deleteCandidate(candidate.regId);
        onClose();
      },
      successTitle: 'Candidate Deleted',
      successMessage: `${candidate.name}'s file has been permanently removed from the system.`,
      delayMs: 500,
    });
  };

  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <div className="drawer open">
        {/* PREMIUM DRAWER HEADER */}
        <div className="sheet-head">
          {canDelete && (
            <button
              className="sheet-close"
              onClick={handleDelete}
              type="button"
              aria-label="Delete Applicant"
              title="Permanently Delete Applicant Record"
              style={{
                right: '50px',
                color: 'var(--red, #ef4444)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <svg className="icon" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            </button>
          )}
          <button className="sheet-close" onClick={onClose} type="button" aria-label="Close">
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>

          <div className="drawer-hero">
            {/* LEFT: AVATAR */}
            <div className="drawer-hero-avatar">
              <PersonAvatar
                name={candidate.name}
                gender={candidate.gender}
                photo={candidate.photo || candidate.avatar}
                size="xl"
                variant="blue"
              />
              {/* STAGE INDICATOR DOT */}
              <span
                className="drawer-hero-stage-dot"
                style={{ background: meta.color }}
                title={meta.label}
              />
            </div>

            {/* RIGHT: IDENTITY BLOCK */}
            <div className="drawer-hero-info">
              <div className="drawer-hero-regid">{candidate.regId}</div>
              <div className="drawer-hero-name">{candidate.name}</div>
              <div className="drawer-hero-sub">{candidate.experienceSummary}</div>
              <div className="drawer-hero-meta">
                <span className="drawer-hero-stage-pill" style={{ color: meta.color, borderColor: meta.color }}>
                  {meta.label}
                </span>
                <StatusSelect candidate={candidate} role={role} onChange={updateStatus} />
              </div>
            </div>
          </div>

        </div>

        <div className="sheet-scroll">
          <BasicInfoSection candidate={candidate} role={role} onSave={updateBasicInfo} />

          <PersonalDetailsSection candidate={candidate} />

          <div className="sheet-section">
            <div className="sheet-label">
              <span className="sheet-label-text">
                <span className="sheet-label-icon" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M20 7 12 3 4 7l8 4 8-4Z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></svg>
                </span>
                Category
              </span>
            </div>
            <select
              value={candidate.category || ''}
              disabled={locked || !hasPermission(role, 'editBasicInfo')}
              onChange={(e) => updateCategory(candidate.regId, e.target.value || null)}
            >
              <option value="">— Not yet assigned —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span className="sheet-label-text">
                <span className="sheet-label-icon" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
                  <svg className="icon" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8.5 11h7M8.5 14.5h7" /></svg>
                </span>
                Job Order Matches
              </span>
              {candidate.targetJobId && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => updateTargetJob(candidate.regId, null, null)}
                  disabled={locked || !hasPermission(role, 'editBasicInfo')}
                >
                  Clear
                </button>
              )}
            </div>
            <JobMatchList
              candidate={candidate}
              canSelect={!locked && hasPermission(role, 'editBasicInfo')}
              onSelect={(jobId, jobLabel) => updateTargetJob(candidate.regId, jobId, jobLabel)}
            />
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span className="sheet-label-text">
                <span className="sheet-label-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
                  <svg className="icon" viewBox="0 0 24 24"><path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" /></svg>
                </span>
                Skills
              </span>
              <span className="sheet-count">{candidate.skills.length}</span>
            </div>
            <div className="tag-row">
              {candidate.skills.length === 0 ? (
                <div className="empty-note">No skills logged yet.</div>
              ) : (
                candidate.skills.map((s, i) => (
                  <span className="tag-chip" key={`${s}-${i}`}>
                    {s}
                    {canEditSkills && (
                      <button type="button" onClick={() => removeSkill(candidate.regId, i)}>&#x2715;</button>
                    )}
                  </span>
                ))
              )}
            </div>
            {canEditSkills && (
              <div className="add-row">
                <input
                  type="text"
                  placeholder="e.g. Forklift certified, Excel..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <button type="button" onClick={handleAddSkill}>Add Skill</button>
              </div>
            )}
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span className="sheet-label-text">
                <span className="sheet-label-icon" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
                  <svg className="icon" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>
                </span>
                Work History
              </span>
              <span className="sheet-count">{candidate.workHistory.length}</span>
            </div>
            <div>
              {candidate.workHistory.length === 0 ? (
                <div className="empty-note">No work history logged yet.</div>
              ) : (
                candidate.workHistory.map((w, i) => (
                  <div className="wh-item" key={`${w.role}-${i}`}>
                    <div>
                      <div className="role">{w.role}</div>
                      <div className="co">{w.company} · {w.duration}</div>
                    </div>
                    {canEditWorkHistory && (
                      <button type="button" onClick={() => removeWorkHistory(candidate.regId, i)}>&#x2715;</button>
                    )}
                  </div>
                ))
              )}
            </div>
            {canEditWorkHistory && (
              <div className="entry-form-grid">
                <label className="span-2">Role / Position<input type="text" placeholder="e.g. Warehouse Helper" value={whRole} onChange={(e) => setWhRole(e.target.value)} /></label>
                <label>Company<input type="text" placeholder="e.g. CitiMart Distribution" value={whCompany} onChange={(e) => setWhCompany(e.target.value)} /></label>
                <label>Duration<input type="text" placeholder="e.g. 2023 – 2025" value={whDuration} onChange={(e) => setWhDuration(e.target.value)} /></label>
                <div className="entry-form-actions">
                  <button type="button" className="stage-btn go" onClick={handleAddWorkHistory}>Add Work History</button>
                </div>
              </div>
            )}
          </div>

          <EducationSection candidate={candidate} role={role} onAdd={addEducation} onRemove={removeEducation} />

          <DocumentsSection candidate={candidate} role={role} onAdd={addDocument} onRemove={removeDocument} />

          <ReferencesSection candidate={candidate} role={role} onAdd={addReference} onRemove={removeReference} />

          <ActivityHistory candidate={candidate} />

          {canDelete && (
            <div className="sheet-section">
              <div className="sheet-label">
                <span className="sheet-label-text">
                  <span className="sheet-label-icon" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>
                    <svg className="icon" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>
                  </span>
                  Danger Zone
                </span>
              </div>
              <div className="stage-actions">
                <div className="stage-note">
                  Deleting an applicant permanently removes their candidate file and all profiling history.
                </div>
                <div className="stage-btn-row">
                  <button type="button" className="stage-btn danger" onClick={handleDelete}>
                    Permanently Delete Applicant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}