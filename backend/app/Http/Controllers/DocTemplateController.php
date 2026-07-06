<?php

namespace App\Http\Controllers;

use App\Models\DocTemplate;
use App\Models\Event;
use App\Models\NeededDoc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocTemplateController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf,docx',
            ],
        ]);
        $file = $request->file('file');

        $filename = $file->getClientOriginalName() . '-' . time() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs('doctemplates', $filename, 'public');

        DocTemplate::create([
            'name' => $file->getClientOriginalName(),
            'path' => Storage::url($path),
            'type' => $request->type
        ]);

        return response()->json();
    }

    public function get_all()
    {
        return response()->json(DocTemplate::all());
    }

    public function get_needed($eventId)
    {
        $needed = NeededDoc::where('events_id', $eventId)->get();

        $neededTemplates = DocTemplate::whereIn('id', $needed->pluck('doc_templates_id'))->get();

        return response()->json($neededTemplates);
    }

    public function delete(Request $req)
    {
        $doctemp = DocTemplate::where('id', $req->id)->first();

        if (! $doctemp) {
            return response()->json(['message' => 'File not found!'], 404);
        }
        $cleanPath = str_replace('storage/', '', $doctemp->path);

        if (Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        }
        $doctemp->delete();

        return response()->json([], 204);
    }

    public function download($id)
    {
        $doctemp = DocTemplate::where('id', $id)->first();

        if (! $doctemp) {
            return response()->json(['message' => 'File not found!'], 404);
        }

        $cleanPath = str($doctemp->path)->replaceFirst('storage/', '')->value();

        return Storage::disk('public')->download($cleanPath);
    }
}
