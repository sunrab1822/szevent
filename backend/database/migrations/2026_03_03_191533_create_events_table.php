<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->text('description');
            $table->string('location');
            $table->string('address');
            $table->dateTime('startDate');
            $table->dateTime('endDate');
            $table->string('type')->nullable();
            $table->integer('qualification');
            $table->integer('participants');
            $table->string('public');
            $table->string('nature');
            $table->string('detailedProgramPlan');
            $table->string('furnishedMethod');
            $table->boolean('needAccommodation')->default(false);
            $table->integer('needAccommodationNumber')->nullable();
            $table->boolean('needParkingSpace')->default(false);
            $table->integer('needParkingSpaceNumber')->nullable();
            $table->boolean('producesTrash')->default(false);
            $table->string('producesTrashDelivery')->nullable();
            $table->string('producesTrashDeliveryWhoDelivers')->nullable();
            $table->boolean('needWifi')->default(false);
            $table->boolean('needEducationalTechnology')->default(false);
            $table->string('needEducationalTechnologyItems')->nullable();
            $table->boolean('participantsWithReducedMobility')->default(false);
            $table->boolean('willBePhotos')->default(false);
            $table->string('willBePhotosDevice')->nullable();
            $table->boolean('needCatering')->default(false);
            $table->string('needCateringType')->nullable();

            $table->boolean('willBeConstruction')->default(false);
            $table->date('constructionStartDate')->nullable();
            $table->date('constructionEndDate')->nullable();
            $table->string('constructionSubcontractors')->nullable();
            $table->boolean('constructionInHeights')->default(false);
            $table->boolean('constructionNeedScaffolding')->default(false);
            $table->boolean('constructionManualMaterialHandling')->default(false);
            $table->boolean('constructionMechanicalMaterialHandling')->default(false);
            $table->string('constructionMechanicalMaschines')->nullable();
            $table->string('constructionMechanicalMaschinesOthers')->nullable();

            $table->boolean('needCleaningBefore')->default(false);
            $table->boolean('needCleaningDuringEvent')->default(false);
            $table->string('needElectricians')->nullable();
            $table->boolean('needElectricityFromCabinet')->default(false);
            $table->string('needElectricityFromCabinetNumber')->nullable();

            $table->boolean('fireHazardExpected')->default(false);
            $table->text('fireHazardExpectedDescription')->nullable();

            $table->string('expectedDustSmokeVapor')->nullable();
            $table->boolean('expectedUsageOfChemicals')->default(false);
            $table->text('expectedUsageOfChemicalsDescription')->nullable();
            $table->boolean('expectedDecor')->default(false);

            $table->string('organizerFullName');
            $table->string('organizerPhone');
            $table->string('organizerEmail');
            $table->string('organizerAddress');
            $table->string('moreOrganizer')->nullable();

            $table->string('secondOrganizerFullName')->nullable();
            $table->string('secondOrganizerPhone')->nullable();
            $table->string('secondOrganizerEmail')->nullable();
            $table->string('secondOrganizerAddress')->nullable();

            $table->string('customerWithLegalBackgroundName')->nullable();
            $table->string('customerWithLegalBackgroundAddress')->nullable();
            $table->string('customerWithLegalBackgroundTaxNumber')->nullable();
            $table->string('customerWithLegalBackgroundPhone')->nullable();
            $table->string('customerWithLegalBackgroundEmail')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};


// $table->string('name');: "",
// $table->string('description');: "",
// $table->string('location');: "",
// $table->string('address');: "9026 Győr, Egyetem tér 1.",
// $table->string('startDate');: "",
// $table->string('endDate');: "",
// $table->string('type');: null,
// $table->string('qualification');: null,
// $table->string('participants');: 1,
// $table->string('public');: false,
// $table->string('nature');: "",
// $table->string('detailedProgramPlan');: "",
// $table->string('furnishedMethod');: "",
// $table->string('needAccommodation');: false,
// $table->string('needAccommodationNumber');: 1,
// $table->string('needParkingSpace');: false,
// $table->string('needParkingSpaceNumber');: 1,
// $table->string('producesTrash');: false,
// $table->string('producesTrashDelivery');: null,
// $table->string('producesTrashDeliveryWhoDelivers');: "",
// $table->string('needWifi');: false,
// $table->string('needEducationalTechnology');: false,
// $table->string('needEducationalTechnologyItems');: "",
// $table->string('participantsWithReducedMobility');: false,
// $table->string('willBePhotos');: false,
// $table->string('willBePhotosDevice');: "",
// $table->string('needCatering');: false,
// $table->string('needCateringType');: [],
// $table->string('willBeConstruction');: false,
// $table->string('constructionStartDate');: "",
// $table->string('constructionEndDate');: "",
// $table->string('constructionSubcontractors');: "",
// $table->string('constructionInHeights');: false,
// $table->string('constructionNeedScaffolding');: false,
// $table->string('constructionManualMaterialHandling');: false,
// $table->string('constructionMechanicalMaterialHandling');: false,
// $table->string('constructionMechanicalMaschines');: [],
// $table->string('constructionMechanicalMaschinesOthers');: "",
// $table->string('needCleaningBefore');: false,
// $table->string('needCleaningDuringEvent');: false,
// $table->string('needElectricians');: [],
// $table->string('needElectricityFromCabinet');: false,
// $table->string('needElectricityFromCabinetNumber');: "",
// $table->string('fireHazardExpected');: false,
// $table->string('fireHazardExpectedDescription');: "",
// $table->string('expectedDustSmokeVapor');: [],
// $table->string('expectedUsageOfChemicals');: false,
// $table->string('expectedUsageOfChemicalsDescription');: "",
// $table->string('expectedDecor');: false,
// $table->string('organizerFullName');: "",
// $table->string('organizerPhone');: "",
// $table->string('organizerEmail');: "",
// $table->string('organizerAddress');: "",
// $table->string('moreOrganizer');: false,
// $table->string('secondOrganizerFullName');: "",
// $table->string('secondOrganizerPhone');: "",
// $table->string('secondOrganizerEmail');: "",
// $table->string('secondOrganizerAddress');: "",
// $table->string('customerWithLegalBackgroundName');: "",
// $table->string('customerWithLegalBackgroundAddress');: "",
// $table->string('customerWithLegalBackgroundTaxNumber');: "",
// $table->string('customerWithLegalBackgroundPhone');: "",
// $table->string('customerWithLegalBackgroundEmail');: "",
