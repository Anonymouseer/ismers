const DOC_ICONS = {
  resume: <><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></>,
  certificate: <><circle cx="12" cy="9" r="5" /><path d="m8.5 13.5-1.5 7 5-3 5 3-1.5-7" /></>,
  portfolio: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" /></>,
};

const DOC_TITLES = { resume: 'Resume', certificate: 'Certificates', portfolio: 'Portfolio' };

function ResumeDoc({ app, job }) {
  const jobTitle = job?.title || app?.jobTitle || app?.jobId || 'Unassigned Position';
  const clientName = job?.client || app?.client || '—';
  const breakdown = app?.breakdown || {
    skills: app?.score || 70,
    experience: 75,
    screening: 80,
    availability: 90,
  };

  return (
    <div className="doc-page">
      <div className="doc-page-name">{app?.name || 'Applicant'}</div>
      <div className="doc-page-role">Applicant — {jobTitle}, {clientName}</div>
      <div className="doc-page-row"><b>Location:</b> {app?.location || '—'}</div>
      <div className="doc-page-row"><b>Relevant Experience:</b> {app?.experience || '—'}</div>
      <div className="doc-page-row"><b>Date Applied:</b> {app?.applied || '—'}</div>
      <div className="doc-page-section-title">Profile Summary (AI-Extracted)</div>
      <ul>
        <li>Skills Match: {breakdown.skills}%</li>
        <li>Experience Fit: {breakdown.experience}%</li>
        <li>Screening Signal: {breakdown.screening}%</li>
        <li>Availability: {breakdown.availability}%</li>
      </ul>
      <div className="doc-page-section-title">Screening Notes on File</div>
      <div>
        {app?.notes && app.notes.length
          ? app.notes.map((n, i) => <div key={i}>{n.text}</div>)
          : 'No screening notes recorded yet.'}
      </div>
      <div className="doc-page-note">This is a system-generated summary standing in for the applicant's uploaded resume file.</div>
    </div>
  );
}

function CertificateDoc({ app, job }) {
  const jobTitle = job?.title || app?.jobTitle || app?.jobId || 'Unassigned Position';
  return (
    <div className="doc-page">
      <div className="doc-page-name">Certificates on File</div>
      <div className="doc-page-role">{app?.name} — {jobTitle}</div>
      <div className="doc-page-section-title">Submitted Certifications</div>
      <ul>
        <li>NC II / Relevant Skills Certificate</li>
        <li>Certificate of Employment (most recent role)</li>
        <li>Training / Orientation Completion Certificate</li>
      </ul>
      <div className="doc-page-note">Placeholder listing — actual certificate scans would render here once file storage is connected.</div>
    </div>
  );
}

function PortfolioDoc({ app, job }) {
  const jobTitle = job?.title || app?.jobTitle || app?.jobId || 'Unassigned Position';
  return (
    <div className="doc-page">
      <div className="doc-page-name">Portfolio</div>
      <div className="doc-page-role">{app?.name} — {jobTitle}</div>
      <div className="doc-page-section-title">Submitted Work Samples</div>
      <div>No portfolio items uploaded for this role type, or file preview is not yet connected.</div>
      <div className="doc-page-note">Portfolio uploads typically apply to creative, technical, or specialist roles.</div>
    </div>
  );
}

const DOC_BODIES = { resume: ResumeDoc, certificate: CertificateDoc, portfolio: PortfolioDoc };

export default function DocViewerModal({ app, job, type, isVerified, onClose, onToggleVerified }) {
  if (!type) return null;
  const Body = DOC_BODIES[type];

  return (
    <div className="doc-overlay open" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="doc-box">
        <div className="doc-box-head">
          <div className="doc-box-head-title">{DOC_TITLES[type]} — {app.name}</div>
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