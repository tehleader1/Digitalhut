const cache = new Map()
const cacheTtlMs = 10 * 60 * 1000

function clean(value, max = 180){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function cacheKey(term){
  return term.toLowerCase()
}

export default async function handler(req, res){
  if(req.method !== "GET") return res.status(405).json({error: "Method not allowed"})
  const term = clean(req.query?.query || req.query?.term || "world environment science")
  const key = cacheKey(term)
  const saved = cache.get(key)
  if(saved && Date.now() - saved.createdAt < cacheTtlMs){
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json(saved.payload)
  }

  const params = new URLSearchParams({
    term,
    media: "podcast",
    entity: "podcastEpisode",
    limit: "5",
    country: "US",
    explicit: "No"
  })

  try {
    const response = await fetch(`https://itunes.apple.com/search?${params}`, {
      headers: {"User-Agent": "DigitalHut/1.0 podcast-match"}
    })
    if(!response.ok) throw new Error(`Apple podcast search returned ${response.status}`)
    const payload = await response.json()
    const episodes = (payload.results || []).map((item) => ({
      id: String(item.episodeGuid || item.trackId || item.episodeUrl || item.trackViewUrl || ""),
      title: clean(item.trackName || item.episodeName || "Podcast episode"),
      show: clean(item.collectionName || item.artistName || "Podcast"),
      author: clean(item.artistName || item.collectionName || "Podcast publisher"),
      description: clean(item.description || item.shortDescription || "", 420),
      artwork: item.artworkUrl600 || item.artworkUrl100 || "",
      audioUrl: item.episodeUrl || item.previewUrl || "",
      pageUrl: item.trackViewUrl || item.collectionViewUrl || "",
      publishedAt: item.releaseDate || "",
      durationMs: Number(item.trackTimeMillis || 0),
      source: "Apple Podcasts Search API"
    })).filter((item) => item.id && (item.audioUrl || item.pageUrl)).slice(0, 3)

    const result = {
      query: term,
      provider: "Apple Podcasts Search API",
      fetchedAt: new Date().toISOString(),
      episodes
    }
    cache.set(key, {createdAt: Date.now(), payload: result})
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json(result)
  } catch (error) {
    return res.status(502).json({
      query: term,
      provider: "Apple Podcasts Search API",
      fetchedAt: new Date().toISOString(),
      episodes: [],
      error: error?.message || "Podcast search unavailable"
    })
  }
}
