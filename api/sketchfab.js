const environmentTerms = ["environment", "scene", "terrain", "city", "architecture", "building", "landscape", "map", "world", "interior", "room", "village", "airport", "space", "planet", "house"]
const blockedSingleObjectTerms = ["character", "avatar", "weapon", "helmet", "figurine"]

const categoryFallbackQueries = {
  Gamer: ["game environment", "low poly environment", "vr game world", "stylized game level"],
  "Mainstream Streaming": ["city environment", "viral event environment", "concert stage environment", "urban scene"],
  Planetary: ["saturn 3d", "space station", "planetary system", "mars base environment"],
  "Real Estate": ["house interior", "real estate house", "modern house interior", "property architecture"],
  Researcher: ["science laboratory environment", "research station", "museum environment", "terrain scan"],
  Science: ["science laboratory environment", "space observatory", "planetary system", "research station"],
  Continent: ["city environment", "terrain map", "world map 3d", "coastal city"],
  Developer: ["server room environment", "computer lab", "data center 3d", "developer workspace"],
  Programmer: ["server room environment", "computer lab", "data center 3d", "developer workspace"],
  Businesses: ["office interior", "city business district", "store interior", "commercial building"],
  History: ["historic city environment", "museum environment", "ancient city", "historic building"],
  Mobility: ["airport environment", "road traffic environment", "train station", "harbor environment"],
  "Orbital Compute": ["space station", "satellite 3d", "orbital platform", "space observatory"]
}

function envValue(key){
  return String(process.env[key] || "").replace(/^['"]|['"]$/g, "").trim()
}

function uniqueQueries(category, query){
  const fallback = categoryFallbackQueries[category] || ["environment 3d", "city environment", "low poly environment"]
  return [query, ...fallback, `${category} environment`]
    .map((item) => String(item || "").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, 5)
}

async function sketchfabSearch(search, headers){
  const params = new URLSearchParams({type: "models", q: search, count: "12", sort_by: "-likeCount"})
  const response = await fetch(`https://api.sketchfab.com/v3/search?${params}`, {headers})
  if(!response.ok) throw new Error(`Sketchfab returned ${response.status}`)
  const payload = await response.json()
  return payload.results || []
}

function searchableValue(item){
  return `${item.name || ""} ${item.description || ""} ${(item.tags || []).map((tag) => tag.name || tag).join(" ")}`.toLowerCase()
}

function environmentScore(item){
  const value = searchableValue(item)
  const envScore = environmentTerms.reduce((score, term) => score + (value.includes(term) ? 1 : 0), 0)
  const blocked = blockedSingleObjectTerms.some((term) => value.includes(term)) && envScore === 0
  return blocked ? -1 : envScore
}

async function captureApiResults(category, query, results){
  const supabaseUrl = envValue("SUPABASE_URL") || envValue("VITE_SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY")
  if(!supabaseUrl || !serviceKey || !results.length) return {enabled: false, saved: 0}

  const endpoint = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/digitalhut_live_feed`
  const rows = results.map((item) => ({
    category: category || "Mainstream Streaming",
    title: item.title || "DigitalHut API 3D result",
    description: item.description || "",
    prompt: query,
    source_url: item.viewerUrl || item.embedUrl || "",
    glb_url: item.modelUrl || null,
    thumbnail_url: item.thumbnail?.images?.[0]?.url || item.thumbnail?.images?.[1]?.url || null,
    share_url: item.viewerUrl || item.embedUrl || "",
    metrics: {apiSource: item.apiSource, apiStatus: item.apiStatus},
    metadata: {
      uid: item.uid,
      embedUrl: item.embedUrl,
      tags: item.tags || [],
      capture: "api-discovery",
      note: "Captured from API discovery feed. A direct downloadable GLB is only attached when the provider exposes one."
    },
    ai_message: `DigitalHut captured this ${category || "3D"} API result for review, ratings, backlinks, and later GLB conversion.`
  }))

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(rows)
    })
    return {enabled: true, saved: response.ok ? rows.length : 0, status: response.status}
  } catch (error) {
    return {enabled: true, saved: 0, error: error?.message || "capture failed"}
  }
}

export default async function handler(req, res){
  const category = String(req.query?.category || "")
  const query = String(req.query?.query || category || "3d environment").replace(/\s+/g, " ").trim().slice(0, 140)
  const headers = {"User-Agent": "DigitalHut/1.0 environment-search"}
  const sketchfabToken = process.env.SKETCHFAB_API_TOKEN || process.env.SKETCHFAB_ACCESS_TOKEN || process.env.VITE_SKETCHFAB_API_TOKEN || process.env.VITE_SKETCHFAB_ACCESS_TOKEN || ""
  if(sketchfabToken) headers.Authorization = `Token ${sketchfabToken}`

  try {
    const searches = uniqueQueries(category, query)
    const batches = await Promise.allSettled(searches.map((search) => sketchfabSearch(search, headers)))
    const seen = new Set()
    const candidates = batches
      .filter((batch) => batch.status === "fulfilled")
      .flatMap((batch) => batch.value)
      .filter((item) => {
        const key = item.uid || item.uri || item.name
        if(!key || seen.has(key)) return false
        seen.add(key)
        return environmentScore(item) >= 0
      })
      .map((item) => ({...item, digitalhutEnvironmentScore: environmentScore(item)}))
      .sort((a, b) => b.digitalhutEnvironmentScore - a.digitalhutEnvironmentScore)
    const preferred = candidates.filter((item) => item.digitalhutEnvironmentScore > 0)
    const results = (preferred.length ? preferred : candidates).slice(0, 5).map((item) => ({
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
    const capture = await captureApiResults(category, query, results)
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json({category, query, searches, authenticated: Boolean(sketchfabToken), capture, results})
  } catch (error) {
    return res.status(200).json({category, query, results: [], error: error?.message || "Sketchfab unavailable"})
  }
}
