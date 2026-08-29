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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('hr_administrator')->after('email');
            $table->string('role_label')->nullable()->after('role');
            $table->string('department')->nullable()->after('role_label');
            $table->json('allowed_modules')->nullable()->after('department');
            $table->string('default_route')->nullable()->after('allowed_modules');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'role_label',
                'department',
                'allowed_modules',
                'default_route',
            ]);
        });
    }
};
