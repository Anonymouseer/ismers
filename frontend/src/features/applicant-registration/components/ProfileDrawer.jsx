import { useState } from 'react';
import { JOB_TARGETS, STAGE_META, COLUMN_ORDER, boardColumn } from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';

export default function ProfileDrawer({ regId, onClose }) {
  const {
    getCandidate,
    upsertCandidate,
    addSkill,
    removeSkill,
    addWorkHistory,
    removeWorkHistory,
    startProfiling,
    completeProfile,
    sendToRecruitment,
  } = useApplicantRegistration();

  const [skillInput, setSkillInput] = useState('');
  const [whRole, setWhRole] = useState('');
  const [whCompany, setWhCompany] = useState('');
  const [whDuration, setWhDuration] = useState('');
  const [warning, setWarning] = useState('');

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

  const handleCompleteProfile = () => {
    const result = completeProfile(candidate.regId);
    if (!result.ok) flashWarning(result.message);
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
          <div className="sheet-sub">{candidate.experienceSummary}</div>
        </div>

        <div className="sheet-scroll">
          <div className="meta-grid">
            <div className="meta-row">
              <div className="k">Contact</div>
              <div className="v">{candidate.email} · {candidate.phone}</div>
            </div>
            <div className="meta-row">
              <div className="k">Location</div>
              <div className="v">{candidate.location}</div>
            </div>
            <div className="meta-row">
              <div className="k">Registered</div>
              <div className="v">{candidate.registeredDate}</div>
            </div>
            <div className="meta-row">
              <div className="k">Target Job</div>
              <div className="v">
                <select
                  value={candidate.targetJobId || ''}
                  disabled={locked}
                  onChange={(e) =>
                    upsertCandidate(candidate.regId, { targetJobId: e.target.value || null })
                  }
                >
                  <option value="">— Not yet assigned —</option>
                  {JOB_TARGETS.map((j) => (
                    <option key={j.id} value={j.id}>{j.title} — {j.client}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span>Skills</span>
              <span className="sheet-count">{candidate.skills.length}</span>
            </div>
            <div className="tag-row">
              {candidate.skills.length === 0 ? (
                <div className="empty-note">No skills logged yet.</div>
              ) : (
                candidate.skills.map((s, i) => (
                  <span className="tag-chip" key={`${s}-${i}`}>
                    {s}
                    <button type="button" onClick={() => removeSkill(candidate.regId, i)} disabled={locked}>
                      ✕
                    </button>
                  </span>
                ))
              )}
            </div>
            <div className="add-row">
              <input
                type="text"
                placeholder="e.g. Forklift certified, Excel..."
                value={skillInput}
                disabled={locked}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              <button type="button" onClick={handleAddSkill} disabled={locked}>
                Add Skill
              </button>
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span>Work History</span>
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
                    <button type="button" onClick={() => removeWorkHistory(candidate.regId, i)} disabled={locked}>
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="wh-add-row">
              <input type="text" placeholder="Role" value={whRole} disabled={locked} onChange={(e) => setWhRole(e.target.value)} />
              <input type="text" placeholder="Company" value={whCompany} disabled={locked} onChange={(e) => setWhCompany(e.target.value)} />
              <input type="text" placeholder="Duration" value={whDuration} disabled={locked} onChange={(e) => setWhDuration(e.target.value)} />
              <button type="button" className="stage-btn" onClick={handleAddWorkHistory} disabled={locked}>
                Add
              </button>
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Profiling Workflow</div>
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
              {col === 'registered' && (
                <>
                  <div className="stage-note">Applicant has registered but profiling hasn&apos;t started.</div>
                  <div className="stage-btn-row">
                    <button className="stage-btn go" type="button" onClick={() => startProfiling(candidate.regId)}>
                      Start Profiling
                    </button>
                  </div>
                </>
              )}
              {col === 'profiling' && (
                <>
                  <div className="stage-note">
                    Assign a target job order, then add at least one skill and one work history entry
                    before marking the profile complete.
                  </div>
                  <div className="stage-btn-row">
                    <button className="stage-btn go" type="button" onClick={handleCompleteProfile}>
                      Mark Profile Complete
                    </button>
                  </div>
                </>
              )}
              {col === 'profiled' && (
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
                      href="/recruitment"
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
        </div>
      </div>
    </>
  );
}
