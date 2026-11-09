<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {

            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained('categories')
                  ->nullOnDelete();

            $table->string('sku')->nullable();

            $table->decimal('discount_price', 10, 2)->nullable();

            $table->decimal('gst_percentage', 5, 2)->default(0);

            $table->string('product_type')->default('physical');

            $table->boolean('is_available')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {

            $table->dropForeign(['category_id']);

            $table->dropColumn([
                'category_id',
                'sku',
                'discount_price',
                'gst_percentage',
                'product_type',
                'is_available',
            ]);
        });
    }
};