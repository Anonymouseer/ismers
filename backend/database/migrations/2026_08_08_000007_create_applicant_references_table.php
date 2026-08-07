<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_references', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->cascadeOnDelete();

            $table->string('name');
            $table->string('occupation')->nullable();
            $table->string('contact')->nullable();         // Address or phone number

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_references');
    }
};
