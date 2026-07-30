import { softForColor, initials, refCode, colorFor, softFor, pillClass, pillLabel, scoreClass } from '../utils/clientDisplay';

export default function JobDetailView({ client, job, jobIndex, onBack }) {
  const j = job;
  const badgeLabel = j.badge.charAt(0).toUpperCase() + j.badge.slice(1);
  const pct = Math.round((j.filled / j.total) * 100);
  const reqs = j.requirements || [];
  const tags = j.tags || [];
  const allApplicants = j.applicants || [];
  const hired = allApplicants.filter((a) => a.status === 'hired');
  const pipeline = allApplicants.filter((a) => a.status !== 'hired');

  return (
    <div className="job-detail-view open">
      <button className="jd-back" onClick={onBack}>
        <svg className="icon" viewBox="0 0 24 24"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        Back to Job Orders
      </button>
      <div className="jd-head">
        <div className="jd-icon" style={{ background: softForColor(j.color), color: j.color }}>
          <svg className="icon" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></svg>
        </div>
        <div className="jd-title-wrap">
          <div className="jd-title-row">
            <div className="jd-title">{j.title}</div>
            <span className="jd-badge" style={{ background: softForColor(j.color), color: j.color }}>• {badgeLabel}</span>
          </div>
          <div className="jd-sub">{client.name} · {j.location || ''}</div>
          <div className="jd-ref">{refCode(client.name, jobIndex)}</div>
        </div>
      </div>
      <div className="modal-scroll">
        <div className="jd-info-grid">
          <div className="modal-info-item">
            <div className="jd-info-icon c1"><svg className="icon" viewBox="0 0 24 24"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg></div>
            <div><div className="modal-info-label">Location</div><div className="modal-info-value">{j.location || '—'}</div></div>
          </div>
          <div className="modal-info-item">
            <div className="jd-info-icon c2"><svg className="icon" viewBox="0 0 24 24"><path d="M6 7h12l1 13H5L6 7Z" /><path d="M9 7V5a3 3 0 0 1 6 0v2" /></svg></div>
            <div><div className="modal-info-label">Employment Type</div><div className="modal-info-value">{j.type || '—'}</div></div>
          </div>
          <div className="modal-info-item">
            <div className="jd-info-icon c3"><svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5h4" /></svg></div>
            <div><div className="modal-info-label">Rate / Salary</div><div className="modal-info-value">{j.rate || '—'}</div></div>
          </div>
          <div className="modal-info-item">
            <div className="jd-info-icon c4"><svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg></div>
            <div><div className="modal-info-label">Deadline</div><div className="modal-info-value">{j.deadline || '—'}</div></div>
          </div>
        </div>

        <div className="jd-fill">
          <div className="jd-fill-label">Positions filled</div>
          <div className="jd-fill-track"><div className="jd-fill-fill" style={{ width: `${pct}%`, color: j.color }}></div></div>
          <div className="num">{j.filled} / {j.total} ({pct}%)</div>
        </div>

        <div className="modal-section">
          <div className="modal-section-label">Job Description</div>
          <div className="modal-desc-text">{j.description || 'No description on file yet.'}</div>
        </div>

        <div className="modal-section">
          <div className="modal-section-label">Requirements</div>
          <ul className="modal-req-list">
            {reqs.length ? reqs.map((r, i) => <li key={i}>{r}</li>) : <li>No requirements listed yet.</li>}
          </ul>
        </div>

        <div className="modal-section">
          <div className="modal-section-label">Tags</div>
          <div className="modal-tag-row">
            {tags.length
              ? tags.map((t, i) => <span className="modal-tag" key={i}>{t}</span>)
              : <span style={{ color: 'var(--muted)', fontSize: 11 }}>No tags</span>}
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-label">
            <span>Hired / Placed</span>
            <span className="modal-section-count">{hired.length} / {j.total}</span>
          </div>
          <div>
            {hired.length
              ? hired.map((a, idx) => (
                  <div className="hired-card" key={idx} style={{ borderColor: colorFor(idx), background: softFor(idx) }}>
                    <div className="hired-avatar" style={{ background: colorFor(idx) }}>{initials(a.name)}</div>
                    <div className="hired-info">
                      <div className="hired-name">{a.name}</div>
                      <div className="hired-meta">Applied {a.applied}</div>
                    </div>
                    <div className="hired-score" style={{ color: colorFor(idx) }}>{a.score}</div>
                  </div>
                ))
              : <div className="empty-note">No one has been hired for this role yet.</div>}
          </div>
        </div>

        <div className="modal-section">
          <div className="modal-section-label">Applicant Pipeline</div>
          <table className="modal-table">
            <tbody>
              {pipeline.length ? (
                <>
                  <tr><th>Applicant</th><th>AI Score</th><th>Status</th><th>Applied</th></tr>
                  {pipeline.map((a, idx) => (
                    <tr key={idx}>
                      <td><div className="modal-name-cell"><span className="modal-app-avatar">{initials(a.name)}</span>{a.name}</div></td>
                      <td><span className={`modal-score ${scoreClass(a.score)}`}>{a.score}</span></td>
                      <td><span className={`modal-pill ${pillClass(a.status)}`}>{pillLabel(a.status)}</span></td>
                      <td>{a.applied}</td>
                    </tr>
                  ))}
                </>
              ) : (
                <tr><td className="empty-note">No one else currently in the pipeline.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}