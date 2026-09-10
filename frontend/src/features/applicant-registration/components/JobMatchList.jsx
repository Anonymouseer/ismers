import { useState, useEffect, useMemo } from 'react';
import { jobMatchesForCandidate, targetById } from '../services/ApplicantRegistrationService';
import { subscribeRealtimeEvents } from '../../../utils/realtimeSync';

function scoreTier(score) {
  if (score >= 70) return { color: 'var(--green, #10b981)', bg: 'var(--green-soft, #ecfdf5)' };
  if (score >= 40) return { color: 'var(--amber, #f59e0b)', bg: 'var(--amber-soft, #fffbeb)' };
  if (score > 0) return { color: 'var(--primary, #007dcc)', bg: 'rgba(0, 125, 204, 0.08)' };
  return { color: 'var(--muted-fg, #6b7280)', bg: 'var(--border-soft, #f3f4f6)' };
}

export default function JobMatchList({ candidate, canSelect, onSelect }) {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      setVersion((v) => v + 1);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('ismers:job-orders-updated', handleSync);
    window.addEventListener('ismers:deployments-updated', handleSync);
    const unsub = subscribeRealtimeEvents((msg) => {
      if (
        msg.type === 'JOB_ORDER_CREATED' ||
        msg.type === 'JOB_ORDER_APPROVED' ||
        msg.type === 'STAGE_CHANGED'
      ) {
        setVersion((v) => v + 1);
      }
    });

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ismers:job-orders-updated', handleSync);
      window.removeEventListener('ismers:deployments-updated', handleSync);
      unsub();
    };
  }, []);

  const matches = useMemo(() => {
    return jobMatchesForCandidate(candidate);
  }, [candidate, version]);

  if (!candidate?.category) {
    return <div className="empty-note">Assign a category first to see job order matches.</div>;
  }

  if (!matches.length) {
    return <div className="empty-note">No job orders currently open in this category ({candidate.category}).</div>;
  }

  return (
    <div className="jobmatch-list">
      {matches.map(({ job, score }) => {
        const tier = scoreTier(score);
        const targetJob = targetById(candidate?.targetJobId);
        const selected = Boolean(
          (candidate?.targetJobId && (
            candidate.targetJobId === job.id ||
            candidate.targetJobId === job.ref ||
            (job.aliases && job.aliases.includes(candidate.targetJobId))
          )) ||
          (targetJob && (
            targetJob.ref === job.ref ||
            targetJob.id === job.id ||
            (targetJob.title?.toLowerCase() === job.title?.toLowerCase() && targetJob.client?.toLowerCase() === job.client?.toLowerCase())
          ))
        );

        return (
          <button
            type="button"
            key={job.id || job.ref || `${job.title}-${job.client}`}
            className={`jobmatch-row${selected ? ' selected' : ''}`}
            disabled={!canSelect}
            onClick={() => onSelect(job.id || job.ref, `${job.title} — ${job.client}`)}
          >
            <div className="jobmatch-info">
              <div className="jobmatch-title">{job.title}</div>
              <div className="jobmatch-client">{job.client}</div>
            </div>

            <div
              className="jobmatch-score"
              style={{
                color: tier.color,
                background: tier.bg,
                fontWeight: 700,
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 12,
                whiteSpace: 'nowrap',
              }}
            >
              {score}% match
            </div>

            {selected && <div className="jobmatch-selected-tag">Selected</div>}
          </button>
        );
      })}
    </div>
  );
}