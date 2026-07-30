import { useState } from 'react';
import Sidebar from '../../../components/layout/Sidebar'; // adjust path if your shared Sidebar lives elsewhere
import useJobOrderManagementStore from '../store/JobOrderManagementStore';
import DispatchStrip from '../components/DispatchStrip';
import ControlsBar from '../components/ControlsBar';
import BulkBar from '../components/BulkBar';
import JobOrderBoard from '../components/JobOrderBoard';
import JobOrderDrawer from '../components/JobOrderDrawer';
import JobOrderModal from '../components/JobOrderModal';
import './JobOrderManagement.css';

export default function JobOrderManagementPage() {
  const [collapsed, setCollapsed] = useState(false);
  const store = useJobOrderManagementStore();

  const currentJob = store.getJob(store.currentRef);

  const stageActions = {
    stageApprove: store.stageApprove,
    stageReject: store.stageReject,
    stageRevise: store.stageRevise,
    stageActivate: store.stageActivate,
    stageCheckStaff: store.stageCheckStaff,
    stageAssign: store.stageAssign,
    stageSchedule: store.stageSchedule,
    stageReport: store.stageReport,
    stageStart: store.stageStart,
    stageMonitor: store.stageMonitor,
    stageComplete: store.stageComplete,
    stageClose: store.stageClose,
  };

  if (store.loading) {
    return (
      <div className="app">
        <Sidebar activeItem="job-order-management" collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <div className={`main${collapsed ? ' collapsed' : ''}`}>
          <div className="page-sub">Loading job orders…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar activeItem="job-order-management" collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />

      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="topbar">
          <div className="crumb">COMPANY_NAME &nbsp;/&nbsp; recruitment &nbsp;/&nbsp; <b>job-orders</b></div>
          <div className="search">
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 15, height: 15 }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            Search Anything...
          </div>
          <div className="top-right">
            <div className="icon-btn">
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 16, height: 16 }}><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            </div>
            <div className="who">
              <div className="avatar" style={{ background: 'var(--ink)' }}>N</div>
              <div>
                <div className="who-name">Name of Administrator</div>
                <div className="who-date">Jul 24, 2026</div>
              </div>
            </div>
          </div>
        </div>

        <div className="title-row">
          <div>
            <div className="eyebrow">Core 1 · Job Order Management</div>
            <h1 className="page-title">Job Order Dispatch Board</h1>
            <div className="page-sub">
              {store.stats.total} active job orders across {store.stats.clientCount} clients
            </div>
          </div>
          <button className="btn primary" onClick={store.openCreateModal}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
            New Job Order
          </button>
        </div>

        <DispatchStrip stats={store.stats} />

        <ControlsBar
          search={store.search} setSearch={store.setSearch}
          clientFilter={store.clientFilter} setClientFilter={store.setClientFilter} clients={store.clients}
          sortMode={store.sortMode} setSortMode={store.setSortMode}
          selectMode={store.selectMode} onToggleSelectMode={store.toggleSelectMode}
          onExportCsv={store.exportCsv}
          activeStatus={store.activeStatus} setActiveStatus={store.setActiveStatus}
        />

        <BulkBar
          show={store.selectMode && store.selectedRefs.size > 0}
          count={store.selectedRefs.size}
          onApprove={store.bulkApprove}
          onClose={store.bulkClose}
          onDelete={store.bulkDelete}
          onClear={store.clearSelection}
        />

        <JobOrderBoard
          columns={store.columns}
          selectMode={store.selectMode}
          selectedRefs={store.selectedRefs}
          onOpen={store.openDetail}
          onToggleSelect={store.toggleSelect}
          onMoveToStatus={store.moveToStatus}
        />
      </div>

      <JobOrderDrawer
        open={store.drawerOpen}
        job={currentJob}
        actions={stageActions}
        onClose={store.closeDetail}
        onEdit={store.openEditModal}
        onDelete={store.deleteJob}
        onAddNote={store.addNote}
      />

      <JobOrderModal
        open={store.modalOpen}
        mode={store.modalMode}
        job={currentJob}
        clients={store.clients}
        onSubmit={store.submitJob}
        onClose={store.closeModal}
      />
    </div>
  );
}