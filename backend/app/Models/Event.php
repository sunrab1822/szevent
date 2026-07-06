<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    /** @use HasFactory<\Database\Factories\EventFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'location',
        'address',
        'startDate',
        'endDate',
        'type',
        'qualification',
        'participants',
        'public',
        'nature',
        'detailedProgramPlan',
        'furnishedMethod',
        'needAccommodation',
        'needAccommodationNumber',
        'needParkingSpace',
        'needParkingSpaceNumber',
        'producesTrash',
        'producesTrashDelivery',
        'producesTrashDeliveryWhoDelivers',
        'needWifi',
        'needEducationalTechnology',
        'needEducationalTechnologyItems',
        'participantsWithReducedMobility',
        'willBePhotos',
        'willBePhotosDevice',
        'needCatering',
        'needCateringType',
        'willBeConstruction',
        'constructionStartDate',
        'constructionEndDate',
        'constructionSubcontractors',
        'constructionInHeights',
        'constructionNeedScaffolding',
        'constructionManualMaterialHandling',
        'constructionMechanicalMaterialHandling',
        'constructionMechanicalMaschines',
        'constructionMechanicalMaschinesOthers',
        'needCleaningBefore',
        'needCleaningDuringEvent',
        'needElectricians',
        'needElectricityFromCabinet',
        'needElectricityFromCabinetNumber',
        'fireHazardExpected',
        'fireHazardExpectedDescription',
        'expectedDustSmokeVapor',
        'expectedUsageOfChemicals',
        'expectedUsageOfChemicalsDescription',
        'expectedDecor',
        'organizerFullName',
        'organizerPhone',
        'organizerEmail',
        'organizerAddress',
        'moreOrganizer',
        'secondOrganizerFullName',
        'secondOrganizerPhone',
        'secondOrganizerEmail',
        'secondOrganizerAddress',
        'customerWithLegalBackgroundName',
        'customerWithLegalBackgroundAddress',
        'customerWithLegalBackgroundTaxNumber',
        'customerWithLegalBackgroundPhone',
        'customerWithLegalBackgroundEmail',

        'status',
        'rejectReason',

        'famulusPrice',
        'dormPrice',
        'uniPrice',

        'registrationNumber',
        'Representative',
        'RepresentativeTitle',

        'filePath',
    ];

    protected $casts = [
        'needCateringType' => 'array',
        'constructionMechanicalMaschines' => 'array',
        'needElectricians' => 'array',
        'expectedDustSmokeVapor' => 'array',

    ];

    /**
     * Get all of the statusChanges for the Event
     */
    public function statusChanges(): HasMany
    {
        return $this->hasMany(StatusChangeLog::class, 'events_id', 'id')
            ->with('user');
    }

    /**
     * Get all of the assignedUser for the Event
     */
    public function assignedUser(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, AssignUser::class, 'events_id', 'id', 'id', 'users_id');
    }

    /**
     * Get all of the famulusoffers for the Event
     */
    public function famulusoffers(): HasMany
    {
        return $this->hasMany(FamulusOffers::class, 'events_id', 'id');
    }

        /**
     * Get all of the famulusoffers for the Event
     */
    public function unioffers(): HasMany
    {
        return $this->hasMany(unioffers::class, 'events_id', 'id');
    }
}
