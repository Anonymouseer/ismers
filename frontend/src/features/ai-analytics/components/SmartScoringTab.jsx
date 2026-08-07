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
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'table'
  const [pageSize, setPageSize] = useState(15);
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

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
          action: () => {
            setSelectedId(item.id);
            setViewMode('split');
          },
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

  useEffect(() => { setPage(1); }, [search, clientFilter, matchCategory, sortBy, pageSize]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRoster = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = AI_CANDIDATE_MATCHES.find((m) => m.id === selectedId) || filtered[0] || AI_CANDIDATE_MATCHES[0];

  const handleShortlistCandidate = (candName = selected.applicantName) => {
    showToast(`Candidate ${candName} shortlisted for client interview!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {toastMessage && (
        <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--primary)', color: 'var(--primary-fg)', fontSize: 12, fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
          {toastMessage}
        </div>
      )}

      {/* ── UNIFIED REFERENCE CONTROLS TOOLBAR ── */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        {/* VIEW MODE TOGGLE BUTTONS */}
        <div style={{ display: 'flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: 'none',
              background: viewMode === 'split' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'split' ? '#fff' : 'var(--muted-fg)',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
              <rect x="3" y="3" width="7" height="18" rx="1" />
              <rect x="14" y="3" width="7" height="18" rx="1" />
            </svg>
            Split View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '5px 12px',
              borderRadius: 6,
              border: 'none',
              background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'table' ? '#fff' : 'var(--muted-fg)',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Full Table View
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div style={{ flex: '1 1 200px', minWidth: 180, position: 'relative' }}>
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

        {/* PAGE SIZE SELECTOR */}
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value={10}>10 Per Page</option>
          <option value={15}>15 Per Page</option>
          <option value={25}>25 Per Page</option>
        </select>

        <div style={{ marginLeft: 'auto' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* ── VIEW MODE 1: SPLIT MASTER-DETAIL VIEW ── */}
      {viewMode === 'split' ? (
        <div className="ai-scoring-split">
          {/* LEFT COLUMN: CANDIDATE RANKING ROSTER */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 230px)' }}>
            <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                AI Match Ranking Roster
              </span>
              <span style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 700 }}>
                {filtered.length} Scored Candidates
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                  No candidates match the selected criteria.
                </div>
              ) : (
                paginatedRoster.map((item, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx;
                  const isSelected = item.id === selectedId;
                  const isTop = item.matchScore >= 90;
                  const isStrong = item.matchScore >= 80;

                  const scoreColor = isTop ? 'var(--green)' : isStrong ? 'var(--primary)' : 'var(--amber)';
                  const scoreBg = isTop ? 'var(--green-soft)' : isStrong ? 'var(--secondary)' : 'var(--amber-soft)';
                  const matchTag = isTop ? 'Top Match' : isStrong ? 'Strong Fit' : 'Moderate';
                  const rankClass = globalIdx === 0 ? 'rank-1' : globalIdx === 1 ? 'rank-2' : globalIdx === 2 ? 'rank-3' : '';

                  return (
                    <div
                      key={item.id}
                      className={`roster-candidate-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedId(item.id)}
                      onContextMenu={(e) => handleItemContextMenu(e, item)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <div className={`rank-badge ${rankClass}`}>
                          {globalIdx + 1}
                        </div>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: 'var(--shadow-xs)' }}>
                          {item.applicantName.charAt(0)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.applicantName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--muted-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                            {item.targetJob} · <b style={{ color: 'var(--primary)' }}>{item.client}</b>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 800, color: scoreColor, background: scoreBg, padding: '3px 10px', borderRadius: 8, display: 'inline-block' }}>
                          {item.matchScore}%
                        </div>
                        <div style={{ fontSize: 9.5, color: 'var(--muted-fg)', fontWeight: 800, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{matchTag}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: EXECUTIVE AI CANDIDATE SCORECARD (ENRICHED WITHOUT DEADSPACE) */}
          <div className="scorecard-container" style={{ maxHeight: 'calc(100vh - 230px)' }}>
            {/* CANDIDATE SCORECARD HEADER */}
            <div className="scorecard-header-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), #0284c7)', color: '#fff', fontWeight: 800, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                  {selected.applicantName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.2px' }}>{selected.applicantName}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{selected.targetJob}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selected.client}</span>
                  </div>
                </div>
              </div>

              <div className={`score-radial-badge ${selected.matchScore >= 90 ? 'top-fit' : ''}`}>
                <div className="score-radial-num" style={{ color: selected.matchScore >= 90 ? 'var(--green)' : 'var(--primary)' }}>
                  {selected.matchScore}%
                </div>
                <div className="score-radial-label">Match Fit</div>
              </div>
            </div>

            {/* AI SUMMARY BOX */}
            <div className="executive-summary-callout">
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>
                Executive AI Fit Summary
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.55, fontWeight: 500 }}>
                {selected.summary}
              </div>
            </div>

            {/* MULTI-FACTOR EVALUATION PROGRESS METERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Multi-Factor Match Evaluation
              </div>
              {[
                { label: 'Skill Matrix Match', value: selected.skillsFit },
                { label: 'Work Experience Relevance', value: selected.experienceFit },
                { label: 'Location & Shift Compatibility', value: selected.locationFit },
              ].map((factor, i) => (
                <div key={i} style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text)' }}>{factor.label}</span>
                    <span style={{ color: factor.value >= 90 ? 'var(--green)' : 'var(--primary)', fontWeight: 800 }}>{factor.value}%</span>
                  </div>
                  <div className="meter-bar-container">
                    <div className={`meter-bar-fill ${factor.value >= 90 ? 'green' : ''}`} style={{ width: `${factor.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* ENRICHMENT 1: DEPLOYMENT READINESS & COMPLIANCE CHECKLIST */}
            <div style={{ background: 'var(--bg)', padding: '12px 14px', borderRadius: 12, border: '1px solid var(--border-soft)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Deployment Readiness & Pre-Employment Compliance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }}></span>
                  <span>NBI Clearance: <b style={{ color: 'var(--green)' }}>Verified</b></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }}></span>
                  <span>Medical Check: <b style={{ color: 'var(--green)' }}>Fit to Work</b></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }}></span>
                  <span>Govt IDs (SSS/Phic/PagIBIG): <b style={{ color: 'var(--green)' }}>Complete</b></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></span>
                  <span>NC II Certification: <b style={{ color: 'var(--primary)' }}>Validated</b></span>
                </div>
              </div>
            </div>

            {/* ENRICHMENT 2: PREDICTIVE TELEMETRY & PROXIMITY */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Est. Retention</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>95.4%</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Site Commute</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>4.2 km (~18m)</div>
              </div>
              <div style={{ background: 'var(--bg)', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-soft)', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Availability</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>Immediate</div>
              </div>
            </div>

            {/* TOP COMPETENCIES */}
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
                Verified Top Competencies
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selected.topSkills.map((skill, i) => (
                  <span key={i} className="competency-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
                Requisition Status: <b style={{ color: 'var(--text)', fontWeight: 800 }}>{selected.recommendedAction}</b>
              </div>
              <button
                onClick={() => handleShortlistCandidate(selected.applicantName)}
                className="btn primary"
                style={{ padding: '9px 18px', fontSize: 12, fontWeight: 800, borderRadius: 10, boxShadow: '0 2px 8px rgba(0, 125, 204, 0.25)' }}
              >
                Shortlist for Interview
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── VIEW MODE 2: COMPREHENSIVE FULL ROSTER TABLE VIEW ── */
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Full Scored Candidate Roster Grid ({filtered.length} Applicants)
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Rank</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Applicant Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Target Job & Site</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>AI Score</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Skill Fit</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Exp Fit</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Readiness</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Requisition Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRoster.map((item, idx) => {
                  const globalIdx = (page - 1) * pageSize + idx;
                  const isTop = item.matchScore >= 90;
                  const isStrong = item.matchScore >= 80;

                  const scoreColor = isTop ? 'var(--green)' : isStrong ? 'var(--primary)' : 'var(--amber)';
                  const scoreBg = isTop ? 'var(--green-soft)' : isStrong ? 'var(--secondary)' : 'var(--amber-soft)';
                  const rankClass = globalIdx === 0 ? 'rank-1' : globalIdx === 1 ? 'rank-2' : globalIdx === 2 ? 'rank-3' : '';

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.12s ease', cursor: 'pointer' }}
                      onContextMenu={(e) => handleItemContextMenu(e, item)}
                    >
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div className={`rank-badge ${rankClass}`} style={{ margin: '0 auto' }}>
                          {globalIdx + 1}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.applicantName.charAt(0)}
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
                            {item.applicantName}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>{item.targetJob}</div>
                        <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>{item.client}</div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor, background: scoreBg, padding: '4px 10px', borderRadius: 8, display: 'inline-block' }}>
                          {item.matchScore}%
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                        {item.skillsFit}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                        {item.experienceFit}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: 'var(--text)' }}>
                        {item.locationFit}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 6 }}>
                          Verified
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)' }}>
                          {item.recommendedAction}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedId(item.id);
                              setViewMode('split');
                            }}
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)', cursor: 'pointer' }}
                          >
                            Scorecard
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShortlistCandidate(item.applicantName)}
                            style={{ padding: '5px 10px', fontSize: 11, fontWeight: 800, borderRadius: 6, border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer' }}
                          >
                            Shortlist
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
