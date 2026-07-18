import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"

function readJson(path, fallback = {}){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return fallback
  }
}

async function fetchJson(url, fallback = {}){
  try {
    const response = await fetch(url)
    if(!response.ok) return {...fallback, fetchStatus: response.status}
    return await response.json()
  } catch (error){
    return {...fallback, fetchError: error?.message || "fetch failed"}
  }
}

function scoreAvenue(avenue, pixel, searchConsole){
  let score = 0
  const evidence = []
  const contentPulls = pixel.topContentPulls || []
  const pull = contentPulls.find((item) => String(item.contentPull || "").toLowerCase().includes(avenue.matchPull.toLowerCase()))
  if(pull?.count){
    score += Math.min(40, Number(pull.count))
    evidence.push(`${pull.count} content-pull events`)
  }
  for(const signal of avenue.signalKeys){
    const value = Number(pixel[signal] || 0)
    if(value){
      score += Math.min(25, Math.ceil(value / 2))
      evidence.push(`${value} ${signal}`)
    }
  }
  if(searchConsole?.freshRows > 0){
    score += 8
    evidence.push(`${searchConsole.freshRows} fresh Search Console row`)
  }
  if(searchConsole?.freshImpressions > 0){
    score += 8
    evidence.push(`${searchConsole.freshImpressions} fresh Search Console impression`)
  }
  if(avenue.requiredMissing.some((signal) => Number(pixel[signal] || 0) === 0)){
    score -= 12
    evidence.push(`missing ${avenue.requiredMissing.join(", ")}`)
  }
  return {score: Math.max(0, score), evidence}
}

const pixelEnvelope = await fetchJson(`${site}/api/insight-map?traffic-avenue-lock=${Date.now()}`)
const pixel = pixelEnvelope.pixel || {}
const searchConsole = readJson("docs/digitalhut-search-console-ranking-test-20260707.json", {})
const searchConsoleCompare = searchConsole.compareAndContrast || {}
const coverage = readJson("public/digitalhut-master-keyword-coverage.json", {})
const rowPush = readJson("public/digitalhut-search-console-row-push.json", {})
const supabaseCompare = readJson("public/digitalhut-supabase-search-pixel-compare.json", {})
const currentTotalSitemapRows = Math.max(Number(searchConsole.totalSitemapRows || 0), Number(searchConsoleCompare.publicProofRowsReady || 0), Number(rowPush.producedTotalSitemapUrlRows || 0))
const currentMasterKeywordRows = Math.max(Number(searchConsole.masterKeywordRows || 0), Number(searchConsoleCompare.masterKeywordRowsReady || 0), Number(rowPush.producedMasterKeywordUrlRows || 0))

const avenues = [
  {
    id: "full-system-pass-by-post",
    label: "Full-System Pass-By Post",
    matchPull: "Full Entertainment",
    publicRoute: "/watch/full-view-episode-alternative",
    sourceTargets: ["ProductHunt-style launch pages", "AI video tool discussions", "YouTube alternative comparisons", "3D viewer roundups"],
    exactPostAngle: "2026 dapp entertainment observatory: video watching + 3D Model View + podcast/source moments + live analytics in one interface.",
    signalKeys: ["totalPageViews", "uniqueVisitors", "totalGlbPreviewPlays", "totalAutoplayStarts"],
    requiredMissing: ["totalProofRouteOpens", "totalSourceOpens"],
    action: "Lead with the full dapp alternative, then push people to proof/source routes instead of only the homepage."
  },
  {
    id: "glb-model-view-communities",
    label: "GLB And 3D Model View Communities",
    matchPull: "Gaming And 3D",
    publicRoute: "/watch/game-world-glb-presentation",
    sourceTargets: ["3D model viewer communities", "game asset discussions", "Sketchfab-style source pages", "VR room walkthrough searches"],
    exactPostAngle: "Watch a video session while the 3D Model View opens, rotates, zooms, and explains the model as part of the episode.",
    signalKeys: ["totalGlbPreviewPlays", "totalAutoplayStarts"],
    requiredMissing: ["totalSourceOpens"],
    action: "Use GLB as the strongest second-action hook, but keep every trail tied to the full DigitalHut system."
  },
  {
    id: "podcast-source-trust",
    label: "Podcast Source Trust Moments",
    matchPull: "AI Video Podcast",
    publicRoute: "/watch/ai-video-podcast-source-explainer",
    sourceTargets: ["podcast clip pages", "AI summary tool discussions", "source explainer pages", "creator/source pages"],
    exactPostAngle: "Podcast/source moments interrupt the video only when they add authority, then return the viewer to the observatory session.",
    signalKeys: ["totalPodcastInterrupts", "totalAutoplayStarts"],
    requiredMissing: ["totalSourceOpens"],
    action: "Use podcast as trust proof after the video/GLB hook; avoid making it the lead lane until source opens appear."
  },
  {
    id: "mundane-life-searches",
    label: "Mundane Life Search Capture",
    matchPull: "Full Entertainment",
    publicRoute: "/watch/local-life-errands-companion",
    sourceTargets: ["lunch searches", "rideshare searches", "flight booking searches", "wiki/research lookups", "funny reel searches", "review-before-buying searches"],
    exactPostAngle: "Everyday searches can become a useful video + source + 3D context session instead of a dead tab.",
    signalKeys: ["totalSearchRuns", "totalPageViews"],
    requiredMissing: ["totalProofRouteOpens", "totalSourceOpens"],
    action: "Promote only the mundane lanes that earn search or proof events; hold filler variants until behavior appears."
  },
  {
    id: "research-developer-proof",
    label: "Research And Developer Proof",
    matchPull: "Research Developer",
    publicRoute: "/watch/developer-programmer-research-observatory",
    sourceTargets: ["developer dapp comparisons", "API/source proof pages", "research-summary systems", "cloud-backed app discussions"],
    exactPostAngle: "DigitalHut is not a static site: it has Vercel, Supabase, Google, sitemap packets, GLB rendering, podcast/source moments, and measurable event receipts.",
    signalKeys: ["totalBlogViews", "totalSearchRuns"],
    requiredMissing: ["totalProofRouteOpens", "totalSourceOpens"],
    action: "Use developer proof to win credibility, then wait for Search Console rows before expanding technical keywords."
  },
  {
    id: "market-business-side-lane",
    label: "Market And Business Side Lane",
    matchPull: "Market",
    publicRoute: "/watch/market-company-observatory",
    sourceTargets: ["company source pages", "market visualizer discussions", "business-media searches", "stock video explainers"],
    exactPostAngle: "Market topics become a company video/source/3D environment read, but remain a side arm of the entertainment observatory.",
    signalKeys: ["totalMarketOpens", "totalSearchRuns"],
    requiredMissing: ["totalSourceOpens"],
    action: "Keep market available; do not let it pull the system away from the full entertainment dapp lane."
  }
]

const scoredAvenues = avenues.map((avenue) => {
  const scored = scoreAvenue(avenue, pixel, searchConsole)
  return {
    ...avenue,
    score: scored.score,
    evidence: scored.evidence,
    status: scored.score >= 45 ? "active-avenue" : scored.score >= 20 ? "watch-and-tighten" : "hold-until-signal"
  }
}).sort((a, b) => b.score - a.score)

const report = {
  generatedAt: new Date().toISOString(),
  status: "traffic-avenue-lock-ready",
  site,
  purpose: "Secure the 200,572,944 longtail universe while Search Console catches up by mapping every traffic avenue to proof routes, source trails, Supabase behavior, and promote/hold decisions.",
  guardrails: [
    "Do not publish 200M thin pages.",
    "Do not claim Google rank movement until Search Console rows, impressions, clicks, and indexed routes prove it.",
    "Do not expand a lane because it sounds exciting; expand only after Supabase/Search Console shows behavior.",
    "Use external posts only where the answer is useful, relevant, and human-readable."
  ],
  currentPressureRead: {
    totalEvents: Number(pixel.totalEvents || 0),
    pageViews: Number(pixel.totalPageViews || 0),
    uniqueVisitors: Number(pixel.uniqueVisitors || 0),
    glbPreviewPlays: Number(pixel.totalGlbPreviewPlays || 0),
    podcastInterrupts: Number(pixel.totalPodcastInterrupts || 0),
    autoplayStarts: Number(pixel.totalAutoplayStarts || 0),
    searches: Number(pixel.totalSearchRuns || 0),
    marketOpens: Number(pixel.totalMarketOpens || 0),
    proofRouteOpens: Number(pixel.totalProofRouteOpens || 0),
    sourceOpens: Number(pixel.totalSourceOpens || 0)
  },
  searchConsoleRead: {
    sitemapVisible: Boolean(searchConsole.sitemapVisible || searchConsoleCompare.sitemapSurfacesVisible > 0),
    sitemapSurfacesVisible: Number(searchConsole.sitemapSurfacesVisible || searchConsoleCompare.sitemapSurfacesVisible || 0),
    sitemapSurfacesPending: Number(searchConsole.sitemapSurfacesPending || searchConsoleCompare.sitemapSurfacesPending || 0),
    totalSitemapRows: currentTotalSitemapRows,
    masterKeywordRows: currentMasterKeywordRows,
    routeCrawlShellCount: Number(searchConsole.routeCrawlShellCount || searchConsoleCompare.routeCrawlShellCount || 0),
    finalRows: Number(searchConsole.finalRows || 0),
    finalClicks: Number(searchConsole.finalClicks || 0),
    finalImpressions: Number(searchConsole.finalImpressions || 0),
    freshRows: Number(searchConsole.freshRows || searchConsoleCompare.searchConsoleRows || 0),
    freshImpressions: Number(searchConsole.freshImpressions || 0)
  },
  masterKeywordLock: {
    totalIndividualRanks: Number(coverage.totalIndividualRanks || 0),
    publicRouteRows: Number(coverage.materializedSitemapUrlRows || 0),
    representativeKeywordRows: Number(coverage.masterKeywordSitemapUrlRows || 0),
    coverageRows: Number(coverage.coverageRows || 0),
    policy: coverage.coveragePolicy || "representative proof routes plus capped sitemap rows"
  },
  supabaseCompareRead: {
    organicRows: Number(supabaseCompare.exportRead?.organicRows || 0),
    exportUniqueVisitors: Number(supabaseCompare.exportRead?.uniqueVisitors || 0),
    exportGlbPreviewPlays: Number(supabaseCompare.exportSignalTotals?.glbPreviewPlays || 0),
    exportPodcastPlays: Number(supabaseCompare.exportSignalTotals?.podcastPlays || 0),
    decision: supabaseCompare.compareAndContrast?.[0]?.decision || "pending"
  },
  scoredAvenues,
  nextBestAction: "Use the full-system pass-by post and GLB model-view communities as the next natural traffic positions, but the first real explosion trigger is proof/source opens or new Search Console query rows.",
  promotionRule: "Promote a lane only when at least one of these moves: Search Console impressions, proof route opens, source/backlink opens, search runs, GLB plays from non-preview origins, podcast source plays, or autoplay starts from public candidates."
}

writeFileSync("public/digitalhut-traffic-avenue-lock.json", `${JSON.stringify(report, null, 2)}\n`, "utf8")
mkdirSync(dirname("docs/digitalhut-traffic-avenue-lock.md"), {recursive: true})
writeFileSync("docs/digitalhut-traffic-avenue-lock.md", `# DigitalHut Traffic Avenue Lock

Generated: ${report.generatedAt}

## Current Pressure

- Page views: ${report.currentPressureRead.pageViews}
- Participating browser IDs: ${report.currentPressureRead.uniqueVisitors}
- GLB plays: ${report.currentPressureRead.glbPreviewPlays}
- Podcast interrupts: ${report.currentPressureRead.podcastInterrupts}
- Autoplay starts: ${report.currentPressureRead.autoplayStarts}
- Searches: ${report.currentPressureRead.searches}
- Market opens: ${report.currentPressureRead.marketOpens}
- Proof route opens: ${report.currentPressureRead.proofRouteOpens}
- Source/backlink opens: ${report.currentPressureRead.sourceOpens}

## Search Console

- Sitemap visible: ${report.searchConsoleRead.sitemapVisible}
- Sitemap surfaces visible: ${report.searchConsoleRead.sitemapSurfacesVisible}
- Sitemap surfaces pending: ${report.searchConsoleRead.sitemapSurfacesPending}
- Total sitemap rows: ${report.searchConsoleRead.totalSitemapRows}
- Master keyword rows: ${report.searchConsoleRead.masterKeywordRows}
- Fresh rows: ${report.searchConsoleRead.freshRows}
- Fresh impressions: ${report.searchConsoleRead.freshImpressions}

## Avenue Ranking

${scoredAvenues.map((avenue, index) => `${index + 1}. **${avenue.label}** (${avenue.status}, score ${avenue.score}) — ${avenue.exactPostAngle} Evidence: ${avenue.evidence.join("; ") || "waiting for signal"}. Next: ${avenue.action}`).join("\n")}

## Next Best Action

${report.nextBestAction}
`, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicJson: "public/digitalhut-traffic-avenue-lock.json",
  docsMd: "docs/digitalhut-traffic-avenue-lock.md",
  topAvenue: scoredAvenues[0]?.label,
  topScore: scoredAvenues[0]?.score,
  pageViews: report.currentPressureRead.pageViews,
  uniqueVisitors: report.currentPressureRead.uniqueVisitors,
  proofRouteOpens: report.currentPressureRead.proofRouteOpens,
  sourceOpens: report.currentPressureRead.sourceOpens,
  totalSitemapRows: report.searchConsoleRead.totalSitemapRows
}, null, 2))
