import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import CandidateCard from '../components/CandidateCard';
import CandidateModal from '../components/CandidateModal';
import { APPLICATIONS, JOB_ORDERS, STAGES, PIPELINE_ORDER, jobById } from '../data/mockApplications';
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
  const [applications, setApplications] = useState(buildInitialApplications);
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      if (jobFilter !== 'all' && app.jobId !== jobFilter) return false;
      if (scoreFilter === 'high' && app.matchScore < 85) return false;
      if (scoreFilter === 'mid' && (app.matchScore < 70 || app.matchScore >= 85)) return false;
      if (scoreFilter === 'low' && app.matchScore >= 70) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const job = jobById(app.jobId);
        const nameMatch = app.applicantName.toLowerCase().includes(q);
        const jobMatch = job && job.title.toLowerCase().includes(q);
        const skillsMatch = app.skills.some((s) => s.toLowerCase().includes(q));
        if (!nameMatch && !jobMatch && !skillsMatch) return false;
      }
      return true;
    });
  }, [applications, search, jobFilter, scoreFilter]);

  function updateApplication(id, updater) {
    setApplications((prev) => prev.map((a) => (a.id === id ? updater(a) : a)));
  }

  const selectedApp = selectedId ? applications.find((a) => a.id === selectedId) : null;
  const selectedJob = selectedApp ? jobById(selectedApp.jobId) : null;

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>

        <div className="title-row">
          <h1 className="page-title">Recruitment &amp; Selection</h1>
          <div className="page-sub">{filtered.length} applications in the pipeline</div>
        </div>

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