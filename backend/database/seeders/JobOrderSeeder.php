<?php

namespace Database\Seeders;

use App\Models\JobOrder;
use Illuminate\Database\Seeder;

class JobOrderSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            // --- ABC Logistics ---
            ['id' => 'jo1', 'title' => 'Warehouse Associate', 'client' => 'ABC Logistics', 'category' => 'Warehousing & Logistics', 'dep_ref' => 'JO-001'],
            ['id' => 'jo2', 'title' => 'Forklift Operator', 'client' => 'ABC Logistics', 'category' => 'Warehousing & Logistics', 'dep_ref' => 'JO-002'],
            ['id' => 'jo3', 'title' => 'Inventory Clerk', 'client' => 'ABC Logistics', 'category' => 'Warehousing & Logistics', 'dep_ref' => 'JO-003'],
            ['id' => 'jo4', 'title' => 'Delivery Driver', 'client' => 'ABC Logistics', 'category' => 'Warehousing & Logistics', 'dep_ref' => 'JO-004'],

            // --- Northline BPO ---
            ['id' => 'jo5', 'title' => 'Customer Service Rep', 'client' => 'Northline BPO', 'category' => 'Customer Service (BPO)', 'dep_ref' => 'JO-005'],
            ['id' => 'jo6', 'title' => 'Technical Support Agent', 'client' => 'Northline BPO', 'category' => 'Customer Service (BPO)', 'dep_ref' => 'JO-006'],
            ['id' => 'jo7', 'title' => 'Sales Development Representative', 'client' => 'Northline BPO', 'category' => 'Customer Service (BPO)', 'dep_ref' => 'JO-007'],
            ['id' => 'jo8', 'title' => 'Team Leader - Customer Experience', 'client' => 'Northline BPO', 'category' => 'Customer Service (BPO)', 'dep_ref' => 'JO-008'],

            // --- Delta Manufacturing ---
            ['id' => 'jo9', 'title' => 'Machine Operator', 'client' => 'Delta Manufacturing', 'category' => 'Manufacturing', 'dep_ref' => 'JO-009'],
            ['id' => 'jo10', 'title' => 'Quality Control Inspector', 'client' => 'Delta Manufacturing', 'category' => 'Manufacturing', 'dep_ref' => 'JO-010'],
            ['id' => 'jo11', 'title' => 'Production Line Supervisor', 'client' => 'Delta Manufacturing', 'category' => 'Manufacturing', 'dep_ref' => 'JO-011'],
            ['id' => 'jo12', 'title' => 'Packaging Associate', 'client' => 'Delta Manufacturing', 'category' => 'Manufacturing', 'dep_ref' => 'JO-012'],

            // --- Coastal Retail Group ---
            ['id' => 'jo13', 'title' => 'Admin Assistant', 'client' => 'Coastal Retail Group', 'category' => 'Retail & Store Operations', 'dep_ref' => 'JO-013'],
            ['id' => 'jo14', 'title' => 'Sales Associate', 'client' => 'Coastal Retail Group', 'category' => 'Retail & Store Operations', 'dep_ref' => 'JO-014'],
            ['id' => 'jo15', 'title' => 'Store Cashier', 'client' => 'Coastal Retail Group', 'category' => 'Retail & Store Operations', 'dep_ref' => 'JO-015'],
            ['id' => 'jo16', 'title' => 'Visual Merchandiser', 'client' => 'Coastal Retail Group', 'category' => 'Retail & Store Operations', 'dep_ref' => 'JO-016'],

            // --- Sunrise Hospitality Group ---
            ['id' => 'jo17', 'title' => 'Front Desk Associate', 'client' => 'Sunrise Hospitality Group', 'category' => 'Hospitality & Front Desk', 'dep_ref' => 'JO-017'],
            ['id' => 'jo18', 'title' => 'Housekeeping Staff', 'client' => 'Sunrise Hospitality Group', 'category' => 'Hospitality & Front Desk', 'dep_ref' => 'JO-018'],
            ['id' => 'jo19', 'title' => 'Food & Beverage Server', 'client' => 'Sunrise Hospitality Group', 'category' => 'Food & Beverage (F&B / Cook)', 'dep_ref' => 'JO-019'],
            ['id' => 'jo20', 'title' => 'Maintenance Technician', 'client' => 'Sunrise Hospitality Group', 'category' => 'Hospitality & Front Desk', 'dep_ref' => 'JO-020'],

            // --- Prime Realty Corp ---
            ['id' => 'jo21', 'title' => 'Leasing Consultant', 'client' => 'Prime Realty Corp', 'category' => 'Real Estate & Property Management', 'dep_ref' => 'JO-021'],
            ['id' => 'jo22', 'title' => 'Property Administrator', 'client' => 'Prime Realty Corp', 'category' => 'Real Estate & Property Management', 'dep_ref' => 'JO-022'],
            ['id' => 'jo23', 'title' => 'Front Desk Officer', 'client' => 'Prime Realty Corp', 'category' => 'Real Estate & Property Management', 'dep_ref' => 'JO-023'],
            ['id' => 'jo24', 'title' => 'Maintenance Coordinator', 'client' => 'Prime Realty Corp', 'category' => 'Real Estate & Property Management', 'dep_ref' => 'JO-024'],

            // --- Metro Health Diagnostics ---
            ['id' => 'jo25', 'title' => 'Medical Technologist', 'client' => 'Metro Health Diagnostics', 'category' => 'Healthcare & Diagnostics', 'dep_ref' => 'JO-025'],
            ['id' => 'jo26', 'title' => 'Radiologic Technologist', 'client' => 'Metro Health Diagnostics', 'category' => 'Healthcare & Diagnostics', 'dep_ref' => 'JO-026'],
            ['id' => 'jo27', 'title' => 'Patient Service Representative', 'client' => 'Metro Health Diagnostics', 'category' => 'Healthcare & Diagnostics', 'dep_ref' => 'JO-027'],
            ['id' => 'jo28', 'title' => 'Billing Clerk', 'client' => 'Metro Health Diagnostics', 'category' => 'Healthcare & Diagnostics', 'dep_ref' => 'JO-028'],

            // --- GreenFields Agri Export ---
            ['id' => 'jo29', 'title' => 'Packing Associate', 'client' => 'GreenFields Agri Export', 'category' => 'Agriculture & Export', 'dep_ref' => 'JO-029'],
            ['id' => 'jo30', 'title' => 'QA Inspector (Agri)', 'client' => 'GreenFields Agri Export', 'category' => 'Agriculture & Export', 'dep_ref' => 'JO-030'],
            ['id' => 'jo31', 'title' => 'Logistics Coordinator', 'client' => 'GreenFields Agri Export', 'category' => 'Agriculture & Export', 'dep_ref' => 'JO-031'],
            ['id' => 'jo32', 'title' => 'Farm Supervisor', 'client' => 'GreenFields Agri Export', 'category' => 'Agriculture & Export', 'dep_ref' => 'JO-032'],

            // --- Apex Construction Builders ---
            ['id' => 'jo33', 'title' => 'Construction Laborer', 'client' => 'Apex Construction Builders', 'category' => 'Construction & Engineering', 'dep_ref' => 'JO-033'],
            ['id' => 'jo34', 'title' => 'Site Engineer Assistant', 'client' => 'Apex Construction Builders', 'category' => 'Construction & Engineering', 'dep_ref' => 'JO-034'],
            ['id' => 'jo35', 'title' => 'Safety Officer', 'client' => 'Apex Construction Builders', 'category' => 'Construction & Engineering', 'dep_ref' => 'JO-035'],
            ['id' => 'jo36', 'title' => 'Heavy Equipment Operator', 'client' => 'Apex Construction Builders', 'category' => 'Construction & Engineering', 'dep_ref' => 'JO-036'],
        ];

        foreach ($jobs as $job) {
            JobOrder::updateOrCreate(['id' => $job['id']], $job);
        }
    }
}
