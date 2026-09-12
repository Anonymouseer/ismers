<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatThread extends Model
{
    protected $fillable = [
        'client_account_id',
        'assigned_user_id',
        'subject',
        'status',
        'last_message_at',
        'last_message_preview',
        'unread_client_count',
        'unread_hr_count',
    ];

    protected $casts = [
        'last_message_at'     => 'datetime',
        'unread_client_count' => 'integer',
        'unread_hr_count'     => 'integer',
    ];

    public function clientAccount(): BelongsTo
    {
        return $this->belongsTo(ClientAccount::class, 'client_account_id');
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'thread_id')->orderBy('created_at', 'asc');
    }
}
