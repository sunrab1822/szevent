<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Message extends Model
{
    protected $fillable = ['users_id', 'events_id', 'channel', 'message', 'mentions'];

    /**
     * Mentioned users: list of {userId, displayName, start, end}.
     */
    protected function mentions(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value ? json_decode($value, true) : [],
            set: fn ($value) => json_encode($value ?? []),
        );
    }

    /**
     * Get the sender associated with the Message
     */
    public function sender(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'users_id');
    }
}
