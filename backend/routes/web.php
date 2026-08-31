<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'PRIMEPOWER HR Smart Recruitment API',
        'version' => '1.0.0',
    ]);
});
