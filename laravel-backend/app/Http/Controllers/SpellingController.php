<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

use App\Models\AiCorrection;
use App\Models\TempBusinessDataSample;

class SpellingController extends Controller
{
    public function getSuggestionsByDatasetId($datasetId)
    {
        $samples = TempBusinessDataSample::where('dataset_id', $datasetId)
            ->where(function ($q) {
                $q->whereNotNull('suggested_product')
                ->orWhereNotNull('suggested_category');
            })
            ->get(['suggested_product', 'suggested_category']);

        $suggestProducts   = $samples->pluck('suggested_product')->filter()->unique()->toArray();
        $suggestCategories = $samples->pluck('suggested_category')->filter()->unique()->toArray();

        $allSuggestions = array_merge($suggestProducts, $suggestCategories);

        if (empty($allSuggestions)) {
            return response()->json([]);
        }

        $corrections = AiCorrection::whereIn('suggested_value', $allSuggestions)
            ->get(['column_name', 'original_value', 'suggested_value', 'confidence']);


        return response()->json($corrections);
    }




    public function autoCompleteWarnings(Request $request)
    {
        try {
            
            $response = Http::post('http://127.0.0.1:8001/confirm_warning_ai', [
                'dataset_id' => $request->dataset_id,
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'AI processing failed'], 500);
            }

            return $this->getWarningSuggestions($request->dataset_id);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getWarningSuggestions($datasetId)
    {
        
        $rows = TempBusinessDataSample::where('dataset_id', $datasetId)
        ->where('error_level', 'warning')
        ->get([
            'id', 'date', 'month', 'year', 'product', 'category',
            'quantity', 'price', 'total', 'validation_errors', 'error_level',
            'suggested_month', 'suggested_year', 'suggested_category',
            'suggested_quantity', 'suggested_price', 'suggested_total',
            'suggested_date'
        ]);

    return response()->json(['warning_rows' => $rows]);
    }
}
