<?php

namespace App\Http\Controllers;

use App\Models\DormPrices;
use Illuminate\Http\Request;

class DormPricesController extends Controller
{
    function show()
    {
        return response()->json(["error" => false, "data" => DormPrices::all()]);
    }

    function create(Request $request)
    {
        DormPrices::create([
            'name' => $request->name,
            'price' => $request->price,
        ]);
    }

    function update(Request $request)
    {
        $dormpr = DormPrices::findOrFail($request->id);

        if (!$dormpr) {
            return response()->json(["data" => "Price not found!"], 404);
        }

        $dormpr->update([
            'name' => $request->name,
            'price' => $request->price,
        ]);

        return response()->json(["data" => $dormpr]);
    }

    function delete(Request $request)
    {
        $dormpr = DormPrices::findOrFail($request->id);

        if (!$dormpr) {
            return response()->json(["data" => "Price not found!"], 404);
        }

        $dormpr->delete();
        return response()->json([], 204);
    }
}
