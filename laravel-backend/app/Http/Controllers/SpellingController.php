<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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
}
