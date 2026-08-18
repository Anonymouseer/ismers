// JobOrderManagementStore.js
// Holds all Job Order Management page state + mutations.
// Synchronizes with canonical clients, live deployments, and client portal PRFs.

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import JobOrderManagementService, {
  STATUS_ORDER,
  STATUS_META,
  daysLeft,
  nowStamp,
  recomputeStatus,
  assignDefaults,
  buildSynchronizedJobOrders,
} from '../services/JobOrderManagementService';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../../../utils/realtimeSync';

function logActivity(job, text, type = 'system') {
  return {
    ...job,
    activityLog: [{ date: nowStamp(), text, type }, ...(job.activityLog || [])],
  };
}

export default function useJobOrderManagementStore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status') || 'all';

  const [jobOrders, setJobOrders] = useState(buildSynchronizedJobOrders);
  const [loading, setLoading] = useState(false);

  // controls
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [sortMode, setSortMode] = useState('deadline');
  const [activeStatus, setActiveStatusState] = useState(urlStatus);

  // Sync state with URL parameter changes
  useEffect(() => {
    const s = searchParams.get('status') || 'all';
    setActiveStatusState(s);
  }, [searchParams]);

  const setActiveStatus = useCallback((status) => {
    setActiveStatusState(status);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (status === 'all') {
        next.delete('status');
      } else {
        next.set('status', status);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // bulk select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedRefs, setSelectedRefs] = useState(new Set());

  // drawer / modal
  const [currentRef, setCurrentRef] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');

  const fetchLiveJobOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await JobOrderManagementService.getAll();
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      if (Array.isArray(raw) && raw.length > 0) {
        const formatted = raw.map(assignDefaults);
        const map = new Map();
        formatted.forEach((item) => map.set(item.ref || item.id, item));
        
        // Preserve any custom localized PRFs
        buildSynchronizedJobOrders().forEach((item) => {
          const key = item.ref || item.id;
          if (!map.has(key)) {
            map.set(key, item);
          }
        });
        setJobOrders(Array.from(map.values()));
      }
    } catch (err) {
      console.warn('API fetch fell back to local synchronized job orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload synchronized data
  const reloadData = useCallback(() => {
    fetchLiveJobOrders();
  }, [fetchLiveJobOrders]);

  useEffect(() => {
    fetchLiveJobOrders();
  }, [fetchLiveJobOrders]);

  useEffect(() => {
    // 1. Listen to storage events across tabs
    const handleStorage = (e) => {
      if (
        !e ||
        !e.key ||
        e.key === 'ismers_client_job_orders' ||
        e.key.startsWith('ismers.deployments') ||
        e.key === 'ismers_bridge_hires_v2' ||
        e.key === 'ismers_sync_beacon'
      ) {
        reloadData();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('ismers:job-orders-updated', reloadData);
    window.addEventListener('ismers:deployments-updated', reloadData);

    // 2. Listen to real-time pub/sub events
    const unsubscribeRealtime = subscribeRealtimeEvents((msg) => {
      if (
        msg.type === 'JOB_ORDER_CREATED' ||
        msg.type === 'JOB_ORDER_APPROVED' ||
        msg.type === 'DEPLOYMENT_CHANGED' ||
        msg.type === 'EMPLOYEE_DEPLOYED' ||
        msg.type === 'STAGE_CHANGED' ||
        msg.type === 'candidate_deployed'
      ) {
        reloadData();
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('ismers:job-orders-updated', reloadData);
      window.removeEventListener('ismers:deployments-updated', reloadData);
      unsubscribeRealtime();
    };
  }, [reloadData]);

  const getJob = useCallback((ref) => jobOrders.find((j) => j.ref === ref || j.id === ref), [jobOrders]);

  const updateJob = useCallback((ref, updater) => {
    setJobOrders((prev) => prev.map((j) => ((j.ref === ref || j.id === ref) ? updater({ ...j }) : j)));
  }, []);

  // ---- clients for the filter dropdown ----
  const clients = useMemo(
    () => [...new Set(jobOrders.map((j) => j.client))].filter(Boolean).sort(),
    [jobOrders]
  );

  // ---- filtering / sorting / stats ----
  const matchesFilters = useCallback((j) => {
    const q = search.trim().toLowerCase();
    const matchesQ =
      !q ||
      (j.title || '').toLowerCase().includes(q) ||
      (j.client || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q) ||
      (j.ref || '').toLowerCase().includes(q);
    const matchesClient = clientFilter === 'all' || j.client === clientFilter;
    return matchesQ && matchesClient;
  }, [search, clientFilter]);

  const sortJobs = useCallback((list) => {
    const arr = [...list];
    if (sortMode === 'deadline') arr.sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
    else if (sortMode === 'priority') {
      const rank = { urgent: 0, high: 1, medium: 2, normal: 3 };
      arr.sort((a, b) => (rank[a.priority] ?? 4) - (rank[b.priority] ?? 4));
    }
    else if (sortMode === 'fill') arr.sort((a, b) => (b.filled / (b.total || 1)) - (a.filled / (a.total || 1)));
    else if (sortMode === 'newest') arr.sort((a, b) => (b.ref || '').localeCompare(a.ref || ''));
    return arr;
  }, [sortMode]);

  const filteredJobOrders = useMemo(() => {
    const list = jobOrders.filter((j) => {
      const matchesSearch = matchesFilters(j);
      const matchesStatus = activeStatus === 'all' || j.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
    return sortJobs(list);
  }, [jobOrders, matchesFilters, activeStatus, sortJobs]);

  const columns = useMemo(() => {
    return STATUS_ORDER.map((status) => {
      const items = sortJobs(jobOrders.filter((j) => j.status === status && matchesFilters(j)));
      return {
        status,
        meta: STATUS_META[status],
        items,
        hidden: activeStatus !== 'all' && activeStatus !== status,
      };
    });
  }, [jobOrders, sortJobs, matchesFilters, activeStatus]);

  const stats = useMemo(() => {
    const total = jobOrders.length;
    const openPositions = jobOrders.reduce((s, j) => s + Math.max(0, (j.total || 0) - (j.filled || 0)), 0);
    const filledPositions = jobOrders.reduce((s, j) => s + (j.filled || 0), 0);
    const urgentCount = jobOrders.filter((j) => j.status === 'urgent').length;
    const reviewCount = jobOrders.filter((j) => j.status === 'review').length;
    const totalSlots = jobOrders.reduce((s, j) => s + (j.total || 0), 0);
    const fillRate = totalSlots ? Math.round((filledPositions / totalSlots) * 100) : 0;
    return {
      total,
      openPositions,
      filledPositions,
      urgentCount,
      reviewCount,
      fillRate,
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
        status: formValues.status || 'review',
        stage: formValues.stage || 'review',
        source: 'internal',
      };
      try {
        const res = await JobOrderManagementService.create(payload);
        const raw = Array.isArray(res) ? res : (res?.data ?? res);
        const newJob = assignDefaults(raw);
        const withLog = logActivity(newJob, 'Job order created and queued for review.');

        try {
          const stored = localStorage.getItem('ismers_client_job_orders');
          const list = stored ? JSON.parse(stored) : [];
          if (!list.some((x) => (x.ref || x.id) === (withLog.ref || withLog.id))) {
            list.unshift(withLog);
            localStorage.setItem('ismers_client_job_orders', JSON.stringify(list));
          }
        } catch {}

        broadcastRealtimeEvent('JOB_ORDER_CREATED', withLog);
        setJobOrders((prev) => [withLog, ...prev]);
        setModalOpen(false);
        setCurrentRef(withLog.ref);
        setDrawerOpen(true);
      } catch {
        const newJob = assignDefaults({
          ref: `JO-2026-${Math.floor(100 + Math.random() * 900)}`,
          ...payload,
        });
        const withLog = logActivity(newJob, 'Job order created locally and queued for review.');

        try {
          const stored = localStorage.getItem('ismers_client_job_orders');
          const list = stored ? JSON.parse(stored) : [];
          if (!list.some((x) => (x.ref || x.id) === (withLog.ref || withLog.id))) {
            list.unshift(withLog);
            localStorage.setItem('ismers_client_job_orders', JSON.stringify(list));
          }
        } catch {}

        broadcastRealtimeEvent('JOB_ORDER_CREATED', withLog);
        setJobOrders((prev) => [withLog, ...prev]);
        setModalOpen(false);
        setCurrentRef(withLog.ref);
        setDrawerOpen(true);
      }
    }
  }, [modalMode, currentRef, updateJob]);

  const deleteJob = useCallback(async (ref) => {
    try {
      await JobOrderManagementService.remove(ref);
    } catch {}
    setJobOrders((prev) => prev.filter((j) => j.ref !== ref && j.id !== ref));
    setDrawerOpen(false);
  }, []);

  // ---- workflow stage transitions ----
  const setStage = useCallback((ref, stage, note) => {
    updateJob(ref, (j) => {
      const updated = logActivity({ ...j, stage }, note);
      JobOrderManagementService.update(ref, { stage }).catch(() => {});
      return updated;
    });
  }, [updateJob]);

  // HR Manager Approval of Client Portal requests
  const approveAndOpen = useCallback((ref) => {
    updateJob(ref, (j) => {
      const clientNorm = (j.client || '').toLowerCase().trim();
      const resolvedRecruiter = (j.recruiter && !j.recruiter.toLowerCase().includes('unassigned'))
        ? j.recruiter
        : (clientNorm.includes('northline') || clientNorm.includes('coastal') || clientNorm.includes('everwell') ? 'Dennis Ocampo' : 'Karla Reyes');

      const updated = {
        ...j,
        status: 'open',
        stage: 'activated',
        statusClass: 'client-portal-badge--active',
        badge: 'open',
        recruiter: resolvedRecruiter,
      };

      // Persist status change to backend API
      JobOrderManagementService.update(ref, {
        status: 'open',
        stage: 'activated',
        priority: updated.priority,
      }).catch(() => {});

      // 1. Persist status change to ismers_client_job_orders
      try {
        const raw = localStorage.getItem('ismers_client_job_orders');
        if (raw) {
          const list = JSON.parse(raw);
          const idx = list.findIndex((item) => (item.ref || item.id) === ref);
          if (idx >= 0) {
            list[idx] = {
              ...list[idx],
              status: 'open',
              stage: 'activated',
              badge: 'open',
              displayStatus: 'Active',
              recruiter: resolvedRecruiter,
            };
            localStorage.setItem('ismers_client_job_orders', JSON.stringify(list));
          }
        }
      } catch (err) {
        console.warn('Could not update job order in storage:', err);
      }

      // 2. Persist to scoped cp_jobs_ keys
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('cp_jobs_')) {
            const rawScoped = localStorage.getItem(k);
            if (rawScoped) {
              const listScoped = JSON.parse(rawScoped);
              if (Array.isArray(listScoped)) {
                const sIdx = listScoped.findIndex((item) => (item.ref || item.id) === ref);
                if (sIdx >= 0) {
                  listScoped[sIdx] = {
                    ...listScoped[sIdx],
                    status: 'open',
                    stage: 'activated',
                    badge: 'open',
                    displayStatus: 'Active',
                    recruiter: resolvedRecruiter,
                  };
                  localStorage.setItem(k, JSON.stringify(listScoped));
                }
              }
            }
          }
        }
      } catch {}

      broadcastRealtimeEvent('JOB_ORDER_APPROVED', { ref, jobOrder: updated });
      window.dispatchEvent(new CustomEvent('ismers:job-orders-updated', { detail: updated }));

      return logActivity(updated, 'Job order approved by HR Manager and activated.');
    });
  }, [updateJob]);

  const stageCheckStaff = useCallback((ref) => {
    updateJob(ref, (j) => {
      const stage = (j.total || 1) <= 5 ? 'deploying' : 'recruiting';
      const note = stage === 'deploying' ? 'Available bench personnel identified — deploying directly.' : 'Bench personnel insufficient — staffing requisition sent to Recruitment & Selection.';
      JobOrderManagementService.update(ref, { stage }).catch(() => {});
      return logActivity({ ...j, stage }, note);
    });
  }, [updateJob]);

  const stageAssign = useCallback((ref) => {
    updateJob(ref, (j) => {
      const updated = { ...j, filled: j.total, stage: 'assigned' };
      recomputeStatus(updated);
      JobOrderManagementService.update(ref, { stage: 'assigned', filled: j.total }).catch(() => {});
      return logActivity(updated, 'Candidate personnel assigned to job order.');
    });
  }, [updateJob]);

  const stageActions = {
    approveAndOpen,
    stageApprove: (ref) => setStage(ref, 'approved', 'Approved by manager.'),
    stageReject: (ref) => {
      updateJob(ref, (j) => {
        const updated = { ...j, status: 'review', stage: 'rejected' };
        JobOrderManagementService.update(ref, { status: 'review', stage: 'rejected' }).catch(() => {});
        // Update localStorage
        try {
          const raw = localStorage.getItem('ismers_client_job_orders');
          if (raw) {
            const list = JSON.parse(raw);
            const idx = list.findIndex((item) => (item.ref || item.id) === ref);
            if (idx >= 0) {
              list[idx] = { ...list[idx], status: 'Rejected', stage: 'rejected' };
              localStorage.setItem('ismers_client_job_orders', JSON.stringify(list));
            }
          }
        } catch {}
        return logActivity(updated, 'Rejected by HR Manager.');
      });
    },
    stageRevise: (ref) => setStage(ref, 'created', 'Revised and resubmitted for review.'),
    stageActivate: (ref) => setStage(ref, 'activated', 'Job order activated.'),
    stageCheckStaff,
    stageAssign,
    stageSchedule: (ref) => setStage(ref, 'scheduled', 'Deployment schedule created.'),
    stageReport: (ref) => setStage(ref, 'reporting', 'Employees confirmed reporting to client site.'),
    stageStart: (ref) => setStage(ref, 'in_progress', 'Job order in progress on-site.'),
    stageMonitor: (ref) => setStage(ref, 'monitoring', 'Began monitoring performance and attendance.'),
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
      if (status === 'open' && j.status === 'filled') updated.filled = 0;
      JobOrderManagementService.update(ref, { status, filled: updated.filled }).catch(() => {});
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
    setJobOrders((prev) => prev.map((j) => {
      if (selectedRefs.has(j.ref) && (j.stage === 'created' || j.stage === 'review')) {
        JobOrderManagementService.update(j.ref, { status: 'open', stage: 'activated' }).catch(() => {});
        return logActivity({ ...j, status: 'open', stage: 'activated' }, 'Bulk-approved and activated by HR Manager.');
      }
      return j;
    }));
  }, [selectedRefs]);
  const bulkClose = useCallback(() => {
    setJobOrders((prev) => prev.map((j) => {
      if (selectedRefs.has(j.ref)) {
        JobOrderManagementService.update(j.ref, { filled: j.total, status: 'filled', stage: 'closed' }).catch(() => {});
        return logActivity({ ...j, filled: j.total, status: 'filled', stage: 'closed' }, 'Bulk-closed as filled.');
      }
      return j;
    }));
  }, [selectedRefs]);
  const bulkDelete = useCallback(() => {
    selectedRefs.forEach((ref) => {
      JobOrderManagementService.remove(ref).catch(() => {});
    });
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
    filteredJobOrders,
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