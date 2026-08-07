import { useState } from 'react';
import { CATEGORIES, EDUCATION_LEVELS } from '../services/ApplicantRegistrationService';
import { useApplicantRegistration } from '../store/ApplicantRegistrationStore';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './ApplicantRegistrationBoard.css';
import './PublicApplyPage.css';

// Public, unauthenticated self-service application page — no Sidebar/topbar,
// no login. Meant to be shared as a plain link (e.g. "apply here:
// yoursite.com/apply") for applicants to fill out on their own phone.
//
// Field set mirrors the staff-assisted RegisterApplicantPage exactly so the
// applicant can self-complete the full profile. Broken into a multi-step
// wizard for a less overwhelming mobile experience. Submissions land with
// submissionSource: 'self-service' so staff can spot them on the board.

const STEPS = [
  { key: 'personal', label: 'Applicant Information' },
  { key: 'family',   label: 'Family / Emergency' },
  { key: 'education', label: 'Educational Background' },
  { key: 'employment', label: 'Employment Record' },
  { key: 'references', label: 'References and Submit' },
];

const emptyEmploymentRow = () => ({ from: '', to: '', position: '', company: '' });
const emptyReferenceRow = () => ({ name: '', occupation: '', contact: '' });
const emptyEducationRows = () =>
  EDUCATION_LEVELS.reduce((acc, level) => {
    acc[level] = { school: '', yearGraduated: '' };
    return acc;
  }, {});

export default function PublicApplyPage() {
  const { addApplicant } = useApplicantRegistration();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '',
    location: '', address: '',
    age: '', dateOfBirth: '', gender: '', placeOfBirth: '', height: '', weight: '', religion: '', nationality: '',
    phone: '', alternateContact: '', email: '',
    civilStatus: '',
    spouseName: '', spouseOccupation: '',
    fatherName: '', fatherOccupation: '',
    motherName: '', motherOccupation: '',
    familyAddress: '',
    emergencyContactName: '', emergencyContactAddress: '',
    category: '',
    experienceSummary: '',
  });
  const [educationRows, setEducationRows] = useState(emptyEducationRows);
  const [employmentRows, setEmploymentRows] = useState([emptyEmploymentRow()]);
  const [referenceRows, setReferenceRows] = useState([emptyReferenceRow()]);
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [submittedRegId, setSubmittedRegId] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };

  // Step validation — only the first step requires mandatory fields
  const validateStep = () => {
    setError('');
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
        setError('First name, last name, and mobile number are required.');
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (target) => {
    // Only allow going back freely; going forward requires validation
    if (target < step) {
      setError('');
      setStep(target);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError('First name, last name, and mobile number are required.');
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
        endYear: educationRows[level].yearGraduated.trim() || '',
      }));

    const workHistory = employmentRows
      .filter((r) => r.position.trim() || r.company.trim())
      .map((r) => ({
        role: r.position.trim(),
        company: r.company.trim(),
        duration: [r.from.trim(), r.to.trim()].filter(Boolean).join(' - ') || '',
      }));

    const references = referenceRows
      .filter((r) => r.name.trim())
      .map((r) => ({ name: r.name.trim(), occupation: r.occupation.trim(), contact: r.contact.trim() }));

    const documents = resumeFile
      ? [{ name: resumeFile.name, type: 'Resume / CV' }]
      : [];

    const result = addApplicant({
      ...form,
      name: fullName,
      education,
      workHistory,
      references,
      documents,
      submissionSource: 'self-service',
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSubmittedRegId(result.regId);
  };

  // ---- Success state ----
  if (submittedRegId) {
    return (
      <div className="public-apply-page">
        <div className="public-apply-success">
          <div className="public-apply-success-icon">
            <svg className="icon" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <div className="public-apply-success-title">Application Received</div>
          <div className="public-apply-success-sub">
            Thank you for applying. Our team will review your application and reach out
            using the contact details you provided.
          </div>
          <div className="public-apply-regid">Reference No. {submittedRegId}</div>
        </div>
      </div>
    );
  }

  // ---- Step content renderers ----
  const renderPersonalInfo = () => (
    <div className="numbered-section">
      <div className="numbered-section-title">
        <span className="numbered-section-badge">1</span>
        Applicant Information
      </div>
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
        <label>Height<input type="text" placeholder={'e.g. 5\'6"'} value={form.height} onChange={set('height')} /></label>
        <label>Weight<input type="text" placeholder="e.g. 60kg" value={form.weight} onChange={set('weight')} /></label>
        <label>Religion<input type="text" value={form.religion} onChange={set('religion')} /></label>
        <label>Nationality<input type="text" value={form.nationality} onChange={set('nationality')} /></label>
        <label>
          Position Interest
          <select value={form.category} onChange={set('category')}>
            <option value="">-- Select one --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );

  const renderFamilyInfo = () => (
    <div className="numbered-section">
      <div className="numbered-section-title">
        <span className="numbered-section-badge">2</span>
        Family / Emergency Information
      </div>
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
  );

  const renderEducation = () => (
    <div className="numbered-section">
      <div className="numbered-section-title">
        <span className="numbered-section-badge">3</span>
        Educational Background
      </div>
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
  );

  const renderEmployment = () => (
    <div className="numbered-section">
      <div className="numbered-section-title">
        <span className="numbered-section-badge">4</span>
        Employment Record
        <button type="button" className="link-btn" style={{ marginLeft: 'auto' }} onClick={addEmploymentRow}>+ Add Row</button>
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
                <button type="button" onClick={() => removeEmploymentRow(i)}>x</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Resume upload */}
      <div style={{ marginTop: 20 }}>
        <div className="numbered-section-title" style={{ marginBottom: 12 }}>
          <span className="numbered-section-badge" style={{ background: 'var(--muted-fg)' }}>
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 12, height: 12, color: '#fff' }}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          </span>
          Upload Resume
          <span className="numbered-section-hint">Optional</span>
        </div>
        <label htmlFor="resume-upload" className="public-file-drop">
          <div style={{ fontSize: 12, fontWeight: 700 }}>
            {resumeFile ? 'Change file' : 'Tap to upload your resume'}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>
            PDF, JPG, or PNG -- a photo of your resume works too
          </div>
          {resumeFile && <div className="public-file-drop-filename">{resumeFile.name}</div>}
        </label>
        <input id="resume-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>
    </div>
  );

  const renderReferences = () => (
    <div className="numbered-section">
      <div className="numbered-section-title">
        <span className="numbered-section-badge">5</span>
        References
        <button type="button" className="link-btn" style={{ marginLeft: 'auto' }} onClick={addReferenceRow}>+ Add Row</button>
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
                <button type="button" onClick={() => removeReferenceRow(i)}>x</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const stepRenderers = [
    renderPersonalInfo,
    renderFamilyInfo,
    renderEducation,
    renderEmployment,
    renderReferences,
  ];

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="public-apply-page">
      {/* Header with company logo */}
      <div className="public-apply-header">
        <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="public-apply-logo" />
        <div>
          <div className="public-apply-brand-name">PRIMEPOWER MANPOWER</div>
          <div className="public-apply-brand-sub">HR Smart Recruitment System</div>
        </div>
      </div>

      {/* Intro banner */}
      <div className="public-apply-intro">
        <div className="public-apply-title">Apply Now</div>
        <div className="public-apply-sub">
          Complete the application form below. All sections can be filled out at your own pace.
          Our recruitment team will follow up with you after review.
        </div>
      </div>

      {/* Stepper indicator */}
      <div className="public-apply-stepper">
        {STEPS.map((s, i) => {
          let cls = 'pa-step';
          if (i < step) cls += ' done';
          else if (i === step) cls += ' current';
          else cls += ' future';

          return (
            <div
              key={s.key}
              className={cls}
              onClick={() => goToStep(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && goToStep(i)}
            >
              <div className="pa-step-dot">
                {i < step ? (
                  <svg className="icon" viewBox="0 0 24 24" style={{ width: 11, height: 11 }}><path d="M20 6 9 17l-5-5" /></svg>
                ) : (
                  i + 1
                )}
              </div>
              <div className="pa-step-label">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="public-apply-form">
        {stepRenderers[step]()}

        {error && <div className="actions-warning" style={{ textAlign: 'left', marginBottom: 12 }}>{error}</div>}

        <div className="public-apply-nav-row">
          {step > 0 && (
            <button type="button" className="stage-btn" onClick={goBack}>
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14 }}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              Previous
            </button>
          )}
          <div style={{ flex: 1 }} />
          {!isLastStep ? (
            <button type="button" className="stage-btn go" onClick={goNext}>
              Next Step
              <svg className="icon" viewBox="0 0 24 24" style={{ width: 14, height: 14, color: '#fff' }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <button type="button" className="stage-btn go" onClick={handleSubmit}>
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
