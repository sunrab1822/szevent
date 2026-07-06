<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignUser extends Model
{
    protected $fillable = ['users_id', 'events_id','seen'];
}
