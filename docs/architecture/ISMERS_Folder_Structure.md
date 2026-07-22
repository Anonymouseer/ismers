# ISMERS — Project Folder Structure (Team Repo Layout)

This is the repo-level structure so each member knows exactly where their work goes — frontend, backend/API, and database — without stepping on each other.

## Recommended approach: Monorepo, 3 top-level folders

One GitHub repo, split by concern. Easiest for a capstone team to manage (single clone, single README, single set of issues/PRs).

```
ismers/
├── frontend/                  # React/Vue SPA
├── backend/                   # Laravel API
├── database/                  # Schema, ERD, seeders reference, migrations backup
├── docs/                      # Architecture docs, diagrams, meeting notes
├── .gitignore
└── README.md
```

---

## 1. `frontend/` (React or Vue)

```
frontend/
├── public/
├── src/
│   ├── assets/                # images, icons, logos
│   ├── components/            # shared/reusable UI components
│   │   ├── common/             (buttons, modals, inputs, tables)
│   │   └── layout/              (navbar, sidebar, footer)
│   ├── features/              # ONE FOLDER PER SUBSYSTEM — assign per member
│   │   ├── client-management/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/       (API calls for this feature)
│   │   │   └── store/           (Pinia/Redux slice)
│   │   ├── applicant-registration/
│   │   ├── recruitment-selection/
│   │   ├── job-order-management/
│   │   └── deployment-assignment/
│   ├── router/                # route definitions
│   ├── services/              # axios instance, base API config
│   ├── store/                 # global state setup
│   ├── utils/                 # helpers, formatters, validators
│   ├── App.jsx / App.vue
│   └── main.jsx / main.js
├── .env.example
├── package.json
└── vite.config.js
```

**Team assignment tip:** each member "owns" one folder under `features/` for both frontend and backend — keeps ownership consistent across the stack and avoids merge conflicts.

---

## 2. `backend/` (Laravel)

```
backend/
├── app/
│   ├── Domain/                # ONE FOLDER PER SUBSYSTEM — mirrors frontend features/
│   │   ├── ClientManagement/
│   │   │   ├── Models/
│   │   │   ├── Services/
│   │   │   ├── Repositories/
│   │   │   └── Requests/
│   │   ├── ApplicantRegistration/
│   │   ├── RecruitmentSelection/
│   │   │   └── Services/CandidateScoringClient.php
│   │   ├── JobOrderManagement/
│   │   └── DeploymentAssignment/
│   ├── Http/
│   │   ├── Controllers/Api/V1/   # thin controllers, call Domain services
│   │   ├── Middleware/
│   │   └── Resources/            # API response formatting
│   └── Providers/
├── database/
│   ├── migrations/             # actual Laravel migration files
│   ├── seeders/
│   └── factories/
├── routes/
│   └── api.php
├── tests/
│   ├── Feature/
│   └── Unit/
├── .env.example
├── composer.json
└── artisan
```

**Note:** Laravel requires `database/` inside `backend/` to function (migrations live there) — that's normal and separate from the repo-level `database/` folder below, which is for documentation/reference, not code.

---

## 3. `database/` (repo-level — reference & design, not runtime)

```
database/
├── erd/
│   ├── ismers-erd.png          # exported diagram
│   └── ismers-erd.dbml          # dbdiagram.io source file
├── schema-reference.sql        # full schema dump for reference/backup
└── seed-data/                  # sample CSV/JSON data for testing
```

---

## 4. `docs/`

```
docs/
├── architecture/
│   └── ISMERS_Architecture.md   # the doc I made earlier
├── api-specs/
│   └── postman-collection.json  # or OpenAPI/Swagger spec
├── meeting-notes/
└── diagrams/
    ├── system-context.png
    └── data-flow.png
```

---

## 5. Ownership Mapping (suggested)

| Subsystem | Frontend folder | Backend folder | Suggested owner |
|---|---|---|---|
| Client Management | `features/client-management` | `Domain/ClientManagement` | Member A |
| Applicant Registration | `features/applicant-registration` | `Domain/ApplicantRegistration` | Member B |
| Recruitment & Selection (+ AI scoring) | `features/recruitment-selection` | `Domain/RecruitmentSelection` | Member C |
| Job Order Management | `features/job-order-management` | `Domain/JobOrderManagement` | Member D |
| Deployment & Assignment | `features/deployment-assignment` | `Domain/DeploymentAssignment` | Member E |

Each member works inside their own feature/domain folder on both ends — this keeps Git conflicts low since people aren't editing the same files.

---

## 6. Git Workflow Suggestion

```
main            → stable, demo-ready
develop         → integration branch
feature/<name>  → e.g. feature/client-management-crud
```

- Branch per feature, PR into `develop`, merge to `main` only at milestones/before defense.
- `.gitignore` should exclude `node_modules/`, `vendor/`, `.env`, `storage/` (Laravel logs/cache).

---

## 7. Quick Setup Checklist

- [ ] Create repo with the structure above
- [ ] Add `.gitignore` (Laravel + Node combined)
- [ ] Each member creates their `feature/` + `Domain/` folder even if empty, to reserve ownership
- [ ] Add root `README.md` with setup instructions (how to run frontend, backend, migrate DB)
- [ ] Push `docs/architecture/ISMERS_Architecture.md` immediately so everyone works from the same reference
