import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const generatedAt = new Date().toISOString()
const publicPath = "public/digitalhut-seo-structure-reevaluation.json"
const docsPath = "docs/digitalhut-seo-structure-reevaluation.md"

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

const masterListLane = "DigitalHut 200M SEO Master List"
const masterListBridge = "/digitalhut-proof-source-conversion-bridge.json#digitalhut-200m-seo-master-list"
const staleMasterListLabels = [
  "DigitalHut 200M Whole-System Entertainment Dapp Universe",
  "DigitalHut 200M Whole System Entertainment Dapp Universe",
  "DigitalHut 200M Whole-System Universe"
]

function normalizeMasterListLane(lane){
  const value = lane || "unknown"
  return staleMasterListLabels.includes(value) ? masterListLane : value
}

function normalizeMasterListBridge(sourceBridge){
  if(!sourceBridge) return masterListBridge
  return sourceBridge.includes("digitalhut-200m-whole-system-universe")
    ? masterListBridge
    : sourceBridge
}

function normalizeRouteCandidate(item = {}){
  return {
    ...item,
    lane: normalizeMasterListLane(item.lane),
    sourceBridge: normalizeMasterListBridge(item.sourceBridge)
  }
}

function clamp(value, min = 0, max = 100){
  return Math.max(min, Math.min(max, Number(value) || 0))
}

function totalsFromInsight(insight = {}){
  const pixel = insight.pixel || {}
  return {
    pageViews: numberValue(pixel.totalPageViews),
    uniqueVisitors: numberValue(pixel.uniqueVisitors),
    totalEvents: numberValue(pixel.totalEvents),
    blogViews: numberValue(pixel.totalBlogViews),
    glb: numberValue(pixel.totalGlbPreviewPlays) + numberValue(pixel.totalGlbReplicaPlays),
    podcast: numberValue(pixel.totalPodcastInterrupts),
    autoplay: numberValue(pixel.totalAutoplayStarts),
    searches: numberValue(pixel.totalSearchRuns),
    market: numberValue(pixel.totalMarketOpens),
    proof: numberValue(pixel.totalProofRouteOpens),
    source: numberValue(pixel.totalSourceOpens),
    masterKeywordDoorEvents: numberValue(pixel.totalMasterKeywordDoorEvents),
    freshDecision: pixel.freshAudience?.decision || "not-read",
    routeCandidates: (pixel.freshAudience?.routeCandidates || pixel.movementDuplicator?.routeCandidates || []).map(normalizeRouteCandidate),
    masterKeywordDoorTrail: Array.isArray(pixel.masterKeywordDoorTrail) ? pixel.masterKeywordDoorTrail : [],
    masterKeywordDoorSourceSummary: Array.isArray(pixel.masterKeywordDoorSourceSummary) ? pixel.masterKeywordDoorSourceSummary : []
  }
}

function cachedInsightFromEvidence(masterEvidence = {}, sectorCycle = {}, pixelCompare = {}){
  const production = masterEvidence.production || {}
  const behavior = sectorCycle.measuredBehavior || {}
  const exportSignals = pixelCompare.exportSignalTotals || {}
  return {
    cachedEvidence: true,
    pixel: {
      totalPageViews: numberValue(behavior.pageViews || production.pageViews),
      uniqueVisitors: numberValue(behavior.uniqueVisitors || production.uniqueVisitors),
      totalEvents: numberValue(production.totalEvents),
      totalBlogViews: numberValue(production.blogViews),
      totalGlbPreviewPlays: numberValue(exportSignals.glbPreviewPlays),
      totalPodcastInterrupts: numberValue(exportSignals.podcastPlays),
      totalAutoplayStarts: numberValue(exportSignals.autoplayStarts || production.autoplayStarts),
      totalSearchRuns: numberValue(exportSignals.searchRuns || production.searches),
      totalMarketOpens: numberValue(exportSignals.marketOpens || production.marketOpens),
      totalProofRouteOpens: numberValue(behavior.proofOpens || production.proofOpens),
      totalSourceOpens: numberValue(behavior.sourceOpens || production.sourceOpens),
      totalMasterKeywordDoorEvents: numberValue(production.masterKeywordDoorEvents)
    }
  }
}

function searchConsoleSummary(searchConsole = {}){
  const compare = searchConsole.compareAndContrast || {}
  const publicProof = searchConsole.masterKeywordPublicProof || {}
  return {
    freshRows: numberValue(searchConsole.searchAnalyticsFresh?.rowCount),
    freshImpressions: numberValue(searchConsole.searchAnalyticsFresh?.totalImpressions),
    freshClicks: numberValue(searchConsole.searchAnalyticsFresh?.totalClicks),
    finalRows: numberValue(searchConsole.searchAnalyticsFinal?.rowCount),
    finalImpressions: numberValue(searchConsole.searchAnalyticsFinal?.totalImpressions),
    finalClicks: numberValue(searchConsole.searchAnalyticsFinal?.totalClicks),
    indexedInspectionTargets: numberValue(compare.indexedInspectionTargets),
    discoveredInspectionTargets: numberValue(compare.discoveredInspectionTargets),
    unknownInspectionTargets: numberValue(compare.unknownInspectionTargets),
    sitemapSurfacesVisible: numberValue(compare.sitemapSurfacesVisible),
    sitemapSurfacesPending: numberValue(compare.sitemapSurfacesPending),
    masterKeywordRows: numberValue(publicProof.masterKeywordRows),
    totalSitemapRows: numberValue(publicProof.totalSitemapRows),
    routeCrawlShellCount: numberValue(publicProof.routeCrawlShellCount),
    rankingTruth: searchConsole.rankingTruth || "not-read"
  }
}

function scoreGoogle(search = {}){
  return clamp(
    20 +
    search.sitemapSurfacesVisible * 12 +
    search.indexedInspectionTargets * 10 +
    search.discoveredInspectionTargets * 4 +
    search.freshRows * 18 +
    search.freshImpressions * 8 -
    search.unknownInspectionTargets * 2
  )
}

function scoreSitemap(search = {}, rowPush = {}){
  const masterRows = numberValue(rowPush.producedMasterKeywordUrlRows || search.masterKeywordRows)
  const totalRows = numberValue(rowPush.producedTotalSitemapUrlRows || search.totalSitemapRows)
  const universe = numberValue(rowPush.verifiedMasterKeywordUniverse || 200572944)
  return {
    score: clamp(25 + (masterRows >= 50000 ? 35 : masterRows / 1600) + (totalRows >= 50200 ? 20 : 0) + (universe >= 200000000 ? 15 : 0)),
    masterRows,
    totalRows,
    universe
  }
}

function scoreFireCuda(rotation = {}){
  const top = rotation.topAllocations || []
  const hasWholeSystem = JSON.stringify(top).toLowerCase().includes("full entertainment")
  const hasExploration = JSON.stringify(top).toLowerCase().match(/gaming|developer|research|local|wiki|home-project/)
  return clamp(30 + numberValue(top.length) * 4 + (hasWholeSystem ? 18 : 0) + (hasExploration ? 16 : 0))
}

function scoreDatabase(traffic = {}, insight = {}){
  const stackScore = numberValue(insight.stack?.liveScore)
  const secondActions = traffic.glb + traffic.podcast + traffic.autoplay + traffic.searches + traffic.market
  return clamp(20 + Math.min(30, traffic.uniqueVisitors / 4) + Math.min(25, secondActions / 4) + (stackScore >= 80 ? 18 : 0) + (traffic.proof || traffic.source ? 20 : 0))
}

function scoreProduction(active = {}, contract = {}){
  const proofNames = contract.events?.find((event) => event.canonicalEvent === "proof_route_open")?.emittedNames || []
  return clamp(35 + (active.status ? 15 : 0) + (active.strongestAttempt?.lane ? 15 : 0) + (proofNames.includes("proof_route_open") ? 15 : 0) + (proofNames.includes("zone_checkpoint_open") ? 10 : 0))
}

function strongestBottleneck(layers){
  return [...layers].sort((a, b) => a.score - b.score)[0]
}

function attractionRead(traffic = {}){
  const candidates = Array.isArray(traffic.routeCandidates) ? traffic.routeCandidates : []
  const totalCandidateVisitors = candidates.reduce((sum, item) => sum + numberValue(item.visitors), 0)
  const totalCandidateSecondActions = candidates.reduce((sum, item) => sum + numberValue(item.secondActions), 0)
  const byLane = candidates.map((item) => ({
    lane: normalizeMasterListLane(item.lane),
    origin: item.origin || "unknown",
    path: item.path || "",
    visitors: numberValue(item.visitors),
    pageViews: numberValue(item.pageViews),
    secondActions: numberValue(item.secondActions),
    proofRouteOpens: numberValue(item.proofRouteOpens),
    sourceOpens: numberValue(item.sourceOpens),
    nextRoute: item.nextRoute || "/system-proof",
    sourceBridge: normalizeMasterListBridge(item.sourceBridge),
    attractionQuality: numberValue(item.visitors) > 0
      ? Number((numberValue(item.secondActions) / Math.max(1, numberValue(item.visitors))).toFixed(2))
      : 0
  })).sort((a, b) => (b.visitors + b.secondActions) - (a.visitors + a.secondActions))
  const top = byLane[0] || null
  const secondActionRate = totalCandidateVisitors
    ? Number((totalCandidateSecondActions / totalCandidateVisitors).toFixed(2))
    : 0
  return {
    status: candidates.length ? "attraction-pocket-read" : "no-route-candidate-read",
    interpretation: "These are the pockets that already attracted the first audience. They are not final wins until proof/source opens move.",
    totalCandidateVisitors,
    totalCandidateSecondActions,
    secondActionRate,
    strongestPocket: top,
    attractionHypothesis: top
      ? `${top.origin} into ${top.lane} is currently attracting attention; refine its next route and source bridge so the same pull produces proof/source behavior.`
      : "No route candidate pocket is readable yet; keep the whole-system anchor stable.",
    refinementRule: "Keep the full entertainment dapp as the public promise, but tune the exact doorways that already created visitors and second actions.",
    pockets: byLane
  }
}

function decide({traffic, search, layers}){
  if(traffic.proof > 0 || traffic.source > 0){
    return {
      decision: "stack-proof-source-lane",
      reason: "Proof/source movement exists. Duplicate the source route and promote only that whole-system path."
    }
  }
  if(search.freshRows > 0 || search.freshImpressions > 0){
    return {
      decision: "protect-google-row-and-convert",
      reason: "Search Console has a live row/impression. Keep the sitemap stable and push users toward proof/source actions."
    }
  }
  if(traffic.masterKeywordDoorEvents > 0 && traffic.glb + traffic.podcast + traffic.autoplay + traffic.searches + traffic.market > 0){
    return {
      decision: "bridge-door-events-to-proof-source",
      reason: "Master keyword doors and second actions exist, but proof/source are still missing."
    }
  }
  const bottleneck = strongestBottleneck(layers)
  return {
    decision: "rotate-full-system-window",
    reason: `${bottleneck.name} is the lowest layer. Keep the 200M universe whole and rotate the 50K public window around the weakest proof layer.`
  }
}

const [
  liveInsight,
  searchConsole,
  rowPush,
  rotation,
  active,
  clientRouter,
  bridge,
  contract,
  receipt,
  masterEvidence,
  sectorCycle,
  pixelCompare
] = await Promise.all([
  fetchJson(`${site}/api/insight-map?reevaluation=${Date.now()}`, {}),
  Promise.resolve(readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {})),
  Promise.resolve(readJson("public/digitalhut-search-console-row-push.json", {})),
  Promise.resolve(readJson("public/digitalhut-master-keyword-rotation.json", {})),
  Promise.resolve(readJson("public/digitalhut-active-client-attempt-cycle.json", {})),
  Promise.resolve(readJson("public/digitalhut-client-attempt-router.json", {})),
  Promise.resolve(readJson("public/digitalhut-proof-source-conversion-bridge.json", {})),
  Promise.resolve(readJson("public/digitalhut-supabase-measurement-contract.json", {})),
  Promise.resolve(readJson("public/digitalhut-seo-cycle-receipt-latest.json", {})),
  Promise.resolve(readJson("public/digitalhut-master-list-evidence-latest.json", {})),
  Promise.resolve(readJson("public/digitalhut-sector-expansion-cycle.json", {})),
  Promise.resolve(readJson("public/digitalhut-supabase-search-pixel-compare.json", {}))
])

const insight = Object.keys(liveInsight || {}).length
  ? liveInsight
  : cachedInsightFromEvidence(masterEvidence, sectorCycle, pixelCompare)
const traffic = totalsFromInsight(insight)
traffic.readSource = insight.cachedEvidence ? "cached-verified-evidence" : "production-insight-map"
const search = searchConsoleSummary(searchConsole)
const universeState = clientRouter.wholeSystemAttempt || clientRouter.strongestAttempt || active.strongestAttempt || {}
const universeArm = universeState.internalRotationArm || universeState.strongestRotationArm || active.internalRotationArm || active.strongestAttempt?.internalRotationArm || null
const sitemap = scoreSitemap(search, rowPush)
const layers = [
  {
    id: "google-search-console",
    name: "Google Search Console",
    score: scoreGoogle(search),
    read: search,
    next: search.freshRows || search.freshImpressions
      ? "Hold sitemap shape and convert the visible query row into proof/source behavior."
      : "Keep sitemap submitted and use URL inspection/route shells until query rows expand."
  },
  {
    id: "master-seo-list",
    name: "200M Master SEO List",
    score: sitemap.score,
    read: sitemap,
    next: "Keep 50,000 public rows as the rotating window; do not dump thin pages."
  },
  {
    id: "firecuda-mapping",
    name: "FireCuda Mapping",
    score: scoreFireCuda(rotation),
    read: {
      status: rotation.status || "not-read",
      sourceOfTruth: rotation.sourceOfTruth || null,
      topAllocations: rotation.topAllocations || []
    },
    next: "Let Supabase behavior and Search Console rows retune the sitemap allocation weights."
  },
  {
    id: "supabase-database",
    name: "Supabase Database",
    score: scoreDatabase(traffic, insight),
    read: {
      totalEvents: traffic.totalEvents,
      uniqueVisitors: traffic.uniqueVisitors,
      secondActions: traffic.glb + traffic.podcast + traffic.autoplay + traffic.searches + traffic.market,
      proof: traffic.proof,
      source: traffic.source,
      stackScore: insight.stack?.liveScore ?? null,
      localReceiptWrite: receipt.database?.saved === true ? "saved" : receipt.database?.reason || "not-read"
    },
    next: "Treat GLB/podcast/autoplay/search as useful, but do not call the pull stacked until proof/source opens move."
  },
  {
    id: "vercel-production",
    name: "Vercel Production",
    score: scoreProduction(active, contract),
    read: {
      activeCycle: active.status || "not-read",
      strongestAttempt: active.strongestAttempt?.lane || null,
      proofContract: contract.events?.find((event) => event.canonicalEvent === "proof_route_open")?.emittedNames || []
    },
    next: "Deploy only when proof routes, source bridges, sitemap rows, or measurement contracts materially improve."
  }
]

const decision = decide({traffic, search, layers})
const attraction = attractionRead(traffic)
const packet = {
  generatedAt,
  status: "seo-structure-reevaluation-ready",
  site,
  mode: "Search Console + 200M master list + FireCuda mapping + Supabase behavior + Vercel production compare-and-contrast",
  guardrail: "This packet reevaluates SEO structure and public proof. It does not create fake traffic, fake backlinks, or fake Google ranking claims.",
  wholeSystemAnchor: {
    lane: universeState.lane || bridge.primaryBridge?.lane || "DigitalHut 200M SEO Master List",
    proofRoute: universeState.proofRoute || bridge.primaryBridge?.proofRoute || "/system-proof",
    sourceBridgeUrl: universeState.sourceBridgeUrl || bridge.primaryBridge?.sourceBridgeUrl || "/digitalhut-proof-source-conversion-bridge.json#digitalhut-200m-seo-master-list"
  },
  internalRotationArm: universeArm || {
    id: "digitalhut-full-200m-keyword-list",
    lane: "DigitalHut 200M SEO Master List",
    aliases: ["DigitalHut Full 200,572,944 Keyword List", "DigitalHut 200,572,944 Longtail Keyword Universe"],
    proofRoute: "/system-proof",
    publicUrl: `${site}/system-proof`,
    role: "the strongest lane and source of truth; every category, proof route, source bridge, comparison test, and evidence read is a facet inside this SEO master list",
    universe: 200572944,
    publicSitemapWindow: 50000
  },
  wholeSystemAttractionUniverse: universeArm || universeState.wholeSystemAttractionUniverse || {
    id: "digitalhut-full-200m-keyword-list",
    lane: "DigitalHut 200M SEO Master List",
    aliases: ["DigitalHut Full 200,572,944 Keyword List", "DigitalHut 200,572,944 Longtail Keyword Universe"],
    proofRoute: "/system-proof",
    publicUrl: `${site}/system-proof`,
    role: "the 200M SEO Master List as the whole dapp-backed attraction system",
    universe: 200572944,
    publicSitemapWindow: 50000
  },
  measurableFacet: universeState.measurableFacet || active.measurableFacet || universeArm || {
    id: "digitalhut-200m-seo-master-list",
    lane: "DigitalHut 200M SEO Master List",
    proofRoute: "/system-proof",
    role: "the SEO master list as a whole is the measurable facet; route candidates are sub-signals only"
  },
  strongestSubSignal: universeState.measurableFacet?.strongestSubSignal || attraction.strongestPocket || null,
  currentRead: traffic,
  doorEventTrail: {
    interpretation: "Door events are entrances into the 200M SEO Master List. The system now records exact origin, path, lane, reason, second actions, proof/source opens, and the next bridge route.",
    sourceSummary: traffic.masterKeywordDoorSourceSummary,
    trails: traffic.masterKeywordDoorTrail
  },
  attraction,
  layers,
  bottleneck: strongestBottleneck(layers),
  decision,
  nextCycle: {
    action: decision.decision,
    exactMove: decision.decision === "protect-google-row-and-convert"
      ? `Keep sitemap stable, surface the source bridge, and refine the 200M SEO Master List as the measurable facet; treat category, behavior, source, and competitor reads as sub-signals inside it.`
      : decision.decision === "bridge-door-events-to-proof-source"
        ? `Tighten routes that receive master keyword door events so ${attraction.strongestPocket?.origin || "incoming traffic"} naturally opens proof/source.`
        : "Regenerate rotation, keep the 50K window, and compare movement before another deploy.",
    deployRule: "Deploy only after a material proof artifact, measurement contract, sitemap, or route conversion change.",
    measurementToBeat: {
      pageViews: traffic.pageViews,
      uniqueVisitors: traffic.uniqueVisitors,
      proof: traffic.proof,
      source: traffic.source,
      freshRows: search.freshRows,
      freshImpressions: search.freshImpressions
    }
  }
}

const markdown = `# DigitalHut SEO Structure Reevaluation

Generated: ${generatedAt}

Mode: ${packet.mode}

Decision: ${decision.decision}

Reason: ${decision.reason}

## Current Read

- Page views: ${traffic.pageViews}
- Participating browser IDs: ${traffic.uniqueVisitors}
- Total events: ${traffic.totalEvents}
- GLB: ${traffic.glb}
- Podcast: ${traffic.podcast}
- Autoplay: ${traffic.autoplay}
- Searches: ${traffic.searches}
- Market: ${traffic.market}
- Proof/source: ${traffic.proof}/${traffic.source}
- Master keyword door events: ${traffic.masterKeywordDoorEvents}
- Search Console fresh rows/impressions: ${search.freshRows}/${search.freshImpressions}
- Sitemap rows: ${sitemap.totalRows}
- Master keyword rows: ${sitemap.masterRows}
- Internal universe: ${sitemap.universe}
- Internal rotation arm: ${packet.internalRotationArm.lane}

## Attraction Read

- Strongest pocket: ${attraction.strongestPocket ? `${attraction.strongestPocket.lane} from ${attraction.strongestPocket.origin}` : "not available"}
- Candidate visitors: ${attraction.totalCandidateVisitors}
- Candidate second actions: ${attraction.totalCandidateSecondActions}
- Second-action rate: ${attraction.secondActionRate}
- Refinement: ${attraction.attractionHypothesis}

## Door Event Trail

${traffic.masterKeywordDoorTrail.length ? traffic.masterKeywordDoorTrail.slice(0, 8).map((item) => `- ${item.origin} -> ${item.path} -> ${item.lane}: ${item.events} events, ${item.secondActions} second actions, proof/source ${item.proofRouteOpens}/${item.sourceOpens}. Next: ${item.nextAction}`).join("\n") : "- No exact door trail returned yet."}

## Layer Scores

${layers.map((layer) => `- ${layer.name}: ${layer.score}/100 - ${layer.next}`).join("\n")}

## Bottleneck

${packet.bottleneck.name}: ${packet.bottleneck.score}/100

## Next Cycle

${packet.nextCycle.exactMove}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  decision: packet.decision.decision,
  bottleneck: {id: packet.bottleneck.id, score: packet.bottleneck.score},
  currentRead: packet.currentRead,
  attraction: {
    strongestPocket: packet.attraction.strongestPocket,
    totalCandidateVisitors: packet.attraction.totalCandidateVisitors,
    totalCandidateSecondActions: packet.attraction.totalCandidateSecondActions,
    secondActionRate: packet.attraction.secondActionRate
  },
  searchConsole: {
    freshRows: search.freshRows,
    freshImpressions: search.freshImpressions,
    finalRows: search.finalRows,
    sitemapSurfacesVisible: search.sitemapSurfacesVisible,
    sitemapSurfacesPending: search.sitemapSurfacesPending
  },
  sitemap: {
    totalRows: sitemap.totalRows,
    masterRows: sitemap.masterRows,
    universe: sitemap.universe
  }
}, null, 2))
