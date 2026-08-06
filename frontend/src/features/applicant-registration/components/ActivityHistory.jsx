export default function ActivityHistory({ candidate }) {
  const history = candidate.history || [];

  return (
    <div className="sheet-section">
      <div className="sheet-label">
        <span className="sheet-label-text">
          <span className="sheet-label-icon" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>
          </span>
          Activity History
        </span>
        <span className="sheet-count">{history.length}</span>
      </div>
      {history.length === 0 ? (
        <div className="empty-note">No activity logged yet.</div>
      ) : (
        <div className="timeline">
          {history
            .slice()
            .reverse()
            .map((h) => (
              <div className="t-item" key={h.id}>
                <div className="t-text">{h.text}</div>
                <div className="t-meta">{h.date}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}