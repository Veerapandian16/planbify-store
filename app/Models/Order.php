<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Order extends Model
{
    protected $fillable = [
        'store_id',
        'order_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'delivery_address',
        'city',
        'state',
        'pincode',
        'subtotal',
        'discount_amount',
        'gst_amount',
        'cgst_amount',
        'sgst_amount',
        'igst_amount',
        'shipping_amount',
        'total_amount',
        'order_status',
        'payment_status',
        'customer_id',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}