<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    // Display categories belonging to an active public store
    public function index($storeId)
    {
        $store = Store::where('is_active', true)->findOrFail($storeId);

        return response()->json([
            'message' => 'Categories retrieved successfully.',
            'data' => $store->categories,
        ], 200);
    }

    // Create a category - store owner only
    public function store(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $validated = $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'category_name')
                    ->where('store_id', $storeId),
            ],
            'description' => 'nullable|string',
        ]);

        $category = $store->categories()->create($validated);

        return response()->json([
            'message' => 'Category created successfully.',
            'data' => $category,
        ], 201);
    }

    // Retrieve a single category - authenticated owner only
    public function show(Request $request, $storeId, $categoryId)
    {
        $store = $this->ownedStore($request, $storeId);

        $category = $store->categories()->findOrFail($categoryId);

        return response()->json([
            'message' => 'Category retrieved successfully.',
            'data' => $category,
        ], 200);
    }

    // Update a category - store owner only
    public function update(Request $request, $storeId, $categoryId)
    {
        $store = $this->ownedStore($request, $storeId);

        $category = $store->categories()->findOrFail($categoryId);

        $validated = $request->validate([
            'category_name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'category_name')
                    ->where('store_id', $storeId)
                    ->ignore($category->id),
            ],
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully.',
            'data' => $category,
        ], 200);
    }

    // Delete a category - store owner only
    public function destroy(Request $request, $storeId, $categoryId)
    {
        $store = $this->ownedStore($request, $storeId);

        $category = $store->categories()->findOrFail($categoryId);

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully.',
        ], 200);
    }

    // Verify that the authenticated user owns the requested store
    private function ownedStore(Request $request, $storeId): Store
    {
        return $request->user()
            ->stores()
            ->findOrFail($storeId);
    }
}
