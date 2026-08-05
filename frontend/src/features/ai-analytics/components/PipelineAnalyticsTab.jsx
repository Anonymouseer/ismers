import { useState } from 'react';
import { PIPELINE_ANALYTICS } from '../data/mockAiAnalyticsData';

export default function PipelineAnalyticsTab() {
  const { kpis, funnelData, demandHeatmap } = PIPELINE_ANALYTICS;
  const [heatmapSearch, setHeatmapSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHeatmap = demandHeatmap.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (heatmapSearch.trim()) {
      const q = heatmapSearch.toLowerCase();
      if (!item.position.toLowerCase().includes(q) && !item.client.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const statusOptions = [...new Set(demandHeatmap.map((d) => d.status))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 230px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ padding: '12px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Recruitment Conversion Funnel
          </div>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {funnelData.map((f, idx) => {
              const widthPct = (f.count / funnelData[0].count) * 100;
              return (
                <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 5 }}>
                    <span>{f.stage}</span>
                    <span style={{ color: 'var(--primary)' }}>{f.count} ({f.conversion})</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--panel)', overflow: 'hidden' }}>
                    <div style={{ width: `${widthPct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

          <div style={{ flex: 1, overflowY: 'auto' }}>
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
        </div>
      </div>
    </div>
  );
}
