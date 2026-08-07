<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_education', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();

            $table->string('level')->nullable();           // Elementary, High School, College, Vocational, etc.
            $table->string('school');
            $table->string('degree')->nullable();          // e.g. "BS Office Administration", "General Academic Strand"
            $table->string('start_year')->nullable();
            $table->string('end_year')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_education');
    }
};
