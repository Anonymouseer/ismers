<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Models\ApplicantDocument;
use App\Models\ApplicantEducation;
use App\Models\ApplicantHistory;
use App\Models\ApplicantReference;
use App\Models\ApplicantSkill;
use App\Models\ApplicantWorkHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplicantController extends Controller
{
    /**
     * Format an Applicant model into the exact JS camelCase shape the frontend expects.
     */
    private function formatApplicant(Applicant $applicant): array
    {
        $fullName = trim("{$applicant->first_name} {$applicant->last_name}");

        return [
            'id' => $applicant->id,
            'regId' => $applicant->reg_id,
            'name' => $fullName,
            'firstName' => $applicant->first_name,
            'middleName' => $applicant->middle_name ?? '',
            'lastName' => $applicant->last_name,
            'suffix' => $applicant->suffix ?? '',
            'email' => $applicant->email ?? '',
            'phone' => $applicant->phone,
            'alternateContact' => $applicant->alternate_contact ?? '',
            'dateOfBirth' => $applicant->date_of_birth ? $applicant->date_of_birth->format('Y-m-d') : '',
            'gender' => $applicant->gender ?? '',
            'civilStatus' => $applicant->civil_status ?? '',
            'nationality' => $applicant->nationality ?? '',
            'placeOfBirth' => $applicant->place_of_birth ?? '',
            'height' => $applicant->height ?? '',
            'weight' => $applicant->weight ?? '',
            'religion' => $applicant->religion ?? '',
            'location' => $applicant->city_address ?? '',
            'address' => $applicant->provincial_address ?? '',

            'spouseName' => $applicant->family->spouse_name ?? '',
            'spouseOccupation' => $applicant->family->spouse_occupation ?? '',
            'fatherName' => $applicant->family->father_name ?? '',
            'fatherOccupation' => $applicant->family->father_occupation ?? '',
            'motherName' => $applicant->family->mother_name ?? '',
            'motherOccupation' => $applicant->family->mother_occupation ?? '',
            'familyAddress' => $applicant->family->family_address ?? '',
            'emergencyContactName' => $applicant->family->emergency_contact_name ?? '',
            'emergencyContactAddress' => $applicant->family->emergency_contact_address ?? '',

            'category' => $applicant->category,
            'experienceSummary' => $applicant->experience_summary ?? '',
            'targetJobId' => $applicant->target_job_id,
            'stage' => $applicant->stage,
            'status' => $applicant->status,
            'sentToRecruitment' => (bool) $applicant->sent_to_recruitment,
            'submissionSource' => $applicant->submission_source,
            'registeredDate' => $applicant->created_at->format('M d, Y'),

            'skills' => $applicant->skills->pluck('name')->toArray(),

            'workHistory' => $applicant->workHistory->map(fn ($w) => [
                'id' => $w->id,
                'role' => $w->role,
                'company' => $w->company,
                'duration' => $w->duration ?? '—',
            ])->toArray(),

            'education' => $applicant->education->map(fn ($e) => [
                'id' => $e->id,
                'level' => $e->level ?? '—',
                'school' => $e->school,
                'degree' => $e->degree ?? '',
                'startYear' => $e->start_year ?? '',
                'endYear' => $e->end_year ?? '',
            ])->toArray(),

            'documents' => $applicant->documents->map(fn ($d) => [
                'id' => $d->id,
                'name' => $d->name,
                'type' => $d->type,
                'uploadedDate' => $d->created_at->format('M d, Y'),
                'downloadUrl' => $d->file_path ? url("/api/v1/applicants/{$applicant->reg_id}/documents/{$d->id}/download") : null,
            ])->toArray(),

            'references' => $applicant->references->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'occupation' => $r->occupation ?? '—',
                'contact' => $r->contact ?? '—',
            ])->toArray(),

            'history' => $applicant->history->map(fn ($h) => [
                'id' => $h->id,
                'date' => $h->date ?? $h->created_at->format('M d, Y'),
                'text' => $h->text,
            ])->toArray(),
        ];
    }

    private function findApplicant(string $regId): Applicant
    {
        return Applicant::where('reg_id', $regId)
            ->with(['family', 'education', 'workHistory', 'skills', 'documents', 'references', 'history'])
            ->firstOrFail();
    }

    private function logHistory(Applicant $applicant, string $text): void
    {
        $applicant->history()->create([
            'date' => now()->format('M d, Y'),
            'text' => $text,
        ]);
    }

    /**
     * GET /api/v1/applicants
     */
    public function index(): JsonResponse
    {
        $applicants = Applicant::with(['family', 'education', 'workHistory', 'skills', 'documents', 'references', 'history'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($applicants->map(fn ($a) => $this->formatApplicant($a)));
    }

    /**
     * GET /api/v1/applicants/{regId}
     */
    public function show(string $regId): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        return response()->json($this->formatApplicant($applicant));
    }

    /**
     * POST /api/v1/applicants (Self-service or staff intake registration)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'firstName' => 'required|string|max:100',
            'lastName' => 'required|string|max:100',
            'middleName' => 'nullable|string|max:100',
            'suffix' => 'nullable|string|max:20',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:150',
            'alternateContact' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'dateOfBirth' => 'nullable|string',
            'gender' => 'nullable|string',
            'civilStatus' => 'nullable|string',
            'nationality' => 'nullable|string',
            'placeOfBirth' => 'nullable|string',
            'height' => 'nullable|string',
            'weight' => 'nullable|string',
            'religion' => 'nullable|string',
            'category' => 'nullable|string',
            'experienceSummary' => 'nullable|string',
            'submissionSource' => 'nullable|string',

            'spouseName' => 'nullable|string',
            'spouseOccupation' => 'nullable|string',
            'fatherName' => 'nullable|string',
            'fatherOccupation' => 'nullable|string',
            'motherName' => 'nullable|string',
            'motherOccupation' => 'nullable|string',
            'familyAddress' => 'nullable|string',
            'emergencyContactName' => 'nullable|string',
            'emergencyContactAddress' => 'nullable|string',

            'education' => 'nullable|array',
            'workHistory' => 'nullable|array',
            'references' => 'nullable|array',
        ]);

        // Duplicate Check on email or phone
        $email = trim(strtolower($validated['email'] ?? ''));
        $phone = trim($validated['phone']);

        $duplicate = Applicant::where(function ($q) use ($email, $phone) {
            if ($email) {
                $q->whereRaw('LOWER(email) = ?', [$email]);
            }
            if ($phone) {
                $q->orWhere('phone', $phone);
            }
        })->first();

        if ($duplicate) {
            return response()->json([
                'ok' => false,
                'duplicate' => true,
                'message' => "Possible existing applicant found: {$duplicate->first_name} {$duplicate->last_name} ({$duplicate->reg_id}) already uses this email or mobile number.",
            ], 422);
        }

        // Generate next REG-### id
        $maxId = Applicant::max('id') ?? 0;
        $nextNum = $maxId + 1;
        $regId = 'REG-' . str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $applicant = Applicant::create([
                'reg_id' => $regId,
                'first_name' => trim($validated['firstName']),
                'middle_name' => trim($validated['middleName'] ?? ''),
                'last_name' => trim($validated['lastName']),
                'suffix' => trim($validated['suffix'] ?? ''),
                'phone' => $phone,
                'email' => $email,
                'alternate_contact' => trim($validated['alternateContact'] ?? ''),
                'city_address' => trim($validated['location'] ?? ''),
                'provincial_address' => trim($validated['address'] ?? ''),
                'date_of_birth' => !empty($validated['dateOfBirth']) ? $validated['dateOfBirth'] : null,
                'gender' => trim($validated['gender'] ?? ''),
                'civil_status' => trim($validated['civilStatus'] ?? ''),
                'nationality' => trim($validated['nationality'] ?? ''),
                'place_of_birth' => trim($validated['placeOfBirth'] ?? ''),
                'height' => trim($validated['height'] ?? ''),
                'weight' => trim($validated['weight'] ?? ''),
                'religion' => trim($validated['religion'] ?? ''),
                'category' => trim($validated['category'] ?? ''),
                'experience_summary' => trim($validated['experienceSummary'] ?? ''),
                'stage' => 'registered',
                'status' => 'active',
                'submission_source' => $validated['submissionSource'] ?? 'staff',
            ]);

            // Save Family Info
            $applicant->family()->create([
                'spouse_name' => trim($validated['spouseName'] ?? ''),
                'spouse_occupation' => trim($validated['spouseOccupation'] ?? ''),
                'father_name' => trim($validated['fatherName'] ?? ''),
                'father_occupation' => trim($validated['fatherOccupation'] ?? ''),
                'mother_name' => trim($validated['motherName'] ?? ''),
                'mother_occupation' => trim($validated['motherOccupation'] ?? ''),
                'family_address' => trim($validated['familyAddress'] ?? ''),
                'emergency_contact_name' => trim($validated['emergencyContactName'] ?? ''),
                'emergency_contact_address' => trim($validated['emergencyContactAddress'] ?? ''),
            ]);

            // Save Education
            if (!empty($validated['education'])) {
                foreach ($validated['education'] as $edu) {
                    if (!empty($edu['school'])) {
                        $applicant->education()->create([
                            'level' => $edu['level'] ?? '—',
                            'school' => trim($edu['school']),
                            'degree' => trim($edu['degree'] ?? ''),
                            'end_year' => trim($edu['endYear'] ?? ''),
                        ]);
                    }
                }
            }

            // Save Work History
            if (!empty($validated['workHistory'])) {
                foreach ($validated['workHistory'] as $w) {
                    if (!empty($w['role']) || !empty($w['company'])) {
                        $applicant->workHistory()->create([
                            'role' => trim($w['role'] ?? ''),
                            'company' => trim($w['company'] ?? ''),
                            'duration' => trim($w['duration'] ?? ''),
                        ]);
                    }
                }
            }

            // Save References
            if (!empty($validated['references'])) {
                foreach ($validated['references'] as $r) {
                    if (!empty($r['name'])) {
                        $applicant->references()->create([
                            'name' => trim($r['name']),
                            'occupation' => trim($r['occupation'] ?? ''),
                            'contact' => trim($r['contact'] ?? ''),
                        ]);
                    }
                }
            }

            // Initial Audit History Log
            $this->logHistory($applicant, 'Applicant registered');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 500);
        }

        $applicant->load(['family', 'education', 'workHistory', 'skills', 'documents', 'references', 'history']);
        return response()->json(['ok' => true, 'regId' => $regId, 'applicant' => $this->formatApplicant($applicant)], 201);
    }

    /**
     * PUT /api/v1/applicants/{regId} (Update basic information)
     */
    public function update(Request $request, string $regId): JsonResponse
    {
        $applicant = $this->findApplicant($regId);

        $validated = $request->validate([
            'firstName' => 'sometimes|required|string|max:100',
            'lastName' => 'sometimes|required|string|max:100',
            'middleName' => 'nullable|string',
            'suffix' => 'nullable|string',
            'phone' => 'sometimes|required|string',
            'email' => 'nullable|email',
            'alternateContact' => 'nullable|string',
            'location' => 'nullable|string',
            'address' => 'nullable|string',
            'dateOfBirth' => 'nullable|string',
            'gender' => 'nullable|string',
            'civilStatus' => 'nullable|string',
            'nationality' => 'nullable|string',
            'placeOfBirth' => 'nullable|string',
            'height' => 'nullable|string',
            'weight' => 'nullable|string',
            'religion' => 'nullable|string',
            'category' => 'nullable|string',
            'experienceSummary' => 'nullable|string',

            'spouseName' => 'nullable|string',
            'spouseOccupation' => 'nullable|string',
            'fatherName' => 'nullable|string',
            'fatherOccupation' => 'nullable|string',
            'motherName' => 'nullable|string',
            'motherOccupation' => 'nullable|string',
            'familyAddress' => 'nullable|string',
            'emergencyContactName' => 'nullable|string',
            'emergencyContactAddress' => 'nullable|string',
        ]);

        // Duplicate Check for update
        $email = isset($validated['email']) ? trim(strtolower($validated['email'])) : null;
        $phone = isset($validated['phone']) ? trim($validated['phone']) : null;

        if ($email || $phone) {
            $duplicate = Applicant::where('id', '!=', $applicant->id)
                ->where(function ($q) use ($email, $phone) {
                    if ($email) $q->whereRaw('LOWER(email) = ?', [$email]);
                    if ($phone) $q->orWhere('phone', $phone);
                })->first();

            if ($duplicate) {
                return response()->json([
                    'ok' => false,
                    'duplicate' => true,
                    'message' => "Possible existing applicant found: {$duplicate->first_name} {$duplicate->last_name} ({$duplicate->reg_id}) already uses this email or mobile number.",
                ], 422);
            }
        }

        $applicant->update([
            'first_name' => $validated['firstName'] ?? $applicant->first_name,
            'middle_name' => $validated['middleName'] ?? $applicant->middle_name,
            'last_name' => $validated['lastName'] ?? $applicant->last_name,
            'suffix' => $validated['suffix'] ?? $applicant->suffix,
            'phone' => $validated['phone'] ?? $applicant->phone,
            'email' => $validated['email'] ?? $applicant->email,
            'alternate_contact' => $validated['alternateContact'] ?? $applicant->alternate_contact,
            'city_address' => $validated['location'] ?? $applicant->city_address,
            'provincial_address' => $validated['address'] ?? $applicant->provincial_address,
            'date_of_birth' => $validated['dateOfBirth'] ?? $applicant->date_of_birth,
            'gender' => $validated['gender'] ?? $applicant->gender,
            'civil_status' => $validated['civilStatus'] ?? $applicant->civil_status,
            'nationality' => $validated['nationality'] ?? $applicant->nationality,
            'place_of_birth' => $validated['placeOfBirth'] ?? $applicant->place_of_birth,
            'height' => $validated['height'] ?? $applicant->height,
            'weight' => $validated['weight'] ?? $applicant->weight,
            'religion' => $validated['religion'] ?? $applicant->religion,
            'category' => $validated['category'] ?? $applicant->category,
            'experience_summary' => $validated['experienceSummary'] ?? $applicant->experience_summary,
        ]);

        if ($applicant->family) {
            $applicant->family->update([
                'spouse_name' => $validated['spouseName'] ?? $applicant->family->spouse_name,
                'spouse_occupation' => $validated['spouseOccupation'] ?? $applicant->family->spouse_occupation,
                'father_name' => $validated['fatherName'] ?? $applicant->family->father_name,
                'father_occupation' => $validated['fatherOccupation'] ?? $applicant->family->father_occupation,
                'mother_name' => $validated['motherName'] ?? $applicant->family->mother_name,
                'mother_occupation' => $validated['motherOccupation'] ?? $applicant->family->mother_occupation,
                'family_address' => $validated['familyAddress'] ?? $applicant->family->family_address,
                'emergency_contact_name' => $validated['emergencyContactName'] ?? $applicant->family->emergency_contact_name,
                'emergency_contact_address' => $validated['emergencyContactAddress'] ?? $applicant->family->emergency_contact_address,
            ]);
        }

        $this->logHistory($applicant, 'Basic information updated');
        $applicant->load(['family', 'education', 'workHistory', 'skills', 'documents', 'references', 'history']);

        return response()->json(['ok' => true, 'applicant' => $this->formatApplicant($applicant)]);
    }

    /**
     * DELETE /api/v1/applicants/{regId}
     */
    public function destroy(string $regId): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $applicant->delete();
        return response()->json(['ok' => true, 'message' => 'Applicant deleted successfully']);
    }

    // ── SUB-RESOURCE CONTROLLERS ──

    public function addSkill(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate(['skill' => 'required|string']);
        $applicant = $this->findApplicant($regId);
        $name = trim($validated['skill']);

        $applicant->skills()->create(['name' => $name]);
        $this->logHistory($applicant, "Skill added: {$name}");

        $applicant->load('skills');
        return response()->json(['ok' => true, 'skills' => $applicant->skills->pluck('name')->toArray()]);
    }

    public function removeSkill(string $regId, string $identifier): JsonResponse
    {
        $applicant = $this->findApplicant($regId);

        $identifier = urldecode($identifier);
        $skill = $applicant->skills()
            ->where(function ($q) use ($identifier) {
                if (is_numeric($identifier)) {
                    $q->where('id', (int) $identifier);
                }
                $q->orWhere('name', trim($identifier));
            })->first();

        if ($skill) {
            $name = $skill->name;
            $skill->delete();
            $this->logHistory($applicant, "Skill removed: {$name}");
        }

        $applicant->load('skills');
        return response()->json(['ok' => true, 'skills' => $applicant->skills->pluck('name')->toArray()]);
    }

    public function addWorkHistory(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|string',
            'company' => 'required|string',
            'duration' => 'nullable|string',
        ]);
        $applicant = $this->findApplicant($regId);

        $applicant->workHistory()->create([
            'role' => trim($validated['role']),
            'company' => trim($validated['company']),
            'duration' => trim($validated['duration'] ?? '—'),
        ]);
        $this->logHistory($applicant, "Work history added: {$validated['role']} at {$validated['company']}");

        $applicant->load('workHistory');
        return response()->json(['ok' => true]);
    }

    public function removeWorkHistory(string $regId, int $id): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $applicant->workHistory()->where('id', $id)->delete();
        $this->logHistory($applicant, 'Work history entry removed');
        return response()->json(['ok' => true]);
    }

    public function addEducation(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate([
            'school' => 'required|string',
            'degree' => 'nullable|string',
            'level' => 'nullable|string',
            'startYear' => 'nullable|string',
            'endYear' => 'nullable|string',
        ]);
        $applicant = $this->findApplicant($regId);

        $applicant->education()->create([
            'school' => trim($validated['school']),
            'degree' => trim($validated['degree'] ?? ''),
            'level' => trim($validated['level'] ?? '—'),
            'start_year' => trim($validated['startYear'] ?? ''),
            'end_year' => trim($validated['endYear'] ?? 'Present'),
        ]);
        $this->logHistory($applicant, "Education added: " . ($validated['degree'] ?? '') . " at {$validated['school']}");

        return response()->json(['ok' => true]);
    }

    public function removeEducation(string $regId, int $id): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $applicant->education()->where('id', $id)->delete();
        $this->logHistory($applicant, 'Education entry removed');
        return response()->json(['ok' => true]);
    }

    public function addDocument(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string',
            'type' => 'nullable|string',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $applicant = $this->findApplicant($regId);
        $filePath = null;
        $fileName = $validated['name'] ?? 'Document';

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store("applicant-documents/{$applicant->reg_id}", 'public');
        }

        $doc = $applicant->documents()->create([
            'name' => $fileName,
            'type' => $validated['type'] ?? 'Other Documents',
            'file_path' => $filePath,
            'disk' => 'public',
        ]);

        $this->logHistory($applicant, "Document uploaded: {$fileName}");
        return response()->json(['ok' => true, 'document' => [
            'id' => $doc->id,
            'name' => $doc->name,
            'type' => $doc->type,
            'uploadedDate' => $doc->created_at->format('M d, Y'),
            'downloadUrl' => $doc->file_path ? url("/api/v1/applicants/{$applicant->reg_id}/documents/{$doc->id}/download") : null,
        ]]);
    }

    public function downloadDocument(string $regId, int $id)
    {
        $applicant = $this->findApplicant($regId);
        $doc = $applicant->documents()->where('id', $id)->firstOrFail();

        if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
            return Storage::disk('public')->download($doc->file_path, $doc->name);
        }

        return response()->json(['message' => 'File not found on storage'], 404);
    }

    public function removeDocument(string $regId, int $id): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $doc = $applicant->documents()->where('id', $id)->first();
        if ($doc) {
            if ($doc->file_path && Storage::disk('public')->exists($doc->file_path)) {
                Storage::disk('public')->delete($doc->file_path);
            }
            $name = $doc->name;
            $doc->delete();
            $this->logHistory($applicant, "Document removed: {$name}");
        }
        return response()->json(['ok' => true]);
    }

    public function addReference(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'occupation' => 'nullable|string',
            'contact' => 'nullable|string',
        ]);
        $applicant = $this->findApplicant($regId);

        $applicant->references()->create([
            'name' => trim($validated['name']),
            'occupation' => trim($validated['occupation'] ?? '—'),
            'contact' => trim($validated['contact'] ?? '—'),
        ]);
        $this->logHistory($applicant, "Reference added: {$validated['name']}");
        return response()->json(['ok' => true]);
    }

    public function removeReference(string $regId, int $id): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $applicant->references()->where('id', $id)->delete();
        $this->logHistory($applicant, 'Reference removed');
        return response()->json(['ok' => true]);
    }

    // ── WORKFLOW & STAGE ACTIONS ──

    public function updateStage(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate(['stage' => 'required|string']);
        $applicant = $this->findApplicant($regId);
        $stage = $validated['stage'];

        if ($stage === 'profiling') {
            $applicant->update(['stage' => 'profiling']);
            $this->logHistory($applicant, 'Started profiling');
        } elseif ($stage === 'profiled') {
            // Validation rules matching store logic
            if (!$applicant->category) {
                return response()->json(['ok' => false, 'message' => 'Assign a category before marking the profile complete.'], 400);
            }
            if (!$applicant->target_job_id) {
                return response()->json(['ok' => false, 'message' => 'Assign a target job order before marking the profile complete.'], 400);
            }
            if (!$applicant->skills()->count()) {
                return response()->json(['ok' => false, 'message' => 'Add at least one skill before marking the profile complete.'], 400);
            }
            if (!$applicant->workHistory()->count()) {
                return response()->json(['ok' => false, 'message' => 'Add at least one work history entry before marking the profile complete.'], 400);
            }
            $applicant->update(['stage' => 'profiled']);
            $this->logHistory($applicant, 'Profile marked complete');
        }

        $applicant->load(['family', 'education', 'workHistory', 'skills', 'documents', 'references', 'history']);
        return response()->json(['ok' => true, 'applicant' => $this->formatApplicant($applicant)]);
    }

    public function updateStatus(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate(['status' => 'required|string']);
        $applicant = $this->findApplicant($regId);
        $status = $validated['status'];

        $applicant->update(['status' => $status]);
        $statusLabels = [
            'active' => 'Active', 'inactive' => 'Inactive', 'on_hold' => 'On Hold',
            'hired' => 'Hired', 'rejected' => 'Rejected', 'withdrawn' => 'Withdrawn', 'blacklisted' => 'Blacklisted',
        ];
        $label = $statusLabels[$status] ?? $status;
        $this->logHistory($applicant, "Status changed to {$label}");

        return response()->json(['ok' => true]);
    }

    public function updateCategory(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate(['category' => 'nullable|string']);
        $applicant = $this->findApplicant($regId);
        $cat = $validated['category'] ?? null;

        $applicant->update(['category' => $cat]);
        $this->logHistory($applicant, $cat ? "Category assigned: {$cat}" : 'Category unassigned');

        return response()->json(['ok' => true]);
    }

    public function updateTargetJob(Request $request, string $regId): JsonResponse
    {
        $validated = $request->validate([
            'targetJobId' => 'nullable|string',
            'jobLabel' => 'nullable|string',
        ]);
        $applicant = $this->findApplicant($regId);
        $targetId = $validated['targetJobId'] ?? null;
        $label = $validated['jobLabel'] ?? 'Job Target';

        $applicant->update(['target_job_id' => $targetId]);
        $this->logHistory($applicant, $targetId ? "Target job assigned: {$label}" : 'Target job unassigned');

        return response()->json(['ok' => true]);
    }

    public function sendToRecruitment(string $regId): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $applicant->update(['sent_to_recruitment' => true]);
        $this->logHistory($applicant, 'Sent to Recruitment & Selection');

        return response()->json(['ok' => true]);
    }
}
