<?php

namespace App\Http\Controllers;

use App\Enums\Status;
use App\Models\AssignUser;
use App\Models\Event;
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
        ->flip();

    foreach ($stats as $group => $events) {
        foreach ($events as $event) {
            $event->unSeen = isset($unseenEventIds[$event->id]);
        }
    }

    return response()->json($stats);
}
}
