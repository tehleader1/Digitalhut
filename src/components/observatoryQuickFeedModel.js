export const QUICK_FEED_GROUP_SIZE = 3
const blockedQuickFeedVideoIds = new Set(["BTeoO9IFbB4"])

function text(value){
  return String(value || "").replace(/\s+/g, " ").trim()
}

function numericMetric(value){
  if(value === "" || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function validReceiptTime(value){
  const parsed = Date.parse(String(value || ""))
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : ""
}

function compactCount(value){
  const number = numericMetric(value)
  if(number === null) return ""
  if(number >= 1_000_000) return `${(number / 1_000_000).toFixed(number >= 10_000_000 ? 0 : 1)}M`
  if(number >= 1_000) return `${(number / 1_000).toFixed(number >= 100_000 ? 0 : 1)}K`
  return number.toLocaleString("en-US")
}

export function quickFeedVideoId(video){
  return text(video?.videoId || video?.id)
}

export function isQuickFeedPlayableYoutubeVideo(video){
  const videoId = quickFeedVideoId(video)
  const description = `${text(video?.title)} ${text(video?.description)}`.toLowerCase()
  if(!videoId || blockedQuickFeedVideoIds.has(videoId)) return false
  if(video?.embeddable === false) return false
  if(video?.privacyStatus && video.privacyStatus !== "public") return false
  if(video?.uploadStatus && video.uploadStatus !== "processed") return false
  if(video?.regionBlockedUS || video?.regionAllowedUS === false) return false
  if(description.includes("#shorts") || /\bshorts?\b/.test(description)) return false
  if(video?.liveBroadcastContent && video.liveBroadcastContent !== "none") return false
  if(video?.durationSeconds && Number(video.durationSeconds) < 60) return false
  return Boolean(video?.embedUrl || videoId)
}

export function quickFeedReceiptFor(video, {
  status = "",
  provider = "",
  fetchedAt = "",
  queryUsed = "",
} = {}){
  const providerRank = Math.round(Number(video?.providerRank) || 0)
  const receiptTime = validReceiptTime(fetchedAt)
  const confirmed = text(status) === "youtube-api-live"
    && text(provider) === "YouTube Data API v3"
    && text(video?.source) === "YouTube Data API v3"
    && providerRank > 0
    && Boolean(receiptTime)
    && Boolean(text(queryUsed))

  return {
    confirmed,
    providerRank: confirmed ? providerRank : 0,
    provider: confirmed ? "YouTube Data API v3" : "",
    fetchedAt: confirmed ? receiptTime : "",
    queryUsed: confirmed ? text(queryUsed) : "",
  }
}

function isDigitalHutCurated(video, status, provider){
  return /seeded|prefilled|storyboard|quota|human-selected|digitalhut/i.test([
    video?.apiStatus,
    video?.contentFit,
    video?.channelTitle,
    status,
    provider,
  ].map(text).join(" "))
}

function thumbnailFor(video){
  return text(
    video?.thumbnail
    || video?.thumbnails?.maxres?.url
    || video?.thumbnails?.high?.url
    || video?.thumbnails?.medium?.url
    || video?.thumbnails?.default?.url
  )
}

export function buildObservatoryQuickFeedItems({
  videos = [],
  status = "",
  provider = "",
  fetchedAt = "",
  queryUsed = "",
} = {}){
  const seen = new Set()
  const unique = []

  for(const [storyIndex, video] of (Array.isArray(videos) ? videos : []).entries()){
    const videoId = quickFeedVideoId(video)
    if(!isQuickFeedPlayableYoutubeVideo(video) || seen.has(videoId)) continue
    seen.add(videoId)

    const receipt = quickFeedReceiptFor(video, {status, provider, fetchedAt, queryUsed})
    const curated = !receipt.confirmed && isDigitalHutCurated(video, status, provider)
    const viewCount = receipt.confirmed ? numericMetric(video?.viewCount) : null

    unique.push({
      videoId,
      storyIndex,
      title: text(video?.title) || "Untitled related video",
      channelTitle: text(video?.channelTitle) || (receipt.confirmed ? "YouTube channel" : "Source pending"),
      thumbnail: thumbnailFor(video),
      sourceUrl: text(video?.url || video?.sourceUrl),
      sourceBadge: receipt.confirmed ? "YouTube API" : curated ? "DigitalHut source" : "Related source",
      truthLabel: receipt.confirmed ? `Provider-ranked #${receipt.providerRank}` : curated ? "DigitalHut curated" : "Related",
      popularityLabel: viewCount === null ? "" : `${compactCount(viewCount)} views`,
      providerReceiptConfirmed: receipt.confirmed,
      providerRank: receipt.providerRank,
      provider: receipt.provider,
      fetchedAt: receipt.fetchedAt,
      queryUsed: receipt.queryUsed || text(queryUsed),
    })
  }

  const completeItemCount = Math.floor(unique.length / QUICK_FEED_GROUP_SIZE) * QUICK_FEED_GROUP_SIZE
  return unique.slice(0, completeItemCount)
}

export function quickFeedGroupCount(items = []){
  return Math.floor((Array.isArray(items) ? items.length : 0) / QUICK_FEED_GROUP_SIZE)
}

export function normalizeQuickFeedGroupIndex(index, groupCount){
  const count = Math.max(0, Math.round(Number(groupCount) || 0))
  if(!count) return 0
  const value = Math.round(Number(index) || 0)
  return ((value % count) + count) % count
}

export function quickFeedGroupAt(items = [], index = 0){
  const groupCount = quickFeedGroupCount(items)
  if(!groupCount) return []
  const groupIndex = normalizeQuickFeedGroupIndex(index, groupCount)
  const start = groupIndex * QUICK_FEED_GROUP_SIZE
  return items.slice(start, start + QUICK_FEED_GROUP_SIZE)
}
