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
        Schema::create('status_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('events_id')->constrained();
            $table->foreignId('users_id')->constrained();
            $table->string('from');
            $table->string('to');
            $table->string('reason')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_change_logs');
    }
};
