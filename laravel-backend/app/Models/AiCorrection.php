<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiCorrection extends Model
{
    protected $table = 'ai_corrections';
    protected $fillable = [
        'column_name',
        'original_value',
        'suggested_value',
        'confidence',
        'approved_by_user',
    ];
    protected $casts = [
        'confidence' => 'float',
        'approved_by_user' => 'boolean',
    ];
}
