<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\CustomerController;


// ------------------------------------------
// PUBLIC AUTHENTICATION APIs
// ------------------------------------------

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// ------------------------------------------
// PUBLIC STOREFRONT APIs
// ------------------------------------------

Route::get('/stores', [StoreController::class, 'index']);
Route::get('/stores/{storeId}', [StoreController::class, 'show']);

Route::get('/stores/{storeId}/categories', [CategoryController::class, 'index']);

Route::get('/stores/{storeId}/products', [ProductController::class, 'index']);
Route::get('/stores/{storeId}/products/{productId}', [ProductController::class, 'show']);

Route::get(
    '/stores/{storeId}/products/{productId}/images',
    [ProductController::class, 'getImages']
);

// Customer checkout - no login required
Route::post('/stores/{storeId}/orders', [OrderController::class, 'store']);


// ------------------------------------------
// AUTHENTICATED APIs
// ------------------------------------------

Route::middleware('auth:sanctum')->group(function () {

    // AUTHENTICATION
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);


    // STORE MANAGEMENT
    Route::post('/stores', [StoreController::class, 'store']);

    // Retrieve complete store details for the owner
    Route::get('/stores/{storeId}/manage', [StoreController::class, 'manageShow']);

    Route::put('/stores/{storeId}', [StoreController::class, 'update']);
    Route::post('/stores/{storeId}/images', [StoreController::class, 'uploadImages']);
    Route::delete('/stores/{storeId}', [StoreController::class, 'destroy']);


    // CATEGORY MANAGEMENT
    Route::post('/stores/{storeId}/categories', [CategoryController::class, 'store']);
    Route::get('/stores/{storeId}/categories/{categoryId}', [CategoryController::class, 'show']);
    Route::put('/stores/{storeId}/categories/{categoryId}', [CategoryController::class, 'update']);
    Route::delete('/stores/{storeId}/categories/{categoryId}', [CategoryController::class, 'destroy']);


    // PRODUCT MANAGEMENT
    Route::post('/stores/{storeId}/products', [ProductController::class, 'store']);
    Route::put('/stores/{storeId}/products/{productId}', [ProductController::class, 'update']);
    Route::delete('/stores/{storeId}/products/{productId}', [ProductController::class, 'destroy']);

    Route::post(
        '/stores/{storeId}/products/{productId}/images',
        [ProductController::class, 'uploadImages']
    );


    // ORDER MANAGEMENT
    Route::get('/stores/{storeId}/orders', [OrderController::class, 'index']);
    Route::get('/stores/{storeId}/orders/{orderId}', [OrderController::class, 'show']);

    Route::patch(
        '/stores/{storeId}/orders/{orderId}/status',
        [OrderController::class, 'updateStatus']
    );


    // CUSTOMER MANAGEMENT
    Route::get('/stores/{storeId}/customers', [CustomerController::class, 'index']);


    // INVOICE MANAGEMENT
    Route::post(
        '/stores/{storeId}/orders/{orderId}/invoice',
        [InvoiceController::class, 'store']
    );

    Route::get('/stores/{storeId}/invoices', [InvoiceController::class, 'index']);

    Route::get(
        '/stores/{storeId}/invoices/{invoiceId}',
        [InvoiceController::class, 'show']
    );

    Route::get(
        '/stores/{storeId}/invoices/{invoiceId}/download',
        [InvoiceController::class, 'downloadPdf']
    );

});
