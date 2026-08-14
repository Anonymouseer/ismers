import { useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import { initials } from '../utils/recruitmentUtils';

export default function EmployeeIdModal({ candidate, job, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const employeeId = candidate?.deploymentDetails?.employeeId || `PPM-EMP-2026-${(candidate?.regId || candidate?.id || '001').replace(/\D/g, '').padStart(4, '0')}`;
  const sss = candidate?.statutoryNumbers?.sss || '34-XXXXXXX-1';
  const tin = candidate?.statutoryNumbers?.tin || 'XXX-XXX-XXX-000';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '650px' }}>
        {/* HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <line x1="15" y1="8" x2="17" y2="8" />
              <line x1="15" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">Company ID &amp; Onsite Security Access Pass</div>
            <div className="modal-jo-sub">Official DOLE DO-174 Personnel Security Badge &middot; {employeeId}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="modal-scroll" style={{ padding: '24px' }}>
          {/* 2-SIDE ID CARD PREVIEW (FRONT & BACK) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', justifyContent: 'center' }}>
            {/* FRONT SIDE */}
            <div style={{ background: 'linear-gradient(135deg, #007dcc 0%, #004b7d 100%)', color: '#ffffff', borderRadius: '12px', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              {/* LANYARD HOLE */}
              <div style={{ width: '36px', height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginBottom: '12px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: '28px', height: '28px', background: '#fff', borderRadius: '6px', padding: '2px' }} />
                <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.5px' }}>PRIMEPOWER MANPOWER</span>
              </div>

              {/* PHOTO AVATAR */}
              <div style={{ width: '74px', height: '74px', borderRadius: '50%', background: '#ffffff', color: '#007dcc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, border: '3px solid rgba(255,255,255,0.8)', marginBottom: '10px' }}>
                {initials(candidate.name)}
              </div>

              <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {candidate.name}
              </div>
              <div style={{ fontSize: '11px', color: '#e0f2fe', fontWeight: 600, marginTop: '2px' }}>
                {candidate.position || job?.title || candidate.jobTitle || 'Operations Associate'}
              </div>

              <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.25)', padding: '6px 14px', borderRadius: '6px', width: '100%' }}>
                <div style={{ fontSize: '9px', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>Employee ID Number</div>
                <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '1px', fontFamily: 'monospace' }}>{employeeId}</div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '9px', color: '#bfdbfe' }}>
                Assigned: <strong>{job?.client || candidate.client || 'Client Operations'}</strong>
              </div>
            </div>

            {/* BACK SIDE */}
            <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: '12px', padding: '16px', border: '2px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '10px' }}>
              {/* LANYARD HOLE */}
              <div style={{ width: '36px', height: '8px', background: '#cbd5e1', borderRadius: '4px', margin: '0 auto 10px' }} />

              <div style={{ textAlign: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: 900, color: '#0f172a' }}>PRIMEPOWER MANPOWER SERVICES INC.</div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>DOLE DO-174 LICENSE NO. NCR-QC-DO174-2024-0891</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong style={{ color: '#475569' }}>SSS NO:</strong> {sss}</div>
                <div><strong style={{ color: '#475569' }}>TIN NO:</strong> {tin}</div>
                <div><strong style={{ color: '#475569' }}>VALIDITY:</strong> 1 Year from Deployment</div>
                <div><strong style={{ color: '#475569' }}>EMERGENCY:</strong> HR Hotline (02) 8888-PPMI</div>
              </div>

              {/* QR & BARCODE */}
              <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <div style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '11px', fontWeight: 800 }}>
                  |||||| |||| |||||| |||
                </div>
                <div style={{ fontSize: '8px', color: '#64748b', marginTop: '2px' }}>Site Access Pass &bull; {employeeId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '14px 20px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Ready for badge printer or laminator</span>
          <button
            type="button"
            className="rs-stage-btn primary"
            onClick={handlePrint}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Employee ID Card
          </button>
        </div>
      </div>
    </div>
  );
}
