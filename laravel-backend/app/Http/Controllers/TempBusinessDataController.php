<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TempBusinessDataSample;

class TempBusinessDataController extends Controller
{
    public function getDataByDatasetId($datasetId)
    {
        $data = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->select([
                'date',
                'month',
                'year',
                'product',
                'category',
                'quantity',
                'price',
                'total',
                'validation_errors',
                'error_level',
            ])
            ->get();

        return response()->json([
            'temp_business_data' => $data
        ]);
    }

}