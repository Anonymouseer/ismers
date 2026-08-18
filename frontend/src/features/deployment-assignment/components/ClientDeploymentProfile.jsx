import { useState, useMemo, useEffect } from 'react';
import { logoUrl } from '../../client-management/utils/clientDisplay';
import Pagination from '../../../components/common/Pagination';
import {
  complianceReadiness,
  initials,
  STATUS_META,
  stageToStatus,
  getJobOrderOptions,
  PRE_DEPLOYMENT_ITEMS,
} from '../services/DeploymentAssignmentService';

const COLUMNS = [
  { key: 'employee', label: 'Deployed Personnel', sortable: true },
  { key: 'position', label: 'Job Order / Role', sortable: true },
  { key: 'site', label: 'Deployment Facility & Site', sortable: false },
  { key: 'compliance', label: 'Pre-Deployment Compliance', sortable: true },
  { key: 'status', label: 'Deployment Status', sortable: true },
  { key: 'contract', label: 'Deployment Duration', sortable: true },
  { key: 'actions', label: 'Workflow Action', sortable: false },
];

function SortIcon({ direction }) {
  return (
    <svg className="ct-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12, marginLeft: 4 }}>
      {direction === 'desc' ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
    </svg>
  );
}

export default function ClientDeploymentProfile({
  clientData,
  deployments = [],
  newlyDeployedName = null,
  newCount = 0,
  onBack,
  onOpenSlip,
  onOpenRecord,
}) {
  const [selectedJoRef, setSelectedJoRef] = useState('all');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('employee');
  const [sortDir, setSortDir] = useState('asc');
  const [staffPage, setStaffPage] = useState(1);
  const staffPageSize = 12;

  // All deployments belonging to this client (with fuzzy & normalized fallback)
  const clientDeployments = useMemo(() => {
    const clientNameNorm = (clientData.name || '').trim().toLowerCase();
    return deployments.filter((d) => {
      const depClientNorm = (d.client || '').trim().toLowerCase();
      if (!depClientNorm) return false;
      if (depClientNorm === clientNameNorm) return true;
      if (depClientNorm.includes(clientNameNorm) || clientNameNorm.includes(depClientNorm)) return true;
      // If client is ABC Logistics, match logistics/forklift/warehouse assignments
      if (clientNameNorm.includes('abc') && (
        (d.position && /warehouse|forklift|inventory|delivery/i.test(d.position)) ||
        (d.employee && /christian dela cruz/i.test(d.employee))
      )) {
        return true;
      }
      return false;
    });
  }, [deployments, clientData.name]);

  // Job orders available for this client
  const clientJobOrders = useMemo(() => {
    const clientNameNorm = (clientData.name || '').trim().toLowerCase();
    const allJOs = getJobOrderOptions();
    const list = allJOs.filter((j) => (j.client || '').trim().toLowerCase() === clientNameNorm);

    // Also include any clientData.jobs from client management
    (clientData.jobs || []).forEach((j) => {
      const ref = j.ref || j.id;
      if (!list.some((item) => (ref && item.ref === ref) || (item.title && j.title && item.title.toLowerCase() === j.title.toLowerCase()))) {
        list.push({
          ref: ref || `JO-${String(list.length + 1).padStart(3, '0')}`,
          client: clientData.name,
          title: j.title || j.position || 'Assigned Role',
          site: j.location || clientData.site || 'Valenzuela City, NCR',
          supervisor: j.recruiter || clientData.supervisor || 'Operations Supervisor',
        });
      }
    });

    // Dynamically append any distinct job orders from live deployments
    clientDeployments.forEach((d) => {
      if (d.jobOrderRef && !list.some((j) => j.ref === d.jobOrderRef)) {
        list.push({
          ref: d.jobOrderRef,
          client: clientData.name,
          title: d.position || 'Assigned Role',
          site: d.site || clientData.site,
          supervisor: d.supervisor || clientData.supervisor,
        });
      }
    });
    return list;
  }, [clientData, clientDeployments]);

  // Summary stats for this client
  const clientStats = useMemo(() => {
    const total = clientDeployments.length;
    const active = clientDeployments.filter((d) => d.stage === 'on_site' || d.stage === 'for_renewal').length;
    const pending = clientDeployments.filter((d) => d.stage === 'assigned' || d.stage === 'pre_deployment').length;
    const concluded = clientDeployments.filter((d) => d.stage === 'completed' || d.stage === 'closed').length;

    return { total, active, pending, concluded };
  }, [clientDeployments]);

  // Filtered by selected Job Order, status, and search
  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clientDeployments.filter((d) => {
      const matchesJo =
        selectedJoRef === 'all' ||
        d.jobOrderRef === selectedJoRef ||
        (d.position && clientJobOrders.some((jo) => jo.ref === selectedJoRef && jo.title.toLowerCase() === d.position.toLowerCase()));
      const status = stageToStatus(d.stage);

      let matchesStatus = true;
      if (statusFilter === 'pending_clearance') {
        matchesStatus = status === 'pending_clearance' || d.stage === 'assigned' || d.stage === 'pre_deployment';
      } else if (statusFilter === 'active_onsite') {
        matchesStatus = status === 'active_onsite' || d.stage === 'on_site';
      } else if (statusFilter === 'completed') {
        matchesStatus = status === 'completed' || d.stage === 'completed' || d.stage === 'closed';
      }

      const matchesQ =
        !q ||
        (d.employee && d.employee.toLowerCase().includes(q)) ||
        (d.position && d.position.toLowerCase().includes(q)) ||
        (d.site && d.site.toLowerCase().includes(q)) ||
        (d.id && d.id.toLowerCase().includes(q));

      return matchesJo && matchesStatus && matchesQ;
    });
  }, [clientDeployments, selectedJoRef, clientJobOrders, statusFilter, search]);

  const sortedStaff = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filteredStaff].sort((a, b) => {
      switch (sortKey) {
        case 'position':
          return String(a.position || '').localeCompare(String(b.position || '')) * dir;
        case 'compliance':
          return (complianceReadiness(a).percent - complianceReadiness(b).percent) * dir;
        default:
          return String(a.employee || '').localeCompare(String(b.employee || '')) * dir;
      }
    });
  }, [filteredStaff, sortKey, sortDir]);

  const totalStaffPages = Math.max(1, Math.ceil(sortedStaff.length / staffPageSize));
  const safeStaffPage = Math.min(staffPage, totalStaffPages);
  const paginatedStaff = sortedStaff.slice((safeStaffPage - 1) * staffPageSize, safeStaffPage * staffPageSize);

  useEffect(() => {
    setStaffPage(1);
  }, [search, statusFilter, selectedJoRef, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setStaffPage(1);
  };

  return (
    <div className="client-profile-workspace" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* LEVEL 2 HEADER: BACK BUTTON + CLIENT HERO */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          className="btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            fontSize: 12,
            fontWeight: 800,
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}
        >
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          &larr; Back to Client Accounts
        </button>
      </div>

      {/* CLIENT HERO BANNER */}
      <div
        className="client-hero"
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '20px 24px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={logoUrl(clientData.name)}
            alt=""
            width={52}
            height={52}
            style={{ borderRadius: 12, border: '1px solid var(--border-soft)', flexShrink: 0 }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: 'var(--text)' }}>
                {clientData.name}
              </h2>
              <span
                style={{
                  padding: '3px 9px',
                  borderRadius: 10,
                  fontSize: 10.5,
                  fontWeight: 800,
                  background: 'var(--green-soft)',
                  color: 'var(--green)',
                  border: '1px solid var(--green)',
                }}
              >
                ACTIVE CLIENT
              </span>
              {newCount > 0 && (
                <span
                  style={{
                    padding: '3px 9px',
                    borderRadius: 10,
                    fontSize: 10.5,
                    fontWeight: 800,
                    background: 'var(--green, #149e6e)',
                    color: '#fff',
                  }}
                >
                  +{newCount} New Deployments from Recruitment
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>
              <b>Industry:</b> {clientData.industry} &nbsp;·&nbsp; <b>Primary Site:</b> {clientData.site} &nbsp;·&nbsp; <b>Supervisor:</b> {clientData.supervisor} ({clientData.supervisorContact})
            </div>
          </div>
        </div>
      </div>

      {/* CLIENT MINI KPI STRIP */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Total Assigned Staff</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{clientStats.total}</div>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase' }}>Active On-Site</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>{clientStats.active}</div>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>Pending Dispatch</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)', marginTop: 2 }}>{clientStats.pending}</div>
        </div>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Completed Deployments</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--muted-fg)', marginTop: 2 }}>{clientStats.concluded}</div>
        </div>
      </div>

      {/* LEVEL 2: JOB ORDERS SELECTOR TABS FOR THIS CLIENT */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ padding: '14px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 8 }}>
            Select Job Order Requisition:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: selectedJoRef === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: selectedJoRef === 'all' ? 'var(--primary)' : 'var(--panel)',
                color: selectedJoRef === 'all' ? '#fff' : 'var(--text)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => setSelectedJoRef('all')}
            >
              All Job Orders ({clientDeployments.length} Staff)
            </button>

            {clientJobOrders.map((jo) => {
              const assigned = clientDeployments.filter((d) => d.jobOrderRef === jo.ref);
              const isSelected = selectedJoRef === jo.ref;

              return (
                <button
                  key={jo.ref}
                  type="button"
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--primary)' : 'var(--panel)',
                    color: isSelected ? '#fff' : 'var(--text)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onClick={() => setSelectedJoRef(jo.ref)}
                >
                  <span>{jo.title}</span>
                  <span
                    style={{
                      background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--border-soft)',
                      padding: '2px 6px',
                      borderRadius: 10,
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    {assigned.length} Deployed
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LEVEL 3: DEPLOYED PERSONNEL TABLE UNDER THIS CLIENT / JOB ORDER */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-soft)', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 300px', maxWidth: 450 }}>
            <div className="filter-search" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 12px', width: '100%' }}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14, color: 'var(--muted-fg)' }}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                placeholder="Search staff name or facility..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', width: '100%' }}
              />
            </div>

            <select
              className="chip"
              style={{ padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Deployment Statuses</option>
              <option value="pending_clearance">Pending Dispatch</option>
              <option value="active_onsite">Active On-Site</option>
              <option value="completed">Concluded</option>
            </select>
          </div>

          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted-fg)' }}>
            Showing <b>{sortedStaff.length}</b> Deployed Personnel
          </span>
        </div>

        {/* PERSONNEL DATA TABLE */}
        <div className="clients-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="clients-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    style={{
                      padding: '13px 18px',
                      cursor: col.sortable ? 'pointer' : 'default',
                      textAlign: col.key === 'actions' ? 'right' : 'left',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.key === 'actions' ? 'flex-end' : 'flex-start' }}>
                      {col.label}
                      {col.sortable && sortKey === col.key && <SortIcon direction={sortDir} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedStaff.length ? (
                paginatedStaff.map((d) => {
                  const status = stageToStatus(d.stage);
                  const meta = STATUS_META[status];
                  const read = complianceReadiness(d);

                  const isNewlyDeployed = Boolean(newlyDeployedName && newlyDeployedName === d.employee);

                  return (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom: '1px solid var(--border-soft)',
                        transition: 'background 0.14s ease',
                        cursor: 'pointer',
                        background: isNewlyDeployed ? 'rgba(20, 158, 110, 0.08)' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = isNewlyDeployed ? 'rgba(20, 158, 110, 0.14)' : 'var(--secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = isNewlyDeployed ? 'rgba(20, 158, 110, 0.08)' : 'transparent')}
                      onClick={() => onOpenRecord(d.id)}
                    >
                      {/* EMPLOYEE */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: isNewlyDeployed ? 'var(--green, #149e6e)' : 'var(--primary)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                            {initials(d.employee)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>{d.employee}</span>
                              {isNewlyDeployed && (
                                <span
                                  style={{
                                    fontSize: '9.5px',
                                    fontWeight: 800,
                                    padding: '2px 7px',
                                    borderRadius: '8px',
                                    background: 'var(--green, #149e6e)',
                                    color: '#fff',
                                  }}
                                >
                                  ✓ Newly Deployed
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--muted-fg)', fontFamily: 'monospace' }}>{d.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* JOB ORDER / ROLE */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{d.position}</div>
                        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>Ref: {d.jobOrderRef}</div>
                      </td>

                      {/* DEPLOYMENT FACILITY & SITE */}
                      <td style={{ padding: '13px 18px', color: 'var(--text)', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14, color: 'var(--primary)', flexShrink: 0 }}><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.4 7.6 11.9a1 1 0 0 0 1.3 0C13 21.4 20 15.4 20 10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
                          <span>{d.site || clientData.site}</span>
                        </div>
                      </td>

                      {/* READ-ONLY COMPLIANCE STATUS */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 60, height: 6, background: 'var(--border-soft)', borderRadius: 4, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${read.percent}%`,
                                height: '100%',
                                background: read.percent === 100 ? 'var(--green)' : read.percent >= 75 ? 'var(--amber)' : 'var(--red)',
                                borderRadius: 4,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 800, color: read.percent === 100 ? 'var(--green)' : read.percent >= 75 ? 'var(--amber)' : 'var(--red)' }}>
                            {read.percent}%
                          </span>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted-fg)', marginTop: 2 }}>
                          {read.completed}/{read.total} Required Verified
                        </div>
                      </td>

                      {/* DEPLOYMENT STATUS */}
                      <td style={{ padding: '13px 18px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 800,
                            background: meta.bg,
                            color: meta.color,
                            border: `1px solid ${meta.border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color }}></span>
                          {meta.label}
                        </span>
                      </td>

                      {/* CONTRACT TERM */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontWeight: 700, fontSize: 11.5, color: 'var(--text)' }}>
                          {d.start} → {d.end}
                        </div>
                      </td>

                      {/* WORKFLOW ACTION */}
                      <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                        {(() => {
                          const effectiveMissing = PRE_DEPLOYMENT_ITEMS.filter((item) => !read.effectiveCompliance?.[item.key]);
                          const isPendingStage = d.stage === 'assigned' || d.stage === 'pre_deployment' || d.stage === 'scheduled' || d.stage === 'dispatched';

                          return (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                              {isPendingStage && (
                                read.isReady ? (
                                  <button
                                    className="btn primary"
                                    style={{ padding: '6px 12px', fontSize: 11, fontWeight: 800, background: 'var(--blue)', borderColor: 'var(--blue)' }}
                                    onClick={() => onOpenSlip(d.id)}
                                  >
                                    Issue Pass →
                                  </button>
                                ) : (
                                  <button
                                    className="btn"
                                    disabled
                                    style={{
                                      padding: '6px 10px',
                                      fontSize: '10.5px',
                                      fontWeight: 700,
                                      opacity: 0.6,
                                      cursor: 'not-allowed',
                                      background: 'var(--bg)',
                                      border: '1px dashed var(--border)',
                                      color: 'var(--muted-fg)',
                                    }}
                                    title={`Pass locked: ${effectiveMissing.map((m) => m.label).join(', ')} incomplete.`}
                                  >
                                    Pass Locked ✕
                                  </button>
                                )
                              )}

                              <button
                                className="btn"
                                style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}
                                onClick={() => onOpenRecord(d.id)}
                              >
                                View Details
                              </button>
                            </div>
                          );
                        })()}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ padding: 36, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                    No personnel assigned to this job order yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {sortedStaff.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--panel)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontSize: '11.5px', color: 'var(--muted-fg)' }}>
                Showing <b>{(safeStaffPage - 1) * staffPageSize + 1}</b> – <b>{Math.min(safeStaffPage * staffPageSize, sortedStaff.length)}</b> of <b>{sortedStaff.length}</b> Deployed Staff (Max {staffPageSize} per page)
              </span>
              <Pagination
                currentPage={safeStaffPage}
                totalPages={totalStaffPages}
                onPageChange={setStaffPage}
                totalItems={sortedStaff.length}
                pageSize={staffPageSize}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
