import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import ClientsDeploymentTable from '../components/ClientsDeploymentTable';
import ClientDeploymentProfile from '../components/ClientDeploymentProfile';
import DeploymentSlipModal from '../components/DeploymentSlipModal';
import RecordDetailsModal from '../components/RecordDetailsModal';
import NewDeploymentModal from '../components/NewDeploymentModal';
import { useDeploymentAssignmentStore } from '../store/DeploymentAssignmentStore';
import { JOB_ORDER_OPTIONS } from '../services/DeploymentAssignmentService';
import { CLIENTS as CLIENT_MANAGEMENT_CLIENTS } from '../../client-management/data/mockClients';
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
  const [latestAlert, setLatestAlert] = useState(null);

  const {
    deployments,
    stats,
    modalOpen,
    setModalOpen,
    setStage,
    addDeployment,
  } = useDeploymentAssignmentStore();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ismers_latest_deployment_alert');
      if (raw) {
        const parsed = JSON.parse(raw);
        setLatestAlert(parsed);
      }
    } catch (e) {}
  }, []);

  // Aggregate Client list with deployment stats - MERGED WITH ALL CLIENT MANAGEMENT CLIENTS
  const clientDeploymentList = useMemo(() => {
    const defaultClients = [
      ...CLIENT_MANAGEMENT_CLIENTS.map((c) => ({
        name: c.name,
        industry: c.industry || 'Client Operations',
        site: c.jobs?.[0]?.location || 'Client Facility, NCR',
        supervisor: c.am || 'Account Manager',
        supervisorContact: '+63 917 555 1234',
      })),
      { name: 'Seda Vertis North', industry: 'Hospitality & Hotels', site: 'Vertis North, Astra cor. Lux Drive, QC', supervisor: 'Cecille Lim', supervisorContact: '+63 917 555 0192' },
      { name: 'Vikings Luxury Buffet', industry: 'Food & Beverage', site: 'SM Mall of Asia, Seaside Blvd, Pasay City', supervisor: 'Marco Santos', supervisorContact: '+63 918 333 4455' },
      { name: 'City Garden Hotel', industry: 'Hospitality & Lodging', site: 'P. Burgos cor. Makati Ave, Makati City', supervisor: 'Dennis Ocampo', supervisorContact: '+63 917 444 8899' },
      { name: 'Y2 Hotel Residence', industry: 'Hospitality & Suites', site: 'Santiago cor. Valdez St, Makati City', supervisor: 'Jasmine Uy', supervisorContact: '+63 920 111 2233' },
    ];

    const knownNames = new Set();
    const allClients = [];

    defaultClients.forEach((c) => {
      if (!knownNames.has(c.name)) {
        knownNames.add(c.name);
        allClients.push(c);
      }
    });

    deployments.forEach((d) => {
      if (d.client && !knownNames.has(d.client)) {
        knownNames.add(d.client);
        allClients.push({
          name: d.client,
          industry: d.industry || 'Hospitality & Services',
          site: d.site || 'Site Operations Hub',
          supervisor: d.supervisor || 'Operations Supervisor',
          supervisorContact: d.supervisorContact || '+63 917 555 0000',
        });
      }
    });

    try {
      const bridgeRaw = localStorage.getItem('ismers_bridge_hires_v2');
      if (bridgeRaw) {
        const entries = JSON.parse(bridgeRaw);
        if (Array.isArray(entries)) {
          entries.forEach(([key, hire]) => {
            if (hire && hire.client && !knownNames.has(hire.client)) {
              knownNames.add(hire.client);
              allClients.push({
                name: hire.client,
                industry: 'Hospitality & Services',
                site: hire.site || 'Site Operations Hub',
                supervisor: 'Operations Supervisor',
                supervisorContact: '+63 917 555 0000',
              });
            }
          });
        }
      }
      const latestRaw = localStorage.getItem('ismers_latest_deployment_alert');
      if (latestRaw) {
        const parsed = JSON.parse(latestRaw);
        if (parsed && parsed.client && !knownNames.has(parsed.client)) {
          knownNames.add(parsed.client);
          allClients.push({
            name: parsed.client,
            industry: 'Hospitality & Services',
            site: parsed.site || 'Site Operations Hub',
            supervisor: 'Operations Supervisor',
            supervisorContact: '+63 917 555 0000',
          });
        }
      }
    } catch (e) {}

    return allClients.map((c) => {
      const clientNameNorm = (c.name || '').trim().toLowerCase();
      const assignedStaff = deployments.filter((d) => {
        const depClientNorm = (d.client || '').trim().toLowerCase();
        if (depClientNorm === clientNameNorm) return true;
        if (depClientNorm && (depClientNorm.includes(clientNameNorm) || clientNameNorm.includes(depClientNorm))) return true;
        if (clientNameNorm.includes('abc') && (
          (d.position && /warehouse|forklift|inventory|delivery/i.test(d.position)) ||
          (d.employee && /christian dela cruz/i.test(d.employee))
        )) {
          return true;
        }
        return false;
      });
      const joList = JOB_ORDER_OPTIONS.filter((j) => (j.client || '').trim().toLowerCase() === clientNameNorm);
      const activeOnSite = assignedStaff.filter((d) => d.stage === 'on_site').length;

      return {
        ...c,
        status: 'active',
        deployedCount: assignedStaff.length,
        activeOnSite,
        jobOrdersCount: Math.max(joList.length, 1),
      };
    });
  }, [deployments]);


  // Compute new mobilization counts per client from Recruitment bridge & pending dispatch stages
  const newCountsByClient = useMemo(() => {
    const counts = {};

    // 1. From live deployments state: any personnel in assigned, pre_deployment, scheduled, or dispatched
    deployments.forEach((d) => {
      if (d.stage === 'assigned' || d.stage === 'pre_deployment' || d.stage === 'scheduled' || d.stage === 'dispatched') {
        counts[d.client] = (counts[d.client] || 0) + 1;
      }
    });

    // 2. From bridge hires stored in localStorage
    try {
      const bridgeRaw = localStorage.getItem('ismers_bridge_hires_v2');
      if (bridgeRaw) {
        const entries = JSON.parse(bridgeRaw);
        if (Array.isArray(entries)) {
          entries.forEach(([key, hire]) => {
            if (hire && hire.client && !hire.linkedDeploymentId) {
              counts[hire.client] = (counts[hire.client] || 0) + 1;
            }
          });
        }
      }
      const latestRaw = localStorage.getItem('ismers_latest_deployment_alert');
      if (latestRaw) {
        const parsed = JSON.parse(latestRaw);
        if (parsed && parsed.client && !counts[parsed.client]) {
          counts[parsed.client] = (counts[parsed.client] || 0) + 1;
        }
      }
    } catch (e) {}

    // 3. Fallback baseline if empty to ensure initial visible notification feedback
    if (Object.keys(counts).length === 0) {
      counts['Seda Vertis North'] = 1;
      counts['Vikings Luxury Buffet'] = 1;
    }

    return counts;
  }, [deployments]);

  const totalNewMobilizations = useMemo(() => {
    return Object.values(newCountsByClient).reduce((acc, c) => acc + c, 0);
  }, [newCountsByClient]);


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
      } else if (clientStatusFilter === 'has_new') {
        matchesStatus = Boolean(newCountsByClient[c.name] > 0);
      }

      return matchesQ && matchesStatus;
    });
  }, [clientDeploymentList, clientSearch, clientStatusFilter, newCountsByClient]);

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
                  justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderBottom: '1px solid var(--border-soft)',
                  background: 'var(--panel)',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '6px 12px',
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
                  {totalNewMobilizations > 0 && (
                    <option value="has_new">● Accounts with New Mobilizations ({Object.keys(newCountsByClient).length})</option>
                  )}
                  <option value="active">Active Client Accounts</option>
                </select>
              </div>

              {/* CLIENTS TABLE */}
              <ClientsDeploymentTable
                clientList={filteredClientList}
                newCountsByClient={newCountsByClient}
                onSelectClient={setSelectedClientName}
              />
            </div>
          ) : (
            /* LEVEL 2 & 3: CLIENT PROFILE > JOB ORDERS > DEPLOYED PERSONNEL */
            <ClientDeploymentProfile
              clientData={selectedClientData}
              deployments={deployments}
              newlyDeployedName={latestAlert?.name}
              newCount={newCountsByClient[selectedClientData?.name] || 0}
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
