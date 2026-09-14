<?php

namespace App\Http\Controllers;

use App\Enums\ChatChannel;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    private function resolveChannel(Request $req): ?ChatChannel
    {
        $channel = ChatChannel::tryFrom($req->channel ?? $req->chatType ?? ChatChannel::Rendezvenyes->value);

        if (! $channel || ! $channel->allows(Auth::user()->role)) {
            return null;
        }

        return $channel;
    }

    public function get_chat(Request $req)
    {
        $channel = $this->resolveChannel($req);

        if (! $channel) {
            return response()->json([], 403);
        }

        $chat = Message::where('events_id', $req->eventId)
            ->where('channel', $channel->value)
            ->with('sender')
            ->get();

        return response()->json($chat);
    }

    public function send(Request $req)
    {
        $channel = $this->resolveChannel($req);

        if (! $channel) {
            return response()->json([], 403);
        }

        $message = Message::create([
            'users_id' => Auth::id(),
            'events_id' => $req->eventId,
            'channel' => $channel->value,
            'message' => $req->message,
            'mentions' => $this->sanitizeMentions($req->mentions),
        ]);

        if (! $message) {
            return response()->json([], 404);
        }

        StatusChangeLogController::changed(
            $message->events_id,
            'Új üzenet érkezett a chatben ('.$channel->label().').',
            array_map(fn ($role) => $role->value, $channel->allowedRoles())
        );

        return response()->json($message->load('sender'));
    }

    /**
     * Keep only well-formed mentions pointing to existing users.
     *
     * @return list<array{userId: int, displayName: string, start: int, end: int}>
     */
    private function sanitizeMentions($mentions): array
    {
        if (! is_array($mentions)) {
            return [];
        }

        $users = User::whereIn('id', collect($mentions)->pluck('userId'))
            ->get()
            ->keyBy('id');

        return collect($mentions)
            ->filter(fn ($m) => isset($m['userId'], $m['start'], $m['end'])
                && is_numeric($m['start']) && is_numeric($m['end'])
                && $m['end'] > $m['start']
                && $users->has($m['userId']))
            ->map(fn ($m) => [
                'userId' => (int) $m['userId'],
                'displayName' => $users[$m['userId']]->displayName ?? $users[$m['userId']]->name,
                'start' => (int) $m['start'],
                'end' => (int) $m['end'],
            ])
            ->values()
            ->all();
    }

    public function channels()
    {
        $channels = collect(ChatChannel::forRole(Auth::user()->role))
            ->map(fn (ChatChannel $channel) => [
                'key' => $channel->value,
                'label' => $channel->label(),
            ])
            ->values();

        return response()->json($channels);
    }
}
