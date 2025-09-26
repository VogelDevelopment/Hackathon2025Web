<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'data_source_id',
        'user_id',
    ];

    // Relationships
    public function dataSource()
    {
        return $this->belongsTo(DataSource::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
