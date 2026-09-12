<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_threads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_account_id')->constrained('client_accounts')->cascadeOnDelete();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('subject')->default('General Account & Staffing Operations');
            $table->string('status', 50)->default('open');
            $table->timestamp('last_message_at')->nullable()->index();
            $table->text('last_message_preview')->nullable();
            $table->integer('unread_client_count')->default(0);
            $table->integer('unread_hr_count')->default(0);
            $table->timestamps();

            $table->index(['client_account_id', 'status']);
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('thread_id')->constrained('chat_threads')->cascadeOnDelete();
            $table->string('sender_type', 50); // 'client_account' or 'user'
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_name');
            $table->string('sender_role')->nullable();
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['thread_id', 'created_at']);
            $table->index(['sender_type', 'sender_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_threads');
    }
};
