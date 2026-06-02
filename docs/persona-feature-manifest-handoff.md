# Persona Feature Manifest Foundation Handoff

Date: 2026-06-02

Branch: `codex/next-hour-alive-observatory-audit`

## Build Target

Create the Persona Feature Manifest foundation and wire the homepage to consume it without adding more intent logic directly inside `app/page.jsx`.

## Files Added

```text
data/persona-feature-manifest.json
lib/personaFeature.js
lib/seoSchema.js
lib/walletPermissions.js
components/MainBlogFeature.jsx
components/ObservatoryRenderPair.jsx
docs/persona-feature-manifest-handoff.md
```

## File Updated

```text
app/page.jsx
```

## Canonical First Persona

Real Estate Scout is now the first complete canonical manifest entry.

Main GLB target:

```text
2026 2 Story House, All Details, Use this demo in your Real Estate Website
```

Main feature title:

```text
2026 Two Story House Real Estate Walkthrough
```

The Real Estate Scout entry includes:

- main GLB search
- context GLB search
- main blog feature title
- blog angle
- primary render role
- context render role
- SEO title
- SEO description
- SEO keywords
- download tier
- wallet action
- market profile
- internal links
- allowed media types
- runner priority

## Other Persona Entries Added

```text
gamer
student
workforce
political
home-project
market-user
```

These are starter entries so the code has a clean structure before the autonomous runners expand them.

## Homepage Wiring

`app/page.jsx` now imports and consumes:

```jsx
import MainBlogFeature from "../components/MainBlogFeature"
import ObservatoryRenderPair from "../components/ObservatoryRenderPair"
import {getPersonaFeature, getPersonaMarket, getPersonaSignal} from "../lib/personaFeature"
import {getWalletPermissionState} from "../lib/walletPermissions"
```

The homepage now derives the active persona feature from:

```text
adaptive.intent
```

That means Real Estate Scout content is not hardcoded directly in the page body. It comes from the manifest through helper functions.

## New Homepage Sections

### MainBlogFeature

Shows the persona-matched blog feature:

- title
- blog angle
- main GLB target
- download tier
- wallet action
- runner priority
- SEO title/description/keywords
- scan action

### ObservatoryRenderPair

Creates the two-render structure:

- primary render: the main persona GLB
- context render: map, terrain, neighborhood, world, classroom, office, civic, or home project context

For Real Estate Scout:

```text
Primary render: 2026 2 Story House
Context render: New York / Brooklyn / Lower Manhattan real estate map context
```

## Wallet Permission Structure

`lib/walletPermissions.js` now centralizes tier access checks.

The homepage asks the helper for permission state instead of writing tier rules inline.

## SEO Structure

`lib/seoSchema.js` now provides starter schema helpers for:

- Article
- SoftwareApplication
- 3DModel

Next step is to wire these into crawlable `/blog/[slug]` and `/observatory/[slug]` pages.

## Mobile Structure Improvement

While wiring the new sections, the homepage grids were tightened to use responsive `auto-fit` tracks and wrapping text. This reduces mobile overflow risk from:

- score cards
- wallet tiers
- main grids
- library tiles
- symbol tiles
- long GLB/search strings

## Required Tests

Run these before merge:

```text
/runner-status
/api/runner-status
/
```

Checklist:

```text
/runner-status loads
/api/runner-status returns JSON
homepage loads
Real Estate Scout content renders from manifest when adaptive.intent = real-estate-scout
MainBlogFeature shows 2026 Two Story House Real Estate Walkthrough
Main GLB target is 2026 2 Story House, All Details, Use this demo in your Real Estate Website
ObservatoryRenderPair shows primary + context render structure
wallet permission message comes from walletPermissions helper
no mobile horizontal overflow
long strings wrap
existing Observatory, Market, Wallet, Library flows still work
```

## No Deploy Note

No deploy should happen from this handoff unless the main-hour instruction explicitly allows it.

## Next Build Window

After this foundation is tested, the next clean build is:

```text
FireCuda / Vault Intake Runner
```

That runner should update the manifest/registry with real GLBs, market profiles, blog feature candidates, and SEO metadata.
