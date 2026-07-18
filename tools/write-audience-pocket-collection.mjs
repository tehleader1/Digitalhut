import {existsSync, mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-audience-pocket-collection.json"
const docsPath = "docs/digitalhut-audience-pocket-collection.md"

const sideBaseline = {
  label: "side-pocket-baseline-20260709",
  capturedAt: "2026-07-09T06:45:00.000Z",
  pageViews: 317,
  uniqueVisitors: 116,
  totalEvents: 534,
  glbPreviewPlays: 83,
  podcastInterrupts: 13,
  autoplayStarts: 5,
  searches: 2,
  marketOpens: 5,
  proofRouteOpens: 0,
  sourceOpens: 0
}

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

function totalsFromPixel(pixel = {}){
  return {
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
  }
}

function deltaTotals(current, baseline){
  return Object.fromEntries(Object.keys(baseline)
    .filter((key) => typeof baseline[key] === "number")
    .map((key) => [key, Math.max(0, Number(current[key] || 0) - Number(baseline[key] || 0))]))
}

function pocketKey(pocket = {}){
  return [
    pocket.origin || "unknown-origin",
    pocket.path || "/",
    canonicalLane(pocket.lane)
  ].join("::")
}

function canonicalLane(lane){
  const raw = String(lane || "").trim()
  return raw && raw !== "unassigned-lane" ? raw : "DigitalHut 200M SEO Master List"
}

function isFreshPocket(pocket = {}, deltas = {}){
  if(Number(deltas.pageViews || 0) <= 0 && Number(deltas.uniqueVisitors || 0) <= 0 && Number(deltas.totalEvents || 0) <= 0) return false
  if(Number(pocket.proofRouteOpens || 0) > 0 || Number(pocket.sourceOpens || 0) > 0) return true
  if(Number(pocket.searches || 0) > 0 || Number(pocket.autoplayStarts || 0) > 0 || Number(pocket.podcastInterrupts || 0) > 0) return true
  if(Number(pocket.glbPreviewPlays || 0) > 0 && String(pocket.origin || "") !== "vercel-preview-or-deploy") return true
  return false
}

function compactPocket(pocket = {}, status = "side-collected"){
  return {
    key: pocketKey(pocket),
    status,
    origin: pocket.origin || "unknown-origin",
    path: pocket.path || "/",
    lane: canonicalLane(pocket.lane),
    rawLane: pocket.lane || "unassigned-lane",
    events: Number(pocket.events || 0),
    visitors: Number(pocket.visitors || 0),
    pageViews: Number(pocket.pageViews || 0),
    secondActions: Number(pocket.secondActions || 0),
    glbPreviewPlays: Number(pocket.glbPreviewPlays || 0),
    podcastInterrupts: Number(pocket.podcastInterrupts || 0),
    autoplayStarts: Number(pocket.autoplayStarts || 0),
    searches: Number(pocket.searches || 0),
    marketOpens: Number(pocket.marketOpens || 0),
    proofRouteOpens: Number(pocket.proofRouteOpens || 0),
    sourceOpens: Number(pocket.sourceOpens || 0),
    publicSignalScore: Number(pocket.publicSignalScore || 0),
    latest: pocket.latest || "",
    sampleEvents: pocket.sampleEvents || [],
    sampleQueries: pocket.sampleQueries || [],
    sampleReferrers: pocket.sampleReferrers || []
  }
}

const previous = readJson(publicPath, {
  mainCollection: [],
  sideCollection: []
})
const insight = await fetchJson(`${site}/api/insight-map?pocket-collection=${Date.now()}`, {})
const pixel = insight?.pixel || {}
const currentTotals = totalsFromPixel(pixel)
const deltas = deltaTotals(currentTotals, sideBaseline)
const locations = pixel.trafficLocationMap || []

const sideKeys = new Set((previous.sideCollection || []).map((item) => item.key))
const mainKeys = new Set((previous.mainCollection || []).map((item) => item.key))

const sideCollection = [
  ...(previous.sideCollection || []),
  ...locations
    .map((pocket) => compactPocket(pocket, "side-collected"))
    .filter((pocket) => !sideKeys.has(pocket.key))
].sort((a, b) => b.publicSignalScore - a.publicSignalScore).slice(0, 24)

const freshCandidates = locations
  .filter((pocket) => isFreshPocket(pocket, deltas))
  .map((pocket) => compactPocket(pocket, "fresh-candidate"))
  .filter((pocket) => !mainKeys.has(pocket.key))

const mainCollection = [
  ...(previous.mainCollection || []),
  ...freshCandidates.map((pocket) => ({
    ...pocket,
    status: pocket.proofRouteOpens > 0 || pocket.sourceOpens > 0
      ? "main-proof-source-pocket"
      : "main-second-action-pocket",
    collectedAt: new Date().toISOString()
  }))
].sort((a, b) => b.publicSignalScore - a.publicSignalScore).slice(0, 50)

const report = {
  generatedAt: new Date().toISOString(),
  status: "audience-pocket-collection-ready",
  site,
  rule: "The 317 page view / 116 visitor baseline is collected to the side. Fresh reads compare against that baseline; only new movement becomes main collection material.",
  sidePocketBaseline: sideBaseline,
  currentTotals,
  deltaSinceSideBaseline: deltas,
  sideCollection,
  mainCollection,
  freshCandidatesAdded: freshCandidates.length,
  decision: freshCandidates.length > 0
    ? "fresh-groups-added-to-main-collection"
    : "no-new-group-yet-keep-reading-fresh",
  nextAction: freshCandidates.length > 0
    ? "Promote the fresh pocket lane in the next exact-lane rotation and watch for proof/source opens."
    : "Keep current pocket to the side and keep the next read focused on new proof, source, search, autoplay, podcast, or non-preview GLB movement."
}

const md = `# DigitalHut Audience Pocket Collection

Generated: ${report.generatedAt}

Side baseline: ${sideBaseline.pageViews} page views, ${sideBaseline.uniqueVisitors} participating browser IDs, ${sideBaseline.totalEvents} events.

Current read: ${currentTotals.pageViews} page views, ${currentTotals.uniqueVisitors} participating browser IDs, ${currentTotals.totalEvents} events.

Delta: ${deltas.pageViews} page views, ${deltas.uniqueVisitors} participating browser IDs, ${deltas.totalEvents} events.

Decision: ${report.decision}

## Main Collection

${mainCollection.length ? mainCollection.map((pocket) => `- ${pocket.lane} at ${pocket.path}: ${pocket.events} events, ${pocket.visitors} visitors, ${pocket.secondActions} second actions, ${pocket.origin}`).join("\n") : "- No fresh group yet."}

## Side Collection

${sideCollection.slice(0, 8).map((pocket) => `- ${pocket.lane} at ${pocket.path}: ${pocket.events} events, ${pocket.visitors} visitors, ${pocket.secondActions} second actions, ${pocket.origin}`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  decision: report.decision,
  currentTotals,
  deltaSinceSideBaseline: deltas,
  sideCollectionCount: sideCollection.length,
  mainCollectionCount: mainCollection.length,
  freshCandidatesAdded: freshCandidates.length
}, null, 2))
