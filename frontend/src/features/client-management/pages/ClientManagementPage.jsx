import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientsTable from '../components/ClientsTable';
import ClientProfile from '../components/ClientProfile';
import { useClientManagementStore } from '../store/ClientManagementStore';
import { renewalStatus, isExpiringSoon } from '../utils/clientDisplay';
import './ClientManagementPage.css';

export default function ClientManagementPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const { clients, updateClientStatus } = useClientManagementStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [bellOpen, setBellOpen] = useState(false);

  // Contract Expiry Alerts — clients whose renewal date is coming up soon.
  const expiryAlerts = useMemo(() => {
    return clients
      .map((c, i) => ({ client: c, index: i, status: renewalStatus(c.renewal) }))
      .filter(({ client: c }) => isExpiringSoon(c.renewal))
      .sort((a, b) => (a.status.days ?? 0) - (b.status.days ?? 0));
  }, [clients]);

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients
      .map((c, i) => ({ client: c, index: i }))
      .filter(({ client: c }) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (q && !c.name.toLowerCase().includes(q) && !c.industry.toLowerCase().includes(q)) return false;
        return true;
      });
  }, [clients, search, statusFilter]);

  const selectedClient = selectedIndex !== null ? clients[selectedIndex] : null;

  return (
    <div className="app" onClick={() => bellOpen && setBellOpen(false)}>
      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="title-row">
          <h1 className="page-title">Client Management</h1>
          <div className="page-sub">{clients.length} registered corporate accounts</div>
        </div>

        <div className="workspace">
          {!selectedClient ? (
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Clients</div>
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
              <ClientsTable
                clients={filteredClients}
                onSelect={setSelectedIndex}
                onUpdateStatus={updateClientStatus}
              />
            </div>
          ) : (
            <ClientProfile
              client={selectedClient}
              clientIndex={selectedIndex}
              onBack={() => setSelectedIndex(null)}
              onUpdateStatus={updateClientStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}