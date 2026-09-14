<?php

namespace App\Console\Commands;

use App\Models\Event;
use Illuminate\Console\Command;

class UpdateStatusAfterEndet extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'status:update-status-after-endet';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Updates record statuses every midnight';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Event::where('endDate', '<', now()->toDateString())
                ->where('status', 'Megvalósulásra vár')
                ->update(['status' => 'Megvalósult - UF igazolásra vár']);
    }
}
