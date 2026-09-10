<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/v1/users
     * Fetch all active system staff users with RBAC roles and real activity status.
     */
    public function index(Request $request): JsonResponse
    {
        $currentUserId = $request->user()?->id;

        $users = User::orderBy('id', 'asc')->get()->map(function (User $u) use ($currentUserId) {
            $isCurrent = $currentUserId && $u->id === $currentUserId;

            // Calculate human-friendly last active status from real audit trail
            if ($isCurrent) {
                $lastActive = 'Active Now';
            } else {
                $latestLog = ActivityLog::where('user_id', $u->id)
                    ->orWhere('user_email', $u->email)
                    ->latest('created_at')
                    ->first();

                if ($latestLog && $latestLog->created_at) {
                    $lastActive = $latestLog->created_at->diffForHumans();
                } else {
                    $lastActive = 'Recently active';
                }
            }

            return [
                'id'          => $u->id,
                'user_code'   => 'USR-' . str_pad((string)$u->id, 3, '0', STR_PAD_LEFT),
                'name'        => $u->name,
                'email'       => $u->email,
                'role'        => $u->role,
                'role_label'  => $u->role_label ?: ucwords(str_replace('_', ' ', $u->role)),
                'department'  => $u->department ?: 'HR Operations',
                'status'      => $u->status ?: 'Active',
                'photo'       => $u->photo,
                'last_active' => $lastActive,
                'created_at'  => $u->created_at?->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $users,
            'total'   => $users->count(),
        ]);
    }

    /**
     * POST /api/v1/users
     * Create a new official staff user account with role permissions.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email',
            'password'   => 'nullable|string|min:8',
            'role'       => 'required|string',
            'department' => 'required|string',
        ]);

        $roleLabels = [
            'hr_administrator'       => 'HR Administrator',
            'registration_officer'   => 'Applicant Registration Officer',
            'recruitment_officer'    => 'Recruitment Officer',
            'job_order_coordinator' => 'Job Order Coordinator',
            'deployment_officer'     => 'Deployment Officer',
        ];

        $roleLabel = $roleLabels[$validated['role']] ?? ucwords(str_replace('_', ' ', $validated['role']));
        $defaultPassword = $validated['password'] ?: 'Password@123';

        $user = User::create([
            'name'            => trim($validated['name']),
            'email'           => strtolower(trim($validated['email'])),
            'password'        => Hash::make($defaultPassword),
            'role'            => $validated['role'],
            'role_label'      => $roleLabel,
            'department'      => $validated['department'],
            'status'          => 'Active',
            'allowed_modules' => [
                'applicant-registration',
                'recruitment-selection',
                'job-order-management',
                'deployment-assignment',
                'settings',
            ],
            'default_route'   => '/dashboard',
        ]);

        ActivityLog::record(
            action: "Created new staff user account: {$user->name} ({$roleLabel})",
            module: 'System Administration',
            details: ['user_id' => $user->id, 'email' => $user->email, 'role' => $user->role],
            request: $request,
            status: 'Success'
        );

        return response()->json([
            'success' => true,
            'message' => 'Staff account created successfully.',
            'user'    => $user,
        ], 201);
    }

    /**
     * PATCH /api/v1/users/{id}/status
     * Suspend or reactivate a staff member account.
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $newStatus = $user->status === 'Suspended' ? 'Active' : 'Suspended';
        $user->status = $newStatus;
        $user->save();

        ActivityLog::record(
            action: "Updated staff user status: {$user->name} changed to {$newStatus}",
            module: 'System Administration',
            details: ['user_id' => $user->id, 'new_status' => $newStatus],
            request: $request,
            status: 'Success'
        );

        return response()->json([
            'success'    => true,
            'message'    => "User status successfully updated to {$newStatus}.",
            'new_status' => $newStatus,
        ]);
    }
}
