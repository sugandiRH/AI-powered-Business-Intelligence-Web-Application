<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TempBusinessDataSample extends Model
{
    protected $table = 'temp_business_data_sample';

    public function dataset()
    {
        return $this->belongsTo(Dataset::class, 'dataset_id');
    }
}
?>