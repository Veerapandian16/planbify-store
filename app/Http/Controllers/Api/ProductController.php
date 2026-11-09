<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // Retrieve products belonging to an active store
    public function index($storeId)
    {
        $store = Store::where('is_active', true)->findOrFail($storeId);

        return response()->json([
            'message' => 'Products retrieved successfully.',
            'data' => $store->products()
                ->with(['category', 'images'])
                ->get(),
        ], 200);
    }

    // Create a product - store owner only
    public function store(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')
                    ->where('store_id', $storeId),
            ],
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'gst_percentage' => 'required|numeric|min:0|max:100',
            'product_type' => 'required|in:physical,service',
            'stock_quantity' => 'required_if:product_type,physical|nullable|integer|min:0',
            'is_available' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        $product = $store->products()->create($validated);

        return response()->json([
            'message' => 'Product created successfully.',
            'data' => $product,
        ], 201);
    }

    // Retrieve a single product from an active store
    public function show($storeId, $productId)
    {
        $store = Store::where('is_active', true)->findOrFail($storeId);

        $product = $store->products()
            ->with(['category', 'images'])
            ->findOrFail($productId);

        return response()->json([
            'message' => 'Product retrieved successfully.',
            'data' => $product,
        ], 200);
    }

    // Update a product - store owner only
    public function update(Request $request, $storeId, $productId)
    {
        $store = $this->ownedStore($request, $storeId);

        $product = $store->products()->findOrFail($productId);

        $validated = $request->validate([
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')
                    ->where('store_id', $storeId),
            ],
            'product_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sku' => 'nullable|string|max:255',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'gst_percentage' => 'required|numeric|min:0|max:100',
            'product_type' => 'required|in:physical,service',
            'stock_quantity' => 'required_if:product_type,physical|nullable|integer|min:0',
            'is_available' => 'required|boolean',
            'is_active' => 'required|boolean',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully.',
            'data' => $product,
        ], 200);
    }

    // Upload and replace multiple images - store owner only
    public function uploadImages(Request $request, $storeId, $productId)
    {
        $store = $this->ownedStore($request, $storeId);

        $product = $store->products()->findOrFail($productId);

        $request->validate([
            'images' => 'required|array|min:2|max:5',
            'images.*' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $oldImages = $product->images()->get();

        foreach ($oldImages as $oldImage) {
            Storage::disk('public')->delete($oldImage->image_path);
        }

        $product->images()->delete();

        $uploadedImages = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('products', 'public');

            $productImage = $product->images()->create([
                'image_path' => $path,
            ]);

            $uploadedImages[] = [
                'id' => $productImage->id,
                'image_path' => $path,
                'image_url' => Storage::disk('public')->url($path),
            ];
        }

        return response()->json([
            'message' => 'Product images uploaded successfully.',
            'data' => $uploadedImages,
        ], 201);
    }

    // Retrieve images belonging to a product in an active store
    public function getImages($storeId, $productId)
    {
        $store = Store::where('is_active', true)->findOrFail($storeId);

        $product = $store->products()
            ->with('images')
            ->findOrFail($productId);

        $images = $product->images->map(function ($image) {
            return [
                'id' => $image->id,
                'image_path' => $image->image_path,
                'image_url' => Storage::disk('public')->url($image->image_path),
            ];
        });

        return response()->json([
            'message' => 'Product images retrieved successfully.',
            'data' => $images,
        ], 200);
    }

    // Delete a product - store owner only
    public function destroy(Request $request, $storeId, $productId)
    {
        $store = $this->ownedStore($request, $storeId);

        $product = $store->products()
            ->with('images')
            ->findOrFail($productId);

        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully.',
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
