const runnerChecks = [
  ["supabase", ["SUPABASE_URL", "VITE_SUPABASE_URL"], "database and asset storage"],
  ["supabase-service", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY"], "write runner reports"],
  ["sketchfab", ["SKETCHFAB_ACCESS_TOKEN", "SKETCHFAB_API_TOKEN", "VITE_SKETCHFAB_ACCESS_TOKEN"], "fresh GLB discovery"],
  ["cesium", ["CESIUM_ION_TOKEN", "VITE_CESIUM_ION_TOKEN"], "terrain and orbital map context"],
  ["alpaca", ["ALPACA_API_KEY", "ALPACA_SECRET_KEY"], "market print pressure"],
  ["polygon", ["POLYGON_API_KEY", "VITE_POLYGON_API_KEY"], "market statistics"],
  ["fmp", ["FMP_API_KEY", "VITE_FMP_API_KEY"], "market fundamentals"],
  ["alpha-vantage", ["ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY"], "market backup statistics"],
  ["reown", ["REOWN_PROJECT_ID", "VITE_REOWN_PROJECT_ID", "WALLETCONNECT_PROJECT_ID", "VITE_WALLETCONNECT_PROJECT_ID"], "wallet connection"],
  ["alchemy", ["ALCHEMY_API_KEY", "VITE_ALCHEMY_API_KEY", "ALCHEMY_BASE_RPC_URL", "VITE_ALCHEMY_BASE_RPC_URL"], "chain verification"],
  ["farcaster", ["NEYNAR_API_KEY", "FARCASTER_API_KEY"], "social distribution"],
  ["streaming", ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"], "stream distribution"]
]

const seoSignals = [
  "automatic 3D autoplay system",
  "AI guided GLB observatory",
  "real world 3D situation report",
  "planetary renderer presentation",
  "researcher hub 3D evidence notes",
  "mainstream 3D feed discovery",
  "developer GLB testing environment",
  "real estate 3D walkthrough intelligence",
  "market pressure observatory",
  "DigitalHut node progression"
]

const reportLanes = [
  {
    id: "renderer-health",
    title: "Renderer Health",
    action: "Verify GLB-ready URLs, avoid synthetic fallback models, and prioritize environment assets over single-object characters."
  },
  {
    id: "api-discovery",
    title: "API Discovery",
    action: "Surface fresh Sketchfab/API environments and mark candidates that should be saved into Supabase."
  },
  {
    id: "seo-engine",
    title: "SEO Engine",
    action: "Prepare blog angles around 3D observatory, GLB autoplay, real world situations, and AI presentation language."
  },
  {
    id: "market-pressure",
    title: "Market Pressure",
    action: "Scan ticker pressure windows and identify unusually large prints with timing context."
  },
  {
    id: "node-progress",
    title: "Node Progress",
    action: "Track which categories and searches should advance Stellar, Genius Real Estate, Pro Gamer, Researcher, and Developer nodes."
  }
]

function configured(keys){
  return keys.filter((key) => Boolean(process.env[key]))
}

function buildStatus(){
  const checks = runnerChecks.map(([id, keys, role]) => {
    const configuredKeys = configured(keys)
    return {
      id,
      role,
      configured: configuredKeys.length > 0,
      configuredKeys
    }
  })
  const ready = checks.filter((item) => item.configured).length
  return {
    checks,
    ready,
    total: checks.length,
    score: Math.round((ready / checks.length) * 100)
  }
}

function buildReport(){
  const status = buildStatus()
  const missing = status.checks.filter((item) => !item.configured).map((item) => item.id)
  return {
    generatedAt: new Date().toISOString(),
    runner: "digitalhut-overnight-runner",
    mode: process.env.DIGITALHUT_AUTONOMOUS_MODE === "true" ? "autonomous" : "manual-ready",
    enabled: process.env.DIGITALHUT_RUNNERS_ENABLED === "true",
    score: status.score,
    summary: status.score >= 70
      ? "DigitalHut runners have enough provider coverage to produce daily observatory reports."
      : "DigitalHut runners are online, but more provider credentials are needed for full autonomous coverage.",
    lanes: reportLanes,
    seoSignals,
    status,
    missing,
    nextActions: [
      "Review renderer health and broken GLB URLs.",
      "Save strong API GLB candidates into Supabase when service credentials are available.",
      "Convert high-interest discoveries into blog and insight-map entries.",
      "Track node progress from searches, ratings, reviews, and play-preview events.",
      "Use market pressure feed for ticker-specific observatory reports."
    ]
  }
}

function supabaseConfig(){
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY || ""
  return {url: url.replace(/\/+$/, ""), key}
}

async function saveReport(report){
  const {url, key} = supabaseConfig()
  if(!url || !key){
    return {saved: false, reason: "missing-supabase-service-config"}
  }
  const response = await fetch(`${url}/rest/v1/digitalhut_runner_reports`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation"
    },
    body: JSON.stringify({
      runner_id: report.runner,
      report_type: "overnight",
      score: report.score,
      summary: report.summary,
      payload: report
    })
  })
  const text = await response.text()
  if(!response.ok){
    return {saved: false, reason: "supabase-write-failed", status: response.status, detail: text.slice(0, 500)}
  }
  return {saved: true, record: text ? JSON.parse(text)[0] : null}
}

function isAuthorized(req){
  const secret = process.env.DIGITALHUT_RUNNER_CRON_SECRET || ""
  if(!secret) return true
  const querySecret = req.query?.secret || ""
  const headerSecret = req.headers["x-digitalhut-runner-secret"] || ""
  const cronHeader = req.headers["x-vercel-cron"]
  return querySecret === secret || headerSecret === secret || Boolean(cronHeader)
}

export default async function handler(req, res){
  res.setHeader("Cache-Control", "no-store")
  if(!isAuthorized(req)){
    return res.status(401).json({ok: false, error: "unauthorized-runner"})
  }
  const report = buildReport()
  const persistence = await saveReport(report)
  return res.status(200).json({
    ok: true,
    reportCreated: true,
    savedToSupabase: persistence.saved,
    persistence,
    report
  })
}
