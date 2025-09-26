<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'url',
    ];

    // Relationships
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_certificates')
            ->withPivot('status')
            ->withTimestamps()
            ->using(UserCertificate::class);
    }

    public function dataSources()
    {
        return $this->belongsToMany(DataSource::class, 'data_source_certificates')
            ->withTimestamps();
    }
}
