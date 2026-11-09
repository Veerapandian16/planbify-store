<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceController extends Controller
{
    // Generate or retrieve invoice from an existing order - owner only
    public function store(Request $request, $storeId, $orderId)
    {
        $store = $this->ownedStore($request, $storeId);

        $invoice = DB::transaction(function () use ($store, $orderId) {

            $order = Order::where('store_id', $store->id)
                ->where('id', $orderId)
                ->with('items')
                ->lockForUpdate()
                ->firstOrFail();

            $existingInvoice = Invoice::where('store_id', $store->id)
                ->where('order_id', $order->id)
                ->first();

            if ($existingInvoice) {
                return $existingInvoice->load('items', 'order');
            }

            $invoice = Invoice::create([
                'store_id' => $store->id,
                'order_id' => $order->id,
                'invoice_number' => 'INV-' . $store->id . '-'
                    . now()->format('Ymd') . '-'
                    . Str::upper(Str::random(8)),
                'invoice_date' => now()->toDateString(),
                'subtotal' => $order->subtotal,
                'discount_amount' => $order->discount_amount,
                'gst_amount' => $order->gst_amount,
                'cgst_amount' => $order->cgst_amount,
                'sgst_amount' => $order->sgst_amount,
                'igst_amount' => $order->igst_amount,
                'shipping_amount' => $order->shipping_amount,
                'total_amount' => $order->total_amount,
                'payment_status' => $order->payment_status,
            ]);

            foreach ($order->items as $item) {
                $invoice->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product_name,
                    'product_description' => $item->product_description,
                    'unit_price' => $item->unit_price,
                    'discount_amount' => $item->discount_amount,
                    'gst_percentage' => $item->gst_percentage,
                    'gst_amount' => $item->gst_amount,
                    'cgst_amount' => $item->cgst_amount,
                    'sgst_amount' => $item->sgst_amount,
                    'igst_amount' => $item->igst_amount,
                    'quantity' => $item->quantity,
                    'line_total' => $item->line_total,
                ]);
            }

            return $invoice->load('items', 'order');
        });

        return response()->json([
            'message' => 'Invoice retrieved or generated successfully.',
            'data' => $invoice,
        ], 200);
    }

    // Retrieve all invoices - store owner only
    public function index(Request $request, $storeId)
    {
        $store = $this->ownedStore($request, $storeId);

        $invoices = Invoice::where('store_id', $store->id)
            ->with('order')
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Invoices retrieved successfully.',
            'data' => $invoices,
        ]);
    }

    // Retrieve one invoice - store owner only
    public function show(Request $request, $storeId, $invoiceId)
    {
        $store = $this->ownedStore($request, $storeId);

        $invoice = Invoice::where('store_id', $store->id)
            ->where('id', $invoiceId)
            ->with(['order', 'items'])
            ->firstOrFail();

        return response()->json([
            'message' => 'Invoice retrieved successfully.',
            'data' => $invoice,
        ]);
    }

    // Download invoice PDF - store owner only
    public function downloadPdf(Request $request, $storeId, $invoiceId)
    {
        $store = $this->ownedStore($request, $storeId);

        $invoice = Invoice::where('store_id', $store->id)
            ->where('id', $invoiceId)
            ->with(['order', 'items'])
            ->firstOrFail();

        $pdf = Pdf::loadView('invoices.pdf', [
            'invoice' => $invoice,
            'store' => $store,
        ])->setPaper('a4', 'portrait');

        $filename = $invoice->invoice_number . '.pdf';

        return $pdf->download($filename);
    }

    // Verify that the authenticated user owns the requested store
    private function ownedStore(Request $request, $storeId): Store
    {
        return $request->user()
            ->stores()
            ->findOrFail($storeId);
    }
}
