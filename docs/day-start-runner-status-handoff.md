# Day-Start Audit / Update Combo

Date: 2026-06-02

Branch: `codex/next-hour-alive-observatory-audit`

## What Was Added

This update adds the first real Runner Status + Alive State Layer to DigitalHut.

New files:

```text
app/api/runner-status/route.js
app/components/RunnerStatusAliveLayer.jsx
app/runner-status/page.jsx
docs/day-start-runner-status-handoff.md
```

## New URL To Test

```text
/runner-status
```

This page renders the autonomous heartbeat layer without disturbing the current homepage flow.

## New API To Test

```text
/api/runner-status
```

This endpoint returns shared runner state for:

- GLB Observatory Runner
- Market Profile Runner
- SEO Blog Feature Runner
- Wallet and Account Runner

## Audit Summary

The current website already shows the important product surfaces:

- Adaptive Observatory
- Babylon / GLB render surface
- Sketchfab/fallback feed state
- Market Intelligence
- Wallet and Subscription
- Adaptive homepage state
- Provider diagnostics
- Observatory preload
- Market preload

The missing foundation was one shared live-state layer. Before this update, each section could appear alive separately, but there was no common runner heartbeat or between-hour audit surface.

## What The Layer Shows

The new layer shows:

- system heartbeat
- active runner count
- last hourly update
- next hourly update
- fallback count
- runner status
- runner phase
- runner source
- runner audit state
- tier gate
- market details for BTC/USD

## Runner States Included

### GLB Observatory Runner

Purpose:

- Vault / Sketchfab / fallback GLB pickup
- orbit-ready state
- tier-gated GLB download
- future voice/orbit/detail wiring

Current visible phase:

```text
orbit-ready
```

### Market Profile Runner

Purpose:

- BTC/USD technical preload
- fallback candle visibility
- bullish/bearish state
- volume confirmation
- support/resistance mapping

Current visible phase:

```text
fallback-candles
```

### SEO Blog Feature Runner

Purpose:

- FireCuda D Drive content pickup
- homepage feature rotation
- images, videos, and 3D render support
- SEO/backlink/schema prep

Current visible phase:

```text
feature-rotation
```

### Wallet and Account Runner

Purpose:

- wallet state
- tier gate
- GLB permission state
- account/profile readiness

Current visible phase:

```text
tier-gate-active
```

## Next Mobile Codex / OpenClaw Step

Wire `RunnerStatusAliveLayer` into `app/page.jsx` below the hero/adaptive panel once the homepage layout is confirmed stable.

Recommended import:

```jsx
import RunnerStatusAliveLayer from "./components/RunnerStatusAliveLayer"
```

Recommended placement:

```jsx
<RunnerStatusAliveLayer />
```

Place it after the hero section and before the score cards.

## Mobile Acceptance Checklist

Before merging homepage placement:

- `/runner-status` has no horizontal scroll.
- Runner cards stack cleanly on phone.
- Long fallback/source strings wrap.
- Market details do not clip.
- Status pills remain visible.
- Homepage remains readable after adding the layer.
- Existing Observatory, Market, Wallet, and Library links still work.

## Hourly Operating Rhythm

Every hour:

```text
1. GLB Observatory Runner scans Vault/Sketchfab/fallback assets.
2. Market Profile Runner refreshes BTC/SPY/AAPL/NVDA profiles.
3. SEO Blog Feature Runner rotates homepage media/content.
4. Wallet and Account Runner refreshes tier permissions.
5. Audit runner records visible status.
```

Between hours:

```text
1. Check mobile overflow.
2. Check provider health.
3. Check fallback reasons.
4. Check missing GLB/image/video assets.
5. Check wallet tier gates.
6. Check SEO metadata and backlink targets.
```

## Next Upgrade

Build the real intake runner that writes into `/api/runner-status` from actual sources:

```text
Vault / FireCuda Intake Runner
```

That runner should scan folders, build a manifest, update GLB/market/blog records, and let the homepage feature rotate automatically.
