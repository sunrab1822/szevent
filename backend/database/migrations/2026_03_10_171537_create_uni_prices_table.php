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
        Schema::create('uni_prices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('accommodation');
            $table->string('type');
            $table->integer('dailyPrice');
            $table->integer('hourlyPrice');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uni_prices');
    }
};
