<?php

namespace App\Http\Controllers;

use App\Enums\Status;
use App\Mail\RejectMail;
use App\Models\AssignUser;
use App\Models\DormOffers;
use App\Models\Event;
use App\Models\FamulusOffers;
use App\Models\NeededDoc;
use App\Models\UniOffers;
use App\Models\Version;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class EventController extends Controller
{
    private function createVersion(Event $event, string $offerType, ?string $reason): Version
    {
        $lastVersion = Version::where('events_id', $event->id)
            ->where('offer_type', $offerType)
            ->orderByDesc('version')
            ->first();

        return Version::create([
            'events_id' => $event->id,
            'offer_type' => $offerType,
            'reason' => $reason,
            'version' => $lastVersion ? $lastVersion->version + 1 : 1,
        ]);
    }

    public function show()
    {
        $famulus = [Status::UF_ARAJANLATRA_VAR, Status::MEGVALOSULT_UF_IGAZOLASRA_VAR];
        $jog = [Status::SZERZODES_ATTNEZESRE_VAR];
        $koli = [Status::KOLI_ARAJANLATRA_VAR];
        switch (Auth::user()->role) {
            case 1:
                $events = Event::all();
                break;
            case 2:
                $events = Event::all();
                break;
            case 3:
                $events = Event::whereIn('status', $famulus)->get();

                break;
            case 4:
                $events = Event::whereIn('status', $jog)->get();
                break;
            case 5:
                $events = Event::whereIn('status', $koli)->get();
                break;
            default:

                break;
        }

        return response()->json([
            'events' => $events,
        ]);
    }

    public function show_one(Request $req)
    {
        $event = Event::where('id', $req->id)->with('statusChanges', 'assignedUser')->get();

        $assignuser = AssignUser::where('users_id', Auth::id())
            ->where('events_id', $req->id)
            ->first();

        if ($assignuser) {
            $assignuser->update(['seen' => true]);
        }

        return response()->json([
            'event' => $event,
        ]);
    }

    public function create(Request $req)
    {
        $filePath = null;
        if ($req->hasFile('file') && $req->file('file')->isValid()) {
            $filePath = $req->file('file')->store('event_files', 'public');
        }

        Event::create([

            'name' => $req->name,
            'description' => $req->description,
            'location' => $req->location,
            'address' => $req->address,
            'startDate' => $req->startDate,
            'endDate' => $req->endDate,
            'type' => $req->type,

            'qualification' => $req->qualification === 'Nyílvános',

            'participants' => $req->participants,
            'nature' => $req->nature,
            'detailedProgramPlan' => $req->detailedProgramPlan,
            'furnishedMethod' => $req->furnishedMethod,

            'public' => $req->boolean('public'),
            'needAccommodation' => $req->boolean('needAccommodation'),
            'needParkingSpace' => $req->boolean('needParkingSpace'),
            'producesTrash' => $req->boolean('producesTrash'),
            'needWifi' => $req->boolean('needWifi'),
            'needEducationalTechnology' => $req->boolean('needEducationalTechnology'),
            'participantsWithReducedMobility' => $req->boolean('participantsWithReducedMobility'),
            'willBePhotos' => $req->boolean('willBePhotos'),
            'needCatering' => $req->boolean('needCatering'),
            'willBeConstruction' => $req->boolean('willBeConstruction'),
            'constructionInHeights' => $req->boolean('constructionInHeights'),
            'constructionNeedScaffolding' => $req->boolean('constructionNeedScaffolding'),
            'constructionManualMaterialHandling' => $req->boolean('constructionManualMaterialHandling'),
            'constructionMechanicalMaterialHandling' => $req->boolean('constructionMechanicalMaterialHandling'),
            'needCleaningBefore' => $req->boolean('needCleaningBefore'),
            'needCleaningDuringEvent' => $req->boolean('needCleaningDuringEvent'),
            'needElectricians' => $req->boolean('needElectricians'),
            'needElectricityFromCabinet' => $req->boolean('needElectricityFromCabinet'),
            'fireHazardExpected' => $req->boolean('fireHazardExpected'),
            'expectedDustSmokeVapor' => $req->boolean('expectedDustSmokeVapor'),
            'expectedUsageOfChemicals' => $req->boolean('expectedUsageOfChemicals'),
            'moreOrganizer' => $req->boolean('moreOrganizer'),

            'needAccommodationNumber' => $req->needAccommodationNumber ?: null,
            'needParkingSpaceNumber' => $req->needParkingSpaceNumber ?: null,
            'needElectricityFromCabinetNumber' => $req->needElectricityFromCabinetNumber ?: null,

            'producesTrashDelivery' => $req->producesTrashDelivery,
            'producesTrashDeliveryWhoDelivers' => $req->producesTrashDeliveryWhoDelivers,
            'needEducationalTechnologyItems' => $req->needEducationalTechnologyItems,
            'willBePhotosDevice' => $req->willBePhotosDevice,
            'needCateringType' => $req->needCateringType,
            'constructionStartDate' => $req->constructionStartDate,
            'constructionEndDate' => $req->constructionEndDate,
            'constructionSubcontractors' => $req->constructionSubcontractors,
            'constructionMechanicalMaschines' => $req->constructionMechanicalMaschines,
            'constructionMechanicalMaschinesOthers' => $req->constructionMechanicalMaschinesOthers,
            'fireHazardExpectedDescription' => $req->fireHazardExpectedDescription,
            'expectedUsageOfChemicalsDescription' => $req->expectedUsageOfChemicalsDescription,
            'expectedDecor' => $req->expectedDecor,

            'organizerFullName' => $req->organizerFullName,
            'organizerPhone' => $req->organizerPhone,
            'organizerEmail' => $req->organizerEmail,
            'organizerAddress' => $req->organizerAddress,
            'secondOrganizerFullName' => $req->secondOrganizerFullName,
            'secondOrganizerPhone' => $req->secondOrganizerPhone,
            'secondOrganizerEmail' => $req->secondOrganizerEmail,
            'secondOrganizerAddress' => $req->secondOrganizerAddress,
            'customerWithLegalBackgroundName' => $req->customerWithLegalBackgroundName,
            'customerWithLegalBackgroundAddress' => $req->customerWithLegalBackgroundAddress,
            'customerWithLegalBackgroundTaxNumber' => $req->customerWithLegalBackgroundTaxNumber,
            'customerWithLegalBackgroundPhone' => $req->customerWithLegalBackgroundPhone,
            'customerWithLegalBackgroundEmail' => $req->customerWithLegalBackgroundEmail,
            'registrationNumber' => $req->registrationNumber,
            'Representative' => $req->Representative,
            'RepresentativeTitle' => $req->RepresentativeTitle,

            'filePath' => $filePath,
        ]);

        // Mail::to($event->organizerEmail)->send(new RejectMail(
        //     $event->organizerFullName,
        //     $event->name,
        //     $event->rejectReason ?? '-',
        //     'Sajnálattal értesítjük, hogy rendezvényét nem tudtuk jóváhagyni.'
        // ));

        return response()->json(['message' => 'Event successfully created!']);
    }

    public function update_event(Request $req)
    {
        Event::updateOrCreate([
            'id' => $req->id,
        ], [
            'name' => $req->name,
            'description' => $req->description,
            'location' => $req->location,
            'address' => $req->address,
            'startDate' => $req->startDate,
            'endDate' => $req->endDate,
            'type' => $req->type,
            'qualification' => $req->qualification == 'Nyílvános' ? true : false,
            'participants' => $req->participants,
            'public' => $req->public,
            'nature' => $req->nature,
            'detailedProgramPlan' => $req->detailedProgramPlan,
            'furnishedMethod' => $req->furnishedMethod,
            'needAccommodation' => $req->needAccommodation,
            'needAccommodationNumber' => $req->needAccommodationNumber ? $req->needAccommodationNumber : null,
            'needParkingSpace' => $req->needParkingSpace,
            'needParkingSpaceNumber' => $req->needParkingSpaceNumber ? $req->needAccommodationNumber : null,
            'producesTrash' => $req->producesTrash,
            'producesTrashDelivery' => $req->producesTrashDelivery,
            'producesTrashDeliveryWhoDelivers' => $req->producesTrashDeliveryWhoDelivers,
            'needWifi' => $req->needWifi,
            'needEducationalTechnology' => $req->needEducationalTechnology,
            'needEducationalTechnologyItems' => $req->needEducationalTechnologyItems,
            'participantsWithReducedMobility' => $req->participantsWithReducedMobility,
            'willBePhotos' => $req->willBePhotos,
            'willBePhotosDevice' => $req->willBePhotosDevice,
            'needCatering' => $req->needCatering,
            'needCateringType' => $req->needCateringType,
            'willBeConstruction' => $req->willBeConstruction,
            'constructionStartDate' => $req->constructionStartDate,
            'constructionEndDate' => $req->constructionEndDate,
            'constructionSubcontractors' => $req->constructionSubcontractors,
            'constructionInHeights' => $req->constructionInHeights,
            'constructionNeedScaffolding' => $req->constructionNeedScaffolding,
            'constructionManualMaterialHandling' => $req->constructionManualMaterialHandling,
            'constructionMechanicalMaterialHandling' => $req->constructionMechanicalMaterialHandling,
            'constructionMechanicalMaschines' => $req->constructionMechanicalMaschines,
            'constructionMechanicalMaschinesOthers' => $req->constructionMechanicalMaschinesOthers,
            'needCleaningBefore' => $req->needCleaningBefore,
            'needCleaningDuringEvent' => $req->needCleaningDuringEvent,
            'needElectricians' => $req->needElectricians,
            'needElectricityFromCabinet' => $req->needElectricityFromCabinet,
            'needElectricityFromCabinetNumber' => $req->needElectricityFromCabinetNumber,
            'fireHazardExpected' => $req->fireHazardExpected,
            'fireHazardExpectedDescription' => $req->fireHazardExpectedDescription,
            'expectedDustSmokeVapor' => $req->expectedDustSmokeVapor,
            'expectedUsageOfChemicals' => $req->expectedUsageOfChemicals,
            'expectedUsageOfChemicalsDescription' => $req->expectedUsageOfChemicalsDescription,
            'expectedDecor' => $req->expectedDecor,
            'organizerFullName' => $req->organizerFullName,
            'organizerPhone' => $req->organizerPhone,
            'organizerEmail' => $req->organizerEmail,
            'organizerAddress' => $req->organizerAddress,
            'moreOrganizer' => $req->moreOrganizer,
            'secondOrganizerFullName' => $req->secondOrganizerFullName,
            'secondOrganizerPhone' => $req->secondOrganizerPhone,
            'secondOrganizerEmail' => $req->secondOrganizerEmail,
            'secondOrganizerAddress' => $req->secondOrganizerAddress,
            'customerWithLegalBackgroundName' => $req->customerWithLegalBackgroundName,
            'customerWithLegalBackgroundAddress' => $req->customerWithLegalBackgroundAddress,
            'customerWithLegalBackgroundTaxNumber' => $req->customerWithLegalBackgroundTaxNumber,
            'customerWithLegalBackgroundPhone' => $req->customerWithLegalBackgroundPhone,
            'customerWithLegalBackgroundEmail' => $req->customerWithLegalBackgroundEmail,
            'registrationNumber' => $req->registrationNumber,
            'Representative' => $req->Representative,
            'RepresentativeTitle' => $req->RepresentativeTitle,
        ]);

        return response()->json();
    }

    public function reject(Request $req)
    {

        $event = Event::where('id', $req->id)->first();

        if (! $event) {
            return response()->json([], 404);
        }
        $previousStatus = $event->status;
        $event->status = Status::ELUTASITVA;
        $event->rejectReason = $req->rejectReason;

        $event->save();
        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id(), $event->rejectReason);
        $event->delete();

        Mail::to($event->organizerEmail)->send(new RejectMail(
            $event->organizerFullName,
            $event->name,
            $event->rejectReason ?? '-',
            'Sajnálattal értesítjük, hogy rendezvényét nem tudtuk jóváhagyni.'
        ));

        return response()->json();
    }

    public function resigned(Request $req)
    {

        $event = Event::findOrFail($req->id);
        $previousStatus = $event->status;
        $event->status = Status::LEMONDVA;
        $event->rejectReason = $req->rejectReason;

        $event->save();
        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id(), $event->rejectReason);
        $event->delete();

        Mail::to($event->organizerEmail)->send(new RejectMail(
            $event->organizerName,
            $event->name,
            $event->rejectReason ?? '-',
            'Tájékoztatjuk, hogy a rendezvény lemondásra került.'
        ));

        return response()->json();
    }

    public function accept_event(Request $req)
    {
        $event = Event::findOrFail($req->id);
        $previousStatus = $event->status;
        $event->status = Status::UF_ARAJANLATRA_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function famulus_offer(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $version = $this->createVersion($event, 'famulus', null);

        $price = 0;
        foreach ($req->offers as $offer) {
            $total_price = $offer['hours'] * $offer['customPrice'];
            FamulusOffers::create([
                'events_id' => $event->id,
                'versions_id' => $version->id,
                'offer_name' => $offer['name'],
                'duration' => $offer['hours'],
                'price_per_unit' => $offer['customPrice'],
                'total_price' => $total_price,
                'night' => false,
            ]);
            $price += $total_price;
        }

        $previousStatus = $event->status;
        $event->status = Status::UF_ARAJANLAT_ELFOGADASRA_VAR;
        $event->famulusPrice = $price;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function offer_modify(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;
        $event->status = Status::UF_ARAJANLATRA_VAR;
        $event->rejectReason = $req->reason;
        $event->save();

        $currentVersion = Version::where('events_id', $event->id)
            ->where('offer_type', 'famulus')
            ->orderByDesc('version')
            ->first();

        if ($currentVersion) {
            $currentVersion->update(['reason' => $req->reason]);
        }

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id(), $req->reason);

        return response()->json();
    }

    public function accept_famulus_offer(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;
        $event->status = Status::ARAJANLTAN_KESZITESRE_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function dorm_offer(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $version = $this->createVersion($event, 'dorm', null);

        $price = 0;
        foreach ($req->offers as $offer) {
            $total_price = $offer['hours'] * $offer['CustomPrice'];
            DormOffers::create([
                'events_id' => $event->id,
                'versions_id' => $version->id,
                'offer_name' => $offer['name'],
                'duration' => $offer['hours'],
                'price_per_unit' => $offer['CustomPrice'],
                'total_price' => $total_price,
            ]);
            $price += $total_price;
        }

        $previousStatus = $event->status;
        $event->dormPrice = $price;
        $event->status = Status::ARAJANLTAN_KESZITESRE_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function accept_dorm_offer(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;
        $event->status = Status::ARAJANLTAN_KESZITESRE_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function dorm_offer_modify(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;
        $event->status = Status::KOLI_ARAJANLATRA_VAR;
        $event->rejectReason = $req->rejectReason;
        $event->save();

        $currentVersion = Version::where('events_id', $event->id)
            ->where('offer_type', 'dorm')
            ->orderByDesc('version')
            ->first();

        if ($currentVersion) {
            $currentVersion->update(['reason' => $req->rejectReason]);
        }

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id(), $req->reason);

        return response()->json();
    }

    public function uni_offer(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $version = $this->createVersion($event, 'uni', '');
        $price = 0;
        foreach ($req->offers as $offer) {
            $total_price = $offer['quantity'] * $offer['customPrice'];
            UniOffers::create([
                'events_id' => $event->id,
                'versions_id' => $version->id,
                'offer_name' => $offer['name'],
                'duration' => $offer['quantity'],
                'price_per_unit' => $offer['customPrice'],
                'total_price' => $total_price,
            ]);
            $price += $total_price;
        }

        $previousStatus = $event->status;
        $event->uniPrice = $price;
        $event->status = Status::ARAJANLAT_ELFOGADASRA_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function uni_modify(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;
        $event->status = Status::ARAJANLTAN_KESZITESRE_VAR;
        $event->rejectReason = $req->reason;
        $event->save();

        $currentVersion = Version::where('events_id', $event->id)
            ->where('offer_type', 'uni')
            ->orderByDesc('version')
            ->first();

        if ($currentVersion) {
            $currentVersion->update(['reason' => $req->reason]);
        }

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id(), $req->reason);

        return response()->json();
    }

    public function accept_offers(Request $req)
    {
        $event = Event::findOrFail($req->id);
        $previousStatus = $event->status;

        if ($event->qualification == 1) {
            $event->status = Status::MEGVALOSULASRA_VAR;
        } else {
            $event->status = Status::SZERZODESES_ADATOKRA_VAR;
        }

        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function add_contract_data(Request $req)
    {

        $event = Event::findOrFail($req->id);

        foreach ($req->docIds as $value) {

            NeededDoc::create([
                'events_id' => $event->id,
                'doc_templates_id' => $value,
            ]);
        }

        $previousStatus = $event->status;

        $event->status = Status::SZERZODES_ATTNEZESRE_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function contract_reviewe(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::PARTNERI_ALAIRASRA_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function contract_accept_by_client(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::EGYETEMI_ALAIRASRA_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function contract_accept_by_uni(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::SZERZODES_KIKULDESRE_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function contract_signed(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::SZERZODES_ALAIRVA;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function event_completed(Request $req)
    {
        // TODO start 1 day after complite set status

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::MEGVALOSULT_UF_IGAZOLASRA_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function adatkozlofelkuld(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::ADATKOZLO_FELKULDESERE_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function adatkozlofelkuldve(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::ADATKOZLO_FELKULDVE;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function finish(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::RENDEZVENY_LEZARVA;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function contract_TIG(Request $req)
    {

        $event = Event::findOrFail($req->id);

        $previousStatus = $event->status;

        $event->status = Status::TIG_JOVAHAGYASRA_VAR;
        $event->save();

        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id());

        return response()->json();
    }

    public function toggle_qualification(Request $req)
    {
        $event = Event::findOrFail($req->id);

        $publicQualifiedStatuses = [
            Status::SZERZODESES_ADATOKRA_VAR,
            Status::SZERZODES_ATTNEZESRE_VAR,
            Status::PARTNERI_ALAIRASRA_VAR,
            Status::EGYETEMI_ALAIRASRA_VAR,
            Status::SZERZODES_KIKULDESRE_VAR,
            Status::SZERZODES_ALAIRVA,
            Status::TIG_JOVAHAGYASRA_VAR,
            Status::MEGVALOSULT_UF_IGAZOLASRA_VAR,
            Status::ADATKOZLO_FELKULDESERE_VAR,
            Status::ADATKOZLO_FELKULDVE,

        ];

        $previousStatus = $event->status;
        $statusMessage = $event->qualification == 1 ? 'Külsős-re változás' : 'Belsős-re változás';

        if ($event->qualification == 1) {
            if ($event->status == Status::MEGVALOSULASRA_VAR) {
                $event->status = Status::SZERZODESES_ADATOKRA_VAR;
            }
            $event->qualification = 0;
        } elseif ($event->qualification == 0) {
            if (in_array($event->status, $publicQualifiedStatuses)) {
                $event->status = Status::MEGVALOSULASRA_VAR;
            }
            $event->qualification = 1;
        }

        $event->save();
        StatusChangeLogController::log($previousStatus, $event->status, $event->id, Auth::id(), $statusMessage);

        return response()->json();
    }

    public function get_famulus_offers(Request $req)
    {
        $ofers = FamulusOffers::where('events_id', $req->id)->get();

        return response()->json(['offers' => $ofers]);
    }

    public function get_uni_offers(Request $req)
    {
        $ofers = UniOffers::where('events_id', $req->id)->get();

        return response()->json(['offers' => $ofers]);
    }

    public function getVersions($eventId, $offerType)
    {
        $versions = Version::where('events_id', $eventId)
            ->where('offer_type', $offerType)
            ->orderBy('version')
            ->get();

        return response()->json($versions);
    }

    public function getVersion($versionId)
    {
        $version = Version::with(['famulusOffers', 'dormOffers', 'uniOffers'])
            ->findOrFail($versionId);

        return response()->json([
            'id' => $version->id,
            'version' => $version->version,
            'reason' => $version->reason,
            'offer_type' => $version->offer_type,
            'offers' => $version->famulusOffers
                ->concat($version->dormOffers)
                ->concat($version->uniOffers)
                ->values(),
        ]);
    }

    public function seen(Request $req)
    {

        $assignuser = AssignUser::where('users_id', Auth::id())
            ->where('events_id', $req->eventId)
            ->first();

        $assignuser->update(['seen' => true]);

        return response()->json();
    }
}
