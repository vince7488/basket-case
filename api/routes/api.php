<?php

use App\Http\Controllers\GroceryListController;
use Illuminate\Support\Facades\Route;

// This Phase 0 endpoint verifies Laravel API routing before grocery-list CRUD exists.
Route::get('/health', fn () => response()->json(['status' => 'ok']));

// The MVP exposes only create, read, and update list endpoints; no dashboard index or delete route.
Route::post('/lists', [GroceryListController::class, 'store']);
Route::get('/lists/{groceryList}', [GroceryListController::class, 'show']);
Route::put('/lists/{groceryList}', [GroceryListController::class, 'update']);
