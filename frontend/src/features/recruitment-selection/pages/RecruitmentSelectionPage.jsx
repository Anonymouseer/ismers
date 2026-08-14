import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import CandidateCard from '../components/CandidateCard';
import CandidateModal from '../components/CandidateModal';
import InterviewSchedules from '../components/InterviewSchedules';
import { APPLICATIONS, JOB_ORDERS, STAGES, PIPELINE_ORDER, jobById } from '../data/mockApplications';
import { fetchRecruitmentApplications } from '../services/RecruitmentSelectionService';
import './RecruitmentSelectionPage.css';

function buildInitialApplications() {
  return APPLICATIONS.map((raw, i) => {
    const idx = PIPELINE_ORDER.indexOf(raw.status);
    const alreadyPast = idx >= PIPELINE_ORDER.indexOf('interview') || raw.status === 'rejected';
    return {
      ...raw,
      id: `app-${i + 1}`,
      checklist: { requirements: alreadyPast, identity: alreadyPast, history: alreadyPast, reference: alreadyPast },
      docStatus: { resume: alreadyPast, certificate: alreadyPast, portfolio: alreadyPast },
      recruiterRating: 0,
    };
  });
}

export default function RecruitmentSelectionPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get('view') || 'pipeline'; // 'pipeline', 'schedules', 'evaluations'

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchRecruitmentApplications()
      .then((data) => {
        if (!cancelled) {
          const mapped = data.map((app, i) => ({
            ...app,
            id: app.id || `reg-${i + 1}`,
            checklist: app.checklist || { requirements: false, identity: false, history: false, reference: false },
            docStatus: app.docStatus || { resume: false, certificate: false, portfolio: false },
            recruiterRating: app.recruiterRating || 0,
          }));
          setApplications(mapped);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setApplications(buildInitialApplications());
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (jobFilter !== 'all' && app.jobId !== jobFilter) return false;
      if (scoreFilter === 'high' && app.score < 85) return false;
      if (scoreFilter === 'mid' && (app.score < 70 || app.score >= 85)) return false;
      if (scoreFilter === 'low' && app.score >= 70) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const job = jobById(app.jobId);
        const nameMatch = app.name && app.name.toLowerCase().includes(q);
        const jobMatch = job && job.title.toLowerCase().includes(q);
        if (!nameMatch && !jobMatch) return false;
      }
      return true;
    });
  }, [applications, search, jobFilter, scoreFilter]);

  function updateApplication(id, updater) {
    setApplications((prev) => prev.map((a) => (a.id === id ? updater(a) : a)));
  }

  const selectedApp = selectedId ? applications.find((a) => a.id === selectedId) : null;
  const selectedJob = selectedApp ? jobById(selectedApp.jobId) : null;

  const handleReschedule = (app) => {
    setSelectedId(app.id);
  };

  const handleMarkDone = (app) => {
    updateApplication(app.id, (a) => {
      const completedAt = new Date().toLocaleDateString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
      });

      // Determine whether this interview advances the pipeline stage
      const advancesToClientInterview = a.status === 'area_manager';

      const newNotes = [
        {
          text: `${a.interview.title} completed with ${a.interview.recruiter}. Interview result: Passed.`,
          meta: `System · ${completedAt}`,
        },
        ...(advancesToClientInterview
          ? [{
              text: 'Area Manager 2nd Interview passed. Applicant automatically advanced to Client Final Interview.',
              meta: `System · ${completedAt}`,
            }]
          : []),
        ...a.notes,
      ];

      return {
        ...a,
        // Mark the interview as completed
        interview: { ...a.interview, completed: true, completedAt },
        // Advance the pipeline stage when applicable
        status: advancesToClientInterview ? 'client_interview' : a.status,
        notes: newNotes,
      };
    });
  };

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>

        <div className="title-row">
          <h1 className="page-title">Recruitment &amp; Selection</h1>
          <div className="page-sub">
            {viewMode === 'pipeline'
              ? `${filtered.length} applications in the pipeline`
              : viewMode === 'schedules'
              ? 'Interview schedules and timeline'
              : 'Candidate evaluations and assessments'}
          </div>
        </div>

        {viewMode === 'pipeline' && (
          <>
            <div className="filter-bar">
              <div className="filter-search">
                <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="chip" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
                <option value="all">All Job Orders</option>
                {JOB_ORDERS.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} — {j.client}</option>
                ))}
              </select>
              <select className="chip" value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
                <option value="all">Any AI Score</option>
                <option value="high">80+ (Strong match)</option>
                <option value="mid">60–79 (Moderate match)</option>
                <option value="low">Below 60</option>
              </select>
            </div>

            <div className="board-wrap">
              <div className="board">
                {STAGES.map((stage) => {
                  const stageApps = filtered.filter((a) => a.status === stage.key);
                  return (
                    <div className="col" key={stage.key}>
                      <div className="col-head">
                        <div className="col-dot" style={{ background: stage.dot }} />
                        <div className="col-title">{stage.label}</div>
                        <div className="col-count">{stageApps.length}</div>
                      </div>
                      <div className="col-body">
                        {stageApps.length ? (
                          stageApps.map((a) => (
                            <CandidateCard key={a.id} app={a} job={jobById(a.jobId)} onSelect={() => setSelectedId(a.id)} />
                          ))
                        ) : (
                          <div className="col-empty">No applicants here</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {viewMode === 'schedules' && (
          <InterviewSchedules applications={applications} onReschedule={handleReschedule} onMarkDone={handleMarkDone} />
        )}

        {viewMode === 'evaluations' && (
          <div className="evaluations-view">
            <div className="eval-header-bar">
              <div className="eval-header-title">Candidate Evaluations</div>
              <div className="eval-header-sub">{applications.length} candidates across all pipeline stages</div>
            </div>

            <div className="eval-table-wrap">
              <table className="eval-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Job Position</th>
                    <th>Client</th>
                    <th>Pipeline Stage</th>
                    <th>AI Score</th>
                    <th>Skills</th>
                    <th>Experience</th>
                    <th>Screening</th>
                    <th>Availability</th>
                    <th>Recruiter Rating</th>
                    <th>Evaluation Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((app) => {
                      const job = jobById(app.jobId);
                      const stage = STAGES.find((s) => s.key === app.status);
                      const scoreClass = app.score >= 85 ? 'high' : app.score >= 70 ? 'mid' : 'low';
                      const evalStatus = (() => {
                        if (app.status === 'for_deployment') return { label: 'Cleared for Deployment', cls: 'eval-status-green' };
                        if (app.status === 're_pooling') return { label: 'Re-Pool (Line Up)', cls: 'eval-status-red' };
                        if (app.status === 'contract_signing') return { label: 'Contract & Orientation', cls: 'eval-status-purple' };
                        if (app.status === 'hr_requirements') return { label: 'HR Pre-Employment', cls: 'eval-status-amber' };
                        if (app.status === 'client_interview') return { label: 'Client Interview Pending', cls: 'eval-status-blue' };
                        if (app.status === 'area_manager') return { label: '2nd Interview Pending', cls: 'eval-status-blue' };
                        return { label: 'Initial Screening', cls: 'eval-status-muted' };
                      })();
                      return (
                        <tr key={app.id} onClick={() => setSelectedId(app.id)} className="eval-row">
                          <td>
                            <div className="eval-cand-cell">
                              <div className="eval-avatar">{app.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
                              <div>
                                <div className="eval-cand-name">{app.name}</div>
                                <div className="eval-cand-sub">{app.location} · {app.applied}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="eval-job-title">{app.jobTitle || job?.title || '—'}</span></td>
                          <td><span className="eval-client">{app.client || job?.client || '—'}</span></td>
                          <td>
                            <span className="eval-stage-dot" style={{ background: stage?.dot }} />
                            <span className="eval-stage-label">{stage?.label || app.status}</span>
                          </td>
                          <td><span className={`eval-score ${scoreClass}`}>{app.score}</span></td>
                          <td><div className="eval-mini-bar"><div className="eval-mini-fill" style={{ width: `${app.breakdown.skills}%`, background: app.breakdown.skills >= 85 ? 'var(--green)' : app.breakdown.skills >= 70 ? 'var(--amber)' : 'var(--red)' }} /><span>{app.breakdown.skills}</span></div></td>
                          <td><div className="eval-mini-bar"><div className="eval-mini-fill" style={{ width: `${app.breakdown.experience}%`, background: app.breakdown.experience >= 85 ? 'var(--green)' : app.breakdown.experience >= 70 ? 'var(--amber)' : 'var(--red)' }} /><span>{app.breakdown.experience}</span></div></td>
                          <td><div className="eval-mini-bar"><div className="eval-mini-fill" style={{ width: `${app.breakdown.screening}%`, background: app.breakdown.screening >= 85 ? 'var(--green)' : app.breakdown.screening >= 70 ? 'var(--amber)' : 'var(--red)' }} /><span>{app.breakdown.screening}</span></div></td>
                          <td><div className="eval-mini-bar"><div className="eval-mini-fill" style={{ width: `${app.breakdown.availability}%`, background: app.breakdown.availability >= 85 ? 'var(--green)' : app.breakdown.availability >= 70 ? 'var(--amber)' : 'var(--red)' }} /><span>{app.breakdown.availability}</span></div></td>
                          <td>
                            <div className="eval-stars">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <span key={n} className={`eval-star ${n <= app.recruiterRating ? 'filled' : ''}`}>&#9733;</span>
                              ))}
                              {app.recruiterRating > 0 && <span className="eval-rating-num">{app.recruiterRating}/5</span>}
                            </div>
                          </td>
                          <td><span className={`eval-status-badge ${evalStatus.cls}`}>{evalStatus.label}</span></td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedApp && (
        <CandidateModal
          app={selectedApp}
          job={selectedJob}
          applications={applications}
          onClose={() => setSelectedId(null)}
          onUpdate={updateApplication}
        />
      )}
    </div>
  );
}