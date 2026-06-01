# DigitalHut Advanced Code Structure

Date: June 1, 2026

## Mission

DigitalHut should be adaptive, decentralized, and FireCuda-backed. The site should feel alive without turning GitHub into a dumping ground for every experiment.

## Three Brains

DigitalHut needs three coordinated brains:

```text
1. Adaptive brain
2. Decentralized marketplace brain
3. FireCuda operations brain
```

Current state:

```text
Adaptive brain: started
Marketplace brain: early design
FireCuda operations brain: starting with ops runner
```

## Core Rule

```text
No page owns the brain.
```

Pages should render state. Libraries should decide. APIs should route and record. FireCuda should archive, build, and breathe.

## Target Structure

```text
app/lib/adaptive/
  intentClassifier.js
  feedSelector.js
  homepageState.js
  visitorMemory.js

app/lib/marketplace/
  listings.js
  vendors.js
  feedRouter.js
  accessRules.js
  provenance.js
  pricing.js
  marketplaceState.js

app/lib/market/
  normalizeSymbol.js
  fallbackProfiles.js
  alpacaClient.js
  technicals.js
  marketResponse.js

app/lib/observatory/
  sketchfabClient.js
  observatoryFeeds.js
  glbResolver.js
  regionRouter.js

app/lib/firecuda/
  archiveManifest.js
  serverSnapshot.js
  buildRecord.js
  handoffRecord.js
```

## User Feeling Target

Within the first few seconds:

```text
DigitalHut recognizes my intent.
The first feed makes sense.
Market symbols match me.
The 3D observatory is relevant.
Premium offer is contextual.
The site feels live, not static.
```

## Crypto Trader Entry

```text
Intent: crypto-trader
Observatory preload: wall street new york financial district 3d
Market symbols: BTC / ETH / SPY / NVDA
Premium trigger: market-depth
```

## Decentralized Marketplace Direction

DigitalHut should become a real-time observatory market:

```text
visitor intent
-> adaptive homepage
-> live feed router
-> 3D observatory listings
-> wallet identity
-> tier/access rules
-> premium unlock
-> vendor/agent/provenance records
-> FireCuda archive
```

Marketplace primitives still needed:

```text
listings
vendors
feed sources
asset provenance
price/access rules
purchase/unlock records
live feed freshness
agent ownership
marketplace categories
creator/publisher profiles
```

## FireCuda Direction

FireCuda should not be passive storage. It should be the local operations machine:

```text
repo mirror
build cache
audit logs
server snapshots
mobile handoffs
observatory assets
GLB cache
marketplace exports
hourly packages
```

## Next Refactors

1. Split `app/api/market/route.js` into `app/lib/market/*`.
2. Keep `app/page.jsx` as a renderer over adaptive state.
3. Add marketplace primitives in `app/lib/marketplace/*`.
4. Add a FireCuda manifest to track builds, audits, snapshots, and handoffs.
5. Add agent monitors for market, observatory, provider health, and FireCuda archives.
