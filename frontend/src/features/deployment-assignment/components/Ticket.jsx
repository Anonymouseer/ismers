import { attendanceRate, countdownLabel, initials, STATUS_META, stageToStatus } from '../services/DeploymentAssignmentService';

export default function Ticket({ deployment, onOpen }) {
  const status = stageToStatus(deployment.stage);
  const meta = STATUS_META[status];
  const rate = attendanceRate(deployment);
  const cd = countdownLabel(deployment.end);

  return (
    <div className="ticket" onClick={() => onOpen(deployment.id)}>
      <div className="ticket-stub" style={{ '--stub-soft': meta.soft, '--stub-color': meta.color }}>
        <span className="ticket-dot"></span>
        <span className="ticket-refcode">{deployment.id}</span>
      </div>
      <div className="ticket-body">
        <div className="ticket-title">{deployment.employee}</div>
        <div className="ticket-client">{deployment.position} · {deployment.client}</div>
        <div className="ticket-meta-row"><span>site</span><span>{deployment.site}</span></div>
        <div className="ticket-progress-row">
          <div className="ticket-progress-track">
            <div className="ticket-progress-fill" style={{ width: `${rate}%`, background: meta.color }}></div>
          </div>
          <span className="ticket-progress-num">{rate}%</span>
        </div>
        <div className="ticket-foot">
          <span className="countdown-chip" style={{ background: cd.soft, color: cd.color }}>{cd.text}</span>
          <div className="ticket-avatars">
            <div className="ticket-avatar">{initials(deployment.employee)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
