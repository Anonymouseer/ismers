import { useRef, useState } from 'react';
import { hasPermission } from '../services/ApplicantRegistrationService';

const DOC_TYPES = [
  'Resume / CV',
  'Valid ID',
  'Certificates',
  'Training Certificates',
  'Educational Documents',
  'Other Documents',
];

// NOTE: no backend yet. This section only stores file metadata (name, type,
// upload date) in state — it does NOT actually upload or persist the file
// itself anywhere. "View" / "Download" aren't wired to real files yet.
// Swap in real upload calls once there's a backend + file storage.
export default function DocumentsSection({ candidate, role, onAdd, onRemove }) {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const fileInputRef = useRef(null);

  const canUpload = hasPermission(role, 'uploadDocuments');
  const documents = candidate.documents || [];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onAdd(candidate.regId, { name: file.name, type: docType });
    e.target.value = '';
  };

  return (
    <div className="sheet-section">
      <div className="sheet-label">
        <span className="sheet-label-text">
          <span className="sheet-label-icon" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7Z" /><path d="M14 3v4h4" /></svg>
          </span>
          Documents
        </span>
        <span className="sheet-count">{documents.length}</span>
      </div>
      <div>
        {documents.length === 0 ? (
          <div className="empty-note">No documents uploaded yet.</div>
        ) : (
          documents.map((d) => (
            <div className="wh-item" key={d.id}>
              <div>
                <div className="role">{d.name}</div>
                <div className="co">{d.type} · uploaded {d.uploadedDate}</div>
              </div>
              {canUpload && (
                <button type="button" onClick={() => onRemove(candidate.regId, d.id)}>✕</button>
              )}
            </div>
          ))
        )}
      </div>
      {canUpload && (
        <div className="entry-form-grid">
          <label className="span-2">
            Document Type
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <div className="entry-form-actions">
            <button type="button" className="stage-btn go" onClick={() => fileInputRef.current?.click()}>
              Choose File to Upload
            </button>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}