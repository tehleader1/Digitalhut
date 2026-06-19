# Supabase FireCuda Production Setup

DigitalHut uses Supabase for the production asset bucket, backend GLB conversion records, the public asset library, and live feed posts.

## One-Time Database Update

Run this SQL file in Supabase SQL Editor:

```text
supabase/migrations/202606190001_digitalhut_assets_and_feed.sql
```

It creates:

- `digitalhut-assets` public storage bucket
- public read policies for rendered GLB assets
- authenticated upload/update/delete policies for storage objects
- `digitalhut_asset_conversions`
- `digitalhut_assets`
- `digitalhut_live_feed`
- indexes and RLS policies

## Required Vercel Environment Variables

Use these exact names in Vercel.

```text
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ASSET_BUCKET=digitalhut-assets
VITE_SUPABASE_ASSET_BUCKET=digitalhut-assets
SUPABASE_FIRECUDA_FOLDER=firecuda-library
VITE_SUPABASE_FIRECUDA_FOLDER=firecuda-library
```

Use these direct asset-base variables if you want the app to skip derivation and read straight from the FireCuda GLB folder:

```text
SUPABASE_FIRECUDA_ASSET_BASE=https://YOUR-PROJECT.supabase.co/storage/v1/object/public/digitalhut-assets/firecuda-library
VITE_SUPABASE_FIRECUDA_ASSET_BASE=https://YOUR-PROJECT.supabase.co/storage/v1/object/public/digitalhut-assets/firecuda-library
```

Remove any placeholder values containing:

```text
xxxxx.public.blob.vercel-storage.com
store-id
your-store
```

## Upload Path

Upload GLBs into this Supabase Storage path:

```text
digitalhut-assets/firecuda-library/
```

Example public URL:

```text
https://YOUR-PROJECT.supabase.co/storage/v1/object/public/digitalhut-assets/firecuda-library/new_york_city.glb
```

## Conversion Worker Env

The current Vercel worker accepts GLBs immediately and stages heavier file conversions.

```text
ASSET_CONVERTER_URL=https://www.digitalhut.app/api/convert-asset
ASSET_CONVERTER_API_KEY=YOUR_PRIVATE_CONVERTER_KEY
```

For real `.obj`, `.fbx`, `.stl`, and `.blend` conversion, connect a heavy worker later. Vercel serverless can stage the queue, but it is not the right place to run Blender-class conversion jobs.

## Verification

After setting env vars and redeploying, check:

```text
https://www.digitalhut.app/api/observatory-feed
```

Expected diagnostic:

```json
{
  "assetBase": {
    "mode": "supabase-or-direct",
    "hasSupabaseUrl": true,
    "bucket": "digitalhut-assets",
    "folder": "firecuda-library"
  }
}
```

If it says `local-backup-only`, Vercel still cannot see the Supabase URL/base env.
