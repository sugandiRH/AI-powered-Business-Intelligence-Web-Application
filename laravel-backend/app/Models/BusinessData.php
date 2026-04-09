<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BusinessData extends Model
{
    protected $table = 'business_data';

    public function dataset()
    {
        return $this->belongsTo(Dataset::class, 'dataset_id');
    }

    protected $fillable = [
        'dataset_id',
        'date',
        'month',
        'year',
        'product',
        'category',
        'quantity',
        'price',
        'total',
    ];
}
?>