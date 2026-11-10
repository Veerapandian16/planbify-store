<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    // CREATE ORDER / PUBLIC CUSTOMER CHECKOUT
    public function store(Request $request, $storeId)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',

            'delivery_address' => 'required|string',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'pincode' => 'required|string|max:10',

            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $order = DB::transaction(function () use ($validated, $storeId) {

            $store = Store::where('id', $storeId)
                ->where('is_active', true)
                ->firstOrFail();

            $customer = Customer::updateOrCreate(
                [
                    'store_id' => $store->id,
                    'customer_phone' => $validated['customer_phone'],
                ],
                [
                    'customer_name' => $validated['customer_name'],
                    'customer_email' => $validated['customer_email'] ?? null,
                ]
            );

            // Compare normalized state names for intra-state/inter-state GST.
            $sellerState = Str::lower(trim((string) $store->business_state));
            $buyerState = Str::lower(trim((string) $validated['state']));

            if ($sellerState === '') {
                throw ValidationException::withMessages([
                    'business_state' => ['Set your business state in Store Settings before accepting orders.'],
                ]);
            }

            $isIntraState = $sellerState === $buyerState;

            $subtotal = 0;
            $discountTotal = 0;
            $gstTotal = 0;
            $cgstTotal = 0;
            $sgstTotal = 0;
            $igstTotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {

                $product = Product::where('id', $item['product_id'])
                    ->where('store_id', $store->id)
                    ->lockForUpdate()
                    ->first();

                if (!$product || !$product->is_active || !$product->is_available) {
                    throw ValidationException::withMessages([
                        'items' => ['One or more products are unavailable.'],
                    ]);
                }

                $quantity = (int) $item['quantity'];

                if (
                    $product->product_type === 'physical' &&
                    $product->stock_quantity < $quantity
                ) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Insufficient stock for {$product->product_name}.",
                        ],
                    ]);
                }

                $regularPrice = (float) $product->price;

                $sellingPrice = $product->discount_price !== null
                    ? (float) $product->discount_price
                    : $regularPrice;

                if (
                    $sellingPrice < 0 ||
                    $sellingPrice > $regularPrice
                ) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Invalid pricing for {$product->product_name}.",
                        ],
                    ]);
                }

                $unitDiscount = $regularPrice - $sellingPrice;

                $lineSubtotal = $regularPrice * $quantity;
                $lineDiscount = $unitDiscount * $quantity;

                $taxableAmount = $lineSubtotal - $lineDiscount;

                $gstPercentage = (float) $product->gst_percentage;
                $lineGst = round($taxableAmount * $gstPercentage / 100, 2);

                // Split the already-rounded GST so the components always
                // add up exactly to the line's total GST amount.
                $lineCgst = $isIntraState ? round($lineGst / 2, 2) : 0;
                $lineSgst = $isIntraState ? round($lineGst - $lineCgst, 2) : 0;
                $lineIgst = $isIntraState ? 0 : $lineGst;

                $lineTotal = round($taxableAmount + $lineGst, 2);

                $subtotal += $lineSubtotal;
                $discountTotal += $lineDiscount;
                $gstTotal += $lineGst;
                $cgstTotal += $lineCgst;
                $sgstTotal += $lineSgst;
                $igstTotal += $lineIgst;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->product_name,
                    'product_description' => $product->description,
                    'unit_price' => $regularPrice,
                    'discount_amount' => $lineDiscount,
                    'gst_percentage' => $gstPercentage,
                    'gst_amount' => $lineGst,
                    'cgst_amount' => $lineCgst,
                    'sgst_amount' => $lineSgst,
                    'igst_amount' => $lineIgst,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                ];

                if ($product->product_type === 'physical') {
                    $product->decrement('stock_quantity', $quantity);
                }
            }

            $shippingAmount = (float) ($store->shipping_charge ?? 0);

            $gstTotal = round($gstTotal, 2);
            $cgstTotal = round($cgstTotal, 2);
            $sgstTotal = round($sgstTotal, 2);
            $igstTotal = round($igstTotal, 2);

            $totalAmount = round(
                $subtotal - $discountTotal + $gstTotal + $shippingAmount,
                2
            );

            $order = Order::create([
                'store_id' => $store->id,
                'customer_id' => $customer->id,

                'order_number' => 'ORD-' . $store->id . '-'
                    . now()->format('Ymd') . '-'
                    . Str::upper(Str::random(8)),

                'customer_name' => $validated['customer_name'],
                'customer_phone' => $validated['customer_phone'],
                'customer_email' => $validated['customer_email'] ?? null,

                'delivery_address' => $validated['delivery_address'],
                'city' => $validated['city'],
                'state' => $validated['state'],
                'pincode' => $validated['pincode'],

                'subtotal' => $subtotal,
                'discount_amount' => $discountTotal,
                'gst_amount' => $gstTotal,
                'cgst_amount' => $cgstTotal,
                'sgst_amount' => $sgstTotal,
                'igst_amount' => $igstTotal,
                'shipping_amount' => $shippingAmount,
                'total_amount' => $totalAmount,

                'order_status' => 'pending',
                'payment_status' => 'pending',
            ]);

            foreach ($orderItems as $orderItem) {
                $order->items()->create($orderItem);
            }

            // Automatically generate invoice
            $invoice = Invoice::create([
                'store_id' => $store->id,
                'order_id' => $order->id,
                'invoice_number' => 'INV-' . $store->id . '-'
                    . now()->format('Ymd') . '-'
                    . Str::upper(Str::random(8)),
                'invoice_date' => now()->toDateString(),
                'subtotal' => $subtotal,
                'discount_amount' => $discountTotal,
                'gst_amount' => $gstTotal,
                'cgst_amount' => $cgstTotal,
                'sgst_amount' => $sgstTotal,
                'igst_amount' => $igstTotal,
                'shipping_amount' => $shippingAmount,
                'total_amount' => $totalAmount,
                'payment_status' => $order->payment_status,
            ]);

            foreach ($orderItems as $orderItem) {
                $invoice->items()->create($orderItem);
            }

            return [
                'order' => $order,
                'invoice' => $invoice,
            ];
        });

        return response()->json([
            'message' => 'Order placed successfully. Invoice generated automatically.',
            'order' => $order['order']->load('items', 'customer'),
            'invoice' => $order['invoice']->load('items'),
        ], 201);
    }

    // Dashboard statistics - authenticated store owner only
    public function dashboardStats(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $orders = Order::where('store_id', $store->id);

        $totalRevenue = (clone $orders)
            ->where('order_status', '!=', 'cancelled')
            ->sum('total_amount');

        $paidRevenue = (clone $orders)
            ->where('order_status', '!=', 'cancelled')
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $pendingOrders = (clone $orders)
            ->where('order_status', 'pending')
            ->count();

        $recentOrders = (clone $orders)
            ->with('customer')
            ->latest()
            ->limit(5)
            ->get([
                'id',
                'store_id',
                'order_number',
                'customer_id',
                'customer_name',
                'total_amount',
                'order_status',
                'payment_status',
                'created_at',
            ]);

        return response()->json([
            'message' => 'Dashboard statistics retrieved successfully.',
            'data' => [
                'total_revenue' => round((float) $totalRevenue, 2),
                'paid_revenue' => round((float) $paidRevenue, 2),
                'pending_orders' => $pendingOrders,
                'recent_orders' => $recentOrders,
            ],
        ], 200);
    }


    // GET ALL ORDERS - STORE OWNER ONLY
    public function index(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $query = Order::where('store_id', $store->id)
            ->with('items')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhere('customer_name', 'like', "%{$search}%")
                    ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('order_status')) {
            $query->where('order_status', $request->order_status);
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        return response()->json([
            'message' => 'Orders retrieved successfully.',
            'data' => $query->get(),
        ]);
    }

    // GET SINGLE ORDER - STORE OWNER ONLY
    public function show(Request $request, $storeId, $orderId)
    {
        $store = $this->ownedStore($request, $storeId);

        $order = Order::where('store_id', $store->id)
            ->where('id', $orderId)
            ->with('items', 'customer')
            ->firstOrFail();

        return response()->json([
            'message' => 'Order retrieved successfully.',
            'data' => $order,
        ]);
    }

    // UPDATE ORDER AND PAYMENT STATUS - STORE OWNER ONLY
    public function updateStatus(Request $request, $storeId, $orderId)
    {
        $store = $this->ownedStore($request, $storeId);

        $validated = $request->validate([
            'order_status' => [
                'sometimes',
                'required',
                'in:pending,processing,shipped,delivered,cancelled',
            ],

            'payment_status' => [
                'sometimes',
                'required',
                'in:pending,paid,failed,refunded',
            ],
        ]);

        if (empty($validated)) {
            return response()->json([
                'message' => 'Provide at least one status to update.',
            ], 422);
        }

        $order = DB::transaction(function () use (
            $validated,
            $store,
            $orderId
        ) {
            $order = Order::where('store_id', $store->id)
                ->where('id', $orderId)
                ->lockForUpdate()
                ->firstOrFail();

            // A cancelled order cannot be reopened.
            if (
                $order->order_status === 'cancelled' &&
                isset($validated['order_status']) &&
                $validated['order_status'] !== 'cancelled'
            ) {
                throw ValidationException::withMessages([
                    'order_status' => [
                        'A cancelled order cannot be reopened.',
                    ],
                ]);
            }

            // Restore physical product stock only once.
            if (
                isset($validated['order_status']) &&
                $validated['order_status'] === 'cancelled' &&
                $order->order_status !== 'cancelled'
            ) {
                $items = $order->items()
                    ->lockForUpdate()
                    ->get();

                foreach ($items as $item) {
                    if (!$item->product_id) {
                        continue;
                    }

                    $product = Product::where('id', $item->product_id)
                        ->where('store_id', $store->id)
                        ->lockForUpdate()
                        ->first();

                    if (
                        $product &&
                        $product->product_type === 'physical'
                    ) {
                        $product->increment(
                            'stock_quantity',
                            $item->quantity
                        );
                    }
                }
            }

            // Order and payment statuses remain independent.
            $order->update($validated);

            // Synchronize invoice payment status.
            if (isset($validated['payment_status'])) {
                Invoice::where('store_id', $store->id)
                    ->where('order_id', $order->id)
                    ->update([
                        'payment_status' => $validated['payment_status'],
                    ]);
            }

            return $order->load('items', 'customer');
        });

        return response()->json([
            'message' => 'Order status updated successfully.',
            'data' => $order,
        ]);
    }

    // Verify authenticated owner
    private function ownedStore(Request $request, $storeId): Store
    {
        return $request->user()
            ->stores()
            ->findOrFail($storeId);
    }
}
