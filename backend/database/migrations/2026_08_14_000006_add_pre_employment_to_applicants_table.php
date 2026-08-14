<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->json('pre_employment_checklist')->nullable();
            $table->json('medical_referral')->nullable();
            $table->json('statutory_numbers')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn([
                'pre_employment_checklist',
                'medical_referral',
                'statutory_numbers',
            ]);
        });
    }
};
