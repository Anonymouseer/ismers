import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import DispatchStrip from '../components/DispatchStrip';
import BoardColumn from '../components/BoardColumn';
import ProfileDrawer from '../components/ProfileDrawer';
import { COLUMN_ORDER, STAGE_META, JOB_TARGETS, boardColumn } from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
import './ApplicantRegistrationBoard.css';

export default function ApplicantProfilingBoard() {
  const { candidates } = useApplicantRegistration();
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [openRegId, setOpenRegId] = useState(null);

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
      return matchesQ && matchesJob;
    });
  }, [candidates, search, jobFilter]);

  const counts = useMemo(() => {
    const base = { registered: 0, profiling: 0, profiled: 0, sent: 0 };
    candidates.forEach((c) => {
      const col = boardColumn(c.stage);
      if (base[col] !== undefined) base[col] += 1;
    });
    return base;
  }, [candidates]);

  return (
    <div className="app">
      <div className={`main${collapsed ? ' collapsed' : ''}`}>

        <div className="title-row">
          <div>
            <div className="eyebrow">Core 1 · Applicant Registration & Profiling</div>
            <h1 className="page-title">Applicant Intake & Profiling Board</h1>
            <div className="page-sub">
              {candidates.length} applicants registered · {counts.sent} sent to Recruitment & Selection
            </div>
          </div>
        </div>

        <DispatchStrip counts={counts} total={candidates.length} />

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

        <ProfileDrawer regId={openRegId} onClose={() => setOpenRegId(null)} />
      </div>
    </div>
  );
}
