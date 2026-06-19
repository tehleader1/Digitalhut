import {createClient} from "@supabase/supabase-js"
import {
  advanceRecord,
  createConversionRecord
} from "../src/lib/assetConversionPipeline.js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const converterUrl = process.env.ASSET_CONVERTER_URL || ""
const converterKey = process.env.ASSET_CONVERTER_API_KEY || ""
const assetBucket = process.env.SUPABASE_ASSET_BUCKET || "digitalhut-assets"
const firecudaFolder = process.env.SUPABASE_FIRECUDA_FOLDER || "firecuda-library"

function json(res, status, body){
  res.statusCode = status
  res.setHeader("content-type", "application/json")
  res.end(JSON.stringify(body))
}

async function readJson(req){
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString("utf8")
  return text ? JSON.parse(text) : {}
}

async function saveRecord(record){
  if(!supabaseUrl || !supabaseServiceKey) return {record, stored: false}
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const {data, error} = await supabase.from("digitalhut_asset_conversions").upsert(toDbRecord(record)).select().single()
  if(error) return {record, stored: false, error: error.message}
  return {record: data ? fromDbRecord(data) : record, stored: true}
}

function toDbRecord(record){
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    source_type: record.sourceType,
    original_file_url: record.originalFileUrl,
    original_bucket_path: record.originalBucketPath,
    converted_glb_url: record.convertedGlbUrl,
    optimized_glb_url: record.optimizedGlbUrl,
    thumbnail_url: record.thumbnailUrl,
    metadata: record.metadata,
    ai_narration: record.aiNarration,
    protected_demo: record.protectedDemo,
    stage: record.stage,
    progress: record.progress,
    status: record.status,
    visibility: record.visibility,
    likes: record.likes,
    shares: record.shares,
    comments: record.comments,
    created_at: record.createdAt,
    updated_at: record.updatedAt
  }
}

function fromDbRecord(row){
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sourceType: row.source_type,
    originalFileUrl: row.original_file_url,
    originalBucketPath: row.original_bucket_path,
    convertedGlbUrl: row.converted_glb_url,
    optimizedGlbUrl: row.optimized_glb_url,
    thumbnailUrl: row.thumbnail_url,
    metadata: row.metadata || {},
    aiNarration: row.ai_narration || [],
    protectedDemo: row.protected_demo || {},
    stage: row.stage,
    progress: row.progress,
    status: row.status,
    visibility: row.visibility,
    likes: row.likes || 0,
    shares: row.shares || 0,
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function dispatchConverter(record){
  if(!converterUrl){
    return {
      ...advanceRecord(record, "converter_dispatched"),
      status: "Conversion worker not connected yet. Set ASSET_CONVERTER_URL to enable real OBJ/FBX/STL/BLEND conversion."
    }
  }

  const response = await fetch(converterUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(converterKey ? {"authorization": `Bearer ${converterKey}`} : {})
    },
    body: JSON.stringify({
      jobId: record.id,
      sourceType: record.sourceType,
      sourceUrl: record.originalFileUrl,
      sourceBucketPath: record.originalBucketPath,
      outputBucket: assetBucket,
      outputFolder: firecudaFolder,
      outputSlug: record.slug,
      requiredOutput: "glb",
      optimize: true,
      thumbnail: true,
      metadata: true
    })
  })

  if(!response.ok){
    throw new Error(`converter failed: ${response.status}`)
  }

  const result = await response.json()
  return advanceRecord(record, "ai_narration_generated", {
    convertedGlbUrl: result.convertedGlbUrl || result.glbUrl || record.convertedGlbUrl,
    optimizedGlbUrl: result.optimizedGlbUrl || result.glbUrl || record.optimizedGlbUrl,
    thumbnailUrl: result.thumbnailUrl || record.thumbnailUrl,
    metadata: {...record.metadata, ...(result.metadata || {})},
    aiNarration: result.aiNarration || record.aiNarration
  })
}

export default async function handler(req, res){
  if(req.method !== "POST"){
    json(res, 405, {error: "POST only"})
    return
  }

  try {
    const input = await readJson(req)
    let record = createConversionRecord(input)
    record = advanceRecord(record, "stored_original", {
      originalBucketPath: input.originalBucketPath || `${record.slug}/original.${record.sourceType}`,
      convertedGlbUrl: record.sourceType === "glb" ? record.originalFileUrl : "",
      optimizedGlbUrl: record.sourceType === "glb" ? record.originalFileUrl : ""
    })

    await saveRecord(record)
    record = await dispatchConverter(record)
    record = advanceRecord(record, "profile_library_ready")
    const saved = await saveRecord(record)

    json(res, 200, {
      ok: true,
      stored: saved.stored,
      storageBucket: assetBucket,
      storageFolder: firecudaFolder,
      storageConnected: Boolean(supabaseUrl && supabaseServiceKey),
      conversionWorkerConnected: Boolean(converterUrl),
      productionReady: Boolean(supabaseUrl && supabaseServiceKey && converterUrl),
      backendCreationPipeline: [
        "accepted",
        "stored_original",
        "converter_dispatched",
        "glb_converted",
        "glb_optimized",
        "thumbnail_generated",
        "metadata_generated",
        "ai_narration_generated",
        "profile_library_ready"
      ],
      record: saved.record,
      protectedDemo: record.protectedDemo
    })
  } catch (error) {
    json(res, 500, {ok: false, error: error.message})
  }
}
