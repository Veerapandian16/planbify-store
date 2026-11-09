<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class StoreController extends Controller
{
    // Create a store for the authenticated owner
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'store_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'business_address' => 'nullable|string',
            'business_state' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'whatsapp_number' => 'nullable|string|max:20',
            'is_active' => 'sometimes|boolean',
        ]);

        $subdomain = Str::slug($validated['store_name']);

        if (Store::where('subdomain', $subdomain)->exists()) {
            return response()->json([
                'message' => 'This store name is already taken.',
            ], 409);
        }

        $store = $request->user()->stores()->create([
            ...$validated,
            'subdomain' => $subdomain,
        ]);

        return response()->json([
            'message' => 'Store created successfully.',
            'data' => $store,
        ], 201);
    }

    // Retrieve active stores for public storefront discovery
    public function index()
    {
        $stores = Store::where('is_active', true)
            ->get([
                'id',
                'business_name',
                'store_name',
                'subdomain',
                'owner_name',
                'email',
                'phone',
                'business_address',
                'business_state',
                'logo',
                'banner',
                'description',
                'whatsapp_number',
                'is_active',
            ]);

        return response()->json([
            'message' => 'Stores retrieved successfully.',
            'data' => $stores,
        ], 200);
    }

    // Retrieve one active store for its public storefront
    public function show($storeId)
    {
        $store = Store::where('is_active', true)
            ->findOrFail($storeId);

        $publicStore = $store->only([
            'id',
            'business_name',
            'store_name',
            'subdomain',
            'owner_name',
            'email',
            'phone',
            'business_address',
            'business_state',
            'logo',
            'banner',
            'description',
            'whatsapp_number',
            'is_active',
        ]);

        return response()->json([
            'message' => 'Store retrieved successfully.',
            'data' => $publicStore,
        ], 200);
    }

    // Retrieve complete store details for the authenticated owner
    public function manageShow(Request $request, $storeId)
    {
        $store = $request->user()
            ->stores()
            ->findOrFail($storeId);

        return response()->json([
            'message' => 'Store details retrieved successfully.',
            'data' => $store,
        ], 200);
    }

    // Update details and settings - owner only
    public function update(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $validated = $request->validate([
            'business_name' => 'sometimes|required|string|max:255',
            'store_name' => 'sometimes|required|string|max:255',
            'owner_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'business_address' => 'sometimes|nullable|string',
            'business_state' => 'sometimes|nullable|string|max:100',
            'description' => 'sometimes|nullable|string',
            'whatsapp_number' => 'sometimes|nullable|string|max:20',
            'is_active' => 'sometimes|boolean',

            // GST settings
            'gstin' => 'sometimes|nullable|string|size:15',
            'gst_registered' => 'sometimes|boolean',
            'default_gst_percentage' => 'sometimes|numeric|min:0|max:100',

            // Shipping settings
            'shipping_charge' => 'sometimes|numeric|min:0',

            // Payment settings
            'payment_method' => 'sometimes|in:cod,bank_transfer',
            'payment_instructions' => 'sometimes|nullable|string',
        ]);

        if (isset($validated['store_name'])) {
            $subdomain = Str::slug($validated['store_name']);

            if (Store::where('subdomain', $subdomain)
                ->where('id', '!=', $storeId)
                ->exists()) {
                return response()->json([
                    'message' => 'This store name is already taken.',
                ], 409);
            }

            $validated['subdomain'] = $subdomain;
        }

        $store->update($validated);

        return response()->json([
            'message' => 'Store updated successfully.',
            'data' => $store->fresh(),
        ], 200);
    }

    // Upload store logo and banner - owner only
    public function uploadImages(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $request->validate([
            'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'banner' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $data = [];

        if ($request->hasFile('logo')) {
            if ($store->logo) {
                Storage::disk('public')->delete($store->logo);
            }

            $data['logo'] = $request->file('logo')
                ->store('stores/logos', 'public');
        }

        if ($request->hasFile('banner')) {
            if ($store->banner) {
                Storage::disk('public')->delete($store->banner);
            }

            $data['banner'] = $request->file('banner')
                ->store('stores/banners', 'public');
        }

        $store->update($data);

        return response()->json([
            'message' => 'Store images uploaded successfully.',
            'data' => [
                'logo' => $store->logo
                    ? Storage::disk('public')->url($store->logo)
                    : null,
                'banner' => $store->banner
                    ? Storage::disk('public')->url($store->banner)
                    : null,
            ],
        ], 200);
    }

    // Delete a store - owner only
    public function destroy(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $store->delete();

        return response()->json([
            'message' => 'Store deleted successfully.',
        ], 200);
    }

    // Find a store only if it belongs to the authenticated owner
    private function ownedStore(Request $request, $storeId): Store
    {
        return $request->user()
            ->stores()
            ->findOrFail($storeId);
    }
}
