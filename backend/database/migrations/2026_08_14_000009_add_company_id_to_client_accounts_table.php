<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('client_accounts') && !Schema::hasColumn('client_accounts', 'company_id')) {
            Schema::table('client_accounts', function (Blueprint $table) {
                $table->string('company_id')->nullable()->after('id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('client_accounts') && Schema::hasColumn('client_accounts', 'company_id')) {
            Schema::table('client_accounts', function (Blueprint $table) {
                $table->dropColumn('company_id');
            });
        }
    }
};
