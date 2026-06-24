function cleanText(value, fallback = ""){
  return String(value || fallback).replace(/\s+/g, " ").trim().slice(0, 800)
}

function thumbnailFrom(asset){
  return asset.thumbnailUrl || asset.thumbnail?.images?.[0]?.url || asset.thumbnail?.images?.[1]?.url || ""
}

async function readJson(req){
  if(req.body && typeof req.body === "object") return req.body
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const raw = Buffer.concat(chunks).toString("utf8")
  return raw ? JSON.parse(raw) : {}
}

export default async function handler(req, res){
  if(req.method === "GET"){
    const ready = Boolean((process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY))
    return res.status(200).json({
      ready,
      target: "digitalhut_live_feed",
      required: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
      purpose: "Capture API GLB/viewer discoveries into the DigitalHut backend feed for review, SEO, ratings, backlinks, and later conversion."
    })
  }

  if(req.method !== "POST") return res.status(405).json({error: "Method not allowed"})

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY || ""
  if(!supabaseUrl || !serviceKey){
    return res.status(200).json({saved: false, reason: "Supabase service credentials are not configured in this runtime."})
  }

  try {
    const payload = await readJson(req)
    const assets = Array.isArray(payload.assets) ? payload.assets : [payload.asset || payload]
    const rows = assets.filter(Boolean).map((asset) => ({
      category: cleanText(payload.category || asset.category, "Mainstream Streaming"),
      title: cleanText(asset.title || asset.name, "DigitalHut API 3D result"),
      description: cleanText(asset.description, "Captured API 3D result ready for DigitalHut review."),
      prompt: cleanText(payload.query || asset.query || asset.prompt),
      source_url: cleanText(asset.viewerUrl || asset.sourceUrl || asset.url || asset.embedUrl),
      glb_url: asset.modelUrl || asset.glbUrl || null,
      thumbnail_url: thumbnailFrom(asset) || null,
      share_url: cleanText(asset.viewerUrl || asset.sourceUrl || asset.url || asset.embedUrl),
      metrics: {apiSource: asset.apiSource || payload.apiSource || "unknown", apiStatus: asset.apiStatus || "captured"},
      metadata: {
        uid: asset.uid || asset.id || "",
        tags: asset.tags || [],
        embedUrl: asset.embedUrl || "",
        capture: "manual-api-capture"
      },
      ai_message: cleanText(asset.aiMessage, "DigitalHut captured this API discovery for backend review and future GLB conversion.")
    }))

    if(!rows.length) return res.status(400).json({saved: false, reason: "No assets supplied"})

    const response = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/digitalhut_live_feed`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(rows)
    })

    if(!response.ok){
      const detail = await response.text()
      return res.status(502).json({saved: false, status: response.status, detail: detail.slice(0, 500)})
    }

    return res.status(200).json({saved: true, count: rows.length})
  } catch (error) {
    return res.status(400).json({saved: false, error: error?.message || "Capture failed"})
  }
}
