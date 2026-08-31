import { useState, useMemo, useEffect } from 'react';
import { CLIENT_REQUISITIONS } from '../data/mockAiAnalyticsData';
import { CLIENTS } from '../../client-management/data/mockClients';
import { logoUrl } from '../../client-management/utils/clientDisplay';
import ClientsAiScoringTable from './ClientsAiScoringTable';
import Pagination from '../../../components/common/Pagination';
import { broadcastRealtimeEvent } from '../../../utils/realtimeSync';
import { saveStoredStage, getCachedApplications, saveCachedApplications, updateRecruitmentStage, updateRecruitmentScreening } from '../../recruitment-selection/services/RecruitmentSelectionService';
import { targetById } from '../../applicant-registration/services/ApplicantRegistrationService';
import AnalyticsService from '../services/AnalyticsService';

export default function SmartScoringTab() {
  const [liveRequisitions, setLiveRequisitions] = useState(CLIENT_REQUISITIONS);
  const [loading, setLoading] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState(null);
  const [activeJobRef, setActiveJobRef] = useState(null); // null = Level 2 (Job Cards Grid), string = Level 3 (Job Details & Candidate Table)
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedCandidateModal, setSelectedCandidateModal] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    AnalyticsService.getScoringData()
      .then((data) => {
        if (active && data?.requisitions && data.requisitions.length > 0) {
          setLiveRequisitions(data.requisitions);
        }
      })
      .catch((err) => console.warn('Could not load live analytics scoring:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Build unified 18 client directory with requisitions & scored candidates
  const clientDirectory = useMemo(() => {
    return CLIENTS.map((c) => {
      const requisitions = liveRequisitions.filter((r) => r.client === c.name || (r.client && r.client.toLowerCase().includes(c.name.toLowerCase())));
      const totalCandidates = requisitions.reduce((acc, r) => acc + (r.candidates?.length || 0), 0);
      const allMatches = requisitions.flatMap((r) => (r.candidates || []).map((cand) => cand.matchScore));
      const topMatch = allMatches.length ? Math.max(...allMatches) : (c.name === 'Sunrise Hospitality Group' ? 96 : c.name === 'Northline BPO' ? 95 : c.name === 'Apex Construction Builders' ? 94 : c.name === 'ABC Logistics' ? 94 : c.name === 'Delta Manufacturing' ? 93 : c.name === 'Coastal Retail Group' ? 92 : 88);
      const primarySite = c.site || (c.jobs?.[0]?.location) || 'Metro Manila, NCR';
      const supervisor = c.am || 'Karla Reyes';

      return {
        name: c.name,
        industry: c.industry || 'Manpower & Hospitality',
        status: c.status || 'active',
        jobOrdersCount: requisitions.length || (c.jobs?.length || 1),
        candidateCount: totalCandidates || (c.name === 'Sunrise Hospitality Group' ? 5 : c.name === 'Northline BPO' ? 2 : c.name === 'ABC Logistics' ? 3 : c.name === 'Delta Manufacturing' ? 2 : c.name === 'Coastal Retail Group' ? 2 : 1),
        topMatchScore: topMatch,
        site: primarySite,
        supervisor: supervisor,
        supervisorContact: '+63 917 555 1234',
        period: 'Jul 2026 - Jan 2027',
      };
    });
  }, []);

  // Filtered client list for Level 1 table
  const filteredClientList = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    return clientDirectory.filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.site.toLowerCase().includes(q);

      let matchesStatus = true;
      if (clientFilter === 'active') matchesStatus = c.status === 'active';
      else if (clientFilter === 'has_scored') matchesStatus = (c.candidateCount || 0) > 0;

      return matchesQ && matchesStatus;
    });
  }, [clientDirectory, clientSearch, clientFilter]);

  // Selected client object
  const selectedClientData = useMemo(() => {
    if (!selectedClientName) return null;
    return clientDirectory.find((c) => c.name === selectedClientName) || null;
  }, [selectedClientName, clientDirectory]);

  // All Job requisitions under the selected client
  const clientJobs = useMemo(() => {
    if (!selectedClientName) return [];
    const directReqs = liveRequisitions.filter((r) => r.client === selectedClientName || (r.client && r.client.toLowerCase().includes(selectedClientName.toLowerCase())));
    if (directReqs.length) return directReqs;

    // Baseline from mock clients
    const baseClient = CLIENTS.find((c) => c.name === selectedClientName);
    if (baseClient) {
      if (baseClient.jobs && baseClient.jobs.length > 0) {
        return baseClient.jobs.map((j, idx) => ({
          client: selectedClientName,
          industry: baseClient.industry,
          jobRef: `JO-0${idx + 10}`,
          jobTitle: j.title,
          headcount: j.total || 5,
          filledCount: j.filled || Math.min(2, j.total || 5),
          site: j.location || baseClient.site || 'Metro Manila Facility',
          minExp: '1+ Year Relevant Experience',
          salary: j.rate || 'P645.00 / Day',
          deadline: j.deadline || 'Jul 28, 2026',
          roleOverview: j.description || `Responsible for ${j.title.toLowerCase()} operations and client site compliance.`,
          requiredSkills: j.requirements?.slice(0, 4) || ['Occupational Safety & Compliance', 'Standard Operating Procedures', 'Attendance & Punctuality', 'Shift Flexibility'],
          preferredSkills: ['NC II Certification', 'Basic First Aid'],
          candidates: [
            {
              id: `AI-${selectedClientName.substring(0, 3).toUpperCase()}-101`,
              name: 'Michael Tan',
              matchScore: 88,
              skillsFit: 90,
              experienceFit: 85,
              locationFit: 89,
              yearsExp: '2.0 Years',
              matchedSkills: j.requirements?.slice(0, 3) || ['Occupational Safety & Compliance', 'Standard Operating Procedures'],
              missingSkills: ['Shift Flexibility'],
              extraSkills: ['NC II Certification'],
              verifiedCertifications: ['Fit-to-Work Cleared', 'NBI Cleared'],
              workHistory: `Former ${j.title} at Allied Services (2 yrs).`,
              aiRecommendation: 'Good operational fit. Meets mandatory safety and job experience requirements.',
              status: 'Recommended',
            },
          ],
        }));
      }

      // Default fallback for clients with prospect status or empty jobs array
      const defaultRole = baseClient.industry === 'Information Technology' ? 'IT Technical Support Specialist'
        : baseClient.industry === 'Healthcare' ? 'Healthcare Support Aide'
        : baseClient.industry?.includes('Freight') ? 'Logistics Operations Handler'
        : 'Store Merchandising Associate';

      return [
        {
          client: selectedClientName,
          industry: baseClient.industry,
          jobRef: 'JO-001',
          jobTitle: defaultRole,
          headcount: 5,
          filledCount: 2,
          site: baseClient.site || 'Metro Manila Hub',
          minExp: '1+ Year Relevant Experience',
          salary: 'P645.00 / Day',
          deadline: 'Aug 15, 2026',
          roleOverview: `Responsible for core ${defaultRole.toLowerCase()} duties, client operational adherence, and statutory compliance.`,
          requiredSkills: ['Core Operational Competence', 'Standard Operating Procedures', 'Attendance & Punctuality', 'Client Communication'],
          preferredSkills: ['Relevant Industry Certification'],
          candidates: [
            {
              id: `AI-${selectedClientName.substring(0, 3).toUpperCase()}-01`,
              name: 'Reynaldo Bautista',
              matchScore: 88,
              skillsFit: 90,
              experienceFit: 86,
              locationFit: 88,
              yearsExp: '2.5 Years',
              matchedSkills: ['Core Operational Competence', 'Standard Operating Procedures', 'Attendance & Punctuality'],
              missingSkills: ['Client Communication'],
              extraSkills: ['Relevant Industry Certification'],
              verifiedCertifications: ['Fit-to-Work Cleared', 'NBI Cleared'],
              workHistory: `Former ${defaultRole} at Global Solutions (2.5 yrs).`,
              aiRecommendation: 'Solid background and verified records. Highly recommended for endorsement.',
              status: 'Recommended',
            },
          ],
        },
      ];
    }

    return [];
  }, [selectedClientName]);

  // Active Job Requisition when drilled into Level 3
  const activeRequisition = useMemo(() => {
    if (!activeJobRef || !clientJobs.length) return null;
    return clientJobs.find((j) => j.jobRef === activeJobRef) || null;
  }, [clientJobs, activeJobRef]);

  // Handle client selection drill-down
  const handleSelectClient = (clientName) => {
    setSelectedClientName(clientName);
    setActiveJobRef(null); // Open at Level 2 (Job Cards Grid)
    setPage(1);
  };

  // Filtered candidates for the active job order
  const filteredCandidates = useMemo(() => {
    if (!activeRequisition) return [];
    let list = [...activeRequisition.candidates];

    if (candidateSearch.trim()) {
      const q = candidateSearch.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.matchedSkills.some((s) => s.toLowerCase().includes(q)) ||
          c.workHistory.toLowerCase().includes(q) ||
          c.verifiedCertifications.some((cert) => cert.toLowerCase().includes(q))
      );
    }

    if (scoreFilter === 'top') {
      list = list.filter((c) => c.matchScore >= 90);
    } else if (scoreFilter === 'strong') {
      list = list.filter((c) => c.matchScore >= 80 && c.matchScore < 90);
    } else if (scoreFilter === 'moderate') {
      list = list.filter((c) => c.matchScore < 80);
    }

    list.sort((a, b) => b.matchScore - a.matchScore);
    return list;
  }, [activeRequisition, candidateSearch, scoreFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedCandidates = filteredCandidates.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleShortlist = (candidateName, jobTitle, clientName) => {
    // 1. Advance candidate into client_interview stage in recruitment pipeline cache
    let foundApp = null;
    try {
      const existingApps = getCachedApplications() || [];
      const targetApp = existingApps.find((a) => a.name === candidateName);
      if (targetApp) {
        targetApp.status = 'client_interview';
        targetApp.clientEndorsementStatus = 'Pending Review';
        targetApp.client = clientName;
        targetApp.jobTitle = jobTitle;
        saveStoredStage(targetApp.id, 'client_interview');
        if (targetApp.regId) saveStoredStage(targetApp.regId, 'client_interview');
        saveStoredStage(candidateName, 'client_interview');
        saveCachedApplications(existingApps);
        foundApp = targetApp;
      } else {
        saveStoredStage(candidateName, 'client_interview');
      }
    } catch (e) {
      console.warn('Could not sync shortlist to recruitment cache:', e);
    }

    try {
      localStorage.setItem(`cp_endorsement_${candidateName}`, 'Pending Review');
      if (foundApp?.id) localStorage.setItem(`cp_endorsement_${foundApp.id}`, 'Pending Review');
    } catch (e) { }

    const persistId = foundApp?.regId || foundApp?.id || candidateName;
    updateRecruitmentStage(persistId, 'client_interview', null, candidateName).catch(() => { });
    updateRecruitmentScreening(persistId, { client_endorsement_status: 'Pending Review' }, candidateName).catch(() => { });

    const targetJob = targetById(foundApp?.jobId) || targetById(jobTitle);
    const jobRefCode = targetJob?.ref || targetJob?.id || 'PRF-2026-0001';
    const formattedJobRef = String(jobRefCode).startsWith('PRF-')
      ? jobRefCode
      : `PRF-2026-${String(jobRefCode).replace(/\D/g, '').padStart(4, '0')}`;

    // 2. Broadcast real-time events across Recruitment Board and Client Portal
    try {
      broadcastRealtimeEvent('CANDIDATE_ENDORSED', {
        candidateId: foundApp?.id || candidateName,
        dbId: foundApp?.id,
        regId: foundApp?.regId,
        name: candidateName,
        client: clientName,
        status: 'Pending Review',
        stage: 'client_interview',
        applicant: {
          ...(foundApp || {}),
          name: candidateName,
          status: 'client_interview',
          clientEndorsementStatus: 'Pending Review',
          client: clientName,
          jobTitle: jobTitle,
          jobId: jobRefCode,
        },
        candidate: {
          id: `cand-${foundApp?.id || Date.now()}`,
          dbId: foundApp?.id,
          regId: foundApp?.regId,
          name: candidateName,
          client: clientName,
          position: jobTitle,
          jobRef: formattedJobRef,
          matchScore: foundApp?.score || 88,
          experience: foundApp?.experience || '3 years relevant industry experience',
          skills: Array.isArray(foundApp?.skills) && foundApp.skills.length > 0 ? foundApp.skills : ['Technical Proficiency', 'Communications', 'Operations Protocol'],
          endorsedDate: 'Aug 14, 2026',
          status: 'Pending Review',
          recruiter: foundApp?.assignedManager || 'M. Dela Cruz (Lead Recruiter)',
        },
      });

      broadcastRealtimeEvent('ENDORSEMENT_STATUS_CHANGED', {
        candidateId: foundApp?.id || candidateName,
        dbId: foundApp?.id,
        regId: foundApp?.regId,
        name: candidateName,
        client: clientName,
        status: 'Pending Review',
        stage: 'client_interview',
      });

      broadcastRealtimeEvent('STAGE_CHANGED', {
        candidateId: foundApp?.id || candidateName,
        dbId: foundApp?.id,
        regId: foundApp?.regId,
        name: candidateName,
        stage: 'client_interview',
        applicant: {
          ...(foundApp || {}),
          name: candidateName,
          status: 'client_interview',
          clientEndorsementStatus: 'Pending Review',
          client: clientName,
          jobTitle: jobTitle,
        },
      });
    } catch (e) {
      console.warn('Could not broadcast shortlist event:', e);
    }

    showToast(`Candidate ${candidateName} successfully shortlisted & endorsed for Client Interview at ${clientName}!`);
  };

  const getInitials = (name = '') => {
    if (!name) return 'NA';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'NA';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {toastMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 12,
            background: 'var(--primary)',
            color: '#fff',
            fontSize: 12.5,
            fontWeight: 800,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          LEVEL 1: CLIENT ACCOUNTS DIRECTORY TABLE VIEW (PANEL CONTAINER)
          ══════════════════════════════════════════════════════════════ */}
      {!selectedClientName ? (
        <div className="panel" style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          {/* PANEL HEADER */}
          <div
            className="panel-head"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg)',
            }}
          >
            <div>
              <div className="panel-title" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                Client Accounts &amp; AI Candidate Scoring Directory
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>
                Select a client account to view active Job Orders, skills alignment, and candidate matching scores
              </div>
            </div>

            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted-fg)' }}>
              Total Accounts: <b>{clientDirectory.length}</b>
            </span>
          </div>

          {/* INTEGRATED FILTER BAR */}
          <div
            className="filter-bar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-soft)',
              background: 'var(--panel)',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '6px 12px',
                width: 320,
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, color: 'var(--muted-fg)' }}>
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search client account, industry, or deployment site..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', width: '100%' }}
              />
              {clientSearch && (
                <button type="button" onClick={() => setClientSearch('')} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', cursor: 'pointer' }}>
                  ✕
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                className="chip"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                <option value="all">All Accounts ({clientDirectory.length})</option>
                <option value="active">Active Client Accounts</option>
                <option value="has_scored">Has Scored Candidates</option>
              </select>

              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)' }}>
                Showing <b>{filteredClientList.length}</b> Client Accounts
              </span>
            </div>
          </div>

          {/* TABLE */}
          <ClientsAiScoringTable
            clientList={filteredClientList}
            onSelectClient={handleSelectClient}
          />
        </div>
      ) : !activeJobRef ? (
        /* ══════════════════════════════════════════════════════════════
            LEVEL 2: 2-COLUMN JOB ORDER CARDS GRID (CLEAN CLIENT VIEW)
            ══════════════════════════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {/* TOP BREADCRUMB & BACK TO CLIENTS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              className="btn"
              onClick={() => setSelectedClientName(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11.5,
                fontWeight: 800,
                color: 'var(--blue)',
                padding: '6px 14px',
                borderRadius: 8,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <span>←</span>
              <span>Back to Client Accounts</span>
            </button>
          </div>

          {/* CLIENT HERO HEADER BANNER */}
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '18px 22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 14,
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img
                src={logoUrl(selectedClientData?.name)}
                alt=""
                width={52}
                height={52}
                style={{ borderRadius: 12, border: '1px solid var(--border-soft)', flexShrink: 0 }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>
                    {selectedClientData?.name}
                  </h2>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 10.5,
                      fontWeight: 800,
                      background: 'var(--blue-soft)',
                      color: 'var(--blue)',
                      border: '1px solid var(--blue)',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                    Active Client
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  <span>Industry: <b>{selectedClientData?.industry}</b></span>
                  <span>·</span>
                  <span>Primary Site: <b>{selectedClientData?.site}</b></span>
                  <span>·</span>
                  <span>Operations Supervisor: <b>{selectedClientData?.supervisor}</b> ({selectedClientData?.supervisorContact})</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--green)' }}>
                {clientJobs.reduce((acc, j) => acc + j.candidates.length, 0)} Candidates Scored &amp; Pooled
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 700 }}>
                Across {clientJobs.length} Active Job Orders
              </div>
            </div>
          </div>

          {/* 2-COLUMN JOB ORDERS CARDS GRID */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>
                Job Orders
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted-fg)', fontWeight: 700 }}>
                {clientJobs.length} total &nbsp;·&nbsp; {clientJobs.filter((j) => (j.filledCount || 0) < j.headcount).length || 1} currently filling
              </div>
            </div>

            <div className="jo-grid">
              {clientJobs.map((job) => {
                const filled = job.filledCount || Math.min(job.candidates.length, job.headcount);
                const total = job.headcount || 5;
                const pct = Math.round((filled / total) * 100);
                const isFilling = filled < total;

                return (
                  <div
                    key={job.jobRef}
                    className="jo-card"
                    onClick={() => {
                      setActiveJobRef(job.jobRef);
                      setPage(1);
                    }}
                  >
                    {/* CARD HEADER */}
                    <div className="jo-card-header">
                      <div className="jo-card-title-group">
                        <div className="jo-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div className="jo-title">{job.jobTitle}</div>
                          <div className="jo-ref">{job.jobRef}-{selectedClientData?.name?.substring(0, 3)?.toUpperCase()}</div>
                        </div>
                      </div>

                      <span className={`jo-badge ${isFilling ? 'badge-filling' : ''}`}>
                        <span className="dot" />
                        {isFilling ? 'FILLING' : 'FILLED'}
                      </span>
                    </div>

                    {/* FULFILLMENT PROGRESS */}
                    <div className="jo-card-progress">
                      <div className="jo-progress-top">
                        <span className="jo-progress-label">Fulfillment Progress</span>
                        <span className="jo-progress-nums">
                          <b>{filled}</b> / {total} filled ({pct}%)
                        </span>
                      </div>
                      <div className="jo-progress-track">
                        <div className="jo-progress-bar" style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* METADATA GRID */}
                    <div className="jo-meta-grid">
                      <div className="jo-meta-item">
                        <div className="jo-meta-label">Type</div>
                        <div className="jo-meta-value">Full-time · Contractual</div>
                      </div>
                      <div className="jo-meta-item">
                        <div className="jo-meta-label">Deadline</div>
                        <div className="jo-meta-value">{job.deadline || 'Jul 28, 2026'}</div>
                      </div>
                      <div className="jo-meta-item">
                        <div className="jo-meta-label">Rate</div>
                        <div className="jo-meta-value">{job.salary}</div>
                      </div>
                    </div>

                    {/* CARD FOOTER */}
                    <div className="jo-card-foot">
                      <div className="jo-avatar-stack">
                        {job.candidates.slice(0, 4).map((cand, cIdx) => (
                          <div className="jo-stack-avatar" key={cIdx}>
                            {getInitials(cand.name)}
                          </div>
                        ))}
                        {job.candidates.length > 4 && (
                          <div className="jo-stack-more">+{job.candidates.length - 4}</div>
                        )}
                        {job.candidates.length === 0 && (
                          <span className="jo-no-hires">No candidates pooled yet</span>
                        )}
                      </div>

                      <div className="jo-view-btn">
                        <span>Details</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
            LEVEL 3: SELECTED JOB ORDER DETAILS & CANDIDATE TABLE (AFTER CLICKING CARD)
            ══════════════════════════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* BACK BUTTON TO JOB ORDERS CARDS GRID */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              className="btn"
              onClick={() => setActiveJobRef(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11.5,
                fontWeight: 800,
                color: 'var(--blue)',
                padding: '6px 14px',
                borderRadius: 8,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <span>←</span>
              <span>Back to Job Orders Grid ({selectedClientData?.name})</span>
            </button>

            <span style={{ fontSize: 12, color: 'var(--muted-fg)', fontWeight: 700 }}>
              Client: <b>{selectedClientData?.name}</b> &nbsp;·&nbsp; Position: <b>{activeRequisition?.jobTitle}</b>
            </span>
          </div>

          {/* TARGET JOB DESCRIPTION & MANDATORY SKILLS BANNER */}
          {activeRequisition && (
            <div
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 16,
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <div style={{ flex: '1 1 360px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>
                    Target Job Description: <span style={{ color: 'var(--primary)' }}>{activeRequisition.jobTitle}</span>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                    Ref: {activeRequisition.jobRef} &nbsp;·&nbsp; {activeRequisition.headcount} Openings
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4, lineHeight: 1.4 }}>
                  {activeRequisition.roleOverview}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text)', marginTop: 6, display: 'flex', gap: 12 }}>
                  <span>Required Exp: <b>{activeRequisition.minExp}</b></span>
                  <span>·</span>
                  <span>Daily Rate: <b>{activeRequisition.salary}</b></span>
                  <span>·</span>
                  <span>Facility Site: <b>{activeRequisition.site}</b></span>
                </div>
              </div>

              {/* MANDATORY SKILLS PILLS */}
              <div style={{ flex: '1 1 400px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--purple)', textTransform: 'uppercase', marginBottom: 6 }}>
                  Mandatory Skills in JD ({activeRequisition.requiredSkills.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {activeRequisition.requiredSkills.map((reqSkill, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: 8,
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>●</span>
                      <span>{reqSkill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CANDIDATE & POOLING SPREADSHEET TABLE */}
          {activeRequisition && (
            <div
              style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              {/* TOOLBAR */}
              <div
                style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 12px', flex: '1 1 260px' }}>
                  <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2, color: 'var(--muted-fg)' }}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search candidate name, verified skill, or credential..."
                    value={candidateSearch}
                    onChange={(e) => {
                      setCandidateSearch(e.target.value);
                      setPage(1);
                    }}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 12, color: 'var(--text)', width: '100%' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <select
                    className="chip"
                    value={scoreFilter}
                    onChange={(e) => {
                      setScoreFilter(e.target.value);
                      setPage(1);
                    }}
                    style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 11.5, fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="all">All Match Scores</option>
                    <option value="top">Top Fit (90%+ Match)</option>
                    <option value="strong">Strong Fit (80% - 89%)</option>
                    <option value="moderate">Evaluating (&lt;80%)</option>
                  </select>

                  <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted-fg)' }}>
                    Showing <b>{filteredCandidates.length}</b> Candidates in Pooling for {activeRequisition.jobTitle}
                  </span>
                </div>
              </div>

              {/* TABLE CONTENT */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '14px 18px', textAlign: 'left' }}>Candidate Name &amp; Pooling Status</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center' }}>AI Match Score</th>
                      <th style={{ padding: '14px 16px', textAlign: 'center' }}>Skills Fit</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left' }}>Matched Skills in JD</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left' }}>Skill Gaps / Missing</th>
                      <th style={{ padding: '14px 16px', textAlign: 'left' }}>Verified Credentials</th>
                      <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCandidates.length ? (
                      paginatedCandidates.map((c) => {
                        const isTopFit = c.matchScore >= 90;
                        const isStrongFit = c.matchScore >= 80 && c.matchScore < 90;

                        return (
                          <tr
                            key={c.id}
                            style={{
                              borderBottom: '1px solid var(--border-soft)',
                              transition: 'background 0.14s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            onClick={() => setSelectedCandidateModal({ candidate: c, requisition: activeRequisition })}
                          >
                            {/* CANDIDATE NAME */}
                            <td style={{ padding: '16px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                  style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: isTopFit ? 'var(--green)' : isStrongFit ? 'var(--blue)' : 'var(--purple)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: 'var(--shadow-xs)',
                                  }}
                                >
                                  {c.name.charAt(0)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  <div style={{ fontWeight: 800, color: 'var(--text)', fontSize: 13.5, lineHeight: 1.25 }}>
                                    {c.name}
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.2 }}>
                                    <span>{c.yearsExp} Verified Exp</span>
                                    <span style={{ opacity: 0.5 }}>•</span>
                                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>In Pooling</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* AI MATCH SCORE */}
                            <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                              <span
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: 12,
                                  fontSize: 11.5,
                                  fontWeight: 900,
                                  background: isTopFit ? 'var(--green-soft)' : isStrongFit ? 'var(--blue-soft)' : 'rgba(139, 92, 246, 0.12)',
                                  color: isTopFit ? 'var(--green)' : isStrongFit ? 'var(--blue)' : 'var(--purple)',
                                  border: isTopFit ? '1px solid var(--green)' : isStrongFit ? '1px solid var(--blue)' : '1px solid var(--purple)',
                                  display: 'inline-block',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {c.matchScore}% Match
                              </span>
                            </td>

                            {/* SKILLS FIT */}
                            <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                              <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: 12.5, lineHeight: 1.2 }}>
                                {c.skillsFit}%
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--muted-fg)', marginTop: 3, lineHeight: 1.2 }}>
                                {c.matchedSkills.length}/{activeRequisition.requiredSkills.length} Verified
                              </div>
                            </td>

                            {/* MATCHED SKILLS */}
                            <td style={{ padding: '16px 16px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: 280 }}>
                                {c.matchedSkills.map((skill, sIdx) => (
                                  <span
                                    key={sIdx}
                                    style={{
                                      fontSize: 10.5,
                                      fontWeight: 700,
                                      padding: '2px 7px',
                                      borderRadius: 6,
                                      background: 'var(--green-soft)',
                                      color: 'var(--green)',
                                      border: '1px solid rgba(20, 158, 110, 0.25)',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    ✓ {typeof skill === 'string' ? skill.split('/')[0].split('&')[0].trim() : skill}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* SKILL GAPS / MISSING */}
                            <td style={{ padding: '16px 16px' }}>
                              {c.missingSkills.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: 220 }}>
                                  {c.missingSkills.map((gap, gIdx) => (
                                    <span
                                      key={gIdx}
                                      style={{
                                        fontSize: 10.5,
                                        fontWeight: 700,
                                        padding: '2px 7px',
                                        borderRadius: 6,
                                        background: 'rgba(220, 38, 38, 0.08)',
                                        color: 'var(--red, #dc2626)',
                                        border: '1px solid rgba(220, 38, 38, 0.25)',
                                        whiteSpace: 'nowrap',
                                      }}
                                    >
                                      ✕ {typeof gap === 'string' ? gap.split('/')[0].split('&')[0].trim() : gap}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>
                                  ✓ 100% Fully Matched
                                </span>
                              )}
                            </td>

                            {/* VERIFIED CREDENTIALS */}
                            <td style={{ padding: '16px 16px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: 200 }}>
                                {c.verifiedCertifications.map((cert, cIdx) => (
                                  <span
                                    key={cIdx}
                                    style={{
                                      fontSize: 10,
                                      fontWeight: 800,
                                      padding: '2px 6px',
                                      borderRadius: 5,
                                      background: 'var(--bg)',
                                      border: '1px solid var(--border)',
                                      color: 'var(--muted-fg)',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    ★ {cert}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* ACTIONS */}
                            <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  className="btn primary"
                                  style={{ padding: '6px 12px', fontSize: 11, fontWeight: 800, background: 'var(--blue)', borderColor: 'var(--blue)' }}
                                  onClick={() => handleShortlist(c.name, activeRequisition.jobTitle, activeRequisition.client)}
                                >
                                  Shortlist →
                                </button>
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700 }}
                                  onClick={() => setSelectedCandidateModal({ candidate: c, requisition: activeRequisition })}
                                >
                                  Deep Dive
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--muted-fg)' }}>
                          No candidates currently found in pooling matching this filter for {activeRequisition.jobTitle}.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {filteredCandidates.length > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--panel)' }}>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    totalItems={filteredCandidates.length}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: DEEP-DIVE SIDE-BY-SIDE SKILLS ALIGNMENT SCORECARD
          ══════════════════════════════════════════════════════════════ */}
      {selectedCandidateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setSelectedCandidateModal(null)}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 18,
              width: '100%',
              maxWidth: 860,
              maxHeight: '90vh',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div style={{ padding: '16px 22px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{selectedCandidateModal.candidate.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '3px 8px', borderRadius: 8 }}>
                    {selectedCandidateModal.candidate.matchScore}% Overall AI Fit
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted-fg)', marginTop: 2 }}>
                  Role: <b>{selectedCandidateModal.requisition.jobTitle}</b> &nbsp;·&nbsp; Client: <b>{selectedCandidateModal.requisition.client}</b>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidateModal(null)}
                style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 20, cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
              
              {/* SIDE-BY-SIDE MATRIX */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Job Description Requisition (Target)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Position:</span> <b>{selectedCandidateModal.requisition.jobTitle}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Client:</span> <b>{selectedCandidateModal.requisition.client}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Required Experience:</span> <b>{selectedCandidateModal.requisition.minExp}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Site / Facility:</span> <b>{selectedCandidateModal.requisition.site}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Compensation:</span> <b>{selectedCandidateModal.requisition.salary}</b></div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.5px' }}>
                    Candidate Profile &amp; Evidence (Actual)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Candidate:</span> <b>{selectedCandidateModal.candidate.name}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Verified Experience:</span> <b style={{ color: 'var(--green)' }}>{selectedCandidateModal.candidate.yearsExp}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Past Role:</span> <b>{selectedCandidateModal.candidate.workHistory}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Credentials:</span> <b>{selectedCandidateModal.candidate.verifiedCertifications.join(' · ')}</b></div>
                    <div><span style={{ color: 'var(--muted-fg)' }}>Recommendation:</span> <b style={{ color: 'var(--green)' }}>{selectedCandidateModal.candidate.status}</b></div>
                  </div>
                </div>
              </div>

              {/* SKILL-BY-SKILL ALIGNMENT TABLE */}
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 800, color: 'var(--text)', textTransform: 'uppercase' }}>
                  Itemized Competency-by-Competency Alignment Matrix:
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontSize: 10.5, textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 16px', textAlign: 'left' }}>Required Skill in JD</th>
                      <th style={{ padding: '10px 16px', textAlign: 'center' }}>Candidate Alignment</th>
                      <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status / Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCandidateModal.requisition.requiredSkills.map((reqSkill, idx) => {
                      const isMatched = selectedCandidateModal.candidate.matchedSkills.includes(reqSkill);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                          <td style={{ padding: '10px 16px', fontWeight: 700, color: 'var(--text)' }}>
                            {reqSkill}
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            {isMatched ? (
                              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--green)', background: 'var(--green-soft)', padding: '3px 8px', borderRadius: 8 }}>
                                ✓ Verified Fit
                              </span>
                            ) : (
                              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--red, #dc2626)', background: 'rgba(220, 38, 38, 0.08)', padding: '3px 8px', borderRadius: 8 }}>
                                ✕ Skill Gap
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px 16px', color: 'var(--muted-fg)', fontSize: 11.5 }}>
                            {isMatched ? 'Fulfills JD specifications based on past employment record.' : 'Recommend brief on-the-job orientation.'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* AI RATIONALE CARD */}
              <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                  Executive AI Sourcing Rationale:
                </div>
                <div style={{ color: 'var(--text)', lineHeight: 1.5, fontSize: 12 }}>
                  {selectedCandidateModal.candidate.aiRecommendation}
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div style={{ padding: '14px 22px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setSelectedCandidateModal(null)}
                style={{ fontSize: 12 }}
              >
                Close Scorecard
              </button>

              <button
                type="button"
                className="btn primary"
                style={{ fontSize: 12, fontWeight: 800, padding: '8px 20px', background: 'var(--blue)', borderColor: 'var(--blue)' }}
                onClick={() => {
                  handleShortlist(
                    selectedCandidateModal.candidate.name,
                    selectedCandidateModal.requisition.jobTitle,
                    selectedCandidateModal.requisition.client
                  );
                  setSelectedCandidateModal(null);
                }}
              >
                Endorse &amp; Shortlist for Client Interview →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
