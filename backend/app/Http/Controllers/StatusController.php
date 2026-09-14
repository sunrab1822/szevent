<?php

namespace App\Http\Controllers;

use App\Enums\Status;
use App\Models\AssignUser;
use App\Models\Event;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StatusController extends Controller
{
    public function get_events_by_status(Request $req)
{
    $userId = Auth::id();

    $stats = [
        'submitted' => Event::where('status', Status::BEERKEZETT)->with('assignedUser')->get()->values(),
        'offer' => Event::whereIn('status', [
            Status::UF_ARAJANLATRA_VAR,
            Status::UF_ARAJANLAT_ELFOGADASRA_VAR,
            Status::KOLI_ARAJANLATRA_VAR,
            Status::KOLI_ARAJANLAT_ELFOGADASRA_VAR,
            Status::ARAJANLTAN_KESZITESRE_VAR,
            Status::ARAJANLAT_ELFOGADASRA_VAR,
        ])->with('assignedUser')->get()->values(),
        'inProgress' => Event::whereIn('status', [
            Status::SZERZODESES_ADATOKRA_VAR,
            Status::SZERZODES_ATTNEZESRE_VAR,
            Status::PARTNERI_ALAIRASRA_VAR,
            Status::EGYETEMI_ALAIRASRA_VAR,
            Status::SZERZODES_KIKULDESRE_VAR,
            Status::SZERZODES_ALAIRVA,
            Status::TIG_JOVAHAGYASRA_VAR,
            Status::MEGVALOSULT_UF_IGAZOLASRA_VAR,
            Status::ADATKOZLO_FELKULDESERE_VAR,
            Status::ADATKOZLO_FELKULDVE,
        ])->with('assignedUser')->get()->values(),
        'settlement' => Event::whereIn('status', [
            Status::MEGVALOSULT_UF_IGAZOLASRA_VAR,
            Status::TIG_JOVAHAGYASRA_VAR,
            Status::ADATKOZLO_FELKULDESERE_VAR,
            Status::ADATKOZLO_FELKULDVE,
        ])->with('assignedUser')->get()->values(),
    ];

    $allEventIds = collect($stats)
        ->flatten(1)
        ->pluck('id')
        ->unique()
        ->values();

    $unseenEventIds = AssignUser::where('users_id', $userId)
        ->where('seen', false)
        ->whereIn('events_id', $allEventIds)
        ->pluck('events_id')
        ->merge(
            Notification::where('users_id', $userId)
                ->whereNull('read_at')
                ->whereIn('events_id', $allEventIds)
                ->pluck('events_id')
        )
        ->flip();

    foreach ($stats as $group => $events) {
        foreach ($events as $event) {
            $event->unSeen = isset($unseenEventIds[$event->id]);
        }
    }

    return response()->json($stats);
}

public function get_statistics(Request $req)
{
    $period = $req->input('period', 'year');
    if (! in_array($period, ['week', 'month', 'year'])) {
        $period = 'year';
    }

    $days = match ($period) {
        'week' => 7,
        'month' => 30,
        'year' => 365,
    };

    $allEvents = Event::select('id', 'name', 'status', 'startDate', 'endDate', 'created_at')
        ->orderByDesc('created_at')
        ->get();

    $received = $allEvents->filter(
        fn ($event) => $event->created_at >= now()->subDays($days)
    )->values();

    $groupByStatus = function ($events) {
        $grouped = $events->groupBy('status');

        return collect(Status::cases())->mapWithKeys(function ($status) use ($grouped) {
            $statusEvents = $grouped->get($status->value, collect());

            return [$status->value => [
                'count' => $statusEvents->count(),
                'events' => $statusEvents->values(),
            ]];
        });
    };

    $statusCounts = function ($events) {
        $counts = collect(Status::cases())
            ->mapWithKeys(fn ($status) => [$status->value => 0])
            ->all();

        foreach ($events->groupBy('status') as $status => $statusEvents) {
            $counts[$status] = $statusEvents->count();
        }

        return $counts;
    };

    $timeline = $received->groupBy(function ($event) use ($period) {
        return match ($period) {
            'week' => $event->created_at->toDateString(),
            'month' => $event->created_at->format('o').'-W'.$event->created_at->format('W'),
            'year' => $event->created_at->format('Y-m'),
        };
    })->sortKeys()->map(function ($events, $key) use ($period, $statusCounts) {
        $first = $events->min('created_at');

        return [
            'period' => $key,
            'start' => match ($period) {
                'week' => $first->toDateString(),
                'month' => $first->copy()->startOfWeek()->toDateString(),
                'year' => $first->copy()->startOfMonth()->toDateString(),
            },
            'total' => $events->count(),
            'statuses' => $statusCounts($events),
        ];
    })->values();

    return response()->json([
        'period' => $period,
        'all' => [
            'total' => $allEvents->count(),
            'statuses' => $groupByStatus($allEvents),
        ],
        'received' => [
            'days' => $days,
            'total' => $received->count(),
            'statuses' => $groupByStatus($received),
            'timeline' => $timeline,
        ],
    ]);
}
}
