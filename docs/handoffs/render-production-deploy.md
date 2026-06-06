# DigitalHut Render Production Deploy

Date: June 6, 2026

## Current Truth

The latest GitHub `main` contains the renderer-first homepage and Render production config, but `https://digitalhut.app` is still serving an older homepage build.

Old live markers still visible:

- Live Observatory Pulse
- Home Project main feature
- Connected API engines
- Agent blog home
- Wallet And Subscription

Latest desired code marker:

- Renderer-first app stage
- Footer Daily link at `/daily`
- `/api/build-info` route
- Render release value: `render-production-deploy-2026-06-06`

## Render Dashboard Settings

Open the active Render web service that serves `digitalhut.app`.

Expected settings:

- Repo: `https://github.com/tehleader1/Digitalhut`
- Branch: `main`
- Root Directory: blank / repo root
- Runtime: Node
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/health`
- Auto Deploy: enabled for commits to `main`

## Required Manual Action

In Render:

1. Open the active `digitalhut.app` web service.
2. Click `Manual Deploy`.
3. Choose `Clear build cache & deploy`.
4. Wait for deploy to finish.
5. Open `https://digitalhut.app/api/build-info`.

Expected response after success:

```json
{
  "host": "render",
  "release": "render-production-deploy-2026-06-06"
}
```

If `/api/build-info` is missing or the old homepage remains, the custom domain is pointed at the wrong service or the active Render service is not deploying the latest `main` branch from the repo root.

## Optional GitHub Secret

The repo now has `.github/workflows/render-deploy.yml`.

To allow GitHub to force Render deploys:

1. In Render, copy the service Deploy Hook URL.
2. In GitHub, add repository secret:

`RENDER_DEPLOY_HOOK_URL`

3. Run GitHub Actions workflow:

`Deploy to Render`

This triggers Render without exposing the hook in code.
