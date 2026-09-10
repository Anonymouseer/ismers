import { useEffect, useState } from 'react';

/**
 * DonutChart — Animated SVG donut/ring chart with a center total.
 *
 * @param {string}  title    - Chart heading
 * @param {Array}   segments - Array of { label, value, color }
 * @param {number}  size     - Diameter in pixels (default 180)
 */
export default function DonutChart({ title, segments = [], size = 180 }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate stroke-dasharray offsets for each segment
  let accumulatedOffset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((segment) => {
      const fraction = total > 0 ? segment.value / total : 0;
      const dashLength = fraction * circumference;
      const gapLength = circumference - dashLength;
      const offset = accumulatedOffset;
      accumulatedOffset += dashLength;

      return {
        ...segment,
        dashArray: `${dashLength} ${gapLength}`,
        dashOffset: -offset,
        fraction,
      };
    });

  return (
    <div className="donut-chart-container">
      <h3 className="donut-chart-title">{title}</h3>

      {total === 0 ? (
        <div className="donut-chart-empty">No data available.</div>
      ) : (
        <div className="donut-chart-content">
          <div className="donut-chart-svg-wrapper">
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="donut-svg"
            >
              {/* Background ring */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--border)"
                strokeWidth={strokeWidth}
              />

              {/* Segment arcs */}
              {arcs.map((arc, i) => (
                <circle
                  key={arc.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${center} ${center})`}
                  className={`donut-arc ${animated ? 'animated' : ''}`}
                  style={{
                    '--delay': `${i * 120}ms`,
                    transition: `stroke-dasharray 0.8s var(--ease) var(--delay), stroke-dashoffset 0.8s var(--ease) var(--delay)`,
                  }}
                />
              ))}

              {/* Center label */}
              <text
                x={center}
                y={center - 6}
                textAnchor="middle"
                dominantBaseline="central"
                className="donut-center-value"
              >
                {total}
              </text>
              <text
                x={center}
                y={center + 14}
                textAnchor="middle"
                dominantBaseline="central"
                className="donut-center-label"
              >
                Total
              </text>
            </svg>
          </div>

          <div className="donut-chart-legend">
            {arcs.map((arc) => (
              <div key={arc.label} className="donut-legend-item">
                <span className="donut-legend-dot" style={{ backgroundColor: arc.color }} />
                <span className="donut-legend-label">{arc.label}</span>
                <span className="donut-legend-value">{arc.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
