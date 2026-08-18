import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import CandidateCard from '../components/CandidateCard';
import CandidateModal from '../components/CandidateModal';
import { APPLICATIONS, JOB_ORDERS, STAGES, PIPELINE_ORDER, jobById } from '../data/mockApplications';
import { fetchRecruitmentApplications, updateRecruitmentStage, updateRecruitmentScreening, getStoredStages, saveStoredStage, saveCachedApplications } from '../services/RecruitmentSelectionService';
import { targetById, computeMatchScore } from '../../applicant-registration/services/ApplicantRegistrationService';
import { initials, scoreClass, assignedRecruiter, findNextAvailableSlot, addDays, formatDate } from '../utils/recruitmentUtils';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../../../utils/realtimeSync';
import './RecruitmentSelectionPage.css';

/** Stage-specific metadata for the single-stage table view banners. */
const STAGE_PAGE_META = {
  pooling: {
    title: 'Pooling and Initial Screening',
    sub: 'Candidates logged by security guard and front desk. Resumes screened and categorized for initial pooling.',
  },
  area_manager: {
    title: 'Area Manager 2nd Interview',
    sub: 'Candidates endorsed by recruitment for evaluation and 2nd interview with the Area Manager or Supervisor.',
  },
  client_interview: {
    title: 'Client Final Interview',
    sub: 'Candidates endorsed by Area Manager for the final client interview via Zoom or in-person at the client site.',
  },
  hr_requirements: {
    title: 'HR Pre-Employment Requirements',
    sub: 'Candidates who passed client interview. Currently completing NBI clearance, medical fit-to-work, and other pre-employment documents.',
  },
  contract_signing: {
    title: 'Orientation and Contract Signing',
    sub: 'Candidates cleared for orientation, contract signing, and ID processing before deployment.',
  },
  for_deployment: {
    title: 'For Deployment',
    sub: 'Candidates fully cleared, contracts signed, and ready to be deployed to assigned client sites.',
  },
  re_pooling: {
    title: 'Re-Pooling (Line Up)',
    sub: 'Candidates returned to pooling after unsuccessful client interview. Lined up for reassignment to other client job orders.',
  },
};

const STAGE_ADVANCE_INFO = {
  pooling: { next: 'area_manager', label: 'Endorse to Area Mgr' },
  area_manager: { next: 'client_interview', label: 'Send Endorsement to Client' },
  client_interview: { next: 'hr_requirements', label: 'Pass to HR Req.' },
  hr_requirements: { next: 'contract_signing', label: 'Proceed to Contract' },
  contract_signing: { next: 'for_deployment', label: 'Mark For Deployment' },
  re_pooling: { next: 'pooling', label: 'Re-assign to Pooling' },
};

function buildInitialApplications() {
  const stored = getStoredStages();
  return APPLICATIONS.map((raw, i) => {
    const id = `app-${i + 1}`;
    const status = stored[id] || stored[raw.name] || raw.status;
    const idx = PIPELINE_ORDER.indexOf(status);
    const alreadyPast = idx >= PIPELINE_ORDER.indexOf('interview') || status === 'rejected';
    return {
      ...raw,
      id,
      status,
      checklist: { requirements: alreadyPast, identity: alreadyPast, history: alreadyPast, reference: alreadyPast },
      docStatus: { resume: alreadyPast, certificate: alreadyPast, portfolio: alreadyPast },
      recruiterRating: 0,
    };
  });
}

export default function RecruitmentSelectionPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [searchParams] = useSearchParams();
  const stageFilter = searchParams.get('stage') || null;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const loadData = () => {
      return fetchRecruitmentApplications()
        .then((data) => {
          if (!cancelled && data?.length) {
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
    };

    loadData();

    // Zero-latency (0ms) real-time cross-tab and cross-module synchronization
    const handleSyncMessage = (data) => {
      if (!data) return;

      if (data.type === 'ENDORSEMENT_STATUS_CHANGED') {
        const { candidateId, dbId, regId, name, status, stage, interview } = data.payload || {};
        const cleanCandId = candidateId ? String(candidateId).replace(/^cand-/, '') : '';

        setApplications((prev) => {
          const updated = prev.map((app) => {
            const matches =
              (dbId && String(app.id) === String(dbId)) ||
              (regId && app.regId && app.regId.toLowerCase() === regId.toLowerCase()) ||
              (name && app.name && app.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
              (cleanCandId && (String(app.id) === cleanCandId || (app.regId && app.regId.toLowerCase() === cleanCandId.toLowerCase()))) ||
              (candidateId && (String(app.id) === String(candidateId) || app.name === candidateId));
            if (matches) {
              const newStatus = stage || ((status === 'Passed Interview' || status === 'Passed Client Interview')
                ? 'hr_requirements'
                : (status === 'Declined' ? 're_pooling' : app.status));
              
              saveStoredStage(app.id, newStatus);
              if (app.regId) saveStoredStage(app.regId, newStatus);
              if (app.name) saveStoredStage(app.name, newStatus);

              return {
                ...app,
                status: newStatus,
                clientEndorsementStatus: status,
                interview: interview !== undefined ? interview : app.interview,
              };
            }
            return app;
          });
          saveCachedApplications(updated);
          return updated;
        });
      } else if (data.type === 'STAGE_CHANGED') {
        const { candidateId, dbId, regId, name, stage } = data.payload || {};
        const cleanCandId = candidateId ? String(candidateId).replace(/^cand-/, '') : '';

        setApplications((prev) => {
          const updated = prev.map((app) => {
            const matches =
              (dbId && String(app.id) === String(dbId)) ||
              (regId && app.regId && app.regId.toLowerCase() === regId.toLowerCase()) ||
              (name && app.name && app.name.toLowerCase().trim() === name.toLowerCase().trim()) ||
              (cleanCandId && (String(app.id) === cleanCandId || (app.regId && app.regId.toLowerCase() === cleanCandId.toLowerCase()))) ||
              (candidateId && (String(app.id) === String(candidateId) || app.name === candidateId));
            if (matches) {
              return { ...app, status: stage };
            }
            return app;
          });
          saveCachedApplications(updated);
          return updated;
        });
      }
    };

    const unsubscribe = subscribeRealtimeEvents(handleSyncMessage);

    // Silent revalidation on tab focus
    const handleFocusRevalidate = () => {
      fetchRecruitmentApplications()
        .then((data) => {
          if (!cancelled && data?.length) {
            setApplications((prev) => {
              return prev.map((curr) => {
                const remote = data.find((d) => (d.id && String(d.id) === String(curr.id)) || (d.name && d.name === curr.name));
                if (!remote) return curr;
                return {
                  ...curr,
                  ...remote,
                  preEmploymentChecklist: {
                    ...(remote.preEmploymentChecklist || {}),
                    ...(curr.preEmploymentChecklist || {}),
                  },
                  statutoryNumbers: {
                    ...(remote.statutoryNumbers || {}),
                    ...(curr.statutoryNumbers || {}),
                  },
                  medicalReferral: curr.medicalReferral || remote.medicalReferral || null,
                };
              });
            });
          }
        })
        .catch(() => {});
    };

    window.addEventListener('focus', handleFocusRevalidate);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('focus', handleFocusRevalidate);
    };
  }, []);

  const filtered = useMemo(() => {
    return applications.filter((app) => {
      const targetJob = targetById(app.jobId) || targetById(app.targetJobId) || jobById(app.jobId);
      const appScore = targetJob ? computeMatchScore(app, targetJob) : (app.score ?? 0);

      if (stageFilter && app.status !== stageFilter) return false;
      if (jobFilter !== 'all' && app.jobId !== jobFilter) return false;
      if (scoreFilter === 'high' && appScore < 70) return false;
      if (scoreFilter === 'mid' && (appScore < 40 || appScore >= 70)) return false;
      if (scoreFilter === 'low' && appScore >= 40) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const job = targetJob || jobById(app.jobId);
        const nameMatch = app.name && app.name.toLowerCase().includes(q);
        const jobMatch = job && job.title.toLowerCase().includes(q);
        if (!nameMatch && !jobMatch) return false;
      }
      return true;
    });
  }, [applications, search, jobFilter, scoreFilter, stageFilter]);

  function updateApplication(id, updater) {
    setApplications((prev) => {
      const next = prev.map((a) => (String(a.id) === String(id) || (a.regId && a.regId === id) || a.name === id ? updater(a) : a));
      saveCachedApplications(next);
      return next;
    });
  }

  function handleAdvance(appId) {
    const targetApp = applications.find((a) => a.id === appId);
    if (!targetApp) return;
    const currentIdx = PIPELINE_ORDER.indexOf(targetApp.status);
    const nextKey = currentIdx !== -1 ? PIPELINE_ORDER[currentIdx + 1] : (targetApp.status === 're_pooling' ? 'pooling' : null);
    if (!nextKey) return;

    const isResettingToReview = targetApp.status === 're_pooling' || nextKey === 'pooling' || nextKey === 'client_interview';
    const nextCpStatus = isResettingToReview ? 'Pending Review' : (targetApp.clientEndorsementStatus || 'Pending Review');

    if (isResettingToReview) {
      try {
        localStorage.setItem(`cp_endorsement_${targetApp.name}`, 'Pending Review');
        localStorage.setItem(`cp_endorsement_${targetApp.id}`, 'Pending Review');
        localStorage.setItem(`cp_endorsement_cand-${targetApp.id}`, 'Pending Review');
        if (targetApp.regId) {
          localStorage.setItem(`cp_endorsement_cand-${targetApp.regId}`, 'Pending Review');
          localStorage.setItem(`cp_endorsement_${targetApp.regId}`, 'Pending Review');
        }
      } catch (e) {}
    }

    let autoScheduledInterview = targetApp.interview;
    if (nextKey === 'area_manager' && !targetApp.interview) {
      const job = targetById(targetApp.jobId) || targetById(targetApp.targetJobId) || jobById(targetApp.jobId);
      const recruiter = assignedRecruiter(job) || 'Area Supervisor';
      const searchFrom = addDays(new Date(), 1);
      const slot = findNextAvailableSlot(applications, recruiter, searchFrom);
      if (slot) {
        autoScheduledInterview = {
          title: 'Area Manager 2nd Interview',
          date: slot.date,
          time: slot.time,
          recruiter,
        };
      }
    }

    updateApplication(appId, (a) => {
      let notes = a.notes || [];
      const nextStageObj = STAGES.find((s) => s.key === nextKey);
      const nextStageLabel = nextStageObj?.label || nextKey;
      const extraNote = autoScheduledInterview
        ? ` · Interview auto-scheduled: ${autoScheduledInterview.date} at ${autoScheduledInterview.time}`
        : '';
      notes = [
        {
          text: `Advanced to ${nextStageLabel}${isResettingToReview ? ' (Endorsement status reset to Pending Review)' : ''}${extraNote}`,
          meta: `System · ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`,
        },
        ...notes,
      ];
      return {
        ...a,
        status: nextKey,
        clientEndorsementStatus: nextCpStatus,
        interview: autoScheduledInterview || a.interview,
        notes,
      };
    });

    saveStoredStage(appId, nextKey);
    if (targetApp.regId) saveStoredStage(targetApp.regId, nextKey);
    if (targetApp.name) saveStoredStage(targetApp.name, nextKey);

    const persistId = targetApp.regId || targetApp.id || appId;
    updateRecruitmentStage(persistId, nextKey, null, targetApp.name).catch((err) => {
      console.warn('Could not persist recruitment stage to backend:', err);
    });

    if (autoScheduledInterview) {
      updateRecruitmentScreening(persistId, { interview_schedule: autoScheduledInterview }, targetApp.name).catch(() => {});
    }

    if (isResettingToReview) {
      updateRecruitmentScreening(persistId, { client_endorsement_status: 'Pending Review' }, targetApp.name).catch(() => {});
      broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
        candidateId: appId,
        dbId: targetApp.id,
        regId: targetApp.regId,
        name: targetApp.name,
        status: 'Pending Review',
        stage: nextKey,
      });
    }

    // 0ms instant broadcast to Client Portal and other tabs
    broadcastRealtimeEvent('STAGE_CHANGED', {
      candidateId: appId,
      dbId: targetApp.id,
      regId: targetApp.regId,
      name: targetApp.name,
      stage: nextKey,
      applicant: { ...targetApp, status: nextKey, clientEndorsementStatus: nextCpStatus },
    });
  }

  const selectedApp = selectedId ? applications.find((a) => a.id === selectedId) : null;
  const selectedJob = selectedApp ? jobById(selectedApp.jobId) : null;

  const activeStage = stageFilter ? STAGES.find((s) => s.key === stageFilter) : null;
  const stageMeta = stageFilter ? STAGE_PAGE_META[stageFilter] : null;
  const subtitle = activeStage
    ? `${filtered.length} applicant${filtered.length !== 1 ? 's' : ''} in ${activeStage.label}`
    : `${filtered.length} applications in the pipeline`;

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>

        <div className="title-row">
          <h1 className="page-title">Recruitment &amp; Selection</h1>
          <div className="page-sub">{subtitle}</div>
        </div>

        {/* ===== FULL PIPELINE KANBAN BOARD (no stage selected) ===== */}
        {!stageFilter && (
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
                <option value="high">70%+ (Strong match)</option>
                <option value="mid">40–69% (Moderate match)</option>
                <option value="low">Below 40%</option>
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

        {/* ===== SINGLE STAGE TABLE VIEW (specific stage selected) ===== */}
        {stageFilter && (
          <div className="single-stage-page">
            <div className="rs-stage-banner">
              <div className="rs-stage-banner-info">
                <div className="rs-stage-banner-title">
                  <span className="rs-stage-dot" style={{ background: activeStage?.dot }} />
                  {stageMeta?.title || activeStage?.label}
                  <span className="rs-stage-badge">{filtered.length} Applicant{filtered.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="rs-stage-banner-sub">{stageMeta?.sub}</div>
              </div>
            </div>

            <div className="filter-bar">
              <div className="filter-search">
                <svg className="icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                <input
                  type="text"
                  placeholder="Search in this stage..."
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
                <option value="high">70%+ (Strong match)</option>
                <option value="mid">40–69% (Moderate match)</option>
                <option value="low">Below 40%</option>
              </select>
            </div>

            <div className="rs-stage-table-container">
              {filtered.length > 0 ? (
                <table className="rs-stage-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Matched Job Order</th>
                      <th>AI Score</th>
                      <th>
                        {stageFilter === 'hr_requirements'
                          ? 'Pre-Employment Clearances'
                          : stageFilter === 'contract_signing'
                          ? 'Onboarding & Contract Status'
                          : stageFilter === 'for_deployment'
                          ? 'Deployment Readiness'
                          : stageFilter === 're_pooling'
                          ? 'Pooling & Line-Up Status'
                          : 'Interview & Endorsement Status'}
                      </th>
                      <th>Applied Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered
                      .slice()
                      .sort((a, b) => {
                        const jobA = targetById(a.jobId) || targetById(a.targetJobId) || jobById(a.jobId);
                        const jobB = targetById(b.jobId) || targetById(b.targetJobId) || jobById(b.jobId);
                        const scoreA = jobA ? computeMatchScore(a, jobA) : (a.score ?? 0);
                        const scoreB = jobB ? computeMatchScore(b, jobB) : (b.score ?? 0);
                        return scoreB - scoreA;
                      })
                      .map((app) => {
                        const job = targetById(app.jobId) || targetById(app.targetJobId) || jobById(app.jobId);
                        const currentScore = job ? computeMatchScore(app, job) : (app.score ?? 0);
                        const cls = scoreClass(currentScore);
                        const isClientInterview = app.status === 'client_interview';

                        const cpStatus =
                          (app.clientEndorsementStatus && app.clientEndorsementStatus !== 'Pending Review')
                            ? app.clientEndorsementStatus
                            : (localStorage.getItem(`cp_endorsement_${app.name}`) ||
                               localStorage.getItem(`cp_endorsement_cand-${app.id}`) ||
                               (app.regId && localStorage.getItem(`cp_endorsement_cand-${app.regId}`)) ||
                               localStorage.getItem(`cp_endorsement_${app.id}`) ||
                               (app.regId && localStorage.getItem(`cp_endorsement_${app.regId}`)) ||
                               app.clientEndorsementStatus ||
                               'Pending Review');

                        let interviewLabel = 'Not scheduled';
                        let statusClass = 'none';

                        if (isClientInterview || app.status === 'hr_requirements') {
                          if (cpStatus === 'Passed Interview' || cpStatus === 'Passed Client Interview') {
                            interviewLabel = 'Passed Client Final Interview';
                            statusClass = 'passed';
                          } else if (cpStatus === 'Accepted for Interview') {
                            interviewLabel = app.interview?.date
                              ? `Accepted · ${app.interview.date} at ${app.interview.time}`
                              : 'Accepted for Interview';
                            statusClass = 'accepted';
                          } else if (cpStatus === 'Declined') {
                            interviewLabel = 'Declined by Client';
                            statusClass = 'declined';
                          } else {
                            interviewLabel = 'Sent Endorsement to Client';
                            statusClass = 'endorsed';
                          }
                        } else if (app.interview) {
                          interviewLabel = app.interview.completed
                            ? `Completed ${app.interview.completedAt || ''}`
                            : `${app.interview.date} at ${app.interview.time}`;
                          statusClass = app.interview.completed ? 'completed' : 'scheduled';
                        }
                        return (
                          <tr key={app.id} onClick={() => setSelectedId(app.id)} className="rs-stage-table-row">
                            <td className="cell-name">
                              <div className="rs-table-user-wrap">
                                <div className="rs-table-user-avatar">{initials(app.name)}</div>
                                <div>
                                  <div className="rs-table-user-name">{app.name}</div>
                                  <div className="rs-table-user-sub">{app.location}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span className="rs-table-job-title" style={{ fontWeight: 600, color: 'var(--text)' }}>
                                  {app.jobTitle || job?.title || 'Unassigned'}
                                </span>
                                <span className="rs-table-client" style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                  {app.client || job?.client || '\u2014'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className={`score-badge ${cls}`}>{currentScore}%</span>
                            </td>
                            <td>
                              {(() => {
                                if (app.status === 'hr_requirements') {
                                  const preChecklist = app.preEmploymentChecklist || {};
                                  const preCount = Object.values(preChecklist).filter(Boolean).length;
                                  const isFullyCleared = preCount === 7;
                                  if (isFullyCleared) {
                                    return (
                                      <span className="rs-interview-status passed">
                                        ✓ 7/7 Clearances Verified
                                      </span>
                                    );
                                  }
                                  if (app.medicalReferral) {
                                    return (
                                      <span className="rs-interview-status scheduled" style={{ color: 'var(--primary)', borderColor: 'rgba(0,125,204,0.3)', background: 'var(--blue-soft, #e0f2fe)' }}>
                                        {preCount}/7 · Med Referral Issued
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="rs-interview-status none" style={{ color: 'var(--amber, #d97706)', background: 'var(--amber-soft, #fef3c7)' }}>
                                      {preCount}/7 Clearances Pending
                                    </span>
                                  );
                                }

                                if (app.status === 'contract_signing') {
                                  const isContractSigned = Boolean(app?.employmentContract?.status === 'Signed');
                                  const isOrientationDone = Boolean(
                                    app?.orientationModules?.status === 'Certified Completed' ||
                                    (app?.orientationModules && Object.values(app.orientationModules).filter((v) => typeof v === 'boolean' && v).length >= 5)
                                  );
                                  if (isContractSigned && isOrientationDone) {
                                    return (
                                      <span className="rs-interview-status passed">
                                        ✓ E-Signed &bull; PDOS Certified
                                      </span>
                                    );
                                  }
                                  if (isContractSigned) {
                                    return (
                                      <span className="rs-interview-status scheduled" style={{ color: 'var(--primary)', background: 'var(--blue-soft, #e0f2fe)' }}>
                                        ✓ E-Signed &bull; Awaiting PDOS
                                      </span>
                                    );
                                  }
                                  if (isOrientationDone) {
                                    return (
                                      <span className="rs-interview-status scheduled" style={{ color: 'var(--primary)', background: 'var(--blue-soft, #e0f2fe)' }}>
                                        ✓ PDOS Certified &bull; Awaiting Sign
                                      </span>
                                    );
                                  }
                                  return (
                                    <span className="rs-interview-status none" style={{ color: 'var(--amber, #d97706)', background: 'var(--amber-soft, #fef3c7)' }}>
                                      Pending E-Signature &amp; PDOS
                                    </span>
                                  );
                                }

                                if (app.status === 'for_deployment') {
                                  return (
                                    <span className="rs-interview-status passed">
                                      ✓ Ready for Site Handover
                                    </span>
                                  );
                                }

                                if (app.status === 're_pooling') {
                                  return (
                                    <span className="rs-interview-status declined" style={{ background: 'rgba(217, 119, 6, 0.14)', color: 'var(--amber, #d97706)', borderColor: 'rgba(217, 119, 6, 0.3)' }}>
                                      Declined by Client &bull; Ready for Re-Line Up
                                    </span>
                                  );
                                }

                                return (
                                  <span className={`rs-interview-status ${statusClass}`}>
                                    {interviewLabel}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="cell-date">{app.applied}</td>
                            <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                              <div className="rs-table-actions-flex">
                                <button
                                  className="rs-stage-btn"
                                  onClick={() => setSelectedId(app.id)}
                                >
                                  View Profile
                                </button>
                                {STAGE_ADVANCE_INFO[app.status] && (() => {
                                  const isHrReq = app.status === 'hr_requirements';
                                  const preChecklist = app.preEmploymentChecklist || {};
                                  const preCount = Object.values(preChecklist).filter(Boolean).length;
                                  const isFullyCleared = preCount === 7;

                                  if (isHrReq) {
                                    return (
                                      <button
                                        className={`rs-stage-btn ${isFullyCleared ? 'advance' : ''}`}
                                        style={isFullyCleared ? { background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' } : { color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                        onClick={() => {
                                          if (isFullyCleared) {
                                            handleAdvance(app.id);
                                          } else {
                                            setSelectedId(app.id);
                                          }
                                        }}
                                      >
                                        {isFullyCleared ? 'Proceed to Contract →' : `Verify Clearances (${preCount}/7) →`}
                                      </button>
                                    );
                                  }

                                  const isContractSigning = app.status === 'contract_signing';
                                  if (isContractSigning) {
                                    const isContractSigned = Boolean(app?.employmentContract?.status === 'Signed');
                                    const isOrientationDone = Boolean(
                                      app?.orientationModules?.status === 'Certified Completed' ||
                                      (app?.orientationModules && Object.values(app.orientationModules).filter((v) => typeof v === 'boolean' && v).length >= 5)
                                    );
                                    const isReadyForDeployment = isContractSigned && isOrientationDone;

                                    return (
                                      <button
                                        className={`rs-stage-btn ${isReadyForDeployment ? 'advance' : ''}`}
                                        style={isReadyForDeployment ? { background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' } : { color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                        onClick={() => {
                                          if (isReadyForDeployment) {
                                            handleAdvance(app.id);
                                          } else {
                                            setSelectedId(app.id);
                                          }
                                        }}
                                      >
                                        {isReadyForDeployment ? 'Deploy Candidate →' : isContractSigned ? 'Conduct PDOS (Briefing) →' : 'E-Sign Contract →'}
                                      </button>
                                    );
                                  }

                                  const isForDeployment = app.status === 'for_deployment';
                                  if (isForDeployment) {
                                    return (
                                      <button
                                        className="rs-stage-btn advance"
                                        style={{ background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' }}
                                        onClick={() => setSelectedId(app.id)}
                                      >
                                        Pre-Deployment Hub &rarr;
                                      </button>
                                    );
                                  }

                                  return (
                                    <button
                                      className="rs-stage-btn advance"
                                      onClick={() => handleAdvance(app.id)}
                                    >
                                      {STAGE_ADVANCE_INFO[app.status].label} →
                                    </button>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              ) : (
                <div className="rs-empty-stage-box">
                  No applicants currently in this stage matching your filter criteria.
                </div>
              )}
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
