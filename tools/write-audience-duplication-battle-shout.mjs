import {mkdirSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const publicPath = "public/digitalhut-audience-duplication-battle-shout.json"
const docsPath = "docs/digitalhut-audience-duplication-battle-shout.md"

async function fetchJson(url, fallback = {}){
  try {
    const response = await fetch(url, {headers: {"cache-control": "no-cache"}})
    if(!response.ok) return {...fallback, fetchStatus: response.status}
    return await response.json()
  } catch (error) {
    return {...fallback, fetchError: error?.message || "fetch failed"}
  }
}

function laneAngle(pocket = {}){
  const lane = String(pocket.lane || "").toLowerCase()
  const path = String(pocket.path || "").toLowerCase()
  if(lane.includes("mainstream")) return "full entertainment alternative: video + 3D Model View + podcast/source moments + live analytics"
  if(lane.includes("gaming") || lane.includes("glb") || lane.includes("3d")) return "3D model viewer communities, but always with the full-system dapp angle"
  if(lane.includes("market") || lane.includes("business")) return "market observatory users who want video context, source moments, and visual data in one view"
  if(path.includes("blog")) return "proof/blog readers who need a direct route into the interactive observatory"
  if(lane === "unassigned-lane") return "DigitalHut 200M SEO Master List entry: route pass-by traffic into system proof and source bridge before narrowing the measurable facet"
  return "full-system entertainment observatory audience"
}

function canonicalLane(lane){
  const raw = String(lane || "").trim()
  return raw && raw !== "unassigned-lane" ? raw : "DigitalHut 200M SEO Master List"
}

function duplicateDecision(pocket = {}){
  if(Number(pocket.proofRouteOpens || 0) > 0 || Number(pocket.sourceOpens || 0) > 0) return "stack-now-proof-source-hit"
  if(Number(pocket.podcastInterrupts || 0) > 0 && Number(pocket.glbPreviewPlays || 0) > 0) return "duplicate-mainstream-system-lane"
  if(Number(pocket.glbPreviewPlays || 0) > 10) return "duplicate-glb-interest-with-proof-route"
  if(Number(pocket.marketOpens || 0) > 0) return "duplicate-market-as-separate-intent-lane"
  if(Number(pocket.pageViews || 0) > 20 && Number(pocket.secondActions || 0) === 0) return "hold-side-pocket-needs-action"
  return "watch-next-read"
}

const insight = await fetchJson(`${site}/api/insight-map?battle-shout=${Date.now()}`)
const pixel = insight.pixel || {}
const locations = Array.isArray(pixel.trafficLocationMap) ? pixel.trafficLocationMap : []
const sideBaseline = {
  label: "side-pocket-baseline-117-unique-visitors",
  capturedAt: new Date().toISOString(),
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

const duplicationTargets = locations.slice(0, 12).map((pocket) => ({
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
  angle: laneAngle(pocket),
  decision: duplicateDecision(pocket)
}))

const competitorBattleShout = [
  "DigitalHut is not competing as a scroll page.",
  "The battle lane is full entertainment observatory: video watching, 3D Model View, podcast/source moments, search, autoplay, and live analytics in one dapp interface.",
  "Duplicate only pockets that prove behavior through GLB, podcast, autoplay, search, market, proof, or source opens.",
  "The missing win condition is still proof/source opens above zero."
]

const report = {
  generatedAt: new Date().toISOString(),
  status: "audience-side-pocket-and-duplication-map-ready",
  source: `${site}/api/insight-map`,
  sideBaseline,
  competitorBattleShout,
  duplicationTargets,
  nextAction: "Keep the 117 unique visitors collected to the side. Treat broad homepage/direct movement as the 200M whole-system entry, then duplicate only pockets that create second actions or proof/source opens."
}

const md = `# DigitalHut Audience Duplication Battle Shout

Generated: ${report.generatedAt}

Side pocket: ${sideBaseline.uniqueVisitors} unique visitors, ${sideBaseline.pageViews} page views, ${sideBaseline.totalEvents} events.

## Battle Shout

${competitorBattleShout.map((line) => `- ${line}`).join("\n")}

## Duplication Targets

${duplicationTargets.map((target) => `- ${target.lane} from ${target.origin} at ${target.path}: ${target.visitors} visitors, ${target.pageViews} page views, ${target.secondActions} second actions. Decision: ${target.decision}.`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
writeFileSync(docsPath, md, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  sideBaseline,
  duplicationTargets: duplicationTargets.length,
  nextAction: report.nextAction
}, null, 2))
