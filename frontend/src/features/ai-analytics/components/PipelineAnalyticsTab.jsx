import { useState, useMemo } from 'react';
import { PIPELINE_ANALYTICS } from '../data/mockAiAnalyticsData';

export default function PipelineAnalyticsTab() {
  const { kpis, demandHeatmap, recruiterPerformance, sourcingChannels } = PIPELINE_ANALYTICS;

  // Filter & Search Controls State (Matching Reference Image)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOption, setSortOption] = useState('default');
  const [toastMessage, setToastMessage] = useState('');

  const clientOptions = useMemo(() => {
    return [...new Set(demandHeatmap.map((d) => d.client))].sort();
  }, [demandHeatmap]);

  const roleOptions = useMemo(() => {
    return [...new Set(demandHeatmap.map((d) => d.position))].sort();
  }, [demandHeatmap]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleExport = () => {
    showToast('Recruitment Intelligence Telemetry Report exported successfully.');
  };

  // Map recruiter assigned to position for realistic enterprise display
  const getRecruiterForPosition = (idx) => {
    const recruiters = ['M. Dela Cruz', 'J. Santos', 'A. Reyes', 'R. Navarro', 'K. Alonzo', 'D. Ocampo'];
    return recruiters[idx % recruiters.length];
  };

  // Filter and sort demand heatmap data
  const filteredHeatmap = useMemo(() => {
    let list = demandHeatmap.filter((item) => {
      const isDeficit = item.gap > 3;
      const isHigh = item.gap > 0 && item.gap <= 3;
      const category = isDeficit ? 'deficit' : isHigh ? 'hiring' : 'staffed';

      if (statusFilter !== 'all' && statusFilter !== category) return false;
      if (clientFilter !== 'all' && item.client !== clientFilter) return false;
      if (roleFilter !== 'all' && item.position !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.position.toLowerCase().includes(q) &&
          !item.client.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    if (sortOption === 'priority') {
      list.sort((a, b) => b.gap - a.gap);
    } else if (sortOption === 'demand-desc') {
      list.sort((a, b) => b.demand - a.demand);
    }

    return list;
  }, [demandHeatmap, statusFilter, clientFilter, roleFilter, searchQuery, sortOption]);

  // Aggregate metrics for Demand vs Supply
  const heatmapSummary = useMemo(() => {
    const totalDemand = filteredHeatmap.reduce((sum, item) => sum + item.demand, 0);
    const totalFulfilled = filteredHeatmap.reduce((sum, item) => sum + item.fulfilled, 0);
    const totalGap = filteredHeatmap.reduce((sum, item) => sum + item.gap, 0);
    const fillRate = totalDemand > 0 ? Math.round((totalFulfilled / totalDemand) * 100) : 100;
    return { totalDemand, totalFulfilled, totalGap, fillRate };
  }, [filteredHeatmap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 'calc(100vh - 200px)' }}>
      {toastMessage && (
        <div style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--primary)', color: 'var(--primary-fg)', fontSize: 12, fontWeight: 700, boxShadow: 'var(--shadow-md)' }}>
          {toastMessage}
        </div>
      )}

      {/* OPERATIONAL SUMMARY BANNER */}
      <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
            <b style={{ color: 'var(--primary)' }}>Operational Summary:</b> {recruiterPerformance?.length || 10} active recruiters managing {clientOptions.length} corporate client accounts with {heatmapSummary.fillRate}% fill rate and {kpis.avgTimeToDeploy} avg deployment velocity.
          </div>
        </div>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Telemetry Live</span>
      </div>

      {/* ── UNIFIED REFERENCE CONTROLS BAR (MATCHING REFERENCE IMAGE) ── */}
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
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
          <svg
            viewBox="0 0 24 24"
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2,
            }}
          >
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search position, client, or recruiter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 12px 6px 30px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--panel)',
              color: 'var(--text)',
              fontSize: 11.5,
              outline: 'none',
            }}
          />
        </div>

        {/* STATUS FILTER DROPDOWN */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            color: 'var(--text)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Statuses</option>
          <option value="deficit">Needs Candidates</option>
          <option value="hiring">Active Hiring</option>
          <option value="staffed">Fully Staffed</option>
        </select>

        {/* CLIENTS / SITES DROPDOWN */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            color: 'var(--text)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Clients / Sites</option>
          {clientOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* ROLES / POSITIONS DROPDOWN */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            color: 'var(--text)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All Roles / Positions</option>
          {roleOptions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {/* SORT DROPDOWN */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--panel)',
            color: 'var(--text)',
            fontSize: 11.5,
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="default">Default Sort</option>
          <option value="priority">Highest Openings First</option>
          <option value="demand-desc">Highest Demand First</option>
        </select>

        {/* EXPORT REPORT ACTION BUTTON */}
        <button
          type="button"
          onClick={handleExport}
          className="btn primary"
          style={{
            padding: '6px 12px',
            fontSize: 11.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 8,
          }}
        >
          <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Report
        </button>
      </div>

      {/* KPI STAT STRIP */}
      <div className="ai-kpi-grid">
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Avg Time-to-Deploy</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>{kpis.avgTimeToDeploy}</div>
          <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 1 }}>{kpis.timeToDeployChange}</div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Active Pipeline</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--purple)', marginTop: 2 }}>{kpis.activePipelineVolume}</div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 600, marginTop: 1 }}>Across active requisitions</div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Overall Fill Rate</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>{heatmapSummary.fillRate}%</div>
          <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 1 }}>{heatmapSummary.totalFulfilled} of {heatmapSummary.totalDemand} Filled</div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Open Vacancies</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', marginTop: 2 }}>{heatmapSummary.totalGap} Slots</div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 600, marginTop: 1 }}>Pending deployment</div>
        </div>
      </div>

      {/* MAIN DATA TABLE: CLIENT POSITION REQUISITIONS (SCALABLE TABLE VIEW) */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 18px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Client Position Requisition Directory</h3>
            <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
              Comprehensive staffing telemetry across connected client accounts
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted-fg)' }}>
            Showing {filteredHeatmap.length} Requisitions
          </span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: 420, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 800, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                <th style={{ padding: '10px 16px' }}>Position / Client Account</th>
                <th style={{ padding: '10px 16px' }}>Assigned Recruiter</th>
                <th style={{ padding: '10px 16px', width: '30%' }}>Staffing Progress</th>
                <th style={{ padding: '10px 16px' }}>Open Slots</th>
                <th style={{ padding: '10px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHeatmap.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 30, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                    No client position requisitions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredHeatmap.map((item, idx) => {
                  const pct = item.demand > 0 ? Math.round((item.fulfilled / item.demand) * 100) : 100;
                  const isFull = item.gap === 0;
                  const isDeficit = item.gap > 3;

                  const badgeColor = isFull ? 'var(--green)' : isDeficit ? 'var(--red)' : 'var(--amber)';
                  const badgeBg = isFull ? 'var(--green-soft)' : isDeficit ? 'var(--red-soft)' : 'var(--amber-soft)';
                  const badgeLabel = isFull ? 'Fully Staffed' : isDeficit ? 'Needs Candidates' : 'Active Hiring';
                  const recruiter = getRecruiterForPosition(idx);

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: badgeColor, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 12.5 }}>{item.position}</div>
                            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginTop: 1 }}>{item.client}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text)' }}>
                        {recruiter}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text)' }}>{item.fulfilled} of {item.demand} Filled</span>
                          <span style={{ color: 'var(--muted-fg)' }}>{pct}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden', border: '1px solid var(--border-soft)' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: isFull ? 'var(--green)' : 'var(--primary)', borderRadius: 3 }} />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: item.gap > 0 ? 'var(--amber)' : 'var(--muted-fg)' }}>
                        {item.gap > 0 ? `${item.gap} Openings` : 'None'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: badgeColor, background: badgeBg, padding: '3px 9px', borderRadius: 8, display: 'inline-block' }}>
                          {badgeLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECONDARY ROW: RECRUITER PERFORMANCE & SOURCING CHANNELS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>

        {/* RECRUITER TELEMETRY TABLE */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              Recruiter Workload &amp; Telemetry
            </h3>
            <span style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 600 }}>Active Team ({recruiterPerformance?.length || 0})</span>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: 280, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 14px' }}>Recruiter</th>
                  <th style={{ padding: '8px 14px' }}>Assigned PRFs</th>
                  <th style={{ padding: '8px 14px' }}>Placements</th>
                  <th style={{ padding: '8px 14px' }}>Avg Days to Fill</th>
                  <th style={{ padding: '8px 14px' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {recruiterPerformance?.map((r, i) => {
                  const isTop = r.rating === 'Exceeding';
                  const isReview = r.rating === 'Needs Review';
                  const ratingColor = isTop ? 'var(--green)' : isReview ? 'var(--amber)' : 'var(--primary)';
                  const ratingBg = isTop ? 'var(--green-soft)' : isReview ? 'var(--amber-soft)' : 'var(--secondary)';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text)' }}>{r.name}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{r.assignedJOs} Orders</td>
                      <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--primary)' }}>{r.placedCandidates} Placed</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700 }}>{r.avgDaysToFill} Days</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: ratingColor, background: ratingBg, padding: '2px 8px', borderRadius: 8 }}>
                          {r.rating}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SOURCING CHANNEL METRICS */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Sourcing Channel Performance
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sourcingChannels?.map((ch, idx) => {
              const fillPct = parseInt(ch.share, 10) || 25;
              return (
                <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--text)' }}>{ch.channel}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)' }}>{ch.share} Share</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>{ch.applicants} Candidates · {ch.hires} Placements</div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--panel)', overflow: 'hidden', marginTop: 2 }}>
                    <div style={{ width: `${fillPct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
