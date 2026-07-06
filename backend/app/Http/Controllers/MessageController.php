<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function get_chat(Request $req)
    {

        $chat = Message::where('events_id', $req->eventId)->with('sender')->get();

        return response()->json($chat);
    }

    public function send(Request $req)
    {
        $message = Message::create([
            'users_id' => Auth::id(),
            'events_id' => $req->eventId,
            'message' => $req->message,
        ]);

        if (!$message){
            return response()->json([], 404);
        }

        StatusChangeLogController::changed($message->events_id);

        return response()->json();
    }
}
