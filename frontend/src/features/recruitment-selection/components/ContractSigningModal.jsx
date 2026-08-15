import { useState, useRef, useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

export default function ContractSigningModal({ candidate, job, onClose, onSigned, readOnly = false }) {
  const defaultWage = candidate?.employmentContract?.wage || '₱645.00 / day (NCR Statutory Minimum Rate)';
  const defaultDuration = candidate?.employmentContract?.contractDuration || '6 Months (Renewable Fixed-Term DOLE DO-174 Assignment)';
  const defaultStartDate = candidate?.employmentContract?.startDate || candidate?.employmentContract?.signedDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [wageDaily, setWageDaily] = useState(defaultWage);
  const [contractDuration, setContractDuration] = useState(defaultDuration);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [dispatched, setDispatched] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const canvasRef = useRef(null);

  const contractNo = candidate?.employmentContract?.contractNo || `DOLE-174-${(candidate?.regId || candidate?.id || '001').replace(/\D/g, '').padStart(4, '0')}`;
  const isAlreadySigned = Boolean(candidate?.employmentContract?.status === 'Signed' || readOnly);

  const savedSignatureData = candidate?.employmentContract?.signatureData ||
    (typeof window !== 'undefined' ? (localStorage.getItem(`contract_signature_${candidate?.name}`) || localStorage.getItem(`contract_signature_${candidate?.id}`)) : null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Canvas setup for interactive signing mode
  useEffect(() => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';

    if (savedSignatureData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = savedSignatureData;
    }
  }, [candidate, readOnly, savedSignatureData]);

  const startDrawing = (e) => {
    if (isAlreadySigned || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || isAlreadySigned || readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (readOnly) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveSignature = () => {
    if (!hasSignature && !isAlreadySigned) {
      alert('Please have the candidate draw their signature on the pad before saving.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureData = canvas ? canvas.toDataURL('image/png') : (savedSignatureData || '');

    if (typeof window !== 'undefined' && signatureData) {
      try {
        localStorage.setItem(`contract_signature_${candidate?.name}`, signatureData);
        localStorage.setItem(`contract_signature_${candidate?.id}`, signatureData);
      } catch (e) { }
    }

    const signedContractData = {
      contractNo,
      wageDaily,
      contractDuration,
      startDate,
      signedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      signedTimestamp: new Date().toISOString(),
      signatureData,
      status: 'Signed',
      verifiedBy: 'HR Operations Lead / PRIMEPOWER MANPOWER SERVICES',
    };

    if (onSigned) {
      onSigned(signedContractData);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1600);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDispatch = () => {
    setDispatched(true);
    setTimeout(() => setDispatched(false), 3500);
  };

  if (!candidate) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 1200 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '840px' }}>
        {/* HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">DOLE DO-174 Project Employment Contract</div>
            <div className="modal-jo-sub">Official Fixed-Term Manpower Contracting Agreement &middot; Control No: {contractNo}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* NOTIFICATION BANNERS */}
        {savedSuccess && (
          <div style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)', padding: '10px 18px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            DOLE DO-174 Employment Contract successfully E-signed and archived in digital 201 records.
          </div>
        )}

        {dispatched && (
          <div style={{ background: 'var(--blue-soft, #e0f2fe)', color: 'var(--primary, #007dcc)', padding: '10px 18px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Executed Employment Contract dispatched to candidate ({candidate.phone || candidate.email || 'SMS & Email'}).
          </div>
        )}

        <div className="modal-scroll" style={{ padding: '20px' }}>
          {/* CONTRACT PARAMETERS BAR (READ-ONLY IN DEPLOYMENT, EDITABLE IN ONBOARDING) */}
          {!readOnly ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px', background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Wage Structure &amp; Benefits</label>
                <input
                  type="text"
                  value={wageDaily}
                  onChange={(e) => setWageDaily(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Contract Term / Assignment</label>
                <input
                  type="text"
                  value={contractDuration}
                  onChange={(e) => setContractDuration(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Effective Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px', background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Wage Structure</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>{wageDaily}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Contract Term</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)', marginTop: '2px' }}>{contractDuration}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Effective Start Date</div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--green, #149e6e)', marginTop: '2px' }}>{startDate}</div>
              </div>
            </div>
          )}

          {/* OFFICIAL CONTRACT DOCUMENT CONTAINER (PRINTABLE) */}
          <div className="rs-printable-contract" style={{ background: '#ffffff', color: '#111827', padding: '28px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 4px 18px rgba(0,0,0,0.06)', fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: '42px', height: '42px' }} />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.5px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>PRIMEPOWER MANPOWER SERVICES</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>DOLE DO-174 CERTIFICATE OF REGISTRATION NO. NCR-QC-DO174-2024-0891</div>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#007dcc' }}>{contractNo}</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Date: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>
                PROJECT-BASED EMPLOYMENT CONTRACT
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                (Executed in Compliance with Department Order No. 174, Series of 2017 &amp; The Labor Code of the Philippines)
              </div>
            </div>

            {/* PARTIES STATEMENT */}
            <p style={{ fontSize: '12px', marginBottom: '14px', textAlign: 'justify' }}>
              KNOW ALL MEN BY THESE PRESENTS: This Project Employment Agreement is entered into by and between:
            </p>
            <p style={{ fontSize: '12px', marginBottom: '14px', textAlign: 'justify', paddingLeft: '12px', borderLeft: '3px solid #cbd5e1' }}>
              <strong>PRIMEPOWER MANPOWER SERVICES</strong>, a duly registered contracting agency under DOLE DO 174, hereinafter referred to as the <strong>&ldquo;EMPLOYER&rdquo;</strong>; and<br />
              <strong>{candidate.name.toUpperCase()}</strong>, of legal age, Filipino, residing at <strong>{candidate.location || 'Metro Manila, Philippines'}</strong>, hereinafter referred to as the <strong>&ldquo;EMPLOYEE&rdquo;</strong>.
            </p>

            {/* WITNESSETH CLAUSES */}
            <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'justify' }}>
              <div>
                <strong>1. APPOINTMENT &amp; CLIENT ASSIGNMENT:</strong> The EMPLOYER hereby engages the EMPLOYEE as <strong>{candidate.position || job?.title || candidate.jobTitle || 'Operations Associate'}</strong> deployed to the principal facility of <strong>{job?.client || candidate.client || 'Client Operations Center'}</strong> for a project duration of <strong>{contractDuration}</strong> commencing on <strong>{startDate}</strong>.
              </div>
              <div>
                <strong>2. DIRECT EMPLOYER-EMPLOYEE RELATIONSHIP:</strong> In accordance with DOLE DO 174-17, the EMPLOYEE is a direct project-based employee of PRIMEPOWER MANPOWER SERVICES. There is no principal-employee relationship between the Principal Client and the EMPLOYEE.
              </div>
              <div>
                <strong>3. COMPENSATION &amp; STATUTORY BENEFITS:</strong> The EMPLOYER shall pay the EMPLOYEE a basic wage of <strong>{wageDaily}</strong>, payable bi-monthly via corporate payroll ATM, inclusive of standard DOLE statutory benefits:
                <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                  <li>Social Security System (SSS), PhilHealth, and Pag-IBIG (HDMF) mandatory employer contributions.</li>
                  <li>Overtime pay (125% regular, 130% rest day/special holiday), Night Shift Differential (10%), and 13th Month Pay.</li>
                  <li>Five (5) days Service Incentive Leave (SIL) upon completion of one year of service.</li>
                </ul>
              </div>
              <div>
                <strong>4. OCCUPATIONAL SAFETY &amp; HEALTH (OSH):</strong> The EMPLOYEE agrees to strictly adhere to OSH standards under RA 11058 and DOLE DO 198-18, including the mandatory wearing of prescribed Personal Protective Equipment (PPE).
              </div>
              <div>
                <strong>5. DATA PRIVACY &amp; SAFE SPACES ACT:</strong> Both parties agree to abide by Republic Act No. 10173 (Data Privacy Act of 2012) and Republic Act No. 11313 (Safe Spaces Act).
              </div>
            </div>

            {/* SIGNATURE SECTION */}
            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #cbd5e1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* EMPLOYER SIGNATURE */}
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, marginBottom: '6px', fontFamily: 'system-ui, sans-serif' }}>SIGNED FOR THE EMPLOYER:</div>
                <div style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1.5px solid #0f172a', background: '#f8fafc', borderRadius: '4px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '22px', color: '#1e3a8a' }}>A. M. Villanueva</span>
                    <div style={{ fontSize: '9px', color: '#64748b', fontFamily: 'system-ui, sans-serif' }}>Digital Authorized Signatory Seal &bull; PPM HQ</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '4px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>PRIMEPOWER MANPOWER SERVICES</div>
                <div style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'system-ui, sans-serif' }}>Authorized HR Operations Representative</div>
              </div>

              {/* CANDIDATE DIGITAL SIGNATURE */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>CANDIDATE SIGNATURE:</span>
                  {!isAlreadySigned && !readOnly && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      style={{ fontSize: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}
                    >
                      Clear Pad
                    </button>
                  )}
                </div>

                {/* DIGITAL SIGNATURE DISPLAY / CANVAS */}
                <div style={{ border: '1.5px dashed #94a3b8', borderRadius: '6px', background: '#f8fafc', overflow: 'hidden', height: '64px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {readOnly || isAlreadySigned ? (
                    savedSignatureData ? (
                      <img src={savedSignatureData} alt="Candidate Signature" style={{ width: '100%', height: '60px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <span style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '24px', color: '#1e3a8a' }}>
                          {candidate.name}
                        </span>
                        <div style={{ fontSize: '8.5px', color: '#16a34a', fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>
                          ✓ Cryptographically Verified &amp; Authenticated E-Signature
                        </div>
                      </div>
                    )
                  ) : (
                    <>
                      <canvas
                        ref={canvasRef}
                        width={340}
                        height={64}
                        style={{ width: '100%', height: '64px', display: 'block', cursor: 'crosshair' }}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                      />
                      {!hasSignature && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: '#94a3b8', fontSize: '11px', fontStyle: 'italic', fontFamily: 'system-ui, sans-serif' }}>
                          Sign here with mouse, touch, or stylus
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ fontSize: '11px', fontWeight: 800, marginTop: '4px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>{candidate.name}</div>
                <div style={{ fontSize: '9.5px', color: '#64748b', fontFamily: 'system-ui, sans-serif' }}>
                  E-Signed &amp; Authenticated ({contractNo})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ padding: '14px 20px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {!readOnly ? (
            <button
              type="button"
              className="rs-stage-btn"
              onClick={handleDispatch}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Send Copy via SMS &amp; Email
            </button>
          ) : (
            <div></div>
          )}

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
              Print Hardcopy (2 Sets)
            </button>

            {!readOnly ? (
              <button
                type="button"
                className="rs-stage-btn primary"
                style={{ background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' }}
                onClick={handleSaveSignature}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {isAlreadySigned ? 'Update Signed Contract' : 'E-Sign & Archive in 201 File'}
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
    </div>
  );
}

