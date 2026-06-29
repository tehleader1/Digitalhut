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

const contentSystemStack = [
  {
    id: "supabase",
    role: "Stores runner reports, blog performance, ratings, reviews, tier signals, wallet events, and future node progress."
  },
  {
    id: "github",
    role: "Preserves the production codebase and keeps every runner/blog/SEO update versioned before Vercel deploys it."
  },
  {
    id: "vercel",
    role: "Runs the public DigitalHut app, serverless APIs, scheduled runner, PWA build, and live blog delivery."
  },
  {
    id: "codex",
    role: "Acts as the engineering operator that turns Anthony's direction into patches, runners, docs, deploys, and preservation checks."
  },
  {
    id: "firecuda",
    role: "Acts as the 8TB owner archive for exclusive GLBs, original camera/drone captures, thumbnails, drafts, logs, and raw production material."
  },
  {
    id: "apis",
    role: "Bring in fresh 3D, market, observatory, media, and trend signals so blogs are tied to real feeds instead of static filler."
  },
  {
    id: "node",
    role: "Runs the JavaScript backend layer that coordinates API checks, report creation, wallet verification, anti-lag logic, and content timing."
  },
  {
    id: "wallet",
    role: "Connects subscription, node purchase, and future tier activation signals back to the DigitalHut treasury wallet."
  },
  {
    id: "decentralized-dapp",
    role: "Keeps the public system interactive: wallet-aware, category-aware, GLB-aware, and ready for future decentralized distribution."
  }
]

const blogPerformanceWindows = [
  {id: "instant", label: "Instant views", target: "first 15 minutes after publish"},
  {id: "6h", label: "Views in 6 hours", target: "first traction window"},
  {id: "12h", label: "Views in 12 hours", target: "half-day SEO and share window"}
]

const defenseSignals = [
  "anti-lag: avoid unnecessary renderer reloads, keep GLB previews click-to-play, and defer heavy asset work until user intent is clear",
  "anti-dupe: compare blog topic, GLB title, source URL, FireCuda filename, Supabase asset id, and SEO keyword cluster before creating a new record",
  "anti-speedhack: flag unnatural click bursts, repeated play-preview loops, suspicious rating floods, and wallet/session mismatches",
  "guardian escalation: show normal status quietly, reserve blocking prompts for direct suspicious behavior or broken renderer recovery"
]

const seoKeywordClusters = [
  {
    id: "exotic-environments",
    keywords: ["exotic 3D environment", "drone captured GLB", "real world 3D scan", "immersive travel renderer"],
    fit: "Use when Anthony uploads original camera, drone, city, jungle, island, dock, mountain, farm, or street environment assets."
  },
  {
    id: "observatory-renderer",
    keywords: ["AI 3D observatory", "automatic GLB presentation", "3D renderer dapp", "AI guided 3D model viewer"],
    fit: "Use for core DigitalHut positioning and every post that demonstrates autoplay, category switching, or renderer intelligence."
  },
  {
    id: "research-visualization",
    keywords: ["3D research visualization", "scientific GLB report", "environment evidence viewer", "AI research presentation"],
    fit: "Use when the blog explains science, terrain, weather, orbital systems, field evidence, or study-style 3D analysis."
  },
  {
    id: "real-estate-3d",
    keywords: ["3D real estate walkthrough", "AI property renderer", "GLB house presentation", "real estate observatory"],
    fit: "Use when the asset helps users understand homes, land, city context, international property, or market opportunity."
  },
  {
    id: "wallet-node-growth",
    keywords: ["3D dapp subscription", "DigitalHut nodes", "wallet connected 3D platform", "AI presentation tier"],
    fit: "Use when a post connects content quality to Standard, Premium, Pro, or node purchase behavior."
  }
]

function contentOpsReport(status){
  const configuredIds = new Set(status.checks.filter((item) => item.configured).map((item) => item.id))
  const trafficCaptureReady = configuredIds.has("supabase") && configuredIds.has("supabase-service")
  const walletReady = configuredIds.has("reown") && configuredIds.has("alchemy")
  const freshFeedReady = configuredIds.has("sketchfab") || configuredIds.has("cesium")
  const marketReady = configuredIds.has("alpaca") || configuredIds.has("polygon") || configuredIds.has("fmp") || configuredIds.has("alpha-vantage")
  return {
    title: "DigitalHut Blog Production Runner Summary",
    operatingStatement: "DigitalHut is using Supabase, GitHub, Vercel, Codex, FireCuda, APIs, Node.js, wallet verification, and the decentralized dapp layer to create timed 3D observatory blog content without bottlenecking around one content source.",
    ownerNarrative: "Developer and CEO Anthony is building a live 3D observatory publishing system where original camera/drone environments, API GLB feeds, YouTube introductions, media coverage, and wallet tier activity become structured blog posts and renderer presentations.",
    stack: contentSystemStack,
    defense: {
      goal: "Keep the blog and renderer system anti-lag, anti-dupe, and anti-speedhack while still allowing real organic traffic, ratings, reviews, shares, and wallet activation.",
      signals: defenseSignals
    },
    blogCreationProtocol: {
      triggerSources: [
        "Anthony uploads a new original 3D environment",
        "Anthony posts or provides a YouTube/video introduction",
        "a strong API GLB/environment appears",
        "a market/trend signal connects to an observatory topic",
        "a node/tier activation pattern appears",
        "media coverage or company stepping-stone update is ready"
      ],
      requiredFields: [
        "blog title",
        "primary SEO cluster",
        "supporting long-tail keywords",
        "related GLB or environment",
        "DigitalHut renderer link",
        "internal backlinks",
        "share caption",
        "rating/review target",
        "wallet/tier signal target",
        "publish timing note"
      ],
      publishTimingRule: "Create drafts from real signals first, then publish at spaced editorial timing. Do not mass-publish duplicate AI filler."
    },
    performanceWindows: blogPerformanceWindows.map((window) => ({
      ...window,
      status: trafficCaptureReady ? "ready-to-record-in-supabase" : "waiting-for-supabase-service"
    })),
    seoStructure: {
      rule: "Every blog must explain why its keyword cluster fits the exact 3D presentation, asset, category, and user intent.",
      clusters: seoKeywordClusters,
      nextTightening: freshFeedReady
        ? "Tighten around fresh 3D environment, AI GLB presentation, and DigitalHut observatory terms from the newest asset feed."
        : "Tighten around existing DigitalHut renderer, autoplay, and owner-created environment language until more feed APIs are active."
    },
    walletAndTierTracking: {
      ready: walletReady,
      treasuryWallet: process.env.DIGITALHUT_TREASURY_WALLET || process.env.VITE_DIGITALHUT_TREASURY_WALLET || "not-configured",
      trackedEvents: [
        "wallet connect",
        "tier click",
        "node click",
        "checkout started",
        "checkout completed",
        "blog source before wallet action",
        "GLB playing before wallet action"
      ]
    },
    liveContentReadiness: {
      trafficCaptureReady,
      freshFeedReady,
      marketReady,
      firecudaRole: "local-master-archive",
      publicStorageRole: "Supabase/Vercel-hosted assets are required for live website access because Vercel cannot read D: directly."
    },
    nextBlogMove: {
      recommendation: "Prepare the next blog around DigitalHut as an AI-guided 3D observatory for exotic real-world environments, then connect it to the strongest available GLB/API asset and a wallet/node call-to-action.",
      reason: "This ties together the finished build, original 3D capture direction, SEO positioning, and future paid tier/node behavior without depending on one bottleneck."
    }
  }
}

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
  const contentOps = contentOpsReport(status)
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
    contentOps,
    status,
    missing,
    nextActions: [
      "Review renderer health and broken GLB URLs.",
      "Save strong API GLB candidates into Supabase when service credentials are available.",
      "Convert high-interest discoveries into blog and insight-map entries.",
      "Track node progress from searches, ratings, reviews, and play-preview events.",
      "Use market pressure feed for ticker-specific observatory reports.",
      "Record instant, 6-hour, and 12-hour blog view windows in Supabase after each publish.",
      "Explain why each SEO keyword cluster fits the exact 3D presentation before publishing."
    ]
  }
}

function supabaseConfig(){
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY || ""
  return {url: url.replace(/\/+$/, ""), key}
}

async function saveReport(report){
  try {
    const {url, key} = supabaseConfig()
    if(!url || !key){
      return {saved: false, reason: "missing-supabase-service-config", hasUrl: Boolean(url), hasServiceKey: Boolean(key)}
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
    try {
      const parsed = text ? JSON.parse(text) : null
      return {saved: true, record: Array.isArray(parsed) ? parsed[0] : parsed}
    } catch (error) {
      return {saved: true, record: null, parseWarning: error.message, raw: text.slice(0, 500)}
    }
  } catch (error) {
    return {saved: false, reason: "runner-save-exception", detail: error?.message || String(error)}
  }
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
  try {
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
  } catch (error) {
    return res.status(200).json({
      ok: false,
      reportCreated: false,
      savedToSupabase: false,
      error: "runner-handler-exception",
      detail: error?.message || String(error)
    })
  }
}
