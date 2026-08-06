import { useEffect, useState } from 'react';
import { hasPermission } from '../services/ApplicantRegistrationService';

const GENDER_OPTIONS = ['Male', 'Female', 'Prefer not to say'];
const CIVIL_STATUS_OPTIONS = ['Single', 'Married', 'Widowed', 'Separated'];

const emptyForm = (c) => ({
  name: c.name || '',
  lastName: c.lastName || '',
  middleName: c.middleName || '',
  suffix: c.suffix || '',
  dateOfBirth: c.dateOfBirth || '',
  gender: c.gender || '',
  civilStatus: c.civilStatus || '',
  nationality: c.nationality || '',
  email: c.email || '',
  phone: c.phone || '',
  alternateContact: c.alternateContact || '',
  address: c.address || '',
  location: c.location || '',
});

export default function BasicInfoSection({ candidate, role, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => emptyForm(candidate));
  const [error, setError] = useState('');

  // Reset the draft form whenever a different candidate is opened.
  useEffect(() => {
    setForm(emptyForm(candidate));
    setEditing(false);
    setError('');
  }, [candidate.regId]);

  const canEdit = hasPermission(role, 'editBasicInfo');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError('Name, email, and mobile number are required.');
      return;
    }
    const result = onSave(candidate.regId, form);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError('');
    setEditing(false);
  };

  const handleCancel = () => {
    setForm(emptyForm(candidate));
    setError('');
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="sheet-section">
        <div className="sheet-label">
          <span className="sheet-label-text">
            <span className="sheet-label-icon" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
              <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>
            </span>
            Basic Information
          </span>
          {canEdit && (
            <button type="button" className="link-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
        <div className="meta-grid">
          <div className="meta-row"><div className="k">Full Name</div><div className="v">{[candidate.name, candidate.middleName, candidate.lastName].filter(Boolean).join(' ')}{candidate.suffix ? `, ${candidate.suffix}` : ''}</div></div>
          <div className="meta-row"><div className="k">Contact</div><div className="v">{candidate.email} · {candidate.phone}</div></div>
          {candidate.alternateContact && (
            <div className="meta-row"><div className="k">Alt. Contact</div><div className="v">{candidate.alternateContact}</div></div>
          )}
          <div className="meta-row"><div className="k">Address</div><div className="v">{[candidate.address, candidate.location].filter(Boolean).join(', ') || '—'}</div></div>
          {(candidate.dateOfBirth || candidate.gender || candidate.civilStatus || candidate.nationality) && (
            <div className="meta-row">
              <div className="k">Personal</div>
              <div className="v">
                {[candidate.dateOfBirth, candidate.gender, candidate.civilStatus, candidate.nationality]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </div>
            </div>
          )}
          <div className="meta-row"><div className="k">Registered</div><div className="v">{candidate.registeredDate}</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sheet-section">
      <div className="sheet-label">
        <span className="sheet-label-text">
          <span className="sheet-label-icon" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" /></svg>
          </span>
          Basic Information
        </span>
      </div>
      <div className="edit-form-grid">
        <label>First Name<input type="text" value={form.name} onChange={set('name')} /></label>
        <label>Middle Name<input type="text" value={form.middleName} onChange={set('middleName')} /></label>
        <label>Last Name<input type="text" value={form.lastName} onChange={set('lastName')} /></label>
        <label>Suffix<input type="text" placeholder="Jr., Sr., III..." value={form.suffix} onChange={set('suffix')} /></label>
        <label>Date of Birth<input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></label>
        <label>
          Gender
          <select value={form.gender} onChange={set('gender')}>
            <option value="">—</option>
            {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label>
          Civil Status
          <select value={form.civilStatus} onChange={set('civilStatus')}>
            <option value="">—</option>
            {CIVIL_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>Nationality<input type="text" value={form.nationality} onChange={set('nationality')} /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
        <label>Mobile Number<input type="text" value={form.phone} onChange={set('phone')} /></label>
        <label>Alternate Contact<input type="text" value={form.alternateContact} onChange={set('alternateContact')} /></label>
        <label className="span-2">Address<input type="text" value={form.address} onChange={set('address')} /></label>
        <label>City / Province<input type="text" value={form.location} onChange={set('location')} /></label>
      </div>
      {error && <div className="actions-warning" style={{ textAlign: 'left', marginTop: 8 }}>{error}</div>}
      <div className="stage-btn-row" style={{ marginTop: 10 }}>
        <button type="button" className="stage-btn go" onClick={handleSave}>Save Changes</button>
        <button type="button" className="stage-btn" onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
}