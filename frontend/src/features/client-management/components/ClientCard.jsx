import CardIcon from './CardIcon';
import { colorFor, softFor, isExpiringSoon, getCompanyId } from '../utils/clientDisplay';

export default function ClientCard({ client, index, selected, onSelect }) {
  const c = client;
  const statusLabel = c.status.charAt(0).toUpperCase() + c.status.slice(1);
  const expiringSoon = isExpiringSoon(c.renewal);

  return (
    <div
      className={`client-card${selected ? ' selected' : ''}${c.status === 'archived' ? ' is-archived' : ''}`}
      style={{ position: 'relative' }}
      onClick={() => onSelect(index)}
    >
      {expiringSoon && (
        <div className="cc-expiry-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          Expiring soon
        </div>
      )}
      <div className="cc-hover-actions">
        <div className="cc-hover-btn" title={`${c.cardTag} · ${c.cardBlurb}`}>
          <svg className="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="m4 5 8 7 8-7" /></svg>
        </div>
        <div className="cc-hover-btn">
          <svg className="icon" viewBox="0 0 24 24"><path d="M12 2l3 6.5 7 .8-5.2 4.8 1.4 6.9-6.2-3.6-6.2 3.6 1.4-6.9L2 9.3l7-.8Z" /></svg>
        </div>
      </div>
      <div className="cc-status-wrap">
        <div className="cc-avatar-ring" style={{ background: colorFor(index) }}>
          <div className="cc-avatar" style={{ color: colorFor(index) }}>
            <CardIcon name={c.cardIcon} />
          </div>
        </div>
        <div className={`cc-status-dot ${c.status}`} title={statusLabel}></div>
      </div>
      <div className="cc-id-tag">{getCompanyId(c, index)}</div>
      <div className="cc-name">{c.name}</div>
      <div className="cc-role">{c.industry}</div>
      <div className="cc-divider"></div>
      <div className="cc-stats-row">
        <div className="cc-stat-col">
          <div className="cc-stat-label">Manager</div>
          <div className="cc-stat-icon" style={{ background: softFor(index), color: colorFor(index) }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" /></svg>
          </div>
          <div className="cc-stat-val">{c.am.split(' ')[0]}</div>
        </div>
        <div className="cc-stat-col">
          <div className="cc-stat-label">Sector</div>
          <div className="cc-stat-icon" style={{ background: softFor(index), color: colorFor(index) }}>
            <CardIcon name={c.cardIcon} />
          </div>
          <div className="cc-stat-val">{c.cardTag.split(' · ')[0]}</div>
        </div>
        <div className="cc-stat-col">
          <div className="cc-stat-label">Budget</div>
          <div className="cc-stat-icon" style={{ background: softFor(index), color: colorFor(index) }}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 2v20" /><path d="M17 5.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" /></svg>
          </div>
          <div className={`cc-stat-val${c.revenueQ === '₱0' ? ' muted' : ''}`}>{c.revenueQ}</div>
        </div>
      </div>
      <button className="btn cc-view">
        View profile <svg className="icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>
  );
}