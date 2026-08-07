<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantWorkHistory extends Model
{
    protected $table = 'applicant_work_history';

    protected $fillable = [
        'applicant_id',
        'role',
        'company',
        'duration',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
