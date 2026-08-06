import { useState } from 'react';
import { hasPermission } from '../services/ApplicantRegistrationService';

export default function EducationSection({ candidate, role, onAdd, onRemove }) {
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [level, setLevel] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');

  const canEdit = hasPermission(role, 'editEducation');
  const education = candidate.education || [];

  const handleAdd = () => {
    onAdd(candidate.regId, { school, degree, level, startYear, endYear });
    setSchool('');
    setDegree('');
    setLevel('');
    setStartYear('');
    setEndYear('');
  };

  return (
    <div className="sheet-section">
      <div className="sheet-label">
        <span className="sheet-label-text">
          <span className="sheet-label-icon" style={{ background: 'var(--secondary)', color: 'var(--primary)' }}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M2 9.5 12 5l10 4.5-10 4.5-10-4.5Z" /><path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" /></svg>
          </span>
          Education
        </span>
        <span className="sheet-count">{education.length}</span>
      </div>
      <div>
        {education.length === 0 ? (
          <div className="empty-note">No education on file yet.</div>
        ) : (
          education.map((e) => (
            <div className="wh-item" key={e.id}>
              <div>
                <div className="role">{e.degree}</div>
                <div className="co">{e.school} · {e.level} · {e.startYear}–{e.endYear}</div>
              </div>
              {canEdit && (
                <button type="button" onClick={() => onRemove(candidate.regId, e.id)}>✕</button>
              )}
            </div>
          ))
        )}
      </div>
      {canEdit && (
        <div className="entry-form-grid">
          <label className="span-2">School / Institution<input type="text" placeholder="e.g. Bestlink College" value={school} onChange={(e) => setSchool(e.target.value)} /></label>
          <label className="span-2">Degree / Course<input type="text" placeholder="e.g. BS Information Technology" value={degree} onChange={(e) => setDegree(e.target.value)} /></label>
          <label>Level<input type="text" placeholder="e.g. Senior High School" value={level} onChange={(e) => setLevel(e.target.value)} /></label>
          <label>&nbsp;</label>
          <label>Start Year<input type="text" placeholder="2020" value={startYear} onChange={(e) => setStartYear(e.target.value)} /></label>
          <label>End Year<input type="text" placeholder="2022" value={endYear} onChange={(e) => setEndYear(e.target.value)} /></label>
          <div className="entry-form-actions">
            <button type="button" className="stage-btn go" onClick={handleAdd}>Add Education</button>
          </div>
        </div>
      )}
    </div>
  );
}