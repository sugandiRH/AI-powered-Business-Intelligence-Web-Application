<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VisualBoardController extends Controller
{
    public function getChartDetails(Request $request)
    {
        try {
            
            $response = Http::post('http://127.0.0.1:8001/get_visual_details', [
                'dataset_id' => $request->dataset_id,
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Details fetch error'], 500);
            }

            return response()->json($response->json());

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

?>