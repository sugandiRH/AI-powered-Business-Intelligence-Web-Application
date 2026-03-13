<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\excel_upload\UploadController;
use App\Http\Controllers\DatasetController;
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
});


Route::middleware('auth:sanctum')->group(function () {

    Route::get('/dashboard/stats', [DatasetController::class, 'dashboardStats']);
    Route::get('/datasets', [DatasetController::class, 'getDataset']);

});