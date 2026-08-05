import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  getDeployments,
  stageToStatus,
  attendanceRate,
  daysLeft,
  nextDepId,
  TODAY,
} from '../services/DeploymentAssignmentService';
import { ISMERSBridge } from '../services/ismersBridge';

/**
 * DeploymentAssignmentStore.js
 *
 * A lightweight, dependency-free "store" for this feature — a custom hook
 * that owns the deployment list plus filter/UI state, mirroring what the
 * original inline <script> did with module-level variables and DOM writes.
 *
 * No Redux/Zustand in the project yet, so this pattern (hook-per-feature,
 * called once from the page component and passed down via props) is the
 * default until the team standardizes on a global store.
 */
export function useDeploymentAssignmentStore() {
  const [deployments, setDeployments] = useState(getDeployments);
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Register bridge-linked deployments once on mount (same effect as the
  // bottom-of-script `DEPLOYMENTS.filter(...).forEach(...)` in the original file).
  useEffect(() => {
    deployments
      .filter((d) => d.applicantKey)
      .forEach((d) => {
        ISMERSBridge.linkDeployment(d.applicantKey, d.id, d.stage, {
          name: d.employee,
          jobTitle: d.position,
          client: d.client,
          jobOrderRef: d.jobOrderRef,
          hiredDate: null,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clients = useMemo(
    () => [...new Set(deployments.map((d) => d.client))].sort(),
    [deployments]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deployments.filter((d) => {
      const matchesQ =
        !q ||
        d.employee.toLowerCase().includes(q) ||
        d.client.toLowerCase().includes(q) ||
        d.site.toLowerCase().includes(q);
      const matchesClient = clientFilter === 'all' || d.client === clientFilter;
      return matchesQ && matchesClient;
    });
  }, [deployments, search, clientFilter]);

  const stats = useMemo(() => {
    const total = deployments.length;
    const active = deployments.filter((d) => stageToStatus(d.stage) === 'active').length;
    const endingSoon = deployments.filter((d) => {
      const diff = daysLeft(d.end);
      return diff >= 0 && diff <= 14 && d.stage !== 'completed' && d.stage !== 'closed';
    }).length;
    const attendanceAlerts = deployments.filter((d) => (d.attendance.absent || 0) > 0).length;
    const scored = deployments.filter((d) => d.score > 0);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, d) => s + d.score, 0) / scored.length)
      : 0;
    return {
      total,
      active,
      endingSoon,
      attendanceAlerts,
      avgScore,
      scoredCount: scored.length,
      clientCount: new Set(deployments.map((d) => d.client)).size,
    };
  }, [deployments]);

  const selected = useMemo(
    () => deployments.find((d) => d.id === selectedId) || null,
    [deployments, selectedId]
  );

  const openDetail = useCallback((id) => {
    setSelectedId(id);
    setDrawerOpen(true);
  }, []);

  const closeDetail = useCallback(() => setDrawerOpen(false), []);

  const syncStageToBridge = useCallback((d) => {
    if (!d.applicantKey) return;
    ISMERSBridge.updateDeploymentStatus(d.applicantKey, {
      stage: d.stage,
      attendanceRate: attendanceRate(d),
      score: d.score,
    });
  }, []);

  const setStage = useCallback(
    (id, stage) => {
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          const next = { ...d, stage };
          syncStageToBridge(next);
          return next;
        })
      );
    },
    [syncStageToBridge]
  );

  const logEntry = useCallback(
    (id, type) => {
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d; // allow logging for any active deployment
          const noteMap = {
            present: 'Reported on time.',
            late: 'Arrived late.',
            absent: 'Did not report — marked absent.',
          };
          const next = {
            ...d,
            attendance: { ...d.attendance, [type]: (d.attendance[type] || 0) + 1 },
            logs: [
              {
                date: TODAY.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                type,
                note: noteMap[type],
              },
              ...d.logs,
            ],
          };
          syncStageToBridge(next);
          return next;
        })
      );
    },
    [syncStageToBridge]
  );

  const addDeployment = useCallback(
    ({ employee, client, jobOrderRef, position, site, start, end, applicantKey }) => {
      const id = nextDepId(deployments);
      const newDep = {
        id,
        employee,
        client,
        jobOrderRef,
        position,
        site,
        start,
        end,
        stage: 'scheduled',
        score: 0,
        attendance: { present: 0, late: 0, absent: 0 },
        logs: [],
        applicantKey: applicantKey || null,
      };
      setDeployments((prev) => [...prev, newDep]);
      if (applicantKey) {
        ISMERSBridge.linkDeployment(applicantKey, newDep.id, newDep.stage);
      }
      openDetail(id);
      return id;
    },
    [deployments, openDetail]
  );

  return {
    // data
    deployments,
    filtered,
    clients,
    stats,
    selected,
    // filter/UI state
    activeStatus,
    setActiveStatus,
    search,
    setSearch,
    clientFilter,
    setClientFilter,
    drawerOpen,
    modalOpen,
    setModalOpen,
    // actions
    openDetail,
    closeDetail,
    setStage,
    logEntry,
    addDeployment,
  };
}
