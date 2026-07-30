import { initials, scoreClass } from '../utils/recruitmentUtils';
import { getHire, keyFor } from '../services/RecruitmentSelectionService';

const STAGE_LABELS = {
  assigned: 'Assigned', scheduled: 'Scheduled', reporting: 'Reporting',
  in_progress: 'In Progress', monitoring: 'Monitoring', completed: 'Completed', closed: 'Closed',
};

function DeploymentBadge({ app, job }) {
  const hire = getHire(keyFor(app.name, job.depRef));
  if (!hire || !hire.deploymentId) {
    return <span className="dep-sync-badge pending">Awaiting deployment</span>;
  }
  const label = STAGE_LABELS[hire.stage] || hire.stage || 'Deployed';
  const extra = typeof hire.attendanceRate === 'number' ? ` · ${hire.attendanceRate}% attendance` : '';
  return <span className="dep-sync-badge active">{hire.deploymentId} · {label}{extra}</span>;
}

export default function CandidateCard({ app, job, onSelect }) {
  return (
    <div className="cand-card" onClick={() => onSelect(app)}>
      <div className="cand-top">
        <div className="cand-avatar">{initials(app.name)}</div>
        <div className="cand-name">{app.name}</div>
        <div className={`score-badge ${scoreClass(app.score)}`}>{app.score}</div>
      </div>
      <div className="cand-jo">
        <svg className="icon" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8.5 11h7M8.5 14.5h7" /></svg>
        {job.title}
      </div>
      <div className="cand-foot">
        <span className="cand-client">{job.client}</span>
        <span className="cand-days">Applied {app.applied}</span>
      </div>
      {app.fromRegistration && (
        <div className="cand-dep-row">
          <span className="dep-sync-badge active" style={{ background: 'var(--purple-soft)', color: 'var(--purple)' }}>
            From Registration · {app.regId}
          </span>
        </div>
      )}
      {app.status === 'hired' && (
        <div className="cand-dep-row">
          <DeploymentBadge app={app} job={job} />
        </div>
      )}
    </div>
  );
}