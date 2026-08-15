import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  getDeployments,
  fetchDeploymentsApi,
  createDeploymentApi,
  updateDeploymentStageApi,
  toggleDeploymentComplianceApi,
  stageToStatus,
  complianceReadiness,
  nextDepId,
  TODAY,
} from '../services/DeploymentAssignmentService';
import { ISMERSBridge } from '../services/ismersBridge';

const STORAGE_KEY = 'ismers.deployments.v7';

function loadInitialDeployments() {
  let list = [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch {
    // ignore
  }

  if (!list.length) {
    list = getDeployments();
  }

  // Auto-ingest pending bridge hires into deployments list!
  try {
    const bridgeRaw = window.localStorage.getItem('ismers_bridge_hires_v2');
    if (bridgeRaw) {
      const entries = JSON.parse(bridgeRaw);
      if (Array.isArray(entries)) {
        entries.forEach(([key, hire]) => {
          if (hire && hire.name && !list.some((d) => d.employee === hire.name && d.client === hire.client)) {
            const id = nextDepId(list);
            const todayFormatted = TODAY.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
            const newDep = {
              id,
              applicantId: hire.applicantId || null,
              employee: hire.name,
              client: hire.client || 'Client Operations',
              jobOrderRef: hire.jobOrderRef || 'JO-001',
              position: hire.jobTitle || 'Operations Associate',
              site: hire.site || 'Client Site Facility',
              supervisor: 'Operations Supervisor',
              supervisorContact: '+63 917 555 0000',
              shift: 'Regular Day Shift (08:00 - 17:00)',
              start: hire.hiredDate || todayFormatted,
              end: 'Jan 2027',
              stage: 'on_site',
              compliance: {
                medicalClearance: true,
                nbiClearance: true,
                govtIds: true,
                signedContract: true,
                ppeIssued: true,
                clientOrientation: true,
              },
              signatureData: hire.contract?.signatureData || null,
              preEmployment: {
                medicalClinic: hire.medical?.clinic || 'HealthHub Diagnostics',
                fitToWork: hire.medical?.fitToWork || 'Class A - Fit for Duty',
                drugTestResult: 'Negative (10-Panel)',
                sss: hire.statutory?.sss || '34-8899001-2',
                philhealth: hire.statutory?.philhealth || '12-998877665-0',
                pagibig: hire.statutory?.pagibig || '1210-9988-7766',
                tin: hire.statutory?.tin || '456-789-012-000',
                contractSignedDate: hire.contract?.signedDate || todayFormatted,
                signatureData: hire.contract?.signatureData || null,
                ppeGear: hire.ppe?.selectedGear?.join(', ') || 'Standard Uniform Polo, High-Vis Vest, Safety Shoes',
                bankEndorsement: hire.bank?.bankName ? `${hire.bank.bankName} (Ref #2026)` : 'BDO Corporate Payroll Endorsement',
              },
              history: [
                {
                  date: todayFormatted,
                  event: 'Mobilized from Recruitment',
                  note: `Candidate officially deployed to ${hire.client} (${hire.site || 'Site'}).`,
                },
              ],
              applicantKey: key,
            };
            list.push(newDep);
            ISMERSBridge.linkDeployment(key, id, 'on_site', hire);
          }
        });
      }
    }
  } catch (e) {
    console.warn('Error ingesting bridge hires into deployments:', e);
  }

  return list;
}

export function useDeploymentAssignmentStore() {
  const [deployments, setDeployments] = useState(loadInitialDeployments);
  const [activeStatus, setActiveStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch live from Laravel Backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const liveDeployments = await fetchDeploymentsApi();
        if (isMounted && Array.isArray(liveDeployments) && liveDeployments.length > 0) {
          setDeployments((prev) => {
            const merged = [...liveDeployments];
            // Safely preserve any locally created deployments that are not in backend live list
            prev.forEach((localD) => {
              if (!merged.some((m) => m.id === localD.id || (m.employee === localD.employee && m.client === localD.client))) {
                merged.push(localD);
              }
            });
            return merged;
          });
        }
      } catch (e) {
        console.warn('Using local cached deployments:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(deployments));
    } catch {
      // ignore
    }
  }, [deployments]);


  // Subscribe to reactive bridge hires & real-time deployment events
  useEffect(() => {
    const unsubBridge = ISMERSBridge.onChange(() => {
      setDeployments(loadInitialDeployments());
    });

    function handleRealtimeDeploy() {
      setDeployments(loadInitialDeployments());
    }
    window.addEventListener('candidate_deployed', handleRealtimeDeploy);
    window.addEventListener('storage', handleRealtimeDeploy);

    return () => {
      unsubBridge();
      window.removeEventListener('candidate_deployed', handleRealtimeDeploy);
      window.removeEventListener('storage', handleRealtimeDeploy);
    };
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
    async (id, stage) => {
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

      // Async sync to Laravel Backend
      await updateDeploymentStageApi(id, stage);
    },
    [syncStageToBridge]
  );

  const toggleRequirement = useCallback(
    async (id, reqKey) => {
      setDeployments((prev) =>
        prev.map((d) => {
          if (d.id !== id) return d;
          const currentVal = Boolean(d.compliance && d.compliance[reqKey]);
          if (currentVal) return d; // Cannot uncheck once verified!
          const next = {
            ...d,
            compliance: {
              ...(d.compliance || {}),
              [reqKey]: true,
            },
          };
          syncStageToBridge(next);
          return next;
        })
      );

      // Async sync to Laravel Backend
      await toggleDeploymentComplianceApi(id, reqKey);
    },
    [syncStageToBridge]
  );

  const addDeployment = useCallback(
    async ({ employee, client, jobOrderRef, position, site, supervisor, supervisorContact, shift, start, end, applicantKey, applicantId }) => {
      const id = nextDepId(deployments);
      const todayFormatted = TODAY.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
      const bridgeHire = applicantKey ? ISMERSBridge.getHire(applicantKey) : null;
      const initialCompliance = bridgeHire?.compliance || {
        medicalClearance: Boolean(bridgeHire?.medical),
        nbiClearance: true,
        govtIds: Boolean(bridgeHire?.statutory),
        signedContract: Boolean(bridgeHire?.contract),
        ppeIssued: Boolean(bridgeHire?.ppe),
        clientOrientation: Boolean(bridgeHire?.orientation),
      };

      const newDep = {
        id,
        applicantId: applicantId || bridgeHire?.applicantId || null,
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
        compliance: initialCompliance,
        signatureData: bridgeHire?.contract?.signatureData || null,
        preEmployment: {
          medicalClinic: bridgeHire?.medical?.clinic || 'HealthHub Diagnostics',
          fitToWork: bridgeHire?.medical?.fitToWork || 'Class A - Fit for Duty',
          drugTestResult: 'Negative (10-Panel)',
          sss: bridgeHire?.statutory?.sss || '—',
          philhealth: bridgeHire?.statutory?.philhealth || '—',
          pagibig: bridgeHire?.statutory?.pagibig || '—',
          tin: bridgeHire?.statutory?.tin || '—',
          contractSignedDate: bridgeHire?.contract?.signedDate || start,
          signatureData: bridgeHire?.contract?.signatureData || null,
          ppeGear: bridgeHire?.ppe?.selectedGear?.join(', ') || 'Standard Safety Gear',
          bankEndorsement: bridgeHire?.bank?.bankName ? `${bridgeHire.bank.bankName} (${bridgeHire.bank.refCode || 'Ref #2026'})` : 'BDO Payroll Endorsement',
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
        ISMERSBridge.linkDeployment(applicantKey, newDep.id, newDep.stage, bridgeHire);
      }
      openDetail(id);


      // Sync to Laravel Backend API
      await createDeploymentApi({
        employee,
        client,
        jobOrderRef,
        position,
        site,
        supervisor,
        supervisorContact,
        shift,
        start,
        end,
        applicantId,
      });

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
    loading,
    openDetail,
    closeDetail,
    setStage,
    toggleRequirement,
    addDeployment,
  };
}
