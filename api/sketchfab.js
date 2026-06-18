const environmentTerms = ["environment", "scene", "terrain", "city", "architecture", "building", "landscape", "map", "world"]

export default async function handler(req, res){
  const category = String(req.query?.category || "")
  const query = String(req.query?.query || category || "3d environment").replace(/\s+/g, " ").trim().slice(0, 140)
  const search = `${query} environment scene terrain architecture`
  const params = new URLSearchParams({type: "models", q: search, count: "12", sort_by: "-likeCount"})
  const headers = {"User-Agent": "DigitalHut/1.0 environment-search"}
  if(process.env.SKETCHFAB_API_TOKEN) headers.Authorization = `Token ${process.env.SKETCHFAB_API_TOKEN}`

  try {
    const response = await fetch(`https://api.sketchfab.com/v3/search?${params}`, {headers})
    if(!response.ok) throw new Error(`Sketchfab returned ${response.status}`)
    const payload = await response.json()
    const results = (payload.results || []).filter((item) => {
      const value = `${item.name || ""} ${item.description || ""} ${(item.tags || []).map((tag) => tag.name || tag).join(" ")}`.toLowerCase()
      return environmentTerms.some((term) => value.includes(term))
    }).slice(0, 5).map((item) => ({
      uid: item.uid,
      title: item.name,
      description: item.description || `Sketchfab environment result for ${query}`,
      viewerUrl: item.viewerUrl || `https://sketchfab.com/3d-models/${item.uid}`,
      embedUrl: `https://sketchfab.com/models/${item.uid}/embed?autostart=0&autospin=0&ui_theme=dark&ui_infos=0&ui_watermark=0`,
      thumbnail: item.thumbnails,
      apiSource: "Sketchfab Data API",
      apiStatus: "environment-viewer-result",
      tags: (item.tags || []).map((tag) => tag.name || tag)
    }))
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json({category, query, results})
  } catch (error) {
    return res.status(200).json({category, query, results: [], error: error?.message || "Sketchfab unavailable"})
  }
}
