<?php

use App\Http\Controllers\CategorieController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderitemController;
use App\Http\Controllers\PaywayPaymentController;
use App\Http\Controllers\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::resource('categories', CategorieController::class);
Route::resource('products', ProductController::class);
Route::resource('orders', OrderController::class);
Route::resource('orderitems', OrderitemController::class);

Route::get('/payway-payment', [PaywayPaymentController::class, 'create']);
Route::post('/payway-payment/fail/{order}', [PaywayPaymentController::class, 'fail']);
Route::get('/payway-payment/status/{order}',[PaywayPaymentController::class, 'status']);
