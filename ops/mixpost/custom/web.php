<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inovector\Mixpost\Http\Middleware\Auth as MixpostAuth;

Route::get('/', fn () => redirect()->to('/mixpost'));

Route::middleware(['web', MixpostAuth::class])->group(function () {
    Route::get('/digitalhut/autopublisher', fn () => response()->json([
        'mode' => Cache::get('digitalhut.autopublisher.paused', false) ? 'paused' : 'bounded-automatic',
        'owner_controlled' => true,
    ]));
    Route::post('/digitalhut/autopublisher', function (Request $request) {
        $paused = $request->boolean('paused');
        Cache::forever('digitalhut.autopublisher.paused', $paused);
        return redirect()->to('/mixpost')->with('status', $paused ? 'DigitalHut automatic publishing paused.' : 'DigitalHut automatic publishing resumed.');
    });
});
