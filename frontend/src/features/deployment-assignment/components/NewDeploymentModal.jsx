import { useEffect, useState } from 'react';
import { JOB_ORDER_OPTIONS } from '../services/DeploymentAssignmentService';
import { ISMERSBridge } from '../services/ismersBridge';

const emptyForm = {
  hireKey: '',
  employee: '',
  client: '',
  jobOrderRef: '',
  start: '',
  end: '',
  site: '',
};

export default function NewDeploymentModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(emptyForm);
  const [pendingHires, setPendingHires] = useState([]);
  const clients = [...new Set(JOB_ORDER_OPTIONS.map((j) => j.client))].sort();

  useEffect(() => {
    if (!open) return;
    setForm({ ...emptyForm, client: clients[0] || '' });
    setPendingHires(ISMERSBridge.getPendingHires());
    const unsubscribe = ISMERSBridge.onChange(() => setPendingHires(ISMERSBridge.getPendingHires()));
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const jobOrdersForClient = JOB_ORDER_OPTIONS.filter((j) => j.client === form.client);
  const employeeIsLocked = Boolean(form.hireKey);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleHireSelect(key) {
    if (!key) {
      update('hireKey', '');
      return;
    }
    const hire = ISMERSBridge.getHire(key);
    setForm((f) => ({
      ...f,
      hireKey: key,
      employee: hire ? hire.name : f.employee,
      client: hire ? hire.client : f.client,
      jobOrderRef: hire && hire.jobOrderRef ? hire.jobOrderRef : f.jobOrderRef,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const jobOrder = JOB_ORDER_OPTIONS.find((j) => j.ref === form.jobOrderRef);
    onSubmit({
      employee: form.employee.trim(),
      client: form.client,
      jobOrderRef: form.jobOrderRef,
      position: jobOrder ? jobOrder.title : '—',
      site: form.site.trim(),
      start: form.start.trim(),
      end: form.end.trim(),
      applicantKey: form.hireKey || null,
    });
  }

  return (
    <>
      <div className="modal-overlay open" onClick={onClose}></div>
      <div className="modal-panel open">
        <div className="modal-head">
          <div className="modal-title">New Deployment</div>
          <button className="sheet-close" type="button" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="field">
            <label>Hired Candidate (from Recruitment & Selection)</label>
            <select value={form.hireKey} onChange={(e) => handleHireSelect(e.target.value)}>
              <option value="">— Manual entry —</option>
              {pendingHires.map((h) => (
                <option key={h.key} value={h.key}>{h.name} — {h.jobTitle} · {h.client}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Employee Name</label>
            <input
              type="text"
              required
              readOnly={employeeIsLocked}
              placeholder="e.g. Andrea Molina"
              value={form.employee}
              onChange={(e) => update('employee', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Client</label>
            <select
              required
              value={form.client}
              onChange={(e) => update('client', e.target.value)}
            >
              {clients.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Job Order</label>
            <select
              required
              value={form.jobOrderRef}
              onChange={(e) => update('jobOrderRef', e.target.value)}
            >
              {jobOrdersForClient.map((j) => (
                <option key={j.ref} value={j.ref}>{j.ref} — {j.title}</option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Start Date</label>
              <input
                type="text"
                required
                placeholder="e.g. Aug 01, 2026"
                value={form.start}
                onChange={(e) => update('start', e.target.value)}
              />
            </div>
            <div className="field">
              <label>End Date</label>
              <input
                type="text"
                required
                placeholder="e.g. Feb 01, 2027"
                value={form.end}
                onChange={(e) => update('end', e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label>Deployment Site</label>
            <input
              type="text"
              required
              placeholder="e.g. Valenzuela City, NCR"
              value={form.site}
              onChange={(e) => update('site', e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn primary">Create Deployment</button>
          </div>
        </form>
      </div>
    </>
  );
}
