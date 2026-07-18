import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-external-comparable-system-tests.json"
const docsPath = "docs/digitalhut-external-comparable-system-tests.md"
const generatedAt = new Date().toISOString()

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

const dimensions = [
  "videoSession",
  "interactive3d",
  "podcastMoments",
  "aiContentUnderstanding",
  "sourceBacklinks",
  "liveAnalytics",
  "singleScreenWorkflow",
  "seoProofRoutes",
  "databaseTelemetry",
  "monetizableSession"
]

const competitors = [
  {
    name: "YouTube",
    url: "https://www.youtube.com/",
    lane: "video watching/session platform",
    publicSurface: {
      videoSession: "proven",
      interactive3d: "missing",
      podcastMoments: "partial",
      aiContentUnderstanding: "partial",
      sourceBacklinks: "partial",
      liveAnalytics: "proven",
      singleScreenWorkflow: "partial",
      seoProofRoutes: "missing",
      databaseTelemetry: "proven",
      monetizableSession: "proven"
    },
    publicStrengths: ["dominant video search", "watch/session behavior", "autoplay and recommendation graph"],
    digitalhutTest: "DigitalHut cannot beat YouTube at raw video supply; it must prove a richer one-screen session around video, 3D Model View, podcast/source moments, and analytics."
  },
  {
    name: "Sketchfab",
    url: "https://sketchfab.com/",
    lane: "3D model web viewer and marketplace",
    publicSurface: {
      videoSession: "missing",
      interactive3d: "proven",
      podcastMoments: "missing",
      aiContentUnderstanding: "partial",
      sourceBacklinks: "partial",
      liveAnalytics: "partial",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "proven"
    },
    publicStrengths: ["3D and AR web platform", "embeddable interactive models", "large creator/business ecosystem"],
    digitalhutTest: "DigitalHut must prove the 3D renderer is useful because it reacts to a media episode, not because it is a standalone model catalog."
  },
  {
    name: "model-viewer",
    url: "https://modelviewer.dev/",
    lane: "developer 3D web component",
    publicSurface: {
      videoSession: "missing",
      interactive3d: "proven",
      podcastMoments: "missing",
      aiContentUnderstanding: "missing",
      sourceBacklinks: "partial",
      liveAnalytics: "missing",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "missing",
      monetizableSession: "missing"
    },
    publicStrengths: ["interactive 3D model display", "AR support", "developer-first web integration"],
    digitalhutTest: "DigitalHut should treat this as a technical quality bar for GLB interaction, loading, camera controls, and fallback behavior."
  },
  {
    name: "Matterport",
    url: "https://matterport.com/",
    lane: "immersive 3D tour and digital twin",
    publicSurface: {
      videoSession: "partial",
      interactive3d: "proven",
      podcastMoments: "missing",
      aiContentUnderstanding: "partial",
      sourceBacklinks: "partial",
      liveAnalytics: "proven",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "proven",
      monetizableSession: "proven"
    },
    publicStrengths: ["real-estate and facilities digital twins", "3D tours", "operational spatial workflows"],
    digitalhutTest: "DigitalHut must prove its home/project and real-estate lanes through observatory context, not by pretending to be a capture platform."
  },
  {
    name: "Simplecast",
    url: "https://blog.simplecast.com/grow-your-audience-everywhere-simplecast-adds-youtube-publishing-and-unified-podcast-analytics",
    lane: "podcast plus YouTube analytics",
    publicSurface: {
      videoSession: "proven",
      interactive3d: "missing",
      podcastMoments: "proven",
      aiContentUnderstanding: "partial",
      sourceBacklinks: "partial",
      liveAnalytics: "proven",
      singleScreenWorkflow: "partial",
      seoProofRoutes: "missing",
      databaseTelemetry: "proven",
      monetizableSession: "proven"
    },
    publicStrengths: ["audio/video publishing workflow", "unified podcast and YouTube analytics", "creator growth positioning"],
    digitalhutTest: "DigitalHut must make podcast moments feel like source-backed episode interrupts, not a decorative panel."
  },
  {
    name: "Snipd",
    url: "https://www.snipd.com/",
    lane: "AI podcast highlights",
    publicSurface: {
      videoSession: "missing",
      interactive3d: "missing",
      podcastMoments: "proven",
      aiContentUnderstanding: "proven",
      sourceBacklinks: "partial",
      liveAnalytics: "partial",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "partial"
    },
    publicStrengths: ["podcast AI highlights", "episode knowledge capture", "listening workflow"],
    digitalhutTest: "DigitalHut must turn podcast clips into useful context tied to the current video/3D/search session."
  },
  {
    name: "OpusClip",
    url: "https://www.opus.pro/",
    lane: "AI video clipping and distribution",
    publicSurface: {
      videoSession: "proven",
      interactive3d: "missing",
      podcastMoments: "partial",
      aiContentUnderstanding: "proven",
      sourceBacklinks: "partial",
      liveAnalytics: "partial",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "proven"
    },
    publicStrengths: ["long video to clips", "multi-platform source support", "creator distribution workflow"],
    digitalhutTest: "DigitalHut should not compete as a clip editor; it should compete as the watch/research layer that explains the clip, model, source, and next action."
  },
  {
    name: "Descript",
    url: "https://www.descript.com/",
    lane: "AI video and podcast editing",
    publicSurface: {
      videoSession: "proven",
      interactive3d: "missing",
      podcastMoments: "proven",
      aiContentUnderstanding: "proven",
      sourceBacklinks: "partial",
      liveAnalytics: "proven",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "proven"
    },
    publicStrengths: ["text-based editing", "transcription", "podcast/video production workflow", "enterprise production tooling"],
    digitalhutTest: "DigitalHut needs clearer transcript/source intelligence to match the professional usefulness of editing tools."
  },
  {
    name: "Runway",
    url: "https://runwayml.com/",
    lane: "AI video/world simulation",
    publicSurface: {
      videoSession: "proven",
      interactive3d: "partial",
      podcastMoments: "missing",
      aiContentUnderstanding: "proven",
      sourceBacklinks: "partial",
      liveAnalytics: "partial",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "proven"
    },
    publicStrengths: ["AI video generation", "world models", "creative/enterprise AI media stack"],
    digitalhutTest: "DigitalHut should not claim generation parity; it should prove media observatory usefulness around existing video, GLB, podcast, and analytics."
  },
  {
    name: "NotebookLM",
    url: "https://notebooklm.google/",
    lane: "AI research and source synthesis",
    publicSurface: {
      videoSession: "missing",
      interactive3d: "missing",
      podcastMoments: "proven",
      aiContentUnderstanding: "proven",
      sourceBacklinks: "proven",
      liveAnalytics: "missing",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "missing"
    },
    publicStrengths: ["research assistant positioning", "source-grounded study workflow", "audio overview style research output"],
    digitalhutTest: "DigitalHut must make the bubble map, timeline, and 3D panel say source-grounded things that match the current episode."
  },
  {
    name: "Perplexity",
    url: "https://www.perplexity.ai/",
    lane: "answer engine and source discovery",
    publicSurface: {
      videoSession: "missing",
      interactive3d: "missing",
      podcastMoments: "missing",
      aiContentUnderstanding: "proven",
      sourceBacklinks: "proven",
      liveAnalytics: "missing",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "proven"
    },
    publicStrengths: ["query-to-answer habit", "source path behavior", "research search alternative"],
    digitalhutTest: "DigitalHut search must return source trails and proof routes, not just category switching."
  },
  {
    name: "Kuula",
    url: "https://kuula.co/",
    lane: "virtual tour presentation",
    publicSurface: {
      videoSession: "partial",
      interactive3d: "proven",
      podcastMoments: "missing",
      aiContentUnderstanding: "partial",
      sourceBacklinks: "partial",
      liveAnalytics: "partial",
      singleScreenWorkflow: "proven",
      seoProofRoutes: "missing",
      databaseTelemetry: "partial",
      monetizableSession: "proven"
    },
    publicStrengths: ["immersive tour publishing", "visual spatial browsing", "real-estate/travel presentation"],
    digitalhutTest: "DigitalHut can use the same curiosity pull, but must show why video plus 3D plus podcast/source is more useful than a tour alone."
  }
]

const officialEvidence = {
  YouTube: {
    sourceUrl: "https://www.youtube.com/",
    sourceType: "public homepage",
    evidenceRead: "public video watching, search, channel, and session destination"
  },
  Sketchfab: {
    sourceUrl: "https://sketchfab.com/features",
    sourceType: "official feature page",
    evidenceRead: "universal browser-based 3D/VR viewer, embeds, configuration, and cross-device model viewing"
  },
  "model-viewer": {
    sourceUrl: "https://modelviewer.dev/",
    sourceType: "official developer page",
    evidenceRead: "web component standard for interactive model display and developer implementation quality"
  },
  Matterport: {
    sourceUrl: "https://matterport.com/",
    sourceType: "official product site",
    evidenceRead: "immersive tours and spatial/digital-twin presentation"
  },
  Simplecast: {
    sourceUrl: "https://help.simplecast.com/hc/en-us/articles/32469580179869-NEW-Video-Podcasts-with-YouTube-Publishing-and-Analytics",
    sourceType: "official help/article page",
    evidenceRead: "video podcasts, direct YouTube integration, and unified watch/listen analytics"
  },
  Snipd: {
    sourceUrl: "https://www.snipd.com/",
    sourceType: "public product site",
    evidenceRead: "AI podcast highlights and listening knowledge workflow"
  },
  OpusClip: {
    sourceUrl: "https://www.opus.pro/",
    sourceType: "public product site",
    evidenceRead: "AI video clipping and creator distribution workflow"
  },
  Descript: {
    sourceUrl: "https://www.descript.com/",
    sourceType: "public product site",
    evidenceRead: "AI video/podcast editing, transcription, and production workflow"
  },
  Runway: {
    sourceUrl: "https://runwayml.com/",
    sourceType: "public product site",
    evidenceRead: "AI media generation and creative video tooling"
  },
  NotebookLM: {
    sourceUrl: "https://support.google.com/notebooklm/answer/16212820",
    sourceType: "official help page",
    evidenceRead: "source-grounded Audio Overviews that summarize uploaded sources"
  },
  Perplexity: {
    sourceUrl: "https://www.perplexity.ai/",
    sourceType: "public product site",
    evidenceRead: "answer/search experience with source discovery behavior"
  },
  Kuula: {
    sourceUrl: "https://kuula.co/",
    sourceType: "public product site",
    evidenceRead: "virtual tour presentation and visual spatial browsing"
  }
}

function normalizeCoverage(coverage = {}){
  return Object.fromEntries(dimensions.map((dimension) => [dimension, coverage[dimension] || "missing"]))
}

function digitalhutCoverage(metrics){
  return {
    videoSession: metrics.pageViews > 0 ? "proven" : "missing",
    interactive3d: metrics.glb > 0 ? "proven" : "missing",
    podcastMoments: metrics.podcast > 0 ? "proven" : "missing",
    aiContentUnderstanding: metrics.searches > 2 && metrics.source > 0 ? "proven" : metrics.masterKeywordDoorEvents > 0 ? "partial" : "missing",
    sourceBacklinks: metrics.source > 0 ? "proven" : "missing",
    liveAnalytics: metrics.totalEvents > 0 ? "proven" : "missing",
    singleScreenWorkflow: "proven",
    seoProofRoutes: metrics.proof > 0 ? "proven" : "missing",
    databaseTelemetry: metrics.totalEvents > 0 ? "proven" : "missing",
    monetizableSession: metrics.autoplay > 0 || metrics.searches > 0 || metrics.glb > 0 ? "partial" : "missing"
  }
}

function scoreCoverage(coverage){
  return dimensions.reduce((total, key) => total + (coverage[key] === "proven" ? 1 : coverage[key] === "partial" ? 0.5 : 0), 0)
}

function isPresent(value){
  return value === "proven" || value === "partial"
}

function isStronger(a, b){
  const weight = {missing: 0, partial: 1, proven: 2}
  return (weight[a] || 0) > (weight[b] || 0)
}

function scenarioFor(competitor, missing){
  const name = competitor.name
  const base = {
    entryRoute: "/system-proof",
    universe: "DigitalHut 200M SEO Master List",
    rule: "The test belongs to the 200M SEO Master List; the competitor lane is only the current measurable facet, and the dapp proof engine must sit behind it."
  }
  if(name === "YouTube") return {
    ...base,
    userScenario: "A daily watcher wants an alternative to a plain watch page and lands on DigitalHut for video + 3D Model View + podcast/source moments + analytics.",
    mustProve: ["autoplay continues cleanly", "3D Model View opens during the watch session", "podcast/source moment interrupts without breaking the video session"],
    missingProof: missing
  }
  if(name === "Sketchfab" || name === "model-viewer") return {
    ...base,
    userScenario: "A 3D-curious viewer expects smooth rotate, zoom, collapse, source detail, and a model that supports the episode story.",
    mustProve: ["GLB opens from the main system", "model controls are usable", "source trail explains why this model belongs to the episode"],
    missingProof: missing
  }
  if(name === "Simplecast" || name === "Snipd" || name === "Descript") return {
    ...base,
    userScenario: "A podcast/video listener expects a speaking moment to explain the current episode, source, and next useful action.",
    mustProve: ["podcast interrupt starts on click", "speaker/source panel is clear", "episode returns cleanly to the YouTube story"],
    missingProof: missing
  }
  if(name === "NotebookLM" || name === "Perplexity") return {
    ...base,
    userScenario: "A researcher expects source-grounded answers, links, and context that update with the media being watched.",
    mustProve: ["search creates source trails", "analytics explain the current topic", "proof/source opens move above zero"],
    missingProof: missing
  }
  return {
    ...base,
    userScenario: "A mainstream visitor compares DigitalHut against a focused tool and decides whether one combined observatory session is more useful.",
    mustProve: ["second action after entry", "clear source/proof route", "repeatable behavior telemetry"],
    missingProof: missing
  }
}

const insight = await fetchJson(`${site}/api/insight-map?external-comparable-tests=${Date.now()}`, {})
const activeCycle = readJson("public/digitalhut-active-client-attempt-cycle.json", {})
const searchConsole = readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {})
const metrics = pixelRead(insight.pixel || {})
const digitalhut = digitalhutCoverage(metrics)

const tests = competitors.map((competitor) => {
  const theirs = normalizeCoverage(competitor.publicSurface)
  const digitalhutWins = dimensions.filter((dimension) => isStronger(digitalhut[dimension], theirs[dimension]))
  const competitorWins = dimensions.filter((dimension) => isStronger(theirs[dimension], digitalhut[dimension]))
  const shared = dimensions.filter((dimension) => isPresent(theirs[dimension]) && isPresent(digitalhut[dimension]))
  const missing = dimensions.filter((dimension) => digitalhut[dimension] === "missing")
  return {
    competitor,
    testType: "public-surface-comparison",
    evidenceGuardrail: "Based on public product positioning plus DigitalHut live telemetry. This is not a claim about private competitor analytics or Google ranking.",
    externalEvidence: officialEvidence[competitor.name] || null,
    digitalhutCoverage: digitalhut,
    competitorCoverage: theirs,
    digitalhutCoverageScore: scoreCoverage(digitalhut),
    competitorPublicSurfaceScore: scoreCoverage(theirs),
    sharedCapabilities: shared,
    digitalhutAdvantagesToProve: digitalhutWins,
    competitorAdvantagesToRespect: competitorWins,
    digitalhutCurrentGaps: missing,
    digitalhutScenarioTest: scenarioFor(competitor, missing),
    usefulTakeaway: competitor.digitalhutTest,
    nextTest: missing.includes("sourceBacklinks")
      ? "Create one source/backlink open from this lane before claiming traffic advantage."
      : missing.includes("seoProofRoutes")
        ? "Create one proof route open from this lane before promotion."
        : "Repeat the lane and compare second-action movement against the saved baseline."
  }
})

const repeatedGaps = dimensions
  .map((dimension) => ({
    dimension,
    missingInDigitalhut: digitalhut[dimension] === "missing",
    partialInDigitalhut: digitalhut[dimension] === "partial",
    competitorsShowingIt: tests.filter((test) => isPresent(test.competitorCoverage[dimension])).map((test) => test.competitor.name)
  }))
  .filter((row) => row.missingInDigitalhut || row.partialInDigitalhut || row.competitorsShowingIt.length >= 3)

const packet = {
  generatedAt,
  status: "external-comparable-system-tests-produced",
  site,
  purpose: "Bring outside feedback into DigitalHut so the system is not only judged by our internal build loop.",
  guardrail: "These are public-surface proof/statistic comparisons. They should guide product and SEO proof work, not pretend to be official traffic wins.",
  digitalhutPositioning: "video watching + 3D Model View + podcast/source moments + live analytics + SEO proof routes in one 2026 dapp entertainment observatory",
  universeModel: {
    strongestLane: "DigitalHut 200M SEO Master List",
    attractionUniverse: "DigitalHut 200M SEO Master List",
    rule: "Everything in this packet is inside the 200M SEO Master List: competitor comparisons, evidence facets, proof routes, source bridges, behavior reads, dapp proof modules, and Search Console rows.",
    dappProofEngine: "DigitalHut.app must sit behind every meaningful list route with video watching, 3D Model View, podcast/source moments, analytics, search, database telemetry, and proof/source tracking.",
    publicSitemapWindow: 50000
  },
  currentDigitalhutMetrics: metrics,
  searchConsole: {
    rows: numberValue(searchConsole.searchAnalyticsFresh?.rowCount ?? searchConsole.freshRows),
    impressions: numberValue(searchConsole.searchAnalyticsFresh?.totalImpressions ?? searchConsole.freshImpressions),
    clicks: numberValue(searchConsole.searchAnalyticsFresh?.totalClicks ?? searchConsole.freshClicks)
  },
  activeCycleDecision: activeCycle.decision || "not-read",
  dimensions,
  strongestFinding: "DigitalHut's strongest lane is the 200M SEO Master List when every keyword facet is backed by the working dapp proof engine. The weakest proof points remain source/backlink opens, proof route opens, and deep transcript/source intelligence.",
  currentOutsideFeedbackConclusion: "The outside market is split into specialized tools. DigitalHut's opening is owning the master list as a dapp-backed SEO system, but the next credibility jump requires source/proof opens and stronger content understanding.",
  repeatedGaps,
  tests,
  nextEngineeringFocus: [
    "Turn source/backlink opens from 0 into the first proof hit.",
    "Make search results create source trails, not just category movement.",
    "Improve transcript/source intelligence so the analytics panels explain the current video or podcast moment.",
    "Keep 3D interaction quality near model-viewer/Sketchfab expectations: smooth load, rotate, zoom, collapse, and source detail."
  ],
  nextSeoFocus: [
    "Use external comparison language in proof artifacts, not made-up rank wins.",
    "Promote only lanes where DigitalHut has both public proof and Supabase behavior.",
    "Keep the 200,572,944 universe as the internal map while only surfacing the strongest proof routes publicly."
  ]
}

const markdown = `# DigitalHut External Comparable System Tests

Generated: ${generatedAt}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

DigitalHut position: ${packet.digitalhutPositioning}

Current telemetry: ${metrics.pageViews} page views, ${metrics.uniqueVisitors} participating browser IDs, ${metrics.totalEvents} events, GLB ${metrics.glb}, podcast ${metrics.podcast}, autoplay ${metrics.autoplay}, searches ${metrics.searches}, proof/source ${metrics.proof}/${metrics.source}.

Search Console rows/impressions/clicks: ${packet.searchConsole.rows}/${packet.searchConsole.impressions}/${packet.searchConsole.clicks}

Strongest finding: ${packet.strongestFinding}

Outside feedback conclusion: ${packet.currentOutsideFeedbackConclusion}

Strongest lane: ${packet.universeModel.strongestLane}

Universe rule: ${packet.universeModel.rule}

Dapp proof engine: ${packet.universeModel.dappProofEngine}

## Repeated Gaps

${repeatedGaps.map((row) => `- ${row.dimension}: ${row.missingInDigitalhut ? "DigitalHut gap" : row.partialInDigitalhut ? "DigitalHut partial" : "competitor pressure"}; seen in ${row.competitorsShowingIt.join(", ") || "none"}`).join("\n")}

## Test Board

${tests.map((test) => `- ${test.competitor.name}: DigitalHut ${test.digitalhutCoverageScore}/${dimensions.length}, competitor public surface ${test.competitorPublicSurfaceScore}/${dimensions.length}. Evidence: ${test.externalEvidence?.sourceUrl || "public surface"}. Shared: ${test.sharedCapabilities.join(", ") || "none"}. DigitalHut advantages to prove: ${test.digitalhutAdvantagesToProve.join(", ") || "none"}. Competitor advantages to respect: ${test.competitorAdvantagesToRespect.join(", ") || "none"}. Scenario: ${test.digitalhutScenarioTest.userScenario}. Next: ${test.nextTest}`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  tests: packet.tests.length,
  repeatedGaps: packet.repeatedGaps.length,
  strongestFinding: packet.strongestFinding,
  currentDigitalhutMetrics: packet.currentDigitalhutMetrics
}, null, 2))
