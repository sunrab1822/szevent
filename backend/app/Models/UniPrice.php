<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniPrice extends Model
{
    protected $fillable = ['name', 'accommodation', 'type', 'dailyPrice', 'hourlyPrice'];
    public $timestamps = false;
}
