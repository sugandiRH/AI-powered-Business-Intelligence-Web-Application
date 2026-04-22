<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TempBusinessDataSample extends Model
{
    protected $table = 'temp_business_data_sample';
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
        'is_valid',
        'validation_errors',
        'error_level',
        'suggested_date',
        'suggested_month',
        'suggested_year',
        'suggested_category',
        'suggested_product',
        'suggested_price',
        'suggested_quantity',
        'suggested_total',
        'user_confirmed',
        'ai_correction',
        'corrected_Field_by_ai',
        'corrected_data'
    ];

    protected $casts = [
        'is_valid'          => 'boolean',
        'validation_errors' => 'array',       // json column — auto encode/decode
        'user_confirmed'    => 'boolean',
        'ai_correction'     => 'boolean',
        'suggested_date'    => 'datetime',
        'suggested_month'   => 'integer',
        'suggested_year'    => 'integer',
        'suggested_price'   => 'float',
        'suggested_quantity'=> 'float',
        'suggested_total'   => 'float',
    ];

    public function dataset()
    {
        return $this->belongsTo(Dataset::class, 'dataset_id');
        
    }

     public function productCorrection()
    {
        return $this->hasOne(AiCorrection::class, 'original_value', 'product')
                    ->where('column_name', 'product');
    }

    public function categoryCorrection()
    {
        return $this->hasOne(AiCorrection::class, 'original_value', 'category')
                    ->where('column_name', 'category');
    }
}
?>