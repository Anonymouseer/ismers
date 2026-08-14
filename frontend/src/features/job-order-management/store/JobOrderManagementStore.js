// JobOrderManagementStore.js
// Holds all Job Order Management page state + mutations. Wraps
// JobOrderManagementService so swapping mock data for the real
// /api/v1/job-orders endpoints later only touches the service file.

import { useState, useEffect, useMemo, useCallback } from 'react';
import JobOrderManagementService, {
  STATUS_ORDER,
  STATUS_META,
  daysLeft,
  nowStamp,
  recomputeStatus,
  assignDefaults,
} from '../services/JobOrderManagementService';

function logActivity(job, text, type = 'system') {
  return {
    ...job,
    activityLog: [{ date: nowStamp(), text, type }, ...job.activityLog],
  };
}

export default function useJobOrderManagementStore() {
  const [jobOrders, setJobOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // controls
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [sortMode, setSortMode] = useState('deadline');
  const [activeStatus, setActiveStatus] = useState('all');

  // bulk select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRefs, setSelectedRefs] = useState(new Set());

  // drawer / modal
  const [currentRef, setCurrentRef] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  useEffect(() => {
    let alive = true;
    JobOrderManagementService.getAll()
      .then((res) => {
        if (!alive) return;
        // Real API returns axios response: { data: [...] }
        // Apply assignDefaults to fill in stage, recruiter, activityLog etc.
        const raw = Array.isArray(res) ? res : (res?.data ?? []);
        setJobOrders(raw.map(assignDefaults));
        setLoading(false);
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  const getJob = useCallback((ref) => jobOrders.find((j) => j.ref === ref), [jobOrders]);

  const updateJob = useCallback((ref, updater) => {
    setJobOrders((prev) => prev.map((j) => (j.ref === ref ? updater({ ...j }) : j)));
  }, []);

  // ---- clients for the filter dropdown ----
  const clients = useMemo(
    () => [...new Set(jobOrders.map((j) => j.client))].sort(),
    [jobOrders]
  );

  // ---- filtering / sorting / stats ----
  const matchesFilters = useCallback((j) => {
    const q = search.trim().toLowerCase();
    const matchesQ = !q || j.title.toLowerCase().includes(q) || j.client.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    const matchesClient = clientFilter === 'all' || j.client === clientFilter;
    return matchesQ && matchesClient;
  }, [search, clientFilter]);

  const sortJobs = useCallback((list) => {
    const arr = [...list];
    if (sortMode === 'deadline') arr.sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
    else if (sortMode === 'priority') { const rank = { high: 0, medium: 1, normal: 2 }; arr.sort((a, b) => rank[a.priority] - rank[b.priority]); }
    else if (sortMode === 'fill') arr.sort((a, b) => (b.filled / b.total) - (a.filled / a.total));
    else if (sortMode === 'newest') arr.sort((a, b) => b.ref.localeCompare(a.ref));
    return arr;
  }, [sortMode]);

  const columns = useMemo(() => {
    return STATUS_ORDER.map((status) => {
      const items = sortJobs(jobOrders.filter((j) => j.status === status && matchesFilters(j)));
      return { status, meta: STATUS_META[status], items, hidden: activeStatus !== 'all' && activeStatus !== status };
    });
  }, [jobOrders, sortJobs, matchesFilters, activeStatus]);

  const stats = useMemo(() => {
    const total = jobOrders.length;
    const openPositions = jobOrders.reduce((s, j) => s + (j.total - j.filled), 0);
    const filledPositions = jobOrders.reduce((s, j) => s + j.filled, 0);
    const urgentCount = jobOrders.filter((j) => j.status === 'urgent').length;
    const totalSlots = jobOrders.reduce((s, j) => s + j.total, 0);
    const fillRate = totalSlots ? Math.round((filledPositions / totalSlots) * 100) : 0;
    return {
      total, openPositions, filledPositions, urgentCount, fillRate,
      clientCount: new Set(jobOrders.map((j) => j.client)).size,
    };
  }, [jobOrders]);

  // ---- drawer ----
  const openDetail = useCallback((ref) => { setCurrentRef(ref); setDrawerOpen(true); }, []);
  const closeDetail = useCallback(() => setDrawerOpen(false), []);

  // ---- create / edit modal ----
  const openCreateModal = useCallback(() => { setModalMode('create'); setModalOpen(true); }, []);
  const openEditModal = useCallback((ref) => { setCurrentRef(ref); setModalMode('edit'); setModalOpen(true); }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const submitJob = useCallback(async (formValues) => {
    if (modalMode === 'edit' && currentRef) {
      try {
        const res = await JobOrderManagementService.update(currentRef, formValues);
        const updated = assignDefaults(Array.isArray(res) ? res : (res?.data ?? { ref: currentRef, ...formValues }));
        updateJob(currentRef, (j) => {
          const merged = { ...j, ...updated };
          recomputeStatus(merged);
          return logActivity(merged, 'Job order details updated.');
        });
      } catch {
        // Optimistic local update on network failure
        updateJob(currentRef, (j) => {
          const merged = { ...j, ...formValues };
          recomputeStatus(merged);
          return logActivity(merged, 'Job order details updated.');
        });
      }
      setModalOpen(false);
      setDrawerOpen(true);
    } else {
      const payload = {
        ...formValues,
        client: formValues.client || 'Internal',
        status: formValues.filled >= formValues.total ? 'filled' : (formValues.filled > 0 ? 'filling' : 'open'),
        source: 'internal',
      };
      const res = await JobOrderManagementService.create(payload, jobOrders);
      const raw = Array.isArray(res) ? res : (res?.data ?? res);
      const newJob = assignDefaults(raw);
      const withLog = logActivity(newJob, 'Job order created.');
      setJobOrders((prev) => [...prev, withLog]);
      setModalOpen(false);
      setCurrentRef(withLog.ref);
      setDrawerOpen(true);
    }
  }, [modalMode, currentRef, updateJob, jobOrders]);

  const deleteJob = useCallback(async (ref) => {
    try {
      await JobOrderManagementService.remove(ref);
    } catch {
      // Continue with local state removal even if API call fails
    }
    setJobOrders((prev) => prev.filter((j) => j.ref !== ref));
    setDrawerOpen(false);
  }, []);

  // ---- workflow stage transitions ----
  const setStage = useCallback((ref, stage, note) => {
    updateJob(ref, (j) => logActivity({ ...j, stage }, note));
  }, [updateJob]);

  const stageCheckStaff = useCallback((ref) => {
    updateJob(ref, (j) => {
      const stage = j.total <= 5 ? 'deploying' : 'recruiting';
      const note = stage === 'deploying' ? 'Enough bench staff available — deploying directly.' : 'Not enough bench staff — request sent to Recruitment & Selection.';
      return logActivity({ ...j, stage }, note);
    });
  }, [updateJob]);

  const stageAssign = useCallback((ref) => {
    updateJob(ref, (j) => {
      const updated = { ...j, filled: j.total, stage: 'assigned' };
      recomputeStatus(updated);
      return logActivity(updated, 'Employees assigned to job order.');
    });
  }, [updateJob]);

  const stageActions = {
    stageApprove: (ref) => setStage(ref, 'approved', 'Approved by manager.'),
    stageReject: (ref) => setStage(ref, 'rejected', 'Rejected by manager.'),
    stageRevise: (ref) => setStage(ref, 'created', 'Revised and resubmitted for review.'),
    stageActivate: (ref) => setStage(ref, 'activated', 'Job order activated.'),
    stageCheckStaff,
    stageAssign,
    stageSchedule: (ref) => setStage(ref, 'scheduled', 'Deployment schedule created.'),
    stageReport: (ref) => setStage(ref, 'reporting', 'Employees confirmed reporting to client.'),
    stageStart: (ref) => setStage(ref, 'in_progress', 'Job order started.'),
    stageMonitor: (ref) => setStage(ref, 'monitoring', 'Began monitoring performance & attendance.'),
    stageComplete: (ref) => setStage(ref, 'completed', 'Job order marked completed.'),
    stageClose: (ref) => setStage(ref, 'closed', 'Job order closed and archived.'),
  };

  // ---- notes ----
  const addNote = useCallback((ref, text) => {
    if (!text.trim()) return;
    updateJob(ref, (j) => logActivity(j, text.trim(), 'note'));
  }, [updateJob]);

  // ---- drag & drop status change ----
  const moveToStatus = useCallback((ref, status) => {
    updateJob(ref, (j) => {
      const updated = { ...j, status };
      if (status === 'filled') updated.filled = updated.total;
      if (status === 'open') updated.filled = 0;
      return logActivity(updated, `Status manually moved to "${STATUS_META[status].label}".`);
    });
  }, [updateJob]);

  // ---- bulk select ----
  const toggleSelect = useCallback((ref) => {
    setSelectedRefs((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref); else next.add(ref);
      return next;
    });
  }, []);
  const toggleSelectMode = useCallback(() => {
    setSelectMode((prev) => { if (prev) setSelectedRefs(new Set()); return !prev; });
  }, []);
  const clearSelection = useCallback(() => setSelectedRefs(new Set()), []);
  const bulkApprove = useCallback(() => {
    setJobOrders((prev) => prev.map((j) => (
      selectedRefs.has(j.ref) && j.stage === 'created'
        ? logActivity({ ...j, stage: 'approved' }, 'Bulk-approved by manager.')
        : j
    )));
  }, [selectedRefs]);
  const bulkClose = useCallback(() => {
    setJobOrders((prev) => prev.map((j) => (
      selectedRefs.has(j.ref)
        ? logActivity({ ...j, filled: j.total, status: 'filled', stage: 'closed' }, 'Bulk-closed as filled.')
        : j
    )));
  }, [selectedRefs]);
  const bulkDelete = useCallback(() => {
    setJobOrders((prev) => prev.filter((j) => !selectedRefs.has(j.ref)));
    setSelectedRefs(new Set());
  }, [selectedRefs]);

  // ---- CSV export ----
  const exportCsv = useCallback(() => {
    const rows = [['Ref', 'Client', 'Position', 'Status', 'Stage', 'Recruiter', 'Priority', 'Location', 'Type', 'Rate', 'Deadline', 'Filled', 'Total']];
    jobOrders.filter(matchesFilters).forEach((j) => {
      rows.push([j.ref, j.client, j.title, j.status, j.stage, j.recruiter, j.priority, j.location, j.type, j.rate, j.deadline, j.filled, j.total]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'job_orders_export.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [jobOrders, matchesFilters]);

  return {
    loading,
    jobOrders,
    getJob,
    clients,
    columns,
    stats,

    search, setSearch,
    clientFilter, setClientFilter,
    sortMode, setSortMode,
    activeStatus, setActiveStatus,

    selectMode, selectedRefs, toggleSelect, toggleSelectMode, clearSelection,
    bulkApprove, bulkClose, bulkDelete,

    currentRef, drawerOpen, openDetail, closeDetail,
    modalOpen, modalMode, openCreateModal, openEditModal, closeModal, submitJob, deleteJob,

    ...stageActions,
    addNote,
    moveToStatus,
    exportCsv,
  };
}