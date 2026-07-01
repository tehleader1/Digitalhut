const cache = new Map()
const cacheTtlMs = 10 * 60 * 1000

function clean(value, max = 180){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function cacheKey(term){
  return term.toLowerCase()
}

function videoQuery(term){
  const value = clean(term || "space mission documentary interview", 160)
  return `${value} interview documentary explanation official`
}

const embedParams = "autoplay=0&rel=0&playsinline=1&modestbranding=1&controls=0&enablejsapi=1&iv_load_policy=3&disablekb=1"

function normalizeYouTubeItem(item){
  const id = item?.id?.videoId || ""
  if(!id) return null
  const snippet = item.snippet || {}
  return {
    id: `youtube:${id}`,
    title: clean(snippet.title || "Video clip", 160),
    channel: clean(snippet.channelTitle || "YouTube channel", 120),
    description: clean(snippet.description || "", 420),
    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
    pageUrl: `https://www.youtube.com/watch?v=${id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}?${embedParams}`,
    publishedAt: snippet.publishedAt || "",
    source: "YouTube Data API",
    attribution: snippet.channelTitle ? `${snippet.channelTitle} / YouTube` : "YouTube"
  }
}

export default async function handler(req, res){
  if(req.method !== "GET") return res.status(405).json({error: "Method not allowed"})
  const term = videoQuery(req.query?.query || req.query?.term || req.query?.topic || "space mission documentary")
  const key = cacheKey(term)
  const saved = cache.get(key)
  if(saved && Date.now() - saved.createdAt < cacheTtlMs){
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json(saved.payload)
  }

  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || ""
  if(!apiKey){
    return res.status(200).json({
      query: term,
      provider: "YouTube Data API",
      configured: false,
      fetchedAt: new Date().toISOString(),
      videos: [],
      requiredEnv: "YOUTUBE_API_KEY",
      message: "Video API source pulling is staged. Add YOUTUBE_API_KEY to return official embeddable video candidates."
    })
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    q: term,
    type: "video",
    videoEmbeddable: "true",
    safeSearch: "moderate",
    maxResults: "5",
    order: "relevance"
  })

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, {
      headers: {"User-Agent": "DigitalHut/1.0 video-search"}
    })
    if(!response.ok) throw new Error(`YouTube Data API returned ${response.status}`)
    const payload = await response.json()
    const videos = (payload.items || []).map(normalizeYouTubeItem).filter(Boolean).slice(0, 3)
    const result = {
      query: term,
      provider: "YouTube Data API",
      configured: true,
      fetchedAt: new Date().toISOString(),
      videos
    }
    cache.set(key, {createdAt: Date.now(), payload: result})
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1800")
    return res.status(200).json(result)
  } catch (error) {
    return res.status(502).json({
      query: term,
      provider: "YouTube Data API",
      configured: true,
      fetchedAt: new Date().toISOString(),
      videos: [],
      error: error?.message || "Video search unavailable"
    })
  }
}
