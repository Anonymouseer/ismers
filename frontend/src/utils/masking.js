/**
 * masking.js
 * Field-level Data Privacy Masking Utilities
 * Aligned with the Philippine Data Privacy Act (RA 10173) & Defensive Design Guidelines.
 */

/**
 * Mask sensitive government statutory ID numbers (SSS, PhilHealth, Pag-IBIG, TIN).
 * Preserves format while obfuscating middle/sensitive digits.
 * Example: "02-1122334-4" -> "02-••••334-4" or "1210-9988-7766" -> "1210-••••-7766"
 */
export function maskGovId(val) {
  if (!val || typeof val !== 'string' || val === '—' || val.trim() === '') return val || '—';
  const trimmed = val.trim();
  if (trimmed.length <= 4) return trimmed;

  const parts = trimmed.split('-');
  if (parts.length >= 3) {
    // Format: 12-050678901-2 or 1210-9876-5432
    return parts.map((part, idx) => {
      if (idx === 0 || idx === parts.length - 1) return part;
      return '•'.repeat(part.length);
    }).join('-');
  }

  // Generic fallback: preserve first 2 and last 4 characters
  const visibleStart = trimmed.slice(0, 2);
  const visibleEnd = trimmed.slice(-3);
  const maskedLength = Math.max(3, trimmed.length - 5);
  return `${visibleStart}${'•'.repeat(maskedLength)}${visibleEnd}`;
}

/**
 * Mask contact telephone/mobile numbers.
 * Example: "+63 917 555 0192" -> "+63 917 ••• •192"
 */
export function maskPhone(val) {
  if (!val || typeof val !== 'string' || val === '—') return val || '—';
  const trimmed = val.trim();
  if (trimmed.length <= 6) return trimmed;
  const end = trimmed.slice(-4);
  const start = trimmed.slice(0, 7);
  return `${start} ••• ${end}`;
}

/**
 * Mask email addresses.
 * Example: "juan.delacruz@email.com" -> "j••••z@email.com"
 */
export function maskEmail(val) {
  if (!val || typeof val !== 'string' || !val.includes('@')) return val || '—';
  const [local, domain] = val.split('@');
  if (local.length <= 2) return `${local[0]}•@${domain}`;
  const maskedLocal = `${local[0]}${'•'.repeat(Math.min(5, local.length - 2))}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

export default {
  maskGovId,
  maskPhone,
  maskEmail,
};
