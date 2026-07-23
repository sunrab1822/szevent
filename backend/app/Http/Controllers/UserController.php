<?php

namespace App\Http\Controllers;

use App\Models\AssignUser;
use App\Models\Event;
use App\Models\StatusChangeLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function me(Request $request)
    {
        if (Auth::guard('sanctum')->check()) {
            $user = Auth::guard('sanctum')->user();

            return response()->json([
                'loggedin' => true,
                'user' => $user,
            ], 200);
        }

        return response()->json([
            'loggedin' => false,
        ], 401);
    }

    public function assign_user(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $requestedUserIds = $req->users;

        AssignUser::where('events_id', $event->id)
            ->whereNotIn('users_id', $requestedUserIds)
            ->delete();

        $eventUserIds = $event->assignedUser->pluck('id');

        collect($requestedUserIds)->map(function ($userId) use ($event, $eventUserIds) {
            if (! collect($eventUserIds)->contains($userId)) {
                AssignUser::create([
                    'users_id' => $userId,
                    'events_id' => $event->id,
                ]);
            }
        });

        return response()->json([$event->assignedUser()->get()]);
    }

    public function get_assigned_users(Request $req)
    {
        $event = Event::findOrFail($req->id);

        return response()->json([$event->assignedUser()->get()]);
    }

    public function set_role(Request $req)
    {

        $user = User::findOrFail($req->id);
        $user->role = $req->role;
        $user->save();

        return response()->json($user);
    }

    public function set_pfp(Request $req)
    {

        $user = User::where('id', Auth::id())->firstOrFail();
        $file = $req->file('file');
        $filename = explode('@', $user->name)[0] . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs('profilpicks', $filename, 'public');

        $user->picture = env('APP_URL') .  Storage::url($path);
        $user->save();

        return response()->json($user);
    }

    public function get_users()
    {
        return response()->json(['users' => User::all()]);
    }

    public function create_user(Request $request)
    {
        $user = User::updateOrCreate(
            [
                'name' => $request->name,
            ],
            [
                'name' => $request->name,
                'email' => '',
                'role_with_domain' => '',
                'displayName' => '',
            ]
        );

        $user = User::where('id', $user->id)->first();

        return response()->json(['user' => $user], 200);
    }

    public function delete(Request $request)
    {
        $user = User::where('id', $request->id)->first();
        $hasassignuser = AssignUser::where('users_id',$user->id)->exists();
        $hasstatus = StatusChangeLog::where('users_id', $user->id)->exists();


        if (!$hasassignuser && !$hasstatus) {
            $user->delete();
        }
        else{
            $user->admin = 0;
            $user->role = 0;
            $user->save();
        }

        return response()->json([], 201);
    }
}
