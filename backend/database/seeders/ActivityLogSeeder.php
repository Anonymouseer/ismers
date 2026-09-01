<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all()->keyBy('email');

        $logs = [
            [
                'email' => 'admin@primepower.ph',
                'module' => 'System Administration',
                'action' => 'Calibrated and synchronized Python AI Scoring weights (Skills: 45%, Exp: 35%, Loc: 15%, Certs: 5%)',
                'status' => 'Success',
                'ip_address' => '192.168.1.100',
                'created_at' => now()->subMinutes(12),
            ],
            [
                'email' => 'recruitment@primepower.ph',
                'module' => 'AI Candidate Scoring',
                'action' => 'Executed Python AI Scorer against PRF-2026-004 (Sunrise Hospitality Group) - 5 applicants evaluated',
                'status' => 'Success',
                'ip_address' => '192.168.1.105',
                'created_at' => now()->subMinutes(35),
            ],
            [
                'email' => 'recruitment@primepower.ph',
                'module' => 'Recruitment & Selection',
                'action' => 'Auto-shortlisted top candidates with >=85% fit score for Client Interview stage',
                'status' => 'Success',
                'ip_address' => '192.168.1.105',
                'created_at' => now()->subHours(1)->subMinutes(10),
            ],
            [
                'email' => 'registration@primepower.ph',
                'module' => 'Applicant Registration',
                'action' => 'Registered new candidate profile: Michael Angelo Bautista (APP-2026-0845)',
                'status' => 'Success',
                'ip_address' => '192.168.1.108',
                'created_at' => now()->subHours(2)->subMinutes(15),
            ],
            [
                'email' => 'joborders@primepower.ph',
                'module' => 'Job Order Management',
                'action' => 'Created Job Order PRF-2026-015: 10 Warehouse Logistics Specialists for ABC Logistics',
                'status' => 'Success',
                'ip_address' => '192.168.1.112',
                'created_at' => now()->subHours(3)->subMinutes(40),
            ],
            [
                'email' => 'deployment@primepower.ph',
                'module' => 'Deployment & Assignment',
                'action' => 'Dispatched deployment assignment for 4 verified personnel to Northline BPO Ortigas Site',
                'status' => 'Success',
                'ip_address' => '192.168.1.115',
                'created_at' => now()->subHours(4)->subMinutes(5),
            ],
            [
                'email' => 'admin@primepower.ph',
                'module' => 'Security & Governance',
                'action' => 'Enforced mandatory 12-character corporate password policy and 90-day expiry rule',
                'status' => 'Success',
                'ip_address' => '192.168.1.100',
                'created_at' => now()->subHours(5)->subMinutes(20),
            ],
            [
                'email' => 'joborders@primepower.ph',
                'module' => 'Client Management',
                'action' => 'Updated contract terms and DOLE D.O. 174 compliance documentation for Delta Manufacturing',
                'status' => 'Success',
                'ip_address' => '192.168.1.112',
                'created_at' => now()->subHours(6)->subMinutes(10),
            ],
            [
                'email' => 'admin@primepower.ph',
                'module' => 'Data & Backup',
                'action' => 'Created manual database snapshot archive (ismers_snapshot_prod_20260901)',
                'status' => 'Success',
                'ip_address' => '192.168.1.100',
                'created_at' => now()->subHours(8),
            ],
            [
                'email' => 'registration@primepower.ph',
                'module' => 'Applicant Registration',
                'action' => 'Verified TESDA NC II Electrical Installation & Maintenance Certificate for Candidate Juan Dela Cruz',
                'status' => 'Success',
                'ip_address' => '192.168.1.108',
                'created_at' => now()->subDay()->subHours(2),
            ],
        ];

        foreach ($logs as $logData) {
            $user = $users->get($logData['email']);
            ActivityLog::create([
                'user_id' => $user ? $user->id : null,
                'user_name' => $user ? $user->name : 'System User',
                'user_email' => $logData['email'],
                'user_role' => $user ? ($user->role_label ?? $user->role) : 'HR Staff',
                'module' => $logData['module'],
                'action' => $logData['action'],
                'ip_address' => $logData['ip_address'],
                'status' => $logData['status'],
                'created_at' => $logData['created_at'],
                'updated_at' => $logData['created_at'],
            ]);
        }
    }
}
