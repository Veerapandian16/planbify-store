<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Store extends Model
{
    protected $fillable = [
        'user_id',
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
        'gstin',
        'gst_registered',
        'default_gst_percentage',
        'shipping_charge',
        'payment_method',
        'payment_instructions',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
