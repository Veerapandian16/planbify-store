<?php

use Illuminate\Support\Facades\Route;

// Production: Store subdomain
Route::domain('{storeSlug}.planbify.com')->group(function () {
    Route::get('/', function ($storeSlug) {
        return view('storefront', ['storeSlug' => $storeSlug]);
    });
});

// Local testing: Store path
Route::get('/store/{storeSlug}', function ($storeSlug) {
    return view('storefront', ['storeSlug' => $storeSlug]);
});

// Main application
Route::get('/', function () {
    return view('welcome');
});