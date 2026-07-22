# ISMERS — Prompt Guide for Requesting Pages, Features, APIs & Backend Work

Think of this as briefing a developer. The more specific you are about scope, data, and whether it connects to a real backend, the less back-and-forth you'll need. Attach the `ismers-capstone.skill` file first — it already knows the subsystems, folder structure, and conventions, so you don't need to re-explain those every time.

---

## The Template

```
Build [a page / component / API endpoint / backend logic] for the [subsystem name] subsystem.

Scope:
- What it should show or do
- Static/mock data, or should it call the real backend/API?
  (If real API: does the endpoint already exist, or does it need to be built too?)
- Specific fields/inputs/columns if you have them in mind
- Edge cases to handle: none / empty state / error state

Done when:
- Loads without errors, matches existing page/form styling, handles empty state

Output:
- Show me a preview first / save it directly into the project files
```

Keep each request to **one deliverable at a time** — one page, one endpoint, one form. Bundling "build the list page, the API, and the migration" into a single prompt usually means one part gets rushed or skipped.

---

## Example Prompts

### Frontend page
```
Build a Client List page for the client-management subsystem.
Simple table, static mock data for now, no backend connection yet.
Columns: company name, industry, contract status, contact person.
Edge cases: show an empty-state message if there are no clients.
Show me a preview first — don't save it to the repo yet.
```

### Frontend form
```
Build an Add New Applicant form for applicant-registration.
Fields: full name, birthdate, contact number, email, resume upload.
Static for now, no validation logic yet.
```

### Backend API
```
Build CRUD endpoints for Job Order Management.
Need: create, list, update status, delete.
Follow the existing Domain/JobOrderManagement structure.
Edge cases: return a clear error if a job order ID doesn't exist.
```

### Full-stack feature (frontend wired to real backend)
```
Build the Deployment Assignment page fully wired to the backend —
it should call the real API, not mock data.
Needs: list of active deployments, a button to assign a new applicant to one.
The assignment endpoint already exists — use the existing service pattern
in the deployment-assignment subsystem to call it.
Edge cases: disable the assign button while the request is in flight,
show an error message if the assignment fails.
```

### Schema / database change
```
I want to add a column to the applicants table for [new field].
- Nullable or required? Default value: [value, or "none"]
- Does existing data need backfilling?
- Migration only, or should the API/serializer also expose this field?
```

### Revising something already built
```
Update the Client List page (client-management) —
add a search bar that filters by company name.
Keep everything else as-is.
```

---

## Working Guidelines

- **State static vs. functional explicitly.** If you don't specify, the default is static/mock data — faster to preview, no backend dependency required. Say "wire it to the real API" when you actually want that — and note whether the endpoint already exists.
- **Name the subsystem exactly** as listed below — this determines the folder path automatically.
- **One deliverable per prompt.** Small, reviewable increments beat one giant "build everything" request — easier to catch mistakes early.
- **Say what "done" looks like.** Even a one-liner (styling matches existing pages, handles empty/error states) avoids mismatched expectations on delivery.
- **Name edge cases up front.** Empty data, failed requests, and invalid input get silently skipped unless you ask for them explicitly.
- **If something's ambiguous, expect a clarifying question** — not a random assumption on a decision that matters (like data fields or backend wiring). Answer it and move on.
- **Reuse what exists.** Service files, folder structure, and naming conventions are already scaffolded — new code should follow those patterns, not reinvent them.
- **Revisions reference the existing thing by name/path**, not a full re-description from scratch — faster and less error-prone than restating the whole spec.

---

## Subsystem Names (use exactly these)

- `client-management`
- `applicant-registration`
- `recruitment-selection`
- `job-order-management`
- `deployment-assignment`
