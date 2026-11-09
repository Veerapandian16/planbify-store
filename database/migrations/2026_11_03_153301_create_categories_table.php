
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('store_id')
                  ->constrained('stores')
                  ->cascadeOnDelete();

            $table->string('category_name');
            $table->text('description')->nullable();

            $table->timestamps();

            $table->unique(['store_id', 'category_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
