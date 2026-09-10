import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../features/auth/store/AuthStore';
import './SessionWarningModal.css';

/**
 * SessionWarningModal
 *
 * Listens for the 'primepower:session-warning' custom event dispatched by
 * AuthStore 1 minute before idle or token expiry. Displays a corporate countdown
 * modal allowing the user to extend their session or sign out immediately.
 * Dismisses automatically if user activity is detected.
 */
export default function SessionWarningModal() {
  const { logout, isAuthenticated, extendSession } = useAuth();
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [warningReason, setWarningReason] = useState('idle');
  const intervalRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setSecondsLeft(60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle "Continue Session" — explicitly refreshes the session token & idle timers
  const handleContinue = useCallback(async () => {
    dismiss();
    if (extendSession) {
      await extendSession();
    }
  }, [dismiss, extendSession]);

  // Handle "Sign Out Now"
  const handleSignOut = useCallback(() => {
    dismiss();
    logout('manual');
  }, [dismiss, logout]);

  // Listen for session warning and session resumed events
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleWarning = (e) => {
      const totalSeconds = e.detail?.secondsLeft || (e.detail?.minutesLeft || 1) * 60;
      setWarningReason(e.detail?.reason || 'idle');
      setSecondsLeft(totalSeconds);
      setVisible(true);

      // Start countdown
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const handleResumed = () => {
      dismiss();
    };

    window.addEventListener('primepower:session-warning', handleWarning);
    window.addEventListener('primepower:session-resumed', handleResumed);

    return () => {
      window.removeEventListener('primepower:session-warning', handleWarning);
      window.removeEventListener('primepower:session-resumed', handleResumed);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, dismiss]);

  // Auto-logout when countdown hits zero
  useEffect(() => {
    if (visible && secondsLeft <= 0) {
      dismiss();
      logout(warningReason === 'token' ? 'expired' : 'idle');
    }
  }, [visible, secondsLeft, warningReason, dismiss, logout]);

  if (!visible || !isAuthenticated) return null;

  const progressPercent = Math.max(0, (secondsLeft / 60) * 100);

  return (
    <>
      <div className="session-warning-backdrop" onClick={handleContinue} />
      <div
        className="session-warning-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label="Session Inactivity Warning"
      >
        <div className="session-warning-header">
          <div className="session-warning-icon-badge">
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
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h3 className="session-warning-title">Session Expiring Soon</h3>
            <div className="session-warning-subtitle">
              {warningReason === 'token' ? 'Workday Shift Policy Notice' : 'Inactivity Security Notice'}
            </div>
          </div>
        </div>

        <div className="session-warning-body">
          <p className="session-warning-message">
            {warningReason === 'token'
              ? 'Your workday authentication token is about to expire. Click "Continue Session" to extend your workday session for another 8 hours.'
              : 'You have been inactive. For your security, your session will automatically terminate unless you continue your active work.'}
          </p>

          <div className="session-warning-countdown">
            <div>
              <div className="session-warning-countdown-value">{secondsLeft}</div>
              <div className="session-warning-countdown-label">Seconds Remaining</div>
            </div>
          </div>

          <div className="session-warning-progress-track">
            <div
              className="session-warning-progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="session-warning-actions">
            <button
              type="button"
              className="session-warning-btn session-warning-btn--secondary"
              onClick={handleSignOut}
            >
              Sign Out Now
            </button>
            <button
              type="button"
              className="session-warning-btn session-warning-btn--primary"
              onClick={handleContinue}
              autoFocus
            >
              Continue Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
