<?php

namespace App\Enums;

enum DocTemplateType: int
{
    case ARAJANLAT = 1;
    case SZERZODES = 2;
    case EGYEDI_MEGRENDELO_UF = 3;
    case EGYEB = 4;
    case ADATKOZLO = 5;
    case ATLATHATOSAGI_NYILATKOZAT = 6;
}
