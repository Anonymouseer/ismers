import { useState, useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

export default function MedicalReferralModal({ candidate, job, onClose, onIssued }) {
  const [selectedClinic, setSelectedClinic] = useState('Hi-Precision Diagnostics - Quezon City Main Hub');
  const [packageType, setPackageType] = useState('Package A (Standard Pre-Employment + 10-Panel Drug Screen)');
  const [dispatched, setDispatched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const refCode = `REF-MED-2026-${(candidate.regId || candidate.id || '001').replace(/\D/g, '').padStart(4, '0')}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const validUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };

  const handleDispatch = () => {
    setDispatched(true);
    if (onIssued) {
      onIssued({
        refCode,
        clinic: selectedClinic,
        packageType,
        issuedDate: issueDate,
        validUntil,
        status: 'Referral Slip Issued',
      });
    }
    setTimeout(() => {
      setDispatched(false);
    }, 4000);
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box rs-med-referral-box">
        {/* MODAL HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">Diagnostic Clinic Referral Slip</div>
            <div className="modal-jo-sub">Official Pre-Employment Medical Examination &amp; Drug Screening Authorization</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {dispatched && (
          <div style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)', padding: '10px 16px', fontSize: '12px', fontWeight: 700, borderBottom: '1px solid rgba(20, 158, 110, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Medical referral slip dispatched to candidate ({candidate.phone || '+63 917 555 0192'}) via SMS and email with clinic directions.
          </div>
        )}

        <div className="modal-scroll" style={{ padding: '20px' }}>
          {/* CONTROLS: CLINIC & PACKAGE SELECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px', background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Select Partner Diagnostic Clinic</label>
              <select
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
              >
                <option value="Hi-Precision Diagnostics - Quezon City Main Hub">Hi-Precision Diagnostics - Quezon City Main Hub</option>
                <option value="SuperCare Medical Clinic - Manila Port Area Hub">SuperCare Medical Clinic - Manila Port Area Hub</option>
                <option value="Healthway Clinics - Taguig BGC / Market Market Hub">Healthway Clinics - Taguig BGC / Market Market Hub</option>
                <option value="QualiMed Diagnostic Center - North NCR / Caloocan">QualiMed Diagnostic Center - North NCR / Caloocan</option>
                <option value="MyHealth Clinic - Mandaluyong Greenfield Hub">MyHealth Clinic - Mandaluyong Greenfield Hub</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Diagnostic Laboratory Package</label>
              <select
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '12px', fontWeight: 600, outline: 'none' }}
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
              >
                <option value="Package A (Standard Pre-Employment + 10-Panel Drug Screen)">Package A (Standard Pre-Employment + 10-Panel Drug Screen)</option>
                <option value="Package B (Heavy Equipment Operator + Visual Acuity & Ishihara)">Package B (Heavy Equipment Operator + Visual Acuity & Ishihara)</option>
                <option value="Package C (Food Handler Package + Fecalysis & Hepa-B)">Package C (Food Handler Package + Fecalysis & Hepa-B)</option>
                <option value="Package D (Executive Full Battery + Audiometry & ECG)">Package D (Executive Full Battery + Audiometry & ECG)</option>
              </select>
            </div>
          </div>

          {/* OFFICIAL MEDICAL REFERRAL DOCUMENT PREVIEW */}
          <div className="rs-printable-slip" style={{ background: '#fff', color: '#111827', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* DOCUMENT HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #111827', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: '38px', height: '38px' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.5px', color: '#0f172a' }}>PRIMEPOWER MANPOWER SERVICES</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>DOLE DO 174 LICENSED CONTRACTOR &middot; CORPORATE MEDICAL DIVISION</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#007dcc' }}>{refCode}</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Date: <strong>{issueDate}</strong></div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', background: '#f1f5f9', padding: '4px 14px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                Official Medical Examination Referral Slip
              </span>
            </div>

            {/* CANDIDATE & CLINIC INFO TABLE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px', fontSize: '11.5px', marginBottom: '18px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Candidate Name:</span>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>{candidate.name}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Target Position / Job Order:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{candidate.position || job?.title || candidate.jobTitle || 'Operations Associate'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Designated Diagnostic Center:</span>
                <div style={{ fontWeight: 800, color: '#007dcc' }}>{selectedClinic}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Assigned Client Facility:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{job?.client || candidate.client || 'Client Onsite Operations'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Referral Validity Period:</span>
                <div style={{ fontWeight: 700, color: '#b45309' }}>Valid until {validUntil} (14 Days)</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Billing Account Code:</span>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>CHARGE TO PRIMEPOWER (PPM-MED-2026-HQ)</div>
              </div>
            </div>

            {/* INCLUDED PROCEDURES CHECKLIST */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>
                Authorized Diagnostic Test Battery ({packageType}):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>&#10003;</span> Complete Physical Examination &amp; Vital Signs
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>&#10003;</span> 14x17 Chest X-Ray (PA View / Apical Screening)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>&#10003;</span> Complete Blood Count (CBC) with Blood Typing
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>&#10003;</span> Routine Urinalysis &amp; Fecalysis
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>&#10003;</span> 10-Panel Mandatory Drug Screen (Meth &amp; THC)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 900 }}>&#10003;</span> Visual Acuity &amp; Ishihara Color Test
                </div>
              </div>
            </div>

            {/* BARCODE / SCANNER FOOTER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '4px', fontSize: '14px', fontWeight: 800, color: '#334155' }}>
                  ||||| | |||| ||| ||||||| ||| ||||||
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b', marginTop: '2px' }}>Clinic Verification Code: {refCode}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>PRIMEPOWER HR Medical Services</div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>Authorized Corporate Recruiter Signature</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL ACTION BAR */}
        <div style={{ padding: '14px 20px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <button
            type="button"
            className="rs-stage-btn"
            onClick={handleCopyLink}
          >
            {copied ? 'Link Copied!' : 'Copy Digital Referral Link'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              Print / Save PDF
            </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
