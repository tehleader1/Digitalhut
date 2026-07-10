import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const site = "https://www.digitalhut.app"
const generatedAt = new Date().toISOString()
const publicPath = "public/digitalhut-intro-entertainment-zones.json"
const docsPath = "docs/digitalhut-intro-entertainment-zones.md"

function slugify(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function readJson(path){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

function categoryForLane(lane){
  const id = lane.id || ""
  if(id.includes("full-entertainment")) return "Full Entertainment Entry"
  if(id.includes("gaming")) return "Gaming And 3D Worlds"
  if(id.includes("real-estate") || id.includes("home-project")) return "Home Real Estate And Projects"
  if(id.includes("planetary") || id.includes("exotic")) return "Planetary Exotic And Travel"
  if(id.includes("architecture")) return "Architecture And Structures"
  if(id.includes("developer") || id.includes("programmer")) return "Developer Infrastructure And Research"
  if(id.includes("ai-video-podcast")) return "AI Video Podcast Source"
  if(id.includes("social") || id.includes("funny")) return "Social Reel And Mainstream Clips"
  if(id.includes("market")) return "Market Company Observatory"
  if(id.includes("workforce")) return "Workforce Training"
  if(id.includes("education") || id.includes("wiki")) return "Education Study Research"
  if(id.includes("local") || id.includes("lunch") || id.includes("rideshare") || id.includes("flight") || id.includes("errands")) return "Mundane Life Decisions"
  if(id.includes("international")) return "International Side Markets"
  return lane.category || "DigitalHut Checkpoint"
}

function checkpointMoment(category){
  const moments = {
    "Full Entertainment Entry": "A viewer wants something richer than a normal video page and is ready for a compact session with video, 3D, podcast, and analytics in one view.",
    "Gaming And 3D Worlds": "A gamer or builder is looking for worlds, maps, servers, walkthroughs, or 3D previews and can be introduced through the model view.",
    "Home Real Estate And Projects": "A person is planning a home, property, room, repair, rental, agency preview, or client walkthrough and needs visual proof before deciding.",
    "Planetary Exotic And Travel": "A curious viewer is exploring launches, planets, islands, reefs, caves, resorts, or unusual places and wants visual context.",
    "Architecture And Structures": "A builder, student, engineer, or owner is studying layout, construction, materials, or a structure and needs a readable visual system.",
    "Developer Infrastructure And Research": "A technical viewer is checking how the system is built, maintained, measured, and kept alive across storage, cloud, database, deploy, and analytics.",
    "AI Video Podcast Source": "A viewer is asking what a video or podcast means and wants a source-backed explanation that updates with the media.",
    "Social Reel And Mainstream Clips": "A person is decoding a funny clip, reel, short, meme, or trending video and needs a quick context layer.",
    "Market Company Observatory": "A viewer is looking at a company, market, ticker, product, or business signal and wants source-backed media context.",
    "Workforce Training": "A worker, trainer, or team lead is trying to understand tools, workflows, safety, jobs, or procedures visually.",
    "Education Study Research": "A student, parent, teacher, or researcher needs a visual study path, source trail, and quick explanation.",
    "Mundane Life Decisions": "A person is doing normal life: lunch, rides, flights, errands, products, local choices, reviews, or quick lookups.",
    "International Side Markets": "A global viewer enters through regional language, local culture, travel, product, entertainment, or study searches."
  }
  return moments[category] || "A wandering searcher reaches a DigitalHut checkpoint and gets an introductory entertainment observatory path."
}

function zoneKeywords(lane, category){
  return [
    lane.lane,
    lane.role,
    `${category} DigitalHut introductory entertainment zone`,
    `${lane.lane} video 3D Model View podcast source live analytics`,
    `${lane.lane} full entertainment dapp checkpoint`,
    ...(lane.measurementSignals || []),
    ...(lane.backlinkTargets || [])
  ].filter(Boolean).slice(0, 18)
}

const rotation = readJson("public/digitalhut-master-keyword-rotation.json")
const searchConsole = readJson("docs/digitalhut-search-console-ranking-test-20260707.json")
const oncall = readJson("public/digitalhut-oncall-infrastructure-packet.json")
const allocationById = new Map((rotation?.allocations || []).map((item) => [item.id, item]))
const lanes = seoSearchClaimLanes.filter((lane) => lane.countedRankSlots !== false)

const zones = lanes.map((lane, index) => {
  const category = categoryForLane(lane)
  const slug = slugify(lane.id)
  const allocation = allocationById.get(lane.id)
  const path = `/zone/${slug}`
  return {
    index: index + 1,
    id: lane.id,
    slug,
    zonePath: path,
    zoneUrl: `${site}${path}`,
    category,
    lane: lane.lane,
    checkpointMoment: checkpointMoment(category),
    introLine: `DigitalHut presents ${lane.lane}: a live introductory entertainment zone where the visitor starts with ${checkpointMoment(category).toLowerCase()} The zone introduces video watching, 3D Model View, podcast/source moments, live analytics, search, proof routes, and source/backlink trails.`,
    proofRoute: lane.proofRoute,
    proofUrl: `${site}${lane.proofRoute}`,
    blogRoute: `${site}/blog/${slug}`,
    categoryRoute: `${site}/category/${slugify(category)}`,
    sitemapRows: allocation?.sitemapRows || allocation?.count || 0,
    rotationScore: allocation?.score || 0,
    variationCapacity: lane.variationCapacity,
    keywords: zoneKeywords(lane, category),
    featureStack: ["video watching", "Auto Play", "Next Episode", "3D Model View", "zoom/rotate model", "podcast/source moment", "live analytics", "search", "proof/source trail"],
    measuringSignals: lane.measurementSignals || [],
    backlinkAngles: lane.backlinkTargets || [],
    promotionRule: "If page views, unique visitors, GLB plays, podcast interrupts, autoplay, search, proof opens, source opens, or Search Console rows move here, this zone earns more of the next 50,000 sitemap window."
  }
})

const grouped = zones.reduce((acc, zone) => {
  acc[zone.category] ||= {category: zone.category, zones: 0, sitemapRows: 0, rotationScore: 0, topZone: zone.lane}
  acc[zone.category].zones += 1
  acc[zone.category].sitemapRows += Number(zone.sitemapRows || 0)
  acc[zone.category].rotationScore += Number(zone.rotationScore || 0)
  if(Number(zone.sitemapRows || 0) > Number(zones.find((item) => item.lane === acc[zone.category].topZone)?.sitemapRows || 0)){
    acc[zone.category].topZone = zone.lane
  }
  return acc
}, {})

const packet = {
  generatedAt,
  status: "intro-entertainment-zones-ready",
  site,
  purpose: "Create live introductory entertainment checkpoints for the 200M longtail universe without publishing 200M thin pages.",
  sourceOfTruth: {
    file: "src/lib/seoSearchClaimEngine.js",
    rule: "Zones are public checkpoints derived from original counted longtail lanes. They do not create, rename, or override the 200M source list.",
    allowedZoneCount: lanes.length,
    totalIndividualRanks: seoSearchClaimSummary.totalIndividualRanks
  },
  universe: {
    internalKeywordUniverse: Math.max(Number(seoSearchClaimSummary.totalIndividualRanks || 0), 200572944),
    activePublicSitemapWindow: rotation?.sitemapLimit || 50000,
    zoneCount: zones.length,
    publicZoneRows: zones.length,
    rotationStatus: rotation?.status || "rotation-missing"
  },
  currentRead: rotation?.liveRead || null,
  searchConsoleRead: {
    freshRows: searchConsole?.searchAnalyticsFresh?.rowCount ?? null,
    freshImpressions: searchConsole?.searchAnalyticsFresh?.totalImpressions ?? null,
    indexedInspectionTargets: searchConsole?.compareAndContrast?.indexedInspectionTargets ?? null,
    discoveredInspectionTargets: searchConsole?.compareAndContrast?.discoveredInspectionTargets ?? null,
    unknownInspectionTargets: searchConsole?.compareAndContrast?.unknownInspectionTargets ?? null
  },
  infrastructureContext: oncall ? {
    route: oncall.canonicalRoute,
    examples: oncall.verifiedVideoContext?.creatorDescriptionExamples || [],
    role: "developer infrastructure proof zone supporting the full entertainment observatory"
  } : null,
  categorySummary: Object.values(grouped).sort((a, b) => b.sitemapRows - a.sitemapRows),
  zones,
  nextAction: "Expose these zones in sitemap/proof packets, let Search Console crawl them, and use Supabase/Search Console movement to decide which zones absorb more of the next 50,000-row rotation."
}

const markdown = `# DigitalHut Introductory Entertainment Zones

Generated: ${generatedAt}

Purpose: ${packet.purpose}

Internal universe: ${packet.universe.internalKeywordUniverse}

Active public sitemap window: ${packet.universe.activePublicSitemapWindow}

## Category Summary

${packet.categorySummary.map((item) => `- ${item.category}: ${item.zones} zones, ${item.sitemapRows} sitemap rows, top zone ${item.topZone}`).join("\n")}

## Zones

${zones.map((zone) => `- ${zone.zonePath}: ${zone.lane} (${zone.sitemapRows} rows)`).join("\n")}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  zoneCount: zones.length,
  internalKeywordUniverse: packet.universe.internalKeywordUniverse,
  topCategory: packet.categorySummary[0],
  topZone: zones.sort((a, b) => b.sitemapRows - a.sitemapRows)[0]
}, null, 2))
