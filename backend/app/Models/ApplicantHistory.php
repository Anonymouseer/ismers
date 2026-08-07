<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantHistory extends Model
{
    protected $table = 'applicant_history';

    protected $fillable = [
        'applicant_id',
        'date',
        'text',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
