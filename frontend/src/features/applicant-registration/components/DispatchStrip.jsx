// Individual stat cards (icon badge + value + label), matching the visual
// language already used on Client Management's dashboard stats — replaces
// the old single flat colored banner for consistency across subsystems.
export default function DispatchStrip({ counts, total }) {
  const items = [
    {
      label: 'Total Registered',
      value: total,
      color: 'var(--primary)',
      bg: 'var(--secondary)',
      icon: (
        <>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
          <path d="M18 8v6" />
          <path d="M15 11h6" />
        </>
      ),
    },
    {
      label: 'Awaiting Profiling',
      value: counts.registered,
      color: 'var(--muted-fg)',
      bg: 'var(--border-soft)',
      icon: (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </>
      ),
    },
    {
      label: 'In Profiling',
      value: counts.profiling,
      color: 'var(--blue)',
      bg: 'var(--blue-soft)',
      icon: (
        <>
          <rect x="4" y="3.5" width="16" height="17" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </>
      ),
    },
    {
      label: 'Profiled & Ready',
      value: counts.profiled,
      color: 'var(--primary)',
      bg: 'var(--secondary)',
      icon: (
        <>
          <path d="M8.5 12.5l2.5 2.5 5-6" />
          <circle cx="12" cy="12" r="8.5" />
        </>
      ),
    },
    {
      label: 'Sent to Recruitment',
      value: counts.sent,
      color: 'var(--green)',
      bg: 'var(--green-soft)',
      icon: (
        <>
          <path d="M5 12h13" />
          <path d="M13 6l6 6-6 6" />
        </>
      ),
    },
  ];

  return (
    <div className="arp-stats">
      {items.map((item) => (
        <div className="arp-stat-card" key={item.label}>
          <div className="arp-stat-icon" style={{ background: item.bg, color: item.color }}>
            <svg className="icon" viewBox="0 0 24 24">{item.icon}</svg>
          </div>
          <div className="arp-stat-value">{item.value}</div>
          <div className="arp-stat-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}