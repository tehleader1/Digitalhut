import {handleAudienceLive} from "./_audience-snapshot.js"
import {evaluateGapOrchestration} from "../config/gap-orchestration.mjs"

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
  ["alpaca", ["ALPACA_API_KEY", "ALPACA_SECRET_KEY"], "stock-and-options-print-flow"]
  ,["farcaster", ["FARCASTER_API_KEY", "NEYNAR_API_KEY", "FARCASTER_HUB_URL"], "decentralized-social-distribution"]
  ,["decentralized-streaming", ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"], "streaming-network-distribution"]
  ,["liquidity-contracts", ["DIGITALHUT_LIQUIDITY_CONTRACT", "DIGITALHUT_TREASURY_WALLET", "BASE_LIQUIDITY_POOL_ADDRESS"], "smart-contract-liquidity"]
  ,["wiki-editing", ["DIGITALHUT_EDITOR_MODE", "SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_CONTENT_REVIEW_KEY"], "community-edit-main-version-control"]
  ,["api-capture", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"], "api-glb-discovery-capture"]
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

const freshAudienceBaseline = {
  capturedAt: "2026-07-09T07:16:06.858Z",
  reason: "Old pocket put to the side. Fresh audience reads only report movement above this baseline.",
  pageViews: 319,
  uniqueVisitors: 117,
  totalEvents: 536,
  glb: 83,
  podcast: 13,
  autoplay: 5,
  searches: 2,
  market: 5,
  proof: 0,
  source: 0,
  blogViews: 28,
  masterKeywordDoorEvents: 68
}

function configured(keys){
  return keys.filter((key) => Boolean(envValue(key)))
}

function envValue(key){
  return String(process.env[key] || "").replace(/^['"]|['"]$/g, "").trim()
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

function envUrlDetails(...keys){
  const configuredKeys = []
  const invalidKeys = []
  for(const key of keys){
    const value = envValue(key)
    if(!value) continue
    configuredKeys.push(key)
    try {
      const parsed = new URL(value)
      if(["http:", "https:"].includes(parsed.protocol)){
        return {
          ready: true,
          selectedKey: key,
          host: parsed.host,
          configuredKeys,
          invalidKeys
        }
      }
      invalidKeys.push(key)
    } catch {
      invalidKeys.push(key)
    }
  }
  return {
    ready: false,
    selectedKey: "",
    host: "",
    configuredKeys,
    invalidKeys
  }
}

function requestTimeoutSignal(ms = 9000){
  if(typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"){
    return AbortSignal.timeout(ms)
  }
  return undefined
}

async function supabaseRestJson(url, key, path, options = {}){
  const response = await fetch(`${url}/rest/v1/${path}`, {
    signal: requestTimeoutSignal(options.timeoutMs || 9000),
    method: options.method || "GET",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  const text = await response.text()
  if(!response.ok){
    throw new Error(`supabase-rest-${response.status}-${text.slice(0, 140)}`)
  }
  return text ? JSON.parse(text) : null
}

async function readPixelSummaryLayer(url, key){
  try {
    return await supabaseRestJson(url, key, "rpc/digitalhut_search_pixel_summary_read", {
      method: "POST",
      body: {p_location_limit: 16}
    })
  } catch (error) {
    return {ready: false, reason: error?.message || "summary-layer-read-failed"}
  }
}

async function readLegacyMasterListAttribution(url, key){
  try {
    return await supabaseRestJson(url, key, "rpc/digitalhut_search_pixel_master_list_legacy_read", {
      method: "POST",
      body: {p_location_limit: 24}
    })
  } catch (error) {
    return {ready: false, reason: error?.message || "legacy-master-list-attribution-read-failed"}
  }
}

function numberValue(value){
  return Number(value || 0)
}

function totalsFromSummaryLayer(layer = {}, fallback = {}){
  const global = layer.global || {}
  return {
    pageViews: numberValue(global.page_views ?? fallback.pageViews),
    blogViews: numberValue(global.blog_views ?? fallback.blogViews),
    searchRuns: numberValue(global.search_runs ?? fallback.searchRuns),
    intentSelections: numberValue(global.intent_selections ?? fallback.intentSelections),
    proofRouteOpens: numberValue(global.proof_route_opens ?? fallback.proofRouteOpens),
    sourceOpens: numberValue(global.source_opens ?? fallback.sourceOpens),
    autoplayStarts: numberValue(global.autoplay_starts ?? fallback.autoplayStarts),
    autoplayPauses: numberValue(global.autoplay_pauses ?? fallback.autoplayPauses),
    episodeShifts: numberValue(global.episode_shifts ?? fallback.episodeShifts),
    podcastInterrupts: numberValue(global.podcast_interrupts ?? fallback.podcastInterrupts),
    glbPreviewPlays: numberValue(global.glb_preview_plays ?? fallback.glbPreviewPlays),
    glbReplicaPlays: numberValue(global.glb_replica_plays ?? fallback.glbReplicaPlays),
    timelineScrubs: numberValue(global.timeline_scrubs ?? fallback.timelineScrubs),
    marketOpens: numberValue(global.market_opens ?? fallback.marketOpens)
  }
}

function supabaseApiUrl(){
  return envUrl("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
}

function supabaseDiagnostics(){
  const url = envUrlDetails("SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
  const serviceKeys = configured(["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"])
  const publicKeys = configured(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"])
  return {
    urlReady: url.ready,
    selectedUrlKey: url.selectedKey,
    host: url.host,
    configuredUrlKeys: url.configuredKeys,
    invalidUrlKeys: url.invalidKeys,
    serviceKeyReady: serviceKeys.length > 0,
    serviceKeyNames: serviceKeys,
    publicKeyReady: publicKeys.length > 0,
    publicKeyNames: publicKeys
  }
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

function providerReady(stack, id){
  return Boolean(stack?.providers?.find((provider) => provider.id === id)?.configured)
}

function movementDuplicatorFor(freshAudience = {}, pixel = {}){
  const delta = freshAudience?.delta || {}
  const moved = Object.entries(delta)
    .filter(([, value]) => Number(value || 0) > 0)
    .map(([id, value]) => ({id, value: Number(value || 0)}))
  const proofSourceLift = Number(delta.proof || 0) + Number(delta.source || 0)
  const secondActionLift = Number(delta.glb || 0) + Number(delta.podcast || 0) + Number(delta.autoplay || 0) + Number(delta.searches || 0) + Number(delta.market || 0)
  const entryLift = Number(delta.pageViews || 0) + Number(delta.uniqueVisitors || 0) + Number(delta.totalEvents || 0)
  let decision = "standby-listen"
  let repeatShout = "Hold the full-system entertainment dapp angle and listen for the first fresh movement."
  let nextLane = "full entertainment observatory"

  if(proofSourceLift > 0){
    decision = "duplicate-proof-source-hit"
    nextLane = "proof/source bridge"
    repeatShout = "Duplicate the exact route, source, and backlink wording that produced the proof/source hit."
  } else if(secondActionLift > 0){
    decision = "duplicate-second-action"
    if(Number(delta.glb || 0) > 0) nextLane = "3D Model View full-system angle"
    else if(Number(delta.podcast || 0) > 0) nextLane = "podcast/source moment full-system angle"
    else if(Number(delta.autoplay || 0) > 0) nextLane = "autoplay episode flow"
    else if(Number(delta.searches || 0) > 0) nextLane = "search/research explainer"
    else nextLane = "market observatory quick lane"
    repeatShout = `Repeat the ${nextLane} wording, then cast one adjacent full-system route.`
  } else if(entryLift > 0){
    decision = "weak-entry-movement"
    nextLane = "entry-to-second-action bridge"
    repeatShout = "Keep the visitor pocket, but shift the next shout toward GLB play, podcast interrupt, autoplay, search, or proof/source open."
  }

  return {
    status: "sensitive-movement-duplicator",
    decision,
    moved,
    nextLane,
    repeatShout,
    watchSensitivity: "any fresh delta above the side-pocket baseline is treated as movement",
    strongestHitMarker: proofSourceLift > 0 ? "proof-source" : secondActionLift > 0 ? "second-action" : entryLift > 0 ? "entry" : "none-yet",
    routeCandidates: freshAudience?.routeCandidates || [],
    currentProofSourceState: {
      proofRouteOpens: Number(pixel?.interactionTotals?.proofRouteOpens || 0),
      sourceOpens: Number(pixel?.interactionTotals?.sourceOpens || 0)
    }
  }
}

function wholeSystemSignalFor({stack = {}, pixel = {}, diagnostics = {}} = {}){
  const freshAudience = pixel?.freshAudience || {}
  const interactionTotals = pixel?.interactionTotals || {}
  const glbPlays = Number(pixel?.totalGlbPreviewPlays || 0) + Number(pixel?.totalGlbReplicaPlays || 0)
  const rendererSignals = [
    {id: "youtube-video", label: "YouTube episode presentation", status: "live"},
    {id: "glb-model-view", label: "3D Model View and GLB renderer", status: glbPlays > 0 ? "recording-plays" : "ready-for-play-events"},
    {id: "podcast-source-moment", label: "Podcast/source interruption lane", status: Number(pixel?.totalPodcastInterrupts || 0) > 0 ? "recording-interrupts" : "ready-for-interrupts"},
    {id: "live-analytics", label: "Live analytics overlay and timeline reads", status: Number(pixel?.totalTimelineScrubs || 0) > 0 ? "recording-timeline" : "ready"}
  ]
  const databaseSignals = [
    {id: "supabase-events", label: "Supabase search pixel and event database", status: pixel?.ready ? "recording" : "not-ready"},
    {id: "supabase-rollup", label: "Supabase rollup summary layer", status: pixel?.summaryLayerReady ? "active" : "raw-event-fallback"},
    {id: "fresh-audience", label: "Fresh audience delta above side-pocket baseline", status: freshAudience?.decision || "unknown"}
  ]
  const seoSignals = [
    {id: "master-keyword-universe", label: "200,572,944 internal longtail ownership universe", status: "internal-scoring-universe"},
    {id: "public-sitemap-sample", label: "50,000 selected public sitemap keyword rows", status: "public-crawl-sample"},
    {id: "proof-source-bridge", label: "Proof/source route bridge", status: Number(interactionTotals.proofRouteOpens || 0) + Number(interactionTotals.sourceOpens || 0) > 0 ? "traffic-hit" : "waiting-for-hit-marker"},
    {id: "rank-guardrail", label: "Google rank claims", status: "requires-search-console-query-rows"}
  ]
  return {
    status: "whole-stack-signaling",
    title: "DigitalHut full entertainment observatory stack",
    plainEnglish: "Video watching, 3D Model View, podcast/source moments, live analytics, Supabase recording, SEO route structure, Vercel deployment, and FireCuda mapping are reported as one system.",
    operatingPosition: "full entertainment rendering plus database recording plus SEO structure",
    stackLanes: {
      entertainmentRendering: rendererSignals,
      databaseRecording: databaseSignals,
      seoStructure: seoSignals,
      infrastructure: [
        {id: "vercel", label: "Vercel production runtime", status: providerReady(stack, "vercel") ? "live" : "not-detected"},
        {id: "supabase", label: "Supabase database", status: diagnostics?.supabase?.urlReady ? "connected" : "not-connected"},
        {id: "google-search-console", label: "Google sitemap/search-console surface", status: "sitemap-and-query-row-watch"},
        {id: "firecuda", label: "FireCuda innovation/mapping layer", status: providerReady(stack, "firecuda-storage") ? "asset-base-configured" : "strategy-layer"},
        {id: "github", label: "GitHub code/proof history", status: "source-control-proof-layer"}
      ]
    },
    freshRead: {
      decision: freshAudience?.decision || "unknown",
      delta: freshAudience?.delta || {},
      nextTarget: freshAudience?.nextTarget || "Keep watching for proof/source opens and second-action movement."
    },
    movementDuplicator: movementDuplicatorFor(freshAudience, pixel),
    guardrails: [
      "Do not treat archived side-pocket totals as fresh audience movement.",
      "Do not claim Google rank movement until Search Console query rows exist.",
      "Do not touch UI unless live data shows a real product bottleneck."
    ]
  }
}

function currentMode(){
  const firecudaEnabled = process.env.ENABLE_FIRECUDA_ASSETS === "true"
  const supabaseReady = Boolean(supabaseApiUrl())
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
  const url = supabaseApiUrl()
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY")
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
  const interactionTotals = {
    pageViews: 0,
    blogViews: 0,
    searchRuns: 0,
    intentSelections: 0,
    proofRouteOpens: 0,
    sourceOpens: 0,
    autoplayStarts: 0,
    autoplayPauses: 0,
    episodeShifts: 0,
    podcastInterrupts: 0,
    glbPreviewPlays: 0,
    glbReplicaPlays: 0,
    timelineScrubs: 0,
    marketOpens: 0
  }
  return {
    ready: false,
    reason,
    totalEvents: 0,
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
    totalZoneCheckpointOpens: 0,
    totalMasterKeywordDoorEvents: 0,
    totalSearchRuns: interactionTotals.searchRuns,
    totalWalletClicks: 0,
    totalTierClicks: 0,
    totalNodeClicks: 0,
    uniqueVisitors: 0,
    interactionTotals,
    freshAudience: freshAudienceRead({
      totalEvents: 0,
      uniqueVisitors: 0,
      interactionTotals,
      masterKeywordDoorEvents: 0,
      trafficRows: []
    }),
    summaryLine: reason ? `Pixel counts unavailable: ${reason}` : "Pixel counts unavailable.",
    last48Hours: [],
    topPages: [],
    topBlogs: [],
    topContentPulls: [],
    topCheckpointZones: [],
    topMasterKeywordLanes: [],
    trafficLocationMap: [],
    secondActionLocations: [],
    liveClientQuestions: [],
    originBuckets: [],
    exploitableMovement: {},
    topKeywordHints: [],
    latestEvents: []
  }
}

function positiveDelta(value, baseline){
  return Math.max(0, numberValue(value) - numberValue(baseline))
}

const wholeSystemLane = "DigitalHut 200M SEO Master List"
const wholeSystemBridgeSlug = "digitalhut-200m-seo-master-list"

function laneSlug(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function canonicalLane(lane, path = "/"){
  const raw = String(lane || "").trim()
  if(raw && raw !== "unassigned-lane") return raw
  return wholeSystemLane
}

function sourceBridgeForLane(lane, path = "/"){
  const slug = lane === wholeSystemLane ? wholeSystemBridgeSlug : laneSlug(lane) || wholeSystemBridgeSlug
  return `/source-bridge?lane=${encodeURIComponent(lane || wholeSystemLane)}&source=door-trail#${slug}`
}

function sourceEvidenceForLane(lane){
  return `/digitalhut-proof-source-conversion-bridge.json#${lane === wholeSystemLane ? wholeSystemBridgeSlug : laneSlug(lane) || wholeSystemBridgeSlug}`
}

function proofRouteForFreshRow(row = {}){
  const lane = canonicalLane(row.lane, row.path)
  if(lane === wholeSystemLane) return "/system-proof"
  if(row.path && row.path !== "/") return row.path
  const slug = laneSlug(lane)
  return `/watch/${slug || "full-view-episode-alternative"}`
}

function freshDeltaFor({totalEvents = 0, uniqueVisitors = 0, interactionTotals = {}, masterKeywordDoorEvents = 0} = {}){
  return {
    pageViews: positiveDelta(interactionTotals.pageViews, freshAudienceBaseline.pageViews),
    uniqueVisitors: positiveDelta(uniqueVisitors, freshAudienceBaseline.uniqueVisitors),
    totalEvents: positiveDelta(totalEvents, freshAudienceBaseline.totalEvents),
    glb: positiveDelta((interactionTotals.glbPreviewPlays || 0) + (interactionTotals.glbReplicaPlays || 0), freshAudienceBaseline.glb),
    podcast: positiveDelta(interactionTotals.podcastInterrupts, freshAudienceBaseline.podcast),
    autoplay: positiveDelta(interactionTotals.autoplayStarts, freshAudienceBaseline.autoplay),
    searches: positiveDelta(interactionTotals.searchRuns, freshAudienceBaseline.searches),
    market: positiveDelta(interactionTotals.marketOpens, freshAudienceBaseline.market),
    proof: positiveDelta(interactionTotals.proofRouteOpens, freshAudienceBaseline.proof),
    source: positiveDelta(interactionTotals.sourceOpens, freshAudienceBaseline.source),
    blogViews: positiveDelta(interactionTotals.blogViews, freshAudienceBaseline.blogViews),
    masterKeywordDoorEvents: positiveDelta(masterKeywordDoorEvents, freshAudienceBaseline.masterKeywordDoorEvents)
  }
}

function freshDecisionFor(delta = {}){
  if(delta.proof > 0 || delta.source > 0) return "fresh-proof-source-hit"
  if(delta.glb > 0 || delta.podcast > 0 || delta.autoplay > 0 || delta.searches > 0 || delta.market > 0) return "fresh-second-action-lift"
  if(delta.pageViews > 0 || delta.uniqueVisitors > 0 || delta.totalEvents > 0 || delta.blogViews > 0 || delta.masterKeywordDoorEvents > 0) return "fresh-weak-page-lift"
  return "no-fresh-movement-yet"
}

function freshAudienceRead({totalEvents = 0, uniqueVisitors = 0, interactionTotals = {}, masterKeywordDoorEvents = 0, trafficRows = []} = {}){
  const delta = freshDeltaFor({totalEvents, uniqueVisitors, interactionTotals, masterKeywordDoorEvents})
  const decision = freshDecisionFor(delta)
  const secondActionDelta = delta.glb + delta.podcast + delta.autoplay + delta.searches + delta.market
  const routeCandidates = (Array.isArray(trafficRows) ? trafficRows : [])
    .slice(0, 8)
    .map((row) => {
      const lane = canonicalLane(row.lane, row.path)
      return {
        lane,
        origin: row.origin || "unknown",
        path: row.path || "/",
        visitors: numberValue(row.visitors),
        pageViews: numberValue(row.pageViews),
        secondActions: numberValue(row.secondActions),
        proofRouteOpens: numberValue(row.proofRouteOpens),
        sourceOpens: numberValue(row.sourceOpens),
        nextRoute: proofRouteForFreshRow({...row, lane}),
        sourceBridge: sourceBridgeForLane(lane, row.path),
        sourceEvidence: sourceEvidenceForLane(lane)
      }
    })
  const firstUsefulRoute = routeCandidates[0] || {
    lane: wholeSystemLane,
    nextRoute: "/system-proof",
    sourceBridge: sourceBridgeForLane(wholeSystemLane),
    sourceEvidence: sourceEvidenceForLane(wholeSystemLane)
  }
  return {
    status: "fresh-audience-live-read",
    baseline: freshAudienceBaseline,
    delta,
    decision,
    secondActionDelta,
    notify: decision === "fresh-proof-source-hit",
    summary: decision === "no-fresh-movement-yet"
      ? "Fresh audience movement is still zero above the side-pocket baseline."
      : `${decision}: ${delta.pageViews} fresh page views, ${delta.uniqueVisitors} fresh visitors, ${delta.totalEvents} fresh events, ${secondActionDelta} fresh second actions, ${delta.proof} proof opens, ${delta.source} source opens.`,
    nextTarget: decision === "fresh-proof-source-hit"
      ? "Stack the lane that opened proof/source."
      : decision === "fresh-second-action-lift"
        ? "Keep the full-system lane and route the lifted arm into proof/source."
        : decision === "fresh-weak-page-lift"
          ? "Route new page-view movement into full-system proof before expanding another lane."
          : "Wait for new movement; next route remains full-system proof plus source bridge.",
    routeCandidates
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

function pathUrl(event = {}){
  try {
    return new URL(String(event.path || "/"), "https://www.digitalhut.app")
  } catch {
    return new URL("/", "https://www.digitalhut.app")
  }
}

function routeSlugForEvent(event = {}){
  const pathname = pathUrl(event).pathname
  const match = pathname.match(/^\/(?:watch|category|blog|zone)\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : ""
}

function masterKeywordForEvent(event = {}){
  const url = pathUrl(event)
  const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {}
  const masterKeyword = metadata.masterKeyword && typeof metadata.masterKeyword === "object" ? metadata.masterKeyword : {}
  const lane = url.searchParams.get("dh_lane") || masterKeyword.lane || event.category || ""
  const globalRank = url.searchParams.get("dh_global_rank") || masterKeyword.globalRank || ""
  const rank = url.searchParams.get("dh_rank") || masterKeyword.rank || ""
  const query = url.searchParams.get("dh_query") || masterKeyword.query || event.keyword_hint || ""
  return {
    lane: String(lane || ""),
    globalRank: String(globalRank || ""),
    rank: String(rank || ""),
    query: String(query || ""),
    isMasterKeywordDoor: Boolean(lane || globalRank || query || metadata.seoClaim?.rankUrl)
  }
}

function masterKeywordDoorReason(event = {}){
  const url = pathUrl(event)
  const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {}
  const masterKeyword = metadata.masterKeyword && typeof metadata.masterKeyword === "object" ? metadata.masterKeyword : {}
  if(url.searchParams.get("dh_global_rank") || url.searchParams.get("dh_rank")) return "ranked-master-keyword-url"
  if(url.searchParams.get("dh_lane") || url.searchParams.get("dh_query")) return "master-keyword-url-params"
  if(masterKeyword.source === "site-wide-master-list-entry") return "site-wide-master-list-entry"
  if(masterKeyword.lane || masterKeyword.query || masterKeyword.globalRank || masterKeyword.rank) return "metadata-master-keyword"
  if(metadata.seoClaim?.rankUrl) return "seo-claim-rank-url"
  if(event.category) return "event-category-lane"
  if(event.keyword_hint) return "keyword-hint-door"
  return "not-master-keyword-door"
}

function masterKeywordDoorTrail(events, limit = 16){
  const rows = new Map()
  for(const event of events){
    const keyword = masterKeywordForEvent(event)
    if(!keyword.isMasterKeywordDoor) continue
    const pathname = pathUrl(event).pathname || "/"
    const reason = masterKeywordDoorReason(event)
    const origin = originBucketFor(event)
    const lane = canonicalLane(keyword.lane || event.category || routeSlugForEvent(event), pathname)
    const key = `${origin}::${pathname}::${lane}::${reason}`
    const row = rows.get(key) || {
      origin,
      path: pathname,
      lane,
      reason,
      events: 0,
      visitors: new Set(),
      latest: "",
      pageViews: 0,
      secondActions: 0,
      proofRouteOpens: 0,
      sourceOpens: 0,
      sampleEvents: new Set(),
      sampleQueries: new Set(),
      nextProofRoute: "/system-proof",
      nextSourceBridge: sourceBridgeForLane(lane, pathname),
      nextSourceEvidence: sourceEvidenceForLane(lane)
    }
    row.events += 1
    if(event.visitor_id) row.visitors.add(event.visitor_id)
    if(["page_view", "blog_view"].includes(event.event_name)) row.pageViews += 1
    if(["glb_preview_play", "glb_preview_open", "glb_replica_play", "viral_glb_proof_play", "podcast_interrupt_play", "podcast_interrupt_start", "viral_podcast_source_start", "autoplay_start", "episode_preview_autoplay_start", "search_run", "youtube_search_submit", "market_view_open", "market_panel_open", "ticker_search"].includes(event.event_name)) row.secondActions += 1
    if(["zone_checkpoint_open", "proof_route_open", "watch_route_open", "blog_route_open", "category_proof_open", "viral_watch_route_open", "viral_source_route_open"].includes(event.event_name)) row.proofRouteOpens += 1
    if(["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"].includes(event.event_name)) row.sourceOpens += 1
    if(row.sampleEvents.size < 5) row.sampleEvents.add(event.event_name)
    if(keyword.query && row.sampleQueries.size < 4) row.sampleQueries.add(keyword.query)
    if(!row.latest || String(event.created_at || "") > row.latest) row.latest = String(event.created_at || "")
    rows.set(key, row)
  }
  return [...rows.values()]
    .map((row) => ({
      origin: row.origin,
      path: row.path,
      lane: row.lane,
      reason: row.reason,
      events: row.events,
      visitors: row.visitors.size,
      pageViews: row.pageViews,
      secondActions: row.secondActions,
      proofRouteOpens: row.proofRouteOpens,
      sourceOpens: row.sourceOpens,
      latest: row.latest,
      sampleEvents: [...row.sampleEvents],
      sampleQueries: [...row.sampleQueries],
      nextProofRoute: row.nextProofRoute,
      nextSourceBridge: row.nextSourceBridge,
      nextSourceEvidence: row.nextSourceEvidence,
      nextAction: row.proofRouteOpens || row.sourceOpens
        ? "Duplicate this exact door trail because it already reached proof/source."
        : row.secondActions
          ? "Route this door trail into proof/source while preserving the same full-system topic."
          : "Keep this as an entry pocket and push toward a second action before expanding it."
    }))
    .sort((a, b) => (b.proofRouteOpens + b.sourceOpens) - (a.proofRouteOpens + a.sourceOpens) || b.secondActions - a.secondActions || b.events - a.events)
    .slice(0, limit)
}

function masterKeywordDoorSourceSummary(events){
  const rows = new Map()
  for(const event of events){
    const keyword = masterKeywordForEvent(event)
    if(!keyword.isMasterKeywordDoor) continue
    const reason = masterKeywordDoorReason(event)
    const row = rows.get(reason) || {reason, events: 0, visitors: new Set()}
    row.events += 1
    if(event.visitor_id) row.visitors.add(event.visitor_id)
    rows.set(reason, row)
  }
  return [...rows.values()]
    .map((row) => ({reason: row.reason, events: row.events, visitors: row.visitors.size}))
    .sort((a, b) => b.events - a.events || a.reason.localeCompare(b.reason))
}

function topCheckpointZones(events, limit = 8){
  const rows = new Map()
  for(const event of events){
    const pathname = pathUrl(event).pathname
    if(!pathname.startsWith("/zone/")) continue
    const zone = routeSlugForEvent(event)
    const row = rows.get(zone) || {zone, path: `/zone/${zone}`, events: 0, visitors: new Set(), latest: ""}
    row.events += 1
    if(event.visitor_id) row.visitors.add(event.visitor_id)
    if(!row.latest || String(event.created_at || "") > row.latest) row.latest = String(event.created_at || "")
    rows.set(zone, row)
  }
  return [...rows.values()]
    .map((row) => ({zone: row.zone, path: row.path, events: row.events, visitors: row.visitors.size, latest: row.latest}))
    .sort((a, b) => b.events - a.events || a.zone.localeCompare(b.zone))
    .slice(0, limit)
}

function topMasterKeywordLanes(events, limit = 10){
  const rows = new Map()
  for(const event of events){
    const keyword = masterKeywordForEvent(event)
    const pathname = pathUrl(event).pathname
    if(!keyword.isMasterKeywordDoor && !pathname.startsWith("/zone/")) continue
    const lane = keyword.lane || routeSlugForEvent(event) || "unassigned-lane"
    const row = rows.get(lane) || {
      lane,
      events: 0,
      visitors: new Set(),
      pageViews: 0,
      proofOpens: 0,
      sourceOpens: 0,
      glbPlays: 0,
      podcastInterrupts: 0,
      searches: 0,
      sampleQueries: new Set()
    }
    row.events += 1
    if(event.visitor_id) row.visitors.add(event.visitor_id)
    if(["page_view", "blog_view"].includes(event.event_name)) row.pageViews += 1
    if(["zone_checkpoint_open", "proof_route_open", "watch_route_open", "blog_route_open", "category_proof_open", "viral_watch_route_open", "viral_source_route_open"].includes(event.event_name)) row.proofOpens += 1
    if(["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"].includes(event.event_name)) row.sourceOpens += 1
    if(["glb_preview_play", "glb_preview_open", "glb_replica_play", "viral_glb_proof_play"].includes(event.event_name)) row.glbPlays += 1
    if(["podcast_interrupt_play", "podcast_interrupt_start", "viral_podcast_source_start"].includes(event.event_name)) row.podcastInterrupts += 1
    if(["search_run", "youtube_search_submit"].includes(event.event_name)) row.searches += 1
    if(keyword.query && row.sampleQueries.size < 4) row.sampleQueries.add(keyword.query)
    rows.set(lane, row)
  }
  return [...rows.values()]
    .map((row) => ({
      lane: row.lane,
      events: row.events,
      visitors: row.visitors.size,
      pageViews: row.pageViews,
      proofOpens: row.proofOpens,
      sourceOpens: row.sourceOpens,
      glbPlays: row.glbPlays,
      podcastInterrupts: row.podcastInterrupts,
      searches: row.searches,
      sampleQueries: [...row.sampleQueries]
    }))
    .sort((a, b) => b.events - a.events || b.proofOpens - a.proofOpens || a.lane.localeCompare(b.lane))
    .slice(0, limit)
}

function contentPullFor(event = {}){
  const text = [
    event.keyword_hint,
    event.category,
    event.path,
    event.blog_slug,
    event.asset_id
  ].filter(Boolean).join(" ").toLowerCase()

  if(/\b(nvda|nvidia|spy|stock|stocks|market|ticker|options|trading|bullish|bearish)\b/.test(text)){
    return "Market Observatory"
  }
  if(/\b(horror|corridor|vr|game|gaming|gamer|city|medieval|sci fi|sci-fi|modular|asset pack|environment|world|glb|3d model|model view|viewer)\b/.test(text)){
    return "Gaming And 3D Environment Viewer"
  }
  if(/\b(podcast|source|youtube|video|transcript|summary|explainer|autoplay|episode)\b/.test(text)){
    return "AI Video Podcast Source Explainer"
  }
  if(/\b(home|house|real estate|room|resort|vacation|travel|tour|walkthrough|spatial|virtual)\b/.test(text)){
    return "Spatial Home Travel And Real Estate Experience"
  }
  if(/\b(research|study|wiki|developer|programmer|engineer|coral|climate|planet|data)\b/.test(text)){
    return "Research Developer Source Observatory"
  }
  if(/\b(lunch|food|grocery|uber|rideshare|flight|review|funny|reel|social)\b/.test(text)){
    return "Everyday Life Visual Search"
  }
  return "Full Entertainment Observatory Alternative"
}

function topContentPulls(events, limit = 8){
  const counts = new Map()
  for(const event of events){
    const contentPull = contentPullFor(event)
    const row = counts.get(contentPull) || {contentPull, count: 0, sampleHints: new Set()}
    row.count += 1
    if(event.keyword_hint && row.sampleHints.size < 4) row.sampleHints.add(event.keyword_hint)
    counts.set(contentPull, row)
  }
  return [...counts.values()]
    .map((row) => ({
      contentPull: row.contentPull,
      count: row.count,
      sampleHints: [...row.sampleHints]
    }))
    .sort((a, b) => b.count - a.count || a.contentPull.localeCompare(b.contentPull))
    .slice(0, limit)
}

function originBucketFor(event = {}){
  const referrer = String(event.referrer || "").toLowerCase()
  const userAgent = String(event.user_agent || "").toLowerCase()
  if(/bot|crawl|spider|slurp|bingpreview|google-inspectiontool/.test(userAgent)) return "crawler-or-search-inspection"
  if(referrer.includes("codex-overseer") || referrer.includes("codex-test")) return "codex-overseer-test"
  if(referrer.includes("vercel.com") || referrer.includes("v0-nft-time-capsule-dapp.vercel.app")) return "vercel-preview-or-deploy"
  if(referrer.includes("digitalhut.app")) return "digitalhut-internal-navigation"
  if(!referrer) return "direct-or-private-referrer"
  return "external-referrer"
}

function originBuckets(events, limit = 8){
  const counts = new Map()
  for(const event of events){
    const bucket = originBucketFor(event)
    const row = counts.get(bucket) || {bucket, events: 0, visitors: new Set()}
    row.events += 1
    if(event.visitor_id) row.visitors.add(event.visitor_id)
    counts.set(bucket, row)
  }
  return [...counts.values()]
    .map((row) => ({bucket: row.bucket, events: row.events, visitors: row.visitors.size}))
    .sort((a, b) => b.events - a.events || a.bucket.localeCompare(b.bucket))
    .slice(0, limit)
}

function movementTotals(events){
  return {
    events: events.length,
    visitors: new Set(events.map((event) => event.visitor_id).filter(Boolean)).size,
    pageViews: events.filter((event) => ["page_view", "blog_view"].includes(event.event_name)).length,
    glbPreviewPlays: countEvents(events, ["glb_preview_play", "glb_preview_open"]),
    podcastInterrupts: countEvents(events, ["podcast_interrupt_play", "podcast_interrupt_start", "viral_podcast_source_start"]),
    autoplayStarts: countEvents(events, ["autoplay_start", "episode_preview_autoplay_start"]),
    searches: countEvents(events, ["search_run", "youtube_search_submit"]),
    marketOpens: countEvents(events, ["market_view_open", "market_panel_open", "ticker_search"]),
    proofRouteOpens: countEvents(events, ["zone_checkpoint_open", "proof_route_open", "watch_route_open", "blog_route_open", "category_proof_open", "viral_watch_route_open", "viral_source_route_open"]),
    sourceOpens: countEvents(events, ["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"])
  }
}

function exploitableMovement(events){
  const publicCandidateEvents = events.filter((event) => {
    const bucket = originBucketFor(event)
    return ["direct-or-private-referrer", "external-referrer", "digitalhut-internal-navigation"].includes(bucket)
  })
  const previewOrTestEvents = events.filter((event) => {
    const bucket = originBucketFor(event)
    return ["vercel-preview-or-deploy", "codex-overseer-test", "crawler-or-search-inspection"].includes(bucket)
  })
  const publicTotals = movementTotals(publicCandidateEvents)
  const previewTotals = movementTotals(previewOrTestEvents)
  const strongestPublicPull = topContentPulls(publicCandidateEvents, 1)[0]?.contentPull || "none-yet"
  const repeatableSignal = publicTotals.glbPreviewPlays > 0 || publicTotals.podcastInterrupts > 0 || publicTotals.autoplayStarts > 0 || publicTotals.searches > 0
  return {
    decision: repeatableSignal ? "duplicate-full-system-movement" : "keep-casting-full-system-lane",
    strongestPublicPull,
    publicCandidate: publicTotals,
    previewOrTest: previewTotals,
    nextMeasure: "Track whether direct/private or external visitors repeat GLB, podcast, autoplay, search, proof, or source actions after the generalized full-system pull is deployed."
  }
}

function locationKeyFor(event = {}){
  const pathname = pathUrl(event).pathname || "/"
  const origin = originBucketFor(event)
  const keyword = masterKeywordForEvent(event)
  const lane = canonicalLane(keyword.lane || routeSlugForEvent(event) || event.category, pathname)
  return `${origin}::${pathname}::${lane}`
}

function locationRowFor(event = {}){
  const pathname = pathUrl(event).pathname || "/"
  const keyword = masterKeywordForEvent(event)
  const lane = canonicalLane(keyword.lane || routeSlugForEvent(event) || event.category, pathname)
  return {
    origin: originBucketFor(event),
    path: pathname,
    lane,
    latest: "",
    events: 0,
    visitors: new Set(),
    pageViews: 0,
    glbPreviewPlays: 0,
    podcastInterrupts: 0,
    autoplayStarts: 0,
    searches: 0,
    marketOpens: 0,
    proofRouteOpens: 0,
    sourceOpens: 0,
    sampleEvents: new Set(),
    sampleQueries: new Set(),
    sampleReferrers: new Set()
  }
}

function addEventToLocation(row, event = {}){
  const keyword = masterKeywordForEvent(event)
  row.events += 1
  if(event.visitor_id) row.visitors.add(event.visitor_id)
  if(["page_view", "blog_view"].includes(event.event_name)) row.pageViews += 1
  if(["glb_preview_play", "glb_preview_open", "glb_replica_play", "viral_glb_proof_play"].includes(event.event_name)) row.glbPreviewPlays += 1
  if(["podcast_interrupt_play", "podcast_interrupt_start", "viral_podcast_source_start"].includes(event.event_name)) row.podcastInterrupts += 1
  if(["autoplay_start", "episode_preview_autoplay_start"].includes(event.event_name)) row.autoplayStarts += 1
  if(["search_run", "youtube_search_submit"].includes(event.event_name)) row.searches += 1
  if(["market_view_open", "market_panel_open", "ticker_search"].includes(event.event_name)) row.marketOpens += 1
  if(["zone_checkpoint_open", "proof_route_open", "watch_route_open", "blog_route_open", "category_proof_open", "viral_watch_route_open", "viral_source_route_open"].includes(event.event_name)) row.proofRouteOpens += 1
  if(["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"].includes(event.event_name)) row.sourceOpens += 1
  if(row.sampleEvents.size < 5) row.sampleEvents.add(event.event_name)
  if(keyword.query && row.sampleQueries.size < 3) row.sampleQueries.add(keyword.query)
  if(event.referrer && row.sampleReferrers.size < 3) row.sampleReferrers.add(event.referrer)
  if(!row.latest || String(event.created_at || "") > row.latest) row.latest = String(event.created_at || "")
}

function publicSignalScore(row){
  return (
    row.proofRouteOpens * 80 +
    row.sourceOpens * 90 +
    row.searches * 45 +
    row.glbPreviewPlays * 32 +
    row.podcastInterrupts * 30 +
    row.autoplayStarts * 24 +
    row.marketOpens * 16 +
    row.pageViews * 3 +
    row.visitors.size * 5
  )
}

function trafficLocationMap(events, limit = 16){
  const rows = new Map()
  for(const event of events){
    const key = locationKeyFor(event)
    const row = rows.get(key) || locationRowFor(event)
    addEventToLocation(row, event)
    rows.set(key, row)
  }
  return [...rows.values()]
    .map((row) => ({
      origin: row.origin,
      path: row.path,
      lane: row.lane,
      events: row.events,
      visitors: row.visitors.size,
      pageViews: row.pageViews,
      secondActions: row.glbPreviewPlays + row.podcastInterrupts + row.autoplayStarts + row.searches + row.marketOpens + row.proofRouteOpens + row.sourceOpens,
      glbPreviewPlays: row.glbPreviewPlays,
      podcastInterrupts: row.podcastInterrupts,
      autoplayStarts: row.autoplayStarts,
      searches: row.searches,
      marketOpens: row.marketOpens,
      proofRouteOpens: row.proofRouteOpens,
      sourceOpens: row.sourceOpens,
      publicSignalScore: publicSignalScore(row),
      latest: row.latest,
      sampleEvents: [...row.sampleEvents],
      sampleQueries: [...row.sampleQueries],
      sampleReferrers: [...row.sampleReferrers]
    }))
    .sort((a, b) => b.publicSignalScore - a.publicSignalScore || b.events - a.events || a.path.localeCompare(b.path))
    .slice(0, limit)
}

function secondActionLocations(events, limit = 12){
  return trafficLocationMap(events.filter((event) => !["page_view", "blog_view"].includes(event.event_name)), limit)
    .filter((row) => row.secondActions > 0)
}

function questionTextForEvent(event = {}){
  const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {}
  const entryTrail = metadata.entryTrail && typeof metadata.entryTrail === "object" ? metadata.entryTrail : {}
  const seoClaim = metadata.seoClaim && typeof metadata.seoClaim === "object" ? metadata.seoClaim : {}
  const values = [
    event.search,
    event.keyword_hint,
    entryTrail.sourceText,
    seoClaim.query,
    metadata.query,
    metadata.question
  ]
  return values.map((value) => String(value || "").trim()).find((value) => value.length >= 3) || ""
}

function isLikelyClientQuestion(text = "", event = {}){
  const value = String(text || "").toLowerCase()
  if(["search_run", "youtube_search_submit", "ticker_search"].includes(event.event_name)) return true
  if(value.includes("?")) return true
  return /\b(how|what|why|where|when|who|which|can|should|best|compare|explain|show|find|search|lookup|review|near me|top)\b/.test(value)
}

function helpLaneForQuestion(text = "", event = {}){
  const value = `${text} ${event.category || ""} ${event.path || ""}`.toLowerCase()
  if(/\b(glb|3d|model|vr|game|gaming|world|environment|sketchfab)\b/.test(value)) return "3D Model View / GLB help"
  if(/\b(podcast|speaker|voice|clip|source moment)\b/.test(value)) return "podcast/source moment help"
  if(/\b(stock|market|ticker|company|chart|nvda|spy)\b/.test(value)) return "market observatory help"
  if(/\b(code|developer|programmer|api|cloud|supabase|vercel|infrastructure)\b/.test(value)) return "developer/research help"
  if(/\b(real estate|home|house|property|tour|room|project)\b/.test(value)) return "home/real-estate visual help"
  if(/\b(lunch|food|uber|flight|wiki|review|grocery|errand|near me)\b/.test(value)) return "everyday-life search help"
  return "full entertainment observatory help"
}

function liveClientQuestions(events, limit = 20){
  const rows = new Map()
  for(const event of events){
    const text = questionTextForEvent(event)
    if(!text || !isLikelyClientQuestion(text, event)) continue
    const key = `${text.toLowerCase()}::${event.visitor_id || event.session_id || ""}`
    const row = rows.get(key) || {
      question: text,
      helpLane: helpLaneForQuestion(text, event),
      origin: originBucketFor(event),
      path: pathUrl(event).pathname || "/",
      eventName: event.event_name,
      count: 0,
      visitors: new Set(),
      latest: "",
      status: "needs-helpful-answer",
      nextHelpfulAction: ""
    }
    row.count += 1
    if(event.visitor_id) row.visitors.add(event.visitor_id)
    if(!row.latest || String(event.created_at || "") > row.latest) row.latest = String(event.created_at || "")
    row.nextHelpfulAction = `Answer through ${row.helpLane}: connect the video, 3D model, podcast/source moment, and one useful next route.`
    rows.set(key, row)
  }
  return [...rows.values()]
    .map((row) => ({
      question: row.question,
      helpLane: row.helpLane,
      origin: row.origin,
      path: row.path,
      eventName: row.eventName,
      count: row.count,
      visitors: row.visitors.size,
      latest: row.latest,
      status: row.status,
      nextHelpfulAction: row.nextHelpfulAction
    }))
    .sort((a, b) => b.count - a.count || String(b.latest).localeCompare(String(a.latest)))
    .slice(0, limit)
}

function compactLatestEvent(event = {}){
  const text = questionTextForEvent(event)
  const masterKeyword = masterKeywordForEvent(event)
  return {
    eventName: event.event_name || "",
    path: pathUrl(event).pathname || "/",
    origin: originBucketFor(event),
    lane: masterKeyword.lane || event.category || routeSlugForEvent(event) || "unassigned-lane",
    keywordHint: event.keyword_hint || "",
    surfacedIntent: text,
    helpLane: text ? helpLaneForQuestion(text, event) : "full entertainment observatory help",
    latest: event.created_at || ""
  }
}

function audienceBottlenecks(events, interactionTotals){
  const pageViews = interactionTotals.pageViews || 0
  const uniqueVisitors = new Set(events.map((event) => event.visitor_id).filter(Boolean)).size
  const proofOpens = interactionTotals.proofRouteOpens || 0
  const sourceOpens = interactionTotals.sourceOpens || 0
  const searches = interactionTotals.searchRuns || 0
  const glbTotal = (interactionTotals.glbPreviewPlays || 0) + (interactionTotals.glbReplicaPlays || 0)
  const podcast = interactionTotals.podcastInterrupts || 0
  const topLocations = trafficLocationMap(events, 6)
  const unassigned = topLocations.find((row) => row.lane === "unassigned-lane")
  const warnings = []

  if(pageViews > 100 && proofOpens === 0){
    warnings.push({
      id: "proof-route-not-opening",
      severity: "high",
      message: "Traffic is reaching the system, but nobody is opening proof routes yet.",
      nextAction: "Keep the full entertainment dapp angle and make each search/source trail land on a watch, blog, or category proof route."
    })
  }

  if(pageViews > 100 && sourceOpens === 0){
    warnings.push({
      id: "source-backlink-not-opening",
      severity: "high",
      message: "Backlink/source trails are not being opened yet.",
      nextAction: "Prioritize source-backed lanes where the video, GLB, and podcast answer the same intent."
    })
  }

  if(unassigned && unassigned.pageViews > pageViews * 0.35){
    warnings.push({
      id: "homepage-pocket-too-general",
      severity: "medium",
      message: "A large homepage pocket is still unassigned, so Google/user intent is not being narrowed enough.",
      nextAction: "Collect this pocket to the side and keep fresh lanes open for exact audience matches."
    })
  }

  if(glbTotal > 0 && podcast === 0){
    warnings.push({
      id: "glb-without-podcast-context",
      severity: "medium",
      message: "3D interest is visible, but podcast/source context is not following it.",
      nextAction: "Pair 3D Model View moments with a source or speaker moment for the same topic."
    })
  }

  if(searches === 0 && uniqueVisitors > 20){
    warnings.push({
      id: "search-not-used",
      severity: "medium",
      message: "Visitors are arriving, but search is not becoming a habit yet.",
      nextAction: "Read incoming lanes as browsing intent first, then push only the strongest lane into search prompts."
    })
  }

  return warnings
}

function liveAudienceAssist(events, interactionTotals){
  const questions = liveClientQuestions(events, 12)
  const latestSignals = events.slice(0, 12).map(compactLatestEvent)
  const bottlenecks = audienceBottlenecks(events, interactionTotals)
  const openHelpCount = questions.filter((row) => row.status === "needs-helpful-answer").length
  return {
    mode: "help-audience-first-read",
    openHelpCount,
    liveQuestions: questions,
    surfacedIntentSignals: latestSignals,
    bottlenecks,
    capacityRead: {
      apiFunctions: 12,
      apiFunctionPlanLimitStatus: "at-hobby-limit-do-not-add-more-functions",
      firstReadPayloadStatus: "compact-events-enabled",
      safeAudienceAction: "serve compact analytics from this endpoint, keep raw event detail inside Supabase, and only expand exact lanes when users interact."
    },
    nextHelpfulAction: bottlenecks[0]?.nextAction || "Keep watching for exact user questions, proof opens, source opens, GLB plays, podcast interrupts, autoplay starts, and searches."
  }
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

function eventIn(event, names){
  return names.includes(event.event_name)
}

function countEvents(events, names){
  return events.filter((event) => eventIn(event, names)).length
}

async function pixelSummary(){
  const url = supabaseApiUrl()
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY")
  if(!url || !key) return emptyPixelSummary("missing-supabase-service-config")
  let response
  let text = ""
  try {
    response = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events?select=event_name,session_id,visitor_id,path,referrer,blog_slug,keyword_hint,category,asset_id,user_agent,metadata,created_at&order=created_at.desc&limit=750`, {
      signal: requestTimeoutSignal(),
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`
      }
    })
    text = await response.text()
  } catch (error) {
    return emptyPixelSummary(`supabase-pixel-network-failed-${error?.cause?.code || error?.message || "unknown"}`)
  }
  if(!response.ok) return emptyPixelSummary(`supabase-pixel-read-failed-${response.status}`)
  let events = []
  try {
    events = text ? JSON.parse(text) : []
  } catch {
    return emptyPixelSummary("pixel-json-parse-failed")
  }
  const cutoff = Date.now() - 48 * 60 * 60 * 1000
  const recent = events.filter((event) => new Date(event.created_at).getTime() >= cutoff)
  const pageViews = events.filter((event) => ["page_view", "blog_view"].includes(event.event_name))
  const rawInteractionTotals = {
    pageViews: pageViews.length,
    blogViews: countEvents(events, ["blog_view"]),
    searchRuns: countEvents(events, ["search_run", "youtube_search_submit"]),
    intentSelections: countEvents(events, ["search_intent_chip_select", "quick_panel_select", "category_lane_select"]),
    proofRouteOpens: countEvents(events, ["zone_checkpoint_open", "proof_route_open", "watch_route_open", "blog_route_open", "category_proof_open", "viral_watch_route_open", "viral_source_route_open"]),
    sourceOpens: countEvents(events, ["backlink_source_open", "glb_source_click", "podcast_source_open", "viral_source_backlink_open"]),
    autoplayStarts: countEvents(events, ["autoplay_start", "episode_preview_autoplay_start"]),
    autoplayPauses: countEvents(events, ["autoplay_pause"]),
    episodeShifts: countEvents(events, ["autoplay_episode_shift"]),
    podcastInterrupts: countEvents(events, ["podcast_interrupt_play", "podcast_interrupt_start", "viral_podcast_source_start"]),
    glbPreviewPlays: countEvents(events, ["glb_preview_play", "glb_preview_open"]),
    glbReplicaPlays: countEvents(events, ["glb_replica_play", "viral_glb_proof_play"]),
    timelineScrubs: countEvents(events, ["timeline_scrub", "platform_cadence_read"]),
    marketOpens: countEvents(events, ["market_view_open", "market_panel_open", "ticker_search"])
  }
  const summaryLayer = await readPixelSummaryLayer(url, key)
  const legacyMasterListAttribution = await readLegacyMasterListAttribution(url, key)
  const hasSummaryLayer = summaryLayer && summaryLayer.global && summaryLayer.ready !== false
  const interactionTotals = hasSummaryLayer ? totalsFromSummaryLayer(summaryLayer, rawInteractionTotals) : rawInteractionTotals
  const totalEvents = hasSummaryLayer ? numberValue(summaryLayer.global.total_events) : events.length
  const uniqueVisitors = hasSummaryLayer ? numberValue(summaryLayer.uniqueVisitors) : new Set(events.map((event) => event.visitor_id).filter(Boolean)).size
  const trafficRows = hasSummaryLayer && Array.isArray(summaryLayer.trafficLocationMap) ? summaryLayer.trafficLocationMap : trafficLocationMap(events)
  const secondActionRows = hasSummaryLayer && Array.isArray(summaryLayer.secondActionLocations) ? summaryLayer.secondActionLocations : secondActionLocations(events)
  const masterKeywordDoorEvents = events.filter((event) => masterKeywordForEvent(event).isMasterKeywordDoor).length
  const freshAudience = freshAudienceRead({
    totalEvents,
    uniqueVisitors,
    interactionTotals,
    masterKeywordDoorEvents,
    trafficRows
  })
  return {
    ready: true,
    reason: "",
    summarySource: hasSummaryLayer ? "supabase-rollup-layer" : "recent-raw-events-fallback",
    summaryLayerReady: Boolean(hasSummaryLayer),
    summaryLayerReason: hasSummaryLayer ? "" : summaryLayer?.reason || "",
    legacyMasterListAttribution,
    totalEvents,
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
    totalZoneCheckpointOpens: countEvents(events, ["zone_checkpoint_open"]),
    totalMasterKeywordDoorEvents: masterKeywordDoorEvents,
    totalSourceOpens: interactionTotals.sourceOpens,
    totalThumbnailRenderClicks: events.filter((event) => event.event_name === "thumbnail_render_click").length,
    totalSearchRuns: interactionTotals.searchRuns,
    totalWalletClicks: events.filter((event) => event.event_name === "wallet_connect_click").length,
    totalTierClicks: events.filter((event) => event.event_name === "tier_click").length,
    totalNodeClicks: events.filter((event) => event.event_name === "node_click").length,
    uniqueVisitors,
    interactionTotals,
    freshAudience,
    summaryLine: `${interactionTotals.pageViews} page views, ${interactionTotals.searchRuns} searches, ${interactionTotals.intentSelections} intent selections, ${interactionTotals.autoplayStarts} autoplay starts, ${interactionTotals.glbPreviewPlays + interactionTotals.glbReplicaPlays} GLB plays, ${interactionTotals.podcastInterrupts} podcast interrupts, ${interactionTotals.proofRouteOpens} proof route opens, ${interactionTotals.sourceOpens} source opens, ${interactionTotals.marketOpens} market opens.`,
    last48Hours: hasSummaryLayer && Array.isArray(summaryLayer.last48Hours) ? summaryLayer.last48Hours : eventCounts(recent),
    topPages: hasSummaryLayer && Array.isArray(summaryLayer.topPages) ? summaryLayer.topPages : topCounts(pageViews, "path"),
    topBlogs: topCounts(events.filter((event) => event.blog_slug), "blog_slug"),
    topContentPulls: topContentPulls(events),
    topCheckpointZones: topCheckpointZones(events),
    topMasterKeywordLanes: hasSummaryLayer && Array.isArray(summaryLayer.topMasterKeywordLanes) ? summaryLayer.topMasterKeywordLanes : topMasterKeywordLanes(events),
    masterKeywordDoorTrail: masterKeywordDoorTrail(events),
    masterKeywordDoorSourceSummary: masterKeywordDoorSourceSummary(events),
    trafficLocationMap: trafficRows,
    secondActionLocations: secondActionRows,
    liveClientQuestions: liveClientQuestions(events),
    audienceAssist: liveAudienceAssist(events, interactionTotals),
    originBuckets: originBuckets(events),
    exploitableMovement: exploitableMovement(events),
    topKeywordHints: topCounts(events.filter((event) => event.keyword_hint), "keyword_hint"),
    topRenderCategories: topCounts(events.filter((event) => event.category), "category"),
    topRenderAssets: topCounts(events.filter((event) => event.asset_id), "asset_id"),
    latestEvents: events.slice(0, 10).map(compactLatestEvent)
  }
}

export default async function handler(req, res){
  const requestedScope = String(req.query?.scope || "")
    || new URL(req.url || "/", "https://www.digitalhut.app").searchParams.get("scope")
    || ""
  if(requestedScope === "gap-orchestration"){
    res.setHeader("Cache-Control", "no-store")
    if(req.method !== "GET") return res.status(405).json({error: "method_not_allowed"})
    return res.status(200).json(evaluateGapOrchestration())
  }
  const audienceScope = requestedScope === "audience-live"
  if(audienceScope) return handleAudienceLive(req, res)
  if(req.method === "POST"){
    res.setHeader("Cache-Control", "no-store")
    const payload = await readJsonBody(req)
    const result = await saveSearchPixelEvent(req, payload)
    return res.status(200).json({ok: true, pixel: result})
  }

  const stack = stackStatus()
  const pixel = await pixelSummary()
  const diagnostics = {
    supabase: supabaseDiagnostics()
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    status: currentMode(),
    stack,
    pixel,
    diagnostics,
    wholeSystemSignal: wholeSystemSignalFor({stack, pixel, diagnostics}),
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
