<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Version extends Model
{
    protected $fillable = ['events_id', 'offer_type', 'reason', 'version'];

    /**
     * Get all of the  uniOffers for the Version
     */
    public function famulusOffers(): HasMany
    {
        return $this->hasMany(FamulusOffers::class, 'versions_id');
    }

    /**
     * Get all of the  uniOffers for the Version
     */
    public function dormOffers(): HasMany
    {
        return $this->hasMany(DormOffers::class, 'versions_id');
    }

    /**
     * Get all of the  uniOffers for the Version
     */
    public function uniOffers(): HasMany
    {
        return $this->hasMany(UniOffers::class, 'versions_id');
    }
}
