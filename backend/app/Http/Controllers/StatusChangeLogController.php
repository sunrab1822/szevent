<?php

namespace App\Http\Controllers;

use App\Models\AssignUser;
use App\Models\StatusChangeLog;

class StatusChangeLogController extends Controller
{
    public static function log($from, $to, $events_id, $users_id, $reason = null)
    {
        self::changed($events_id);
        StatusChangeLog::create([
            'from' => $from,
            'to' => $to,
            'events_id' => $events_id,
            'users_id' => $users_id,
            'reason' => $reason,
        ]);
    }

    public static function changed($event_id)
    {
        AssignUser::where('events_id', $event_id)->update(['seen' => false]);
    }
}
