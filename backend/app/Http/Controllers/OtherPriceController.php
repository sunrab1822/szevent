<?php

namespace App\Http\Controllers;

use App\Models\OtherPrice;
use Illuminate\Http\Request;

class OtherPriceController extends Controller
{
    public function show()
    {
        $otherPrices = OtherPrice::orderBy('id')->get();

        return response()->json(['error' => false, 'data' => $otherPrices]);
    }

    public function create(Request $request)
    {
        OtherPrice::create([
            'name' => $request->name,
            'quantity' => $request->quantity,
            'price' => $request->price,
        ]);

        return response()->json();

    }

    public function update(Request $request)
    {
        $otherPrices = OtherPrice::findOrFail($request->id);

        if (! $otherPrices) {
            return response()->json(['data' => 'Price not found!'], 404);
        }

        $otherPrices->update([
            'name' => $request->name,
            'quantity' => $request->quantity,
            'price' => $request->price,
        ]);

        return response()->json(['data' => $otherPrices]);
    }

    public function delete(Request $request)
    {
        $otherPrices = OtherPrice::findOrFail($request->id);

        if (! $otherPrices) {
            return response()->json(['data' => 'Price not found!'], 404);
        }
        $otherPrices->delete();

        return response()->json([], 204);
    }
}
