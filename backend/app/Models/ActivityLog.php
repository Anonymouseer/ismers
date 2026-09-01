<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_logs';

    protected $fillable = [
        'user_id',
        'user_name',
        'user_email',
        'user_role',
        'module',
        'action',
        'details',
        'ip_address',
        'user_agent',
        'status',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * The user who triggered the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Static helper to log an activity event cleanly across the application.
     */
    public static function record(
        string $action,
        string $module,
        ?array $details = null,
        ?Request $request = null,
        ?User $user = null,
        string $status = 'Success'
    ): self {
        $req = $request ?: request();
        $usr = $user ?: ($req ? $req->user() : null);

        $userName = $usr ? $usr->name : ($details['user_name'] ?? 'System Process');
        $userEmail = $usr ? $usr->email : ($details['user_email'] ?? 'system@primepower.ph');
        $userRole = $usr ? ($usr->role_label ?? $usr->role) : ($details['user_role'] ?? 'System');
        $ip = $req ? $req->ip() : '127.0.0.1';
        $agent = $req ? substr((string)$req->userAgent(), 0, 500) : null;

        return self::create([
            'user_id' => $usr ? $usr->id : null,
            'user_name' => $userName,
            'user_email' => $userEmail,
            'user_role' => $userRole,
            'module' => $module,
            'action' => $action,
            'details' => $details,
            'ip_address' => $ip,
            'user_agent' => $agent,
            'status' => $status,
        ]);
    }
}
