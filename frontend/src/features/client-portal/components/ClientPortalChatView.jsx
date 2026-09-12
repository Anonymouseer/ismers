import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { chatService } from '../../communications/services/ChatService';
import { broadcastRealtimeEvent, subscribeRealtimeEvents } from '../../../utils/realtimeSync';
import './ClientPortalChatView.css';

// ---------------------------------------------------------------------------
// Client Inquiry Quick Templates
// ---------------------------------------------------------------------------
const INQUIRY_TEMPLATES = [
  { label: 'Job Order Progress', text: 'Good day. We would like to inquire about the current fulfillment status of our active Job Order requisitions.' },
  { label: 'Candidate Endorsements', text: 'We have reviewed the latest endorsed candidate profiles and have a few clarifications regarding their technical screening results.' },
  { label: 'Interview Reschedule', text: 'We request to adjust an upcoming applicant interview schedule due to an urgent client operational conflict.' },
  { label: 'Deployment & Attendance', text: 'Requesting an updated deployment attendance log and compliance clearance for our deployed personnel roster.' },
  { label: 'Contract & Billing', text: 'Please provide clarification regarding our upcoming contract renewal terms and monthly billing statement.' },
  { label: 'Compliance Documents', text: 'We would like to request assistance regarding outstanding compliance documentary requirements for our current workforce.' },
];

// ---------------------------------------------------------------------------
// Utility: Relative time formatter
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
// Utility: Date group labels
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
// Utility: Hue from company name
// ---------------------------------------------------------------------------
function stringToHue(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ClientPortalChatView({
  session,
  accountManager,
  onUnreadChange = () => {},
}) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [lastSentId, setLastSentId] = useState(null);

  const messagesEndRef = useRef(null);
  const viewportRef = useRef(null);
  const textareaRef = useRef(null);
  const pollTimerRef = useRef(null);
  const pollDelayRef = useRef(6000);
  const isPollingRef = useRef(false);
  const initialRetryRef = useRef(false);
  const errorTimerRef = useRef(null);

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
    setShowScrollBtn(distFromBottom > 100);
  }, []);

  // --------------------------------------------------------------------------
  // Error with auto-dismiss
  // --------------------------------------------------------------------------
  const showError = useCallback((msg) => {
    setErrorMsg(msg);
    clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setErrorMsg(''), 5000);
  }, []);

  // --------------------------------------------------------------------------
  // Smart polling helpers
  // --------------------------------------------------------------------------
  const resetPollDelay = useCallback(() => { pollDelayRef.current = 4000; }, []);
  const backoffPollDelay = useCallback(() => {
    pollDelayRef.current = Math.min(pollDelayRef.current * 1.4, 20000);
  }, []);
  const errorBackoffPollDelay = useCallback(() => {
    pollDelayRef.current = Math.min(Math.max(pollDelayRef.current * 2, 10000), 30000);
  }, []);

  // --------------------------------------------------------------------------
  // Data fetching
  // --------------------------------------------------------------------------
  const loadConversation = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const threadsRes = await chatService.getThreads();
      const currentThread = threadsRes.threads?.[0] || null;

      if (currentThread) {
        setThread(currentThread);
        const msgsRes = await chatService.getMessages(currentThread.id);
        setMessages(msgsRes.messages || []);
        onUnreadChange(0);
        backoffPollDelay();
      }
      setErrorMsg('');
      setInitialLoaded(true);
    } catch (err) {
      console.error('Failed to load chat conversation:', err);
      errorBackoffPollDelay();
      if (!initialRetryRef.current) {
        initialRetryRef.current = true;
        setTimeout(() => loadConversation(false), 800);
        return;
      }
      if (!isSilent) {
        showError('Unable to connect to the HR Support channel. Please check your network connection.');
      }
    } finally {
      if (!isSilent && initialRetryRef.current) setLoading(false);
      else if (initialLoaded) setLoading(false);
    }
  }, [onUnreadChange, backoffPollDelay, errorBackoffPollDelay, showError, initialLoaded]);

  // --------------------------------------------------------------------------
  // Smart polling loop
  // --------------------------------------------------------------------------
  const schedulePoll = useCallback(() => {
    clearTimeout(pollTimerRef.current);
    pollTimerRef.current = setTimeout(async () => {
      if (!isPollingRef.current && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
        isPollingRef.current = true;
        try {
          await loadConversation(true);
        } catch {
          // non-fatal
        } finally {
          isPollingRef.current = false;
        }
      }
      schedulePoll();
    }, pollDelayRef.current);
  }, [loadConversation]);

  // --------------------------------------------------------------------------
  // Mount / realtime / polling
  // --------------------------------------------------------------------------
  useEffect(() => {
    loadConversation();

    const unsubscribe = subscribeRealtimeEvents((event) => {
      if (event?.type === 'CHAT_MESSAGE_SENT' || event?.type === 'CHAT_MESSAGE_RECEIVED') {
        resetPollDelay();
        loadConversation(true);
      }
    });

    // Immediate refresh when tab regains visibility or window focus
    const handleVisible = () => {
      if (document.visibilityState === 'visible') {
        resetPollDelay();
        loadConversation(true);
      }
    };
    const handleFocus = () => {
      resetPollDelay();
      loadConversation(true);
    };

    document.addEventListener('visibilitychange', handleVisible);
    window.addEventListener('focus', handleFocus);

    schedulePoll();

    return () => {
      unsubscribe();
      clearTimeout(pollTimerRef.current);
      clearTimeout(errorTimerRef.current);
      document.removeEventListener('visibilitychange', handleVisible);
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // --------------------------------------------------------------------------
  // Textarea auto-resize
  // --------------------------------------------------------------------------
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 148) + 'px';
  };

  // --------------------------------------------------------------------------
  // Message grouping
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

  // Character count state
  const charCount = inputText.length;
  const charWarning = charCount > 2900 ? 'danger' : charCount > 2700 ? 'warn' : '';

  // Last server-confirmed sent message (for "Delivered" indicator)
  const lastClientMsgId = useMemo(() => {
    const clientMsgs = messages.filter(
      (m) => m.senderType === 'client_account' && !m._optimistic
    );
    return clientMsgs.length > 0 ? clientMsgs[clientMsgs.length - 1].id : null;
  }, [messages]);

  // --------------------------------------------------------------------------
  // Send message
  // --------------------------------------------------------------------------
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || !thread) return;

    setSending(true);
    setErrorMsg('');
    resetPollDelay();

    // Optimistic insert
    const tempId = `optimistic-${Date.now()}`;
    const optimistic = {
      id: tempId,
      threadId: thread.id,
      senderType: 'client_account',
      senderName: session?.company || 'Client',
      senderRole: 'Client Representative',
      message: text,
      isRead: false,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    scrollToBottom();

    try {
      const res = await chatService.sendMessage(thread.id, text);
      if (res?.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? res.message : m))
        );
        setLastSentId(res.message.id);
        broadcastRealtimeEvent('CHAT_MESSAGE_SENT', {
          threadId: thread.id,
          senderType: 'client_account',
          senderName: session?.company || 'Client',
        });
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error dispatching message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInputText(text);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height =
          Math.min(textareaRef.current.scrollHeight, 148) + 'px';
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

  const handleApplyTemplate = (templateText) => {
    setInputText(templateText);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 148) + 'px';
      textareaRef.current.focus();
    }
  };

  const amName = thread?.accountManager || accountManager?.name || 'Karla Reyes';
  const amTitle = accountManager?.title || 'Account Operations Lead · Client Services';
  const amEmail = accountManager?.email || 'k.reyes@primepower.ph';
  const amPhone = accountManager?.phone || '+63 917 555 0192';
  const clientHue = stringToHue(session?.company || '');

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div className="cp-chat-wrap">

      {/* HEADER — Account Manager Info */}
      <header className="cp-chat-header">
        <div className="cp-chat-header-main">
          <div className="cp-chat-am-avatar">
            {amName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="cp-chat-header-details">
            <div className="cp-chat-header-title-row">
              <h2 className="cp-chat-am-name">{amName}</h2>
              <span className="cp-chat-status-pill">
                <span className="cp-chat-status-dot" />
                Live Desk Active
              </span>
            </div>
            <div className="cp-chat-am-role">{amTitle}</div>
            <div className="cp-chat-am-meta">
              <span>{amEmail}</span>
              <span className="cp-chat-meta-divider">&bull;</span>
              <span>{amPhone}</span>
              <span className="cp-chat-meta-divider">&bull;</span>
              <span>Makati Head Office</span>
            </div>
          </div>
        </div>

        <div className="cp-chat-header-right">
          <div className="cp-chat-account-tag">
            <span className="cp-chat-tag-label">Client ID</span>
            <span className="cp-chat-tag-val">{session?.companyId || 'CLT-2026-0001'}</span>
          </div>
          <div className="cp-chat-sla-note">
            Response within 1 business day
          </div>
        </div>
      </header>

      {/* QUICK INQUIRY TEMPLATE CHIPS */}
      <div className="cp-chat-templates-bar">
        <span className="cp-chat-templates-hint">Quick Topics:</span>
        <div className="cp-chat-templates-scroll">
          {INQUIRY_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              className="cp-chat-template-chip"
              onClick={() => handleApplyTemplate(tmpl.text)}
              title={tmpl.text}
            >
              <svg className="cp-chip-icon" viewBox="0 0 24 24">
                <path d="M7 8h10M7 12h6" />
              </svg>
              {tmpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR NOTICE */}
      {errorMsg && (
        <div className="cp-chat-alert-error" role="alert">
          <svg className="cp-chat-alert-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* MESSAGES SCROLL AREA */}
      <div
        className="cp-chat-messages-container"
        ref={viewportRef}
        onScroll={handleViewportScroll}
      >
        {(loading || !initialLoaded) && messages.length === 0 ? (
          <div className="cp-skeleton-messages">
            {/* HR incoming skeleton */}
            <div className="cp-skel-msg-row cp-skel-msg-row--hr">
              <div className="cp-skel cp-skel-msg-avatar" />
              <div className="cp-skel-msg-lines">
                <div className="cp-skel cp-skel-msg-meta" />
                <div className="cp-skel cp-skel-bubble cp-skel-bubble--lg" />
              </div>
            </div>
            {/* Client outgoing skeleton */}
            <div className="cp-skel-msg-row cp-skel-msg-row--client">
              <div className="cp-skel-msg-lines cp-skel-msg-lines--right">
                <div className="cp-skel cp-skel-msg-meta cp-skel-msg-meta--right" />
                <div className="cp-skel cp-skel-bubble cp-skel-bubble--md cp-skel-bubble--client" />
              </div>
              <div className="cp-skel cp-skel-msg-avatar" />
            </div>
            {/* HR incoming skeleton */}
            <div className="cp-skel-msg-row cp-skel-msg-row--hr">
              <div className="cp-skel cp-skel-msg-avatar" />
              <div className="cp-skel-msg-lines">
                <div className="cp-skel cp-skel-msg-meta" />
                <div className="cp-skel cp-skel-bubble cp-skel-bubble--xl" />
              </div>
            </div>
            {/* Client outgoing skeleton */}
            <div className="cp-skel-msg-row cp-skel-msg-row--client">
              <div className="cp-skel-msg-lines cp-skel-msg-lines--right">
                <div className="cp-skel cp-skel-msg-meta cp-skel-msg-meta--right" />
                <div className="cp-skel cp-skel-bubble cp-skel-bubble--sm cp-skel-bubble--client" />
              </div>
              <div className="cp-skel cp-skel-msg-avatar" />
            </div>
            {/* HR incoming skeleton */}
            <div className="cp-skel-msg-row cp-skel-msg-row--hr">
              <div className="cp-skel cp-skel-msg-avatar" />
              <div className="cp-skel-msg-lines">
                <div className="cp-skel cp-skel-msg-meta" />
                <div className="cp-skel cp-skel-bubble cp-skel-bubble--md" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="cp-chat-empty-state">
            <div className="cp-chat-empty-icon">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" />
                <path d="M20 32 Q32 20 44 32 Q32 44 20 32 Z" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="32" cy="32" r="4" fill="currentColor" />
              </svg>
            </div>
            <div className="cp-chat-empty-title">Start a Direct Conversation</div>
            <div className="cp-chat-empty-sub">
              Your assigned Account Manager and the PRIMEPOWER HR Team are ready to assist with job orders, candidate reviews, and staffing deployment.
            </div>
            <div className="cp-chat-sla-badge">
              <svg viewBox="0 0 24 24" className="cp-sla-icon">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Typical response within 1 business day
            </div>
          </div>
        ) : (
          groupedMessages.map((item) => {
            if (item.type === 'separator') {
              return (
                <div key={item.key} className="cp-date-separator">
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
            const isLastDelivered =
              !isOptimistic && isClient && msg.id === lastClientMsgId;

            return (
              <div
                key={item.key}
                className={`cp-message-row ${
                  isClient ? 'cp-message-row--client' : 'cp-message-row--hr'
                } ${isOptimistic ? 'cp-message-row--optimistic' : ''}`}
              >
                {!isClient && (
                  <div className="cp-message-avatar cp-message-avatar--hr" title={msg.senderName}>
                    HR
                  </div>
                )}
                <div className="cp-message-bubble-wrap">
                  <div className="cp-message-sender-meta">
                    <span className="cp-message-sender-name">{msg.senderName}</span>
                    <span className="cp-message-sender-role">({msg.senderRole})</span>
                    <span
                      className="cp-message-timestamp"
                      title={fullDateTime(msg.createdAt)}
                    >
                      {timeStr}
                    </span>
                  </div>
                  <div
                    className={`cp-message-bubble ${
                      isClient ? 'cp-message-bubble--client' : 'cp-message-bubble--hr'
                    }`}
                    style={
                      isClient
                        ? {
                            background: `linear-gradient(135deg, hsl(${clientHue},62%,40%) 0%, hsl(${clientHue},52%,28%) 100%)`,
                          }
                        : undefined
                    }
                  >
                    <p className="cp-message-text">{msg.message}</p>
                  </div>
                  {isLastDelivered && (
                    <div className="cp-message-delivered">
                      <svg className="cp-tick-icon" viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Delivered
                    </div>
                  )}
                  {isOptimistic && (
                    <div className="cp-message-sending">Sending...</div>
                  )}
                </div>
                {isClient && (
                  <div
                    className="cp-message-avatar cp-message-avatar--client"
                    style={{
                      background: `linear-gradient(135deg, hsl(${clientHue},62%,40%) 0%, hsl(${clientHue},52%,28%) 100%)`,
                    }}
                    title={session?.company || 'Client'}
                  >
                    {(session?.company || 'C')[0].toUpperCase()}
                  </div>
                )}
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
          className="cp-scroll-btn"
          onClick={() => scrollToBottom()}
          aria-label="Jump to latest message"
        >
          <svg className="cp-scroll-btn-icon" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Jump to Latest
        </button>
      )}

      {/* COMPOSER */}
      <footer className="cp-chat-composer">
        <form onSubmit={handleSendMessage} className="cp-chat-form">
          <div className="cp-chat-input-wrap">
            <textarea
              ref={textareaRef}
              className="cp-chat-textarea"
              rows="2"
              placeholder="Type your operational inquiry or reply..."
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={sending}
              maxLength={3000}
            />
          </div>
          <div className="cp-chat-controls-bar">
            <div className={`cp-chat-char-counter ${charWarning ? `cp-char--${charWarning}` : ''}`}>
              {charCount > 0 ? `${charCount} / 3000` : 'Enter to send · Shift+Enter for new line'}
              {charWarning === 'warn' && ' — Approaching limit'}
              {charWarning === 'danger' && ' — Near maximum'}
              &middot; <span className="cp-privacy-label">Encrypted · RA 10173 Compliant</span>
            </div>
            <button
              type="submit"
              className="cp-chat-send-btn"
              disabled={!inputText.trim() || sending}
            >
              {sending ? (
                <>
                  <span className="cp-send-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <svg className="cp-chat-send-icon" viewBox="0 0 24 24">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
