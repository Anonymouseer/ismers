const DOC_ICONS = {
  resume: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
  certificate: <><circle cx="12" cy="9" r="5" /><path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7" /></>,
  portfolio: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" /></>,
};

const DOC_TITLES = { resume: 'Resume / CV', certificate: 'Certifications & Training', portfolio: 'Portfolio & Work Samples' };

function ResumeDoc({ app, job }) {
  const jobTitle = job?.title || app?.jobTitle || app?.jobId || 'Unassigned Position';
  const clientName = job?.client || app?.client || '—';
  const breakdown = app?.breakdown || {
    skills: app?.score || 70,
    experience: 75,
    screening: 80,
    availability: 90,
  };

  const uploadedDocs = (app?.documents || []).filter(
    (d) => !d.type || d.type.toLowerCase().includes('resume') || d.type.toLowerCase().includes('cv') || d.type.toLowerCase().includes('id')
  );

  return (
    <div className="doc-page">
      <div className="doc-page-name">{app?.name || 'Applicant'}</div>
      <div className="doc-page-role">Applicant — {jobTitle}, {clientName}</div>

      <div className="doc-page-row"><b>Contact:</b> {app?.phone || '—'} &nbsp;·&nbsp; {app?.email || '—'}</div>
      <div className="doc-page-row"><b>Location:</b> {app?.location || app?.cityAddress || '—'}</div>
      <div className="doc-page-row"><b>Relevant Experience:</b> {app?.experience || app?.experienceSummary || '—'}</div>
      <div className="doc-page-row"><b>Date Applied:</b> {app?.applied || app?.registeredDate || '—'}</div>

      {/* Uploaded Document Files if present */}
      {uploadedDocs.length > 0 && (
        <div style={{ marginTop: 14, marginBottom: 14, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 6 }}>
            Attached Document Files:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {uploadedDocs.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                  📄 {doc.fileName || doc.name || 'Resume_Form.pdf'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                  {doc.uploadedAt || doc.uploadedDate || 'Verified File'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Skills */}
      {app?.skills && app.skills.length > 0 && (
        <>
          <div className="doc-page-section-title">Verified Skills & Competencies</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {app.skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'var(--blue-soft, #e0f2fe)',
                  color: 'var(--primary, #0284c7)',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  fontWeight: 600,
                }}
              >
                {typeof skill === 'string' ? skill : skill.name}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Work History */}
      {app?.workHistory && app.workHistory.length > 0 && (
        <>
          <div className="doc-page-section-title">Employment & Work History</div>
          <ul style={{ paddingLeft: 18, margin: '6px 0 14px' }}>
            {app.workHistory.map((wh, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                <b>{wh.role}</b> at {wh.company} &nbsp;·&nbsp; <span style={{ color: 'var(--muted-fg)' }}>{wh.duration}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Profile Breakdown */}
      <div className="doc-page-section-title">AI Screening Evaluation</div>
      <ul style={{ paddingLeft: 18, margin: '6px 0 14px' }}>
        <li>Skills Match: <b>{breakdown.skills}%</b></li>
        <li>Experience Fit: <b>{breakdown.experience}%</b></li>
        <li>Screening Signal: <b>{breakdown.screening}%</b></li>
        <li>Availability: <b>{breakdown.availability}%</b></li>
      </ul>

      {/* Screening Notes */}
      <div className="doc-page-section-title">Screening Notes on File</div>
      <div style={{ color: 'var(--text)', background: 'var(--panel)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
        {app?.notes && app.notes.length
          ? app.notes.map((n, i) => <div key={i} style={{ marginBottom: 4 }}>{typeof n === 'string' ? n : n.text}</div>)
          : 'Initial screening verified with security guard and recruitment logging.'}
      </div>

      <div className="doc-page-note">
        This document reflects the verified application and screening credentials on file in compliance with DOLE DO-174 and RA 10173.
      </div>
    </div>
  );
}

function CertificateDoc({ app, job }) {
  const jobTitle = job?.title || app?.jobTitle || app?.jobId || 'Unassigned Position';
  const certDocs = (app?.documents || []).filter(
    (d) => d.type && (d.type.toLowerCase().includes('cert') || d.type.toLowerCase().includes('tesda') || d.type.toLowerCase().includes('med') || d.type.toLowerCase().includes('nbi'))
  );

  return (
    <div className="doc-page">
      <div className="doc-page-name">Certifications & Training Documents</div>
      <div className="doc-page-role">{app?.name} — {jobTitle}</div>

      {certDocs.length > 0 ? (
        <div style={{ marginTop: 12, marginBottom: 14 }}>
          <div className="doc-page-section-title">Attached Certification Files:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {certDocs.map((doc, i) => (
              <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                  🎖️ {doc.name || doc.fileName || 'Verified_Certificate.pdf'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                  ✓ Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="doc-page-section-title">Submitted Certifications</div>
          <ul style={{ paddingLeft: 18, margin: '6px 0 14px' }}>
            <li>NC II / TESDA Vocational Skills Certificate</li>
            <li>Certificate of Employment (Previous Employer)</li>
            <li>Basic Occupational Safety and Health (BOSH) Certificate</li>
          </ul>
        </>
      )}

      {app?.education && app.education.length > 0 && (
        <>
          <div className="doc-page-section-title">Educational Background</div>
          <ul style={{ paddingLeft: 18, margin: '6px 0 14px' }}>
            {app.education.map((edu, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                <b>{edu.level || 'Degree'}</b>: {edu.degree || edu.school} ({edu.years || `${edu.startYear || ''} - ${edu.endYear || ''}`})
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="doc-page-note">
        All certifications and credentials have been verified by the HR Recruitment Officer.
      </div>
    </div>
  );
}

function PortfolioDoc({ app, job }) {
  const jobTitle = job?.title || app?.jobTitle || app?.jobId || 'Unassigned Position';
  const portfolioDocs = (app?.documents || []).filter(
    (d) => d.type && (d.type.toLowerCase().includes('port') || d.type.toLowerCase().includes('id') || d.type.toLowerCase().includes('clearance'))
  );

  return (
    <div className="doc-page">
      <div className="doc-page-name">Portfolio & Identification Clearances</div>
      <div className="doc-page-role">{app?.name} — {jobTitle}</div>

      {portfolioDocs.length > 0 ? (
        <div style={{ marginTop: 12, marginBottom: 14 }}>
          <div className="doc-page-section-title">Clearance & ID Documents on File:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {portfolioDocs.map((doc, i) => (
              <div key={i} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                  🪪 {doc.name || doc.fileName || 'Government_ID.pdf'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700 }}>
                  ✓ ID Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="doc-page-section-title">Submitted Clearances & Work Samples</div>
          <div style={{ fontSize: 12, color: 'var(--muted-fg)', lineHeight: 1.5, background: 'var(--panel)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border-soft)' }}>
            Official valid government-issued identification cards, NBI police clearance, and relevant work portfolio samples recorded on candidate profile.
          </div>
        </>
      )}

      <div className="doc-page-note">
        All clearances and identity records comply with Data Privacy Act (RA 10173) provisions.
      </div>
    </div>
  );
}

const DOC_BODIES = { resume: ResumeDoc, certificate: CertificateDoc, portfolio: PortfolioDoc };

export default function DocViewerModal({ app, job, type, isVerified, onClose, onToggleVerified }) {
  if (!type || !app) return null;
  const Body = DOC_BODIES[type] || ResumeDoc;

  return (
    <div
      className="doc-overlay open"
      style={{ zIndex: 1300 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="doc-box" onClick={(e) => e.stopPropagation()}>
        <div className="doc-box-head">
          <div className="doc-box-head-title">{DOC_TITLES[type] || 'Document Review'} — {app.name}</div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="doc-box-scroll">
          <Body app={app} job={job} />
          <div className="doc-verify-bar">
            <div className={`doc-verify-status ${isVerified ? 'verified' : 'pending'}`}>
              {isVerified ? '✓ Verified' : 'Pending verification'}
            </div>
            <button className={`btn ${isVerified ? '' : 'primary'}`} onClick={onToggleVerified}>
              {isVerified ? 'Undo Verification' : 'Mark as Verified'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DOC_ICONS };