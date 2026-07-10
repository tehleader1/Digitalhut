import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname, resolve} from "node:path"

const repoRoot = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1))), "..")
const publicPath = resolve(repoRoot, "public", "digitalhut-master-list-evidence-latest.json")
const docsPath = resolve(repoRoot, "docs", "digitalhut-master-list-evidence-latest.json")
const publicComparePath = resolve(repoRoot, "public", "digitalhut-master-list-compare-latest.json")
const docsComparePath = resolve(repoRoot, "docs", "digitalhut-master-list-compare-latest.json")
const historyPath = resolve(repoRoot, "docs", "digitalhut-master-list-evidence-history.json")

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

function delta(current, previous, key){
  return number(current?.[key]) - number(previous?.[key])
}

function laneTrail(lane){
  const proofRoute = lane.proofRoute || `/watch/${lane.id}`
  const params = new URLSearchParams({lane: lane.lane, source: "master-list-compare"})
  return {
    canonicalProofRoute: proofRoute,
    sourceBridge: `/source-bridge?${params.toString()}#${lane.id}`,
    evidencePacket: `/digitalhut-master-list-evidence-latest.json#${lane.id}`,
    queryFamilies: Array.isArray(lane.queryFamilies) ? lane.queryFamilies.slice(0, 12) : [],
    backlinkTargets: Array.isArray(lane.backlinkTargets) ? lane.backlinkTargets : [],
    measurementSignals: Array.isArray(lane.measurementSignals) ? lane.measurementSignals : []
  }
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
    readJson(resolve(repoRoot, "docs", "digitalhut-search-console-ranking-test-20260707.json")),
    readJson(resolve(repoRoot, "public", "digitalhut-search-console-ranking-test.json")),
    readJson(resolve(repoRoot, "public", "digitalhut-indexing-push-status.json")),
    readJson(resolve(repoRoot, "public", "digitalhut-search-console-row-push.json"))
  ]
  const ranking = candidates.find((entry) => entry?.freshRows !== undefined || entry?.finalRows !== undefined || entry?.compareAndContrast || entry?.searchAnalytics) || {}
  const indexing = candidates.find((entry) => entry?.searchConsole || entry?.indexing) || {}
  const compare = ranking.compareAndContrast || ranking.searchAnalytics || indexing.searchConsole || {}
  const analytics = ranking.searchAnalyticsFresh || ranking.searchAnalyticsFinal || compare
  const topRows = Array.isArray(analytics.topRows) ? analytics.topRows : []
  const queryTerms = topRows.map((row) => String(row?.keys?.[0] || "").toLowerCase()).filter(Boolean)
  const functionalityTerms = ["3d", "glb", "video", "podcast", "analytics", "observatory", "dapp", "research", "autoplay"]
  const functionalityRows = queryTerms.filter((query) => functionalityTerms.some((term) => query.includes(term))).length
  return {
    freshRows: number(ranking.freshRows ?? ranking.finalRows ?? analytics.rowCount ?? compare.freshRows ?? compare.rowCount ?? compare.rows),
    freshImpressions: number(ranking.freshImpressions ?? ranking.finalImpressions ?? analytics.totalImpressions ?? compare.freshImpressions ?? compare.totalImpressions ?? compare.impressions),
    freshClicks: number(ranking.freshClicks ?? ranking.finalClicks ?? analytics.totalClicks ?? compare.freshClicks ?? compare.totalClicks ?? compare.clicks),
    averagePosition: number(analytics.averagePosition),
    topQueries: queryTerms.slice(0, 10),
    functionalityRows,
    querySignal: functionalityRows > 0 ? "functionality-query-evidence" : queryTerms.length ? "near-brand-or-unclassified-query" : "no-query-evidence",
    indexedRepresentatives: number(ranking.indexedProofFacet?.indexedRepresentativeCount ?? compare.indexedInspectionTargets),
    discoveredRepresentatives: number(ranking.indexedProofFacet?.discoveredRepresentativeCount ?? compare.discoveredInspectionTargets),
    source: Object.keys(ranking).length ? "live-search-console-receipt" : "no-current-search-console-receipt"
  }
}

async function main(){
  const previousReceipt = readJson(publicPath)
  const coverage = readJson(resolve(repoRoot, "public", "digitalhut-master-keyword-coverage.json"))
  const routeAudit = readJson(resolve(repoRoot, "public", "digitalhut-route-coverage-audit.json"))
  const livePayload = await productionRead()
  const pixel = livePayload.pixel || {}
  const observedLanes = Array.isArray(pixel.topMasterKeywordLanes) ? pixel.topMasterKeywordLanes : []
  const coverageLanes = Array.isArray(coverage.lanes) ? coverage.lanes : []
  const searchConsole = searchConsoleRead()
  const unassigned = observedLanes.find((lane) => normalize(lane.lane) === "unassigned lane") || {}
  const totalEvents = number(pixel.totalEvents)

  const previousById = new Map((previousReceipt.laneEvidence || []).map((lane) => [lane.id, lane]))
  const laneEvidence = coverageLanes.map((lane) => {
    const matches = observedLanes.filter((observed) => laneMatches(lane, observed.lane))
    const score = matches.reduce((sum, observed) => sum + scoreObservedLane(observed), 0)
    const proof = matches.reduce((sum, observed) => sum + number(observed.proofOpens), 0)
    const source = matches.reduce((sum, observed) => sum + number(observed.sourceOpens), 0)
    const current = {
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
      sourceOpens: source,
      trail: laneTrail(lane)
    }
    const previous = previousById.get(lane.id) || {}
    const movement = {
      events: delta(current, previous, "events"),
      pageViews: delta(current, previous, "pageViews"),
      secondActions: delta(current, previous, "secondActions"),
      proofOpens: delta(current, previous, "proofOpens"),
      sourceOpens: delta(current, previous, "sourceOpens"),
      evidenceScore: delta(current, previous, "evidenceScore")
    }
    const publicAuthorityMovement = movement.proofOpens + movement.sourceOpens
    const behaviorMovement = movement.pageViews + movement.secondActions
    return {
      ...current,
      movement,
      decision: publicAuthorityMovement > 0
        ? "promote-canonical-route"
        : behaviorMovement > 0
          ? "reinforce-proof-source-trail"
          : "hold-and-observe"
    }
  }).sort((left, right) => right.evidenceScore - left.evidenceScore)

  const previousProduction = previousReceipt.production || {}
  const productionDelta = {
    pageViews: number(pixel.totalPageViews) - number(previousProduction.pageViews),
    uniqueVisitors: number(pixel.uniqueVisitors) - number(previousProduction.uniqueVisitors),
    totalEvents: totalEvents - number(previousProduction.totalEvents),
    secondActions: number(pixel.totalGlbPreviewPlays) + number(pixel.totalPodcastInterrupts) + number(pixel.totalAutoplayStarts) + number(pixel.totalSearchRuns) + number(pixel.totalMarketOpens) - number(previousProduction.secondActions),
    proofOpens: number(pixel.totalProofRouteOpens) - number(previousProduction.proofOpens),
    sourceOpens: number(pixel.totalSourceOpens) - number(previousProduction.sourceOpens),
    masterKeywordDoorEvents: number(pixel.totalMasterKeywordDoorEvents) - number(previousProduction.masterKeywordDoorEvents)
  }
  const previousSearchConsole = previousReceipt.searchConsole || {}
  const searchConsoleDelta = {
    rows: searchConsole.freshRows - number(previousSearchConsole.freshRows),
    impressions: searchConsole.freshImpressions - number(previousSearchConsole.freshImpressions),
    clicks: searchConsole.freshClicks - number(previousSearchConsole.freshClicks),
    indexedRepresentatives: searchConsole.indexedRepresentatives - number(previousSearchConsole.indexedRepresentatives),
    discoveredRepresentatives: searchConsole.discoveredRepresentatives - number(previousSearchConsole.discoveredRepresentatives)
  }

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
    compareAndContrast: {
      previousGeneratedAt: previousReceipt.generatedAt || null,
      productionDelta,
      searchConsoleDelta,
      movingLanes: laneEvidence.filter((lane) => Object.values(lane.movement).some((value) => value > 0)).map((lane) => lane.id),
      promotionReadyLanes: laneEvidence.filter((lane) => lane.decision === "promote-canonical-route").map((lane) => lane.id),
      trailCoverage: {
        lanes: laneEvidence.length,
        canonicalProofRoutes: laneEvidence.filter((lane) => lane.trail.canonicalProofRoute).length,
        sourceBridges: laneEvidence.filter((lane) => lane.trail.sourceBridge).length,
        evidencePackets: laneEvidence.filter((lane) => lane.trail.evidencePacket).length,
        complete: laneEvidence.every((lane) => lane.trail.canonicalProofRoute && lane.trail.sourceBridge && lane.trail.evidencePacket)
      }
    },
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
  const compareReceipt = {
    generatedAt: receipt.generatedAt,
    status: "master-list-compare-complete",
    truthBoundary: receipt.truthBoundary,
    masterList: receipt.masterList,
    compareAndContrast: receipt.compareAndContrast,
    laneDecisions: laneEvidence.map(({id, lane, evidenceState, movement, decision, trail}) => ({
      id, lane, evidenceState, movement, decision, trail
    }))
  }
  writeFileSync(publicComparePath, `${JSON.stringify(compareReceipt, null, 2)}\n`, "utf8")
  writeFileSync(docsComparePath, `${JSON.stringify(compareReceipt, null, 2)}\n`, "utf8")
  const history = readJson(historyPath, {snapshots: []})
  const snapshots = Array.isArray(history.snapshots) ? history.snapshots : []
  snapshots.push({
    generatedAt: receipt.generatedAt,
    production: receipt.production,
    searchConsole: receipt.searchConsole,
    productionDelta,
    searchConsoleDelta,
    movingLanes: receipt.compareAndContrast.movingLanes,
    promotionReadyLanes: receipt.compareAndContrast.promotionReadyLanes
  })
  writeFileSync(historyPath, `${JSON.stringify({status: "master-list-history", snapshots: snapshots.slice(-60)}, null, 2)}\n`, "utf8")
  console.log(JSON.stringify({
    status: receipt.status,
    universe: receipt.masterList.internalVariationCapacity,
    observedLanes: laneEvidence.filter((lane) => lane.evidenceScore > 0).length,
    unassignedShare: receipt.production.unassignedShare,
    proofOpens: receipt.production.proofOpens,
    sourceOpens: receipt.production.sourceOpens
    ,movingLanes: receipt.compareAndContrast.movingLanes.length
    ,trailCoverage: receipt.compareAndContrast.trailCoverage.complete
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
