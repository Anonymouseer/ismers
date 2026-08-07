<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantFamily extends Model
{
    protected $table = 'applicant_family';

    protected $fillable = [
        'applicant_id',
        'spouse_name',
        'spouse_occupation',
        'father_name',
        'father_occupation',
        'mother_name',
        'mother_occupation',
        'family_address',
        'emergency_contact_name',
        'emergency_contact_address',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
