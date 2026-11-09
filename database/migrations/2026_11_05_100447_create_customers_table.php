<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('store_id')
                ->constrained('stores')
                ->cascadeOnDelete();

            $table->string('customer_name');
            $table->string('customer_phone', 20);
            $table->string('customer_email')->nullable();

            $table->timestamps();

            // A phone number identifies a customer within a store.
            $table->unique(
                ['store_id', 'customer_phone'],
                'customers_store_phone_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
