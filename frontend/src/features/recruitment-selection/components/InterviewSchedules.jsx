import { useMemo, useState } from 'react';
import { JOB_ORDERS, SLOT_TIMES, TODAY } from '../data/mockApplications';
import { formatDate, addDays } from '../utils/recruitmentUtils';
import './InterviewSchedules.css';

const STAGE_LABELS = {
  area_manager: 'Area Manager 2nd Interview',
  client_interview: 'Client Final Interview',
  pooling: 'Initial Screening',
};

function CompletedBadge({ small = false }) {
  return (
    <span className={small ? 'is-done-chip-sm' : 'is-done-chip'}>
      <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="6" fill="currentColor" opacity="0.18" />
        <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {small ? 'Done' : 'Interview Done'}
    </span>
  );
}

function StageBadge({ completedAt }) {
  return (
    <div className="is-advance-notice" role="status" aria-live="polite">
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Advanced to <strong>Client Final Interview</strong>
      {completedAt && <span className="is-advance-date"> · {completedAt}</span>}
    </div>
  );
}

export default function InterviewSchedules({ applications, onReschedule, onMarkDone }) {
  const [viewMode, setViewMode] = useState('day'); // 'day' | 'week' | 'recruiter'
  const [selectedDate, setSelectedDate] = useState(new Date(TODAY));
  const [recruiterFilter, setRecruiterFilter] = useState('all');

  const jobById = (id) => JOB_ORDERS.find((j) => j.id === id);

  const scheduledInterviews = useMemo(
    () => applications.filter((app) => app.interview),
    [applications]
  );

  const allRecruiters = useMemo(() => {
    const set = new Set();
    scheduledInterviews.forEach((app) => set.add(app.interview.recruiter));
    return Array.from(set).sort();
  }, [scheduledInterviews]);

  const selectedDateLabel = formatDate(selectedDate);
  const dayBefore = addDays(selectedDate, -1);
  const dayAfter = addDays(selectedDate, 1);

  const applyRecruiterFilter = (list) =>
    recruiterFilter === 'all' ? list : list.filter((a) => a.interview.recruiter === recruiterFilter);

  const dayInterviews = useMemo(
    () => applyRecruiterFilter(scheduledInterviews.filter((a) => a.interview.date === selectedDateLabel)),
    [scheduledInterviews, selectedDateLabel, recruiterFilter]
  );

  const weekInterviews = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedDate, i);
      if (day.getDay() === 0) continue;
      const label = formatDate(day);
      const apps = applyRecruiterFilter(scheduledInterviews.filter((a) => a.interview.date === label));
      if (apps.length) result.push({ date: label, apps });
    }
    return result;
  }, [scheduledInterviews, selectedDate, recruiterFilter]);

  const recruiterSchedules = useMemo(() => {
    const recruiters = recruiterFilter === 'all' ? allRecruiters : [recruiterFilter];
    return recruiters.map((r) => ({
      recruiter: r,
      interviews: scheduledInterviews.filter((a) => a.interview.recruiter === r),
    }));
  }, [scheduledInterviews, recruiterFilter, allRecruiters]);

  // ── Shared interview card (used in all three views) ──────────────────────
  function InterviewCard({ app, compact = false }) {
    const job = jobById(app.jobId);
    const done = app.interview?.completed;
    const advanced = done && app.status === 'client_interview';

    return (
      <div className={`is-card${done ? ' is-card--done' : ''}${compact ? ' is-card--compact' : ''}`}>
        {/* Left accent + info */}
        <div className="is-card-main">
          <div className="is-card-top">
            {!compact && <span className="is-card-time">{app.interview.time}</span>}
            <span className="is-card-name">{app.name}</span>
            {done && <CompletedBadge small={compact} />}
          </div>

          <div className="is-card-meta">
            {compact && <span className="is-card-time-sm">{app.interview.time}</span>}
            <span className="is-card-job">{job?.title}{job?.client && <> &middot; <span className="is-card-client">{job.client}</span></>}</span>
          </div>

          <div className="is-card-footer">
            <span className="is-card-type">{app.interview.title}</span>
            <span className="is-card-recruiter">{app.interview.recruiter}</span>
          </div>

          {advanced && <StageBadge completedAt={app.interview.completedAt} />}
        </div>

        {/* Actions */}
        <div className="is-card-actions">
          {done ? (
            <span className="is-btn is-btn--done" aria-label="Interview completed">
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Done
            </span>
          ) : (
            <>
              <button className="is-btn is-btn--reschedule" onClick={() => onReschedule?.(app)}>
                Reschedule
              </button>
              <button className="is-btn is-btn--mark-done" onClick={() => onMarkDone?.(app)}>
                Mark Done
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="is-root">

      {/* ── Controls bar ── */}
      <div className="is-controls">
        <div className="is-tabs" role="tablist">
          {[['day', 'Day View'], ['week', 'Week View'], ['recruiter', 'By Recruiter']].map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={viewMode === key}
              className={`is-tab${viewMode === key ? ' is-tab--active' : ''}`}
              onClick={() => setViewMode(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <select value={recruiterFilter} onChange={(e) => setRecruiterFilter(e.target.value)} className="is-filter-select">
          <option value="all">All Interviewers</option>
          {allRecruiters.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* ── DAY VIEW ── */}
      {viewMode === 'day' && (
        <div className="is-view">
          <div className="is-day-nav">
            <button className="is-nav-btn" onClick={() => setSelectedDate(dayBefore)}>&#8592; Previous</button>
            <div className="is-day-center">
              <input
                type="date"
                className="is-date-input"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
              />
              <div className="is-day-label">{selectedDateLabel}</div>
            </div>
            <button className="is-nav-btn" onClick={() => setSelectedDate(dayAfter)}>Next &#8594;</button>
          </div>

          {dayInterviews.length === 0 ? (
            <div className="is-empty">No interviews scheduled for {selectedDateLabel}</div>
          ) : (
            <div className="is-timeline">
              {SLOT_TIMES.map((time) => {
                const atTime = dayInterviews.filter((a) => a.interview.time === time);
                if (!atTime.length) return null;
                return (
                  <div key={time} className="is-slot">
                    <div className="is-slot-time">{time}</div>
                    <div className="is-slot-items">
                      {atTime.map((app) => <InterviewCard key={app.id} app={app} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── WEEK VIEW ── */}
      {viewMode === 'week' && (
        <div className="is-view">
          <div className="is-week-nav">
            <button className="is-nav-btn" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>&#8592; Previous Week</button>
            <div className="is-week-label">Week of {formatDate(selectedDate)}</div>
            <button className="is-nav-btn" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>Next Week &#8594;</button>
          </div>

          {weekInterviews.length === 0 ? (
            <div className="is-empty">No interviews scheduled this week</div>
          ) : (
            <div className="is-week-grid">
              {weekInterviews.map((group) => (
                <div key={group.date} className="is-week-col">
                  <div className="is-week-col-head">{group.date}</div>
                  <div className="is-week-col-body">
                    {group.apps.map((app) => <InterviewCard key={app.id} app={app} compact />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RECRUITER VIEW ── */}
      {viewMode === 'recruiter' && (
        <div className="is-view">
          {recruiterSchedules.length === 0 ? (
            <div className="is-empty">No interviews scheduled</div>
          ) : (
            <div className="is-recruiter-list">
              {recruiterSchedules.map((group) => (
                <div key={group.recruiter} className="is-recruiter-group">
                  <div className="is-recruiter-head">
                    <span className="is-recruiter-name">{group.recruiter}</span>
                    <span className="is-recruiter-count">
                      {group.interviews.length} interview{group.interviews.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="is-recruiter-body">
                    {group.interviews
                      .slice()
                      .sort((a, b) =>
                        new Date(`${a.interview.date} ${a.interview.time}`) -
                        new Date(`${b.interview.date} ${b.interview.time}`)
                      )
                      .map((app) => (
                        <div key={app.id} className="is-recruiter-row">
                          <div className="is-recruiter-row-date">
                            <div className="is-recruiter-row-d">{app.interview.date}</div>
                            <div className="is-recruiter-row-t">{app.interview.time}</div>
                          </div>
                          <InterviewCard app={app} compact />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
