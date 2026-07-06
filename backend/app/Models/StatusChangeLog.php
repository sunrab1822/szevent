<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class StatusChangeLog extends Model
{
    protected $fillable = ['from','to' ,'events_id', 'users_id', 'reason'];

    /**
     * Get the username associated with the StatusChangeLog
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'users_id');
    }
}
