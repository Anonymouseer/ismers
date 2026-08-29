import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { clientPortalService } from '../services/ClientPortalService';
import primepowerLogo from '../../../assets/primepower-logo.svg';
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
    try {
      const theme = localStorage.getItem('theme') || 'light';
      const density = localStorage.getItem('density') || 'comfortable';
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-density', density);
      if (theme === 'dark') document.body.classList.add('dark');
      else document.body.classList.remove('dark');
    } catch { /* ignore */ }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email address is required.');
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
      const msg = err.response?.data?.message || err.response?.data?.email?.[0] || 'Unable to reset password. The link may have expired.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
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
              <div className="cp-login-logo-dept">CLIENT PORTAL ACCESS</div>
            </div>
          </div>

          <div className="cp-login-form-eyebrow">Credential Recovery</div>
          <h1 className="cp-login-form-heading">Reset Password</h1>
          <p className="cp-login-form-desc">
            Set a new secure password for your registered corporate client account.
          </p>

          {success ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>
                Password Updated Successfully
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '24px' }}>
                Your corporate password has been reset. You can now sign in with your updated credentials.
              </p>
              <button
                type="button"
                className="cp-login-submit"
                onClick={() => navigate('/client-portal/login', { replace: true })}
              >
                Proceed to Sign In
              </button>
            </div>
          ) : (
            <>
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

              <form className="cp-login-form" onSubmit={handleSubmit} noValidate>
                <div className="cp-login-field">
                  <label className="cp-login-label" htmlFor="cp-reset-email">
                    Corporate Email Address
                  </label>
                  <div className="cp-login-input-wrap">
                    <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      id="cp-reset-email"
                      type="email"
                      className="cp-login-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                {!tokenParam && (
                  <div className="cp-login-field">
                    <label className="cp-login-label" htmlFor="cp-reset-token">
                      Reset Token
                    </label>
                    <div className="cp-login-input-wrap">
                      <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M21 2l-2 2m-1.5 1.5L12 11l-4-4 7.5-7.5" />
                        <circle cx="7.5" cy="16.5" r="5.5" />
                      </svg>
                      <input
                        id="cp-reset-token"
                        type="text"
                        className="cp-login-input"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Enter 60-minute recovery token"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="cp-login-field">
                  <label className="cp-login-label" htmlFor="cp-reset-password">
                    New Password
                  </label>
                  <div className="cp-login-input-wrap">
                    <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="cp-reset-password"
                      type={showPassword ? 'text' : 'password'}
                      className="cp-login-input"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="cp-login-pw-toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="cp-login-field">
                  <label className="cp-login-label" htmlFor="cp-reset-confirm">
                    Confirm New Password
                  </label>
                  <div className="cp-login-input-wrap">
                    <svg className="cp-login-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="cp-reset-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      className="cp-login-input"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="cp-login-pw-toggle"
                      onClick={() => setShowConfirm((v) => !v)}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="cp-login-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Updating Password...' : 'Save New Password'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <Link to="/client-portal/login" style={{ fontSize: '12px', color: 'var(--primary, #007dcc)', textDecoration: 'none', fontWeight: 600 }}>
                    Return to Sign In
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>

        <footer className="cp-login-panel-footer">
          &copy; {new Date().getFullYear()} PRIMEPOWER MANPOWER SERVICES. All rights reserved. &nbsp;&middot;&nbsp; DOLE Accredited &nbsp;&middot;&nbsp; RA 10173 Enterprise Security
        </footer>
      </main>
    </div>
  );
}
