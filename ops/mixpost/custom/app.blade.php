<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth overflow-x-hidden">
<head>
    <title inertia>Mixpost{{ config('app.name') ? ' - ' . config('app.name') : '' }}</title>
    <meta name="robots" content="noindex, nofollow">
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="shortcut icon" href="{{ asset('/vendor/mixpost/favicon.ico') }}">
    @routes
    {{ mixpostAssets() }}
    @inertiaHead
    <style>
      .digitalhut-controls{position:fixed;top:18px;right:18px;z-index:9999;display:flex;align-items:center;gap:8px}.digitalhut-return,.digitalhut-pause{display:inline-flex;align-items:center;gap:9px;padding:10px 14px;border:1px solid rgba(34,211,238,.55);border-radius:999px;background:linear-gradient(135deg,#082f49,#0e7490);box-shadow:0 12px 30px rgba(8,47,73,.3);color:#ecfeff;font:700 12px/1.1 Inter,system-ui,sans-serif;text-decoration:none;transition:transform .2s ease,box-shadow .2s ease}.digitalhut-pause{border-color:rgba(254,240,138,.65);background:#422006;cursor:pointer}.digitalhut-return:hover,.digitalhut-return:focus-visible,.digitalhut-pause:hover,.digitalhut-pause:focus-visible{transform:translateX(-4px);box-shadow:0 15px 34px rgba(8,145,178,.35);outline:3px solid #fef08a;outline-offset:3px}.digitalhut-return span{font-size:18px}@media(max-width:700px){.digitalhut-controls{top:12px;right:12px}.digitalhut-return,.digitalhut-pause{padding:9px 11px}.digitalhut-return b{display:none}}@media(prefers-reduced-motion:reduce){.digitalhut-return,.digitalhut-pause{transition:none}}
    </style>
</head>
<body class="font-sans">
<div class="digitalhut-controls">
  <form method="POST" action="/digitalhut/autopublisher">@csrf<input type="hidden" name="paused" value="1"><button class="digitalhut-pause" type="submit">Emergency pause</button></form>
  <a class="digitalhut-return" href="https://www.digitalhut.app/" aria-label="Return to DigitalHut observatory"><span aria-hidden="true">←</span><b>Back to DigitalHut</b></a>
</div>
@inertia
</body>
</html>
