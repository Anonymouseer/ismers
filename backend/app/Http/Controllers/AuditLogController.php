<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AuditLogController extends Controller
{
    /**
     * GET /api/v1/audit-logs
     * Fetch paginated and filtered activity/audit logs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query()
            ->leftJoin('users', function ($join) {
                $join->on('activity_logs.user_id', '=', 'users.id')
                     ->orOn('activity_logs.user_email', '=', 'users.email');
            })
            ->select([
                'activity_logs.*',
                'users.photo as photo',
                'users.photo as user_photo',
            ]);

        // Search across action, user_name, user_email, module, and ip
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('activity_logs.action', 'like', "%{$search}%")
                  ->orWhere('activity_logs.user_name', 'like', "%{$search}%")
                  ->orWhere('activity_logs.user_email', 'like', "%{$search}%")
                  ->orWhere('activity_logs.module', 'like', "%{$search}%")
                  ->orWhere('activity_logs.ip_address', 'like', "%{$search}%");
            });
        }

        // Filter by module
        if ($module = $request->input('module')) {
            if ($module !== 'All' && $module !== 'all') {
                $query->where('activity_logs.module', $module);
            }
        }

        // Filter by status
        if ($status = $request->input('status')) {
            if ($status !== 'All' && $status !== 'all') {
                $query->where('activity_logs.status', $status);
            }
        }

        // Filter by date
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('activity_logs.created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('activity_logs.created_at', '<=', $dateTo);
        }

        $sortColumn = in_array($request->input('sort_by'), ['id', 'created_at', 'user_name', 'module', 'status', 'action'])
            ? $request->input('sort_by')
            : 'created_at';
        $sortBy = 'activity_logs.' . $sortColumn;
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $limit = min((int)$request->input('limit', 50), 500);
        $logs = $query->orderBy($sortBy, $sortDir)->paginate($limit);

        // Compute summary metrics for executive oversight
        $totalCount = ActivityLog::count();
        $todayCount = ActivityLog::whereDate('created_at', today())->count();
        $activeModulesCount = ActivityLog::distinct('module')->count('module');

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'last_page' => $logs->lastPage(),
            ],
            'metrics' => [
                'total_logs' => $totalCount,
                'today_logs' => $todayCount,
                'active_modules' => $activeModulesCount,
            ],
        ]);
    }

    /**
     * POST /api/v1/audit-logs
     * Store a client-side or microservice-triggered activity log event.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|string|max:1000',
            'module' => 'required|string|max:100',
            'status' => 'nullable|string|in:Success,Warning,Danger,Info',
            'details' => 'nullable|array',
        ]);

        $log = ActivityLog::record(
            action: $validated['action'],
            module: $validated['module'],
            details: $validated['details'] ?? null,
            request: $request,
            status: $validated['status'] ?? 'Success'
        );

        return response()->json([
            'success' => true,
            'message' => 'Activity event recorded successfully.',
            'log' => $log,
        ], 201);
    }

    /**
     * GET /api/v1/audit-logs/export
     * Stream CSV export of audit logs for compliance audits.
     */
    public function export(Request $request): StreamedResponse
    {
        $filename = 'ismers_audit_logs_' . date('Y-m-d_His') . '.csv';

        $query = ActivityLog::query()->orderBy('created_at', 'desc');

        if ($module = $request->input('module')) {
            if ($module !== 'All' && $module !== 'all') {
                $query->where('module', $module);
            }
        }
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('action', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('user_email', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%");
            });
        }

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($query) {
            $handle = fopen('php://output', 'w');
            
            // UTF-8 BOM for Excel compatibility
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));

            // CSV Header
            fputcsv($handle, ['Log ID', 'Timestamp (UTC+8)', 'Staff User', 'Email', 'Role', 'Module', 'Action Taken', 'IP Address', 'Status']);

            $query->chunk(200, function ($logs) use ($handle) {
                foreach ($logs as $log) {
                    fputcsv($handle, [
                        'LOG-' . str_pad($log->id, 5, '0', STR_PAD_LEFT),
                        $log->created_at ? $log->created_at->format('Y-m-d H:i:s') : '',
                        $log->user_name ?: 'System Process',
                        $log->user_email ?: 'system@primepower.ph',
                        $log->user_role ?: 'Staff Member',
                        $log->module,
                        $log->action,
                        $log->ip_address ?: '127.0.0.1',
                        $log->status ?: 'Success',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
