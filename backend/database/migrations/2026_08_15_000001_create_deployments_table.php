<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deployments', function (Blueprint $table) {
            $table->id();
            $table->string('deployment_ref')->unique()->index(); // e.g. DEP-001
            $table->foreignId('applicant_id')->nullable()->constrained('applicants')->nullOnDelete();
            $table->string('job_order_ref')->nullable()->index(); // e.g. JO-001
            $table->string('employee_name');
            $table->string('client_name');
            $table->string('position_title');
            $table->string('site_facility');
            $table->string('site_supervisor')->nullable();
            $table->string('site_supervisor_contact')->nullable();
            $table->string('shift_schedule')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->string('stage')->default('assigned'); // assigned, pre_deployment, scheduled, dispatched, on_site, completed, closed
            $table->json('compliance_checklist')->nullable();
            $table->json('pre_employment_snapshot')->nullable(); // Medical, Statutory IDs, Contract, Orientation, PPE, ATM
            $table->json('history')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deployments');
    }
};
