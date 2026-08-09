import { useState } from 'react';
import {
  STAGES, PIPELINE_ORDER, CHECKLIST_ITEMS, INTERVIEW_STAGES, DOC_DEFS,
  CURRENT_ADMIN, TODAY,
} from '../data/mockApplications';
import { initials, scoreColor, formatDate, addDays, assignedRecruiter, findNextAvailableSlot } from '../utils/recruitmentUtils';
import { upsertHire, keyFor, updateRecruitmentStage } from '../services/RecruitmentSelectionService';
import DocViewerModal, { DOC_ICONS } from './DocViewerModal';

const SCORE_ROWS = [
  { key: 'skills', label: 'Skills Match' },
  { key: 'experience', label: 'Experience' },
  { key: 'screening', label: 'Screening' },
  { key: 'availability', label: 'Availability' },
];

export default function CandidateModal({ app, job, applications, onClose, onUpdate }) {
  const [docViewerType, setDocViewerType] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [warning, setWarning] = useState('');
  const [assignedManager, setAssignedManager] = useState('Area Manager 1 (North NCR)');
  const [endorsedClient, setEndorsedClient] = useState(job?.client || 'Seda Vertis North');
  const [interviewPlatform, setInterviewPlatform] = useState('Zoom Meeting');

  if (!app) return null;

  const isRejected = app.status === 'rejected';
  const isHired = app.status === 'hired';
  const currentIdx = PIPELINE_ORDER.indexOf(app.status);
  const stageKeys = isRejected ? ['applied', 'shortlisted', 'rejected'] : PIPELINE_ORDER;

  function update(updater) {
    onUpdate(app.id, updater);
  }

  function toggleChecklistItem(key) {
    update((a) => ({ ...a, checklist: { ...a.checklist, [key]: !a.checklist[key] } }));
  }

  function setRating(val) {
    update((a) => ({ ...a, recruiterRating: a.recruiterRating === val ? 0 : val }));
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

  function toggleDocVerified(type) {
    update((a) => {
      const nextStatus = { ...a.docStatus, [type]: !a.docStatus[type] };
      let notes = a.notes;
      if (nextStatus[type]) {
        notes = [...notes, { text: `${DOC_DEFS.find((d) => d.type === type).name} verified.`, meta: `${assignedRecruiter(job)} · ${formatDate(TODAY)}` }];
        if (Object.values(nextStatus).every(Boolean)) {
          notes = notes.filter((n) => !/awaiting document verification/i.test(n.text));
        }
      }
      return { ...a, docStatus: nextStatus, notes };
    });
  }

  function allDocsVerified() { return Object.values(app.docStatus).every(Boolean); }
  function allChecklistDone() { return Object.values(app.checklist).every(Boolean); }

  function flashWarning(msg) {
    setWarning(msg);
    setTimeout(() => setWarning(''), 3200);
  }

  function handleAdvance() {
    const nextKey = PIPELINE_ORDER[currentIdx + 1];
    if (!nextKey) return;
    if (app.status === 'shortlisted') {
      if (!allDocsVerified()) { flashWarning('Verify all documents before scheduling the interview.'); return; }
      if (!allChecklistDone()) { flashWarning('Complete the screening checklist before scheduling the interview.'); return; }
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
      const nextApp = { ...a, status: nextKey, interview, notes };
      if (nextKey === 'hired' && job) {
        upsertHire(keyFor(a.name, job.depRef), {
          name: a.name, jobTitle: job.title, client: job.client, jobOrderRef: job.depRef, hiredDate: a.applied,
        });
      }
      return nextApp;
    });

    if (!isNaN(Number(app.id))) {
      updateRecruitmentStage(app.id, nextKey).catch(() => {});
    }
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

    if (!isNaN(Number(app.id))) {
      updateRecruitmentStage(app.id, nextStage, nextStatus).catch(() => {});
    }
    onClose();
  }

  function handleReschedule() {
    if (!app.interview) return;
    const recruiter = app.interview.recruiter;
    const title = INTERVIEW_STAGES[app.status] || app.interview.title;
    const withoutCurrent = applications.map((a) => (a.id === app.id ? { ...a, interview: null } : a));
    const slot = findNextAvailableSlot(withoutCurrent, recruiter, new Date(TODAY));
    if (!slot) return;
    update((a) => ({
      ...a,
      interview: { title, date: slot.date, time: slot.time, recruiter },
      notes: [...a.notes, { text: `${title} moved to the next available slot with ${recruiter}: ${slot.date}, ${slot.time}.`, meta: `${CURRENT_ADMIN} · ${formatDate(TODAY)}` }],
    }));
  }

  const nextKey = PIPELINE_ORDER[currentIdx + 1];
  const nextLabel = nextKey ? STAGES.find((s) => s.key === nextKey)?.label : null;

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-head">
          <div className="modal-avatar">{initials(app.name)}</div>
          <div className="modal-title-wrap">
          <div className="modal-jo-title">{app.name}</div>
          <div className="modal-jo-sub">{job?.title || app.jobTitle || app.jobId || 'Unassigned'} · {job?.client || app.client || '—'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="modal-scroll">
          <div className="modal-info-grid">
            <div className="modal-info-item"><div className="modal-info-label">Applied</div><div className="modal-info-value">{app.applied}</div></div>
            <div className="modal-info-item"><div className="modal-info-label">Job Order</div><div className="modal-info-value" style={{ fontSize: 11 }}>{job?.title || app.jobTitle || app.jobId || '—'}</div></div>
            <div className="modal-info-item"><div className="modal-info-label">Experience</div><div className="modal-info-value">{app.experience}</div></div>
            <div className="modal-info-item"><div className="modal-info-label">Location</div><div className="modal-info-value" style={{ fontSize: 11 }}>{app.location}</div></div>
          </div>

          <div className="modal-section">
            <div className="modal-section-label">Application Documents</div>
            <div className="doc-list">
              {DOC_DEFS.map((d) => (
                <button key={d.type} className="doc-chip" onClick={() => setDocViewerType(d.type)}>
                  <svg className="icon" viewBox="0 0 24 24">{DOC_ICONS[d.type]}</svg>
                  {d.name}
                  <span className={`doc-badge ${app.docStatus[d.type] ? 'verified' : 'pending'}`} title={app.docStatus[d.type] ? 'Verified' : 'Pending verification'}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {app.docStatus[d.type] ? <path d="M20 6 9 17l-5-5" /> : <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></>}
                    </svg>
                  </span>
                </button>
              ))}
            </div>
            <div className={`doc-verify-summary ${allDocsVerified() ? 'all-verified' : ''}`}>
              {allDocsVerified()
                ? 'All documents verified'
                : `${Object.values(app.docStatus).filter(Boolean).length} of ${DOC_DEFS.length} documents verified — click a document to review and verify`}
            </div>
          </div>

          {!isHired && !isRejected && (
            <div className="modal-section">
              <div className="modal-section-label">Screening Checklist</div>
              <div className="checklist">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.key} className={`checklist-item ${app.checklist[item.key] ? 'checked' : ''}`} onClick={() => toggleChecklistItem(item.key)}>
                    <div className="checklist-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                    </div>
                    <div className="checklist-text">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className={`checklist-progress ${allChecklistDone() ? 'all-done' : ''}`}>
                {allChecklistDone()
                  ? 'All screening steps completed'
                  : `${Object.values(app.checklist).filter(Boolean).length} of ${CHECKLIST_ITEMS.length} screening steps completed`}
              </div>
            </div>
          )}

          <div className="modal-section">
            <div className="modal-section-label">Endorsement & Interview Setup</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Assigned Area Manager</label>
                <select
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11.5px', outline: 'none' }}
                  value={assignedManager}
                  onChange={(e) => setAssignedManager(e.target.value)}
                >
                  <option value="Area Manager 1 (North NCR)">Area Manager 1 (North NCR)</option>
                  <option value="Area Manager 2 (South NCR)">Area Manager 2 (South NCR)</option>
                  <option value="Area Supervisor - Hospitality">Area Supervisor - Hospitality</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Target Client Endorsement</label>
                <select
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11.5px', outline: 'none' }}
                  value={endorsedClient}
                  onChange={(e) => setEndorsedClient(e.target.value)}
                >
                  <option value="Seda Vertis North">Seda Vertis North</option>
                  <option value="Vikings Luxury Buffet">Vikings Luxury Buffet</option>
                  <option value="Y2 Hotel Residence">Y2 Hotel Residence</option>
                  <option value="City Garden Hotel">City Garden Hotel</option>
                  <option value="ABC Logistics">ABC Logistics</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Interview Channel / Venue</label>
                <select
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11.5px', outline: 'none' }}
                  value={interviewPlatform}
                  onChange={(e) => setInterviewPlatform(e.target.value)}
                >
                  <option value="Zoom Meeting">Zoom Meeting</option>
                  <option value="Microsoft Teams">Microsoft Teams</option>
                  <option value="Google Meet">Google Meet</option>
                  <option value="Face-to-Face (Isolated Room)">Face-to-Face (Isolated Room)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-label">Pipeline Stage</div>
            <div className="stage-track">
              {stageKeys.map((key, idx) => {
                const label = STAGES.find((s) => s.key === key).label;
                let cls = '';
                if (isRejected) {
                  cls = key === 'rejected' ? 'current' : 'done';
                } else {
                  cls = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : '';
                }
                return (
                  <div key={key} className={`stage-step ${cls}`}>
                    <div className="stage-line" />
                    <div className="stage-dot">{idx + 1}</div>
                    <div className="stage-label">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-section">
            <div className="modal-section-label">AI Candidate Score</div>
            <div className="score-overall">
              <div><div className="score-overall-num" style={{ color: scoreColor(app.score) }}>{app.score}</div></div>
              <div><div className="score-overall-label">Composite match score, weighted across skills, experience, and screening signals.</div></div>
            </div>
            <div>
              {SCORE_ROWS.map((r) => {
                const val = app.breakdown[r.key];
                return (
                  <div key={r.key} className="score-row">
                    <div className="score-label">{r.label}</div>
                    <div className="score-track"><div className="score-fill" style={{ width: `${val}%`, background: scoreColor(val) }} /></div>
                    <div className="score-num">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>

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

          {app.interview && (
            <div className="modal-section">
              <div className="modal-section-label">Interview</div>
              <div className="interview-card">
                <div className="interview-icon"><svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg></div>
                <div className="interview-info">
                  <div className="interview-title">{app.interview.title}</div>
                  <div className="interview-meta">{app.interview.date} · {app.interview.time} · with {app.interview.recruiter}</div>
                </div>
                <button className="interview-reschedule" onClick={handleReschedule}>Next available slot</button>
              </div>
            </div>
          )}

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

        <div className="modal-actions">
          {warning && <div style={{ width: '100%', textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--amber)', order: -1 }}>{warning}</div>}
          {app.status === 'for_deployment' ? (
            <a className="btn primary" href="/deployment-assignment" style={{ textDecoration: 'none', textAlign: 'center', width: '100%' }}>
              Hand Over to Deployment &amp; Assignment Board
            </a>
          ) : app.status === 're_pooling' ? (
            <button className="btn primary" style={{ width: '100%' }} onClick={() => update((a) => ({ ...a, status: 'pooling' }))}>
              Re-Line Up Candidate to Another Client (Return to Pooling)
            </button>
          ) : (
            <>
              <button className="btn" style={{ color: 'var(--red)' }} onClick={handleReject}>
                Failed (Re-Pool for Line Up)
              </button>
              <button className="btn primary" onClick={handleAdvance}>
                Endorse / Advance to {nextLabel || 'Next Step'}
              </button>
            </>
          )}
        </div>
      </div>

      {docViewerType && (
        <DocViewerModal
          app={app}
          job={job}
          type={docViewerType}
          isVerified={app.docStatus[docViewerType]}
          onClose={() => setDocViewerType(null)}
          onToggleVerified={() => toggleDocVerified(docViewerType)}
        />
      )}
    </div>
  );
}