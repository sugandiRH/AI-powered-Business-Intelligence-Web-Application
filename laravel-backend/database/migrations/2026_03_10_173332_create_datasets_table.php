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
            $table->string('file_hash')->unique();
            $table->integer('total_rows')->default(0);
            $table->integer('valid_rows')->default(0);
            $table->integer('invalid_rows')->default(0);
            $table->string('status')->default('processing');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        Schema::create('business_data', function (Blueprint $table) {
            $table->id();
            // Foreign Key
            $table->foreignId('dataset_id')
                ->constrained()
                ->onDelete('cascade');

            $table->date('date')->nullable();
            $table->integer('month')->nullable();
            $table->integer('year')->nullable();

            $table->string('product');
            $table->string('category')->nullable();
            
            $table->integer('quantity')->nullable();
            $table->decimal('price', 10, 2)->nullable();
            $table->decimal('total',10,2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('datasets');
        Schema::dropIfExists('business_data');
    }
};
