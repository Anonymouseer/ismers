import { useState, useMemo } from 'react';
import { logoUrl } from '../../client-management/utils/clientDisplay';
import {
  complianceReadiness,
  initials,
  STATUS_META,
  stageToStatus,
  JOB_ORDER_OPTIONS,
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
  onBack,
  onOpenCompliance,
  onOpenSlip,
  onOpenRecord,
  onNewDeployment,
}) {
  const [selectedJoRef, setSelectedJoRef] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('employee');
  const [sortDir, setSortDir] = useState('asc');

  // Job orders available for this client
  const clientJobOrders = useMemo(() => {
    return JOB_ORDER_OPTIONS.filter((j) => j.client === clientData.name);
  }, [clientData.name]);

  // All deployments belonging to this client
  const clientDeployments = useMemo(() => {
    return deployments.filter((d) => d.client === clientData.name);
  }, [deployments, clientData.name]);

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
      const matchesJo = selectedJoRef === 'all' || d.jobOrderRef === selectedJoRef;
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
        d.employee.toLowerCase().includes(q) ||
        d.position.toLowerCase().includes(q) ||
        (d.site && d.site.toLowerCase().includes(q)) ||
        d.id.toLowerCase().includes(q);

      return matchesJo && matchesStatus && matchesQ;
    });
  }, [clientDeployments, selectedJoRef, statusFilter, search]);

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

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* TOP BACK BUTTON */}
      <div>
        <button
          type="button"
          className="btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 11.5, fontWeight: 700 }}
          onClick={onBack}
        >
          ← Back to All Clients
        </button>
      </div>

      {/* LEVEL 1: CLIENT HEADER SUMMARY CARD */}
      <div
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
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>
              <b>Industry:</b> {clientData.industry} &nbsp;·&nbsp; <b>Primary Site:</b> {clientData.site} &nbsp;·&nbsp; <b>Supervisor:</b> {clientData.supervisor} ({clientData.supervisorContact})
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="btn primary"
            style={{ padding: '8px 16px', fontWeight: 800, fontSize: 12 }}
            onClick={() => onNewDeployment(clientData.name)}
          >
            + Deploy Worker to {clientData.name.split(' ')[0]}
          </button>
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
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase' }}>Pending Clearance</div>
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
              <option value="pending_clearance">Pending Clearance</option>
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
                sortedStaff.map((d) => {
                  const status = stageToStatus(d.stage);
                  const meta = STATUS_META[status];
                  const read = complianceReadiness(d);

                  return (
                    <tr
                      key={d.id}
                      style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.14s ease', cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => onOpenRecord(d.id)}
                    >
                      {/* EMPLOYEE */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                            {initials(d.employee)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13 }}>{d.employee}</div>
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
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 12 }}>
                          {d.site}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                          {d.shift || 'Regular Day Shift'} &nbsp;·&nbsp; Supv: {d.supervisor ? d.supervisor.split(' ')[0] : 'Supervisor'}
                        </div>
                      </td>

                      {/* COMPLIANCE */}
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700 }}>
                            <span style={{ color: read.isReady ? 'var(--green)' : 'var(--purple)' }}>
                              {read.isReady ? 'Ready for Dispatch' : `${read.count}/6 Completed`}
                            </span>
                            <span style={{ color: 'var(--muted-fg)' }}>{read.percent}%</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                            <div style={{ width: `${read.percent}%`, height: '100%', background: read.isReady ? 'var(--green)' : 'var(--purple)', borderRadius: 3 }}></div>
                          </div>
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
                            background: meta.soft,
                            color: meta.color,
                            border: `1px solid ${meta.color}`,
                            display: 'inline-block',
                            whiteSpace: 'nowrap',
                          }}
                        >
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
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                          {(d.stage === 'assigned' || d.stage === 'pre_deployment') && (
                            <button
                              className="btn primary"
                              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 800, background: 'var(--purple)', borderColor: 'var(--purple)' }}
                              onClick={() => onOpenCompliance(d.id)}
                            >
                              Verify Checklist →
                            </button>
                          )}

                          {(d.stage === 'scheduled' || d.stage === 'dispatched') && (
                            <button
                              className="btn primary"
                              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 800, background: 'var(--blue)', borderColor: 'var(--blue)' }}
                              onClick={() => onOpenSlip(d.id)}
                            >
                              Issue Pass →
                            </button>
                          )}

                          {d.stage === 'on_site' && (
                            <button
                              className="btn"
                              style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}
                              onClick={() => onOpenRecord(d.id)}
                            >
                              View Deployment Details
                            </button>
                          )}
                        </div>
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
        </div>
      </div>
    </div>
  );
}
