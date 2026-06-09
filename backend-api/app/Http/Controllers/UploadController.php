<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('xrays', 'public');
            $url = \Illuminate\Support\Facades\Storage::disk('public')->url($path);
            return response()->json(['url' => url($url)]);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }
}
