<?php

use Illuminate\Support\Facades\Route;

// This Phase 0 endpoint verifies Laravel API routing before grocery-list CRUD exists.
Route::get('/health', fn () => response()->json(['status' => 'ok']));
