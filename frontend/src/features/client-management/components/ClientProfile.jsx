import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JobOrderCard from './JobOrderCard';
import JobDetailView from './JobDetailView';
import {
  logoUrl, openPositionsFor, renewalStatus, STATUS_LABEL_MAP,
  colorFor, softFor, getCompanyId,
} from '../utils/clientDisplay';

export default function ClientProfile({ client, clientIndex, onBack, onUpdateStatus }) {
  const navigate = useNavigate();
  const c = client;
  const [openJobIndex, setOpenJobIndex] = useState(null);
  const [status, setStatus] = useState(c.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  useEffect(() => {
    setOpenJobIndex(null);
    setStatus(c.status);
    setStatusMenuOpen(false);
  }, [clientIndex, c.status]);

  const handleStatusSelect = async (newStatus) => {
    setStatus(newStatus);
    setStatusMenuOpen(false);
    if (onUpdateStatus) {
      await onUpdateStatus(c.id || c.companyId || c.name, newStatus);
    }
  };

  const openPositions = openPositionsFor(c);
  const statusLabel = STATUS_LABEL_MAP[status] || 'Active Client';
  const renewalInfo = renewalStatus(c.renewal);
  const renewalWarn = renewalInfo.expired || (renewalInfo.days !== null && renewalInfo.days <= 30);
  const companyId = getCompanyId(c, clientIndex);

  const accent = 'var(--primary)';
  const tintA = 'var(--secondary)';
  const heroStyle = { '--hero-accent': accent, '--hero-tint-a': tintA, '--hero-tint-b': 'var(--panel)' };

  const filledJobs = c.jobs.filter((j) => j.filled < j.total).length;

  return (
    <div className="profile-view" onClick={() => statusMenuOpen && setStatusMenuOpen(false)}>
      {openJobIndex === null && (
        <>
          <div className="back-btn" onClick={onBack}>
            <svg className="icon" viewBox="0 0 24 24"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
            Back to Clients
          </div>

          <div className="hero-banner" style={heroStyle}>
            <div className="hero-top">
              <img className="hero-logo" src={logoUrl(c.name)} alt="" />
              <div className="hero-title-wrap">
                <div className="hero-name">{c.name}</div>
                <div className="hero-badges">
                  <span className="hero-pill company-id" title="PRIMEPOWER Corporate Client ID">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 12, height: 12 }}>
                      <rect x="3" y="4" width="18" height="16" rx="2" />
                      <path d="M7 8h10M7 12h10M7 16h6" />
                    </svg>
                    {companyId}
                  </span>
                  <span className={`hero-pill status-${status}`}><span className="dot"></span>{statusLabel}</span>
                  <span className="hero-pill tenure">Client for {c.tenure}</span>
                </div>
              </div>
              <div className="hero-actions">
                <button
                  type="button"
                  className="hero-btn"
                  onClick={() => navigate(`/client-communications?clientId=${c.id || companyId}`)}
                  title="Direct Message Client"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Message Client
                </button>
                <button className="hero-btn primary"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8.5 11h7M8.5 14.5h7" /></svg>New Job Order</button>
                <div className="status-menu-wrap">
                  <button className="hero-btn" onClick={(e) => { e.stopPropagation(); setStatusMenuOpen((v) => !v); }}>
                    Status <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 11, height: 11 }}><path d="m6 9 6 6 6-6" /></svg>
                  </button>
                  {statusMenuOpen && (
                    <div className="status-menu open" onClick={(e) => e.stopPropagation()}>
                      <div style={{ padding: '8px 12px 6px', fontSize: '11px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                        Update Client Status
                      </div>
                      <div className={`status-menu-item ok ${status === 'active' ? 'active' : ''}`} onClick={() => handleStatusSelect('active')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Set Active
                      </div>
                      <div className={`status-menu-item info ${status === 'prospect' ? 'active' : ''}`} onClick={() => handleStatusSelect('prospect')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        Set Prospect
                      </div>
                      <div className={`status-menu-item danger ${status === 'inactive' ? 'active' : ''}`} onClick={() => handleStatusSelect('inactive')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        Set Inactive
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hero-meta-row">
              <div className="hero-meta-item">
                <div className="hero-meta-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21v-6h6v6" /></svg></div>
                <div><div className="hero-meta-label">Industry</div><div className="hero-meta-value">{c.industry}</div></div>
              </div>
              <div className="hero-meta-item">
                <div className="hero-meta-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg></div>
                <div><div className="hero-meta-label">Address</div><div className="hero-meta-value">{c.address || '—'}</div></div>
              </div>
              <div className="hero-meta-item">
                <div className="hero-meta-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 20h6M12 3a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7Z" /></svg></div>
                <div><div className="hero-meta-label">Account Manager</div><div className="hero-meta-value">{c.am}</div></div>
              </div>
              <div className="hero-meta-item">
                <div className="hero-meta-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg></div>
                <div><div className="hero-meta-label">Contract Renewal</div><div className={`hero-meta-value${renewalWarn ? ' warn' : ''}`}>{c.renewal}</div></div>
              </div>
            </div>

            <div className="stat-strip">
              <div className="stat-strip-item">
                <div className="stat-strip-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8.5 11h7M8.5 14.5h7" /></svg>Job Orders</div>
                <div className="stat-strip-value">{c.jobs.length}</div>
              </div>
              <div className="stat-strip-item">
                <div className="stat-strip-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" /></svg>Open Positions</div>
                <div className="stat-strip-value accent">{openPositions}</div>
              </div>
              <div className="stat-strip-item">
                <div className="stat-strip-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><path d="M17 5.5c0-1.7-2.2-3-5-3s-5 1.3-5 3 2.2 3 5 3 5 1.3 5 3-2.2 3-5 3-5-1.3-5-3" /></svg>Revenue this Q</div>
                <div className="stat-strip-value">{c.revenueQ}</div>
              </div>
              <div className="stat-strip-item">
                <div className="stat-strip-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>Billing Rate</div>
                <div className="stat-strip-value">{c.rate}</div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="d-main-panel">
        {openJobIndex === null ? (
          <div className="d-scroll">
            <div className="section-head2">
              <div className="section-title2">Job Orders</div>
              <div className="section-count2">{c.jobs.length} total · {filledJobs} currently filling</div>
            </div>
            {c.jobs.length ? (
              <div className="jo-grid">
                {c.jobs.map((j, jIdx) => (
                  <JobOrderCard
                    key={jIdx}
                    client={c}
                    job={j}
                    jobIndex={jIdx}
                    onOpen={setOpenJobIndex}
                  />
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--muted)', fontSize: 11.5 }}>No job orders yet for this client.</div>
            )}
          </div>
        ) : (
          <div className="d-scroll">
            <JobDetailView
              client={c}
              job={c.jobs[openJobIndex]}
              jobIndex={openJobIndex}
              onBack={() => setOpenJobIndex(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}