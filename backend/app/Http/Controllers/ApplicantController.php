<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
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
            'recruitmentStage' => $applicant->recruitment_stage,
            'aiScore' => $applicant->sent_to_recruitment ? $this->computeAiScore($applicant) : null,
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

    private const JOB_KEYWORDS = [
        'jo1' => ['inventory', 'warehouse', 'pallet', 'logistics', 'stock', 'picking', 'packing'],
        'jo2' => ['forklift', 'warehouse', 'logistics', 'pallet', 'material handling', 'inventory'],
        'jo3' => ['inventory', 'stock', 'wms', 'cycle count', 'data entry', 'clerk'],
        'jo4' => ['driver', 'delivery', 'license', 'courier', 'transport', 'logistics'],
        'jo5' => ['customer service', 'crm', 'english proficiency', 'call center', 'customer support', 'communication'],
        'jo6' => ['technical troubleshooting', 'ticketing', 'networking', 'technical support', 'troubleshooting'],
        'jo7' => ['sales', 'outbound', 'inbound', 'crm', 'cold calling', 'leads'],
        'jo8' => ['team leader', 'supervisor', 'bpo', 'coaching', 'kpi', 'csat'],
        'jo9' => ['machine operation', 'quality inspection', 'safety compliance', 'production', 'troubleshooting'],
        'jo10' => ['quality control', 'inspection', 'qc', 'calipers', 'manufacturing', 'specifications'],
        'jo11' => ['supervisor', 'production line', 'kpi', 'line balancing', 'manufacturing'],
        'jo12' => ['packaging', 'sorting', 'labeling', 'finished goods', 'packing'],
        'jo13' => ['admin', 'office', 'excel', 'documentation', 'scheduling', 'clerical'],
        'jo14' => ['sales associate', 'retail', 'customer service', 'stocking', 'replenishment'],
        'jo15' => ['cashier', 'pos', 'cash handling', 'retail', 'customer service'],
        'jo16' => ['merchandiser', 'visual', 'display', 'retail layout', 'branding'],
        'jo17' => ['front desk', 'guest relations', 'booking systems', 'hospitality', 'customer service', 'front office'],
        'jo18' => ['housekeeping', 'cleaning', 'room turnaround', 'resort', 'hospitality'],
        'jo19' => ['f&b', 'server', 'waiter', 'restaurant', 'dining', 'hospitality'],
        'jo20' => ['maintenance', 'technician', 'electrical', 'plumbing', 'repairs'],
        'jo21' => ['leasing', 'real estate', 'sales', 'viewings', 'property', 'contracts'],
        'jo22' => ['property administrator', 'tenant records', 'lease renewals', 'admin'],
        'jo23' => ['front desk', 'reception', 'lobby', 'concierge', 'visitor logs'],
        'jo24' => ['maintenance coordinator', 'repairs', 'facilities', 'building systems'],
        'jo25' => ['medical technologist', 'medtech', 'lab testing', 'specimen analysis', 'doh'],
        'jo26' => ['radiologic', 'x-ray', 'imaging', 'radtech', 'radiation safety'],
        'jo27' => ['patient service', 'registration', 'healthcare front desk', 'appointments'],
        'jo28' => ['billing', 'hmo', 'insurance claims', 'patient accounts', 'accounting'],
        'jo29' => ['packing', 'produce', 'grading', 'harvest', 'hygiene', 'export'],
        'jo30' => ['qa inspector', 'quality control', 'export-grade', 'agri', 'produce'],
        'jo31' => ['logistics coordinator', 'container bookings', 'freight', 'export documentation'],
        'jo32' => ['farm supervisor', 'harvest scheduling', 'field crews', 'agriculture'],
        'jo33' => ['construction', 'laborer', 'material handling', 'masonry', 'site work'],
        'jo34' => ['site engineer', 'autocad', 'civil engineering', 'inspections', 'plans'],
        'jo35' => ['safety officer', 'bosh', 'ppe', 'oshs', 'hazard inspection'],
        'jo36' => ['heavy equipment', 'backhoe', 'excavator', 'operator license', 'grading'],
    ];

    /**
     * Compute AI match score based on Job Order keyword matching against applicant skills and work history.
     */
    private function computeAiScore(Applicant $applicant): int
    {
        $targetId = $applicant->target_job_id ?? 'jo1';
        $keywords = self::JOB_KEYWORDS[$targetId] ?? [];
        if (empty($keywords)) {
            return 0;
        }

        $skills = $applicant->skills->pluck('name')->toArray();
        $work = $applicant->workHistory->map(fn ($w) => "{$w->role} {$w->company}")->toArray();
        $searchable = strtolower(implode(' ', array_merge($skills, $work)));

        $matched = 0;
        foreach ($keywords as $kw) {
            if (str_contains($searchable, strtolower($kw))) {
                $matched++;
            }
        }

        return (int) round(($matched / count($keywords)) * 100);
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

    private function generateNextRegId(): string
    {
        $existingRegIds = Applicant::pluck('reg_id')->toArray();
        $maxNum = 0;

        foreach ($existingRegIds as $rId) {
            if (preg_match('/(?:REG|APP)-(\d+)/i', (string) $rId, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxNum) {
                    $maxNum = $num;
                }
            }
        }

        $nextNum = $maxNum + 1;
        $candidateRegId = 'REG-'.str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);

        while (in_array($candidateRegId, $existingRegIds, true)) {
            $nextNum++;
            $candidateRegId = 'REG-'.str_pad((string) $nextNum, 3, '0', STR_PAD_LEFT);
        }

        return $candidateRegId;
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

        // Generate next collision-proof REG-### id
        $regId = $this->generateNextRegId();

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
                'date_of_birth' => ! empty($validated['dateOfBirth']) ? $validated['dateOfBirth'] : null,
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
            if (! empty($validated['education'])) {
                foreach ($validated['education'] as $edu) {
                    if (! empty($edu['school'])) {
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
            if (! empty($validated['workHistory'])) {
                foreach ($validated['workHistory'] as $w) {
                    if (! empty($w['role']) || ! empty($w['company'])) {
                        $applicant->workHistory()->create([
                            'role' => trim($w['role'] ?? ''),
                            'company' => trim($w['company'] ?? ''),
                            'duration' => trim($w['duration'] ?? ''),
                        ]);
                    }
                }
            }

            // Save References
            if (! empty($validated['references'])) {
                foreach ($validated['references'] as $r) {
                    if (! empty($r['name'])) {
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
        $this->logHistory($applicant, 'Education added: '.($validated['degree'] ?? '')." at {$validated['school']}");

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
            if (! $applicant->category) {
                return response()->json(['ok' => false, 'message' => 'Assign a category before marking the profile complete.'], 400);
            }
            if (! $applicant->target_job_id) {
                return response()->json(['ok' => false, 'message' => 'Assign a target job order before marking the profile complete.'], 400);
            }
            if (! $applicant->skills()->count()) {
                return response()->json(['ok' => false, 'message' => 'Add at least one skill before marking the profile complete.'], 400);
            }
            if (! $applicant->workHistory()->count()) {
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
        $applicant->update([
            'sent_to_recruitment' => true,
            'recruitment_stage' => 'pooling',
            'client_endorsement_status' => 'Pending Review',
            'recruiter_rating' => 0,
            'screening_checklist' => [
                'requirements' => false,
                'identity' => false,
                'history' => false,
                'reference' => false,
            ],
            'document_status' => [
                'resume' => false,
                'certificate' => false,
                'portfolio' => false,
            ],
            'interview_schedule' => null,
            'pre_employment_checklist' => [
                'medical_exam' => false,
                'nbi_clearance' => false,
                'sss_document' => false,
                'philhealth_mdr' => false,
                'pagibig_mid' => false,
                'bir_tin' => false,
                'psa_birth_cert' => false,
            ],
            'medical_referral' => null,
            'statutory_numbers' => null,
            'employment_contract' => null,
            'orientation_modules' => null,
            'atm_endorsement' => null,
            'deployment_details' => null,
            'ppe_issuance' => null,
        ]);
        $this->logHistory($applicant, 'Sent to Recruitment & Selection (Initialized in Pooling)');

        return response()->json(['ok' => true]);
    }

    public function returnToProfiling(string $regId): JsonResponse
    {
        $applicant = $this->findApplicant($regId);
        $applicant->update([
            'sent_to_recruitment' => false,
            'recruitment_stage' => null,
            'stage' => $applicant->stage === 'sent' ? 'profiled' : $applicant->stage,
            'client_endorsement_status' => 'Pending Review',
            'recruiter_rating' => 0,
            'screening_checklist' => [
                'requirements' => false,
                'identity' => false,
                'history' => false,
                'reference' => false,
            ],
            'document_status' => [
                'resume' => false,
                'certificate' => false,
                'portfolio' => false,
            ],
            'interview_schedule' => null,
            'pre_employment_checklist' => [
                'medical_exam' => false,
                'nbi_clearance' => false,
                'sss_document' => false,
                'philhealth_mdr' => false,
                'pagibig_mid' => false,
                'bir_tin' => false,
                'psa_birth_cert' => false,
            ],
            'medical_referral' => null,
            'statutory_numbers' => null,
            'employment_contract' => null,
            'orientation_modules' => null,
            'atm_endorsement' => null,
            'deployment_details' => null,
            'ppe_issuance' => null,
        ]);
        $this->logHistory($applicant, 'Returned to Applicant Profiling');

        return response()->json(['ok' => true]);
    }

    public function bulkReturnToProfiling(): JsonResponse
    {
        $applicants = Applicant::where('sent_to_recruitment', true)->get();
        foreach ($applicants as $applicant) {
            $applicant->update([
                'sent_to_recruitment' => false,
                'recruitment_stage' => null,
                'stage' => $applicant->stage === 'sent' ? 'profiled' : $applicant->stage,
                'client_endorsement_status' => 'Pending Review',
                'recruiter_rating' => 0,
                'screening_checklist' => [
                    'requirements' => false,
                    'identity' => false,
                    'history' => false,
                    'reference' => false,
                ],
                'document_status' => [
                    'resume' => false,
                    'certificate' => false,
                    'portfolio' => false,
                ],
                'interview_schedule' => null,
                'pre_employment_checklist' => [
                    'medical_exam' => false,
                    'nbi_clearance' => false,
                    'sss_document' => false,
                    'philhealth_mdr' => false,
                    'pagibig_mid' => false,
                    'bir_tin' => false,
                    'psa_birth_cert' => false,
                ],
                'medical_referral' => null,
                'statutory_numbers' => null,
                'employment_contract' => null,
                'orientation_modules' => null,
                'atm_endorsement' => null,
                'deployment_details' => null,
                'ppe_issuance' => null,
            ]);
            $this->logHistory($applicant, 'Returned to Applicant Profiling');
        }

        return response()->json([
            'ok' => true,
            'count' => $applicants->count(),
            'message' => "All {$applicants->count()} applicants returned to Profiling.",
        ]);
    }

    public function recruitmentApplications(): JsonResponse
    {
        $applicants = Applicant::where('sent_to_recruitment', true)
            ->with(['skills', 'workHistory', 'education', 'documents', 'references', 'history', 'jobOrder'])
            ->get()
            ->map(function ($applicant) {
                $fullName = trim("{$applicant->first_name} {$applicant->last_name}");
                $job = $applicant->jobOrder;

                return [
                    'id' => (string) $applicant->id,
                    'name' => $fullName,
                    'jobId' => $applicant->target_job_id ?? 'jo1',
                    'jobTitle' => $job?->title,
                    'client' => $job?->client,
                    'status' => $applicant->recruitment_stage ?? 'pooling',
                    'score' => $this->computeAiScore($applicant),
                    'applied' => $applicant->created_at->format('M d, Y'),
                    'experience' => $applicant->experience_summary ?: '—',
                    'location' => $applicant->city_address ?? '—',
                    'phone' => $applicant->contact_number ?? '—',
                    'email' => $applicant->email_address ?? '—',
                    'fromRegistration' => true,
                    'regId' => $applicant->reg_id,
                    'skills' => $applicant->skills->map(fn ($s) => $s->name)->toArray(),
                    'workHistory' => $applicant->workHistory->map(fn ($w) => [
                        'role' => $w->role,
                        'company' => $w->company,
                        'duration' => $w->duration ?? '2022 – Present',
                    ])->toArray(),
                    'education' => $applicant->education->map(fn ($e) => [
                        'level' => $e->level ?? 'College / Vocational',
                        'school' => $e->school,
                        'degree' => $e->degree ?? 'Technical Course',
                        'years' => trim(($e->start_year ?? '') . ' – ' . ($e->end_year ?? '')),
                    ])->toArray(),
                    'documents' => $applicant->documents->map(fn ($d) => [
                        'name' => $d->type ?: 'Document',
                        'fileName' => $d->name ?: 'verified_doc.pdf',
                        'uploadedAt' => $d->created_at ? $d->created_at->format('M d, Y') : 'Aug 14, 2026',
                        'verified' => true,
                    ])->toArray(),
                    'breakdown' => [
                        'skills' => min($applicant->skills->count() * 8, 25) * 4,
                        'experience' => min($applicant->workHistory->count() * 12, 25) * 4,
                        'screening' => min($applicant->education->count() * 12, 25) * 4,
                        'availability' => min($applicant->documents->count() * 8, 25) * 4,
                    ],
                    'interview' => $applicant->interview_schedule,
                    'notes' => $applicant->history->map(fn ($h) => [
                        'text' => $h->text,
                        'meta' => 'System · ' . $h->created_at->format('M d, Y'),
                    ])->toArray(),
                    'checklist' => $applicant->screening_checklist ?? [
                        'requirements' => false,
                        'identity' => false,
                        'history' => false,
                        'reference' => false,
                    ],
                    'docStatus' => $applicant->document_status ?? [
                        'resume' => false,
                        'certificate' => false,
                        'portfolio' => false,
                    ],
                    'recruiterRating' => $applicant->recruiter_rating ?? 0,
                    'assignedManager' => $applicant->assigned_manager ?? 'Area Manager 1 (North NCR)',
                    'interviewPlatform' => $applicant->interview_platform ?? 'Zoom Meeting',
                    'clientEndorsementStatus' => $applicant->client_endorsement_status ?? 'Pending Review',
                    'preEmploymentChecklist' => $applicant->pre_employment_checklist ?? [
                        'medical_exam' => false,
                        'nbi_clearance' => false,
                        'sss_document' => false,
                        'philhealth_mdr' => false,
                        'pagibig_mid' => false,
                        'bir_tin' => false,
                        'psa_birth_cert' => false,
                    ],
                    'medicalReferral' => $applicant->medical_referral ?? null,
                    'statutoryNumbers' => $applicant->statutory_numbers ?? [
                        'sss' => '',
                        'philhealth' => '',
                        'pagibig' => '',
                        'tin' => '',
                    ],
                    'employmentContract' => $applicant->employment_contract ?? null,
                    'orientationModules' => $applicant->orientation_modules ?? [
                        'module1' => false,
                        'module2' => false,
                        'module3' => false,
                        'module4' => false,
                        'module5' => false,
                    ],
                    'atmEndorsement' => $applicant->atm_endorsement ?? null,
                    'deploymentDetails' => $applicant->deployment_details ?? null,
                    'ppeIssuance' => $applicant->ppe_issuance ?? [
                        'uniformShirt' => false,
                        'shirtSize' => 'L',
                        'safetyShoes' => false,
                        'shoeSize' => '42',
                        'safetyVest' => false,
                        'idBadge' => false,
                        'whistleKit' => false,
                    ],
                ];
            });

        return response()->json($applicants);
    }

    public function updateRecruitmentStage(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'recruitment_stage' => 'nullable|string|in:pooling,area_manager,client_interview,hr_requirements,contract_signing,for_deployment,re_pooling',
            'status' => 'nullable|string|in:active,inactive,on_hold,hired,rejected,withdrawn,blacklisted',
            'screening_checklist' => 'nullable|array',
            'document_status' => 'nullable|array',
            'recruiter_rating' => 'nullable|integer|min:0|max:5',
            'assigned_manager' => 'nullable|string|max:255',
            'interview_platform' => 'nullable|string|max:255',
            'client_endorsement_status' => 'nullable|string|max:255',
            'pre_employment_checklist' => 'nullable|array',
            'medical_referral' => 'nullable|array',
            'statutory_numbers' => 'nullable|array',
            'employment_contract' => 'nullable|array',
            'orientation_modules' => 'nullable|array',
            'atm_endorsement' => 'nullable|array',
            'deployment_details' => 'nullable|array',
            'ppe_issuance' => 'nullable|array',
        ]);

        $cleanId = preg_replace('/^cand-/', '', $id);
        $applicant = Applicant::where('id', is_numeric($cleanId) ? (int)$cleanId : 0)
            ->orWhere('id', is_numeric($id) ? (int)$id : 0)
            ->orWhere('reg_id', $cleanId)
            ->orWhere('reg_id', $id)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", [$cleanId])
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", [$id])
            ->first();
        if (!$applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $updates = [];
        if ($request->has('recruitment_stage')) {
            $updates['recruitment_stage'] = $request->recruitment_stage;
        }
        if ($request->has('status')) {
            $updates['status'] = $request->status;
        }
        if ($request->has('screening_checklist')) {
            $updates['screening_checklist'] = $request->screening_checklist;
        }
        if ($request->has('document_status')) {
            $updates['document_status'] = $request->document_status;
        }
        if ($request->has('recruiter_rating')) {
            $updates['recruiter_rating'] = $request->recruiter_rating;
        }
        if ($request->has('assigned_manager')) {
            $updates['assigned_manager'] = $request->assigned_manager;
        }
        if ($request->has('interview_platform')) {
            $updates['interview_platform'] = $request->interview_platform;
        }
        if ($request->has('client_endorsement_status')) {
            $updates['client_endorsement_status'] = $request->client_endorsement_status;
        }
        if ($request->has('pre_employment_checklist')) {
            $updates['pre_employment_checklist'] = $request->pre_employment_checklist;
        }
        if ($request->has('medical_referral')) {
            $updates['medical_referral'] = $request->medical_referral;
        }
        if ($request->has('statutory_numbers')) {
            $updates['statutory_numbers'] = $request->statutory_numbers;
        }
        if ($request->has('employment_contract')) {
            $updates['employment_contract'] = $request->employment_contract;
        }
        if ($request->has('orientation_modules')) {
            $updates['orientation_modules'] = $request->orientation_modules;
        }
        if ($request->has('atm_endorsement')) {
            $updates['atm_endorsement'] = $request->atm_endorsement;
        }
        if ($request->has('deployment_details')) {
            $updates['deployment_details'] = $request->deployment_details;
        }
        if ($request->has('ppe_issuance')) {
            $updates['ppe_issuance'] = $request->ppe_issuance;
        }

        if (!empty($updates)) {
            $applicant->update($updates);
        }

        if ($request->filled('recruitment_stage')) {
            $this->logHistory($applicant, "Recruitment stage updated to: {$request->recruitment_stage}");
        }

        return response()->json(['ok' => true]);
    }

    public function updateRecruitmentScreening(string $id, Request $request): JsonResponse
    {
        $cleanId = preg_replace('/^cand-/', '', $id);
        $applicant = Applicant::where('id', is_numeric($cleanId) ? (int)$cleanId : 0)
            ->orWhere('id', is_numeric($id) ? (int)$id : 0)
            ->orWhere('reg_id', $cleanId)
            ->orWhere('reg_id', $id)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", [$cleanId])
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", [$id])
            ->first();
        if (!$applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $updates = [];
        if ($request->has('pre_employment_checklist')) {
            $updates['pre_employment_checklist'] = $request->pre_employment_checklist;
        } elseif ($request->has('preEmploymentChecklist')) {
            $updates['pre_employment_checklist'] = $request->preEmploymentChecklist;
        }
        if ($request->has('medical_referral')) {
            $updates['medical_referral'] = $request->medical_referral;
        } elseif ($request->has('medicalReferral')) {
            $updates['medical_referral'] = $request->medicalReferral;
        }
        if ($request->has('statutory_numbers')) {
            $updates['statutory_numbers'] = $request->statutory_numbers;
        } elseif ($request->has('statutoryNumbers')) {
            $updates['statutory_numbers'] = $request->statutoryNumbers;
        }
        if ($request->has('employment_contract')) {
            $updates['employment_contract'] = $request->employment_contract;
        } elseif ($request->has('employmentContract')) {
            $updates['employment_contract'] = $request->employmentContract;
        }
        if ($request->has('orientation_modules')) {
            $updates['orientation_modules'] = $request->orientation_modules;
        } elseif ($request->has('orientationModules')) {
            $updates['orientation_modules'] = $request->orientationModules;
        }
        if ($request->has('atm_endorsement')) {
            $updates['atm_endorsement'] = $request->atm_endorsement;
        } elseif ($request->has('atmEndorsement')) {
            $updates['atm_endorsement'] = $request->atmEndorsement;
        }
        if ($request->has('deployment_details')) {
            $updates['deployment_details'] = $request->deployment_details;
        } elseif ($request->has('deploymentDetails')) {
            $updates['deployment_details'] = $request->deploymentDetails;
        }
        if ($request->has('ppe_issuance')) {
            $updates['ppe_issuance'] = $request->ppe_issuance;
        } elseif ($request->has('ppeIssuance')) {
            $updates['ppe_issuance'] = $request->ppeIssuance;
        }
        if ($request->has('screening_checklist')) {
            $updates['screening_checklist'] = $request->screening_checklist;
        } elseif ($request->has('checklist')) {
            $updates['screening_checklist'] = $request->checklist;
        }
        if ($request->has('document_status')) {
            $updates['document_status'] = $request->document_status;
        } elseif ($request->has('docStatus')) {
            $updates['document_status'] = $request->docStatus;
        }
        if ($request->has('recruiter_rating')) {
            $updates['recruiter_rating'] = $request->recruiter_rating;
        } elseif ($request->has('recruiterRating')) {
            $updates['recruiter_rating'] = $request->recruiterRating;
        }
        if ($request->has('assigned_manager')) {
            $updates['assigned_manager'] = $request->assigned_manager;
        } elseif ($request->has('assignedManager')) {
            $updates['assigned_manager'] = $request->assignedManager;
        }
        if ($request->has('interview_platform')) {
            $updates['interview_platform'] = $request->interview_platform;
        } elseif ($request->has('interviewPlatform')) {
            $updates['interview_platform'] = $request->interviewPlatform;
        }
        if ($request->has('client_endorsement_status')) {
            $updates['client_endorsement_status'] = $request->client_endorsement_status;
        }

        if (!empty($updates)) {
            $applicant->update($updates);
        }

        return response()->json(['ok' => true]);
    }

    public function updateClientEndorsementStatus(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'client_endorsement_status' => 'required|string',
            'interview_schedule' => 'nullable|array',
        ]);

        $cleanId = preg_replace('/^cand-/', '', $id);
        $applicant = Applicant::where('id', is_numeric($cleanId) ? (int)$cleanId : 0)
            ->orWhere('id', is_numeric($id) ? (int)$id : 0)
            ->orWhere('reg_id', $cleanId)
            ->orWhere('reg_id', $id)
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", [$cleanId])
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) ILIKE ?", [$id])
            ->first();
        if (!$applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $status = $request->client_endorsement_status;
        $updates = ['client_endorsement_status' => $status];

        if ($request->has('interview_schedule')) {
            $updates['interview_schedule'] = $request->interview_schedule;
        }

        if ($status === 'Passed Interview') {
            $updates['recruitment_stage'] = 'hr_requirements';
            $applicant->update($updates);
            $this->logHistory($applicant, 'Candidate PASSED Client Final Interview. Pipeline stage advanced to HR Requirements & Contract Signing.');
        } elseif ($status === 'Declined') {
            $updates['recruitment_stage'] = 're_pooling';
            $applicant->update($updates);
            $this->logHistory($applicant, 'Candidate DECLINED by Client in Client Portal. Automatically returned to Re-Pooling for line up to other client job orders.');
        } elseif ($status === 'Accepted for Interview' && $request->filled('interview_schedule')) {
            $sched = $request->interview_schedule;
            $dt = ($sched['date'] ?? '') . ' at ' . ($sched['time'] ?? '');
            $mode = $sched['mode'] ?? 'Zoom Video Meeting';
            $applicant->update($updates);
            $this->logHistory($applicant, "Client accepted candidate. Final interview scheduled on {$dt} via {$mode}.");
        } else {
            $applicant->update($updates);
            $this->logHistory($applicant, "Client endorsement status updated to: {$status}");
        }

        return response()->json(['ok' => true]);
    }
}
