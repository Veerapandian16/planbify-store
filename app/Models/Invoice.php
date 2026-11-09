<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = [
        'store_id',
        'order_id',
        'invoice_number',
        'invoice_date',
        'subtotal',
        'discount_amount',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'shipping_amount',
        'total_amount',
        'payment_status',
    ];

    protected $casts = [
        'invoice_date' => 'date',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }
}
