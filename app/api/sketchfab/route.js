const fallback = [
  { title: "Canada Terrain Observatory", category: "terrain", url: "https://sketchfab.com/search?q=canada%20terrain&type=models" },
  { title: "Tokyo Structure Scan", category: "structures", url: "https://sketchfab.com/search?q=tokyo%20building&type=models" },
  { title: "Moon Planetary Surface", category: "planetary", url: "https://sketchfab.com/search?q=moon%20terrain&type=models" },
  { title: "New York Map Signal", category: "maps", url: "https://sketchfab.com/search?q=new%20york%20map&type=models" },
  { title: "Europe Geographic Layer", category: "geographical", url: "https://sketchfab.com/search?q=europe%20terrain&type=models" }
]

const intentBoosts = {
  car: ["car", "vehicle", "auto", "classic", "datsun", "nissan", "toyota", "ford", "chevrolet"],
  house: ["house", "home", "interior", "real estate", "room", "architecture"],
  market: ["market", "wall street", "finance", "stock", "city", "district"],
  terrain: ["terrain", "map", "landscape", "surface", "satellite", "planet"],
  history: ["ancient", "rome", "temple", "museum", "historic", "artifact"]
}

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

function statusLabel(status, hasResults = false) {
  if (status === 200 && hasResults) return "Sketchfab search connected"
  if (status === 200) return "Sketchfab search connected; no ranked downloadable model matched"
  if (status === 401 || status === 403) return "Sketchfab token needs permission"
  if (status === 404) return "Sketchfab route not found"
  if (status >= 500) return "Sketchfab service unavailable"
  if (status) return `Sketchfab request needs attention (${status})`
  return "Sketchfab search pending"
}

function downloadStatusLabel(status) {
  if (status === "ok") return "GLB download ready"
  if (status === "missing-token") return "Preview ready; add Sketchfab token for GLB download"
  if (status === "missing-download-url") return "Preview ready; GLB URL not included"
  if (status === "missing-uid") return "Preview ready; model UID missing"
  if (typeof status === "number") return statusLabel(status)
  return status || "download pending"
}

function tokenize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/).filter(Boolean)
}

function cleanSearchQuery(value) {
  return String(value || "")
    .replace(/\bproject\s+glb\b/gi, "project")
    .replace(/\bdownloadable\s+glb\b/gi, "")
    .replace(/\bglb\b/gi, "")
    .replace(/\b3d\s+model\b/gi, "")
    .replace(/\b3d\s+map\b/gi, "map")
    .replace(/\b3d\b/gi, "")
    .replace(/\bobservatory\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
}

function inferIntent(tokens) {
  const joined = tokens.join(" ")
  for (const [intent, terms] of Object.entries(intentBoosts)) {
    if (terms.some((term) => joined.includes(term))) return intent
  }
  return "observatory"
}

function scoreSketchfabModel(model, query) {
  const queryTokens = tokenize(query)
  const title = String(model.name || "").toLowerCase()
  const description = String(model.description || "").toLowerCase()
  const categories = (model.categories || []).map((category) => String(category.name || "").toLowerCase()).join(" ")
  const haystack = `${title} ${description} ${categories}`
  const intent = inferIntent(queryTokens)
  let score = 0

  for (const token of queryTokens) {
    if (title.includes(token)) score += 18
    else if (haystack.includes(token)) score += 7
  }

  const years = queryTokens.filter((token) => /^\d{4}$/.test(token))
  for (const year of years) {
    score += title.includes(year) ? 30 : haystack.includes(year) ? 12 : -12
  }

  const intentTerms = intentBoosts[intent] || []
  for (const term of intentTerms) {
    if (title.includes(term)) score += 10
    else if (haystack.includes(term)) score += 4
  }

  if (model.isDownloadable) score += 8
  if (model.viewerUrl || model.url) score += 3
  score += Math.min(12, Number(model.likeCount || 0) / 250)
  score += Math.min(8, Number(model.viewCount || 0) / 10000)

  return Number(score.toFixed(2))
}

async function fetchSketchfabDownload(uid, token) {
  if (!uid) {
    return { url: null, status: "missing-uid", label: downloadStatusLabel("missing-uid"), error: "Sketchfab model UID was not returned." }
  }

  if (!token) {
    return { url: null, status: "missing-token", label: downloadStatusLabel("missing-token"), error: "Set SKETCHFAB_ACCESS_TOKEN to request downloadable GLB URLs." }
  }

  try {
    const r = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
      headers: { Authorization: `Token ${token}` }
    })
    if (!r.ok) {
      const detail = await r.text()
      return { url: null, status: `http-${r.status}`, label: downloadStatusLabel(r.status), error: detail || `Sketchfab download request needs attention.` }
    }

    const d = await r.json()
    const url = d.glb?.url || d.gltf?.url || null
    return { url, status: url ? "ok" : "missing-download-url", label: downloadStatusLabel(url ? "ok" : "missing-download-url"), error: url ? null : "Sketchfab did not include a GLB or glTF download URL." }
  } catch (e) {
    return { url: null, status: "request-error", label: "Sketchfab download request failed", error: e?.message || "Sketchfab download request failed." }
  }
}

async function normalizeSketchfabModel(model, token, query, matchScore) {
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
    downloadStatusLabel: download.label,
    downloadError: download.error,
    matchScore,
    requestedQuery: query,
    relevance: matchScore >= 45 ? "strong" : matchScore >= 25 ? "usable" : "weak"
  }
}

function queryVariants(query) {
  const q = cleanSearchQuery(query || "terrain") || "terrain"
  const tokens = tokenize(q)
  const intent = inferIntent(tokens)
  const variants = [q]
  if (intent === "car") variants.push(`${q} car`, `${q} vehicle`, `${q} classic car`)
  if (intent === "house") variants.push(`${q} architecture`, `${q} house`, `${q} interior`)
  if (intent === "market") variants.push(`${q} financial district`, `${q} market district`)
  if (intent === "terrain") variants.push(`${q} terrain`, `${q} map`)
  return [...new Set(variants)].slice(0, 4)
}

async function fetchSketchfabModel(query) {
  const token = sketchfabToken()
  const headers = token ? { Authorization: `Token ${token}` } : {}
  const allResults = []
  let status = null

  for (const variant of queryVariants(query)) {
    const url = new URL("https://api.sketchfab.com/v3/search")
    url.searchParams.set("type", "models")
    url.searchParams.set("downloadable", "true")
    url.searchParams.set("sort_by", "-relevance")
    url.searchParams.set("count", "12")
    url.searchParams.set("q", variant)

    const response = await fetch(url, { headers })
    status = response.status
    if (!response.ok) continue
    const data = await response.json()
    allResults.push(...(data.results || []))
  }

  const ranked = allResults
    .filter((model, index, list) => model?.uid && list.findIndex((item) => item.uid === model.uid) === index)
    .map((model) => ({ model, score: scoreSketchfabModel(model, query) }))
    .sort((a, b) => b.score - a.score)

  return { model: ranked[0]?.model || null, matchScore: ranked[0]?.score || 0, candidates: ranked.slice(0, 5).map((item) => ({ title: item.model.name, uid: item.model.uid, score: item.score })), tokenPresent: Boolean(token), status, statusLabel: statusLabel(status, Boolean(ranked[0]?.model)) }
}

export async function POST(req) {
  const { query = "terrain" } = await req.json()
  const searchQuery = cleanSearchQuery(query) || "terrain"
  const live = await fetchSketchfabModel(searchQuery)

  if (live.model) {
    const result = await normalizeSketchfabModel(live.model, sketchfabToken(), searchQuery, live.matchScore)
    const provider = result.glbUrl ? "sketchfab-live-ranked" : "sketchfab-metadata-ranked"
    const providerLabel = result.glbUrl ? "Live GLB route acquired" : "Live metadata and preview acquired"
    return Response.json({
      result,
      candidates: live.candidates,
      provider,
      providerLabel,
      searchStatus: live.status,
      searchStatusLabel: live.statusLabel,
      ai: `DigitalHut ranked Sketchfab candidates for ${searchQuery}. ${providerLabel}: ${result.title} with ${result.relevance} relevance and score ${result.matchScore}. ${result.downloadStatusLabel}.`
    })
  }

  const item = fallbackResult(query)
  const setupHint = live.tokenPresent
    ? `${live.statusLabel}. Try a broader query or check token permissions if this should return downloadable GLBs.`
    : "Add SKETCHFAB_ACCESS_TOKEN to Render, then redeploy, to enable authenticated live Sketchfab search."

  return Response.json({
    result: {
      ...item,
      glbUrl: null,
      downloadUrl: null,
      downloadStatus: "fallback",
      downloadStatusLabel: "Fallback observatory visual active",
      downloadError: setupHint,
      matchScore: 0,
      requestedQuery: searchQuery,
      relevance: "fallback"
    },
    provider: "fallback",
    providerLabel: "Fallback observatory visual active",
    searchStatus: live.status,
    searchStatusLabel: live.statusLabel,
    ai: `DigitalHut found a ${item.category} observatory signal for ${searchQuery || item.title}. ${setupHint}`
  })
}
