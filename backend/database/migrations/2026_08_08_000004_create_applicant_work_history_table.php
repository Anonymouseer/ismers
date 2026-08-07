<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_work_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();

            $table->string('role');
            $table->string('company');
            $table->string('duration')->nullable();        // Free-text, e.g. "2023 – 2025", "6 months"

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_work_history');
    }
};
