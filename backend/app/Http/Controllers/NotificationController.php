<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function read(Request $req)
    {
        Notification::where('id', $req->id)
            ->where('users_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json();
    }

    public function readAll()
    {
        Notification::where('users_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json();
    }

    public function setEmailNotifications(Request $req)
    {
        $user = Auth::user();
        $user->email_notifications = $req->notification_email_enabled;
        $user->save();

        return response()->json($user);
    }
}
