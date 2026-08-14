<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClientAccount extends Model
{
    protected $fillable = [
        'company_id',
        'company',
        'industry',
        'contact_person',
        'designation',
        'email',
        'mobile',
        'password',
        'agreed',
    ];

    protected $casts = [
        'agreed' => 'boolean',
    ];

    protected $hidden = [
        'password',
    ];
}
