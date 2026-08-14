<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deployment extends Model
{
    protected $fillable = [
        'deployment_ref',
        'applicant_id',
        'job_order_ref',
        'employee_name',
        'client_name',
        'position_title',
        'site_facility',
        'site_supervisor',
        'site_supervisor_contact',
        'shift_schedule',
        'start_date',
        'end_date',
        'stage',
        'compliance_checklist',
        'pre_employment_snapshot',
        'history',
    ];

    protected $casts = [
        'compliance_checklist' => 'array',
        'pre_employment_snapshot' => 'array',
        'history' => 'array',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function jobOrder(): BelongsTo
    {
        return $this->belongsTo(JobOrder::class, 'job_order_ref', 'ref');
    }
}
