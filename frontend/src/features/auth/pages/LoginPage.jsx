import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthStore';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import AuthIllustration from '../components/AuthIllustration';
import './LoginPage.css';

const DEMO_ACCOUNTS = [
  { label: 'HR Administrator', email: 'admin@primepower.ph', password: 'Admin@2026!' },
  { label: 'Registration Officer', email: 'registration@primepower.ph', password: 'Reg@2026!' },
  { label: 'Recruitment Officer', email: 'recruitment@primepower.ph', password: 'Recr@2026!' },
  { label: 'Job Order Coordinator', email: 'joborders@primepower.ph', password: 'JoCoord@2026!' },
  { label: 'Deployment Officer', email: 'deployment@primepower.ph', password: 'Depl@2026!' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showHints, setShowHints] = useState(false);

  const sessionExpired = new URLSearchParams(window.location.search).get('reason') === 'session_expired';

  useEffect(() => {
    try {
      const theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    } catch {
      // ignore
    }
  }, []);

  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Corporate email address is required.');
      return;
    }
    if (!password) {
      setError('Access password is required.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      const from = location.state?.from?.pathname;
      const roleDefault = res.user?.defaultRoute || '/client-management';
      navigate(from || roleDefault, { replace: true });
    } else {
      setError(res.message || 'Invalid email address or password.');
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
            fill="url(#topBlobGrad)"
          />
          <defs>
            <linearGradient id="topBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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
            fill="url(#botBlobGrad)"
          />
          <defs>
            <linearGradient id="botBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.50" />
              <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Open Canvas Main Content (Frameless — No Enclosing White Box) ── */}
      <main className="login-canvas-wrap">
        {/* Top Brand Bar */}
        <header className="login-brand-bar">
          <div className="login-brand">
            <div className="login-brand-logo-wrap">
              <img src={primepowerLogo} alt="Prime Power Logo" className="login-brand-logo" />
            </div>
            <div className="login-brand-text">
              <span className="login-brand-name">PRIMEPOWER MANPOWER</span>
              <span className="login-brand-sub">HR Smart Recruitment System</span>
            </div>
          </div>
        </header>

        {/* Split Content Hero Grid */}
        <div className="login-canvas-grid">
          {/* Left Column: Seamless Grounded Illustration */}
          <div className="login-visual-pane">
            <AuthIllustration />
          </div>

          {/* Right Column: Floating Clean Form Elements */}
          <div className="login-form-pane">
            <div className="login-form-header">
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">
                Sign in to access your designated workflow portal.
              </p>
            </div>

            {sessionExpired && (
              <div className="login-alert warning">
                <span>Your session has expired. Please sign in again.</span>
              </div>
            )}

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

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-fields-container">
                {/* Floating Email Card */}
                <div className="login-input-card">
                  <div className="login-field-icon-slot">
                    <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className="login-field-body">
                    <label htmlFor="login-email" className="login-field-label">
                      Email Address
                    </label>
                    <input
                      id="login-email"
                      type="email"
                      className="login-field-input"
                      placeholder="name@primepower.ph"
                      value={email}
                      onChange={(e) => {
                        setError('');
                        setEmail(e.target.value);
                      }}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Floating Password Card */}
                <div className="login-input-card">
                  <div className="login-field-icon-slot">
                    <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <div className="login-field-body">
                    <label htmlFor="login-password" className="login-field-label">
                      Access Password
                    </label>
                    <input
                      id="login-password"
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

              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="login-btn-loading">
                    <span className="login-btn-spinner" />
                    Authenticating...
                  </span>
                ) : (
                  'Login Now'
                )}
              </button>
            </form>

            {/* Quick Select Demo Accounts */}
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
                {showHints ? 'Hide' : 'Quick select'} team test accounts
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showHints ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {showHints && (
                <div className="login-hints-grid">
                  {DEMO_ACCOUNTS.map((acc) => (
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
    </div>
  );
}
