import { useState, useMemo } from 'react';
import { logoUrl } from '../../client-management/utils/clientDisplay';
import { daysLeft, countdownLabel } from '../services/DeploymentAssignmentService';

const COLUMNS = [
  { key: 'name', label: 'Client Account', sortable: true },
  { key: 'status', label: 'Account Status', sortable: true },
  { key: 'deployedCount', label: 'Deployed Headcount', sortable: true },
  { key: 'jobOrdersCount', label: 'Active Job Orders', sortable: true },
  { key: 'site', label: 'Primary Deployment Site', sortable: false },
  { key: 'supervisor', label: 'Account Supervisor', sortable: true },
  { key: 'renewal', label: 'Contract Renewal', sortable: true },
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
        case 'renewal':
          return (daysLeft(a.renewal) - daysLeft(b.renewal)) * dir;
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
              const days = daysLeft(c.renewal);
              const isUrgent = days <= 30;
              const isEndingSoon = days <= 90;
              const cd = countdownLabel(c.renewal);

              return (
                <tr
                  key={c.name}
                  style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.14s ease', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
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
                        <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13 }}>{c.name}</div>
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
                        background: c.status === 'active' ? 'var(--green-soft)' : 'var(--amber-soft)',
                        color: c.status === 'active' ? 'var(--green)' : 'var(--amber)',
                        border: `1px solid ${c.status === 'active' ? 'var(--green)' : 'var(--amber)'}`,
                        display: 'inline-block',
                      }}
                    >
                      {c.status ? c.status.toUpperCase() : 'ACTIVE'}
                    </span>
                  </td>

                  {/* DEPLOYED HEADCOUNT */}
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '4px 10px', borderRadius: 12, fontSize: 11.5 }}>
                      {c.deployedCount} Deployed Staff
                    </span>
                  </td>

                  {/* ACTIVE JOB ORDERS */}
                  <td style={{ padding: '13px 18px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', background: 'var(--blue-soft)', padding: '4px 10px', borderRadius: 12, fontSize: 11.5 }}>
                      {c.jobOrdersCount} Job Orders
                    </span>
                  </td>

                  {/* PRIMARY SITE */}
                  <td style={{ padding: '13px 18px', color: 'var(--text)', fontWeight: 600 }}>
                    {c.site}
                  </td>

                  {/* ACCOUNT SUPERVISOR */}
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{c.supervisor}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{c.supervisorContact}</div>
                  </td>

                  {/* CONTRACT RENEWAL */}
                  <td style={{ padding: '13px 18px' }}>
                    <div style={{ fontWeight: isUrgent ? 800 : 700, color: isUrgent ? 'var(--red)' : isEndingSoon ? 'var(--amber)' : 'var(--text)' }}>
                      {c.renewal}
                    </div>
                    <div style={{ fontSize: 10.5, color: cd.color, fontWeight: 700 }}>
                      {cd.text}
                    </div>
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
                      Open Job Orders &amp; Staff →
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
