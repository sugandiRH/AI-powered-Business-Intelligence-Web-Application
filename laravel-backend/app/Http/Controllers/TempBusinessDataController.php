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
                'id',
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
                'id',
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
                'suggested_total',
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
                'id',
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
            ->where(function ($query) {
                $query->where('is_valid', true)
                    ->orWhere('error_level', 'info');
            })
            
            ->select([
                'id',
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

    public function deleteRowById(Request $request)
    {
        $row = TempBusinessDataSample::find($request-> input('row_id'));

        if (!$row) {
            return response()->json(['message' => 'Row not found'], 404);
        }

        $row->delete();

        return response()->json(['message' => 'Row deleted successfully']);
    }


    public function updateRowById(Request $request)
    {
        $row = TempBusinessDataSample::find($request-> input('row_id'));

        if (!$row) {
            return response()->json(['message' => 'Row not found'], 404);
        }

        // Update the row with new values
        $row-> update([
            'date' => $request->input('date'),
            'month' => $request->input('month'),
            'year' => $request->input('year'),
            'product' => $request->input('product'),
            'category' => $request->input('category'),
            'quantity' => $request->input('quantity'),
            'price' => $request->input('price'),
            'total' => $request->input('total'),
            'error_level' => 'info', 
            'user_confirmed' => true,
        ]);

        return response()->json(['message' => 'Row updated successfully']);
    }


    public function confirmRowById(Request $request)
    {
        $row = TempBusinessDataSample::find($request-> input('row_id'));

        if (!$row) {
            return response()->json(['message' => 'Row not found'], 404);
        }

        $row->update([
            'user_confirmed' => true,
            'error_level' => 'info',
        ]);

        return response()->json(['message' => 'Dataset confirmed successfully']);
    }
    

}