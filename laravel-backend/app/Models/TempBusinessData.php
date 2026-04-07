<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TempBusinessData extends Model
{
    protected $table = 'temp_business_data';
    
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function dataset()
    {
        return $this->belongsTo(Dataset::class, 'dataset_id');
    }
}
?>