import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientsDeploymentTable from '../components/ClientsDeploymentTable';
import ClientDeploymentProfile from '../components/ClientDeploymentProfile';
import ComplianceModal from '../components/ComplianceModal';
import DeploymentSlipModal from '../components/DeploymentSlipModal';
import RenewalModal from '../components/RenewalModal';
import RecordDetailsModal from '../components/RecordDetailsModal';
import NewDeploymentModal from '../components/NewDeploymentModal';
import { useDeploymentAssignmentStore } from '../store/DeploymentAssignmentStore';
import { JOB_ORDER_OPTIONS, daysLeft } from '../services/DeploymentAssignmentService';
import '../pages/DeploymentAssignmentPage.css';
import '../../client-management/pages/ClientManagementPage.css';

export default function DeploymentAssignmentPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };

  // Selected Client Drill-down state
  const [selectedClientName, setSelectedClientName] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('all');

  // Active focused modal: null | 'compliance' | 'slip' | 'renewal' | 'details'
  const [activeModal, setActiveModal] = useState(null);
  const [activeRecordId, setActiveRecordId] = useState(null);

  const {
    deployments,
    stats,
    modalOpen,
    setModalOpen,
    setStage,
    toggleRequirement,
    extendContract,
    addDeployment,
  } = useDeploymentAssignmentStore();

  // Aggregate Client list with deployment stats
  const clientDeploymentList = useMemo(() => {
    const defaultClients = [
      { name: 'ABC Logistics', industry: 'Warehousing & Logistics', site: 'Valenzuela Logistics Hub, NCR', supervisor: 'Karla Reyes', supervisorContact: '+63 917 555 1234', renewal: 'Sep 30, 2026' },
      { name: 'Seda Vertis North', industry: 'Hospitality & Hotels', site: 'Vertis North, Quezon City', supervisor: 'Cecille Lim', supervisorContact: '+63 917 555 0192', renewal: 'Oct 03, 2026' },
      { name: 'Vikings Luxury Buffet', industry: 'Food & Beverage', site: 'SM Mall of Asia, Pasay City', supervisor: 'Marco Santos', supervisorContact: '+63 918 333 4455', renewal: 'Nov 15, 2026' },
      { name: 'City Garden Hotel', industry: 'Hospitality & Lodging', site: 'P Burgos St, Makati City', supervisor: 'Dennis Ocampo', supervisorContact: '+63 917 444 8899', renewal: 'Oct 05, 2026' },
      { name: 'Y2 Hotel Residence', industry: 'Hospitality & Suites', site: 'Makati Avenue, Makati City', supervisor: 'Jasmine Uy', supervisorContact: '+63 920 111 2233', renewal: 'Dec 01, 2026' },
      { name: 'Delta Manufacturing', industry: 'Manufacturing & Industrial', site: 'Caloocan Industrial Estate', supervisor: 'Manuel Sy', supervisorContact: '+63 919 777 6655', renewal: 'Aug 05, 2026' },
      { name: 'Northline BPO', industry: 'Business Process Outsourcing', site: 'Ayala Ave, Makati City', supervisor: 'Cynthia Soriano', supervisorContact: '+63 917 888 9900', renewal: 'Nov 15, 2026' },
    ];

    return defaultClients.map((c) => {
      const assignedStaff = deployments.filter((d) => d.client === c.name);
      const joList = JOB_ORDER_OPTIONS.filter((j) => j.client === c.name);
      const activeOnSite = assignedStaff.filter((d) => d.stage === 'on_site' || d.stage === 'for_renewal').length;

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

      const days = daysLeft(c.renewal);
      const isExpiring = days <= 90;

      let matchesStatus = true;
      if (clientStatusFilter === 'expiring') {
        matchesStatus = isExpiring;
      } else if (clientStatusFilter === 'active') {
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

  function handleOpenCompliance(id) {
    setActiveRecordId(id);
    setActiveModal('compliance');
  }

  function handleOpenSlip(id) {
    setActiveRecordId(id);
    setActiveModal('slip');
  }

  function handleOpenRenewal(id) {
    setActiveRecordId(id);
    setActiveModal('renewal');
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
              {stats.total} personnel assigned &nbsp;·&nbsp; {clientDeploymentList.length} client accounts &nbsp;·&nbsp; Client-First Staffing Hierarchy
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
                    Client Accounts
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                    Select a client to view their Job Orders and assigned Deployed Personnel
                  </div>
                </div>

                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted-fg)' }}>
                  Total Accounts: <b>{clientDeploymentList.length}</b>
                </span>
              </div>

              {/* FILTER BAR MATCHING CLIENT MANAGEMENT */}
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
                    placeholder="Search clients, industry, or site..."
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
                  <option value="active">Active Clients</option>
                  <option value="expiring">3-Month Renewal Alerts</option>
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
              onOpenCompliance={handleOpenCompliance}
              onOpenSlip={handleOpenSlip}
              onOpenRenewal={handleOpenRenewal}
              onOpenRecord={handleOpenDetails}
              onNewDeployment={() => setModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* MODAL 1: PRE-DEPLOYMENT COMPLIANCE CHECKLIST */}
      <ComplianceModal
        deployment={activeRecord}
        open={activeModal === 'compliance'}
        onClose={handleCloseModal}
        onToggleRequirement={toggleRequirement}
        onAdvanceStage={setStage}
      />

      {/* MODAL 2: OFFICIAL DEPLOYMENT SLIP & ENDORSEMENT PASS */}
      <DeploymentSlipModal
        deployment={activeRecord}
        open={activeModal === 'slip'}
        onClose={handleCloseModal}
        onAdvanceStage={setStage}
      />

      {/* MODAL 3: CONTRACT RENEWAL & REDEPLOYMENT DIALOG */}
      <RenewalModal
        deployment={activeRecord}
        open={activeModal === 'renewal'}
        onClose={handleCloseModal}
        onExtendContract={extendContract}
        onAdvanceStage={setStage}
      />

      {/* MODAL 4: COMPLETE DEPLOYMENT AUDIT DETAILS */}
      <RecordDetailsModal
        deployment={activeRecord}
        open={activeModal === 'details'}
        onClose={handleCloseModal}
        onOpenCompliance={handleOpenCompliance}
        onOpenSlip={handleOpenSlip}
        onOpenRenewal={handleOpenRenewal}
        onAdvanceStage={setStage}
      />

      {/* MODAL 5: NEW DEPLOYMENT SCHEDULE INTAKE */}
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
