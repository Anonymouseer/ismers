<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RbacUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Maria Santos',
                'email' => 'admin@primepower.ph',
                'password' => Hash::make('Admin@2026!'),
                'role' => 'hr_administrator',
                'role_label' => 'HR Administrator',
                'department' => 'HR Management',
                'allowed_modules' => [
                    'client-management',
                    'job-order-management',
                    'applicant-registration',
                    'recruitment-selection',
                    'deployment-assignment',
                    'ai-analytics',
                    'settings',
                ],
                'default_route' => '/client-management',
            ],
            [
                'name' => 'Jose Reyes',
                'email' => 'registration@primepower.ph',
                'password' => Hash::make('Reg@2026!'),
                'role' => 'registration_officer',
                'role_label' => 'Applicant Registration Officer',
                'department' => 'Talent Acquisition',
                'allowed_modules' => [
                    'applicant-registration',
                    'ai-analytics',
                ],
                'default_route' => '/applicant-registration',
            ],
            [
                'name' => 'Ana Cruz',
                'email' => 'recruitment@primepower.ph',
                'password' => Hash::make('Recr@2026!'),
                'role' => 'recruitment_officer',
                'role_label' => 'Recruitment Officer',
                'department' => 'Recruitment & Selection',
                'allowed_modules' => [
                    'applicant-registration',
                    'recruitment-selection',
                    'ai-analytics',
                ],
                'default_route' => '/recruitment-selection',
            ],
            [
                'name' => 'Carlo Mendoza',
                'email' => 'joborders@primepower.ph',
                'password' => Hash::make('JoCoord@2026!'),
                'role' => 'job_order_coordinator',
                'role_label' => 'Job Order Coordinator',
                'department' => 'Operations',
                'allowed_modules' => [
                    'client-management',
                    'job-order-management',
                    'ai-analytics',
                ],
                'default_route' => '/job-order-management',
            ],
            [
                'name' => 'Liza Bautista',
                'email' => 'deployment@primepower.ph',
                'password' => Hash::make('Depl@2026!'),
                'role' => 'deployment_officer',
                'role_label' => 'Deployment Officer',
                'department' => 'Workforce Deployment',
                'allowed_modules' => [
                    'deployment-assignment',
                    'ai-analytics',
                ],
                'default_route' => '/deployment-assignment',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
