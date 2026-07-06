<?php

namespace App\Http\Controllers;
use OpenApi\Attributes as OA;

#[OA\Info(title: "My Laravel API", version: "1.0.0")]
#[OA\Server(url: 'localhost', description: "Local Server")]
abstract class Controller
{
    //
}
