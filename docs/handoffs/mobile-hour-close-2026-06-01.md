# DigitalHut Mobile Codex Handoff

Date: June 1, 2026
Session: Hour close update

## Mission

Continue from the deployed `main` branch after the observatory-news, FireCuda GLB, stock profile, wallet social, and SEO agent update. Keep Alpaca and Sketchfab as blended observatory feeds, not separate disconnected features.

## What Changed This Hour

- Added public Daily Observatory briefing engine.
- Added homepage-only featured daily post rail.
- Added `/blog` public newsdesk page with BBC/CNN/ABC-style public entry energy.
- Added `/api/blog/daily` for timed daily observatory content.
- Added `/api/agents/seo-observatory` for SEO and observatory collection planning.
- Added `/api/wallet-feed` for masked wallet social signals.
- Added `/api/market-universe` for S&P 500, NASDAQ, and NYSE stock profile collection.
- Added 2026 stock profile scenario engine with bull score, bear score, support, resistance, bullish run, bearish run, take-profit zones, and invalidation.
- Expanded FireCuda runner to collect/test GLB files and export full stock universe profiles.

## New Production Endpoints To Verify

Open these after deployment finishes:

```text
https://digitalhut.app
https://digitalhut.app/blog
https://digitalhut.app/api/blog/daily
https://digitalhut.app/api/agents/seo-observatory
https://digitalhut.app/api/wallet-feed?query=BTC&tier=free
https://digitalhut.app/api/market-universe?universe=sp500&limit=25
https://digitalhut.app/api/market-universe?universe=nasdaq&limit=25
https://digitalhut.app/api/market-universe?universe=nyse&limit=25
https://digitalhut.app/api/market-universe?universe=all&limit=0
```

## FireCuda Commands

Run from the repo folder on the FireCuda drive:

```powershell
ops\firecuda\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -Pull -Install -Build -Audit -MarketUniverse -Universe all -UniverseLimit 0
```

For GLB testing, put candidate `.glb` URLs into:

```text
F:\DigitalHut\glb-cache\glb-urls.txt
```

Then run:

```powershell
ops\firecuda\FireCuda-DigitalHut-OpsRunner.cmd -DriveLetter F -CollectGlb -GlbManifest F:\DigitalHut\glb-cache\glb-urls.txt
```

## What To Look For

Homepage:

- Featured Daily Observatory post appears before the main app shell.
- Post links into `/blog`.
- Homepage still loads adaptive state and market/observatory preload.

Blog:

- Public newsdesk opens cleanly.
- Featured post has a 3D preload, market context, and daily framing.

Market Universe:

- `sp500`, `nasdaq`, `nyse`, and `all` return JSON.
- `all&limit=0` may be large; use FireCuda for that export.
- Profiles include technical scenarios and take-profit zones.

FireCuda:

- `DigitalHut\glb-cache\tested` receives downloaded model files.
- `DigitalHut\glb-cache` receives collection report JSON.
- `DigitalHut\marketplace-exports\stock-profiles` receives stock profile export JSON.

## Known Alpaca Status

Alpaca live credentials were intentionally paused this hour. Previous verified status:

```text
alpacaDetected: false
alpacaKeyEnv: ALPACA_API_KEY
alpacaSecretEnv: null
provider: premium-fallback
```

Do not spend the next mobile pass chasing Alpaca unless the production secret has been added. The main mission is to verify the observatory experience now blends content, market context, wallet social signal, SEO agent planning, and FireCuda collection.

## Next Mobile Codex Priority

1. Confirm deployment finished.
2. Verify new endpoints.
3. Run FireCuda market universe export.
4. Add real GLB URLs to the manifest and run GLB collection.
5. Check homepage visual feel on mobile: featured post first, adaptive observatory next, no broken layout.

## Conclusion

DigitalHut is moving from separate tools into one observatory experience. The public visitor sees a daily featured post, market users get stock and crypto context, model users get prototype-grade 3D discovery, wallet users get masked social signal, and FireCuda starts acting like the storage-and-compute backbone for GLB and market profile expansion.
