import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientsDeploymentTable from '../components/ClientsDeploymentTable';
import ClientDeploymentProfile from '../components/ClientDeploymentProfile';
import DeploymentSlipModal from '../components/DeploymentSlipModal';
import RecordDetailsModal from '../components/RecordDetailsModal';
import NewDeploymentModal from '../components/NewDeploymentModal';
import { useDeploymentAssignmentStore } from '../store/DeploymentAssignmentStore';
import { JOB_ORDER_OPTIONS } from '../services/DeploymentAssignmentService';
import '../pages/DeploymentAssignmentPage.css';
import '../../client-management/pages/ClientManagementPage.css';

export default function DeploymentAssignmentPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };

  // Selected Client Drill-down state
  const [selectedClientName, setSelectedClientName] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');

  // Active focused modal: null | 'slip' | 'details'
  const [activeModal, setActiveModal] = useState(null);
  const [activeRecordId, setActiveRecordId] = useState(null);

  const {
    deployments,
    stats,
    modalOpen,
    setModalOpen,
    setStage,
    addDeployment,
  } = useDeploymentAssignmentStore();

  // Aggregate Client list with deployment stats
  const clientDeploymentList = useMemo(() => {
    const defaultClients = [
      { name: 'ABC Logistics', industry: 'Warehousing & Logistics', site: 'Valenzuela Logistics Hub, NCR', supervisor: 'Karla Reyes', supervisorContact: '+63 917 555 1234' },
      { name: 'Seda Vertis North', industry: 'Hospitality & Hotels', site: 'Vertis North, Astra cor. Lux Drive, QC', supervisor: 'Cecille Lim', supervisorContact: '+63 917 555 0192' },
      { name: 'Vikings Luxury Buffet', industry: 'Food & Beverage', site: 'SM Mall of Asia, Seaside Blvd, Pasay City', supervisor: 'Marco Santos', supervisorContact: '+63 918 333 4455' },
      { name: 'City Garden Hotel', industry: 'Hospitality & Lodging', site: 'P. Burgos cor. Makati Ave, Makati City', supervisor: 'Dennis Ocampo', supervisorContact: '+63 917 444 8899' },
      { name: 'Y2 Hotel Residence', industry: 'Hospitality & Suites', site: 'Santiago cor. Valdez St, Makati City', supervisor: 'Jasmine Uy', supervisorContact: '+63 920 111 2233' },
      { name: 'Delta Manufacturing', industry: 'Manufacturing & Industrial', site: 'Caloocan Industrial Estate, Metro Manila', supervisor: 'Manuel Sy', supervisorContact: '+63 919 777 6655' },
      { name: 'Northline BPO', industry: 'Business Process Outsourcing', site: 'PBCom Tower, Ayala Ave, Makati City', supervisor: 'Cynthia Soriano', supervisorContact: '+63 917 888 9900' },
    ];

    return defaultClients.map((c) => {
      const assignedStaff = deployments.filter((d) => d.client === c.name);
      const joList = JOB_ORDER_OPTIONS.filter((j) => j.client === c.name);
      const activeOnSite = assignedStaff.filter((d) => d.stage === 'on_site').length;

      return {
        ...c,
        status: 'active',
        deployedCount: assignedStaff.length,
        activeOnSite,
        jobOrdersCount: joList.length || 1,
      };
    });
  }, [deployments]);

  // Filtered Client List for Level 1
  const filteredClientList = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    return clientDeploymentList.filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.site.toLowerCase().includes(q);

      let matchesStatus = true;
      if (clientStatusFilter === 'active') {
        matchesStatus = c.status === 'active';
      }

      return matchesQ && matchesStatus;
    });
  }, [clientDeploymentList, clientSearch, clientStatusFilter]);

  // Selected client object
  const selectedClientData = useMemo(() => {
    if (!selectedClientName) return null;
    return clientDeploymentList.find((c) => c.name === selectedClientName) || null;
  }, [selectedClientName, clientDeploymentList]);

  // Active record for modals
  const activeRecord = deployments.find((d) => d.id === activeRecordId) || null;

  function handleOpenSlip(id) {
    setActiveRecordId(id);
    setActiveModal('slip');
  }

  function handleOpenDetails(id) {
    setActiveRecordId(id);
    setActiveModal('details');
  }

  function handleCloseModal() {
    setActiveModal(null);
  }

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        {/* TOP TITLE ROW */}
        <div className="title-row">
          <div>
            <div className="crumb" style={{ marginBottom: 4 }}>
              Talent &amp; Deployment &nbsp;·&nbsp; <b>Deployment &amp; Assignment</b>
            </div>
            <h1 className="page-title">Deployment &amp; Assignment</h1>
            <div className="page-sub">
              {stats.total} personnel assigned &nbsp;·&nbsp; {clientDeploymentList.length} client accounts &nbsp;·&nbsp; Deployment &amp; Site Tracking
            </div>
          </div>

          <button className="btn primary" onClick={() => setModalOpen(true)}>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            + New Deployment Schedule
          </button>
        </div>

        {/* MASTER DRILL-DOWN WORKSPACE (LEVEL 1 vs LEVEL 2/3) */}
        <div className="workspace">
          {!selectedClientData ? (
            /* LEVEL 1: CLIENTS DIRECTORY TABLE */
            <div className="panel" style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
              <div
                className="panel-head"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg)',
                }}
              >
                <div>
                  <div className="panel-title" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                    Client Accounts &amp; Deployment Directory
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                    Select a client account to view active Job Orders, site facilities, and assigned personnel
                  </div>
                </div>

                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted-fg)' }}>
                  Total Accounts: <b>{clientDeploymentList.length}</b>
                </span>
              </div>

              {/* FILTER BAR */}
              <div
                className="filter-bar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-soft)',
                  background: 'var(--panel)',
                }}
              >
                <div
                  className="filter-search"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '7px 12px',
                    width: 320,
                  }}
                >
                  <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14, color: 'var(--muted-fg)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                  <input
                    type="text"
                    placeholder="Search client, industry, or facility site..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', width: '100%' }}
                  />
                  {clientSearch && (
                    <button type="button" onClick={() => setClientSearch('')} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', cursor: 'pointer' }}>
                      ✕
                    </button>
                  )}
                </div>

                <select
                  className="chip"
                  style={{ padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                  value={clientStatusFilter}
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                >
                  <option value="all">All Accounts ({clientDeploymentList.length})</option>
                  <option value="active">Active Client Accounts</option>
                </select>
              </div>

              {/* CLIENTS TABLE */}
              <ClientsDeploymentTable
                clientList={filteredClientList}
                onSelectClient={setSelectedClientName}
              />
            </div>
          ) : (
            /* LEVEL 2 & 3: CLIENT PROFILE > JOB ORDERS > DEPLOYED PERSONNEL */
            <ClientDeploymentProfile
              clientData={selectedClientData}
              deployments={deployments}
              onBack={() => setSelectedClientName(null)}
              onOpenSlip={handleOpenSlip}
              onOpenRecord={handleOpenDetails}
              onNewDeployment={() => setModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* MODAL 1: OFFICIAL DEPLOYMENT SLIP & ENDORSEMENT PASS */}
      <DeploymentSlipModal
        deployment={activeRecord}
        open={activeModal === 'slip'}
        onClose={handleCloseModal}
        onAdvanceStage={setStage}
      />

      {/* MODAL 2: COMPLETE DEPLOYMENT AUDIT DETAILS (READ-ONLY DOSSIER) */}
      <RecordDetailsModal
        deployment={activeRecord}
        open={activeModal === 'details'}
        onClose={handleCloseModal}
        onOpenSlip={handleOpenSlip}
        onAdvanceStage={setStage}
      />

      {/* MODAL 3: NEW DEPLOYMENT SCHEDULE INTAKE */}
      <NewDeploymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(payload) => {
          addDeployment(payload);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
