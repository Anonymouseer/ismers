<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Applicant;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecruitmentController extends Controller
{
    // ── Scoring constants ────────────────────────────────────────────────────

    private const JOB_KEYWORDS = [
        'jo1'      => ['warehouse', 'associate', 'logistics', 'pallet', 'stock', 'picking', 'packing', 'inventory'],
        'jo2'      => ['forklift', 'operator', 'warehouse', 'logistics', 'pallet', 'stacking', 'material handling', 'wms', 'inventory'],
        'jo3'      => ['inventory', 'clerk', 'stock', 'wms', 'cycle count', 'sorting', 'packing', 'pallet', 'barcode', 'scanning', 'counting', 'tallying', 'warehouse', 'logistics'],
        'jo4'      => ['driver', 'delivery', 'license', 'courier', 'transport', 'logistics', 'warehouse'],
        'jo5'      => ['customer service', 'csr', 'crm', 'english proficiency', 'call center', 'customer support', 'communication', 'bpo', 'voice'],
        'jo6'      => ['technical support', 'troubleshooting', 'ticketing', 'networking', 'bpo', 'it support'],
        'jo7'      => ['sales', 'outbound', 'inbound', 'crm', 'cold calling', 'leads', 'bpo', 'sdr'],
        'jo8'      => ['team leader', 'supervisor', 'bpo', 'coaching', 'kpi', 'csat', 'leadership'],
        'jo9'      => ['machine operation', 'quality inspection', 'safety compliance', 'production', 'troubleshooting', 'manufacturing', 'assembly'],
        'jo10'     => ['quality control', 'inspection', 'qc', 'calipers', 'manufacturing', 'specifications', 'qa'],
        'jo11'     => ['supervisor', 'production line', 'kpi', 'line balancing', 'manufacturing', 'leadership'],
        'jo12'     => ['packaging', 'sorting', 'labeling', 'finished goods', 'packing', 'manufacturing'],
        'jo13'     => ['admin', 'assistant', 'clerical', 'data entry', 'scheduling', 'office', 'retail'],
        'jo14'     => ['sales', 'associate', 'retail', 'customer facing', 'stocking', 'upselling'],
        'jo15'     => ['cashier', 'pos', 'cash handling', 'retail', 'receipt issuance', 'customer service'],
        'jo16'     => ['merchandiser', 'visual', 'display', 'retail layout', 'branding', 'retail'],
        'jo17'     => ['front desk', 'guest relations', 'booking systems', 'hospitality', 'customer service', 'reception', 'visitor log'],
        'jo18'     => ['housekeeping', 'cleaning', 'room turnaround', 'resort', 'hospitality', 'sanitation'],
        'jo19'     => ['f&b', 'server', 'waiter', 'restaurant', 'dining', 'hospitality', 'table service', 'banquet'],
        'jo20'     => ['maintenance', 'technician', 'electrical', 'plumbing', 'repairs', 'facilities'],
        'jo21'     => ['leasing', 'real estate', 'sales', 'viewings', 'property', 'contracts'],
        'jo22'     => ['property administrator', 'tenant records', 'lease renewals', 'admin', 'real estate'],
        'jo23'     => ['front desk', 'reception', 'lobby', 'concierge', 'visitor logs', 'real estate'],
        'jo24'     => ['maintenance coordinator', 'repairs', 'facilities', 'building systems', 'real estate'],
        'jo25'     => ['medical technologist', 'medtech', 'lab testing', 'specimen analysis', 'doh', 'healthcare'],
        'jo26'     => ['radiologic', 'x-ray', 'imaging', 'radtech', 'radiation safety', 'healthcare'],
        'jo27'     => ['patient service', 'registration', 'healthcare front desk', 'appointments', 'hmo'],
        'jo28'     => ['billing', 'hmo', 'insurance claims', 'patient accounts', 'accounting', 'medical records'],
        'jo29'     => ['packing', 'produce', 'grading', 'harvest', 'hygiene', 'export', 'cold chain'],
        'jo30'     => ['qa inspector', 'quality control', 'export-grade', 'agri', 'produce', 'standards'],
        'jo31'     => ['logistics coordinator', 'container bookings', 'freight', 'export documentation', 'shipping'],
        'jo32'     => ['farm supervisor', 'harvest scheduling', 'field crews', 'agriculture', 'supervision'],
        'jo33'     => ['construction', 'laborer', 'material handling', 'masonry', 'site work', 'safety'],
        'jo34'     => ['site engineer', 'autocad', 'civil engineering', 'inspections', 'plans', 'construction'],
        'jo35'     => ['safety officer', 'bosh', 'ppe', 'oshs', 'hazard inspection', 'safety'],
        'jo36'     => ['tower crane', 'crane operator', 'heavy equipment', 'tesda', 'rigging', 'construction'],
        'jo-abc-1' => ['warehouse', 'associate', 'logistics', 'pallet', 'stock', 'picking', 'packing', 'inventory'],
        'jo-abc-2' => ['forklift', 'operator', 'warehouse', 'logistics', 'pallet', 'stacking', 'material handling', 'wms', 'inventory'],
        'jo-abc-3' => ['inventory', 'clerk', 'stock', 'wms', 'cycle count', 'sorting', 'packing', 'pallet', 'barcode', 'scanning', 'counting', 'tallying', 'warehouse', 'logistics'],
        'jo-abc-4' => ['driver', 'delivery', 'license', 'courier', 'transport', 'logistics', 'warehouse'],
    ];

    // ── Private helpers ──────────────────────────────────────────────────────

    private static ?\Illuminate\Support\Collection $cachedJobs = null;

    private function getCachedJobOrders(): \Illuminate\Support\Collection
    {
        if (self::$cachedJobs === null) {
            self::$cachedJobs = JobOrder::all();
        }
        return self::$cachedJobs;
    }

    /**
     * Resolve a JobOrder from a flexible identifier (ref, numeric id, or title).
     */
    private function resolveJobOrder(?string $targetId): ?JobOrder
    {
        if (! $targetId) {
            return null;
        }

        $cleanTarget = strtolower(trim($targetId));
        $all = $this->getCachedJobOrders();

        // 1. Explicit ABC Logistics legacy / client portal targets
        if ($cleanTarget === 'jo-abc-1') return $all->first(fn ($j) => strtolower($j->ref ?? '') === 'jo-001');
        if ($cleanTarget === 'jo-abc-2') return $all->first(fn ($j) => strtolower($j->ref ?? '') === 'jo-002');
        if ($cleanTarget === 'jo-abc-3') return $all->first(fn ($j) => strtolower($j->ref ?? '') === 'jo-003');
        if ($cleanTarget === 'jo-abc-4') return $all->first(fn ($j) => strtolower($j->ref ?? '') === 'jo-004');

        // 2. Direct match on ref or id
        $job = $all->first(fn ($j) => strtolower($j->ref ?? '') === $cleanTarget || strtolower($j->id ?? '') === $cleanTarget);
        if ($job) {
            return $job;
        }

        // 3. Numeric extraction: e.g. 'jo3' -> 3, 'JO-003' -> 3, 'jo-abc-3' -> 3
        if (preg_match('/(\d+)/', $targetId, $m)) {
            $num       = (int) $m[1];
            $paddedRef = 'jo-' . str_pad((string) $num, 3, '0', STR_PAD_LEFT);
            $rawId     = 'jo' . $num;
            $job       = $all->first(fn ($j) => strtolower($j->ref ?? '') === $paddedRef || strtolower($j->id ?? '') === $rawId);
            if ($job) {
                return $job;
            }
        }

        return $all->first(fn ($j) => strtolower(trim($j->title ?? '')) === $cleanTarget);
    }

    /**
     * Compute unified AI match score using progressive weighted matching
     * (skills up to 70 pts, keywords up to 15 pts, category bonus up to 10 pts, work history bonus 8 pts).
     */
    public function computeAiScore(Applicant $applicant, ?JobOrder $job = null): int
    {
        $targetId = $applicant->target_job_id;
        if (! $targetId && ! $job) {
            return 0;
        }

        if (! $job) {
            $job = $this->resolveJobOrder($targetId);
        }
        if (! $job) {
            return 0;
        }

        $candSkills = $applicant->skills->pluck('name')->map(fn ($s) => strtolower(trim($s)))->filter()->values()->toArray();
        $workHistory = $applicant->workHistory;
        $workHistoryText = strtolower(trim($workHistory->map(fn ($w) => "{$w->role} {$w->company}")->implode(' ')));
        $summaryText = strtolower(trim($applicant->experience_summary ?? ''));

        if (empty($candSkills) && empty($workHistoryText) && empty($summaryText)) {
            return 0;
        }

        $candCat = strtolower(trim($applicant->category ?? ''));
        $jobCat = strtolower(trim($job->category ?? ''));
        $jobTitle = strtolower(trim($job->title ?? ''));

        $words = preg_split('/[\s·,\-\/()]+/', $jobTitle, -1, PREG_SPLIT_NO_EMPTY);
        $excluded = ['and', 'for', 'the', 'with', 'associate', 'officer', 'staff', 'operator', 'attendant', 'crew'];
        $rawKeywords = array_filter($words, fn ($w) => strlen($w) > 2 && ! in_array($w, $excluded));

        if (is_array($job->tags)) {
            foreach ($job->tags as $t) {
                $rawKeywords[] = strtolower(trim($t));
            }
        }

        $cleanTargetId = strtolower(trim($targetId ?? ''));
        $cleanJobRef   = strtolower(trim($job->ref ?? ''));
        $cleanJobId    = strtolower(trim((string)($job->id ?? '')));

        $canonicalKey = null;
        if ($cleanTargetId === 'jo-abc-1' || $cleanJobRef === 'jo-001') $canonicalKey = 'jo1';
        elseif ($cleanTargetId === 'jo-abc-2' || $cleanJobRef === 'jo-002') $canonicalKey = 'jo2';
        elseif ($cleanTargetId === 'jo-abc-3' || $cleanJobRef === 'jo-003') $canonicalKey = 'jo3';
        elseif ($cleanTargetId === 'jo-abc-4' || $cleanJobRef === 'jo-004') $canonicalKey = 'jo4';
        elseif (preg_match('/(\d+)/', $cleanTargetId, $m)) $canonicalKey = 'jo' . (int)$m[1];
        elseif (preg_match('/(\d+)/', $cleanJobRef, $m))   $canonicalKey = 'jo' . (int)$m[1];
        elseif (preg_match('/(\d+)/', $cleanJobId, $m))    $canonicalKey = 'jo' . (int)$m[1];

        $matchedKeywords = [];
        if ($canonicalKey && isset(self::JOB_KEYWORDS[$canonicalKey])) {
            $matchedKeywords = self::JOB_KEYWORDS[$canonicalKey];
        } elseif (isset(self::JOB_KEYWORDS[$cleanTargetId])) {
            $matchedKeywords = self::JOB_KEYWORDS[$cleanTargetId];
        } elseif (isset(self::JOB_KEYWORDS[$cleanJobId])) {
            $matchedKeywords = self::JOB_KEYWORDS[$cleanJobId];
        }

        foreach ($matchedKeywords as $k) {
            $rawKeywords[] = strtolower(trim($k));
        }

        $filler = ['high', 'school', 'graduate', 'least', 'year', 'years', 'month', 'months', 'willing', 'work', 'able', 'plus', 'preferred', 'good', 'with', 'must', 'have', 'experience', 'relocate', 'provided', 'housing'];
        $coreKeywords = array_values(array_unique(array_filter($rawKeywords, fn ($k) => strlen($k) > 2 && ! in_array($k, $filler))));

        $allCandidateText = trim(implode(' ', array_merge($candSkills, [$workHistoryText, $summaryText])));

        $matchingSkillCount = 0;
        foreach ($candSkills as $skill) {
            $directHit = false;
            foreach ($coreKeywords as $kw) {
                if (str_contains($skill, $kw) || str_contains($kw, $skill)) {
                    $directHit = true;
                    break;
                }
            }
            $catWords = preg_split('/[\s&\/()]+/', $jobCat, -1, PREG_SPLIT_NO_EMPTY);
            $catHit = false;
            foreach ($catWords as $cw) {
                if (strlen($cw) > 2 && (str_contains($skill, $cw) || str_contains($cw, $skill))) {
                    $catHit = true;
                    break;
                }
            }
            $titleWords = preg_split('/[\s&\/()]+/', $jobTitle, -1, PREG_SPLIT_NO_EMPTY);
            $titleHit = false;
            foreach ($titleWords as $tw) {
                if (strlen($tw) > 2 && (str_contains($skill, $tw) || str_contains($tw, $skill))) {
                    $titleHit = true;
                    break;
                }
            }
            if ($directHit || $titleHit || $catHit) {
                $matchingSkillCount++;
            }
        }

        $keywordHits = 0;
        foreach ($coreKeywords as $kw) {
            if (str_contains($allCandidateText, $kw)) {
                $keywordHits++;
            }
        }

        if ($matchingSkillCount === 0 && $keywordHits === 0) {
            return 0;
        }

        $skillsScore = min($matchingSkillCount * 18, 70);
        $keywordScore = count($coreKeywords) > 0 ? (int) round(($keywordHits / count($coreKeywords)) * 15) : 0;

        $categoryBonus = 0;
        if (! empty($candCat) && ! empty($jobCat) && $matchingSkillCount > 0) {
            if ($candCat === $jobCat) {
                $categoryBonus = 10;
            } elseif (
                (str_contains($candCat, 'logistics') || str_contains($candCat, 'warehousing')) &&
                (str_contains($jobCat, 'logistics') || str_contains($jobCat, 'warehousing'))
            ) {
                $categoryBonus = 8;
            } elseif (
                (str_contains($candCat, 'bpo') || str_contains($candCat, 'customer')) &&
                (str_contains($jobCat, 'bpo') || str_contains($jobCat, 'customer'))
            ) {
                $categoryBonus = 8;
            } elseif (
                str_contains($candCat, 'manufacturing') && str_contains($jobCat, 'manufacturing')
            ) {
                $categoryBonus = 8;
            } elseif (
                str_contains($candCat, 'retail') && str_contains($jobCat, 'retail')
            ) {
                $categoryBonus = 8;
            } elseif (
                (str_contains($candCat, 'hospitality') || str_contains($candCat, 'food')) &&
                (str_contains($jobCat, 'hospitality') || str_contains($jobCat, 'food'))
            ) {
                $categoryBonus = 8;
            }
        }

        $historyBonus = 0;
        if (! empty($workHistoryText)) {
            foreach ($coreKeywords as $kw) {
                if (str_contains($workHistoryText, $kw)) {
                    $historyBonus = 8;
                    break;
                }
            }
        }

        $total = (int) round($skillsScore + $keywordScore + $categoryBonus + $historyBonus);

        return min(max($total, 0), 98);
    }

    /**
     * Resolve an applicant from a recruitment context identifier (numeric id,
     * REG-### ref, or full name).
     */
    private function findRecruitmentApplicant(string $id): ?Applicant
    {
        $cleanId = preg_replace('/^cand-/', '', trim($id));
        $decoded = urldecode($cleanId);

        if (is_numeric($cleanId)) {
            $app = Applicant::find((int) $cleanId);
            if ($app) {
                return $app;
            }
        }

        $app = Applicant::where('reg_id', $cleanId)
            ->orWhere('reg_id', $decoded)
            ->orWhere('reg_id', $id)
            ->first();

        if ($app) {
            return $app;
        }

        $target = strtolower(trim($decoded));

        return Applicant::get()->first(function ($a) use ($target) {
            $name = strtolower(trim("{$a->first_name} {$a->last_name}"));

            return $name === $target || strtolower(trim($a->reg_id ?? '')) === $target;
        });
    }

    /**
     * Append an audit history entry to an applicant record.
     */
    private function logHistory(Applicant $applicant, string $text): void
    {
        $applicant->history()->create([
            'date' => now()->format('M d, Y'),
            'text' => $text,
        ]);
    }

    // ── Public endpoints ─────────────────────────────────────────────────────

    /**
     * GET /api/v1/recruitment/applications
     *
     * Returns all applicants currently in the recruitment pipeline with their
     * AI match scores and pre-computed scoring breakdowns.
     */
    public function index(): JsonResponse
    {
        $applicants = Applicant::where('sent_to_recruitment', true)
            ->with(['skills', 'workHistory', 'education', 'documents', 'references', 'history'])
            ->get()
            ->map(function ($applicant) {
                $fullName = trim("{$applicant->first_name} {$applicant->last_name}");
                $job      = $this->resolveJobOrder($applicant->target_job_id);
                $score    = $this->computeAiScore($applicant, $job);

                $skillsSub  = $score > 0 ? min(98, max(40, (int) round($score * 1.02))) : min(95, max(30, $applicant->skills->count() * 20));
                $expSub     = $score > 0 ? min(98, max(35, (int) round($score * 0.96))) : min(95, max(30, $applicant->workHistory->count() * 25));
                $screenSub  = $score > 0 ? min(98, max(45, (int) round($score * 0.98))) : min(95, max(30, $applicant->education->count() * 25));
                $availSub   = $score > 0 ? min(98, max(50, (int) round($score * 0.94))) : min(95, max(30, $applicant->documents->count() * 20));

                return [
                    'id'                    => (string) $applicant->id,
                    'name'                  => $fullName,
                    'jobId'                 => $job ? ($job->ref ?: $applicant->target_job_id) : ($applicant->target_job_id ?? 'jo1'),
                    'targetJobId'           => $applicant->target_job_id,
                    'jobTitle'              => $job?->title,
                    'client'                => $job?->client,
                    'category'              => $applicant->category,
                    'status'                => $applicant->recruitment_stage ?? 'pooling',
                    'score'                 => $score,
                    'applied'               => $applicant->created_at->format('M d, Y'),
                    'experience'            => $applicant->experience_summary ?: '—',
                    'experienceSummary'     => $applicant->experience_summary ?? '',
                    'location'              => $applicant->city_address ?? '—',
                    'phone'                 => $applicant->contact_number ?? '—',
                    'email'                 => $applicant->email_address ?? '—',
                    'fromRegistration'      => true,
                    'regId'                 => $applicant->reg_id,
                    'skills'                => $applicant->skills->map(fn ($s) => $s->name)->toArray(),
                    'workHistory'           => $applicant->workHistory->map(fn ($w) => [
                        'role'     => $w->role,
                        'company'  => $w->company,
                        'duration' => $w->duration ?? '2022 – Present',
                    ])->toArray(),
                    'education'             => $applicant->education->map(fn ($e) => [
                        'level'  => $e->level ?? 'College / Vocational',
                        'school' => $e->school,
                        'degree' => $e->degree ?? 'Technical Course',
                        'years'  => trim(($e->start_year ?? '') . ' – ' . ($e->end_year ?? '')),
                    ])->toArray(),
                    'documents'             => $applicant->documents->map(fn ($d) => [
                        'name'       => $d->type ?: 'Document',
                        'fileName'   => $d->name ?: 'verified_doc.pdf',
                        'uploadedAt' => $d->created_at ? $d->created_at->format('M d, Y') : 'Aug 14, 2026',
                        'verified'   => true,
                    ])->toArray(),
                    'breakdown'             => [
                        'skills'       => $skillsSub,
                        'experience'   => $expSub,
                        'screening'    => $screenSub,
                        'availability' => $availSub,
                    ],
                    'interview'             => $applicant->interview_schedule,
                    'notes'                 => $applicant->history->map(fn ($h) => [
                        'text' => $h->text,
                        'meta' => 'System · ' . $h->created_at->format('M d, Y'),
                    ])->toArray(),
                    'checklist'             => $applicant->screening_checklist ?? [
                        'requirements' => false,
                        'identity'     => false,
                        'history'      => false,
                        'reference'    => false,
                    ],
                    'docStatus'             => $applicant->document_status ?? [
                        'resume'      => false,
                        'certificate' => false,
                        'portfolio'   => false,
                    ],
                    'recruiterRating'       => $applicant->recruiter_rating ?? 0,
                    'assignedManager'       => $applicant->assigned_manager ?? 'Area Manager 1 (North NCR)',
                    'interviewPlatform'     => $applicant->interview_platform ?? 'Zoom Meeting',
                    'clientEndorsementStatus' => $applicant->client_endorsement_status ?? 'Pending Review',
                    'preEmploymentChecklist' => $applicant->pre_employment_checklist ?? [
                        'medical_exam'   => false,
                        'nbi_clearance'  => false,
                        'sss_document'   => false,
                        'philhealth_mdr' => false,
                        'pagibig_mid'    => false,
                        'bir_tin'        => false,
                        'psa_birth_cert' => false,
                    ],
                    'medicalReferral'       => $applicant->medical_referral ?? null,
                    'statutoryNumbers'      => $applicant->statutory_numbers ?? [
                        'sss'        => '',
                        'philhealth' => '',
                        'pagibig'    => '',
                        'tin'        => '',
                    ],
                    'employmentContract'    => $applicant->employment_contract ?? null,
                    'orientationModules'    => $applicant->orientation_modules ?? [
                        'module1' => false,
                        'module2' => false,
                        'module3' => false,
                        'module4' => false,
                        'module5' => false,
                    ],
                    'atmEndorsement'        => $applicant->atm_endorsement ?? null,
                    'deploymentDetails'     => $applicant->deployment_details ?? null,
                    'ppeIssuance'           => $applicant->ppe_issuance ?? [
                        'uniformShirt' => false,
                        'shirtSize'    => 'L',
                        'safetyShoes'  => false,
                        'shoeSize'     => '42',
                        'safetyVest'   => false,
                        'idBadge'      => false,
                        'whistleKit'   => false,
                    ],
                ];
            });

        return response()->json($applicants);
    }

    /**
     * POST /api/v1/recruitment/{regId}/enroll
     *
     * Transitions a profiled applicant into the recruitment pipeline (Pooling).
     */
    public function enroll(string $regId): JsonResponse
    {
        $applicant = $this->findRecruitmentApplicant($regId);
        if (! $applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $applicant->update([
            'sent_to_recruitment'      => true,
            'recruitment_stage'        => 'pooling',
            'client_endorsement_status' => 'Pending Review',
            'recruiter_rating'         => 0,
            'screening_checklist'      => [
                'requirements' => false,
                'identity'     => false,
                'history'      => false,
                'reference'    => false,
            ],
            'document_status'          => [
                'resume'      => false,
                'certificate' => false,
                'portfolio'   => false,
            ],
            'interview_schedule'       => null,
            'pre_employment_checklist' => [
                'medical_exam'   => false,
                'nbi_clearance'  => false,
                'sss_document'   => false,
                'philhealth_mdr' => false,
                'pagibig_mid'    => false,
                'bir_tin'        => false,
                'psa_birth_cert' => false,
            ],
            'medical_referral'         => null,
            'statutory_numbers'        => null,
            'employment_contract'      => null,
            'orientation_modules'      => null,
            'atm_endorsement'          => null,
            'deployment_details'       => null,
            'ppe_issuance'             => null,
        ]);

        $this->logHistory($applicant, 'Sent to Recruitment & Selection (Initialized in Pooling)');

        ActivityLog::record(
            action: "Enrolled applicant {$applicant->first_name} {$applicant->last_name} ({$applicant->reg_id}) into Recruitment pipeline",
            module: 'Recruitment & Selection',
            details: ['reg_id' => $applicant->reg_id, 'target_job_id' => $applicant->target_job_id]
        );

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/v1/recruitment/{regId}/return
     *
     * Returns an applicant from the recruitment pipeline back to Applicant Profiling.
     */
    public function returnToProfiling(string $regId): JsonResponse
    {
        $applicant = $this->findRecruitmentApplicant($regId);
        if (! $applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $applicant->update([
            'sent_to_recruitment'      => false,
            'recruitment_stage'        => null,
            'stage'                    => $applicant->stage === 'sent' ? 'profiled' : $applicant->stage,
            'client_endorsement_status' => 'Pending Review',
            'recruiter_rating'         => 0,
            'screening_checklist'      => [
                'requirements' => false,
                'identity'     => false,
                'history'      => false,
                'reference'    => false,
            ],
            'document_status'          => [
                'resume'      => false,
                'certificate' => false,
                'portfolio'   => false,
            ],
            'interview_schedule'       => null,
            'pre_employment_checklist' => [
                'medical_exam'   => false,
                'nbi_clearance'  => false,
                'sss_document'   => false,
                'philhealth_mdr' => false,
                'pagibig_mid'    => false,
                'bir_tin'        => false,
                'psa_birth_cert' => false,
            ],
            'medical_referral'         => null,
            'statutory_numbers'        => null,
            'employment_contract'      => null,
            'orientation_modules'      => null,
            'atm_endorsement'          => null,
            'deployment_details'       => null,
            'ppe_issuance'             => null,
        ]);

        $this->logHistory($applicant, 'Returned to Applicant Profiling');

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/v1/recruitment/bulk-return
     *
     * Returns ALL applicants in the recruitment pipeline back to Applicant Profiling.
     */
    public function bulkReturn(): JsonResponse
    {
        $applicants = Applicant::where('sent_to_recruitment', true)->get();

        foreach ($applicants as $applicant) {
            $applicant->update([
                'sent_to_recruitment'      => false,
                'recruitment_stage'        => null,
                'stage'                    => $applicant->stage === 'sent' ? 'profiled' : $applicant->stage,
                'client_endorsement_status' => 'Pending Review',
                'recruiter_rating'         => 0,
                'screening_checklist'      => [
                    'requirements' => false,
                    'identity'     => false,
                    'history'      => false,
                    'reference'    => false,
                ],
                'document_status'          => [
                    'resume'      => false,
                    'certificate' => false,
                    'portfolio'   => false,
                ],
                'interview_schedule'       => null,
                'pre_employment_checklist' => [
                    'medical_exam'   => false,
                    'nbi_clearance'  => false,
                    'sss_document'   => false,
                    'philhealth_mdr' => false,
                    'pagibig_mid'    => false,
                    'bir_tin'        => false,
                    'psa_birth_cert' => false,
                ],
                'medical_referral'         => null,
                'statutory_numbers'        => null,
                'employment_contract'      => null,
                'orientation_modules'      => null,
                'atm_endorsement'          => null,
                'deployment_details'       => null,
                'ppe_issuance'             => null,
            ]);
            $this->logHistory($applicant, 'Returned to Applicant Profiling');
        }

        return response()->json([
            'ok'      => true,
            'count'   => $applicants->count(),
            'message' => "All {$applicants->count()} applicants returned to Profiling.",
        ]);
    }

    /**
     * PATCH /api/v1/recruitment/{id}/stage
     *
     * Updates the recruitment pipeline stage (and optionally related fields) for
     * a single candidate.
     */
    public function updateStage(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'recruitment_stage'        => 'nullable|string|in:pooling,area_manager,client_interview,hr_requirements,contract_signing,for_deployment,re_pooling,hired,deployed',
            'status'                   => 'nullable|string|in:active,inactive,on_hold,hired,deployed,rejected,withdrawn,blacklisted',
            'screening_checklist'      => 'nullable|array',
            'document_status'          => 'nullable|array',
            'recruiter_rating'         => 'nullable|integer|min:0|max:5',
            'assigned_manager'         => 'nullable|string|max:255',
            'interview_platform'       => 'nullable|string|max:255',
            'client_endorsement_status' => 'nullable|string|max:255',
            'pre_employment_checklist' => 'nullable|array',
            'medical_referral'         => 'nullable|array',
            'statutory_numbers'        => 'nullable|array',
            'employment_contract'      => 'nullable|array',
            'orientation_modules'      => 'nullable|array',
            'atm_endorsement'          => 'nullable|array',
            'deployment_details'       => 'nullable|array',
            'ppe_issuance'             => 'nullable|array',
        ]);

        $applicant = $this->findRecruitmentApplicant($id);
        if (! $applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $updates = [];

        if ($request->has('recruitment_stage')) {
            $updates['recruitment_stage'] = $request->recruitment_stage;
            if ($request->recruitment_stage === 'client_interview' && ! $request->has('client_endorsement_status')) {
                $updates['client_endorsement_status'] = 'Pending Review';
            }
        }

        foreach ([
            'status', 'screening_checklist', 'document_status', 'recruiter_rating',
            'assigned_manager', 'interview_platform', 'client_endorsement_status',
            'pre_employment_checklist', 'medical_referral', 'statutory_numbers',
            'employment_contract', 'orientation_modules', 'atm_endorsement',
            'deployment_details', 'ppe_issuance',
        ] as $field) {
            if ($request->has($field)) {
                $updates[$field] = $request->input($field);
            }
        }

        if (! empty($updates)) {
            $applicant->update($updates);
        }

        if ($request->filled('recruitment_stage')) {
            $this->logHistory($applicant, "Recruitment stage updated to: {$request->recruitment_stage}");
        }

        return response()->json(['ok' => true]);
    }

    /**
     * PATCH /api/v1/recruitment/{id}/screening
     *
     * Updates pre-employment and screening checklist fields. Accepts both
     * snake_case and camelCase field names from the frontend.
     */
    public function updateScreening(string $id, Request $request): JsonResponse
    {
        $applicant = $this->findRecruitmentApplicant($id);
        if (! $applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        // Each entry: [snake_case key, camelCase alias]
        $fieldMap = [
            ['pre_employment_checklist', 'preEmploymentChecklist'],
            ['medical_referral',         'medicalReferral'],
            ['statutory_numbers',        'statutoryNumbers'],
            ['employment_contract',      'employmentContract'],
            ['orientation_modules',      'orientationModules'],
            ['atm_endorsement',          'atmEndorsement'],
            ['deployment_details',       'deploymentDetails'],
            ['ppe_issuance',             'ppeIssuance'],
            ['screening_checklist',      'checklist'],
            ['document_status',          'docStatus'],
            ['recruiter_rating',         'recruiterRating'],
            ['assigned_manager',         'assignedManager'],
            ['interview_platform',       'interviewPlatform'],
            ['client_endorsement_status', 'clientEndorsementStatus'],
            ['interview_schedule',       'interviewSchedule'],
        ];

        $updates = [];
        foreach ($fieldMap as [$snake, $camel]) {
            if ($request->has($snake)) {
                $updates[$snake] = $request->input($snake);
            } elseif ($request->has($camel)) {
                $updates[$snake] = $request->input($camel);
            }
        }

        if (! empty($updates)) {
            $applicant->update($updates);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * PATCH /api/v1/recruitment/{id}/endorsement-status
     *
     * Updates the client endorsement status and handles automatic pipeline
     * stage transitions (Passed Interview → HR Requirements, Declined → Re-Pooling).
     */
    public function updateEndorsementStatus(string $id, Request $request): JsonResponse
    {
        $request->validate([
            'client_endorsement_status' => 'required|string',
            'interview_schedule'        => 'nullable|array',
        ]);

        $applicant = $this->findRecruitmentApplicant($id);
        if (! $applicant) {
            return response()->json(['ok' => false, 'message' => 'Applicant not found.'], 404);
        }

        $status  = $request->client_endorsement_status;
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
            $dt    = ($sched['date'] ?? '') . ' at ' . ($sched['time'] ?? '');
            $mode  = $sched['mode'] ?? 'Zoom Video Meeting';
            $applicant->update($updates);
            $this->logHistory($applicant, "Client accepted candidate. Final interview scheduled on {$dt} via {$mode}.");
        } else {
            $applicant->update($updates);
            $this->logHistory($applicant, "Client endorsement status updated to: {$status}");
        }

        return response()->json(['ok' => true]);
    }
}
