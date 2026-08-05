import { useState, useEffect } from 'react';
import JobOrderCard from './JobOrderCard';
import JobDetailView from './JobDetailView';
import ContractTab from './ContractTab';
import NotesTab from './NotesTab';
import ActivityTab from './ActivityTab';
import { colorFor, softFor, initials, STATUS_LABEL_MAP } from '../utils/clientDisplay';

const TABS = [
  { key: 'jobs', label: 'Job Orders' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'contract', label: 'Contract' },
  { key: 'notes', label: 'Notes' },
  { key: 'activity', label: 'Activity' },
  { key: 'documents', label: 'Documents' },
];

export default function ClientDetailPanel({ client, clientIndex, onClose }) {
  const c = client;
  const [activeTab, setActiveTab] = useState('jobs');
  const [openJobIndex, setOpenJobIndex] = useState(null);
  // NEW: Client Status Management — local override until wired to a real API.
  const [status, setStatus] = useState(c.status);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Reset to the Jobs tab, close any open job, and reset status whenever a different client is selected.
  useEffect(() => {
    setActiveTab('jobs');
    setOpenJobIndex(null);
    setStatus(c.status);
    setStatusMenuOpen(false);
  }, [clientIndex]);

  // Close the inline job detail view on Escape, matching the original page behavior.
  useEffect(() => {
    if (openJobIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setOpenJobIndex(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openJobIndex]);

  const openPositions = c.jobs.reduce((sum, j) => sum + Math.max(j.total - j.filled, 0), 0);
  const allTags = [...new Set(c.jobs.flatMap((j) => j.tags || []))];
  const statusLabel = STATUS_LABEL_MAP[status] || 'Active Client';

  return (
    <div
      id="detailContent"
      style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      onClick={() => statusMenuOpen && setStatusMenuOpen(false)}
    >
      <div className="d-head-flat">
        <div className="d-avatar-ring">
          <div className="d-logo" style={{ background: colorFor(clientIndex) }}>{initials(c.name)}</div>
        </div>
        <div className="d-title-wrap">
          <div className="d-name">{c.name}</div>
          <div className="d-badges">
            <span className={`d-badge status-${status}`}><span className="dot"></span>{statusLabel}</span>
            <span className="d-badge"><span className="dot"></span>Client for {c.tenure}</span>
          </div>
        </div>
        <div className="d-actions">
          <button className="btn"><svg className="icon" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>Edit</button>
          <button className="btn primary"><svg className="icon" viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M8.5 11h7M8.5 14.5h7" /></svg>New Job Order</button>
          {/* NEW: Client Status Management */}
          <div className="status-menu-wrap">
            <button className="btn" onClick={() => setStatusMenuOpen((v) => !v)}>
              Status <svg className="icon" viewBox="0 0 24 24" style={{ width: 12, height: 12 }}><path d="m6 9 6 6 6-6" /></svg>
            </button>
            {statusMenuOpen && (
              <div className="status-menu open">
                {status !== 'suspended' && (
                  <div className="status-menu-item warn" onClick={() => { setStatus('suspended'); setStatusMenuOpen(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5v5M14.5 9.5v5" /></svg>
                    Suspend Client
                  </div>
                )}
                {status !== 'archived' && (
                  <div className="status-menu-item danger" onClick={() => { setStatus('archived'); setStatusMenuOpen(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 8v13H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" /></svg>
                    Archive Client
                  </div>
                )}
                {status !== 'active' && (
                  <>
                    <div className="status-menu-divider"></div>
                    <div className="status-menu-item ok" onClick={() => { setStatus('active'); setStatusMenuOpen(false); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9" /><path d="M3 4v5h5" /></svg>
                      Reactivate
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <button className="btn" title="Close" onClick={onClose}><svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        </div>
      </div>

      <div className="d-stats-row">
        <div className="d-stat-card">
          <div className="d-stat-label">Job Orders</div>
          <div className="d-stat-value">{c.jobs.length}</div>
        </div>
        <div className="d-stat-card">
          <div className="d-stat-label">Open Positions</div>
          <div className="d-stat-value">{openPositions}</div>
        </div>
        <div className="d-stat-card">
          <div className="d-stat-label">Revenue this Q</div>
          <div className="d-stat-value">{c.revenueQ}</div>
        </div>
        <div className="d-stat-card">
          <div className="d-stat-label">Account Manager</div>
          <div className="d-stat-value small">{c.am}</div>
        </div>
      </div>

      <div className="panel d-lower-grid">
        <div className="d-details-panel">
          <div className="panel-title" style={{ marginBottom: 2 }}>Details</div>
          <div className="d-detail-row">
            <div className="d-detail-row-icon" style={{ background: softFor(0), color: colorFor(0) }}><svg className="icon" viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14" /><path d="M9 21v-6h6v6" /></svg></div>
            <div><div className="d-detail-label">Industry</div><div className="d-detail-value">{c.industry}</div></div>
          </div>
          <div className="d-detail-row">
            <div className="d-detail-row-icon" style={{ background: softFor(1), color: colorFor(1) }}><svg className="icon" viewBox="0 0 24 24"><path d="M9 20h6M12 3a7 7 0 0 0-7 7c0 5 7 11 7 11s7-6 7-11a7 7 0 0 0-7-7Z" /></svg></div>
            <div><div className="d-detail-label">Account Manager</div><div className="d-detail-value">{c.am}</div></div>
          </div>
          <div className="d-detail-row">
            <div className="d-detail-row-icon" style={{ background: softFor(2), color: colorFor(2) }}><svg className="icon" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><path d="M4 9h16M9 4v16" /></svg></div>
            <div><div className="d-detail-label">Contract Type</div><div className="d-detail-value">{c.contract}</div></div>
          </div>
          <div className="d-detail-row">
            <div className="d-detail-row-icon" style={{ background: softFor(3), color: colorFor(3) }}><svg className="icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 3v3M16 3v3" /></svg></div>
            <div><div className="d-detail-label">Renewal Date</div><div className="d-detail-value">{c.renewal}</div></div>
          </div>
          <div className="d-detail-row">
            <div className="d-detail-row-icon" style={{ background: softFor(4), color: colorFor(4) }}><svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5h4" /></svg></div>
            <div><div className="d-detail-label">Billing Rate</div><div className="d-detail-value">{c.rate}</div></div>
          </div>
          <div className="d-detail-row">
            <div className="d-detail-row-icon" style={{ background: softFor(5), color: colorFor(5) }}><svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg></div>
            <div><div className="d-detail-label">Client Tenure</div><div className="d-detail-value">{c.tenure}</div></div>
          </div>

          {allTags.length > 0 && (
            <div className="d-tags-section">
              <div className="d-detail-label">Tags</div>
              <div className="d-tags-row modal-tag-row">
                {allTags.map((t, i) => <span className="modal-tag" key={i}>{t}</span>)}
              </div>
            </div>
          )}

          <div className="d-manager-foot">
            <div className="avatar" style={{ background: colorFor(clientIndex) }}>{initials(c.am)}</div>
            <div>
              <div className="d-manager-name">{c.am}</div>
              <div className="d-manager-role">Account Manager</div>
            </div>
          </div>
        </div>

        <div className="d-main-panel">
          {openJobIndex === null ? (
            <div className="d-main-default">
              <div className="tabs">
                {TABS.map((tab) => (
                  <div
                    key={tab.key}
                    className={`tab${activeTab === tab.key ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </div>
                ))}
              </div>

              <div className="d-scroll">
                <div className={`tab-panel${activeTab === 'jobs' ? ' active' : ''}`}>
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

                <div className={`tab-panel${activeTab === 'contacts' ? ' active' : ''}`}>
                  {c.contacts.map((p, idx) => (
                    <div className="contact-card" key={idx}>
                      <div className="contact-avatar">{initials(p.name)}</div>
                      <div className="contact-info">
                        <div className="contact-name">{p.name}</div>
                        <div className="contact-role">{p.role}</div>
                      </div>
                      <div className="contact-mail">{p.email}</div>
                    </div>
                  ))}
                </div>

                <div className={`tab-panel${activeTab === 'contract' ? ' active' : ''}`}>
                  <ContractTab client={c} />
                </div>

                <div className={`tab-panel${activeTab === 'notes' ? ' active' : ''}`}>
                  <NotesTab key={clientIndex} initialNotes={c.notes} />
                </div>

                <div className={`tab-panel${activeTab === 'activity' ? ' active' : ''}`}>
                  <ActivityTab activity={c.activity} />
                </div>

                <div className={`tab-panel${activeTab === 'documents' ? ' active' : ''}`}>
                  {c.documents.length ? c.documents.map((d, idx) => (
                    <div className="doc-row" key={idx}>
                      <div className="doc-icon"><svg className="icon" viewBox="0 0 24 24"><path d="M14 3v5a1 1 0 0 0 1 1h5" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" /></svg></div>
                      <div className="doc-info">
                        <div className="doc-name">{d.name}</div>
                        <div className="doc-meta">{d.meta}</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ color: 'var(--muted)', fontSize: 11.5 }}>No documents on file.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <JobDetailView
              client={c}
              job={c.jobs[openJobIndex]}
              jobIndex={openJobIndex}
              onBack={() => setOpenJobIndex(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}