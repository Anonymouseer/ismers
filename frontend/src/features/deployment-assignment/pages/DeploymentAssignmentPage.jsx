import { useState, useEffect } from 'react';
import { useLocation, useOutletContext } from 'react-router-dom';
import DispatchStrip from '../components/DispatchStrip';
import ControlsBar from '../components/ControlsBar';
import Board from '../components/Board';
import StaffTableView from '../components/StaffTableView';
import RenewalsAlertView from '../components/RenewalsAlertView';
import DeploymentDrawer from '../components/DeploymentDrawer';
import NewDeploymentModal from '../components/NewDeploymentModal';
import { useDeploymentAssignmentStore } from '../store/DeploymentAssignmentStore';
import '../../../components/layout/Sidebar.css';
import './DeploymentAssignmentPage.css';

const TODAY_LABEL = new Date(2026, 6, 24).toLocaleDateString('en-US', {
  month: 'long',
  day: '2-digit',
  year: 'numeric',
});

export default function DeploymentAssignmentPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const location = useLocation();
  const [activeView, setActiveView] = useState('table'); // Default to 'table' for maximum performance with high-volume data!

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewParam = params.get('view');
    if (viewParam && ['board', 'table', 'renewals'].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [location.search]);

  const {
    deployments,
    filtered,
    clients,
    stats,
    selected,
    activeStatus,
    setActiveStatus,
    search,
    setSearch,
    clientFilter,
    setClientFilter,
    drawerOpen,
    modalOpen,
    setModalOpen,
    openDetail,
    closeDetail,
    setStage,
    logEntry,
    addDeployment,
  } = useDeploymentAssignmentStore();

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="topbar">
          <div className="crumb">PRIMEPOWER MANPOWER &nbsp;›&nbsp; Talent & Deployment &nbsp;›&nbsp; <b>Deployment & Assignment</b></div>
          <div className="search">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            Search Anything...
          </div>
          <div className="top-right">
            <div className="icon-btn">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}>
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </div>
            <div className="who">
              <div className="avatar" style={{ background: 'var(--ink)' }}>N</div>
              <div>
                <div className="who-name">Name of Administrator</div>
                <div className="who-date">{TODAY_LABEL}</div>
              </div>
            </div>
          </div>
        </div>

        {/* TITLE ROW */}
        <div className="title-row">
          <div>
            <div className="eyebrow">Core 1 · Deployment &amp; Assignment</div>
            <h1 className="page-title">Deployed Staff Directory</h1>
            <div className="page-sub">{stats.total} tracked staff assignments across {stats.clientCount} clients</div>
          </div>

          <button className="btn primary" onClick={() => setModalOpen(true)}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            New Deployment
          </button>
        </div>

        <DispatchStrip stats={stats} />

        <ControlsBar
          search={search}
          onSearchChange={setSearch}
          clients={clients}
          clientFilter={clientFilter}
          onClientFilterChange={setClientFilter}
          activeStatus={activeStatus}
          onActiveStatusChange={setActiveStatus}
        />

        {/* HIGH-PERFORMANCE DYNAMIC VIEW ROUTING */}
        {activeView === 'board' && (
          <Board deployments={filtered} activeStatus={activeStatus} onOpen={openDetail} />
        )}
        {activeView === 'renewals' && (
          <RenewalsAlertView deployments={filtered} onOpen={openDetail} />
        )}
        {activeView === 'table' && (
          <StaffTableView deployments={filtered} onOpen={openDetail} />
        )}
      </div>

      <DeploymentDrawer
        deployment={selected}
        open={drawerOpen}
        onClose={closeDetail}
        onAdvanceStage={setStage}
        onLogEntry={logEntry}
      />

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
