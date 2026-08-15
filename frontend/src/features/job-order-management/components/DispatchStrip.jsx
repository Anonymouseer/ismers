export default function DispatchStrip({ stats }) {
  return (
    <div className="dispatch-strip">
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.total}</div>
        <div className="dispatch-label">Total Job Orders</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.openPositions}</div>
        <div className="dispatch-label">Open Positions</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.filledPositions}</div>
        <div className="dispatch-label">Positions Filled</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.urgentCount}</div>
        <div className="dispatch-label">Closing Soon / Urgent</div>
        <div className="dispatch-sub warn">{stats.urgentCount ? 'Action Required' : 'On Schedule'}</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.fillRate}%</div>
        <div className="dispatch-label">Overall Fill Rate</div>
        <div className="dispatch-sub ok">{stats.filledPositions} of {stats.openPositions + stats.filledPositions} slots</div>
      </div>
    </div>
  );
}