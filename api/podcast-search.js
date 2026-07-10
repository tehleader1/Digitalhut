const cache = new Map()
const cacheTtlMs = 10 * 60 * 1000

function clean(value, max = 180){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function cacheKey(term){
  return term.toLowerCase()
}

function fallbackTerms(term, category = ""){
  const cleanTerm = clean(term, 140)
  const cleanCategory = clean(category, 80)
  const categoryVoice = {
    "Mainstream Streaming": "TED Talks Daily culture podcast",
    Gamer: "gaming creator podcast",
    Planetary: "StarTalk science podcast",
    "Orbital Compute": "space technology podcast",
    Science: "science research podcast",
    Researcher: "university research podcast",
    Programmer: "technology developer podcast",
    Businesses: "business market podcast",
    "Real Estate": "real estate investing podcast",
    Continent: "travel culture podcast"
  }[cleanCategory] || "TED Talks Daily podcast"
  const subject = cleanTerm
    .replace(/\b(digitalhut|seeded|youtube|panel|prefilled|visual experience|3d experience)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  return Array.from(new Set([
    cleanTerm,
    `${subject} podcast`,
    `${subject} interview`,
    `${subject} discussion`,
    categoryVoice,
    `${cleanCategory || "technology"} podcast episode`
  ].map((item) => clean(item, 140)).filter(Boolean)))
}

async function searchAppleEpisodes(term){
  const params = new URLSearchParams({
    term,
    media: "podcast",
    entity: "podcastEpisode",
    limit: "5",
    country: "US",
    explicit: "No"
  })
  const response = await fetch(`https://itunes.apple.com/search?${params}`, {
    headers: {"User-Agent": "DigitalHut/1.0 podcast-match"}
  })
  if(!response.ok) throw new Error(`Apple podcast search returned ${response.status}`)
  const payload = await response.json()
  return (payload.results || []).map((item) => ({
    id: String(item.episodeGuid || item.trackId || item.episodeUrl || item.trackViewUrl || ""),
    title: clean(item.trackName || item.episodeName || "Podcast episode"),
    show: clean(item.collectionName || item.artistName || "Podcast"),
    author: clean(item.artistName || item.collectionName || "Podcast publisher"),
    description: clean(item.description || item.shortDescription || "", 420),
    artwork: item.artworkUrl600 || item.artworkUrl100 || "",
    audioUrl: String(item.episodeUrl || item.previewUrl || "").replace(/^http:/i, "https:"),
    pageUrl: item.trackViewUrl || item.collectionViewUrl || "",
    publishedAt: item.releaseDate || "",
    durationMs: Number(item.trackTimeMillis || 0),
    source: "Apple Podcasts Search API"
  })).filter((item) => item.id && (item.audioUrl || item.pageUrl)).slice(0, 3)
}

export default async function handler(req, res){
  if(req.method !== "GET") return res.status(405).json({error: "Method not allowed"})
  const term = clean(req.query?.query || req.query?.term || "world environment science")
  const category = clean(req.query?.category || "")
  const key = cacheKey(`${term}:${category}`)
  const saved = cache.get(key)
  if(saved && Date.now() - saved.createdAt < cacheTtlMs){
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json(saved.payload)
  }

  try {
    const terms = fallbackTerms(term, category)
    let episodes = []
    let matchedTerm = term
    for(const candidate of terms){
      episodes = await searchAppleEpisodes(candidate)
      matchedTerm = candidate
      if(episodes.length) break
    }

    const result = {
      ok: true,
      configured: true,
      status: episodes.length ? "podcast-api-live" : "podcast-api-empty",
      query: matchedTerm,
      requestedQuery: term,
      provider: "Apple Podcasts Search API",
      fetchedAt: new Date().toISOString(),
      episodes
    }
    cache.set(key, {createdAt: Date.now(), payload: result})
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json(result)
  } catch (error) {
    return res.status(502).json({
      ok: false,
      configured: true,
      status: "podcast-api-error",
      query: term,
      provider: "Apple Podcasts Search API",
      fetchedAt: new Date().toISOString(),
      episodes: [],
      error: error?.message || "Podcast search unavailable"
    })
  }
}
