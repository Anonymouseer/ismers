import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ClientPortalRegisterPage.css';

const INDUSTRIES = [
  'Manufacturing',
  'Construction',
  'Logistics & Warehousing',
  'Food & Beverage',
  'Retail & Trade',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'Information Technology',
  'Business Process Outsourcing',
  'Finance & Banking',
  'Real Estate',
  'Agriculture',
  'Other',
];

export default function ClientPortalRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: '',
    industry: '',
    contactPerson: '',
    designation: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Sync design system tokens
  useEffect(() => {
    try {
      const theme = localStorage.getItem('theme') || 'light';
      const density = localStorage.getItem('density') || 'comfortable';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-density', density);
      if (theme === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    } catch { /* ignore */ }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    try {
      if (localStorage.getItem('cp_session')) {
        navigate('/client-portal', { replace: true });
      }
    } catch { /* ignore */ }
  }, [navigate]);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((err) => ({ ...err, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.company.trim()) e.company = 'Company name is required.';
    if (!form.industry) e.industry = 'Please select an industry.';
    if (!form.contactPerson.trim()) e.contactPerson = 'Contact person name is required.';
    if (!form.email.trim()) {
      e.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Please enter a valid email address.';
    }
    if (!form.mobile.trim()) {
      e.mobile = 'Mobile number is required.';
    } else if (!/^[\d\s\-+()+]{7,}$/.test(form.mobile.trim())) {
      e.mobile = 'Please enter a valid mobile number.';
    }
    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      e.password = 'Password must contain at least one uppercase letter.';
    } else if (!/\d/.test(form.password)) {
      e.password = 'Password must contain at least one number.';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    if (!form.agreed) e.agreed = 'You must agree to the terms to proceed.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      try {
        const newUser = {
          company: form.company.trim(),
          industry: form.industry,
          contactPerson: form.contactPerson.trim(),
          designation: form.designation.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile.trim(),
          password: form.password,
        };

        // Persist user record for future logins
        const existing = localStorage.getItem('cp_users');
        const users = existing ? JSON.parse(existing) : [];
        const duplicate = users.find((u) => u.email === newUser.email);
        if (duplicate) {
          setErrors({ email: 'An account with this email address already exists.' });
          setSubmitting(false);
          return;
        }
        users.push(newUser);
        localStorage.setItem('cp_users', JSON.stringify(users));

        // Create session immediately after registration
        localStorage.setItem('cp_session', JSON.stringify({ ...newUser, loggedIn: true }));
        navigate('/client-portal', { replace: true });
      } catch {
        setErrors({ _global: 'An unexpected error occurred. Please try again.' });
        setSubmitting(false);
      }
    }, 900);
  };

  const field = (id, label, type = 'text', placeholder = '', opts = {}) => (
    <div className={`cp-reg-field${errors[id] ? ' cp-reg-field--error' : ''}`}>
      <label className="cp-reg-label" htmlFor={`cp-reg-${id}`}>
        {label}{opts.required !== false && <span className="cp-reg-required" aria-hidden="true"> *</span>}
      </label>
      <div className="cp-reg-input-wrap">
        {opts.icon && (
          <svg className="cp-reg-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {opts.icon}
          </svg>
        )}
        <input
          id={`cp-reg-${id}`}
          type={type}
          className={`cp-reg-input${opts.icon ? ' cp-reg-input--has-icon' : ''}`}
          placeholder={placeholder}
          value={form[id]}
          onChange={set(id)}
          autoComplete={opts.autoComplete}
        />
        {opts.toggle && (
          <button
            type="button"
            className="cp-reg-pw-toggle"
            onClick={opts.toggle.onClick}
            aria-label={opts.toggle.visible ? 'Hide password' : 'Show password'}
          >
            {opts.toggle.visible ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {errors[id] && (
        <div className="cp-reg-field-error" role="alert">{errors[id]}</div>
      )}
    </div>
  );

  return (
    <div className="cp-reg-shell">

      {/* ── BRAND PANEL ── */}
      <aside className="cp-reg-brand">
        <div className="cp-reg-brand-deco" aria-hidden="true">
          <div className="cp-reg-deco-ring cp-reg-deco-ring--a" />
          <div className="cp-reg-deco-ring cp-reg-deco-ring--b" />
          <div className="cp-reg-deco-ring cp-reg-deco-ring--c" />
          <div className="cp-reg-deco-blob" />
        </div>

        <div className="cp-reg-brand-body">
          <div className="cp-reg-logo-block">
            <div className="cp-reg-logo-mark">PM</div>
            <div className="cp-reg-logo-text">
              <div className="cp-reg-logo-name">
                <span className="cp-reg-logo-prime">PRIME</span>
                <span className="cp-reg-logo-power">POWER</span>
              </div>
              <div className="cp-reg-logo-dept">MANPOWER SERVICES</div>
            </div>
          </div>

          <h2 className="cp-reg-brand-headline">
            Start Your Partnership<br />With Confidence.
          </h2>
          <p className="cp-reg-brand-desc">
            Register your company to gain access to a dedicated recruitment dashboard. Our team will review your account and connect you with an assigned recruiter within 24 hours.
          </p>

          <div className="cp-reg-steps">
            <div className="cp-reg-step">
              <div className="cp-reg-step-num">1</div>
              <div className="cp-reg-step-info">
                <div className="cp-reg-step-title">Complete Registration</div>
                <div className="cp-reg-step-desc">Submit your company details below</div>
              </div>
            </div>
            <div className="cp-reg-step-connector" aria-hidden="true" />
            <div className="cp-reg-step">
              <div className="cp-reg-step-num">2</div>
              <div className="cp-reg-step-info">
                <div className="cp-reg-step-title">Account Verification</div>
                <div className="cp-reg-step-desc">Receive confirmation within 24 hours</div>
              </div>
            </div>
            <div className="cp-reg-step-connector" aria-hidden="true" />
            <div className="cp-reg-step">
              <div className="cp-reg-step-num">3</div>
              <div className="cp-reg-step-info">
                <div className="cp-reg-step-title">Submit Job Requests</div>
                <div className="cp-reg-step-desc">Begin coordinating with your recruiter</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cp-reg-brand-foot">
          DOLE Accredited &nbsp;&middot;&nbsp; POEA Licensed &nbsp;&middot;&nbsp; ISO Compliant
        </div>
      </aside>

      {/* ── FORM PANEL ── */}
      <main className="cp-reg-form-panel">
        <div className="cp-reg-form-inner">

          <div className="cp-reg-form-eyebrow">Client Portal</div>
          <h1 className="cp-reg-form-heading">Register Your Company</h1>
          <p className="cp-reg-form-desc">
            Fill in your company details to create your client portal account.
          </p>

          {errors._global && (
            <div className="cp-reg-error-banner" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {errors._global}
            </div>
          )}

          <form id="cp-register-form" className="cp-reg-form" onSubmit={handleSubmit} noValidate>

            {/* ── SECTION: Company Information ── */}
            <div className="cp-reg-section-label">Company Information</div>
            <div className="cp-reg-row">
              {field('company', 'Company Name', 'text', 'e.g. ABC Manufacturing Corp.', {
                icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
              })}
              <div className={`cp-reg-field${errors.industry ? ' cp-reg-field--error' : ''}`}>
                <label className="cp-reg-label" htmlFor="cp-reg-industry">
                  Industry <span className="cp-reg-required" aria-hidden="true"> *</span>
                </label>
                <div className="cp-reg-select-wrap">
                  <svg className="cp-reg-select-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                  <select
                    id="cp-reg-industry"
                    className="cp-reg-select"
                    value={form.industry}
                    onChange={set('industry')}
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                {errors.industry && (
                  <div className="cp-reg-field-error" role="alert">{errors.industry}</div>
                )}
              </div>
            </div>

            {/* ── SECTION: Contact Information ── */}
            <div className="cp-reg-section-label">Contact Information</div>
            <div className="cp-reg-row">
              {field('contactPerson', 'Contact Person', 'text', 'Full name of the point of contact', {
                icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
              })}
              {field('designation', 'Position / Designation', 'text', 'e.g. HR Manager', {
                required: false,
                icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
              })}
            </div>
            <div className="cp-reg-row">
              {field('email', 'Email Address', 'email', 'official@company.com', {
                autoComplete: 'email',
                icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
              })}
              {field('mobile', 'Mobile Number', 'tel', '+63 917 000 0000', {
                autoComplete: 'tel',
                icon: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" /></>,
              })}
            </div>

            {/* ── SECTION: Account Security ── */}
            <div className="cp-reg-section-label">Account Security</div>
            <div className="cp-reg-row">
              {field('password', 'Password', showPassword ? 'text' : 'password', 'Min. 8 chars, 1 uppercase, 1 number', {
                autoComplete: 'new-password',
                icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
                toggle: {
                  visible: showPassword,
                  onClick: () => setShowPassword((v) => !v),
                },
              })}
              {field('confirmPassword', 'Confirm Password', showConfirm ? 'text' : 'password', 'Re-enter your password', {
                autoComplete: 'new-password',
                icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
                toggle: {
                  visible: showConfirm,
                  onClick: () => setShowConfirm((v) => !v),
                },
              })}
            </div>

            {/* Terms */}
            <div className={`cp-reg-terms${errors.agreed ? ' cp-reg-terms--error' : ''}`}>
              <label className="cp-reg-checkbox-label" htmlFor="cp-reg-agreed">
                <input
                  id="cp-reg-agreed"
                  type="checkbox"
                  className="cp-reg-checkbox"
                  checked={form.agreed}
                  onChange={set('agreed')}
                />
                <span className="cp-reg-checkbox-custom" aria-hidden="true">
                  {form.agreed && (
                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </span>
                <span className="cp-reg-terms-text">
                  I agree to the{' '}
                  <span className="cp-reg-terms-link">Terms of Service</span>
                  {' '}and{' '}
                  <span className="cp-reg-terms-link">Privacy Policy</span>
                  {' '}of PRIMEPOWER MANPOWER SERVICES.
                </span>
              </label>
              {errors.agreed && (
                <div className="cp-reg-field-error" role="alert">{errors.agreed}</div>
              )}
            </div>

            <button
              id="cp-register-submit"
              type="submit"
              className="cp-reg-submit"
              disabled={submitting}
            >
              {submitting && <span className="cp-reg-spinner" aria-hidden="true" />}
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>

          </form>

          <div className="cp-reg-divider">
            <span>Already have an account?</span>
          </div>

          <Link
            id="cp-register-to-login"
            to="/client-portal/login"
            className="cp-reg-login-link"
          >
            Sign In
          </Link>

        </div>

        <footer className="cp-reg-panel-footer">
          &copy; {new Date().getFullYear()} PRIMEPOWER MANPOWER SERVICES. All rights reserved.
        </footer>
      </main>

    </div>
  );
}
