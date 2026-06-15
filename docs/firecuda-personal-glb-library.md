# FireCuda Personal GLB Library

DigitalHut now treats `D:\UserBackups\Downloads\attachments.zip` as the first owner library pack.

## Pack 001

Imported into:

`public/models/firecuda-library`

Assets:

- `museum_of_ice_cream_singapore_-_welcome.glb`
- `international_space_elevator.glb`
- `glaceons_christmas_miracle.glb`
- `transformers_prime_game_bumblebee.glb`

## Google Drive Batch 001

Anthony supplied 25 Google Drive file IDs for the next FireCuda library batch. The IDs are captured in `src/lib/firecudaLibraryManifest.js` as `firecudaDriveBatch001`.

The Codex workspace could not download them directly because network access to Google Drive was blocked from the sandbox. The working import flow is:

1. Download the Drive files into `D:\UserBackups\Downloads`.
2. Run `tools\import-firecuda-library.ps1` from the repo root.
3. Add category tags for the new files in `src/lib/firecudaLibraryManifest.js`.
4. Commit the new GLBs and manifest update.

## Google Drive Batch 002

Anthony supplied a second 30-link batch. Some files repeat Batch 001, and the rest are new. The IDs are captured in `src/lib/firecudaLibraryManifest.js` as:

- `firecudaDriveBatch002`
- `firecudaDriveBatch002NewIds`
- `firecudaDriveBatch002ExistingIds`

Download Batch 002 directly to FireCuda:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\download-firecuda-drive-batch.ps1" -Batch 002
```

Batch 002 saves to:

`D:\UserBackups\Downloads\DigitalHutDriveBatch002`

Import only Batch 002:

```powershell
powershell -ExecutionPolicy Bypass -File ".\tools\import-firecuda-library.ps1" -Source "D:\UserBackups\Downloads\DigitalHutDriveBatch002"
```

## Category Use

- Real Estate: built environment placeholder until dedicated housing packs arrive.
- Gaming: Transformers Prime Bumblebee and Glaceon scene.
- Viral Mainstream: Museum of Ice Cream Singapore, Glaceon scene, game culture assets.
- Planetary: International space elevator.
- Continent: Singapore museum environment and international structure assets.
- Science: International space elevator and observatory/science environments.

## Round 2 Target

Build each major category to at least 100 verified renderable GLB assets:

- Real Estate: houses, apartments, islands, city blocks, interior rooms, local markets.
- Gaming: arenas, maps, props, environments, vehicles, characters only when scene-based.
- Viral Mainstream: pop-culture environments, event spaces, streaming sets, trend scenes.
- Planetary: planets, stations, observatories, launch pads, satellites, terrain.
- Continent: cities, food markets, landmarks, weather zones, travel routes.
- Science: labs, field studies, fossils, experiments, observatory scenes, research sites.

## Import Rules

- Keep original downloads on FireCuda.
- Copy verified GLBs into `public/models/firecuda-library`.
- Add category tags to the backend matcher.
- Prefer environments over isolated characters.
- Characters are allowed when they belong to a clear scene or presentation environment.
