const fallback = [
  { title: "Canada Terrain Observatory", category: "terrain", url: "https://sketchfab.com/search?q=canada%20terrain&type=models" },
  { title: "Tokyo Structure Scan", category: "structures", url: "https://sketchfab.com/search?q=tokyo%20building&type=models" },
  { title: "Moon Planetary Surface", category: "planetary", url: "https://sketchfab.com/search?q=moon%20terrain&type=models" },
  { title: "New York Map Signal", category: "maps", url: "https://sketchfab.com/search?q=new%20york%20map&type=models" },
  { title: "Europe Geographic Layer", category: "geographical", url: "https://sketchfab.com/search?q=europe%20terrain&type=models" }
]

function fallbackResult(query) {
  const q = String(query || "").toLowerCase()
  return fallback.find(x => x.title.toLowerCase().includes(q) || x.category.includes(q)) || fallback[Math.floor(Math.random() * fallback.length)]
}

function sketchfabToken() {
  return process.env.SKETCHFAB_ACCESS_TOKEN ||
    process.env.SKETCHFAB_API_TOKEN ||
    process.env.SKETCHFAB_TOKEN ||
    process.env.SKETCHFAB_API_KEY
}

async function fetchSketchfabDownload(uid, token) {
  if (!uid) {
    return {
      url: null,
      status: "missing-uid",
      error: "Sketchfab model UID was not returned."
    }
  }

  if (!token) {
    return {
      url: null,
      status: "missing-token",
      error: "Set SKETCHFAB_ACCESS_TOKEN to request downloadable GLB URLs."
    }
  }

  try {
    const r = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
      headers: { Authorization: `Token ${token}` }
    })
    if (!r.ok) {
      const detail = await r.text()
      return {
        url: null,
        status: r.status,
        error: detail || `Sketchfab download request failed with status ${r.status}.`
      }
    }

    const d = await r.json()
    const url = d.glb?.url || d.gltf?.url || null
    return {
      url,
      status: url ? "ok" : "missing-download-url",
      error: url ? null : "Sketchfab did not include a GLB or glTF download URL."
    }
  } catch (e) {
    return {
      url: null,
      status: "request-error",
      error: e?.message || "Sketchfab download request failed."
    }
  }
}

async function normalizeSketchfabModel(model, token) {
  const image = model.thumbnails?.images?.[0]?.url
  const download = await fetchSketchfabDownload(model.uid, token)
  return {
    title: model.name,
    category: model.categories?.[0]?.name || "sketchfab",
    url: model.viewerUrl || model.url,
    uid: model.uid,
    author: model.user?.displayName || model.user?.username,
    image,
    downloadUrl: download.url,
    glbUrl: download.url,
    downloadStatus: download.status,
    downloadError: download.error
  }
}

async function fetchSketchfabModel(query) {
  const token = sketchfabToken()
  const url = new URL("https://api.sketchfab.com/v3/search")
  url.searchParams.set("type", "models")
  url.searchParams.set("downloadable", "true")
  url.searchParams.set("sort_by", "-likeCount")
  url.searchParams.set("q", query || "terrain")

  const headers = token ? { Authorization: `Token ${token}` } : {}
  const response = await fetch(url, { headers })
  if (!response.ok) {
    return { model: null, tokenPresent: Boolean(token), status: response.status }
  }

  const data = await response.json()
  return { model: data.results?.[0] || null, tokenPresent: Boolean(token), status: response.status }
}

export async function POST(req) {
  const { query = "terrain" } = await req.json()
  const live = await fetchSketchfabModel(query)

  if (live.model) {
    const result = await normalizeSketchfabModel(live.model, sketchfabToken())
    return Response.json({
      result,
      provider: result.glbUrl ? "sketchfab-live" : "sketchfab-metadata",
      ai: `DigitalHut found a live Sketchfab observatory model for ${query || result.title}. Review author, category, and download permissions before adding it to a paid tier.`
    })
  }

  const item = fallbackResult(query)
  const setupHint = live.tokenPresent
    ? `Sketchfab token is present, but the live request returned status ${live.status}. Check token permissions or try SKETCHFAB_ACCESS_TOKEN.`
    : "Add SKETCHFAB_ACCESS_TOKEN to Render, then redeploy, to enable authenticated live Sketchfab search."

  return Response.json({
    result: {
      ...item,
      glbUrl: null,
      downloadUrl: null,
      downloadStatus: "fallback",
      downloadError: setupHint
    },
    provider: "fallback",
    ai: `DigitalHut found a ${item.category} observatory signal for ${query || item.title}. ${setupHint}`
  })
}
