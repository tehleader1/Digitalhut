const providerChecks = [
  ["vercel", ["VERCEL", "VERCEL_ENV"], "deployment-runtime"],
  ["supabase", ["SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"], "asset-storage-database"],
  ["firecuda-storage", ["SUPABASE_FIRECUDA_ASSET_BASE", "VITE_SUPABASE_FIRECUDA_ASSET_BASE", "SUPABASE_FIRECUDA_AVAILABLE_FILES"], "verified-glb-storage"],
  ["sketchfab", ["SKETCHFAB_API_TOKEN", "SKETCHFAB_ACCESS_TOKEN", "VITE_SKETCHFAB_API_TOKEN", "VITE_SKETCHFAB_ACCESS_TOKEN"], "3d-model-search"],
  ["cesium", ["CESIUM_ION_TOKEN", "VITE_CESIUM_ION_TOKEN"], "maps-terrain-3d"],
  ["alchemy", ["ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY", "ALCHEMY_BASE_RPC_URL", "VITE_ALCHEMY_BASE_RPC_URL"], "chain-rpc-verification"],
  ["reown", ["WALLETCONNECT_PROJECT_ID", "VITE_WALLETCONNECT_PROJECT_ID", "REOWN_PROJECT_ID", "VITE_REOWN_PROJECT_ID"], "wallet-connect"],
  ["alpha-vantage", ["ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY"], "market-statistics"],
  ["fmp", ["FMP_API_KEY", "VITE_FMP_API_KEY"], "market-statistics"],
  ["polygon", ["POLYGON_API_KEY", "VITE_POLYGON_API_KEY"], "market-statistics"],
  ["alpaca", ["ALPACA_API_KEY", "ALPACA_SECRET_KEY"], "stock-and-options-print-flow"],
  ["farcaster", ["FARCASTER_API_KEY", "NEYNAR_API_KEY", "FARCASTER_HUB_URL"], "decentralized-social-distribution"],
  ["decentralized-streaming", ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"], "streaming-network-distribution"],
  ["liquidity-contracts", ["DIGITALHUT_LIQUIDITY_CONTRACT", "DIGITALHUT_TREASURY_WALLET", "BASE_LIQUIDITY_POOL_ADDRESS"], "smart-contract-liquidity"],
  ["wiki-editing", ["DIGITALHUT_EDITOR_MODE", "SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_CONTENT_REVIEW_KEY"], "community-edit-main-version-control"],
  ["api-capture", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"], "api-glb-discovery-capture"]
]

const runnerDiscoveries = [
  {id: "renderer-preserved", title: "Renderer Preservation", status: "active", detail: "Vite/Vercel shape, required files, local GLB binary magic, and manifest/API exact-match coverage are runner-checked."},
  {id: "api-first-mode", title: "API-First Feed Mode", status: "active", detail: "External API feeds can surface while FireCuda owner-library assets stay staged as verified backup lanes."},
  {id: "proof-source-metrics", title: "Proof/Source Metrics", status: "active", detail: "Watch, blog, category, source, podcast, and GLB source events are now separated for SEO ladder decisions."},
  {id: "seo-observatory", title: "SEO Observatory Spine", status: "active", detail: "DigitalHut uses watch routes, blog proof, category lanes, source clicks, and GLB/podcast actions as rank movement evidence."}
]

const seoOpportunities = [
  "video watching with 3D model view and podcast source moments",
  "AI video source explainer with live analytics",
  "YouTube alternative full-view episode observatory",
  "GLB research assistant with backlink source proof",
  "2026 dapp entertainment observatory"
]

function envValue(key){
  return String(process.env[key] || "").replace(/^['\"]|['\"]$/g, "").trim()
}

function configured(keys){
  return keys.filter((key) => Boolean(envValue(key)))
}

function envUrl(...keys){
  for(const key of keys){
    const value = envValue(key)
    if(!value) continue
    try {
      const parsed = new URL(value)
      if(["http:", "https:"].includes(parsed.protocol)) return parsed.toString().replace(/\/+$/, "")
    } catch {
      continue
    }
  }
  return ""
}

function supabaseApiUrl(){
  return envUrl("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
}

function supabaseServiceKey(){
  return envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY")
}

function stackStatus(){
  const providers = providerChecks.map(([id, keys, role]) => {
    const configuredKeys = configured(keys)
    return {id, role, configured: configuredKeys.length > 0, configuredKeys}
  })
  const configuredCount = providers.filter((item) => item.configured).length
  return {providers, configuredCount, totalProviders: providers.length, liveScore: Math.round((configuredCount / providers.length) * 100)}
}

function currentMode(){
  const firecudaEnabled = process.env.ENABLE_FIRECUDA_ASSETS === "true"
  return {
    app: "DigitalHut 2026 dapp entertainment observatory",
    deployment: process.env.VERCEL_ENV || "unknown",
    rendererMode: firecudaEnabled ? "hybrid-firecuda-api" : "api-first-preserved",
    firecuda: firecudaEnabled ? "enabled" : "disabled-api-first",
    supabase: supabaseApiUrl() ? "configured" : "not-configured",
    sketchfab: envValue("SKETCHFAB_ACCESS_TOKEN") || envValue("SKETCHFAB_API_TOKEN") || envValue("VITE_SKETCHFAB_ACCESS_TOKEN") || envValue("VITE_SKETCHFAB_API_TOKEN") ? "authenticated" : "public-search",
    payments: envValue("VITE_DIGITALHUT_PAYMENT_ETH_AMOUNT") || envValue("DIGITALHUT_PAYMENT_ETH_AMOUNT") ? "base-eth-checkout-configured" : "wallet-connect-staged"
  }
}

async function readJsonBody(req){
  if(req.body && typeof req.body === "object") return req.body
  if(typeof req.body === "string"){
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return new Promise((resolve) => {
    let raw = ""
    req.on("data", (chunk) => {
      raw += chunk
      if(raw.length > 32000) req.destroy()
    })
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}) } catch { resolve({}) }
    })
    req.on("error", () => resolve({}))
  })
}

function pickString(value, max = 500){
  return String(value || "").slice(0, max)
}

async function saveSearchPixelEvent(req, payload){
  const url = supabaseApiUrl()
  const key = supabaseServiceKey()
  if(!url || !key) return {saved: false, reason: "missing-supabase-service-config", hasUrl: Boolean(url), hasServiceKey: Boolean(key)}

  const row = {
    event_name: pickString(payload.eventName || payload.event_name || "event", 80),
    session_id: pickString(payload.sessionId || payload.session_id || "anonymous", 160),
    visitor_id: pickString(payload.visitorId || payload.visitor_id || "", 160) || null,
    path: pickString(payload.path || "", 700),
    referrer: pickString(payload.referrer || "", 700) || null,
    title: pickString(payload.title || "", 300) || null,
    search: pickString(payload.search || "", 700) || null,
    source: "digitalhut-search-pixel",
    keyword_hint: pickString(payload.keywordHint || payload.keyword_hint || "", 300) || null,
    category: pickString(payload.category || "", 160) || null,
    asset_id: pickString(payload.assetId || payload.asset_id || "", 200) || null,
    blog_slug: pickString(payload.blogSlug || payload.blog_slug || "", 200) || null,
    wallet_address: pickString(payload.walletAddress || payload.wallet_address || "", 100) || null,
    node_key: pickString(payload.nodeKey || payload.node_key || "", 120) || null,
    tier_key: pickString(payload.tierKey || payload.tier_key || "", 120) || null,
    metadata: payload.metadata && typeof payload.metadata === "object" ? payload.metadata : {},
    user_agent: pickString(req.headers["user-agent"] || "", 500) || null
  }

  const response = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events`, {
    method: "POST",
    headers: {apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json", prefer: "return=minimal"},
    body: JSON.stringify(row)
  })
  const text = await response.text()
  if(!response.ok) return {saved: false, reason: "supabase-pixel-write-failed", status: response.status, detail: text.slice(0, 500)}
  return {saved: true}
}

const metricNames = {
  pageViews: ["page_view", "blog_view"],
  blogViews: ["blog_view"],
  searchRuns: ["search_run", "youtube_search_submit"],
  intentSelections: ["search_intent_chip_select", "quick_panel_select", "category_lane_select"],
  proofRouteOpens: ["proof_route_open", "watch_route_open", "blog_route_open", "category_proof_open", "viral_watch_route_open", "viral_source_route_open"],
  sourceOpens: ["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"],
  autoplayStarts: ["autoplay_start", "episode_preview_autoplay_start"],
  autoplayPauses: ["autoplay_pause"],
  episodeShifts: ["autoplay_episode_shift"],
  podcastInterrupts: ["podcast_interrupt_play", "podcast_interrupt_start", "viral_podcast_source_start"],
  glbPreviewPlays: ["glb_preview_play", "glb_preview_open"],
  glbReplicaPlays: ["glb_replica_play", "viral_glb_proof_play"],
  timelineScrubs: ["timeline_scrub", "platform_cadence_read"],
  marketOpens: ["market_view_open", "market_panel_open", "ticker_search"]
}

function emptyPixelSummary(reason = ""){
  const interactionTotals = Object.fromEntries(Object.keys(metricNames).map((key) => [key, 0]))
  return {
    ready: false,
    reason,
    totalEvents: 0,
    totalPageViews: 0,
    totalBlogViews: 0,
    totalGlbPreviewPlays: 0,
    totalAutoplayStarts: 0,
    totalAutoplayPauses: 0,
    totalEpisodeShifts: 0,
    totalPodcastInterrupts: 0,
    totalTimelineScrubs: 0,
    totalMarketOpens: 0,
    totalGlbReplicaPlays: 0,
    totalIntentSelections: 0,
    totalProofRouteOpens: 0,
    totalSourceOpens: 0,
    totalSearchRuns: 0,
    totalWalletClicks: 0,
    totalTierClicks: 0,
    totalNodeClicks: 0,
    uniqueVisitors: 0,
    interactionTotals,
    summaryLine: reason ? `Pixel counts unavailable: ${reason}` : "Pixel counts unavailable.",
    last48Hours: [],
    topPages: [],
    topBlogs: [],
    topKeywordHints: [],
    topRenderCategories: [],
    topRenderAssets: [],
    latestEvents: []
  }
}

function countEvents(events, names){
  return events.filter((event) => names.includes(event.event_name)).length
}

function topCounts(items, key, limit = 8){
  const counts = new Map()
  for(const item of items){
    const value = item[key]
    if(!value) continue
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()].map(([value, count]) => ({value, count})).sort((a, b) => b.count - a.count).slice(0, limit)
}

function eventCounts(items, limit = 12){
  const counts = new Map()
  for(const item of items) counts.set(item.event_name, (counts.get(item.event_name) || 0) + 1)
  return [...counts.entries()].map(([eventName, count]) => ({eventName, count})).sort((a, b) => b.count - a.count).slice(0, limit)
}

async function pixelSummary(){
  const url = supabaseApiUrl()
  const key = supabaseServiceKey()
  if(!url || !key) return emptyPixelSummary("missing-supabase-service-config")

  let response
  let text = ""
  try {
    response = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events?select=event_name,visitor_id,path,blog_slug,keyword_hint,category,asset_id,created_at&order=created_at.desc&limit=5000`, {
      headers: {apikey: key, authorization: `Bearer ${key}`}
    })
    text = await response.text()
  } catch (error) {
    return emptyPixelSummary(`supabase-pixel-network-failed-${error?.cause?.code || error?.message || "unknown"}`)
  }
  if(!response.ok) return emptyPixelSummary(`supabase-pixel-read-failed-${response.status}`)

  let events = []
  try { events = text ? JSON.parse(text) : [] } catch { return emptyPixelSummary("pixel-json-parse-failed") }

  const cutoff = Date.now() - 48 * 60 * 60 * 1000
  const recent = events.filter((event) => new Date(event.created_at).getTime() >= cutoff)
  const pageViews = events.filter((event) => metricNames.pageViews.includes(event.event_name))
  const interactionTotals = Object.fromEntries(Object.entries(metricNames).map(([key, names]) => [key, countEvents(events, names)]))

  return {
    ready: true,
    reason: "",
    totalEvents: events.length,
    totalPageViews: interactionTotals.pageViews,
    totalBlogViews: interactionTotals.blogViews,
    totalGlbPreviewPlays: interactionTotals.glbPreviewPlays,
    totalAutoplayStarts: interactionTotals.autoplayStarts,
    totalAutoplayPauses: interactionTotals.autoplayPauses,
    totalEpisodeShifts: interactionTotals.episodeShifts,
    totalPodcastInterrupts: interactionTotals.podcastInterrupts,
    totalTimelineScrubs: interactionTotals.timelineScrubs,
    totalMarketOpens: interactionTotals.marketOpens,
    totalGlbReplicaPlays: interactionTotals.glbReplicaPlays,
    totalIntentSelections: interactionTotals.intentSelections,
    totalProofRouteOpens: interactionTotals.proofRouteOpens,
    totalSourceOpens: interactionTotals.sourceOpens,
    totalThumbnailRenderClicks: events.filter((event) => event.event_name === "thumbnail_render_click").length,
    totalSearchRuns: interactionTotals.searchRuns,
    totalWalletClicks: events.filter((event) => event.event_name === "wallet_connect_click").length,
    totalTierClicks: events.filter((event) => event.event_name === "tier_click").length,
    totalNodeClicks: events.filter((event) => event.event_name === "node_click").length,
    uniqueVisitors: new Set(events.map((event) => event.visitor_id).filter(Boolean)).size,
    interactionTotals,
    summaryLine: `${interactionTotals.pageViews} page views, ${interactionTotals.searchRuns} searches, ${interactionTotals.intentSelections} intent selections, ${interactionTotals.autoplayStarts} autoplay starts, ${interactionTotals.glbPreviewPlays + interactionTotals.glbReplicaPlays} GLB plays, ${interactionTotals.podcastInterrupts} podcast interrupts, ${interactionTotals.proofRouteOpens} proof route opens, ${interactionTotals.sourceOpens} source opens, ${interactionTotals.marketOpens} market opens.`,
    last48Hours: eventCounts(recent),
    topPages: topCounts(pageViews, "path"),
    topBlogs: topCounts(events.filter((event) => event.blog_slug), "blog_slug"),
    topKeywordHints: topCounts(events.filter((event) => event.keyword_hint), "keyword_hint"),
    topRenderCategories: topCounts(events.filter((event) => event.category), "category"),
    topRenderAssets: topCounts(events.filter((event) => event.asset_id), "asset_id"),
    latestEvents: events.slice(0, 10)
  }
}

export default async function handler(req, res){
  if(req.method === "POST"){
    res.setHeader("Cache-Control", "no-store")
    const payload = await readJsonBody(req)
    const result = await saveSearchPixelEvent(req, payload)
    return res.status(200).json({ok: true, pixel: result})
  }

  const stack = stackStatus()
  const pixel = await pixelSummary()
  const payload = {
    generatedAt: new Date().toISOString(),
    status: currentMode(),
    stack,
    pixel,
    diagnostics: {supabase: {urlReady: Boolean(supabaseApiUrl()), serviceKeyReady: Boolean(supabaseServiceKey())}},
    runnerDiscoveries,
    seoOpportunities,
    scorecard: {
      stackPower: stack.liveScore,
      seoPower: 72,
      rendererPower: process.env.ENABLE_FIRECUDA_ASSETS === "true" ? 86 : 68,
      communityPower: 24,
      paymentPower: stack.providers.find((item) => item.id === "reown")?.configured && stack.providers.find((item) => item.id === "alchemy")?.configured ? 55 : 30
    },
    nextMeasurements: [
      "proof route opens",
      "source/backlink opens",
      "real GLB render-complete events",
      "Supabase-backed ratings and comments",
      "Search Console impressions and clicks",
      "Farcaster casts created",
      "decentralized stream sessions",
      "API discoveries captured into Supabase"
    ]
  }
  res.setHeader("Cache-Control", "no-store")
  return res.status(200).json(payload)
}
