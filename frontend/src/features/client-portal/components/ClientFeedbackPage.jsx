import { useState, useMemo, useEffect } from 'react';

const CATEGORIES = [
  { value: 'service_quality', label: 'Service Quality' },
  { value: 'recruitment_process', label: 'Recruitment Process' },
  { value: 'employee_performance', label: 'Employee Performance' },
  { value: 'account_management', label: 'Account Management' },
  { value: 'communication', label: 'Communication & Responsiveness' },
  { value: 'overall', label: 'Overall Experience' },
];

const RATING_LABELS = {
  1: 'Poor',
  2: 'Below Average',
  3: 'Satisfactory',
  4: 'Good',
  5: 'Excellent',
};

function StarRating({ value, onChange, id }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div
      className="cp-feedback-stars"
      role="group"
      aria-label="Star rating"
      id={id}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`cp-feedback-star ${display >= star ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star !== 1 ? 's' : ''} - ${RATING_LABELS[star]}`}
          title={RATING_LABELS[star]}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      {display > 0 && (
        <span className="cp-feedback-star-label">{RATING_LABELS[display]}</span>
      )}
    </div>
  );
}

function FeedbackCard({ fb }) {
  const categoryObj = CATEGORIES.find((c) => c.value === fb.category);

  const statusClass =
    fb.status === 'Acknowledged'
      ? 'client-portal-badge--active'
      : fb.status === 'Under Review'
      ? 'client-portal-badge--review'
      : fb.status === 'Resolved'
      ? 'client-portal-badge--filled'
      : 'client-portal-badge--pending';

  return (
    <div className="cp-feedback-card">
      <div className="cp-feedback-card-head">
        <div className="cp-feedback-card-meta">
          <span className="cp-feedback-ref">{fb.ref}</span>
          <span className={`client-portal-badge ${statusClass}`}>{fb.status}</span>
          {fb.employeeName && (
            <span className="cp-feedback-employee-tag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {fb.employeeName}
            </span>
          )}
        </div>
        <div className="cp-feedback-card-date">{fb.date}</div>
      </div>

      <div className="cp-feedback-card-body">
        <div className="cp-feedback-card-category">
          {categoryObj?.label || fb.category}
        </div>
        <div className="cp-feedback-card-stars-display">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg
              key={s}
              viewBox="0 0 24 24"
              fill={fb.rating >= s ? 'var(--cp-star-active, #f59e0b)' : 'var(--border)'}
              className="cp-feedback-star-sm"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="cp-feedback-rating-text">{RATING_LABELS[fb.rating]}</span>
        </div>
        <p className="cp-feedback-card-comment">{fb.comment}</p>
        {fb.response && (
          <div className="cp-feedback-response-block">
            <div className="cp-feedback-response-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              PRIMEPOWER Response
            </div>
            <p className="cp-feedback-response-text">{fb.response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FeedbackModal({ deployedRoster, onClose, onSubmit }) {
  const [form, setForm] = useState({
    category: '',
    employeeId: '',
    rating: 0,
    comment: '',
    suggestions: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleFormChange = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => ({ ...prev, [field]: val }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleRatingChange = (val) => {
    setForm((prev) => ({ ...prev, rating: val }));
    if (formErrors.rating) setFormErrors((prev) => ({ ...prev, rating: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!form.category) errors.category = 'Please select a feedback category.';
    if (!form.rating || form.rating < 1) errors.rating = 'Please provide a star rating.';
    if (!form.comment.trim()) errors.comment = 'Please provide your feedback comments.';
    else if (form.comment.trim().length < 20) errors.comment = 'Feedback must be at least 20 characters.';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    setSubmitting(true);
    setTimeout(() => {
      const selectedEmp = deployedRoster.find((emp) => emp.id === form.employeeId);
      onSubmit({
        category: form.category,
        employeeName: selectedEmp ? selectedEmp.employeeName : null,
        rating: form.rating,
        comment: form.comment.trim(),
        suggestions: form.suggestions.trim(),
      });
      setSubmitting(false);
    }, 600);
  };

  return (
    <>
      <div className="cp-modal-overlay" onClick={onClose} />
      <div
        className="cp-modal-panel cp-feedback-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Submit Feedback"
      >
        <div className="cp-modal-head">
          <div className="cp-feedback-modal-head-inner">
            <div className="cp-feedback-modal-head-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <div className="cp-modal-title">Submit Client Feedback</div>
              <div className="cp-feedback-modal-subtitle">
                Confidential — reviewed by our Senior Client Relations team
              </div>
            </div>
          </div>
          <button type="button" className="cp-modal-close" onClick={onClose} aria-label="Close">
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form className="cp-modal-body cp-feedback-modal-body" onSubmit={handleSubmit} noValidate>
          <div className="cp-modal-section">
            <div className="cp-modal-section-title">Feedback Details</div>
            <div className="cp-modal-row">
              <div className="cp-modal-field">
                <label htmlFor="fb-modal-category">
                  Category <span className="cp-modal-req">*</span>
                </label>
                <select
                  id="fb-modal-category"
                  className={`cp-modal-input ${formErrors.category ? 'cp-modal-input--error' : ''}`}
                  value={form.category}
                  onChange={handleFormChange('category')}
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {formErrors.category && <span className="cp-modal-error">{formErrors.category}</span>}
              </div>
              <div className="cp-modal-field">
                <label htmlFor="fb-modal-employee">Related Employee (Optional)</label>
                <select
                  id="fb-modal-employee"
                  className="cp-modal-input"
                  value={form.employeeId}
                  onChange={handleFormChange('employeeId')}
                >
                  <option value="">Not specific to a deployed employee</option>
                  {deployedRoster.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeName} — {emp.position}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="cp-modal-field">
              <label>Overall Rating <span className="cp-modal-req">*</span></label>
              <StarRating id="fb-modal-rating" value={form.rating} onChange={handleRatingChange} />
              {formErrors.rating && <span className="cp-modal-error">{formErrors.rating}</span>}
            </div>
          </div>

          <div className="cp-modal-section">
            <div className="cp-modal-section-title">Comments & Suggestions</div>
            <div className="cp-modal-field">
              <label htmlFor="fb-modal-comment">
                Feedback Details <span className="cp-modal-req">*</span>
              </label>
              <textarea
                id="fb-modal-comment"
                className={`cp-modal-input cp-feedback-textarea ${formErrors.comment ? 'cp-modal-input--error' : ''}`}
                placeholder="Describe your experience, specific observations, or concerns regarding the service or employee..."
                value={form.comment}
                onChange={handleFormChange('comment')}
                rows={4}
              />
              <div className="cp-feedback-char-count">
                {form.comment.length} characters
                {form.comment.length > 0 && form.comment.length < 20 && (
                  <span className="cp-feedback-char-warn"> (minimum 20 required)</span>
                )}
              </div>
              {formErrors.comment && <span className="cp-modal-error">{formErrors.comment}</span>}
            </div>
            <div className="cp-modal-field">
              <label htmlFor="fb-modal-suggestions">Suggestions for Improvement (Optional)</label>
              <textarea
                id="fb-modal-suggestions"
                className="cp-modal-input cp-feedback-textarea cp-feedback-textarea--sm"
                placeholder="Any specific recommendations that would help us improve our service delivery..."
                value={form.suggestions}
                onChange={handleFormChange('suggestions')}
                rows={3}
              />
            </div>
          </div>

          <div className="cp-feedback-disclaimer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            All feedback is treated with strict confidentiality and reviewed by senior management within 3 business days. Handled in accordance with RA 10173 (Data Privacy Act of 2012).
          </div>

          <div className="cp-modal-footer">
            <button type="button" className="cp-feedback-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button id="fb-modal-submit-btn" type="submit" className="client-portal-btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <svg className="cp-feedback-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const MOCK_PAST_FEEDBACK = [
  {
    id: 'fb-001',
    ref: 'FBK-2026-0001',
    date: 'Aug 10, 2026',
    category: 'employee_performance',
    employeeName: 'Rodrigo Santos',
    rating: 5,
    comment: 'Mr. Santos has demonstrated exceptional diligence and punctuality since deployment. His output consistently meets our quality standards and he integrates well with the plant team. We are highly satisfied with this placement.',
    status: 'Acknowledged',
    response: 'Thank you for the positive feedback on Mr. Santos. We will commend him and include this in his performance record. We look forward to continuing our partnership.',
  },
  {
    id: 'fb-002',
    ref: 'FBK-2026-0002',
    date: 'Aug 03, 2026',
    category: 'recruitment_process',
    employeeName: null,
    rating: 4,
    comment: 'The endorsement process for our Safety Officer request was smooth and well-coordinated. The pre-screened candidates submitted were well-qualified. Minor suggestion: additional lead time notice before interview scheduling would be helpful.',
    status: 'Resolved',
    response: 'Thank you for the constructive feedback. We have updated our internal scheduling protocol to provide at least 48 hours advance notice for all client interview arrangements.',
  },
  {
    id: 'fb-003',
    ref: 'FBK-2026-0003',
    date: 'Jul 22, 2026',
    category: 'communication',
    employeeName: null,
    rating: 3,
    comment: 'There was a brief gap in communication during the initial onboarding phase of our last manpower request. Response time from the assigned recruiter took longer than expected during that period.',
    status: 'Resolved',
    response: 'We sincerely apologize for the communication delay. The issue has been escalated to the team lead and corrective measures are in place. Your account manager has been updated accordingly.',
  },
];

export default function ClientFeedbackPage({ session, deployedRoster = [] }) {
  const [feedbackList, setFeedbackList] = useState(() => {
    try {
      const raw = localStorage.getItem('cp_feedback_list');
      if (raw) return JSON.parse(raw);
    } catch {}
    return MOCK_PAST_FEEDBACK;
  });

  const [showModal, setShowModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (data) => {
    const refNum = String(feedbackList.length + 1).padStart(4, '0');
    const newFb = {
      id: `fb-${Date.now()}`,
      ref: `FBK-2026-${refNum}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      ...data,
      status: 'Under Review',
      response: null,
    };
    const updated = [newFb, ...feedbackList];
    setFeedbackList(updated);
    try { localStorage.setItem('cp_feedback_list', JSON.stringify(updated)); } catch {}
    setShowModal(false);
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 6000);
  };

  const filtered = useMemo(() => {
    return feedbackList.filter((fb) => {
      const catMatch = categoryFilter === 'ALL' || fb.category === categoryFilter;
      const ratingMatch = ratingFilter === 'ALL' || String(fb.rating) === String(ratingFilter);
      return catMatch && ratingMatch;
    });
  }, [feedbackList, categoryFilter, ratingFilter]);

  const avgRating =
    feedbackList.length > 0
      ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
      : '—';

  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    star: r,
    count: feedbackList.filter((f) => f.rating === r).length,
    pct: feedbackList.length > 0
      ? Math.round((feedbackList.filter((f) => f.rating === r).length / feedbackList.length) * 100)
      : 0,
  }));

  return (
    <div className="client-portal-view-container">

      {showModal && (
        <FeedbackModal
          deployedRoster={deployedRoster}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      <div className="client-portal-header">
        <div className="client-portal-header-left">
          <div className="client-portal-eyebrow">Service Quality & Relations</div>
          <h1 className="client-portal-title">Client Feedback</h1>
          <div className="client-portal-date">
            Share your experience with our services and deployed personnel
          </div>
        </div>
        <div className="client-portal-header-right">
          <button
            id="feedback-new-btn"
            type="button"
            className="client-portal-btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Submit New Feedback
          </button>
        </div>
      </div>

      {submitSuccess && (
        <div className="cp-feedback-success-banner" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Your feedback has been submitted and is now under review by our Client Relations team. Thank you.
        </div>
      )}

      <div className="cp-feedback-metrics-row">
        <div className="client-portal-card cp-feedback-metric-card">
          <div className="cp-feedback-metric-label">Total Feedback Submitted</div>
          <div className="cp-feedback-metric-value">{feedbackList.length}</div>
          <div className="cp-feedback-metric-sub">All time</div>
        </div>
        <div className="client-portal-card cp-feedback-metric-card cp-feedback-metric-card--avg">
          <div className="cp-feedback-metric-label">Average Rating</div>
          <div className="cp-feedback-metric-value cp-feedback-metric-value--stars">
            <svg viewBox="0 0 24 24" fill="var(--cp-star-active, #f59e0b)" style={{ width: 22, height: 22 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            {avgRating}
          </div>
          <div className="cp-feedback-metric-sub">Out of 5.0</div>
        </div>
        <div className="client-portal-card cp-feedback-metric-card">
          <div className="cp-feedback-metric-label">Rating Distribution</div>
          <div className="cp-feedback-dist-list">
            {ratingDist.map((d) => (
              <div key={d.star} className="cp-feedback-dist-row">
                <span className="cp-feedback-dist-star">{d.star}</span>
                <svg viewBox="0 0 24 24" fill="var(--cp-star-active, #f59e0b)" style={{ width: 10, height: 10, flexShrink: 0 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div className="cp-feedback-dist-bar-wrap">
                  <div className="cp-feedback-dist-bar-fill" style={{ width: `${d.pct}%` }} />
                </div>
                <span className="cp-feedback-dist-count">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="client-portal-card cp-feedback-metric-card">
          <div className="cp-feedback-metric-label">Response Rate</div>
          <div className="cp-feedback-metric-value">
            {feedbackList.length > 0
              ? Math.round((feedbackList.filter((f) => f.response).length / feedbackList.length) * 100)
              : 0}%
          </div>
          <div className="cp-feedback-metric-sub">Acknowledged by PRIMEPOWER</div>
        </div>
      </div>

      <div className="client-portal-card client-portal-controls-card">
        <div className="cp-feedback-filter-row">
          <div className="cp-feedback-filter-group">
            <label htmlFor="fb-cat-filter" className="client-portal-filter-label">Category:</label>
            <select
              id="fb-cat-filter"
              className="client-portal-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="cp-feedback-filter-group">
            <label htmlFor="fb-rating-filter" className="client-portal-filter-label">Rating:</label>
            <select
              id="fb-rating-filter"
              className="client-portal-filter-select"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="ALL">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={String(r)}>
                  {r} Star{r !== 1 ? 's' : ''} — {RATING_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="cp-feedback-filter-total">
            Showing {filtered.length} of {feedbackList.length} records
          </div>
        </div>
      </div>

      <div className="cp-feedback-list">
        {filtered.length === 0 ? (
          <div className="client-portal-card cp-feedback-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div className="cp-feedback-empty-title">No feedback records found</div>
            <div className="cp-feedback-empty-sub">
              Adjust your filters or submit your first feedback using the button above.
            </div>
          </div>
        ) : (
          filtered.map((fb) => <FeedbackCard key={fb.id} fb={fb} />)
        )}
      </div>
    </div>
  );
}