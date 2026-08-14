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
        Schema::table('applicants', function (Blueprint $table) {
            if (!Schema::hasColumn('applicants', 'employment_contract')) {
                $table->json('employment_contract')->nullable();
            }
            if (!Schema::hasColumn('applicants', 'orientation_modules')) {
                $table->json('orientation_modules')->nullable();
            }
            if (!Schema::hasColumn('applicants', 'atm_endorsement')) {
                $table->json('atm_endorsement')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            if (Schema::hasColumn('applicants', 'employment_contract')) {
                $table->dropColumn('employment_contract');
            }
            if (Schema::hasColumn('applicants', 'orientation_modules')) {
                $table->dropColumn('orientation_modules');
            }
            if (Schema::hasColumn('applicants', 'atm_endorsement')) {
                $table->dropColumn('atm_endorsement');
            }
        });
    }
};
