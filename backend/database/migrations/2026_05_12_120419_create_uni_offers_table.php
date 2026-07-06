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
        Schema::create('uni_offers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('events_id')->constrained();
            $table->string('offer_name');
            $table->integer('duration');
            $table->integer('price_per_unit');
            $table->integer('total_price');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uni_offers');
    }
};
