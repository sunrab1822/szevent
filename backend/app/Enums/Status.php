<?php

namespace App\Enums;

enum Status: string
{
    case BEERKEZETT = "Beérkezett";
    case ELUTASITVA = "Elutasítva";
    case UF_ARAJANLATRA_VAR = "UF Árajánlatra vár"; // famulus
    case KOLI_ARAJANLATRA_VAR = "Kollégiumi Árajánlatra vár"; // koli
    case UF_ARAJANLAT_ELFOGADASRA_VAR = "UF Árajánlat elfogadásra vár";
    case KOLI_ARAJANLAT_ELFOGADASRA_VAR = "Kollégiumi Árajánlat elfogadásra vár";
    case ARAJANLTAN_KESZITESRE_VAR = "Árajánlat készítésre vár";
    case ARAJANLAT_ELFOGADASRA_VAR = "Árajánlat elfogadásra vár";
    case LEMONDVA = "Lemondva";
    case JOVAHAGYVA = "Jóváhagyva";
    case MEGVALOSULASRA_VAR = "Megvalósulásra vár";
    case SZERZODESES_ADATOKRA_VAR = "Szerződéses adatokra vár";
    case SZERZODES_ATTNEZESRE_VAR = "Szerződés áttnézésre vár"; // jog
    case PARTNERI_ALAIRASRA_VAR = "Partneri aláírásra vár";
    case EGYETEMI_ALAIRASRA_VAR = "Egyetemi aláírásra vár";
    case SZERZODES_KIKULDESRE_VAR = "Szerződés kiküldésre vár";
    case SZERZODES_ALAIRVA = "Szerződés aláírva";
    case TIG_JOVAHAGYASRA_VAR = "TIG jóváhagyásra vár";
    case MEGVALOSULT_UF_IGAZOLASRA_VAR = "Megvalósult - UF igazolásra vár"; // famulus
    case ADATKOZLO_FELKULDESERE_VAR = "Adatközlő felküldésére vár";
    case ADATKOZLO_FELKULDVE = "Adatközlő felküldve";
    case RENDEZVENY_LEZARVA = "Rendezvény lezárva";
}
