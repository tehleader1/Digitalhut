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

function normalizeSketchfabModel(model) {
  const image = model.thumbnails?.images?.[0]?.url
  return {
    title: model.name,
    category: model.categories?.[0]?.name || "sketchfab",
    url: model.viewerUrl || model.url,
    uid: model.uid,
    author: model.user?.displayName || model.user?.username,
    image
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
    const result = normalizeSketchfabModel(live.model)
    return Response.json({
      result,
      provider: live.tokenPresent ? "sketchfab-live" : "sketchfab-public",
      ai: `DigitalHut found a live Sketchfab observatory model for ${query || result.title}. Review author, category, and download permissions before adding it to a paid tier.`
    })
  }

  const item = fallbackResult(query)
  const setupHint = live.tokenPresent
    ? `Sketchfab token is present, but the live request returned status ${live.status}. Check token permissions or try SKETCHFAB_ACCESS_TOKEN.`
    : "Add SKETCHFAB_ACCESS_TOKEN to Render, then redeploy, to enable authenticated live Sketchfab search."

  return Response.json({
    result: item,
    provider: "fallback",
    ai: `DigitalHut found a ${item.category} observatory signal for ${query || item.title}. ${setupHint}`
  })
}
