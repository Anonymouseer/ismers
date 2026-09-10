import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import ClientAuthIllustration from '../components/ClientAuthIllustration';
import './ClientPortalLoginPage.css';

const DEMO_CLIENTS = [
  { label: 'ABC Logistics (Warehousing)', email: 'hr@abclogistics.com.ph', password: 'BCL@2026' },
  { label: 'Northline BPO (BPO / Voice)', email: 'talent@northlinebpo.com.ph', password: 'NRT@2026' },
  { label: 'Delta Manufacturing (Industrial)', email: 'hr@deltamfg.com.ph', password: 'DLT@2026' },
  { label: 'Coastal Retail Group (Retail & Mall)', email: 'hr@coastalretail.com.ph', password: 'CST@2026' },
];

export default function ClientPortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/client-portal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);

  // Forgot Password Recovery State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotResult, setForgotResult] = useState(null);

  useEffect(() => {
    document.title = 'Client Portal Login | PRIMEPOWER MANPOWER';
    try {
      const theme = localStorage.getItem('theme') || 'light';
      const density = localStorage.getItem('density') || 'comfortable';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-density', density);
      if (theme === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    } catch {
      // ignore
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    try {
      if (localStorage.getItem('cp_session')) {
        navigate(from, { replace: true });
      }
    } catch {
      // ignore
    }
  }, [navigate, from]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Corporate email address is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid corporate email address.');
      return;
    }
    if (!password) {
      setError('Access password is required.');
      return;
    }

    setSubmitting(true);

    clientPortalService
      .login({ email: email.trim(), password })
      .then((response) => {
        const sessionUser = response.data;
        if (sessionUser?.token) {
          localStorage.setItem('cp_token', sessionUser.token);
        }
        if (sessionUser?.expires_at) {
          localStorage.setItem('cp_token_expiry', sessionUser.expires_at);
        }
        localStorage.setItem('cp_session', JSON.stringify({ ...sessionUser, loggedIn: true }));
        navigate(from, { replace: true });
      })
      .catch((err) => {
        const message =
          err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          'Incorrect corporate email address or password. Please try again.';
        setError(message);
        setSubmitting(false);
      });
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
      setForgotError(
        err.response?.data?.message || 'Unable to process password reset request. Please try again.'
      );
    } finally {
      setForgotSubmitting(false);
    }
  };

  const fillAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="login-shell">
      {/* ── Layered Ambient Backdrop Waves & Blobs ── */}
      <div className="login-backdrop" aria-hidden="true">
        <div className="login-backdrop-glow" />
        {/* Top-Right Organic Wave */}
        <svg className="login-blob login-blob--top" viewBox="0 0 650 650" fill="none">
          <path
            d="M340 0C480 0 620 90 635 230C650 370 550 500 430 565C310 630 180 610 110 510C40 410 20 250 80 140C140 30 235 0 340 0Z"
            fill="url(#topBlobGradClient)"
          />
          <defs>
            <linearGradient id="topBlobGradClient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>

        {/* Bottom-Left Organic Wave */}
        <svg className="login-blob login-blob--bottom" viewBox="0 0 720 720" fill="none">
          <path
            d="M0 270C0 130 110 20 250 5C390 -10 530 90 580 230C630 370 580 520 470 620C360 720 200 750 100 670C0 590 0 410 0 270Z"
            fill="url(#botBlobGradClient)"
          />
          <defs>
            <linearGradient id="botBlobGradClient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.50" />
              <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Open Canvas Main Content (Frameless Hero Split) ── */}
      <main className="login-canvas-wrap">
        {/* Top Brand Bar */}
        <header className="login-brand-bar">
          <div className="login-brand">
            <div className="login-brand-logo-wrap">
              <img src={primepowerLogo} alt="Prime Power Logo" className="login-brand-logo" />
            </div>
            <div className="login-brand-text">
              <span className="login-brand-name">PRIMEPOWER MANPOWER</span>
              <span className="login-brand-sub">Client Partner Portal</span>
            </div>
          </div>
        </header>

        {/* Split Content Hero Grid */}
        <div className="login-canvas-grid">
          {/* Left Column: Seamless Grounded Illustration */}
          <div className="login-visual-pane">
            <ClientAuthIllustration />
          </div>

          {/* Right Column: Floating Clean Form Elements */}
          <div className="login-form-pane">
            <div className="login-form-header">
              <h1 className="login-title">Client Portal</h1>
              <p className="login-subtitle">
                Sign in to manage manpower requests, review candidate profiles, and track deployments.
              </p>
            </div>

            {error && (
              <div className="login-alert error" role="alert">
                <svg viewBox="0 0 24 24" className="login-alert-icon" width="15" height="15">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="login-fields-container">
                {/* Floating Email Card */}
                <div className="login-input-card">
                  <div className="login-field-icon-slot">
                    <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className="login-field-body">
                    <label htmlFor="cp-login-email" className="login-field-label">
                      Corporate Email Address
                    </label>
                    <input
                      id="cp-login-email"
                      type="email"
                      className="login-field-input"
                      placeholder="e.g. hr@company.com.ph"
                      value={email}
                      onChange={(e) => {
                        setError('');
                        setEmail(e.target.value);
                      }}
                      autoComplete="email"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                {/* Floating Password Card */}
                <div className="login-input-card">
                  <div className="login-field-icon-slot">
                    <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className="login-field-body">
                    <div className="login-field-header-row">
                      <label htmlFor="cp-login-password" className="login-field-label">
                        Access Password
                      </label>
                      <button
                        type="button"
                        className="login-inline-link"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(email || '');
                          setForgotError('');
                          setForgotResult(null);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      id="cp-login-password"
                      type={showPassword ? 'text' : 'password'}
                      className="login-field-input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => {
                        setError('');
                        setPassword(e.target.value);
                      }}
                      autoComplete="current-password"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="login-pwd-btn"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-submit-btn" disabled={submitting}>
                {submitting ? (
                  <span className="login-btn-loading">
                    <span className="login-btn-spinner" />
                    Authenticating Client...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Portal Transition Links */}
            <div className="login-actions-row">
              <span className="login-register-prompt">
                New partner?{' '}
                <Link to="/client-portal/register" className="login-link">
                  Register Company
                </Link>
              </span>
              <Link to="/login" className="login-link" style={{ fontSize: '11.5px' }}>
                Staff Login →
              </Link>
            </div>

            {/* Quick Select Demo Client Accounts */}
            <div className="login-hints-section">
              <button
                type="button"
                className="login-hints-toggle"
                onClick={() => setShowHints((h) => !h)}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                {showHints ? 'Hide' : 'Quick select'} demo client accounts
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: showHints ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {showHints && (
                <div className="login-hints-grid">
                  {DEMO_CLIENTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      className="login-hint-chip"
                      onClick={() => fillAccount(acc)}
                    >
                      <span className="login-hint-role">{acc.label}</span>
                      <span className="login-hint-email">{acc.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── FORGOT PASSWORD MODAL ── */}
      {showForgotModal && (
        <>
          <div className="cp-modal-backdrop" onClick={() => setShowForgotModal(false)} />
          <div
            className="cp-modal-window"
            role="dialog"
            aria-modal="true"
            aria-label="Forgot Password Recovery"
          >
            <div className="cp-modal-header">
              <div className="cp-modal-title-group">
                <div className="cp-modal-icon-badge">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3 className="cp-modal-title">Account Recovery</h3>
                  <div className="cp-modal-sub">Reset Client Credentials</div>
                </div>
              </div>
              <button
                type="button"
                className="cp-modal-close"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {forgotResult ? (
              <div>
                <div className="login-alert success">
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '2px' }}>Reset Link Dispatched</div>
                    <div>{forgotResult.message}</div>
                  </div>
                </div>

                {forgotResult.reset_token && (
                  <div
                    style={{
                      marginBottom: '18px',
                      padding: '12px 14px',
                      background: 'rgba(0, 125, 204, 0.05)',
                      borderRadius: '10px',
                      border: '1px solid rgba(0, 125, 204, 0.16)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '10.5px',
                        color: 'var(--muted, #486F91)',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                      }}
                    >
                      Automated Recovery Link (Expires in 60m)
                    </div>
                    <button
                      type="button"
                      className="login-submit-btn"
                      style={{ height: '42px', fontSize: '13px' }}
                      onClick={() => {
                        setShowForgotModal(false);
                        navigate(
                          `/client-portal/reset-password?token=${forgotResult.reset_token}&email=${encodeURIComponent(
                            forgotEmail
                          )}`
                        );
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
                    border: '1px solid rgba(0, 125, 204, 0.20)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text, #0A1B2E)',
                  }}
                  onClick={() => setShowForgotModal(false)}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} noValidate>
                <p
                  style={{
                    fontSize: '12.5px',
                    color: '#486F91',
                    lineHeight: 1.5,
                    marginBottom: '16px',
                  }}
                >
                  Enter the registered corporate email address associated with your client account. We will generate a secure reset link valid for <strong>60 minutes</strong>.
                </p>

                {forgotError && (
                  <div className="login-alert error" style={{ marginBottom: '14px' }} role="alert">
                    <svg viewBox="0 0 24 24" className="login-alert-icon" width="15" height="15">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span>{forgotError}</span>
                  </div>
                )}

                <div className="login-input-card" style={{ marginBottom: '18px' }}>
                  <div className="login-field-icon-slot">
                    <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className="login-field-body">
                    <label htmlFor="cp-forgot-email" className="login-field-label">
                      Corporate Email Address
                    </label>
                    <input
                      id="cp-forgot-email"
                      type="email"
                      className="login-field-input"
                      placeholder="e.g. hr@company.com.ph"
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
                      height: '44px',
                      background: 'transparent',
                      border: '1px solid rgba(0, 125, 204, 0.20)',
                      borderRadius: '22px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--text, #0A1B2E)',
                    }}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="login-submit-btn"
                    style={{ flex: 1.5, margin: 0, height: '44px' }}
                    disabled={forgotSubmitting}
                  >
                    {forgotSubmitting ? 'Generating Link...' : 'Send Reset Link'}
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
