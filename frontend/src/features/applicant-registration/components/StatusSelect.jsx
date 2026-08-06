import { STATUS_META, STATUS_OPTIONS, hasPermission } from '../services/ApplicantRegistrationService';

export default function StatusSelect({ candidate, role, onChange }) {
  const canEdit = hasPermission(role, 'changeStatus');
  const meta = STATUS_META[candidate.status] || STATUS_META.active;

  if (!canEdit) {
    return (
      <span className="status-chip" style={{ color: meta.color, borderColor: meta.color }}>
        {meta.label}
      </span>
    );
  }

  return (
    <select
      className="status-select"
      value={candidate.status}
      style={{ color: meta.color, borderColor: meta.color }}
      onChange={(e) => onChange(candidate.regId, e.target.value)}
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>{STATUS_META[s].label}</option>
      ))}
    </select>
  );
}