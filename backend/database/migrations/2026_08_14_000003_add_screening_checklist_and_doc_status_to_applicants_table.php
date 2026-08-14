<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->json('screening_checklist')->nullable();
            $table->json('document_status')->nullable();
            $table->integer('recruiter_rating')->default(0);
            $table->string('assigned_manager')->nullable();
            $table->string('interview_platform')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'screening_checklist',
                'document_status',
                'recruiter_rating',
                'assigned_manager',
                'interview_platform',
            ]);
        });
    }
};
