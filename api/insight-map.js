const providerChecks = [
  ["vercel", ["VERCEL", "VERCEL_ENV"], "deployment-runtime"],
  ["supabase", ["SUPABASE_URL", "VITE_SUPABASE_URL", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"], "asset-storage-database"],
  ["firecuda-storage", ["SUPABASE_FIRECUDA_ASSET_BASE", "VITE_SUPABASE_FIRECUDA_ASSET_BASE", "SUPABASE_FIRECUDA_AVAILABLE_FILES"], "verified-glb-storage"],
  ["sketchfab", ["SKETCHFAB_API_TOKEN", "SKETCHFAB_ACCESS_TOKEN", "VITE_SKETCHFAB_API_TOKEN", "VITE_SKETCHFAB_ACCESS_TOKEN"], "3d-model-search"],
  ["cesium", ["CESIUM_ION_TOKEN", "VITE_CESIUM_ION_TOKEN"], "maps-terrain-3d"],
  ["alchemy", ["ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY", "ALCHEMY_BASE_RPC_URL", "VITE_ALCHEMY_BASE_RPC_URL"], "chain-rpc-verification"],
  ["reown", ["WALLETCONNECT_PROJECT_ID", "VITE_WALLETCONNECT_PROJECT_ID", "REOWN_PROJECT_ID", "VITE_REOWN_PROJECT_ID"], "wallet-connect"],
  ["alpha-vantage", ["ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY"], "market-statistics"],
  ["fmp", ["FMP_API_KEY", "VITE_FMP_API_KEY"], "market-statistics"],
  ["polygon", ["POLYGON_API_KEY", "VITE_POLYGON_API_KEY"], "market-statistics"],
  ["alpaca", ["ALPACA_API_KEY", "ALPACA_SECRET_KEY"], "stock-and-options-print-flow"]
  ,["farcaster", ["FARCASTER_API_KEY", "NEYNAR_API_KEY", "FARCASTER_HUB_URL"], "decentralized-social-distribution"]
  ,["decentralized-streaming", ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"], "streaming-network-distribution"]
  ,["liquidity-contracts", ["DIGITALHUT_LIQUIDITY_CONTRACT", "DIGITALHUT_TREASURY_WALLET", "BASE_LIQUIDITY_POOL_ADDRESS"], "smart-contract-liquidity"]
  ,["wiki-editing", ["DIGITALHUT_EDITOR_MODE", "SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_CONTENT_REVIEW_KEY"], "community-edit-main-version-control"]
  ,["api-capture", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY"], "api-glb-discovery-capture"]
]

const runnerDiscoveries = [
  {id: "renderer-preserved", title: "Renderer Preservation", status: "active", detail: "Vite/Vercel shape, required files, local GLB binary magic, and manifest/API exact-match coverage are runner-checked."},
  {id: "api-first-mode", title: "API-First Feed Mode", status: "active", detail: "FireCuda owner-library assets are explicitly disabled so external API feeds can surface without broken storage GLB URLs taking over."},
  {id: "sketchfab-environments", title: "Sketchfab Environment Lane", status: "active", detail: "The system searches environment, terrain, city, architecture, world, building, and scene terms before using character or loose-object results."},
  {id: "seo-observatory", title: "SEO Observatory Spine", status: "new", detail: "DigitalHut now has 3D observatory, GLB renderer, automatic system presentation, hub, backlink, rating, and upload keyword lanes."},
  {id: "wallet-chain", title: "Wallet Checkout Rail", status: "staged", detail: "Reown connects wallets, Alchemy verifies chain activity, and Supabase is the intended subscription record layer."}
  ,{id: "market-print-feed", title: "Market Print Feed", status: "new", detail: "Ticker search can read stock trade prints and options contract prints across 12h, 6h, 3h, and 1h windows, with inferred pressure labels."}
  ,{id: "farcaster-social", title: "Farcaster Social Lane", status: "staged", detail: "DigitalHut can publish cast-ready 3D observatory cards after a Farcaster/Neynar key is configured."}
  ,{id: "decentralized-streaming", title: "Decentralized Streaming Lane", status: "staged", detail: "Streaming network output is tracked as a runner lane; it needs a Livepeer, Theta, or HLS gateway credential before live posting."}
  ,{id: "liquidity-contracts", title: "Smart Contract Liquidity Lane", status: "requires contract review", detail: "Liquidity-pool automation must be a reviewed contract integration with explicit chain, token, receiver, and transaction verification."}
  ,{id: "wiki-editing", title: "Wiki-Style Developer Edits", status: "staged", detail: "Developer edits should save as proposals while the main DigitalHut version remains protected and reviewable."}
  ,{id: "api-glb-capture", title: "API GLB Capture", status: "new", detail: "Sketchfab/API feed discoveries can be saved into the DigitalHut live feed when Supabase service credentials are configured."}
]

const seoOpportunities = [
  "2026 3D renderer observatory AI system",
  "automatic GLB autoplay presentation",
  "state of the art 3D imagery for research communities",
  "public feed to 3D asset presentation",
  "planetary views and orbital compute explainers",
  "researcher hub evidence notes and environment scans",
  "gamer hub 360 environment asset discovery",
  "programmer hub API renderer testing",
  "international real estate GLB walkthroughs",
  "ratings, reviews, comments, backlinks, and GLB upload loops"
]

function configured(keys){
  return keys.filter((key) => Boolean(process.env[key]))
}

function stackStatus(){
  const providers = providerChecks.map(([id, keys, role]) => {
    const configuredKeys = configured(keys)
    return {id, role, configured: configuredKeys.length > 0, configuredKeys}
  })
  const configuredCount = providers.filter((item) => item.configured).length
  return {
    providers,
    configuredCount,
    totalProviders: providers.length,
    liveScore: Math.round((configuredCount / providers.length) * 100)
  }
}

function currentMode(){
  const firecudaEnabled = process.env.ENABLE_FIRECUDA_ASSETS === "true"
  const supabaseReady = Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)
  const sketchfabReady = Boolean(process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN || process.env.VITE_SKETCHFAB_ACCESS_TOKEN || process.env.VITE_SKETCHFAB_API_TOKEN)
  return {
    app: "DigitalHut 2026 3D renderer observatory AI system",
    deployment: process.env.VERCEL_ENV || "unknown",
    rendererMode: firecudaEnabled ? "hybrid-firecuda-api" : "api-first-preserved",
    firecuda: firecudaEnabled ? "enabled" : "disabled-api-first",
    supabase: supabaseReady ? "configured" : "not-configured",
    sketchfab: sketchfabReady ? "authenticated" : "public-search",
    payments: process.env.VITE_DIGITALHUT_PAYMENT_ETH_AMOUNT || process.env.DIGITALHUT_PAYMENT_ETH_AMOUNT ? "base-eth-checkout-configured" : "wallet-connect-staged"
  }
}

async function readJsonBody(req){
  if(req.body && typeof req.body === "object") return req.body
  if(typeof req.body === "string"){
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  return new Promise((resolve) => {
    let raw = ""
    req.on("data", (chunk) => {
      raw += chunk
      if(raw.length > 32000) req.destroy()
    })
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        resolve({})
      }
    })
    req.on("error", () => resolve({}))
  })
}

function pickString(value, max = 500){
  return String(value || "").slice(0, max)
}

async function saveSearchPixelEvent(req, payload){
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY || ""
  if(!url || !key){
    return {saved: false, reason: "missing-supabase-service-config", hasUrl: Boolean(url), hasServiceKey: Boolean(key)}
  }
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
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=minimal"
    },
    body: JSON.stringify(row)
  })
  const text = await response.text()
  if(!response.ok){
    return {saved: false, reason: "supabase-pixel-write-failed", status: response.status, detail: text.slice(0, 500)}
  }
  return {saved: true}
}

function emptyPixelSummary(reason = ""){
  return {
    ready: false,
    reason,
    totalEvents: 0,
    totalPageViews: 0,
    totalBlogViews: 0,
    totalGlbPreviewPlays: 0,
    totalSearchRuns: 0,
    totalWalletClicks: 0,
    totalTierClicks: 0,
    totalNodeClicks: 0,
    uniqueVisitors: 0,
    last48Hours: [],
    topPages: [],
    topBlogs: [],
    topKeywordHints: [],
    latestEvents: []
  }
}

function topCounts(items, key, limit = 8){
  const counts = new Map()
  for(const item of items){
    const value = item[key]
    if(!value) continue
    counts.set(value, (counts.get(value) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({value, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function eventCounts(items, limit = 12){
  const counts = new Map()
  for(const item of items){
    counts.set(item.event_name, (counts.get(item.event_name) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([eventName, count]) => ({eventName, count}))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

async function pixelSummary(){
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "").replace(/\/+$/, "")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY || ""
  if(!url || !key) return emptyPixelSummary("missing-supabase-service-config")
  const response = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events?select=event_name,visitor_id,path,blog_slug,keyword_hint,created_at&order=created_at.desc&limit=5000`, {
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`
    }
  })
  const text = await response.text()
  if(!response.ok){
    return emptyPixelSummary(`supabase-pixel-read-failed-${response.status}`)
  }
  let events = []
  try {
    events = text ? JSON.parse(text) : []
  } catch {
    return emptyPixelSummary("pixel-json-parse-failed")
  }
  const cutoff = Date.now() - 48 * 60 * 60 * 1000
  const recent = events.filter((event) => new Date(event.created_at).getTime() >= cutoff)
  const pageViews = events.filter((event) => ["page_view", "blog_view"].includes(event.event_name))
  return {
    ready: true,
    reason: "",
    totalEvents: events.length,
    totalPageViews: pageViews.length,
    totalBlogViews: events.filter((event) => event.event_name === "blog_view").length,
    totalGlbPreviewPlays: events.filter((event) => event.event_name === "glb_preview_play").length,
    totalSearchRuns: events.filter((event) => event.event_name === "search_run").length,
    totalWalletClicks: events.filter((event) => event.event_name === "wallet_connect_click").length,
    totalTierClicks: events.filter((event) => event.event_name === "tier_click").length,
    totalNodeClicks: events.filter((event) => event.event_name === "node_click").length,
    uniqueVisitors: new Set(events.map((event) => event.visitor_id).filter(Boolean)).size,
    last48Hours: eventCounts(recent),
    topPages: topCounts(pageViews, "path"),
    topBlogs: topCounts(events.filter((event) => event.blog_slug), "blog_slug"),
    topKeywordHints: topCounts(events.filter((event) => event.keyword_hint), "keyword_hint"),
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
      "real asset play events",
      "real GLB render-complete events",
      "Supabase-backed ratings and comments",
      "external backlink confirmations",
      "Search Console impressions and clicks",
      "node unlock progress by account",
      "payment verification receipts",
      "Farcaster casts created",
      "decentralized stream sessions",
      "community edit proposals",
      "API discoveries captured into Supabase"
    ]
  }
  res.setHeader("Cache-Control", "no-store")
  return res.status(200).json(payload)
}
