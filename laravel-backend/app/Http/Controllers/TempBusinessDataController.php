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

    public function getCriticalRowByDatasetId($datasetId)
    {
        $data = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where('error_level', 'critical')
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

        $totalCriticalRows = $data->count();    

        return response()->json([
            'critical_rows' => $data,
            'total_critical_rows' => $totalCriticalRows
        ]);
    }

    public function getWarningRowByDatasetId($datasetId)
    {
        $data = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where('error_level', 'warning')
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

            $totalWarningRows = $data->count();

        return response()->json([
            'warning_rows' => $data,
            'total_warning_rows' => $totalWarningRows
        ]);
    }

    public function getInfoRowByDatasetId($datasetId)
    {
        $data = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where('error_level', 'info')
            ->whereNull('validation_errors')
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

            $totalInfoRows = $data->count();

        return response()->json([
            'info_rows' => $data,
            'total_info_rows' => $totalInfoRows
        ]);
    }

}