# ISMERS — Service Management and Enterprise Resource System

Capstone project — Section 41010
Lead Programmer: @Arcilla

## Stack
- Frontend: ReactJS (Vite)
- Backend: Laravel
- Database: PostgreSQL
- API: RESTful
- Version Control: Git/GitHub

## Folder Structure

- `frontend/` — React SPA, organized by feature (mirrors subsystems)
- `backend/` — Laravel API, organized by domain (mirrors subsystems)
- `database/` — ERD, schema reference, seed data
- `docs/` — architecture docs, API specs, diagrams, meeting notes

## Subsystems (Core Transaction 1)

| Subsystem | Frontend | Backend |
|---|---|---|
| Client Management | `frontend/src/features/client-management` | `backend/app/Domain/ClientManagement` |
| Applicant Registration | `frontend/src/features/applicant-registration` | `backend/app/Domain/ApplicantRegistration` |
| Recruitment & Selection | `frontend/src/features/recruitment-selection` | `backend/app/Domain/RecruitmentSelection` |
| Job Order Management | `frontend/src/features/job-order-management` | `backend/app/Domain/JobOrderManagement` |
| Deployment & Assignment | `frontend/src/features/deployment-assignment` | `backend/app/Domain/DeploymentAssignment` |

## Setup

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

## Branching
- `main` — stable/demo-ready
- `develop` — integration branch
- `feature/<subsystem>-<task>` — e.g. `feature/client-management-crud`
