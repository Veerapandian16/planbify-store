<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Seller state for GST comparison
        Schema::table('stores', function (Blueprint $table) {
            $table->string('business_state', 100)->nullable();
        });

        // Order-level GST breakdown
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('cgst_amount', 12, 2)->default(0);
            $table->decimal('sgst_amount', 12, 2)->default(0);
            $table->decimal('igst_amount', 12, 2)->default(0);
        });

        // Order item GST snapshots
        Schema::table('order_items', function (Blueprint $table) {
            $table->decimal('cgst_amount', 10, 2)->default(0);
            $table->decimal('sgst_amount', 10, 2)->default(0);
            $table->decimal('igst_amount', 10, 2)->default(0);
        });

        // Invoice-level GST breakdown
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('cgst_amount', 12, 2)->default(0);
            $table->decimal('sgst_amount', 12, 2)->default(0);
            $table->decimal('igst_amount', 12, 2)->default(0);
        });

        // Invoice item GST snapshots
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->decimal('cgst_amount', 10, 2)->default(0);
            $table->decimal('sgst_amount', 10, 2)->default(0);
            $table->decimal('igst_amount', 10, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropColumn([
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
            ]);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
            ]);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn([
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
            ]);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'cgst_amount',
                'sgst_amount',
                'igst_amount',
            ]);
        });

        Schema::table('stores', function (Blueprint $table) {
            $table->dropColumn('business_state');
        });
    }
};
