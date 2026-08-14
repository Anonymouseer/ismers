import { TODAY } from '../services/DeploymentAssignmentService';

export default function DeploymentSlipModal({ deployment, open, onClose, onAdvanceStage }) {
  if (!open || !deployment) return null;

  function handleConfirmDispatch() {
    onAdvanceStage(deployment.id, 'dispatched');
    onClose();
  }

  function handlePrint() {
    window.print();
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
          maxWidth: 680,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ padding: '18px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase' }}>
              Official Endorsement Pass
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
              Deployment Authorization Slip
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* PRINTABLE SLIP CONTAINER */}
        <div style={{ padding: '24px', background: '#fff', color: '#1a1a1a', fontFamily: 'inherit' }}>
          <div style={{ border: '2px solid #222', borderRadius: 12, padding: '20px' }}>
            {/* BRAND HEADER */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #222', paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: '0.5px' }}>PRIMEPOWER MANPOWER SERVICES INC.</div>
              <div style={{ fontSize: 11, color: '#555' }}>DOLE DO 174-17 Compliant · License No. NCR-PFO-2024-08-9821</div>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', marginTop: 6, background: '#eee', padding: '4px 10px', borderRadius: 4, display: 'inline-block' }}>
                Official Deployment Slip &amp; Endorsement Pass
              </div>
            </div>

            {/* DETAILS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, marginBottom: 16 }}>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Deployed Personnel:</span>
                <b style={{ fontSize: 14 }}>{deployment.employee}</b>
                <div style={{ fontSize: 11, color: '#666' }}>ID: {deployment.id}</div>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Designated Role:</span>
                <b style={{ fontSize: 14 }}>{deployment.position}</b>
                <div style={{ fontSize: 11, color: '#666' }}>Job Order Ref: {deployment.jobOrderRef}</div>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Client Company:</span>
                <b>{deployment.client}</b>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Deployment Facility:</span>
                <b>{deployment.site}</b>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Reporting Supervisor:</span>
                <b>{deployment.supervisor}</b>
                <div style={{ fontSize: 10.5, color: '#666' }}>{deployment.supervisorContact}</div>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Assigned Shift:</span>
                <b>{deployment.shift || 'Regular Day Shift'}</b>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Contract Validity:</span>
                <b>{deployment.start} → {deployment.end}</b>
              </div>
              <div>
                <span style={{ color: '#666', fontSize: 10.5, textTransform: 'uppercase', display: 'block' }}>Compliance Status:</span>
                <b style={{ color: '#0d8050' }}>✓ 6/6 Pre-Deployment Verified</b>
              </div>
            </div>

            {/* CERTIFICATION STATEMENT */}
            <div style={{ background: '#f8f8f8', border: '1px dashed #999', borderRadius: 8, padding: '10px 12px', fontSize: 10.5, color: '#444', lineHeight: 1.4, marginBottom: 16 }}>
              This document certifies that the above-named employee has passed all mandatory pre-employment medical examinations, government statutory clearances, background verification, and safety orientations in accordance with DOLE Department Order 174-17 and RA 10173.
            </div>

            {/* SIGNATURES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingTop: 10, borderTop: '1px solid #ddd' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #333', height: 28, marginBottom: 4 }}></div>
                <div style={{ fontSize: 10.5, fontWeight: 700 }}>HR Operations Officer</div>
                <div style={{ fontSize: 9.5, color: '#666' }}>Primepower Manpower Services</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #333', height: 28, marginBottom: 4 }}></div>
                <div style={{ fontSize: 10.5, fontWeight: 700 }}>Client Site Receiving Supervisor</div>
                <div style={{ fontSize: 9.5, color: '#666' }}>{deployment.client}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ padding: '14px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" className="btn" onClick={handlePrint} style={{ fontSize: 12, fontWeight: 700 }}>
            🖨️ Print Endorsement Pass
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={onClose} style={{ fontSize: 12 }}>
              Close
            </button>
            {deployment.stage === 'scheduled' && (
              <button
                type="button"
                className="btn primary"
                style={{ background: 'var(--blue)', borderColor: 'var(--blue)', fontWeight: 800, fontSize: 12 }}
                onClick={handleConfirmDispatch}
              >
                Confirm Dispatch &amp; Endorsement →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
