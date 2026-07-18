import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const repoRoot = process.cwd()
const defaultInput = "C:/Users/Admin/.codex/attachments/95c95521-1ca2-4aa5-8281-0d364148f02f/pasted-text.txt"
const inputPath = process.argv[2] || defaultInput
const site = "https://www.digitalhut.app"

function safeJson(value, fallback = null){
  if(!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function countBy(rows, keyFn, limit = 12){
  const map = new Map()
  for(const row of rows){
    const key = keyFn(row) || ""
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .slice(0, limit)
    .map(([value, count]) => ({value, count}))
}

function isSynthetic(row){
  const metadata = safeJson(row.metadata, {})
  return Boolean(
    metadata?.synthetic === true ||
    String(row.session_id || "").startsWith("codex_") ||
    String(row.visitor_id || "").startsWith("codex_")
  )
}

function classifyDevice(userAgent = ""){
  const ua = String(userAgent)
  if(/HeadlessChrome/i.test(ua)) return "headless-or-crawler"
  if(/Android|Mobile|iPhone/i.test(ua)) return "mobile"
  if(/Windows|Macintosh|X11|Linux/i.test(ua)) return "desktop"
  return "unknown"
}

async function fetchProductionPixel(){
  try {
    const response = await fetch(`${site}/api/insight-map?supabase-pixel-compare=${Date.now()}`)
    if(!response.ok) return {ok: false, status: response.status}
    const json = await response.json()
    return {ok: true, status: response.status, pixel: json.pixel || null}
  } catch (error){
    return {ok: false, error: error?.message || "fetch failed"}
  }
}

const rawRows = JSON.parse(readFileSync(inputPath, "utf8"))
const enrichedRows = rawRows.map((row) => ({
  ...row,
  metadataObject: safeJson(row.metadata, {}),
  synthetic: isSynthetic(row)
}))
const organicRows = enrichedRows.filter((row) => !row.synthetic)
const syntheticRows = enrichedRows.filter((row) => row.synthetic)
const production = await fetchProductionPixel()
const productionPixel = production.pixel || {}

const eventCounts = countBy(organicRows, (row) => row.event_name, 20)
const pathCounts = countBy(organicRows, (row) => row.path, 14)
const referrerCounts = countBy(organicRows, (row) => row.referrer || "direct-or-private", 10)
const timezoneCounts = countBy(organicRows, (row) => row.metadataObject?.timezone, 10)
const deviceCounts = countBy(organicRows, (row) => classifyDevice(row.user_agent), 8)
const titleCounts = countBy(organicRows, (row) => row.title, 12)
const keywordCounts = countBy(organicRows.filter((row) => row.keyword_hint), (row) => row.keyword_hint, 12)
const categoryCounts = countBy(organicRows.filter((row) => row.category), (row) => row.category, 12)
const blogCounts = countBy(organicRows.filter((row) => row.blog_slug), (row) => row.blog_slug, 12)

const eventCountValue = (name) => eventCounts.find((row) => row.value === name)?.count || 0
const uiClicks = eventCountValue("ui_click")
const glbPreviewPlays = eventCountValue("glb_preview_play")
const podcastPlays = eventCountValue("podcast_interrupt_play")
const autoplayStarts = eventCountValue("autoplay_start")
const marketOpens = eventCountValue("market_view_open")
const blogViews = eventCountValue("blog_view")
const pageViews = eventCountValue("page_view")
const proofRouteOpens = eventCountValue("proof_route_open")
const sourceOpens = eventCountValue("backlink_source_open") + eventCountValue("glb_source_click") + eventCountValue("podcast_source_open") + eventCountValue("viral_source_backlink_open")
const searchRuns = eventCountValue("search_run")

const producthuntRows = organicRows.filter((row) => String(row.search || "").includes("ref=producthunt") || String(row.path || "").includes("ref=producthunt"))
const fullSystemRows = organicRows.filter((row) => /2026 Dapp Entertainment Observatory|3D Model View|AI Guided 3D Observatory|DigitalHut Observatory/i.test(`${row.title || ""} ${row.metadata || ""}`))
const modelViewRows = organicRows.filter((row) => /3D Model View|GLB|Renderer|Preview|zoom|rotate|model/i.test(`${row.event_name} ${row.title || ""} ${row.keyword_hint || ""} ${row.metadata || ""}`))
const podcastRows = organicRows.filter((row) => /podcast/i.test(`${row.event_name} ${row.keyword_hint || ""} ${row.metadata || ""}`))
const marketRows = organicRows.filter((row) => /market|NVDA|NVIDIA|ticker|stock/i.test(`${row.event_name} ${row.keyword_hint || ""} ${row.metadata || ""}`))

const latestOrganic = [...organicRows]
  .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
  .slice(0, 10)
  .map((row) => ({
    eventName: row.event_name,
    path: row.path,
    title: row.title,
    referrer: row.referrer || "direct-or-private",
    keywordHint: row.keyword_hint,
    category: row.category,
    timezone: row.metadataObject?.timezone,
    createdAt: row.created_at
  }))

const compareAndContrast = [
  {
    lane: "Full Entertainment Dapp Alternative",
    evidence: `${fullSystemRows.length} organic rows mention the DigitalHut full-system framing; ${producthuntRows.length} row(s) carry a producthunt-style pass-by trail.`,
    decision: producthuntRows.length ? "duplicate-natural-pass-by-post-trail" : "keep-positioning-and-watch",
    nextAction: "Keep every external post anchored to video watching + 3D Model View + podcast/source moments + live analytics in one dapp, then route back to /watch/full-view-episode-alternative."
  },
  {
    lane: "Gaming And 3D Environment Viewer",
    evidence: `${glbPreviewPlays} organic GLB preview plays plus ${modelViewRows.length} renderer/model-view rows in the export.`,
    decision: glbPreviewPlays > podcastPlays ? "promote-as-strongest-second-action" : "hold",
    nextAction: "Use GLB/model-view language as the strongest useful hook, but keep it attached to the whole entertainment system instead of individual model names."
  },
  {
    lane: "Podcast Source Moments",
    evidence: `${podcastPlays} podcast interrupt plays and ${podcastRows.length} podcast-related rows.`,
    decision: podcastPlays > 0 ? "support-but-do-not-lead" : "hold",
    nextAction: "Use podcast as a trust/source moment after the video and GLB hook; do not let podcast replace the full system message."
  },
  {
    lane: "Market Observatory",
    evidence: `${marketOpens} market open in the export and ${marketRows.length} market/NVDA-related rows.`,
    decision: "keep-as-side-lane",
    nextAction: "Keep market as a connected proof arm, not the primary audience pull."
  },
  {
    lane: "Proof And Source Opens",
    evidence: `${proofRouteOpens} proof route opens and ${sourceOpens} source/backlink opens in this export.`,
    decision: "missing-hit-marker",
    nextAction: "The next SEO posts need a visible reason to open proof/source routes; this is the conversion gap before expanding more keyword volume."
  }
]

const report = {
  generatedAt: new Date().toISOString(),
  status: "supabase-search-pixel-compare-ready",
  site,
  source: "user-provided Supabase Search Pixel export plus production /api/insight-map read",
  guardrail: "Rows marked synthetic or Codex test are excluded from audience decisions. This report does not claim Google rank movement without Search Console rows.",
  exportRead: {
    inputPath,
    totalRows: rawRows.length,
    organicRows: organicRows.length,
    syntheticRows: syntheticRows.length,
    uniqueVisitors: new Set(organicRows.map((row) => row.visitor_id)).size,
    uniqueSessions: new Set(organicRows.map((row) => row.session_id)).size,
    firstSeen: [...organicRows].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))[0]?.created_at || null,
    lastSeen: [...organicRows].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at))).at(-1)?.created_at || null
  },
  exportSignalTotals: {
    pageViews,
    uiClicks,
    blogViews,
    glbPreviewPlays,
    podcastPlays,
    autoplayStarts,
    marketOpens,
    searchRuns,
    proofRouteOpens,
    sourceOpens
  },
  productionRead: {
    ready: Boolean(productionPixel.ready),
    totalEvents: Number(productionPixel.totalEvents || 0),
    pageViews: Number(productionPixel.totalPageViews || 0),
    uniqueVisitors: Number(productionPixel.uniqueVisitors || 0),
    blogViews: Number(productionPixel.totalBlogViews || 0),
    glbPreviewPlays: Number(productionPixel.totalGlbPreviewPlays || 0),
    podcastInterrupts: Number(productionPixel.totalPodcastInterrupts || 0),
    autoplayStarts: Number(productionPixel.totalAutoplayStarts || 0),
    searches: Number(productionPixel.totalSearchRuns || 0),
    marketOpens: Number(productionPixel.totalMarketOpens || 0),
    proofRouteOpens: Number(productionPixel.totalProofRouteOpens || 0),
    sourceOpens: Number(productionPixel.totalSourceOpens || 0),
    summaryLine: productionPixel.summaryLine || null
  },
  countTables: {
    eventCounts,
    pathCounts,
    referrerCounts,
    timezoneCounts,
    deviceCounts,
    titleCounts,
    keywordCounts,
    categoryCounts,
    blogCounts
  },
  keyTrailRows: producthuntRows.map((row) => ({
    eventName: row.event_name,
    path: row.path,
    title: row.title,
    search: row.search,
    language: row.metadataObject?.language,
    timezone: row.metadataObject?.timezone,
    seoClaim: row.metadataObject?.seoClaim || null,
    entryTrail: row.metadataObject?.entryTrail || null,
    createdAt: row.created_at
  })),
  compareAndContrast,
  nextSystemMove: "Position DigitalHut posts where pass-by audiences already understand the full dapp framing, then measure whether they continue into GLB, podcast, autoplay, search, proof, or source actions before expanding more of the 200M universe.",
  latestOrganic
}

writeFileSync("public/digitalhut-supabase-search-pixel-compare.json", `${JSON.stringify(report, null, 2)}\n`, "utf8")
mkdirSync(dirname("docs/digitalhut-supabase-search-pixel-compare.md"), {recursive: true})
const md = `# DigitalHut Supabase Search Pixel Compare

Generated: ${report.generatedAt}

## Export Read

- Total rows: ${report.exportRead.totalRows}
- Organic rows used: ${report.exportRead.organicRows}
- Synthetic/Codex test rows excluded: ${report.exportRead.syntheticRows}
- Participating browser IDs: ${report.exportRead.uniqueVisitors}
- Unique sessions: ${report.exportRead.uniqueSessions}
- Window: ${report.exportRead.firstSeen} to ${report.exportRead.lastSeen}

## Organic Signal Totals

- Page views: ${pageViews}
- UI clicks: ${uiClicks}
- Blog views: ${blogViews}
- GLB preview plays: ${glbPreviewPlays}
- Podcast plays: ${podcastPlays}
- Autoplay starts: ${autoplayStarts}
- Market opens: ${marketOpens}
- Search runs: ${searchRuns}
- Proof route opens: ${proofRouteOpens}
- Source/backlink opens: ${sourceOpens}

## Production Read

${report.productionRead.summaryLine || "Production insight-map did not return a summary line."}

## Compare And Contrast

${compareAndContrast.map((item) => `- **${item.lane}**: ${item.evidence} Decision: ${item.decision}. Next: ${item.nextAction}`).join("\n")}

## Next System Move

${report.nextSystemMove}
`
writeFileSync("docs/digitalhut-supabase-search-pixel-compare.md", md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicJson: "public/digitalhut-supabase-search-pixel-compare.json",
  docsMd: "docs/digitalhut-supabase-search-pixel-compare.md",
  organicRows: report.exportRead.organicRows,
  uniqueVisitors: report.exportRead.uniqueVisitors,
  glbPreviewPlays,
  podcastPlays,
  producthuntTrailRows: producthuntRows.length,
  productionSummary: report.productionRead.summaryLine
}, null, 2))
