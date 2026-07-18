import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const publicPath = "public/digitalhut-fresh-audience-collection.json"
const docsPath = "docs/digitalhut-fresh-audience-collection.md"
const endpoint = "https://www.digitalhut.app/api/insight-map?scope=fresh-audience-collection"
const reset = process.argv.includes("--reset")

function readJson(path, fallback = null){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return fallback
  }
}

function numberValue(value){
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

function totalsFromPixel(pixel = {}){
  return {
    pageViews: numberValue(pixel.totalPageViews),
    uniqueVisitors: numberValue(pixel.uniqueVisitors),
    totalEvents: numberValue(pixel.totalEvents),
    glb: numberValue(pixel.totalGlbPreviewPlays),
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

function deltaTotals(current, baseline){
  return Object.fromEntries(Object.entries(current).map(([key, value]) => [
    key,
    Math.max(0, numberValue(value) - numberValue(baseline?.[key]))
  ]))
}

function routeForCandidate(item = {}){
  const lane = canonicalLane(item.lane)
  if(lane === wholeSystemLane) return "/system-proof"
  if(item.path && item.path !== "/") return item.path
  const slug = lane.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return `/watch/${slug || "full-view-episode-alternative"}`
}

const wholeSystemLane = "DigitalHut 200M SEO Master List"
const wholeSystemBridge = "/digitalhut-proof-source-conversion-bridge.json#digitalhut-200m-seo-master-list"

function canonicalLane(lane){
  const raw = String(lane || "").trim()
  return raw && raw !== "unassigned-lane" ? raw : wholeSystemLane
}

function topFreshCandidates(pixel = {}){
  const traffic = Array.isArray(pixel.trafficLocationMap) ? pixel.trafficLocationMap : []
  return traffic.slice(0, 12).map((item) => {
    const lane = canonicalLane(item.lane)
    return {
      lane,
      path: item.path || "/",
      origin: item.origin || "unknown",
      visitors: numberValue(item.visitors),
      pageViews: numberValue(item.pageViews),
      secondActions: numberValue(item.secondActions),
      glbPreviewPlays: numberValue(item.glbPreviewPlays),
      podcastInterrupts: numberValue(item.podcastInterrupts),
      autoplayStarts: numberValue(item.autoplayStarts),
      searches: numberValue(item.searches),
      proofRouteOpens: numberValue(item.proofRouteOpens),
      sourceOpens: numberValue(item.sourceOpens),
      nextRoute: routeForCandidate({...item, lane}),
      sourceBridge: lane === wholeSystemLane ? wholeSystemBridge : `/digitalhut-proof-source-conversion-bridge.json#${lane.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`
    }
  })
}

async function main(){
  const response = await fetch(endpoint)
  if(!response.ok) throw new Error(`insight-map read failed ${response.status}`)
  const insight = await response.json()
  const pixel = insight.pixel || {}
  const currentTotals = totalsFromPixel(pixel)
  const previous = readJson(publicPath, {})
  const baseline = reset || !previous?.sidePocketBaseline
    ? {
      capturedAt: new Date().toISOString(),
      reason: "Old pocket put to the side. Future reports should speak in fresh deltas unless archive totals are requested.",
      ...currentTotals
    }
    : previous.sidePocketBaseline
  const freshDelta = deltaTotals(currentTotals, baseline)
  const report = {
    generatedAt: new Date().toISOString(),
    status: "fresh-audience-collection-ready",
    rule: "Do not report the side-pocket totals as live movement. Report fresh deltas above this baseline only.",
    sidePocketBaseline: baseline,
    freshDelta,
    freshDecision: freshDelta.proof > 0 || freshDelta.source > 0
      ? "stack-this-pool"
      : freshDelta.pageViews > 0 || freshDelta.uniqueVisitors > 0 || freshDelta.totalEvents > 0
        ? "fresh-movement-needs-second-action"
        : "no-fresh-movement-yet",
    nextAction: freshDelta.proof > 0 || freshDelta.source > 0
      ? "Promote the lane that opened proof/source."
      : "Keep the old pocket aside, route new direct/home/blog visitors into full-system proof and source bridge paths.",
    currentCandidateMap: topFreshCandidates(pixel)
  }
  mkdirSync(dirname(publicPath), {recursive: true})
  mkdirSync(dirname(docsPath), {recursive: true})
  writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
  writeFileSync(docsPath, [
    "# DigitalHut Fresh Audience Collection",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "Old pocket is locked to the side. Reports should use fresh deltas.",
    "",
    "## Fresh Delta",
    "",
    `- Page views: ${freshDelta.pageViews}`,
    `- Participating browser IDs: ${freshDelta.uniqueVisitors}`,
    `- Total events: ${freshDelta.totalEvents}`,
    `- GLB: ${freshDelta.glb}`,
    `- Podcast: ${freshDelta.podcast}`,
    `- Autoplay: ${freshDelta.autoplay}`,
    `- Searches: ${freshDelta.searches}`,
    `- Market: ${freshDelta.market}`,
    `- Proof: ${freshDelta.proof}`,
    `- Source: ${freshDelta.source}`,
    "",
    `Decision: ${report.freshDecision}`,
    "",
    `Next action: ${report.nextAction}`,
    ""
  ].join("\n"), "utf8")
  console.log(JSON.stringify({
    ok: true,
    status: report.status,
    freshDelta,
    freshDecision: report.freshDecision,
    publicPath,
    docsPath
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
