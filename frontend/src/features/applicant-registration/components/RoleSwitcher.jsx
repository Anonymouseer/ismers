import { ROLES, ROLE_LABELS } from '../services/ApplicantRegistrationService';

// NOTE: dev-only stand-in until real auth/roles exist on the backend.
// Lets you preview how the UI behaves for each role (Admin / Registration
// Staff / Recruiter) per the permissions matrix in ApplicantRegistrationService.js.
// Remove this once real login + session roles are wired up.
export default function RoleSwitcher({ role, onChange }) {
  return (
    <select
      className="role-switcher"
      value={role}
      onChange={(e) => onChange(e.target.value)}
      title="Dev only — simulates the signed-in user's role"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{ROLE_LABELS[r]}</option>
      ))}
    </select>
  );
}