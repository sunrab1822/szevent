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
        Schema::table('events', function (Blueprint $table) {
            $table->string('registrationNumber')->nullable();
            $table->string('Representative')->nullable();
            $table->string('RepresentativeTitle')->nullable();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('registrationNumber');
            $table->dropColumn('Representative');
            $table->dropColumn('RepresentativeTitle');
        });
    }
};
