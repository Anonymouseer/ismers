import CardIcon from './CardIcon';
import { softForColor, initials, refCode } from '../utils/clientDisplay';

export default function JobOrderCard({ client, job, jobIndex, onOpen }) {
  const j = job;
  const pct = Math.round((j.filled / j.total) * 100);
  const badgeLabel = j.badge.charAt(0).toUpperCase() + j.badge.slice(1);
  const hiredList = (j.applicants || []).filter((a) => a.status === 'hired');
  const stackShown = hiredList.slice(0, 4);
  const extra = Math.max(hiredList.length - 4, 0);

  const r = 16;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - pct / 100);

  return (
    <div
      className="jo-card"
      style={{ '--jo-accent': j.color, '--jo-tint': softForColor(j.color) }}
      onClick={() => onOpen(jobIndex)}
    >
      <div className="jo-card-body">
        <div className="jo-card-main">
          <div className="jo-watermark"><CardIcon name={client.cardIcon} /></div>

          <div className="jo-card-top">
            <div className="jo-icon" style={{ background: softForColor(j.color), color: j.color }}>
              <CardIcon name={client.cardIcon} />
            </div>
            <div className="jo-title-block">
              <div className="jo-title">{j.title}</div>
              <div className="jo-ref">{refCode(client.name, jobIndex)}</div>
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
        </div>

        <div className="jo-card-stub">
          <span className="jo-stub-badge" style={{ background: softForColor(j.color), color: j.color }}>{badgeLabel}</span>

          <div className="jo-ring">
            <svg viewBox="0 0 40 40" width="56" height="56">
              <circle className="jo-ring-track" cx="20" cy="20" r={r} />
              <circle
                className="jo-ring-fill"
                cx="20" cy="20" r={r}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="jo-ring-pct">{pct}%</div>
          </div>

          <div className="jo-stub-frac"><b>{j.filled}</b>/{j.total} filled</div>
        </div>
      </div>

      <div className="jo-card-foot">
        <div className="jo-avatar-stack">
          {stackShown.map((a, idx) => (
            <div className="jo-stack-avatar" key={idx}>{initials(a.name)}</div>
          ))}
          {extra > 0 && <div className="jo-stack-more">+{extra}</div>}
          {stackShown.length === 0 && <span style={{ fontSize: 10, color: 'var(--muted)' }}>No hires yet</span>}
        </div>
        <div className="jo-view-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </div>
      </div>
    </div>
  );
}