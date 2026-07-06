<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FamulusPriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    static public function run(): void
    {
        DB::table('famulus_prices')->insert([
            [
                'name' => 'Eseti beltéri takarítás óradíja',
                'default' => 3000,
                'weekend' => 3500,
                'external' => 3800,
                'external_weekend' => 4800,
            ],
            [
                'name' => 'Eseti recepció/porta óradíja',
                'default' => 3000,
                'weekend' => 3500,
                'external' => 3800,
                'external_weekend' => 4800,
            ],
            [
                'name' => 'Eseti kültéri takarítás óradíja',
                'default' => 3000,
                'weekend' => 3500,
                'external' => 3800,
                'external_weekend' => 4800,
            ],
            [
                'name' => 'Eseti karbantartási feladatok óradíja',
                'default' => 3900,
                'weekend' => 4500,
                'external' => 5000,
                'external_weekend' => 6000,
            ],
            [
                'name' => 'Eseti gondnoksági feladatok óradíja',
                'default' => 3900,
                'weekend' => 4500,
                'external' => 5000,
                'external_weekend' => 6000,
            ],
            [
                'name' => 'Rendezvény biztonságszervezés, biztonsági dokumentáció díja, kiemelt helyszín',
                'default' => 85000,
                'weekend' => 85000,
                'external' => 110000,
                'external_weekend' => 110000,
            ],
            [
                'name' => 'Rendezvény biztonságszervezés, biztonsági dokumentáció díja, általános helyszín',
                'default' => 50000,
                'weekend' => 50000,
                'external' => 70000,
                'external_weekend' => 70000,
            ],
            [
                'name' => 'Rendezvénybiztos szolgáltatás díja (rendezvényeken felmerülő biztonsági feladatok koordinálása, min. 4 óra)',
                'default' => 5500,
                'weekend' => 5500,
                'external' => 6000,
                'external_weekend' => 6000,
            ],
            [
                'name' => 'Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)',
                'default' => 3500,
                'weekend' => 3500,
                'external' => 3900,
                'external_weekend' => 3900,
            ],
            [
                'name' => 'Zenés-táncos rendezvényeken, indokolt esetben kiemelt helyszíneken biztonsági személyzet díja (min. 4 óra)',
                'default' => 3900,
                'weekend' => 4500,
                'external' => 4500,
                'external_weekend' => 4500,
            ],
            [
                'name' => 'Tűz- munkavédelmi szolgáltatás díja',
                'default' => 8500,
                'weekend' => 8500,
                'external' => 10000,
                'external_weekend' => 11000,
            ],
            [
                'name' => 'Biztonságtechnikai szolgáltatás díja',
                'default' => 8500,
                'weekend' => 8500,
                'external' => 10000,
                'external_weekend' => 11000,
            ],
        ]);
    }
}
