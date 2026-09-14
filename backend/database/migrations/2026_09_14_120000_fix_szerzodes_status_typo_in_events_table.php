<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('events')
            ->where('status', 'Szerződés áttnézésre vár')
            ->update(['status' => 'Szerződés átnézésre vár']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('events')
            ->where('status', 'Szerződés átnézésre vár')
            ->update(['status' => 'Szerződés áttnézésre vár']);
    }
};
