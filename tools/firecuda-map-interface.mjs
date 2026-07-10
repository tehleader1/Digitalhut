import {execFileSync} from "node:child_process"
import {mkdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname, resolve} from "node:path"

const repoRoot = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (match) => match.slice(1))), "..")
const fireCudaRoot = process.env.DIGITALHUT_FIRECUDA_PATH || "D:\\DigitalHutAgent"
const localReceiptPath = resolve(repoRoot, "docs", "digitalhut-firecuda-codex-map-interface-latest.json")
const publicReceiptPath = resolve(repoRoot, "public", "digitalhut-firecuda-codex-map-interface.json")
const fireCudaReceiptPath = `${fireCudaRoot}\\seo-map\\digitalhut-codex-map-interface-latest.json`

function readJson(path, fallback = {}){
  try {
    return JSON.parse(readFileSync(path, "utf8").replace(/^\uFEFF/, ""))
  } catch {
    return fallback
  }
}

function fireCudaHealth(){
  if(process.platform !== "win32") return {healthy: false, status: "non-windows", fireCudaRoot}
  const driveLetter = /^[a-z]:/i.test(fireCudaRoot) ? fireCudaRoot[0].toUpperCase() : "D"
  const escapedPath = fireCudaRoot.replace(/'/g, "''")
  const script = [
    "$ErrorActionPreference='Stop'",
    `$volume=Get-Volume -DriveLetter '${driveLetter}' -ErrorAction Stop`,
    `$path='${escapedPath}'`,
    "$pathReady=Test-Path -LiteralPath $path -PathType Container",
    "$enumerationReady=$false",
    "if($pathReady){ Get-ChildItem -LiteralPath $path -Force -ErrorAction Stop | Select-Object -First 1 | Out-Null; $enumerationReady=$true }",
    "[pscustomobject]@{HealthStatus=[string]$volume.HealthStatus;OperationalStatus=([string[]]$volume.OperationalStatus -join ',');Size=$volume.Size;SizeRemaining=$volume.SizeRemaining;PathReady=$pathReady;EnumerationReady=$enumerationReady}|ConvertTo-Json -Compress"
  ].join("; ")
  try {
    const disk = JSON.parse(execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", script], {encoding: "utf8", windowsHide: true}).trim())
    const operational = String(disk.OperationalStatus || "")
    const healthy = disk.HealthStatus === "Healthy"
      && /OK/i.test(operational)
      && !/Repair|Failed|Unknown|Degraded/i.test(operational)
      && disk.PathReady === true
      && disk.EnumerationReady === true
    return {healthy, status: healthy ? "healthy" : "quarantined", fireCudaRoot, disk}
  } catch(error){
    return {healthy: false, status: "unavailable", fireCudaRoot, error: String(error?.stderr || error?.message || error).trim()}
  }
}

async function productionRead(){
  try {
    const response = await fetch("https://www.digitalhut.app/api/insight-map", {
      headers: {"User-Agent": "DigitalHut-FireCuda-Map/1.0"},
      signal: AbortSignal.timeout(12_000)
    })
    if(!response.ok) throw new Error(`insight-map returned ${response.status}`)
    const payload = await response.json()
    const pixel = payload?.pixel || {}
    return {
      ready: true,
      generatedAt: payload.generatedAt,
      pageViews: Number(pixel.totalPageViews || 0),
      uniqueVisitors: Number(pixel.uniqueVisitors || 0),
      totalEvents: Number(pixel.totalEvents || 0),
      glb: Number(pixel.totalGlbPreviewPlays || 0),
      podcast: Number(pixel.totalPodcastInterrupts || 0),
      autoplay: Number(pixel.totalAutoplayStarts || 0),
      searches: Number(pixel.totalSearchRuns || 0),
      market: Number(pixel.totalMarketOpens || 0),
      proof: Number(pixel.totalProofRouteOpens || 0),
      source: Number(pixel.totalSourceOpens || 0),
      masterKeywordDoorEvents: Number(pixel.totalMasterKeywordDoorEvents || 0),
      freshAudience: pixel.freshAudience || null,
      topMasterKeywordLanes: (pixel.topMasterKeywordLanes || []).slice(0, 12),
      originBuckets: (payload.originBuckets || []).slice(0, 10)
    }
  } catch(error){
    return {ready: false, error: error?.message || "production read failed"}
  }
}

function decisionsFor({live, coverage, routeAudit}){
  const decisions = []
  const routeCoverageReady = routeAudit.status === "pass"
  decisions.push({
    id: "canonical-route-contract",
    decision: routeCoverageReady ? "hold-and-measure" : "repair-route-metadata",
    evidence: `${routeAudit.metadataRoutes || 0}/${routeAudit.sitemapProofRoutes || 0} metadata-to-sitemap routes; ${routeAudit.missingMetadataRoutes?.length || 0} missing`,
    nextAction: routeCoverageReady ? "Do not expand routes until proof/source movement appears." : "Attach metadata to every canonical proof route before deployment."
  })
  decisions.push({
    id: "entry-to-proof-conversion",
    decision: live.proof > 0 || live.source > 0 ? "promote-winning-bridge" : "strengthen-proof-source-bridge",
    evidence: `${live.proof || 0} proof opens / ${live.source || 0} source opens / ${live.masterKeywordDoorEvents || 0} master-keyword door events`,
    nextAction: live.proof > 0 || live.source > 0
      ? "Duplicate the exact route, source, lane, and origin that produced the first verified conversion."
      : "Keep the full entertainment dapp claim stable and route entry traffic toward system proof and source evidence."
  })
  decisions.push({
    id: "master-list-allocation",
    decision: "score-internally-publish-canonically",
    evidence: `${coverage.totalIndividualRanks || 0} internal variations / ${coverage.internalSelectedRotationRows || coverage.masterKeywordSitemapUrlRows || 0} selected / ${coverage.publicCanonicalMasterSitemapUrlRows || 0} canonical master routes`,
    nextAction: "Reweight the 50,000 internal selection only from real Supabase and Search Console receipts; never publish parameter duplicates."
  })
  return decisions
}

async function main(){
  const coverage = readJson(resolve(repoRoot, "public", "digitalhut-master-keyword-coverage.json"))
  const routeAudit = readJson(resolve(repoRoot, "public", "digitalhut-route-coverage-audit.json"))
  const seoReevaluation = readJson(resolve(repoRoot, "public", "digitalhut-seo-structure-reevaluation.json"))
  const cloudRead = readJson(resolve(repoRoot, "public", "digitalhut-google-cloud-api-consumption-read.json"))
  const health = fireCudaHealth()
  const live = await productionRead()
  const receipt = {
    generatedAt: new Date().toISOString(),
    status: health.healthy ? "firecuda-map-connected" : "firecuda-map-local-queue",
    mode: "DigitalHut Codex Oversight Map Interface",
    intelligenceBoundary: "This interface stores evidence and Codex decision receipts. It does not claim autonomous Codex reasoning when Codex is offline.",
    flow: ["FireCuda map", "Supabase behavior", "Google/Search Console evidence", "Vercel production", "Compare and contrast", "Codex oversight"],
    fireCuda: health,
    masterList: {
      totalUniverse: Number(coverage.totalIndividualRanks || 0),
      countedLanes: Number(coverage.universalClaimRows || 0),
      internalSelectionWindow: Number(coverage.internalSelectedRotationRows || coverage.masterKeywordSitemapUrlRows || 0),
      publicCanonicalRoutes: Number(coverage.publicCanonicalMasterSitemapUrlRows || 0),
      publicQueryParameterRows: Number(coverage.publicQueryParameterSitemapRows || 0)
    },
    live,
    routeCoverage: {
      status: routeAudit.status || "unknown",
      sitemapProofRoutes: Number(routeAudit.sitemapProofRoutes || 0),
      metadataRoutes: Number(routeAudit.metadataRoutes || 0),
      missing: routeAudit.missingMetadataRoutes || [],
      extra: routeAudit.extraMetadataRoutes || []
    },
    attachedEvidence: {
      seoReevaluationStatus: seoReevaluation.status || "missing",
      googleCloudReadStatus: cloudRead.status || "missing"
    },
    decisions: decisionsFor({live, coverage, routeAudit}),
    sync: health.healthy
      ? {status: "ready-to-mirror", target: fireCudaReceiptPath}
      : {status: "queued-on-system-drive", target: localReceiptPath, reason: "FireCuda volume has not passed the health gate."}
  }

  mkdirSync(dirname(localReceiptPath), {recursive: true})
  mkdirSync(dirname(publicReceiptPath), {recursive: true})
  writeFileSync(localReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
  const publicReceipt = {
    ...receipt,
    fireCuda: {
      healthy: receipt.fireCuda.healthy,
      status: receipt.fireCuda.status,
      role: "local DigitalHut innovation mapping layer"
    },
    sync: {
      status: receipt.sync.status,
      reason: receipt.sync.reason || "FireCuda mirror is available after the local health gate passes."
    }
  }
  writeFileSync(publicReceiptPath, `${JSON.stringify(publicReceipt, null, 2)}\n`, "utf8")
  if(health.healthy){
    mkdirSync(dirname(fireCudaReceiptPath), {recursive: true})
    writeFileSync(fireCudaReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
    receipt.sync.status = "mirrored-to-firecuda"
    writeFileSync(localReceiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
    publicReceipt.sync.status = "mirrored-to-firecuda"
    publicReceipt.sync.reason = "The local FireCuda health gate passed and the evidence map was mirrored."
    writeFileSync(publicReceiptPath, `${JSON.stringify(publicReceipt, null, 2)}\n`, "utf8")
  }
  console.log(JSON.stringify({status: receipt.status, fireCuda: receipt.fireCuda.status, universe: receipt.masterList.totalUniverse, lanes: receipt.masterList.countedLanes, routeCoverage: receipt.routeCoverage.status, live: receipt.live.ready, sync: receipt.sync.status}, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
