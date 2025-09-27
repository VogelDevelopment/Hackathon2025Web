<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'justification',
        'url',
        'needs_clearance',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'needs_clearance' => 'boolean',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function certificates()
    {
        return $this->belongsToMany(Certificate::class, 'data_source_certificates')
            ->withTimestamps();
    }

    public function grantedUsers()
    {
        return $this->belongsToMany(User::class, 'datasource_user_access', 'datasource_id', 'user_id')
            ->withPivot('granted')
            ->withTimestamps();
    }

    // Filtered to only granted users (read-only, for display)
    public function grantedAccessUsers()
    {
        return $this->grantedUsers()->wherePivot('granted', true);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function accessRequests()
    {
        return $this->belongsToMany(User::class, 'datasource_user_access', 'datasource_id', 'user_id')
            ->withPivot('granted')
            ->wherePivot('granted', false)
            ->withTimestamps();
    }
}
