<?php

namespace App\Http\Controllers;

use App\Models\UniPrice;
use Illuminate\Http\Request;

class UniPriceController extends Controller
{
    function show()
    {
        $uniPrice = UniPrice::orderBy('id')->get();
        return response()->json(["error" => false, "data" => $uniPrice]);
    }

    function create(Request $request)
    {
        UniPrice::create([
            'name' => $request->name,
            'accommodation' => $request->accommodation,
            'type' => $request->type,
            'dailyPrice' => $request->dailyPrice,
            'hourlyPrice' => $request->hourlyPrice,

        ]);
    }

    function update(Request $request)
    {
        $uniPrice = UniPrice::find($request->id);

        if (!$uniPrice) {
            return response()->json(["data" => "Price not found!"], 404);
        }

        $uniPrice->update([
            'name' => $request->name,
            'accommodation' => $request->accommodation,
            'type' => $request->type,
            'dailyPrice' => $request->dailyPrice,
            'hourlyPrice' =>$request->hourlyPrice
        ]);

        return response()->json(["data" => $uniPrice]);
    }

    function delete(Request $request)
    {
        $uniPrice = UniPrice::find($request->id);

        if (!$uniPrice) {
            return response()->json(["data" => "Price not found!"], 404);
        }
        $uniPrice->delete();
        return response()->json([], 204);
    }
}
