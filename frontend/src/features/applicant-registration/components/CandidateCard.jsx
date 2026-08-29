import { targetById, STATUS_META, computeMatchScore } from '../services/ApplicantRegistrationService';
import PersonAvatar from '../../../components/common/PersonAvatar';

export default function CandidateCard({ candidate, onOpen }) {
  const job = targetById(candidate.targetJobId);
  const statusMeta = STATUS_META[candidate.status] || STATUS_META.active;
  const showStatusFlag = candidate.status !== 'active';
  const aiScore = job ? computeMatchScore(candidate, job) : (candidate.aiScore ?? null);
  const scoreClass = aiScore != null ? (aiScore >= 70 ? 'high' : aiScore >= 40 ? 'mid' : 'low') : '';

  return (
    <div className="cand-card" onClick={() => onOpen(candidate.regId)}>
      <div className="cand-top">
        <PersonAvatar
          name={candidate.name}
          gender={candidate.gender}
          photo={candidate.photo || candidate.avatar}
          size="sm"
          variant="blue"
        />
        <div className="cand-name">{candidate.name}</div>
        {aiScore != null ? (
          <div className={`score-badge ${scoreClass}`}>{aiScore}%</div>
        ) : (
          <div className="cand-skill-count">
            {candidate.skills.length} skill{candidate.skills.length === 1 ? '' : 's'}
          </div>
        )}
      </div>
      <div className="cand-job">
        <svg className="icon" viewBox="0 0 24 24">
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M8.5 11h7M8.5 14.5h7" />
        </svg>
        {job ? (
          `${job.title} · ${job.client}`
        ) : (
          <span className="no-target">No target job order yet</span>
        )}
      </div>
      {candidate.category && (
        <div className="cand-category-chip">{candidate.category}</div>
      )}
      {showStatusFlag && (
        <div className="cand-status-flag" style={{ color: statusMeta.color }}>
          <span className="dot" style={{ background: statusMeta.color }} />
          {statusMeta.label}
        </div>
      )}
      <div className="cand-foot">
        <span className="cand-loc">{candidate.location}</span>
        <span className="cand-days">Registered {candidate.registeredDate}</span>
      </div>
    </div>
  );
}