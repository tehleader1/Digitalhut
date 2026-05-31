const fallback = [
  { title: "Canada Terrain Observatory", category: "terrain", url: "https://sketchfab.com/search?q=canada%20terrain&type=models" },
  { title: "Tokyo Structure Scan", category: "structures", url: "https://sketchfab.com/search?q=tokyo%20building&type=models" },
  { title: "Moon Planetary Surface", category: "planetary", url: "https://sketchfab.com/search?q=moon%20terrain&type=models" },
  { title: "New York Map Signal", category: "maps", url: "https://sketchfab.com/search?q=new%20york%20map&type=models" },
  { title: "Europe Geographic Layer", category: "geographical", url: "https://sketchfab.com/search?q=europe%20terrain&type=models" }
]

function fallbackResult(query) {
  const q = query.toLowerCase()
  return fallback.find(x => x.title.toLowerCase().includes(q) || x.category.includes(q)) || fallback[Math.floor(Math.random() * fallback.length)]
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

export async function POST(req) {
  const { query = "terrain" } = await req.json()
  const token = process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN

  if (token) {
    const url = new URL("https://api.sketchfab.com/v3/search")
    url.searchParams.set("type", "models")
    url.searchParams.set("downloadable", "true")
    url.searchParams.set("sort_by", "-likeCount")
    url.searchParams.set("q", query || "terrain")

    const response = await fetch(url, { headers: { Authorization: `Token ${token}` } })
    if (response.ok) {
      const data = await response.json()
      const model = data.results?.[0]
      if (model) {
        const result = normalizeSketchfabModel(model)
        return Response.json({
          result,
          provider: "sketchfab-live",
          ai: `DigitalHut found a live Sketchfab observatory model for ${query || result.title}. Review author, category, and download permissions before adding it to a paid tier.`
        })
      }
    }
  }

  const item = fallbackResult(query)
  return Response.json({
    result: item,
    provider: "fallback",
    ai: `DigitalHut found a ${item.category} observatory signal for ${query || item.title}. Add SKETCHFAB_ACCESS_TOKEN to enable the live Sketchfab feed.`
  })
}
