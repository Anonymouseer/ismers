export default function DispatchStrip({ stats }) {
  return (
    <div className="dispatch-strip">
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.total}</div>
        <div className="dispatch-label">Total Deployments</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.active}</div>
        <div className="dispatch-label">Active On-Site</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.endingSoon}</div>
        <div className="dispatch-label">Ending Soon</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.attendanceAlerts}</div>
        <div className="dispatch-label">Attendance Alerts</div>
        <div className="dispatch-sub warn">{stats.attendanceAlerts ? 'needs_attention' : 'all_clear'}</div>
      </div>
      <div className="dispatch-metric">
        <div className="dispatch-value">{stats.avgScore}%</div>
        <div className="dispatch-label">Avg. Performance</div>
        <div className="dispatch-sub ok">n={stats.scoredCount}</div>
      </div>
    </div>
  );
}
