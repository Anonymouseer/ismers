import { useState, useMemo } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import ClientCard from '../components/ClientCard';
import ClientDetailPanel from '../components/ClientDetailPanel';
import { CLIENTS } from '../data/mockClients';
import './ClientManagementPage.css';

export default function ClientManagementPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);

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
    <div className="app">
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
            <div className="icon-btn">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
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

        <div className={`workspace${selectedClient ? ' has-selection' : ''}`}>
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
              </select>
            </div>
            <div className="client-list">
              {filteredClients.length ? (
                filteredClients.map(({ client, index }) => (
                  <ClientCard
                    key={index}
                    client={client}
                    index={index}
                    selected={selectedIndex === index}
                    onSelect={setSelectedIndex}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted)', fontSize: 11.5, padding: '20px 0' }}>
                  No clients match your filters.
                </div>
              )}
            </div>
          </div>

          <div className="detail-wrap">
            {!selectedClient ? (
              <div className="detail-empty">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></svg>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Select a client to view details</div>
                <div style={{ fontSize: 11 }}>Contract info, job orders, contacts, and activity will appear here</div>
              </div>
            ) : (
              <ClientDetailPanel
                client={selectedClient}
                clientIndex={selectedIndex}
                onClose={() => setSelectedIndex(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}