import { useState } from 'react';
import {
  STATUS_META, PRIORITY_META, countdownLabel, initials, pillClass, pillLabel, scoreClass,
} from '../services/JobOrderManagementService';
import StageTrack from './StageTrack';

export default function JobOrderDrawer({ open, job, actions, onClose, onEdit, onDelete, onAddNote }) {
  const [noteText, setNoteText] = useState('');

  if (!job) return null;

  const meta = STATUS_META[job.status];
  const pr = PRIORITY_META[job.priority] || PRIORITY_META.normal;
  const pct = Math.round((job.filled / job.total) * 100);
  const all = job.applicants || [];
  const hired = all.filter((a) => a.status === 'hired');
  const pipeline = all.filter((a) => a.status !== 'hired');

  const submitNote = () => {
    if (!noteText.trim()) return;
    onAddNote(job.ref, noteText);
    setNoteText('');
  };

  const handleDelete = () => {
    if (window.confirm(`Delete job order ${job.ref} — ${job.title}? This cannot be undone.`)) {
      onDelete(job.ref);
    }
  };

  return (
    <>
      <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="sheet-head">
          <div className="sheet-toolbar">
            <button className="toolbar-btn" title="Edit" onClick={() => onEdit(job.ref)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
            </button>
            <button className="toolbar-btn" title="Print" onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            </button>
            <button className="toolbar-btn danger" title="Delete" onClick={handleDelete}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            </button>
          </div>
          <button className="sheet-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <span className="stamp" style={{ color: meta.color }}>{meta.label}</span>
          <div className="sheet-eyebrow">{job.ref} · Job Order Requisition</div>
          <div className="sheet-title">{job.title}</div>
          <div className="sheet-sub">{job.client} · {job.location}</div>
        </div>

        <div className="sheet-scroll">
          <div className="meta-grid">
            <div className="meta-row"><div className="k">Client</div><div className="v">{job.client}</div></div>
            <div className="meta-row"><div className="k">Location</div><div className="v">{job.location}</div></div>
            <div className="meta-row"><div className="k">Type</div><div className="v">{job.type}</div></div>
            <div className="meta-row"><div className="k">Rate / Salary</div><div className="v">{job.rate}</div></div>
            <div className="meta-row"><div className="k">Deadline</div><div className="v">{job.deadline} ({countdownLabel(job.deadline).text})</div></div>
            <div className="meta-row"><div className="k">Recruiter</div><div className="v">{job.recruiter}</div></div>
            <div className="meta-row"><div className="k">Priority</div><div className="v"><span className="priority-badge" style={{ background: `${pr.color}22`, color: pr.color }}>{pr.label}</span></div></div>
          </div>

          <div className="fill-block">
            <div className="fill-block-top"><span>Positions Filled</span><span>{job.filled} / {job.total} ({pct}%)</span></div>
            <div className="fill-block-track"><div className="fill-block-fill" style={{ width: `${pct}%`, background: meta.color }} /></div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Job Order Workflow</div>
            <StageTrack job={job} actions={actions} />
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Job Description</div>
            <div className="sheet-desc">{job.description}</div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Requirements</div>
            <ul className="checklist">
              {(job.requirements || []).length
                ? job.requirements.map((r, i) => <li key={i}>{r}</li>)
                : <li>No requirements listed yet.</li>}
            </ul>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Tags</div>
            <div className="tag-row">
              {(job.tags || []).length
                ? job.tags.map((t) => <span className="tag-chip" key={t}>#{t.toLowerCase().replace(/\s+/g, '-')}</span>)
                : <span className="empty-note">No tags</span>}
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label"><span>Hired / Placed</span><span className="sheet-count">{hired.length} / {job.total}</span></div>
            <div>
              {hired.length ? hired.map((a) => (
                <div className="hired-strip" key={a.name}>
                  <div className="av">{initials(a.name)}</div>
                  <div className="info">
                    <div className="nm">{a.name}</div>
                    <div className="mt">applied {a.applied}</div>
                  </div>
                  <div className="sc">{a.score}</div>
                </div>
              )) : <div className="empty-note">No one has been hired for this role yet.</div>}
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Applicant Pipeline</div>
            <table className="manifest-table">
              {pipeline.length ? (
                <>
                  <thead><tr><th>Applicant</th><th>Score</th><th>Status</th><th>Applied</th></tr></thead>
                  <tbody>
                    {pipeline.map((a) => (
                      <tr key={a.name}>
                        <td><div className="manifest-name"><span className="manifest-avatar">{initials(a.name)}</span>{a.name}</div></td>
                        <td><span className={`manifest-score ${scoreClass(a.score)}`}>{a.score}</span></td>
                        <td><span className={`manifest-pill ${pillClass(a.status)}`}>{pillLabel(a.status)}</span></td>
                        <td>{a.applied}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              ) : (
                <tbody><tr><td className="empty-note">No one else currently in the pipeline.</td></tr></tbody>
              )}
            </table>
          </div>

          <div className="sheet-section">
            <div className="sheet-label"><span>Notes &amp; Activity Log</span><span className="sheet-count">{job.activityLog.length}</span></div>
            <div className="note-input-row">
              <input
                type="text" placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitNote(); }}
              />
              <button type="button" onClick={submitNote}>Add</button>
            </div>
            <div>
              {job.activityLog.length
                ? job.activityLog.map((a, i) => (
                  <div className={`activity-item ${a.type}`} key={i}>
                    <div className="activity-dot" />
                    <div>
                      <div className="activity-text">{a.text}</div>
                      <div className="activity-time">{a.date}</div>
                    </div>
                  </div>
                ))
                : <div className="empty-note">No activity yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}