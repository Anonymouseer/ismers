import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../features/auth/store/AuthStore';
import './SessionWarningModal.css';

/**
 * SessionWarningModal
 *
 * Listens for the 'primepower:session-warning' custom event dispatched by
 * AuthStore 1 minute before hard token expiry. Displays a corporate countdown
 * modal allowing the user to extend their session or sign out immediately.
 */
export default function SessionWarningModal() {
  const { logout, isAuthenticated } = useAuth();
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const intervalRef = useRef(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setSecondsLeft(60);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle "Continue Session" — triggers a DOM event to reset the idle timer
  const handleContinue = useCallback(() => {
    dismiss();
    // Dispatch a synthetic user activity event to reset the idle timer
    // in AuthStore across all tabs.
    window.dispatchEvent(new MouseEvent('mousedown'));
  }, [dismiss]);

  // Handle "Sign Out Now"
  const handleSignOut = useCallback(() => {
    dismiss();
    logout('manual');
  }, [dismiss, logout]);

  // Listen for the session warning event
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleWarning = (e) => {
      const totalSeconds = (e.detail?.minutesLeft || 1) * 60;
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

    window.addEventListener('primepower:session-warning', handleWarning);
    return () => {
      window.removeEventListener('primepower:session-warning', handleWarning);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated]);

  // Auto-logout when countdown hits zero
  useEffect(() => {
    if (visible && secondsLeft <= 0) {
      dismiss();
      logout('expired');
    }
  }, [visible, secondsLeft, dismiss, logout]);

  if (!visible || !isAuthenticated) return null;

  const progressPercent = Math.max(0, (secondsLeft / 60) * 100);

  return (
    <>
      <div className="session-warning-backdrop" />
      <div
        className="session-warning-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label="Session Expiry Warning"
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
            <h3 className="session-warning-title">Session Expiring</h3>
            <div className="session-warning-subtitle">Security Timeout Notice</div>
          </div>
        </div>

        <div className="session-warning-body">
          <p className="session-warning-message">
            Your session will expire due to the security timeout policy.
            Select &quot;Continue Session&quot; to remain signed in, or your session
            will be terminated automatically.
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
