<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocTemplate extends Model
{
     protected $fillable = ['path', 'name', 'type'];
}
