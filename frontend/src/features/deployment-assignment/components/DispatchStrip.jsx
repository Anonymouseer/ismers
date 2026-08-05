export default function DispatchStrip({ stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
      {/* TOTAL DEPLOYMENTS */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Total Deployments
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
          {stats.total}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>Across {stats.clientCount} clients</div>
      </div>

      {/* ACTIVE ON-SITE */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Active On-Site
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
          {stats.active}
        </div>
        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginTop: 2 }}>Currently assigned on-site</div>
      </div>

      {/* RENEWAL ALERTS */}
      <div style={{ background: 'var(--amber-soft)', border: '1px solid var(--amber)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          3-Month Renewal Alerts
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--amber)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
          {stats.endingSoon || 3}
        </div>
        <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 700, marginTop: 2 }}>Contracts expiring soon</div>
      </div>

      {/* AVG PERFORMANCE */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Avg Performance
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--green)', marginTop: 4, fontFamily: 'var(--font-display)' }}>
          {stats.avgScore}%
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>Based on attendance logs</div>
      </div>
    </div>
  );
}
