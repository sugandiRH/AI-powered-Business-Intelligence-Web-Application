<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ErrorMessageController extends Controller
{
    public function getErrorMessages()
    {
        $response = Http::get('http://127.0.0.1:8001/error_messages');
        return response()->json($response->json());
    }
}
