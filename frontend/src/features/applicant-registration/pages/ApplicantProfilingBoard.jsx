import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DispatchStrip from '../components/DispatchStrip';
import BoardColumn from '../components/BoardColumn';
import CandidateCard from '../components/CandidateCard';
import ProfileDrawer from '../components/ProfileDrawer';
import RoleSwitcher from '../components/RoleSwitcher';
import RegisterApplicantPage from './RegisterApplicantPage';
import {
  COLUMN_ORDER, STAGE_META, STATUS_META, JOB_TARGETS, CATEGORIES, boardColumn,
  hasPermission, targetById, initials,
} from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
import './ApplicantRegistrationBoard.css';

const STAGE_PAGE_META = {
  registered: {
    title: 'Stage 1: Registered Applicants',
    sub: 'Newly intake applicants awaiting initial profiling assessment and document verification.',
    btnLabel: 'Start Profiling',
    nextStage: 'profiling',
  },
  profiling: {
    title: 'Stage 2: Profiling Applicants',
    sub: 'Applicants currently undergoing skills verification, document uploads, and job target matching.',
    btnLabel: 'Mark Profiled (Ready)',
    nextStage: 'profiled',
  },
  profiled: {
    title: 'Stage 3: Profiled — Ready Applicants',
    sub: 'Fully profiled and verified applicants qualified and ready for job order placement.',
    btnLabel: 'Send to Recruitment',
    nextStage: 'sent',
  },
  sent: {
    title: 'Stage 4: Sent to Recruitment',
    sub: 'Applicants handed off to Recruitment & Selection for screening, interviews, and client deployment.',
    btnLabel: 'View in Recruitment',
    nextStage: null,
  },
};

export default function ApplicantProfilingBoard() {
  const { candidates, role, setRole, startProfiling, completeProfile, sendToRecruitment, updateStage } = useApplicantRegistration();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get('view') || 'all';

  const [viewMode, setViewMode] = useState(initialView);
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [openRegId, setOpenRegId] = useState(null);
  const [boardWarning, setBoardWarning] = useState('');

  useEffect(() => {
    const v = searchParams.get('view') || 'all';
    setViewMode(v);
  }, [searchParams]);

  const handleViewChange = (newView) => {
    setViewMode(newView);
    if (newView === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ view: newView });
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpenRegId(null);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((c) => {
      const matchesQ = !q || c.name.toLowerCase().includes(q);
      const matchesJob = jobFilter === 'all' || c.targetJobId === jobFilter;
      const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
      return matchesQ && matchesJob && matchesCategory;
    });
  }, [candidates, search, jobFilter, categoryFilter]);

  const counts = useMemo(() => {
    const base = { registered: 0, profiling: 0, profiled: 0, sent: 0 };
    candidates.forEach((c) => {
      base[boardColumn(c)] += 1;
    });
    return base;
  }, [candidates]);

  const flashBoardWarning = (msg) => {
    setBoardWarning(msg);
    setTimeout(() => setBoardWarning(''), 5000);
  };

  const handleAdvanceStage = async (regId, currentStage) => {
    let result;
    if (currentStage === 'registered') {
      result = await startProfiling(regId);
    } else if (currentStage === 'profiling') {
      result = await completeProfile(regId);
    } else if (currentStage === 'profiled') {
      result = await sendToRecruitment(regId);
    } else {
      result = await updateStage(regId, currentStage);
    }

    if (result && result.ok === false) {
      flashBoardWarning(result.message);
      setOpenRegId(regId);
    }
  };

  return (
    <div className="arp-page">
      <div className="title-row">
        <div>
          <div className="eyebrow">Core 1 · Applicant Registration &amp; Profiling</div>
          <h1 className="page-title">
            {viewMode === 'all' && 'Applicant Intake & Profiling Board'}
            {viewMode === 'register' && 'Register New Applicant'}
            {viewMode !== 'all' && viewMode !== 'register' && STAGE_PAGE_META[viewMode]?.title}
          </h1>
          <div className="page-sub">
            {candidates.length} applicants registered · {counts.sent} sent to Recruitment &amp; Selection
          </div>
        </div>

        <div className="title-row-actions">
          <RoleSwitcher role={role} onChange={setRole} />

          {viewMode !== 'register' && (
            <button
              className="stage-btn go"
              onClick={() => handleViewChange('register')}
              style={{ whiteSpace: 'nowrap' }}
            >
              + Register Applicant
            </button>
          )}
        </div>
      </div>

      {boardWarning && (
        <div className="board-warning-banner">
          <span>{boardWarning}</span>
          <button type="button" className="close-warning" onClick={() => setBoardWarning('')}>✕</button>
        </div>
      )}

      <DispatchStrip counts={counts} total={candidates.length} />

      {viewMode === 'register' ? (
        <div className="single-stage-page">
          <RegisterApplicantPage embedded={true} onDone={() => handleViewChange('registered')} />
        </div>
      ) : viewMode === 'all' ? (
        <>
          <div className="controls-bar">
            <div className="filter-search">
              <svg className="icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search applicant name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="chip" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select className="chip" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
              <option value="all">All Target Job Orders</option>
              {JOB_TARGETS.map((j) => (
                <option key={j.id} value={j.id}>{j.title} — {j.client}</option>
              ))}
            </select>
          </div>

          <div className="board">
            {COLUMN_ORDER.map((col) => (
              <BoardColumn
                key={col}
                meta={STAGE_META[col]}
                candidates={filtered.filter((c) => boardColumn(c) === col)}
                onOpen={setOpenRegId}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="single-stage-page">
          <div className="stage-banner">
            <div className="stage-banner-info">
              <div className="stage-banner-title">
                {STAGE_PAGE_META[viewMode]?.title}
                <span className="stage-badge">{filtered.filter((c) => boardColumn(c) === viewMode).length} Applicants</span>
              </div>
              <div className="stage-banner-sub">{STAGE_PAGE_META[viewMode]?.sub}</div>
            </div>
          </div>

          <div className="controls-bar">
            <div className="filter-search">
              <svg className="icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search in this stage..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="chip" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select className="chip" value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}>
              <option value="all">All Target Job Orders</option>
              {JOB_TARGETS.map((j) => (
                <option key={j.id} value={j.id}>{j.title} — {j.client}</option>
              ))}
            </select>
          </div>

          <div className="stage-table-container">
            {filtered.filter((c) => boardColumn(c) === viewMode).length > 0 ? (
              <table className="stage-table">
                <thead>
                  <tr>
                    <th>Reg ID</th>
                    <th>Applicant Name</th>
                    <th>Target Category</th>
                    <th>Assigned Job Order</th>
                    <th>Status</th>
                    <th>Registered Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.filter((c) => boardColumn(c) === viewMode).map((cand) => {
                    const job = targetById(cand.targetJobId);
                    const statusMeta = STATUS_META[cand.status] || STATUS_META.active;
                    return (
                      <tr key={cand.regId} onClick={() => setOpenRegId(cand.regId)} className="stage-table-row">
                        <td className="cell-regid">{cand.regId}</td>
                        <td className="cell-name">
                          <div className="table-user-wrap">
                            <div className="table-user-avatar">{initials(cand.name)}</div>
                            <div>
                              <div className="table-user-name">{cand.name}</div>
                              <div className="table-user-sub">{cand.email || cand.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="table-cat-badge">{cand.category || 'Unassigned'}</span>
                        </td>
                        <td>
                          {job ? (
                            <div className="table-job-info">
                              <span className="table-job-title">{job.title}</span>
                              <span className="table-job-client">{job.client}</span>
                            </div>
                          ) : (
                            <span className="table-unassigned">No target assigned</span>
                          )}
                        </td>
                        <td>
                          <span className="cand-status-flag" style={{ color: statusMeta.color }}>
                            <span className="dot" style={{ background: statusMeta.color }} />
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="cell-date">{cand.registeredDate}</td>
                        <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                          <div className="table-actions-flex">
                            <button
                              className="stage-btn"
                              onClick={() => setOpenRegId(cand.regId)}
                            >
                              View &amp; Profile
                            </button>

                            {viewMode === 'sent' ? (
                              <Link
                                to="/recruitment-selection"
                                className="stage-btn go"
                                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                Recruitment &amp; Selection →
                              </Link>
                            ) : (
                              hasPermission(role, 'changeStage') && (
                                <button
                                  className="stage-btn go"
                                  onClick={() => handleAdvanceStage(cand.regId, viewMode)}
                                >
                                  {STAGE_PAGE_META[viewMode]?.btnLabel} →
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-stage-box">
                No applicants currently in this stage matching your filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      <ProfileDrawer regId={openRegId} onClose={() => setOpenRegId(null)} />
    </div>
  );
}
