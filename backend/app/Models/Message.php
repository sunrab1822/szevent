<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Message extends Model
{
    protected $fillable = ['users_id','events_id','message'];


    /**
     * Get the sender associated with the Message
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function sender(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'users_id');
    }
}
