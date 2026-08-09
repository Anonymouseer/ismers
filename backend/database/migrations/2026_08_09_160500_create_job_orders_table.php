<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_orders', function (Blueprint $table) {
            $table->string('id')->primary();               // jo1, jo2, etc.
            $table->string('title');
            $table->string('client');
            $table->string('category')->nullable();
            $table->string('dep_ref')->nullable();          // JO-001, JO-002, etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_orders');
    }
};
