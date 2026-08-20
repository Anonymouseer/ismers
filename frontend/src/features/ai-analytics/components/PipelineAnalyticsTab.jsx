import { useState, useMemo, useEffect } from 'react';
import { CLIENTS } from '../../client-management/data/mockClients';
import { logoUrl, initials, colorFor, softFor } from '../../client-management/utils/clientDisplay';
import { PIPELINE_ANALYTICS } from '../data/mockAiAnalyticsData';
import Pagination from '../../../components/common/Pagination';
import AnalyticsService from '../services/AnalyticsService';

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMATION HOOK (Frame-by-frame Ease-out Cubic Tween from 0 to 100%)
   ═══════════════════════════════════════════════════════════════════════════ */

function useProgressAnimation(trigger, duration = 850) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    let start = null;
    let animId = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const t = Math.min(1, elapsed / duration);
      // Ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased);

      if (t < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    const delayTimer = setTimeout(() => {
      animId = requestAnimationFrame(step);
    }, 50);

    return () => {
      clearTimeout(delayTimer);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [trigger, duration]);

  return progress;
}

/* ═══════════════════════════════════════════════════════════════════════════
   PURE SVG CHART COMPONENTS (Animated 0 -> 100%)
   ═══════════════════════════════════════════════════════════════════════════ */

function CircleGauge({ pct = 0, size = 66, stroke = 6, color = '#3b82f6', value = '', progress = 1 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const currentPct = Math.round(pct * progress);
  const safe = Math.min(100, Math.max(0, currentPct));
  const displayVal = value !== ''
    ? (typeof value === 'string' && value.endsWith('%') ? `${safe}%` : value)
    : `${safe}%`;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border-soft)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c - (safe / 100) * c} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size <= 48 ? 10.5 : 14, fontWeight: 900, color: 'var(--text)' }}>
          {displayVal}
        </span>
      </div>
    </div>
  );
}

/** Radar Chart — 5-axis performance view with 0% to 100% outward bloom animation */
function RadarChart({ axes = [], values = [], size = 240, color = '#3b82f6', progress = 1 }) {
  if (!axes.length) return null;
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 32, levels = 4;
  const angleSlice = (2 * Math.PI) / axes.length;

  const getPoint = (i, val, max) => {
    const angle = angleSlice * i - Math.PI / 2;
    const ratio = Math.min((val * progress) / max, 1);
    return { x: cx + maxR * ratio * Math.cos(angle), y: cy + maxR * ratio * Math.sin(angle) };
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      {Array.from({ length: levels }, (_, lvl) => {
        const r = (maxR / levels) * (lvl + 1);
        const pts = axes.map((_, i) => {
          const a = angleSlice * i - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(' ');
        return <polygon key={lvl} points={pts} fill="none" stroke="var(--border-soft)" strokeWidth={0.7} opacity={0.5} />;
      })}
      {axes.map((ax, i) => {
        const a = angleSlice * i - Math.PI / 2;
        const ex = cx + maxR * Math.cos(a), ey = cy + maxR * Math.sin(a);
        const lx = cx + (maxR + 20) * Math.cos(a), ly = cy + (maxR + 20) * Math.sin(a);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--border)" strokeWidth={0.5} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 8.5, fontWeight: 700, fill: 'var(--muted-fg)' }}>
              {ax.label}
            </text>
          </g>
        );
      })}
      {(() => {
        const pts = values.map((v, i) => {
          const p = getPoint(i, v, axes[i].max);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <g>
            <polygon
              points={pts}
              fill={color}
              fillOpacity={0.18}
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {values.map((v, i) => {
              const p = getPoint(i, v, axes[i].max);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  fill={color}
                  stroke="var(--panel)"
                  strokeWidth={1.5}
                />
              );
            })}
          </g>
        );
      })()}
    </svg>
  );
}

/** Donut Pie Chart with 0% to 100% clockwise sweep animation */
function PieChart({ slices = [], size = 180, progress = 1 }) {
  const cx = size / 2, cy = size / 2, outerR = size / 2 - 8, innerR = outerR * 0.55;
  const palette = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (!total) return null;

  const currentTotal = Math.round(total * progress);
  let cum = -Math.PI / 2;
  const safeProgress = Math.max(0.001, progress);

  const arcs = slices.map((d, i) => {
    const rawFrac = d.value / total;
    const frac = rawFrac * safeProgress;
    const start = cum;
    const end = cum + frac * 2 * Math.PI;
    cum = end;
    const la = frac > 0.5 ? 1 : 0;
    const x1o = cx + outerR * Math.cos(start), y1o = cy + outerR * Math.sin(start);
    const x2o = cx + outerR * Math.cos(end), y2o = cy + outerR * Math.sin(end);
    const x1i = cx + innerR * Math.cos(end), y1i = cy + innerR * Math.sin(end);
    const x2i = cx + innerR * Math.cos(start), y2i = cy + innerR * Math.sin(start);
    const path = `M ${x1o} ${y1o} A ${outerR} ${outerR} 0 ${la} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${innerR} ${innerR} 0 ${la} 0 ${x2i} ${y2i} Z`;
    return { ...d, path, color: palette[i % palette.length], pct: Math.round(rawFrac * 100) };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          {arcs.map((a, i) => (
            <path
              key={i}
              d={a.path}
              fill={a.color}
              stroke="var(--panel)"
              strokeWidth={2}
            />
          ))}
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{currentTotal}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--muted-fg)' }}>Total Headcount</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: 'var(--text)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0 }} />
            {a.label} ({a.pct}%)
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function PipelineAnalyticsTab() {
  const [livePipelineData, setLivePipelineData] = useState(PIPELINE_ANALYTICS);
  const recruiterPerformance = livePipelineData?.recruiterPerformance || PIPELINE_ANALYTICS.recruiterPerformance;
  const sourcingChannels = livePipelineData?.sourcingChannels || PIPELINE_ANALYTICS.sourcingChannels;

  useEffect(() => {
    let active = true;
    AnalyticsService.getPipelineMetrics()
      .then((data) => {
        if (active && data) {
          setLivePipelineData((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.warn('Could not load live pipeline analytics:', err));

    return () => {
      active = false;
    };
  }, []);

  // State
  const [selectedClientName, setSelectedClientName] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Build client intel directory from the SAME source as Client Management
  const clientDirectory = useMemo(() => {
    return CLIENTS.map((c, idx) => {
      const jobs = c.jobs || [];
      const totalDemand = jobs.reduce((s, j) => s + (j.total || 0), 0);
      const totalFilled = jobs.reduce((s, j) => s + (j.filled || 0), 0);
      const totalGap = totalDemand - totalFilled;
      const fillRate = totalDemand > 0 ? Math.round((totalFilled / totalDemand) * 100) : 0;

      // Count applicants by status
      const allApplicants = jobs.flatMap((j) => j.applicants || []);
      const hired = allApplicants.filter((a) => a.status === 'hired').length;
      const interviewing = allApplicants.filter((a) => a.status === 'interview').length;
      const screening = allApplicants.filter((a) => a.status === 'screening').length;

      // Urgency assessment
      let urgency = 'on_track';
      if (jobs.some((j) => j.badge === 'urgent')) urgency = 'critical';
      else if (totalGap > 5) urgency = 'high';
      else if (totalGap > 0) urgency = 'moderate';

      return {
        ...c,
        idx,
        totalDemand,
        totalFilled,
        totalGap,
        fillRate,
        positionCount: jobs.length,
        totalApplicants: allApplicants.length,
        hired,
        interviewing,
        screening,
        urgency,
      };
    });
  }, []);

  // Unique industry list for category filter
  const industryOptions = useMemo(() => {
    return [...new Set(clientDirectory.map((c) => c.industry || 'General'))].sort();
  }, [clientDirectory]);

  // Global aggregates for KPI bar
  const globalStats = useMemo(() => {
    const totalDemand = clientDirectory.reduce((s, c) => s + c.totalDemand, 0);
    const totalFilled = clientDirectory.reduce((s, c) => s + c.totalFilled, 0);
    const totalGap = totalDemand - totalFilled;
    const fillRate = totalDemand > 0 ? Math.round((totalFilled / totalDemand) * 100) : 0;
    const totalApplicants = clientDirectory.reduce((s, c) => s + c.totalApplicants, 0);
    const activeClients = clientDirectory.filter((c) => c.status === 'active').length;
    return { totalDemand, totalFilled, totalGap, fillRate, totalApplicants, activeClients, totalClients: clientDirectory.length };
  }, [clientDirectory]);

  // Filtered + sorted client list
  const filteredClients = useMemo(() => {
    let list = clientDirectory.filter((c) => {
      if (clientFilter === 'active' && c.status !== 'active') return false;
      if (clientFilter === 'prospect' && c.status !== 'prospect') return false;
      if (clientFilter === 'inactive' && c.status !== 'inactive') return false;
      if (clientFilter === 'critical' && c.urgency !== 'critical' && c.urgency !== 'high') return false;
      if (industryFilter !== 'all' && (c.industry || 'General') !== industryFilter) return false;
      if (clientSearch.trim()) {
        const q = clientSearch.toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !(c.industry || '').toLowerCase().includes(q) &&
          !(c.am || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    // Sort
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'fill_rate_asc') list.sort((a, b) => a.fillRate - b.fillRate);
    else if (sortBy === 'fill_rate_desc') list.sort((a, b) => b.fillRate - a.fillRate);
    else if (sortBy === 'urgency') {
      const urgOrder = { critical: 0, high: 1, moderate: 2, on_track: 3 };
      list.sort((a, b) => (urgOrder[a.urgency] ?? 4) - (urgOrder[b.urgency] ?? 4));
    }
    else if (sortBy === 'gap_desc') list.sort((a, b) => b.totalGap - a.totalGap);
    else if (sortBy === 'pipeline_desc') list.sort((a, b) => b.totalApplicants - a.totalApplicants);

    return list;
  }, [clientDirectory, clientFilter, industryFilter, clientSearch, sortBy]);

  // Level 1 Pagination (12 clients max per page)
  const [clientPage, setClientPage] = useState(1);
  const clientPageSize = 12;

  useEffect(() => {
    setClientPage(1);
  }, [clientSearch, clientFilter, industryFilter, sortBy]);

  const totalClientPages = Math.ceil(filteredClients.length / clientPageSize) || 1;
  const pagedClients = useMemo(() => {
    return filteredClients.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize);
  }, [filteredClients, clientPage, clientPageSize]);

  // Selected client data
  const selectedClient = useMemo(() => {
    if (!selectedClientName) return null;
    return clientDirectory.find((c) => c.name === selectedClientName) || null;
  }, [selectedClientName, clientDirectory]);

  // Level 2 local state & pagination (12 items max per page)
  const [posSearch, setPosSearch] = useState('');
  const [posFilter, setPosFilter] = useState('all');
  const [posPage, setPosPage] = useState(1);
  const posPageSize = 12;

  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');
  const [appPage, setAppPage] = useState(1);
  const appPageSize = 12;

  const [activeJobTitle, setActiveJobTitle] = useState(null); // null = Position Cards Grid, string = Position Details & Applicants View

  // Frame-by-frame 0% -> 100% tween animation hook (runs when selected client changes)
  const animProgress = useProgressAnimation(selectedClientName, 900);

  // Reset Level 2 state when client changes
  useEffect(() => {
    if (selectedClientName) {
      setPosSearch('');
      setPosFilter('all');
      setPosPage(1);
      setAppSearch('');
      setAppStatusFilter('all');
      setAppPage(1);
      setActiveJobTitle(null);
    }
  }, [selectedClientName]);

  useEffect(() => {
    setPosPage(1);
  }, [posFilter, posSearch]);

  useEffect(() => {
    setAppPage(1);
  }, [appStatusFilter, appSearch]);

  // ═══════════════════════════════════════════════════════════════
  //  LEVEL 2 & 3: CLIENT DETAIL VIEW (Card-Based Requisitions & Deep-Dive Roster)
  // ═══════════════════════════════════════════════════════════════
  if (selectedClient) {
    const jobs = selectedClient.jobs || [];
    const clientColor = colorFor(selectedClient.idx);

    // Build radar axes from job positions
    const radarAxes = jobs.slice(0, 6).map((j) => ({ label: j.title.length > 16 ? j.title.substring(0, 14) + '...' : j.title, max: j.total || 10 }));
    const radarValues = jobs.slice(0, 6).map((j) => j.filled || 0);

    // Build pie slices from job statuses
    const totalHired = jobs.reduce((s, j) => s + (j.filled || 0), 0);
    const totalOpen = jobs.reduce((s, j) => s + Math.max((j.total || 0) - (j.filled || 0), 0), 0);
    const totalScreening = (selectedClient.screening || 0) + (selectedClient.interviewing || 0);
    const pieSlices = [];
    if (totalHired) pieSlices.push({ label: 'Deployed', value: totalHired });
    if (totalScreening) pieSlices.push({ label: 'In Pipeline', value: totalScreening });
    if (totalOpen) pieSlices.push({ label: 'Open Slots', value: totalOpen });

    // Position filter counts
    const posCounts = { all: jobs.length, urgent: 0, hiring: 0, closed: 0 };
    jobs.forEach((j) => {
      if (j.badge === 'urgent') posCounts.urgent++;
      else if (j.badge === 'closed') posCounts.closed++;
      else posCounts.hiring++;
    });

    // Filtered positions
    const filteredJobs = jobs.filter((j) => {
      if (posFilter === 'urgent' && j.badge !== 'urgent') return false;
      if (posFilter === 'closed' && j.badge !== 'closed') return false;
      if (posFilter === 'hiring' && (j.badge === 'urgent' || j.badge === 'closed')) return false;
      if (posSearch.trim()) {
        const q = posSearch.toLowerCase();
        if (!j.title.toLowerCase().includes(q) && !(j.location || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const totalPosPages = Math.ceil(filteredJobs.length / posPageSize) || 1;
    const pagedJobs = filteredJobs.slice((posPage - 1) * posPageSize, posPage * posPageSize);

    // Active Selected Position for Level 3 Deep-Dive
    const activeJob = activeJobTitle ? jobs.find((j) => j.title === activeJobTitle) || null : null;
    const activeJobApplicants = activeJob ? (activeJob.applicants || []) : [];

    // Filtered applicants inside active job (or global fallback)
    const filteredActiveApplicants = activeJobApplicants.filter((a) => {
      if (appStatusFilter !== 'all' && a.status !== appStatusFilter) return false;
      if (appSearch.trim()) {
        const q = appSearch.toLowerCase();
        if (!a.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const totalAppPages = Math.ceil(filteredActiveApplicants.length / appPageSize) || 1;
    const pagedActiveApplicants = filteredActiveApplicants.slice((appPage - 1) * appPageSize, appPage * appPageSize);

    // Active position applicant counts
    const activeAppCounts = { all: activeJobApplicants.length, hired: 0, interview: 0, screening: 0, applied: 0, rejected: 0 };
    activeJobApplicants.forEach((a) => { activeAppCounts[a.status] = (activeAppCounts[a.status] || 0) + 1; });

    // Renewal info
    const renewalDate = selectedClient.renewal || null;
    let renewalDaysLeft = null;
    if (renewalDate) {
      const parsed = new Date(renewalDate);
      if (!isNaN(parsed.getTime())) {
        renewalDaysLeft = Math.ceil((parsed - new Date()) / (1000 * 60 * 60 * 24));
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeSlideIn 0.35s ease' }}>
        <style>{`
          @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* TOP LEVEL NAVIGATION BREADCRUMB */}
        {activeJob ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              onClick={() => setActiveJobTitle(null)}
              style={{
                alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10,
                color: 'var(--primary)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer', padding: '7px 14px',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2.5 }}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              &larr; Back to Position Cards Grid ({selectedClient.name})
            </button>

            <span style={{ fontSize: 12, color: 'var(--muted-fg)', fontWeight: 700 }}>
              Client: <b>{selectedClient.name}</b> &nbsp;·&nbsp; Position: <b style={{ color: 'var(--text)' }}>{activeJob.title}</b>
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedClientName(null)}
            style={{
              alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12.5,
              fontWeight: 800, cursor: 'pointer', padding: '4px 0',
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2.5 }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to All Clients
          </button>
        )}

        {/* CLIENT HEADER CARD (Visible on Grid View) */}
        {!activeJob && (
          <>
            <div style={{
              background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 18,
              padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 20, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img
                  src={logoUrl(selectedClient.name)} alt=""
                  style={{ width: 48, height: 48, borderRadius: 12, border: '1px solid var(--border)', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', margin: 0 }}>{selectedClient.name}</h2>
                  <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span>{selectedClient.industry || 'General'}</span>
                    <span style={{ opacity: 0.4 }}>|</span>
                    <span>{selectedClient.am || 'Unassigned'}</span>
                    <span style={{ opacity: 0.4 }}>|</span>
                    <span style={{
                      fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                      color: selectedClient.status === 'active' ? 'var(--green)' : selectedClient.status === 'prospect' ? 'var(--amber)' : 'var(--muted-fg)',
                    }}>
                      {selectedClient.status}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{selectedClient.positionCount}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Positions</div>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
                <CircleGauge pct={selectedClient.fillRate} progress={animProgress} size={52} stroke={5} color={selectedClient.fillRate >= 80 ? 'var(--green)' : selectedClient.fillRate >= 50 ? '#f59e0b' : '#dc2626'} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>{Math.round(selectedClient.totalFilled * animProgress)}/{selectedClient.totalDemand}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Headcount</div>
                </div>
                <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: selectedClient.totalGap > 5 ? '#dc2626' : selectedClient.totalGap > 0 ? '#f59e0b' : 'var(--green)' }}>{selectedClient.totalGap}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Open Slots</div>
                </div>
              </div>
            </div>

            {/* CONTRACT & RENEWAL INFO CARD */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12,
            }}>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Contract Type</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{selectedClient.contract || 'Staffing (Contingency)'}</div>
              </div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Renewal Date</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{renewalDate || 'Not set'}</div>
              </div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Days Until Renewal</div>
                <div style={{
                  fontSize: 13, fontWeight: 900, marginTop: 4,
                  color: renewalDaysLeft === null ? 'var(--muted-fg)' : renewalDaysLeft <= 30 ? '#dc2626' : renewalDaysLeft <= 60 ? '#f59e0b' : 'var(--green)',
                }}>
                  {renewalDaysLeft !== null ? (renewalDaysLeft > 0 ? `${renewalDaysLeft} Days` : 'Expired') : 'N/A'}
                </div>
              </div>
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Billing Rate</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{selectedClient.rate || 'Standard'}</div>
              </div>
            </div>

            {/* ROW: ANIMATED RADAR CHART + ANIMATED PIE CHART */}
            {jobs.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{
                  background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 20,
                  boxShadow: 'var(--shadow-xs)', display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <div style={{ alignSelf: 'flex-start', marginBottom: 12, width: '100%' }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Position Staffing Radar</h3>
                    <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>Filled vs total headcount across each position</div>
                  </div>
                  <RadarChart axes={radarAxes} values={radarValues} progress={animProgress} size={220} color={clientColor} />
                </div>

                <div style={{
                  background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, padding: 20,
                  boxShadow: 'var(--shadow-xs)',
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Workforce Distribution</h3>
                    <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>Deployed staff, pipeline candidates, and vacancies</div>
                  </div>
                  <PieChart slices={pieSlices} progress={animProgress} size={180} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            VIEW A: POSITION REQUISITION CARDS GRID (WHEN NO ACTIVE JOB)
            ═══════════════════════════════════════════════════════════════ */}
        {!activeJob ? (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ padding: '14px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Position Requisition Cards &amp; Staffing Pipelines</h3>
                <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                  {filteredJobs.length} of {jobs.length} position card{jobs.length !== 1 ? 's' : ''} &nbsp;·&nbsp; Click any card to view assigned staff &amp; applicants
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Position Status Filter Chips */}
                {[
                  { key: 'all', label: 'All Positions', count: posCounts.all },
                  { key: 'urgent', label: 'Urgent', count: posCounts.urgent, color: '#dc2626' },
                  { key: 'hiring', label: 'Hiring', count: posCounts.hiring, color: '#f59e0b' },
                  { key: 'closed', label: 'Closed', count: posCounts.closed, color: 'var(--muted-fg)' },
                ].map((f) => (
                  <button key={f.key} type="button" onClick={() => setPosFilter(f.key)}
                    style={{
                      padding: '4px 10px', borderRadius: 12, fontSize: 10.5, fontWeight: 800, cursor: 'pointer',
                      border: posFilter === f.key ? `1px solid ${f.color || 'var(--primary)'}` : '1px solid var(--border)',
                      background: posFilter === f.key ? (f.color || 'var(--primary)') : 'var(--panel)',
                      color: posFilter === f.key ? '#fff' : 'var(--text)',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    {f.label} <span style={{ opacity: 0.7 }}>({f.count})</span>
                  </button>
                ))}
                {/* Position Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', width: 170 }}>
                  <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
                    <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                  </svg>
                  <input type="text" placeholder="Search position..." value={posSearch} onChange={(e) => setPosSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 11, color: 'var(--text)', width: '100%' }} />
                </div>
              </div>
            </div>

            {/* REQUISITION CARDS GRID */}
            <div style={{ padding: 18 }}>
              {filteredJobs.length === 0 ? (
                <div style={{ padding: 36, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>
                  No position requisitions match your filter criteria.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                  {pagedJobs.map((j, ji) => {
                    const gap = Math.max((j.total || 0) - (j.filled || 0), 0);
                    const pct = j.total > 0 ? Math.round((j.filled / j.total) * 100) : 0;
                    const ringColor = gap === 0 ? 'var(--green)' : gap > 3 ? '#dc2626' : '#f59e0b';
                    const statusLabel = j.badge === 'closed' ? 'Closed' : j.badge === 'urgent' ? 'Urgent' : gap === 0 ? 'Fully Staffed' : 'Hiring';
                    const statusColor = j.badge === 'closed' ? 'var(--muted-fg)' : j.badge === 'urgent' ? '#dc2626' : gap === 0 ? 'var(--green)' : '#f59e0b';
                    const applicants = j.applicants || [];

                    return (
                      <div
                        key={ji}
                        onClick={() => {
                          setActiveJobTitle(j.title);
                          setAppSearch('');
                          setAppStatusFilter('all');
                          setAppPage(1);
                        }}
                        style={{
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 14,
                          padding: '16px 18px',
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 14,
                          boxShadow: 'var(--shadow-xs)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                        }}
                      >
                        <div>
                          {/* CARD TITLE & STATUS BADGE */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>
                                {j.title}
                              </h4>
                              <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                                {j.type || 'Full-time · Contractual'}
                              </div>
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 800, color: statusColor,
                              background: statusColor === 'var(--green)' ? 'var(--green-soft)' : statusColor === '#dc2626' ? 'rgba(220,38,38,0.08)' : statusColor === '#f59e0b' ? 'rgba(245,158,11,0.08)' : 'var(--secondary)',
                              border: `1px solid ${statusColor === 'var(--green)' ? 'var(--green)' : statusColor === '#dc2626' ? 'rgba(220,38,38,0.25)' : statusColor === '#f59e0b' ? 'rgba(245,158,11,0.25)' : 'var(--border)'}`,
                              padding: '3px 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                              {statusLabel}
                            </span>
                          </div>

                          {/* STAFFING HEALTH STRIP */}
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10,
                            padding: '10px 14px', marginTop: 12,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <CircleGauge pct={pct} size={40} stroke={4.5} color={ringColor} value={`${pct}%`} />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)' }}>
                                  {j.filled} / {j.total}
                                </div>
                                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>
                                  Headcount Filled
                                </div>
                              </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: gap > 0 ? (gap > 3 ? '#dc2626' : '#f59e0b') : 'var(--green)' }}>
                                {gap > 0 ? `${gap} Open` : 'Fully Staffed'}
                              </div>
                              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                                {applicants.length} Candidates
                              </div>
                            </div>
                          </div>

                          {/* KEY METADATA */}
                          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: 'var(--muted-fg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <svg viewBox="0 0 24 24" style={{ width: 12, height: 12, stroke: 'var(--primary)', fill: 'none', strokeWidth: 2 }}>
                                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.4 7.6 11.9a1 1 0 0 0 1.3 0C13 21.4 20 15.4 20 10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                              </svg>
                              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{j.location || 'Metro Manila'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>Rate: <b style={{ color: 'var(--text)' }}>{j.rate || 'Standard'}</b></span>
                              <span>Deadline: <b style={{ color: 'var(--text)' }}>{j.deadline || 'Ongoing'}</b></span>
                            </div>
                          </div>

                          {/* TAGS */}
                          {j.tags && j.tags.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {j.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} style={{
                                  fontSize: 9.5, fontWeight: 700, color: 'var(--muted-fg)',
                                  background: 'var(--panel)', border: '1px solid var(--border)',
                                  padding: '2px 6px', borderRadius: 6,
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CARD FOOTER: AVATAR STACK & VIEW DETAILS */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          borderTop: '1px solid var(--border-soft)', paddingTop: 10, marginTop: 4,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            {applicants.slice(0, 4).map((cand, cIdx) => {
                              const inits = cand.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
                              return (
                                <div
                                  key={cIdx}
                                  title={`${cand.name} (${cand.status})`}
                                  style={{
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: cand.status === 'hired' ? 'var(--green, #149e6e)' : clientColor,
                                    color: '#fff', fontSize: 9, fontWeight: 800,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid var(--panel)', marginLeft: cIdx > 0 ? -6 : 0,
                                  }}
                                >
                                  {inits}
                                </div>
                              );
                            })}
                            {applicants.length > 4 && (
                              <div style={{
                                width: 24, height: 24, borderRadius: '50%',
                                background: 'var(--secondary)', color: 'var(--text)',
                                fontSize: 9, fontWeight: 800,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--panel)', marginLeft: -6,
                              }}>
                                +{applicants.length - 4}
                              </div>
                            )}
                            {applicants.length === 0 && (
                              <span style={{ fontSize: 10, color: 'var(--muted-fg)' }}>No candidates pooled</span>
                            )}
                          </div>

                          <span style={{
                            fontSize: 11, fontWeight: 800, color: 'var(--primary)',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>
                            View Roster &amp; Pipeline →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PAGINATION FOOTER */}
            {filteredJobs.length > 0 && (
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--panel)' }}>
                <Pagination
                  currentPage={posPage}
                  totalPages={totalPosPages}
                  onPageChange={setPosPage}
                  totalItems={filteredJobs.length}
                  pageSize={posPageSize}
                />
              </div>
            )}
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
              VIEW B: LEVEL 3 POSITION DEEP-DIVE (EMPLOYEES & APPLICANTS)
              ═══════════════════════════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* POSITION HERO BANNER */}
            <div style={{
              background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16,
              padding: '20px 24px', boxShadow: 'var(--shadow-xs)', display: 'flex',
              justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
            }}>
              <div style={{ flex: '1 1 360px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
                    {activeJob.title}
                  </h2>
                  <span style={{
                    fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: 8,
                    background: activeJob.badge === 'urgent' ? 'rgba(220,38,38,0.08)' : activeJob.badge === 'closed' ? 'var(--secondary)' : 'var(--green-soft)',
                    color: activeJob.badge === 'urgent' ? '#dc2626' : activeJob.badge === 'closed' ? 'var(--muted-fg)' : 'var(--green)',
                    border: `1px solid ${activeJob.badge === 'urgent' ? 'rgba(220,38,38,0.25)' : activeJob.badge === 'closed' ? 'var(--border)' : 'var(--green)'}`,
                    textTransform: 'uppercase',
                  }}>
                    {activeJob.badge || 'Hiring'}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                    {activeJob.type || 'Full-time · Contractual'}
                  </span>
                </div>

                {activeJob.description && (
                  <p style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 8, lineHeight: 1.5, maxWidth: 680 }}>
                    {activeJob.description}
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 10, fontSize: 11.5 }}>
                  <span>Site: <b style={{ color: 'var(--text)' }}>{activeJob.location || 'Metro Manila'}</b></span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span>Rate: <b style={{ color: 'var(--text)' }}>{activeJob.rate || 'Standard'}</b></span>
                  <span style={{ opacity: 0.4 }}>|</span>
                  <span>Deadline: <b style={{ color: 'var(--text)' }}>{activeJob.deadline || 'Ongoing'}</b></span>
                </div>

                {activeJob.requirements && activeJob.requirements.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 4 }}>
                      Role Requirements:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {activeJob.requirements.map((req, rIdx) => (
                        <div key={rIdx} style={{ fontSize: 11, color: 'var(--text)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>•</span>
                          <span>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT KPI COUNTER */}
              <div style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14,
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <CircleGauge
                  pct={activeJob.total > 0 ? Math.round((activeJob.filled / activeJob.total) * 100) : 0}
                  size={52} stroke={5}
                  color={activeJob.filled === activeJob.total ? 'var(--green)' : '#f59e0b'}
                />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>
                    {activeJob.filled} / {activeJob.total}
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>
                    Staffing Filled
                  </div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: Math.max(activeJob.total - activeJob.filled, 0) > 0 ? '#dc2626' : 'var(--green)', marginTop: 2 }}>
                    {Math.max(activeJob.total - activeJob.filled, 0) > 0 ? `${activeJob.total - activeJob.filled} Open Slots` : '100% Fully Staffed'}
                  </div>
                </div>
              </div>
            </div>

            {/* CANDIDATES & DEPLOYED STAFF TABLE */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ padding: '14px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
                    Talent Roster &amp; Applicant Pipeline ({activeJob.title})
                  </h3>
                  <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                    {filteredActiveApplicants.length} candidate{filteredActiveApplicants.length !== 1 ? 's' : ''} in pool
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {/* Status Filter Chips */}
                  {[
                    { key: 'all', label: 'All', count: activeAppCounts.all },
                    { key: 'hired', label: 'Hired & Deployed', count: activeAppCounts.hired, color: 'var(--green)' },
                    { key: 'interview', label: 'Interview', count: activeAppCounts.interview, color: 'var(--blue)' },
                    { key: 'screening', label: 'Screening', count: activeAppCounts.screening, color: '#f59e0b' },
                    { key: 'applied', label: 'Applied', count: activeAppCounts.applied, color: 'var(--muted-fg)' },
                    { key: 'rejected', label: 'Rejected', count: activeAppCounts.rejected, color: '#dc2626' },
                  ].filter((f) => f.count > 0 || f.key === 'all').map((f) => (
                    <button key={f.key} type="button" onClick={() => setAppStatusFilter(f.key)}
                      style={{
                        padding: '4px 10px', borderRadius: 12, fontSize: 10.5, fontWeight: 800, cursor: 'pointer',
                        border: appStatusFilter === f.key ? `1px solid ${f.color || 'var(--primary)'}` : '1px solid var(--border)',
                        background: appStatusFilter === f.key ? (f.color || 'var(--primary)') : 'var(--panel)',
                        color: appStatusFilter === f.key ? '#fff' : 'var(--text)',
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}
                    >
                      {f.label} <span style={{ opacity: 0.7 }}>({f.count})</span>
                    </button>
                  ))}

                  {/* Applicant Search */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', width: 160 }}>
                    <svg viewBox="0 0 24 24" style={{ width: 11, height: 11, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
                      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input type="text" placeholder="Search candidate name..." value={appSearch} onChange={(e) => setAppSearch(e.target.value)}
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 10.5, color: 'var(--text)', width: '100%' }} />
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 800, fontSize: 10, textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 18px', textAlign: 'left' }}>Candidate / Personnel</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>AI Fit Match Score</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Applied / Hired Date</th>
                      <th style={{ padding: '12px 18px', textAlign: 'right' }}>Workflow Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActiveApplicants.length === 0 ? (
                      <tr><td colSpan={4} style={{ padding: 32, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12 }}>No candidates match the selected criteria for this position.</td></tr>
                    ) : pagedActiveApplicants.map((a, ai) => {
                      const statusColors = {
                        hired: { bg: 'var(--green-soft)', border: '1px solid var(--green)', color: 'var(--green)', label: 'Hired & Deployed' },
                        interview: { bg: 'var(--blue-soft)', border: '1px solid var(--blue)', color: 'var(--blue)', label: 'Interview Scheduled' },
                        screening: { bg: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', label: 'AI Screening' },
                        rejected: { bg: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: '#dc2626', label: 'Archived / Rejected' },
                        applied: { bg: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--muted-fg)', label: 'New Applied' },
                      };
                      const st = statusColors[a.status] || statusColors.applied;
                      const nameInit = a.name.split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();
                      const isHired = a.status === 'hired';

                      return (
                        <tr key={ai} style={{ borderBottom: '1px solid var(--border-soft)', background: isHired ? 'rgba(20,158,110,0.04)' : 'transparent' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = isHired ? 'rgba(20,158,110,0.08)' : 'var(--secondary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = isHired ? 'rgba(20,158,110,0.04)' : 'transparent')}>
                          <td style={{ padding: '13px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: isHired ? 'var(--green, #149e6e)' : clientColor,
                                color: '#fff', fontWeight: 800, fontSize: 11,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                {nameInit}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span>{a.name}</span>
                                  {isHired && (
                                    <span style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '1px 6px', borderRadius: 6, border: '1px solid var(--green)' }}>
                                      ✓ On-Site Staff
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                                  Assigned Role: {activeJob.title}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                              <span style={{
                                fontWeight: 900, fontSize: 12.5,
                                color: a.score >= 80 ? 'var(--green)' : a.score >= 60 ? '#f59e0b' : '#dc2626',
                              }}>
                                {a.score}%
                              </span>
                              <span style={{ fontSize: 10, color: 'var(--muted-fg)' }}>Fit</span>
                            </div>
                          </td>

                          <td style={{ padding: '13px 14px', textAlign: 'center', fontSize: 11.5, color: 'var(--muted-fg)', fontWeight: 600 }}>
                            {a.applied || '-'}
                          </td>

                          <td style={{ padding: '13px 18px', textAlign: 'right' }}>
                            <span style={{
                              fontSize: 10.5, fontWeight: 800, color: st.color, background: st.bg, border: st.border,
                              padding: '3px 10px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
                            }}>
                              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                              {st.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredActiveApplicants.length > 0 && (
                <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'var(--panel)' }}>
                  <Pagination
                    currentPage={appPage}
                    totalPages={totalAppPages}
                    onPageChange={setAppPage}
                    totalItems={filteredActiveApplicants.length}
                    pageSize={appPageSize}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  //  LEVEL 1: CLIENT DIRECTORY (All 11 Clients from Client Management)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* GLOBAL KPI BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Clients', value: globalStats.totalClients, sub: `${globalStats.activeClients} Active`, color: 'var(--primary)' },
          { label: 'Fill Rate', value: `${globalStats.fillRate}%`, sub: `${globalStats.totalFilled}/${globalStats.totalDemand} Deployed`, color: 'var(--green)', pct: globalStats.fillRate },
          { label: 'Open Vacancies', value: globalStats.totalGap, sub: 'Slots to Fill', color: globalStats.totalGap > 10 ? '#dc2626' : '#f59e0b' },
          { label: 'Pipeline Volume', value: globalStats.totalApplicants, sub: 'Total Candidates', color: '#8b5cf6' },
          { label: 'Positions Tracked', value: clientDirectory.reduce((s, c) => s + c.positionCount, 0), sub: 'Across all clients', color: '#06b6d4' },
        ].map((kpi, i) => (
          <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: 'var(--shadow-xs)' }}>
            {kpi.pct !== undefined ? (
              <CircleGauge pct={kpi.pct} size={46} stroke={4.5} color={kpi.color} value={kpi.value} />
            ) : (
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${kpi.color}14`, border: `2px solid ${kpi.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 900, color: kpi.color }}>{kpi.value}</span>
              </div>
            )}
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{kpi.label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH & FILTER CONTROL CENTER */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14,
        padding: '14px 18px', boxShadow: 'var(--shadow-xs)',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Row 1: Search Bar (Full Width) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '8px 14px',
        }}>
          <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by client name, industry, or account manager..."
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12.5, color: 'var(--text)', width: '100%', fontWeight: 600 }}
          />
          {clientSearch && (
            <button type="button" onClick={() => setClientSearch('')}
              style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 }}>
              ✕
            </button>
          )}
        </div>

        {/* Row 2: Filters, Category, Sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          {/* Left: Status Filter Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginRight: 2 }}>Status:</span>
            {[
              { key: 'all', label: 'All', count: clientDirectory.length },
              { key: 'active', label: 'Active', count: clientDirectory.filter((c) => c.status === 'active').length },
              { key: 'prospect', label: 'Prospect', count: clientDirectory.filter((c) => c.status === 'prospect').length },
              { key: 'inactive', label: 'Inactive', count: clientDirectory.filter((c) => c.status === 'inactive').length },
              { key: 'critical', label: 'Critical Deficit', count: clientDirectory.filter((c) => c.urgency === 'critical' || c.urgency === 'high').length },
            ].map((f) => (
              <button
                key={f.key} type="button"
                onClick={() => setClientFilter(f.key)}
                style={{
                  padding: '4px 11px', borderRadius: 14, fontSize: 10.5, fontWeight: 800, cursor: 'pointer',
                  border: clientFilter === f.key ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: clientFilter === f.key ? 'var(--primary)' : 'var(--bg)',
                  color: clientFilter === f.key ? '#fff' : 'var(--text)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                {f.label} <span style={{ opacity: 0.7, fontSize: 9.5 }}>({f.count})</span>
              </button>
            ))}
          </div>

          {/* Right: Industry Dropdown + Sort Dropdown + Clear */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Industry Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Industry:</span>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="all">All Industries</option>
                {industryOptions.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '5px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
                  cursor: 'pointer', outline: 'none',
                }}
              >
                <option value="name">Client Name (A-Z)</option>
                <option value="fill_rate_asc">Fill Rate (Low to High)</option>
                <option value="fill_rate_desc">Fill Rate (High to Low)</option>
                <option value="urgency">Urgency (Most Critical First)</option>
                <option value="gap_desc">Open Gap (Largest First)</option>
                <option value="pipeline_desc">Pipeline Volume (Most First)</option>
              </select>
            </div>

            {/* Clear All Filters */}
            {(clientFilter !== 'all' || industryFilter !== 'all' || clientSearch || sortBy !== 'name') && (
              <button
                type="button"
                onClick={() => { setClientFilter('all'); setIndustryFilter('all'); setClientSearch(''); setSortBy('name'); }}
                style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 10.5, fontWeight: 800,
                  border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--red, #dc2626)',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(clientFilter !== 'all' || industryFilter !== 'all' || clientSearch) && (
          <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontWeight: 600, borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
            Showing <b style={{ color: 'var(--text)' }}>{filteredClients.length}</b> of {clientDirectory.length} clients
            {clientFilter !== 'all' && <span> | Status: <b style={{ color: 'var(--primary)' }}>{clientFilter}</b></span>}
            {industryFilter !== 'all' && <span> | Industry: <b style={{ color: 'var(--primary)' }}>{industryFilter}</b></span>}
            {clientSearch && <span> | Search: <b style={{ color: 'var(--primary)' }}>"{clientSearch}"</b></span>}
          </div>
        )}
      </div>

      {/* CLIENT DIRECTORY TABLE */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '14px 20px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)', margin: 0 }}>Recruitment Intelligence by Client</h3>
            <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
              Select a client to view detailed staffing analytics, radar charts, and applicant pipeline
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted-fg)' }}>{filteredClients.length} Client{filteredClients.length !== 1 ? 's' : ''}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <th style={{ padding: '12px 18px', textAlign: 'left' }}>Client Account</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Fill Rate</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Positions</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Headcount</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Open Gap</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>Pipeline</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 36, textAlign: 'center', color: 'var(--muted-fg)', fontSize: 12.5 }}>
                    No clients match the selected criteria.
                  </td>
                </tr>
              ) : (
                pagedClients.map((c) => {
                  const urgencyMap = {
                    critical: { label: 'Critical', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' },
                    high: { label: 'High Need', color: '#dc2626', bg: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' },
                    moderate: { label: 'Moderate', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' },
                    on_track: { label: 'On Track', color: 'var(--green)', bg: 'var(--green-soft)', border: '1px solid var(--green)' },
                  };
                  const urg = urgencyMap[c.urgency] || urgencyMap.on_track;

                  return (
                    <tr
                      key={c.name}
                      onClick={() => setSelectedClientName(c.name)}
                      style={{ borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={logoUrl(c.name)}
                            alt=""
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 12.5 }}>{c.name}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--primary)', fontWeight: 700, marginTop: 1 }}>{c.industry || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                        <CircleGauge pct={c.fillRate} size={38} stroke={4} color={c.fillRate >= 80 ? 'var(--green)' : c.fillRate >= 50 ? '#f59e0b' : '#dc2626'} value={`${c.fillRate}%`} />
                      </td>
                      <td style={{ padding: '14px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--text)' }}>{c.positionCount}</td>
                      <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text)' }}>{c.totalFilled}</span>
                        <span style={{ color: 'var(--muted-fg)', fontWeight: 600 }}> / {c.totalDemand}</span>
                      </td>
                      <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                        {c.totalGap > 0 ? (
                          <span style={{ fontWeight: 900, color: c.totalGap > 5 ? '#dc2626' : '#f59e0b' }}>{c.totalGap}</span>
                        ) : (
                          <span style={{ fontWeight: 800, color: 'var(--green)', fontSize: 11 }}>0</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>{c.totalApplicants}</td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <span style={{
                          fontSize: 10, fontWeight: 800, color: urg.color, background: urg.bg, border: urg.border,
                          padding: '3px 10px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                          {urg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filteredClients.length > 0 && (
          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--panel)' }}>
            <Pagination
              currentPage={clientPage}
              totalPages={totalClientPages}
              onPageChange={setClientPage}
              totalItems={filteredClients.length}
              pageSize={clientPageSize}
            />
          </div>
        )}
      </div>
    </div>
  );
}
