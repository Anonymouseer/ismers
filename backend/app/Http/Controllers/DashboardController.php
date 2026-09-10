<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Applicant;
use App\Models\ClientAccount;
use App\Models\Deployment;
use App\Models\JobOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/dashboard/stats
     *
     * Returns aggregated statistics from all system modules for the live dashboard.
     * All counts use efficient GROUP BY queries — no N+1, no full model loading.
     */
    public function stats(): JsonResponse
    {
        // ── Applicant Pipeline ───────────────────────────────────────────────
        $applicantTotal = Applicant::count();

        $applicantsByStage = Applicant::select('stage', DB::raw('COUNT(*) as count'))
            ->groupBy('stage')
            ->pluck('count', 'stage')
            ->toArray();

        $applicantsByStatus = Applicant::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $sentToRecruitment = Applicant::where('sent_to_recruitment', true)->count();

        // ── Recruitment Funnel (applicants inside recruitment) ────────────────
        $recruitmentByStage = Applicant::where('sent_to_recruitment', true)
            ->select('recruitment_stage', DB::raw('COUNT(*) as count'))
            ->groupBy('recruitment_stage')
            ->pluck('count', 'recruitment_stage')
            ->toArray();

        // ── Job Order Health ─────────────────────────────────────────────────
        $jobOrderTotal = JobOrder::count();

        $jobOrdersByStatus = JobOrder::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $fillRate = JobOrder::selectRaw('COALESCE(SUM(filled), 0) as total_filled, COALESCE(SUM(total), 0) as total_slots')
            ->first();

        $fillRatePercent = $fillRate->total_slots > 0
            ? round(($fillRate->total_filled / $fillRate->total_slots) * 100, 1)
            : 0;

        // ── Deployment Status ────────────────────────────────────────────────
        $deploymentTotal = Deployment::count();

        $deploymentsByStage = Deployment::select('stage', DB::raw('COUNT(*) as count'))
            ->groupBy('stage')
            ->pluck('count', 'stage')
            ->toArray();

        // ── Client Portfolio ─────────────────────────────────────────────────
        $clientTotal = ClientAccount::count();

        $clientsByStatus = ClientAccount::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // ── Trend Snapshots (month-over-month) ───────────────────────────────
        $now = now();
        $thisMonthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        $applicantsThisMonth = Applicant::where('created_at', '>=', $thisMonthStart)->count();
        $applicantsLastMonth = Applicant::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $deploymentsThisMonth = Deployment::where('created_at', '>=', $thisMonthStart)->count();
        $deploymentsLastMonth = Deployment::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        $jobOrdersThisMonth = JobOrder::where('created_at', '>=', $thisMonthStart)->count();
        $jobOrdersLastMonth = JobOrder::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        // ── Recent Activity Feed ─────────────────────────────────────────────
        $recentActivity = ActivityLog::select('id', 'user_name', 'user_role', 'module', 'action', 'status', 'created_at')
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($log) => [
                'id'        => $log->id,
                'actor'     => $log->user_name ?? 'System',
                'role'      => $log->user_role ?? '',
                'module'    => $log->module,
                'action'    => $log->action,
                'status'    => $log->status,
                'timestamp' => $log->created_at->toIso8601String(),
            ])
            ->toArray();

        return response()->json([
            'applicants' => [
                'total'            => $applicantTotal,
                'byStage'          => $applicantsByStage,
                'byStatus'         => $applicantsByStatus,
                'sentToRecruitment' => $sentToRecruitment,
                'thisMonth'        => $applicantsThisMonth,
                'lastMonth'        => $applicantsLastMonth,
            ],
            'recruitment' => [
                'total'   => $sentToRecruitment,
                'byStage' => $recruitmentByStage,
            ],
            'jobOrders' => [
                'total'        => $jobOrderTotal,
                'byStatus'     => $jobOrdersByStatus,
                'fillRate'     => $fillRatePercent,
                'totalFilled'  => (int) $fillRate->total_filled,
                'totalSlots'   => (int) $fillRate->total_slots,
                'thisMonth'    => $jobOrdersThisMonth,
                'lastMonth'    => $jobOrdersLastMonth,
            ],
            'deployments' => [
                'total'     => $deploymentTotal,
                'byStage'   => $deploymentsByStage,
                'thisMonth' => $deploymentsThisMonth,
                'lastMonth' => $deploymentsLastMonth,
            ],
            'clients' => [
                'total'    => $clientTotal,
                'byStatus' => $clientsByStatus,
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}
