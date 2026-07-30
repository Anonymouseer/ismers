import { STATUS_META, STATUS_ORDER } from '../services/DeploymentAssignmentService';

export default function ControlsBar({
  search,
  onSearchChange,
  clients,
  clientFilter,
  onClientFilterChange,
  activeStatus,
  onActiveStatusChange,
}) {
  const toggles = [{ v: 'all', label: 'All' }, ...STATUS_ORDER.map((s) => ({ v: s, label: STATUS_META[s].label }))];

  return (
    <div className="controls-bar">
      <div className="filter-search">
        <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          type="text"
          placeholder="Search employee, client, or site..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <select className="chip" value={clientFilter} onChange={(e) => onClientFilterChange(e.target.value)}>
        <option value="all">All Clients</option>
        {clients.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <div className="status-toggles">
        {toggles.map((o) => {
          const meta = STATUS_META[o.v];
          const isActive = o.v === activeStatus;
          return (
            <button
              key={o.v}
              type="button"
              className={`status-toggle${isActive ? ' active' : ''}`}
              style={isActive ? { background: meta ? meta.color : 'var(--ink)' } : undefined}
              onClick={() => onActiveStatusChange(o.v)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
