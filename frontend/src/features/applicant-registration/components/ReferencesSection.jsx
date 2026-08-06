import { useState } from 'react';
import { hasPermission } from '../services/ApplicantRegistrationService';

export default function ReferencesSection({ candidate, role, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const [occupation, setOccupation] = useState('');
  const [contact, setContact] = useState('');

  const canEdit = hasPermission(role, 'editBasicInfo');
  const references = candidate.references || [];

  const handleAdd = () => {
    onAdd(candidate.regId, { name, occupation, contact });
    setName('');
    setOccupation('');
    setContact('');
  };

  return (
    <div className="sheet-section">
      <div className="sheet-label">
        <span className="sheet-label-text">
          <span className="sheet-label-icon" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="8" cy="8" r="3" /><path d="M2.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><path d="M16.5 7.5 18 9l3-3" /></svg>
          </span>
          References
        </span>
        <span className="sheet-count">{references.length}</span>
      </div>
      <div>
        {references.length === 0 ? (
          <div className="empty-note">No references on file yet.</div>
        ) : (
          references.map((r) => (
            <div className="wh-item" key={r.id}>
              <div>
                <div className="role">{r.name}</div>
                <div className="co">{r.occupation} · {r.contact}</div>
              </div>
              {canEdit && (
                <button type="button" onClick={() => onRemove(candidate.regId, r.id)}>✕</button>
              )}
            </div>
          ))
        )}
      </div>
      {canEdit && (
        <div className="entry-form-grid">
          <label className="span-2">Name<input type="text" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Occupation<input type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} /></label>
          <label>Address / Tel. No.<input type="text" value={contact} onChange={(e) => setContact(e.target.value)} /></label>
          <div className="entry-form-actions">
            <button type="button" className="stage-btn go" onClick={handleAdd}>Add Reference</button>
          </div>
        </div>
      )}
    </div>
  );
}