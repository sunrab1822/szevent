<?php

namespace App\Http\Controllers;

use App\Models\DocTemplate;
use App\Models\Document;
use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\TemplateProcessor;

class DocumentController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf,docx',
            ],
            'id' => ['required'],
        ]);

        $file = $request->file('file');

        $filename = time().'0'.'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs('documents', $filename, 'public');

        Document::create([
            'events_id' => $request->id,
            'path' => $path,
        ]);

        return response()->json([
            'message' => 'File uploaded successfully.',
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'path' => $path,
            'url' => Storage::url($path),
        ], 201);
    }

    public function upload_multiple(Request $request)
    {

        $uploaded = [];

        $i = 0;
        foreach ($request->file('files') as $file) {
            $filename = time().$i.'.'.$file->getClientOriginalExtension();
            $i++;
            $path = $file->storeAs('documents', $filename, 'public');

            Document::create([
                'events_id' => $request->id,
                'path' => $path,
            ]);

            $uploaded[] = [
                'filename' => $filename,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'path' => $path,
                'url' => Storage::url($path),
            ];
        }

        return response()->json([
            'message' => count($uploaded).' file(s) uploaded successfully.',
            'files' => $uploaded,
        ], 201);
    }

    public function delete(Request $req)
    {
        $path = storage_path('app/public/documents/'.$req->filename);

        if (! Storage::disk('public')->exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found.',
            ], 404);
        }

        Storage::disk('public')->delete($path);

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully.',
        ]);
    }

    public function get_doc(Request $req)
    {
        $documents = Document::where('events_id', $req->id)->get();

        return response()->json($documents->map(fn ($doc) => [
            'id' => $doc->id,
            'url' => Storage::url($doc->path),
        ]));
    }

    public function generate_docx(string $eventId, string $type)
    {
        $event = Event::with(['assignedUser', 'famulusoffers', 'unioffers'])
            ->where('id', $eventId)->first();
        $doc = DocTemplate::where('id', $type)->first();

        if (! $event || ! $doc) {
            return response()->json(['message' => 'event or template not found!'], 404);
        }

        if ($event->assignedUser->isEmpty()) {
            return response()->json(['message' => 'assigned user not found!'], 404);
        }

        $templateProcessor = new TemplateProcessor(
            storage_path('app/public'.str_replace('/storage', '', $doc->path))
        );

        $this->fillCommonFields($templateProcessor, $event);

        match ($doc->type) {
            1 => $this->fillContractFields($templateProcessor, $event),
            2 => $this->fillPriceOfferFields($templateProcessor, $event),
            default => null,
        };

        $fileName = 'doc_'.$doc->type.'_'.time().'.docx';
        $tempPath = storage_path('app/public/'.$fileName);

        $templateProcessor->saveAs($tempPath);

        return response()->download($tempPath)->deleteFileAfterSend(true);
    }

    private function fillPriceOfferFields(TemplateProcessor $tp, Event $event): void
    {
        $latestUniVersion = $event->unioffers->max('versions_id');
        $latestFamulusVersion = $event->famulusoffers->max('versions_id');

        $uniLines = $event->unioffers
            ->where('versions_id', $latestUniVersion)
            ->values();

        $famulusLines = $event->famulusoffers
            ->where('versions_id', $latestFamulusVersion)
            ->values();

        $lines = $uniLines->concat($famulusLines);

        $rowCount = max($lines->count(), 1);
        $tp->cloneRow('megnevezes', $rowCount);

        foreach ($lines as $i => $offer) {
            $idx = $i + 1;

            $netto = (float) $offer->price_per_unit;
            $brutto = (float) $offer->total_price;
            $afa = $netto > 0 ? round((($brutto / $netto) - 1) * 100) : 0;

            $tp->setValue("megnevezes#{$idx}", $offer->offer_name);
            $tp->setValue("mennyiseg#{$idx}", $offer->duration);
            $tp->setValue("netto_ar#{$idx}", number_format($netto, 0, ',', ' ').' Ft');
            $tp->setValue("afa#{$idx}", $afa.'%');
            $tp->setValue("brutto_ar#{$idx}", number_format($brutto, 0, ',', ' ').' Ft');
        }
    }

    private function fillCommonFields(TemplateProcessor $tp, Event $event): void
    {
        $idotartam = str_replace('-', '.', $event->startDate).' (tól/től) - '.str_replace('-', '.', $event->endDate).' (ig)';

        $tp->setValue('idotartam', $idotartam);
        $tp->setValue('kelt_hely', 'Egyetem tér 1. '.now()->format('Y-m-d'));
        $tp->setValue('szervezo', $event->Representative);
        $tp->setValue('pozicio', $event->RepresentativeTitle);
        $tp->setValue('intezmeny', $event->customerWithLegalBackgroundName);
    }

    private function fillContractFields(TemplateProcessor $tp, Event $event): void
    {
        $tp->setValue('masreszrol', $event->customerWithLegalBackgroundName);
        $tp->setValue('szekhely', $event->customerWithLegalBackgroundAddress);
        $tp->setValue('torzskonyvi_nyil_szam', $event->registrationNumber);
        $tp->setValue('adoszam', $event->customerWithLegalBackgroundTaxNumber);
        $tp->setValue('kepviseli', $event->organizerFullName);

        $tp->setValue('targyegy', $event->targyegy);
        $tp->setValue('targyketto', $event->targyketto);
        $tp->setValue('targyharom', $event->targyharom);
        $tp->setValue('meghatarozas', $event->meghatarozas);

        $tp->setValue('hasznalatba_ado_nev', $event->assignedUser[0]->displayName);
        $tp->setValue('hasznalatba_ado_email', $event->assignedUser[0]->email);
        $tp->setValue('hasznalatba_vevo_nev', $event->organizerFullName);
        $tp->setValue('hasznalatba_vevo_email', $event->organizerEmail);
    }

    public function generateEngedely(string $eventId)
    {
        $event = Event::where('id', $eventId)->first();

        $templatePath = storage_path('app/public/templates/rendezvenyi_engedely_template.docx');
        $templateProcessor = new TemplateProcessor($templatePath);

        $idotartam = str_replace('-', '.', $event->startDate)
            .' (tól/től) – '
            .str_replace('-', '.', $event->endDate)
            .' (ig)';

        $templateProcessor->setValue('rendezvenynev', $event->name ?? '');
        $templateProcessor->setValue('helyszin', $event->location ?? '');
        $templateProcessor->setValue('cim', $event->address ?? '');
        $templateProcessor->setValue('kezdes_datuma', str_replace('-', '.', $event->startDate ?? ''));
        $templateProcessor->setValue('veges_datuma', str_replace('-', '.', $event->endDate ?? ''));
        $templateProcessor->setValue('idotartam', $idotartam);
        $templateProcessor->setValue('rendezvenytipus', $event->type ?? '');
        $templateProcessor->setValue('minosites', $event->qualification ?? '');
        $templateProcessor->setValue('resztvevok_szama', $event->participants ?? '');
        $templateProcessor->setValue('nyilvanos', $this->boolLabel($event->public));
        $templateProcessor->setValue('jelleg', $event->nature ?? '');
        $templateProcessor->setValue('regisztracios_szam', $event->registrationNumber ?? '');

        $templateProcessor->setValue('szervezo_nev', $event->organizerFullName ?? '');
        $templateProcessor->setValue('szervezo_telefon', $event->organizerPhone ?? '');
        $templateProcessor->setValue('szervezo_email', $event->organizerEmail ?? '');
        $templateProcessor->setValue('szervezo_cim', $event->organizerAddress ?? '');

        if ($event->moreOrganizer) {
            $templateProcessor->setValue('masodik_szervezo_nev', $event->secondOrganizerFullName ?? '');
            $templateProcessor->setValue('masodik_szervezo_telefon', $event->secondOrganizerPhone ?? '');
            $templateProcessor->setValue('masodik_szervezo_email', $event->secondOrganizerEmail ?? '');
            $templateProcessor->setValue('masodik_szervezo_cim', $event->secondOrganizerAddress ?? '');
        } else {
            $templateProcessor->setValue('masodik_szervezo_nev', '–');
            $templateProcessor->setValue('masodik_szervezo_telefon', '–');
            $templateProcessor->setValue('masodik_szervezo_email', '–');
            $templateProcessor->setValue('masodik_szervezo_cim', '–');
        }

        $templateProcessor->setValue('megrendelo_nev', $event->customerWithLegalBackgroundName ?? '');
        $templateProcessor->setValue('szekhely', $event->customerWithLegalBackgroundAddress ?? '');
        $templateProcessor->setValue('torzskonyvi_szam', $event->registrationNumber ?? '');
        $templateProcessor->setValue('adoszam', $event->customerWithLegalBackgroundTaxNumber ?? '');
        $templateProcessor->setValue('megrendelo_telefon', $event->customerWithLegalBackgroundPhone ?? '');
        $templateProcessor->setValue('megrendelo_email', $event->customerWithLegalBackgroundEmail ?? '');

        $templateProcessor->setValue('reszletes_programterv', $event->detailedProgramPlan ?? '');
        $templateProcessor->setValue('lebonyolitas_modja', $event->furnishedMethod ?? '');
        $templateProcessor->setValue('leiras', $event->description ?? '');

        $templateProcessor->setValue('lesz_epites', $this->boolLabel($event->willBeConstruction));
        $templateProcessor->setValue('epites_kezdete', str_replace('-', '.', $event->constructionStartDate ?? ''));
        $templateProcessor->setValue('epites_vege', str_replace('-', '.', $event->constructionEndDate ?? ''));
        $templateProcessor->setValue('alvallalkozok', $event->constructionSubcontractors ?? '');
        $templateProcessor->setValue('magasban_munka', $this->boolLabel($event->constructionInHeights));
        $templateProcessor->setValue('allvanyozat', $this->boolLabel($event->constructionNeedScaffolding));
        $templateProcessor->setValue('kezi_anyagmozgatas', $this->boolLabel($event->constructionManualMaterialHandling));
        $templateProcessor->setValue('gepi_anyagmozgatas', $this->boolLabel($event->constructionMechanicalMaterialHandling));
        $templateProcessor->setValue('gepi_berendezesek', $this->arrayLabel($event->constructionMechanicalMaschines));
        $templateProcessor->setValue('egyeb_gepek', $event->constructionMechanicalMaschinesOthers ?? '');

        $templateProcessor->setValue('szallas_igeny', $this->boolLabel($event->needAccommodation));
        $templateProcessor->setValue('szallas_szam', $event->needAccommodationNumber ?? '');
        $templateProcessor->setValue('parkolo_igeny', $this->boolLabel($event->needParkingSpace));
        $templateProcessor->setValue('parkolo_szam', $event->needParkingSpaceNumber ?? '');
        $templateProcessor->setValue('wifi_igeny', $this->boolLabel($event->needWifi));
        $templateProcessor->setValue('oktatastechnika', $this->boolLabel($event->needEducationalTechnology));
        $templateProcessor->setValue('oktatastechnika_eszkozok', $event->needEducationalTechnologyItems ?? '');
        $templateProcessor->setValue('mozgaskorlatozott', $this->boolLabel($event->participantsWithReducedMobility));
        $templateProcessor->setValue('fotozas', $this->boolLabel($event->willBePhotos));
        $templateProcessor->setValue('fotozas_eszkoz', $event->willBePhotosDevice ?? '');

        $templateProcessor->setValue('catering_igeny', $this->boolLabel($event->needCatering));
        $templateProcessor->setValue('catering_tipus', $this->arrayLabel($event->needCateringType));

        $templateProcessor->setValue('hulladek', $this->boolLabel($event->producesTrash));
        $templateProcessor->setValue('hulladek_szallitas', $event->producesTrashDelivery ?? '');
        $templateProcessor->setValue('hulladek_szallito', $event->producesTrashDeliveryWhoDelivers ?? '');
        $templateProcessor->setValue('takaritas_elotte', $this->boolLabel($event->needCleaningBefore));
        $templateProcessor->setValue('takaritas_kozben', $this->boolLabel($event->needCleaningDuringEvent));

        $templateProcessor->setValue('villanyszerelok', $this->arrayLabel($event->needElectricians));
        $templateProcessor->setValue('villany_szekreny', $this->boolLabel($event->needElectricityFromCabinet));
        $templateProcessor->setValue('villany_szekreny_szam', $event->needElectricityFromCabinetNumber ?? '');
        $templateProcessor->setValue('tuzeszely', $this->boolLabel($event->fireHazardExpected));
        $templateProcessor->setValue('tuzeszely_leiras', $event->fireHazardExpectedDescription ?? '');
        $templateProcessor->setValue('por_fust_goz', $this->arrayLabel($event->expectedDustSmokeVapor));
        $templateProcessor->setValue('vegyi_anyagok', $this->boolLabel($event->expectedUsageOfChemicals));
        $templateProcessor->setValue('vegyi_anyagok_leiras', $event->expectedUsageOfChemicalsDescription ?? '');
        $templateProcessor->setValue('dekor', $this->boolLabel($event->expectedDecor));

        $templateProcessor->setValue('kepviselo_neve', $event->Representative ?? '');
        $templateProcessor->setValue('kepviselo_pozicio', $event->RepresentativeTitle ?? '');
        $templateProcessor->setValue('intezmeny_neve', $event->customerWithLegalBackgroundName ?? '');
        $templateProcessor->setValue('kelt_hely_datum', 'Győr, '.now()->format('Y.m.d.'));

        $templateProcessor->setValue('famulus_ar', $event->famulusPrice ? number_format($event->famulusPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('dorm_ar', $event->dormPrice ? number_format($event->dormPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('egyetem_ar', $event->uniPrice ? number_format($event->uniPrice, 0, ',', ' ').' Ft' : '–');

        $templateProcessor->setValue('status', $this->statusLabel($event->status));
        $templateProcessor->setValue('filePath', $event->filePath ?? '');

        $assignedUser = $event->assignedUser->first();
        $templateProcessor->setValue('hasznalatba_ado_nev', $assignedUser?->displayName ?? '');
        $templateProcessor->setValue('ugyintező_email', $assignedUser?->email ?? '');
        $templateProcessor->setValue('hasznalatba_ado_email', $assignedUser?->email ?? '');

        $templateProcessor->setValue('hasznalatba_vevo_nev', $event->organizerFullName ?? '');
        $templateProcessor->setValue('hasznalatba_vevo_email', $event->organizerEmail ?? '');
        $templateProcessor->setValue('ugyintéző_neve', $assignedUser?->displayName ?? '');

        $fileName = 'rendezvenyi_engedely_'.$event->id.'_'.time().'.docx';
        $tempPath = storage_path('app/public/'.$fileName);

        $templateProcessor->saveAs($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    private function boolLabel($value): string
    {
        if (is_null($value)) {
            return '–';
        }

        return $value ? 'Igen' : 'Nem';
    }

    private function arrayLabel($value): string
    {
        if (empty($value)) {
            return '–';
        }
        if (is_array($value)) {
            return implode(', ', $value);
        }

        return $value;
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'pending' => 'Függőben',
            'approved' => 'Jóváhagyva',
            'rejected' => 'Elutasítva',
            default => $status ?? '–',
        };
    }
}
