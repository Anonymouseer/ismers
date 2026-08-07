import { useState, useEffect, useMemo, useCallback } from 'react';
import { AI_CANDIDATE_MATCHES } from '../data/mockAiAnalyticsData';
import Pagination from '../../../components/common/Pagination';
import SidebarContextMenu from '../../../components/layout/SidebarContextMenu';

const CLIENT_LIST = [...new Set(AI_CANDIDATE_MATCHES.map((m) => m.client))];

export default function SmartScoringTab() {
  const [selectedId, setSelectedId] = useState(AI_CANDIDATE_MATCHES[0].id);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [matchCategory, setMatchCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score-desc');
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const PAGE_SIZE = 10;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
          action: () => showToast(`Candidate ${item.applicantName} shortlisted for client interview!`),
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
          action: () => showToast(`Exporting AI analysis for ${item.applicantName}...`),
        },
      ],
    });
  };

  // Filter & Sort Logic
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

    if (matchCategory !== 'all') {
      if (matchCategory === 'top') list = list.filter((m) => m.matchScore >= 90);
      else if (matchCategory === 'strong') list = list.filter((m) => m.matchScore >= 80 && m.matchScore < 90);
      else if (matchCategory === 'moderate') list = list.filter((m) => m.matchScore < 80);
    }

    if (sortBy === 'score-desc') list.sort((a, b) => b.matchScore - a.matchScore);
    else if (sortBy === 'score-asc') list.sort((a, b) => a.matchScore - b.matchScore);
    else if (sortBy === 'name-asc') list.sort((a, b) => a.applicantName.localeCompare(b.applicantName));
    else if (sortBy === 'name-desc') list.sort((a, b) => b.applicantName.localeCompare(a.applicantName));

    return list;
  }, [search, clientFilter, matchCategory, sortBy]);

  useEffect(() => { setPage(1); }, [search, clientFilter, matchCategory, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedRoster = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selected = AI_CANDIDATE_MATCHES.find((m) => m.id === selectedId) || filtered[0] || AI_CANDIDATE_MATCHES[0];

  const handleShortlistCandidate = () => {
    showToast(`Candidate ${selected.applicantName} shortlisted for client interview!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: 'calc(100vh - 200px)' }}>
      {toastMessage && (
        <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--primary)', color: 'var(--primary-fg)', fontSize: 12, fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
          {toastMessage}
        </div>
      )}

      {/* ── UNIFIED REFERENCE CONTROLS TOOLBAR ── */}
      <div
        style={{
          background: 'var(--secondary)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {/* SEARCH INPUT */}
        <div style={{ flex: '1 1 240px', minWidth: 200, position: 'relative' }}>
          <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search applicant, position, client, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '6px 12px 6px 30px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, outline: 'none',
            }}
          />
        </div>

        {/* MATCH CATEGORY FILTER */}
        <select
          value={matchCategory}
          onChange={(e) => setMatchCategory(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All Match Fits</option>
          <option value="top">Top Match Fit (90%+)</option>
          <option value="strong">Strong Fit (80–89%)</option>
          <option value="moderate">Moderate Fit (&lt;80%)</option>
        </select>

        {/* CLIENT FILTER */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All Clients / Sites</option>
          {CLIENT_LIST.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* SORT BY */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="score-desc">Highest Score First</option>
          <option value="score-asc">Lowest Score First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>

        <div style={{ marginLeft: 'auto' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
          />
        </div>
      </div>

      {/* TWO COLUMN SPLIT LAYOUT */}
      <div className="ai-scoring-split">
        {/* LEFT COLUMN: CANDIDATE RANKING ROSTER */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              AI Match Ranking Roster
            </span>
            <span style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 700 }}>
              {filtered.length} Scored
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                No candidates match the selected criteria.
              </div>
            ) : (
              paginatedRoster.map((item, idx) => {
                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                const isSelected = item.id === selectedId;
                const isTop = item.matchScore >= 90;
                const isStrong = item.matchScore >= 80;

                const scoreColor = isTop ? 'var(--green)' : isStrong ? 'var(--primary)' : 'var(--amber)';
                const scoreBg = isTop ? 'var(--green-soft)' : isStrong ? 'var(--secondary)' : 'var(--amber-soft)';
                const matchTag = isTop ? 'Top Match' : isStrong ? 'Strong Fit' : 'Moderate';

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
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.applicantName.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontSize: 10, color: 'var(--muted-fg)', marginRight: 4, fontWeight: 700 }}>#{globalIdx + 1}</span>
                          {item.applicantName}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                          {item.targetJob} · <b style={{ color: 'var(--primary)' }}>{item.client}</b>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: scoreColor, background: scoreBg, padding: '2px 8px', borderRadius: 8, display: 'inline-block' }}>
                        {item.matchScore}%
                      </div>
                      <div style={{ fontSize: 9.5, color: 'var(--muted-fg)', fontWeight: 700, marginTop: 2 }}>{matchTag}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EXECUTIVE AI CANDIDATE SCORECARD */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflowY: 'auto' }}>
          {/* CANDIDATE SCORECARD HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selected.applicantName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{selected.applicantName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                  {selected.targetJob} · <b style={{ color: 'var(--primary)' }}>{selected.client}</b>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: selected.matchScore >= 90 ? 'var(--green)' : 'var(--primary)' }}>
                {selected.matchScore}%
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.4px' }}>Overall AI Score</div>
            </div>
          </div>

          {/* AI SUMMARY BOX */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: 12, fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
              Executive AI Fit Summary
            </div>
            {selected.summary}
          </div>

          {/* MULTI-FACTOR EVALUATION PROGRESS METERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Multi-Factor Match Evaluation
            </div>
            {[
              { label: 'Skill Matrix Match', value: selected.skillsFit },
              { label: 'Work Experience Relevance', value: selected.experienceFit },
              { label: 'Location & Shift Compatibility', value: selected.locationFit },
            ].map((factor, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text)' }}>{factor.label}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{factor.value}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--panel)', overflow: 'hidden' }}>
                  <div style={{ width: `${factor.value}%`, height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* TOP COMPETENCIES */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 6 }}>
              Verified Top Competencies
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selected.topSkills.map((skill, i) => (
                <span key={i} style={{ fontSize: 10.5, fontWeight: 700, background: 'var(--secondary)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, color: 'var(--muted-fg)' }}>
              Requisition Status: <b style={{ color: 'var(--text)' }}>{selected.recommendedAction}</b>
            </div>
            <button
              onClick={handleShortlistCandidate}
              className="btn primary"
              style={{ padding: '8px 16px', fontSize: 11.5, fontWeight: 700, borderRadius: 10 }}
            >
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
