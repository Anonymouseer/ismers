<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            JobOrderSeeder::class,
            ApplicantSeeder::class,
            ClientAccountSeeder::class,
        ]);
    }
}
