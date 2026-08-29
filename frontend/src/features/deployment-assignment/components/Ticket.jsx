import { attendanceRate, countdownLabel, STATUS_META, stageToStatus } from '../services/DeploymentAssignmentService';
import PersonAvatar from '../../../components/common/PersonAvatar';

export default function Ticket({ deployment, onOpen }) {
  const status = stageToStatus(deployment.stage);
  const meta = STATUS_META[status];
  const rate = attendanceRate(deployment);
  const cd = countdownLabel(deployment.end);

  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 16,
        boxShadow: 'var(--shadow-xs)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onClick={() => onOpen(deployment.id)}
    >
      {/* CARD HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PersonAvatar
            name={deployment.employee}
            size="sm"
            variant="blue"
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{deployment.employee}</div>
            <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{deployment.position}</div>
          </div>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: 'var(--muted-fg)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border-soft)' }}>
          {deployment.id}
        </span>
      </div>

      {/* CLIENT & SITE BADGES */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '9px 11px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Client Account</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>{deployment.client}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Site Location</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{deployment.site}</span>
        </div>
      </div>

      {/* ATTENDANCE RATE PROGRESS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 700 }}>
          <span style={{ color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Attendance Rate</span>
          <span style={{ color: 'var(--text)' }}>{rate}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
          <div style={{ width: `${rate}%`, height: '100%', background: meta.color, borderRadius: 4 }}></div>
        </div>
      </div>

      {/* CARD FOOTER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-soft)', marginTop: 2 }}>
        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, background: cd.soft, color: cd.color }}>
          {cd.text}
        </span>
        <button
          className="btn"
          style={{ padding: '4px 10px', fontSize: 10.5, fontWeight: 700 }}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(deployment.id);
          }}
        >
          Manage Record
        </button>
      </div>
    </div>
  );
}
