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
        Schema::create('ai_column_mappings', function (Blueprint $table) {

            $table->id();

            $table->string('excel_column');
            $table->string('mapped_column');

            $table->decimal('confidence',5,2)->nullable();

            $table->boolean('created_by_ai')->default(true);

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
