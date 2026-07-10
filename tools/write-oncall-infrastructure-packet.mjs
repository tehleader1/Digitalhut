import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname} from "node:path"

const site = "https://www.digitalhut.app"
const generatedAt = new Date().toISOString()
const publicPath = "public/digitalhut-oncall-infrastructure-packet.json"
const docsPath = "docs/digitalhut-oncall-infrastructure-packet.md"
const videoReference = {
  title: "On-call Engineer 2026",
  url: "https://youtu.be/sY1UqUuBqQQ",
  usage: "public context reference only; DigitalHut does not copy transcript, captions, or protected video content",
  reason: "The reference frames the serious infrastructure-maintenance job behind DigitalHut: keeping media, GLB rendering, podcast/source moments, databases, cloud services, deployments, and analytics reliable."
}
const verifiedVideoContext = {
  source: "YouTube visible description, hashtags, music panel, and visible page context inspected in browser",
  transcriptStatus: "transcript button is visible in the page, but YouTube did not expose transcript lines through direct caption/transcript requests during this run",
  creatorDescriptionExamples: [
    "on-call engineer interview",
    "pager test calls",
    "one call that is not a test",
    "Hetzner data-center filming context",
    "on-call life",
    "pager duty",
    "cloud computing",
    "data center video",
    "data center tour",
    "on-prem migration",
    "expired SSL certificate",
    "Kubernetes",
    "cloud engineering",
    "Prometheus",
    "observability"
  ],
  visibleCommunityContext: [
    "Cloudflare-style outage mention",
    "disaster recovery testing joke",
    "database administrator adjacent recommendation"
  ],
  guardrail: "Creator description examples are treated as public metadata/context; community comments are context only, not creator claims."
}

function readJson(path){
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

async function readProductionPixel(){
  try {
    const response = await fetch(`${site}/api/insight-map?packet=oncall-infrastructure`)
    if(!response.ok) throw new Error(`HTTP ${response.status}`)
    const json = await response.json()
    return json.pixel || null
  } catch {
    return null
  }
}

const searchConsole = readJson("docs/digitalhut-search-console-ranking-test-20260707.json")
const rowPush = readJson("public/digitalhut-search-console-row-push.json")
const coverage = readJson("public/digitalhut-master-keyword-coverage.json")
const avenueLock = readJson("public/digitalhut-traffic-avenue-lock.json")
const pixel = await readProductionPixel()

const infrastructureSignals = [
  {
    system: "FireCuda staging ground",
    role: "large local capacity for SEO mapping, route shells, proof artifacts, build receipts, and longtail refinement snapshots",
    publicProof: `${site}/digitalhut-master-keyword-coverage.json`,
    measurement: "master keyword coverage and sitemap row production"
  },
  {
    system: "Supabase analytics database",
    role: "records page views, visitors, GLB plays, podcast interrupts, autoplay, search, market opens, proof opens, and source opens",
    publicProof: `${site}/api/insight-map`,
    measurement: "live event totals and latest behavior"
  },
  {
    system: "Google Cloud and Search Console",
    role: "validates sitemap visibility, crawl discovery, Search Console rows, and search-surface readiness",
    publicProof: `${site}/digitalhut-search-console-row-push.json`,
    measurement: "sitemap rows, master keyword rows, indexed/discovered/unknown inspection targets"
  },
  {
    system: "Vercel deployment layer",
    role: "serves the dapp, public proof artifacts, route shells, sitemap, and API surfaces",
    publicProof: `${site}/sitemap.xml`,
    measurement: "public route availability and deployment-crawl readiness"
  },
  {
    system: "DigitalHut media observatory",
    role: "connects video watching, 3D Model View, podcast/source moments, search, and live analytics into one dapp interface",
    publicProof: `${site}/watch/on-call-system-engineer-observatory`,
    measurement: "watch route opens, GLB plays, podcast interrupts, autoplay starts, search runs, proof/source opens"
  }
]

const currentRead = {
  pageViews: pixel?.totalPageViews ?? avenueLock?.currentPressureRead?.pageViews ?? null,
  uniqueVisitors: pixel?.uniqueVisitors ?? avenueLock?.currentPressureRead?.uniqueVisitors ?? null,
  totalEvents: pixel?.totalEvents ?? avenueLock?.currentPressureRead?.totalEvents ?? null,
  glbPreviewPlays: pixel?.totalGlbPreviewPlays ?? avenueLock?.currentPressureRead?.glbPreviewPlays ?? null,
  podcastInterrupts: pixel?.totalPodcastInterrupts ?? avenueLock?.currentPressureRead?.podcastInterrupts ?? null,
  autoplayStarts: pixel?.totalAutoplayStarts ?? avenueLock?.currentPressureRead?.autoplayStarts ?? null,
  searchRuns: pixel?.totalSearchRuns ?? avenueLock?.currentPressureRead?.searchRuns ?? null,
  marketOpens: pixel?.totalMarketOpens ?? avenueLock?.currentPressureRead?.marketOpens ?? null,
  proofRouteOpens: pixel?.totalProofRouteOpens ?? avenueLock?.currentPressureRead?.proofRouteOpens ?? null,
  sourceOpens: pixel?.totalSourceOpens ?? avenueLock?.currentPressureRead?.sourceOpens ?? null,
  topContentPull: pixel?.topContentPulls?.[0]?.contentPull ?? avenueLock?.scoredAvenues?.[0]?.label ?? "Full-System Pass-By Post"
}

const packet = {
  generatedAt,
  status: "oncall-infrastructure-packet-ready",
  site,
  canonicalRoute: `${site}/watch/on-call-system-engineer-observatory`,
  blogRoute: `${site}/blog/on-call-system-engineer-observatory`,
  categoryRoute: `${site}/category/programmer`,
  videoReference,
  verifiedVideoContext,
  lane: {
    id: "on-call-system-engineer-observatory",
    category: "Programmer",
    publicMeaning: "DigitalHut is not only an entertainment page. It is a maintained media infrastructure system: storage, cloud, database, deployment, renderer, podcast/source, analytics, sitemap, and Search Console surfaces working together.",
    longtailFamilies: [
      "on call system engineer observatory",
      "FireCuda Google Cloud Supabase Vercel infrastructure",
      "video analytics dapp backend maintenance",
      "3D renderer podcast system reliability",
      "cloud database storage uptime dapp infrastructure",
      "system engineer maintaining live media analytics",
      "Search Console Supabase live media infrastructure",
      "pager duty observability Prometheus Kubernetes incident response",
      "expired SSL certificate on-prem migration cloud engineering",
      "data center tour live media infrastructure maintenance"
    ],
    backlinkAngles: ["developer article", "cloud architecture note", "database analytics proof", "deployment proof", "watch proof route"],
    measurementSignals: ["Search Console row", "Supabase event read", "watch route open", "proof route open", "source open", "GLB play", "podcast interrupt"]
  },
  currentRead,
  searchConsoleRead: {
    sitemapVisible: searchConsole?.sitemap?.visible ?? searchConsole?.compareAndContrast?.sitemapSurfacesVisible > 0 ?? null,
    sitemapSurfacesVisible: searchConsole?.compareAndContrast?.sitemapSurfacesVisible ?? null,
    sitemapSurfacesPending: searchConsole?.compareAndContrast?.sitemapSurfacesPending ?? null,
    searchConsoleRows: searchConsole?.compareAndContrast?.searchConsoleRows ?? searchConsole?.searchAnalyticsFresh?.rowCount ?? null,
    finalRows: searchConsole?.searchAnalyticsFinal?.rowCount ?? null,
    freshRows: searchConsole?.searchAnalyticsFresh?.rowCount ?? null,
    freshImpressions: searchConsole?.searchAnalyticsFresh?.totalImpressions ?? null,
    indexedInspectionTargets: searchConsole?.compareAndContrast?.indexedInspectionTargets ?? null,
    discoveredInspectionTargets: searchConsole?.compareAndContrast?.discoveredInspectionTargets ?? null,
    unknownInspectionTargets: searchConsole?.compareAndContrast?.unknownInspectionTargets ?? null
  },
  masterKeywordRead: {
    totalSitemapRows: rowPush?.producedTotalSitemapUrlRows ?? null,
    masterKeywordRows: rowPush?.producedMasterKeywordUrlRows ?? null,
    verifiedMasterKeywordUniverse: rowPush?.verifiedMasterKeywordUniverse ?? coverage?.totalIndividualRanks ?? null,
    coveragePolicy: coverage?.coveragePolicy ?? null
  },
  infrastructureSignals,
  exampleMap: [
    {
      videoExample: "pager test calls and one real page",
      digitalhutTranslation: "alerts that separate harmless system noise from a real production incident",
      keywordMap: ["pager duty observability", "on call incident response", "DigitalHut uptime proof", "live analytics alert routing"],
      route: `${site}/watch/on-call-system-engineer-observatory`
    },
    {
      videoExample: "on-prem migration",
      digitalhutTranslation: "moving or staging heavy media, database, and SEO proof workloads between local FireCuda capacity and cloud infrastructure",
      keywordMap: ["on prem migration dapp infrastructure", "FireCuda cloud staging", "local storage to cloud database", "media dapp migration proof"],
      route: `${site}/watch/on-call-system-engineer-observatory`
    },
    {
      videoExample: "expired SSL certificate",
      digitalhutTranslation: "public trust, domain health, API calls, video embeds, Search Console, and crawler access depend on clean HTTPS status",
      keywordMap: ["expired SSL certificate monitoring", "HTTPS dapp uptime", "Search Console crawl access", "Vercel domain certificate proof"],
      route: `${site}/system-proof`
    },
    {
      videoExample: "Kubernetes, Prometheus, and observability",
      digitalhutTranslation: "the observatory must measure renderer health, API events, Supabase rows, user behavior, sitemap rows, and proof/source openings",
      keywordMap: ["Prometheus observability dapp", "Kubernetes media infrastructure", "Supabase event observability", "3D renderer monitoring"],
      route: `${site}/digitalhut-oncall-infrastructure-packet.json`
    },
    {
      videoExample: "data center and cloud computing",
      digitalhutTranslation: "DigitalHut's public experience depends on physical storage, cloud APIs, deployment infrastructure, and database reliability working together",
      keywordMap: ["data center cloud dapp", "Google Cloud Supabase Vercel infrastructure", "video 3D podcast cloud system", "backend infrastructure entertainment observatory"],
      route: `${site}/blog/on-call-system-engineer-observatory`
    }
  ],
  decision: currentRead.proofRouteOpens > 0 || currentRead.sourceOpens > 0
    ? "stack this lane because proof/source opened"
    : "keep this as a serious developer/infrastructure proof lane while Search Console and Supabase behavior decide promotion",
  nextAction: "Use this lane to explain why DigitalHut is a maintained 2026 dapp infrastructure system, then promote only when developer, proof, source, GLB, podcast, search, or Search Console rows move."
}

const markdown = `# DigitalHut On-Call Infrastructure Packet

Generated: ${generatedAt}

Reference: ${videoReference.title} (${videoReference.url})

Usage: ${videoReference.usage}

Transcript status: ${verifiedVideoContext.transcriptStatus}

## Meaning

${packet.lane.publicMeaning}

## Verified Video Context

${verifiedVideoContext.creatorDescriptionExamples.map((item) => `- ${item}`).join("\n")}

## Current Read

- Page views: ${currentRead.pageViews}
- Unique visitors: ${currentRead.uniqueVisitors}
- Total events: ${currentRead.totalEvents}
- GLB plays: ${currentRead.glbPreviewPlays}
- Podcast interrupts: ${currentRead.podcastInterrupts}
- Autoplay starts: ${currentRead.autoplayStarts}
- Searches: ${currentRead.searchRuns}
- Proof opens: ${currentRead.proofRouteOpens}
- Source opens: ${currentRead.sourceOpens}

## Systems

${infrastructureSignals.map((item) => `- ${item.system}: ${item.role}`).join("\n")}

## Example Map

${packet.exampleMap.map((item) => `- ${item.videoExample}: ${item.digitalhutTranslation}`).join("\n")}

## Decision

${packet.decision}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: true,
  publicPath,
  docsPath,
  pageViews: currentRead.pageViews,
  uniqueVisitors: currentRead.uniqueVisitors,
  totalSitemapRows: packet.masterKeywordRead.totalSitemapRows,
  canonicalRoute: packet.canonicalRoute
}, null, 2))
