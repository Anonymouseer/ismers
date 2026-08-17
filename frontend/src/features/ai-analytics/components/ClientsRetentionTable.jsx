import { useState, useMemo } from 'react';
import { logoUrl } from '../../client-management/utils/clientDisplay';
import Pagination from '../../../components/common/Pagination';

const COLUMNS = [
  { key: 'name', label: 'Client Account', sortable: true },
  { key: 'status', label: 'Account Status', sortable: true },
  { key: 'riskBreakdown', label: 'Workforce Risk Distribution', sortable: true },
  { key: 'totalStaff', label: 'Deployed Staff', sortable: true },
  { key: 'avgAttendance', label: 'Avg Attendance', sortable: true },
  { key: 'site', label: 'Primary Deployment Facility & Site', sortable: false },
  { key: 'supervisor', label: 'Operations Area Lead', sortable: true },
  { key: 'actions', label: 'Action', sortable: false },
];

function SortIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 12, height: 12, marginLeft: 4 }}>
      {direction === 'desc' ? <path d="m6 9 6 6 6-6" /> : <path d="m6 15 6-6 6 6" />}
    </svg>
  );
}

export default function ClientsRetentionTable({
  clientList = [],
  onSelectClient,
}) {
  const [sortKey, setSortKey] = useState('highRiskCount');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const sortedClients = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...clientList].sort((a, b) => {
      switch (sortKey) {
        case 'highRiskCount':
          return ((a.highRiskCount || 0) - (b.highRiskCount || 0)) * dir;
        case 'totalStaff':
          return ((a.totalStaff || 0) - (b.totalStaff || 0)) * dir;
        case 'avgAttendance':
          return ((a.avgAttendanceNum || 0) - (b.avgAttendanceNum || 0)) * dir;
        case 'status':
          return String(a.status || '').localeCompare(String(b.status || '')) * dir;
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
      setSortDir(key === 'highRiskCount' || key === 'totalStaff' ? 'desc' : 'asc');
    }
    setPage(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
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
                const high = c.highRiskCount || 0;
                const med = c.medRiskCount || 0;
                const low = c.lowRiskCount || 0;
                const total = c.totalStaff || (high + med + low);

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
                            {c.industry || 'Staffing & Manpower'}
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
                        Active Account
                      </span>
                    </td>

                    {/* WORKFORCE RISK BREAKDOWN */}
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {high > 0 && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 10.5,
                              fontWeight: 800,
                              background: 'var(--red-soft)',
                              color: 'var(--red)',
                              border: '1px solid var(--red)',
                            }}
                          >
                            {high} High Risk
                          </span>
                        )}
                        {med > 0 && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 10.5,
                              fontWeight: 800,
                              background: 'var(--amber-soft)',
                              color: 'var(--amber)',
                              border: '1px solid var(--amber)',
                            }}
                          >
                            {med} Med Risk
                          </span>
                        )}
                        {low > 0 && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 10.5,
                              fontWeight: 800,
                              background: 'var(--green-soft)',
                              color: 'var(--green)',
                              border: '1px solid var(--green)',
                            }}
                          >
                            {low} On Track
                          </span>
                        )}
                      </div>
                    </td>

                    {/* DEPLOYED STAFF COUNT */}
                    <td style={{ padding: '13px 18px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13 }}>
                        {total} Staff
                      </span>
                    </td>

                    {/* AVG ATTENDANCE */}
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: c.avgAttendanceNum >= 90 ? 'var(--green)' : c.avgAttendanceNum >= 80 ? 'var(--amber)' : 'var(--red)' }}>
                          {c.avgAttendance}
                        </span>
                        <div style={{ width: 45, height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${c.avgAttendanceNum || 85}%`,
                              height: '100%',
                              background: c.avgAttendanceNum >= 90 ? 'var(--green)' : c.avgAttendanceNum >= 80 ? 'var(--amber)' : 'var(--red)',
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* PRIMARY SITE */}
                    <td style={{ padding: '13px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontSize: 11.5 }}>
                        <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'var(--primary)', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
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
                          {c.supervisorContact || '+63 917 555 0184'}
                        </div>
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
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(c.name);
                        }}
                      >
                        View Job Roles &amp; Staff →
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '36px 18px', textAlign: 'center', color: 'var(--muted-fg)' }}>
                  No client accounts found matching your filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── PAGINATION BAR (MAX 12 ROWS PER PAGE) ── */}
      {sortedClients.length > 0 && (
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
            Showing <b>{(safePage - 1) * pageSize + 1}</b> – <b>{Math.min(safePage * pageSize, sortedClients.length)}</b> of <b>{sortedClients.length}</b> Client Accounts (Max {pageSize} per page)
          </div>

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={sortedClients.length}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
}
