<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ClientAccount;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ClientAccountController extends Controller
{
    /**
     * Format a ClientAccount model for frontend consumption.
     */
    private function formatClient(ClientAccount $c): array
    {
        $companyId = $c->company_id ?: ('CLT-2026-' . str_pad((string)$c->id, 4, '0', STR_PAD_LEFT));

        // Fetch active job orders linked to this client
        $colorMap = [
            'open'    => 'var(--blue)',
            'filling' => 'var(--amber)',
            'filled'  => 'var(--green)',
            'review'  => 'var(--purple)',
            'urgent'  => 'var(--red)',
            'closed'  => 'var(--amber)',
        ];

        $jobs = JobOrder::where('client_account_id', $c->id)
            ->orWhereRaw('LOWER(client) = ?', [strtolower($c->company)])
            ->get()
            ->map(function ($j) use ($colorMap, $c) {
                $reqs = $j->requirements;
                if (is_string($reqs)) {
                    $decoded = json_decode($reqs, true);
                    $reqs = is_array($decoded) ? $decoded : array_values(array_filter(array_map('trim', explode("\n", $reqs))));
                }

                $tags = $j->tags;
                if (is_string($tags)) {
                    $decoded = json_decode($tags, true);
                    $tags = is_array($decoded) ? $decoded : array_values(array_filter(array_map('trim', explode(',', $tags))));
                }

                $status = $j->status ?? 'open';

                return [
                    'id'           => $j->id,
                    'ref'          => $j->ref ?: $j->dep_ref,
                    'title'        => $j->title,
                    'filled'       => (int) $j->filled,
                    'total'        => (int) ($j->total ?: 1),
                    'badge'        => $status,
                    'status'       => $status,
                    'stage'        => $j->stage ?? 'created',
                    'color'        => $colorMap[$status] ?? 'var(--blue)',
                    'location'     => $j->location ?: ($c->address ?? 'Metro Manila'),
                    'type'         => $j->type ?: 'Full-time · Contractual',
                    'rate'         => $j->rate ?: ($c->rate ?? '₱610/day'),
                    'deadline'     => $j->deadline ?: 'Aug 30, 2026',
                    'description'  => $j->description ?: ('Job order requisition for ' . $j->title . ' at ' . $c->company . '.'),
                    'requirements' => is_array($reqs) ? $reqs : [],
                    'tags'         => is_array($tags) ? $tags : [],
                    'priority'     => $j->priority ?? 'normal',
                    'applicants'   => is_array($j->applicants) ? $j->applicants : [],
                ];
            })
            ->values()
            ->all();

        return [
            'id'            => $c->id,
            'companyId'     => $companyId,
            'name'          => $c->company,
            'company'       => $c->company,
            'industry'      => $c->industry,
            'status'        => $c->status ?? 'active',
            'am'            => $c->am ?? 'Karla Reyes',
            'contract'      => $c->contract ?? 'Staffing (Contingency)',
            'renewal'       => $c->renewal ?? '—',
            'rate'          => $c->rate ?? '₱185/hr avg',
            'revenueQ'      => $c->revenue_q ?? '₱1.0M',
            'tenure'        => $c->tenure ?? '1y 0m',
            'nextEvent'     => $c->next_event ?? 'Scheduled operational review',
            'cardIcon'      => $c->card_icon ?? 'building',
            'cardTag'       => $c->card_tag ?? $c->industry,
            'cardBlurb'     => $c->card_blurb ?? ('Managing staffing and placement operations for ' . $c->company . '.'),
            'contactPerson' => $c->contact_person,
            'designation'   => $c->designation,
            'email'         => $c->email,
            'mobile'        => $c->mobile,
            'sites'         => $c->sites ?? [],
            'jobs'          => $jobs,
            'createdAt'     => $c->created_at?->toISOString(),
            'updatedAt'     => $c->updated_at?->toISOString(),
        ];
    }

    /**
     * GET /api/v1/clients
     * Fetch all client records for CRM and dispatch linking.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ClientAccount::query();

        if ($search = $request->query('search')) {
            $s = strtolower($search);
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(company) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(industry) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(contact_person) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(company_id) LIKE ?', ["%{$s}%"]);
            });
        }

        if ($status = $request->query('status')) {
            if ($status !== 'all') {
                $query->where('status', $status);
            }
        }

        $clients = $query->orderBy('id', 'asc')->get()->map(fn ($c) => $this->formatClient($c));

        return response()->json($clients);
    }

    /**
     * GET /api/v1/clients/{id}
     * Fetch a single client profile.
     */
    public function show(string $id): JsonResponse
    {
        $client = ClientAccount::where('id', $id)
            ->orWhere('company_id', $id)
            ->first();

        if (!$client) {
            return response()->json(['message' => 'Client record not found'], 404);
        }

        return response()->json($this->formatClient($client));
    }

    /**
     * POST /api/v1/clients
     * Create a new client account from CRM.
     */
    public function store(Request $request): JsonResponse
    {
        // Normalize snake_case and common alternative naming conventions from CRM
        $input = $request->all();
        if (!isset($input['company']) && isset($input['name'])) $input['company'] = $input['name'];
        if (!isset($input['company']) && isset($input['company_name'])) $input['company'] = $input['company_name'];
        if (!isset($input['contactPerson']) && isset($input['contact_person'])) $input['contactPerson'] = $input['contact_person'];
        if (!isset($input['contactPerson']) && isset($input['contact_name'])) $input['contactPerson'] = $input['contact_name'];
        if (!isset($input['mobile']) && isset($input['phone'])) $input['mobile'] = $input['phone'];
        if (!isset($input['mobile']) && isset($input['contact_number'])) $input['mobile'] = $input['contact_number'];
        if (!isset($input['industry'])) $input['industry'] = 'General Operations & Services';

        $validator = validator($input, [
            'company'        => 'required|string|max:255',
            'industry'       => 'required|string|max:255',
            'status'         => 'nullable|string|max:50',
            'am'             => 'nullable|string|max:255',
            'contract'       => 'nullable|string|max:255',
            'renewal'        => 'nullable|string|max:100',
            'rate'           => 'nullable|string|max:100',
            'revenueQ'       => 'nullable|string|max:50',
            'tenure'         => 'nullable|string|max:50',
            'nextEvent'      => 'nullable|string|max:255',
            'cardIcon'       => 'nullable|string|max:50',
            'cardTag'        => 'nullable|string|max:100',
            'cardBlurb'      => 'nullable|string',
            'sites'          => 'nullable|array',
            'contactPerson'  => 'required|string|max:255',
            'designation'    => 'nullable|string|max:255',
            'email'          => 'required|email|max:255|unique:client_accounts,email',
            'mobile'         => 'required|string|max:50',
            'password'       => 'nullable|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $nextIdNum = ClientAccount::count() + 1;
        $companyId = 'CLT-2026-' . str_pad((string)$nextIdNum, 4, '0', STR_PAD_LEFT);

        $client = ClientAccount::create([
            'company_id'     => $companyId,
            'company'        => $data['company'],
            'industry'       => $data['industry'],
            'status'         => $data['status'] ?? 'active',
            'am'             => $data['am'] ?? 'Karla Reyes',
            'contract'       => $data['contract'] ?? 'Staffing (Contingency)',
            'renewal'        => $data['renewal'] ?? '—',
            'rate'           => $data['rate'] ?? '₱185/hr avg',
            'revenue_q'      => $data['revenueQ'] ?? '₱0',
            'tenure'         => $data['tenure'] ?? 'New',
            'next_event'     => $data['nextEvent'] ?? 'Initial onboarding briefing',
            'card_icon'      => $data['cardIcon'] ?? 'building',
            'card_tag'       => $data['cardTag'] ?? $data['industry'],
            'card_blurb'     => $data['cardBlurb'] ?? ('Client account created for ' . $data['company']),
            'sites'          => $data['sites'] ?? [],
            'contact_person' => $data['contactPerson'],
            'designation'    => $data['designation'] ?? null,
            'email'          => $data['email'],
            'mobile'         => $data['mobile'],
            'password'       => Hash::make($data['password'] ?? 'PrimePower@2026'),
            'agreed'         => true,
        ]);

        ActivityLog::record(
            action: "Registered new client company profile: {$client->company} ({$client->company_id})",
            module: 'Client Management',
            details: ['company_id' => $client->company_id, 'industry' => $client->industry],
            request: $request
        );

        return response()->json($this->formatClient($client), 201);
    }

    /**
     * PUT /api/v1/clients/{id}
     * Update client details from CRM.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $client = ClientAccount::where('id', $id)
            ->orWhere('company_id', $id)
            ->first();

        if (!$client) {
            return response()->json(['message' => 'Client record not found'], 404);
        }

        $data = $request->validate([
            'company'        => 'sometimes|required|string|max:255',
            'industry'       => 'sometimes|required|string|max:255',
            'status'         => 'nullable|string|max:50',
            'am'             => 'nullable|string|max:255',
            'contract'       => 'nullable|string|max:255',
            'renewal'        => 'nullable|string|max:100',
            'rate'           => 'nullable|string|max:100',
            'revenueQ'       => 'nullable|string|max:50',
            'tenure'         => 'nullable|string|max:50',
            'nextEvent'      => 'nullable|string|max:255',
            'cardIcon'       => 'nullable|string|max:50',
            'cardTag'        => 'nullable|string|max:100',
            'cardBlurb'      => 'nullable|string',
            'sites'          => 'nullable|array',
            'contactPerson'  => 'sometimes|required|string|max:255',
            'designation'    => 'nullable|string|max:255',
            'email'          => 'sometimes|required|email|max:255|unique:client_accounts,email,' . $client->id,
            'mobile'         => 'sometimes|required|string|max:50',
        ]);

        $updatePayload = [];
        if (isset($data['company']))       $updatePayload['company'] = $data['company'];
        if (isset($data['industry']))      $updatePayload['industry'] = $data['industry'];
        if (isset($data['status']))        $updatePayload['status'] = $data['status'];
        if (isset($data['am']))            $updatePayload['am'] = $data['am'];
        if (isset($data['contract']))      $updatePayload['contract'] = $data['contract'];
        if (isset($data['renewal']))       $updatePayload['renewal'] = $data['renewal'];
        if (isset($data['rate']))          $updatePayload['rate'] = $data['rate'];
        if (isset($data['revenueQ']))      $updatePayload['revenue_q'] = $data['revenueQ'];
        if (isset($data['tenure']))        $updatePayload['tenure'] = $data['tenure'];
        if (isset($data['nextEvent']))     $updatePayload['next_event'] = $data['nextEvent'];
        if (isset($data['cardIcon']))      $updatePayload['card_icon'] = $data['cardIcon'];
        if (isset($data['cardTag']))       $updatePayload['card_tag'] = $data['cardTag'];
        if (isset($data['cardBlurb']))     $updatePayload['card_blurb'] = $data['cardBlurb'];
        if (isset($data['sites']))         $updatePayload['sites'] = $data['sites'];
        if (isset($data['contactPerson'])) $updatePayload['contact_person'] = $data['contactPerson'];
        if (isset($data['designation']))   $updatePayload['designation'] = $data['designation'];
        if (isset($data['email']))         $updatePayload['email'] = $data['email'];
        if (isset($data['mobile']))        $updatePayload['mobile'] = $data['mobile'];

        $client->update($updatePayload);

        ActivityLog::record(
            action: "Updated client company profile: {$client->company} ({$client->company_id})",
            module: 'Client Management',
            details: ['company_id' => $client->company_id, 'updated_fields' => array_keys($updatePayload)],
            request: $request
        );

        return response()->json($this->formatClient($client));
    }

    /**
     * DELETE /api/v1/clients/{id}
     * Delete a client account.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $client = ClientAccount::where('id', $id)
            ->orWhere('company_id', $id)
            ->first();

        if (!$client) {
            return response()->json(['message' => 'Client record not found'], 404);
        }

        $companyName = $client->company;
        $companyId = $client->company_id;

        $client->delete();

        ActivityLog::record(
            action: "Archived/Removed client company profile: {$companyName} ({$companyId})",
            module: 'Client Management',
            details: ['company_id' => $companyId],
            request: $request,
            status: 'Warning'
        );

        return response()->json(['message' => 'Client record successfully removed']);
    }

    /**
     * POST /api/v1/client-portal/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = trim(strtolower($request->email));
        $client = ClientAccount::whereRaw('LOWER(email) = ?', [$email])->first();

        if (! $client || ! Hash::check($request->password, $client->password)) {
            ActivityLog::record(
                action: "Failed client portal authentication attempt for: {$request->email}",
                module: 'Client Portal',
                details: ['attempted_email' => $request->email],
                request: $request,
                status: 'Warning'
            );

            throw ValidationException::withMessages([
                'email' => ['Incorrect email or password. Please try again.'],
            ]);
        }

        ActivityLog::record(
            action: "Client company logged into Client Portal: {$client->company} ({$client->email})",
            module: 'Client Portal',
            details: ['client_id' => $client->id, 'company' => $client->company],
            request: $request,
            status: 'Success'
        );

        $companyId = $client->company_id ?? ('CLT-2026-' . str_pad((string)$client->id, 4, '0', STR_PAD_LEFT));

        // Revoke any existing client portal tokens for this account to prevent
        // token accumulation and enforce single active session per client.
        $client->tokens()->where('name', 'client-portal')->delete();

        $expiresAt = now()->addHours(8);
        $token = $client->createToken('client-portal', ['client-portal'], $expiresAt)->plainTextToken;

        return response()->json([
            'id'            => $client->id,
            'companyId'     => $companyId,
            'company'       => $client->company,
            'industry'      => $client->industry,
            'contactPerson' => $client->contact_person,
            'designation'   => $client->designation,
            'email'         => $client->email,
            'mobile'        => $client->mobile,
            'loggedIn'      => true,
            'token'         => $token,
            'expires_at'    => $expiresAt->toIso8601String(),
        ]);
    }

    /**
     * POST /api/v1/client-portal/register
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'company' => 'required|string|max:255',
            'industry' => 'required|string|max:255',
            'contactPerson' => 'required|string|max:255',
            'designation' => 'nullable|string|max:255',
            'email' => 'required|email|max:255|unique:client_accounts,email',
            'mobile' => 'required|string|max:50',
            'password' => 'required|string|min:8',
            'agreed' => 'required|boolean',
        ]);

        $nextIdNum = ClientAccount::count() + 1;
        $companyId = 'CLT-2026-' . str_pad((string)$nextIdNum, 4, '0', STR_PAD_LEFT);

        $client = ClientAccount::create([
            'company_id' => $companyId,
            'company' => $request->company,
            'industry' => $request->industry,
            'contact_person' => $request->contactPerson,
            'designation' => $request->designation,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
            'agreed' => $request->boolean('agreed'),
        ]);

        $expiresAt = now()->addHours(8);
        $token = $client->createToken('client-portal', ['client-portal'], $expiresAt)->plainTextToken;

        return response()->json([
            'id'            => $client->id,
            'companyId'     => $companyId,
            'company'       => $client->company,
            'industry'      => $client->industry,
            'contactPerson' => $client->contact_person,
            'designation'   => $client->designation,
            'email'         => $client->email,
            'mobile'        => $client->mobile,
            'loggedIn'      => true,
            'token'         => $token,
        ], 201);
    }
}
