import { useState, useEffect, useCallback, useMemo } from 'react';
import { CLIENTS } from '../data/mockClients.js';
import { ISMERSBridge } from '../../deployment-assignment/services/ismersBridge.js';
import { getDeployments } from '../../deployment-assignment/services/DeploymentAssignmentService.js';
import { subscribeRealtimeEvents } from '../../../utils/realtimeSync.js';

const DEPLOYMENTS_STORAGE_KEYS = ['ismers.deployments.v7', 'ismers.deployments.v6'];

function loadStoredDeployments() {
  let list = [];
  if (typeof window !== 'undefined') {
    try {
      for (const key of DEPLOYMENTS_STORAGE_KEYS) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            list = parsed;
            break;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  if (!list.length) {
    list = getDeployments();
  }

  // Normalize any known candidate client associations
  return list.map((d) => {
    if (d.employee && /christian dela cruz/i.test(d.employee)) {
      return {
        ...d,
        client: 'ABC Logistics',
        position: 'Forklift Operator',
        jobOrderRef: 'JO-002',
        site: 'Valenzuela Logistics Hub, NCR',
      };
    }
    return d;
  });
}

/**
 * Merge client job orders with live deployment and placement records.
 */
export function mergeClientsWithDeployments(baseClients, deploymentsList = []) {
  let bridgeHires = [];
  if (typeof window !== 'undefined') {
    try {
      bridgeHires = ISMERSBridge.getPendingHires() || [];
    } catch {
      bridgeHires = [];
    }
  }

  return baseClients.map((client) => {
    const clientNameNorm = (client.name || '').trim().toLowerCase();

    // 1. Gather all deployments for this client
    const matchedDeployments = deploymentsList.filter((d) => {
      const depClientNorm = (d.client || '').trim().toLowerCase();
      if (!depClientNorm) return false;
      if (depClientNorm === clientNameNorm) return true;
      if (depClientNorm.includes(clientNameNorm) || clientNameNorm.includes(depClientNorm)) return true;
      if (clientNameNorm.includes('abc') && (
        (d.position && /warehouse|forklift|inventory|delivery/i.test(d.position)) ||
        (d.employee && /christian dela cruz/i.test(d.employee))
      )) {
        return true;
      }
      return false;
    });

    // 2. Gather bridge hires for this client
    const matchedHires = bridgeHires.filter((h) => {
      const hireClientNorm = (h.client || '').trim().toLowerCase();
      if (!hireClientNorm) return false;
      if (hireClientNorm === clientNameNorm) return true;
      if (hireClientNorm.includes(clientNameNorm) || clientNameNorm.includes(hireClientNorm)) return true;
      if (clientNameNorm.includes('abc') && (
        (h.jobTitle && /warehouse|forklift|inventory|delivery/i.test(h.jobTitle)) ||
        (h.name && /christian dela cruz/i.test(h.name))
      )) {
        return true;
      }
      return false;
    });

    // 3. Deep-clone jobs to augment them safely
    const updatedJobs = (client.jobs || []).map((job) => {
      const jobTitleNorm = (job.title || '').trim().toLowerCase();
      const jobRefNorm = (job.ref || '').trim().toLowerCase();

      // Find deployments matching this specific job title or ref
      const jobDeployments = matchedDeployments.filter((d) => {
        const dPosNorm = (d.position || '').trim().toLowerCase();
        const dRefNorm = (d.jobOrderRef || '').trim().toLowerCase();
        if (dPosNorm === jobTitleNorm || (jobRefNorm && dRefNorm === jobRefNorm)) return true;
        if (dPosNorm && (dPosNorm.includes(jobTitleNorm) || jobTitleNorm.includes(dPosNorm))) return true;
        if (dRefNorm && (dRefNorm.includes(jobRefNorm) || jobRefNorm.includes(dRefNorm))) return true;
        if (/forklift/i.test(jobTitleNorm) && (/forklift/i.test(dPosNorm) || (d.employee && /christian dela cruz/i.test(d.employee)))) return true;
        if (/warehouse/i.test(jobTitleNorm) && (/warehouse/i.test(dPosNorm) || (d.employee && /andrea molina|jomar villagracia/i.test(d.employee)))) return true;
        return false;
      });

      // Find bridge hires matching this job
      const jobHires = matchedHires.filter((h) => {
        const hPosNorm = (h.jobTitle || '').trim().toLowerCase();
        const hRefNorm = (h.jobOrderRef || '').trim().toLowerCase();
        if (hPosNorm === jobTitleNorm || (jobRefNorm && hRefNorm === jobRefNorm)) return true;
        if (hPosNorm && (hPosNorm.includes(jobTitleNorm) || jobTitleNorm.includes(hPosNorm))) return true;
        if (hRefNorm && (hRefNorm.includes(jobRefNorm) || jobRefNorm.includes(hRefNorm))) return true;
        if (/forklift/i.test(jobTitleNorm) && (/forklift/i.test(hPosNorm) || (h.name && /christian dela cruz/i.test(h.name)))) return true;
        if (/warehouse/i.test(jobTitleNorm) && (/warehouse/i.test(hPosNorm) || (h.name && /andrea molina|jomar villagracia/i.test(h.name)))) return true;
        return false;
      });

      // Start with existing applicants
      const existingApplicants = [...(job.applicants || [])];

      // Merge deployments into applicants
      jobDeployments.forEach((dep) => {
        const empName = (dep.employee || '').trim();
        if (!empName) return;

        const existingIdx = existingApplicants.findIndex(
          (a) => (a.name || '').trim().toLowerCase() === empName.toLowerCase()
        );

        const hireRecord = {
          name: empName,
          score: dep.score || 92,
          status: 'hired',
          applied: dep.start || 'Jul 2026',
          deployedDate: dep.start || null,
          stage: dep.stage || 'on_site',
          site: dep.site || null,
          shift: dep.shift || null,
          deploymentId: dep.id || null,
        };

        if (existingIdx >= 0) {
          existingApplicants[existingIdx] = {
            ...existingApplicants[existingIdx],
            ...hireRecord,
            status: 'hired',
          };
        } else {
          existingApplicants.unshift(hireRecord);
        }
      });

      // Merge bridge hires into applicants
      jobHires.forEach((hire) => {
        const empName = (hire.name || '').trim();
        if (!empName) return;

        const existingIdx = existingApplicants.findIndex(
          (a) => (a.name || '').trim().toLowerCase() === empName.toLowerCase()
        );

        const hireRecord = {
          name: empName,
          score: hire.score || 90,
          status: 'hired',
          applied: hire.hiredDate || 'Jul 2026',
          deployedDate: hire.hiredDate || null,
          stage: hire.stage || 'on_site',
          deploymentId: hire.linkedDeploymentId || null,
        };

        if (existingIdx >= 0) {
          existingApplicants[existingIdx] = {
            ...existingApplicants[existingIdx],
            ...hireRecord,
            status: 'hired',
          };
        } else {
          existingApplicants.unshift(hireRecord);
        }
      });

      // Count total hired
      const hiredCount = existingApplicants.filter((a) => a.status === 'hired').length;
      const filled = Math.max(hiredCount, job.filled || 0);
      const total = Math.max(job.total || 1, filled);
      const badge = filled >= total ? 'filled' : filled > 0 ? 'filling' : 'open';

      return {
        ...job,
        filled,
        total,
        badge,
        applicants: existingApplicants,
      };
    });

    // Check if there are deployments for roles that don't yet exist in client.jobs
    matchedDeployments.forEach((dep) => {
      const dPosNorm = (dep.position || '').trim().toLowerCase();
      const alreadyHasJob = updatedJobs.some((j) => {
        const jTitleNorm = (j.title || '').trim().toLowerCase();
        if (jTitleNorm === dPosNorm) return true;
        if (jTitleNorm && dPosNorm && (jTitleNorm.includes(dPosNorm) || dPosNorm.includes(jTitleNorm))) return true;
        if (/cashier/i.test(jTitleNorm) && /cashier/i.test(dPosNorm)) return true;
        if (/forklift/i.test(jTitleNorm) && /forklift/i.test(dPosNorm)) return true;
        if (/warehouse/i.test(jTitleNorm) && /warehouse/i.test(dPosNorm)) return true;
        return false;
      });

      if (!alreadyHasJob && dep.position) {
        updatedJobs.push({
          title: dep.position,
          filled: 1,
          total: 5,
          badge: 'filling',
          color: 'var(--blue)',
          location: dep.site || client.address || 'Metro Manila',
          type: 'Full-time · Contractual',
          rate: '₱610/day',
          deadline: dep.end || 'Dec 31, 2026',
          description: `Active deployment for ${dep.position} at ${client.name} (${dep.jobOrderRef || 'Direct Placement'}).`,
          requirements: [
            'DOLE DO-174 Compliant Employment Contract',
            'Pre-Employment Medical Fit-to-Work Clearance',
            'Government Mandated Statutory IDs (SSS, PhilHealth, Pag-IBIG, TIN)',
          ],
          tags: ['Deployment', 'On-site', 'Contractual'],
          applicants: [
            {
              name: dep.employee,
              score: dep.score || 92,
              status: 'hired',
              applied: dep.start || 'Jul 2026',
              deployedDate: dep.start || null,
              stage: dep.stage || 'on_site',
              site: dep.site || null,
              shift: dep.shift || null,
              deploymentId: dep.id || null,
            },
          ],
        });
      }
    });

    return {
      ...client,
      jobs: updatedJobs,
    };
  });
}

export function useClientManagementStore() {
  const [deployments, setDeployments] = useState(loadStoredDeployments);
  const [triggerCount, setTriggerCount] = useState(0);

  const reloadData = useCallback(() => {
    setDeployments(loadStoredDeployments());
    setTriggerCount((c) => c + 1);
  }, []);

  useEffect(() => {
    // 1. Listen to native storage events
    const handleStorage = (e) => {
      if (
        DEPLOYMENTS_STORAGE_KEYS.includes(e.key) ||
        e.key === 'ismers_bridge_hires_v2' ||
        e.key === 'ismers_sync_beacon'
      ) {
        reloadData();
      }
    };

    window.addEventListener('storage', handleStorage);

    // 2. Listen to ISMERSBridge changes
    const unsubscribeBridge = ISMERSBridge.onChange(() => {
      reloadData();
    });

    // 3. Listen to real-time pub/sub events
    const unsubscribeRealtime = subscribeRealtimeEvents((msg) => {
      if (
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
      unsubscribeBridge();
      unsubscribeRealtime();
    };
  }, [reloadData]);

  const clients = useMemo(() => {
    // Trigger recalculation on state/trigger changes
    // eslint-disable-next-line no-unused-expressions
    triggerCount;
    return mergeClientsWithDeployments(CLIENTS, deployments);
  }, [deployments, triggerCount]);

  return {
    clients,
    deployments,
    refreshClients: reloadData,
  };
}
