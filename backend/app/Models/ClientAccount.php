<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClientAccount extends Model
{
    protected $fillable = [
        'company_id',
        'company',
        'industry',
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
        'contact_person',
        'designation',
        'email',
        'mobile',
        'password',
        'agreed',
    ];

    protected $casts = [
        'agreed' => 'boolean',
        'sites' => 'array',
    ];

    protected $hidden = [
        'password',
    ];

    public function jobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class, 'client_account_id');
    }
}
