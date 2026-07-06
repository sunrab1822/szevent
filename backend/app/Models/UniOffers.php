<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UniOffers extends Model
{
    protected $fillable = ['events_id', 'offer_name', 'duration', 'price_per_unit', 'total_price', 'versions_id'];
}
