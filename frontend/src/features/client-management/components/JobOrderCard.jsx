import CardIcon from './CardIcon';
import { initials, refCode } from '../utils/clientDisplay';

export default function JobOrderCard({ client, job, jobIndex, onOpen }) {
  const j = job;
  const pct = Math.round((j.filled / j.total) * 100);
  const badgeLabel = j.badge ? j.badge.charAt(0).toUpperCase() + j.badge.slice(1) : 'Open';
  const hiredList = (j.applicants || []).filter((a) => a.status === 'hired');
  const stackShown = hiredList.slice(0, 4);
  const extra = Math.max(hiredList.length - 4, 0);
  const badgeClass = j.badge || 'open';

  return (
    <div className="jo-card" onClick={() => onOpen(jobIndex)}>
      <div className="jo-card-header">
        <div className="jo-card-title-group">
          <div className="jo-icon">
            <CardIcon name={client.cardIcon} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="jo-title">{j.title}</div>
            <div className="jo-ref">{refCode(client.name, jobIndex)}</div>
          </div>
        </div>
        <span className={`jo-badge badge-${badgeClass}`}>
          <span className="dot"></span>{badgeLabel}
        </span>
      </div>

      <div className="jo-card-progress">
        <div className="jo-progress-top">
          <span className="jo-progress-label">Fulfillment Progress</span>
          <span className="jo-progress-nums"><b>{j.filled}</b> / {j.total} filled ({pct}%)</span>
        </div>
        <div className="jo-progress-track">
          <div className="jo-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="jo-meta-grid">
        <div className="jo-meta-item">
          <div className="jo-meta-label">Type</div>
          <div className="jo-meta-value">{j.type || '—'}</div>
        </div>
        <div className="jo-meta-item">
          <div className="jo-meta-label">Deadline</div>
          <div className="jo-meta-value">{j.deadline || '—'}</div>
        </div>
        <div className="jo-meta-item">
          <div className="jo-meta-label">Rate</div>
          <div className="jo-meta-value">{j.rate || '—'}</div>
        </div>
      </div>

      <div className="jo-card-foot">
        <div className="jo-avatar-stack">
          {stackShown.map((a, idx) => (
            <div className="jo-stack-avatar" key={idx}>{initials(a.name)}</div>
          ))}
          {extra > 0 && <div className="jo-stack-more">+{extra}</div>}
          {stackShown.length === 0 && <span className="jo-no-hires">No hires yet</span>}
        </div>
        <div className="jo-view-btn">
          <span>Details</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </div>
      </div>
    </div>
  );
}