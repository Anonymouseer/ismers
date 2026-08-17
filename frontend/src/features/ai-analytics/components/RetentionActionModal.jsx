import { useState, useEffect } from 'react';
import primepowerLogo from '../../../assets/primepower-logo.svg';

export default function RetentionActionModal({
  staff,
  open,
  onClose,
  onActionComplete,
}) {
  const [actionType, setActionType] = useState('renewal');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [customNote, setCustomNote] = useState('');
  const [logToAudit, setLogToAudit] = useState(true);
  const [notifySupervisor, setNotifySupervisor] = useState(true);
  const [isDispatched, setIsDispatched] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !staff) return null;

  const employeeEmail = `${staff.employeeName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@primepower-staff.ph`;
  const memoControlNo = `PPM-RET-2026-${staff.id.replace(/\D/g, '').padStart(4, '0')}`;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const ACTION_TEMPLATES = {
    renewal: {
      title: '3-Month Contract Renewal Notice & Extension Agreement',
      subject: `[PRIMEPOWER HR] Official Notice of Contract Renewal — ${staff.client}`,
      body: `Dear ${staff.employeeName},

In accordance with PRIMEPOWER MANPOWER policy and DOLE DO-174 regulations, we are pleased to inform you that your performance review as ${staff.position} at ${staff.client} (${staff.client}) qualifies you for an official contract extension.

Your current contract is scheduled to conclude on ${staff.contractEnd}. We invite you to complete the renewal acknowledgment form by ${targetDate} to confirm your deployment continuation.

Please coordinate with your Area Supervisor or report to the HR Operations office for contract endorsement.

Sincerely,
HR Deployment & Retention Division
PRIMEPOWER MANPOWER SERVICES INC.`,
    },
    stay_interview: {
      title: 'HR Career Check-in & Stay Interview Consultation Directive',
      subject: `[PRIMEPOWER HR] Invitation: Work Assignment & Career Consultation Check-in`,
      body: `Dear ${staff.employeeName},

As part of PRIMEPOWER's commitment to employee welfare and workplace support, we have scheduled a one-on-one HR consultation check-in on ${targetDate}.

We would like to discuss your recent work experience at ${staff.client}, gather feedback regarding shift schedules and compensation, and address any support needed for your ongoing deployment.

Your attendance is highly valued. Please confirm your availability with the HR Operations team.

Sincerely,
Employee Relations & Welfare Lead
PRIMEPOWER MANPOWER SERVICES INC.`,
    },
    transfer: {
      title: 'Site Relocation & Shift Adjustment Endorsement',
      subject: `[PRIMEPOWER Operations] Evaluation of Site Relocation & Shift Adjustment`,
      body: `Dear ${staff.employeeName},

Following our recent operational review regarding your commute logistics and shift schedule at ${staff.client}, PRIMEPOWER Operations is endorsing a transfer assessment for a deployment facility closer to your residence.

An initial orientation and schedule alignment has been arranged for ${targetDate}. Please review the proposed shift rotation details.

Sincerely,
Operations Area Lead
PRIMEPOWER MANPOWER SERVICES INC.`,
    },
    show_cause: {
      title: 'Official Attendance Review & Clarification Directive',
      subject: `[PRIMEPOWER HR] Attendance Review & Written Explanation Directive`,
      body: `Dear ${staff.employeeName},

This is an official notice regarding your attendance record at ${staff.client}, with a recorded attendance rate of ${staff.attendance} and recent absence logs.

In line with standard HR guidelines, please submit a written clarification or attend an HR check-in on ${targetDate} to discuss these occurrences and ensure proper documentation for your 201 file.

Sincerely,
HR Compliance & Disciplinary Division
PRIMEPOWER MANPOWER SERVICES INC.`,
    },
  };

  const currentTemplate = ACTION_TEMPLATES[actionType] || ACTION_TEMPLATES.renewal;

  const handlePrintMemo = () => {
    window.print();
  };

  const handleDispatchAction = () => {
    setIsDispatched(true);
    if (onActionComplete) {
      onActionComplete(staff.id, actionType, {
        memoControlNo,
        actionTitle: currentTemplate.title,
        dispatchedEmail: employeeEmail,
        targetDate,
        customNote,
        issuedAt: issueDate,
      });
    }
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1500);
  };

  const riskColor = staff.riskScore >= 75 ? 'var(--red)' : staff.riskScore >= 40 ? 'var(--amber)' : 'var(--green)';
  const riskBg = staff.riskScore >= 75 ? 'var(--red-soft)' : staff.riskScore >= 40 ? 'var(--amber-soft)' : 'var(--green-soft)';

  return (
    <div
      className="modal-overlay open"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-box"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div style={{ padding: '16px 22px', background: 'var(--panel)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
              {staff.employeeName.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                  {staff.employeeName}
                </h3>
                <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 10.5, fontWeight: 800, color: riskColor, background: riskBg, border: `1px solid ${riskColor}` }}>
                  {staff.riskLevel} ({staff.riskScore} Risk Score)
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                ID: <b>{staff.id}</b> &nbsp;·&nbsp; {staff.position} &nbsp;·&nbsp; Client: <b style={{ color: 'var(--primary)' }}>{staff.client}</b>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--muted-fg)', fontSize: 18, cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {isDispatched && (
          <div style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)', padding: '10px 22px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 15, height: 15 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Retention notice successfully dispatched to {employeeEmail} and recorded in Deployment Audit Trail.
          </div>
        )}

        {/* SCROLLABLE BODY */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 1. DIAGNOSTIC RISK SUMMARY */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.5px' }}>
              Detected Risk Factors &amp; AI Recommendation
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--muted-fg)', fontWeight: 600 }}>Attendance Rate:</span>
                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{staff.attendance}</div>
              </div>
              <div>
                <span style={{ color: 'var(--muted-fg)', fontWeight: 600 }}>Contract Expiration:</span>
                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{staff.contractEnd}</div>
              </div>
              <div>
                <span style={{ color: 'var(--muted-fg)', fontWeight: 600 }}>Identified Factors:</span>
                <div style={{ fontWeight: 700, color: riskColor }}>{staff.keyFactors?.join(', ') || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* 2. INTERVENTION ACTION TYPE SELECTOR */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Select Retention Intervention Action:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 8 }}>
              {[
                { key: 'renewal', label: 'Contract Renewal Notice', desc: 'Standard 3-month renewal offer' },
                { key: 'stay_interview', label: 'HR Stay Interview', desc: 'Career & welfare consultation' },
                { key: 'transfer', label: 'Site Relocation / Transfer', desc: 'Commute & shift adjustment' },
                { key: 'show_cause', label: 'Attendance Clarification', desc: 'Formal show-cause review' },
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() => setActionType(opt.key)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: `1px solid ${actionType === opt.key ? 'var(--primary)' : 'var(--border)'}`,
                    background: actionType === opt.key ? 'var(--secondary)' : 'var(--panel)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="radio"
                      name="actionType"
                      checked={actionType === opt.key}
                      onChange={() => setActionType(opt.key)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)' }}>{opt.label}</div>
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 3, paddingLeft: 18 }}>
                    {opt.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TARGET SCHEDULE & AUDIT CHECKBOXES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>
                Effective Target / Consultation Date:
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={logToAudit}
                  onChange={(e) => setLogToAudit(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Log to Employee 201 File &amp; Deployment Trail
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifySupervisor}
                  onChange={(e) => setNotifySupervisor(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Copy Site Operations Area Manager
              </label>
            </div>
          </div>

          {/* 4. DIGITAL MEMORANDUM & EMAIL DISPATCH PREVIEW */}
          <div style={{ background: '#ffffff', color: '#111827', padding: '22px', borderRadius: 12, border: '2px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif' }}>
            {/* MEMO LETTERHEAD */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={primepowerLogo} alt="Primepower" style={{ width: 34, height: 34 }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0f172a' }}>PRIMEPOWER MANPOWER SERVICES INC.</div>
                  <div style={{ fontSize: 9.5, color: '#64748b', fontWeight: 700 }}>HUMAN RESOURCES &amp; WORKFORCE RETENTION DIVISION</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#007dcc' }}>{memoControlNo}</div>
                <div style={{ fontSize: 9.5, color: '#64748b' }}>Date: <strong>{issueDate}</strong></div>
              </div>
            </div>

            {/* MEMO METADATA */}
            <div style={{ fontSize: 11, display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 8px', marginBottom: 12 }}>
              <span style={{ fontWeight: 800, color: '#475569' }}>TO:</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>{staff.employeeName} ({employeeEmail})</span>
              <span style={{ fontWeight: 800, color: '#475569' }}>POSITION:</span>
              <span style={{ color: '#0f172a' }}>{staff.position} &nbsp;|&nbsp; Client Site: <b>{staff.client}</b></span>
              <span style={{ fontWeight: 800, color: '#475569' }}>SUBJECT:</span>
              <span style={{ fontWeight: 800, color: '#007dcc' }}>{currentTemplate.title}</span>
            </div>

            {/* EDITABLE MEMO / EMAIL BODY */}
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <textarea
                value={customNote || currentTemplate.body}
                onChange={(e) => setCustomNote(e.target.value)}
                rows={7}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: 11.5,
                  color: '#1e293b',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            {/* SIGNATORY LINES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 14, paddingTop: 10, borderTop: '1px dashed #cbd5e1', fontSize: 10.5 }}>
              <div>
                <div style={{ color: '#64748b', fontWeight: 700 }}>ISSUED BY:</div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 4 }}>HR Retention Operations Officer</div>
                <div style={{ color: '#64748b', fontSize: 9.5 }}>PRIMEPOWER MANPOWER SERVICES INC.</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontWeight: 700 }}>ACKNOWLEDGED BY:</div>
                <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 4, borderBottom: '1px solid #94a3b8', display: 'inline-block', minWidth: 150 }}>
                  {staff.employeeName}
                </div>
                <div style={{ color: '#64748b', fontSize: 9.5 }}>Employee Signature Over Printed Name</div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{ padding: '14px 22px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button
            type="button"
            className="btn"
            onClick={handlePrintMemo}
            style={{ fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Formal Memo PDF
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ fontSize: 11.5 }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={handleDispatchAction}
              style={{ fontSize: 11.5, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Dispatch Notice via Email &amp; Log Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
