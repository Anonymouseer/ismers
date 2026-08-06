import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import { EDUCATION_LEVELS } from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
import './ApplicantRegistrationBoard.css';

// Staff-assisted intake form. Mirrors the company's paper "Application
// Form" section order (Applicant Information → Educational Background →
// Employment Record → References) so a staff member transcribing from a
// physical form/resume can go top-to-bottom without hunting for fields.
// Not applicant-facing — this is an internal, authenticated page.

const emptyEmploymentRow = () => ({ from: '', to: '', position: '', company: '' });
const emptyReferenceRow = () => ({ name: '', occupation: '', contact: '' });
const emptyEducationRows = () =>
  EDUCATION_LEVELS.reduce((acc, level) => {
    acc[level] = { school: '', yearGraduated: '' };
    return acc;
  }, {});

export default function RegisterApplicantPage({ embedded = false, onDone }) {
  const { addApplicant } = useApplicantRegistration();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '',
    location: '', address: '',
    age: '', dateOfBirth: '', gender: '', placeOfBirth: '', height: '', weight: '', religion: '', nationality: '',
    phone: '', alternateContact: '', email: '',
    spouseName: '', spouseOccupation: '',
    fatherName: '', fatherOccupation: '',
    motherName: '', motherOccupation: '',
    familyAddress: '',
    emergencyContactName: '', emergencyContactAddress: '',
    experienceSummary: '',
  });
  const [educationRows, setEducationRows] = useState(emptyEducationRows);
  const [employmentRows, setEmploymentRows] = useState([emptyEmploymentRow()]);
  const [referenceRows, setReferenceRows] = useState([emptyReferenceRow()]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setEducationField = (level, field) => (e) =>
    setEducationRows((prev) => ({ ...prev, [level]: { ...prev[level], [field]: e.target.value } }));

  const setEmploymentField = (index, field) => (e) =>
    setEmploymentRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: e.target.value } : row)));
  const addEmploymentRow = () => setEmploymentRows((prev) => [...prev, emptyEmploymentRow()]);
  const removeEmploymentRow = (index) => setEmploymentRows((prev) => prev.filter((_, i) => i !== index));

  const setReferenceField = (index, field) => (e) =>
    setReferenceRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: e.target.value } : row)));
  const addReferenceRow = () => setReferenceRows((prev) => [...prev, emptyReferenceRow()]);
  const removeReferenceRow = (index) => setReferenceRows((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError('First name, last name, and mobile number are required at minimum.');
      return;
    }

    const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ');

    const education = EDUCATION_LEVELS
      .filter((level) => educationRows[level].school.trim() || educationRows[level].yearGraduated.trim())
      .map((level) => ({
        school: educationRows[level].school.trim(),
        degree: level,
        level,
        startYear: '',
        endYear: educationRows[level].yearGraduated.trim() || '—',
      }));

    const workHistory = employmentRows
      .filter((r) => r.position.trim() || r.company.trim())
      .map((r) => ({
        role: r.position.trim(),
        company: r.company.trim(),
        duration: [r.from.trim(), r.to.trim()].filter(Boolean).join(' – ') || '—',
      }));

    const references = referenceRows
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim(), occupation: r.occupation.trim(), contact: r.contact.trim() }));

    const result = addApplicant({ ...form, name: fullName, education, workHistory, references });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    addApplicant(newApplicant);
    if (onDone) {
      onDone();
    } else {
      navigate('/applicant-registration');
    }
  };

  const formContent = (
    <div className="intake-scroll">
      <div className="intake-section">
        <div className="intake-section-title">Applicant Information</div>
        <div className="edit-form-grid intake-grid">
              <label>First Name<input type="text" value={form.firstName} onChange={set('firstName')} /></label>
              <label>Middle Name<input type="text" value={form.middleName} onChange={set('middleName')} /></label>
              <label>Last Name<input type="text" value={form.lastName} onChange={set('lastName')} /></label>
              <label>Suffix<input type="text" placeholder="Jr., Sr., III..." value={form.suffix} onChange={set('suffix')} /></label>
              <label>City Address<input type="text" value={form.location} onChange={set('location')} /></label>
              <label>Provincial Address<input type="text" value={form.address} onChange={set('address')} /></label>
              <label>Cel #<input type="text" value={form.phone} onChange={set('phone')} /></label>
              <label>Alternate Contact<input type="text" value={form.alternateContact} onChange={set('alternateContact')} /></label>
              <label>Email<input type="email" value={form.email} onChange={set('email')} /></label>
              <label>Age<input type="text" value={form.age} onChange={set('age')} /></label>
              <label>Sex<input type="text" value={form.gender} onChange={set('gender')} /></label>
              <label>Date of Birth<input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></label>
              <label>Place of Birth<input type="text" value={form.placeOfBirth} onChange={set('placeOfBirth')} /></label>
              <label>Height<input type="text" placeholder="e.g. 5'6&quot;" value={form.height} onChange={set('height')} /></label>
              <label>Weight<input type="text" placeholder="e.g. 60kg" value={form.weight} onChange={set('weight')} /></label>
              <label>Religion<input type="text" value={form.religion} onChange={set('religion')} /></label>
              <label>Nationality<input type="text" value={form.nationality} onChange={set('nationality')} /></label>
            </div>
          </div>

          <div className="intake-section">
            <div className="intake-section-title">Family / Emergency Information</div>
            <div className="edit-form-grid intake-grid">
              <label>Name of Spouse<input type="text" value={form.spouseName} onChange={set('spouseName')} /></label>
              <label>Occupation<input type="text" value={form.spouseOccupation} onChange={set('spouseOccupation')} /></label>
              <label>Father's Name<input type="text" value={form.fatherName} onChange={set('fatherName')} /></label>
              <label>Occupation<input type="text" value={form.fatherOccupation} onChange={set('fatherOccupation')} /></label>
              <label>Mother's Name<input type="text" value={form.motherName} onChange={set('motherName')} /></label>
              <label>Occupation<input type="text" value={form.motherOccupation} onChange={set('motherOccupation')} /></label>
              <label className="span-2">Family Address<input type="text" value={form.familyAddress} onChange={set('familyAddress')} /></label>
              <label>Emergency Contact Person<input type="text" value={form.emergencyContactName} onChange={set('emergencyContactName')} /></label>
              <label>Address / Contact Number<input type="text" value={form.emergencyContactAddress} onChange={set('emergencyContactAddress')} /></label>
            </div>
          </div>

          <div className="intake-section">
            <div className="intake-section-title">Educational Background</div>
            <div className="intake-table">
              <div className="intake-table-head">
                <div>Level</div>
                <div>School</div>
                <div>Year Graduated</div>
              </div>
              {EDUCATION_LEVELS.map((level) => (
                <div className="intake-table-row" key={level}>
                  <div className="intake-table-level">{level}</div>
                  <input
                    type="text"
                    value={educationRows[level].school}
                    onChange={setEducationField(level, 'school')}
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={educationRows[level].yearGraduated}
                    onChange={setEducationField(level, 'yearGraduated')}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="intake-section">
            <div className="intake-section-title">
              Employment Record
              <button type="button" className="link-btn" onClick={addEmploymentRow}>+ Add Row</button>
            </div>
            <div className="intake-table intake-table-4col">
              <div className="intake-table-head">
                <div>From (Month/Year)</div>
                <div>To (Month/Year)</div>
                <div>Position</div>
                <div>Company</div>
              </div>
              {employmentRows.map((row, i) => (
                <div className="intake-table-row intake-table-4col" key={i}>
                  <input type="text" value={row.from} onChange={setEmploymentField(i, 'from')} />
                  <input type="text" value={row.to} onChange={setEmploymentField(i, 'to')} />
                  <input type="text" value={row.position} onChange={setEmploymentField(i, 'position')} />
                  <div className="intake-table-cell-with-remove">
                    <input type="text" value={row.company} onChange={setEmploymentField(i, 'company')} />
                    {employmentRows.length > 1 && (
                      <button type="button" onClick={() => removeEmploymentRow(i)}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="intake-section">
            <div className="intake-section-title">
              References
              <button type="button" className="link-btn" onClick={addReferenceRow}>+ Add Row</button>
            </div>
            <div className="intake-table intake-table-3col">
              <div className="intake-table-head">
                <div>Name</div>
                <div>Occupation</div>
                <div>Address / Tel. No.</div>
              </div>
              {referenceRows.map((row, i) => (
                <div className="intake-table-row intake-table-3col" key={i}>
                  <input type="text" value={row.name} onChange={setReferenceField(i, 'name')} />
                  <input type="text" value={row.occupation} onChange={setReferenceField(i, 'occupation')} />
                  <div className="intake-table-cell-with-remove">
                    <input type="text" value={row.contact} onChange={setReferenceField(i, 'contact')} />
                    {referenceRows.length > 1 && (
                      <button type="button" onClick={() => removeReferenceRow(i)}>✕</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <div className="actions-warning" style={{ textAlign: 'left', marginBottom: 12 }}>{error}</div>}

          <div className="intake-submit-row">
            <button type="button" className="stage-btn" onClick={() => (onDone ? onDone() : navigate('/applicant-registration'))}>
              Cancel
            </button>
            <button type="button" className="stage-btn go" onClick={handleSubmit}>
              Register Applicant
            </button>
          </div>
    </div>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <div className="app">
      <Sidebar
        activeItem="applicant-registration"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />

      <div className={`main${collapsed ? ' collapsed' : ''}`}>
        <div className="topbar">
          <div className="crumb">
            PRIMEPOWER MANPOWER &nbsp;›&nbsp; <Link to="/applicant-registration" style={{ color: 'inherit', textDecoration: 'none' }}>Applicant Registration & Profiling</Link> &nbsp;›&nbsp; <b>Register Applicant</b>
          </div>
        </div>

        <div className="title-row">
          <div>
            <div className="eyebrow">Core 1 · Applicant Registration &amp; Profiling</div>
            <h1 className="page-title">Register New Applicant</h1>
            <div className="page-sub">Staff-assisted intake — transcribe from the applicant's paper form / resume</div>
          </div>
          <div className="title-row-actions">
            <Link to="/applicant-registration" className="stage-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Back to Applicants
            </Link>
          </div>
        </div>

        {formContent}
      </div>
    </div>
  );
}