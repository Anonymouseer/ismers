import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../../components/layout/Sidebar';
import { EDUCATION_LEVELS, addDocumentApi } from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
import { useUIFeedback } from '../../../components/common/UIFeedback';
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
  const { showToast, confirmAction, executeWithFeedback } = useUIFeedback();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

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
  const [noWorkExperience, setNoWorkExperience] = useState(false);
  const [noReferences, setNoReferences] = useState(false);

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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError('First name, last name, and mobile number are required at minimum.');
      return;
    }

    const fullName = [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(' ');

    await executeWithFeedback({
      confirmConfig: {
        title: 'Confirm Applicant Registration',
        message: `Register new applicant ${fullName} into the Intake Profiling database?`,
        confirmLabel: 'Register & Save Applicant',
        details: [
          { label: 'Candidate Name', value: fullName },
          { label: 'Mobile Number', value: form.phone.trim() },
          { label: 'Email', value: form.email.trim() || 'N/A' },
          { label: 'Location', value: form.location.trim() || 'Metro Manila' },
        ],
      },
      busyMessage: `Registering candidate file for ${fullName}...`,
      actionFn: async () => {
        setSubmitting(true);
        setError('');

        const education = EDUCATION_LEVELS
          .filter((level) => educationRows[level].school.trim() || educationRows[level].yearGraduated.trim())
          .map((level) => ({
            school: educationRows[level].school.trim(),
            degree: level,
            level,
            startYear: '',
            endYear: educationRows[level].yearGraduated.trim() || '—',
          }));

        const workHistory = noWorkExperience
          ? [{ role: 'First-time Job Seeker / Fresh Graduate', company: 'N/A', duration: 'N/A' }]
          : employmentRows
              .filter((r) => r.position.trim() || r.company.trim())
              .map((r) => ({
                role: r.position.trim(),
                company: r.company.trim(),
                duration: [r.from.trim(), r.to.trim()].filter(Boolean).join(' – ') || '—',
              }));

        const experienceSummary = noWorkExperience
          ? 'No formal work experience yet (Fresh Graduate / First-time Job Seeker)'
          : (form.experienceSummary || (workHistory.length > 0 ? `${workHistory.length} previous position(s)` : 'No formal work experience listed'));

        const references = noReferences
          ? [{ name: 'N/A', occupation: 'Not Applicable', contact: 'N/A' }]
          : referenceRows
              .filter((r) => r.name.trim())
              .map((r) => ({ name: r.name.trim(), occupation: r.occupation.trim(), contact: r.contact.trim() }));

        const result = await addApplicant({ ...form, name: fullName, experienceSummary, education, workHistory, references });

        if (!result || !result.ok) {
          setError(result?.message || 'Error registering applicant.');
          throw new Error(result?.message || 'Error registering applicant.');
        }

        if (resumeFile && result.regId) {
          const formData = new FormData();
          formData.append('file', resumeFile);
          formData.append('name', resumeFile.name);
          formData.append('type', 'Resume / CV');
          try {
            await addDocumentApi(result.regId, formData);
          } catch (e) {
            console.warn('Could not upload attached resume file:', e);
          }
        }

        if (onDone) {
          onDone();
        } else {
          navigate('/applicant-registration');
        }
        return result;
      },
      successTitle: 'Applicant Registered',
      successMessage: `${fullName} has been registered and added to the profiling board.`,
      delayMs: 450,
    });
    setSubmitting(false);
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

            {/* NO SPOUSE OPTION TOGGLE */}
            <div
              className="no-spouse-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--secondary, #E4F0F8)',
                border: '1px solid var(--border, rgba(0, 125, 204, 0.15))',
                borderRadius: '10px',
                marginBottom: '14px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              <input
                type="checkbox"
                id="staffNoSpouseCheck"
                checked={Boolean(form.noSpouse || (form.spouseName === 'N/A' && form.spouseOccupation === 'N/A'))}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((prev) => ({
                    ...prev,
                    noSpouse: checked,
                    spouseName: checked ? 'N/A' : (prev.spouseName === 'N/A' ? '' : prev.spouseName),
                    spouseOccupation: checked ? 'N/A' : (prev.spouseOccupation === 'N/A' ? '' : prev.spouseOccupation),
                  }));
                }}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary, #007DCC)' }}
              />
              <label htmlFor="staffNoSpouseCheck" style={{ cursor: 'pointer', margin: 0, flex: 1, userSelect: 'none' }}>
                Applicant has no spouse (Single / Not Applicable)
              </label>
              {(form.noSpouse || (form.spouseName === 'N/A' && form.spouseOccupation === 'N/A')) && (
                <span style={{ fontSize: '11px', background: 'var(--primary, #007DCC)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  N/A Selected
                </span>
              )}
            </div>

            <div className="edit-form-grid intake-grid">
              <label style={{ opacity: (form.noSpouse || form.spouseName === 'N/A') ? 0.65 : 1 }}>
                Name of Spouse
                <input
                  type="text"
                  value={form.spouseName}
                  onChange={set('spouseName')}
                  placeholder={(form.noSpouse || form.spouseName === 'N/A') ? 'N/A' : ''}
                  disabled={form.noSpouse || form.spouseName === 'N/A'}
                />
              </label>
              <label style={{ opacity: (form.noSpouse || form.spouseOccupation === 'N/A') ? 0.65 : 1 }}>
                Occupation
                <input
                  type="text"
                  value={form.spouseOccupation}
                  onChange={set('spouseOccupation')}
                  placeholder={(form.noSpouse || form.spouseOccupation === 'N/A') ? 'N/A' : ''}
                  disabled={form.noSpouse || form.spouseOccupation === 'N/A'}
                />
              </label>
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
              {!noWorkExperience && (
                <button type="button" className="link-btn" onClick={addEmploymentRow}>+ Add Row</button>
              )}
            </div>

            {/* NO PREVIOUS WORK EXPERIENCE TOGGLE */}
            <div
              className="no-experience-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--secondary, #E4F0F8)',
                border: '1px solid var(--border, rgba(0, 125, 204, 0.15))',
                borderRadius: '10px',
                marginBottom: '14px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              <input
                type="checkbox"
                id="staffNoExperienceCheck"
                checked={noWorkExperience}
                onChange={(e) => setNoWorkExperience(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary, #007DCC)' }}
              />
              <label htmlFor="staffNoExperienceCheck" style={{ cursor: 'pointer', margin: 0, flex: 1, userSelect: 'none' }}>
                Applicant has no previous employment (Fresh Graduate / First-Time Job Seeker)
              </label>
              {noWorkExperience && (
                <span style={{ fontSize: '11px', background: 'var(--primary, #007DCC)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  First-Time Job Seeker
                </span>
              )}
            </div>

            {noWorkExperience ? (
              <div style={{ padding: '16px 20px', background: 'var(--panel, #EDF5FB)', border: '1px dashed var(--border)', borderRadius: '10px', color: 'var(--muted-fg)', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
                Indicated as <strong>First-Time Job Seeker / Fresh Graduate</strong> with no prior employment history.
              </div>
            ) : (
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
            )}
          </div>

          <div className="intake-section">
            <div className="intake-section-title">
              References
              {!noReferences && (
                <button type="button" className="link-btn" onClick={addReferenceRow}>+ Add Row</button>
              )}
            </div>

            {/* NO REFERENCES TOGGLE */}
            <div
              className="no-references-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: 'var(--secondary, #E4F0F8)',
                border: '1px solid var(--border, rgba(0, 125, 204, 0.15))',
                borderRadius: '10px',
                marginBottom: '14px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              <input
                type="checkbox"
                id="staffNoReferencesCheck"
                checked={noReferences}
                onChange={(e) => setNoReferences(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary, #007DCC)' }}
              />
              <label htmlFor="staffNoReferencesCheck" style={{ cursor: 'pointer', margin: 0, flex: 1, userSelect: 'none' }}>
                Applicant has no character references to list (Not Applicable)
              </label>
              {noReferences && (
                <span style={{ fontSize: '11px', background: 'var(--primary, #007DCC)', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  N/A Selected
                </span>
              )}
            </div>

            {noReferences ? (
              <div style={{ padding: '16px 20px', background: 'var(--panel, #EDF5FB)', border: '1px dashed var(--border)', borderRadius: '10px', color: 'var(--muted-fg)', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
                Indicated as <strong>No Character References Available (N/A)</strong>.
              </div>
            ) : (
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
            )}
          </div>

          <div className="intake-section">
            <div className="intake-section-title">Resume &amp; Attached Documents</div>
            <div style={{ padding: '14px', background: 'var(--panel, #EDF5FB)', border: '1px dashed var(--border)', borderRadius: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
                Upload Candidate Resume (PDF / DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                style={{ fontSize: '13px' }}
              />
              {resumeFile && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--green, #149e6e)', fontWeight: 600 }}>
                  Selected: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
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