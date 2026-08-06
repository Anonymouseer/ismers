import { useEffect, useState } from 'react';
import { RECRUITERS } from '../services/JobOrderManagementService';

const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contractual', 'Others'];
const BLANK = {
  client: '', title: '', filled: 0, total: 1, type: TYPE_OPTIONS[0], typeOther: '', rate: '',
  location: '', deadline: '', recruiter: RECRUITERS[0], priority: 'normal',
  description: '', requirements: [], tags: [],
};

function parseDisplayDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function jobToForm(job) {
  const typeIsKnown = TYPE_OPTIONS.includes(job.type);
  return {
    client: job.client,
    title: job.title,
    filled: job.filled,
    total: job.total,
    type: typeIsKnown ? job.type : 'Others',
    typeOther: typeIsKnown ? '' : job.type,
    rate: job.rate ? String(job.rate).replace(/[^0-9.]/g, '') : '',
    location: job.location,
    deadline: parseDisplayDate(job.deadline),
    recruiter: job.recruiter,
    priority: job.priority,
    description: job.description,
    reqsText: (job.requirements || []).join('\n'),
    tagsText: (job.tags || []).join(', '),
  };
}

export default function JobOrderModal({ open, mode, job, clients, onSubmit, onClose }) {
  const [form, setForm] = useState({ ...BLANK, reqsText: '', tagsText: '' });
  const [newClientPrompt, setNewClientPrompt] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && job) setForm(jobToForm(job));
    else setForm({ ...BLANK, client: clients[0] || '', reqsText: '', tagsText: '' });
  }, [open, mode, job, clients]);

  if (!open) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleClientChange = (e) => {
    if (e.target.value === '__new__') { setNewClientPrompt(true); return; }
    setForm((f) => ({ ...f, client: e.target.value }));
  };

  const confirmNewClient = () => {
    if (newClientName.trim()) setForm((f) => ({ ...f, client: newClientName.trim() }));
    setNewClientPrompt(false);
    setNewClientName('');
  };

  const handleTypeChange = (e) => {
    setForm((f) => ({ ...f, type: e.target.value, typeOther: e.target.value === 'Others' ? f.typeOther : '' }));
  };

  const handleRateChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setForm((f) => ({ ...f, rate: value }));
  };

  const handleDeadlineChange = (e) => {
    setForm((f) => ({ ...f, deadline: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      client: form.client,
      title: form.title.trim(),
      filled: parseInt(form.filled, 10) || 0,
      total: parseInt(form.total, 10) || 1,
      type: form.type === 'Others' ? form.typeOther.trim() || 'Others' : form.type,
      rate: form.rate.trim() ? `${form.rate.trim()}` : '',
      location: form.location.trim(),
      deadline: form.deadline.trim() ? formatDisplayDate(form.deadline.trim()) : '',
      recruiter: form.recruiter,
      priority: form.priority,
      description: form.description.trim(),
      requirements: (form.reqsText || '').split('\n').map((s) => s.trim()).filter(Boolean),
      tags: (form.tagsText || '').split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  const clientOptions = [...new Set([...clients, form.client].filter(Boolean))];

  return (
    <>
      <div className="modal-overlay open" onClick={onClose} />
      <div className="modal-panel open">
        <div className="modal-head">
          <div className="modal-title">{mode === 'edit' ? `Edit Job Order — ${job?.ref}` : 'New Job Order Request'}</div>
          <button className="sheet-close" type="button" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="field">
            <label>Client</label>
            {newClientPrompt ? (
              <div className="field-row">
                <input
                  type="text" autoFocus placeholder="New client name"
                  value={newClientName} onChange={(e) => setNewClientName(e.target.value)}
                />
                <button type="button" className="btn" onClick={confirmNewClient}>Add</button>
              </div>
            ) : (
              <select value={form.client} onChange={handleClientChange} required>
                {clientOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__new__">+ New client…</option>
              </select>
            )}
          </div>

          <div className="field">
            <label>Position / Job Title</label>
            <input type="text" required placeholder="e.g. Warehouse Associate" value={form.title} onChange={set('title')} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Positions Filled</label>
              <input type="number" min="0" required value={form.filled} onChange={set('filled')} />
            </div>
            <div className="field">
              <label>Quantity Needed</label>
              <input type="number" min="1" required value={form.total} onChange={set('total')} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Employment Type</label>
              <select value={form.type} onChange={handleTypeChange}>
                {TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              {form.type === 'Others' && (
                <input
                  type="text"
                  placeholder="Enter other employment type"
                  value={form.typeOther}
                  onChange={set('typeOther')}
                />
              )}
            </div>
            <div className="field">
              <label>Rate / Salary</label>
              <div className="input-with-prefix">
                <span className="input-prefix">₱</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g. 610"
                  required
                  value={form.rate}
                  onChange={handleRateChange}
                />
              </div>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Location</label>
              <input type="text" required placeholder="e.g. Quezon City, NCR" value={form.location} onChange={set('location')} />
            </div>
            <div className="field">
              <label>Deadline</label>
              <input type="date" required value={form.deadline} onChange={handleDeadlineChange} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Recruiter / Owner</label>
              <select value={form.recruiter} onChange={set('recruiter')}>
                {RECRUITERS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select value={form.priority} onChange={set('priority')}>
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>Job Description</label>
            <textarea rows={4} placeholder="Brief description of the role and context..." value={form.description} onChange={set('description')} />
          </div>

          <div className="field">
            <label>Requirements (one per line)</label>
            <textarea
              rows={4}
              placeholder={'At least high school graduate\n6 months warehouse experience'}
              value={form.reqsText} onChange={set('reqsText')}
            />
          </div>

          <div className="field">
            <label>Tags</label>
            <input type="text" placeholder="Comma-separated, e.g. Warehousing, Entry-level" value={form.tagsText} onChange={set('tagsText')} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">{mode === 'edit' ? 'Save Changes' : 'Submit Request'}</button>
          </div>
        </form>
      </div>
    </>
  );
}