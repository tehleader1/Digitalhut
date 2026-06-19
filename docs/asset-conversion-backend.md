# DigitalHut Asset Conversion Backend

DigitalHut separates the public AI model presentation from the private protected demo editor.

## Public Conversion Pipeline

1. The user submits a source asset from the protected Asset Lab.
2. The backend creates a conversion record in `digitalhut_asset_conversions`.
3. The original file is stored in Supabase Storage bucket `digitalhut-assets`.
4. The backend dispatches the job to `ASSET_CONVERTER_URL`.
5. The converter worker converts supported files into GLB:
   - `.glb`
   - `.gltf`
   - `.obj`
   - `.fbx`
   - `.stl`
   - `.blend`
   - image sets
   - scans
6. The worker compresses and optimizes the GLB.
7. The worker generates a thumbnail and metadata.
8. DigitalHut generates AI spoken dialogue.
9. The job is not complete until AI narration exists.
10. The finished asset appears in the profile GLB library with comments, likes, shares, sponsor metadata, visibility, and a share URL.

## Protected Demo Layer

The advanced AI conductor remains private until the community is ready:

- live rotate
- zoom in/out
- model shuffle
- related GLB presentation
- multi-model demo editing
- creator scene choreography

Unlock target: `10000 subscribers`.

## Required Environment Variables

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ASSET_BUCKET=digitalhut-assets
ASSET_CONVERTER_URL=
ASSET_CONVERTER_API_KEY=
```

## Supabase Table

Production setup lives in:

```text
supabase/migrations/202606190001_digitalhut_assets_and_feed.sql
```

FireCuda/Supabase env setup lives in:

```text
docs/supabase-firecuda-production.md
```

```sql
create table if not exists digitalhut_asset_conversions (
  id text primary key,
  slug text unique not null,
  name text not null,
  source_type text not null,
  original_file_url text,
  original_bucket_path text,
  converted_glb_url text,
  optimized_glb_url text,
  thumbnail_url text,
  metadata jsonb default '{}'::jsonb,
  ai_narration jsonb default '[]'::jsonb,
  protected_demo jsonb default '{}'::jsonb,
  stage text not null,
  progress integer default 0,
  status text not null,
  visibility text default 'Private until published',
  likes integer default 0,
  shares integer default 0,
  comments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

## Worker Contract

The external converter receives:

```json
{
  "jobId": "conversion-...",
  "sourceType": "fbx",
  "sourceUrl": "https://...",
  "sourceBucketPath": "asset_name/original.fbx",
  "outputBucket": "digitalhut-assets",
  "outputSlug": "asset_name",
  "requiredOutput": "glb",
  "optimize": true,
  "thumbnail": true,
  "metadata": true
}
```

The worker returns:

```json
{
  "glbUrl": "https://...",
  "optimizedGlbUrl": "https://...",
  "thumbnailUrl": "https://...",
  "metadata": {},
  "aiNarration": []
}
```
