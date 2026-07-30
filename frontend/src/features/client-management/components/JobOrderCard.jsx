import CardIcon from './CardIcon';
import { softForColor, initials, refCode } from '../utils/clientDisplay';

export default function JobOrderCard({ client, job, jobIndex, onOpen }) {
  const j = job;
  const pct = Math.round((j.filled / j.total) * 100);
  const badgeLabel = j.badge.charAt(0).toUpperCase() + j.badge.slice(1);
  const hiredList = (j.applicants || []).filter((a) => a.status === 'hired');
  const stackShown = hiredList.slice(0, 4);
  const extra = Math.max(hiredList.length - 4, 0);

  return (
    <div className="jo-card" onClick={() => onOpen(jobIndex)}>
      <div className="jo-card-top">
        <div className="jo-icon" style={{ background: softForColor(j.color), color: j.color }}>
          <CardIcon name={client.cardIcon} />
        </div>
        <div className="jo-title-block">
          <div className="jo-title">{j.title}</div>
          <div className="jo-ref">{refCode(client.name, jobIndex)}</div>
        </div>
        <span className="jo-badge" style={{ background: softForColor(j.color), color: j.color }}>• {badgeLabel}</span>
      </div>
      <div className="jo-fields">
        <div className="jo-field"><span className="jo-field-label">Type</span><span className="jo-field-dots"></span><span className="jo-field-value">{j.type || '—'}</span></div>
        <div className="jo-field"><span className="jo-field-label">Deadline</span><span className="jo-field-dots"></span><span className="jo-field-value">{j.deadline || '—'}</span></div>
        <div className="jo-field"><span className="jo-field-label">Rate</span><span className="jo-field-dots"></span><span className="jo-field-value">{j.rate || '—'}</span></div>
      </div>
      <div className="jo-progress-row">
        <div className="jo-progress-label">Filled</div>
        <div className="jo-progress-track"><div className="jo-progress-fill" style={{ width: `${pct}%`, color: j.color }}></div></div>
        <div className="num">{j.filled}/{j.total}</div>
      </div>
      <div className="jo-foot">
        <div className="jo-avatar-stack">
          {stackShown.map((a, idx) => (
            <div className="jo-stack-avatar" key={idx}>{initials(a.name)}</div>
          ))}
          {extra > 0 && <div className="jo-stack-more">+{extra}</div>}
          {stackShown.length === 0 && <span style={{ fontSize: 10, color: 'var(--muted)' }}>No hires yet</span>}
        </div>
        <div className="jo-view-link">
          View details <svg className="icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </div>
      </div>
    </div>
  );
}