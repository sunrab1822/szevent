<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = ['users_id', 'events_id', 'message', 'read_at'];

    protected $hidden = ['users_id', 'events_id', 'updated_at', 'event'];

    protected $appends = ['event_id', 'event_name'];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Get the event associated with the Notification
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'events_id')->withTrashed();
    }

    public function getEventIdAttribute()
    {
        return $this->events_id;
    }

    public function getEventNameAttribute()
    {
        return $this->event?->name;
    }
}
