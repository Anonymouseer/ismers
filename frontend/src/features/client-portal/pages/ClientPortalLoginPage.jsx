import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './ClientPortalLoginPage.css';

export default function ClientPortalLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const { email, password } = form;
    if (!email.trim()) { setError('Email address is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.'); return;
    }
    if (!password) { setError('Password is required.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setSubmitting(true);

    clientPortalService.login({ email: email.trim(), password })
      .then((response) => {
        const sessionUser = response.data;
        localStorage.setItem('cp_session', JSON.stringify({ ...sessionUser, loggedIn: true }));
        navigate('/client-portal', { replace: true });
      })
      .catch((err) => {
        const message = err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          'Incorrect email or password. Please try again.';
        setError(message);
        setSubmitting(false);
      });
  };

  return (
    <div className="cp-login-shell">
      {/* Decorative ambient rings */}
      <div className="cp-login-brand-deco" aria-hidden="true">
        <div className="cp-login-deco-ring cp-login-deco-ring--a" />
        <div className="cp-login-deco-ring cp-login-deco-ring--b" />
        <div className="cp-login-deco-ring cp-login-deco-ring--c" />
        <div className="cp-login-deco-blob" />
      </div>

      {/* Centered Panel */}
      <main className="cp-login-center-panel">
        <div className="cp-login-card">
          {/* Brand Logo Header */}
          <div className="cp-login-logo-block">
            <div className="cp-login-logo-mark">
              <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="cp-login-logo-img" />
            </div>
            <div className="cp-login-logo-text">
              <div className="cp-login-logo-name">
                <span className="cp-login-logo-prime">PRIME</span>
                <span className="cp-login-logo-power">POWER</span>
              </div>
              <div className="cp-login-logo-dept">MANPOWER SERVICES</div>
            </div>
          </div>

          <div className="cp-login-form-eyebrow">Client Portal Access</div>
          <h1 className="cp-login-form-heading">Welcome Back</h1>
          <p className="cp-login-form-desc">
            Sign in with your registered credentials to access your client dashboard.
          </p>

          {error && (
            <div className="cp-login-error-banner" role="alert" aria-live="polite">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form id="cp-login-form" className="cp-login-form" onSubmit={handleSubmit} noValidate>

            <div className="cp-login-field">
              <label className="cp-login-label" htmlFor="cp-login-email">
                Email Address
              </label>
              <div className="cp-login-input-wrap">
                <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  id="cp-login-email"
                  type="email"
                  className="cp-login-input"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <div className="cp-login-field">
              <div className="cp-login-label-row">
                <label className="cp-login-label" htmlFor="cp-login-password">
                  Password
                </label>
              </div>
              <div className="cp-login-input-wrap">
                <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="cp-login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="cp-login-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="cp-login-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
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
              </div>
            </div>

            <button
              id="cp-login-submit"
              type="submit"
              className="cp-login-submit"
              disabled={submitting}
            >
              {submitting && <span className="cp-login-spinner" aria-hidden="true" />}
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          {/* Quick feature highlights */}
          <div className="cp-login-card-badges">
            <div className="cp-login-badge-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure Portal
            </div>
            <div className="cp-login-badge-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Real-Time Tracking
            </div>
            <div className="cp-login-badge-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Recruiter Messaging
            </div>
          </div>
        </div>

        <footer className="cp-login-panel-footer">
          &copy; {new Date().getFullYear()} PRIMEPOWER MANPOWER SERVICES. All rights reserved. &nbsp;&middot;&nbsp; DOLE Accredited &nbsp;&middot;&nbsp; POEA Licensed &nbsp;&middot;&nbsp; ISO Compliant
        </footer>
      </main>
    </div>
  );
}
