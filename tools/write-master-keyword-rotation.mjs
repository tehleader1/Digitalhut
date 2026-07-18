import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const site = "https://www.digitalhut.app"
const generatedAt = new Date().toISOString()
const publicPath = "public/digitalhut-master-keyword-rotation.json"
const docsPath = "docs/digitalhut-master-keyword-rotation.md"
const sitemapLimit = 50000
const totalUniverse = Math.max(Number(seoSearchClaimSummary.totalIndividualRanks || 0), 200572944)
const wholeSystemLaneId = "digitalhut-200m-whole-system-entertainment-dapp-universe"

function readJson(path){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

async function readInsightMap(){
  try {
    const response = await fetch(`${site}/api/insight-map?rotation=${Date.now()}`)
    if(!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.json()
  } catch {
    return null
  }
}

function includesAny(value = "", terms = []){
  const text = String(value || "").toLowerCase()
  return terms.some((term) => text.includes(term))
}

function normalizeLaneId(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function sidePocketPressure(pixel = {}){
  const locations = pixel?.trafficLocationMap || []
  const homepageDirect = locations.find((item) =>
    item.origin === "direct-or-private-referrer" &&
    item.path === "/" &&
    ["unassigned-lane", wholeSystemLaneId].includes(normalizeLaneId(item.lane))
  )
  const proof = Number(pixel?.totalProofRouteOpens || 0)
  const source = Number(pixel?.totalSourceOpens || 0)
  const searches = Number(pixel?.totalSearchRuns || 0)
  const isBlocking = Boolean(homepageDirect) &&
    Number(homepageDirect.events || 0) >= 120 &&
    Number(homepageDirect.visitors || 0) >= 30 &&
    proof === 0 &&
    source === 0 &&
    searches <= 2
  return {
    isBlocking,
    reason: isBlocking
      ? "direct/private homepage pocket has volume; collect it to the side while fresh exact-lane discovery stays open"
      : "no side-pocket pressure detected",
    homepageDirect: homepageDirect || null
  }
}

function freshExplorationBoost(lane, sidePocket){
  if(!sidePocket?.isBlocking) return 0
  const priority = [
    "gaming-3d-world-observatory",
    "ai-video-podcast-source-explainer",
    "developer-programmer-research",
    "local-life-errands-companion",
    "home-project-diy-visual",
    "wiki-quick-research",
    "international-language-side-markets",
    "real-estate-3d-tour-observatory",
    "education-study-visual-research",
    "creator-brand-product-showcase"
  ]
  const index = priority.indexOf(lane.id)
  return index === -1 ? 6 : 28 - Math.min(20, index * 2)
}

function sidePocketHoldPenalty(lane, sidePocket){
  if(!sidePocket?.isBlocking) return 0
  if(lane.id === "full-entertainment-dapp-alternative") return -36
  if(lane.id === "funny-mainstream-video" || lane.id === "social-reel-meme-analysis") return -10
  return 0
}

function laneBehaviorScore(lane, pixel, searchConsole, packets, sidePocket){
  const id = lane.id
  let score = 10
  const topPulls = pixel?.topContentPulls || []
  const topBlogs = pixel?.topBlogs || []
  const topAssets = pixel?.topRenderAssets || []
  const topHints = pixel?.topKeywordHints || []
  const topZones = pixel?.topCheckpointZones || []
  const topMasterLanes = pixel?.topMasterKeywordLanes || []
  const pullText = JSON.stringify({topPulls, topBlogs, topAssets, topHints, topZones, topMasterLanes}).toLowerCase()
  const matchingMasterLane = topMasterLanes.find((item) => normalizeLaneId(item.lane) === id)
  const matchingZone = topZones.find((item) => normalizeLaneId(item.zone) === id)
  const inspections = searchConsole?.inspections || []
  const inspectedRoute = inspections.find((item) => String(item.url || "").includes(lane.proofRoute || `/watch/${id}`))
  const proof = Number(pixel?.totalProofRouteOpens || 0)
  const source = Number(pixel?.totalSourceOpens || 0)
  const glb = Number(pixel?.totalGlbPreviewPlays || 0)
  const podcast = Number(pixel?.totalPodcastInterrupts || 0)
  const autoplay = Number(pixel?.totalAutoplayStarts || 0)
  const searches = Number(pixel?.totalSearchRuns || 0)
  const market = Number(pixel?.totalMarketOpens || 0)

  if(id.includes("full-entertainment")) score += 45 + autoplay * 3
  if(id.includes("gaming") || includesAny(id, ["3d", "world"])) score += Math.min(35, Math.floor(glb / 3))
  if(id.includes("ai-video-podcast")) score += Math.min(24, podcast * 2)
  if(id.includes("market")) score += Math.min(18, market * 3)
  if(id.includes("developer") || id.includes("programmer")) score += searches * 6
  if(id.includes("local-life") || id.includes("errands")) score += searches * 4
  if(id.includes("on-call") || lane.proofRoute?.includes("on-call")) score += 24

  if(includesAny(pullText, ["full entertainment observatory alternative"])) {
    if(id.includes("full-entertainment")) score += 32
  }
  if(includesAny(pullText, ["gaming and 3d", "horror corridor", "medieval city", "glb"])) {
    if(id.includes("gaming") || id.includes("exotic") || id.includes("architecture")) score += 18
  }
  if(includesAny(pullText, ["research", "developer", "source"])) {
    if(id.includes("developer") || id.includes("education") || id.includes("ai-video-podcast")) score += 12
  }

  if(inspectedRoute?.coverageState?.includes("Submitted and indexed")) score += 40
  if(inspectedRoute?.coverageState?.includes("Crawled")) score += 24
  if(inspectedRoute?.coverageState?.includes("Discovered")) score += 14
  if(inspectedRoute?.coverageState?.includes("unknown")) score -= 5
  if(proof > 0 || source > 0) score += 80 + proof * 8 + source * 10
  if(matchingMasterLane){
    score += Math.min(120, Number(matchingMasterLane.events || 0) * 6)
    score += Math.min(80, Number(matchingMasterLane.visitors || 0) * 12)
    score += Math.min(80, Number(matchingMasterLane.proofOpens || 0) * 10)
    score += Math.min(80, Number(matchingMasterLane.sourceOpens || 0) * 12)
  }
  if(matchingZone){
    score += Math.min(90, Number(matchingZone.events || 0) * 8)
    score += Math.min(60, Number(matchingZone.visitors || 0) * 12)
  }

  const packetText = JSON.stringify(packets).toLowerCase()
  if(packetText.includes(id)) score += 8
  if(id.includes("developer") && packetText.includes("on-call-system-engineer-observatory")) score += 10

  score += freshExplorationBoost(lane, sidePocket)
  score += sidePocketHoldPenalty(lane, sidePocket)

  return Math.max(2, score)
}

function allocate(scored){
  const weighted = scored.map((item) => ({
    ...item,
    weightedCapacity: Math.max(1, item.variationCapacity) * item.score
  }))
  const totalWeight = weighted.reduce((sum, item) => sum + item.weightedCapacity, 0)
  const allocations = weighted.map((item) => {
    const exact = (item.weightedCapacity / totalWeight) * sitemapLimit
    return {...item, exact, count: Math.max(1, Math.floor(exact)), remainder: exact % 1}
  })
  let allocated = allocations.reduce((sum, item) => sum + item.count, 0)
  allocations.sort((a, b) => b.remainder - a.remainder)
  for(let i = 0; allocated < sitemapLimit; i = (i + 1) % allocations.length){
    allocations[i].count += 1
    allocated += 1
  }
  while(allocated > sitemapLimit){
    const target = allocations.slice().sort((a, b) => b.count - a.count).find((item) => item.count > 1)
    if(!target) break
    target.count -= 1
    allocated -= 1
  }
  return allocations.sort((a, b) => b.count - a.count)
}

const insight = await readInsightMap()
const pixel = insight?.pixel || null
const sidePocket = sidePocketPressure(pixel)
const searchConsole = readJson("docs/digitalhut-search-console-ranking-test-20260707.json")
const packets = {
  avenueLock: readJson("public/digitalhut-traffic-avenue-lock.json"),
  oncall: readJson("public/digitalhut-oncall-infrastructure-packet.json"),
  supabaseCompare: readJson("public/digitalhut-supabase-search-pixel-compare.json")
}

const counted = seoSearchClaimLanes.filter((lane) => lane.countedRankSlots !== false)
const scored = counted.map((lane) => ({
  id: lane.id,
  lane: lane.lane,
  proofRoute: lane.proofRoute,
  variationCapacity: Number(lane.variationCapacity || 0),
  score: laneBehaviorScore(lane, pixel, searchConsole, packets, sidePocket),
  measurementSignals: lane.measurementSignals || []
}))
const allocations = allocate(scored)
  const packet = {
  generatedAt,
  status: "master-keyword-rotation-ready",
  site,
  sitemapLimit,
  totalUniverse,
  mode: "Rotate the full 200M keyword universe internally and expose the best 50,000 public sitemap doorways at a time.",
  guardrail: "The sitemap slice is not a fake 200M-page dump. It is a scored public window into real DigitalHut proof routes.",
  sourceOfTruth: {
    file: "src/lib/seoSearchClaimEngine.js",
    rule: "Only counted lanes from seoSearchClaimLanes create the 200M universe. Intro zones and traffic packets can influence rotation weight only when their lane id exactly matches an original counted lane id.",
    totalIndividualRanks: seoSearchClaimSummary.totalIndividualRanks,
    countedLaneCount: counted.length
  },
  liveRead: {
    pageViews: pixel?.totalPageViews ?? null,
    uniqueVisitors: pixel?.uniqueVisitors ?? null,
    totalEvents: pixel?.totalEvents ?? null,
    glbPreviewPlays: pixel?.totalGlbPreviewPlays ?? null,
    podcastInterrupts: pixel?.totalPodcastInterrupts ?? null,
    autoplayStarts: pixel?.totalAutoplayStarts ?? null,
    searchRuns: pixel?.totalSearchRuns ?? null,
    marketOpens: pixel?.totalMarketOpens ?? null,
    proofRouteOpens: pixel?.totalProofRouteOpens ?? null,
    sourceOpens: pixel?.totalSourceOpens ?? null
  },
  sidePocketPressure: sidePocket,
  freshnessPolicy: {
    action: sidePocket.isBlocking ? "collect-homepage-pocket-to-the-side" : "keep-current-window",
    rule: "If homepage traffic has volume but no proof, source, or search movement, preserve that audience as a side pocket while reducing its hold on the 50,000-row sitemap window and opening more rows for fresh exact-lane discovery pockets.",
    successMarker: "new exact-lane proof/source/search/GLB/podcast/autoplay events or functional Search Console rows"
  },
  searchConsoleRead: {
    freshRows: searchConsole?.searchAnalyticsFresh?.rowCount ?? null,
    freshImpressions: searchConsole?.searchAnalyticsFresh?.totalImpressions ?? null,
    indexedInspectionTargets: searchConsole?.compareAndContrast?.indexedInspectionTargets ?? null,
    discoveredInspectionTargets: searchConsole?.compareAndContrast?.discoveredInspectionTargets ?? null,
    unknownInspectionTargets: searchConsole?.compareAndContrast?.unknownInspectionTargets ?? null
  },
  allocationWeights: Object.fromEntries(allocations.map((item) => [item.id, item.score])),
  allocations: allocations.map(({id, lane, proofRoute, variationCapacity, score, count, measurementSignals}) => ({
    id, lane, proofRoute, variationCapacity, score, sitemapRows: count, measurementSignals
  })),
  topAllocations: allocations.slice(0, 10).map(({id, lane, proofRoute, score, count}) => ({id, lane, proofRoute, score, sitemapRows: count})),
  nextAction: sidePocket.isBlocking
    ? "Regenerate sitemap rows from this allocation so the homepage pocket is collected to the side while fresh exact-lane discovery remains open."
    : "Regenerate sitemap rows from this allocation, deploy only after a stable batch, then compare Supabase and Search Console movement before rotating again."
}

const markdown = `# DigitalHut Master Keyword Rotation

Generated: ${generatedAt}

Mode: ${packet.mode}

Live read: ${packet.liveRead.pageViews} page views, ${packet.liveRead.uniqueVisitors} participating browser IDs, ${packet.liveRead.totalEvents} events.

## Top Allocations

${packet.topAllocations.map((item) => `- ${item.lane}: ${item.sitemapRows} rows, score ${item.score}, ${item.proofRoute}`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  totalUniverse,
  sitemapLimit,
  topAllocations: packet.topAllocations.slice(0, 5),
  liveRead: packet.liveRead
}, null, 2))
