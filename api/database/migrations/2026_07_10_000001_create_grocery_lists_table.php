<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grocery_lists', function (Blueprint $table) {
            // UUID primary keys make saved list URLs addressable without integer IDs.
            $table->uuid('id')->primary();
            $table->string('name', 120);
            // Decimal storage matches the MVP budget precision without using floats in the database.
            $table->decimal('budget', 10, 2);
            // Items stay embedded as JSON for v0.0.1 instead of introducing a relational item table.
            $table->json('items');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grocery_lists');
    }
};
