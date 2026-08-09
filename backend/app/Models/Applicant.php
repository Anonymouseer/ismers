<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Applicant extends Model
{
    protected $fillable = [
        'reg_id',
        'first_name',
        'middle_name',
        'last_name',
        'suffix',
        'email',
        'phone',
        'alternate_contact',
        'date_of_birth',
        'gender',
        'civil_status',
        'nationality',
        'place_of_birth',
        'height',
        'weight',
        'religion',
        'city_address',
        'provincial_address',
        'category',
        'experience_summary',
        'target_job_id',
        'stage',
        'status',
        'sent_to_recruitment',
        'submission_source',
    ];

    protected $casts = [
        'sent_to_recruitment' => 'boolean',
        'date_of_birth' => 'date',
    ];

    public function family(): HasOne
    {
        return $this->hasOne(ApplicantFamily::class);
    }

    public function education(): HasMany
    {
        return $this->hasMany(ApplicantEducation::class);
    }

    public function workHistory(): HasMany
    {
        return $this->hasMany(ApplicantWorkHistory::class);
    }

    public function skills(): HasMany
    {
        return $this->hasMany(ApplicantSkill::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicantDocument::class);
    }

    public function references(): HasMany
    {
        return $this->hasMany(ApplicantReference::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(ApplicantHistory::class);
    }

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class, 'target_job_id', 'id');
    }
}
