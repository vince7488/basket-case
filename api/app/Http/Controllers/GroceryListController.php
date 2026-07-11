<?php

namespace App\Http\Controllers;

use App\Models\GroceryList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GroceryListController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Controllers translate HTTP requests into JSON API responses for the Vue app.
        $groceryList = GroceryList::create($this->validatedListData($request));

        return response()->json(['data' => $groceryList], 201);
    }

    public function show(GroceryList $groceryList): JsonResponse
    {
        // Route model binding resolves the UUID in /api/lists/{groceryList} to the matching record.
        return response()->json(['data' => $groceryList]);
    }

    public function update(Request $request, GroceryList $groceryList): JsonResponse
    {
        $groceryList->update($this->validatedListData($request));

        return response()->json(['data' => $groceryList]);
    }

    /**
     * @return array{name: string, budget: numeric, items: array<int, array{id: string, name: string, price: numeric, quantity: int}>}
     */
    private function validatedListData(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'budget' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array'],
            // Nested item rules validate each JSON item before the array is stored on grocery_lists.items.
            'items.*.id' => ['required', 'uuid'],
            'items.*.name' => ['required', 'string', 'max:160'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);
    }
}
