<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('status:update-status-after-endet')->dailyAt('01:00');
