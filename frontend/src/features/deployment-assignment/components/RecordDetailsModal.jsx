import {
  complianceReadiness,
  PRE_DEPLOYMENT_ITEMS,
  renderStageActionsText,
  STAGE_INDEX,
  STATUS_META,
  stageToStatus,
  TRACK_NODES,
} from '../services/DeploymentAssignmentService';

function StageTrack({ deployment }) {
  const curIdx = STAGE_INDEX[deployment.stage] ?? 0;
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      {TRACK_NODES.map((node, idx) => {
        const isDone = idx < curIdx;
        const isCurrent = idx === curIdx;
        const bg = isDone ? 'var(--green)' : isCurrent ? 'var(--primary)' : 'var(--bg)';
        const color = isDone || isCurrent ? '#fff' : 'var(--muted-fg)';
        const border = isCurrent ? '2px solid var(--primary)' : '1px solid var(--border)';

        return (
          <div key={node.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textAlign: 'center' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: bg, color, border, fontSize: 9.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDone ? '✓' : idx + 1}
            </div>
            <div style={{ fontSize: 8.5, fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--text)' : 'var(--muted-fg)', lineHeight: 1.2 }}>
              {node.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RecordDetailsModal({
  deployment,
  open,
  onClose,
  onOpenCompliance,
  onOpenSlip,
  onAdvanceStage,
}) {
  if (!open || !deployment) return null;

  const status = stageToStatus(deployment.stage);
  const meta = STATUS_META[status];
  const read = complianceReadiness(deployment);
  const { note, action } = renderStageActionsText(deployment);
  const checklist = deployment.compliance || {};
  const history = deployment.history || [];
  const pre = deployment.preEmployment || {};

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 860,
          maxHeight: '92vh',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ padding: '18px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {deployment.employee.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {deployment.employee}
                <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, background: meta.soft, padding: '2px 8px', borderRadius: 10, border: `1px solid ${meta.color}` }}>
                  {meta.label}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                {deployment.position} &nbsp;·&nbsp; {deployment.client} ({deployment.id})
              </div>
            </div>
          </div>

          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* BODY SCROLL */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* DEPLOYMENT STAGE TRACKER */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 8 }}>
              Deployment Stage &amp; Workflow:
            </div>
            <StageTrack deployment={deployment} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-soft)', fontSize: 12 }}>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{note}</span>
              {action && (
                <button
                  type="button"
                  className="btn primary"
                  style={{ padding: '5px 12px', fontSize: 11, fontWeight: 800 }}
                  onClick={() => onAdvanceStage(deployment.id, action.next)}
                >
                  {action.label} →
                </button>
              )}
            </div>
          </div>

          {/* TWO-COLUMN: ASSIGNMENT DETAILS & HR PRE-EMPLOYMENT DOSSIER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* SITE FACILITY & SUPERVISOR */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 10 }}>
                🏢 Assigned Site &amp; Deployment Facility:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div><span style={{ color: 'var(--muted-fg)' }}>Client Company:</span> <b>{deployment.client}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Job Order Ref:</span> <b>{deployment.jobOrderRef}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Assigned Position:</span> <b>{deployment.position}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Deployment Facility:</span> <b>{deployment.site}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Assigned Shift:</span> <b>{deployment.shift || 'Regular Day Shift'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Site Supervisor:</span> <b>{deployment.supervisor}</b> ({deployment.supervisorContact})</div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Deployment Term:</span> <b>{deployment.start} → {deployment.end}</b></div>
              </div>
            </div>

            {/* HR PRE-EMPLOYMENT & STATUTORY DOSSIER (FROM RECRUITMENT) */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase', marginBottom: 10 }}>
                📋 HR Pre-Employment Dossier (From Recruitment):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12 }}>
                <div><span style={{ color: 'var(--muted-fg)' }}>Medical Diagnostic:</span> <b>{pre.medicalClinic || 'HealthHub Diagnostics'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Fit-to-Work Clearance:</span> <b style={{ color: 'var(--green)' }}>✓ {pre.fitToWork || 'Class A - Fit for Duty'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>10-Panel Drug Test:</span> <b style={{ color: 'var(--green)' }}>✓ {pre.drugTestResult || 'Negative'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Mandated Statutory IDs:</span> <b>SSS: {pre.sss || '—'} · TIN: {pre.tin || '—'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>PhilHealth / HDMF:</span> <b>PH: {pre.philhealth || '—'} · Pag-IBIG: {pre.pagibig || '—'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>Contract Execution:</span> <b>Signed on {pre.contractSignedDate || deployment.start}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>PPE Gear Issued:</span> <b>{pre.ppeGear || 'Standard Client PPE Uniform'}</b></div>
                <div><span style={{ color: 'var(--muted-fg)' }}>ATM Payroll Endorsement:</span> <b>{pre.bankEndorsement || 'BDO Endorsement Ref'}</b></div>
              </div>
            </div>
          </div>

          {/* 6-POINT MANDATORY COMPLIANCE CHECKLIST */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>
                6-Point Pre-Deployment Verification (DOLE DO 174):
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 800, color: read.isReady ? 'var(--green)' : 'var(--purple)' }}>
                {read.count}/6 Items Verified ({read.percent}%)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11.5 }}>
              {PRE_DEPLOYMENT_ITEMS.map((item) => {
                const isChecked = Boolean(checklist[item.key]);
                return (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6, color: isChecked ? 'var(--text)' : 'var(--muted-fg)' }}>
                    <span style={{ color: isChecked ? 'var(--green)' : 'var(--muted-fg)', fontWeight: 800 }}>
                      {isChecked ? '✓' : '○'}
                    </span>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn"
                style={{ fontSize: 11, fontWeight: 700 }}
                onClick={() => {
                  onClose();
                  onOpenCompliance(deployment.id);
                }}
              >
                Edit Compliance Checklist
              </button>
              <button
                type="button"
                className="btn"
                style={{ fontSize: 11, fontWeight: 700 }}
                onClick={() => {
                  onClose();
                  onOpenSlip(deployment.id);
                }}
              >
                View Official Deployment Slip &amp; Pass
              </button>
            </div>
          </div>

          {/* AUDIT LOG */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 8 }}>
              Deployment Milestone Audit Log:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5 }}>
              {history.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, color: 'var(--muted-fg)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)', width: 90 }}>{h.date}:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{h.event}</span>
                  <span>— {h.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '14px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn primary" onClick={onClose} style={{ fontSize: 12, fontWeight: 700 }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
