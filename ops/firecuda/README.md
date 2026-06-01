# FireCuda DigitalHut Operations

The FireCuda is the local business backbone for DigitalHut. It holds the repo, builds, audit logs, snapshots, observatory assets, GLB cache, marketplace exports, stock profile collections, and mobile handoffs.

## Full Cycle

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Pull -Install -Build -Audit -MarketUniverse -Universe all -UniverseLimit 0
```

## Audit Only

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Audit
```

## Start Local Server

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Start
```

## GLB Collection Test

Create a text file of candidate `.glb` URLs, one URL per line:

```text
F:\DigitalHut\glb-cache\glb-urls.txt
```

Then run:

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -CollectGlb -GlbManifest F:\DigitalHut\glb-cache\glb-urls.txt
```

The runner downloads each model into FireCuda, records file size, SHA-256 hash, whether the model is large, and saves a report under `DigitalHut\glb-cache`.

## Stock Profile Universe Test

Export scenario profiles for S&P 500, NASDAQ, and NYSE:

```powershell
.\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -MarketUniverse -Universe all -UniverseLimit 0
```

The export is saved under:

```text
DigitalHut\marketplace-exports\stock-profiles
```

Each profile includes 2026 scenario data, volatility, trend state, bull score, bear score, support, resistance, bullish run trigger, bearish run trigger, take-profit zones, and invalidation.

## Breathing Space Created

The runner creates these folders on FireCuda:

```text
DigitalHut/builds
DigitalHut/audit-logs
DigitalHut/screenshots
DigitalHut/observatory-assets
DigitalHut/glb-cache
DigitalHut/glb-cache/incoming
DigitalHut/glb-cache/tested
DigitalHut/marketplace-exports
DigitalHut/marketplace-exports/stock-profiles
DigitalHut/mobile-handoffs
DigitalHut/server-snapshots
```

## Runtime Loop

```text
FireCuda local repo
-> pull code
-> install/build
-> audit production endpoints
-> collect/test GLBs
-> export full stock profile universe
-> save snapshots
-> start local server when needed
-> package hourly update
-> push clean changes
-> deploy
-> verify
-> archive back to FireCuda
```
