# DigitalHut System Update: Stability, Security, SEO, Support

## Core Goal
DigitalHut.app is an AI Observatory platform with renderer visuals, guided tours, wallet/account tiers, library feeds, AI voice, and Node backend intelligence.

## Anti-Lag / Renderer Performance
- Preload current GLB and next 2 suggested GLBs.
- Compress GLB assets with Draco / mesh optimization.
- Add renderer fallback if device is weak.
- Add lazy thumbnails.
- Add FPS monitor and auto-reduce effects.
- Add camera path presets instead of heavy free-camera logic.
- Add queue system for large models.

## Unreal / Advanced Renderer Path
- Keep current web GLB renderer for browser.
- Add future Unreal Pixel Streaming or similar remote-render mode for Pro/Enterprise.
- Node server chooses:
  - Web GLB renderer for normal users.
  - Cloud streamed renderer for premium heavy scenes.

## Hash / Integrity System
- Hash every GLB, thumbnail, feed item, and saved project.
- Use SHA-256 for asset integrity.
- Store hash in Supabase.
- Verify file hash before renderer loads.
- Prevent duplicate uploads by hash match.
- Create asset fingerprint:
  category + size + hash + uploader + timestamp.

## Anti-Hack / Anti-Dupe
- Never unlock Premium/Pro from frontend only.
- Verify wallet/account tier on Node backend.
- Add rate limits to API routes.
- Add request signing for sensitive actions.
- Add duplicate asset detection.
- Add suspicious activity logs.
- Add wallet replay protection.
- Add admin review for flagged uploads.
- Add Supabase Row Level Security for customer data.

## Server Daily Maintenance
Daily job should:
- Backup Supabase records.
- Export recent user/session logs.
- Verify asset hashes.
- Remove expired temp files.
- Check failed renders.
- Check broken GLB links.
- Refresh SEO sitemap.
- Rotate logs.
- Save FireCuda backup copy.
- Send admin health report.

## Help / Glitch / Hacker Report Feature
Add a Help button:
- Report glitch
- Report hacker
- Report duplicated asset
- Report broken renderer
- Report wallet/payment issue
- Report missing saved project

Each report stores:
- user id
- wallet id if connected
- page route
- renderer model
- browser/device
- screenshot optional
- timestamp
- issue category

## SEO System
SEO should be connected to page functionality:
- Library pages
- Category pages
- GLB pages
- Guided tour pages
- Market/research pages
- Social trend pages

Every public page should include:
- title
- description
- canonical URL
- Open Graph image
- category metadata
- structured schema
- sitemap entry

## Node Host Switch Capability
Keep deployment portable:
- Vercel for frontend/static routes.
- Render for Node backend.
- Supabase for database/auth/storage.
- FireCuda for local archive/backups.
- Optional future VPS for heavy rendering.

## Mining Pool Note
Do not mine crypto inside the user browser or main app.
If DigitalHut ever adds mining, it must be:
- separate opt-in infrastructure
- legally compliant
- transparent to users
- not tied to customer data
- not running secretly
- separate from observatory app performance

Possible future concept:
DigitalHut Historical Presence Pool
- opt-in compute network
- supports observatory archival records
- tracks historical digital asset presence
- not required for normal users
