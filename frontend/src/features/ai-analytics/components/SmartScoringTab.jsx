import { useState, useMemo, useCallback } from 'react';
import { AI_CANDIDATE_MATCHES } from '../data/mockAiAnalyticsData';
import Pagination from '../../../components/common/Pagination';
import SidebarContextMenu from '../../../components/layout/SidebarContextMenu';

const CLIENT_LIST = [...new Set(AI_CANDIDATE_MATCHES.map((m) => m.client))];

export default function SmartScoringTab() {
  const [selectedId, setSelectedId] = useState(AI_CANDIDATE_MATCHES[0].id);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score-desc');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const [ctxMenu, setCtxMenu] = useState({ visible: false, x: 0, y: 0, items: [] });
  const closeCtx = useCallback(() => setCtxMenu((prev) => ({ ...prev, visible: false })), []);

  const handleItemContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(item.id);
    setCtxMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      items: [
        {
          label: `Shortlist Candidate (${item.applicantName})`,
          icon: '<polyline points="20 6 9 17 4 12"/>',
          action: () => alert(`Candidate ${item.applicantName} shortlisted!`),
        },
        {
          label: 'View Full AI Scorecard',
          icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
          action: () => setSelectedId(item.id),
        },
        { divider: true },
        {
          label: `Export Match Analysis`,
          icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
          action: () => alert(`Exporting AI analysis for ${item.applicantName}...`),
        },
      ],
    });
  };

  const filtered = useMemo(() => {
    let list = [...AI_CANDIDATE_MATCHES];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.applicantName.toLowerCase().includes(q) ||
          m.targetJob.toLowerCase().includes(q) ||
          m.client.toLowerCase().includes(q) ||
          m.topSkills.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (clientFilter !== 'all') {
      list = list.filter((m) => m.client === clientFilter);
    }

    if (sortBy === 'score-desc') list.sort((a, b) => b.matchScore - a.matchScore);
    else if (sortBy === 'score-asc') list.sort((a, b) => a.matchScore - b.matchScore);
    else if (sortBy === 'name-asc') list.sort((a, b) => a.applicantName.localeCompare(b.applicantName));
    else if (sortBy === 'name-desc') list.sort((a, b) => b.applicantName.localeCompare(a.applicantName));

    return list;
  }, [search, clientFilter, sortBy]);

  useMemo(() => { setPage(1); }, [search, clientFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedRoster = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = AI_CANDIDATE_MATCHES.find((m) => m.id === selectedId) || filtered[0] || AI_CANDIDATE_MATCHES[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 'calc(100vh - 230px)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search applicant, position, client, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--panel)', color: 'var(--text)', fontSize: 12, outline: 'none',
            }}
          />
        </div>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <option value="all">All Clients</option>
          {CLIENT_LIST.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <option value="score-desc">Highest Score First</option>
          <option value="score-asc">Lowest Score First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            AI Match Ranking Roster
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                No candidates match the current filters.
              </div>
            )}
            {paginatedRoster.map((item, idx) => {
              const globalIdx = (page - 1) * PAGE_SIZE + idx;
              const isSelected = item.id === selectedId;
              const scoreColor = item.matchScore >= 85 ? 'var(--green)' : item.matchScore >= 70 ? 'var(--primary)' : 'var(--amber)';
              const scoreBg = item.matchScore >= 85 ? 'var(--green-soft)' : item.matchScore >= 70 ? 'var(--secondary)' : 'var(--amber-soft)';

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-soft)',
                    background: isSelected ? 'var(--secondary)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                  onClick={() => setSelectedId(item.id)}
                  onContextMenu={(e) => handleItemContextMenu(e, item)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.applicantName.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ fontSize: 10, color: 'var(--muted-fg)', marginRight: 4 }}>#{globalIdx + 1}</span>
                        {item.applicantName}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.targetJob} · {item.client}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: scoreColor, background: scoreBg, padding: '3px 8px', borderRadius: 10, flexShrink: 0 }}>
                    {item.matchScore}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected.applicantName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{selected.applicantName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                  {selected.targetJob} · <b style={{ color: 'var(--primary)' }}>{selected.client}</b>
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: selected.matchScore >= 85 ? 'var(--green)' : 'var(--primary)' }}>
                {selected.matchScore}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Overall Score</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: 12, fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 4 }}>AI Summary</div>
            {selected.summary}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Multi-Factor Evaluation</div>
            {[
              { label: 'Skill Matrix Match', value: selected.skillsFit },
              { label: 'Work Experience Relevance', value: selected.experienceFit },
              { label: 'Location & Shift Compatibility', value: selected.locationFit },
            ].map((factor, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  <span>{factor.label}</span>
                  <span style={{ color: 'var(--primary)' }}>{factor.value}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--panel)', overflow: 'hidden' }}>
                  <div style={{ width: `${factor.value}%`, height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 6 }}>Top Competencies</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {selected.topSkills.map((skill, i) => (
                <span key={i} style={{ fontSize: 10.5, fontWeight: 700, background: 'var(--secondary)', color: 'var(--primary)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
              Status: <b style={{ color: 'var(--text)' }}>{selected.recommendedAction}</b>
            </div>
            <button className="btn primary" style={{ padding: '7px 14px', fontSize: 11, fontWeight: 700 }}>
              Shortlist for Interview
            </button>
          </div>
        </div>
      </div>

      <SidebarContextMenu
        visible={ctxMenu.visible}
        x={ctxMenu.x}
        y={ctxMenu.y}
        items={ctxMenu.items}
        onClose={closeCtx}
      />
    </div>
  );
}
