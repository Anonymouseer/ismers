<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            // Display reference key (JO-001, JO-012, …)
            $table->string('ref')->nullable()->unique()->after('id');

            // Client account link
            $table->unsignedBigInteger('client_account_id')->nullable()->after('ref');
            $table->foreign('client_account_id')
                  ->references('id')
                  ->on('client_accounts')
                  ->onDelete('set null');

            // Core job details
            $table->string('location')->nullable()->after('client');
            $table->string('type')->nullable()->after('location');   // Full-time, Contractual, …
            $table->string('rate')->nullable()->after('type');       // e.g. ₱610/day
            $table->string('deadline')->nullable()->after('rate');   // stored as formatted string

            // Fill tracking
            $table->integer('filled')->default(0)->after('deadline');
            $table->integer('total')->default(1)->after('filled');

            // Workflow
            $table->string('status')->default('open')->after('total');   // open|filling|urgent|filled
            $table->string('stage')->default('created')->after('status');
            $table->string('priority')->default('normal')->after('stage'); // normal|medium|high

            // Rich-text fields
            $table->text('description')->nullable()->after('priority');
            $table->text('requirements')->nullable()->after('description');

            // Tracks where the order originated
            $table->string('source')->default('internal')->after('requirements'); // internal|client_portal
        });
    }

    public function down(): void
    {
        Schema::table('job_orders', function (Blueprint $table) {
            $table->dropForeign(['client_account_id']);
            $table->dropColumn([
                'ref', 'client_account_id', 'location', 'type', 'rate',
                'deadline', 'filled', 'total', 'status', 'stage', 'priority',
                'description', 'requirements', 'source',
            ]);
        });
    }
};
