# DigitalHut Preservation Runners

DigitalHut is now treated as a preserved observatory system, not a loose prototype. The preservation runner checks the exact files, asset names, provider endpoints, and Vercel/Vite assumptions that keep the renderer stable.

## Main Commands

Run from the FireCuda checkout:

```powershell
cd "D:\DigitalHutWork\Digitalhut-commit"
$env:NPM_CONFIG_CACHE='D:\DigitalHutWork\npm-cache'
$env:TEMP='D:\DigitalHutWork\Temp'
$env:TMP='D:\DigitalHutWork\Temp'
$env:NODE_OPTIONS='--max-old-space-size=4096'
npm.cmd run preserve
```

Build test:

```powershell
npm.cmd run build -- --clearScreen false
```

Local endpoint preservation test after serving `dist`:

```powershell
node .\tools\local-static-preview.mjs
npm.cmd run preserve:local
```

Live endpoint preservation test:

```powershell
npm.cmd run preserve:live
```

## What It Verifies

- Vite/Vercel runner shape: `framework: vite`, `outputDirectory: dist`.
- Main observatory files are present.
- Supabase migration and backend conversion files are present.
- FireCuda manifest GLB filenames exactly match local GLB filenames.
- API catalog GLB filenames exactly match the manifest.
- Local GLB binary magic starts with `glTF`.
- FireCuda disabled/enabled state is explicit.
- Single-object/character GLBs are blocked from default reels.
- Environment-first filtering is still active.
- Optional endpoint checks verify `/api/provider-status`, `/api/observatory-feed`, and `/api/sketchfab`.

## Runner Meaning

`npm.cmd run preserve` is the offline structural audit. It does not need API keys or internet.

`npm.cmd run preserve:local` is the local static endpoint audit. It needs a local server running at `http://127.0.0.1:4173`.

`npm.cmd run preserve:live` is the production audit. It confirms Vercel can see provider configuration and that feed endpoints are returning renderable assets.

## Current Policy

The owner library can stay disabled while API feeds are being surfaced. If FireCuda is re-enabled, run the preservation runner before deploy so broken Supabase paths or mismatched filenames do not take over the renderer.
