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
        Schema::create('temp_business_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dataset_id')
                ->constrained()
                ->onDelete('cascade');

            $table->string('date')->nullable();
            $table->string('month')->nullable();
            $table->string('year')->nullable();
            
            $table->string('product')->nullable();
            $table->string('category')->nullable();

            $table->string('quantity')->nullable();
            $table->string('price')->nullable();
            $table->string('total')->nullable();

            $table->boolean('is_valid')->default(false);
            $table->text('validation_error')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_business_data');
    }
};
