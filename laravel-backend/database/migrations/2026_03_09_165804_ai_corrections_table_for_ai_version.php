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
        Schema::create('ai_corrections', function (Blueprint $table) {

            $table->id();

            $table->string('column_name');

            $table->text('original_value');
            $table->text('suggested_value');

            $table->decimal('confidence',5,2)->nullable();

            $table->boolean('approved_by_user')->default(false);

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
