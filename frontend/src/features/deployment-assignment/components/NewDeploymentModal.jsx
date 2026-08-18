import { useEffect, useState } from 'react';
import { getJobOrderOptions, fetchPendingHiresApi } from '../services/DeploymentAssignmentService';
import { ISMERSBridge } from '../services/ismersBridge';

const emptyForm = {
  hireKey: '',
  applicantId: null,
  employee: '',
  client: '',
  jobOrderRef: '',
  start: '',
  end: '',
  site: '',
  supervisor: '',
  supervisorContact: '',
  shift: 'Regular Day Shift (08:00 - 17:00)',
};

export default function NewDeploymentModal({ open, onClose, onSubmit, initialJobOrder = null }) {
  const [form, setForm] = useState(emptyForm);
  const [pendingHires, setPendingHires] = useState([]);
  const jobOrderList = getJobOrderOptions();
  const clients = [...new Set(jobOrderList.map((j) => j.client))].sort();

  useEffect(() => {
    if (!open) return;
    const currentList = getJobOrderOptions();
    const defaultClient = initialJobOrder ? initialJobOrder.client : (clients[0] || '');
    const defaultJO = initialJobOrder || currentList.find((j) => j.client === defaultClient);
    setForm({
      ...emptyForm,
      client: defaultClient,
      jobOrderRef: defaultJO ? defaultJO.ref : '',
      supervisor: defaultJO ? defaultJO.supervisor : 'Operations Supervisor',
      site: defaultJO?.site || '',
    });

    // Load from live API + bridge
    async function loadPending() {
      try {
        const liveHires = await fetchPendingHiresApi();
        if (Array.isArray(liveHires) && liveHires.length > 0) {
          setPendingHires(liveHires);
        } else {
          setPendingHires(ISMERSBridge.getPendingHires());
        }
      } catch {
        setPendingHires(ISMERSBridge.getPendingHires());
      }
    }
    loadPending();

    const unsubscribe = ISMERSBridge.onChange(() => {
      loadPending();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialJobOrder]);

  if (!open) return null;

  const allJobOrders = getJobOrderOptions();
  const jobOrdersForClient = allJobOrders.filter((j) => j.client === form.client);
  const employeeIsLocked = Boolean(form.hireKey);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleClientChange(clientName) {
    const matchedJO = allJobOrders.find((j) => j.client === clientName);
    setForm((f) => ({
      ...f,
      client: clientName,
      jobOrderRef: matchedJO ? matchedJO.ref : '',
      supervisor: matchedJO ? matchedJO.supervisor : f.supervisor,
      site: matchedJO?.site || f.site,
    }));
  }

  function handleJobOrderChange(joRef) {
    const matchedJO = allJobOrders.find((j) => j.ref === joRef);
    setForm((f) => ({
      ...f,
      jobOrderRef: joRef,
      supervisor: matchedJO && matchedJO.supervisor ? matchedJO.supervisor : f.supervisor,
      site: matchedJO?.site || f.site,
    }));
  }

  function handleHireSelect(value) {
    if (!value) {
      update('hireKey', '');
      update('applicantId', null);
      return;
    }

    // Check if it matches a pending hire from live API
    const liveMatch = pendingHires.find((h) => String(h.applicantId || h.id || h.key) === String(value));
    if (liveMatch) {
      const matchedJO = liveMatch.jobOrderRef ? allJobOrders.find((j) => j.ref === liveMatch.jobOrderRef) : null;
      setForm((f) => ({
        ...f,
        hireKey: liveMatch.key || `cand-${liveMatch.applicantId}`,
        applicantId: liveMatch.applicantId || null,
        employee: liveMatch.name,
        client: liveMatch.client || f.client,
        jobOrderRef: liveMatch.jobOrderRef || f.jobOrderRef,
        position: liveMatch.jobTitle || f.position,
        site: liveMatch.site || matchedJO?.site || f.site,
        supervisor: liveMatch.supervisor || matchedJO?.supervisor || f.supervisor,
      }));
      return;
    }

    const hire = ISMERSBridge.getHire(value);
    const matchedJO = hire && hire.jobOrderRef ? allJobOrders.find((j) => j.ref === hire.jobOrderRef) : null;
    setForm((f) => ({
      ...f,
      hireKey: value,
      employee: hire ? hire.name : f.employee,
      client: hire ? hire.client : f.client,
      jobOrderRef: hire && hire.jobOrderRef ? hire.jobOrderRef : f.jobOrderRef,
      supervisor: matchedJO ? matchedJO.supervisor : f.supervisor,
      site: matchedJO?.site || f.site,
    }));
  }

  function formatDateDisplay(dStr) {
    if (!dStr) return '';
    if (!dStr.includes('-')) return dStr;
    const [y, m, d] = dStr.split('-');
    if (!y || !m || !d) return dStr;
    const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
    if (Number.isNaN(dateObj.getTime())) return dStr;
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const jobOrder = allJobOrders.find((j) => j.ref === form.jobOrderRef);
    onSubmit({
      employee: form.employee.trim(),
      client: form.client,
      jobOrderRef: form.jobOrderRef,
      position: jobOrder ? jobOrder.title : '—',
      site: form.site.trim(),
      supervisor: form.supervisor.trim() || (jobOrder ? jobOrder.supervisor : 'Operations Supervisor'),
      supervisorContact: form.supervisorContact.trim() || '+63 900 000 0000',
      shift: form.shift.trim(),
      start: formatDateDisplay(form.start.trim()),
      end: formatDateDisplay(form.end.trim()),
      applicantKey: form.hireKey || null,
      applicantId: form.applicantId || null,
    });
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          width: '100%',
          maxWidth: 620,
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ padding: '18px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              Talent Deployment Intake
            </div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
              New Deployment Schedule
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--muted-fg)', fontSize: 18, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '75vh', overflowY: 'auto' }}>
          {/* RECRUITMENT HANDOFF DROPDOWN */}
          {pendingHires.length > 0 && (
            <div style={{ background: 'var(--blue-soft)', border: '1px solid var(--blue)', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--blue)', marginBottom: 6 }}>
                ⚡ Auto-fill from Recruitment &amp; Selection Handoff:
              </div>
              <select
                className="input"
                style={{ width: '100%', padding: '7px 10px', fontSize: 12 }}
                value={form.applicantId || form.hireKey}
                onChange={(e) => handleHireSelect(e.target.value)}
              >
                <option value="">-- Or enter custom employee details manually --</option>
                {pendingHires.map((h) => {
                  const val = h.applicantId || h.id || h.key;
                  return (
                    <option key={val} value={val}>
                      {h.name} — {h.jobTitle || 'Role'} ({h.client || 'Client'})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* EMPLOYEE NAME */}
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
              Employee / Candidate Name *
            </label>
            <input
              type="text"
              required
              readOnly={employeeIsLocked}
              value={form.employee}
              onChange={(e) => update('employee', e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="input"
              style={{ width: '100%', padding: '8px 12px', fontSize: 12.5 }}
            />
          </div>

          {/* CLIENT & JOB ORDER */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Client Company *
              </label>
              <select
                required
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
                value={form.client}
                onChange={(e) => handleClientChange(e.target.value)}
              >
                {clients.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Assigned Job Order / Role *
              </label>
              <select
                required
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
                value={form.jobOrderRef}
                onChange={(e) => handleJobOrderChange(e.target.value)}
              >
                {jobOrdersForClient.map((jo) => (
                  <option key={jo.ref} value={jo.ref}>
                    {jo.title} ({jo.ref})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SITE & SHIFT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Deployment Site Facility *
              </label>
              <input
                type="text"
                required
                value={form.site}
                onChange={(e) => update('site', e.target.value)}
                placeholder="e.g. Valenzuela Logistics Hub, NCR"
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Assigned Shift Schedule
              </label>
              <input
                type="text"
                value={form.shift}
                onChange={(e) => update('shift', e.target.value)}
                placeholder="e.g. Morning Shift (06:00 - 15:00)"
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
              />
            </div>
          </div>

          {/* SUPERVISOR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Client Supervisor Name
              </label>
              <input
                type="text"
                value={form.supervisor}
                onChange={(e) => update('supervisor', e.target.value)}
                placeholder="e.g. Mario Santos (Operations Mgr)"
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Supervisor Contact Number
              </label>
              <input
                type="text"
                value={form.supervisorContact}
                onChange={(e) => update('supervisorContact', e.target.value)}
                placeholder="+63 917 555 0192"
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
              />
            </div>
          </div>

          {/* DATES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Deployment Start Date *
              </label>
              <input
                type="date"
                required
                value={form.start}
                onChange={(e) => update('start', e.target.value)}
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                Deployment End Date *
              </label>
              <input
                type="date"
                required
                value={form.end}
                onChange={(e) => update('end', e.target.value)}
                className="input"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12 }}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="btn" onClick={onClose} style={{ fontSize: 12 }}>
              Cancel
            </button>
            <button type="submit" className="btn primary" style={{ fontSize: 12, fontWeight: 800 }}>
              Create &amp; Assign to Stage 1 →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
