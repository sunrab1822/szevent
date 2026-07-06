<?php

namespace App\Http\Controllers;

use App\Models\FamulusPrice;
use Illuminate\Http\Request;

class FamulusPriceController extends Controller
{
    function show()
    {
        $famulusPrice = FamulusPrice::orderBy('id')->get();
        return response()->json(["error" => false, "data" => $famulusPrice]);
    }

    function create(Request $request)
    {
        FamulusPrice::create([
            'name' => $request->name,
            'default' => $request->default,
            'weekend' => $request->weekend,
            'external' => $request->external,
            'external_weekend' => $request->external_weekend,
        ]);
    }

    function update(Request $request)
    {
        $famulusPrice = FamulusPrice::findOrFail($request->id);

        if (!$famulusPrice) {
            return response()->json(["data" => "Price not found!"], 404);
        }

        $famulusPrice->update([
            'default' => $request->default,
            'weekend' => $request->weekend,
            'external' => $request->external,
            'external_weekend' => $request->external_weekend,
        ]);

        return response()->json(["data" => $famulusPrice]);
    }

    function delete(Request $request)
    {
        $famulusPrice = FamulusPrice::findOrFail($request->id);

        if (!$famulusPrice) {
            return response()->json(["data" => "Price not found!"], 404);
        }
        $famulusPrice->delete();
        return response()->json([], 204);
    }

}
