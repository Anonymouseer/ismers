import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { subscribeRealtimeEvents } from '../../utils/realtimeSync';
import './UIFeedback.css';

const NOTIFICATIONS_STORAGE_KEY = 'ismers_notifications_feed_v1';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Candidate Profile Completed',
    message: 'Shaira Domingo (REG-006) profile verified and marked ready for recruitment.',
    module: 'Applicant Intake',
    type: 'success',
    time: '10m ago',
    timestamp: Date.now() - 10 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Client Requisition Active',
    message: 'Job Order #JO-001 for ABC Logistics (Warehouse Associate) reached 12/15 target.',
    module: 'Job Orders',
    type: 'info',
    time: '25m ago',
    timestamp: Date.now() - 25 * 60 * 1000,
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Deployment Cleared',
    message: 'Andrea Molina (DEP-001) 6/6 pre-employment requirements cleared for Seda Vertis North.',
    module: 'Deployment',
    type: 'success',
    time: '1h ago',
    timestamp: Date.now() - 60 * 60 * 1000,
    read: true,
  },
];

function loadInitialNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_NOTIFICATIONS;
}

const UIFeedbackContext = createContext(null);

export function UIFeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [busyOverlay, setBusyOverlay] = useState(null);
  const [notifications, setNotifications] = useState(loadInitialNotifications);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const addNotification = useCallback(({ title, message, type = 'success', module = 'System' }) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNotif = {
      id,
      title,
      message,
      type,
      module,
      time: 'Just now',
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Toast Notification System ──
  const showToast = useCallback(({ title, message, type = 'success', module = 'Workflow', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { id, title, message, type, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    addNotification({ title, message, type, module });

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, [addNotification]);

  // ── Real-time Event Subscription (0ms Multi-Tab / Multi-Module Sync) ──
  useEffect(() => {
    const unsubscribe = subscribeRealtimeEvents((event) => {
      if (!event || !event.type) return;

      if (event.type === 'JOB_ORDER_CREATED') {
        const job = event.payload?.jobOrder || event.payload || {};
        const clientName = job.client || job.company || 'Client Partner';
        const jobTitle = job.title || job.position || 'Open Requisition';
        const headcount = job.total || job.headcount || 1;
        const refCode = job.ref || job.id ? ` · Ref #${job.ref || job.id}` : '';

        showToast({
          title: 'New Job Order Requisition',
          message: `New requisition received for ${clientName} (${jobTitle}, Target: ${headcount} headcount)${refCode}.`,
          type: 'info',
          module: 'Job Orders',
        });
      } else if (event.type === 'EMPLOYEE_DEPLOYED') {
        const dep = event.payload?.deployment || event.payload || {};
        const employee = dep.employee || dep.name || 'Candidate';
        const client = dep.client || 'Client Facility';

        showToast({
          title: 'Candidate Deployment Dispatched',
          message: `${employee} deployment cleared & dispatched to ${client}.`,
          type: 'success',
          module: 'Deployment',
        });
      } else if (event.type === 'STAGE_CHANGED') {
        const payload = event.payload || {};
        const candidateName = payload.name || 'Candidate';
        const stage = (payload.stage || 'Next Stage').replace(/_/g, ' ').toUpperCase();

        addNotification({
          title: 'Pipeline Stage Updated',
          message: `${candidateName} moved to ${stage}.`,
          type: 'info',
          module: 'Recruitment',
        });
      } else if (event.type === 'ENDORSEMENT_STATUS_CHANGED' || event.type === 'CLIENT_INTERVIEW_SCHEDULED') {
        const payload = event.payload || {};
        const candidateName = payload.name || payload.candidateName || 'Candidate';
        const clientName = payload.client || payload.clientName || payload.company || 'Client Partner';
        const status = payload.status;
        if (status === 'Accepted for Interview' || event.type === 'CLIENT_INTERVIEW_SCHEDULED') {
          const scheduleStr = interview?.date && interview?.time
            ? ` on ${interview.date} at ${interview.time} (${interview.mode || 'Virtual / Online'})`
            : '';
          addNotification({
            title: 'Client Interview Scheduled',
            message: `${clientName} accepted endorsement & scheduled interview for ${candidateName}${scheduleStr}.`,
            type: 'success',
            module: 'Client Portal',
          });
          showToast({
            title: 'Client Interview Confirmed',
            message: `${clientName} confirmed interview for ${candidateName}${scheduleStr}.`,
            type: 'success',
            module: 'Client Portal',
          });
        } else if (status === 'Passed Interview') {
          addNotification({
            title: 'Client Interview Passed',
            message: `${clientName} marked ${candidateName} as PASSED interview. Ready for pre-employment requirements.`,
            type: 'success',
            module: 'Client Portal',
          });
        } else if (status === 'Declined') {
          addNotification({
            title: 'Client Candidate Declined',
            message: `${clientName} declined candidate ${candidateName} for reassignment to pooling.`,
            type: 'warning',
            module: 'Client Portal',
          });
        }
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [showToast, addNotification]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Confirmation Modal System ──
  const confirmAction = useCallback(({
    title = 'Confirm Workflow Action',
    message = 'Are you sure you wish to proceed with this action?',
    description = null,
    confirmLabel = 'Confirm & Proceed',
    cancelLabel = 'Cancel',
    variant = 'primary', // 'primary' | 'danger' | 'warning'
    details = null, // array of { label, value }
  }) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        title,
        message,
        description,
        confirmLabel,
        cancelLabel,
        variant,
        details,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  // ── Action Executor with Delay & Visual Feedback ──
  const executeWithFeedback = useCallback(async ({
    actionFn,
    confirmConfig = null,
    busyMessage = 'Processing transaction...',
    successTitle = 'Transaction Completed',
    successMessage = 'The requested operation was executed successfully.',
    delayMs = 450,
  }) => {
    if (confirmConfig) {
      const confirmed = await confirmAction(confirmConfig);
      if (!confirmed) return false;
    }

    setBusyOverlay(busyMessage);
    try {
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
      const result = await actionFn();
      if (successMessage) {
        showToast({
          title: successTitle,
          message: typeof successMessage === 'function' ? successMessage(result) : successMessage,
          type: 'success',
        });
      }
      return result;
    } catch (err) {
      console.error('Operation failed:', err);
      showToast({
        title: 'Operation Failed',
        message: err.message || 'An unexpected error occurred during execution.',
        type: 'error',
      });
      return false;
    } finally {
      setBusyOverlay(null);
    }
  }, [confirmAction, showToast]);

  return (
    <UIFeedbackContext.Provider value={{
      showToast,
      removeToast,
      confirmAction,
      executeWithFeedback,
      setBusyOverlay,
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      clearNotifications,
      addNotification,
    }}>
      {children}

      {/* GLOBAL TOAST CONTAINER */}
      <div className="corporate-toast-container" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`corporate-toast-card toast-${toast.type}`} role="status">
            <div className="toast-indicator-strip" />
            <div className="toast-icon-box">
              {toast.type === 'success' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              )}
            </div>
            <div className="toast-content-body">
              <div className="toast-header-row">
                <span className="toast-title">{toast.title}</span>
                <span className="toast-time">{toast.timestamp}</span>
              </div>
              <p className="toast-description">{toast.message}</p>
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* EXECUTIVE PRE-DEPLOYMENT STYLE CONFIRMATION MODAL */}
      {confirmDialog && (
        <div className="corporate-modal-backdrop" onClick={confirmDialog.onCancel}>
          <div
            className="corporate-modal-dialog fancy-executive-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* HEADER */}
            <div className="fancy-modal-head">
              <div className="fancy-head-left">
                <div className={`fancy-modal-avatar avatar-${confirmDialog.variant}`}>
                  {confirmDialog.variant === 'danger' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  ) : confirmDialog.variant === 'warning' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                  )}
                </div>
                <div className="fancy-title-wrap">
                  <div className="fancy-directive-pill">
                    <span className="pill-dot" />
                    Official Workflow Verification &middot; DOLE D.O. 174
                  </div>
                  <h3 className="fancy-head-title">{confirmDialog.title}</h3>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-icon-btn fancy-close-btn"
                onClick={confirmDialog.onCancel}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="fancy-modal-body">
              {/* PRIMARY PROMPT CARD */}
              <div className="fancy-prompt-hero">
                <div className="fancy-prompt-text">{confirmDialog.message}</div>
                {confirmDialog.description && (
                  <div className="fancy-desc-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    <span>{confirmDialog.description}</span>
                  </div>
                )}
              </div>

              {/* STRUCTURED PARAMETER MATRIX */}
              {Array.isArray(confirmDialog.details) && confirmDialog.details.length > 0 && (
                <div className="fancy-matrix-card">
                  <div className="matrix-header-bar">
                    <span>Transaction Parameters</span>
                    <span className="matrix-status-pill">Active Audit Log</span>
                  </div>
                  <div className="matrix-grid">
                    {confirmDialog.details.map((d, idx) => (
                      <div key={idx} className="matrix-cell">
                        <div className="matrix-cell-label">{d.label}</div>
                        <div className="matrix-cell-value">{d.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COMPLIANCE FOOTNOTE */}
              <div className="fancy-compliance-note">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13, flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>This authorization will be permanently logged in the PRIMEPOWER compliance ledger and broadcast in real time across active terminals.</span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="fancy-modal-footer">
              <button
                type="button"
                className="btn fancy-btn-cancel"
                onClick={confirmDialog.onCancel}
              >
                {confirmDialog.cancelLabel}
              </button>
              <button
                type="button"
                className={`btn fancy-btn-confirm ${confirmDialog.variant}`}
                onClick={confirmDialog.onConfirm}
              >
                <span>{confirmDialog.confirmLabel}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL BUSY PROCESSING OVERLAY */}
      {busyOverlay && (
        <div className="corporate-busy-backdrop" role="alert" aria-busy="true">
          <div className="corporate-busy-card fancy-busy-card">
            <div className="fancy-spinner-ring">
              <div className="fancy-spinner-inner" />
            </div>
            <div className="busy-text-wrap">
              <div className="fancy-busy-badge">PRIMEPOWER SYSTEM LEDGER</div>
              <span className="busy-title">Executing System Transaction</span>
              <p className="busy-subtitle">{busyOverlay}</p>
            </div>
          </div>
        </div>
      )}
    </UIFeedbackContext.Provider>
  );
}

export function useUIFeedback() {
  const context = useContext(UIFeedbackContext);
  if (!context) {
    throw new Error('useUIFeedback must be used within a UIFeedbackProvider');
  }
  return context;
}
export default UIFeedbackContext;
