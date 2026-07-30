import { STATUS_ORDER, STATUS_META } from '../services/JobOrderManagementService';

export default function ControlsBar({
  search, setSearch,
  clientFilter, setClientFilter, clients,
  sortMode, setSortMode,
  selectMode, onToggleSelectMode,
  onExportCsv,
  activeStatus, setActiveStatus,
}) {
  const statusOptions = [{ v: 'all', label: 'All' }, ...STATUS_ORDER.map((s) => ({ v: s, label: STATUS_META[s].label }))];

  return (
    <div className="controls-bar">
      <div className="filter-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <input
          type="text"
          placeholder="Search title, client, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <select className="chip" value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
        <option value="all">All Clients</option>
        {clients.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className="chip" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
        <option value="deadline">Sort: Deadline (soonest)</option>
        <option value="priority">Sort: Priority</option>
        <option value="fill">Sort: Fill %</option>
        <option value="newest">Sort: Newest</option>
      </select>

      <button className={`toolbar-toggle${selectMode ? ' active' : ''}`} onClick={onToggleSelectMode}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
        Select
      </button>

      <button className="toolbar-toggle" onClick={onExportCsv}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12m0 0-4-4m4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
        Export
      </button>

      <div className="status-toggles">
        {statusOptions.map((o) => {
          const meta = STATUS_META[o.v];
          const isActive = o.v === activeStatus;
          return (
            <button
              key={o.v}
              className={`status-toggle${isActive ? ' active' : ''}`}
              style={isActive ? { background: meta ? meta.color : 'var(--ink)' } : undefined}
              onClick={() => setActiveStatus(o.v)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}