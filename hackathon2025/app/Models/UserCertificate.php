<?php

namespace App\Models;

use App\Enums\CertificateStatus;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserCertificate extends Pivot
{
    protected $table = 'user_certificates';

    protected $fillable = [
        'user_id',
        'certificate_id', 
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => CertificateStatus::class,
        ];
    }

    // Relationships to access the related models
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function certificate()
    {
        return $this->belongsTo(Certificate::class);
    }
}
