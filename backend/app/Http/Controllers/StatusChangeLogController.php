<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Mail\NotificationMail;
use App\Models\AssignUser;
use App\Models\Event;
use App\Models\Notification;
use App\Models\StatusChangeLog;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

use function Illuminate\Support\enum_value;

class StatusChangeLogController extends Controller
{
    public static function log($from, $to, $events_id, $users_id, $reason = null)
    {
        $message = 'Státusz megváltozott: '.enum_value($from).' → '.enum_value($to)
            .($reason ? " ({$reason})" : '');

        self::changed($events_id, $message);

        StatusChangeLog::create([
            'from' => $from,
            'to' => $to,
            'events_id' => $events_id,
            'users_id' => $users_id,
            'reason' => $reason,
        ]);
    }

    public static function changed($event_id, ?string $message = null, ?array $roles = null)
    {
        AssignUser::where('events_id', $event_id)->update(['seen' => false]);

        $recipientIds = $roles === null
            ? AssignUser::where('events_id', $event_id)->pluck('users_id')
                ->merge(User::where('role', Role::Unifamulus->value)->pluck('id'))
                ->unique()
            : User::whereIn('role', $roles)->pluck('id');

        $message ??= 'A rendezvény módosult.';
        $now = now();

        Notification::insert($recipientIds->map(fn ($userId) => [
            'users_id' => $userId,
            'events_id' => $event_id,
            'message' => $message,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all());

        $event = Event::withTrashed()->find($event_id);

        User::whereIn('id', $recipientIds)
            ->where('email_notifications', true)
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->each(fn ($user) => Mail::to($user->email)->send(
                new NotificationMail($user->displayName ?: $user->name, $event?->name, $message)
            ));
    }
}
