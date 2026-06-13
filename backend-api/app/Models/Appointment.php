<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $fillable = [
        'user_id',
        'id_klinik',
        'appointment_date',
        'appointment_time',
        'status',
        'patient_name',
        'patient_phone',
        'patient_gender',
        'patient_birth_date',
        'patient_address',
        'patient_job',
        'patient_religion',
        'action_type',
        'questionnaire',
        'image_url',
        'urgency_score',
        'priority_level',
        'keluhan_utama',
        'anamnesis_draft',
        'ai_triage_analysis',
    ];

    protected $casts = [
        'questionnaire' => 'array',
        'ai_triage_analysis' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id_users');
    }
}
