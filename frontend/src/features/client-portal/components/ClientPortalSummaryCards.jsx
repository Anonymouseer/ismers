export default function ClientPortalSummaryCards({ cards }) {
  return (
    <div className="client-portal-summary-grid">
      {cards.map((card) => (
        <div key={card.id} id={card.id} className="client-portal-card client-portal-summary-card">
          <div className={`client-portal-summary-accent ${card.accentClass}`} aria-hidden="true" />
          <div className="client-portal-summary-body">
            <div className="client-portal-summary-card-top">
              <div className={`client-portal-card-icon ${card.colorClass}`}>{card.icon}</div>
              <span className={`client-portal-trend ${card.trendUp ? 'client-portal-trend--up' : 'client-portal-trend--warn'}`}>
                {card.trend}
              </span>
            </div>
            <div className="client-portal-summary-value">{card.value}</div>
            <div className="client-portal-summary-label">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
