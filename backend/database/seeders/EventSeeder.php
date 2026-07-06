<?php

namespace Database\Seeders;

use Faker\Factory as Faker;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public static function run(): void
    {
        $faker = Faker::create();
        $data = [];

        for ($i = 0; $i < 10; $i++) {
            // Pre-calculate dates to ensure logic (after_or_equal)
            $startDate = $faker->dateTimeBetween('now', '+1 month');
            $endDate = (clone $startDate)->modify('+'.rand(1, 5).' days');

            $conStart = $faker->dateTimeBetween('-2 days', $startDate);
            $conEnd = (clone $conStart)->modify('+1 day');

            // Toggle dependencies
            $needAccommodation = $faker->boolean;
            $needParking = $faker->boolean;
            $willBeConstruction = $faker->boolean;
            $needCatering = $faker->boolean;

            $data[] = [
                'name' => $faker->sentence(3),
                'description' => $faker->paragraph,
                'location' => $faker->city,
                'address' => $faker->address,

                'startDate' => $startDate,
                'endDate' => $endDate,

                'type' => $faker->randomElement(['Conference', 'Workshop', 'Exhibition', null]),
                'qualification' => $faker->numberBetween(0, 1),

                'participants' => $faker->numberBetween(10, 500),

                'public' => $faker->randomElement(['Yes', 'No', 'By Invitation']),
                'nature' => $faker->word,
                'detailedProgramPlan' => $faker->text,
                'furnishedMethod' => $faker->randomElement(['Theater', 'Classroom', 'U-Shape']),

                'needAccommodation' => $needAccommodation,
                'needAccommodationNumber' => $needAccommodation ? $faker->numberBetween(1, 50) : 0,

                'needParkingSpace' => $needParking,
                'needParkingSpaceNumber' => $needParking ? $faker->numberBetween(1, 20) : 0,

                'producesTrash' => $faker->boolean,
                'producesTrashDelivery' => $faker->sentence,
                'producesTrashDeliveryWhoDelivers' => $faker->company,

                'needWifi' => $faker->boolean,
                'needEducationalTechnology' => $faker->boolean,
                'needEducationalTechnologyItems' => $faker->words(3, true),

                'participantsWithReducedMobility' => $faker->boolean,
                'willBePhotos' => $faker->boolean,
                'willBePhotosDevice' => $faker->word,

                'needCatering' => $needCatering,
                'needCateringType' => $needCatering ? $faker->randomElement(['Buffet', 'Finger Food', 'Full Course']) : null,

                'willBeConstruction' => $willBeConstruction,
                'constructionStartDate' => $willBeConstruction ? $conStart : null,
                'constructionEndDate' => $willBeConstruction ? $conEnd : null,
                'constructionSubcontractors' => $faker->company,
                'constructionInHeights' => $faker->boolean,
                'constructionNeedScaffolding' => $faker->boolean,
                'constructionManualMaterialHandling' => $faker->boolean,
                'constructionMechanicalMaterialHandling' => $faker->boolean,
                'constructionMechanicalMaschines' => $faker->word,
                'constructionMechanicalMaschinesOthers' => $faker->word,

                'needCleaningBefore' => $faker->boolean,
                'needCleaningDuringEvent' => $faker->boolean,
                'needElectricians' => $faker->randomElement(['Yes', 'No', 'Pending']),
                'needElectricityFromCabinet' => $faker->boolean,
                'needElectricityFromCabinetNumber' => (string) $faker->numberBetween(1, 5),

                'fireHazardExpected' => $faker->boolean,
                'fireHazardExpectedDescription' => $faker->sentence,

                'expectedDustSmokeVapor' => $faker->randomElement(['None', 'Low', 'High']),
                'expectedUsageOfChemicals' => $faker->boolean,
                'expectedUsageOfChemicalsDescription' => $faker->sentence,
                'expectedDecor' => $faker->boolean,

                'organizerFullName' => $faker->name,
                'organizerPhone' => $faker->phoneNumber,
                'organizerEmail' => $faker->safeEmail,
                'organizerAddress' => $faker->address,
                'moreOrganizer' => $faker->boolean,

                'secondOrganizerFullName' => $faker->optional()->name,
                'secondOrganizerPhone' => $faker->optional()->phoneNumber,
                'secondOrganizerEmail' => $faker->optional()->safeEmail,
                'secondOrganizerAddress' => $faker->optional()->address,

                'customerWithLegalBackgroundName' => $faker->company,
                'customerWithLegalBackgroundAddress' => $faker->address,
                'customerWithLegalBackgroundTaxNumber' => $faker->numerify('##########'),
                'customerWithLegalBackgroundPhone' => $faker->phoneNumber,
                'customerWithLegalBackgroundEmail' => $faker->companyEmail,

                'registrationNumber' => $faker->unique()->numerify('REG-#####'),

                'Representative' => $faker->name ,
                'RepresentativeTitle' => $faker->title,

                'filePath' => '',

                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('events')->insert($data);
    }
}
