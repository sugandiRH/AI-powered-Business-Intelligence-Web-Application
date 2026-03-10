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

            $table->string('product')->nullable();
            $table->string('category')->nullable();

            $table->integer('quantity')->nullable();
            $table->decimal('price',10,2)->nullable();
            $table->decimal('total',10,2)->nullable();

            $table->date('date')->nullable();
            $table->integer('month')->nullable();
            $table->integer('year')->nullable();

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
        //
    }
};
