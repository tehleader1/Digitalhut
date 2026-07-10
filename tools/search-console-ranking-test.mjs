import crypto from "node:crypto"
import {readFile, writeFile, mkdir} from "node:fs/promises"
import path from "node:path"
import {fileURLToPath} from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const envPath = path.join(repoRoot, ".env.local")
const docsDir = path.join(repoRoot, "docs")
const generatedAt = new Date().toISOString()
const defaultSitemapUrls = [
  "https://www.digitalhut.app/sitemap.xml",
  "https://www.digitalhut.app/sitemap-index.xml",
  "https://www.digitalhut.app/sitemap-master-keyword-50000.xml"
]

function base64url(input){
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

async function readEnvFile(){
  const text = await readFile(envPath, "utf8").catch(() => "")
  const env = {}
  for(const line of text.split(/\r?\n/)){
    const trimmed = line.trim()
    if(!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue
    const [key, ...rest] = trimmed.split("=")
    env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "")
  }
  return env
}

async function readServiceAccount(env){
  if(env.GOOGLE_SERVICE_ACCOUNT_JSON){
    return JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON)
  }
  const credentialsPath = env.GOOGLE_APPLICATION_CREDENTIALS
  if(!credentialsPath){
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS")
  }
  return JSON.parse(await readFile(credentialsPath, "utf8"))
}

async function readJsonFile(filePath){
  const text = await readFile(filePath, "utf8").catch(() => "")
  if(!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function masterKeywordSampleUrls(limit = 2){
  const sitemapPath = path.join(repoRoot, "public", "sitemap-master-keyword-50000.xml")
  const text = await readFile(sitemapPath, "utf8").catch(() => "")
  const matches = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)]
  return matches
    .slice(0, limit)
    .map((match) => match[1].replace(/&amp;/g, "&"))
}

async function googleAccessToken(account, scopes){
  const now = Math.floor(Date.now() / 1000)
  const header = {alg: "RS256", typ: "JWT"}
  const claim = {
    iss: account.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  }
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`
  const signer = crypto.createSign("RSA-SHA256")
  signer.update(unsigned)
  const signature = signer.sign(account.private_key).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: `${unsigned}.${signature}`
  })
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  })
  const json = await response.json().catch(() => ({}))
  if(!response.ok || !json.access_token){
    throw new Error(`Google OAuth failed: ${response.status} ${json.error_description || json.error || ""}`.trim())
  }
  return json.access_token
}

function dateDaysAgo(days){
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

async function googleJson(url, options = {}){
  const response = await fetch(url, options)
  const json = await response.json().catch(() => ({}))
  return {ok: response.ok, status: response.status, json}
}

async function inspectUrl({headers, siteUrl, inspectionUrl}){
  const response = await googleJson("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: {...headers, "Content-Type": "application/json"},
    body: JSON.stringify({inspectionUrl, siteUrl})
  })
  const indexStatus = response.json?.inspectionResult?.indexStatusResult || {}
  return {
    url: inspectionUrl,
    ok: response.ok,
    status: response.status,
    verdict: indexStatus.verdict || null,
    coverageState: indexStatus.coverageState || null,
    robotsTxtState: indexStatus.robotsTxtState || null,
    indexingState: indexStatus.indexingState || null,
    lastCrawlTime: indexStatus.lastCrawlTime || null,
    pageFetchState: indexStatus.pageFetchState || null,
    googleCanonical: indexStatus.googleCanonical || null,
    userCanonical: indexStatus.userCanonical || null,
    error: response.json?.error?.message || null
  }
}

function metricTotals(rows){
  const totalClicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0)
  const totalImpressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0)
  const weightedPosition = rows.reduce((sum, row) => sum + Number(row.position || 0) * Number(row.impressions || 0), 0)
  return {
    rowCount: rows.length,
    totalClicks,
    totalImpressions,
    averagePosition: totalImpressions ? Number((weightedPosition / totalImpressions).toFixed(2)) : null
  }
}

function mdTable(rows){
  if(!rows.length) return "_No Search Console query rows returned yet._"
  const header = "| Query | Page | Country | Clicks | Impressions | Position |\n| --- | --- | --- | ---: | ---: | ---: |"
  const body = rows.map((row) => {
    const [query = "", page = "", country = ""] = row.keys || []
    return `| ${query.replace(/\|/g, "/")} | ${page.replace(/\|/g, "/")} | ${country} | ${row.clicks || 0} | ${row.impressions || 0} | ${Number(row.position || 0).toFixed(2)} |`
  }).join("\n")
  return `${header}\n${body}`
}

function indexedMasterListFacet({inspections, masterKeywordRows, totalSitemapRows, universe}){
  const indexedRepresentatives = inspections
    .filter((item) => item.verdict === "PASS")
    .map((item) => ({
      url: item.url,
      coverageState: item.coverageState,
      lastCrawlTime: item.lastCrawlTime,
      role: item.url === "https://www.digitalhut.app/"
        ? "homepage entry representative for the full DigitalHut entertainment observatory"
        : "crawl-confirmed proof window into the 200M master keyword universe"
    }))
  const discoveredRepresentatives = inspections
    .filter((item) => String(item.coverageState || "").toLowerCase().includes("discovered"))
    .map((item) => ({
      url: item.url,
      coverageState: item.coverageState,
      role: "queued representative route for the same master-list facet"
    }))
  return {
    status: indexedRepresentatives.length
      ? "master-list-facet-has-indexed-representatives"
      : "master-list-facet-waiting-for-indexed-representatives",
    interpretation: "Indexed proof targets are treated as representative windows into the 200,572,944 DigitalHut SEO Master List, not isolated page wins.",
    measurableFacet: "DigitalHut 200M SEO Master List",
    universe,
    publicSitemapWindow: masterKeywordRows,
    totalPublicRows: totalSitemapRows,
    indexedRepresentativeCount: indexedRepresentatives.length,
    discoveredRepresentativeCount: discoveredRepresentatives.length,
    indexedRepresentatives,
    discoveredRepresentatives,
    nextRequirement: "Turn indexed representatives into Search Console query rows, proof route opens, source/backlink opens, and second actions inside the observatory."
  }
}

async function main(){
  const env = await readEnvFile()
  const account = await readServiceAccount(env)
  const siteUrl = env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "https://www.digitalhut.app/"
  const sitemapUrl = env.GOOGLE_SEARCH_CONSOLE_SITEMAP_URL || "https://www.digitalhut.app/sitemap.xml"
  const sitemapUrls = [...new Set([sitemapUrl, ...defaultSitemapUrls])]
  const shouldSubmitSitemap = process.argv.includes("--submit-sitemap")
  const token = await googleAccessToken(account, [shouldSubmitSitemap ? "https://www.googleapis.com/auth/webmasters" : "https://www.googleapis.com/auth/webmasters.readonly"])
  const headers = {Authorization: `Bearer ${token}`}
  const encodedSite = encodeURIComponent(siteUrl)
  const rowPushReceipt = await readJsonFile(path.join(repoRoot, "public", "digitalhut-search-console-row-push.json"))
  const crawlShellReceipt = await readJsonFile(path.join(repoRoot, "dist", "digitalhut-route-crawl-shells.json"))
  const masterSamples = await masterKeywordSampleUrls(2)

  const sites = await googleJson("https://www.googleapis.com/webmasters/v3/sites", {headers})
  const sitemapSubmit = shouldSubmitSitemap
    ? await Promise.all(sitemapUrls.map(async (url) => {
      const response = await googleJson(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodeURIComponent(url)}`, {
        method: "PUT",
        headers
      })
      return {url, ok: response.ok, status: response.status, error: response.json?.error?.message || null}
    }))
    : null
  const sitemaps = await googleJson(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {headers})
  const query = await googleJson(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: "POST",
    headers: {...headers, "Content-Type": "application/json"},
    body: JSON.stringify({
      startDate: dateDaysAgo(30),
      endDate: dateDaysAgo(3),
      dimensions: ["query", "page", "country"],
      rowLimit: 100,
      type: "web",
      dataState: "final"
    })
  })
  const freshQuery = await googleJson(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: "POST",
    headers: {...headers, "Content-Type": "application/json"},
    body: JSON.stringify({
      startDate: dateDaysAgo(7),
      endDate: dateDaysAgo(1),
      dimensions: ["query", "page", "country"],
      rowLimit: 100,
      type: "web",
      dataState: "all"
    })
  })

  const inspectionTargets = [...new Set([
    siteUrl,
    "https://www.digitalhut.app/system-proof",
    "https://www.digitalhut.app/master-keyword-coverage",
    "https://www.digitalhut.app/digitalhut-longtail-web-cast.json",
    "https://www.digitalhut.app/digitalhut-operator-search-trail-latest.json",
    "https://www.digitalhut.app/digitalhut-search-visible-homepage-focus.json",
    "https://www.digitalhut.app/digitalhut-functionality-ladder-competitors.json",
    "https://www.digitalhut.app/digitalhut-competition-seo-pull-package.json",
    "https://www.digitalhut.app/watch/full-view-episode-alternative",
    "https://www.digitalhut.app/blog/full-view-episode-alternative",
    "https://www.digitalhut.app/watch/home-project-3d-visual-planner",
    "https://www.digitalhut.app/blog/automatic-3d-autoplay-system",
    "https://www.digitalhut.app/category/mainstream-streaming",
    ...masterSamples
  ])]
  const inspections = await Promise.all(inspectionTargets.map((inspectionUrl) => inspectUrl({headers, siteUrl, inspectionUrl})))

  const sitemapRows = Array.isArray(sitemaps.json?.sitemap) ? sitemaps.json.sitemap : []
  const matchingSitemap = sitemapRows.find((item) => item.path === sitemapUrl) || null
  const matchingSitemaps = sitemapUrls.map((url) => {
    const match = sitemapRows.find((item) => item.path === url) || null
    return match ? {
      path: match.path,
      lastSubmitted: match.lastSubmitted,
      lastDownloaded: match.lastDownloaded,
      isPending: match.isPending,
      isSitemapsIndex: match.isSitemapsIndex,
      warnings: match.warnings,
      errors: match.errors
    } : {
      path: url,
      visible: false
    }
  })
  const finalRows = Array.isArray(query.json?.rows) ? query.json.rows : []
  const freshRows = Array.isArray(freshQuery.json?.rows) ? freshQuery.json.rows : []
  const discoveredCount = inspections.filter((item) => String(item.coverageState || "").toLowerCase().includes("discovered")).length
  const indexedCount = inspections.filter((item) => item.verdict === "PASS").length
  const unknownCount = inspections.filter((item) => String(item.coverageState || "").toLowerCase().includes("unknown")).length
  const canonicalProofInspections = inspections.filter((item) => !item.url.includes("?") && item.url !== siteUrl).length
  const masterKeywordRows = Number(rowPushReceipt?.producedMasterKeywordUrlRows || 0)
  const totalSitemapRows = Number(rowPushReceipt?.producedTotalSitemapUrlRows || 0)
  const indexedProofFacet = indexedMasterListFacet({
    inspections,
    masterKeywordRows,
    totalSitemapRows,
    universe: Number(rowPushReceipt?.verifiedMasterKeywordUniverse || 0)
  })
  const compareAndContrast = {
    publicProofRowsReady: totalSitemapRows,
    masterKeywordRowsReady: masterKeywordRows,
    masterKeywordUniverse: Number(rowPushReceipt?.verifiedMasterKeywordUniverse || 0),
    routeCrawlShellsReady: crawlShellReceipt?.status === "route-crawl-shells-produced",
    routeCrawlShellCount: Number(crawlShellReceipt?.routeCount || 0),
    searchConsoleRows: finalRows.length + freshRows.length,
    indexedInspectionTargets: indexedCount,
    discoveredInspectionTargets: discoveredCount,
    unknownInspectionTargets: unknownCount,
    canonicalProofInspections,
    sitemapSurfacesVisible: matchingSitemaps.filter((item) => item.visible !== false).length,
    sitemapSurfacesPending: matchingSitemaps.filter((item) => item.isPending).length,
    indexedMasterListFacetStatus: indexedProofFacet.status,
    nextAction: finalRows.length || freshRows.length
      ? "Compare query/page/country rows against the previous snapshot and promote only routes with real impressions."
      : discoveredCount
        ? "Hold deploys, let Google crawl the submitted sitemap surfaces, and use proof/source opens to decide the next internal-link push."
        : "Strengthen internal links from indexed pages into master keyword coverage and watch proof routes before another sitemap expansion."
  }
  const result = {
    generatedAt,
    siteUrl,
    sitemapUrl,
    sitemapUrls,
    serviceAccountEmail: account.client_email,
    api: {
      sites: {ok: sites.ok, status: sites.status},
      sitemapSubmit: sitemapSubmit
        ? {
          ok: sitemapSubmit.every((item) => item.ok),
          status: sitemapSubmit.map((item) => `${item.url}: ${item.status}`).join("; "),
          results: sitemapSubmit
        }
        : {ok: null, status: "not-requested", results: []},
      sitemaps: {ok: sitemaps.ok, status: sitemaps.status},
      finalSearchAnalytics: {ok: query.ok, status: query.status},
      freshSearchAnalytics: {ok: freshQuery.ok, status: freshQuery.status}
    },
    sitesAccessible: Array.isArray(sites.json?.siteEntry) ? sites.json.siteEntry : [],
    sitemap: matchingSitemap ? {
      path: matchingSitemap.path,
      lastSubmitted: matchingSitemap.lastSubmitted,
      lastDownloaded: matchingSitemap.lastDownloaded,
      isPending: matchingSitemap.isPending,
      warnings: matchingSitemap.warnings,
      errors: matchingSitemap.errors
    } : null,
    sitemaps: matchingSitemaps,
    masterKeywordPublicProof: {
      masterKeywordRows,
      totalSitemapRows,
      masterKeywordUniverse: Number(rowPushReceipt?.verifiedMasterKeywordUniverse || 0),
      routeCrawlShellsReady: compareAndContrast.routeCrawlShellsReady,
      routeCrawlShellCount: compareAndContrast.routeCrawlShellCount,
      canonicalProofInspections: compareAndContrast.canonicalProofInspections,
      sitemapIndexUrl: rowPushReceipt?.sitemapIndexUrl || "https://www.digitalhut.app/sitemap-index.xml",
      masterKeywordSitemapUrl: rowPushReceipt?.masterKeywordSitemapUrl || "https://www.digitalhut.app/sitemap-master-keyword-50000.xml",
      sampleUrls: masterSamples
    },
    searchAnalyticsFinal: {...metricTotals(finalRows), topRows: finalRows.slice(0, 20)},
    searchAnalyticsFresh: {...metricTotals(freshRows), topRows: freshRows.slice(0, 20)},
    inspections,
    indexedProofFacet,
    compareAndContrast,
    rankingTruth: finalRows.length || freshRows.length
      ? "Search Console has query rows; rank movement can be compared against saved snapshots."
      : "Search Console has no query rows yet; Google activity is proven by sitemap and URL inspection, not by ranking rows."
  }

  await mkdir(docsDir, {recursive: true})
  const jsonPath = path.join(docsDir, "digitalhut-search-console-ranking-test-20260707.json")
  const mdPath = path.join(docsDir, "digitalhut-search-console-ranking-test-20260707.md")
  await writeFile(jsonPath, JSON.stringify(result, null, 2))
  await writeFile(mdPath, `# DigitalHut Search Console Ranking Test

Generated: ${generatedAt}

## Real Google Status

- Site: ${siteUrl}
- Sitemap: ${sitemapUrl}
- Sitemap surfaces: ${sitemapUrls.length}
- Search Console service account: ${account.client_email}
- Sites API: ${sites.ok ? "ok" : "failed"} (${sites.status})
- Sitemap submit: ${sitemapSubmit ? sitemapSubmit.map((item) => `${item.url}: ${item.ok ? "ok" : "failed"} (${item.status})`).join("; ") : "not requested"}
- Sitemaps API: ${sitemaps.ok ? "ok" : "failed"} (${sitemaps.status})
- Final Search Analytics API: ${query.ok ? "ok" : "failed"} (${query.status})
- Fresh Search Analytics API: ${freshQuery.ok ? "ok" : "failed"} (${freshQuery.status})

## Sitemap Surfaces

| Sitemap | Visible | Last submitted | Last downloaded | Pending | Warnings | Errors |
| --- | --- | --- | --- | --- | ---: | ---: |
${matchingSitemaps.map((item) => `| ${item.path} | ${item.visible === false ? "no" : "yes"} | ${item.lastSubmitted || "not returned"} | ${item.lastDownloaded || "not returned"} | ${item.isPending ?? "not returned"} | ${item.warnings ?? "not returned"} | ${item.errors ?? "not returned"} |`).join("\n")}

## Master Keyword Public Proof

- Master keyword universe: ${compareAndContrast.masterKeywordUniverse}
- Master keyword sitemap rows: ${compareAndContrast.masterKeywordRowsReady}
- Total sitemap rows: ${compareAndContrast.publicProofRowsReady}
- Route crawl shells ready: ${compareAndContrast.routeCrawlShellsReady ? "yes" : "no"}
- Route crawl shell count: ${compareAndContrast.routeCrawlShellCount}
- Canonical proof inspections: ${compareAndContrast.canonicalProofInspections}
- Sitemap surfaces visible: ${compareAndContrast.sitemapSurfacesVisible}
- Sitemap surfaces pending: ${compareAndContrast.sitemapSurfacesPending}

## Indexed Master List Facet

- Status: ${indexedProofFacet.status}
- Interpretation: ${indexedProofFacet.interpretation}
- Measurable facet: ${indexedProofFacet.measurableFacet}
- Indexed representative routes: ${indexedProofFacet.indexedRepresentativeCount}
- Discovered representative routes: ${indexedProofFacet.discoveredRepresentativeCount}
- Next requirement: ${indexedProofFacet.nextRequirement}

## Final Search Analytics

- Rows: ${result.searchAnalyticsFinal.rowCount}
- Clicks: ${result.searchAnalyticsFinal.totalClicks}
- Impressions: ${result.searchAnalyticsFinal.totalImpressions}
- Average position: ${result.searchAnalyticsFinal.averagePosition ?? "not available"}

${mdTable(result.searchAnalyticsFinal.topRows)}

## Fresh Search Analytics

- Rows: ${result.searchAnalyticsFresh.rowCount}
- Clicks: ${result.searchAnalyticsFresh.totalClicks}
- Impressions: ${result.searchAnalyticsFresh.totalImpressions}
- Average position: ${result.searchAnalyticsFresh.averagePosition ?? "not available"}

${mdTable(result.searchAnalyticsFresh.topRows)}

## URL Inspection

| URL | Verdict | Coverage | Robots | Indexing | Last crawl |
| --- | --- | --- | --- | --- | --- |
${inspections.map((item) => `| ${item.url} | ${item.verdict || "n/a"} | ${item.coverageState || item.error || "n/a"} | ${item.robotsTxtState || "n/a"} | ${item.indexingState || "n/a"} | ${item.lastCrawlTime || "n/a"} |`).join("\n")}

## Ranking Truth

${result.rankingTruth}

## Compare And Contrast

- Indexed inspection targets: ${compareAndContrast.indexedInspectionTargets}
- Discovered inspection targets: ${compareAndContrast.discoveredInspectionTargets}
- Unknown inspection targets: ${compareAndContrast.unknownInspectionTargets}
- Route crawl shells ready: ${compareAndContrast.routeCrawlShellsReady ? "yes" : "no"}
- Route crawl shell count: ${compareAndContrast.routeCrawlShellCount}
- Search Console rows: ${compareAndContrast.searchConsoleRows}
- Next action: ${compareAndContrast.nextAction}
`)
  console.log(JSON.stringify({
    ok: true,
    jsonPath,
    mdPath,
    sitemapVisible: Boolean(matchingSitemap),
    sitemapSubmit: sitemapSubmit || {ok: null, status: "not-requested"},
    sitemapSurfacesVisible: compareAndContrast.sitemapSurfacesVisible,
    sitemapSurfacesPending: compareAndContrast.sitemapSurfacesPending,
    masterKeywordRows,
    totalSitemapRows,
    routeCrawlShellsReady: compareAndContrast.routeCrawlShellsReady,
    routeCrawlShellCount: compareAndContrast.routeCrawlShellCount,
    canonicalProofInspections: compareAndContrast.canonicalProofInspections,
    finalRows: result.searchAnalyticsFinal.rowCount,
    finalClicks: result.searchAnalyticsFinal.totalClicks,
    finalImpressions: result.searchAnalyticsFinal.totalImpressions,
    freshRows: result.searchAnalyticsFresh.rowCount,
    freshClicks: result.searchAnalyticsFresh.totalClicks,
    freshImpressions: result.searchAnalyticsFresh.totalImpressions,
    inspected: inspections.map((item) => ({url: item.url, verdict: item.verdict, coverageState: item.coverageState, lastCrawlTime: item.lastCrawlTime})),
    indexedProofFacet: {
      status: indexedProofFacet.status,
      indexedRepresentativeCount: indexedProofFacet.indexedRepresentativeCount,
      discoveredRepresentativeCount: indexedProofFacet.discoveredRepresentativeCount,
      measurableFacet: indexedProofFacet.measurableFacet
    },
    compareAndContrast
  }, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ok: false, error: error.message}, null, 2))
  process.exit(1)
})
