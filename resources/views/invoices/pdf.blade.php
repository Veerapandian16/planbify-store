<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice - {{ $invoice->invoice_number }}</title>

    <style>
        @page { margin: 35px; }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #263445;
            font-size: 11px;
        }

        .header {
            width: 100%;
            border-bottom: 3px solid #34445e;
            padding-bottom: 18px;
        }

        .header td { vertical-align: top; }

        .brand {
            font-size: 25px;
            font-weight: bold;
            color: #34445e;
        }

        .invoice-heading {
            text-align: right;
            font-size: 25px;
            font-weight: bold;
            color: #34445e;
        }

        .muted { color: #718096; line-height: 1.7; }

        .section { margin-top: 25px; }

        .section-title {
            font-size: 13px;
            font-weight: bold;
            color: #34445e;
            margin-bottom: 10px;
        }

        .details, .items, .totals {
            width: 100%;
            border-collapse: collapse;
        }

        .details td { padding: 5px; vertical-align: top; }

        .items { margin-top: 12px; }

        .items th {
            background: #34445e;
            color: white;
            padding: 10px 6px;
            text-align: left;
        }

        .items td {
            padding: 10px 6px;
            border-bottom: 1px solid #e2e8f0;
        }

        .right { text-align: right; }
        .center { text-align: center; }

        .totals {
            width: 48%;
            margin-left: auto;
            margin-top: 20px;
        }

        .totals td {
            padding: 7px;
            border-bottom: 1px solid #e2e8f0;
        }

        .grand-total {
            background: #34445e;
            color: white;
            font-size: 14px;
            font-weight: bold;
        }

        .status {
            display: inline-block;
            padding: 6px 12px;
            background: #fff4d6;
            color: #946200;
            font-weight: bold;
        }

        .footer {
            margin-top: 45px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #718096;
            font-size: 10px;
        }
    </style>
</head>

<body>

    <!-- HEADER -->
    <table class="header">
        <tr>
            <td width="55%">
                @if($store->logo && file_exists(storage_path('app/public/' . $store->logo)))
                    <img src="{{ storage_path('app/public/' . $store->logo) }}"
                         style="max-width: 100px; max-height: 65px;">
                @endif

                <div class="brand">{{ $store->store_name }}</div>

                <div class="muted">
                    {{ $store->business_name }}<br>
                    {{ $store->business_address }}<br>
                    Phone: {{ $store->phone }}<br>
                    Email: {{ $store->email }}<br>
                    @if($store->gst_registered && $store->gstin)
                        GSTIN: {{ $store->gstin }}
                    @endif
                </div>
            </td>

            <td width="45%">
                <div class="invoice-heading">TAX INVOICE</div>
                <div class="muted right">
                    <strong>Invoice Number:</strong><br>
                    {{ $invoice->invoice_number }}<br><br>

                    <strong>Invoice Date:</strong><br>
                    {{ $invoice->invoice_date->format('d M Y') }}<br><br>

                    <strong>Order Number:</strong><br>
                    {{ $invoice->order->order_number }}
                </div>
            </td>
        </tr>
    </table>

    <!-- CUSTOMER DETAILS -->
    <div class="section">
        <div class="section-title">BILL TO</div>

        <table class="details">
            <tr>
                <td width="50%">
                    <strong>{{ $invoice->order->customer_name }}</strong><br>
                    {{ $invoice->order->customer_phone }}<br>
                    {{ $invoice->order->customer_email }}<br>
                </td>

                <td width="50%">
                    <strong>Delivery Address</strong><br>
                    {{ $invoice->order->delivery_address }}<br>
                    {{ $invoice->order->city }},
                    {{ $invoice->order->state }} -
                    {{ $invoice->order->pincode }}
                </td>
            </tr>
        </table>
    </div>

    <!-- PRODUCT DETAILS -->
    <div class="section">
        <div class="section-title">ITEM DETAILS</div>

        <table class="items">
            <thead>
                <tr>
                    <th width="6%">#</th>
                    <th width="30%">Product</th>
                    <th width="13%" class="right">Unit Price</th>
                    <th width="9%" class="center">Qty</th>
                    <th width="13%" class="right">Discount</th>
                    <th width="10%" class="right">GST</th>
                    <th width="19%" class="right">Total</th>
                </tr>
            </thead>

            <tbody>
                @foreach($invoice->items as $index => $item)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>
                            <strong>{{ $item->product_name }}</strong><br>
                            <span class="muted">{{ $item->product_description }}</span>
                        </td>
                        <td class="right">₹{{ number_format($item->unit_price, 2) }}</td>
                        <td class="center">{{ $item->quantity }}</td>
                        <td class="right">₹{{ number_format($item->discount_amount, 2) }}</td>
                        <td class="right">
                            {{ number_format($item->gst_percentage, 2) }}%<br>
                            ₹{{ number_format($item->gst_amount, 2) }}
                        </td>
                        <td class="right">₹{{ number_format($item->line_total, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- TOTALS -->
    <table class="totals">
        <tr>
            <td>Subtotal</td>
            <td class="right">₹{{ number_format($invoice->subtotal, 2) }}</td>
        </tr>

        <tr>
            <td>Discount</td>
            <td class="right">₹{{ number_format($invoice->discount_amount, 2) }}</td>
        </tr>

        @if(($invoice->igst_amount ?? 0) > 0)
            <tr>
                <td>IGST</td>
                <td class="right">₹{{ number_format($invoice->igst_amount, 2) }}</td>
            </tr>
        @else
            <tr>
                <td>CGST</td>
                <td class="right">₹{{ number_format($invoice->cgst_amount ?? 0, 2) }}</td>
            </tr>
            <tr>
                <td>SGST</td>
                <td class="right">₹{{ number_format($invoice->sgst_amount ?? 0, 2) }}</td>
            </tr>
        @endif

        <tr>
            <td><strong>Total GST</strong></td>
            <td class="right">
                <strong>₹{{ number_format($invoice->gst_amount, 2) }}</strong>
            </td>
        </tr>

        <tr>
            <td>Shipping</td>
            <td class="right">₹{{ number_format($invoice->shipping_amount, 2) }}</td>
        </tr>

        <tr class="grand-total">
            <td>GRAND TOTAL</td>
            <td class="right">₹{{ number_format($invoice->total_amount, 2) }}</td>
        </tr>
    </table>

    <!-- PAYMENT STATUS -->
    <div class="section">
        <strong>Payment Status:</strong>
        <span class="status">{{ strtoupper($invoice->payment_status) }}</span>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        Thank you for shopping with {{ $store->store_name }}.<br>
        This is a computer-generated invoice.
    </div>

</body>
</html>
