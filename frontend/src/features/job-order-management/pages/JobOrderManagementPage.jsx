import { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import useJobOrderManagementStore from '../store/JobOrderManagementStore';
import DispatchStrip from '../components/DispatchStrip';
import ControlsBar from '../components/ControlsBar';
import BulkBar from '../components/BulkBar';
import JobOrderTableView from '../components/JobOrderTableView';
import JobOrderBoard from '../components/JobOrderBoard';
import JobOrderDrawer from '../components/JobOrderDrawer';
import JobOrderModal from '../components/JobOrderModal';
import './JobOrderManagement.css';

export default function JobOrderManagementPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [searchParams] = useSearchParams();
  const [displayMode, setDisplayMode] = useState('table'); // Default: 'table' | 'board'
  const store = useJobOrderManagementStore();

  const currentJob = store.getJob(store.currentRef);

  const stageActions = {
    approveAndOpen: store.approveAndOpen,
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
        <div className={`main${collapsed ? ' collapsed' : ''}`}>
          <div className="page-sub">Loading job orders…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>

        <div className="title-row">
          <div>
            <div className="eyebrow">Core 1 · Job Order Management</div>
            <h1 className="page-title">Job Order Management</h1>
            <div className="page-sub">
              {store.stats.total} active job orders across {store.stats.clientCount} clients · {store.stats.fillRate}% overall headcount fulfillment
            </div>
          </div>
        </div>

        <DispatchStrip stats={store.stats} />

        <ControlsBar
          search={store.search} setSearch={store.setSearch}
          clientFilter={store.clientFilter} setClientFilter={store.setClientFilter} clients={store.clients}
          sortMode={store.sortMode} setSortMode={store.setSortMode}
          selectMode={store.selectMode} onToggleSelectMode={store.toggleSelectMode}
          onExportCsv={store.exportCsv}
          activeStatus={store.activeStatus} setActiveStatus={store.setActiveStatus}
          displayMode={displayMode} setDisplayMode={setDisplayMode}
        />

        <BulkBar
          show={store.selectMode && store.selectedRefs.size > 0}
          count={store.selectedRefs.size}
          onApprove={store.bulkApprove}
          onClose={store.bulkClose}
          onDelete={store.bulkDelete}
          onClear={store.clearSelection}
        />

        {displayMode === 'table' ? (
          <JobOrderTableView
            jobOrders={store.filteredJobOrders}
            selectedRefs={store.selectedRefs}
            selectMode={store.selectMode}
            onOpen={store.openDetail}
            onToggleSelect={store.toggleSelect}
            onApproveAndOpen={store.approveAndOpen}
            onEdit={store.openEditModal}
            onDelete={store.deleteJob}
          />
        ) : (
          <JobOrderBoard
            columns={store.columns}
            selectMode={store.selectMode}
            selectedRefs={store.selectedRefs}
            onOpen={store.openDetail}
            onToggleSelect={store.toggleSelect}
            onMoveToStatus={store.moveToStatus}
          />
        )}
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