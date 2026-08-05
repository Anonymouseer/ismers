import { useState, useMemo } from 'react';
import { RETENTION_RISK_STAFF } from '../data/mockAiAnalyticsData';
import Pagination from '../../../components/common/Pagination';

export default function RetentionPredictorTab() {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk-desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 4;

  const filtered = useMemo(() => {
    let list = [...RETENTION_RISK_STAFF];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(q) ||
          s.client.toLowerCase().includes(q) ||
          s.position.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== 'all') {
      list = list.filter((s) => s.riskLevel === riskFilter);
    }

    if (sortBy === 'risk-desc') list.sort((a, b) => b.riskScore - a.riskScore);
    else if (sortBy === 'risk-asc') list.sort((a, b) => a.riskScore - b.riskScore);
    else if (sortBy === 'name-asc') list.sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    return list;
  }, [search, riskFilter, sortBy]);

  useMemo(() => { setPage(1); }, [search, riskFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedStaff = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const highCount = RETENTION_RISK_STAFF.filter((r) => r.riskLevel === 'High Risk').length;
  const medCount = RETENTION_RISK_STAFF.filter((r) => r.riskLevel === 'Medium Risk').length;
  const lowCount = RETENTION_RISK_STAFF.filter((r) => r.riskLevel === 'Low Risk').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 'calc(100vh - 230px)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--red-soft)', color: 'var(--red)', padding: '4px 12px', borderRadius: 20 }}>
          {highCount} High Risk
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--amber-soft)', color: 'var(--amber)', padding: '4px 12px', borderRadius: 20 }}>
          {medCount} Medium Risk
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, background: 'var(--green-soft)', color: 'var(--green)', padding: '4px 12px', borderRadius: 20 }}>
          {lowCount} On Track
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search employee, client, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--panel)', color: 'var(--text)', fontSize: 12, outline: 'none',
            }}
          />
        </div>

        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <option value="all">All Risk Levels</option>
          <option value="High Risk">High Risk</option>
          <option value="Medium Risk">Medium Risk</option>
          <option value="Low Risk">Low Risk</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <option value="risk-desc">Highest Risk First</option>
          <option value="risk-asc">Lowest Risk First</option>
          <option value="name-asc">Name A-Z</option>
        </select>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: 30, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
            No staff match the current filters.
          </div>
        )}

        {paginatedStaff.map((staff) => {
          const riskColor = staff.riskScore >= 75 ? 'var(--red)' : staff.riskScore >= 40 ? 'var(--amber)' : 'var(--green)';
          const riskBg = staff.riskScore >= 75 ? 'var(--red-soft)' : staff.riskScore >= 40 ? 'var(--amber-soft)' : 'var(--green-soft)';

          return (
            <div
              key={staff.id}
              style={{
                background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14,
                padding: 16, boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {staff.employeeName.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{staff.employeeName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                      {staff.position} · <b style={{ color: 'var(--primary)' }}>{staff.client}</b>
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: riskColor, background: riskBg, padding: '3px 10px', borderRadius: 12, border: `1px solid ${riskColor}` }}>
                  {staff.riskLevel} ({staff.riskScore})
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)', fontWeight: 700 }}>Attendance</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{staff.attendance}</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '6px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)', fontWeight: 700 }}>Contract End</div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text)' }}>{staff.contractEnd}</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 4 }}>Risk Factors</div>
                {staff.keyFactors.map((f, i) => (
                  <div key={i} style={{ fontSize: 11, color: 'var(--text)', display: 'flex', gap: 5, marginTop: 2 }}>
                    <span style={{ color: riskColor }}>-</span> {f}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', flex: 1 }}>
                  <b style={{ color: 'var(--text)' }}>AI Action:</b> {staff.recommendedAction}
                </div>
                <button className="btn primary" style={{ padding: '5px 10px', fontSize: 10.5, fontWeight: 700, flexShrink: 0 }}>
                  Take Action
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
