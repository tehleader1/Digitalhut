import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const site = "https://www.digitalhut.app"
const generatedAt = new Date().toISOString()
const publicPath = "public/digitalhut-360-coverage-packet.json"
const docsPath = "docs/digitalhut-360-coverage-packet.md"

function readJson(path, fallback = null){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return fallback
  }
}

async function readLiveInsight(){
  try {
    const response = await fetch(`${site}/api/insight-map?coverage=${Date.now()}`)
    if(!response.ok) return readJson("docs/digitalhut-last-insight-map.json", null)
    return await response.json()
  } catch {
    return readJson("docs/digitalhut-last-insight-map.json", null)
  }
}

function statusForZone(zone, searchConsole, insight){
  const freshRows = searchConsole?.searchAnalyticsFresh?.topRows || []
  const finalRows = searchConsole?.searchAnalyticsFinal?.topRows || []
  const rows = [...freshRows, ...finalRows]
  const hasQueryRow = rows.some((row) => {
    const text = JSON.stringify(row.keys || []).toLowerCase()
    return text.includes(zone.id) || text.includes(zone.proofRoute || "")
  })
  const topLanes = insight?.pixel?.topMasterKeywordLanes || []
  const exactLane = topLanes.find((item) => String(item.lane || "").toLowerCase() === zone.id)
  const checkpoint = (insight?.pixel?.topCheckpointZones || []).find((item) => String(item.zone || "").toLowerCase() === zone.id)
  if(hasQueryRow) return "search-console-row"
  if(checkpoint?.events) return "checkpoint-traffic"
  if(exactLane?.events) return "master-door-traffic"
  if(Number(zone.sitemapRows || 0) > 0) return "sitemap-window-ready"
  return "held-for-proof"
}

function targetAngleForLane(lane){
  const id = lane.id || ""
  if(id.includes("full-entertainment")) return "full entertainment alternative"
  if(id.includes("gaming")) return "gaming GLB and 3D world viewer"
  if(id.includes("ai-video-podcast")) return "AI video, podcast, and source explainer"
  if(id.includes("developer") || id.includes("architecture") || id.includes("workforce")) return "developer, infrastructure, engineering, and training"
  if(id.includes("real-estate") || id.includes("home-project")) return "home, real estate, and project planning"
  if(id.includes("planetary") || id.includes("exotic") || id.includes("virtual-travel")) return "planetary, exotic, travel, and spatial experience"
  if(id.includes("local") || id.includes("lunch") || id.includes("rideshare") || id.includes("flight") || id.includes("errands")) return "mundane life search capture"
  if(id.includes("education") || id.includes("wiki")) return "research, study, wiki, and source-backed learning"
  if(id.includes("social") || id.includes("funny") || id.includes("creator") || id.includes("lifestyle")) return "social, creator, reel, and mainstream clips"
  if(id.includes("market")) return "market and company observatory"
  if(id.includes("international")) return "international language side markets"
  return "general DigitalHut functionality"
}

function coverageRealityFor(status){
  if(status === "search-console-row") return "real-search-console-row"
  if(status === "checkpoint-traffic") return "real-zone-checkpoint-traffic"
  if(status === "master-door-traffic") return "real-master-keyword-door-traffic"
  if(status === "sitemap-window-ready") return "public-sitemap-only"
  return "held-no-public-or-behavior-proof"
}

function behaviorRequirementsFor(lane){
  return [
    `open ${lane.proofRoute}`,
    `open /zone/${lane.id}`,
    "create proof_route_open or zone_checkpoint_open",
    "create source/backlink open",
    "create GLB, podcast, autoplay, market, or search behavior with this exact lane",
    "earn a Search Console query/page row that is not just name-adjacent"
  ]
}

function angleGroupStatus(items){
  if(items.some((item) => ["search-console-row", "checkpoint-traffic", "master-door-traffic"].includes(item.status))) return "behavior-or-search-visible"
  if(items.some((item) => item.status === "sitemap-window-ready")) return "sitemap-visible-awaiting-behavior"
  return "held-awaiting-proof"
}

const insight = await readLiveInsight()
const searchConsole = readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {})
const rotation = readJson("public/digitalhut-master-keyword-rotation.json", {})
const zonesPacket = readJson("public/digitalhut-intro-entertainment-zones.json", {zones: []})
const zonesById = new Map((zonesPacket.zones || []).map((zone) => [zone.id, zone]))
const topMasterKeywordLanes = insight?.pixel?.topMasterKeywordLanes || []
const freshRows = searchConsole?.searchAnalyticsFresh?.topRows || []

const lanes = seoSearchClaimLanes.filter((lane) => lane.countedRankSlots !== false)
const coverage = lanes.map((lane) => {
  const zone = zonesById.get(lane.id) || {}
  const status = statusForZone({...zone, ...lane}, searchConsole, insight)
  return {
    id: lane.id,
    lane: lane.lane,
    angle: targetAngleForLane(lane),
    zonePath: zone.zonePath || `/zone/${lane.id}`,
    proofRoute: lane.proofRoute,
    sitemapRows: Number(zone.sitemapRows || 0),
    rotationScore: Number(zone.rotationScore || 0),
    status,
    coverageReality: coverageRealityFor(status),
    exactSourceProtected: true,
    behaviorRequirements: behaviorRequirementsFor(lane),
    nextAction: status === "search-console-row"
      ? "Promote only after query/page rows repeat or clicks appear."
      : status === "checkpoint-traffic" || status === "master-door-traffic"
        ? "Keep this lane in the rotation window and watch for proof/source opens."
        : "Hold as a 360 angle; do not expand until real events, Search Console rows, proof opens, or source opens appear."
  }
})

const nameAdjacentRows = freshRows.filter((row) => {
  const query = String(row.keys?.[0] || "").toLowerCase()
  return query.includes("cyberhut") || query.includes("digitalhut") || query.includes("digital hut")
})

const angleGroups = [
  {
    id: "full-system-entertainment",
    label: "Full entertainment dapp alternative",
    laneIds: ["full-entertainment-dapp-alternative", "funny-mainstream-video", "social-reel-meme-analysis", "lifestyle-event-visual-experience"],
    cast: "video watching + 3D Model View + podcast/source moments + live analytics in one non-scrolling entertainment dapp"
  },
  {
    id: "3d-glb-spatial",
    label: "3D, GLB, gaming, spatial, and environment view",
    laneIds: ["gaming-3d-world-observatory", "exotic-environment-visual-experience", "planetary-space-observatory", "virtual-travel-resort-vacation"],
    cast: "3D model preview, rotate/zoom, GLB source proof, spatial walkthrough, and visual research"
  },
  {
    id: "research-developer-infrastructure",
    label: "Research, developer, programmer, and infrastructure proof",
    laneIds: ["developer-programmer-research", "education-study-visual-research", "architecture-structure-engineering", "workforce-training-visual-system", "wiki-quick-research"],
    cast: "source-backed research, on-call infrastructure, cloud/database proof, API/docs context, and study routes"
  },
  {
    id: "mundane-life-checkpoints",
    label: "Mundane life checkpoint capture",
    laneIds: ["local-life-errands-companion", "lunch-local-food", "rideshare-commute", "flight-travel-booking", "errands-review-before-buying"],
    cast: "lunch, rideshare, flights, errands, reviews, and daily off-time searches routed into useful visual experiences"
  },
  {
    id: "home-real-estate-product",
    label: "Home, real estate, creator, brand, and product proof",
    laneIds: ["home-project-diy-visual", "real-estate-3d-tour-observatory", "creator-brand-product-showcase"],
    cast: "home projects, property tours, product demos, brand/client proof, and interactive 3D context"
  },
  {
    id: "market-international",
    label: "Market, company, international, and AI explainer side markets",
    laneIds: ["market-company-observatory", "international-language-side-markets", "ai-video-podcast-source-explainer"],
    cast: "market/company source reads, international side-market language, and AI video/podcast/source explanation"
  }
].map((group) => {
  const items = coverage.filter((item) => group.laneIds.includes(item.id))
  return {
    ...group,
    status: angleGroupStatus(items),
    activeLaneIds: items.filter((item) => ["search-console-row", "checkpoint-traffic", "master-door-traffic"].includes(item.status)).map((item) => item.id),
    sitemapOnlyLaneIds: items.filter((item) => item.status === "sitemap-window-ready").map((item) => item.id),
    missingBehaviorLaneIds: items.filter((item) => !["search-console-row", "checkpoint-traffic", "master-door-traffic"].includes(item.status)).map((item) => item.id)
  }
})

const exactLaneCastQueue = [
  "full-entertainment-dapp-alternative",
  "gaming-3d-world-observatory",
  "ai-video-podcast-source-explainer",
  "developer-programmer-research",
  "local-life-errands-companion",
  "home-project-diy-visual",
  "wiki-quick-research",
  "international-language-side-markets"
].map((id) => coverage.find((item) => item.id === id)).filter(Boolean)

const packet = {
  generatedAt,
  status: "digitalhut-360-coverage-ready",
  site,
  sourceOfTruth: {
    file: "src/lib/seoSearchClaimEngine.js",
    totalIndividualRanks: seoSearchClaimSummary.totalIndividualRanks,
    countedLaneCount: lanes.length,
    rule: "The 200M list is owned by original counted longtail lanes only. Checkpoint zones, Search Console rows, and Supabase traffic can promote exact matching lanes, but cannot create or rename the source list."
  },
  currentTraffic: insight?.pixel ? {
    pageViews: insight.pixel.totalPageViews,
    uniqueVisitors: insight.pixel.uniqueVisitors,
    totalEvents: insight.pixel.totalEvents,
    glbPreviewPlays: insight.pixel.totalGlbPreviewPlays,
    podcastInterrupts: insight.pixel.totalPodcastInterrupts,
    autoplayStarts: insight.pixel.totalAutoplayStarts,
    searches: insight.pixel.totalSearchRuns,
    proofRouteOpens: insight.pixel.totalProofRouteOpens,
    sourceOpens: insight.pixel.totalSourceOpens,
    zoneCheckpointOpens: insight.pixel.totalZoneCheckpointOpens,
    masterKeywordDoorEvents: insight.pixel.totalMasterKeywordDoorEvents
  } : null,
  searchConsole: {
    freshRows: searchConsole?.searchAnalyticsFresh?.rowCount || 0,
    freshImpressions: searchConsole?.searchAnalyticsFresh?.totalImpressions || 0,
    finalRows: searchConsole?.searchAnalyticsFinal?.rowCount || 0,
    sitemapSurfacesVisible: searchConsole?.compareAndContrast?.sitemapSurfacesVisible || 0,
    sitemapSurfacesPending: searchConsole?.compareAndContrast?.sitemapSurfacesPending || 0,
    nameAdjacentRows,
    functionalRows: freshRows.filter((row) => !nameAdjacentRows.includes(row))
  },
  rotation: {
    sitemapWindow: rotation?.sitemapLimit || 50000,
    topAllocations: rotation?.topAllocations || []
  },
  trafficLocationMap: insight?.pixel?.trafficLocationMap || [],
  secondActionLocations: insight?.pixel?.secondActionLocations || [],
  angleGroups,
  exactLaneCastQueue,
  realityGuardrail: {
    publicCoverage: "The sitemap and proof packets expose the 200M universe through 50,000 selected URLs plus route shells.",
    behaviorCoverage: "A lane is not considered live until Supabase records exact-lane behavior or Search Console produces a functional query/page row.",
    nameAdjacentPolicy: "digitalhut/cyberhut-style rows are logged but do not count as functionality wins.",
    noSourceMutation: "Checkpoint zones cannot create, rename, or override the original longtail source list."
  },
  coverage,
  uncoveredAngles: coverage.filter((item) => !["search-console-row", "checkpoint-traffic", "master-door-traffic"].includes(item.status)).map((item) => item.id),
  next360Move: "Create no new source list. Keep the original 24 lanes, let Google process the three submitted sitemap surfaces, and cast attention toward exact checkpoint routes that can produce zone_checkpoint_open, proof_route_open, source_open, GLB, podcast, autoplay, and search behavior."
}

const md = `# DigitalHut 360 Coverage Packet

Generated: ${generatedAt}

Source of truth: ${packet.sourceOfTruth.file}

Total internal longtail slots: ${packet.sourceOfTruth.totalIndividualRanks}

Counted original lanes: ${packet.sourceOfTruth.countedLaneCount}

Search Console fresh rows: ${packet.searchConsole.freshRows}

Name-adjacent rows: ${packet.searchConsole.nameAdjacentRows.length}

## 360 Coverage

${coverage.map((item) => `- ${item.lane}: ${item.status}; ${item.zonePath}; ${item.proofRoute}; next: ${item.nextAction}`).join("\n")}

## Angle Groups

${angleGroups.map((item) => `- ${item.label}: ${item.status}; lanes: ${item.laneIds.join(", ")}`).join("\n")}

## Exact Lane Cast Queue

${exactLaneCastQueue.map((item) => `- ${item.lane}: ${item.zonePath}; ${item.proofRoute}; marker: proof/source open, exact-lane second action, or functional Search Console row`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  totalIndividualRanks: packet.sourceOfTruth.totalIndividualRanks,
  coverageCount: coverage.length,
  freshRows: packet.searchConsole.freshRows,
  nameAdjacentRows: packet.searchConsole.nameAdjacentRows.length,
  functionalRows: packet.searchConsole.functionalRows.length,
  exactTrafficLanes: coverage.filter((item) => ["search-console-row", "checkpoint-traffic", "master-door-traffic"].includes(item.status)).length
}, null, 2))
