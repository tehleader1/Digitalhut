import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname, resolve} from "node:path"

const repoRoot = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1))), "..")
const publicPath = resolve(repoRoot, "public", "digitalhut-master-list-evidence-latest.json")
const docsPath = resolve(repoRoot, "docs", "digitalhut-master-list-evidence-latest.json")

function readJson(path, fallback = {}){
  try {
    return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""))
  } catch {
    return fallback
  }
}

function number(value){
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalize(value){
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function laneMatches(coverageLane, observedLane){
  const expected = normalize(`${coverageLane.id} ${coverageLane.lane} ${coverageLane.category}`)
  const observed = normalize(observedLane)
  if(!observed || observed === "unassigned lane") return false
  if(expected.includes(observed) || observed.includes(normalize(coverageLane.lane))) return true
  const aliases = {
    "full-entertainment-dapp-alternative": ["digitalhut 200m seo master list", "full entertainment dapp alternative", "mainstream streaming", "after work relax viewer"],
    "gaming-3d-world-observatory": ["gaming glb viewer", "automatic 3d autoplay system"],
    "ai-video-podcast-source-explainer": ["research podcast viewer"],
    "market-company-observatory": ["market observatory"],
    "local-life-errands-companion": ["errands and review before buying"]
  }
  return (aliases[coverageLane.id] || []).includes(observed)
}

function scoreObservedLane(lane){
  return number(lane.pageViews)
    + number(lane.glbPlays) * 4
    + number(lane.podcastInterrupts) * 5
    + number(lane.searches) * 6
    + number(lane.proofOpens) * 12
    + number(lane.sourceOpens) * 12
}

async function productionRead(){
  const response = await fetch("https://www.digitalhut.app/api/insight-map", {
    headers: {"User-Agent": "DigitalHut-Master-List-Evidence/1.0"},
    signal: AbortSignal.timeout(15_000)
  })
  if(!response.ok) throw new Error(`insight-map returned ${response.status}`)
  return response.json()
}

function searchConsoleRead(){
  const candidates = [
    "digitalhut-search-console-ranking-test.json",
    "digitalhut-indexing-push-status.json",
    "digitalhut-search-console-row-push.json"
  ].map((name) => readJson(resolve(repoRoot, "public", name)))
  const ranking = candidates.find((entry) => entry?.compareAndContrast || entry?.searchAnalytics) || {}
  const indexing = candidates.find((entry) => entry?.searchConsole || entry?.indexing) || {}
  const compare = ranking.compareAndContrast || ranking.searchAnalytics || indexing.searchConsole || {}
  return {
    freshRows: number(compare.freshRows || compare.rowCount || compare.rows),
    freshImpressions: number(compare.freshImpressions || compare.totalImpressions || compare.impressions),
    freshClicks: number(compare.freshClicks || compare.totalClicks || compare.clicks),
    source: Object.keys(compare).length ? "saved-search-console-receipt" : "no-current-search-console-receipt"
  }
}

async function main(){
  const coverage = readJson(resolve(repoRoot, "public", "digitalhut-master-keyword-coverage.json"))
  const routeAudit = readJson(resolve(repoRoot, "public", "digitalhut-route-coverage-audit.json"))
  const livePayload = await productionRead()
  const pixel = livePayload.pixel || {}
  const observedLanes = Array.isArray(pixel.topMasterKeywordLanes) ? pixel.topMasterKeywordLanes : []
  const coverageLanes = Array.isArray(coverage.lanes) ? coverage.lanes : []
  const searchConsole = searchConsoleRead()
  const unassigned = observedLanes.find((lane) => normalize(lane.lane) === "unassigned lane") || {}
  const totalEvents = number(pixel.totalEvents)

  const laneEvidence = coverageLanes.map((lane) => {
    const matches = observedLanes.filter((observed) => laneMatches(lane, observed.lane))
    const score = matches.reduce((sum, observed) => sum + scoreObservedLane(observed), 0)
    const proof = matches.reduce((sum, observed) => sum + number(observed.proofOpens), 0)
    const source = matches.reduce((sum, observed) => sum + number(observed.sourceOpens), 0)
    return {
      id: lane.id,
      lane: lane.lane,
      variationCapacity: number(lane.variationCapacity),
      proofRoute: lane.proofRoute,
      evidenceScore: score,
      evidenceState: proof > 0 || source > 0 ? "conversion-evidence" : score > 0 ? "behavior-evidence" : "unobserved-candidate",
      observedAliases: matches.map((match) => match.lane),
      events: matches.reduce((sum, observed) => sum + number(observed.events), 0),
      pageViews: matches.reduce((sum, observed) => sum + number(observed.pageViews), 0),
      secondActions: matches.reduce((sum, observed) => sum + number(observed.glbPlays) + number(observed.podcastInterrupts) + number(observed.searches), 0),
      proofOpens: proof,
      sourceOpens: source
    }
  }).sort((left, right) => right.evidenceScore - left.evidenceScore)

  const receipt = {
    generatedAt: new Date().toISOString(),
    status: "master-list-evidence-connected",
    truthBoundary: "The 200,572,944 value is deterministic internal variation capacity. Public search ownership requires indexed canonical routes, impressions, clicks, and user conversions.",
    storageMode: "healthy-system-drive-and-cloud-evidence",
    fireCudaStatus: "quarantined-after-confirmed-bad-block-readback",
    masterList: {
      internalVariationCapacity: number(coverage.totalIndividualRanks),
      countedLanes: number(coverage.universalClaimRows || coverage.coverageRows),
      internalSelectionWindow: number(coverage.internalSelectedRotationRows || coverage.masterKeywordSitemapUrlRows || 50_000),
      publicCanonicalRoutes: number(coverage.publicCanonicalMasterSitemapUrlRows || coverage.materializedSitemapUrlRows),
      publicQueryParameterRows: number(coverage.publicQueryParameterSitemapRows)
    },
    production: {
      generatedAt: livePayload.generatedAt,
      pageViews: number(pixel.totalPageViews),
      uniqueVisitors: number(pixel.uniqueVisitors),
      totalEvents,
      secondActions: number(pixel.totalGlbPreviewPlays) + number(pixel.totalPodcastInterrupts) + number(pixel.totalAutoplayStarts) + number(pixel.totalSearchRuns) + number(pixel.totalMarketOpens),
      proofOpens: number(pixel.totalProofRouteOpens),
      sourceOpens: number(pixel.totalSourceOpens),
      masterKeywordDoorEvents: number(pixel.totalMasterKeywordDoorEvents),
      unassignedEvents: number(unassigned.events),
      unassignedShare: totalEvents ? Number((number(unassigned.events) / totalEvents).toFixed(4)) : 0
    },
    searchConsole,
    routeContract: {
      status: routeAudit.status || "unknown",
      metadataRoutes: number(routeAudit.metadataRoutes),
      sitemapProofRoutes: number(routeAudit.sitemapProofRoutes),
      missingRoutes: routeAudit.missingMetadataRoutes || []
    },
    laneEvidence,
    decisions: [
      {
        priority: 1,
        action: "assign-future-generic-events-to-master-list",
        reason: `${number(unassigned.events)} of ${totalEvents} events are historically unassigned; the pixel contract now defaults future generic controls to the full-system lane.`
      },
      {
        priority: 2,
        action: "convert-behavior-to-proof-and-source",
        reason: `${number(pixel.totalProofRouteOpens)} proof opens and ${number(pixel.totalSourceOpens)} source opens remain the missing public authority signals.`
      },
      {
        priority: 3,
        action: "hold-canonical-route-shape",
        reason: "Retune internal selection weights from observed behavior and Search Console evidence; do not publish millions of thin or parameter-duplicate URLs."
      }
    ]
  }

  mkdirSync(dirname(publicPath), {recursive: true})
  mkdirSync(dirname(docsPath), {recursive: true})
  writeFileSync(publicPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
  writeFileSync(docsPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
  console.log(JSON.stringify({
    status: receipt.status,
    universe: receipt.masterList.internalVariationCapacity,
    observedLanes: laneEvidence.filter((lane) => lane.evidenceScore > 0).length,
    unassignedShare: receipt.production.unassignedShare,
    proofOpens: receipt.production.proofOpens,
    sourceOpens: receipt.production.sourceOpens
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
