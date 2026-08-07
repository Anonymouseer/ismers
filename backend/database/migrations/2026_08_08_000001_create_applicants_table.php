<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();
            $table->string('reg_id')->unique();               // REG-001, REG-002, etc.

            // ── Personal Information ──
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();              // Jr., Sr., III
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('alternate_contact')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('civil_status')->nullable();
            $table->string('nationality')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->string('height')->nullable();
            $table->string('weight')->nullable();
            $table->string('religion')->nullable();
            $table->string('city_address')->nullable();        // "location" in frontend
            $table->string('provincial_address')->nullable();  // "address" in frontend

            // ── Pipeline ──
            $table->string('category')->nullable();            // e.g. "Warehousing & Logistics"
            $table->text('experience_summary')->nullable();
            $table->string('target_job_id')->nullable();       // references JOB_TARGETS.id
            $table->string('stage')->default('registered');    // registered | profiling | profiled
            $table->string('status')->default('active');       // active | inactive | on_hold | hired | rejected | withdrawn | blacklisted
            $table->boolean('sent_to_recruitment')->default(false);
            $table->string('submission_source')->default('staff'); // staff | self-service

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
