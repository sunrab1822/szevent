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
        Schema::table('famulus_offers', function (Blueprint $table) {
            $table->foreignId('versions_id')->nullable();
        });

        Schema::table('uni_offers', function (Blueprint $table) {
            $table->foreignId('versions_id')->nullable();
        });

        Schema::table('dorm_offers', function (Blueprint $table) {
            $table->foreignId('versions_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('famulus_offers', function (Blueprint $table) {
            $table->dropColumn('versions_id');
        });

        Schema::table('uni_offers', function (Blueprint $table) {
            $table->dropColumn('versions_id');
        });

        Schema::table('dorm_offers', function (Blueprint $table) {
            $table->dropColumn('versions_id');
        });
    }
};
