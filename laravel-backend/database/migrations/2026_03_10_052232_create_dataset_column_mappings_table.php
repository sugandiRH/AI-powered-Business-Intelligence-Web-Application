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
        Schema::create('dataset_column_mappings', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('dataset_id');

            $table->string('excel_column');
            $table->string('mapped_column');

            $table->decimal('confidence',5,2)->nullable();

            $table->timestamps();

            $table->index(['dataset_id','excel_column']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dataset_column_mappings');
    }
};
