export const conversionStages = [
  "accepted",
  "stored_original",
  "converter_dispatched",
  "glb_converted",
  "glb_optimized",
  "thumbnail_generated",
  "metadata_generated",
  "ai_narration_generated",
  "profile_library_ready"
]

export const acceptedSourceTypes = [
  "glb",
  "gltf",
  "obj",
  "fbx",
  "stl",
  "blend",
  "image-set",
  "scan",
  "research-source"
]

export function normalizeAssetName(value = "Untitled model"){
  return value.trim() || "Untitled model"
}

export function slugForAsset(value = "asset"){
  return `asset_${value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "model"}`
}

export function createNarrationScript({name, sourceType, description}){
  return [
    `Open 3D model view. ${name} has completed the DigitalHut conversion queue.`,
    `I am presenting the converted ${sourceType.toUpperCase()} as a GLB-ready asset.`,
    description || "I am reading the shape, scale, visible details, and source metadata before making a stronger claim.",
    "This public presentation stays on one current model. Advanced rotate, zoom, and related-GLB choreography remains protected until the community unlock."
  ]
}

export function createConversionRecord(input = {}){
  const name = normalizeAssetName(input.name)
  const sourceType = String(input.sourceType || input.type || "glb").toLowerCase()
  const slug = slugForAsset(name)
  return {
    id: input.id || `conversion-${Date.now()}`,
    slug,
    name,
    sourceType,
    originalFileUrl: input.originalFileUrl || input.sourceUrl || input.url || "",
    originalBucketPath: input.originalBucketPath || "",
    convertedGlbUrl: input.convertedGlbUrl || "",
    optimizedGlbUrl: input.optimizedGlbUrl || "",
    thumbnailUrl: input.thumbnailUrl || "",
    metadata: {
      title: name,
      sourceType,
      source: input.source || "DigitalHut Asset Lab",
      description: input.description || "",
      tags: input.tags || [],
      createdBy: input.createdBy || "owner"
    },
    aiNarration: createNarrationScript({name, sourceType, description: input.description}),
    stage: input.stage || "accepted",
    progress: input.progress ?? 12,
    status: input.status || "Accepted into conversion queue",
    visibility: input.visibility || "Private until published",
    likes: input.likes || 0,
    shares: input.shares || 0,
    comments: input.comments || [],
    protectedDemo: {
      enabled: false,
      unlockRequirement: "10000 subscribers",
      features: ["live rotate", "zoom in/out", "related GLB shuffle", "AI-directed presentation"]
    },
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

export function advanceRecord(record, stage, patch = {}){
  const index = conversionStages.indexOf(stage)
  const progress = index >= 0 ? Math.round(((index + 1) / conversionStages.length) * 100) : record.progress
  return {
    ...record,
    ...patch,
    stage,
    progress,
    status: statusForStage(stage),
    updatedAt: new Date().toISOString()
  }
}

export function statusForStage(stage){
  const labels = {
    accepted: "Accepted into conversion queue",
    stored_original: "Original source stored",
    converter_dispatched: "Conversion worker dispatched",
    glb_converted: "Converted to GLB",
    glb_optimized: "GLB compressed and optimized",
    thumbnail_generated: "Thumbnail generated",
    metadata_generated: "Metadata generated",
    ai_narration_generated: "AI spoken dialogue generated",
    profile_library_ready: "Profile GLB library ready"
  }
  return labels[stage] || "Processing"
}
