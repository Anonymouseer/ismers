<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrder extends Model
{
    protected $primaryKey = 'id';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'ref',
        'client_account_id',
        'client',
        'category',
        'dep_ref',
        'location',
        'type',
        'rate',
        'deadline',
        'filled',
        'total',
        'status',
        'stage',
        'priority',
        'description',
        'requirements',
        'tags',
        'applicants',
        'source',
    ];

    protected $casts = [
        'filled'     => 'integer',
        'total'      => 'integer',
        'tags'       => 'array',
        'applicants' => 'array',
    ];

    public function clientAccount(): BelongsTo
    {
        return $this->belongsTo(ClientAccount::class);
    }
}
