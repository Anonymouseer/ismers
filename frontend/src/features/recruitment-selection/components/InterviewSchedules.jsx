import { useMemo, useState } from 'react';
import { JOB_ORDERS, SLOT_TIMES, TODAY } from '../data/mockApplications';
import { formatDate, addDays } from '../utils/recruitmentUtils';
import './InterviewSchedules.css';

export default function InterviewSchedules({ applications, onReschedule, onMarkDone }) {
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'recruiter'
  const [selectedDate, setSelectedDate] = useState(new Date(TODAY));
  const [recruiterFilter, setRecruiterFilter] = useState('all');

  const jobById = (id) => JOB_ORDERS.find((j) => j.id === id);

  // Get all scheduled interviews
  const scheduledInterviews = useMemo(
    () => applications.filter((app) => app.interview),
    [applications]
  );

  // Extract unique recruiters
  const allRecruiters = useMemo(() => {
    const recruiters = new Set();
    scheduledInterviews.forEach((app) => {
      recruiters.add(app.interview.recruiter);
    });
    return Array.from(recruiters).sort();
  }, [scheduledInterviews]);

  // Day view: interviews for selected date
  const selectedDateLabel = formatDate(selectedDate);
  const dayInterviews = useMemo(
    () => {
      const filtered = scheduledInterviews.filter((app) => app.interview.date === selectedDateLabel);
      return recruiterFilter === 'all' ? filtered : filtered.filter((app) => app.interview.recruiter === recruiterFilter);
    },
    [scheduledInterviews, selectedDateLabel, recruiterFilter]
  );

  // Week view: next 7 days
  const weekInterviews = useMemo(() => {
    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = addDays(selectedDate, i);
      if (day.getDay() === 0) continue;
      const dayLabel = formatDate(day);
      const dayApps = scheduledInterviews.filter((app) => app.interview.date === dayLabel);
      const filtered = recruiterFilter === 'all' ? dayApps : dayApps.filter((app) => app.interview.recruiter === recruiterFilter);
      if (filtered.length > 0) {
        result.push({ date: dayLabel, apps: filtered });
      }
    }
    return result;
  }, [scheduledInterviews, selectedDate, recruiterFilter]);

  // Recruiter view
  const recruiterSchedules = useMemo(() => {
    if (recruiterFilter === 'all') {
      return allRecruiters.map((recruiter) => ({
        recruiter,
        interviews: scheduledInterviews.filter((app) => app.interview.recruiter === recruiter),
      }));
    }
    return [
      {
        recruiter: recruiterFilter,
        interviews: scheduledInterviews.filter((app) => app.interview.recruiter === recruiterFilter),
      },
    ];
  }, [scheduledInterviews, recruiterFilter, allRecruiters]);

  const dayBefore = addDays(selectedDate, -1);
  const dayAfter = addDays(selectedDate, 1);

  return (
    <div className="interview-schedules">
      <div className="schedule-controls">
        <div className="schedule-tabs">
          <button className={`tab ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>
            Day View
          </button>
          <button className={`tab ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>
            Week View
          </button>
          <button className={`tab ${viewMode === 'recruiter' ? 'active' : ''}`} onClick={() => setViewMode('recruiter')}>
            By Recruiter
          </button>
        </div>

        <div className="schedule-filters">
          <select value={recruiterFilter} onChange={(e) => setRecruiterFilter(e.target.value)} className="filter-select">
            <option value="all">All Interviewers</option>
            {allRecruiters.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="schedule-day-view">
          <div className="day-nav">
            <button onClick={() => setSelectedDate(dayBefore)} className="nav-btn">
              &larr; Previous
            </button>
            <div className="day-display">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
              />
              <div className="day-label">{selectedDateLabel}</div>
            </div>
            <button onClick={() => setSelectedDate(dayAfter)} className="nav-btn">
              Next &rarr;
            </button>
          </div>

          <div className="day-schedule">
            {dayInterviews.length === 0 ? (
              <div className="empty-schedule">No interviews scheduled for {selectedDateLabel}</div>
            ) : (
              <div className="interview-list">
                {SLOT_TIMES.map((time) => {
                  const atTime = dayInterviews.filter((app) => app.interview.time === time);
                  if (atTime.length === 0) return null;
                  return (
                    <div key={time} className="time-slot">
                      <div className="time-label">{time}</div>
                      <div className="time-interviews">
                        {atTime.map((app) => (
                          <div key={app.id} className={`interview-item ${app.interview?.completed ? 'completed' : ''}`}>
                            {app.interview?.completed && <div className="completed-badge">Completed</div>}
                            <div className="interview-left">
                              <div className="interview-name">{app.name}</div>
                              <div className="interview-job">{jobById(app.jobId)?.title} &middot; {jobById(app.jobId)?.client}</div>
                              <div className="interview-type">{app.interview.title}</div>
                            </div>
                            <div className="interview-recruiter">{app.interview.recruiter}</div>
                            <div className="interview-actions">
                              {app.interview?.completed ? (
                                <button className="btn-done">Done</button>
                              ) : (
                                <>
                                  <button className="btn-reschedule" onClick={() => onReschedule?.(app)}>Reschedule</button>
                                  <button className="btn-mark-done" onClick={() => onMarkDone?.(app)}>Mark Done</button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="schedule-week-view">
          <div className="week-nav">
            <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="nav-btn">
              ← Previous Week
            </button>
            <div className="week-label">Week of {formatDate(selectedDate)}</div>
            <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="nav-btn">
              Next Week →
            </button>
          </div>

          {weekInterviews.length === 0 ? (
            <div className="empty-schedule">No interviews scheduled for this week</div>
          ) : (
            <div className="week-grid">
              {weekInterviews.map((dayGroup) => (
                <div key={dayGroup.date} className="week-day">
                  <div className="week-day-label">{dayGroup.date}</div>
                  <div className="week-day-interviews">
                    {dayGroup.apps.map((app) => (
                      <div key={app.id} className={`week-interview-card ${app.interview?.completed ? 'completed' : ''}`}>
                        {app.interview?.completed && <div className="completed-badge-small">✓</div>}
                        <div className="week-interview-time">{app.interview.time}</div>
                        <div className="week-interview-candidate">{app.name}</div>
                        <div className="week-interview-position" title={jobById(app.jobId)?.title}>
                          {jobById(app.jobId)?.title}
                        </div>
                        <div className="week-interview-recruiter">{app.interview.recruiter}</div>
                        <div className="week-interview-actions">
                          {app.interview?.completed ? (
                            <button className="btn-small-done" title="Interview completed">Done</button>
                          ) : (
                            <>
                              <button className="btn-small" onClick={() => onReschedule?.(app)}>Reschedule</button>
                              <button className="btn-small-mark" onClick={() => onMarkDone?.(app)}>Done</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RECRUITER VIEW */}
      {viewMode === 'recruiter' && (
        <div className="schedule-recruiter-view">
          {recruiterSchedules.length === 0 ? (
            <div className="empty-schedule">No interviews scheduled</div>
          ) : (
            <div className="recruiter-list">
              {recruiterSchedules.map((group) => (
                <div key={group.recruiter} className="recruiter-group">
                  <div className="recruiter-header">
                    <div className="recruiter-name">{group.recruiter}</div>
                    <div className="recruiter-count">
                      {group.interviews.length} interview{group.interviews.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="recruiter-interviews">
                    {group.interviews
                      .sort(
                        (a, b) =>
                          new Date(`${a.interview.date} ${a.interview.time}`) -
                          new Date(`${b.interview.date} ${b.interview.time}`)
                      )
                      .map((app) => (
                        <div key={app.id} className={`recruiter-interview-row ${app.interview?.completed ? 'completed' : ''}`}>
                          <div className="row-date-time">
                            <div className="row-date">{app.interview.date}</div>
                            <div className="row-time">{app.interview.time}</div>
                            {app.interview?.completed && <div className="row-completed-badge">✓ Done</div>}
                          </div>
                          <div className="row-candidate">
                            <div className="row-name">{app.name}</div>
                            <div className="row-job">{jobById(app.jobId)?.title}</div>
                          </div>
                          <div className="row-interview-type">{app.interview.title}</div>
                          <div className="row-actions">
                            {app.interview?.completed ? (
                              <button className="btn-reschedule-small-done" title="Interview completed">Done</button>
                            ) : (
                              <>
                                <button className="btn-reschedule-small" onClick={() => onReschedule?.(app)}>Reschedule</button>
                                <button className="btn-reschedule-small-mark" onClick={() => onMarkDone?.(app)}>Done</button>
                              </>
                            )}
                          </div>
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
