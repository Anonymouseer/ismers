import { useState, useMemo } from 'react';
import { PIPELINE_ANALYTICS } from '../data/mockAiAnalyticsData';

export default function PipelineAnalyticsTab() {
  const { kpis, funnelData, stageDurations, demandHeatmap } = PIPELINE_ANALYTICS;
  const [heatmapSearch, setHeatmapSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter demand heatmap data
  const filteredHeatmap = useMemo(() => {
    return demandHeatmap.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (heatmapSearch.trim()) {
        const q = heatmapSearch.toLowerCase();
        if (!item.position.toLowerCase().includes(q) && !item.client.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [demandHeatmap, statusFilter, heatmapSearch]);

  const statusOptions = useMemo(() => {
    return [...new Set(demandHeatmap.map((d) => d.status))];
  }, [demandHeatmap]);

  // REAL CALCULATED DATA: Calculate single biggest drop-off transition dynamically
  const dropOffAnalysis = useMemo(() => {
    let biggest = null;
    let maxStageDropPct = -1;

    for (let i = 0; i < funnelData.length - 1; i++) {
      const current = funnelData[i];
      const next = funnelData[i + 1];

      // Dropout count & stage-to-stage percentage drop
      const dropoutCount = current.count - next.count;
      const stageDropPct = (dropoutCount / current.count) * 100;

      // Overall conversion rate delta
      const currConv = parseFloat(current.conversion);
      const nextConv = parseFloat(next.conversion);
      const convDelta = (currConv - nextConv).toFixed(1);

      if (stageDropPct > maxStageDropPct) {
        maxStageDropPct = stageDropPct;
        biggest = {
          fromStage: current.stage,
          toStage: next.stage,
          dropoutCount,
          stageDropPct: stageDropPct.toFixed(1),
          convDelta,
        };
      }
    }
    return biggest;
  }, [funnelData]);

  // Calculate total stage duration sum
  const totalStageDays = useMemo(() => {
    if (!stageDurations) return 4.2;
    return stageDurations.reduce((acc, curr) => acc + curr.days, 0).toFixed(1);
  }, [stageDurations]);

  // REAL CALCULATED DATA: Calculate aggregate metrics for Demand vs Supply
  const heatmapSummary = useMemo(() => {
    const totalDemand = demandHeatmap.reduce((sum, item) => sum + item.demand, 0);
    const totalFulfilled = demandHeatmap.reduce((sum, item) => sum + item.fulfilled, 0);
    const totalGap = demandHeatmap.reduce((sum, item) => sum + item.gap, 0);
    const overallFillRate = totalDemand > 0 ? ((totalFulfilled / totalDemand) * 100).toFixed(1) : '0.0';

    const statusCounts = demandHeatmap.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return { totalDemand, totalFulfilled, totalGap, overallFillRate, statusCounts };
  }, [demandHeatmap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: 'calc(100vh - 200px)' }}>
      {/* KPI STAT STRIP */}
      <div className="ai-kpi-grid">
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Avg Time-to-Deploy</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{kpis.avgTimeToDeploy}</div>
          <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>{kpis.timeToDeployChange}</div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Shortlist Conversion</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{kpis.shortlistConversionRate}</div>
          <div style={{ fontSize: 10.5, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>{kpis.conversionChange}</div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Top Sourcing Channel</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 6 }}>{kpis.topSourcingChannel}</div>
          <div style={{ fontSize: 10, color: 'var(--muted-fg)', marginTop: 3 }}>{kpis.channelBreakdown}</div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Active Pipeline</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--purple)', marginTop: 4 }}>{kpis.activePipelineVolume}</div>
          <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 600, marginTop: 2 }}>Across all active job orders</div>
        </div>
      </div>

      {/* BALANCED TWO-COLUMN LAYOUT GRID */}
      <div className="ai-scoring-split" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'stretch' }}>
        {/* LEFT COLUMN: RECRUITMENT CONVERSION FUNNEL & INSIGHTS */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Recruitment Conversion Funnel
          </div>

          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {/* FUNNEL BARS WITH STAGE TREND INDICATORS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {funnelData.map((f, idx) => {
                const widthPct = (f.count / funnelData[0].count) * 100;
                const isNegative = f.trend && f.trend.includes('-');

                return (
                  <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                      <span>{f.stage}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* MOCK DATA: Historical stage trend indicator */}
                        {f.trend && (
                          <span style={{ fontSize: 10, fontWeight: 800, color: isNegative ? 'var(--red)' : 'var(--green)', background: isNegative ? 'var(--red-soft)' : 'var(--green-soft)', padding: '1px 6px', borderRadius: 6 }}>
                            {f.trend}
                          </span>
                        )}
                        <span style={{ color: 'var(--primary)' }}>{f.count} ({f.conversion})</span>
                      </div>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--panel)', overflow: 'hidden' }}>
                      <div style={{ width: `${widthPct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 1. FIXED HIGH-CONTRAST DROP-OFF INSIGHT CALLOUT */}
            {dropOffAnalysis && (
              <div style={{ background: 'rgba(217, 138, 43, 0.12)', border: '1.5px solid var(--amber)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Key Pipeline Drop-off Insight</span>
                  <span style={{ background: 'var(--amber)', color: '#fff', padding: '1px 6px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>ALERT</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--amber)' }}>
                  Biggest drop-off: {dropOffAnalysis.fromStage} → {dropOffAnalysis.toStage} (–{dropOffAnalysis.stageDropPct}%)
                </div>
                <div style={{ fontSize: 11, color: 'var(--text)', opacity: 0.9, lineHeight: 1.4 }}>
                  {dropOffAnalysis.dropoutCount} candidate dropouts recorded at this stage (–{dropOffAnalysis.convDelta}% total conversion delta). Recommended action: Review client screening criteria and interview response time.
                </div>
              </div>
            )}

            {/* 2. MOCK DATA: STAGE DURATION & BOTTLENECK BREAKDOWN */}
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Stage Duration Breakdown (Total: {totalStageDays} Days)
                </div>
                <span style={{ fontSize: 9.5, color: 'var(--primary)', fontWeight: 700 }}>Telemetry Sync</span>
              </div>

              {/* Mini Horizontal Duration Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {stageDurations.map((st, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, background: 'var(--panel)', padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{st.from} → {st.to}</span>
                      {st.isBottleneck && (
                        <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--red)', background: 'var(--red-soft)', padding: '1px 5px', borderRadius: 4 }}>
                          BOTTLENECK
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800 }}>
                      <span style={{ color: st.isBottleneck ? 'var(--amber)' : 'var(--text)' }}>{st.days} days</span>
                      {st.trend && <span style={{ fontSize: 9.5, color: 'var(--muted-fg)', fontWeight: 500 }}>({st.trend})</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLIENT DEMAND VS SUPPLY HEATMAP & FULFILLMENT OVERVIEW */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Client Demand vs Supply
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted-fg)' }}>{filteredHeatmap.length} positions</span>
          </div>

          <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: '1px solid var(--border-soft)' }}>
            <input
              type="text"
              placeholder="Search position or client..."
              value={heatmapSearch}
              onChange={(e) => setHeatmapSearch(e.target.value)}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: 11, outline: 'none',
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
                background: 'var(--bg)', color: 'var(--text)', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <option value="all">All Status</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* TABLE CONTAINER WITH INTERNAL SCROLL */}
          <div style={{ flex: 1, overflowY: 'auto', minHeight: 220 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 700, fontSize: 10, textTransform: 'uppercase' }}>
                  <th style={{ padding: '8px 12px' }}>Position / Client</th>
                  <th style={{ padding: '8px 12px' }}>Demand</th>
                  <th style={{ padding: '8px 12px' }}>Filled</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHeatmap.map((item, i) => {
                  const statusColor = item.gap > 3 ? 'var(--red)' : item.gap > 0 ? 'var(--amber)' : 'var(--green)';
                  const statusBg = item.gap > 3 ? 'var(--red-soft)' : item.gap > 0 ? 'var(--amber-soft)' : 'var(--green-soft)';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ fontWeight: 700 }}>{item.position}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 700 }}>{item.client}</div>
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: 800 }}>{item.demand}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 800, color: 'var(--green)' }}>{item.fulfilled}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: statusColor, background: statusBg, padding: '2px 8px', borderRadius: 10 }}>
                          {item.status} ({item.gap})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* AGGREGATE DEMAND & SUPPLY FULFILLMENT OVERVIEW STRIP */}
          <div style={{ padding: 14, background: 'var(--bg)', borderTop: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Fulfillment &amp; Capacity Overview
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 8 }}>
                Fill Rate: {heatmapSummary.overallFillRate}%
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, color: 'var(--muted-fg)', fontWeight: 700 }}>Total Demand</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{heatmapSummary.totalDemand}</div>
              </div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, color: 'var(--muted-fg)', fontWeight: 700 }}>Total Filled</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--green)', marginTop: 2 }}>{heatmapSummary.totalFulfilled}</div>
              </div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 9.5, color: 'var(--muted-fg)', fontWeight: 700 }}>Unfilled Deficit</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)', marginTop: 2 }}>{heatmapSummary.totalGap}</div>
              </div>
            </div>

            {/* Status Category Pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.entries(heatmapSummary.statusCounts).map(([statusName, count]) => {
                const isDeficit = statusName.includes('Deficit');
                const isHigh = statusName.includes('High');
                const color = isDeficit ? 'var(--red)' : isHigh ? 'var(--amber)' : 'var(--green)';
                const bg = isDeficit ? 'var(--red-soft)' : isHigh ? 'var(--amber-soft)' : 'var(--green-soft)';

                return (
                  <span key={statusName} style={{ fontSize: 10, fontWeight: 800, color, background: bg, padding: '2px 8px', borderRadius: 8 }}>
                    {statusName}: {count}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
