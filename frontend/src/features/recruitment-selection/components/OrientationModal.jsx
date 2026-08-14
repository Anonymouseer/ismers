import { useState, useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

const ORIENTATION_MODULES = [
  {
    id: 'module1',
    title: 'DOLE DO-174 Employment Rights & Benefits',
    desc: 'Explanation of basic wage rates, overtime computation, SSS/PhilHealth/Pag-IBIG statutory remittances, and 13th month pay.',
  },
  {
    id: 'module2',
    title: 'Occupational Safety and Health Standards (OSHS)',
    desc: 'Compliance with RA 11058: site hazard identification, emergency evacuation, mandatory PPE guidelines, and incident reporting.',
  },
  {
    id: 'module3',
    title: 'Code of Discipline & Attendance Policy',
    desc: 'Company rules on timekeeping, biometric/logbook clocking, uniform dress code, absence notice protocol, and tardiness guidelines.',
  },
  {
    id: 'module4',
    title: 'Anti-Sexual Harassment & Safe Spaces Act (RA 11313)',
    desc: 'Zero tolerance policy for gender-based harassment, worker protection, grievance mechanism, and committee on decorum (CODI).',
  },
  {
    id: 'module5',
    title: 'Client Onsite Facility Rules & Security',
    desc: 'Specific house rules, security access badges, client asset handling, and onsite client supervisor coordination.',
  },
];

export default function OrientationModal({ candidate, job, onClose, onCertified }) {
  const [modules, setModules] = useState(
    candidate?.orientationModules || {
      module1: false,
      module2: false,
      module3: false,
      module4: false,
      module5: false,
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const completedCount = Object.values(modules).filter(Boolean).length;
  const allModulesDone = completedCount === ORIENTATION_MODULES.length;
  const isCertified = Boolean(candidate?.orientationModules?.certifiedAt || allModulesDone);

  const toggleModule = (modId) => {
    setModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  const handleCertify = () => {
    const orientationData = {
      ...modules,
      completedCount,
      totalModules: ORIENTATION_MODULES.length,
      certifiedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      certifiedBy: 'HR Training & Development Officer / PRIMEPOWER',
      status: allModulesDone ? 'Certified Completed' : 'Partially Completed',
    };

    if (onCertified) {
      onCertified(orientationData);
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

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '780px' }}>
        {/* MODAL HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--green, #149e6e)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">Pre-Deployment Orientation Seminar (PDOS)</div>
            <div className="modal-jo-sub">Mandatory DOLE DO-174 Onboarding &amp; OSH Standards Training &middot; {candidate.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {savedSuccess && (
          <div style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)', padding: '10px 18px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Pre-Deployment Orientation Seminar record updated and verified.
          </div>
        )}

        <div className="modal-scroll" style={{ padding: '20px' }}>
          {/* PROGRESS STRIP */}
          <div style={{ background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--text)' }}>
                Orientation Modules Sign-Off ({completedCount} of {ORIENTATION_MODULES.length} Completed)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                All 5 modules must be briefed to the worker prior to site deployment.
              </div>
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 12px',
              borderRadius: '6px',
              background: allModulesDone ? 'var(--green-soft, #e8f5e9)' : 'var(--amber-soft, #fef3c7)',
              color: allModulesDone ? 'var(--green, #149e6e)' : 'var(--amber, #d97706)',
            }}>
              {allModulesDone ? '✓ All Modules Briefed' : `${completedCount}/5 Briefed`}
            </span>
          </div>

          {/* MODULES CHECKLIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {ORIENTATION_MODULES.map((mod, idx) => {
              const isChecked = Boolean(modules[mod.id]);
              return (
                <div
                  key={mod.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: isChecked ? 'var(--green-soft, rgba(20, 158, 110, 0.08))' : 'var(--panel)',
                    border: `1px solid ${isChecked ? 'rgba(20, 158, 110, 0.3)' : 'var(--border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.14s var(--ease)',
                  }}
                  onClick={() => toggleModule(mod.id)}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '6px',
                    border: `1.5px solid ${isChecked ? 'var(--green, #149e6e)' : 'var(--border)'}`,
                    background: isChecked ? 'var(--green, #149e6e)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}>
                    {isChecked && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '13px', height: '13px' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: isChecked ? 'var(--green, #149e6e)' : 'var(--text)' }}>
                      Module {idx + 1}: {mod.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                      {mod.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* OFFICIAL CERTIFICATE OF COMPLETION (PRINTABLE) */}
          <div className="rs-printable-cert" style={{ background: '#ffffff', color: '#111827', padding: '24px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: '36px', height: '36px' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>PRIMEPOWER MANPOWER SERVICES</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>TRAINING &amp; ONBOARDING COMPLIANCE DIVISION</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a' }}>PDOS-CERT-2026-{(candidate?.regId || candidate?.id || '001').replace(/\D/g, '').padStart(4, '0')}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '14px 0' }}>
              <div style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a' }}>
                Certificate of Pre-Deployment Orientation Completion
              </div>
              <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '6px' }}>
                This is to certify that <strong>{candidate.name}</strong> has satisfactorily completed the mandatory Pre-Deployment Orientation Seminar covering DOLE DO-174 statutory worker rights, Occupational Safety &amp; Health (RA 11058), and Code of Conduct.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '10.5px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Assigned Client Facility:</span>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{job?.client || candidate.client || 'Client Operations'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b' }}>Certified By:</span>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>HR Training Operations &bull; PRIMEPOWER</div>
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
            Print Orientation Certificate
          </button>

          <button
            type="button"
            className="rs-stage-btn primary"
            style={{ background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' }}
            onClick={handleCertify}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {allModulesDone ? 'Certify & Save Orientation' : 'Save Progress'}
          </button>
        </div>
      </div>
    </div>
  );
}
