<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Store;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // GET ALL CUSTOMERS FOR AN AUTHENTICATED STORE OWNER

    public function index(Request $request, $storeId)
    {
        // Verify that the authenticated user owns this store.
        $store = $request->user()
            ->stores()
            ->findOrFail($storeId);

        // Retrieve customers belonging only to this store.
        $query = Customer::where('store_id', $store->id)
            ->withCount('orders')
            ->withSum('orders', 'total_amount')
            ->withMax('orders', 'created_at')
            ->latest();

        // Search by customer name, phone or email.
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        $customers = $query->get();

        return response()->json([
            'message' => 'Customers retrieved successfully.',
            'data' => $customers,
        ]);
    }
}
