<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_accounts', function (Blueprint $table) {
            $table->id();

            $table->string('company');
            $table->string('industry');
            $table->string('contact_person');
            $table->string('designation')->nullable();
            $table->string('email')->unique();
            $table->string('mobile');
            $table->string('password');
            $table->boolean('agreed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_accounts');
    }
};
