export default function DispatchStrip({ counts, total }) {
  const items = [
    { label: 'Total Registered', value: total },
    { label: 'Awaiting Profiling', value: counts.registered },
    { label: 'In Profiling', value: counts.profiling },
    { label: 'Profiled & Ready', value: counts.profiled },
    { label: 'Sent to Recruitment', value: counts.sent },
  ];

  return (
    <div className="dispatch-strip">
      {items.map((item) => (
        <div className="dispatch-metric" key={item.label}>
          <div className="dispatch-value">{item.value}</div>
          <div className="dispatch-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
