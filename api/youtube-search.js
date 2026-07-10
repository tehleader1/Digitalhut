const cache = new Map()
const cacheTtlMs = 6 * 60 * 1000
let quotaCooldownUntil = 0
const quotaCooldownMs = 6 * 60 * 60 * 1000
const blockedEmbedIds = new Set(["BTeoO9IFbB4"])
const stopWords = new Set(["2026", "visual", "experience", "expercience", "streaming", "mainstream", "digitalhut", "ai", "the", "and", "for", "with", "into", "from", "live", "feed"])

function clean(value, max = 180){
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max)
}

function isoDurationToSeconds(value){
  const match = String(value || "").match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if(!match) return 0
  const [, hours, minutes, seconds] = match
  return (Number(hours || 0) * 3600) + (Number(minutes || 0) * 60) + Number(seconds || 0)
}

function compactNumber(value){
  const count = Number(value || 0)
  if(!Number.isFinite(count)) return 0
  return count
}

function videoUrl(videoId){
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
}

function embedUrl(videoId){
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`
}

function uniqueTerms(values){
  const seen = new Set()
  return values
    .map((value) => clean(value, 220))
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLowerCase()
      if(seen.has(key)) return false
      seen.add(key)
      return true
    })
}

const categorySearchIntents = {
  Gamer: {
    primary: "gaming build gameplay graphics analysis",
    modifiers: ["top gaming build showcase", "game update graphics breakdown", "server build ranking", "open world gameplay analysis"],
    required: ["game", "gaming", "gameplay", "server", "graphics", "build", "console", "pc", "rpg", "quest"]
  },
  "Real Estate": {
    primary: "real estate property tour housing market",
    modifiers: ["real estate virtual tour", "property walkthrough housing market", "home listing agency tour", "housing market 3d model"],
    required: ["real", "estate", "property", "home", "house", "housing", "listing", "agent", "apartment", "tour"]
  },
  Researcher: {
    primary: "research study data documentary",
    modifiers: ["research study explainer", "science field study", "data documentary", "evidence based analysis"],
    required: ["research", "study", "science", "data", "field", "evidence", "climate", "coral", "animal", "extinction"]
  },
  Science: {
    primary: "science study data documentary",
    modifiers: ["science experiment explainer", "field study documentary", "lab research analysis", "public data science"],
    required: ["science", "study", "experiment", "research", "data", "field", "lab", "climate", "planetary"]
  },
  Programmer: {
    primary: "developer coding backend API analysis",
    modifiers: ["developer workflow breakdown", "coding project analysis", "backend API explained", "software engineering case study"],
    required: ["code", "coding", "developer", "software", "api", "backend", "programming", "dapp", "database", "ai"]
  },
  Businesses: {
    primary: "business market company analysis",
    modifiers: ["stock market company analysis", "business growth breakdown", "market data explained", "sponsor business case study"],
    required: ["business", "market", "stock", "company", "finance", "growth", "customer", "revenue", "sponsor", "storefront"]
  },
  "Mainstream Streaming": {
    primary: "viral social media reel story",
    modifiers: ["viral creator reel breakdown", "funny social media video", "family vlog story", "creator trend analysis"],
    required: ["viral", "reel", "social", "creator", "vlog", "funny", "tiktok", "instagram", "youtube", "trend"]
  },
  Planetary: {
    primary: "space planetary environment documentary",
    modifiers: ["space exploration documentary", "planetary science visual", "NASA moon mars analysis", "orbit environment explainer"],
    required: ["space", "planet", "planetary", "moon", "mars", "nasa", "orbit", "earth", "cosmic", "satellite"]
  },
  "Orbital Compute": {
    primary: "satellite internet orbital compute infrastructure",
    modifiers: ["satellite internet analysis", "orbital compute infrastructure", "space data center explained", "laser communication satellite"],
    required: ["satellite", "orbital", "space", "internet", "compute", "laser", "data", "infrastructure", "starlink"]
  },
  Mobility: {
    primary: "transportation travel traffic infrastructure analysis",
    modifiers: ["traffic route analysis", "airport travel delay report", "transit infrastructure explained", "vehicle mobility data"],
    required: ["traffic", "travel", "airport", "vehicle", "transit", "transportation", "route", "rail", "flight", "road"]
  },
  Workforce: {
    primary: "construction workforce jobsite training analysis",
    modifiers: ["construction jobsite safety", "workforce training video", "public works project", "infrastructure operations report"],
    required: ["construction", "workforce", "jobsite", "training", "safety", "project", "infrastructure", "warehouse"]
  },
  History: {
    primary: "history documentary archive timeline",
    modifiers: ["historic district documentary", "ancient city history", "museum archive walkthrough", "heritage timeline story"],
    required: ["history", "historic", "ancient", "archive", "museum", "heritage", "timeline", "culture"]
  },
  Continent: {
    primary: "travel documentary city culture map",
    modifiers: ["global travel documentary", "city culture visual tour", "country travel guide", "coastal destination story"],
    required: ["travel", "city", "country", "culture", "tour", "destination", "coastal", "global", "continent"]
  },
  Political: {
    primary: "civic policy government public infrastructure",
    modifiers: ["government policy explainer", "civic infrastructure report", "public works policy", "local government documentary"],
    required: ["government", "policy", "civic", "public", "election", "infrastructure", "city", "law"]
  }
}

function categorySearchIntent(category){
  return categorySearchIntents[clean(category, 80)] || {
    primary: "documentary explainer visual analysis",
    modifiers: ["documentary explainer", "visual analysis", "official video", "news analysis"],
    required: []
  }
}

function searchAttemptsFor(term, category){
  const topic = clean(term, 120)
  const lane = clean(category, 80)
  const intent = categorySearchIntent(lane)
  return uniqueTerms([
    `${topic} ${intent.primary}`,
    `${topic} ${lane} ${intent.modifiers[0] || intent.primary}`,
    ...intent.modifiers.map((modifier) => `${modifier} ${topic}`),
    `${lane} ${topic} documentary explainer`
  ]).slice(0, 4)
}

function meaningfulTokens(value){
  return clean(value, 240)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token))
}

function relevanceScore(video, term, category){
  const tokens = meaningfulTokens(`${term} ${category}`)
  if(!tokens.length) return 1
  const haystack = `${video?.title || ""} ${video?.description || ""} ${video?.channelTitle || ""}`.toLowerCase()
  const tokenScore = tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0)
  const intent = categorySearchIntent(category)
  const laneScore = (intent.required || []).reduce((score, token) => score + (haystack.includes(token) ? 2 : 0), 0)
  return tokenScore + laneScore
}

function storySignalsFor(video, index, term){
  const title = video.title || term
  return [
    index === 0 ? "primary story source" : "supporting clip lane",
    video.channelTitle ? `channel: ${video.channelTitle}` : "channel scan pending",
    video.durationSeconds ? `${Math.round(video.durationSeconds / 60)} min visual segment` : "duration pending",
    title.toLowerCase().includes("shorts") ? "short-form cutscene" : "long-form context"
  ]
}

function isPlayableCandidate(video, term, category){
  const text = `${video?.title || ""} ${video?.description || ""}`.toLowerCase()
  const intent = categorySearchIntent(category)
  const topicTokens = meaningfulTokens(term)
  const topicHit = topicTokens.some((token) => text.includes(token))
  const laneHit = (intent.required || []).some((token) => text.includes(token))
  if(blockedEmbedIds.has(video?.id)) return false
  if(video?.embeddable === false) return false
  if(video?.privacyStatus && video.privacyStatus !== "public") return false
  if(video?.uploadStatus && video.uploadStatus !== "processed") return false
  if(video?.regionBlockedUS || video?.regionAllowedUS === false) return false
  if(text.includes("#shorts") || /\bshorts?\b/.test(text)) return false
  if(video.liveBroadcastContent && video.liveBroadcastContent !== "none") return false
  if(video.durationSeconds && video.durationSeconds < 60) return false
  if((intent.required || []).length && !topicHit && !laneHit) return false
  if(relevanceScore(video, term, category) < 1) return false
  return true
}

async function youtubeJson(url){
  const response = await fetch(url, {
    headers: {"User-Agent": "DigitalHut/1.0 youtube-observatory"}
  })
  const text = await response.text()
  if(!response.ok) throw new Error(`YouTube returned ${response.status}: ${text.slice(0, 160)}`)
  return text ? JSON.parse(text) : {}
}

function isQuotaError(error){
  const message = String(error?.message || "").toLowerCase()
  return message.includes("quota exceeded") || message.includes("quotaexceeded") || message.includes("returned 429")
}

async function searchVideos({key, searchTerm, maxResults, storyTerm, category}){
  const searchParams = new URLSearchParams({
    part: "snippet",
    q: searchTerm,
    type: "video",
    maxResults: String(maxResults),
    safeSearch: "moderate",
    videoEmbeddable: "true",
    videoDuration: "medium",
    relevanceLanguage: "en",
    key
  })
  const searchPayload = await youtubeJson(`https://www.googleapis.com/youtube/v3/search?${searchParams}`)
  const ids = (searchPayload.items || [])
    .map((item) => item?.id?.videoId)
    .filter(Boolean)

  let videoDetails = new Map()
  if(ids.length){
    const detailsParams = new URLSearchParams({
      part: "snippet,contentDetails,statistics,status",
      id: ids.join(","),
      key
    })
    const detailsPayload = await youtubeJson(`https://www.googleapis.com/youtube/v3/videos?${detailsParams}`)
    videoDetails = new Map((detailsPayload.items || []).map((item) => [item.id, item]))
  }

  const videos = ids.map((videoId, index) => {
    const searchItem = (searchPayload.items || []).find((item) => item?.id?.videoId === videoId) || {}
    const detail = videoDetails.get(videoId) || {}
    const snippet = detail.snippet || searchItem.snippet || {}
    const durationSeconds = isoDurationToSeconds(detail.contentDetails?.duration)
    const regionRestriction = detail.contentDetails?.regionRestriction || {}
    const allowed = Array.isArray(regionRestriction.allowed) ? regionRestriction.allowed : null
    const blocked = Array.isArray(regionRestriction.blocked) ? regionRestriction.blocked : []
    const video = {
      id: videoId,
      title: clean(snippet.title || "YouTube video", 220),
      description: clean(snippet.description || "", 520),
      channelTitle: clean(snippet.channelTitle || "", 120),
      publishedAt: snippet.publishedAt || "",
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
      url: videoUrl(videoId),
      embedUrl: embedUrl(videoId),
      durationSeconds,
      viewCount: compactNumber(detail.statistics?.viewCount),
      likeCount: compactNumber(detail.statistics?.likeCount),
      commentCount: compactNumber(detail.statistics?.commentCount),
      embeddable: detail.status?.embeddable !== false,
      privacyStatus: detail.status?.privacyStatus || "",
      uploadStatus: detail.status?.uploadStatus || "",
      regionBlockedUS: blocked.includes("US"),
      regionAllowedUS: allowed ? allowed.includes("US") : true,
      liveBroadcastContent: snippet.liveBroadcastContent || "none",
      source: "YouTube Data API v3"
    }
    return {
      ...video,
      storySignals: storySignalsFor(video, index, storyTerm)
    }
  }).filter((video) => isPlayableCandidate(video, storyTerm, category || searchTerm))

  return {searchPayload, videos}
}

export default async function handler(req, res){
  if(req.method !== "GET") return res.status(405).json({error: "Method not allowed"})
  const key = process.env.YOUTUBE_API_KEY || process.env.GOOGLE_YOUTUBE_API_KEY || ""
  const term = clean(req.query?.query || req.query?.q || req.query?.term || "DigitalHut observatory visual experience")
  const category = clean(req.query?.category || "DigitalHut", 80)
  const maxResults = Math.max(1, Math.min(8, Number(req.query?.limit || 5) || 5))
  const cacheKey = `${term}:${category}:${maxResults}`.toLowerCase()
  const saved = cache.get(cacheKey)
  if(saved && Date.now() - saved.createdAt < cacheTtlMs){
    res.setHeader("Cache-Control", "private, max-age=120")
    return res.status(200).json(saved.payload)
  }

  if(!key){
    return res.status(200).json({
      ok: false,
      configured: false,
      provider: "YouTube Data API v3",
      query: term,
      category,
      fetchedAt: new Date().toISOString(),
      videos: [],
      status: "missing-youtube-api-key"
    })
  }

  if(Date.now() < quotaCooldownUntil){
    const payload = {
      ok: false,
      configured: true,
      provider: "YouTube Data API v3",
      query: term,
      category,
      fetchedAt: new Date().toISOString(),
      videos: [],
      status: "youtube-quota-cooldown",
      quotaProtected: true,
      retryAfterMs: quotaCooldownUntil - Date.now(),
      error: "YouTube quota cooldown active. DigitalHut is using category-locked fallback panels instead of spending more YouTube searches."
    }
    cache.set(cacheKey, {createdAt: Date.now(), payload})
    res.setHeader("Cache-Control", "private, max-age=900")
    return res.status(200).json(payload)
  }

  try {
    const attempts = searchAttemptsFor(term, category)
    let searchPayload = {}
    let videos = []
    let queryUsed = attempts[0] || term

    for(const searchTerm of attempts){
      const result = await searchVideos({key, searchTerm, maxResults, storyTerm: term, category})
      searchPayload = result.searchPayload
      videos = result.videos
      queryUsed = searchTerm
      if(videos.length) break
    }

    const payload = {
      ok: true,
      configured: true,
      provider: "YouTube Data API v3",
      query: term,
      queryUsed,
      category,
      fetchedAt: new Date().toISOString(),
      videos,
      status: videos.length ? "youtube-api-live" : "youtube-api-empty",
      analytics: {
        totalResults: Number(searchPayload.pageInfo?.totalResults || videos.length),
        resultsReturned: videos.length,
        primaryVideoId: videos[0]?.id || "",
        resetOnAds: true,
        storyMode: "video-search-to-observatory"
      }
    }
    cache.set(cacheKey, {createdAt: Date.now(), payload})
    res.setHeader("Cache-Control", "private, max-age=120")
    return res.status(200).json(payload)
  } catch (error) {
    const quotaLimited = isQuotaError(error)
    if(quotaLimited) quotaCooldownUntil = Date.now() + quotaCooldownMs
    const payload = {
      ok: false,
      configured: true,
      provider: "YouTube Data API v3",
      query: term,
      category,
      fetchedAt: new Date().toISOString(),
      videos: [],
      status: quotaLimited ? "youtube-quota-cooldown" : "youtube-search-unavailable",
      quotaProtected: quotaLimited,
      retryAfterMs: quotaLimited ? quotaCooldownMs : 0,
      error: quotaLimited
        ? "YouTube quota exceeded. DigitalHut is protecting quota and using category-locked fallback panels."
        : error?.message || "YouTube search unavailable"
    }
    cache.set(cacheKey, {createdAt: Date.now(), payload})
    res.setHeader("Cache-Control", quotaLimited ? "private, max-age=900" : "private, max-age=120")
    return res.status(200).json(payload)
  }
}
