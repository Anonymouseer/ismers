import { initials, targetById } from '../services/ApplicantRegistrationService';

export default function CandidateCard({ candidate, onOpen }) {
  const job = targetById(candidate.targetJobId);

  return (
    <div className="cand-card" onClick={() => onOpen(candidate.regId)}>
      <div className="cand-top">
        <div className="cand-avatar">{initials(candidate.name)}</div>
        <div className="cand-name">{candidate.name}</div>
        <div className="cand-skill-count">
          {candidate.skills.length} skill{candidate.skills.length === 1 ? '' : 's'}
        </div>
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
      <div className="cand-foot">
        <span className="cand-loc">{candidate.location}</span>
        <span className="cand-days">Registered {candidate.registeredDate}</span>
      </div>
    </div>
  );
}
