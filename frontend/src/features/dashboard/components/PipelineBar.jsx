/**
 * PipelineBar — Horizontal stacked bar chart showing the recruitment funnel.
 * Each segment is proportional to its count with hover tooltips.
 */

const STAGES = [
  { key: 'pooling',           label: 'Pooling',               color: '#3B82F6' },
  { key: 'area_manager',      label: 'Area Manager',          color: '#6366F1' },
  { key: 'client_interview',  label: 'Client Interview',      color: '#8B5CF6' },
  { key: 'hr_requirements',   label: 'HR Requirements',       color: '#D98A2B' },
  { key: 'contract_signing',  label: 'Contract Signing',      color: '#10B981' },
  { key: 'for_deployment',    label: 'For Deployment',        color: '#007DCC' },
  { key: 're_pooling',        label: 'Re-Pooling',            color: '#94A3B8' },
];

export default function PipelineBar({ data = {} }) {
  const total = STAGES.reduce((sum, s) => sum + (data[s.key] || 0), 0);

  return (
    <div className="pipeline-bar-container">
      <div className="pipeline-bar-header">
        <h3 className="pipeline-bar-title">Recruitment Pipeline</h3>
        <span className="pipeline-bar-total">{total} in pipeline</span>
      </div>

      {total === 0 ? (
        <div className="pipeline-bar-empty">No applicants currently in the recruitment pipeline.</div>
      ) : (
        <>
          <div className="pipeline-bar-track">
            {STAGES.map((stage) => {
              const count = data[stage.key] || 0;
              if (count === 0) return null;
              const pct = (count / total) * 100;
              return (
                <div
                  key={stage.key}
                  className="pipeline-bar-segment"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    backgroundColor: stage.color,
                  }}
                  title={`${stage.label}: ${count} (${Math.round(pct)}%)`}
                >
                  {pct > 8 && <span className="segment-count">{count}</span>}
                </div>
              );
            })}
          </div>

          <div className="pipeline-bar-legend">
            {STAGES.map((stage) => {
              const count = data[stage.key] || 0;
              if (count === 0) return null;
              return (
                <div key={stage.key} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: stage.color }} />
                  <span className="legend-label">{stage.label}</span>
                  <span className="legend-value">{count}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
