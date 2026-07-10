import {existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync} from "node:fs"
import {dirname, join} from "node:path"

const site = "https://www.digitalhut.app"
const downloadsDir = "C:/Users/Admin/Downloads"
const preferredFile = "Consumed_API_-_Request_count_(filtered)_[SUM].csv"
const publicPath = "public/digitalhut-google-cloud-api-consumption-read.json"
const docsPath = "docs/digitalhut-google-cloud-api-consumption-read.md"
const generatedAt = new Date().toISOString()

function latestCsvPath(){
  const preferred = join(downloadsDir, preferredFile)
  if(existsSync(preferred)) return preferred
  const candidates = readdirSync(downloadsDir)
    .filter((name) => /^Consumed_API.*Request_count.*\.csv$/i.test(name))
    .map((name) => {
      const path = join(downloadsDir, name)
      return {path, mtimeMs: statSync(path).mtimeMs}
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
  return candidates[0]?.path || null
}

function parseCsvLine(line){
  const out = []
  let cur = ""
  let quoted = false
  for(let i = 0; i < line.length; i += 1){
    const ch = line[i]
    if(ch === '"' && line[i + 1] === '"'){
      cur += '"'
      i += 1
    } else if(ch === '"'){
      quoted = !quoted
    } else if(ch === "," && !quoted){
      out.push(cur)
      cur = ""
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function numberValue(value){
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function serviceRole(service = ""){
  if(service === "searchconsole.googleapis.com") {
    return "Search Console proof loop: sitemap status, query rows, impressions, clicks, and indexing comparisons."
  }
  if(service === "youtube.googleapis.com") {
    return "YouTube content input loop: video/category lookup and episode source discovery."
  }
  if(service === "monitoring.googleapis.com") {
    return "Google Cloud observability loop: cloud service read/monitoring confirmation."
  }
  return "Supporting Google Cloud service."
}

function serviceDecision(service = "", points = 0){
  if(service === "searchconsole.googleapis.com" && points > 0) {
    return "active-master-list-proof-service"
  }
  if(service === "youtube.googleapis.com" && points > 0) {
    return "light-content-source-service"
  }
  if(service === "monitoring.googleapis.com" && points > 0) {
    return "minimal-cloud-observability-service"
  }
  return "configured-but-no-meaningful-read-in-export"
}

function rhythmFor(points = []){
  if(points.length < 3) {
    return {
      status: points.length > 0 ? "minimal-pulse" : "no-pulse",
      rises: 0,
      falls: 0,
      flats: 0,
      directionChanges: 0,
      read: points.length > 0 ? "The service is present, but this export does not show enough points to judge rhythm." : "No rhythm visible in this export."
    }
  }
  let rises = 0
  let falls = 0
  let flats = 0
  let directionChanges = 0
  let lastDirection = 0
  for(let index = 1; index < points.length; index += 1){
    const diff = points[index].value - points[index - 1].value
    const direction = diff > 0 ? 1 : diff < 0 ? -1 : 0
    if(direction > 0) rises += 1
    else if(direction < 0) falls += 1
    else flats += 1
    if(direction !== 0 && lastDirection !== 0 && direction !== lastDirection) directionChanges += 1
    if(direction !== 0) lastDirection = direction
  }
  const status = rises > 0 && falls > 0
    ? directionChanges >= 2 ? "healthy-up-down-cycle" : "active-pulse"
    : rises > 0 ? "rising-only"
      : falls > 0 ? "falling-only"
        : "flatline"
  const read = status === "healthy-up-down-cycle"
    ? "Usage is pulsing up and down, which looks like an active proof loop rather than a flatline or runaway poll."
    : status === "active-pulse"
      ? "Usage is active and moving, but the rhythm is not broad enough to call a full cycle."
      : status === "flatline"
        ? "Usage is present but flat."
        : "Usage has one dominant direction in this export."
  return {status, rises, falls, flats, directionChanges, read}
}

function parseExport(path){
  if(!path) {
    return {
      ok: false,
      reason: "no-consumed-api-csv-found",
      services: []
    }
  }
  const text = readFileSync(path, "utf8").trim()
  const rows = text.split(/\r?\n/).filter(Boolean).map(parseCsvLine)
  const ids = rows[0]?.slice(1) || []
  const projectIds = rows[1]?.slice(1) || []
  const services = rows[2]?.slice(1) || []
  const series = services.map((service, index) => ({
    id: ids[index],
    projectId: projectIds[index],
    service,
    points: []
  }))

  for(const row of rows.slice(3)){
    const time = row[0]
    row.slice(1).forEach((raw, index) => {
      const value = raw === "undefined" || raw === "" ? null : numberValue(raw)
      if(value !== null) series[index]?.points.push({time, value})
    })
  }

  const summaries = series.map((item) => {
    const values = item.points.map((point) => point.value)
    const total = values.reduce((sum, value) => sum + value, 0)
    const max = values.length ? Math.max(...values) : 0
    const min = values.length ? Math.min(...values) : 0
    const avg = values.length ? total / values.length : 0
    const maxPoint = item.points.find((point) => point.value === max)
    return {
      service: item.service,
      projectId: item.projectId,
      role: serviceRole(item.service),
      decision: serviceDecision(item.service, item.points.length),
      nonEmptyPoints: item.points.length,
      total: Number(total.toFixed(6)),
      average: Number(avg.toFixed(6)),
      min: Number(min.toFixed(6)),
      max: Number(max.toFixed(6)),
      maxTime: maxPoint?.time || null,
      firstTime: item.points[0]?.time || null,
      lastTime: item.points.at(-1)?.time || null,
      rhythm: rhythmFor(item.points)
    }
  })

  return {
    ok: true,
    sourceFile: path,
    exportRows: Math.max(0, rows.length - 3),
    firstExportTime: rows[3]?.[0] || null,
    lastExportTime: rows.at(-1)?.[0] || null,
    services: summaries
  }
}

const parsed = parseExport(latestCsvPath())
const searchConsole = parsed.services.find((service) => service.service === "searchconsole.googleapis.com")
const youtube = parsed.services.find((service) => service.service === "youtube.googleapis.com")
const monitoring = parsed.services.find((service) => service.service === "monitoring.googleapis.com")

const packet = {
  generatedAt,
  status: parsed.ok ? "google-cloud-api-consumption-read-produced" : "google-cloud-api-consumption-read-missing",
  site,
  strongestLane: "DigitalHut 200M SEO Master List",
  dappProofEngine: "DigitalHut.app video + GLB + podcast/source + analytics + Supabase telemetry + sitemap/Search Console proof.",
  guardrail: "This is Google Cloud API consumption, not a Google ranking win. It proves which cloud services are being used by the DigitalHut proof loop.",
  sourceFile: parsed.sourceFile || null,
  exportWindow: {
    rows: parsed.exportRows || 0,
    first: parsed.firstExportTime || null,
    last: parsed.lastExportTime || null
  },
  services: parsed.services,
  systemRead: {
    searchConsole: searchConsole?.nonEmptyPoints > 0
      ? "Search Console API is the active Google Cloud service for the 200M master-list proof loop."
      : "Search Console API is not moving in this export.",
    youtube: youtube?.nonEmptyPoints > 0
      ? "YouTube API is lightly active and should remain tied to video/category source discovery, not heavy polling."
      : "YouTube API has no meaningful read in this export.",
    monitoring: monitoring?.nonEmptyPoints > 0
      ? "Cloud Monitoring registered a minimal service read."
      : "Cloud Monitoring has no meaningful read in this export."
  },
  cycleHealth: {
    status: searchConsole?.rhythm?.status === "healthy-up-down-cycle"
      ? "healthy-cloud-proof-loop"
      : searchConsole?.nonEmptyPoints > 0
        ? "active-cloud-proof-loop"
        : "cloud-proof-loop-not-visible",
    read: searchConsole?.rhythm?.status === "healthy-up-down-cycle"
      ? "Search Console API usage is moving up and down across the export window. That is the healthy rhythm we want: the cloud proof loop is active without looking like a runaway constant poll."
      : "The cloud proof loop is readable, but the strongest healthy up/down rhythm is not fully established in this export.",
    primaryRhythm: searchConsole?.rhythm || null,
    youtubeRhythm: youtube?.rhythm || null,
    monitoringRhythm: monitoring?.rhythm || null
  },
  seoDecision: searchConsole?.nonEmptyPoints > 0
    ? "Keep Search Console as the master-list proof service. Do not over-poll; use it for sitemap/index/query-row truth and push the dapp to produce proof/source behavior."
    : "Keep the sitemap stable and wait for Search Console rows before claiming movement.",
  nextSystemMove: "Exploit the 200M SEO Master List through dapp-backed proof routes, then measure whether Google Cloud reads Search Console, YouTube source discovery, and user behavior in the same cycle."
}

const markdown = `# DigitalHut Google Cloud API Consumption Read

Generated: ${generatedAt}

Strongest lane: ${packet.strongestLane}

Dapp proof engine: ${packet.dappProofEngine}

Guardrail: ${packet.guardrail}

Export window: ${packet.exportWindow.first || "unknown"} to ${packet.exportWindow.last || "unknown"} (${packet.exportWindow.rows} rows)

## Services

${packet.services.map((service) => `- ${service.service}: ${service.nonEmptyPoints} active points, total ${service.total}, max ${service.max} at ${service.maxTime || "n/a"}. Role: ${service.role} Decision: ${service.decision}`).join("\n")}

## System Read

- Search Console: ${packet.systemRead.searchConsole}
- YouTube: ${packet.systemRead.youtube}
- Monitoring: ${packet.systemRead.monitoring}

## Cycle Health

Status: ${packet.cycleHealth.status}

Read: ${packet.cycleHealth.read}

Search Console rhythm: ${packet.cycleHealth.primaryRhythm ? `${packet.cycleHealth.primaryRhythm.status}; rises ${packet.cycleHealth.primaryRhythm.rises}, falls ${packet.cycleHealth.primaryRhythm.falls}, direction changes ${packet.cycleHealth.primaryRhythm.directionChanges}` : "not available"}

SEO decision: ${packet.seoDecision}

Next: ${packet.nextSystemMove}
`

mkdirSync(dirname(publicPath), {recursive: true})
mkdirSync(dirname(docsPath), {recursive: true})
writeFileSync(publicPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8")
writeFileSync(docsPath, markdown, "utf8")

console.log(JSON.stringify({
  ok: parsed.ok,
  publicPath,
  docsPath,
  strongestLane: packet.strongestLane,
  exportWindow: packet.exportWindow,
  services: packet.services.map((service) => ({
    service: service.service,
    activePoints: service.nonEmptyPoints,
    total: service.total,
    decision: service.decision
  })),
  seoDecision: packet.seoDecision
}, null, 2))
