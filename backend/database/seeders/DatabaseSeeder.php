<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RbacUserSeeder::class,
            ClientAccountSeeder::class,
            JobOrderSeeder::class,
            ApplicantSeeder::class,
            DeploymentSeeder::class,
        ]);
    }
}
