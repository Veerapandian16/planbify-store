<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('customer_id')
                ->nullable()
                ->after('store_id')
                ->constrained('customers')
                ->nullOnDelete();

            $table->index(['store_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['store_id', 'customer_id']);
            $table->dropConstrainedForeignId('customer_id');
        });
    }
};
