# DigitalHut Daily Situation Discovery Engine

DigitalHut should not wait for Anthony to manually invent every post.

The daily engine surfaces real-world situations, turns them into candidate report cards, attempts to attach the nearest usable 3D/GLB asset, then lets Anthony decide what becomes a rendered DigitalHut report.

This is an exclusive backend lane for:

- daily international real-world incidents
- weather-related issues
- scammy websites
- overpromising websites
- tourist congestion
- researcher science data problems
- ongoing public-health, environmental, and scientific monitoring scenarios

## Flow

1. Auto-discover daily situations.
2. Generate report candidates.
3. Search related 3D/GLB assets.
4. Attach closest asset or plan a generated scene.
5. Anthony reviews and selects.
6. DigitalHut builds a 3D scene.
7. AI voice explains the asset.
8. Publish as a blog-style report.
9. Save to backend archive.

## Categories

- tourist alerts
- weather disruptions
- traffic congestion
- accidents
- airport delays
- sailing/boating issues
- scam complaints
- website/service complaints
- construction delays
- workforce projects
- scientific projects
- animal migration/access blocks
- dangerous weather patterns
- regional/global travel concerns
- local public safety patterns
- public health data gaps
- environmental monitoring blind spots
- forecast/model data conflicts
- overpromising website complaint patterns

## Candidate Report Card

Each candidate contains:

- title
- problem scenario
- location / region
- category
- why it matters
- source links or source notes
- confidence level
- suggested 3D render idea
- suggested GLB scene type
- possible solutions / safety tips
- AI voice script draft
- developer note for Anthony
- related 3D asset match

## Related 3D Asset Matching

Every candidate attempts to attach a 3D asset. The matcher checks:

- location
- category
- object type
- scenario type
- timestamp freshness
- file type
- metadata tags
- AI description similarity
- previous viewer interest
- public/private permission

## Vector Math Layer

DigitalHut should not rely on filenames alone. The matching layer uses normalized vector scoring inspired by 3D search systems:

- semantic shape: airport, weather, road, building, map, website, health, environment, workforce, game, research, stream
- topology: linear flow, enclosure, network, hazard field, cluster, terrain, object model
- scale, volume, and flow estimates
- cosine similarity between the situation candidate and available assets
- freshness, permission, and viewer-interest weighting
- penalties for generic demo models when a scenario-specific environment is better

This gives DigitalHut a local math path now, and a future upgrade path toward real mesh embeddings, spherical-harmonic descriptors, and cross-modal query-by-example search.

Search sources can include:

- recent DigitalHut uploads
- completed assets
- pending 3D previews
- Supabase Storage
- Cloudflare R2 / asset containers
- public approved GLB libraries
- uploaded research packages
- user backend profile assets
- category asset libraries
- connected APIs

If no match is found, DigitalHut creates a simplified generated-scene plan.

## Product Identity

DigitalHut becomes a daily AI observatory that finds real-world challenges, lets Anthony choose the best ones, then turns them into useful blog-style 3D reports with voice narration and backend asset records.

The researcher part focuses on currently developing science-data situations that need careful verification before public release, such as outbreak data gaps, weather model conflicts, environmental sensor uncertainty, wildfire smoke or water-quality monitoring, scientific project delays, and public data sources that disagree.
