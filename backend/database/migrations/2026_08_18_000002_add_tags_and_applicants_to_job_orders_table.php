<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('job_orders')) {
            Schema::table('job_orders', function (Blueprint $table) {
                if (!Schema::hasColumn('job_orders', 'tags')) {
                    $table->json('tags')->nullable()->after('requirements');
                }
                if (!Schema::hasColumn('job_orders', 'applicants')) {
                    $table->json('applicants')->nullable()->after('tags');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('job_orders')) {
            Schema::table('job_orders', function (Blueprint $table) {
                if (Schema::hasColumn('job_orders', 'tags')) {
                    $table->dropColumn('tags');
                }
                if (Schema::hasColumn('job_orders', 'applicants')) {
                    $table->dropColumn('applicants');
                }
            });
        }
    }
};
