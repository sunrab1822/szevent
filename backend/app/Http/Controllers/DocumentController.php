<?php

namespace App\Http\Controllers;

use App\Enums\DocTemplateType;
use App\Enums\Status;
use App\Models\DocTemplate;
use App\Models\Document;
use App\Models\DormOffers;
use App\Models\Event;
use App\Models\NeededDoc;
use App\Models\Version;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\PhpWord;
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

    public function get_all_documents(string $eventId)
    {
        $event = Event::withTrashed()->with('assignedUser')->find($eventId);

        if (! $event) {
            return response()->json(['message' => 'event not found!'], 404);
        }

        $documents = collect();

        if ($event->filePath && Storage::disk('public')->exists($event->filePath)) {
            $documents->push([
                'key' => 'attachment',
                'category' => 'event_attachment',
                'label' => 'Csatolt adatlap',
                'filename' => basename($event->filePath),
                'url' => Storage::url($event->filePath),
                'size' => Storage::disk('public')->size($event->filePath),
            ]);
        }

        foreach (Document::where('events_id', $event->id)->get() as $doc) {
            if (! Storage::disk('public')->exists($doc->path)) {
                continue;
            }

            $documents->push([
                'key' => 'document_'.$doc->id,
                'category' => 'uploaded',
                'label' => 'Feltöltött dokumentum',
                'filename' => basename($doc->path),
                'url' => Storage::url($doc->path),
                'size' => Storage::disk('public')->size($doc->path),
            ]);
        }

        $neededTemplates = DocTemplate::whereIn(
            'id',
            NeededDoc::where('events_id', $event->id)->pluck('doc_templates_id')->unique()
        )->get();

        foreach ($neededTemplates as $template) {
            $cleanPath = str_replace('storage/', '', $template->path);

            if (! Storage::disk('public')->exists($cleanPath)) {
                continue;
            }

            $documents->push([
                'key' => 'needed_'.$template->id.'_generated',
                'category' => 'generated',
                'label' => $template->name,
                'filename' => null,
                'url' => '/api/generate-docx/'.$event->id.'/'.$template->id,
                'size' => null,
            ]);
        }

        if (Storage::disk('public')->exists('templates/rendezvenyi_engedely_template.docx')) {
            $documents->push([
                'key' => 'engedely',
                'category' => 'generated',
                'label' => 'Rendezvényi engedélyeztető',
                'filename' => null,
                'url' => '/api/engedelyezes/'.$event->id,
                'size' => null,
            ]);
        }

        if (Version::where('events_id', $event->id)->exists()) {
            $documents->push([
                'key' => 'offer_summary',
                'category' => 'generated',
                'label' => 'Árajánlat összesítő',
                'filename' => null,
                'url' => '/api/offer-summary/'.$event->id,
                'size' => null,
            ]);
        }

        $famulusVersion = Version::where('events_id', $event->id)
            ->where('offer_type', 'famulus')
            ->orderByDesc('version')
            ->first();

        if ($famulusVersion) {
            $documents->push([
                'key' => 'uf_arajanlat',
                'category' => 'generated',
                'label' => 'UF árajánlat',
                'filename' => null,
                'url' => '/api/version/'.$famulusVersion->id.'/offer-summary',
                'size' => null,
            ]);
        }

        if (in_array($event->status, [
            Status::ADATKOZLO_FELKULDESERE_VAR->value,
            Status::ADATKOZLO_FELKULDVE->value,
            Status::RENDEZVENY_LEZARVA->value,
        ], true)) {
            $adatkozloTemplate = DocTemplate::where('type', DocTemplateType::ADATKOZLO->value)
                ->orderByDesc('id')
                ->first();

            if ($adatkozloTemplate) {
                $documents->push([
                    'key' => 'adatkozlo_'.$adatkozloTemplate->id,
                    'category' => 'generated',
                    'label' => $adatkozloTemplate->name,
                    'filename' => null,
                    'url' => '/api/generate-docx/'.$event->id.'/'.$adatkozloTemplate->id,
                    'size' => null,
                ]);
            }
        }

        $nyilatkozatTemplate = DocTemplate::where('type', DocTemplateType::ATLATHATOSAGI_NYILATKOZAT->value)
            ->orderByDesc('id')
            ->first();

        if ($nyilatkozatTemplate && Storage::disk('public')->exists(str_replace('storage/', '', $nyilatkozatTemplate->path))) {
            $documents->push([
                'key' => 'nyilatkozat_'.$nyilatkozatTemplate->id,
                'category' => 'generated',
                'label' => $nyilatkozatTemplate->name,
                'filename' => null,
                'url' => '/api/generate-docx/'.$event->id.'/'.$nyilatkozatTemplate->id,
                'size' => null,
            ]);
        }

        return response()->json(['documents' => $documents->values()]);
    }

    public function generate_docx(string $eventId, string $type)
    {
        $event = Event::withTrashed()
            ->with(['assignedUser', 'famulusoffers', 'unioffers'])
            ->where('id', $eventId)->first();
        $doc = DocTemplate::where('id', $type)->first();

        if (! $event || ! $doc) {
            return response()->json(['message' => 'event or template not found!'], 404);
        }

        $templateProcessor = new TemplateProcessor(
            storage_path('app/public'.str_replace('/storage', '', $doc->path))
        );

        if (in_array('megnevezes', $templateProcessor->getVariables(), true)) {
            $this->fillPriceOfferFields($templateProcessor, $event);
        }

        $this->fillTemplateValues($templateProcessor, $event);

        $fileName = Str::slug(pathinfo($doc->name, PATHINFO_FILENAME), '_')
            .'_'.$event->id.'_'.time().'.docx';
        $tempPath = storage_path('app/public/'.$fileName);

        $templateProcessor->saveAs($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
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

            $brutto = (float) $offer->total_price;
            $netto = $brutto / 1.27;

            $tp->setValue("megnevezes#{$idx}", $offer->offer_name);
            $tp->setValue("mennyiseg#{$idx}", $offer->duration);
            $tp->setValue("netto_ar#{$idx}", number_format($netto, 0, ',', ' ').' Ft');
            $tp->setValue("afa#{$idx}", '27%');
            $tp->setValue("brutto_ar#{$idx}", number_format($brutto, 0, ',', ' ').' Ft');
            $tp->setValue("netto#{$idx}", number_format($netto, 0, ',', ' ').' Ft');
            $tp->setValue("brutto#{$idx}", number_format($brutto, 0, ',', ' ').' Ft');
            $tp->setValue("osszar#{$idx}", number_format($brutto, 0, ',', ' ').' Ft');
            $tp->setValue("összár#{$idx}", number_format($brutto, 0, ',', ' ').' Ft');
            $tp->setValue("vegosszeg#{$idx}", number_format($brutto, 0, ',', ' ').' Ft');
        }

        if ($lines->isEmpty()) {
            foreach (['megnevezes', 'mennyiseg', 'netto_ar', 'afa', 'brutto_ar', 'netto', 'brutto', 'osszar', 'összár', 'vegosszeg'] as $key) {
                $tp->setValue($key.'#1', '');
            }
        }
    }

    private function fillTemplateValues(TemplateProcessor $tp, Event $event): void
    {
        $assignedUser = $event->assignedUser->first();
        $price = fn ($value) => $value ? number_format((float) $value, 0, ',', ' ').' Ft' : '–';

        $secondOrganizer = $event->moreOrganizer;

        $tp->setValues([
            'rendezvenynev' => $event->name ?? '',
            'idotartam' => str_replace('-', '.', $event->startDate).' (tól/től) - '.str_replace('-', '.', $event->endDate).' (ig)',
            'kezdes_datuma' => str_replace('-', '.', $event->startDate ?? ''),
            'veges_datuma' => str_replace('-', '.', $event->endDate ?? ''),
            'helyszin' => $event->location ?? '',
            'cim' => $event->address ?? '',
            'leiras' => $event->description ?? '',
            'rendezvenytipus' => $event->type ?? '',
            'jelleg' => $event->nature ?? '',
            'resztvevok_szama' => $event->participants ?? '',
            'meghatarozas' => $event->name ?? '',

            'masreszrol' => $event->customerWithLegalBackgroundName ?? '',
            'megrendelo_nev' => $event->customerWithLegalBackgroundName ?? '',
            'szerzodo_fel' => $event->customerWithLegalBackgroundName ?? '',
            'intezmeny' => $event->customerWithLegalBackgroundName ?? '',
            'intezmeny_neve' => $event->customerWithLegalBackgroundName ?? '',
            'szekhely' => $event->customerWithLegalBackgroundAddress ?? '',
            'adoszam' => $event->customerWithLegalBackgroundTaxNumber ?? '',
            'torzskonyvi_nyil_szam' => $event->registrationNumber ?? '',
            'torzskonyvi_szam' => $event->registrationNumber ?? '',
            'nyilvantartasi_szam' => $event->registrationNumber ?? '',
            'megrendelo_telefon' => $event->customerWithLegalBackgroundPhone ?? '',
            'megrendelo_email' => $event->customerWithLegalBackgroundEmail ?? '',

            'kepviseli' => $event->organizerFullName ?? '',
            'kepviselo_neve' => $event->organizerFullName ?? '',
            'szervezo' => $event->Representative ?? '',
            'pozicio' => $event->RepresentativeTitle ?? '',
            'kepviselo_pozicio' => $event->RepresentativeTitle ?? '',

            'szervezo_nev' => $event->organizerFullName ?? '',
            'szervezo_telefon' => $event->organizerPhone ?? '',
            'szervezo_email' => $event->organizerEmail ?? '',
            'szervezo_cim' => $event->organizerAddress ?? '',
            'masodik_szervezo_nev' => $secondOrganizer ? ($event->secondOrganizerFullName ?? '') : '–',
            'masodik_szervezo_telefon' => $secondOrganizer ? ($event->secondOrganizerPhone ?? '') : '–',
            'masodik_szervezo_email' => $secondOrganizer ? ($event->secondOrganizerEmail ?? '') : '–',
            'masodik_szervezo_cim' => $secondOrganizer ? ($event->secondOrganizerAddress ?? '') : '–',

            'targyegy' => $event->address ?? '',
            'targyketto' => $event->location ?? '',
            'targyharom' => $event->location ?? '',

            'hasznalatba_ado_nev' => $assignedUser?->displayName ?? '',
            'hasznalatba_ado_email' => $assignedUser?->email ?? '',
            'ugyintéző_neve' => $assignedUser?->displayName ?? '',
            'ugyintező_email' => $assignedUser?->email ?? '',
            'hasznalatba_vevo_nev' => $event->organizerFullName ?? '',
            'hasznalatba_vevo_email' => $event->organizerEmail ?? '',

            'kelt_hely' => now()->format('Y. m. d.'),
            'kelt_datum' => now()->format('Y. m. d.'),
            'kelt_teljes' => 'Győr, '.now()->format('Y. m. d.'),

            'famulus_ar' => $price($event->famulusPrice),
            'dorm_ar' => $price($event->dormPrice),
            'egyetem_ar' => $price($event->uniPrice),
            'vegosszeg' => $price($event->uniPrice),
            'osszar' => $price($event->uniPrice),
            'összár' => $price($event->uniPrice),
            'brutto' => $price($event->uniPrice),
            'netto' => $price($event->uniPrice ? (float) $event->uniPrice / 1.27 : 0),
            'afa' => $event->uniPrice ? '27%' : '–',
            'brutto_ar' => $price($event->uniPrice),
            'netto_ar' => $price($event->uniPrice ? (float) $event->uniPrice / 1.27 : 0),
        ]);
    }

    public function generateEngedely(string $eventId)
    {
        $event = Event::withTrashed()->where('id', $eventId)->first();

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
        $templateProcessor->setValue('vegosszeg', $event->uniPrice ? number_format($event->uniPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('osszar', $event->uniPrice ? number_format($event->uniPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('összár', $event->uniPrice ? number_format($event->uniPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('brutto', $event->uniPrice ? number_format($event->uniPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('netto', $event->uniPrice ? number_format((float) $event->uniPrice / 1.27, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('afa', $event->uniPrice ? '27%' : '–');
        $templateProcessor->setValue('brutto_ar', $event->uniPrice ? number_format($event->uniPrice, 0, ',', ' ').' Ft' : '–');
        $templateProcessor->setValue('netto_ar', $event->uniPrice ? number_format((float) $event->uniPrice / 1.27, 0, ',', ' ').' Ft' : '–');

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

    public function generateOfferSummary(string $eventId)
    {
        $event = Event::withTrashed()->find($eventId);

        if (! $event) {
            return response()->json(['message' => 'event not found!'], 404);
        }

        $offerTypes = [
            'famulus' => 'UF árajánlat',
            'dorm' => 'Kollégiumi árajánlat',
            'uni' => 'Egyetemi árajánlat',
        ];

        $sections = [];
        $grandTotal = 0;

        foreach ($offerTypes as $type => $label) {
            $version = Version::where('events_id', $event->id)
                ->where('offer_type', $type)
                ->orderByDesc('version')
                ->first();

            if (! $version) {
                continue;
            }

            $items = match ($type) {
                'famulus' => $version->famulusOffers,
                'dorm' => $version->dormOffers,
                'uni' => $version->uniOffers,
            };

            if ($type === 'dorm' && $items->isEmpty() && empty($version->comment)) {
                $items = DormOffers::where('events_id', $event->id)
                    ->whereNull('versions_id')
                    ->get();
            }

            $sections[] = [
                'label' => $label,
                'comment' => $version->comment,
                'items' => $items,
            ];

            $grandTotal += $items->sum('total_price');
        }

        $phpWord = new PhpWord;
        $section = $phpWord->addSection();

        $section->addText('Elfogadott árajánlatok összesítője', ['bold' => true, 'size' => 16]);
        $section->addTextBreak();
        $section->addText('Rendezvény: '.$event->name);
        $section->addText('Időtartam: '.str_replace('-', '.', $event->startDate).' – '.str_replace('-', '.', $event->endDate));
        $section->addText('Helyszín: '.($event->location ?? '–'));
        $section->addText('Szervező: '.($event->organizerFullName ?? '–'));
        $section->addTextBreak();

        if (empty($sections)) {
            $section->addText('A rendezvényhez nem tartozik árajánlat.');
        }

        $headerCellStyle = ['bgColor' => 'D9D9D9'];
        $bold = ['bold' => true];

        foreach ($sections as $offerSection) {
            $section->addText($offerSection['label'], ['bold' => true, 'size' => 13]);

            if ($offerSection['items']->isEmpty()) {
                $section->addText('Tétel nélküli árajánlat.');
            } else {
                $table = $section->addTable([
                    'borderSize' => 6,
                    'borderColor' => '000000',
                    'cellMargin' => 80,
                ]);

                $table->addRow();
                $table->addCell(4500, $headerCellStyle)->addText('Tétel', $bold);
                $table->addCell(2000, $headerCellStyle)->addText('Mennyiség', $bold);
                $table->addCell(2500, $headerCellStyle)->addText('Egységár', $bold);
                $table->addCell(2500, $headerCellStyle)->addText('Összeg', $bold);

                foreach ($offerSection['items'] as $item) {
                    $table->addRow();
                    $table->addCell(4500)->addText($item->offer_name);
                    $table->addCell(2000)->addText((string) $item->duration);
                    $table->addCell(2500)->addText(number_format((float) $item->price_per_unit, 0, ',', ' ').' Ft');
                    $table->addCell(2500)->addText(number_format((float) $item->total_price, 0, ',', ' ').' Ft');
                }

                $table->addRow();
                $table->addCell(4500, $headerCellStyle)->addText('Részösszeg', $bold);
                $table->addCell(2000, $headerCellStyle)->addText('');
                $table->addCell(2500, $headerCellStyle)->addText('');
                $table->addCell(2500, $headerCellStyle)->addText(
                    number_format((float) $offerSection['items']->sum('total_price'), 0, ',', ' ').' Ft',
                    $bold
                );
            }

            if (! empty($offerSection['comment'])) {
                $section->addText('Megjegyzés: '.$offerSection['comment']);
            }

            $section->addTextBreak();
        }

        $section->addText(
            'Összesített végösszeg: '.number_format((float) $grandTotal, 0, ',', ' ').' Ft',
            ['bold' => true, 'size' => 13]
        );

        $fileName = 'ajanlat_osszesito_'.$event->id.'_'.time().'.docx';
        $tempPath = storage_path('app/public/'.$fileName);

        IOFactory::createWriter($phpWord)->save($tempPath);

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    public function generateVersionOfferSummary(string $versionId)
    {
        $version = Version::with(['famulusOffers', 'dormOffers', 'uniOffers'])->find($versionId);

        if (! $version) {
            return response()->json(['message' => 'version not found!'], 404);
        }

        $event = Event::withTrashed()->find($version->events_id);

        if (! $event) {
            return response()->json(['message' => 'event not found!'], 404);
        }

        $items = match ($version->offer_type) {
            'famulus' => $version->famulusOffers,
            'dorm' => $version->dormOffers,
            'uni' => $version->uniOffers,
            default => collect(),
        };

        $isLatest = ! Version::where('events_id', $event->id)
            ->where('offer_type', $version->offer_type)
            ->where('version', '>', $version->version)
            ->exists();

        if ($version->offer_type === 'dorm' && $isLatest && $items->isEmpty() && empty($version->comment)) {
            $items = DormOffers::where('events_id', $event->id)
                ->whereNull('versions_id')
                ->get();
        }

        $doc = $version->offer_type === 'famulus'
            ? DocTemplate::where('type', 3)->orderByDesc('id')->first()
            : DocTemplate::where('type', 1)->orderByDesc('id')->first();

        $baseName = $doc
            ? Str::slug(pathinfo($doc->name, PATHINFO_FILENAME), '_')
            : 'ajanlat_osszesito';
        $fileName = $baseName.'_v'.$version->version.'_'.$event->id.'_'.time().'.docx';
        $tempPath = storage_path('app/public/'.$fileName);

        $templatePath = $doc
            ? storage_path('app/public'.str_replace('/storage', '', $doc->path))
            : null;

        if ($templatePath && file_exists($templatePath)) {
            $templateProcessor = new TemplateProcessor($templatePath);
            $this->fillVersionSummaryFields($templateProcessor, $event, $version, $items);
            $this->fillTemplateValues($templateProcessor, $event);
            $templateProcessor->saveAs($tempPath);
        } else {
            $this->buildVersionSummaryDocx($event, $version, $items, $tempPath);
        }

        return response()->download($tempPath, $fileName)->deleteFileAfterSend(true);
    }

    private function offerTypeLabel(string $offerType): string
    {
        return match ($offerType) {
            'famulus' => 'UF árajánlat',
            'dorm' => 'Kollégiumi árajánlat',
            'uni' => 'Egyetemi árajánlat',
            default => 'Árajánlat',
        };
    }

    private function fillVersionSummaryFields(TemplateProcessor $tp, Event $event, Version $version, $items): void
    {
        $tp->setValue('rendezvenynev', $event->name ?? '');
        $tp->setValue('idotartam', str_replace('-', '.', $event->startDate).' – '.str_replace('-', '.', $event->endDate));
        $tp->setValue('helyszin', $event->location ?? '–');
        $tp->setValue('szervezo', $event->organizerFullName ?? '–');
        $tp->setValue('ajanlat_tipus', $this->offerTypeLabel($version->offer_type));
        $tp->setValue('verzio', (string) $version->version);
        $tp->setValue('letrehozva', $version->created_at?->format('Y.m.d H:i') ?? '–');
        $tp->setValue('indoklas', $version->reason ?: '–');
        $tp->setValue('megjegyzes', $version->comment ?: '–');

        $bruttoOsszeg = (float) $items->sum('total_price');
        $nettoOsszeg = $bruttoOsszeg / 1.27;
        $price = fn ($value) => number_format($value, 0, ',', ' ').' Ft';

        if (in_array('megnevezes', $tp->getVariables(), true)) {
            $rowCount = max($items->count(), 1);
            $tp->cloneRow('megnevezes', $rowCount);

            foreach ($items as $i => $offer) {
                $idx = $i + 1;

                $brutto = (float) $offer->total_price;
                $netto = $brutto / 1.27;

                $tp->setValue("megnevezes#{$idx}", $offer->offer_name);
                $tp->setValue("mennyiseg#{$idx}", $offer->duration);
                $tp->setValue("netto_ar#{$idx}", $price($netto));
                $tp->setValue("afa#{$idx}", '27%');
                $tp->setValue("brutto_ar#{$idx}", $price($brutto));
                $tp->setValue("netto#{$idx}", $price($netto));
                $tp->setValue("brutto#{$idx}", $price($brutto));
                $tp->setValue("osszar#{$idx}", $price($brutto));
                $tp->setValue("összár#{$idx}", $price($brutto));
                $tp->setValue("vegosszeg#{$idx}", $price($brutto));
            }

            if ($items->isEmpty()) {
                foreach (['megnevezes', 'mennyiseg', 'netto_ar', 'afa', 'brutto_ar', 'netto', 'brutto', 'osszar', 'összár', 'vegosszeg'] as $key) {
                    $tp->setValue($key.'#1', '');
                }
            }
        }

        $tp->setValues([
            'vegosszeg' => $price($bruttoOsszeg),
            'osszar' => $price($bruttoOsszeg),
            'összár' => $price($bruttoOsszeg),
            'brutto' => $price($bruttoOsszeg),
            'netto' => $price($nettoOsszeg),
            'afa' => '27%',
            'brutto_ar' => $price($bruttoOsszeg),
            'netto_ar' => $price($nettoOsszeg),
        ]);
    }

    private function buildVersionSummaryDocx(Event $event, Version $version, $items, string $tempPath): void
    {
        $phpWord = new PhpWord;
        $section = $phpWord->addSection();

        $section->addText('Árajánlat összesítő', ['bold' => true, 'size' => 16]);
        $section->addText($this->offerTypeLabel($version->offer_type).' – '.$version->version.'. verzió', ['bold' => true, 'size' => 13]);
        $section->addTextBreak();
        $section->addText('Rendezvény: '.$event->name);
        $section->addText('Időtartam: '.str_replace('-', '.', $event->startDate).' – '.str_replace('-', '.', $event->endDate));
        $section->addText('Helyszín: '.($event->location ?? '–'));
        $section->addText('Szervező: '.($event->organizerFullName ?? '–'));
        $section->addText('Létrehozva: '.($version->created_at?->format('Y.m.d H:i') ?? '–'));

        if (! empty($version->reason)) {
            $section->addText('Indoklás: '.$version->reason);
        }

        $section->addTextBreak();

        $headerCellStyle = ['bgColor' => 'D9D9D9'];
        $bold = ['bold' => true];

        if ($items->isEmpty()) {
            $section->addText('Tétel nélküli árajánlat.');
        } else {
            $table = $section->addTable([
                'borderSize' => 6,
                'borderColor' => '000000',
                'cellMargin' => 80,
            ]);

            $table->addRow();
            $table->addCell(4500, $headerCellStyle)->addText('Tétel', $bold);
            $table->addCell(2000, $headerCellStyle)->addText('Mennyiség', $bold);
            $table->addCell(2500, $headerCellStyle)->addText('Egységár', $bold);
            $table->addCell(2500, $headerCellStyle)->addText('Összeg', $bold);

            foreach ($items as $item) {
                $table->addRow();
                $table->addCell(4500)->addText($item->offer_name);
                $table->addCell(2000)->addText((string) $item->duration);
                $table->addCell(2500)->addText(number_format((float) $item->price_per_unit, 0, ',', ' ').' Ft');
                $table->addCell(2500)->addText(number_format((float) $item->total_price, 0, ',', ' ').' Ft');
            }

            $table->addRow();
            $table->addCell(4500, $headerCellStyle)->addText('Végösszeg', $bold);
            $table->addCell(2000, $headerCellStyle)->addText('');
            $table->addCell(2500, $headerCellStyle)->addText('');
            $table->addCell(2500, $headerCellStyle)->addText(
                number_format((float) $items->sum('total_price'), 0, ',', ' ').' Ft',
                $bold
            );
        }

        if (! empty($version->comment)) {
            $section->addTextBreak();
            $section->addText('Megjegyzés: '.$version->comment);
        }

        IOFactory::createWriter($phpWord)->save($tempPath);
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
