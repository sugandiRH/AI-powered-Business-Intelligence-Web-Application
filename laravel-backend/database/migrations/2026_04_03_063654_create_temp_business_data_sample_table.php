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
        Schema::create('temp_business_data_sample', function (Blueprint $table) {
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
            $table->json('validation_errors')->nullable();
            $table->string('error_level')->nullable();

            $table->dateTime('suggested_date')->nullable();
            $table->tinyInteger('suggested_month')->nullable();
            $table->smallInteger('suggested_year')->nullable();

            $table->string('suggested_category')->nullable();
            $table->string('suggested_product')->nullable();

            $table->decimal('suggested_price', 10, 2)->nullable();
            $table->decimal('suggested_quantity', 10, 2)->nullable();
            $table->decimal('suggested_total', 10, 2)->nullable();     
            
            $table->boolean('user_confirmed')->default(false);

            $table->boolean('ai_correction')->default(false);
            $table->text('corrected_Field_by_ai')->nullable();
            $table->text('corrected_data')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('temp_business_data_sample');
    }
};
