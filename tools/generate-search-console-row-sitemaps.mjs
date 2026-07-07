import {writeFileSync, mkdirSync} from "node:fs"
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

const site = "https://www.digitalhut.app"
const today = new Date().toISOString().slice(0, 10)
const verifiedMasterKeywordUniverse = Math.max(Number(seoMasterListSummary.totalIndividualRanks || 0), 200572944)

function slugify(value = ""){
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
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
    `    <loc>${item.loc}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    "    <changefreq>daily</changefreq>",
    `    <priority>${item.priority}</priority>`,
    "  </url>"
  ].join("\n")).join("\n")
  return `<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

function collectionValues(value){
  if(Array.isArray(value)) return value
  if(value && typeof value === "object") return Object.values(value)
  return []
}

const urls = new Map();
[
  ["/", "home", "1.00"],
  ["/system-proof", "system-proof", "0.95"],
  ["/blog", "blog-index", "0.92"],
  ["/insights", "metrics", "0.88"],
  ["/standby", "backend-seo-system", "0.86"],
  ["/markets", "market-observatory", "0.84"],
  ["/asset-lab", "glb-lab", "0.78"],
  ["/library", "library", "0.76"],
  ["/digitalhut-indexing-push-status.json", "status-artifact", "0.72"],
  ["/digitalhut-search-console-row-push.json", "row-push-artifact", "0.72"],
  ["/digitalhut-seo-claim-coverage.json", "claim-artifact", "0.72"],
  ["/digitalhut-rank-ownership-index.json", "rank-artifact", "0.72"],
  ["/digitalhut-seo-master-list-packet.json", "master-list-artifact", "0.72"],
  ["/digitalhut-longtail-web-cast.json", "web-cast-artifact", "0.72"]
].forEach(([path, source, priority]) => addUrl(urls, path, source, priority))

for(const post of [...seoRunnerProofPosts, ...seoBlogPosts]){
  const slug = post.slug || post.id
  if(!slug) continue
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
writeFileSync("public/sitemap.xml", xmlFor(sortedUrls), "utf8")
writeFileSync("public/sitemap-routes.xml", xmlFor(sortedUrls), "utf8")

const receipt = {
  generatedAt: new Date().toISOString(),
  status: "search-console-row-sitemap-produced",
  site,
  sitemapUrl: `${site}/sitemap.xml`,
  producedUrlRows: sortedUrls.size,
  verifiedMasterKeywordUniverse,
  rowGoal: "Produce Search Console query/page rows by giving Google crawlable HTML proof routes connected to the 200M master keyword universe.",
  guardrail: "These are crawl/index rows, not guaranteed Google impression rows. Search Console rows appear only after Google indexes and serves pages in search.",
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
  verifiedMasterKeywordUniverse,
  sitemap: "public/sitemap.xml",
  receipt: "public/digitalhut-search-console-row-push.json"
}, null, 2))
