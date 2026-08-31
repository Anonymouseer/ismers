import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './ClientPortalLoginPage.css';

export default function ClientPortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/client-portal';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot Password Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotResult, setForgotResult] = useState(null);

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
        navigate(from, { replace: true });
      }
    } catch { /* ignore */ }
  }, [navigate, from]);

  const set = (field) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotResult(null);

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your corporate email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      setForgotError('Please enter a valid corporate email address.');
      return;
    }

    setForgotSubmitting(true);

    try {
      const res = await clientPortalService.forgotPassword(forgotEmail.trim());
      setForgotResult(res.data);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Unable to process password reset request. Please try again.');
    } finally {
      setForgotSubmitting(false);
    }
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
        navigate(from, { replace: true });
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
              <div className="cp-login-label-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="cp-login-label" htmlFor="cp-login-password">
                  Password
                </label>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--primary, #007dcc)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotEmail(form.email || '');
                    setForgotError('');
                    setForgotResult(null);
                  }}
                >
                  Forgot Password?
                </button>
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

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <>
          <div
            className="cp-modal-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 22, 40, 0.65)',
              backdropFilter: 'blur(6px)',
              zIndex: 1000,
            }}
            onClick={() => setShowForgotModal(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Forgot Password Recovery"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '92%',
              maxWidth: '440px',
              background: 'var(--panel, #ffffff)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px 28px',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.22)',
              zIndex: 1001,
              color: 'var(--text)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'rgba(0, 125, 204, 0.1)',
                  color: 'var(--primary, #007dcc)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Account Recovery</h3>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Reset Client Credentials</div>
                </div>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '20px', lineHeight: 1 }}
                onClick={() => setShowForgotModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {forgotResult ? (
              <div>
                <div style={{
                  padding: '14px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px',
                  color: '#059669',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                  marginBottom: '20px',
                }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>Reset Link Dispatched</div>
                  {forgotResult.message}
                </div>

                {forgotResult.reset_token && (
                  <div style={{ marginBottom: '20px', padding: '12px 14px', background: 'var(--bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
                      Automated Recovery Link (Expires in 60m)
                    </div>
                    <button
                      type="button"
                      className="cp-login-submit"
                      style={{ height: '40px', fontSize: '12.5px' }}
                      onClick={() => {
                        setShowForgotModal(false);
                        navigate(`/client-portal/reset-password?token=${forgotResult.reset_token}&email=${encodeURIComponent(forgotEmail)}`);
                      }}
                    >
                      Proceed to Reset Password Now
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text)',
                  }}
                  onClick={() => setShowForgotModal(false)}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '18px' }}>
                  Enter the registered corporate email address associated with your client account. We will generate a secure reset link valid for <strong>60 minutes</strong>.
                </p>

                {forgotError && (
                  <div className="cp-login-error-banner" style={{ marginBottom: '16px' }} role="alert">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {forgotError}
                  </div>
                )}

                <div className="cp-login-field" style={{ marginBottom: '20px' }}>
                  <label className="cp-login-label" htmlFor="cp-forgot-email">
                    Corporate Email Address
                  </label>
                  <div className="cp-login-input-wrap">
                    <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      id="cp-forgot-email"
                      type="email"
                      className="cp-login-input"
                      placeholder="e.g. hr@abclogistics.com.ph"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      height: '42px',
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--text)',
                    }}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cp-login-submit"
                    style={{ flex: 1.5, margin: 0 }}
                    disabled={forgotSubmitting}
                  >
                    {forgotSubmitting ? 'Sending Request...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
