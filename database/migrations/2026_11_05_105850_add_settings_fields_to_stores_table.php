<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->string('gstin', 15)->nullable();
            $table->boolean('gst_registered')->default(false);
            $table->decimal('default_gst_percentage', 5, 2)->default(18);
            $table->decimal('shipping_charge', 10, 2)->default(0);
            $table->string('payment_method', 30)->default('cod');
            $table->text('payment_instructions')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn([
                'gstin',
                'gst_registered',
                'default_gst_percentage',
                'shipping_charge',
                'payment_method',
                'payment_instructions',
            ]);
        });
    }
};