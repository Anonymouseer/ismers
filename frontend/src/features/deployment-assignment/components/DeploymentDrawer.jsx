import { useState } from 'react';
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
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      {TRACK_NODES.map((node, idx) => {
        let isDone = idx < curIdx;
        let isCurrent = idx === curIdx;
        let bg = isDone ? 'var(--green)' : isCurrent ? 'var(--primary)' : 'var(--bg)';
        let color = isDone || isCurrent ? '#fff' : 'var(--muted-fg)';
        let border = isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)';

        return (
          <div key={node.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: bg, color, border, fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDone ? '✓' : idx + 1}
            </div>
            <div style={{ fontSize: 9.5, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--text)' : 'var(--muted-fg)', lineHeight: 1.25 }}>
              {node.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LogList({ deployment }) {
  if (!deployment.logs.length) {
    return <div style={{ fontSize: 11.5, color: 'var(--muted-fg)', fontStyle: 'italic', padding: '8px 0' }}>No attendance entries logged yet.</div>;
  }
  const colorMap = { present: 'var(--green)', late: 'var(--amber)', absent: 'var(--red)' };
  const bgMap = { present: 'var(--green-soft)', late: 'var(--amber-soft)', absent: 'var(--red-soft)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 130, overflowY: 'auto' }}>
      {deployment.logs.map((l, i) => (
        <div
          key={i}
          style={{ padding: '8px 12px', borderRadius: 8, background: bgMap[l.type], border: `1px solid ${colorMap[l.type]}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}
        >
          <span style={{ fontWeight: 700, color: 'var(--text)' }}>{l.note}</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontFamily: 'monospace' }}>{l.date}</span>
        </div>
      ))}
    </div>
  );
}

export default function DeploymentDrawer({ deployment, open, onClose, onAdvanceStage, onLogEntry }) {
  const [showSlipModal, setShowSlipModal] = useState(false);

  if (!open || !deployment) return null;

  const status = stageToStatus(deployment.stage);
  const meta = STATUS_META[status];
  const rate = attendanceRate(deployment);
  const cd = countdownLabel(deployment.end);
  const { note, action } = renderStageActionsText(deployment);

  return (
    <>
      {/* PERFECTLY CENTERED LANDSCAPE EXECUTIVE MODAL OVERLAY */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '100%',
            maxWidth: 940,
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* MODAL HEADER BAR WITH GENEROUS SPACING */}
          <div style={{ padding: '18px 28px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {deployment.employee.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {deployment.employee}
                  <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, background: meta.soft, padding: '3px 10px', borderRadius: 12, border: `1px solid ${meta.color}` }}>
                    {meta.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 3 }}>
                  {deployment.position} &nbsp;·&nbsp; <b style={{ color: 'var(--primary)' }}>{deployment.client}</b>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 11.5, fontFamily: 'monospace', fontWeight: 700, background: 'var(--panel)', padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
                {deployment.id}
              </span>
              <button className="sheet-close" onClick={onClose} style={{ position: 'static' }}>
                <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* MODAL BODY: SPACIOUS 2-COLUMN LANDSCAPE GRID */}
          <div style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* LEFT LANDSCAPE COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Assignment &amp; Contract Details
              </div>

              {/* CONTRACT DETAILS CARD */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>Client Account:</span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{deployment.client}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>Deployment Site:</span>
                  <span style={{ fontWeight: 700 }}>{deployment.site}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>Job Order Ref:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{deployment.jobOrderRef}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>Contract Term:</span>
                  <span style={{ fontWeight: 700 }}>{deployment.start} → {deployment.end}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginTop: 2, borderTop: '1px dashed var(--border-soft)' }}>
                  <span style={{ color: 'var(--muted-fg)' }}>Renewal Status:</span>
                  <span style={{ fontSize: 11, fontWeight: 800, background: cd.soft, color: cd.color, padding: '3px 10px', borderRadius: 12 }}>
                    {cd.text}
                  </span>
                </div>
              </div>

              {/* ATTENDANCE & PERFORMANCE CARD */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800 }}>
                  <span style={{ color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Attendance Rate</span>
                  <span style={{ color: meta.color }}>{rate}% ({deployment.attendance.present || 0} Present, {deployment.attendance.late || 0} Late)</span>
                </div>
                <div style={{ height: 7, borderRadius: 4, background: 'var(--panel)', overflow: 'hidden' }}>
                  <div style={{ width: `${rate}%`, height: '100%', background: meta.color, borderRadius: 4 }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, marginTop: 2 }}>
                  <span style={{ color: 'var(--muted-fg)' }}>Performance Rating Score:</span>
                  <span style={{ fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '3px 10px', borderRadius: 6 }}>
                    {deployment.score > 0 ? `${deployment.score} / 100` : 'Evaluating'}
                  </span>
                </div>
              </div>

              {/* OFFICIAL DEPLOYMENT PASS BUTTON */}
              <button
                className="btn primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 12, fontWeight: 700, marginTop: 6 }}
                onClick={() => setShowSlipModal(true)}
              >
                Generate Official Deployment Pass &amp; Slip
              </button>
            </div>

            {/* RIGHT LANDSCAPE COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Lifecycle Workflow &amp; Attendance Logs
              </div>

              {/* STAGE TRACKER CARD */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '16px 18px' }}>
                <StageTrack deployment={deployment} />
                <div style={{ fontSize: 11.5, color: 'var(--text)', background: 'var(--panel)', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-soft)', marginBottom: 12 }}>
                  {note}
                </div>
                {action && (
                  <button
                    className={`stage-btn ${action.kind}`}
                    style={{ width: '100%', padding: '9px', fontSize: 11.5, fontWeight: 700 }}
                    onClick={() => onAdvanceStage(deployment.id, action.next)}
                  >
                    {action.label}
                  </button>
                )}
              </div>

              {/* ATTENDANCE LOG CARD */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5, fontWeight: 800 }}>
                  <span style={{ color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Recent Attendance Logs</span>
                  <span style={{ background: 'var(--panel)', padding: '3px 10px', borderRadius: 12, fontSize: 10.5 }}>{deployment.logs.length} Entries</span>
                </div>

                <LogList deployment={deployment} />

                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button className="stage-btn" style={{ flex: 1, padding: '7px' }} onClick={() => onLogEntry(deployment.id, 'present')}>+ Present</button>
                  <button className="stage-btn" style={{ flex: 1, padding: '7px' }} onClick={() => onLogEntry(deployment.id, 'late')}>+ Late</button>
                  <button className="stage-btn stop" style={{ flex: 1, padding: '7px' }} onClick={() => onLogEntry(deployment.id, 'absent')}>+ Absent</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT PASS MODAL */}
      {showSlipModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 540, padding: 24, boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--logo-primepower)', letterSpacing: 0.8 }}>PRIMEPOWER MANPOWER</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>OFFICIAL DEPLOYMENT SLIP &amp; PASS</div>
              </div>
              <button className="sheet-close" onClick={() => setShowSlipModal(false)} style={{ position: 'static' }}>✕</button>
            </div>

            <div style={{ background: 'var(--bg)', border: '1px dashed var(--border)', borderRadius: 12, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Employee Name</div><div style={{ fontSize: 13, fontWeight: 700 }}>{deployment.employee}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Client Account</div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{deployment.client}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Position</div><div style={{ fontSize: 12, fontWeight: 600 }}>{deployment.position}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Deployment Ref ID</div><div style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>{deployment.id}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Deployment Site</div><div style={{ fontSize: 12 }}>{deployment.site}</div></div>
              <div><div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Contract Validity</div><div style={{ fontSize: 12 }}>{deployment.start} — {deployment.end}</div></div>
            </div>

            <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontStyle: 'italic', marginBottom: 20 }}>
              * This official deployment slip authorizes the employee named above to report to the client site. Pre-employment requirements and contract agreement have been verified by PRIMEPOWER HR Department.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowSlipModal(false)}>Close</button>
              <button className="btn primary" onClick={() => window.print()}>Print Deployment Slip</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
