<?php

namespace App\Http\Controllers;

use App\Models\DocTemplate;
use App\Models\Document;
use App\Models\DormOffers;
use App\Models\Event;
use App\Models\NeededDoc;
use App\Models\Version;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $event = Event::with('assignedUser')->find($eventId);

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

        $hasAssignedUser = $event->assignedUser->isNotEmpty();

        foreach ($neededTemplates as $template) {
            $cleanPath = str_replace('storage/', '', $template->path);

            if (! Storage::disk('public')->exists($cleanPath)) {
                continue;
            }

            $documents->push([
                'key' => 'needed_'.$template->id,
                'category' => 'needed_template',
                'label' => $template->name,
                'filename' => basename($cleanPath),
                'url' => '/api/download-file/'.$template->id,
                'size' => null,
            ]);

            if ($hasAssignedUser) {
                $documents->push([
                    'key' => 'needed_'.$template->id.'_generated',
                    'category' => 'generated',
                    'label' => $template->name.' (kitöltött)',
                    'filename' => null,
                    'url' => '/api/generate-docx/'.$event->id.'/'.$template->id,
                    'size' => null,
                ]);
            }
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

        return response()->json(['documents' => $documents->values()]);
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

    public function generateOfferSummary(string $eventId)
    {
        $event = Event::find($eventId);

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

        $event = Event::find($version->events_id);

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

        $fileName = 'ajanlat_osszesito_'.$version->offer_type.'_v'.$version->version.'_'.$event->id.'_'.time().'.docx';
        $tempPath = storage_path('app/public/'.$fileName);

        $doc = DocTemplate::where('type', 3)->orderByDesc('id')->first();
        $templatePath = $doc
            ? storage_path('app/public'.str_replace('/storage', '', $doc->path))
            : null;

        if ($templatePath && file_exists($templatePath)) {
            $templateProcessor = new TemplateProcessor($templatePath);
            $this->fillVersionSummaryFields($templateProcessor, $event, $version, $items);
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
        $tp->setValue('vegosszeg', number_format((float) $items->sum('total_price'), 0, ',', ' ').' Ft');

        $rowCount = max($items->count(), 1);
        $tp->cloneRow('megnevezes', $rowCount);

        foreach ($items as $i => $offer) {
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

        if ($items->isEmpty()) {
            foreach (['megnevezes', 'mennyiseg', 'netto_ar', 'afa', 'brutto_ar'] as $key) {
                $tp->setValue($key.'#1', '');
            }
        }
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
