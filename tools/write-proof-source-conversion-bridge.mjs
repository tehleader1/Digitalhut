import {mkdirSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const publicPath = "public/digitalhut-proof-source-conversion-bridge.json"
const docsPath = "docs/digitalhut-proof-source-conversion-bridge.md"
const site = "https://www.digitalhut.app"

async function fetchJson(url, fallback = {}){
  try {
    const response = await fetch(url, {headers: {"cache-control": "no-cache"}})
    if(!response.ok) return fallback
    return await response.json()
  } catch {
    return fallback
  }
}

function sourceBridgeForTarget(target = {}, index = 0){
  const rawLane = target.lane || "Full Entertainment Dapp Alternative"
  const isUnassigned = String(rawLane).toLowerCase() === "unassigned-lane"
  const lane = isUnassigned ? "DigitalHut 200M SEO Master List" : rawLane
  const slug = String(lane)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `lane-${index + 1}`
  const proofRoute = isUnassigned
    ? "/system-proof"
    : target.path && target.path !== "/"
    ? target.path
    : `/watch/${slug}`
  return {
    id: slug,
    lane,
    origin: target.origin || "unknown-origin",
    proofRoute,
    sourceBridgeUrl: `/digitalhut-proof-source-conversion-bridge.json#${isUnassigned ? "digitalhut-200m-seo-master-list" : slug}`,
    sourceIntentLabel: `${lane} source bridge`,
    currentVisitors: Number(target.visitors || 0),
    currentPageViews: Number(target.pageViews || 0),
    currentSecondActions: Number(target.secondActions || 0),
    currentGlbPlays: Number(target.glbPreviewPlays || 0),
    currentPodcastInterrupts: Number(target.podcastInterrupts || 0),
    currentAutoplayStarts: Number(target.autoplayStarts || 0),
    currentProofOpens: Number(target.proofRouteOpens || 0),
    currentSourceOpens: Number(target.sourceOpens || 0),
    conversionGoal: "Move from GLB/podcast/autoplay interest into proof_route_open and backlink_source_open.",
    nextPrompt: `Open ${lane} proof, then open the source bridge so the system can measure a useful source-backed continuation.`
  }
}

function coalesceBridgeTargets(targets = []){
  const grouped = new Map()
  for(const target of targets){
    const key = `${target.id}:${target.proofRoute}`
    const current = grouped.get(key)
    if(!current){
      grouped.set(key, {...target})
      continue
    }
    current.currentVisitors += Number(target.currentVisitors || 0)
    current.currentPageViews += Number(target.currentPageViews || 0)
    current.currentSecondActions += Number(target.currentSecondActions || 0)
    current.currentGlbPlays += Number(target.currentGlbPlays || 0)
    current.currentPodcastInterrupts += Number(target.currentPodcastInterrupts || 0)
    current.currentAutoplayStarts += Number(target.currentAutoplayStarts || 0)
    current.currentProofOpens += Number(target.currentProofOpens || 0)
    current.currentSourceOpens += Number(target.currentSourceOpens || 0)
  }
  return [...grouped.values()]
    .sort((a, b) =>
      (b.currentSecondActions - a.currentSecondActions) ||
      (b.currentVisitors - a.currentVisitors) ||
      (b.currentPageViews - a.currentPageViews)
    )
}

function wholeSystemBridge(pixel = {}, priorityTargets = []){
  const secondActions =
    Number(pixel.totalGlbPreviewPlays || 0) +
    Number(pixel.totalGlbReplicaPlays || 0) +
    Number(pixel.totalPodcastInterrupts || 0) +
    Number(pixel.totalAutoplayStarts || 0) +
    Number(pixel.totalSearchRuns || 0) +
    Number(pixel.totalMarketOpens || 0)
  return {
    id: "digitalhut-200m-seo-master-list",
    lane: "DigitalHut 200M SEO Master List",
    proofRoute: "/system-proof",
    sourceBridgeUrl: "/digitalhut-proof-source-conversion-bridge.json#digitalhut-200m-seo-master-list",
    sourceIntentLabel: "DigitalHut 200M SEO Master List proof and source bridge",
    role: "Convert any entry from the 200M SEO Master List into one measurable DigitalHut dapp action, not a separate category win.",
    dappProofEngine: {
      modules: ["video watching", "3D Model View", "podcast/source moments", "live analytics", "search/category routing", "Supabase telemetry", "Search Console proof"],
      rule: "Every longtail facet must have a useful dapp behavior behind it before promotion."
    },
    currentPageViews: Number(pixel.totalPageViews || 0),
    currentUniqueVisitors: Number(pixel.uniqueVisitors || 0),
    currentEvents: Number(pixel.totalEvents || 0),
    currentSecondActions: secondActions,
    currentProofOpens: Number(pixel.totalProofRouteOpens || 0),
    currentSourceOpens: Number(pixel.totalSourceOpens || 0),
    conversionGoal: "Move whole-system visitors from page view into GLB Model View, podcast/source, autoplay, search, market, proof route, or source/backlink open.",
    nextPrompt: "Stay in the full DigitalHut observatory: open the 3D Model View, play a podcast/source moment, use search, or open the system proof/source trail.",
    measurementSignals: [
      "GLB Model View open",
      "podcast/source interrupt",
      "autoplay start",
      "search intent",
      "market open",
      "proof route open",
      "source/backlink open"
    ],
    internalRotationArms: priorityTargets.slice(0, 8).map((target) => ({
      id: target.id,
      lane: target.lane,
      proofRoute: target.proofRoute,
      role: "facet feeding the same 200M SEO Master List bridge"
    }))
  }
}

const insight = await fetchJson(`${site}/api/insight-map?proof-source-bridge=${Date.now()}`)
const pixel = insight.pixel || {}
const targets = Array.isArray(pixel.trafficLocationMap) ? pixel.trafficLocationMap : []
const priorityTargets = coalesceBridgeTargets(targets
  .filter((target) => Number(target.secondActions || 0) > 0 || Number(target.pageViews || 0) > 0)
  .map(sourceBridgeForTarget))
  .slice(0, 12)
const primaryBridge = wholeSystemBridge(pixel, priorityTargets)

const report = {
  generatedAt: new Date().toISOString(),
  status: "proof-source-conversion-bridge-ready",
  site,
  currentRead: {
    pageViews: Number(pixel.totalPageViews || 0),
    uniqueVisitors: Number(pixel.uniqueVisitors || 0),
    totalEvents: Number(pixel.totalEvents || 0),
    glbPreviewPlays: Number(pixel.totalGlbPreviewPlays || 0),
    podcastInterrupts: Number(pixel.totalPodcastInterrupts || 0),
    autoplayStarts: Number(pixel.totalAutoplayStarts || 0),
    searches: Number(pixel.totalSearchRuns || 0),
    marketOpens: Number(pixel.totalMarketOpens || 0),
    proofRouteOpens: Number(pixel.totalProofRouteOpens || 0),
    sourceOpens: Number(pixel.totalSourceOpens || 0)
  },
  rule: "Do not call traffic duplicated until proofRouteOpens or sourceOpens rises above zero. This bridge treats the DigitalHut 200M SEO Master List as the strongest lane; categories, competitor reads, and route tests are facets that must feed the same dapp-backed proof/source path.",
  primaryBridge,
  priorityTargets,
  firstConversionCast: [primaryBridge, ...priorityTargets.slice(0, 4)].map((target) => ({
    lane: target.lane,
    proofRoute: target.proofRoute,
    sourceBridgeUrl: target.sourceBridgeUrl,
    reason: target.conversionGoal
  })),
  nextAction: "Keep the 200M SEO Master List bridge as the public conversion path. Use facets only to decide which doorway gets more sitemap pressure."
}

const md = `# DigitalHut Proof Source Conversion Bridge

Generated: ${report.generatedAt}

Current read: ${report.currentRead.pageViews} page views, ${report.currentRead.uniqueVisitors} participating browser IDs, ${report.currentRead.totalEvents} events.

Proof opens: ${report.currentRead.proofRouteOpens}
Source opens: ${report.currentRead.sourceOpens}

## 200M SEO Master List Bridge

- ${primaryBridge.lane}: ${primaryBridge.currentUniqueVisitors} visitors, ${primaryBridge.currentPageViews} page views, ${primaryBridge.currentSecondActions} second actions. Proof: ${primaryBridge.proofRoute}. Source: ${primaryBridge.sourceBridgeUrl}.

## Master List Facets

${priorityTargets.map((target) => `- ${target.lane}: ${target.currentVisitors} visitors, ${target.currentPageViews} page views, ${target.currentSecondActions} second actions. Proof: ${target.proofRoute}. Source: ${target.sourceBridgeUrl}.`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  currentRead: report.currentRead,
  priorityTargets: priorityTargets.length,
  nextAction: report.nextAction
}, null, 2))
