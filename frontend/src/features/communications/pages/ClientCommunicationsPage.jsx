import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { chatService } from '../services/ChatService';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../../../utils/realtimeSync';
import './ClientCommunicationsPage.css';

// ---------------------------------------------------------------------------
// HR Quick Response Presets
// ---------------------------------------------------------------------------
const HR_QUICK_RESPONSES = [
  {
    label: 'Endorsement Dispatched',
    text: 'Good day. We have endorsed a new batch of pre-screened candidate profiles to your portal for review and interview scheduling.',
  },
  {
    label: 'Interview Confirmed',
    text: 'The proposed applicant interview schedule has been confirmed with the candidate. Meeting coordinates are updated in the portal.',
  },
  {
    label: 'Requisition Acknowledged',
    text: 'Your new Job Order requisition has been acknowledged and is currently being processed by our sourcing and recruitment team.',
  },
  {
    label: 'Deployment Verified',
    text: 'The deployment mobilization checklist and required statutory compliance documents have been verified for your assigned roster.',
  },
  {
    label: 'Account Manager Briefing',
    text: 'Our Account Manager will conduct an operational check-in this week to review your current workforce metrics and upcoming headcount needs.',
  },
  {
    label: 'SLA Reminder',
    text: 'Please be advised that our standard Service Level Agreement stipulates a response turnaround of one (1) business day for all staffing-related requests submitted through this channel.',
  },
  {
    label: 'Documents Required',
    text: 'Kindly prepare and upload the following documents to the Client Portal for processing: valid business permit, BIR Certificate of Registration, and duly signed Service Agreement.',
  },
];

// ---------------------------------------------------------------------------
// Utility: Generate a deterministic HSL color from a company name string
// ---------------------------------------------------------------------------
function stringToHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ---------------------------------------------------------------------------
// Utility: Format a relative timestamp ("3 minutes ago", "Yesterday", etc.)
// ---------------------------------------------------------------------------
function relativeTime(iso) {
  if (!iso) return '';
  const then = new Date(iso);
  const now = new Date();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return then.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function fullDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Utility: Group messages by calendar date
// ---------------------------------------------------------------------------
function getDateLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Sub-component: Company Avatar (gradient, hue-based)
// ---------------------------------------------------------------------------
function CompanyAvatar({ name = '', size = 40, fontSize = 15, className = '' }) {
  const hue = stringToHue(name);
  const style = {
    width: size,
    height: size,
    fontSize,
    background: `linear-gradient(135deg, hsl(${hue},65%,42%) 0%, hsl(${hue},55%,28%) 100%)`,
    borderRadius: 8,
    color: '#fff',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    letterSpacing: '0.5px',
  };
  return (
    <div className={className} style={style}>
      {(name || 'C')[0].toUpperCase()}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Preset button with tooltip
// ---------------------------------------------------------------------------
function PresetButton({ label, text, onClick }) {
  return (
    <div className="hr-comm-preset-wrap">
      <button
        type="button"
        className="hr-comm-preset-btn"
        onClick={() => onClick(text)}
      >
        {label}
      </button>
      <div className="hr-comm-preset-tooltip">{text}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ClientCommunicationsPage() {
  const { collapsed } = useOutletContext() || { collapsed: false };
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [optimisticId, setOptimisticId] = useState(null);

  const messagesEndRef = useRef(null);
  const viewportRef = useRef(null);
  const textareaRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const pollDelayRef = useRef(5000);
  const isPollingRef = useRef(false);
  const selectedThreadIdRef = useRef(selectedThreadId);
  const loadedThreadIdsRef = useRef(new Set());
  const messagesCacheRef = useRef({});
  const errorTimerRef = useRef(null);

  useEffect(() => {
    selectedThreadIdRef.current = selectedThreadId;
  }, [selectedThreadId]);

  // --------------------------------------------------------------------------
  // Scroll helpers
  // --------------------------------------------------------------------------
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  }, []);

  const handleViewportScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  }, []);

  // --------------------------------------------------------------------------
  // Error message with auto-dismiss
  // --------------------------------------------------------------------------
  const showError = useCallback((msg) => {
    setErrorMsg(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(''), 5000);
  }, []);

  // --------------------------------------------------------------------------
  // Smart polling: accelerate on activity, back off on idle / errors
  // --------------------------------------------------------------------------
  const resetPollDelay = useCallback(() => {
    pollDelayRef.current = 4000;
  }, []);

  const backoffPollDelay = useCallback(() => {
    pollDelayRef.current = Math.min(pollDelayRef.current * 1.4, 20000);
  }, []);

  const errorBackoffPollDelay = useCallback(() => {
    pollDelayRef.current = Math.min(Math.max(pollDelayRef.current * 2, 10000), 30000);
  }, []);

  // --------------------------------------------------------------------------
  // Data fetching
  // --------------------------------------------------------------------------
  const loadThreads = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoadingThreads(true);
      const res = await chatService.getThreads();
      const list = res.threads || [];

      setThreads(() => list);

      // URL param resolution
      const paramClientId = searchParams.get('clientId');
      const paramThreadId = searchParams.get('threadId');

      if (paramThreadId) {
        setSelectedThreadId((prev) => prev ?? Number(paramThreadId));
      } else if (paramClientId) {
        const found = list.find((t) => String(t.clientAccountId) === String(paramClientId));
        if (found) {
          setSelectedThreadId((prev) => prev ?? found.id);
        } else {
          try {
            const newThread = await chatService.findOrCreateForClient(paramClientId);
            if (newThread?.id) {
              setThreads((prev) => [newThread, ...prev.filter((p) => p.id !== newThread.id)]);
              setSelectedThreadId(newThread.id);
            }
          } catch {
            // ignore
          }
        }
      } else {
        setSelectedThreadId((prev) => prev ?? (list.length > 0 ? list[0].id : null));
      }
      setInitialLoaded(true);
    } catch (err) {
      console.error('Failed to load chat threads:', err);
      errorBackoffPollDelay();
      if (!initialLoaded) {
        setTimeout(() => loadThreads(false), 800);
      }
    } finally {
      if (!isSilent) setLoadingThreads(false);
    }
  }, [searchParams, errorBackoffPollDelay, initialLoaded]);

  const loadMessages = useCallback(async (threadId, isSilent = false) => {
    if (!threadId) return;
    try {
      const hasCached = !!messagesCacheRef.current[threadId];
      if (!isSilent && !hasCached) setLoadingMessages(true);
      const res = await chatService.getMessages(threadId);
      const incoming = res.messages || [];

      messagesCacheRef.current[threadId] = incoming;
      if (selectedThreadIdRef.current === threadId) {
        setMessages(() => incoming);
        setOptimisticId(null);
      }
      loadedThreadIdsRef.current.add(threadId);

      // Clear unread locally for immediate UI response
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, unreadHrCount: 0 } : t))
      );

      backoffPollDelay();
    } catch (err) {
      console.error('Failed to load thread messages:', err);
      errorBackoffPollDelay();
    } finally {
      if (!isSilent) setLoadingMessages(false);
    }
  }, [backoffPollDelay, errorBackoffPollDelay]);

  // --------------------------------------------------------------------------
  // Smart polling loop — dynamically adjusts interval with concurrency guard
  // --------------------------------------------------------------------------
  const schedulePoll = useCallback(() => {
    clearTimeout(pollIntervalRef.current);
    pollIntervalRef.current = setTimeout(async () => {
      if (!isPollingRef.current && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
        isPollingRef.current = true;
        try {
          await loadThreads(true);
          const currentTid = selectedThreadIdRef.current;
          if (currentTid) {
            await loadMessages(currentTid, true);
          }
        } catch {
          // non-fatal
        } finally {
          isPollingRef.current = false;
        }
      }
      schedulePoll();
    }, pollDelayRef.current);
  }, [loadThreads, loadMessages]);

  // --------------------------------------------------------------------------
  // Mount / realtime subscription / polling
  // --------------------------------------------------------------------------
  useEffect(() => {
    loadThreads();

    const unsubscribe = subscribeRealtimeEvents((event) => {
      if (event?.type === 'CHAT_MESSAGE_SENT' || event?.type === 'CHAT_MESSAGE_RECEIVED') {
        resetPollDelay();
        loadThreads(true);
        const currentTid = selectedThreadIdRef.current;
        if (currentTid) {
          loadMessages(currentTid, true);
        }
      }
    });

    // Immediate refresh when tab regains visibility or window focus
    const handleVisible = () => {
      if (document.visibilityState === 'visible') {
        resetPollDelay();
        loadThreads(true);
        const currentTid = selectedThreadIdRef.current;
        if (currentTid) loadMessages(currentTid, true);
      }
    };
    const handleFocus = () => {
      resetPollDelay();
      loadThreads(true);
      const currentTid = selectedThreadIdRef.current;
      if (currentTid) loadMessages(currentTid, true);
    };

    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', handleFocus);

    schedulePoll();

    return () => {
      unsubscribe();
      clearTimeout(pollIntervalRef.current);
      clearTimeout(errorTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedThreadId) return;

    const cached = messagesCacheRef.current[selectedThreadId];
    if (cached) {
      // Thread messages already cached in memory: revalidate silently in background
      loadMessages(selectedThreadId, true);
    } else {
      // First-time load: display chatbox skeleton strictly within the message viewport
      setMessages([]);
      setLoadingMessages(true);
      loadMessages(selectedThreadId, false);
    }
  }, [selectedThreadId, loadMessages]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // --------------------------------------------------------------------------
  // Textarea auto-resize
  // --------------------------------------------------------------------------
  const handleTextareaChange = (e) => {
    setReplyText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  // --------------------------------------------------------------------------
  // Derived state
  // --------------------------------------------------------------------------
  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === selectedThreadId) || null;
  }, [threads, selectedThreadId]);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.company?.toLowerCase().includes(q) ||
        t.contactPerson?.toLowerCase().includes(q) ||
        t.companyId?.toLowerCase().includes(q) ||
        t.accountManager?.toLowerCase().includes(q)
    );
  }, [threads, searchQuery]);

  const totalUnreadCount = useMemo(() => {
    return threads.reduce((sum, t) => sum + (t.unreadHrCount || 0), 0);
  }, [threads]);

  const charCount = replyText.length;
  const charWarning = charCount > 2900 ? 'danger' : charCount > 2700 ? 'warn' : '';

  // --------------------------------------------------------------------------
  // Message grouping by date
  // --------------------------------------------------------------------------
  const groupedMessages = useMemo(() => {
    const groups = [];
    let lastLabel = '';
    for (const msg of messages) {
      const label = getDateLabel(msg.createdAt);
      if (label !== lastLabel) {
        groups.push({ type: 'separator', label, key: `sep-${label}` });
        lastLabel = label;
      }
      groups.push({ type: 'message', data: msg, key: `msg-${msg.id}` });
    }
    return groups;
  }, [messages]);

  // --------------------------------------------------------------------------
  // Actions
  // --------------------------------------------------------------------------
  const handleSelectThread = (threadId) => {
    if (threadId === selectedThreadId) return;

    setSelectedThreadId(threadId);
    setSearchParams({ threadId: String(threadId) }, { replace: true });

    // Instantly hydrate the chatbox viewport from cache if available (0ms latency)
    if (messagesCacheRef.current[threadId]) {
      setMessages(messagesCacheRef.current[threadId]);
      setLoadingMessages(false);
    } else {
      // Clear viewport and display chatbox-specific skeleton
      setMessages([]);
      setLoadingMessages(true);
    }

    resetPollDelay();
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = replyText.trim();
    if (!text || sending || !selectedThreadId || !activeThread) return;

    setSending(true);
    setErrorMsg('');
    resetPollDelay();

    // Optimistic insertion
    const tempId = `optimistic-${Date.now()}`;
    const optimistic = {
      id: tempId,
      threadId: selectedThreadId,
      senderType: 'user',
      senderName: 'PRIMEPOWER HR',
      senderRole: 'HR Operations',
      message: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setOptimisticId(tempId);
    setMessages((prev) => [...prev, optimistic]);
    setReplyText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    scrollToBottom();

    try {
      const res = await chatService.sendMessage(selectedThreadId, text);
      if (res?.message) {
        // Replace optimistic with server response
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.message : m))
        );
        setOptimisticId(null);

        // Update thread preview locally
        setThreads((prev) =>
          prev.map((t) =>
            t.id === selectedThreadId
              ? {
                  ...t,
                  lastMessageAt: new Date().toISOString(),
                  lastMessagePreview: text,
                }
              : t
          )
        );

        broadcastRealtimeEvent('CHAT_MESSAGE_SENT', {
          threadId: selectedThreadId,
          senderType: 'user',
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to dispatch HR response:', err);
      // Roll back optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setOptimisticId(null);
      setReplyText(text);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 160) + 'px';
      }
      showError('Failed to deliver message. Please retry.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleApplyQuickResponse = (snippet) => {
    setReplyText(snippet);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + 'px';
      textareaRef.current.focus();
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className={`hr-comm-page-container ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* PAGE HEADER */}
      <header className="hr-comm-page-header">
        <div>
          <div className="hr-comm-eyebrow">Recruitment Operations &middot; Direct Channels</div>
          <h1 className="hr-comm-page-title">Client Communications Hub</h1>
        </div>
        <div className="hr-comm-header-meta">
          {totalUnreadCount > 0 && (
            <span className="hr-comm-unread-pill">{totalUnreadCount} Unread</span>
          )}
        </div>
      </header>

      {/* TWO-PANE WORKSPACE */}
      <div className="hr-comm-workspace">

        {/* LEFT PANE: CLIENT DIRECTORY */}
        <aside className="hr-comm-threads-panel">
          <div className="hr-comm-panel-header">
            <div className="hr-comm-panel-title">
              Corporate Accounts {(loadingThreads || !initialLoaded) && threads.length === 0 ? '' : `(${threads.length})`}
            </div>
            <div className="hr-comm-search-box">
              <svg className="hr-comm-search-icon" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="hr-comm-search-input"
                placeholder="Search company or contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="hr-comm-threads-list">
            {(loadingThreads || !initialLoaded) && threads.length === 0 ? (
              <div className="hr-comm-skeleton-threads">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="hr-comm-skeleton-thread-item">
                    <div className="hr-comm-skel hr-comm-skel-avatar" />
                    <div className="hr-comm-skeleton-thread-lines">
                      <div className="hr-comm-skel hr-comm-skel-title" />
                      <div className="hr-comm-skel hr-comm-skel-sub" />
                      <div className="hr-comm-skel hr-comm-skel-preview" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="hr-comm-no-threads">
                <span>No client conversations found.</span>
              </div>
            ) : (
              filteredThreads.map((t, idx) => {
                const isSelected = t.id === selectedThreadId;
                const hue = stringToHue(t.company || '');
                return (
                  <div
                    key={t.id}
                    className={`hr-comm-thread-item ${isSelected ? 'active' : ''}`}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    onClick={() => handleSelectThread(t.id)}
                  >
                    <div
                      className="hr-comm-thread-avatar"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue},65%,42%) 0%, hsl(${hue},55%,28%) 100%)`,
                      }}
                    >
                      {(t.company || 'C')[0].toUpperCase()}
                    </div>
                    <div className="hr-comm-thread-info">
                      <div className="hr-comm-thread-top">
                        <span className="hr-comm-thread-company">{t.company}</span>
                        <span
                          className="hr-comm-thread-time"
                          title={fullDateTime(t.lastMessageAt)}
                        >
                          {relativeTime(t.lastMessageAt)}
                        </span>
                      </div>
                      <div className="hr-comm-thread-sub">
                        <span className="hr-comm-thread-am">AM: {t.accountManager}</span>
                        {t.unreadHrCount > 0 && (
                          <span className="hr-comm-thread-unread-pill">{t.unreadHrCount}</span>
                        )}
                      </div>
                      <div className="hr-comm-thread-preview">
                        {t.lastMessagePreview || 'Channel initialized.'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANE: ACTIVE CONVERSATION STREAM */}
        <section className="hr-comm-stream-panel">
          {activeThread ? (
            <>
              {/* STREAM HEADER */}
              <header className="hr-comm-stream-header">
                <div className="hr-comm-stream-target">
                  <CompanyAvatar
                    name={activeThread.company}
                    size={44}
                    fontSize={17}
                    className="hr-comm-stream-avatar-wrap"
                  />
                  <div>
                    <div className="hr-comm-stream-company-row">
                      <h2 className="hr-comm-stream-company">{activeThread.company}</h2>
                      <span className="hr-comm-code-chip">{activeThread.companyId}</span>
                    </div>
                    <div className="hr-comm-stream-contact-meta">
                      <span>Contact: <b>{activeThread.contactPerson}</b></span>
                      <span className="hr-comm-sep">&bull;</span>
                      <span>Assigned AM: <b>{activeThread.accountManager}</b></span>
                      <span className="hr-comm-sep">&bull;</span>
                      <span>{activeThread.industry}</span>
                    </div>
                  </div>
                </div>

                <div className="hr-comm-stream-actions">
                  <button
                    type="button"
                    className="hr-comm-btn-outline"
                    onClick={() => navigate('/client-management')}
                    title="Open company details in Client Management"
                  >
                    View Account CRM
                  </button>
                </div>
              </header>

              {/* QUICK RESPONSE PRESETS */}
              <div className="hr-comm-quick-presets">
                <span className="hr-comm-presets-label">Operational Presets:</span>
                <div className="hr-comm-presets-scroll">
                  {HR_QUICK_RESPONSES.map((item, idx) => (
                    <PresetButton
                      key={idx}
                      label={item.label}
                      text={item.text}
                      onClick={handleApplyQuickResponse}
                    />
                  ))}
                </div>
              </div>

              {/* ERROR ALERT */}
              {errorMsg && (
                <div className="hr-comm-alert-danger" role="alert">
                  <svg className="hr-comm-alert-icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* MESSAGES VIEWPORT */}
              <div
                className="hr-comm-messages-viewport"
                ref={viewportRef}
                onScroll={handleViewportScroll}
              >
                {(loadingMessages || (!loadedThreadIdsRef.current.has(selectedThreadId) && messages.length === 0)) ? (
                  <div className="hr-comm-skeleton-messages">
                    {/* Incoming (client) skeleton */}
                    <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--left">
                      <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                      <div className="hr-comm-skel-msg-lines">
                        <div className="hr-comm-skel hr-comm-skel-msg-meta" />
                        <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--lg" />
                      </div>
                    </div>
                    {/* Outgoing (HR) skeleton */}
                    <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--right">
                      <div className="hr-comm-skel-msg-lines hr-comm-skel-msg-lines--right">
                        <div className="hr-comm-skel hr-comm-skel-msg-meta hr-comm-skel-msg-meta--right" />
                        <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--md hr-comm-skel-bubble--dark" />
                      </div>
                      <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                    </div>
                    {/* Incoming (client) skeleton */}
                    <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--left">
                      <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                      <div className="hr-comm-skel-msg-lines">
                        <div className="hr-comm-skel hr-comm-skel-msg-meta" />
                        <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--sm" />
                      </div>
                    </div>
                    {/* Outgoing (HR) skeleton */}
                    <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--right">
                      <div className="hr-comm-skel-msg-lines hr-comm-skel-msg-lines--right">
                        <div className="hr-comm-skel hr-comm-skel-msg-meta hr-comm-skel-msg-meta--right" />
                        <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--xl hr-comm-skel-bubble--dark" />
                      </div>
                      <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                    </div>
                    {/* Incoming skeleton */}
                    <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--left">
                      <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                      <div className="hr-comm-skel-msg-lines">
                        <div className="hr-comm-skel hr-comm-skel-msg-meta" />
                        <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--md" />
                      </div>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="hr-comm-stream-empty">
                    <div className="hr-comm-empty-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                    <div className="hr-comm-empty-title">Conversation Channel Initialized</div>
                    <div className="hr-comm-empty-desc">
                      Send an operational update or advisory to {activeThread.company}. Messages are delivered in real time to the Client Portal.
                    </div>
                  </div>
                ) : (
                  groupedMessages.map((item) => {
                    if (item.type === 'separator') {
                      return (
                        <div key={item.key} className="hr-comm-date-separator">
                          <span>{item.label}</span>
                        </div>
                      );
                    }

                    const msg = item.data;
                    const isClient = msg.senderType === 'client_account';
                    const isOptimistic = msg._optimistic === true;
                    const timeStr = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })
                      : '';

                    return (
                      <div
                        key={item.key}
                        className={`hr-comm-msg-item ${
                          isClient ? 'hr-comm-msg--client' : 'hr-comm-msg--hr'
                        } ${isOptimistic ? 'hr-comm-msg--optimistic' : ''}`}
                      >
                        <div
                          className="hr-comm-msg-avatar"
                          style={
                            isClient
                              ? {
                                  background: `linear-gradient(135deg, hsl(${stringToHue(
                                    activeThread.company
                                  )},65%,42%) 0%, hsl(${stringToHue(
                                    activeThread.company
                                  )},55%,28%) 100%)`,
                                }
                              : undefined
                          }
                        >
                          {isClient ? (activeThread.company || 'C')[0].toUpperCase() : 'HR'}
                        </div>
                        <div className="hr-comm-msg-body">
                          <div className="hr-comm-msg-meta">
                            <span className="hr-comm-msg-sender">{msg.senderName}</span>
                            <span className="hr-comm-msg-role">({msg.senderRole})</span>
                            <span
                              className="hr-comm-msg-time"
                              title={fullDateTime(msg.createdAt)}
                            >
                              {timeStr}
                            </span>
                          </div>
                          <div className="hr-comm-msg-bubble">
                            <p className="hr-comm-msg-text">{msg.message}</p>
                          </div>
                          {!isClient && !isOptimistic && (
                            <div className="hr-comm-msg-delivered">
                              <svg viewBox="0 0 24 24" className="hr-comm-tick-icon">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              Delivered
                            </div>
                          )}
                          {isOptimistic && (
                            <div className="hr-comm-msg-sending">Sending...</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* SCROLL TO BOTTOM BUTTON */}
              {showScrollBtn && (
                <button
                  type="button"
                  className="hr-comm-scroll-btn"
                  onClick={() => scrollToBottom()}
                  aria-label="Jump to latest message"
                >
                  <svg viewBox="0 0 24 24" className="hr-comm-scroll-btn-icon">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                  Jump to Latest
                </button>
              )}

              {/* COMPOSER */}
              <footer className="hr-comm-composer">
                <form onSubmit={handleSendMessage} className="hr-comm-composer-form">
                  <textarea
                    ref={textareaRef}
                    className="hr-comm-textarea"
                    rows="3"
                    placeholder={`Type official response to ${activeThread.company}...`}
                    value={replyText}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    maxLength={3000}
                  />
                  <div className="hr-comm-composer-footer">
                    <div className={`hr-comm-char-count ${charWarning ? `hr-comm-char-count--${charWarning}` : ''}`}>
                      {charCount} / 3000
                      {charWarning === 'warn' && ' — Approaching limit'}
                      {charWarning === 'danger' && ' — Near maximum'}
                      &middot; <span className="hr-comm-keyboard-hint">Enter to dispatch &middot; Shift+Enter for new line</span>
                    </div>
                    <button
                      type="submit"
                      className="hr-comm-send-btn"
                      disabled={!replyText.trim() || sending}
                    >
                      {sending ? (
                        <>
                          <span className="hr-comm-send-spinner" />
                          Dispatching...
                        </>
                      ) : (
                        <>
                          Send Corporate Reply
                          <svg className="hr-comm-send-icon" viewBox="0 0 24 24">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </footer>
            </>
          ) : (loadingThreads || !initialLoaded) && threads.length === 0 ? (
            <div className="hr-comm-stream-unselected" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
              <div className="hr-comm-skeleton-messages" style={{ width: '85%', opacity: 0.5, padding: '32px 0' }}>
                <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--left">
                  <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                  <div className="hr-comm-skel-msg-lines">
                    <div className="hr-comm-skel hr-comm-skel-msg-meta" />
                    <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--lg" />
                  </div>
                </div>
                <div className="hr-comm-skel-msg-row hr-comm-skel-msg-row--right">
                  <div className="hr-comm-skel-msg-lines hr-comm-skel-msg-lines--right">
                    <div className="hr-comm-skel hr-comm-skel-msg-meta hr-comm-skel-msg-meta--right" />
                    <div className="hr-comm-skel hr-comm-skel-bubble hr-comm-skel-bubble--md hr-comm-skel-bubble--dark" />
                  </div>
                  <div className="hr-comm-skel hr-comm-skel-msg-avatar" />
                </div>
              </div>
            </div>
          ) : (
            <div className="hr-comm-stream-unselected" />
          )}
        </section>
      </div>
    </div>
  );
}
