import {
  attendanceRate,
  countdownLabel,
  renderStageActionsText,
  STAGE_INDEX,
  STATUS_META,
  stageToStatus,
  TRACK_NODES,
} from '../services/DeploymentAssignmentService';

function StageTrack({ deployment }) {
  const curIdx = STAGE_INDEX[deployment.stage];
  return (
    <div className="stage-track">
      {TRACK_NODES.map((node, idx) => {
        let cls = 'future';
        if (idx < curIdx) cls = 'done';
        else if (idx === curIdx) cls = 'current';
        return (
          <div className={`stage-step ${cls}`} key={node.id}>
            <div className="stage-dot">{cls === 'done' ? '✓' : ''}</div>
            <div><div className="stage-label">{node.label}</div></div>
          </div>
        );
      })}
    </div>
  );
}

function LogList({ deployment }) {
  if (!deployment.logs.length) {
    return <div className="empty-note">No attendance entries logged yet.</div>;
  }
  const iconMap = { present: '✓', late: '⏱', absent: '✕' };
  const colorMap = { present: 'var(--green)', late: 'var(--amber)', absent: 'var(--red)' };
  const bgMap = { present: 'var(--green-soft)', late: 'var(--amber-soft)', absent: 'var(--red-soft)' };
  return (
    <>
      {deployment.logs.map((l, i) => (
        <div
          className="hired-strip"
          key={i}
          style={{ borderColor: colorMap[l.type], background: bgMap[l.type] }}
        >
          <div className="av" style={{ background: colorMap[l.type] }}>{iconMap[l.type]}</div>
          <div className="info">
            <div className="nm">{l.note}</div>
            <div className="mt">{l.date}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function DeploymentDrawer({ deployment, open, onClose, onAdvanceStage, onLogEntry }) {
  if (!deployment) {
    return (
      <>
        <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose}></div>
        <div className={`drawer${open ? ' open' : ''}`}></div>
      </>
    );
  }

  const status = stageToStatus(deployment.stage);
  const meta = STATUS_META[status];
  const rate = attendanceRate(deployment);
  const { note, action } = renderStageActionsText(deployment);

  return (
    <>
      <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose}></div>
      <div className={`drawer${open ? ' open' : ''}`}>
        <div className="sheet-head">
          <button className="sheet-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <span className="stamp" style={{ color: meta.color }}>{meta.label}</span>
          <div className="sheet-eyebrow">{deployment.id} · deployment_assignment</div>
          <div className="sheet-title">{deployment.employee}</div>
          <div className="sheet-sub">{deployment.position} · {deployment.client}</div>
        </div>

        <div className="sheet-scroll">
          <div className="meta-grid">
            <div className="meta-row"><div className="k">Employee</div><div className="v">{deployment.employee}</div></div>
            <div className="meta-row"><div className="k">Client</div><div className="v">{deployment.client}</div></div>
            <div className="meta-row"><div className="k">Job Order</div><div className="v">{deployment.jobOrderRef} · {deployment.position}</div></div>
            <div className="meta-row"><div className="k">Site</div><div className="v">{deployment.site}</div></div>
            <div className="meta-row"><div className="k">Schedule</div><div className="v">{deployment.start} → {deployment.end} ({countdownLabel(deployment.end).text})</div></div>
          </div>

          <div className="fill-block">
            <div className="fill-block-top">
              <span>attendance_rate</span>
              <span>{rate}% ({deployment.attendance.present || 0} present, {deployment.attendance.late || 0} late, {deployment.attendance.absent || 0} absent)</span>
            </div>
            <div className="fill-block-track">
              <div className="fill-block-fill" style={{ width: `${rate}%`, background: meta.color }}></div>
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">Deployment Workflow</div>
            <StageTrack deployment={deployment} />
            <div className="stage-actions">
              <div className="stage-note">{note}</div>
              {action && (
                <div className="stage-btn-row">
                  <button
                    className={`stage-btn ${action.kind}`}
                    onClick={() => onAdvanceStage(deployment.id, action.next)}
                  >
                    {action.label}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span>Performance Score</span>
              <span className="sheet-count">{deployment.score > 0 ? `${deployment.score} / 100` : 'Not yet scored'}</span>
            </div>
            <div className="sheet-desc">
              {deployment.score > 0
                ? (deployment.score >= 80
                  ? 'Performing above expectations for this deployment.'
                  : 'Performing within acceptable range; keep monitoring.')
                : 'Performance scoring begins once monitoring is underway.'}
            </div>
          </div>

          <div className="sheet-section">
            <div className="sheet-label">
              <span>Attendance & Monitoring Log</span>
              <span className="sheet-count">{deployment.logs.length}</span>
            </div>
            <LogList deployment={deployment} />
            <div className="stage-btn-row" style={{ marginTop: 10 }}>
              <button className="stage-btn" onClick={() => onLogEntry(deployment.id, 'present')}>+ Present</button>
              <button className="stage-btn" onClick={() => onLogEntry(deployment.id, 'late')}>+ Late</button>
              <button className="stage-btn stop" onClick={() => onLogEntry(deployment.id, 'absent')}>+ Absent</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
