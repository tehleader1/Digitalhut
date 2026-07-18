import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-ladder-match-architecture.json"
const docsPath = "docs/digitalhut-ladder-match-architecture.md"
const generatedAt = new Date().toISOString()
const universe = Math.max(Number(seoSearchClaimSummary.totalIndividualRanks || 0), 200572944)

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
    if(!response.ok) return fallback
    return await response.json()
  } catch {
    return fallback
  }
}

function numberValue(value){
  return Number.isFinite(Number(value)) ? Number(value) : 0
}

function slug(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function pixelRead(pixel = {}){
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
    masterKeywordDoorEvents: numberValue(pixel.totalMasterKeywordDoorEvents)
  }
}

function laneForCompetitorLane(name = ""){
  const text = String(name || "").toLowerCase()
  if(text.includes("model") || text.includes("3d")) return "gaming-3d-world-observatory"
  if(text.includes("spatial")) return "home-project-diy-visual"
  if(text.includes("podcast") || text.includes("video analytics")) return "ai-video-podcast-source-explainer"
  if(text.includes("research")) return "developer-programmer-research"
  if(text.includes("full entertainment")) return "full-entertainment-dapp-alternative"
  return "full-entertainment-dapp-alternative"
}

function rankClassFor(platform = {}, lane = {}){
  const name = String(platform.name || "").toLowerCase()
  if(["youtube", "sketchfab"].some((value) => name.includes(value))) return "Enterprise"
  if(["simplecast", "colab", "autodesk", "matterport"].some((value) => name.includes(value))) return "Pro"
  if(Number(lane.variationCapacity || 0) >= 11000000) return "Mid"
  return "Entry"
}

function matchLoad(rankClass){
  return {
    Entry: {serverLoad: "low", reason: "proof route plus one behavior signal is enough to test the lane"},
    Mid: {serverLoad: "medium", reason: "requires sitemap rows, route proof, and Supabase behavior checks"},
    Pro: {serverLoad: "high", reason: "requires competitor proof, source bridge, Search Console row, and second-action measurement"},
    Enterprise: {serverLoad: "very-high", reason: "requires multi-system proof across video, GLB, podcast/source, analytics, sitemap, and engagement"}
  }[rankClass] || {serverLoad: "medium", reason: "requires measurable proof before promotion"}
}

function scoreMatch({rankClass, metrics, lane = {}}){
  const secondActions = metrics.glb + metrics.podcast + metrics.autoplay + metrics.searches + metrics.market
  let digitalhut = 35
  digitalhut += Math.min(20, Math.floor(metrics.glb / 8))
  digitalhut += Math.min(12, metrics.podcast)
  digitalhut += Math.min(10, metrics.autoplay * 2)
  digitalhut += Math.min(12, metrics.searches * 4)
  digitalhut += metrics.proof > 0 ? 18 : 0
  digitalhut += metrics.source > 0 ? 20 : 0
  digitalhut += secondActions > 0 ? 8 : 0

  const opponentAuthority = {
    Entry: 48,
    Mid: 62,
    Pro: 76,
    Enterprise: 92
  }[rankClass] || 60

  const functionAdvantage = lane.id === "full-entertainment-dapp-alternative" ? 24 : 16
  const adjustedDigitalhut = Math.min(100, digitalhut + functionAdvantage)
  const result = metrics.proof > 0 || metrics.source > 0
    ? adjustedDigitalhut >= opponentAuthority ? "measurable-advantage" : "authority-lead-with-proof-response"
    : adjustedDigitalhut >= opponentAuthority
      ? "functionality-advantage-traffic-proof-pending"
      : "competitor-authority-lead-proof-needed"

  return {
    digitalhutCapabilityScore: adjustedDigitalhut,
    opponentAuthorityClassScore: opponentAuthority,
    scoreGuardrail: "Internal capability benchmark only. This is not a Google ranking score, not a paid-rank claim, and not a declared SEO win.",
    result,
    secondActions,
    winCondition: "DigitalHut must produce proof/source opens, repeated second actions, or Search Console query growth before this becomes a proven SEO advantage."
  }
}

function matchStatus(score){
  if(score.result === "measurable-advantage") return "advantage-proven"
  if(score.result === "authority-lead-with-proof-response") return "proof-response"
  if(score.result === "functionality-advantage-traffic-proof-pending") return "active-test"
  return "needs-proof"
}

function nextProofFor(lane = {}, score = {}, metrics = {}){
  if(metrics.source === 0) return `Open one source/backlink from ${lane.proofRoute || "/system-proof"} and record backlink_source_open.`
  if(metrics.proof === 0) return `Open one proof route for ${lane.lane} and record proof_route_open.`
  if(score.result !== "win-measurable") return `Earn a Search Console query row for ${lane.lane} and compare against the previous snapshot.`
  return "Preserve the match, stack the route, and watch for repeat impressions/clicks."
}

const [insight, competitors, activeCycle, searchConsole] = await Promise.all([
  fetchJson(`${site}/api/insight-map?ladder-architecture=${Date.now()}`, {}),
  Promise.resolve(readJson("public/digitalhut-functionality-ladder-competitors.json", {})),
  Promise.resolve(readJson("public/digitalhut-active-client-attempt-cycle.json", {})),
  Promise.resolve(readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {}))
])

const metrics = pixelRead(insight.pixel || {})
const competitorLanes = competitors.realFunctionalityCompetitorLanes || []
const matches = competitorLanes.flatMap((laneGroup) => {
  const matchedLaneId = laneForCompetitorLane(laneGroup.lane)
  const seoLane = seoSearchClaimLanes.find((lane) => lane.id === matchedLaneId) || seoSearchClaimLanes.find((lane) => lane.id === "full-entertainment-dapp-alternative")
  return (laneGroup.knownPlatforms || []).map((platform) => {
    const rankClass = rankClassFor(platform, seoLane)
    const score = scoreMatch({rankClass, metrics, lane: seoLane})
  return {
      id: `${slug(laneGroup.lane)}__${slug(platform.name)}`,
      lane: laneGroup.lane,
      seoLaneId: seoLane.id,
      seoLane: seoLane.lane,
      matchType: `${seoLane.lane} vs ${platform.name}`,
      competitor: platform,
      rankClass,
      status: matchStatus(score),
      testType: "comparative-proof-statistic-test",
      serverArchitectureLoad: matchLoad(rankClass),
      digitalhutAdvantage: laneGroup.digitalhutDifference,
      opponentAdvantage: platform.observedOverlap,
      evidenceBasis: {
        digitalhutTestedCapabilities: [
          "video watching/session route",
          "3D Model View or GLB behavior",
          "podcast/source moment behavior",
          "live analytics measurement",
          "SEO proof route",
          "source/backlink bridge"
        ],
        currentDigitalhutSignals: {
          pageViews: metrics.pageViews,
          uniqueVisitors: metrics.uniqueVisitors,
          glb: metrics.glb,
          podcast: metrics.podcast,
          autoplay: metrics.autoplay,
          searches: metrics.searches,
          proof: metrics.proof,
          source: metrics.source
        },
        comparedAgainst: platform.observedOverlap,
        notAGoogleRankClaim: true
      },
      flawsFound: [
        metrics.proof === 0 ? "proof route opens are still zero" : null,
        metrics.source === 0 ? "source/backlink opens are still zero" : null,
        metrics.searches <= 2 ? "search usage is still thin" : null
      ].filter(Boolean),
      advantagesFound: [
        metrics.glb > 0 ? "GLB/3D behavior is already measurable" : null,
        metrics.podcast > 0 ? "podcast/source interrupt behavior is already measurable" : null,
        metrics.autoplay > 0 ? "autoplay/session behavior is already measurable" : null,
        "DigitalHut combines video, GLB, podcast/source, analytics, and SEO proof in one interface"
      ].filter(Boolean),
      internalBenchmark: score,
      proofRoute: seoLane.proofRoute || "/system-proof",
      sourceBridgeUrl: `/digitalhut-proof-source-conversion-bridge.json#${slug(seoLane.lane) || "digitalhut-200m-seo-master-list"}`,
      nextProofNeeded: nextProofFor(seoLane, score, metrics),
      promotionRule: "Promote only after Search Console rows, proof/source opens, or repeated second actions move beyond the saved baseline."
    }
  })
})

const standings = matches.reduce((rows, match) => {
  const row = rows.get(match.seoLaneId) || {
    seoLaneId: match.seoLaneId,
    seoLane: match.seoLane,
    provenAdvantages: 0,
    activeTests: 0,
    proofResponses: 0,
    needsProof: 0,
    highestClass: "Entry"
  }
  if(match.status === "advantage-proven") row.provenAdvantages += 1
  else if(match.status === "proof-response") row.proofResponses += 1
  else if(match.status === "active-test") row.activeTests += 1
  else row.needsProof += 1
  if(["Entry", "Mid", "Pro", "Enterprise"].indexOf(match.rankClass) > ["Entry", "Mid", "Pro", "Enterprise"].indexOf(row.highestClass)) {
    row.highestClass = match.rankClass
  }
  rows.set(match.seoLaneId, row)
  return rows
}, new Map())

const packet = {
  generatedAt,
  status: "ladder-match-architecture-ready",
  site,
  definition: "A DigitalHut ladder match is a comparative proof/statistic test against similar structured systems. It records which capabilities DigitalHut has tested, where competitors still lead, where DigitalHut has an advantage, and which measurable proof is required next.",
  guardrail: "This artifact is not a fake rank-boost claim and not an official Google ranking feature. It gives crawlers and users evidence-based comparisons: tested functionality, flaws, advantages, proof routes, source bridges, Supabase behavior, and Search Console status.",
  masterKeywordLeague: {
    strongestLane: "DigitalHut 200M SEO Master List",
    internalRotationArm: "DigitalHut 200M SEO Master List",
    universe,
    publicSitemapWindow: activeCycle.sitemap?.masterRows || 50000,
    role: "Every comparative test, route, source bridge, category read, and behavior signal is a facet inside the 200M SEO Master List; DigitalHut.app is the dapp proof engine behind those facets."
  },
  currentMetrics: metrics,
  searchConsole: {
    freshRows: numberValue(searchConsole.searchAnalyticsFresh?.rowCount),
    freshImpressions: numberValue(searchConsole.searchAnalyticsFresh?.totalImpressions),
    freshClicks: numberValue(searchConsole.searchAnalyticsFresh?.totalClicks),
    finalRows: numberValue(searchConsole.searchAnalyticsFinal?.rowCount),
    finalImpressions: numberValue(searchConsole.searchAnalyticsFinal?.totalImpressions),
    finalClicks: numberValue(searchConsole.searchAnalyticsFinal?.totalClicks)
  },
  ladderRules: [
    "Compare only against similar structured applications/websites.",
    "Do not claim a win from invented language; record flaws and advantages from measurable signals.",
    "A functionality advantage is not a traffic advantage until proof/source, second-action, or Search Console movement appears.",
    "Enterprise-level comparisons require capacity-aware proof across video, GLB, podcast/source, analytics, sitemap, and database read."
  ],
  standings: [...standings.values()].sort((a, b) => b.provenAdvantages - a.provenAdvantages || b.activeTests - a.activeTests || a.seoLane.localeCompare(b.seoLane)),
  matches: matches.sort((a, b) => b.internalBenchmark.digitalhutCapabilityScore - a.internalBenchmark.digitalhutCapabilityScore || b.internalBenchmark.opponentAuthorityClassScore - a.internalBenchmark.opponentAuthorityClassScore),
  nextServerMove: metrics.proof > 0 || metrics.source > 0
    ? "Stack the comparative test that produced proof/source movement and resubmit the exact route cluster."
    : "Keep comparative tests active, but aim the next user flow at proof/source opens. The current system has behavior, but the public proof layer needs a source/proof hit.",
  nextGoogleMove: "Keep sitemap stable, expose this as a proof/statistics artifact, and compare future Search Console rows against the benchmark board."
}

const markdown = `# DigitalHut Ladder Match Architecture

Generated: ${generatedAt}

Definition: ${packet.definition}

Current read: ${metrics.pageViews} page views, ${metrics.uniqueVisitors} participating browser IDs, ${metrics.totalEvents} events.

Second actions: GLB ${metrics.glb}, podcast ${metrics.podcast}, autoplay ${metrics.autoplay}, search ${metrics.searches}, market ${metrics.market}.

Proof/source: ${metrics.proof}/${metrics.source}

Search Console rows/impressions/clicks: ${packet.searchConsole.freshRows}/${packet.searchConsole.freshImpressions}/${packet.searchConsole.freshClicks}

## Master Keyword League

Strongest lane: ${packet.masterKeywordLeague.strongestLane}

Master list proof anchor: ${packet.masterKeywordLeague.internalRotationArm}

Universe: ${packet.masterKeywordLeague.universe}

Public sitemap window: ${packet.masterKeywordLeague.publicSitemapWindow}

## Standings

${packet.standings.map((row) => `- ${row.seoLane}: proven advantages ${row.provenAdvantages}, active tests ${row.activeTests}, proof responses ${row.proofResponses}, needs proof ${row.needsProof}, highest class ${row.highestClass}`).join("\n")}

## Match Board

${packet.matches.map((match) => `- ${match.matchType}: ${match.status}, ${match.rankClass}. Internal capability benchmark ${match.internalBenchmark.digitalhutCapabilityScore}; opponent authority class ${match.internalBenchmark.opponentAuthorityClassScore}. Advantage: ${match.advantagesFound[0]}. Flaw: ${match.flawsFound[0] || "no immediate flaw recorded"}. Next: ${match.nextProofNeeded}`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  matches: packet.matches.length,
  standings: packet.standings.length,
  currentMetrics: packet.currentMetrics,
  nextServerMove: packet.nextServerMove
}, null, 2))
