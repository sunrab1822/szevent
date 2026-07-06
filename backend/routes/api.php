<?php

use App\Http\Controllers\DocTemplateController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\DormPricesController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\FamulusPriceController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\OtherPriceController;
use App\Http\Controllers\SamlController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UniPriceController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/saml/login', [SamlController::class, 'login'])->name('login');
Route::post('/saml/acs', [SamlController::class, 'acs']);
Route::get('/saml/metadata', [SamlController::class, 'metadata']);
Route::get('/saml/logout', [SamlController::class, 'logout'])->name('logout')->middleware('auth');
Route::get('/saml/sls', [SamlController::class, 'sls']);

Route::get('/me', [UserController::class, 'me']);

// Event
// Route::get('/events', [EventController::class, 'show']);
Route::post('/create-event', [EventController::class, 'create']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/events', [StatusController::class, 'get_events_by_status']);
});


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/event', [EventController::class, 'show_one']);
    Route::post('/reject-event', [EventController::class, 'reject']);
    Route::post('/resigned-event', [EventController::class, 'resigned']);
    Route::post('/update-event', [EventController::class, 'update_event']);
});

// User assignToEvent
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/assign', [UserController::class, 'assign_user']);
    Route::delete('/delete-user', [UserController::class, 'delete']);
});

// Status Changes

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/accept-event', [EventController::class, 'accept_event']);

    Route::post('/famulus/new-offer', [EventController::class, 'famulus_offer']);
    Route::post('/famulus/accept-offer', [EventController::class, 'accept_famulus_offer']);
    Route::post('/offer-modify', [EventController::class, 'offer_modify']);

    Route::post('/dorm/new-offer', [EventController::class, 'dorm_offer']);
    Route::post('/dorm/accept-offer', [EventController::class, 'accept_dorm_offer']);
    Route::post('/dorm/offer-modify', [EventController::class, 'dorm_offer_modify']);

    Route::post('/uni/new-offer', [EventController::class, 'uni_offer']);
    Route::post('/uni/accept-offer', [EventController::class, 'accept_offers']);
    Route::post('/uni/offer-modify', [EventController::class, 'uni_modify']);


    Route::post('/legal/contract-data', [EventController::class, 'add_contract_data']);
    Route::post('/legal/reviewe', [EventController::class, 'contract_reviewe']);
    Route::post('/legal/accept-client', [EventController::class, 'contract_accept_by_client']); //Ügyfél által elfogadva
    Route::post('/legal/accept-uni', [EventController::class, 'contract_accept_by_uni']); //Egyetem által elfogadva
    Route::post('/legal/signed', [EventController::class, 'contract_signed']); //Szerződés aláírva
    Route::post('/legal/completed', [EventController::class, 'event_completed']); //EZ átrakja az UF igazolásra vár, látszik a gomb, hogy UF Igazolás elfogadva, ez hívja a TIG-et.
    Route::post('/legal/TIG', [EventController::class, 'contract_TIG']); // 
    Route::post('/legal/informantwaiting', [EventController::class, 'adatkozlofelkuld']);
    Route::post('/legal/informantdone', [EventController::class, 'adatkozlofelkuldve']);
    Route::post('/legal/finish', [EventController::class, 'finish']);
});

// Documents

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/document/upload', [DocumentController::class, 'upload']);
    Route::post('/document/upload-multi', [DocumentController::class, 'upload_multiple']);
    Route::post('/document/delete', [DocumentController::class, 'delete']);
    Route::post('/document/event', [DocumentController::class, 'get_doc']);
    Route::get('/engedelyezes/{eventId}', [DocumentController::class, 'generateEngedely']);
});

// docx

// Route::get('/generate-docx/{event}', [DocumentController::class, 'generate_docx']);
Route::get('/generate-docx/{eventId}/{type}', [DocumentController::class, 'generate_docx']);

// FamulusPrice
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/famulus-prices', [FamulusPriceController::class, 'show']);
    Route::post('/create-famulus-price', [FamulusPriceController::class, 'create']);
    Route::post('/update-famulus-price', [FamulusPriceController::class, 'update']);
    Route::post('/delete-famulus-price', [FamulusPriceController::class, 'delete']);
    Route::post('/get-famulus-offers', [EventController::class, 'get_famulus_offers']);
});

// UniPrices
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/uni-prices', [UniPriceController::class, 'show']);
    Route::post('/create-uni-price', [UniPriceController::class, 'create']);
    Route::post('/update-uni-price', [UniPriceController::class, 'update']);
    Route::post('/delete-uni-price', [UniPriceController::class, 'delete']);
    Route::post('/get-uni-offers', [EventController::class, 'get_uni_offers']);
});

// DormPrices
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dorm-prices', [DormPricesController::class, 'show']);
    Route::post('/create-dorm-price', [DormPricesController::class, 'create']);
    Route::post('/update-dorm-price', [DormPricesController::class, 'update']);
    Route::post('/delete-dorm-price', [DormPricesController::class, 'delete']);
});

// toggle qualif
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/toggle-qualification', [EventController::class, 'toggle_qualification']);
});

// Auth
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/users', [UserController::class, 'get_users']);
    Route::post('/set-role', [UserController::class, 'set_role']);
    Route::post('/create-user', [UserController::class, 'create_user']);
});

// profilpicture
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/setpicture', [UserController::class, 'set_pfp']);
});

// Chat

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chat', [MessageController::class, 'get_chat']);
    Route::post('/send', [MessageController::class, 'send']);
});

// File

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/files', [DocTemplateController::class, 'get_all']);
    Route::post('/upload-file', [DocTemplateController::class, 'upload']);
    Route::get('/download-file/{id}', [DocTemplateController::class, 'download']);
    Route::delete('/documents', [DocTemplateController::class, 'delete']);
    Route::get('/needed/{eventId}', [DocTemplateController::class, 'get_needed']);
});

// OtherPrice
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/other-prices', [OtherPriceController::class, 'show']);
    Route::post('/create-other-price', [OtherPriceController::class, 'create']);
    Route::post('/update-other-price', [OtherPriceController::class, 'update']);
    Route::post('/delete-other-price', [OtherPriceController::class, 'delete']);
});

// Version
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/versions/{eventId}/{offerType}', [EventController::class, 'getVersions']);
    Route::get('/version/{versionId}', [EventController::class, 'getVersion']);


    Route::post('/seen', [EventController::class, 'seen']);
});
