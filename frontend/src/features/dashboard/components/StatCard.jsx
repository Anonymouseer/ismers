import { useEffect, useRef, useState } from 'react';

/**
 * StatCard — Animated KPI summary card with trend indicator.
 *
 * @param {string}   label    - Card title (e.g. "Total Applicants")
 * @param {number}   value    - Current metric value
 * @param {number}   previous - Previous period value (for delta calculation)
 * @param {string}   color    - Accent color CSS variable name (e.g. "--primary")
 * @param {ReactNode} icon    - SVG icon element
 */
export default function StatCard({ label, value, previous, color = 'var(--primary)', icon }) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);

  // Animate count-up on value change
  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const end = value;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setDisplayValue(start);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  // Calculate delta
  const delta = previous > 0
    ? Math.round(((value - previous) / previous) * 100)
    : value > 0 ? 100 : 0;

  const deltaPositive = delta > 0;
  const deltaNeutral = delta === 0;

  return (
    <div className="stat-card" ref={ref} style={{ '--stat-accent': color }}>
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {icon}
        </div>
        {!deltaNeutral && (
          <div className={`stat-card-delta ${deltaPositive ? 'positive' : 'negative'}`}>
            <svg className="delta-arrow" viewBox="0 0 12 12" width="10" height="10">
              {deltaPositive
                ? <path d="M6 2 L10 8 L2 8 Z" fill="currentColor" />
                : <path d="M6 10 L10 4 L2 4 Z" fill="currentColor" />
              }
            </svg>
            <span>{Math.abs(delta)}%</span>
          </div>
        )}
        {deltaNeutral && previous > 0 && (
          <div className="stat-card-delta neutral">
            <span>0%</span>
          </div>
        )}
      </div>
      <div className="stat-card-value">{displayValue.toLocaleString()}</div>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-bar">
        <div
          className="stat-card-bar-fill"
          style={{
            width: value > 0 ? '100%' : '0%',
            background: color,
          }}
        />
      </div>
    </div>
  );
}
