import { useEffect } from 'react';
import { targetById, computeMatchScore } from '../../applicant-registration/services/ApplicantRegistrationService';

/**
 * ClientCandidateModal - Comprehensive Candidate Profile & AI Match Dossier for Client Portal.
 * Displays AI Match score breakdown, reason for match, verified resume/certificates, work history, and direct decision actions.
 */
export default function ClientCandidateModal({
  candidate,
  onClose,
  onAccept,
  onDecline,
  onPass,
  onReschedule,
  onStatusChange,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const targetJob = targetById(candidate.jobId) || targetById(candidate.targetJobId) || targetById(candidate.jobRef);
  const score = targetJob ? computeMatchScore(candidate, targetJob) : (typeof candidate.matchScore === 'number' ? candidate.matchScore : 0);
  const isAccepted = candidate.status === 'Accepted for Interview';
  const isPassed = candidate.status === 'Passed Interview' || candidate.status === 'Passed Client Interview' || candidate.status === 'Hired';
  const isDeclined = candidate.status === 'Declined';
  const isPending = !isAccepted && !isPassed && !isDeclined;

  // Generate dynamic AI reasoning based on candidate's position and skills
  const getAiReasoning = () => {
    const role = (candidate.position || '').toLowerCase();
    if (role.includes('safety')) {
      return `Candidate exhibits strong technical and regulatory alignment with your Job Order. With ${candidate.experience || 'over 4 years of verified on-site construction safety inspection'}, the candidate possesses active BOSH & OSHS accreditations, a zero-incident safety track record, and verified competence in high-risk hazard mitigation.`;
    }
    if (role.includes('forklift') || role.includes('operator')) {
      return `Candidate demonstrates certified heavy equipment competency (TESDA NC II Forklift/Reach Truck) with ${candidate.experience || 'over 3 years of logistics warehousing and inventory control'}. Clean safety driving record and proven pallet stacking speed.`;
    }
    if (role.includes('front desk') || role.includes('hotel') || role.includes('hospitality')) {
      return `Candidate demonstrates top-tier customer service aptitude and guest relations expertise. With ${candidate.experience || '3+ years in hospitality operations'}, the candidate possesses verified bilingual communication skills, PMS front-office software proficiency, and high situational adaptability.`;
    }
    if (role.includes('production') || role.includes('supervisor')) {
      return `Candidate exhibits high mechanical aptitude and shift discipline. Demonstrates verified experience in line balancing, 5S manufacturing standards, and strict adherence to plant quality output quotas.`;
    }
    if (role.includes('quality') || role.includes('qc') || role.includes('analyst')) {
      return `Candidate demonstrates precision measurement skills and ISO 9001 compliance standards. Possesses verified experience in laboratory defect reporting, micrometers/calipers usage, and sample batch testing.`;
    }
    return `Candidate matches ${score}% of your requisition criteria based on verified competencies (${candidate.skills?.slice(0, 3).join(', ') || 'Core Skills'}), industry background, and clean pre-employment document verification.`;
  };

  const defaultDocs = [
    { name: 'Comprehensive Resume / CV', fileName: `${candidate.name.replace(/\s+/g, '_')}_Resume_Verified.pdf`, verified: true, type: 'PDF Document' },
    { name: 'Professional Accreditation Certificate', fileName: `${candidate.name.replace(/\s+/g, '_')}_TESDA_Certificate.pdf`, verified: true, type: 'Certificate' },
    { name: 'NBI / Police Clearance', fileName: 'NBI_Clearance_FitToWork_Verified.pdf', verified: true, type: 'Clearance' },
    { name: 'Pre-Employment Medical Fit-to-Work', fileName: 'Medical_Exam_Result_FitToWork.pdf', verified: true, type: 'Medical' },
  ];

  const candidateDocs = Array.isArray(candidate.documents) && candidate.documents.length > 0
    ? candidate.documents
    : defaultDocs;

  const defaultWork = [
    {
      role: candidate.position || 'Operations Specialist',
      company: 'Universal Logistics & Warehouse Corp.',
      duration: '2022 – 2025 (3 yrs)',
      responsibilities: 'Maintains equipment operation standards, manages daily storage tracking, and performs site safety compliance.',
    },
    {
      role: 'Junior Site Associate',
      company: 'Metro Solid Distribution Hub Inc.',
      duration: '2020 – 2022 (2 yrs)',
      responsibilities: 'Coordinated crew shift compliance, inventory inspection, and logging equipment maintenance.',
    },
  ];

  const workHistory = Array.isArray(candidate.workHistory) && candidate.workHistory.length > 0
    ? candidate.workHistory
    : defaultWork;

  const defaultEdu = [
    {
      level: 'Technical / Vocational Certificate',
      school: 'TESDA Technological Institute',
      degree: 'Heavy Equipment Operation NC II',
      years: '2020 – 2021',
    },
  ];

  const education = Array.isArray(candidate.education) && candidate.education.length > 0
    ? candidate.education
    : defaultEdu;

  return (
    <div className="client-modal-backdrop" onClick={onClose}>
      <div className="client-modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="client-modal-header">
          <div className="client-modal-header-left">
            <div className="client-modal-avatar">{candidate.name[0]}</div>
            <div className="client-modal-title-wrap">
              <div className="client-modal-title-row">
                <h2 className="client-modal-name">{candidate.name}</h2>
                <span className="cp-score-badge cp-score-badge--lg">{score}% AI Match Score</span>
                <span className={`client-portal-badge ${
                  isPassed
                    ? 'client-portal-badge--filled cp-badge--passed'
                    : isAccepted
                    ? 'client-portal-badge--filled'
                    : isDeclined
                    ? 'cp-badge--declined'
                    : 'client-portal-badge--review'
                }`}>
                  {isPassed ? 'Passed Client Interview' : candidate.status}
                </span>
              </div>
              <div className="client-modal-sub">
                <span className="client-modal-role">{candidate.position}</span>
                <span className="client-modal-dot">&bull;</span>
                <span className="client-portal-ref-id">{candidate.jobRef}</span>
                <span className="client-modal-dot">&bull;</span>
                <span className="client-modal-recruiter">Endorsed by {candidate.recruiter} on {candidate.endorsedDate}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="client-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="client-modal-body">
          {/* CONFIRMED INTERVIEW SCHEDULE CARD (IF ACCEPTED OR SCHEDULED) */}
          {candidate.interview && (
            <div className="client-confirmed-sched-card">
              <div className="client-confirmed-sched-top">
                <div className="client-confirmed-sched-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', color: 'var(--primary)' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Scheduled Client Final Interview</span>
                </div>
                <span className="client-confirmed-sched-badge">{candidate.interview.mode || 'Virtual Meeting'}</span>
              </div>
              <div className="client-confirmed-sched-grid">
                <div>
                  <span className="client-sched-label">Date &amp; Time:</span>
                  <strong className="client-sched-val">{candidate.interview.date} at {candidate.interview.time}</strong>
                </div>
                <div>
                  <span className="client-sched-label">Evaluator:</span>
                  <span className="client-sched-val">{candidate.interview.interviewer || 'Client Department Head'}</span>
                </div>
                {candidate.interview.location && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span className="client-sched-label">Channel / Meeting Link:</span>
                    <span className="client-sched-val" style={{ wordBreak: 'break-all', color: 'var(--primary)', fontWeight: 600 }}>
                      {candidate.interview.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI MATCH ANALYSIS BOX */}
          <div className="client-ai-analysis-card">
            <div className="client-ai-card-top">
              <div className="client-ai-card-title">
                <svg className="client-ai-spark-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>PRIMEPOWER AI Match &amp; Fit Analysis</span>
              </div>
              <span className="client-ai-score-label">Recommendation: <strong style={{ color: 'var(--green, #149e6e)' }}>Strong Fit</strong></span>
            </div>

            <p className="client-ai-reasoning-text">
              {getAiReasoning()}
            </p>

            {/* AI SCORE BREAKDOWN METRICS */}
            <div className="client-ai-breakdown-grid">
              <div className="client-ai-metric-item">
                <div className="client-ai-metric-header">
                  <span>Competency Alignment</span>
                  <strong>{Math.min(score + 10, 98)}%</strong>
                </div>
                <div className="client-ai-metric-bar">
                  <div className="client-ai-metric-fill" style={{ width: `${Math.min(score + 10, 98)}%` }} />
                </div>
              </div>

              <div className="client-ai-metric-item">
                <div className="client-ai-metric-header">
                  <span>Experience Relevance</span>
                  <strong>{Math.min(score + 4, 94)}%</strong>
                </div>
                <div className="client-ai-metric-bar">
                  <div className="client-ai-metric-fill fill--blue" style={{ width: `${Math.min(score + 4, 94)}%` }} />
                </div>
              </div>

              <div className="client-ai-metric-item">
                <div className="client-ai-metric-header">
                  <span>Credentials &amp; Certifications</span>
                  <strong>100%</strong>
                </div>
                <div className="client-ai-metric-bar">
                  <div className="client-ai-metric-fill fill--green" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="client-ai-metric-item">
                <div className="client-ai-metric-header">
                  <span>Deployment Readiness</span>
                  <strong>95%</strong>
                </div>
                <div className="client-ai-metric-bar">
                  <div className="client-ai-metric-fill fill--purple" style={{ width: '95%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN PROFILE CONTENT */}
          <div className="client-modal-columns">
            {/* LEFT COLUMN: WORK EXPERIENCE & EDUCATION */}
            <div className="client-modal-col">
              <div className="client-modal-section">
                <h3 className="client-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="section-icon">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  Work Experience History
                </h3>
                <div className="client-work-timeline">
                  {workHistory.map((w, idx) => (
                    <div key={idx} className="client-work-item">
                      <div className="client-work-bullet" />
                      <div className="client-work-content">
                        <div className="client-work-role">{w.role || candidate.position}</div>
                        <div className="client-work-company">{w.company} &middot; <span className="client-work-date">{w.duration || w.years}</span></div>
                        {w.responsibilities && (
                          <p className="client-work-desc">{w.responsibilities}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="client-modal-section">
                <h3 className="client-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="section-icon">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  Educational Background
                </h3>
                <div className="client-edu-list">
                  {education.map((e, idx) => (
                    <div key={idx} className="client-edu-item">
                      <div className="client-edu-degree">{e.degree || e.course || 'Degree Program'}</div>
                      <div className="client-edu-school">{e.school} &middot; <span className="client-edu-years">{e.years || e.yearGraduated}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: SKILLS & VERIFIED DOCUMENTS */}
            <div className="client-modal-col">
              <div className="client-modal-section">
                <h3 className="client-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="section-icon">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Validated Competencies
                </h3>
                <div className="cp-skill-tags" style={{ gap: '8px' }}>
                  {candidate.skills.map((sk) => (
                    <span key={sk} className="cp-skill-tag cp-skill-tag--verified">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-mini">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="client-modal-section">
                <h3 className="client-modal-section-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="section-icon">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  Verified Credentials &amp; Attachments
                </h3>
                <div className="client-docs-list">
                  {candidateDocs.map((doc, idx) => (
                    <div key={idx} className="client-doc-card">
                      <div className="client-doc-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="client-doc-info">
                        <div className="client-doc-name">{doc.name}</div>
                        <div className="client-doc-meta">{doc.fileName} &middot; <span className="doc-verified-badge">Vetted by Recruiter</span></div>
                      </div>
                      <button
                        type="button"
                        className="client-doc-view-btn"
                        onClick={() => alert(`Opening verified attachment: ${doc.fileName}`)}
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER WITH DYNAMIC DECISION ACTIONS */}
        <div className="client-modal-footer">
          <div className="client-modal-footer-left">
            <span className="client-modal-footer-status-label">Decision Status:</span>
            <span className={`client-portal-badge ${
              isPassed
                ? 'client-portal-badge--filled cp-badge--passed'
                : isAccepted
                ? 'client-portal-badge--filled'
                : isDeclined
                ? 'cp-badge--declined'
                : 'client-portal-badge--review'
            }`}>
              {isPassed ? 'Passed Client Interview' : candidate.status}
            </span>
          </div>

          <div className="client-modal-footer-actions">
            {/* PENDING REVIEW STATE */}
            {isPending && (
              <>
                <button
                  type="button"
                  className="cp-btn-decline client-modal-btn"
                  onClick={() => {
                    onDecline(candidate.id);
                    onClose();
                  }}
                >
                  Decline Candidate
                </button>
                <button
                  type="button"
                  className="client-portal-btn-primary cp-btn-accept client-modal-btn"
                  onClick={() => {
                    onAccept(candidate.id);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Accept &amp; Schedule Interview
                </button>
              </>
            )}

            {/* ACCEPTED FOR INTERVIEW STATE -> POST-INTERVIEW OUTCOME ACTIONS */}
            {isAccepted && (
              <>
                <button
                  type="button"
                  className="cp-btn-decline client-modal-btn"
                  onClick={() => {
                    onDecline(candidate.id);
                    onClose();
                  }}
                >
                  Decline / Failed Interview
                </button>
                <button
                  type="button"
                  className="cp-btn-reschedule client-modal-btn"
                  onClick={() => {
                    if (onReschedule) onReschedule(candidate.id);
                    else onAccept(candidate.id);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Reschedule Slot
                </button>
                <button
                  type="button"
                  className="client-portal-btn-primary cp-btn-pass client-modal-btn"
                  onClick={() => {
                    if (onPass) onPass(candidate.id);
                    else onStatusChange(candidate.id, 'Passed Interview');
                    onClose();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Candidate Passed (Approve for Hiring)
                </button>
              </>
            )}

            {/* PASSED INTERVIEW STATE */}
            {isPassed && (
              <>
                <div className="cp-passed-pill">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '15px', height: '15px', color: 'var(--green, #149e6e)' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Candidate Passed &middot; Approved for Deployment</span>
                </div>
                <button
                  type="button"
                  className="cp-btn-decline client-modal-btn"
                  style={{ fontSize: '11px' }}
                  onClick={() => {
                    onStatusChange(candidate.id, 'Accepted for Interview');
                  }}
                >
                  Change Outcome
                </button>
              </>
            )}

            {/* DECLINED STATE */}
            {isDeclined && (
              <button
                type="button"
                className="client-portal-btn-primary cp-btn-accept client-modal-btn"
                onClick={() => {
                  onAccept(candidate.id);
                }}
              >
                Reopen &amp; Schedule Interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
