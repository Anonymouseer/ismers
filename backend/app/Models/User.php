<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'role_label',
        'department',
        'status',
        'allowed_modules',
        'default_route',
        'photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'allowed_modules' => 'array',
        ];
    }

    /**
     * Check if user is an HR Administrator.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'hr_administrator';
    }

    /**
     * Check if user has one of the specified roles.
     *
     * @param string|array<string> $roles
     */
    public function hasRole(string|array $roles): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $roles = is_array($roles) ? $roles : explode('|', $roles);
        return in_array($this->role, $roles, true);
    }

    /**
     * Check if user has permission to access a given module.
     */
    public function hasModuleAccess(string $module): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        $allowed = is_array($this->allowed_modules) ? $this->allowed_modules : [];
        return in_array($module, $allowed, true);
    }
}
