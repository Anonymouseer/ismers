import { useState } from 'react';
import { attendanceRate, countdownLabel, STATUS_META, STATUS_ORDER, stageToStatus } from '../services/DeploymentAssignmentService';
import PersonAvatar from '../../../components/common/PersonAvatar';

export default function StaffTableView({ deployments, onOpen }) {
  const [selectedClient, setSelectedClient] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Status Filter options
  const statusOptions = [{ v: 'all', label: 'All Deployments' }, ...STATUS_ORDER.map((s) => ({ v: s, label: STATUS_META[s].label }))];

  // Filter deployments by Client and Status
  const filtered = deployments.filter((d) => {
    const matchesClient = selectedClient === 'all' || d.client === selectedClient;
    const status = stageToStatus(d.stage);
    const matchesStatus = activeStatus === 'all' || status === activeStatus;
    return matchesClient && matchesStatus;
  });

  // Pagination Math
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filtered.slice(startIndex, startIndex + pageSize);

  // Extract unique client names
  const clientList = Array.from(new Set(deployments.map((d) => d.client)));

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setCurrentPage(1);
  };

  const handleStatusSelect = (status) => {
    setActiveStatus(status);
    setCurrentPage(1);
  };

  if (!deployments.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted-fg)', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, marginTop: 16 }}>
        No deployed staff records found matching your current search or client filters.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
      {/* CLIENT FILTER QUICK CHIPS */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase', marginRight: 4 }}>
          Filter by Client:
        </span>
        <button
          style={{
            padding: '5px 12px',
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: selectedClient === 'all' ? 'var(--primary)' : 'var(--panel)',
            color: selectedClient === 'all' ? '#fff' : 'var(--muted-fg)',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={() => handleClientSelect('all')}
        >
          All Accounts ({deployments.length})
        </button>
        {clientList.map((client) => {
          const count = deployments.filter((d) => d.client === client).length;
          const isActive = selectedClient === client;
          return (
            <button
              key={client}
              style={{
                padding: '5px 12px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: isActive ? 'var(--primary)' : 'var(--panel)',
                color: isActive ? '#fff' : 'var(--muted-fg)',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => handleClientSelect(client)}
            >
              {client} ({count})
            </button>
          );
        })}
      </div>

      {/* MASTER DATA TABLE CONTAINER WITH EMBEDDED TOP HEADER TABS (OPTION 2) */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        
        {/* OPTION 2 EMBEDDED STATUS TABS HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--panel)', padding: 3, borderRadius: 10, border: '1px solid var(--border)' }}>
            {statusOptions.map((o) => {
              const meta = STATUS_META[o.v];
              const isActive = o.v === activeStatus;
              return (
                <button
                  key={o.v}
                  type="button"
                  style={{
                    padding: '5px 12px',
                    borderRadius: 7,
                    border: 'none',
                    background: isActive ? (meta ? meta.color : 'var(--primary)') : 'transparent',
                    color: isActive ? '#fff' : 'var(--muted-fg)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => handleStatusSelect(o.v)}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)' }}>
            Total Results: <b style={{ color: 'var(--text)' }}>{totalItems}</b>
          </span>
        </div>

        {/* DATA TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 16px' }}>Deployed Employee</th>
                <th style={{ padding: '12px 16px' }}>Assigned Position</th>
                <th style={{ padding: '12px 16px' }}>Client Account</th>
                <th style={{ padding: '12px 16px' }}>Deployment Site</th>
                <th style={{ padding: '12px 16px' }}>Contract Validity</th>
                <th style={{ padding: '12px 16px' }}>3-Month Renewal Status</th>
                <th style={{ padding: '12px 16px' }}>Attendance Rate</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
                paginatedData.map((d) => {
                  const status = stageToStatus(d.stage);
                  const meta = STATUS_META[status];
                  const rate = attendanceRate(d);
                  const cd = countdownLabel(d.end);

                  return (
                    <tr
                      key={d.id}
                      style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.14s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* EMPLOYEE */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <PersonAvatar
                            name={d.employee}
                            size="sm"
                            variant="blue"
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)' }}>{d.employee}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontFamily: 'monospace' }}>{d.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* POSITION */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text)' }}>{d.position}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>Ref: {d.jobOrderRef}</div>
                      </td>

                      {/* CLIENT */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary)', background: 'var(--secondary)', padding: '4px 10px', borderRadius: 6, fontSize: 11 }}>
                          {d.client}
                        </span>
                      </td>

                      {/* SITE */}
                      <td style={{ padding: '12px 16px', color: 'var(--text)', fontWeight: 600 }}>
                        {d.site}
                      </td>

                      {/* CONTRACT DATES */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600 }}>{d.start} → {d.end}</div>
                      </td>

                      {/* RENEWAL ALERT BADGE */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 10.5,
                            fontWeight: 800,
                            background: cd.soft,
                            color: cd.color,
                          }}
                        >
                          {cd.text}
                        </span>
                      </td>

                      {/* ATTENDANCE RATE */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 100 }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}>
                            <div style={{ width: `${rate}%`, height: '100%', background: meta.color, borderRadius: 4 }}></div>
                          </div>
                          <span style={{ fontWeight: 800, fontSize: 11 }}>{rate}%</span>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          className="btn primary"
                          style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700 }}
                          onClick={() => onOpen(d.id)}
                        >
                          Manage Record
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                    No deployed staff records match the selected status filter ({activeStatus}).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER CONTROL */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg)', fontSize: 11.5 }}>
          <div style={{ color: 'var(--muted-fg)' }}>
            Showing <b>{totalItems > 0 ? startIndex + 1 : 0}</b> to <b>{Math.min(startIndex + pageSize, totalItems)}</b> of <b>{totalItems}</b> deployments
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted-fg)' }}>
              <span>Rows per page:</span>
              <select
                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', fontSize: 11, fontWeight: 700, outline: 'none' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
                <option value={96}>96</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="btn"
                disabled={currentPage === 1}
                style={{ padding: '5px 10px', fontSize: 11, opacity: currentPage === 1 ? 0.5 : 1 }}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontWeight: 700 }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn"
                disabled={currentPage >= totalPages}
                style={{ padding: '5px 10px', fontSize: 11, opacity: currentPage >= totalPages ? 0.5 : 1 }}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
