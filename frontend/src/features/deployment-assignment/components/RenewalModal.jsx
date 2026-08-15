import { useState } from 'react';
import { countdownLabel, daysLeft } from '../services/DeploymentAssignmentService';

export default function RenewalModal({
  deployment,
  open,
  onClose,
  onExtendContract,
  onAdvanceStage,
}) {
  const [extensionOption, setExtensionOption] = useState('3m');
  const [customDate, setCustomDate] = useState('');

  if (!open || !deployment) return null;

  const cd = countdownLabel(deployment.end);
  const days = daysLeft(deployment.end);

  function calculateNewDate(duration) {
    const currentEnd = new Date(deployment.end);
    if (isNaN(currentEnd.getTime())) return 'Jan 01, 2027';

    if (duration === '3m') {
      currentEnd.setMonth(currentEnd.getMonth() + 3);
    } else if (duration === '6m') {
      currentEnd.setMonth(currentEnd.getMonth() + 6);
    } else if (duration === '1y') {
      currentEnd.setFullYear(currentEnd.getFullYear() + 1);
    }

    return currentEnd.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  function handleProcessExtension() {
    const nextDate = extensionOption === 'custom' && customDate ? customDate : calculateNewDate(extensionOption);
    onExtendContract(deployment.id, nextDate);
    onClose();
  }

  function handleConclude() {
    onAdvanceStage(deployment.id, 'completed');
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1200,
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
          maxWidth: 580,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ padding: '18px 24px', background: 'var(--amber-soft)', borderBottom: '1px solid var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase' }}>
              3-Month Contract Renewal &amp; Extension
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
              {deployment.employee}
            </h3>
            <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
              {deployment.position} &nbsp;·&nbsp; {deployment.client} ({deployment.site})
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* EXPIRY ALERT BANNER */}
        <div style={{ padding: '16px 24px', background: 'var(--panel)', borderBottom: '1px solid var(--border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Current Contract End:</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{deployment.end}</div>
            </div>
            <span
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 800,
                background: cd.soft,
                color: cd.color,
              }}
            >
              ⚠️ {cd.text} ({days} days remaining)
            </span>
          </div>
        </div>

        {/* RENEWAL OPTIONS */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
            Choose Renewal &amp; Extension Term:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { key: '3m', label: '+3 Months Extension', desc: `New End Date: ${calculateNewDate('3m')}` },
              { key: '6m', label: '+6 Months Extension', desc: `New End Date: ${calculateNewDate('6m')}` },
              { key: '1y', label: '+1 Year Extension', desc: `New End Date: ${calculateNewDate('1y')}` },
            ].map((opt) => (
              <label
                key={opt.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: extensionOption === opt.key ? 'var(--amber-soft)' : 'var(--bg)',
                  border: `1px solid ${extensionOption === opt.key ? 'var(--amber)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="extension"
                  checked={extensionOption === opt.key}
                  onChange={() => setExtensionOption(opt.key)}
                  style={{ accentColor: 'var(--amber)', width: 16, height: 16 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div style={{ padding: '14px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn"
            style={{ color: 'var(--red)', borderColor: 'var(--red-soft)', fontSize: 11.5 }}
            onClick={handleConclude}
          >
            Conclude Contract / Release Worker
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" onClick={onClose} style={{ fontSize: 12 }}>
              Cancel
            </button>
            <button
              type="button"
              className="btn primary"
              style={{ background: 'var(--amber)', borderColor: 'var(--amber)', color: '#000', fontWeight: 800, fontSize: 12 }}
              onClick={handleProcessExtension}
            >
              ✓ Confirm Extension
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
