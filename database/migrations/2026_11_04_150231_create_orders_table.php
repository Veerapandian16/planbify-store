<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('store_id')
                ->constrained('stores')
                ->cascadeOnDelete();

            $table->string('order_number');

            // Customer details
            $table->string('customer_name');
            $table->string('customer_phone', 20);
            $table->string('customer_email')->nullable();

            // Delivery details
            $table->text('delivery_address');
            $table->string('city');
            $table->string('state');
            $table->string('pincode', 10);

            // Order calculations
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('gst_amount', 12, 2)->default(0);
            $table->decimal('shipping_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2)->default(0);

            // Independent statuses
            $table->string('order_status')->default('pending');
            $table->string('payment_status')->default('pending');

            $table->timestamps();

            $table->unique(
                ['store_id', 'order_number'],
                'orders_store_order_number_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};