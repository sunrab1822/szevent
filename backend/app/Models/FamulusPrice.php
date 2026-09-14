<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamulusPrice extends Model
{
    protected $fillable = ['name', 'default', 'weekend', 'external', 'external_weekend'];
    public $timestamps = false;
}
