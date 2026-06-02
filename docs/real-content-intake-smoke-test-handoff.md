# Real Content Intake Layer Handoff

Date: 2026-06-02

Branch: `codex/real-content-intake-smoke-test`

## Summary

This hour adds the first real provider smoke-test foundation for DigitalHut.

The goal is to stop relying on silent placeholders and begin testing real content providers before wiring them deeply into the homepage.

Available provider keys:

```text
SKETCHFAB_ACCESS_TOKEN
CESIUM_ION_TOKEN
POLYGON_API_KEY
ALPHA_VANTAGE_API_KEY
FMP_API_KEY
```

## Added Files

```text
data/content-source-registry.json
data/observatory-source-registry.json
data/market-profile-source-registry.json
data/real-estate-source-registry.json
lib/contentSources/sourceRegistry.js
lib/contentSources/providerSmokeTest.js
lib/assetIntake/modelSourceAdapters.js
lib/locationFeeds/locationSourceAdapters.js
lib/marketProfiles/marketSourceAdapters.js
app/api/provider-smoke-test/route.js
app/provider-smoke-test/page.jsx
docs/real-content-intake-smoke-test-handoff.md
```

## New Test Routes

```text
/provider-smoke-test
/api/provider-smoke-test
/api/provider-smoke-test?query=two%20story%20house%20real%20estate%20glb&symbol=NVDA
```

## What The Smoke Test Checks

### Sketchfab

Tests:

- real model search
- downloadable model candidates
- preview image
- source page URL
- download URL metadata when permission allows it

Status outputs:

```text
live
metadata-only
missing-key
permission-failed
request-failed
no-result
request-error
```

### Cesium

Tests:

- token presence
- real estate location context readiness
- terrain / 3D Tiles / planetary / city context readiness

This is currently a readiness adapter. It does not yet query Cesium assets.

### Polygon

Tests:

- ticker reference/profile lookup
- market/options provider readiness

### Alpha Vantage

Tests:

- global quote lookup
- quote/technical provider readiness

### Financial Modeling Prep

Tests:

- company profile lookup
- financial/fundamental profile readiness

## Real Estate Scout Target

Canonical target:

```text
2026 2 Story House, All Details, Use this demo in your Real Estate Website
```

Fallback queries:

```text
two story house real estate glb
modern house downloadable glb
residential house walkthrough 3d model
property map real estate 3d
```

Location context:

```text
Brooklyn / Lower Manhattan property map context
lat: 40.706
lng: -74.009
radius: 1800m
```

Market symbols:

```text
VNQ
SPY
AAPL
NVDA
```

## Terminal Run Instructions

```text
git checkout main
git pull
git checkout codex/real-content-intake-smoke-test
npm install
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/provider-smoke-test
http://localhost:3000/api/provider-smoke-test
http://localhost:3000/api/provider-smoke-test?query=two%20story%20house%20real%20estate%20glb&symbol=NVDA
```

## Environment Variables To Confirm

```text
SKETCHFAB_ACCESS_TOKEN
CESIUM_ION_TOKEN
POLYGON_API_KEY
ALPHA_VANTAGE_API_KEY
FMP_API_KEY
```

## Acceptance Checklist

```text
/provider-smoke-test loads
/api/provider-smoke-test returns JSON
Sketchfab shows live, metadata-only, or a clear failure reason
Cesium shows configured when token exists
Polygon returns live ticker profile or a clear failure reason
Alpha Vantage returns quote data or a clear failure reason
FMP returns company profile or a clear failure reason
No silent placeholder states
Provider cards do not overflow mobile
Preview image renders if Sketchfab returns one
Market JSON is readable in provider cards
```

## Next Build After Smoke Test

After provider status is confirmed, wire successful provider results into:

```text
MainBlogFeature
ObservatoryRenderPair
Market Preload
/blog/[slug]
```

Do not wire failed providers deeply into homepage. Failed providers should stay visible only as diagnostics until fixed.
