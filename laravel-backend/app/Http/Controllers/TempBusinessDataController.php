<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TempBusinessDataSample;
use App\Models\BusinessData;
use App\Models\Dataset;

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
            // ->where('error_level', 'warning')
            ->where(function ($query) {
                $query->whereNull('error_level')
                    ->orWhere('error_level', 'warning');
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

    public function deleteAllCriticalRowsByDatasetId(Request $request)
    {
        $datasetId = $request->input('dataset_id');
        $deletedCount = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where('error_level', 'critical')
            ->delete();

        return response()->json(['message' => "$deletedCount critical rows deleted successfully"]);
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

    public function confirmAllWarningRowsByDatasetId(Request $request)
    {
        $datasetId = $request->input('dataset_id');

        TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where('error_level', 'warning')
            ->update([
                'user_confirmed' => true,
                'error_level' => 'info',
            ]);

        return response()->json(['message' => 'All warning rows confirmed successfully']);
    }

    public function confirmAiSuggestedWarningById(Request $request)
    {
        $row = TempBusinessDataSample::find($request-> input('row_id'));

        if (!$row) {
            return response()->json(['message' => 'Row not found'], 404);
        }

        $row->update([
            'date' => $request->input('date'),
            'month' => $request->input('month'),
            'year' => $request->input('year'),
            'product' => $request->input('product'),
            'category' => $request->input('category'),
            'quantity' => $request->input('quantity'),
            'price' => $request->input('price'),
            'total' => $request->input('total'),
            'suggested_month'    => null,
            'suggested_year'     => null,
            'suggested_quantity' => null,
            'suggested_price'    => null,
            'suggested_total'    => null,
            'error_level' => 'info', 
            'user_confirmed' => true,
        ]);

        return response()->json(['message' => 'AI-suggested warning confirmed successfully']);
    }


    public function deleteAiSuggestedWarningById(Request $request)
    {
        $row = TempBusinessDataSample::find($request-> input('row_id'));

        if (!$row) {
            return response()->json(['message' => 'Row not found'], 404);
        }

        $row->update([
            'suggested_month'    => null,
            'suggested_year'     => null,
            'suggested_quantity' => null,
            'suggested_price'    => null,
            'suggested_total'    => null,

        ]);

        return response()->json(['message' => 'AI-suggested warning deleted successfully']);
    }

    public function confirmAllInfoRowsByDatasetId(Request $request)
    {
        $datasetId = $request->input('dataset_id');

        TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where(function ($query) {
                $query->where('is_valid', true)
                    ->orWhere('error_level', 'info')
                    ->orWhereNull('error_level')
                    ->orWhere('error_level', 'nan')
                    ->orWhere('error_level', '');
            })
            ->update([
                'user_confirmed' => true,
                'user_confirmed' => true,
                'error_level' => 'info',
            ]);

        return response()->json(['message' => 'All info rows confirmed successfully']);
    }

    public function finalizeDataset(Request $request)
    {
        $datasetId = $request->input('dataset_id');

        // Get all confirmed rows from temp table
        $rows = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where('user_confirmed', true)
            ->get();

        if ($rows->isEmpty()) {
            return response()->json(['message' => 'No confirmed rows to finalize'], 422);
        }

        foreach ($rows as $row) {
            if (empty($row->product) || $row->product === 'nan') {
                continue;
            }
            BusinessData::create([
                'dataset_id' => $row->dataset_id,
                'date'       => $row->date,
                'month'      => $row->month ? (int) $row->month    : null,
                'year'       => $row->year ? (int) $row->year   : null,
                'product'    => $row->product,
                'category'   => $row->category,
                'quantity'   => $row->quantity ? (int) $row->quantity : null,
                'price'      => $row->price ? (float) $row->price  : null,
                'total'      => $row->total ? (float) $row->total  : null,
            ]);
        }

        Dataset::where('id', $datasetId)
            ->update([
                'status' => 'completed'
            ]);

        return response()->json([
            'message' => 'Dataset finalized successfully',
            'rows_inserted' => $rows->count()
        ]);
    }
    

}