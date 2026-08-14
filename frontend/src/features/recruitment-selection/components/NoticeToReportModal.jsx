import { useState, useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

export default function NoticeToReportModal({ candidate, job, onClose, onIssued }) {
  const defaultSite = job?.client === 'Metro Health Diagnostics'
    ? 'Metro Health Diagnostics Manila Hub, Taft Ave, Malate, Manila'
    : job?.client === 'ABC Logistics'
    ? 'ABC Logistics Hub, Valenzuela Logistics Industrial Park'
    : job?.client === 'Vikings Luxury Buffet'
    ? 'Vikings SM Mall of Asia, Seaside Blvd, Pasay City'
    : 'Client Operations Site & Facilities, NCR';

  const [siteAddress, setSiteAddress] = useState(candidate?.deploymentDetails?.siteAddress || defaultSite);
  const [reportingDate, setReportingDate] = useState(candidate?.deploymentDetails?.reportingDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [callTime, setCallTime] = useState(candidate?.deploymentDetails?.callTime || '08:00 AM (Day Shift)');
  const [onsiteSupervisor, setOnsiteSupervisor] = useState(candidate?.deploymentDetails?.onsiteSupervisor || 'Mr. Raymond Santos (Site Operations Lead)');
  const [supervisorPhone, setSupervisorPhone] = useState(candidate?.deploymentDetails?.supervisorPhone || '+63 918 555 0184');
  const [dispatched, setDispatched] = useState(false);

  const employeeId = `PPM-EMP-2026-${(candidate?.regId || candidate?.id || '001').replace(/\D/g, '').padStart(4, '0')}`;
  const ntrCode = `NTR-DOLE-2026-${(candidate?.regId || candidate?.id || '001').replace(/\D/g, '').padStart(4, '0')}`;
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
    if (onIssued) {
      onIssued({
        employeeId,
        ntrCode,
        siteAddress,
        reportingDate,
        callTime,
        onsiteSupervisor,
        supervisorPhone,
        issuedAt: issueDate,
        status: 'Notice to Report Issued',
      });
    }
    setTimeout(() => setDispatched(false), 3500);
  };

  return (
    <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '820px' }}>
        {/* HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--primary)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">Notice to Report (NTR) &amp; Site Deployment Order</div>
            <div className="modal-jo-sub">Official DOLE DO-174 Client Mobilization Directive &middot; Control No: {ntrCode}</div>
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
            Notice to Report dispatched to candidate ({candidate.phone || '+63 917 555 0192'}) with site GPS coordinates and supervisor contact.
          </div>
        )}

        <div className="modal-scroll" style={{ padding: '20px' }}>
          {/* CONTROLS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px', background: 'var(--bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Reporting Date &amp; Call Time</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                <input
                  type="date"
                  value={reportingDate}
                  onChange={(e) => setReportingDate(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
                <input
                  type="text"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Onsite Client Supervisor &amp; Phone</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  value={onsiteSupervisor}
                  onChange={(e) => setOnsiteSupervisor(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
                <input
                  type="text"
                  value={supervisorPhone}
                  onChange={(e) => setSupervisorPhone(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '10.5px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>Site Deployment Facility Address</label>
              <input
                type="text"
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                style={{ width: '100%', marginTop: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: '11px', fontWeight: 600, outline: 'none' }}
              />
            </div>
          </div>

          {/* OFFICIAL NOTICE TO REPORT DIRECTIVE (PRINTABLE) */}
          <div className="rs-printable-ntr" style={{ background: '#ffffff', color: '#111827', padding: '26px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', fontFamily: 'system-ui, sans-serif' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: '40px', height: '40px' }} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#0f172a' }}>PRIMEPOWER MANPOWER SERVICES</div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>DEPLOYMENT OPERATIONS &amp; CLIENT MOBILIZATION DIVISION</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: 900, color: '#007dcc' }}>{ntrCode}</div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>Date Issued: <strong>{issueDate}</strong></div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', background: '#f1f5f9', padding: '4px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                Official Notice to Report (NTR)
              </span>
            </div>

            {/* DIRECTIVE SUMMARY TABLE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px', fontSize: '11.5px', marginBottom: '16px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Employee Name:</span>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>{candidate.name}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Employee ID No:</span>
                <div style={{ fontWeight: 800, color: '#007dcc' }}>{employeeId}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Designated Position:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{candidate.position || job?.title || candidate.jobTitle || 'Operations Associate'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Assigned Client Principal:</span>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>{job?.client || candidate.client || 'Client Onsite Operations'}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>First Day Reporting Date &amp; Call Time:</span>
                <div style={{ fontWeight: 800, color: '#16a34a' }}>{reportingDate} at {callTime}</div>
              </div>
              <div>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Onsite Supervisor Contact:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{onsiteSupervisor} ({supervisorPhone})</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Onsite Reporting Venue / Facility:</span>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{siteAddress}</div>
              </div>
            </div>

            {/* REPORTING PROTOCOLS */}
            <div style={{ fontSize: '11px', color: '#334155', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', marginBottom: '4px' }}>
                Mandatory First-Day Reporting Guidelines:
              </div>
              <ul style={{ margin: '4px 0 0 16px', padding: 0, lineHeight: '1.5' }}>
                <li>Arrive at least <strong>15 minutes prior</strong> to call time for security credential logging and turnstile activation.</li>
                <li>Wear the complete prescribed <strong>PRIMEPOWER uniform &amp; company ID lanyard</strong> at all times inside client premises.</li>
                <li>Ensure compliance with OSH site safety standards (steel-toe shoes and high-vis vest where required).</li>
                <li>Present this Notice to Report (physical copy or digital QR code) to the onsite reception/guard on duty.</li>
              </ul>
            </div>

            {/* SCANNER FOOTER */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <div>
                <div style={{ fontFamily: 'monospace', letterSpacing: '3px', fontSize: '13px', fontWeight: 800, color: '#334155' }}>
                  |||||| || ||||| |||| |||||| |||||
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>DOLE DO-174 Mobilization Pass: {ntrCode}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>PRIMEPOWER Deployment Services</div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>Authorized Deployment Area Coordinator</div>
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
            Print Notice to Report PDF
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
            Issue &amp; Send to Candidate (SMS/Email)
          </button>
        </div>
      </div>
    </div>
  );
}
