<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantEducation extends Model
{
    protected $table = 'applicant_education';

    protected $fillable = [
        'applicant_id',
        'level',
        'school',
        'degree',
        'start_year',
        'end_year',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
