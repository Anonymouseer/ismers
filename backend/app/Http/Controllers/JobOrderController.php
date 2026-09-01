<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobOrderController extends Controller
{
    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Generate the next sequential JO-xxx reference number.
     */
    private function nextRef(): string
    {
        $last = JobOrder::whereNotNull('ref')
            ->orderByRaw("CAST(REPLACE(ref, 'JO-', '') AS INTEGER) DESC")
            ->value('ref');

        if (! $last) {
            return 'JO-001';
        }

        $num = (int) str_replace('JO-', '', $last);
        return 'JO-' . str_pad($num + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Generate a unique string ID (jo1, jo2, …) for the primary key.
     */
    private function nextId(): string
    {
        $count = JobOrder::count();
        return 'jo' . ($count + 1);
    }

    /**
     * Shape a JobOrder model row into the JSON structure the Dispatch Board
     * and Client Portal both expect.
     */
    private function format(JobOrder $j): array
    {
        $requirements = $j->requirements;
        if (is_string($requirements)) {
            $decoded = json_decode($requirements, true);
            $requirements = is_array($decoded) ? $decoded : array_values(array_filter(array_map('trim', explode("\n", $requirements))));
        }

        $tags = $j->tags;
        if (is_string($tags)) {
            $decoded = json_decode($tags, true);
            $tags = is_array($decoded) ? $decoded : array_values(array_filter(array_map('trim', explode(',', $tags))));
        }

        $applicants = $j->applicants;
        if (is_string($applicants)) {
            $decoded = json_decode($applicants, true);
            $applicants = is_array($decoded) ? $decoded : [];
        }

        return [
            'ref'             => $j->ref ?: $j->dep_ref,
            'id'              => $j->id,
            'client'          => $j->client,
            'client_account_id' => $j->client_account_id,
            'title'           => $j->title,
            'location'        => $j->location ?? '',
            'type'            => $j->type ?? 'Full-time · Contractual',
            'rate'            => $j->rate ?? '₱610/day',
            'deadline'        => $j->deadline ?? '',
            'filled'          => (int) $j->filled,
            'total'           => (int) ($j->total ?: 1),
            'status'          => $j->status ?? 'open',
            'stage'           => $j->stage ?? 'created',
            'priority'        => $j->priority ?? 'normal',
            'description'     => $j->description ?? '',
            'requirements'    => is_array($requirements) ? $requirements : [],
            'tags'            => is_array($tags) ? $tags : [],
            'source'          => $j->source ?? 'internal',
            'recruiter'       => 'Karla Reyes',
            'activityLog'     => [
                [
                    'date' => $j->created_at
                        ? $j->created_at->format('M d, Y')
                        : now()->format('M d, Y'),
                    'text' => $j->source === 'client_portal'
                        ? 'Job order submitted via Client Portal.'
                        : 'Job order created.',
                    'type' => 'system',
                ],
            ],
            'applicants'      => is_array($applicants) ? $applicants : [],
            'createdAt'       => $j->created_at?->toISOString(),
        ];
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/job-orders
     * Optional query params: ?client_account_id=<id>&client=<name>&status=<status>
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobOrder::query();

        if ($request->has('client_account_id')) {
            $query->where('client_account_id', $request->integer('client_account_id'));
        }

        if ($clientName = $request->query('client')) {
            $c = strtolower(trim($clientName));
            $query->where(function ($q) use ($c) {
                $q->whereRaw('LOWER(client) LIKE ?', ["%{$c}%"]);
            });
        }

        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $orders = $query->orderBy('created_at', 'asc')->get();

        return response()->json($orders->map(fn ($j) => $this->format($j))->values());
    }

    /**
     * POST /api/v1/job-orders
     * Used by both the Client Portal and internal Job Order modal.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_account_id' => 'nullable|integer|exists:client_accounts,id',
            'title'             => 'required|string|max:255',
            'client'            => 'required|string|max:255',
            'location'          => 'required|string|max:255',
            'type'              => 'required|string|max:100',
            'rate'              => 'nullable|string|max:100',
            'deadline'          => 'required|string|max:50',
            'total'             => 'required|integer|min:1',
            'status'            => 'nullable|string|max:50',
            'stage'             => 'nullable|string|max:50',
            'priority'          => 'required|in:normal,medium,high,urgent',
            'description'       => 'required|string',
            'requirements'      => 'nullable',
            'tags'              => 'nullable',
            'source'            => 'nullable|string|in:internal,client_portal',
        ]);

        $reqs = $data['requirements'] ?? null;
        if (is_array($reqs)) {
            $reqs = json_encode($reqs);
        }

        $status = $data['status'] ?? 'review';
        $stage = $data['stage'] ?? 'review';

        $job = JobOrder::create([
            'id'                => $this->nextId(),
            'ref'               => $this->nextRef(),
            'client_account_id' => $data['client_account_id'] ?? null,
            'title'             => $data['title'],
            'client'            => $data['client'],
            'location'          => $data['location'],
            'type'              => $data['type'],
            'rate'              => $data['rate'] ?? null,
            'deadline'          => $data['deadline'],
            'filled'            => 0,
            'total'             => $data['total'],
            'status'            => $status,
            'stage'             => $stage,
            'priority'          => $data['priority'],
            'description'       => $data['description'],
            'requirements'      => $reqs,
            'tags'              => is_array($data['tags'] ?? null) ? $data['tags'] : ['New Requisition', 'Under Review'],
            'source'            => $data['source'] ?? 'internal',
        ]);

        ActivityLog::record(
            action: "Created new Job Order #{$job->ref} ({$job->title} - {$job->client}, Total: {$job->total} pax)",
            module: 'Job Orders',
            details: ['ref' => $job->ref, 'client' => $job->client, 'total' => $job->total],
            request: $request
        );

        return response()->json($this->format($job), 201);
    }

    /**
     * GET /api/v1/job-orders/{ref}
     */
    public function show(string $ref): JsonResponse
    {
        $job = JobOrder::where('ref', $ref)->orWhere('id', $ref)->firstOrFail();
        return response()->json($this->format($job));
    }

    /**
     * PUT /api/v1/job-orders/{ref}
     */
    public function update(Request $request, string $ref): JsonResponse
    {
        $job = JobOrder::where('ref', $ref)->orWhere('id', $ref)->firstOrFail();

        $data = $request->validate([
            'title'        => 'sometimes|string|max:255',
            'client'       => 'sometimes|string|max:255',
            'location'     => 'sometimes|string|max:255',
            'type'         => 'sometimes|string|max:100',
            'rate'         => 'nullable|string|max:100',
            'deadline'     => 'sometimes|string|max:50',
            'total'        => 'sometimes|integer|min:1',
            'filled'       => 'sometimes|integer|min:0',
            'status'       => 'sometimes|string|max:50',
            'stage'        => 'sometimes|string|max:50',
            'priority'     => 'sometimes|string|max:50',
            'description'  => 'sometimes|string',
            'requirements' => 'nullable',
            'tags'         => 'nullable',
            'applicants'   => 'nullable',
        ]);

        if (isset($data['requirements']) && is_array($data['requirements'])) {
            $data['requirements'] = json_encode($data['requirements']);
        }

        $job->update($data);

        ActivityLog::record(
            action: "Updated Job Order #{$job->ref} ({$job->title} - {$job->client})",
            module: 'Job Orders',
            details: ['ref' => $job->ref, 'updated_fields' => array_keys($data)],
            request: $request
        );

        return response()->json($this->format($job->fresh()));
    }

    /**
     * DELETE /api/v1/job-orders/{ref}
     */
    public function destroy(Request $request, string $ref): JsonResponse
    {
        $job = JobOrder::where('ref', $ref)->orWhere('id', $ref)->firstOrFail();
        $refNum = $job->ref;
        $title = $job->title;
        $client = $job->client;

        $job->delete();

        ActivityLog::record(
            action: "Archived/Deleted Job Order #{$refNum} ({$title} - {$client})",
            module: 'Job Orders',
            details: ['ref' => $refNum],
            request: $request,
            status: 'Warning'
        );

        return response()->json(['ref' => $ref, 'deleted' => true]);
    }
}
