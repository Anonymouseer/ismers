<?php

namespace Database\Seeders;

use App\Models\ClientAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ClientAccountSeeder extends Seeder
{
    public function run(): void
    {
        ClientAccount::create([
            'company' => 'ABC Manufacturing Corp.',
            'industry' => 'Manufacturing',
            'contact_person' => 'Maria Santos',
            'designation' => 'HR Manager',
            'email' => 'maria.santos@abcmfg.com',
            'mobile' => '+63 917 123 4567',
            'password' => Hash::make('Password123!'),
            'agreed' => true,
        ]);

        ClientAccount::create([
            'company' => 'XYZ Construction Inc.',
            'industry' => 'Construction',
            'contact_person' => 'Jose Reyes',
            'designation' => 'Operations Director',
            'email' => 'jose.reyes@xyzconst.com',
            'mobile' => '+63 918 987 6543',
            'password' => Hash::make('Password123!'),
            'agreed' => true,
        ]);

        ClientAccount::create([
            'company' => 'Quick Logistics Trading',
            'industry' => 'Logistics & Warehousing',
            'contact_person' => 'Anna Cruz',
            'designation' => null,
            'email' => 'anna.cruz@quicklogistics.ph',
            'mobile' => '+63 919 456 7890',
            'password' => Hash::make('Password123!'),
            'agreed' => true,
        ]);
    }
}
