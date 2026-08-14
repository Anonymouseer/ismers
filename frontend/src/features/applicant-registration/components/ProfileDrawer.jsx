import { useState } from 'react';
import {
  CATEGORIES,
  STAGE_META,
  COLUMN_ORDER,
  boardColumn,
  hasPermission,
} from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
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
    deleteCandidate,
  } = useApplicantRegistration();

  const [skillInput, setSkillInput] = useState('');
  const [whRole, setWhRole] = useState('');
  const [whCompany, setWhCompany] = useState('');
  const [whDuration, setWhDuration] = useState('');
  const [warning, setWarning] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isOpen = Boolean(regId);
  const candidate = regId ? getCandidate(regId) : null;

  // Keep the overlay/drawer elements mounted (just without "open") so the
  // CSS slide transition still runs when a candidate is selected.
  if (!isOpen || !candidate) {
    return (
      <>
        <div className="drawer-overlay" />
        <div className="drawer" />
      </>
    );
  }

  const col = boardColumn(candidate);
  const meta = STAGE_META[col];
  const locked = col === 'sent';
  const stageIndex = COLUMN_ORDER.indexOf(col);
  const canEditSkills = hasPermission(role, 'editSkills') && !locked;
  const canEditWorkHistory = hasPermission(role, 'editWorkHistory') && !locked;
  const canChangeStage = hasPermission(role, 'changeStage') && !locked;
  const canDelete = hasPermission(role, 'deleteApplicant');

  const flashWarning = (message) => {
    setWarning(message);
    setTimeout(() => setWarning(''), 3200);
  };

  const handleAddSkill = () => {
    addSkill(candidate.regId, skillInput);
    setSkillInput('');
  };

  const handleAddWorkHistory = () => {
    addWorkHistory(candidate.regId, { role: whRole, company: whCompany, duration: whDuration });
    setWhRole('');
    setWhCompany('');
    setWhDuration('');
  };

  const handleCompleteProfile = async () => {
    const result = await completeProfile(candidate.regId);
    if (result && !result.ok) flashWarning(result.message);
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    deleteCandidate(candidate.regId);
    setConfirmingDelete(false);
    onClose();
  };

  return (
    <>
      <div className="drawer-overlay open" onClick={onClose} />
      <div className="drawer open">
        <div className="sheet-head">
          <button className="sheet-close" onClick={onClose} type="button">
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <span className="stamp" style={{ color: meta.color }}>{meta.label}</span>
          <div className="sheet-eyebrow">{candidate.regId} · applicant_profile</div>
          <div className="sheet-title">{candidate.name}</div>
          <div className="sheet-sub">
            {candidate.experienceSummary}
            <span style={{ marginLeft: 10 }}>
              <StatusSelect candidate={candidate} role={role} onChange={updateStatus} />
            </span>
          </div>
        </div>

        <div className="sheet-scroll">
          <BasicInfoSection candidate={candidate} role={role} onSave={updateBasicInfo} />

          <PersonalDetailsSection candidate={candidate} />

          <div className="sheet-section">
            <div className="sheet-label">
              <span className="sheet-label-text">
                <span className="sheet-label-icon" style={{ background: 'var(--blue-soft)', color: 'var(--blue)' }}>
                  <svg className="icon" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h6" /></svg>
                </span>
                Profiling Workflow
              </span>
            </div>
            <div className="stage-track">
              {COLUMN_ORDER.map((key, i) => {
                const cls = i < stageIndex ? 'done' : i === stageIndex ? 'current' : 'future';
                return (
                  <div className={`stage-step ${cls}`} key={key}>
                    <div className="stage-dot">{i < stageIndex ? '✓' : ''}</div>
                    <div>
                      <div className="stage-label">{STAGE_META[key].label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="stage-actions">
              {!canChangeStage && !locked && (
                <div className="stage-note">Your role does not have permission to change this applicant&apos;s stage.</div>
              )}
              {canChangeStage && col === 'registered' && (
                <>
                  <div className="stage-note">Applicant has registered but profiling hasn&apos;t started.</div>
                  <div className="stage-btn-row">
                    <button className="stage-btn go" type="button" onClick={() => startProfiling(candidate.regId)}>
                      Start Profiling
                    </button>
                  </div>
                </>
              )}
              {canChangeStage && col === 'profiling' && (
                <>
                  <div className="stage-note">
                    Assign a category and target job order, then add at least one skill and one work history entry
                    before marking the profile complete.
                  </div>
                  <div className="stage-btn-row">
                    <button className="stage-btn go" type="button" onClick={handleCompleteProfile}>
                      Mark Profile Complete
                    </button>
                  </div>
                </>
              )}
              {canChangeStage && col === 'profiled' && (
                <>
                  <div className="stage-note">
                    Profile is complete. Send this applicant to Recruitment & Selection to enter the
                    hiring pipeline.
                  </div>
                  <div className="stage-btn-row">
                    <button
                      className="stage-btn go send"
                      type="button"
                      onClick={() => sendToRecruitment(candidate.regId)}
                    >
                      Send to Recruitment & Selection
                    </button>
                  </div>
                </>
              )}
              {col === 'sent' && (
                <>
                  <div className="stage-note">
                    Sent to Recruitment & Selection. This applicant now appears there as a new
                    &quot;Applied&quot; candidate.
                  </div>
                  <div className="stage-btn-row">
                    <a
                      className="stage-btn go"
                      href="/recruitment-selection"
                      style={{ textDecoration: 'none', display: 'inline-block' }}
                    >
                      Open in Recruitment & Selection
                    </a>
                  </div>
                </>
              )}
              {warning && <div className="actions-warning">{warning}</div>}
            </div>
          </div>

          {col !== 'registered' && (
            <>
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
                          <button type="button" onClick={() => removeSkill(candidate.regId, i)}>✕</button>
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
                          <button type="button" onClick={() => removeWorkHistory(candidate.regId, i)}>✕</button>
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
            </>
          )}

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
                  {confirmingDelete
                    ? 'Are you sure? This permanently removes the applicant record.'
                    : 'Deleting an applicant permanently removes their record.'}
                </div>
                <div className="stage-btn-row">
                  <button type="button" className="stage-btn danger" onClick={handleDelete}>
                    {confirmingDelete ? 'Confirm Delete' : 'Delete Applicant'}
                  </button>
                  {confirmingDelete && (
                    <button type="button" className="stage-btn" onClick={() => setConfirmingDelete(false)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}