import {execFileSync} from "node:child_process"
import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-active-client-attempt-cycle.json"
const docsPath = "docs/digitalhut-active-client-attempt-cycle.md"
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

const steps = [
  {id: "search-console", script: "tools/search-console-ranking-test.mjs"},
  {id: "fresh-audience", script: "tools/write-fresh-audience-collection.mjs"},
  {id: "proof-source-bridge", script: "tools/write-proof-source-conversion-bridge.mjs"},
  {id: "master-keyword-rotation", script: "tools/write-master-keyword-rotation.mjs"},
  {id: "client-attempt-router", script: "tools/write-client-attempt-router.mjs"},
  {id: "audience-duplication", script: "tools/write-audience-duplication-battle-shout.mjs"},
  {id: "ladder-match-architecture", script: "tools/write-ladder-match-architecture.mjs"},
  {id: "external-comparable-system-tests", script: "tools/write-external-comparable-system-tests.mjs"},
  {id: "google-cloud-api-consumption-read", script: "tools/write-google-cloud-api-consumption-read.mjs"},
  {id: "seo-cycle-receipt", script: "tools/write-seo-cycle-receipt.mjs"},
  {id: "sitemap-row-push", script: "tools/generate-search-console-row-sitemaps.mjs"},
  {id: "metric-contract", script: "tools/verify-metric-contract.mjs"},
  {id: "route-crawl-shells", script: "tools/generate-route-crawl-shells.mjs"},
  {id: "seo-structure-reevaluation", script: "tools/write-seo-structure-reevaluation.mjs"}
]

function readJson(path, fallback = {}){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return fallback
  }
}

async function fetchJson(url, fallback = {}){
  try {
    const response = await fetch(url, {headers: {"cache-control": "no-cache"}})
    if(!response.ok) return {...fallback, status: response.status}
    return await response.json()
  } catch (error) {
    return {...fallback, error: error?.message || "fetch failed"}
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
  const compare = searchConsole.compareAndContrast || {}
  const proof = searchConsole.masterKeywordPublicProof || {}
  return {
    freshRows: numberValue(searchConsole.searchAnalyticsFresh?.rowCount ?? searchConsole.freshRows),
    freshImpressions: numberValue(searchConsole.searchAnalyticsFresh?.totalImpressions ?? searchConsole.freshImpressions),
    freshClicks: numberValue(searchConsole.searchAnalyticsFresh?.totalClicks ?? searchConsole.freshClicks),
    finalRows: numberValue(searchConsole.searchAnalyticsFinal?.rowCount ?? searchConsole.finalRows),
    finalImpressions: numberValue(searchConsole.searchAnalyticsFinal?.totalImpressions ?? searchConsole.finalImpressions),
    finalClicks: numberValue(searchConsole.searchAnalyticsFinal?.totalClicks ?? searchConsole.finalClicks),
    indexedInspectionTargets: numberValue(compare.indexedInspectionTargets),
    discoveredInspectionTargets: numberValue(compare.discoveredInspectionTargets),
    unknownInspectionTargets: numberValue(compare.unknownInspectionTargets),
    sitemapSurfacesVisible: numberValue(compare.sitemapSurfacesVisible),
    sitemapSurfacesPending: numberValue(compare.sitemapSurfacesPending),
    totalSitemapRows: numberValue(proof.totalSitemapRows),
    masterKeywordRows: numberValue(proof.masterKeywordRows),
    routeCrawlShellCount: numberValue(proof.routeCrawlShellCount),
    rankingTruth: searchConsole.rankingTruth || "not-read"
  }
}

function runStep(step){
  const startedAt = new Date().toISOString()
  try {
    const output = execFileSync(process.execPath, [step.script], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 1024 * 1024 * 8
    })
    return {
      id: step.id,
      script: step.script,
      status: "ok",
      startedAt,
      completedAt: new Date().toISOString(),
      outputTail: output.trim().split(/\r?\n/).slice(-8).join("\n")
    }
  } catch (error) {
    return {
      id: step.id,
      script: step.script,
      status: "failed",
      startedAt,
      completedAt: new Date().toISOString(),
      message: error?.message || "step failed",
      outputTail: String(error?.stdout || error?.stderr || "").trim().split(/\r?\n/).slice(-8).join("\n")
    }
  }
}

const stepResults = []
for(const step of steps){
  const result = runStep(step)
  stepResults.push(result)
  if(result.status !== "ok") break
}

const insight = await fetchJson(`${site}/api/insight-map?active-cycle=${Date.now()}`, {})
const currentTotals = totalsFromPixel(insight?.pixel || {})
const freshDelta = deltaTotals(currentTotals)
const searchConsole = searchConsoleSummary(readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {}))
const clientAttempt = readJson("public/digitalhut-client-attempt-router.json", {})
const rotation = readJson("public/digitalhut-master-keyword-rotation.json", {})
const sitemapPush = readJson("public/digitalhut-search-console-row-push.json", {})
const routeShells = readJson("dist/digitalhut-route-crawl-shells.json", {})
if(routeShells.routeCount) searchConsole.routeCrawlShellCount = numberValue(routeShells.routeCount)
const duplication = readJson("public/digitalhut-audience-duplication-battle-shout.json", {})
const ladder = readJson("public/digitalhut-ladder-match-architecture.json", {})

const secondActionDelta = freshDelta.glb + freshDelta.podcast + freshDelta.autoplay + freshDelta.searches + freshDelta.market
let decision = "dry-cycle-keep-rotating"
if(freshDelta.proof > 0 || freshDelta.source > 0) decision = "proof-source-hit-stack-this-lane"
else if(secondActionDelta > 0) decision = "second-action-lift-duplicate-once"
else if(freshDelta.pageViews > 0 || freshDelta.uniqueVisitors > 0 || freshDelta.totalEvents > 0) decision = "weak-entry-lift-bridge-to-second-action"

const strongestAttempt = clientAttempt.wholeSystemAttempt || clientAttempt.strongestAttempt || null
const internalRotationArm = strongestAttempt?.internalRotationArm || strongestAttempt?.strongestRotationArm || null
const wholeSystemAttractionUniverse = internalRotationArm || strongestAttempt?.wholeSystemAttractionUniverse || null
const measurableFacet = strongestAttempt?.measurableFacet || wholeSystemAttractionUniverse || null
const report = {
  generatedAt: new Date().toISOString(),
  status: "active-client-attempt-cycle-produced",
  site,
  mode: "build + rotate + attempt + measure",
  guardrail: "No Google rank claim is made until Search Console query rows, clicks, impressions, and a previous snapshot allow comparison.",
  baseline,
  currentTotals,
  freshDelta,
  secondActionDelta,
  decision,
  searchConsole,
  sitemap: {
    totalRows: numberValue(sitemapPush.producedTotalSitemapUrlRows || sitemapPush.totalRows || searchConsole.totalSitemapRows),
    urlRows: numberValue(sitemapPush.producedUrlRows || sitemapPush.urlRows),
    masterRows: numberValue(sitemapPush.producedMasterKeywordUrlRows || sitemapPush.masterRows || searchConsole.masterKeywordRows),
    universe: numberValue(sitemapPush.verifiedMasterKeywordUniverse || sitemapPush.universe || 200572944),
    routeCrawlShellCount: numberValue(routeShells.routeCount || searchConsole.routeCrawlShellCount)
  },
  strongestAttempt,
  nextAttempt: strongestAttempt ? {
    lane: strongestAttempt.lane,
    route: strongestAttempt.proofRoute,
    cast: strongestAttempt.intentPhrases?.[0] || clientAttempt.nextCast,
    winCondition: strongestAttempt.requiredWinCondition,
    measurementSignals: strongestAttempt.measurementSignals || []
  } : null,
  internalRotationArm,
  wholeSystemAttractionUniverse,
  rotation: {
    status: rotation.status || "not-read",
    role: "the DigitalHut 200M SEO Master List is the strongest lane; every lane, route, source, comparison, and behavior read is a measurable facet inside that list",
    strongestLane: rotation.strongestLane || rotation.allocations?.[0]?.lane || null,
    allocationCount: Array.isArray(rotation.allocations) ? rotation.allocations.length : 0
  },
  measurableFacet,
  duplication: {
    status: duplication.status || "not-read",
    nextAction: duplication.nextAction || "not-read",
    targetCount: Array.isArray(duplication.duplicationTargets) ? duplication.duplicationTargets.length : 0
  },
  ladder: {
    status: ladder.status || "not-read",
    definition: ladder.definition || "not-read",
    matchCount: Array.isArray(ladder.matches) ? ladder.matches.length : 0,
    standingsCount: Array.isArray(ladder.standings) ? ladder.standings.length : 0,
    nextServerMove: ladder.nextServerMove || "not-read"
  },
  steps: stepResults,
  failedStep: stepResults.find((step) => step.status !== "ok") || null,
  nextAction: decision === "proof-source-hit-stack-this-lane"
    ? "Stack the whole-system path that produced proof/source movement and preserve its route/source language."
    : decision === "second-action-lift-duplicate-once"
      ? "Duplicate the whole-system path around the moved arm one time, then require proof/source before expanding."
      : decision === "weak-entry-lift-bridge-to-second-action"
        ? "Keep the 200M SEO Master List as the attempt, but aim the next pass at GLB, podcast/source, autoplay, search, or market."
        : "Rotate the internal facets while keeping the 200M SEO Master List and 50,000 sitemap window fresh."
}

const md = `# DigitalHut Active Client Attempt Cycle

Generated: ${report.generatedAt}

Mode: ${report.mode}

Decision: ${report.decision}

Fresh delta: +${freshDelta.pageViews} page views, +${freshDelta.uniqueVisitors} unique visitors, +${freshDelta.totalEvents} events.

Second actions: GLB +${freshDelta.glb}, podcast +${freshDelta.podcast}, autoplay +${freshDelta.autoplay}, search +${freshDelta.searches}, market +${freshDelta.market}, proof +${freshDelta.proof}, source +${freshDelta.source}.

Search Console: ${searchConsole.freshRows} fresh rows, ${searchConsole.freshImpressions} impressions, ${searchConsole.freshClicks} clicks.

Sitemap: ${report.sitemap.totalRows} total rows, ${report.sitemap.masterRows} master keyword rows.

Strongest lane: ${strongestAttempt ? `${strongestAttempt.lane} at ${strongestAttempt.proofRoute}` : "not available"}.

Master list proof anchor: ${internalRotationArm ? `${internalRotationArm.lane} at ${internalRotationArm.proofRoute}` : "not available"}.

Dapp-backed SEO universe: ${wholeSystemAttractionUniverse ? `${wholeSystemAttractionUniverse.lane} at ${wholeSystemAttractionUniverse.proofRoute}` : "not available"}.

Measurable facet: ${measurableFacet ? `${measurableFacet.lane} at ${measurableFacet.proofRoute}` : "not available"}.

Ladder matches: ${report.ladder.matchCount} matches, ${report.ladder.standingsCount} standings. ${report.ladder.nextServerMove}

Next action: ${report.nextAction}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: !report.failedStep,
  publicPath,
  docsPath,
  decision,
  freshDelta,
  searchConsole,
  sitemap: report.sitemap,
  strongestAttempt: strongestAttempt ? {
    lane: strongestAttempt.lane,
    route: strongestAttempt.proofRoute,
    internalRotationArm,
    wholeSystemAttractionUniverse,
    measurableFacet
  } : null,
  failedStep: report.failedStep
}, null, 2))

if(report.failedStep) process.exitCode = 1
