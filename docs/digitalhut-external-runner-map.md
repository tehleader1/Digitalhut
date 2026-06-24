# DigitalHut External Runner Map

This file keeps the new outside-network ambitions concrete. These lanes are not considered live until their credentials, contracts, and preservation checks pass.

## Runner Lanes

- Farcaster decentralized social: publish cast-ready DigitalHut 3D report cards with asset links and backlinks. Required: `NEYNAR_API_KEY` or `FARCASTER_API_KEY`.
- Developer cloud infrastructure: run DigitalHut backend pages, conversion records, asset records, proposals, and API capture. Required: `VERCEL_ENV`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Decentralized streaming networks: package observatory/podcast/GLB presentation segments for a streaming gateway. Required: `LIVEPEER_API_KEY`, `THETA_API_KEY`, or `HLS_STREAM_GATEWAY_URL`.
- Smart contract liquidity: route subscriptions or node purchases through reviewed contracts only. Required: `DIGITALHUT_TREASURY_WALLET`, `DIGITALHUT_LIQUIDITY_CONTRACT`, `BASE_LIQUIDITY_POOL_ADDRESS`.
- Wiki-style developer edits: developers submit edits as proposals while the production version remains protected. Required: `SUPABASE_SERVICE_ROLE_KEY`, `DIGITALHUT_CONTENT_REVIEW_KEY`.
- API GLB discovery capture: as APIs return 3D discoveries, save them into `digitalhut_live_feed` for ratings, SEO, backlinks, review, and future conversion. Required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Safety Rules

- Do not write to liquidity pools without a reviewed smart contract, explicit chain, token, receiver, and receipt verification.
- Do not treat Sketchfab embeds as owned GLBs unless a downloadable GLB license and file URL are available.
- Do not let community edits overwrite the main production copy directly; save proposals first.
- Do not re-enable broken FireCuda/Supabase GLB URLs unless exact object names and valid GLB binary magic are verified.

## Commands

```powershell
cd "D:\DigitalHutWork\Digitalhut-commit"
npm.cmd run preserve
npm.cmd run preserve:progression
npm.cmd run build -- --clearScreen false
```
