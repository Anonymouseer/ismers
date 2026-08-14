<?php

namespace App\Http\Controllers;

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
        return [
            'ref'             => $j->ref,
            'id'              => $j->id,
            'client'          => $j->client,
            'client_account_id' => $j->client_account_id,
            'title'           => $j->title,
            'location'        => $j->location ?? '',
            'type'            => $j->type ?? '',
            'rate'            => $j->rate ?? '',
            'deadline'        => $j->deadline ?? '',
            'filled'          => $j->filled,
            'total'           => $j->total,
            'status'          => $j->status,
            'stage'           => $j->stage,
            'priority'        => $j->priority,
            'description'     => $j->description ?? '',
            'requirements'    => $j->requirements
                ? (is_string($j->requirements)
                    ? array_filter(array_map('trim', explode("\n", $j->requirements)))
                    : $j->requirements)
                : [],
            'source'          => $j->source,
            'tags'            => [],
            'recruiter'       => 'Unassigned',
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
            'applicants'      => [],
            'createdAt'       => $j->created_at?->toISOString(),
        ];
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/job-orders
     * Optional query param: ?client_account_id=<id>
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobOrder::query();

        if ($request->has('client_account_id')) {
            $query->where('client_account_id', $request->integer('client_account_id'));
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

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
            'priority'          => 'required|in:normal,medium,high',
            'description'       => 'required|string',
            'requirements'      => 'nullable|string',
            'source'            => 'nullable|string|in:internal,client_portal',
        ]);

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
            'status'            => 'open',
            'stage'             => 'created',
            'priority'          => $data['priority'],
            'description'       => $data['description'],
            'requirements'      => $data['requirements'] ?? null,
            'source'            => $data['source'] ?? 'internal',
        ]);

        return response()->json($this->format($job), 201);
    }

    /**
     * GET /api/v1/job-orders/{ref}
     */
    public function show(string $ref): JsonResponse
    {
        $job = JobOrder::where('ref', $ref)->firstOrFail();
        return response()->json($this->format($job));
    }

    /**
     * PUT /api/v1/job-orders/{ref}
     */
    public function update(Request $request, string $ref): JsonResponse
    {
        $job = JobOrder::where('ref', $ref)->firstOrFail();

        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'client'      => 'sometimes|string|max:255',
            'location'    => 'sometimes|string|max:255',
            'type'        => 'sometimes|string|max:100',
            'rate'        => 'nullable|string|max:100',
            'deadline'    => 'sometimes|string|max:50',
            'total'       => 'sometimes|integer|min:1',
            'filled'      => 'sometimes|integer|min:0',
            'status'      => 'sometimes|in:open,filling,urgent,filled',
            'stage'       => 'sometimes|string|max:50',
            'priority'    => 'sometimes|in:normal,medium,high',
            'description' => 'sometimes|string',
            'requirements'=> 'nullable|string',
        ]);

        $job->update($data);

        return response()->json($this->format($job->fresh()));
    }

    /**
     * DELETE /api/v1/job-orders/{ref}
     */
    public function destroy(string $ref): JsonResponse
    {
        $job = JobOrder::where('ref', $ref)->firstOrFail();
        $job->delete();

        return response()->json(['ref' => $ref, 'deleted' => true]);
    }
}
