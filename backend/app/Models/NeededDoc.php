<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NeededDoc extends Model
{
    protected $fillable = ['events_id', 'doc_templates_id'];
}
