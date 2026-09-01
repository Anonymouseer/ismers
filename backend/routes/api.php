<?php

use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientAccountController;
use App\Http\Controllers\DeploymentController;
use App\Http\Controllers\JobOrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return response()->json(['message' => 'Laravel is connected!']);
});

// ── Application API (v1) ──
Route::prefix('v1')->group(function () {
    // ── Authentication (Admin / HR) ──
    Route::prefix('auth')->group(function () {
        Route::post('/login',  [AuthController::class, 'login']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
        Route::get('/me',      [AuthController::class, 'me'])->middleware('auth:sanctum');
    });

    // ── AI Analytics & Intelligence ──
    Route::prefix('analytics')->group(function () {
        Route::get('/scoring',   [AnalyticsController::class, 'scoring']);
        Route::get('/pipeline',  [AnalyticsController::class, 'pipeline']);
        Route::get('/retention', [AnalyticsController::class, 'retention']);
    });

    // ── AI Scoring & Ranking Engine ──
    Route::prefix('scoring')->group(function () {
        Route::post('/evaluate',       [AnalyticsController::class, 'evaluate']);
        Route::post('/auto-shortlist', [AnalyticsController::class, 'autoShortlist']);
    });
    Route::get('/applicants', [ApplicantController::class, 'index']);
    Route::post('/applicants', [ApplicantController::class, 'store']);
    Route::get('/applicants/{regId}', [ApplicantController::class, 'show']);
    Route::put('/applicants/{regId}', [ApplicantController::class, 'update']);
    Route::delete('/applicants/{regId}', [ApplicantController::class, 'destroy']);

    // Sub-resources
    Route::post('/applicants/{regId}/skills', [ApplicantController::class, 'addSkill']);
    Route::delete('/applicants/{regId}/skills/{id}', [ApplicantController::class, 'removeSkill']);

    Route::post('/applicants/{regId}/work-history', [ApplicantController::class, 'addWorkHistory']);
    Route::delete('/applicants/{regId}/work-history/{id}', [ApplicantController::class, 'removeWorkHistory']);

    Route::post('/applicants/{regId}/education', [ApplicantController::class, 'addEducation']);
    Route::delete('/applicants/{regId}/education/{id}', [ApplicantController::class, 'removeEducation']);

    Route::post('/applicants/{regId}/documents', [ApplicantController::class, 'addDocument']);
    Route::get('/applicants/{regId}/documents/{id}/download', [ApplicantController::class, 'downloadDocument']);
    Route::delete('/applicants/{regId}/documents/{id}', [ApplicantController::class, 'removeDocument']);

    Route::post('/applicants/{regId}/references', [ApplicantController::class, 'addReference']);
    Route::delete('/applicants/{regId}/references/{id}', [ApplicantController::class, 'removeReference']);

    // Workflow actions
    Route::patch('/applicants/{regId}/stage', [ApplicantController::class, 'updateStage']);
    Route::patch('/applicants/{regId}/status', [ApplicantController::class, 'updateStatus']);
    Route::patch('/applicants/{regId}/category', [ApplicantController::class, 'updateCategory']);
    Route::patch('/applicants/{regId}/target-job', [ApplicantController::class, 'updateTargetJob']);
    Route::post('/applicants/{regId}/send-to-recruitment', [ApplicantController::class, 'sendToRecruitment']);
    Route::post('/applicants/{regId}/return-to-profiling', [ApplicantController::class, 'returnToProfiling']);
    Route::post('/applicants/bulk-return-to-profiling', [ApplicantController::class, 'bulkReturnToProfiling']);
    Route::get('/recruitment/applications', [ApplicantController::class, 'recruitmentApplications']);
    Route::patch('/applicants/{id}/recruitment-stage', [ApplicantController::class, 'updateRecruitmentStage']);
    Route::patch('/applicants/{id}/recruitment-screening', [ApplicantController::class, 'updateRecruitmentScreening']);
    Route::patch('/applicants/{id}/client-endorsement-status', [ApplicantController::class, 'updateClientEndorsementStatus']);

    // ── Client Management / CRM ──
    Route::get('/clients',              [ClientAccountController::class, 'index']);
    Route::post('/clients',             [ClientAccountController::class, 'store']);
    Route::get('/clients/{id}',         [ClientAccountController::class, 'show']);
    Route::put('/clients/{id}',         [ClientAccountController::class, 'update']);
    Route::delete('/clients/{id}',      [ClientAccountController::class, 'destroy']);

    // ── Client Portal Auth ──
    Route::prefix('client-portal')->group(function () {
        Route::post('/login', [ClientAccountController::class, 'login']);
        Route::post('/register', [ClientAccountController::class, 'register']);
    });

    // ── Job Orders ──
    Route::get('/job-orders',           [JobOrderController::class, 'index']);
    Route::post('/job-orders',          [JobOrderController::class, 'store']);
    Route::get('/job-orders/{ref}',     [JobOrderController::class, 'show']);
    Route::put('/job-orders/{ref}',     [JobOrderController::class, 'update']);
    Route::delete('/job-orders/{ref}',  [JobOrderController::class, 'destroy']);

    // ── Deployments & Assignment ──
    Route::get('/deployments',                    [DeploymentController::class, 'index']);
    Route::post('/deployments',                   [DeploymentController::class, 'store']);
    Route::get('/deployments/pending-hires',       [DeploymentController::class, 'pendingHires']);
    Route::get('/deployments/{id}',               [DeploymentController::class, 'show']);
    Route::patch('/deployments/{id}/stage',        [DeploymentController::class, 'updateStage']);
    Route::patch('/deployments/{id}/compliance',   [DeploymentController::class, 'updateCompliance']);
    Route::post('/deployments/{id}/intervention',  [DeploymentController::class, 'logIntervention']);
    Route::patch('/deployments/{id}/intervention', [DeploymentController::class, 'logIntervention']);

    // ── System Audit & Activity Logs ──
    Route::get('/audit-logs',        [AuditLogController::class, 'index']);
    Route::post('/audit-logs',       [AuditLogController::class, 'store']);
    Route::get('/audit-logs/export', [AuditLogController::class, 'export']);
});

// ── Direct CRM Integration Endpoints (Top-level Aliases) ──
Route::get('/clients',              [ClientAccountController::class, 'index']);
Route::post('/clients',             [ClientAccountController::class, 'store']);
Route::get('/clients/{id}',         [ClientAccountController::class, 'show']);
Route::put('/clients/{id}',         [ClientAccountController::class, 'update']);
Route::delete('/clients/{id}',      [ClientAccountController::class, 'destroy']);
