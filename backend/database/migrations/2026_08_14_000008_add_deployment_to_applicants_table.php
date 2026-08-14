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
            if (!Schema::hasColumn('applicants', 'deployment_details')) {
                $table->json('deployment_details')->nullable();
            }
            if (!Schema::hasColumn('applicants', 'ppe_issuance')) {
                $table->json('ppe_issuance')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            if (Schema::hasColumn('applicants', 'deployment_details')) {
                $table->dropColumn('deployment_details');
            }
            if (Schema::hasColumn('applicants', 'ppe_issuance')) {
                $table->dropColumn('ppe_issuance');
            }
        });
    }
};
