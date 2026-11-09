<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'product_id',
        'product_name',
        'product_description',
        'unit_price',
        'discount_amount',
        'gst_percentage',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'quantity',
        'line_total',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
