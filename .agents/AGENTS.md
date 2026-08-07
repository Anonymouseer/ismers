# Workspace Guidelines — PRIMEPOWER HR Smart Recruitment System

## Communication & UI Tone Rules
- **Strict Professional Tone**: All responses, technical explanations, and UI text must be strictly professional, corporate, and executive-ready.
- **No Emojis**: Do not use emojis in system text, UI buttons, notifications, sidebar labels, or response messages.
- **System Alignment**: Maintain strict alignment with PRIMEPOWER MANPOWER business workflows (Recruitment, Selection, Deployment, PRF Job Orders, and Contract Renewal tracking).

## Cybersecurity & Defensive Design Protocol

### 1. Proactive Threat Assessment
- Before implementing any feature, code modification, API integration, or UI layout, perform a mandatory security audit covering: credential exposure, unmasked secret keys, XSS risks, insecure storage, CSRF, SQL injection, broken access control, and unauthorized data leaks.
- Document any identified risk and its mitigation before merging code, even in draft/prototype stages.

### 2. Client-Side Credential Protection
- Never expose API secret keys, database credentials, or private access tokens in client-side code (React components, `localStorage`, `sessionStorage`, or browser state/dev tools).
- All secret keys, connection strings, and third-party tokens must remain strictly within backend server environment variables (`.env`), never committed to version control.
- Add `.env`, `.env.*`, and any credential files to `.gitignore` by default in every repo scaffold.

### 3. Defensive Data Handling
- Mask sensitive user, candidate, and system credentials in frontend displays and logs (e.g., API keys, passwords, government IDs, SSS/PhilHealth/TIN numbers, bank details).
- Apply field-level masking (e.g., `xxxx-xxxx-1234`) for any PII rendered in tables, exports, or notifications.
- Sensitive fields must never appear in plain text within browser console logs, error messages, or network responses sent to unauthorized roles.

### 4. Authentication & Access Control
- Enforce role-based access control (RBAC) across all modules (Recruitment, Selection, Deployment, PRF Job Orders, Contract Renewal) — no shared or default admin credentials.
- All authentication tokens (JWT/session) must have expiration, secure httpOnly cookie storage (where applicable), and refresh-token rotation.
- Enforce least-privilege access: HR staff, recruiters, and admins should only see data relevant to their assigned scope.

### 5. Input Validation & Injection Prevention
- Sanitize and validate all user inputs server-side (not just client-side) to prevent XSS, SQL injection, and command injection.
- Use parameterized queries/ORM methods exclusively — no raw string-concatenated SQL.
- Apply CSRF tokens on all state-changing requests (POST/PUT/DELETE).

### 6. Secure API & Integration Practices
- All external API calls (e.g., MCP servers, third-party HR/payroll integrations) must use encrypted transport (HTTPS/TLS only).
- Rate-limit and authenticate all API endpoints to prevent abuse or unauthorized scraping of candidate data.
- Log integration errors without leaking stack traces, internal paths, or credentials to the client.

### 7. Audit & Compliance Alignment
- All changes touching candidate PII must comply with the Philippine Data Privacy Act (RA 10173).
- Maintain an audit trail (who accessed/modified what data, and when) for sensitive HR records.

## Enforcement
- These guidelines apply to every prompt, code generation, feature request, or UI/UX suggestion made within this workspace, regardless of module or subsystem.
- Any code or design suggestion that conflicts with this protocol must be flagged explicitly before implementation, with a recommended secure alternative.