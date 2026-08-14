import { complianceReadiness, PRE_DEPLOYMENT_ITEMS } from '../services/DeploymentAssignmentService';

export default function ComplianceModal({
  deployment,
  open,
  onClose,
  onToggleRequirement,
  onAdvanceStage,
}) {
  if (!open || !deployment) return null;

  const read = complianceReadiness(deployment);
  const checklist = deployment.compliance || {};

  function handleScheduleDispatch() {
    onAdvanceStage(deployment.id, 'scheduled');
    onClose();
  }

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
          maxWidth: 620,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ padding: '18px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>
              Pre-Deployment Legal Compliance (DOLE DO 174)
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
              {deployment.employee} — Verification Checklist
            </h3>
            <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
              {deployment.position} &nbsp;·&nbsp; {deployment.client} ({deployment.jobOrderRef})
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div style={{ padding: '16px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: read.isReady ? 'var(--green)' : 'var(--text)' }}>
              {read.isReady ? '✓ All 6/6 Requirements Verified & Compliant' : `Verification Readiness: ${read.count}/6 Items Verified`}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: read.isReady ? 'var(--green)' : 'var(--purple)' }}>
              {read.percent}%
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
            <div style={{ width: `${read.percent}%`, height: '100%', background: read.isReady ? 'var(--green)' : 'var(--purple)', borderRadius: 4, transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* CHECKLIST ITEMS */}
        <div style={{ padding: '16px 24px', maxHeight: '50vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRE_DEPLOYMENT_ITEMS.map((item, idx) => {
              const isChecked = Boolean(checklist[item.key]);
              return (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: isChecked ? 'var(--green-soft)' : 'var(--bg)',
                    border: `1px solid ${isChecked ? 'var(--green)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleRequirement(deployment.id, item.key)}
                    style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: isChecked ? 'var(--green)' : 'var(--text)' }}>
                      {idx + 1}. {item.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                      {item.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ padding: '14px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" className="btn" onClick={onClose} style={{ fontSize: 12, fontWeight: 700 }}>
            Close
          </button>

          {read.isReady ? (
            <button
              type="button"
              className="btn primary"
              style={{ background: 'var(--green)', borderColor: 'var(--green)', padding: '8px 18px', fontWeight: 800, fontSize: 12 }}
              onClick={handleScheduleDispatch}
            >
              ✓ Clear &amp; Schedule Deployment
            </button>
          ) : (
            <span style={{ fontSize: 11, color: 'var(--muted-fg)', fontStyle: 'italic' }}>
              Complete all 6 items to proceed to scheduling.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
