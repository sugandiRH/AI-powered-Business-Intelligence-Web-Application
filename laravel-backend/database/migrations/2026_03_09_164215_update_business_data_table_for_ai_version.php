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
        Schema::table('business_data', function (Blueprint $table) {

            $table->integer('quantity')->nullable()->change();
            $table->date('date')->nullable()->change();
            $table->string('category')->nullable()->change();

            $table->decimal('price',10,2)->nullable()->change();

            $table->decimal('total',10,2)->nullable()->after('price');

            $table->integer('month')->nullable()->after('date');
            $table->integer('year')->nullable()->after('month');
            

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
