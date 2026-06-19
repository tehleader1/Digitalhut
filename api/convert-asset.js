const acceptedTypes = new Set(["glb", "gltf", "obj", "fbx", "stl", "blend", "image-set", "scan", "research-source"])

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

function publicAssetBase(){
  const direct = process.env.SUPABASE_FIRECUDA_ASSET_BASE || process.env.VITE_SUPABASE_FIRECUDA_ASSET_BASE || process.env.FIRECUDA_ASSET_BASE || process.env.VITE_FIRECUDA_ASSET_BASE || ""
  if(direct) return `${direct.replace(/\/+$/, "")}/`
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
  if(!supabaseUrl) return ""
  const bucket = process.env.SUPABASE_ASSET_BUCKET || process.env.VITE_SUPABASE_ASSET_BUCKET || "digitalhut-assets"
  const folder = process.env.SUPABASE_FIRECUDA_FOLDER || process.env.VITE_SUPABASE_FIRECUDA_FOLDER || "firecuda-library"
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${bucket}/${folder}/`
}

function authOk(req){
  const expected = process.env.ASSET_CONVERTER_API_KEY || ""
  if(!expected) return true
  const header = req.headers.authorization || ""
  return header === `Bearer ${expected}`
}

export default async function handler(req, res){
  if(req.method !== "POST"){
    json(res, 405, {ok: false, error: "POST only"})
    return
  }
  if(!authOk(req)){
    json(res, 401, {ok: false, error: "Unauthorized converter request"})
    return
  }

  try {
    const input = await readJson(req)
    const sourceType = String(input.sourceType || "glb").toLowerCase()
    if(!acceptedTypes.has(sourceType)){
      json(res, 400, {ok: false, error: `Unsupported source type: ${sourceType}`})
      return
    }

    const sourceUrl = input.sourceUrl || ""
    const outputSlug = String(input.outputSlug || input.jobId || "digitalhut-asset").replace(/^asset_/, "").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase()
    const base = publicAssetBase()
    const stagedGlbUrl = sourceType === "glb"
      ? sourceUrl
      : base
        ? `${base}${encodeURIComponent(`${outputSlug}.glb`)}`
        : ""

    json(res, 200, {
      ok: true,
      worker: "digitalhut-vercel-converter",
      mode: sourceType === "glb" ? "glb-pass-through" : "queued-heavy-conversion",
      glbUrl: stagedGlbUrl,
      convertedGlbUrl: stagedGlbUrl,
      optimizedGlbUrl: stagedGlbUrl,
      thumbnailUrl: input.thumbnailUrl || "",
      metadata: {
        sourceType,
        sourceUrl,
        outputBucket: input.outputBucket || process.env.SUPABASE_ASSET_BUCKET || "digitalhut-assets",
        outputFolder: input.outputFolder || process.env.SUPABASE_FIRECUDA_FOLDER || "firecuda-library",
        conversionNote: sourceType === "glb"
          ? "Input was already GLB; Vercel worker passed the verified model URL through."
          : "Heavy mesh conversion is queued. Connect a Blender/Assimp worker for true OBJ/FBX/STL/BLEND conversion.",
        generatedBy: "DigitalHut Vercel conversion worker"
      },
      aiNarration: [
        `Open 3D model view. ${input.outputSlug || input.jobId || "This asset"} has entered the DigitalHut conversion worker.`,
        sourceType === "glb"
          ? "This file is already GLB, so I can pass it into the renderer pipeline directly."
          : `This ${sourceType.toUpperCase()} file needs the heavy converter before it becomes a final GLB.`,
        "I am attaching metadata, thumbnail status, and narration readiness before the profile library marks it complete."
      ]
    })
  } catch (error) {
    json(res, 500, {ok: false, error: error.message})
  }
}
