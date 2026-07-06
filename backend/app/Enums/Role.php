<?php

namespace App\Enums;

enum Role: int
{
    case Guest = 0;
    case Admin = 1;
    case RendezvenySzervezo = 2;
    case Unifamulus = 3;
    case JogiOsztaly = 4;
    case Kollegium = 5;
}
