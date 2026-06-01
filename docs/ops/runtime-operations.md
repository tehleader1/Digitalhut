# DigitalHut Runtime Operations

Date: June 1, 2026

## Mission

Keep DigitalHut fresh without creating code gunk. Runtime operations should coordinate FireCuda, GitHub, production hosting, Android Termux, OpenClaw, market feeds, observatory feeds, wallet state, and hourly updates.

## Breathing Runtime Loop

```text
1. Pull latest official code to FireCuda
2. Build locally on FireCuda
3. Run local health checks
4. Probe production endpoints
5. Probe mobile endpoints from Termux
6. Save audit snapshots to FireCuda
7. Continue local experiments
8. Package only clean changes for hourly update
9. Push to GitHub
10. Deploy
11. Verify live runtime
12. Archive result back to FireCuda
```

## Roles

```text
FireCuda = local warehouse and build floor
HP Mini = command desk
Android/Termux = field verifier
OpenClaw = mobile agent layer
GitHub = official code ledger
Vercel/Render = public runtime
Supabase = persistence
Wallet = identity/payment rail
Agents = monitoring staff
```

## Runtime State Objects

DigitalHut should eventually expose:

```text
providerRuntimeState
marketRuntimeState
observatoryRuntimeState
walletRuntimeState
firecudaRuntimeState
mobileRuntimeState
agentRuntimeState
deploymentRuntimeState
```

Each should answer:

```text
status
lastCheckedAt
source
evidence
problem
nextFix
confidence
```

## FireCuda Layout

```text
FireCuda/DigitalHut/repo
FireCuda/DigitalHut/builds
FireCuda/DigitalHut/audit-logs
FireCuda/DigitalHut/server-snapshots
FireCuda/DigitalHut/mobile-snapshots
FireCuda/DigitalHut/screenshots
FireCuda/DigitalHut/observatory-assets
FireCuda/DigitalHut/glb-cache
FireCuda/DigitalHut/marketplace-exports
FireCuda/DigitalHut/hourly-updates
FireCuda/DigitalHut/mobile-handoffs
FireCuda/DigitalHut/termux-logs
FireCuda/DigitalHut/openclaw-logs
```

## Mobile Termux Checks

```bash
pkg update
pkg upgrade
pkg install git nodejs-lts curl jq
node -v
npm -v
git --version
curl --version
jq --version
```

Endpoint capture:

```bash
mkdir -p ~/digitalhut-audits
STAMP=$(date +%Y%m%d-%H%M%S)
curl -s https://digitalhut.app/health | tee ~/digitalhut-audits/$STAMP-health.json
curl -s "https://digitalhut.app/api/market?symbol=BTC" | tee ~/digitalhut-audits/$STAMP-market-btc.json
curl -s "https://digitalhut.app/api/market?symbol=AAPL" | tee ~/digitalhut-audits/$STAMP-market-aapl.json
curl -s "https://digitalhut.app/api/adaptive-home?query=BTC" | tee ~/digitalhut-audits/$STAMP-adaptive-btc.json
```

## Gating Rule

No hourly GitHub push until:

```text
local notes complete
FireCuda audit saved
mobile endpoint result captured when possible
change list summarized
expected deploy behavior written
rollback risk understood
```
