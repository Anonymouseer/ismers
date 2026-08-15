import React from 'react';
import {
  STATUS_META,
  PRIORITY_META,
  countdownLabel,
  initials,
} from '../services/JobOrderManagementService';
import './JobOrderTableView.css';

export default function JobOrderTableView({
  jobOrders,
  selectedRefs,
  selectMode,
  onOpen,
  onToggleSelect,
  onApproveAndOpen,
  onEdit,
  onDelete,
}) {
  if (!jobOrders || !jobOrders.length) {
    return (
      <div className="jot-empty-state">
        <svg className="jot-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
        <div className="jot-empty-title">No job order requisitions match your criteria</div>
        <div className="jot-empty-desc">Adjust your search keyword or status filter above to display records.</div>
      </div>
    );
  }

  return (
    <div className="jot-table-container">
      <table className="jot-table">
        <thead>
          <tr>
            {selectMode && <th className="jot-th-check"></th>}
            <th className="jot-th-ref">Ref ID</th>
            <th className="jot-th-position">Position &amp; Role</th>
            <th className="jot-th-client">Client Entity</th>
            <th className="jot-th-status">Status</th>
            <th className="jot-th-progress">Fulfillment Progress</th>
            <th className="jot-th-rate">Offer Rate</th>
            <th className="jot-th-deadline">Target Deadline</th>
            <th className="jot-th-recruiter">Account Manager</th>
            <th className="jot-th-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobOrders.map((job) => {
            const meta = STATUS_META[job.status] || STATUS_META.open;
            const pct = Math.round(((job.filled || 0) / (job.total || 1)) * 100);
            const cd = countdownLabel(job.deadline);
            const isSelected = selectedRefs?.has(job.ref);
            const isReview = job.status === 'review' || job.stage === 'review';

            return (
              <tr
                key={job.ref}
                className={`jot-tr ${isSelected ? 'jot-tr--selected' : ''} ${isReview ? 'jot-tr--review' : ''}`}
                onClick={() => (selectMode ? onToggleSelect(job.ref) : onOpen(job.ref))}
              >
                {selectMode && (
                  <td className="jot-td-check" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(job.ref)}
                      className="jot-checkbox"
                    />
                  </td>
                )}
                <td className="jot-td-ref">
                  <span className="jot-ref-badge" style={{ '--ref-color': meta.color }}>
                    {job.ref}
                  </span>
                </td>
                <td className="jot-td-position">
                  <div className="jot-pos-title">{job.title}</div>
                  <div className="jot-pos-sub">
                    <span className="jot-type-tag">{job.type}</span>
                    {job.priority === 'urgent' && (
                      <span className="jot-priority-tag jot-priority-tag--urgent">Urgent</span>
                    )}
                  </div>
                </td>
                <td className="jot-td-client">
                  <div className="jot-client-name">{job.client}</div>
                  <div className="jot-client-loc">{job.location}</div>
                </td>
                <td className="jot-td-status">
                  <span
                    className="jot-status-pill"
                    style={{
                      '--pill-bg': meta.soft,
                      '--pill-color': meta.color,
                      '--pill-border': `${meta.color}40`,
                    }}
                  >
                    <span className="jot-status-dot" />
                    {meta.label}
                  </span>
                </td>
                <td className="jot-td-progress">
                  <div className="jot-prog-wrap">
                    <div className="jot-prog-label">
                      <span>{job.filled} / {job.total} slots</span>
                      <span className="jot-prog-pct">{pct}%</span>
                    </div>
                    <div className="jot-prog-track">
                      <div
                        className="jot-prog-fill"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                  </div>
                </td>
                <td className="jot-td-rate">
                  <div className="jot-rate-val">{job.rate}</div>
                </td>
                <td className="jot-td-deadline">
                  <div className="jot-deadline-date">{job.deadline}</div>
                  <span
                    className="jot-countdown-badge"
                    style={{ background: cd.soft, color: cd.color }}
                  >
                    {cd.text}
                  </span>
                </td>
                <td className="jot-td-recruiter">
                  <div className="jot-recruiter-wrap">
                    <div className="jot-recruiter-av">{initials(job.recruiter || 'HR')}</div>
                    <div className="jot-recruiter-name">{job.recruiter}</div>
                  </div>
                </td>
                <td className="jot-td-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="jot-actions-group">
                    {isReview ? (
                      <button
                        type="button"
                        className="jot-btn-approve"
                        title="Approve & Activate Job Order"
                        onClick={() => onApproveAndOpen(job.ref)}
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="jot-btn-view"
                        onClick={() => onOpen(job.ref)}
                      >
                        View
                      </button>
                    )}
                    <button
                      type="button"
                      className="jot-btn-icon"
                      title="Edit Requisition"
                      onClick={() => onEdit(job.ref)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
