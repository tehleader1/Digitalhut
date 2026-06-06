export function normalizeActiveFeed(feed = {}, fallback = {}) {
  const query = feed.query || feed.mainGLBSearch || feed.title || fallback.query || "digitalhut observatory"
  const title = feed.title || feed.mainFeatureTitle || fallback.title || query

  return {
    id: feed.id || fallback.id || `${feed.intent || feed.category || "feed"}:${query}`,
    intent: feed.intent || fallback.intent || "general-explorer",
    title,
    query,
    category: feed.category || feed.mood || feed.marketProfile || fallback.category || "observatory",
    source: feed.source || fallback.source || "active-feed",
    marketSymbols: feed.marketSymbols || feed.market?.symbols || fallback.marketSymbols || [],
    modelUrl: feed.modelUrl || feed.glbUrl || feed.downloadUrl || fallback.modelUrl || "",
    terrainUrl: feed.terrainUrl || fallback.terrainUrl || "",
    previewImage: feed.previewImage || feed.image || fallback.previewImage || "",
    feedUrl: feed.feedUrl || feed.url || fallback.feedUrl || "",
    agentNarration: feed.agentNarration || feed.ai || fallback.agentNarration || `${title}. ${query}`,
    context: feed.context || feed.contextGLBSearch || fallback.context || "",
    visualMode: feed.visualMode || fallback.visualMode || "auto",
    cameraPose: feed.cameraPose || fallback.cameraPose || null,
    tourDuration: feed.tourDuration || fallback.tourDuration || 60
  }
}
