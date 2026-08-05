export default function ControlsBar({
  search,
  onSearchChange,
  clients,
  clientFilter,
  onClientFilterChange,
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
      {/* SEARCH INPUT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', flex: '1 1 240px', minWidth: 220 }}>
        <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15, color: 'var(--muted-fg)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          type="text"
          placeholder="Search employee, client, or site..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', width: '100%', fontFamily: 'inherit' }}
        />
      </div>

      {/* CLIENT FILTER DROPDOWN */}
      <select
        style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
        value={clientFilter}
        onChange={(e) => onClientFilterChange(e.target.value)}
      >
        <option value="all">All Clients</option>
        {clients.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
