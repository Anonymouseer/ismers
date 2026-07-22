# ISMERS — API Integration Guide

How individual member work (per subsystem) comes together into one working API.

---

## 1. The Core Rule

Each member builds their subsystem **independently** inside their own `Domain/{Subsystem}/` folder. They should **never edit another member's Domain folder directly**. Integration happens only in a few shared, agreed-upon places:

| Shared integration point | What goes here | Who touches it |
|---|---|---|
| `routes/api.php` | Route registration for all subsystems | Everyone, but coordinate (see §2) |
| `app/Http/Resources/` | Standardized response formatting | Agreed structure, built once |
| Shared entities (e.g. `applications` table) | Tables that connect two subsystems | Whoever owns the "connecting" logic — agree explicitly (see §4) |
| `.env` / config | DB connection, API base URL | Same for everyone, don't override each other's local `.env` |

---

## 2. Combining Routes Without Conflicts

`routes/api.php` is the one file everyone eventually touches. To avoid merge conflicts:

**Recommended: each subsystem gets its own route file, then import into `api.php`**

```
routes/
├── api.php                      ← just imports the rest
└── api/
    ├── clients.php
    ├── applicants.php
    ├── recruitment.php
    ├── job-orders.php
    └── deployments.php
```

`routes/api.php`:
```php
<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    require __DIR__.'/api/clients.php';
    require __DIR__.'/api/applicants.php';
    require __DIR__.'/api/recruitment.php';
    require __DIR__.'/api/job-orders.php';
    require __DIR__.'/api/deployments.php';
});
```

`routes/api/clients.php` (owned by whoever has Client Management):
```php
<?php

use Illuminate\Support\Facades\Route;
use App\Domain\ClientManagement\Http\Controllers\ClientController;

Route::apiResource('clients', ClientController::class);
```

This way, each member only edits their own route file — **zero merge conflicts** on `api.php` itself.

---

## 3. Standardized API Responses

Agree on this **before** anyone finishes their first endpoint, or you'll end up with 5 different response shapes.

Suggested standard (Laravel API Resource pattern):

```json
{
  "success": true,
  "data": { ... },
  "message": "Client created successfully"
}
```

Error format:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": ["The email field is required."] }
}
```

Put this in a shared base class so everyone extends it instead of inventing their own:

```php
// app/Http/Resources/BaseApiResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BaseApiResource extends JsonResource
{
    public static function success($data, string $message = ''): array
    {
        return ['success' => true, 'data' => $data, 'message' => $message];
    }

    public static function error(string $message, $errors = null): array
    {
        return ['success' => false, 'message' => $message, 'errors' => $errors];
    }
}
```

---

## 4. Shared / Connecting Entities

Some tables naturally belong to more than one subsystem. Example: `applications` connects **Recruitment & Selection** and **Job Order Management** (an applicant applies to a job order).

**Rule:** one subsystem owns the table (Model + migration), others just reference it via foreign key / relationship — they don't duplicate it.

| Shared entity | Owning subsystem | Referenced by |
|---|---|---|
| `applications` | Recruitment & Selection | Job Order Management, Deployment & Assignment |
| `job_orders` | Job Order Management | Recruitment & Selection, Deployment & Assignment |
| `applicants` | Applicant Registration | Recruitment & Selection, Deployment & Assignment |

If Deployment needs job order info, it calls `JobOrderManagement`'s Service class (or Eloquent relationship) — it does not create its own copy of job order logic.

```php
// Example: DeploymentAssignment/Services/DeploymentAssignmentService.php
use App\Domain\JobOrderManagement\Models\JobOrder;

class DeploymentAssignmentService
{
    public function assign(int $applicationId, int $jobOrderId)
    {
        $jobOrder = JobOrder::findOrFail($jobOrderId); // reused, not duplicated
        // ...
    }
}
```

---

## 5. Local Development — Running Everyone's Work Together

Since everyone works on the same Laravel app (not separate microservices), integration testing is straightforward:

1. Everyone pulls latest `develop` branch
2. Run `composer install` (in case someone added a package)
3. Run `php artisan migrate` (picks up new migrations from teammates)
4. `php artisan serve` — now all subsystems' endpoints are live together in one API

**Before merging a PR into `develop`:**
- [ ] Your routes file doesn't duplicate a path another member already used
- [ ] Your migration doesn't conflict with an existing table/column name
- [ ] You used `BaseApiResource` format for responses
- [ ] You referenced shared entities via relationships, not by copying their logic

---

## 6. Frontend Side — Combining API Calls

Same principle applies in `frontend/src/features/`. Each feature's `services/*Service.js` calls its own backend routes. When a page needs data from two subsystems (e.g., a Deployment page showing Job Order + Applicant info), it imports both services:

```js
// frontend/src/features/deployment-assignment/pages/DeploymentPage.jsx
import { deploymentAssignmentService } from '../services/DeploymentAssignmentService';
import { jobOrderManagementService } from '../../job-order-management/services/JobOrderManagementService';
```

This is fine — cross-feature imports for *reading* data are normal. What to avoid: don't let one feature's `store` directly mutate another feature's `store` state. Fetch fresh via the service call instead.

---

## 7. Suggested Integration Checkpoints (Team Milestones)

| Checkpoint | What to verify together |
|---|---|
| After each subsystem has basic CRUD | All routes reachable together via `php artisan route:list`, no path conflicts |
| Before first full demo | Applications flow works end-to-end: Client → Job Order → Applicant → Application → Score → Deployment |
| Before defense | Response format consistent across all endpoints, shared entities not duplicated, `develop` merged clean into `main` |

---

## Quick Reference: Who Talks to Whom

```
Client Management ──┐
                     ├──> Job Order Management
Applicant Registration ──> Recruitment & Selection ──> Job Order Management
                                    │
                                    ▼
                          Deployment & Assignment ──> Job Order Management
                                                   ──> Applicant Registration (via Application)
```
