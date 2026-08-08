import { useMemo, useState } from 'react';
import './PositionRequisitions.css';

const PRF_STATUS_META = {
  pending:  { label: 'Pending Review',  color: '#D98A2B', soft: '#FBF0E1' },
  approved: { label: 'Approved',        color: '#149E6E', soft: '#E4F5EE' },
  revised:  { label: 'For Revision',    color: '#3D7DD6', soft: '#E7EFFB' },
  rejected: { label: 'Rejected',        color: '#D45B5B', soft: '#FBEAEA' },
  fulfilled:{ label: 'Fulfilled',       color: '#8B6FD1', soft: '#F0ECF9' },
};

const DEPT_OPTIONS = [
  'Human Resources', 'Operations', 'Logistics', 'Retail', 'Healthcare',
  'Manufacturing', 'BPO / Call Center', 'Administration', 'IT Support',
];

// Generate PRF data from job orders
function buildPRFs(jobOrders) {
  const deptMap = {
    'ABC Logistics': 'Logistics',
    'Nova Retail Group': 'Retail',
    'Meridian BPO Solutions': 'BPO / Call Center',
    'Golden Harvest Agri Corp': 'Operations',
    'CarePlus Health Staffing': 'Healthcare',
    'Swift Freight Logistics': 'Logistics',
    'Summit Manufacturing Inc.': 'Manufacturing',
  };

  const priorityLabels = { high: 'High', medium: 'Medium', normal: 'Normal' };

  return jobOrders.map((jo, idx) => {
    // Derive PRF approval status from job order fill/stage
    let prfStatus = 'approved';
    if (jo.stage === 'created' || jo.stage === 'review') prfStatus = 'pending';
    else if (jo.stage === 'rejected') prfStatus = 'rejected';
    else if (jo.filled >= jo.total) prfStatus = 'fulfilled';

    // Make 2 PRFs "pending" and 1 "revised" for demo variety
    if (idx === 4) prfStatus = 'pending';
    if (idx === 7) prfStatus = 'pending';
    if (idx === 2) prfStatus = 'revised';

    const submittedDate = new Date('2026-07-01');
    submittedDate.setDate(submittedDate.getDate() + idx * 3);

    return {
      prfRef: `PRF-${String(idx + 1).padStart(3, '0')}`,
      joRef: jo.ref,
      client: jo.client,
      department: deptMap[jo.client] || 'Operations',
      position: jo.title,
      location: jo.location,
      type: jo.type,
      rate: jo.rate,
      requested: jo.total,
      filled: jo.filled,
      deadline: jo.deadline,
      priority: jo.priority,
      recruiter: jo.recruiter,
      description: jo.description,
      requirements: jo.requirements || [],
      submittedBy: ['Maria Santos', 'John Dela Cruz', 'Angela Reyes', 'Mark Tuazon'][idx % 4],
      submittedDate: submittedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      prfStatus,
      justification: [
        'Client has confirmed a new project launch requiring additional headcount to meet operational targets.',
        'Existing headcount is insufficient to cover peak-season demand. Replacement and expansion headcount requested.',
        'Expansion of client operations requires immediate staffing to maintain service level agreements.',
        'New client account onboarding. Position is critical to the ramp-up timeline.',
      ][idx % 4],
      priorityLabel: priorityLabels[jo.priority] || 'Normal',
    };
  });
}

export default function PositionRequisitions({ jobOrders, onViewJobOrder }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [expandedPrf, setExpandedPrf] = useState(null);
  const [prfStatuses, setPrfStatuses] = useState({});

  const prfs = useMemo(() => buildPRFs(jobOrders), [jobOrders]);

  const filtered = useMemo(() => {
    return prfs.filter((prf) => {
      const effectiveStatus = prfStatuses[prf.prfRef] ?? prf.prfStatus;
      if (statusFilter !== 'all' && effectiveStatus !== statusFilter) return false;
      if (deptFilter !== 'all' && prf.department !== deptFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !prf.position.toLowerCase().includes(q) &&
          !prf.client.toLowerCase().includes(q) &&
          !prf.prfRef.toLowerCase().includes(q) &&
          !prf.joRef.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [prfs, statusFilter, deptFilter, search, prfStatuses]);

  const counts = useMemo(() => {
    const result = { all: prfs.length };
    prfs.forEach((p) => {
      const s = prfStatuses[p.prfRef] ?? p.prfStatus;
      result[s] = (result[s] || 0) + 1;
    });
    return result;
  }, [prfs, prfStatuses]);

  function updateStatus(prfRef, newStatus) {
    setPrfStatuses((prev) => ({ ...prev, [prfRef]: newStatus }));
    if (expandedPrf === prfRef) setExpandedPrf(null);
  }

  const depts = [...new Set(prfs.map((p) => p.department))].sort();

  return (
    <div className="prf-view">
      {/* ---- Header bar ---- */}
      <div className="prf-header-bar">
        <div>
          <div className="prf-header-title">Position Requisition Forms</div>
          <div className="prf-header-sub">
            {prfs.length} PRFs submitted &mdash; {counts.pending || 0} pending review, {counts.approved || 0} approved, {counts.fulfilled || 0} fulfilled
          </div>
        </div>
      </div>

      {/* ---- Status summary pills ---- */}
      <div className="prf-status-strip">
        {Object.entries(PRF_STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            className={`prf-status-pill ${statusFilter === key ? 'active' : ''}`}
            style={{ '--pill-color': meta.color, '--pill-soft': meta.soft }}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
          >
            <span className="prf-status-pill-dot" />
            {meta.label}
            <span className="prf-status-pill-count">{counts[key] || 0}</span>
          </button>
        ))}
      </div>

      {/* ---- Filters row ---- */}
      <div className="prf-filters">
        <div className="prf-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search by position, client, or PRF / JO ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="prf-select" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
          <option value="all">All Departments</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="prf-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(PRF_STATUS_META).map(([k, m]) => (
            <option key={k} value={k}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* ---- Table ---- */}
      <div className="prf-table-wrap">
        {filtered.length === 0 ? (
          <div className="prf-empty">No Position Requisition Forms match the selected filters.</div>
        ) : (
          <table className="prf-table">
            <thead>
              <tr>
                <th style={{ width: 32 }} />
                <th>PRF Ref</th>
                <th>JO Ref</th>
                <th>Client / Department</th>
                <th>Position</th>
                <th>Location</th>
                <th>Type</th>
                <th>Rate</th>
                <th>Headcount</th>
                <th>Deadline</th>
                <th>Priority</th>
                <th>Submitted By</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prf) => {
                const effectiveStatus = prfStatuses[prf.prfRef] ?? prf.prfStatus;
                const statusMeta = PRF_STATUS_META[effectiveStatus];
                const isExpanded = expandedPrf === prf.prfRef;
                const fillPct = prf.requested > 0 ? Math.round((prf.filled / prf.requested) * 100) : 0;

                return (
                  <>
                    <tr
                      key={prf.prfRef}
                      className={`prf-row ${isExpanded ? 'expanded' : ''}`}
                      onClick={() => setExpandedPrf(isExpanded ? null : prf.prfRef)}
                    >
                      <td className="prf-expand-cell">
                        <span className={`prf-expand-icon ${isExpanded ? 'open' : ''}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </td>
                      <td><span className="prf-ref-badge">{prf.prfRef}</span></td>
                      <td>
                        <button
                          className="prf-jo-link"
                          onClick={(e) => { e.stopPropagation(); onViewJobOrder?.(prf.joRef); }}
                          title="Open Job Order"
                        >
                          {prf.joRef}
                        </button>
                      </td>
                      <td>
                        <div className="prf-client-cell">
                          <div className="prf-client-name">{prf.client}</div>
                          <div className="prf-dept-tag">{prf.department}</div>
                        </div>
                      </td>
                      <td><span className="prf-position">{prf.position}</span></td>
                      <td><span className="prf-location">{prf.location}</span></td>
                      <td><span className="prf-type">{prf.type}</span></td>
                      <td><span className="prf-rate">{prf.rate}</span></td>
                      <td>
                        <div className="prf-headcount-cell">
                          <span className="prf-headcount-nums">{prf.filled} / {prf.requested}</span>
                          <div className="prf-mini-track">
                            <div
                              className="prf-mini-fill"
                              style={{
                                width: `${fillPct}%`,
                                background: fillPct >= 100 ? 'var(--green)' : fillPct >= 50 ? 'var(--amber)' : 'var(--red)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td><span className="prf-deadline">{prf.deadline}</span></td>
                      <td>
                        <span
                          className="prf-priority-badge"
                          data-priority={prf.priority}
                        >
                          {prf.priorityLabel}
                        </span>
                      </td>
                      <td><span className="prf-submitter">{prf.submittedBy}</span></td>
                      <td><span className="prf-date">{prf.submittedDate}</span></td>
                      <td>
                        <span
                          className="prf-status-badge"
                          style={{ color: statusMeta.color, background: statusMeta.soft }}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="prf-action-group">
                          {effectiveStatus === 'pending' || effectiveStatus === 'revised' ? (
                            <>
                              <button
                                className="prf-btn prf-btn-approve"
                                onClick={() => updateStatus(prf.prfRef, 'approved')}
                              >
                                Approve
                              </button>
                              <button
                                className="prf-btn prf-btn-revise"
                                onClick={() => updateStatus(prf.prfRef, 'revised')}
                                disabled={effectiveStatus === 'revised'}
                              >
                                Revise
                              </button>
                              <button
                                className="prf-btn prf-btn-reject"
                                onClick={() => updateStatus(prf.prfRef, 'rejected')}
                              >
                                Reject
                              </button>
                            </>
                          ) : effectiveStatus === 'approved' ? (
                            <button
                              className="prf-btn prf-btn-revise"
                              onClick={() => updateStatus(prf.prfRef, 'revised')}
                            >
                              Revise
                            </button>
                          ) : (
                            <span className="prf-finalized-label">
                              {effectiveStatus === 'rejected' ? 'Rejected' : effectiveStatus === 'fulfilled' ? 'Fulfilled' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr key={`${prf.prfRef}-detail`} className="prf-detail-row">
                        <td />
                        <td colSpan={14}>
                          <div className="prf-detail-panel">
                            <div className="prf-detail-grid">
                              <div className="prf-detail-block">
                                <div className="prf-detail-label">Business Justification</div>
                                <div className="prf-detail-text">{prf.justification}</div>
                              </div>
                              <div className="prf-detail-block">
                                <div className="prf-detail-label">Position Description</div>
                                <div className="prf-detail-text">{prf.description}</div>
                              </div>
                              <div className="prf-detail-block">
                                <div className="prf-detail-label">Requirements</div>
                                <ul className="prf-reqs-list">
                                  {prf.requirements.map((r, i) => (
                                    <li key={i}>{r}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="prf-detail-block">
                                <div className="prf-detail-label">Assigned Recruiter</div>
                                <div className="prf-detail-text prf-recruiter-chip">{prf.recruiter}</div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
