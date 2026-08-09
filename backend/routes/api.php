<?php

use App\Http\Controllers\ApplicantController;
use App\Http\Controllers\ClientAccountController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/ping', function () {
    return response()->json(['message' => 'Laravel is connected!']);
});

// ── Applicant Registration & Profiling API (v1) ──
Route::prefix('v1')->group(function () {
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
    Route::get('/recruitment/applications', [ApplicantController::class, 'recruitmentApplications']);
    Route::patch('/applicants/{id}/recruitment-stage', [ApplicantController::class, 'updateRecruitmentStage']);

    // ── Client Portal Auth ──
    Route::prefix('client-portal')->group(function () {
        Route::post('/login', [ClientAccountController::class, 'login']);
        Route::post('/register', [ClientAccountController::class, 'register']);
    });
});
