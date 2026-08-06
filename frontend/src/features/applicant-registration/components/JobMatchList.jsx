import { jobMatchesForCandidate } from '../services/ApplicantRegistrationService';

function scoreTier(score) {
  if (score >= 70) return { color: 'var(--green)', bg: 'var(--green-soft)' };
  if (score >= 40) return { color: 'var(--amber)', bg: 'var(--amber-soft)' };
  return { color: 'var(--muted-fg)', bg: 'var(--border-soft)' };
}

// Replaces the old plain "pick any job order" dropdown. Shows job orders
// within the applicant's category, ranked by a keyword-match score against
// their skills + work history, so staff review a shortlist instead of
// guessing from an unordered list. Clicking a row sets it as the target
// job — staff still makes the call, the score just informs it.
export default function JobMatchList({ candidate, canSelect, onSelect }) {
  if (!candidate.category) {
    return <div className="empty-note">Assign a category first to see job order matches.</div>;
  }

  const matches = jobMatchesForCandidate(candidate);

  if (!matches.length) {
    return <div className="empty-note">No job orders currently open in this category.</div>;
  }

  return (
    <div className="jobmatch-list">
      {matches.map(({ job, score }) => {
        const tier = scoreTier(score);
        const selected = candidate.targetJobId === job.id;
        return (
          <button
            type="button"
            key={job.id}
            className={`jobmatch-row${selected ? ' selected' : ''}`}
            disabled={!canSelect}
            onClick={() => onSelect(job.id, `${job.title} — ${job.client}`)}
          >
            <div className="jobmatch-info">
              <div className="jobmatch-title">{job.title}</div>
              <div className="jobmatch-client">{job.client}</div>
            </div>
            <div className="jobmatch-score" style={{ color: tier.color, background: tier.bg }}>
              {score}% match
            </div>
            {selected && <div className="jobmatch-selected-tag">Selected</div>}
          </button>
        );
      })}
    </div>
  );
}