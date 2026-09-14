<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateEventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string'],
            'address' => ['required', 'string'],

            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after_or_equal:startDate'],

            'type' => ['nullable', 'string'],
            'qualification' => ['required', 'integer'],

            'participants' => ['required', 'integer', 'min:1'],

            'public' => ['required', 'string'],
            'nature' => ['required', 'string'],
            'detailedProgramPlan' => ['required', 'string'],
            'furnishedMethod' => ['required', 'string'],

            'needAccommodation' => ['required', 'boolean'],
            'needAccommodationNumber' => ['required_if:needAccommodation,true', 'integer', 'min:0'],

            'needParkingSpace' => ['required', 'boolean'],
            'needParkingSpaceNumber' => ['required_if:needParkingSpace,true', 'integer', 'min:0'],

            'producesTrash' => ['required', 'boolean'],
            'producesTrashDelivery' => ['nullable', 'string'],
            'producesTrashDeliveryWhoDelivers' => ['required', 'string'],

            'needWifi' => ['required', 'boolean'],
            'needEducationalTechnology' => ['required', 'boolean'],
            'needEducationalTechnologyItems' => ['nullable', 'string'],

            'participantsWithReducedMobility' => ['required', 'boolean'],
            'willBePhotos' => ['required', 'boolean'],
            'willBePhotosDevice' => ['nullable', 'string'],

            'needCatering' => ['required', 'boolean'],
            'needCateringType' => ['nullable', 'string'],

            'willBeConstruction' => ['required', 'boolean'],
            'constructionStartDate' => ['required_if:willBeConstruction,true', 'nullable', 'date'],
            'constructionEndDate' => ['required_if:willBeConstruction,true', 'nullable', 'date', 'after_or_equal:constructionStartDate'],
            'constructionSubcontractors' => ['nullable', 'string'],
            'constructionInHeights' => ['required', 'boolean'],
            'constructionNeedScaffolding' => ['required', 'boolean'],
            'constructionManualMaterialHandling' => ['required', 'boolean'],
            'constructionMechanicalMaterialHandling' => ['required', 'boolean'],
            'constructionMechanicalMaschines' => ['nullable', 'string'],
            'constructionMechanicalMaschinesOthers' => ['nullable', 'string'],

            'needCleaningBefore' => ['required', 'boolean'],
            'needCleaningDuringEvent' => ['required', 'boolean'],
            'needElectricians' => ['required', 'string'],
            'needElectricityFromCabinet' => ['required', 'boolean'],
            'needElectricityFromCabinetNumber' => ['nullable', 'string'],

            'fireHazardExpected' => ['required', 'boolean'],
            'fireHazardExpectedDescription' => ['nullable', 'string'],

            'expectedDustSmokeVapor' => ['required', 'string'],
            'expectedUsageOfChemicals' => ['required', 'boolean'],
            'expectedUsageOfChemicalsDescription' => ['nullable', 'string'],
            'expectedDecor' => ['required', 'boolean'],

            'organizerFullName' => ['required', 'string', 'max:255'],
            'organizerPhone' => ['required', 'string', 'max:50'],
            'organizerEmail' => ['required', 'email'],
            'organizerAddress' => ['required', 'string'],
            'moreOrganizer' => ['required', 'boolean'],

            'secondOrganizerFullName' => ['nullable', 'string', 'max:255'],
            'secondOrganizerPhone' => ['nullable', 'string'],
            'secondOrganizerEmail' => ['nullable', 'email'],
            'secondOrganizerAddress' => ['nullable', 'string'],

            'customerWithLegalBackgroundName' => ['required', 'string'],
            'customerWithLegalBackgroundAddress' => ['required', 'string'],
            'customerWithLegalBackgroundTaxNumber' => ['required', 'string'],
            'customerWithLegalBackgroundPhone' => ['required', 'string'],
            'customerWithLegalBackgroundEmail' => ['required', 'email'],
        ];
    }
}
