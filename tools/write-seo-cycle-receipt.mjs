import {mkdir, readFile, writeFile} from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const envPath = path.join(repoRoot, ".env.local")
const publicReceiptPath = path.join(repoRoot, "public", "digitalhut-seo-cycle-receipt-latest.json")
const docsReceiptPath = path.join(repoRoot, "docs", "digitalhut-seo-cycle-receipt-latest.json")

async function readEnvFile(){
  const text = await readFile(envPath, "utf8").catch(() => "")
  const env = {...process.env}
  for(const line of text.split(/\r?\n/)){
    const trimmed = line.trim()
    if(!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
    const [key, ...rest] = trimmed.split("=")
    env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "")
  }
  return env
}

function envValue(env, key){
  return String(env[key] || "").replace(/^['"]|['"]$/g, "").trim()
}

function envUrl(env, ...keys){
  for(const key of keys){
    const value = envValue(env, key)
    if(!value) continue
    try {
      const parsed = new URL(value)
      if(["http:", "https:"].includes(parsed.protocol)) return parsed.toString().replace(/\/+$/, "")
    } catch {
      continue
    }
  }
  return ""
}

async function readJson(filePath){
  const text = await readFile(filePath, "utf8").catch(() => "")
  if(!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function fetchJson(url){
  try {
    const response = await fetch(url, {headers: {"cache-control": "no-cache"}})
    const text = await response.text()
    return {
      ok: response.ok,
      status: response.status,
      json: text ? JSON.parse(text) : null
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      json: null,
      error: error?.message || "network-failed"
    }
  }
}

function pickTraffic(pixel = {}){
  const totals = pixel.interactionTotals || {}
  return {
    pageViews: Number(pixel.totalPageViews ?? totals.pageViews ?? 0),
    uniqueVisitors: Number(pixel.uniqueVisitors || 0),
    totalEvents: Number(pixel.totalEvents || 0),
    glbPreviewPlays: Number(pixel.totalGlbPreviewPlays ?? totals.glbPreviewPlays ?? 0),
    podcastInterrupts: Number(pixel.totalPodcastInterrupts ?? totals.podcastInterrupts ?? 0),
    autoplayStarts: Number(pixel.totalAutoplayStarts ?? totals.autoplayStarts ?? 0),
    searches: Number(pixel.totalSearchRuns ?? totals.searchRuns ?? 0),
    marketOpens: Number(pixel.totalMarketOpens ?? totals.marketOpens ?? 0),
    proofRouteOpens: Number(pixel.totalProofRouteOpens ?? totals.proofRouteOpens ?? 0),
    sourceBacklinkOpens: Number(pixel.totalSourceOpens ?? totals.sourceOpens ?? 0),
    topPages: pixel.topPages || [],
    topContentPulls: pixel.topContentPulls || [],
    originBuckets: pixel.originBuckets || [],
    exploitableMovement: pixel.exploitableMovement || {},
    rawKeywordDiagnostics: pixel.topKeywordHints || []
  }
}

function readinessScore({traffic, searchConsole, competitionPackage}){
  let score = 50
  if(traffic.pageViews >= 300) score += 6
  if(traffic.uniqueVisitors >= 100) score += 6
  if(traffic.glbPreviewPlays >= 80) score += 8
  if(traffic.podcastInterrupts >= 10) score += 4
  if(traffic.autoplayStarts >= 5) score += 3
  if(searchConsole?.searchAnalyticsFresh?.rowCount || searchConsole?.searchAnalyticsFinal?.rowCount) score += 6
  if(searchConsole?.masterKeywordPublicProof?.masterKeywordRows >= 50000) score += 6
  if(searchConsole?.masterKeywordPublicProof?.routeCrawlShellCount >= 100) score += 5
  if(competitionPackage?.status === "competition-seo-pull-package-produced") score += 4
  return Math.min(100, score)
}

async function writeSupabaseReceipt(env, receipt){
  const url = envUrl(env, "SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL")
  const key = envValue(env, "SUPABASE_SERVICE_ROLE_KEY") || envValue(env, "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue(env, "SUPABASE_SECRET_KEY")
  if(!url || !key){
    return {saved: false, reason: "missing-supabase-service-config", hasUrl: Boolean(url), hasServiceKey: Boolean(key)}
  }

  const row = {
    runner_id: "digitalhut-seo-overseer",
    report_type: "seo-cycle-receipt",
    score: receipt.score,
    summary: receipt.summary,
    payload: receipt
  }

  let response
  try {
    response = await fetch(`${url}/rest/v1/digitalhut_runner_reports`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        prefer: "return=representation"
      },
      body: JSON.stringify(row)
    })
  } catch (error) {
    return {saved: false, reason: "supabase-runner-report-network-failed", detail: error?.cause?.code || error?.message || "fetch failed"}
  }
  const text = await response.text()
  if(!response.ok){
    return {saved: false, reason: "supabase-runner-report-write-failed", status: response.status, detail: text.slice(0, 500)}
  }
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = null
  }
  return {saved: true, status: response.status, inserted: Array.isArray(json) ? json.map((item) => ({id: item.id, created_at: item.created_at})) : json}
}

async function main(){
  const env = await readEnvFile()
  const generatedAt = new Date().toISOString()
  const [
    insightMap,
    searchConsole,
    competitionPackage,
    functionalityLadder,
    masterCoverage
  ] = await Promise.all([
    fetchJson("https://www.digitalhut.app/api/insight-map"),
    readJson(path.join(repoRoot, "docs", "digitalhut-search-console-ranking-test-20260707.json")),
    readJson(path.join(repoRoot, "public", "digitalhut-competition-seo-pull-package.json")),
    readJson(path.join(repoRoot, "public", "digitalhut-functionality-ladder-competitors.json")),
    readJson(path.join(repoRoot, "public", "digitalhut-master-keyword-coverage.json"))
  ])

  const traffic = pickTraffic(insightMap.json?.pixel || {})
  const receipt = {
    generatedAt,
    status: "seo-cycle-receipt-produced",
    owner: "Digitalhut.app",
    runnerId: "digitalhut-seo-overseer",
    cycle: "seo-main-website-intertwine-and-database-write",
    guardrail: "This receipt records SEO cycle reasoning and measured public signals. It is not counted as page views, unique visitors, searches, GLB plays, podcast interrupts, proof opens, or source opens.",
    traffic,
    searchConsole: {
      freshRows: Number(searchConsole?.searchAnalyticsFresh?.rowCount || 0),
      freshClicks: Number(searchConsole?.searchAnalyticsFresh?.totalClicks || 0),
      freshImpressions: Number(searchConsole?.searchAnalyticsFresh?.totalImpressions || 0),
      finalRows: Number(searchConsole?.searchAnalyticsFinal?.rowCount || 0),
      finalClicks: Number(searchConsole?.searchAnalyticsFinal?.totalClicks || 0),
      finalImpressions: Number(searchConsole?.searchAnalyticsFinal?.totalImpressions || 0),
      sitemapSurfacesVisible: Number(searchConsole?.compareAndContrast?.sitemapSurfacesVisible || 0),
      sitemapSurfacesPending: Number(searchConsole?.compareAndContrast?.sitemapSurfacesPending || 0),
      indexedInspectionTargets: Number(searchConsole?.compareAndContrast?.indexedInspectionTargets || 0),
      discoveredInspectionTargets: Number(searchConsole?.compareAndContrast?.discoveredInspectionTargets || 0),
      rankingTruth: searchConsole?.rankingTruth || "not-read"
    },
    sitemap: {
      masterKeywordRows: Number(searchConsole?.masterKeywordPublicProof?.masterKeywordRows || masterCoverage?.masterKeywordSitemapUrlRows || 0),
      totalRows: Number(searchConsole?.masterKeywordPublicProof?.totalSitemapRows || 0),
      masterKeywordUniverse: Number(searchConsole?.masterKeywordPublicProof?.masterKeywordUniverse || masterCoverage?.totalIndividualRanks || 0),
      routeCrawlShellCount: Number(searchConsole?.masterKeywordPublicProof?.routeCrawlShellCount || 0)
    },
    seoIntertwine: {
      websiteLayer: "system-proof, master-keyword-coverage, watch routes, category lanes, blog routes, public JSON artifacts, sitemap index, 50k master keyword sitemap",
      proofArtifacts: [
        "digitalhut-competition-seo-pull-package.json",
        "digitalhut-functionality-ladder-competitors.json",
        "digitalhut-master-keyword-coverage.json",
        "digitalhut-seo-cycle-receipt-latest.json"
      ],
      strongestPull: competitionPackage?.groupedPulls?.[0]?.id || "full-entertainment-observatory",
      currentLadderFocus: functionalityLadder?.nextSeoCast?.primaryTarget || "full entertainment observatory"
    },
    decisions: [
      "Keep UI locked unless behavior data proves a visible change is needed.",
      "Use GLB as the strongest current behavior signal while keeping the full entertainment observatory as the anchor.",
      "Treat cyberhut as a weak homepage doorway until repeated DigitalHut or observatory-intent query rows appear.",
      "Promote only lanes that create Search Console rows, proof route opens, source opens, searches, autoplay starts, GLB plays, or podcast interrupts."
    ],
    nextAction: "Watch for proof route opens and source/backlink opens; keep content pull decisions at the general audience-lane level instead of promoting individual GLB asset names."
  }
  receipt.score = readinessScore({traffic, searchConsole, competitionPackage})
  receipt.summary = `SEO cycle receipt: ${traffic.pageViews} page views, ${traffic.uniqueVisitors} unique visitors, ${traffic.glbPreviewPlays} GLB plays, ${traffic.podcastInterrupts} podcast interrupts, Search Console fresh rows ${receipt.searchConsole.freshRows}, sitemap rows ${receipt.sitemap.totalRows || receipt.sitemap.masterKeywordRows}.`

  const supabase = await writeSupabaseReceipt(env, receipt)
  receipt.database = {
    target: "public.digitalhut_runner_reports",
    writeType: "seo-cycle-receipt",
    ...supabase
  }

  const json = `${JSON.stringify(receipt, null, 2)}\n`
  await mkdir(path.dirname(publicReceiptPath), {recursive: true})
  await mkdir(path.dirname(docsReceiptPath), {recursive: true})
  await Promise.all([
    writeFile(publicReceiptPath, json, "utf8"),
    writeFile(docsReceiptPath, json, "utf8")
  ])

  console.log(JSON.stringify({
    ok: true,
    score: receipt.score,
    traffic,
    searchConsole: receipt.searchConsole,
    sitemap: receipt.sitemap,
    database: receipt.database,
    publicReceiptPath,
    docsReceiptPath
  }, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ok: false, error: error.message}, null, 2))
  process.exit(1)
})
