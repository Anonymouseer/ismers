import { initials, refCode, scoreClass, softForColor } from '../utils/clientDisplay';

const RING_R = 27;
const RING_CIRC = 2 * Math.PI * RING_R;
const STAGES = ['applied', 'screening', 'interview', 'hired'];

function StageTrack({ status }) {
  if (status === 'rejected') {
    return (
      <div className="jdv2-stage-row">
        <span className="jdv2-stage-rejected">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          Not selected
        </span>
      </div>
    );
  }
  const idx = STAGES.indexOf(status);
  const fillPct = idx >= 0 ? (idx / (STAGES.length - 1)) * 100 : 0;
  const stageName = idx >= 0 ? STAGES[idx].charAt(0).toUpperCase() + STAGES[idx].slice(1) : '—';
  return (
    <div className="jdv2-stage-row">
      <div className="jdv2-stage-track" style={{ '--fill-w': `${fillPct}%` }}>
        {STAGES.map((s, i) => (
          <span key={s} className={`jdv2-stage-dot${i <= idx ? ' filled' : ''}`} title={s} />
        ))}
      </div>
      <span className="jdv2-stage-current">{stageName}</span>
    </div>
  );
}

export default function JobDetailView({ client, job, jobIndex, onBack }) {
  const j = job;
  const badgeLabel = j.badge.charAt(0).toUpperCase() + j.badge.slice(1);
  const pct = Math.round((j.filled / j.total) * 100);
  const reqs = j.requirements || [];
  const tags = j.tags || [];
  const allApplicants = j.applicants || [];
  const hired = allApplicants.filter((a) => a.status === 'hired');
  const pipeline = allApplicants.filter((a) => a.status !== 'hired');
  const dashOffset = RING_CIRC * (1 - pct / 100);

  const jobStyle = {
    '--job-accent': j.color,
    '--job-tint-a': softForColor(j.color),
    '--job-tint-b': 'var(--panel)',
  };

  return (
    <div className="jdv2" style={jobStyle}>
      <div className="jdv2-banner">
        <div className="jdv2-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Back to Job Orders
        </div>
        <div className="jdv2-top">
          <div className="jdv2-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="jdv2-title">{j.title}</div>
            <div className="jdv2-sub">{client.name}{j.location ? ` · ${j.location}` : ''}</div>
            <div className="jdv2-ref">{refCode(client.name, jobIndex)}</div>
          </div>
          <span className="jdv2-badge">• {badgeLabel}</span>
        </div>

        <div className="jdv2-stat-strip">
          <div className="jdv2-stat"><div className="jdv2-stat-label">Employment Type</div><div className="jdv2-stat-value">{j.type || '—'}</div></div>
          <div className="jdv2-stat"><div className="jdv2-stat-label">Deadline</div><div className="jdv2-stat-value">{j.deadline || '—'}</div></div>
          <div className="jdv2-stat"><div className="jdv2-stat-label">Rate</div><div className="jdv2-stat-value">{j.rate || '—'}</div></div>
          <div className="jdv2-stat"><div className="jdv2-stat-label">Location</div><div className="jdv2-stat-value">{j.location || '—'}</div></div>
        </div>

        <div className="jdv2-fill-wrap">
          <div className="jdv2-ring">
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle className="jdv2-ring-track" cx="32" cy="32" r={RING_R}></circle>
              <circle
                className="jdv2-ring-fill"
                cx="32" cy="32" r={RING_R}
                strokeDasharray={RING_CIRC}
                strokeDashoffset={dashOffset}
              ></circle>
            </svg>
            <div className="jdv2-ring-pct">{pct}%</div>
          </div>
          <div className="jdv2-fill-text">
            <div className="jdv2-fill-label">Positions Filled</div>
            <div className="jdv2-fill-num">{j.filled}<span> / {j.total} positions</span></div>
          </div>
        </div>
      </div>

      <div className="jdv2-body">
        <div className="jdv2-cols">
          <div>
            <div className="jdv2-block-label">
              <span className="jdv2-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /></svg>
              </span>
              Job Description
            </div>
            <div className="jdv2-desc-card">
              <div className="jdv2-desc">{j.description || 'No description on file yet.'}</div>
            </div>

            <div className="jdv2-block-label">
              <span className="jdv2-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
              </span>
              Requirements
            </div>
            <ul className="jdv2-req-list">
              {reqs.length ? reqs.map((r, i) => (
                <li key={i}>
                  <span className="jdv2-req-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                  </span>
                  {r}
                </li>
              )) : <li style={{ color: 'var(--muted)' }}>No requirements listed yet.</li>}
            </ul>

            <div className="jdv2-block-label">
              <span className="jdv2-block-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m20.6 11.3-8.9-8.9a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v6.3c0 .5.2 1 .6 1.4l8.9 8.9a2 2 0 0 0 2.8 0l6.3-6.3a2 2 0 0 0 0-2.8Z" /><circle cx="7" cy="7" r="1.3" /></svg>
              </span>
              Tags
            </div>
            <div className="jdv2-tag-row">
              {tags.length
                ? tags.map((t, i) => <span className="jdv2-tag" key={i}>{t}</span>)
                : <span style={{ color: 'var(--muted)', fontSize: 11 }}>No tags</span>}
            </div>

            {/* Client Management surfaces pipeline data for visibility only — all applicant
                actions (scoring, status changes, scheduling) live in Recruitment & Selection. */}
            <div className="jdv2-cta" style={{ marginBottom: 16 }}>
              <div className="jdv2-cta-text">
                <b>Need to move an applicant forward?</b>
                Screening, interviews, and status changes are handled in Recruitment & Selection.
              </div>
              <a className="jdv2-cta-btn" href={`/recruitment-selection?job=${encodeURIComponent(refCode(client.name, jobIndex))}`}>
                Manage in Recruitment
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>

            <div className="jdv2-side-card">
              <div className="jdv2-side-title">
                <span>Applicant Pipeline</span>
                <span className="jdv2-readonly-tag">Read-only</span>
              </div>
              {pipeline.length ? pipeline.map((a, idx) => (
                <div className="jdv2-pipe-card" key={idx}>
                  <div className="jdv2-pipe-avatar">{initials(a.name)}</div>
                  <div className="jdv2-pipe-info">
                    <div className="jdv2-pipe-name">{a.name}</div>
                    <div className="jdv2-pipe-meta">Applied {a.applied}</div>
                    <StageTrack status={a.status} />
                  </div>
                  <span className={`jdv2-pipe-score ${scoreClass(a.score)}`}>{a.score}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--muted)', fontSize: 11.5 }}>No one else currently in the pipeline.</div>
              )}
            </div>
          </div>

          <div>
            <div className="jdv2-side-card jdv2-side-card--hired">
              <div className="jdv2-side-title">
                <span>Hired / Placed</span>
                <span className="jdv2-side-count">{hired.length} / {j.total}</span>
              </div>
              {hired.length ? hired.map((a, idx) => (
                <div className="jdv2-hire-card" key={idx}>
                  <div className="jdv2-hire-avatar">{initials(a.name)}</div>
                  <div className="jdv2-hire-info">
                    <div className="jdv2-hire-name">{a.name}</div>
                    <div className="jdv2-hire-meta">Applied {a.applied}</div>
                  </div>
                  <span className={`jdv2-hire-score ${scoreClass(a.score)}`}>{a.score}</span>
                </div>
              )) : (
                <div style={{ color: 'var(--muted)', fontSize: 11.5 }}>No one has been hired for this role yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}