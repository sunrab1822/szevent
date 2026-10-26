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
        $path = 'profilpicks/default.png';

        if (! Storage::disk('public')->exists($path)) {
            Storage::disk('public')->put($path, file_get_contents(database_path('data/profilpicks/default.png')));
        }

        DB::table('users')
            ->where(function ($query) {
                $query->where('picture', 'like', '%profilpicks/default.png')
                    ->orWhereNull('picture')
                    ->orWhere('picture', '');
            })
            ->update(['picture' => 'https://rendezveny.sze.hu/storage/profilpicks/default.png']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $path = 'profilpicks/default.png';

        if (Storage::disk('public')->exists($path)
            && md5(Storage::disk('public')->get($path)) === md5_file(database_path('data/profilpicks/default.png'))) {
            Storage::disk('public')->delete($path);
        }
    }
};
