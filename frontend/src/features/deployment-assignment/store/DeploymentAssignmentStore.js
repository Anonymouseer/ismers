import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  getDeployments,
  stageToStatus,
  complianceReadiness,
  nextDepId,
  TODAY,
} from '../services/DeploymentAssignmentService';
import { ISMERSBridge } from '../services/ismersBridge';

const STORAGE_KEY = 'ismers.deployments.v6';

function loadInitialDeployments() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return getDeployments();
}

export function useDeploymentAssignmentStore() {
  const [deployments, setDeployments] = useState(loadInitialDeployments);
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deployments));
    } catch {
      // ignore
    }
  }, [deployments]);

  // Register bridge-linked deployments once on mount
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
        (d.employee && d.employee.toLowerCase().includes(q)) ||
        (d.client && d.client.toLowerCase().includes(q)) ||
        (d.site && d.site.toLowerCase().includes(q)) ||
        (d.position && d.position.toLowerCase().includes(q)) ||
        (d.jobOrderRef && d.jobOrderRef.toLowerCase().includes(q));

      const matchesClient = clientFilter === 'all' || d.client === clientFilter;
      const status = stageToStatus(d.stage);

      let matchesStatus = false;
      if (activeStatus === 'all') {
        matchesStatus = true;
      } else if (activeStatus === 'active_onsite' || activeStatus === 'active') {
        matchesStatus = status === 'active_onsite' || d.stage === 'on_site';
      } else if (activeStatus === 'scheduled_dispatch' || activeStatus === 'scheduled') {
        matchesStatus = status === 'scheduled_dispatch' || d.stage === 'scheduled' || d.stage === 'dispatched';
      } else if (activeStatus === 'pending_clearance') {
        matchesStatus = status === 'pending_clearance' || d.stage === 'assigned' || d.stage === 'pre_deployment';
      } else if (activeStatus === 'completed') {
        matchesStatus = status === 'completed' || d.stage === 'completed' || d.stage === 'closed';
      } else {
        matchesStatus = status === activeStatus || d.stage === activeStatus;
      }

      return matchesQ && matchesClient && matchesStatus;
    });
  }, [deployments, search, clientFilter, activeStatus]);

  const stats = useMemo(() => {
    const total = deployments.length;
    const activeOnSite = deployments.filter((d) => d.stage === 'on_site').length;
    const pendingClearance = deployments.filter(
      (d) => d.stage === 'assigned' || d.stage === 'pre_deployment'
    ).length;
    const concluded = deployments.filter(
      (d) => d.stage === 'completed' || d.stage === 'closed'
    ).length;

    const readinessScores = deployments.map((d) => complianceReadiness(d).percent);
    const avgReadiness = readinessScores.length
      ? Math.round(readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length)
      : 0;

    return {
      total,
      activeOnSite,
      pendingClearance,
      concluded,
      avgReadiness,
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
    const readiness = complianceReadiness(d);
    ISMERSBridge.updateDeploymentStatus(d.applicantKey, {
      stage: d.stage,
      compliancePercent: readiness.percent,
    });
  }, []);

  const setStage = useCallback(
    (id, stage) => {
      const todayFormatted = TODAY.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const stageLabels = {
        assigned: 'Candidate Assigned',
        pre_deployment: 'Pre-Deployment Verification Initiated',
        scheduled: 'Deployment Scheduled',
        dispatched: 'Dispatched with Deployment Slip',
        on_site: 'Confirmed Active On-Site by Client Supervisor',
        completed: 'Deployment Concluded',
        closed: 'Record Archived',
      };

      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          const next = {
            ...d,
            stage,
            history: [
              {
                date: todayFormatted,
                event: stageLabels[stage] || stage,
                note: `Deployment advanced to ${stageLabels[stage] || stage}.`,
              },
              ...(d.history || []),
            ],
          };
          syncStageToBridge(next);
          return next;
        })
      );
    },
    [syncStageToBridge]
  );

  const toggleRequirement = useCallback(
    (id, reqKey) => {
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          const currentVal = Boolean(d.compliance && d.compliance[reqKey]);
          const nextVal = !currentVal;
          const next = {
            ...d,
            compliance: {
              ...(d.compliance || {}),
              [reqKey]: nextVal,
            },
          };
          syncStageToBridge(next);
          return next;
        })
      );
    },
    [syncStageToBridge]
  );

  const addDeployment = useCallback(
    ({ employee, client, jobOrderRef, position, site, supervisor, supervisorContact, shift, start, end, applicantKey }) => {
      const id = nextDepId(deployments);
      const todayFormatted = TODAY.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const newDep = {
        id,
        employee,
        client,
        jobOrderRef,
        position,
        site,
        supervisor: supervisor || 'Operations Supervisor',
        supervisorContact: supervisorContact || '+63 900 000 0000',
        shift: shift || 'Standard Day Shift (08:00 - 17:00)',
        start,
        end,
        stage: 'assigned',
        compliance: {
          medicalClearance: false,
          nbiClearance: false,
          govtIds: false,
          signedContract: false,
          ppeIssued: false,
          clientOrientation: false,
        },
        history: [
          {
            date: todayFormatted,
            event: 'Deployment Created',
            note: `Candidate assigned to ${client} (${jobOrderRef}).`,
          },
        ],
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
    toggleRequirement,
    addDeployment,
  };
}
