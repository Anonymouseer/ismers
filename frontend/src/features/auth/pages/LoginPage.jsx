import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthStore';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Detect redirect from session expiry or idle timeout
  const sessionExpired = new URLSearchParams(window.location.search).get('reason') === 'session_expired';

  // Sync theme
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

  // If user is already authenticated, redirect away from login
  if (isAuthenticated) {
    const destination = location.state?.from?.pathname || '/client-management';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      const from = location.state?.from?.pathname || '/client-management';
      navigate(from, { replace: true });
    } else {
      setError(res.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-backdrop-deco" aria-hidden="true">
        <div className="login-deco-ring login-deco-ring--1" />
        <div className="login-deco-ring login-deco-ring--2" />
        <div className="login-deco-blob" />
      </div>

      <main className="login-card-container">
        <div className="login-card">
          <div className="login-brand-header">
            <div className="login-brand-logo-slot">
              <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="login-brand-img" />
            </div>
            <div className="login-brand-titles">
              <div className="login-brand-title">PRIMEPOWER MANPOWER</div>
              <div className="login-brand-sub">HR Smart Recruitment System</div>
            </div>
          </div>

          <div className="login-divider" />

          <div className="login-form-heading-group">
            <div className="login-badge-eyebrow">Administrative Portal</div>
            <h1 className="login-title">Staff Sign In</h1>
            <p className="login-desc">
              Enter your authorized enterprise credentials to access the recruitment, selection, and deployment platform.
            </p>
          </div>

          {sessionExpired && (
            <div className="login-session-expired-banner" role="status">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Your session has expired. Please sign in again to continue.</span>
            </div>
          )}

          {error && (
            <div className="login-error-banner" role="alert">
              <svg viewBox="0 0 24 24" className="login-error-icon" width="16" height="16">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field-group">
              <label htmlFor="login-email" className="login-label">
                Corporate Email Address
              </label>
              <div className="login-input-wrap">
                <svg className="login-input-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <input
                  id="login-email"
                  type="email"
                  className="login-input"
                  placeholder="admin@primepower.ph"
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

            <div className="login-field-group">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Access Password
                </label>
              </div>
              <div className="login-input-wrap">
                <svg className="login-input-icon" viewBox="0 0 24 24" width="16" height="16">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setError('');
                    setPassword(e.target.value);
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-pwd-toggle"
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

            <div className="login-meta-row">
              <span className="login-security-notice">
                Protected by DOLE DO-174 &amp; RA 10173 Enterprise Security
              </span>
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>

          <div className="login-card-foot">
            <span>Client Partner Access?</span>
            <a href="/client-portal/login" className="login-foot-link">
              Go to Client Portal
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
