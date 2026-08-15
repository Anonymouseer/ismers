import { useState, useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

export default function BankEndorsementModal({ candidate, job, onClose, onEndorsed, readOnly = false }) {
  const [selectedBank, setSelectedBank] = useState('BDO Unibank - QC Corporate Banking Center');
  const [accountType, setAccountType] = useState('Corporate Payroll Savings Account (Zero Maintaining Balance)');
  const [dispatched, setDispatched] = useState(false);

  const refCode = `ATM-ENDO-2026-${(candidate?.regId || candidate?.id || '001').replace(/\D/g, '').padStart(4, '0')}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDispatch = () => {
    setDispatched(true);
    if (onEndorsed) {
      onEndorsed({
        bankName: selectedBank,
        accountType,
        refCode,
        issueDate,
        status: 'Bank Endorsement Issued',
      });
    }
    setTimeout(() => setDispatched(false), 3500);
  };

  return (
    <div className="modal-overlay open" style={{ zIndex: 1200 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '750px' }}>
        {/* MODAL HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">Corporate Payroll ATM Endorsement Letter</div>
            <div className="modal-jo-sub">Official Bank Endorsement for Payroll ATM Account Opening &middot; {refCode}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {dispatched && (
          <div style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)', padding: '10px 18px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Payroll ATM Endorsement Letter dispatched to candidate via SMS/Email and logged in 201 file.
          </div>
        )}

        <div className="modal-scroll" style={{ padding: '20px' }}>
          {/* CONTROLS */}
          {!readOnly ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Designated Partner Bank</label>
                <select
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="BDO Unibank - QC Corporate Banking Center">BDO Unibank - QC Corporate Banking Center</option>
                  <option value="Bank of the Philippine Islands (BPI) - Ayala Hub">Bank of the Philippine Islands (BPI) - Ayala Hub</option>
                  <option value="UnionBank of the Philippines - Corporate Digibank">UnionBank of the Philippines - Corporate Digibank</option>
                  <option value="Metrobank - Port Area Branch">Metrobank - Port Area Branch</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Account Structure</label>
                <select
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                >
                  <option value="Corporate Payroll Savings Account (Zero Maintaining Balance)">Corporate Payroll Savings Account (Zero Maintaining Balance)</option>
                  <option value="Cash Card (Instant Issuance)">Cash Card (Instant Issuance)</option>
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px', background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Designated Bank</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>{selectedBank}</div>
              </div>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Account Type</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--green, #149e6e)', marginTop: '2px' }}>{accountType}</div>
              </div>
            </div>
          )}

          {/* OFFICIAL LETTER CONTAINER (PRINTABLE) */}
          <div className="rs-printable-bank" style={{ background: '#ffffff', color: '#111827', padding: '28px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: '38px', height: '38px' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>PRIMEPOWER MANPOWER SERVICES</div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'system-ui, sans-serif' }}>CORPORATE TREASURY &amp; PAYROLL DIVISION</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#007dcc' }}>{refCode}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Date: <strong>{issueDate}</strong></div>
              </div>
            </div>

            <div style={{ fontSize: '12px', marginBottom: '14px' }}>
              <strong>TO: THE BRANCH MANAGER</strong><br />
              <strong>{selectedBank.toUpperCase()}</strong>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '14px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
              SUBJECT: ENDORSEMENT FOR CORPORATE PAYROLL ATM ACCOUNT OPENING
            </div>

            <p style={{ fontSize: '12px', textAlign: 'justify', marginBottom: '12px' }}>
              Dear Sir / Madam:
            </p>
            <p style={{ fontSize: '12px', textAlign: 'justify', marginBottom: '12px' }}>
              This is to officially endorse our newly hired employee, <strong>{candidate.name.toUpperCase()}</strong>, who has been deployed as <strong>{candidate.position || job?.title || candidate.jobTitle || 'Operations Associate'}</strong> under PRIMEPOWER Corporate Payroll Account No. <strong>PPM-PAYROLL-CORP-2026</strong>.
            </p>
            <p style={{ fontSize: '12px', textAlign: 'justify', marginBottom: '14px' }}>
              Kindly assist the aforementioned employee in the processing and issuance of their <strong>{accountType}</strong>. All standard company employment documents and valid IDs have been pre-verified by our HR department.
            </p>

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>MARIA CECILIA DEL ROSARIO</div>
                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'system-ui, sans-serif' }}>Head of Payroll &amp; Treasury Operations &bull; PRIMEPOWER</div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Valid for 30 days from issuance</div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#16a34a' }}>✓ Authorized Corporate Seal</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ padding: '14px 20px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            type="button"
            className="rs-stage-btn"
            onClick={handlePrint}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Bank Letter
          </button>

          {!readOnly ? (
            <button
              type="button"
              className="rs-stage-btn primary"
              style={{ background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' }}
              onClick={handleDispatch}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Issue &amp; Send to Candidate
            </button>
          ) : (
            <button
              type="button"
              className="rs-stage-btn primary"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

