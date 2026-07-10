import {writeFileSync, mkdirSync, readFileSync} from "node:fs"
import {dirname, join} from "node:path"
import {
  seoBlogPosts,
  seoRunnerProofPosts,
  seoMasterListLanes,
  seoCategoryLongTailWebCast,
  seoLaunchRankingTargets,
  seoMasterListSummary,
  seoSearchClaimForQuery,
  seoWebCastKeywordsFor
} from "../src/lib/seoContentEngine.js"
import {
  seoSearchClaimForQuery as seoUniversalSearchClaimForQuery,
  seoSearchClaimLanes,
  seoSearchClaimSummary
} from "../src/lib/seoSearchClaimEngine.js"

const site = "https://www.digitalhut.app"
const today = new Date().toISOString().slice(0, 10)
const verifiedMasterKeywordUniverse = Math.max(Number(seoSearchClaimSummary.totalIndividualRanks || 0), Number(seoMasterListSummary.totalIndividualRanks || 0), 200572944)
const masterKeywordSitemapLimit = 50000

function countedLaneCoverage(){
  let globalStart = 1
  return seoSearchClaimLanes
    .filter((lane) => lane.countedRankSlots !== false)
    .map((lane) => {
      const variationCapacity = Number(lane.variationCapacity || 0)
      const row = {
        id: lane.id,
        lane: lane.lane,
        category: lane.category || lane.lane,
        role: lane.role,
        type: "universal-claim-lane",
        variationCapacity,
        globalRankStart: globalStart,
        globalRankEnd: globalStart + variationCapacity - 1,
        proofRoute: lane.proofRoute,
        measurementSignals: lane.measurementSignals || [],
        backlinkTargets: lane.backlinkTargets || [],
        queryFamilies: queryFamiliesForLane(lane).slice(0, 12),
        searchConsoleIntent: "Create query/page rows through canonical proof routes, then promote only when Supabase and Search Console show behavior."
      }
      globalStart += variationCapacity
      return row
    })
}

function masterKeywordCoverage(){
  const counted = countedLaneCoverage()
  const countedTotal = counted.reduce((total, lane) => total + lane.variationCapacity, 0)
  let cursor = countedTotal + 1
  const residualCapacity = verifiedMasterKeywordUniverse - countedTotal
  const residual = residualCapacity > 0 ? [{
    id: "firecuda-held-longtail-reserve",
    lane: "FireCuda Held Longtail Reserve",
    category: "Compare And Contrast",
    type: "held-reserve",
    variationCapacity: residualCapacity,
    globalRankStart: cursor,
    globalRankEnd: cursor + residualCapacity - 1,
    proofRoute: "/system-proof",
    queryFamilies: ["international side markets", "new client pull routes", "emerging entertainment observatory searches", "compare and contrast refinement"],
    measurementSignals: ["Search Console rows", "Supabase behavior", "proof opens", "source opens"],
    humanMoment: "reserved for measured lanes that earn promotion from live behavior",
    searchConsoleIntent: "Held until live metrics justify promotion; not mass-published as thin pages."
  }] : []
  const lanes = [...counted, ...residual]
  return {
    generatedAt: new Date().toISOString(),
    status: "master-keyword-coverage-produced",
    site,
    totalIndividualRanks: verifiedMasterKeywordUniverse,
    materializedSitemapUrlRows: null,
    coverageRows: lanes.length,
    countedFireCudaRows: seoMasterListLanes.filter((lane) => lane.countedRankSlots !== false).length,
    universalClaimRows: counted.length,
    expansionRows: Math.max(0, counted.length - seoMasterListLanes.filter((lane) => lane.countedRankSlots !== false).length),
    heldReserveRows: residual.length,
    coveragePolicy: "DigitalHut reads the 200M longtail universe as full-system claim lanes. Google receives crawlable proof routes, a 50,000 URL discovery sitemap, and public JSON coverage instead of millions of duplicate thin URLs.",
    googleSitemapGuardrail: "Sitemaps are URL discovery files. The 200M universe is represented through lane coverage rows, canonical proof routes, and a capped 50,000 URL sitemap, while Search Console query rows appear only after Google crawls, indexes, and serves the pages.",
    lanes
  }
}

function slugify(value = ""){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function xmlEscape(value = ""){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function addUrl(urls, path, source, priority = "0.80"){
  if(!path) return
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const loc = `${site}${cleanPath}`
  if(urls.has(loc)) return
  urls.set(loc, {loc, source, priority})
}

function xmlFor(urls){
  const body = [...urls.values()].map((item) => [
    "  <url>",
    `    <loc>${xmlEscape(item.loc)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "    <changefreq>daily</changefreq>",
    `    <priority>${item.priority}</priority>`,
    "  </url>"
  ].join("\n")).join("\n")
  return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function sitemapIndexFor(sitemaps){
  const body = sitemaps.map((loc) => [
    "  <sitemap>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "  </sitemap>"
  ].join("\n")).join("\n")
  return `<?xml version="1.0" encoding="utf-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`
}

const keywordIntents = [
  "best", "2026", "source backed", "visual", "near me", "explained", "for beginners", "professional", "interactive", "live analytics"
]
const keywordContexts = [
  "after work", "family room", "research session", "client preview", "developer study", "gaming night", "travel planning", "before buying", "daily watch session", "local decision"
]
const keywordFormats = [
  "3D Model View", "podcast source moment", "video observatory", "GLB preview", "watch route", "category proof", "backlink source", "timeline explainer", "visual guide", "research hub", "subscription preview", "Auto Play YouTube statistics", "GLB podcast feed", "zoom rotate model controls", "Next Model renderer", "AI system feature"
]

function queryFamiliesForLane(lane = {}){
  return Array.from(new Set([
    lane.lane,
    lane.role,
    ...(lane.measurementSignals || []),
    ...(lane.backlinkTargets || []),
    `${lane.lane} ${keywordFormats[0]}`,
    `${lane.lane} ${keywordFormats[2]}`,
    `${lane.lane} ${keywordFormats[5]}`
  ].filter(Boolean)))
}

function queryForLane(lane, index){
  const families = queryFamiliesForLane(lane)
  const family = families[index % families.length] || lane.lane
  const intent = keywordIntents[Math.floor(index / families.length) % keywordIntents.length]
  const context = keywordContexts[Math.floor(index / (families.length * keywordIntents.length)) % keywordContexts.length]
  const format = keywordFormats[Math.floor(index / (families.length * keywordIntents.length * keywordContexts.length)) % keywordFormats.length]
  return `${intent} ${family} ${context} ${format}`.replace(/\s+/g, " ").trim()
}

function addLoc(urls, loc, source, priority = "0.80", extra = {}){
  if(!loc || urls.has(loc)) return
  urls.set(loc, {loc, source, priority, ...extra})
}

function readJsonFile(filePath){
  try {
    return JSON.parse(readFileSync(filePath, "utf8"))
  } catch {
    return null
  }
}

function rankedKeywordSitemap(coverage){
  const lanes = coverage.lanes.filter((lane) => lane.type !== "held-reserve" && lane.variationCapacity > 0)
  const rotation = readJsonFile("public/digitalhut-master-keyword-rotation.json")
  const weights = rotation?.allocationWeights || {}
  const weightedLanes = lanes.map((lane) => ({
    lane,
    weight: Math.max(1, Number(weights[lane.id] || 10)),
    weightedCapacity: Math.max(1, lane.variationCapacity) * Math.max(1, Number(weights[lane.id] || 10))
  }))
  const total = weightedLanes.reduce((sum, item) => sum + item.weightedCapacity, 0)
  const allocations = weightedLanes.map(({lane, weight, weightedCapacity}) => ({
    lane,
    weight,
    count: Math.max(1, Math.floor((weightedCapacity / total) * masterKeywordSitemapLimit)),
    remainder: ((weightedCapacity / total) * masterKeywordSitemapLimit) % 1
  }))
  let allocated = allocations.reduce((sum, item) => sum + item.count, 0)
  allocations.sort((a, b) => b.remainder - a.remainder)
  for(let i = 0; allocated < masterKeywordSitemapLimit; i = (i + 1) % allocations.length){
    allocations[i].count += 1
    allocated += 1
  }
  while(allocated > masterKeywordSitemapLimit){
    const target = allocations.find((item) => item.count > 1)
    if(!target) break
    target.count -= 1
    allocated -= 1
  }

  const keywordUrls = new Map()
  const samples = []
  for(const {lane, count} of allocations.sort((a, b) => a.lane.globalRankStart - b.lane.globalRankStart)){
    for(let index = 0; index < count; index += 1){
      const clusterRankNumber = Math.min(lane.variationCapacity, Math.max(1, Math.floor(((index + 0.5) / count) * lane.variationCapacity)))
      const globalRankNumber = lane.globalRankStart + clusterRankNumber - 1
      const query = queryForLane(lane, index)
      const claim = seoUniversalSearchClaimForQuery(query, {category: lane.category})
      const path = lane.proofRoute || claim.canonicalRoute || "/system-proof"
      const loc = `${site}${path}?dh_rank=${clusterRankNumber}&dh_global_rank=${globalRankNumber}&dh_lane=${encodeURIComponent(lane.id)}&dh_query=${encodeURIComponent(query)}`
      addLoc(keywordUrls, loc, "master-keyword-50000", "0.80", {lane: lane.lane, query, globalRankNumber})
      if(samples.length < 24) samples.push({lane: lane.lane, query, loc, globalRankNumber})
    }
  }
  return {
    keywordUrls,
    samples,
    rotationStatus: rotation?.status || "static-capacity-allocation",
    allocations: allocations.map(({lane, count, weight}) => ({id: lane.id, lane: lane.lane, count, weight, variationCapacity: lane.variationCapacity}))
  }
}

const urls = new Map();

function collectionValues(value){
  if(Array.isArray(value)) return value
  if(value && typeof value === "object") return Object.values(value)
  return []
}

[
  ["/", "home", "1.00"],
  ["/system-proof", "system-proof", "0.95"],
  ["/master-keyword-coverage", "master-keyword-coverage-page", "0.94"],
  ["/source-bridge", "human-source-bridge", "0.94"],
  ["/blog", "blog-index", "0.92"],
  ["/insights", "metrics", "0.88"],
  ["/standby", "backend-seo-system", "0.86"],
  ["/markets", "market-observatory", "0.84"],
  ["/asset-lab", "glb-lab", "0.78"],
  ["/library", "library", "0.76"],
  ["/digitalhut-indexing-push-status.json", "status-artifact", "0.72"],
  ["/digitalhut-search-console-row-push.json", "row-push-artifact", "0.72"],
  ["/digitalhut-seo-claim-coverage.json", "claim-artifact", "0.72"],
  ["/digitalhut-master-keyword-coverage.json", "master-keyword-coverage", "0.74"],
  ["/digitalhut-rank-ownership-index.json", "rank-artifact", "0.72"],
  ["/digitalhut-seo-master-list-packet.json", "master-list-artifact", "0.72"],
  ["/digitalhut-longtail-web-cast.json", "web-cast-artifact", "0.72"],
  ["/digitalhut-operator-search-trail-latest.json", "operator-search-trail", "0.72"],
  ["/digitalhut-search-visible-homepage-focus.json", "search-visible-homepage-focus", "0.78"],
  ["/digitalhut-functionality-ladder-competitors.json", "functionality-ladder-competitors", "0.76"],
  ["/digitalhut-competition-seo-pull-package.json", "competition-seo-pull-package", "0.79"],
  ["/digitalhut-traffic-positioning-posts.json", "traffic-positioning-posts", "0.80"],
  ["/digitalhut-supabase-search-pixel-compare.json", "supabase-search-pixel-compare", "0.80"],
  ["/digitalhut-traffic-avenue-lock.json", "traffic-avenue-lock", "0.80"],
  ["/digitalhut-oncall-infrastructure-packet.json", "oncall-infrastructure-packet", "0.82"],
  ["/digitalhut-master-keyword-rotation.json", "master-keyword-rotation", "0.83"],
  ["/digitalhut-intro-entertainment-zones.json", "intro-entertainment-zones", "0.83"],
  ["/digitalhut-360-coverage-packet.json", "digitalhut-360-coverage", "0.83"],
  ["/digitalhut-audience-pocket-collection.json", "audience-pocket-collection", "0.83"],
  ["/digitalhut-client-question-queue.json", "client-question-queue", "0.83"],
  ["/digitalhut-audience-duplication-battle-shout.json", "audience-duplication-battle-shout", "0.83"],
  ["/digitalhut-fresh-audience-collection.json", "fresh-audience-collection", "0.84"],
  ["/digitalhut-proof-source-conversion-bridge.json", "proof-source-conversion-bridge", "0.84"],
  ["/digitalhut-client-attempt-router.json", "client-attempt-router", "0.85"],
  ["/digitalhut-active-client-attempt-cycle.json", "active-client-attempt-cycle", "0.86"],
  ["/digitalhut-ladder-match-architecture.json", "comparative-proof-statistic-tests", "0.86"],
  ["/digitalhut-external-comparable-system-tests.json", "external-comparable-system-tests", "0.86"],
  ["/digitalhut-google-cloud-api-consumption-read.json", "google-cloud-api-consumption-read", "0.86"],
  ["/digitalhut-seo-structure-reevaluation.json", "seo-structure-reevaluation", "0.87"],
  ["/digitalhut-seo-cycle-receipt-latest.json", "seo-cycle-database-receipt", "0.77"]
].forEach(([path, source, priority]) => addUrl(urls, path, source, priority))

const introZones = readJsonFile("public/digitalhut-intro-entertainment-zones.json")
for(const zone of introZones?.zones || []){
  addUrl(urls, zone.zonePath, "intro-entertainment-zone", "0.86")
  addUrl(urls, zone.proofRoute, "intro-zone-proof-route", "0.86")
}

const allPosts = [...seoRunnerProofPosts, ...seoBlogPosts]
const seenPosts = new Set()
for(const post of allPosts){
  const slug = post.slug || post.id
  if(!slug || seenPosts.has(slug)) continue
  seenPosts.add(slug)
  addUrl(urls, `/blog/${slug}`, "blog-proof", "0.84")
  addUrl(urls, `/watch/${slug}`, "watch-proof", "0.88")
  addUrl(urls, `/category/${slugify(post.category)}`, "category-proof", "0.82")
}

for(const lane of seoMasterListLanes){
  addUrl(urls, lane.proofRoute, "master-lane-proof", lane.countedRankSlots === false ? "0.92" : "0.86")
  addUrl(urls, `/category/${slugify(lane.lane)}`, "master-lane-category", "0.82")
  addUrl(urls, `/category/${slugify(lane.category)}`, "master-lane-category", "0.82")
  for(const candidate of lane.nextCandidateQueue || []){
    addUrl(urls, candidate.routeTarget || lane.proofRoute, "master-candidate-route", "0.85")
    const claim = seoSearchClaimForQuery(candidate.keyword, {category: lane.category, explicitLaneId: lane.id})
    addUrl(urls, claim.canonicalRoute, "rank-claim-canonical", "0.85")
  }
}

for(const target of collectionValues(seoLaunchRankingTargets)){
  addUrl(urls, target.proofRoute, "launch-ranking-target", "0.86")
  addUrl(urls, `/category/${slugify(target.lane)}`, "launch-ranking-category", "0.82")
  for(const phrase of target.webFamilies || []){
    const route = target.proofRoute || `/watch/${slugify(phrase)}`
    addUrl(urls, route, "web-family-proof", "0.84")
  }
}

for(const cast of collectionValues(seoCategoryLongTailWebCast)){
  addUrl(urls, cast.proofRoute, "category-web-cast", "0.86")
  addUrl(urls, `/category/${slugify(cast.category)}`, "category-web-cast", "0.82")
  const keywords = seoWebCastKeywordsFor({category: cast.category, title: cast.category, keywords: cast.webFamilies || []}, 12)
  for(const keyword of keywords){
    const claim = seoSearchClaimForQuery(keyword, {category: cast.category})
    addUrl(urls, claim.canonicalRoute, "web-cast-keyword-canonical", "0.84")
  }
}

const sortedUrls = new Map([...urls.entries()].sort(([a], [b]) => a.localeCompare(b)))
const coverage = masterKeywordCoverage()
const keywordSitemap = rankedKeywordSitemap(coverage)
coverage.materializedSitemapUrlRows = sortedUrls.size
coverage.masterKeywordSitemapUrlRows = keywordSitemap.keywordUrls.size
coverage.masterKeywordSitemapUrl = `${site}/sitemap-master-keyword-50000.xml`
coverage.sitemapIndexUrl = `${site}/sitemap-index.xml`
coverage.sitemapSampleRows = keywordSitemap.samples
coverage.sitemapAllocation = keywordSitemap.allocations
writeFileSync("public/sitemap.xml", xmlFor(sortedUrls), "utf8")
writeFileSync("public/sitemap-routes.xml", xmlFor(sortedUrls), "utf8")
writeFileSync("public/sitemap-master-keyword-50000.xml", xmlFor(keywordSitemap.keywordUrls), "utf8")
writeFileSync("public/sitemap-index.xml", sitemapIndexFor([
  `${site}/sitemap.xml`,
  `${site}/sitemap-master-keyword-50000.xml`
]), "utf8")
writeFileSync("public/digitalhut-master-keyword-coverage.json", `${JSON.stringify(coverage, null, 2)}\n`, "utf8")

const receipt = {
  generatedAt: new Date().toISOString(),
  status: "search-console-row-sitemap-produced",
  site,
  sitemapUrl: `${site}/sitemap.xml`,
  sitemapIndexUrl: `${site}/sitemap-index.xml`,
  masterKeywordSitemapUrl: `${site}/sitemap-master-keyword-50000.xml`,
  producedUrlRows: sortedUrls.size,
  producedMasterKeywordUrlRows: keywordSitemap.keywordUrls.size,
  producedTotalSitemapUrlRows: sortedUrls.size + keywordSitemap.keywordUrls.size,
  verifiedMasterKeywordUniverse,
  rowGoal: "Produce Search Console query/page rows by giving Google crawlable HTML proof routes connected to the 200M master keyword universe.",
  guardrail: "These are crawl/index rows, not guaranteed Google impression rows. Search Console rows appear only after Google indexes and serves pages in search.",
  masterKeywordCoverageUrl: `${site}/digitalhut-master-keyword-coverage.json`,
  masterKeywordCoverage: {
    totalIndividualRanks: coverage.totalIndividualRanks,
    coverageRows: coverage.coverageRows,
    countedFireCudaRows: coverage.countedFireCudaRows,
    expansionRows: coverage.expansionRows,
    heldReserveRows: coverage.heldReserveRows,
    masterKeywordSitemapUrlRows: coverage.masterKeywordSitemapUrlRows,
    sitemapSampleRows: coverage.sitemapSampleRows,
    sitemapAllocation: coverage.sitemapAllocation,
    rotationStatus: keywordSitemap.rotationStatus,
    coveragePolicy: coverage.coveragePolicy,
    lanes: coverage.lanes.map((lane) => ({
      id: lane.id,
      lane: lane.lane,
      category: lane.category,
      type: lane.type,
      variationCapacity: lane.variationCapacity,
      globalRankStart: lane.globalRankStart,
      globalRankEnd: lane.globalRankEnd,
      proofRoute: lane.proofRoute,
      queryFamilies: lane.queryFamilies || lane.sampleKeywords || []
    }))
  },
  rowSources: [...new Set([...sortedUrls.values()].map((item) => item.source))].sort(),
  topRows: [...sortedUrls.values()].slice(0, 30)
}

const receiptJson = `${JSON.stringify(receipt, null, 2)}\n`
writeFileSync("public/digitalhut-search-console-row-push.json", receiptJson, "utf8")
mkdirSync(dirname(join("docs", "digitalhut-search-console-row-push-20260707.json")), {recursive: true})
writeFileSync("docs/digitalhut-search-console-row-push-20260707.json", receiptJson, "utf8")

console.log(JSON.stringify({
  ok: true,
  producedUrlRows: sortedUrls.size,
  producedMasterKeywordUrlRows: keywordSitemap.keywordUrls.size,
  producedTotalSitemapUrlRows: sortedUrls.size + keywordSitemap.keywordUrls.size,
  verifiedMasterKeywordUniverse,
  sitemap: "public/sitemap.xml",
  sitemapIndex: "public/sitemap-index.xml",
  masterKeywordSitemap: "public/sitemap-master-keyword-50000.xml",
  receipt: "public/digitalhut-search-console-row-push.json"
}, null, 2))
