import { useState, useMemo } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import ClientsTable from '../components/ClientsTable';
import ClientProfile from '../components/ClientProfile';
import { CLIENTS } from '../data/mockClients';
import { renewalStatus, isExpiringSoon } from '../utils/clientDisplay';
import './ClientManagementPage.css';

export default function ClientManagementPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [bellOpen, setBellOpen] = useState(false);

  // Contract Expiry Alerts — clients whose renewal date is coming up soon.
  const expiryAlerts = useMemo(() => {
    return CLIENTS
      .map((c, i) => ({ client: c, index: i, status: renewalStatus(c.renewal) }))
      .filter(({ client: c }) => isExpiringSoon(c.renewal))
      .sort((a, b) => (a.status.days ?? 0) - (b.status.days ?? 0));
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return CLIENTS
      .map((c, i) => ({ client: c, index: i }))
      .filter(({ client: c }) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (q && !c.name.toLowerCase().includes(q) && !c.industry.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [search, statusFilter]);

  const selectedClient = selectedIndex !== null ? CLIENTS[selectedIndex] : null;

  return (
    <div className="app" onClick={() => bellOpen && setBellOpen(false)}>
      <Sidebar
        activeItem="client-management"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="topbar">
          <div className="crumb">COMPANY NAME &nbsp;›&nbsp; <b>Client Management</b></div>
          <div className="search">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            Search Anything...
          </div>
          <div className="top-right">
            <div className="icon-btn bell-wrap" onClick={(e) => { e.stopPropagation(); setBellOpen((v) => !v); }}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
              {expiryAlerts.length > 0 && <div className="bell-badge">{expiryAlerts.length}</div>}
              {bellOpen && (
                <div className="bell-dropdown open" onClick={(e) => e.stopPropagation()}>
                  <div className="bell-dropdown-head">Contract Expiry Alerts <span>{expiryAlerts.length} upcoming</span></div>
                  <div className="bell-list">
                    {expiryAlerts.length ? expiryAlerts.map(({ client: c, index, status }) => (
                      <div
                        className="bell-item"
                        key={index}
                        onClick={() => { setSelectedIndex(index); setBellOpen(false); }}
                      >
                        <div className="bell-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg>
                        </div>
                        <div>
                          <div className="bell-text-title">{c.name}</div>
                          <div className="bell-text-sub">Contract expires in {status.days} day{status.days === 1 ? '' : 's'} · {c.renewal}</div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '14px', fontSize: 11.5, color: 'var(--muted)' }}>No contracts expiring soon.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="who">
              <div className="avatar" style={{ background: 'var(--blue)' }}>N</div>
              <div>
                <div className="who-name">Name of Administrator</div>
                <div className="who-date">Today, JULY 30, 2026</div>
              </div>
            </div>
          </div>
        </div>

        <div className="title-row">
          <h1 className="page-title">Client Management</h1>
          <div className="page-sub">{CLIENTS.length} registered clients</div>
        </div>

        <div className="workspace">
          {!selectedClient ? (
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Clients</div>
                <button className="btn primary">
                  <svg className="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                  Add Client
                </button>
              </div>
              <div className="filter-bar">
                <div className="filter-search">
                  <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="chip"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <ClientsTable clients={filteredClients} onSelect={setSelectedIndex} />
            </div>
          ) : (
            <ClientProfile
              client={selectedClient}
              clientIndex={selectedIndex}
              onBack={() => setSelectedIndex(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}