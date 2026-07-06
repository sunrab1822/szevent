<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FamulusOffers extends Model
{
    protected $fillable = ['events_id','offer_name','duration','price_per_unit','total_price','night', 'versions_id'];
}
