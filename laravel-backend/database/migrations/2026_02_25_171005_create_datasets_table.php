<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('datasets', function (Blueprint $table) {
            $table->id();
            // Foreign Key
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('file_name');
            $table->timestamps();
        });

        Schema::create('business_data', function (Blueprint $table) {
            $table->id();
            // Foreign Key
            $table->foreignId('user_id')
                ->constrained()
                ->onDelete('cascade');

            $table->foreignId('dataset_id')
                ->constrained()
                ->onDelete('cascade');

            $table->date('date');
            $table->string('product');
            $table->string('category');
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('datasets');
    }
};
