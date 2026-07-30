import { STATUS_META, PRIORITY_META, countdownLabel, initials } from '../services/JobOrderManagementService';

export default function JobOrderTicket({ job, selectMode, isSelected, onOpen, onToggleSelect, onDragStart, onDragEnd }) {
  const meta = STATUS_META[job.status];
  const pr = PRIORITY_META[job.priority] || PRIORITY_META.normal;
  const pct = Math.round((job.filled / job.total) * 100);
  const cd = countdownLabel(job.deadline);
  const hired = (job.applicants || []).filter((a) => a.status === 'hired').slice(0, 3);

  return (
    <div
      className={`ticket${selectMode ? ' select-mode' : ''}${isSelected ? ' selected' : ''}`}
      onClick={() => (selectMode ? onToggleSelect(job.ref) : onOpen(job.ref))}
      draggable={!selectMode}
      onDragStart={(e) => onDragStart(e, job.ref)}
      onDragEnd={onDragEnd}
    >
      {selectMode && <div className="ticket-check">{isSelected ? '✓' : ''}</div>}
      <div className="ticket-priority">
        <span className="priority-badge" style={{ background: `${pr.color}22`, color: pr.color }}>{pr.label}</span>
      </div>
      <div className="ticket-stub" style={{ '--stub-soft': meta.soft, '--stub-color': meta.color }}>
        <span className="ticket-dot" />
        <span className="ticket-refcode">{job.ref}</span>
      </div>
      <div className="ticket-body">
        <div className="ticket-title">{job.title}</div>
        <div className="ticket-client">{job.client}</div>
        <div className="ticket-meta-row"><span>loc</span><span>{job.location}</span></div>
        <div className="ticket-progress-row">
          <div className="ticket-progress-track">
            <div className="ticket-progress-fill" style={{ width: `${pct}%`, background: meta.color }} />
          </div>
          <span className="ticket-progress-num">{job.filled}/{job.total}</span>
        </div>
        <div className="ticket-foot">
          <span className="countdown-chip" style={{ background: cd.soft, color: cd.color }}>{cd.text}</span>
          <div className="ticket-avatars">
            {hired.map((a) => <div className="ticket-avatar" key={a.name}>{initials(a.name)}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}