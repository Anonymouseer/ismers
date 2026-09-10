import { useState, useMemo } from 'react';
import { logoUrl, openPositionsFor, renewalStatus } from '../utils/clientDisplay';

const COLUMNS = [
  { key: 'name', label: 'Client', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'industry', label: 'Industry', sortable: true },
  { key: 'address', label: 'Address', sortable: false },
  { key: 'am', label: 'Account Manager', sortable: true },
  { key: 'openPositions', label: 'Open Positions', sortable: true },
  { key: 'renewal', label: 'Contract Renewal', sortable: true },
  { key: 'revenueQ', label: 'Revenue this Q', sortable: true },
];

function parseRevenue(str) {
  const n = parseFloat((str || '').replace(/[₱,]/g, ''));
  return Number.isNaN(n) ? -1 : n;
}

function SortIcon({ direction }) {
  return (
    <svg className="ct-sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      {direction === 'desc' ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
    </svg>
  );
}

export default function ClientsTable({ clients, onSelect, onUpdateStatus }) {
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const rows = useMemo(() => {
    return clients.map(({ client, index }) => ({
      client,
      index,
      openPositions: openPositionsFor(client),
      renewalInfo: renewalStatus(client.renewal),
    }));
  }, [clients]);

  const sortedRows = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      switch (sortKey) {
        case 'openPositions':
          return (a.openPositions - b.openPositions) * dir;
        case 'revenueQ':
          return (parseRevenue(a.client.revenueQ) - parseRevenue(b.client.revenueQ)) * dir;
        case 'renewal': {
          const aDays = a.renewalInfo.expired ? -Infinity : (a.renewalInfo.days ?? Infinity);
          const bDays = b.renewalInfo.expired ? -Infinity : (b.renewalInfo.days ?? Infinity);
          return (aDays - bDays) * dir;
        }
        default:
          return String(a.client[sortKey] || '').localeCompare(String(b.client[sortKey] || '')) * dir;
      }
    });
  }, [rows, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="clients-table-wrap">
      <table className="clients-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={sortKey === col.key ? 'sorted' : ''}
                onClick={col.sortable ? () => handleSort(col.key) : undefined}
                style={{ cursor: col.sortable ? 'pointer' : 'default' }}
              >
                {col.label}
                {col.sortable && sortKey === col.key && <SortIcon direction={sortDir} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.length ? sortedRows.map(({ client: c, index, openPositions, renewalInfo }) => {
            const statusLabel = c.status.charAt(0).toUpperCase() + c.status.slice(1);
            const renewalClass = renewalInfo.expired ? 'expired' : (renewalInfo.days !== null && renewalInfo.days <= 30) ? 'warn' : (renewalInfo.days === null ? 'muted' : '');
            return (
              <tr
                key={index}
                className={c.status === 'archived' ? 'is-archived' : ''}
                onClick={() => onSelect(index)}
              >
                <td>
                  <div className="ct-client-cell">
                    <img className="ct-logo" src={logoUrl(c.name)} alt="" width={34} height={34} />
                    <div>
                      <div className="ct-client-name">{c.name}</div>
                    </div>
                  </div>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <select
                    className={`status-pill ${c.status}`}
                    value={c.status}
                    onChange={(e) => {
                      if (onUpdateStatus) {
                        onUpdateStatus(c.id || c.companyId || c.name, e.target.value);
                      }
                    }}
                    title="Click to update client status"
                    style={{
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      fontFamily: 'inherit',
                      fontWeight: 700,
                      padding: '4px 18px 4px 10px',
                      borderRadius: '20px',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 6px center',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="prospect">Prospect</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td>{c.industry}</td>
                <td className="ct-address">{c.address || '—'}</td>
                <td>{c.am}</td>
                <td>{openPositions}</td>
                <td className={`ct-renewal ${renewalClass}`}>{c.renewal}</td>
                <td>{c.revenueQ}</td>
              </tr>
            );
          }) : (
            <tr className="ct-empty-row">
              <td colSpan={COLUMNS.length}>No clients match your filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}