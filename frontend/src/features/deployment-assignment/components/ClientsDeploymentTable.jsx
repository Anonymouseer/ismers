import { useState, useMemo } from 'react';
import { logoUrl } from '../../client-management/utils/clientDisplay';

const COLUMNS = [
  { key: 'name', label: 'Client Account', sortable: true },
  { key: 'status', label: 'Account Status', sortable: true },
  { key: 'deployedCount', label: 'Deployed Headcount', sortable: true },
  { key: 'jobOrdersCount', label: 'Active Job Orders', sortable: true },
  { key: 'site', label: 'Primary Deployment Facility & Site', sortable: false },
  { key: 'supervisor', label: 'Site Operations Supervisor', sortable: true },
  { key: 'period', label: 'Deployment Period', sortable: false },
  { key: 'actions', label: 'Action', sortable: false },
];

function SortIcon({ direction }) {
  return (
    <svg className="ct-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12, marginLeft: 4 }}>
      {direction === 'desc' ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
    </svg>
  );
}

export default function ClientsDeploymentTable({
  clientList = [],
  newCountsByClient = {},
  onSelectClient,
}) {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const sortedClients = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...clientList].sort((a, b) => {
      switch (sortKey) {
        case 'deployedCount':
          return (a.deployedCount - b.deployedCount) * dir;
        case 'jobOrdersCount':
          return (a.jobOrdersCount - b.jobOrdersCount) * dir;
        default:
          return String(a.name || '').localeCompare(String(b.name || '')) * dir;
      }
    });
  }, [clientList, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
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
          {sortedClients.length ? (
            sortedClients.map((c) => {
              const newCount = newCountsByClient[c.name] || 0;
              const hasNew = newCount > 0;
              return (
                <tr
                  key={c.name}
                  style={{
                    borderBottom: '1px solid var(--border-soft)',
                    transition: 'background 0.14s ease',
                    cursor: 'pointer',
                    background: hasNew ? 'rgba(20, 158, 110, 0.05)' : 'transparent',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = hasNew ? 'rgba(20, 158, 110, 0.10)' : 'var(--secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = hasNew ? 'rgba(20, 158, 110, 0.05)' : 'transparent')}
                  onClick={() => onSelectClient(c.name)}
                >
                  {/* CLIENT WITH LOGO */}
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={logoUrl(c.name)}
                        alt=""
                        width={34}
                        height={34}
                        style={{ borderRadius: 8, flexShrink: 0, border: '1px solid var(--border-soft)' }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{c.name}</span>
                          {hasNew && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                background: 'var(--green-soft, #e8f5e9)',
                                color: 'var(--green, #149e6e)',
                                border: '1px solid var(--green, #149e6e)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--green, #149e6e)' }}></span>
                              +{newCount} New
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>{c.industry}</div>
                      </div>
                    </div>
                  </td>

                  {/* ACCOUNT STATUS */}
                  <td style={{ padding: '13px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 800,
                        background: 'var(--green-soft)',
                        color: 'var(--green)',
                        border: '1px solid var(--green)',
                        display: 'inline-block',
                      }}
                    >
                      ACTIVE CLIENT
                    </span>
                  </td>

                  {/* DEPLOYED HEADCOUNT */}
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '4px 10px', borderRadius: 12, fontSize: 11.5 }}>
                        {c.deployedCount} Deployed
                      </span>
                      {hasNew && (
                        <span
                          style={{
                            fontWeight: 800,
                            color: '#fff',
                            background: 'var(--green, #149e6e)',
                            padding: '2px 7px',
                            borderRadius: '10px',
                            fontSize: '10px',
                          }}
                        >
                          +{newCount}
                        </span>
                      )}
                    </div>
                  </td>


                {/* ACTIVE JOB ORDERS */}
                <td style={{ padding: '13px 18px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', background: 'var(--blue-soft)', padding: '4px 10px', borderRadius: 12, fontSize: 11.5 }}>
                    {c.jobOrdersCount} Active Roles
                  </span>
                </td>

                {/* PRIMARY SITE */}
                <td style={{ padding: '13px 18px', color: 'var(--text)', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14, color: 'var(--primary)', flexShrink: 0 }}><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.4 7.6 11.9a1 1 0 0 0 1.3 0C13 21.4 20 15.4 20 10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
                    <span>{c.site}</span>
                  </div>
                </td>

                {/* ACCOUNT SUPERVISOR */}
                <td style={{ padding: '13px 18px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.supervisor}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{c.supervisorContact}</div>
                </td>

                {/* DEPLOYMENT PERIOD */}
                <td style={{ padding: '13px 18px', color: 'var(--text)', fontWeight: 600, fontSize: 11.5 }}>
                  Jul 2026 – Jan 2027
                </td>

                {/* ACTION */}
                <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                  <button
                    className="btn primary"
                    style={{ padding: '6px 14px', fontSize: 11, fontWeight: 800 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClient(c.name);
                    }}
                  >
                    View Job Orders &amp; Staff →
                  </button>
                </td>
              </tr>
            );
          })
        ) : (

            <tr>
              <td colSpan={COLUMNS.length} style={{ padding: 36, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                No clients found matching your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
