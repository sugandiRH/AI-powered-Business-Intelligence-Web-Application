<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function ask(Request $request)
    {
        try {
            $response = Http::post('http://127.0.0.1:8001/chatbot_quection', [
                'dataset_id' => $request->dataset_id,
                'quection'   => $request->question,
            ]);

            return response()->json($response->json());

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

?>