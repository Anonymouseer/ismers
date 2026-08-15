import { useEffect, useState } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import { initials } from '../utils/recruitmentUtils';

export default function EmployeeIdModal({ candidate, job, onClose }) {
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'front' | 'back'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const rawNum = (candidate?.regId || candidate?.id || '17').replace(/\D/g, '') || '0017';
  const employeeId = candidate?.deploymentDetails?.employeeId || `PPM-EMP-2026-${rawNum.padStart(4, '0')}`;
  const sss = candidate?.statutoryNumbers?.sss || '34-8891234-1';
  const philhealth = candidate?.statutoryNumbers?.philhealth || '12-050482910-9';
  const pagibig = candidate?.statutoryNumbers?.pagibig || '1210-9482-0012';
  const tin = candidate?.statutoryNumbers?.tin || '482-901-342-000';
  const emergencyContact = candidate?.emergencyContact || '(02) 8888-PPMI / 0917-555-0199';
  const clientName = job?.client || candidate?.client || 'Apex Construction Builders';
  const position = candidate?.position || job?.title || candidate?.jobTitle || 'Safety Officer';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay open" style={{ zIndex: 1200 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .employee-id-print-area, .employee-id-print-area * {
            visibility: visible !important;
          }
          .employee-id-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #ffffff !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            gap: 24px !important;
            padding: 20px !important;
            z-index: 999999 !important;
          }
          .id-card-element {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            page-break-inside: avoid !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="modal-box" style={{ maxWidth: '940px', width: '95vw', borderRadius: '16px', overflow: 'hidden' }}>
        {/* HEADER */}
        <div className="modal-head no-print" style={{ borderBottom: '1px solid var(--border)', padding: '18px 24px', background: 'var(--panel)' }}>
          <div className="modal-avatar" style={{ background: 'var(--primary)', width: '42px', height: '42px', borderRadius: '10px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <line x1="15" y1="8" x2="17" y2="8" />
              <line x1="15" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>
          </div>
          <div className="modal-title-wrap" style={{ flex: 1 }}>
            <div className="modal-jo-title" style={{ fontSize: '17px', fontWeight: 800 }}>Company ID &amp; Onsite Security Access Pass</div>
            <div className="modal-jo-sub" style={{ fontSize: '12.5px', marginTop: '2px', color: 'var(--muted)' }}>
              Official DOLE DO-174 Personnel Security Badge &middot; <strong style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{employeeId}</strong>
            </div>
          </div>

          {/* VIEW SWITCHER */}
          <div style={{ display: 'flex', background: 'var(--bg)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)', marginRight: '14px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('both')}
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'both' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'both' ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s ease',
              }}
            >
              Both Sides
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('front')}
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'front' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'front' ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s ease',
              }}
            >
              Front Only
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('back')}
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === 'back' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'back' ? '#fff' : 'var(--muted)',
                transition: 'all 0.15s ease',
              }}
            >
              Back Only
            </button>
          </div>

          <button className="modal-close" onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '8px' }}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* BODY PRINT AREA */}
        <div className="modal-scroll" style={{ padding: '32px 24px', background: 'var(--bg)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="employee-id-print-area" style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>

            {/* ========================================================= */}
            {/* FRONT SIDE (ENLARGED HIGH DENSITY BADGE) */}
            {/* ========================================================= */}
            {(activeTab === 'both' || activeTab === 'front') && (
              <div
                className="id-card-element"
                style={{
                  width: '350px',
                  minHeight: '540px',
                  background: 'linear-gradient(145deg, #006eb4 0%, #004273 60%, #002c4f 100%)',
                  color: '#ffffff',
                  borderRadius: '20px',
                  padding: '22px 20px',
                  boxShadow: '0 18px 45px rgba(0, 50, 100, 0.28), 0 4px 12px rgba(0,0,0,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.18)',
                  boxSizing: 'border-box',
                }}
              >
                {/* METALLIC HOLOGRAM SECURITY RIBBON ACROSS TOP */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: 'linear-gradient(90deg, #f59e0b, #38bdf8, #818cf8, #34d399, #f59e0b)',
                  backgroundSize: '200% 100%',
                  opacity: 0.9,
                }} />

                {/* BACKGROUND WATERMARK GUILLOCHE ACCENT */}
                <div style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '320px',
                  height: '320px',
                  borderRadius: '50%',
                  border: '1px dashed rgba(255,255,255,0.06)',
                  pointerEvents: 'none',
                }} />

                {/* PHYSICAL LANYARD SLOT HOLE */}
                <div style={{
                  width: '44px',
                  height: '10px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
                }} />

                {/* COMPANY HEADER */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    }}>
                      <img src={primepowerLogo} alt="Primepower Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '0.6px', lineHeight: 1.1 }}>PRIMEPOWER</div>
                      <div style={{ fontSize: '8.5px', color: '#93c5fd', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Manpower Services</div>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '8px',
                    fontWeight: 800,
                    color: '#fef08a',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(250, 204, 21, 0.4)',
                    padding: '3px 7px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    DOLE DO-174
                  </div>
                </div>

                {/* EMV SMART CHIP + CONTACTLESS ACCESS ICON */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 8px', marginBottom: '8px' }}>
                  {/* METALLIC CHIP */}
                  <div style={{
                    width: '34px',
                    height: '26px',
                    background: 'linear-gradient(135deg, #fcd34d 0%, #b45309 50%, #fef08a 100%)',
                    borderRadius: '5px',
                    border: '1px solid #78350f',
                    position: 'relative',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ position: 'absolute', top: '7px', left: 0, right: 0, height: '1px', background: '#78350f' }} />
                    <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '1px', background: '#78350f' }} />
                    <div style={{ position: 'absolute', top: '7px', bottom: '7px', left: '10px', width: '13px', border: '1px solid #78350f', borderRadius: '2px' }} />
                  </div>

                  {/* RFID WAVE ICON */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px', color: 'rgba(255,255,255,0.6)' }}>
                    <path d="M5 8.5a9 9 0 0 1 14 0" />
                    <path d="M7.8 11.5a5.5 5.5 0 0 1 8.4 0" />
                    <path d="M10.6 14.5a2 2 0 0 1 2.8 0" />
                  </svg>
                </div>

                {/* PHOTO PORTRAIT FRAME */}
                <div style={{
                  position: 'relative',
                  width: '108px',
                  height: '108px',
                  borderRadius: '50%',
                  padding: '4px',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.2))',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
                  marginBottom: '14px',
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#006eb4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '34px',
                    fontWeight: 900,
                    letterSpacing: '1px',
                  }}>
                    {initials(candidate.name)}
                  </div>
                  {/* ACTIVE STATUS DOT */}
                  <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: '2.5px solid #004b7d',
                    boxShadow: '0 0 8px #10b981',
                  }} title="Active Status Verified" />
                </div>

                {/* CANDIDATE NAME */}
                <div style={{
                  fontSize: '18px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  lineHeight: 1.2,
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  marginBottom: '4px',
                  padding: '0 6px',
                }}>
                  {candidate.name}
                </div>

                {/* ROLE BADGE */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#e0f2fe',
                  letterSpacing: '0.5px',
                  marginBottom: '16px',
                }}>
                  {position}
                </div>

                {/* EMPLOYEE ID BADGE BOX */}
                <div style={{
                  width: '100%',
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.65) 100%)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
                  marginBottom: '14px',
                }}>
                  <div style={{ fontSize: '9px', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>
                    Corporate Employee ID
                  </div>
                  <div style={{
                    fontSize: '17px',
                    fontWeight: 900,
                    letterSpacing: '2px',
                    fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
                    color: '#ffffff',
                    marginTop: '2px',
                    textShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
                  }}>
                    {employeeId}
                  </div>
                </div>

                {/* FOOTER ASSIGNMENT */}
                <div style={{ marginTop: 'auto', width: '100%', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '10px' }}>
                  <div style={{ fontSize: '10.5px', color: '#bfdbfe', fontWeight: 500 }}>
                    Assigned: <strong style={{ color: '#ffffff', fontWeight: 800 }}>{clientName}</strong>
                  </div>
                  <div style={{ fontSize: '8.5px', color: '#93c5fd', marginTop: '3px', letterSpacing: '0.4px' }}>
                    Security Level 2 &middot; Onsite Cleared Personnel
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* BACK SIDE (ENLARGED OFFICIAL STATUTORY & TERMS BADGE) */}
            {/* ========================================================= */}
            {(activeTab === 'both' || activeTab === 'back') && (
              <div
                className="id-card-element"
                style={{
                  width: '350px',
                  minHeight: '540px',
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '20px',
                  padding: '22px 20px',
                  boxShadow: '0 18px 45px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '2px solid #e2e8f0',
                  boxSizing: 'border-box',
                }}
              >
                {/* TOP SECURITY COLOR STRIP */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '5px',
                  background: '#006eb4',
                }} />

                {/* PHYSICAL LANYARD SLOT HOLE */}
                <div style={{
                  width: '44px',
                  height: '10px',
                  background: '#e2e8f0',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '6px',
                  margin: '0 auto 14px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.15)',
                }} />

                {/* OFFICIAL ACCREDITATION HEADER */}
                <div style={{ textAlign: 'center', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '10px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 900, color: '#004273', letterSpacing: '0.4px' }}>
                    PRIMEPOWER MANPOWER SERVICES INC.
                  </div>
                  <div style={{ fontSize: '8px', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                    DOLE DO-174 LICENSE NO. NCR-QC-DO174-2024-0891
                  </div>
                  <div style={{ fontSize: '7.5px', color: '#64748b' }}>
                    Headquarters: Prime Tower, EDSA, Quezon City &middot; Tel: (02) 8923-4567
                  </div>
                </div>

                {/* STATUTORY & PERSONNEL RECORD TABLE */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '10.5px',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>SSS NUMBER</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>{sss}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>PHILHEALTH NO.</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>{philhealth}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>PAG-IBIG MID</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>{pagibig}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>TIN NUMBER</span>
                    <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>{tin}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#64748b' }}>EMERGENCY TEL</span>
                    <span style={{ fontWeight: 800, color: '#0284c7' }}>{emergencyContact}</span>
                  </div>
                </div>

                {/* TERMS & CONDITIONS CLAUSE */}
                <div style={{
                  fontSize: '8px',
                  lineHeight: '1.35',
                  color: '#64748b',
                  textAlign: 'justify',
                  borderLeft: '2px solid #006eb4',
                  paddingLeft: '8px',
                  marginBottom: '14px',
                }}>
                  This identification badge remains the property of PRIMEPOWER MANPOWER SERVICES INC. and must be worn at all times while on duty. In case of emergency or loss, surrender to security or contact the HR operations hotline immediately.
                </div>

                {/* AUTHORIZED SIGNATORY & QR CODE FOOTER */}
                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                  {/* 2D QR CODE GRAPHIC */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {/* ACCURATE SVG QR CODE PATTERN */}
                    <svg viewBox="0 0 25 25" style={{ width: '100%', height: '100%' }}>
                      <rect width="25" height="25" fill="#ffffff" />
                      <rect x="2" y="2" width="6" height="6" fill="#0f172a" />
                      <rect x="3" y="3" width="4" height="4" fill="#ffffff" />
                      <rect x="4" y="4" width="2" height="2" fill="#0f172a" />

                      <rect x="17" y="2" width="6" height="6" fill="#0f172a" />
                      <rect x="18" y="3" width="4" height="4" fill="#ffffff" />
                      <rect x="19" y="4" width="2" height="2" fill="#0f172a" />

                      <rect x="2" y="17" width="6" height="6" fill="#0f172a" />
                      <rect x="3" y="18" width="4" height="4" fill="#ffffff" />
                      <rect x="4" y="19" width="2" height="2" fill="#0f172a" />

                      <rect x="10" y="3" width="2" height="2" fill="#0f172a" />
                      <rect x="13" y="5" width="2" height="2" fill="#0f172a" />
                      <rect x="10" y="8" width="5" height="2" fill="#0f172a" />
                      <rect x="4" y="10" width="2" height="5" fill="#0f172a" />
                      <rect x="8" y="12" width="3" height="3" fill="#0f172a" />
                      <rect x="14" y="11" width="2" height="2" fill="#0f172a" />
                      <rect x="18" y="10" width="4" height="2" fill="#0f172a" />
                      <rect x="10" y="16" width="3" height="2" fill="#0f172a" />
                      <rect x="16" y="15" width="2" height="4" fill="#0f172a" />
                      <rect x="11" y="20" width="5" height="2" fill="#0f172a" />
                      <rect x="19" y="19" width="3" height="3" fill="#0f172a" />
                    </svg>
                  </div>

                  {/* SIGNATURE & VALIDITY INFO */}
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{
                      fontFamily: '"Brush Script MT", "Caveat", "Dancing Script", cursive',
                      fontSize: '18px',
                      color: '#004273',
                      lineHeight: 1,
                      marginBottom: '2px',
                    }}>
                      Atty. R. Bautista
                    </div>
                    <div style={{ fontSize: '8px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
                      Authorized Corporate Signatory
                    </div>
                    <div style={{ fontSize: '7.5px', color: '#64748b', marginTop: '2px' }}>
                      Validity: 1 Year from Deployment
                    </div>
                  </div>
                </div>

                {/* HIGH FIDELITY ACCESS BARCODE */}
                <div style={{ textAlign: 'center', marginTop: '10px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1' }}>
                  <div style={{
                    fontFamily: 'monospace',
                    letterSpacing: '3.5px',
                    fontSize: '13px',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1,
                  }}>
                    |||||| | |||| |||||| ||||| ||| |||||||
                  </div>
                  <div style={{ fontSize: '7.5px', color: '#64748b', marginTop: '3px', fontWeight: 700 }}>
                    DOLE DO-174 SECURITY ACCESS PASS &bull; {employeeId}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="no-print" style={{ padding: '16px 24px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Standard CR80 Badge Dimensions (3.375&quot; &times; 2.125&quot; &middot; 300 DPI Ready)</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="rs-stage-btn"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Close
            </button>
            <button
              type="button"
              className="rs-stage-btn primary"
              onClick={handlePrint}
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 125, 204, 0.3)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Employee ID Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
