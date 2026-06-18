# DigitalHut Current API and Renderer Map

## Live application routes

- `/api/observatory-feed`
  - DigitalHut-owned environment-first feed.
  - Returns local structure, mapping, terrain, facility, city, route, and planetary GLBs.
  - No isolated character or loose-object default results.

- `/api/observatory`
  - Runtime/status API for the active category and query.
  - Declares the environment-first rendering policy.

- `/api/sketchfab`
  - Optional Sketchfab Data API environment search.
  - Filters results for environment, scene, terrain, city, architecture, building, landscape, map, and world signals.
  - Uses `SKETCHFAB_API_TOKEN` when configured.
  - Failure or timeout does not block the renderer.

- `/api/podcast-search`
  - Apple Podcasts Search API match for the current GLB title, category, and environment topic.
  - Returns up to three attributed episodes.
  - Audio starts only after a user presses Play and stops after ten seconds.
  - Official podcast artwork is displayed; DigitalHut does not invent a speaker identity.

- `/api/asset-conversion`
  - Supabase-backed upload/conversion queue.
  - Uses server-only conversion and service-role credentials.

## Direct integrations

- Supabase
  - Public live-feed writes use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Server conversion uses `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ASSET_BUCKET`.
  - FireCuda GLB delivery uses `VITE_SUPABASE_FIRECUDA_ASSET_BASE`.

- FireCuda personal GLB library
  - Personal 8 TB physical archive and external asset base.
  - Default category reels only accept environment/structure/terrain/planetary assets.

- Wallet provider
  - Browser wallet connection state through `window.ethereum`, RainbowKit, and Wagmi.
  - DigitalHut never requests or stores seed phrases or private keys.

- Unsplash image delivery
  - Category, feed, and fallback thumbnails.

## Default local environment GLBs

- `airport-delay.glb`
- `business-district.glb`
- `continent-city.glb`
- `gaming-world.glb`
- `history-district.glb`
- `mainstream-feed.glb`
- `orlando-traffic.glb`
- `planetary-hub.glb`
- `presentation-stage.glb`
- `public-works.glb`
- `real-estate-island.glb`
- `research-lab.glb`
- `science-voyage.glb`
- `undersea-media.glb`
- `workforce-site.glb`

## FireCuda default environment eligibility

Eligible default types:

- cities and countries
- houses, properties, buildings, and architecture
- terrain, heightmaps, coasts, districts, and mapped places
- museums, villages, tourist zones, and full scenes
- bases, stations, observatories, planets, and planetary systems

Search-only, blocked from default reels:

- isolated characters
- avatars
- robots
- helmets
- statues
- weapons
- figurines
- loose single-object GLBs without an environment

Current explicit default exclusions:

- `glaceons_christmas_miracle.glb`
- `transformers_prime_game_bumblebee.glb`
- `zed_-_league_of_legends.glb`

These files remain available for explicit search or creator workflows.
