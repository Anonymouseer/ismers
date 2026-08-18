<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('client_accounts')) {
            Schema::table('client_accounts', function (Blueprint $table) {
                if (!Schema::hasColumn('client_accounts', 'status')) {
                    $table->string('status')->default('active')->after('industry');
                }
                if (!Schema::hasColumn('client_accounts', 'am')) {
                    $table->string('am')->nullable()->after('status');
                }
                if (!Schema::hasColumn('client_accounts', 'contract')) {
                    $table->string('contract')->nullable()->after('am');
                }
                if (!Schema::hasColumn('client_accounts', 'renewal')) {
                    $table->string('renewal')->nullable()->after('contract');
                }
                if (!Schema::hasColumn('client_accounts', 'rate')) {
                    $table->string('rate')->nullable()->after('renewal');
                }
                if (!Schema::hasColumn('client_accounts', 'revenue_q')) {
                    $table->string('revenue_q')->nullable()->after('rate');
                }
                if (!Schema::hasColumn('client_accounts', 'tenure')) {
                    $table->string('tenure')->nullable()->after('revenue_q');
                }
                if (!Schema::hasColumn('client_accounts', 'next_event')) {
                    $table->string('next_event')->nullable()->after('tenure');
                }
                if (!Schema::hasColumn('client_accounts', 'card_blurb')) {
                    $table->text('card_blurb')->nullable()->after('next_event');
                }
                if (!Schema::hasColumn('client_accounts', 'card_tag')) {
                    $table->string('card_tag')->nullable()->after('card_blurb');
                }
                if (!Schema::hasColumn('client_accounts', 'card_icon')) {
                    $table->string('card_icon')->nullable()->after('card_tag');
                }
                if (!Schema::hasColumn('client_accounts', 'sites')) {
                    $table->json('sites')->nullable()->after('card_icon');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('client_accounts')) {
            Schema::table('client_accounts', function (Blueprint $table) {
                $columns = [
                    'status',
                    'am',
                    'contract',
                    'renewal',
                    'rate',
                    'revenue_q',
                    'tenure',
                    'next_event',
                    'card_blurb',
                    'card_tag',
                    'card_icon',
                    'sites',
                ];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('client_accounts', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
