<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Dataset extends Model
{
    protected $table = 'datasets';
    protected $fillable   = ['status'];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
?>