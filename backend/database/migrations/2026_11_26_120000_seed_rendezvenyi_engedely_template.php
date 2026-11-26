<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $path = 'templates/rendezvenyi_engedely_template.docx';

        if (! Storage::disk('public')->exists($path)) {
            return;
        }

        DB::table('doc_templates')->insert([
            'name' => 'Rendezvényi engedélyeztető',
            'path' => '/storage/'.$path,
            'type' => 7,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('doc_templates')
            ->where('type', 7)
            ->where('path', '/storage/templates/rendezvenyi_engedely_template.docx')
            ->delete();
    }
};
