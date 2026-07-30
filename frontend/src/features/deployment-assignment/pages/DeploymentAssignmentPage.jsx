import { useState } from 'react';
import Sidebar from '../../../components/layout/Sidebar';
import DispatchStrip from '../components/DispatchStrip';
import ControlsBar from '../components/ControlsBar';
import Board from '../components/Board';
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
  const [collapsed, setCollapsed] = useState(false);

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
      <Sidebar
        activeItem="deployment-assignment"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="topbar">
          <div className="crumb">COMPANY_NAME &nbsp;/&nbsp; recruitment &nbsp;/&nbsp; <b>deployments</b></div>
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

        <div className="title-row">
          <div>
            <div className="eyebrow">Core 1 · Deployment & Assignment</div>
            <h1 className="page-title">Deployment Dispatch Board</h1>
            <div className="page-sub">{stats.total} tracked deployments across {stats.clientCount} clients</div>
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

        <Board deployments={filtered} activeStatus={activeStatus} onOpen={openDetail} />
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
