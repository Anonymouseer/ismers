<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();

            $table->string('name');                        // Original filename
            $table->string('type')->default('Other Documents'); // Resume / CV, Valid ID, Training Certificates, etc.
            $table->string('file_path')->nullable();       // Storage path (null until real upload wired)
            $table->string('disk')->default('local');      // Storage disk (local, s3, etc.)

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_documents');
    }
};
