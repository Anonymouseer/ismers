import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import ClientAuthIllustration from '../components/ClientAuthIllustration';
import './ClientPortalLoginPage.css';

export default function ClientPortalResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Sync design system tokens
  useEffect(() => {
    document.title = 'Reset Password | PRIMEPOWER Client Portal';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Corporate email address is required.');
      return;
    }
    if (!token.trim()) {
      setError('Password reset token is required or link has expired.');
      return;
    }
    if (!password) {
      setError('New password is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await clientPortalService.resetPassword({
        email: email.trim(),
        token: token.trim(),
        password,
      });

      if (res?.data?.success) {
        setSuccess(true);
      } else {
        setError(res?.data?.message || 'Password reset failed. Please request a new reset link.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.email?.[0] ||
        'Unable to reset password. The link may have expired.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      {/* ── Layered Ambient Backdrop Waves & Blobs ── */}
      <div className="login-backdrop" aria-hidden="true">
        <div className="login-backdrop-glow" />
        <svg className="login-blob login-blob--top" viewBox="0 0 650 650" fill="none">
          <path
            d="M340 0C480 0 620 90 635 230C650 370 550 500 430 565C310 630 180 610 110 510C40 410 20 250 80 140C140 30 235 0 340 0Z"
            fill="url(#topBlobGradReset)"
          />
          <defs>
            <linearGradient id="topBlobGradReset" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#bae6fd" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.15" />
            </linearGradient>
          </defs>
        </svg>

        <svg className="login-blob login-blob--bottom" viewBox="0 0 720 720" fill="none">
          <path
            d="M0 270C0 130 110 20 250 5C390 -10 530 90 580 230C630 370 580 520 470 620C360 720 200 750 100 670C0 590 0 410 0 270Z"
            fill="url(#botBlobGradReset)"
          />
          <defs>
            <linearGradient id="botBlobGradReset" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.50" />
              <stop offset="50%" stopColor="#a5f3fc" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.10" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Open Canvas Main Content (Frameless) ── */}
      <main className="login-canvas-wrap">
        {/* Top Brand Bar */}
        <header className="login-brand-bar">
          <div className="login-brand">
            <div className="login-brand-logo-wrap">
              <img src={primepowerLogo} alt="Prime Power Logo" className="login-brand-logo" />
            </div>
            <div className="login-brand-text">
              <span className="login-brand-name">PRIMEPOWER MANPOWER</span>
              <span className="login-brand-sub">Client Portal Security</span>
            </div>
          </div>
        </header>

        {/* Split Content Hero Grid */}
        <div className="login-canvas-grid">
          {/* Left Column: Seamless Grounded Illustration */}
          <div className="login-visual-pane">
            <ClientAuthIllustration />
          </div>

          {/* Right Column: Reset Form Pane */}
          <div className="login-form-pane">
            <div className="login-form-header">
              <h1 className="login-title">Reset Password</h1>
              <p className="login-subtitle">
                Set a new secure password for your registered corporate client account.
              </p>
            </div>

            {success ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                  Password Updated Successfully
                </h2>
                <p style={{ fontSize: '13px', color: '#486F91', lineHeight: 1.5, marginBottom: '24px' }}>
                  Your corporate password has been reset. You can now sign in with your updated credentials.
                </p>
                <button
                  type="button"
                  className="login-submit-btn"
                  onClick={() => navigate('/client-portal/login', { replace: true })}
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <>
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

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                  <div className="login-fields-container">
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
                        <label htmlFor="cp-reset-email" className="login-field-label">
                          Corporate Email Address
                        </label>
                        <input
                          id="cp-reset-email"
                          type="email"
                          className="login-field-input"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@company.com.ph"
                          required
                        />
                      </div>
                    </div>

                    {!tokenParam && (
                      <div className="login-input-card">
                        <div className="login-field-icon-slot">
                          <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                            <path d="M21 2l-2 2m-1.5 1.5L12 11l-4-4 7.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                            <circle cx="7.5" cy="16.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                          </svg>
                        </div>
                        <div className="login-field-body">
                          <label htmlFor="cp-reset-token" className="login-field-label">
                            Reset Token
                          </label>
                          <input
                            id="cp-reset-token"
                            type="text"
                            className="login-field-input"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Enter 60-minute recovery token"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="login-input-card">
                      <div className="login-field-icon-slot">
                        <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </div>
                      <div className="login-field-body">
                        <label htmlFor="cp-reset-password" className="login-field-label">
                          New Password
                        </label>
                        <input
                          id="cp-reset-password"
                          type={showPassword ? 'text' : 'password'}
                          className="login-field-input"
                          placeholder="Min. 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="login-pwd-btn"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
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

                    <div className="login-input-card">
                      <div className="login-field-icon-slot">
                        <svg className="login-row-icon" viewBox="0 0 24 24" width="17" height="17">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                        </svg>
                      </div>
                      <div className="login-field-body">
                        <label htmlFor="cp-reset-confirm" className="login-field-label">
                          Confirm New Password
                        </label>
                        <input
                          id="cp-reset-confirm"
                          type={showConfirm ? 'text' : 'password'}
                          className="login-field-input"
                          placeholder="Re-enter new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="login-pwd-btn"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? (
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
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
                        Updating Password...
                      </span>
                    ) : (
                      'Save New Password'
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '14px' }}>
                    <Link to="/client-portal/login" className="login-link">
                      ← Return to Client Sign In
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
