<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UniPriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public static function run(): void
    {
        DB::table('uni_prices')->insert([
            [
                'name' => 'Győri Városi Egyetemi Csarnok bérleti díja',
                'accommodation' => 3000, // Large sports hall capacity
                'type' => 'bérlet',
                'dailyPrice' => 450000,
                'hourlyPrice' => 35000
            ],
            [
                'name' => 'Győri Városi Egyetemi Csarnok takarítás',
                'accommodation' => 3000,
                'type' => 'szolgáltatás',
                'dailyPrice' => 85000,
                'hourlyPrice' => 0
            ],
            [
                'name' => 'ÚT Aula bérleti díja',
                'accommodation' => 500, // Large open building hall
                'type' => 'bérlet',
                'dailyPrice' => 250000,
                'hourlyPrice' => 20000
            ],
            [
                'name' => 'ÚT 114 bérleti díja',
                'accommodation' => 120, // Large lecture hall
                'type' => 'bérlet',
                'dailyPrice' => 90000,
                'hourlyPrice' => 8500
            ],
            [
                'name' => 'MC 001 és 002 bérleti díja',
                'accommodation' => 80, // Medium classroom space
                'type' => 'bérlet',
                'dailyPrice' => 120000,
                'hourlyPrice' => 11000
            ],
            [
                'name' => 'MC 121 bérleti díja',
                'accommodation' => 40, // Standard seminar room
                'type' => 'bérlet',
                'dailyPrice' => 75000,
                'hourlyPrice' => 7000
            ],
            [
                'name' => 'MC 122 és 123 bérleti díja',
                'accommodation' => 80,
                'type' => 'bérlet',
                'dailyPrice' => 110000,
                'hourlyPrice' => 10000
            ],
            [
                'name' => 'MC 227 és 228 bérleti díja',
                'accommodation' => 80,
                'type' => 'bérlet',
                'dailyPrice' => 110000,
                'hourlyPrice' => 10000
            ],
            [
                'name' => 'Takarítás',
                'accommodation' => 0, // Flat service, doesn't hold people directly
                'type' => 'szolgáltatás',
                'dailyPrice' => 40000,
                'hourlyPrice' => 0
            ],
            [
                'name' => 'Műszaki ügyelet (1 fő)',
                'accommodation' => 1,
                'type' => 'szolgáltatás',
                'dailyPrice' => 45000,
                'hourlyPrice' => 5500
            ],
            [
                'name' => 'Biztonsági személyzet',
                'accommodation' => 1,
                'type' => 'szolgáltatás',
                'dailyPrice' => 50000,
                'hourlyPrice' => 6000
            ],
            [
                'name' => 'Rendezvénybiztos (1 fő) minden rendezvényünkhöz',
                'accommodation' => 1,
                'type' => 'szolgáltatás',
                'dailyPrice' => 65000,
                'hourlyPrice' => 7500
            ],
            [
                'name' => 'Portaszolgálat',
                'accommodation' => 1,
                'type' => 'szolgáltatás',
                'dailyPrice' => 32000,
                'hourlyPrice' => 4000
            ],
            [
                'name' => 'Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése',
                'accommodation' => 0,
                'type' => 'szolgáltatás',
                'dailyPrice' => 0,
                'hourlyPrice' => 0
            ],
            [
                'name' => 'Csarnok szőnyegezése, ragasztás',
                'accommodation' => 3000,
                'type' => 'szolgáltatás',
                'dailyPrice' => 180000,
                'hourlyPrice' => 0
            ],
            [
                'name' => 'Háló leszedése alpintechnikával',
                'accommodation' => 3000,
                'type' => 'szolgáltatás',
                'dailyPrice' => 95000,
                'hourlyPrice' => 0
            ],
            [
                'name' => 'Székek bérlése',
                'accommodation' => 1, // Per unit/individual item
                'type' => 'bérlet',
                'dailyPrice' => 450,
                'hourlyPrice' => 0
            ],
            [
                'name' => 'Szemétszállítás - Konténer',
                'accommodation' => 0,
                'type' => 'szolgáltatás',
                'dailyPrice' => 65000,
                'hourlyPrice' => 0
            ]
        ]);
    }
}
