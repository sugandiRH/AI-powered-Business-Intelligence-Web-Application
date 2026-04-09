<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\excel_upload\UploadController;
use App\Http\Controllers\DatasetController;
use App\Http\Controllers\TempBusinessDataController;
use App\Http\Controllers\SpellingController;
use App\Http\Controllers\ErrorMessageController;
use App\Http\Controllers\VisualBoardController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Require Token)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/logout', [LogoutController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

});



Route::middleware('auth:sanctum')->group(function () {
    Route::post('/upload', [UploadController::class, 'upload']);
    Route::post('/confirm_upload', [UploadController::class, 'confirmUpload']);
    
    Route::get('/temp_business_data/{datasetId}', [TempBusinessDataController::class, 'getDataByDatasetId']);
    Route::get('/temp_critical_business_data/{datasetId}', [TempBusinessDataController::class, 'getCriticalRowByDatasetId']);
    Route::get('/temp_warning_business_data/{datasetId}', [TempBusinessDataController::class, 'getWarningRowByDatasetId']);
    Route::get('/temp_info_business_data/{datasetId}', [TempBusinessDataController::class, 'getInfoRowByDatasetId']);
    // Route::get('/temp_valid_business_data/{datasetId}', [TempBusinessDataController::class, 'getValidRowByDatasetId']);
    Route::post('/delete_temp_data', [TempBusinessDataController::class, 'deleteRowById']);
    Route::post('/update_temp_data', [TempBusinessDataController::class, 'updateRowById']);
    Route::post('/confirm_temp_data', [TempBusinessDataController::class, 'confirmRowById']);
    Route::post('/delete_all_critical_rows', [TempBusinessDataController::class, 'deleteAllCriticalRowsByDatasetId']);
    Route::post('/confirm_all_warning_rows', [TempBusinessDataController::class, 'confirmAllWarningRowsByDatasetId']);
    Route::post('/delete_ai_suggested_warning', [TempBusinessDataController::class, 'deleteAiSuggestedWarningById']);
    Route::post('/confirm_ai_suggested_warning', [TempBusinessDataController::class, 'confirmAiSuggestedWarningById']);
    Route::post('/confirm_all_info_rows', [TempBusinessDataController::class, 'confirmAllInfoRowsByDatasetId']);
    
    Route::post('/finalize_dataset', [TempBusinessDataController::class, 'finalizeDataset']);


    Route::post('/auto_complete_warnings', [SpellingController::class, 'autoCompleteWarnings']);
    Route::get('/warning_suggestions/{datasetId}', [SpellingController::class, 'getWarningSuggestions']);

    Route::get('/spelling_suggestions/{datasetId}', [SpellingController::class, 'getSuggestionsByDatasetId']);
    Route::get('/error_messages', [ErrorMessageController::class, 'getErrorMessages']);

    Route::post('/get_chart_details', [VisualBoardController::class, 'getChartDetails']);
});


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard/stats', [DatasetController::class, 'dashboardStats']);
    Route::get('/datasets', [DatasetController::class, 'getDataset']);

});