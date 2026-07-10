import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-client-attempt-router.json"
const docsPath = "docs/digitalhut-client-attempt-router.md"
const baseline = {
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

function readJson(path, fallback = null){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return fallback
  }
}

async function fetchJson(url, fallback = null){
  try {
    const response = await fetch(url, {headers: {"cache-control": "no-cache"}})
    if(!response.ok) return fallback
    return await response.json()
  } catch {
    return fallback
  }
}

function numberValue(value){
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

function slugify(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function laneById(id){
  return seoSearchClaimLanes.find((lane) => lane.id === id) || null
}

function currentTotals(pixel = {}){
  return {
    pageViews: numberValue(pixel.totalPageViews),
    uniqueVisitors: numberValue(pixel.uniqueVisitors),
    totalEvents: numberValue(pixel.totalEvents),
    glb: numberValue(pixel.totalGlbPreviewPlays) + numberValue(pixel.totalGlbReplicaPlays),
    podcast: numberValue(pixel.totalPodcastInterrupts),
    autoplay: numberValue(pixel.totalAutoplayStarts),
    searches: numberValue(pixel.totalSearchRuns),
    market: numberValue(pixel.totalMarketOpens),
    proof: numberValue(pixel.totalProofRouteOpens),
    source: numberValue(pixel.totalSourceOpens),
    blogViews: numberValue(pixel.totalBlogViews),
    masterKeywordDoorEvents: numberValue(pixel.totalMasterKeywordDoorEvents)
  }
}

function deltaTotals(current){
  return Object.fromEntries(Object.entries(current).map(([key, value]) => [
    key,
    Math.max(0, numberValue(value) - numberValue(baseline[key]))
  ]))
}

function searchConsoleSummary(searchConsole = {}){
  return {
    freshRows: numberValue(searchConsole.freshRows ?? searchConsole.searchAnalyticsFresh?.rowCount),
    freshImpressions: numberValue(searchConsole.freshImpressions ?? searchConsole.searchAnalyticsFresh?.totalImpressions),
    freshClicks: numberValue(searchConsole.freshClicks ?? searchConsole.searchAnalyticsFresh?.totalClicks),
    finalRows: numberValue(searchConsole.finalRows ?? searchConsole.searchAnalyticsFinal?.rowCount),
    finalImpressions: numberValue(searchConsole.finalImpressions ?? searchConsole.searchAnalyticsFinal?.totalImpressions),
    finalClicks: numberValue(searchConsole.finalClicks ?? searchConsole.searchAnalyticsFinal?.totalClicks),
    indexedInspectionTargets: numberValue(searchConsole.compareAndContrast?.indexedInspectionTargets),
    discoveredInspectionTargets: numberValue(searchConsole.compareAndContrast?.discoveredInspectionTargets),
    unknownInspectionTargets: numberValue(searchConsole.compareAndContrast?.unknownInspectionTargets),
    sitemapSurfacesVisible: numberValue(searchConsole.sitemapSurfacesVisible),
    sitemapSurfacesPending: numberValue(searchConsole.sitemapSurfacesPending)
  }
}

function routeFromLane(lane){
  return lane?.proofRoute || `/watch/${slugify(lane?.lane || "full-view-episode-alternative")}`
}

function attemptScore({lane, delta, searchConsole, rotation}){
  const allocation = (rotation?.allocations || []).find((item) => item.id === lane.id)
  let score = 20
  if(lane.id === "ai-video-podcast-source-explainer") score += 42
  if(lane.id === "full-entertainment-dapp-alternative") score += 36
  if(lane.id === "gaming-3d-world-observatory") score += 24
  if(lane.id === "developer-programmer-research") score += 20
  if(lane.id === "local-life-errands-companion") score += 16
  if(lane.id === "wiki-quick-research") score += 14
  if(delta.pageViews > 0 || delta.uniqueVisitors > 0) score += 18
  if(delta.glb > 0 && lane.measurementSignals?.some((signal) => signal.toLowerCase().includes("glb"))) score += 30
  if(delta.podcast > 0 && lane.measurementSignals?.some((signal) => signal.toLowerCase().includes("podcast"))) score += 30
  if(delta.searches > 0 && lane.measurementSignals?.some((signal) => signal.toLowerCase().includes("search"))) score += 24
  if(delta.proof > 0 || delta.source > 0) score += 80
  if(searchConsole.freshRows > 0 && lane.id === "full-entertainment-dapp-alternative") score += 12
  if(searchConsole.unknownInspectionTargets > searchConsole.discoveredInspectionTargets) score += lane.id === "ai-video-podcast-source-explainer" ? 8 : 0
  if(allocation) score += Math.min(35, Math.round(numberValue(allocation.sitemapRows || allocation.count) / 150))
  return score
}

function intentPhrases(lane){
  const base = lane.lane
  return [
    `${base} with video watching, 3D Model View, podcast source moments, and live analytics`,
    `2026 ${base} dapp entertainment observatory`,
    `${base} source backed video and 3D research view`,
    `${base} alternative to a plain video page`
  ]
}

function attemptForLane({lane, delta, searchConsole, rotation}){
  const route = routeFromLane(lane)
  const score = attemptScore({lane, delta, searchConsole, rotation})
  const isWeakEntry = delta.pageViews > 0 || delta.uniqueVisitors > 0 || delta.totalEvents > 0
  const proofNeeded = delta.proof === 0 && delta.source === 0
  let objective = "Find entry traffic and convert it into a measurable second action."
  let nextProofMove = "Push visitor attention toward GLB, podcast/source, autoplay, search, then proof/source open."
  if(isWeakEntry && proofNeeded){
    objective = "Convert the fresh entry lift into a second action."
    nextProofMove = "Use the full-system phrase and route to GLB Model View, podcast/source moment, search, or proof/source bridge."
  }
  if(delta.proof > 0 || delta.source > 0){
    objective = "Stack and duplicate this proven lane."
    nextProofMove = "Duplicate exact route, source language, and backlink path that produced proof/source movement."
  }
  return {
    id: lane.id,
    lane: lane.lane,
    role: lane.role,
    score,
    proofRoute: route,
    publicUrl: `${site}${route}`,
    sourceBridgeUrl: `${site}/digitalhut-proof-source-conversion-bridge.json#${slugify(lane.lane)}`,
    objective,
    nextProofMove,
    claimScope: {
      variationCapacity: numberValue(lane.variationCapacity),
      universe: Math.max(numberValue(seoSearchClaimSummary.totalIndividualRanks), 200572944),
      countedRankSlots: lane.countedRankSlots !== false
    },
    intentPhrases: intentPhrases(lane),
    measurementSignals: lane.measurementSignals || [],
    requiredWinCondition: "At least one second action, then proof_route_open or source/backlink open.",
    backlinkTargets: lane.backlinkTargets || []
  }
}

function wholeSystemAttempt({attempts, delta, searchConsole}){
  const strongestArm = attempts[0] || null
  const universe = Math.max(numberValue(seoSearchClaimSummary.totalIndividualRanks), 200572944)
  const secondActionDelta = delta.glb + delta.podcast + delta.autoplay + delta.searches + delta.market
  const internalRotationArm = {
    id: "digitalhut-full-200m-keyword-list",
    lane: "DigitalHut 200M SEO Master List",
    aliases: ["DigitalHut Full 200,572,944 Keyword List", "DigitalHut 200,572,944 Longtail Keyword Universe"],
    score: 200,
    proofRoute: "/system-proof",
    publicUrl: `${site}/system-proof`,
    role: "the strongest lane and source of truth; every category, proof route, source bridge, comparison test, and evidence read is a facet inside this SEO master list",
    universe,
    publicSitemapWindow: 50000
  }
  return {
    id: "digitalhut-200m-seo-master-list",
    lane: "DigitalHut 200M SEO Master List",
    role: "the complete SEO master list: every everyday watcher, researcher, gamer, creator, builder, traveler, buyer, developer, and mainstream viewer route must have DigitalHut's dapp proof engine behind it",
    score: Math.max(200, Math.round((attempts.reduce((sum, attempt) => sum + attempt.score, 0) / Math.max(1, attempts.length)) + 125)),
    proofRoute: "/system-proof",
    publicUrl: `${site}/system-proof`,
    sourceBridgeUrl: `${site}/digitalhut-proof-source-conversion-bridge.json#digitalhut-200m-seo-master-list`,
    objective: "Run the 200M SEO master list as the strongest lane. Anything discovered through that list must route back to DigitalHut's working dapp proof engine.",
    dappProofEngine: {
      role: "the product proof behind every longtail route",
      modules: [
        "video watching/session flow",
        "3D Model View and GLB interaction",
        "podcast/source moment",
        "live analytics",
        "search and category routing",
        "Supabase behavior telemetry",
        "sitemap and Search Console proof"
      ],
      rule: "No keyword facet is promoted unless DigitalHut can show or measure a useful dapp behavior behind it."
    },
    nextProofMove: secondActionDelta > 0
      ? "Duplicate the whole-system path that caused second-action movement, then require proof/source opens."
      : "Move fresh entry traffic into any second action: GLB Model View, podcast/source, autoplay, search, market, proof, or source open.",
    claimScope: {
      variationCapacity: universe,
      universe,
      countedRankSlots: true,
      publicSitemapWindow: 50000
    },
    intentPhrases: [
      "DigitalHut 200M SEO Master List backed by a working 2026 entertainment dapp observatory",
      "200M longtail keyword map with video watching, 3D Model View, podcast/source moments, search, autoplay, and live analytics behind every useful route",
      "DigitalHut master keyword list routed through one dapp proof engine instead of thin SEO pages",
      "everyday life, gaming, research, real estate, travel, market, developer, creator, and study searches entering DigitalHut's dapp system"
    ],
    measurementSignals: [
      "page view",
      "unique visitor",
      "master keyword door event",
      "GLB Model View open",
      "podcast/source interrupt",
      "autoplay start",
      "search intent",
      "market open",
      "proof route open",
      "source/backlink open",
      "Search Console query row"
    ],
    requiredWinCondition: "Any keyword facet can start the pull, but the win belongs to the 200M SEO Master List only when visitors complete second actions and proof/source opens inside the dapp.",
    backlinkTargets: Array.from(new Set(attempts.flatMap((attempt) => attempt.backlinkTargets || []))).slice(0, 28),
    internalRotationArm,
    universeFacets: attempts.map((attempt) => ({
      id: attempt.id,
      lane: attempt.lane,
      score: attempt.score,
      proofRoute: attempt.proofRoute,
      role: "evidence facet inside the 200M SEO Master List"
    })),
    strongestRotationArm: internalRotationArm,
    wholeSystemAttractionUniverse: internalRotationArm,
    measurableFacet: {
      id: "digitalhut-200m-seo-master-list",
      lane: "DigitalHut 200M SEO Master List",
      score: 200,
      proofRoute: "/system-proof",
      publicUrl: `${site}/system-proof`,
      role: "the SEO master list as a whole is the measurable facet; category lanes are sub-signals only",
      strongestSubSignal: strongestArm ? {
        id: strongestArm.id,
        lane: strongestArm.lane,
        score: strongestArm.score,
        proofRoute: strongestArm.proofRoute
      } : null
    },
    currentRead: {
      freshDelta: delta,
      searchConsole
    }
  }
}

const insight = await fetchJson(`${site}/api/insight-map?client-attempt-router=${Date.now()}`, {})
const pixel = insight?.pixel || {}
const totals = currentTotals(pixel)
const delta = deltaTotals(totals)
const searchConsole = searchConsoleSummary(readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {}))
const rotation = readJson("public/digitalhut-master-keyword-rotation.json", {})
const targetLaneIds = [
  "ai-video-podcast-source-explainer",
  "full-entertainment-dapp-alternative",
  "gaming-3d-world-observatory",
  "developer-programmer-research",
  "wiki-quick-research",
  "local-life-errands-companion",
  "home-project-diy-visual",
  "education-study-visual-research",
  "creator-brand-product-showcase",
  "international-language-side-markets"
]

const attempts = targetLaneIds
  .map(laneById)
  .filter(Boolean)
  .map((lane) => attemptForLane({lane, delta, searchConsole, rotation}))
  .sort((a, b) => b.score - a.score)
const primaryAttempt = wholeSystemAttempt({attempts, delta, searchConsole})

const report = {
  generatedAt: new Date().toISOString(),
  status: "client-attempt-router-ready",
  site,
  mode: "Secure and exploit the DigitalHut 200M SEO Master List as the strongest lane; categories, competitors, source bridges, proof routes, behavior reads, and Search Console rows are all facets inside that master list.",
  guardrail: "This is not a claim of Google rank. It is the routing system that decides which whole-system keyword pressure deserves public proof until Search Console and Supabase confirm behavior.",
  baseline,
  currentTotals: totals,
  freshDelta: delta,
  searchConsole,
  masterKeywordUniverse: Math.max(numberValue(seoSearchClaimSummary.totalIndividualRanks), 200572944),
  publicSitemapWindow: 50000,
  wholeSystemAttempt: primaryAttempt,
  clientAttemptOrder: attempts,
  strongestAttempt: primaryAttempt,
  nextCast: `Cast the whole 200M system: ${primaryAttempt.intentPhrases[0]}`,
  nextMeasurement: "If this produces only page views, keep it weak. If it produces any GLB/podcast/autoplay/search/market movement, duplicate the whole-system path once. If it produces proof/source, stack the whole-system lane."
}

const md = `# DigitalHut Client Attempt Router

Generated: ${report.generatedAt}

Fresh delta: +${delta.pageViews} page views, +${delta.uniqueVisitors} unique visitors, +${delta.totalEvents} events.

Search Console: ${searchConsole.freshRows} fresh rows, ${searchConsole.freshImpressions} impressions, ${searchConsole.freshClicks} clicks.

## Whole-System Attempt

${report.strongestAttempt ? `- ${report.strongestAttempt.lane}: score ${report.strongestAttempt.score}
- Route: ${report.strongestAttempt.proofRoute}
- Cast: ${report.strongestAttempt.intentPhrases[0]}
- Win: ${report.strongestAttempt.requiredWinCondition}` : "- No attempt available."}

## Internal Rotation Arm

DigitalHut 200M SEO Master List at /system-proof.

## 200M Universe Facets

${attempts.map((attempt, index) => `${index + 1}. ${attempt.lane}: score ${attempt.score}, route ${attempt.proofRoute}`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  freshDelta: delta,
  searchConsole,
  strongestAttempt: report.strongestAttempt ? {
    lane: report.strongestAttempt.lane,
    score: report.strongestAttempt.score,
    proofRoute: report.strongestAttempt.proofRoute,
    strongestRotationArm: report.strongestAttempt.strongestRotationArm
  } : null,
  nextMeasurement: report.nextMeasurement
}, null, 2))
