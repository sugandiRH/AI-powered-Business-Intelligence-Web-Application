<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Dataset;

class DatasetController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $totalUploads = Dataset::where('user_id', $user->id)->count();

        $lastUpload = Dataset::where('user_id', $user->id)
            ->latest()
            ->first();

        return response()->json([
            'total_uploads' => $totalUploads,
            'last_upload_name' => optional($lastUpload)->file_name,
            'last_upload_date' => optional($lastUpload)->created_at,
        ]);
    }

    public function getDataset(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $datasets = Dataset::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($datasets);
    }
}