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
  const [noWorkExperience, setNoWorkExperience] = useState(false);
  const [noReferences, setNoReferences] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState('');
  const [submittedRegId, setSubmittedRegId] = useState(null);
  const [stepKey, setStepKey] = useState(0);

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
    setStepKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
    setStepKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep = (target) => {
    if (target < step) {
      setError('');
      setStep(target);
      setStepKey((k) => k + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim()) {
      setError('First name, last name, and mobile number are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
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

      const workHistory = noWorkExperience
        ? [{ role: 'First-time Job Seeker / Fresh Graduate', company: 'N/A', duration: 'N/A' }]
        : employmentRows
            .filter((r) => r.position.trim() || r.company.trim())
            .map((r) => ({
              role: r.position.trim(),
              company: r.company.trim(),
              duration: [r.from.trim(), r.to.trim()].filter(Boolean).join(' - ') || '',
            }));

      const experienceSummary = noWorkExperience
        ? 'No formal work experience yet (Fresh Graduate / First-Time Job Seeker)'
        : (form.experienceSummary || (workHistory.length > 0 ? `${workHistory.length} previous position(s)` : 'No formal work experience listed'));

      const references = noReferences
        ? [{ name: 'N/A', occupation: 'Not Applicable', contact: 'N/A' }]
        : referenceRows
            .filter((r) => r.name.trim())
            .map((r) => ({ name: r.name.trim(), occupation: r.occupation.trim(), contact: r.contact.trim() }));

      const documents = resumeFile
        ? [{ name: resumeFile.name, type: 'Resume / CV' }]
        : [];

      const result = await addApplicant({
        ...form,
        name: fullName,
        experienceSummary,
        education,
        workHistory,
        references,
        documents,
        submissionSource: 'self-service',
      });

      if (!result || !result.ok) {
        setError(result?.message || 'Submission failed. Please verify your inputs and try again.');
        return;
      }

      setSubmittedRegId(result.regId);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('An error occurred while submitting your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Success state ----
  if (submittedRegId) {
    return (
      <div className="public-apply-page">
        <div className="public-apply-brand-strip">
          <div className="public-apply-deco">
            <div className="public-apply-deco-ring public-apply-deco-ring--a" />
            <div className="public-apply-deco-ring public-apply-deco-ring--b" />
            <div className="public-apply-deco-ring public-apply-deco-ring--c" />
            <div className="public-apply-deco-blob" />
          </div>
          <div className="public-apply-header">
            <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="public-apply-logo" />
            <div>
              <div className="public-apply-brand-name">PRIMEPOWER MANPOWER</div>
              <div className="public-apply-brand-sub">HR Smart Recruitment System</div>
            </div>
          </div>
          <div className="public-apply-intro">
            <div className="public-apply-title">Application Submitted</div>
            <div className="public-apply-sub">
              Your application has been received and is now under review.
            </div>
          </div>
        </div>
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
        <label>First Name<input type="text" value={form.firstName} onChange={set('firstName')} placeholder="Enter first name" /></label>
        <label>Middle Name<input type="text" value={form.middleName} onChange={set('middleName')} placeholder="Enter middle name" /></label>
        <label>Last Name<input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Enter last name" /></label>
        <label>Suffix<input type="text" placeholder="Jr., Sr., III..." value={form.suffix} onChange={set('suffix')} /></label>
        <label>City Address<input type="text" value={form.location} onChange={set('location')} placeholder="Current city address" /></label>
        <label>Provincial Address<input type="text" value={form.address} onChange={set('address')} placeholder="Provincial address" /></label>
        <label>Cel #<input type="text" value={form.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" /></label>
        <label>Alternate Contact<input type="text" value={form.alternateContact} onChange={set('alternateContact')} placeholder="Alternative number" /></label>
        <label>Email<input type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" /></label>
        <label>
          Civil Status
          <select
            value={form.civilStatus}
            onChange={(e) => {
              const val = e.target.value;
              setForm((prev) => {
                const isSingle = val === 'Single';
                return {
                  ...prev,
                  civilStatus: val,
                  noSpouse: isSingle ? true : prev.noSpouse,
                  spouseName: isSingle && (!prev.spouseName || prev.spouseName === '') ? 'N/A' : (prev.spouseName === 'N/A' && !isSingle ? '' : prev.spouseName),
                  spouseOccupation: isSingle && (!prev.spouseOccupation || prev.spouseOccupation === '') ? 'N/A' : (prev.spouseOccupation === 'N/A' && !isSingle ? '' : prev.spouseOccupation),
                };
              });
            }}
          >
            <option value="">-- Select Civil Status --</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Separated">Separated</option>
          </select>
        </label>
        <label>Age<input type="text" value={form.age} onChange={set('age')} placeholder="e.g. 25" /></label>
        <label>Sex<input type="text" value={form.gender} onChange={set('gender')} placeholder="Male / Female" /></label>
        <label>Date of Birth<input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} /></label>
        <label>Place of Birth<input type="text" value={form.placeOfBirth} onChange={set('placeOfBirth')} placeholder="City, Province" /></label>
        <label>Height<input type="text" placeholder={'e.g. 5\'6"'} value={form.height} onChange={set('height')} /></label>
        <label>Weight<input type="text" placeholder="e.g. 60kg" value={form.weight} onChange={set('weight')} /></label>
        <label>Religion<input type="text" value={form.religion} onChange={set('religion')} placeholder="Enter religion" /></label>
        <label>Nationality<input type="text" value={form.nationality} onChange={set('nationality')} placeholder="e.g. Filipino" /></label>
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

  const renderFamilyInfo = () => {
    const isNoSpouseActive = Boolean(form.noSpouse || (form.spouseName === 'N/A' && form.spouseOccupation === 'N/A'));

    return (
      <div className="numbered-section">
        <div className="numbered-section-title">
          <span className="numbered-section-badge">2</span>
          Family / Emergency Information
        </div>

        {/* NO SPOUSE OPTION TOGGLE */}
        <div
          className="no-spouse-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--secondary, #E4F0F8)',
            border: '1px solid var(--border, rgba(0, 125, 204, 0.15))',
            borderRadius: '12px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
          }}
        >
          <input
            type="checkbox"
            id="noSpouseCheck"
            checked={isNoSpouseActive}
            onChange={(e) => {
              const checked = e.target.checked;
              setForm((prev) => ({
                ...prev,
                noSpouse: checked,
                spouseName: checked ? 'N/A' : (prev.spouseName === 'N/A' ? '' : prev.spouseName),
                spouseOccupation: checked ? 'N/A' : (prev.spouseOccupation === 'N/A' ? '' : prev.spouseOccupation),
              }));
            }}
            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary, #007DCC)' }}
          />
          <label htmlFor="noSpouseCheck" style={{ cursor: 'pointer', margin: 0, flex: 1, userSelect: 'none', lineHeight: 1.3 }}>
            I do not have a spouse (Single / Not Applicable)
          </label>
          {isNoSpouseActive && (
            <span style={{ fontSize: '11px', background: 'var(--primary, #007DCC)', color: '#fff', padding: '2px 9px', borderRadius: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
              N/A Active
            </span>
          )}
        </div>

        <div className="edit-form-grid intake-grid">
          <label style={{ opacity: isNoSpouseActive ? 0.65 : 1 }}>
            Name of Spouse
            <input
              type="text"
              value={form.spouseName}
              onChange={set('spouseName')}
              placeholder={isNoSpouseActive ? 'Not Applicable (N/A)' : 'Full name of spouse'}
              disabled={isNoSpouseActive}
            />
          </label>
          <label style={{ opacity: isNoSpouseActive ? 0.65 : 1 }}>
            Occupation
            <input
              type="text"
              value={form.spouseOccupation}
              onChange={set('spouseOccupation')}
              placeholder={isNoSpouseActive ? 'Not Applicable (N/A)' : "Spouse's occupation"}
              disabled={isNoSpouseActive}
            />
          </label>
          <label>Father's Name<input type="text" value={form.fatherName} onChange={set('fatherName')} placeholder="Full name of father" /></label>
          <label>Occupation<input type="text" value={form.fatherOccupation} onChange={set('fatherOccupation')} placeholder="Father's occupation" /></label>
          <label>Mother's Name<input type="text" value={form.motherName} onChange={set('motherName')} placeholder="Full name of mother" /></label>
          <label>Occupation<input type="text" value={form.motherOccupation} onChange={set('motherOccupation')} placeholder="Mother's occupation" /></label>
          <label className="span-2">Family Address<input type="text" value={form.familyAddress} onChange={set('familyAddress')} placeholder="Complete family address" /></label>
          <label>Emergency Contact Person<input type="text" value={form.emergencyContactName} onChange={set('emergencyContactName')} placeholder="Full name" /></label>
          <label>Address / Contact Number<input type="text" value={form.emergencyContactAddress} onChange={set('emergencyContactAddress')} placeholder="Address or phone number" /></label>
        </div>
      </div>
    );
  };

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
              placeholder="School name"
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
        {!noWorkExperience && (
          <button type="button" className="link-btn" style={{ marginLeft: 'auto' }} onClick={addEmploymentRow}>+ Add Row</button>
        )}
      </div>

      {/* NO PREVIOUS WORK EXPERIENCE TOGGLE */}
      <div
        className="no-experience-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'var(--secondary, #E4F0F8)',
          border: '1px solid var(--border, rgba(0, 125, 204, 0.15))',
          borderRadius: '12px',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        <input
          type="checkbox"
          id="noWorkExperienceCheck"
          checked={noWorkExperience}
          onChange={(e) => setNoWorkExperience(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary, #007DCC)' }}
        />
        <label htmlFor="noWorkExperienceCheck" style={{ cursor: 'pointer', margin: 0, flex: 1, userSelect: 'none', lineHeight: 1.3 }}>
          I have no previous employment (Fresh Graduate / First-Time Job Seeker)
        </label>
        {noWorkExperience && (
          <span style={{ fontSize: '11px', background: 'var(--primary, #007DCC)', color: '#fff', padding: '2px 9px', borderRadius: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            First-Time Job Seeker
          </span>
        )}
      </div>

      {noWorkExperience ? (
        <div style={{ padding: '18px 20px', background: 'var(--panel, #EDF5FB)', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--muted-fg)', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
          Indicated as <strong>First-Time Job Seeker / Fresh Graduate</strong> with no prior employment history. You may proceed to the next step.
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
              <input type="text" value={row.from} onChange={setEmploymentField(i, 'from')} placeholder="MM/YYYY" />
              <input type="text" value={row.to} onChange={setEmploymentField(i, 'to')} placeholder="MM/YYYY" />
              <input type="text" value={row.position} onChange={setEmploymentField(i, 'position')} placeholder="Job title" />
              <div className="intake-table-cell-with-remove">
                <input type="text" value={row.company} onChange={setEmploymentField(i, 'company')} placeholder="Company name" />
                {employmentRows.length > 1 && (
                  <button type="button" onClick={() => removeEmploymentRow(i)}>x</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resume upload */}
      <div style={{ marginTop: 22 }}>
        <div className="numbered-section-title" style={{ marginBottom: 12 }}>
          <span className="numbered-section-badge" style={{ background: 'var(--muted-fg)' }}>
            <svg className="icon" viewBox="0 0 24 24" style={{ width: 12, height: 12, color: '#fff' }}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
          </span>
          Upload Resume
          <span className="numbered-section-hint">Optional</span>
        </div>
        <label htmlFor="resume-upload" className="public-file-drop">
          <div className="public-file-drop-icon">
            <svg className="icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          </div>
          <div className="public-file-drop-text">
            {resumeFile ? 'Change file' : 'Tap to upload your resume'}
          </div>
          <div className="public-file-drop-hint">
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
        {!noReferences && (
          <button type="button" className="link-btn" style={{ marginLeft: 'auto' }} onClick={addReferenceRow}>+ Add Row</button>
        )}
      </div>

      {/* NO REFERENCES TOGGLE */}
      <div
        className="no-references-banner"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: 'var(--secondary, #E4F0F8)',
          border: '1px solid var(--border, rgba(0, 125, 204, 0.15))',
          borderRadius: '12px',
          marginBottom: '16px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        }}
      >
        <input
          type="checkbox"
          id="noReferencesCheck"
          checked={noReferences}
          onChange={(e) => setNoReferences(e.target.checked)}
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary, #007DCC)' }}
        />
        <label htmlFor="noReferencesCheck" style={{ cursor: 'pointer', margin: 0, flex: 1, userSelect: 'none', lineHeight: 1.3 }}>
          I do not have character references to list (Not Applicable)
        </label>
        {noReferences && (
          <span style={{ fontSize: '11px', background: 'var(--primary, #007DCC)', color: '#fff', padding: '2px 9px', borderRadius: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            N/A Selected
          </span>
        )}
      </div>

      {noReferences ? (
        <div style={{ padding: '18px 20px', background: 'var(--panel, #EDF5FB)', border: '1px dashed var(--border)', borderRadius: '12px', color: 'var(--muted-fg)', fontSize: '13px', textAlign: 'center', fontWeight: 500 }}>
          Indicated as <strong>No Character References Available (N/A)</strong>. You may proceed to submit your application.
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
              <input type="text" value={row.name} onChange={setReferenceField(i, 'name')} placeholder="Full name" />
              <input type="text" value={row.occupation} onChange={setReferenceField(i, 'occupation')} placeholder="Occupation" />
              <div className="intake-table-cell-with-remove">
                <input type="text" value={row.contact} onChange={setReferenceField(i, 'contact')} placeholder="Contact info" />
                {referenceRows.length > 1 && (
                  <button type="button" onClick={() => removeReferenceRow(i)}>x</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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
  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="public-apply-page">
      {/* Brand strip — matches system dark navy gradient */}
      <div className="public-apply-brand-strip">
        <div className="public-apply-deco">
          <div className="public-apply-deco-ring public-apply-deco-ring--a" />
          <div className="public-apply-deco-ring public-apply-deco-ring--b" />
          <div className="public-apply-deco-ring public-apply-deco-ring--c" />
          <div className="public-apply-deco-blob" />
        </div>

        {/* Header with company logo */}
        <div className="public-apply-header">
          <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="public-apply-logo" />
          <div>
            <div className="public-apply-brand-name">PRIMEPOWER MANPOWER</div>
            <div className="public-apply-brand-sub">HR Smart Recruitment System</div>
          </div>
        </div>

        {/* Hero intro */}
        <div className="public-apply-intro">
          <div className="public-apply-title">Apply Now</div>
          <div className="public-apply-sub">
            Complete the application form below. All sections can be filled out at your own pace.
            Our recruitment team will follow up with you after review.
          </div>
        </div>

        {/* Trust badges */}
        <div className="public-apply-trust">
          <div className="trust-item">
            <svg className="icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            Secure Submission
          </div>
          <div className="trust-item">
            <svg className="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            5-Minute Process
          </div>
          <div className="trust-item">
            <svg className="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            No Account Required
          </div>
        </div>
      </div>

      {/* Content area on var(--bg) background */}
      <div className="public-apply-content">
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

        {/* Step progress bar */}
        <div className="public-apply-step-progress">
          <div className="step-progress-text">
            Step <strong>{step + 1}</strong> of <strong>{STEPS.length}</strong>
          </div>
          <div className="step-progress-bar">
            <div className="step-progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* Step content */}
        <div className="public-apply-form">
          <div className="public-apply-step-content" key={stepKey}>
            {stepRenderers[step]()}
          </div>

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
              <button type="button" className="stage-btn go" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="public-apply-footer">
          <div className="public-apply-footer-text">
            PRIMEPOWER Manpower Services -- HR Smart Recruitment System
          </div>
        </div>
      </div>
    </div>
  );
}
