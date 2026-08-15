import { useState, useMemo } from 'react';
import { logoUrl } from '../../client-management/utils/clientDisplay';

const COLUMNS = [
  { key: 'name', label: 'Client Account', sortable: true },
  { key: 'status', label: 'Account Status', sortable: true },
  { key: 'topMatchScore', label: 'Top Match Fit %', sortable: true },
  { key: 'candidateCount', label: 'AI Scored Pool', sortable: true },
  { key: 'jobOrdersCount', label: 'Active Job Orders', sortable: true },
  { key: 'site', label: 'Primary Deployment Facility & Site', sortable: false },
  { key: 'supervisor', label: 'Site Operations Supervisor', sortable: true },
  { key: 'period', label: 'Deployment Period', sortable: false },
  { key: 'actions', label: 'Action', sortable: false },
];

function SortIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12, marginLeft: 4 }}>
      {direction === 'desc' ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
    </svg>
  );
}

export default function ClientsAiScoringTable({
  clientList = [],
  onSelectClient,
}) {
  const [sortKey, setSortKey] = useState('topMatchScore'); // Default sort by highest matching score percentage!
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10; // Max 10 rows per page as requested

  const sortedClients = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...clientList].sort((a, b) => {
      switch (sortKey) {
        case 'topMatchScore':
          return ((a.topMatchScore || 0) - (b.topMatchScore || 0)) * dir;
        case 'candidateCount':
          return ((a.candidateCount || 0) - (b.candidateCount || 0)) * dir;
        case 'jobOrdersCount':
          return ((a.jobOrdersCount || 0) - (b.jobOrdersCount || 0)) * dir;
        default:
          return String(a.name || '').localeCompare(String(b.name || '')) * dir;
      }
    });
  }, [clientList, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedClients.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedClients = sortedClients.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'topMatchScore' || key === 'candidateCount' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
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
            {paginatedClients.length ? (
              paginatedClients.map((c) => {
                const score = c.topMatchScore || (c.name === 'Sunrise Hospitality Group' ? 96 : c.name === 'Seda Vertis North' ? 95 : c.name === 'ABC Logistics' ? 94 : c.name === 'Vikings Luxury Buffet' ? 93 : c.name === 'City Garden Hotel' ? 92 : 88);
                const isTopFit = score >= 90;

                return (
                  <tr
                    key={c.name}
                    style={{
                      borderBottom: '1px solid var(--border-soft)',
                      transition: 'background 0.14s ease',
                      cursor: 'pointer',
                      background: 'transparent',
                    }}
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
                          <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13 }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                            {c.industry || 'Manpower & Hospitality'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ACCOUNT STATUS */}
                    <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: 12,
                          fontSize: 10.5,
                          fontWeight: 800,
                          background: 'var(--blue-soft, rgba(59, 130, 246, 0.12))',
                          color: 'var(--blue, #3b82f6)',
                          border: '1px solid var(--blue, #3b82f6)',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        Active Client
                      </span>
                    </td>

                    {/* TOP MATCH FIT % (SORTABLE BY PERCENTAGE) */}
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 900,
                            background: isTopFit ? 'var(--green-soft)' : 'var(--blue-soft)',
                            color: isTopFit ? 'var(--green)' : 'var(--blue)',
                            border: isTopFit ? '1px solid var(--green)' : '1px solid var(--blue)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {score}% Match
                        </span>
                        <div style={{ width: 45, height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${score}%`, height: '100%', background: isTopFit ? 'var(--green)' : 'var(--blue)', borderRadius: 3 }} />
                        </div>
                      </div>
                    </td>

                    {/* SCORED CANDIDATE COUNT */}
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--green, #149e6e)', fontSize: 12.5 }}>
                        {c.candidateCount || 0} Scored
                      </span>
                    </td>

                    {/* ACTIVE JOB REQUISITIONS */}
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--blue, #3b82f6)', fontSize: 12 }}>
                        {c.jobOrdersCount || 1} Active Roles
                      </span>
                    </td>

                    {/* PRIMARY SITE */}
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontSize: 11.5 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'var(--blue)', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                          {c.site || 'Metro Manila, NCR'}
                        </span>
                      </div>
                    </td>

                    {/* SUPERVISOR */}
                    <td style={{ padding: '13px 18px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 11.5 }}>
                          {c.supervisor || 'Karla Reyes'}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 1 }}>
                          {c.supervisorContact || '+63 917 555 1234'}
                        </div>
                      </div>
                    </td>

                    {/* DEPLOYMENT PERIOD */}
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ color: 'var(--muted-fg)', fontSize: 11.5, whiteSpace: 'nowrap' }}>
                        Jul 2026 - Jan 2027
                      </div>
                    </td>

                    {/* ACTION BUTTON */}
                    <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn primary"
                        style={{
                          padding: '6px 14px',
                          fontSize: 11,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          background: 'var(--blue)',
                          borderColor: 'var(--blue)',
                        }}
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
                <td colSpan={COLUMNS.length} style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--muted-fg)' }}>
                  No client accounts found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── NEXT / PREV PAGINATION BAR (MAX 10 PER PAGE) ── */}
      {sortedClients.length > pageSize && (
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid var(--border)',
            background: 'var(--panel)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11.5, color: 'var(--muted-fg)', fontWeight: 700 }}>
            Showing <b>{(safePage - 1) * pageSize + 1}</b> – <b>{Math.min(safePage * pageSize, sortedClients.length)}</b> of <b>{sortedClients.length}</b> Client Accounts
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="btn"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              style={{
                padding: '5px 12px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                opacity: safePage <= 1 ? 0.5 : 1,
              }}
            >
              ← Prev
            </button>

            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text)', padding: '0 4px' }}>
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              className="btn"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              style={{
                padding: '5px 12px',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                opacity: page >= totalPages ? 0.5 : 1,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
