<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed default HR Administrator user
        User::firstOrCreate(
            ['email' => 'admin@primepower.ph'],
            [
                'name' => 'HR Administrator',
                'password' => Hash::make('PrimePower@2026'),
            ]
        );

        $this->call([
            ClientAccountSeeder::class,
            JobOrderSeeder::class,
            ApplicantSeeder::class,
            DeploymentSeeder::class,
        ]);
    }
}
