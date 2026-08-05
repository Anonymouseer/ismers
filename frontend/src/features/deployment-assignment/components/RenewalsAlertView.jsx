import { daysLeft, countdownLabel, initials } from '../services/DeploymentAssignmentService';

export default function RenewalsAlertView({ deployments, onOpen }) {
  // Filter staff whose contracts end within 90 days or are completed
  const expiringStaff = deployments.filter((d) => {
    const diff = daysLeft(d.end);
    return diff <= 90 || d.stage === 'completed';
  });

  if (!expiringStaff.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, marginTop: 16 }}>
        ✅ All deployed staff currently have active long-term contracts. No 3-month renewal actions needed at this time.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
      <div style={{ padding: '14px 18px', background: 'var(--amber-soft)', border: '1px solid var(--amber)', borderRadius: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--amber)' }}>Contract Renewal &amp; Expiration Notice Center</div>
          <div style={{ fontSize: 11.5, color: 'var(--text)', opacity: 0.85, marginTop: 2 }}>
            Primepower policy requires issuing contract renewal notices or client release clearance <b>3 months prior to contract expiration</b>.
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, background: 'var(--amber)', color: '#fff', padding: '4px 12px', borderRadius: 20 }}>
          {expiringStaff.length} Contracts Requiring Review
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {expiringStaff.map((d) => {
          const cd = countdownLabel(d.end);
          const diff = daysLeft(d.end);
          const isUrgent = diff <= 30;

          return (
            <div
              key={d.id}
              style={{
                background: 'var(--panel)',
                border: `1px solid ${isUrgent ? 'var(--red)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-fg)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                      {initials(d.employee)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{d.employee}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{d.position}</div>
                    </div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10.5, fontWeight: 800, background: cd.soft, color: cd.color }}>
                    {cd.text}
                  </span>
                </div>

                <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '10px 12px', fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  <div><b style={{ color: 'var(--muted-fg)' }}>Client:</b> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{d.client}</span></div>
                  <div><b style={{ color: 'var(--muted-fg)' }}>Site:</b> {d.site}</div>
                  <div><b style={{ color: 'var(--muted-fg)' }}>Contract Expiry:</b> <span style={{ fontWeight: 700 }}>{d.end}</span></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <button
                  className="btn primary"
                  style={{ flex: 1, fontSize: 11, fontWeight: 700, padding: '7px 10px' }}
                  onClick={() => onOpen(d.id)}
                >
                  Process Renewal
                </button>
                <button
                  className="btn"
                  style={{ fontSize: 11, padding: '7px 10px' }}
                  onClick={() => onOpen(d.id)}
                >
                  View Record
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
