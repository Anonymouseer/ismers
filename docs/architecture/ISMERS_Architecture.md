# ISMERS — Service Management and Enterprise Resource System
## System Architecture Document

**Scope of this document:** Core Transaction 1 — Client Acquisition, Recruitment & Deployment
**Status:** Draft v1.0 — designed to extend to future Core Transactions (2, 3, ...)

---

## 1. System Overview

ISMERS is an Enterprise Resource System built for a manpower/staffing service organization. It manages the end-to-end lifecycle of acquiring clients (companies who need workers), registering and screening applicants, matching them to job orders using AI-based scoring, and deploying them to client sites.

### 1.1 Business Flow (Core Transaction 1)

```
Client Acquisition → Applicant Registration → Recruitment & Selection
        → Job Order Management → Deployment & Assignment
```

| Stage | Actor | Description |
|---|---|---|
| Client Acquisition | Sales/Account Officer | Onboard client companies, capture manpower requests |
| Applicant Registration | Applicant / HR Staff | Capture applicant profile, documents, work history |
| Recruitment & Selection | HR Staff, AI Engine | Screen, score, and shortlist applicants against job orders |
| Job Order Management | Operations Staff | Manage open positions requested by clients |
| Deployment & Assignment | Operations Staff | Assign selected applicants to client job sites |

---

## 2. Architectural Style

**Layered / Modular Monolith with Service-Oriented Subsystems**, chosen because:
- Capstone timeline favors a single deployable app over microservices overhead
- Laravel naturally organizes into modules (Subsystems ≈ Laravel modules/domains)
- Easy to later extract a subsystem into its own service if needed (e.g., AI Scoring Engine)

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│        React / Vue SPA  (per-role dashboards)             │
└───────────────────────┬───────────────────────────────────┘
                         │ REST API (JSON) / Sanctum Auth
┌───────────────────────▼───────────────────────────────────┐
│                    Application Layer (Laravel)            │
│  Controllers → Form Requests → Services → Repositories     │
├─────────────────────────────────────────────────────────┤
│                     Domain / Subsystem Layer               │
│  Client Mgmt | Applicant Reg | Recruitment | Job Order |   │
│  Deployment  |  AI Scoring Module (cross-cutting)          │
├─────────────────────────────────────────────────────────┤
│                      Data Access Layer                     │
│           Eloquent ORM → PostgreSQL                         │
├─────────────────────────────────────────────────────────┤
│                  Infrastructure / Integrations              │
│   File Storage (docs/resumes) | Notification (email/SMS)   │
│   AI/ML Service (candidate scoring) | Queue (Laravel Jobs)  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React or Vue 3 (SPA) | Choose one consistently team-wide; Vue pairs well with Laravel via Inertia if you want fewer moving parts |
| State/Data fetching | Axios + Pinia/Redux | For client-side state |
| Backend | Laravel 11 | REST API or Inertia-based |
| Auth | Laravel Sanctum | Token-based, SPA-friendly |
| Database | PostgreSQL | Chosen for relational integrity across client-applicant-job order-deployment records |
| Queue/Jobs | Laravel Queues (database or Redis driver) | For async tasks like AI scoring, notifications |
| AI/ML Scoring | Python microservice (FastAPI/Flask) or Laravel HTTP client calling external model | Keeps ML separate from core app logic |
| File Storage | Laravel Filesystem (local/S3) | Resumes, IDs, contracts |
| API format | REST, JSON:API-like conventions | Versioned (`/api/v1/...`) |

> **Note on AI scoring:** Keeping it as a separate service (even if just a Python script exposed via a small API) rather than embedding ML logic in Laravel controllers keeps your architecture defensible in a panel defense — it shows separation of concerns and is easier to explain/diagram.

---

## 4. Subsystem Breakdown (Core Transaction 1)

### 4.1 Client Management Subsystem
- **Purpose:** Onboard and manage client companies (the businesses requesting manpower)
- **Key entities:** `Client`, `ClientContract`, `ClientContact`
- **Core functions:** Client registration, contract terms, manpower request intake

### 4.2 Applicant Registration and Profiling System
- **Purpose:** Capture and maintain applicant data
- **Key entities:** `Applicant`, `ApplicantDocument`, `WorkHistory`, `Skill`
- **Core functions:** Online/walk-in registration, document upload, profile completion tracking

### 4.3 Recruitment and Selection Subsystem
- **Purpose:** Screen and shortlist applicants against job orders
- **Key entities:** `Application`, `ScreeningResult`, `Interview`, `CandidateScore`
- **Core functions:** Matching engine trigger, AI-based candidate scoring, interview scheduling, shortlisting
- **AI Integration point:** Candidate Scoring Service (see §5)

### 4.4 Job Order Management Subsystem
- **Purpose:** Manage open positions/manpower requests from clients
- **Key entities:** `JobOrder`, `JobOrderRequirement`, `Position`
- **Core functions:** Create/update job orders, define requirements, track fill status

### 4.5 Deployment and Assignment Subsystem
- **Purpose:** Assign selected applicants to client sites and track deployment status
- **Key entities:** `Deployment`, `DeploymentSite`, `DeploymentStatusLog`
- **Core functions:** Deploy applicant to job order, track active/ended deployments, redeployment handling

---

## 5. AI-Based Smart Recruitment & Candidate Scoring (Cross-cutting Module)

This isn't a subsystem on its own in your CT1 table — it's a **service that plugs into Recruitment and Selection**.

```
Applicant Profile + Job Order Requirements
              │
              ▼
      Feature Extraction (skills, experience, tests)
              │
              ▼
      Scoring Model (rules-based or ML classifier)
              │
              ▼
      CandidateScore (0-100) + Ranking per Job Order
              │
              ▼
      Recruitment & Selection Subsystem consumes ranked list
```

- Can start rules-based (weighted scoring: experience match %, skill match %, certifications) for MVP, then evolve to an ML model if your timeline allows.
- Exposed as an internal API endpoint (`POST /api/v1/scoring/evaluate`) so Laravel just calls it — keeps it swappable.

---

## 6. Data Flow Diagram (Core Transaction 1)

```
[Client] --submits requirement--> [Job Order Management]
                                        │
[Applicant] --registers--> [Applicant Registration] --profile--> [Recruitment & Selection]
                                        │                              │
                                        │                    [AI Scoring Service]
                                        │                              │
                                        └───────ranked matches─────────┘
                                                       │
                                             [Selection/Shortlist]
                                                       │
                                          [Deployment & Assignment]
                                                       │
                                              [Client Site / Update Client]
```

---

## 7. High-Level Database Schema (PostgreSQL)

```
clients (id, name, industry, contract_status, created_at, ...)
client_contacts (id, client_id FK, name, position, email, phone)

applicants (id, full_name, birthdate, contact_info, status, created_at, ...)
applicant_documents (id, applicant_id FK, doc_type, file_path)
work_histories (id, applicant_id FK, company, position, duration)
skills (id, name)
applicant_skills (applicant_id FK, skill_id FK, proficiency)

job_orders (id, client_id FK, title, headcount, status, requirements_json, created_at)

applications (id, applicant_id FK, job_order_id FK, status, applied_at)
candidate_scores (id, application_id FK, score, breakdown_json, scored_at)
interviews (id, application_id FK, schedule, result, interviewer)

deployments (id, application_id FK, job_order_id FK, deployment_site, start_date, end_date, status)
deployment_status_logs (id, deployment_id FK, status, remarks, logged_at)
```

> This is a starting ERD in text form — recommend generating an actual ERD diagram (dbdiagram.io or similar) once fields are finalized with your adviser.

---

## 8. API Structure (REST convention)

```
/api/v1/clients
/api/v1/clients/{id}/contacts
/api/v1/applicants
/api/v1/applicants/{id}/documents
/api/v1/job-orders
/api/v1/job-orders/{id}/requirements
/api/v1/applications
/api/v1/applications/{id}/score
/api/v1/deployments
/api/v1/scoring/evaluate   (internal, called by Recruitment subsystem)
```

---

## 9. Suggested Folder Structure (Laravel backend)

```
app/
├── Domain/
│   ├── ClientManagement/
│   │   ├── Models/
│   │   ├── Services/
│   │   └── Repositories/
│   ├── ApplicantRegistration/
│   ├── RecruitmentSelection/
│   │   └── Services/CandidateScoringClient.php
│   ├── JobOrderManagement/
│   └── DeploymentAssignment/
├── Http/
│   ├── Controllers/Api/V1/
│   ├── Requests/
│   └── Resources/
routes/
└── api.php
```

Frontend (React/Vue) mirrors this by feature folders: `features/clients`, `features/applicants`, `features/recruitment`, `features/jobOrders`, `features/deployment`.

---

## 10. Non-Functional Requirements

| Concern | Approach |
|---|---|
| Security | Role-based access control (Admin, HR Staff, Ops Staff, Client Viewer), Sanctum tokens, form validation |
| Scalability | Modular domain structure allows extracting subsystems into services later |
| Auditability | Status logs on deployments, application state transitions tracked |
| Data integrity | PostgreSQL FK constraints across client → job order → application → deployment |
| Extensibility | New Core Transactions (2, 3...) added as new `Domain/` modules without touching CT1 |

---

## 11. Notes for Panel Defense

- Emphasize the **separation of the AI scoring module** — shows you understood not to hardcode ML logic into business controllers.
- Be ready to explain **why PostgreSQL over MySQL** (relational integrity, JSON field support for flexible requirements, generally stronger for enterprise-grade capstones).
- If asked "is this scalable to microservices" — answer: modular monolith now, subsystems are already bounded contexts that could be split later.

---

## 12. Open Items / To Confirm with Adviser

- [ ] Confirm if Core Transactions 2/3 exist and their scope
- [ ] Finalize scoring model: rules-based vs ML for MVP
- [ ] Decide React vs Vue (pick one, don't mix)
- [ ] Confirm hosting/deployment target (affects infra diagram)
