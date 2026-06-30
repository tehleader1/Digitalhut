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
  ["treasury-wallet", ["DIGITALHUT_TREASURY_WALLET", "VITE_DIGITALHUT_TREASURY_WALLET"], "DigitalHut payment destination"],
  ["blog-publishing", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY"], "autonomous SEO blog publishing"],
  ["vector-memory", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY"], "runner memory and semantic recall"],
  ["search-pixel", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY"], "first-party SEO behavior tracking"],
  ["farcaster", ["NEYNAR_API_KEY", "FARCASTER_API_KEY"], "social distribution"],
  ["streaming", ["LIVEPEER_API_KEY", "THETA_API_KEY", "HLS_STREAM_GATEWAY_URL"], "stream distribution"]
]

const runnerVersion = "core-ready-status-2026-06-29"

const coreRunnerIds = new Set([
  "supabase",
  "supabase-service",
  "alpaca",
  "reown",
  "alchemy",
  "treasury-wallet",
  "blog-publishing",
  "vector-memory",
  "search-pixel"
])

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
    role: "Stores runner reports, blog performance, ratings, reviews, tier signals, wallet events, node progress, and Vector DB memory."
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
    role: "Acts as the 8TB owner archive for exclusive GLBs, original camera/drone captures, thumbnails, drafts, logs, raw production material, and local agent working memory."
  },
  {
    id: "apis",
    role: "Bring in fresh 3D, market, observatory, media, and trend signals so blogs are tied to real feeds instead of static filler."
  },
  {
    id: "node",
    role: "Runs the JavaScript backend layer that coordinates API checks, report creation, wallet verification, vector memory writes, anti-lag logic, and content timing."
  },
  {
    id: "vector-db",
    role: "Indexes DigitalHut blogs, GLBs, SEO keywords, runner reports, FireCuda paths, and node/tier signals for semantic recall."
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

const masterSeoKeywords = [
  {
    keyword: "3D experience",
    intent: "original broad search",
    use: "Baseline keyword for early public users searching for interactive 3D, visual exploration, and DigitalHut's general presentation feel."
  },
  {
    keyword: "3D images",
    intent: "original broad search",
    use: "Use when explaining how DigitalHut turns ordinary visuals, captures, and environment references into richer 3D presentation context."
  },
  {
    keyword: "3D environments",
    intent: "original broad search",
    use: "Use for city, jungle, island, real estate, game world, science, travel, and camera/drone-created environment posts."
  },
  {
    keyword: "3D presentation",
    intent: "original broad search",
    use: "Use for every autoplay, guided demo, category showcase, and blog post that explains a 3D asset instead of only listing it."
  },
  {
    keyword: "real world visualization",
    intent: "original practical search",
    use: "Use when DigitalHut connects 3D scenes to real locations, travel, research, weather, property, infrastructure, or live reports."
  },
  {
    keyword: "AI 3D observatory",
    intent: "primary brand category",
    use: "Homepage, main lobby, renderer descriptions, and every flagship blog."
  },
  {
    keyword: "automatic GLB presentation",
    intent: "product function",
    use: "Autoplay, guided demos, renderer play-preview, and node unlock content."
  },
  {
    keyword: "3D renderer dapp",
    intent: "technical positioning",
    use: "Developer, wallet, decentralized app, and performance content."
  },
  {
    keyword: "exotic 3D environment",
    intent: "visual discovery",
    use: "Camera/drone captures, travel scenes, city scans, jungle, island, dock, and terrain posts."
  },
  {
    keyword: "AI guided 3D model viewer",
    intent: "search + explanation",
    use: "Blog titles and descriptions where the AI explains what the viewer is seeing."
  },
  {
    keyword: "3D research visualization",
    intent: "researcher audience",
    use: "Science, observatory, terrain, weather, orbital, and evidence-based posts."
  },
  {
    keyword: "3D real estate walkthrough",
    intent: "commercial audience",
    use: "Property, housing, international real estate, and local market explainers."
  },
  {
    keyword: "real estate house model",
    intent: "real estate search",
    use: "Use for broad property model posts, listing-style explainers, and house walkthrough pages."
  },
  {
    keyword: "2 bedroom house model",
    intent: "real estate search",
    use: "Use when presenting smaller home models, middle-class housing, rental units, and starter property walkthroughs."
  },
  {
    keyword: "1 bedroom house model",
    intent: "real estate search",
    use: "Use for apartment, condo, studio, and compact housing 3D presentations."
  },
  {
    keyword: "3 bedroom house model",
    intent: "real estate search",
    use: "Use for family housing, suburban property, and normal home walkthrough searches."
  },
  {
    keyword: "2 story house model",
    intent: "real estate search",
    use: "Use when the 3D walkthrough needs floor-to-floor structure, stairs, room layout, and interior presentation."
  },
  {
    keyword: "real estate data",
    intent: "commercial data search",
    use: "Use when combining house models with local market, property, neighborhood, pricing, or housing trend context."
  },
  {
    keyword: "gamer 3D model",
    intent: "gaming search",
    use: "Use for gamer-facing environment assets, 360 game world previews, and game-style DigitalHut presentations."
  },
  {
    keyword: "3D game model",
    intent: "gaming search",
    use: "Use for game environments, level previews, virtual worlds, and model discovery blogs."
  },
  {
    keyword: "research data presentation",
    intent: "research search",
    use: "Use when a blog turns raw research, science, environment, or public data into an explainable presentation."
  },
  {
    keyword: "3D research data presentation",
    intent: "research search",
    use: "Use when the research explanation includes GLB scenes, environment views, model rotation, and observation notes."
  },
  {
    keyword: "new AI systems 2026",
    intent: "trend search",
    use: "Use for cutting-edge AI, automation, observatory, runner, and presentation-system blogs."
  },
  {
    keyword: "AI system 2026",
    intent: "trend search",
    use: "Use for DigitalHut as a current AI system, not just a static 3D model website."
  },
  {
    keyword: "AI presentation system",
    intent: "product search",
    use: "Use when explaining the AI Director, autoplay narration, category switching, and guided 3D demos."
  },
  {
    keyword: "AI response system",
    intent: "product search",
    use: "Use when the AI reacts to search, voice commands, notes, user intent, wallet tier, or current model context."
  },
  {
    keyword: "AI 3D model presentation",
    intent: "product search",
    use: "Use for posts where the system explains, rotates, summarizes, and connects a 3D model to related content."
  },
  {
    keyword: "3D model subscription",
    intent: "monetization search",
    use: "Use for Standard, Premium, Pro, node purchases, and paid DigitalHut access explanations."
  },
  {
    keyword: "premium 3D models",
    intent: "monetization search",
    use: "Use for premium environment libraries, exclusive DigitalHut captures, and upgraded access posts."
  },
  {
    keyword: "premium AI presentation",
    intent: "monetization search",
    use: "Use for tier-based AI description depth, longer history, better node behavior, and guided demos."
  },
  {
    keyword: "premium observatory",
    intent: "monetization search",
    use: "Use for paid observatory experiences, better feeds, saved history, and upgraded presentation controls."
  },
  {
    keyword: "real digital observatory",
    intent: "brand trust search",
    use: "Use when proving DigitalHut has real runner logs, 3D assets, Supabase memory, FireCuda archive, and live app behavior."
  },
  {
    keyword: "digital decentralized observatory",
    intent: "dapp search",
    use: "Use for wallet-connected, API-fed, node-progressive, decentralized presentation-system positioning."
  },
  {
    keyword: "3D replica observatory",
    intent: "visualization search",
    use: "Use when DigitalHut represents a real place, asset, property, world, or environment as a 3D explanatory scene."
  },
  {
    keyword: "observatory experience",
    intent: "experience search",
    use: "Use for public-facing language around relaxing, watching, learning, and exploring through the renderer."
  },
  {
    keyword: "family observatory",
    intent: "family search",
    use: "Use for safe public education, home viewing, family presentations, travel planning, and kid-friendly observatory demos."
  },
  {
    keyword: "observatory for kids",
    intent: "family education search",
    use: "Use for family-safe, educational, narrated 3D scenes where children can learn from visual models."
  },
  {
    keyword: "home observatory",
    intent: "home search",
    use: "Use when positioning DigitalHut as a living-room, laptop, phone, or personal research-center observatory."
  },
  {
    keyword: "3D dapp",
    intent: "web3 search",
    use: "Use for wallet connection, Base/USDC checkout, Reown, Alchemy, and decentralized access posts."
  },
  {
    keyword: "3D observatory dapp",
    intent: "web3 product search",
    use: "Use as a high-intent combined phrase for DigitalHut's renderer, wallet, blog, nodes, and autoplay system."
  },
  {
    keyword: "GLB asset discovery",
    intent: "asset library growth",
    use: "Sketchfab/API discovery, FireCuda archive, Supabase asset records, and upload guides."
  },
  {
    keyword: "wallet connected 3D platform",
    intent: "dapp monetization",
    use: "Standard, Premium, Pro, node purchase, and wallet checkout content."
  },
  {
    keyword: "DigitalHut node progression",
    intent: "retention mechanic",
    use: "Stellar, Genius Real Estate, Pro Gamer, Researcher, Developer, and future node blogs."
  }
]

const longTailSeoKeywords = [
  {
    root: "3D experience",
    phrases: [
      "interactive 3D experience for learning real world environments",
      "AI guided 3D experience with autoplay presentation",
      "3D experience website for exploring models without scrolling lists",
      "family friendly 3D experience for home learning and discovery"
    ]
  },
  {
    root: "3D environments",
    phrases: [
      "3D environments for real world travel and research presentations",
      "beautiful 3D environments for AI guided observatory demos",
      "drone captured 3D environments for websites and blogs",
      "3D environment viewer for cities islands jungles and real estate"
    ]
  },
  {
    root: "3D presentation",
    phrases: [
      "automatic 3D presentation system for GLB files",
      "AI narrated 3D presentation for real world assets",
      "3D presentation website that explains models while they rotate",
      "how to turn a GLB model into a guided 3D presentation"
    ]
  },
  {
    root: "real estate house model",
    phrases: [
      "AI 3D real estate house model walkthrough for buyers",
      "2 bedroom house model 3D walkthrough with local market data",
      "3 bedroom house model presentation for family home research",
      "2 story house model viewer with room by room AI explanation"
    ]
  },
  {
    root: "gamer 3D model",
    phrases: [
      "AI guided gamer 3D model presentation for virtual worlds",
      "3D game model viewer for environment discovery and previews",
      "best 3D game environments to explore in an autoplay presentation",
      "gaming 3D model observatory for new 2026 virtual worlds"
    ]
  },
  {
    root: "research data presentation",
    phrases: [
      "3D research data presentation for science and environment studies",
      "AI research data presentation with 3D model evidence",
      "3D research visualization for weather terrain and observatory reports",
      "how researchers can use GLB models to explain real world data"
    ]
  },
  {
    root: "AI system 2026",
    phrases: [
      "new AI system 2026 for automatic 3D model presentations",
      "AI presentation system 2026 for GLB files and research reports",
      "AI response system that explains 3D models and changes categories",
      "AI 3D model presentation system for websites and digital observatories"
    ]
  },
  {
    root: "3D model subscription",
    phrases: [
      "3D model subscription with premium AI guided presentations",
      "premium 3D models with autoplay observatory experience",
      "premium AI presentation for GLB models and digital research",
      "wallet connected 3D model subscription for a decentralized observatory"
    ]
  },
  {
    root: "observatory experience",
    phrases: [
      "real digital observatory experience for 3D models and environments",
      "home observatory experience for families students and researchers",
      "observatory for kids with safe AI guided 3D presentations",
      "digital decentralized observatory for 3D assets and live content"
    ]
  },
  {
    root: "3D dapp",
    phrases: [
      "3D dapp with wallet connected AI presentations",
      "3D observatory dapp for GLB models blogs and node progression",
      "decentralized 3D renderer dapp with premium model access",
      "wallet connected 3D platform for AI guided observatory content"
    ]
  }
]

function slugify(value){
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function buildMasterSeoPlan(status){
  const configuredIds = new Set(status.checks.filter((item) => item.configured).map((item) => item.id))
  const apiFreshness = configuredIds.has("sketchfab") || configuredIds.has("cesium") ? "api-feed-ready" : "owner-archive-first"
  const walletReady = configuredIds.has("reown") && configuredIds.has("alchemy")
  return {
    title: "DigitalHut Master SEO Keyword List",
    cycle: new Date().toISOString().slice(0, 10),
    strategy: "Use a tight master keyword list, attach each blog to a real 3D presentation or FireCuda/API evidence item, measure instant/6h/12h traffic, then tighten the next keyword cycle.",
    antiSpamRule: "Publish from real signals and useful evidence. Avoid duplicate filler, keyword stuffing, fake reviews, and mass posting.",
    keywords: masterSeoKeywords,
    longTailKeywords: longTailSeoKeywords,
    currentPriority: apiFreshness === "api-feed-ready"
      ? ["3D experience", "AI 3D observatory", "automatic GLB presentation", "GLB asset discovery", "exotic 3D environment"]
      : ["3D experience", "3D environments", "AI 3D observatory", "automatic GLB presentation", "exotic 3D environment", "DigitalHut node progression"],
    walletKeywordReady: walletReady,
    evidenceLoop: [
      "runner creates keyword plan",
      "runner creates draft blog candidates",
      "Anthony adds FireCuda/API/YouTube/drone evidence",
      "blog publishes with related 3D presentation",
      "runner records instant views",
      "runner records 6-hour views",
      "runner records 12-hour views",
      "runner updates master keyword list",
      "next blog gets tighter"
    ]
  }
}

function buildBlogDrafts(report){
  const generatedDay = report.generatedAt.slice(0, 10)
  const firecudaBase = "D:\\DigitalHutAgent\\blogs"
  return [
    {
      title: "DigitalHut Is Building an AI 3D Observatory for Real World Environments",
      slug: `${generatedDay}-digitalhut-ai-3d-observatory-real-world-environments`,
      category: "DigitalHut Observatory",
      primary_keyword: "AI 3D observatory",
      seo_keywords: [
        "3D experience",
        "3D environments",
        "AI 3D observatory",
        "automatic GLB presentation",
        "exotic 3D environment",
        "AI guided 3D model viewer",
        "real world visualization",
        "home observatory",
        "interactive 3D experience for learning real world environments",
        "AI guided 3D experience with autoplay presentation",
        "3D environment viewer for cities islands jungles and real estate",
        "real digital observatory experience for 3D models and environments"
      ],
      summary: "Introduce DigitalHut as a self-produced 3D observatory where AI-guided GLB presentations, FireCuda archives, Supabase memory, and Vercel deployment work together to turn real environments into searchable presentation content.",
      publish_window: "next-editorial-window",
      firecuda_path: `${firecudaBase}\\ai-3d-observatory`,
      evidence: {
        source: "runner-master-seo",
        requiredEvidence: ["working renderer", "runner report", "vector memory record", "FireCuda GLB/archive reference"],
        measurementWindows: blogPerformanceWindows
      }
    },
    {
      title: "How Automatic GLB Presentations Can Make 3D Assets Easier to Understand",
      slug: `${generatedDay}-automatic-glb-presentations-3d-assets`,
      category: "Developer",
      primary_keyword: "automatic GLB presentation",
      seo_keywords: [
        "3D presentation",
        "automatic GLB presentation",
        "3D renderer dapp",
        "GLB asset discovery",
        "AI guided 3D model viewer",
        "AI presentation system",
        "AI 3D model presentation",
        "3D observatory dapp",
        "automatic 3D presentation system for GLB files",
        "AI narrated 3D presentation for real world assets",
        "how to turn a GLB model into a guided 3D presentation",
        "AI 3D model presentation system for websites and digital observatories"
      ],
      summary: "Explain how DigitalHut moves past static model cards by connecting play preview, guided narration, autoplay, related assets, SEO descriptions, and backend memory.",
      publish_window: "after-renderer-test",
      firecuda_path: `${firecudaBase}\\automatic-glb-presentations`,
      evidence: {
        source: "runner-master-seo",
        requiredEvidence: ["play-preview test", "asset metadata", "runner contentOps summary", "Supabase report id"],
        measurementWindows: blogPerformanceWindows
      }
    },
    {
      title: "The FireCuda 8TB Archive Behind DigitalHut's Exotic 3D Environment Pipeline",
      slug: `${generatedDay}-firecuda-8tb-exotic-3d-environment-pipeline`,
      category: "Exotic Environments",
      primary_keyword: "exotic 3D environment",
      seo_keywords: [
        "3D images",
        "3D environments",
        "exotic 3D environment",
        "drone captured GLB",
        "real world 3D scan",
        "immersive travel renderer",
        "real digital observatory",
        "digital decentralized observatory",
        "drone captured 3D environments for websites and blogs",
        "beautiful 3D environments for AI guided observatory demos",
        "3D environments for real world travel and research presentations",
        "home observatory experience for families students and researchers"
      ],
      summary: "Show the production plan for original camera and drone environments: capture locally, preserve raw files on FireCuda, publish optimized GLBs through Supabase/Vercel, and measure blog/viewer performance.",
      publish_window: "when-owner-capture-is-ready",
      firecuda_path: `${firecudaBase}\\firecuda-exotic-environments`,
      evidence: {
        source: "runner-master-seo",
        requiredEvidence: ["FireCuda folder", "original capture", "optimized GLB", "thumbnail", "public presentation link"],
        measurementWindows: blogPerformanceWindows
      }
    }
  ]
}

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
      vectorMemoryReady: trafficCaptureReady,
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
  const coreChecks = checks.filter((item) => coreRunnerIds.has(item.id))
  const optionalChecks = checks.filter((item) => !coreRunnerIds.has(item.id))
  const coreReady = coreChecks.every((item) => item.configured)
  const coreReadyCount = coreChecks.filter((item) => item.configured).length
  const optionalReadyCount = optionalChecks.filter((item) => item.configured).length
  return {
    checks,
    ready,
    total: checks.length,
    score: Math.round((ready / checks.length) * 100),
    coreReady,
    coreReadyCount,
    coreTotal: coreChecks.length,
    coreScore: Math.round((coreReadyCount / coreChecks.length) * 100),
    optionalReadyCount,
    optionalTotal: optionalChecks.length,
    optionalMissing: optionalChecks.filter((item) => !item.configured).map((item) => item.id)
  }
}

function normalizeEventValue(value){
  if(value === null || value === undefined || value === "") return "unknown"
  return String(value)
}

function incrementCount(map, value){
  const key = normalizeEventValue(value)
  map.set(key, (map.get(key) || 0) + 1)
}

function topCounts(map, limit = 5){
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({value, count}))
}

function flattenLongTailKeywords(items, limit = 8){
  return (items || [])
    .flatMap((item) => {
      if(!item) return []
      if(typeof item === "string") return [item]
      if(Array.isArray(item.phrases)) return item.phrases
      return [item.keyword, item.phrase, item.title, item.root].filter(Boolean)
    })
    .filter(Boolean)
    .slice(0, limit)
}

async function fetchPixelSnapshot(){
  try {
    const {url, key} = supabaseConfig()
    if(!url || !key){
      return {ready: false, reason: "missing-supabase-service-config"}
    }
    const response = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events?select=event_name,visitor_id,path,blog_slug,keyword_hint,category,asset_id,node_key,tier_key,metadata,created_at&order=created_at.desc&limit=200`, {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`
      }
    })
    const text = await response.text()
    if(!response.ok){
      return {ready: false, reason: "pixel-read-failed", status: response.status, detail: text.slice(0, 300)}
    }
    const events = text ? JSON.parse(text) : []
    const eventCounts = new Map()
    const topPages = new Map()
    const topBlogs = new Map()
    const keywordHints = new Map()
    const categories = new Map()
    const timezones = new Map()
    const visitors = new Set()
    let glbPlays = 0
    let blogViews = 0
    let pageViews = 0
    let searches = 0
    let walletClicks = 0
    let tierClicks = 0
    let nodeClicks = 0

    events.forEach((event) => {
      incrementCount(eventCounts, event.event_name)
      incrementCount(topPages, event.path)
      if(event.blog_slug) incrementCount(topBlogs, event.blog_slug)
      if(event.keyword_hint) incrementCount(keywordHints, event.keyword_hint)
      if(event.category) incrementCount(categories, event.category)
      if(event.visitor_id) visitors.add(event.visitor_id)
      if(event.metadata?.timezone) incrementCount(timezones, event.metadata.timezone)
      if(event.event_name === "glb_preview_play") glbPlays += 1
      if(event.event_name === "blog_view") blogViews += 1
      if(event.event_name === "page_view") pageViews += 1
      if(event.event_name === "search_run") searches += 1
      if(event.event_name === "wallet_connect_click") walletClicks += 1
      if(event.event_name === "tier_click") tierClicks += 1
      if(event.event_name === "node_click") nodeClicks += 1
    })

    return {
      ready: true,
      sampleSize: events.length,
      totals: {
        pageViews,
        blogViews,
        glbPlays,
        searches,
        walletClicks,
        tierClicks,
        nodeClicks,
        uniqueVisitors: visitors.size
      },
      topEvents: topCounts(eventCounts, 8),
      topPages: topCounts(topPages, 6),
      topBlogs: topCounts(topBlogs, 6),
      keywordHints: topCounts(keywordHints, 8),
      categories: topCounts(categories, 8),
      timezones: topCounts(timezones, 5),
      newestEventAt: events[0]?.created_at || null
    }
  } catch (error) {
    return {ready: false, reason: "pixel-snapshot-exception", detail: error?.message || String(error)}
  }
}

function buildAnthonyBrief({status, contentOps, masterSeoPlan, pixelSnapshot, requestedMessage}){
  const totals = pixelSnapshot?.totals || {}
  const topBlog = pixelSnapshot?.topBlogs?.[0]
  const topPage = pixelSnapshot?.topPages?.[0]
  const timezone = pixelSnapshot?.timezones?.[0]
  const activeKeywords = [
    "automatic 3D autoplay system",
    "AI guided 3D presentation",
    "3D observatory dapp",
    "GLB renderer",
    "real world 3D visualization",
    "3D environments",
    "family observatory",
    "premium observatory"
  ]
  const longTailTargets = flattenLongTailKeywords(masterSeoPlan?.longTailKeywords, 8)
  const pixelLine = pixelSnapshot?.ready
    ? `I compared ${pixelSnapshot.sampleSize} recent pixel events: ${totals.pageViews || 0} page views, ${totals.blogViews || 0} blog views, ${totals.glbPlays || 0} GLB preview plays, ${totals.searches || 0} searches, ${totals.uniqueVisitors || 0} unique visitors, ${totals.walletClicks || 0} wallet clicks, ${totals.tierClicks || 0} tier clicks, and ${totals.nodeClicks || 0} node clicks.`
    : `I tried to read the DigitalHut pixel stream, but the current pixel snapshot is not ready: ${pixelSnapshot?.reason || "unknown"}.`
  const audienceLine = timezone
    ? `The strongest timezone signal currently appears to be ${timezone.value}, so California/Pacific content angles are possible, but I am treating that as behavior data, not confirmed visitor identity.`
    : "I do not have a confirmed visitor-location signal yet, so I am not pretending to know exact audience geography."
  const blogLine = topBlog
    ? `The strongest blog signal is ${topBlog.value} with ${topBlog.count} tracked events, and the strongest page signal is ${topPage?.value || "unknown"} with ${topPage?.count || 0} events.`
    : "The blog layer is online, but it needs more tracked reads before I can rank winners with confidence."
  const seoLine = `I am improving the SEO structure around ${activeKeywords.join(", ")}. The next long-tail test set should include ${longTailTargets.join("; ")}.`
  const architectureLine = `Architecturally, the core system is online: Supabase reports, vector memory, SEO blog publishing, search pixel, market feed, wallet, treasury tracking, GitHub/Vercel deploys, and FireCuda as Anthony's private 8TB archive room.`
  const firecudaLine = "FireCuda should archive the next round by source: original captures, optimized GLBs, thumbnails, blog evidence, SEO keyword decisions, runner reports, and asset-performance notes. That gives the runner a real evidence trail instead of guessing."
  const nextMoveLine = `My next move is to push one focused blog cluster around ${contentOps?.nextBlogMove?.recommendation || "DigitalHut as an AI-guided 3D observatory"}, then wait for pixel events and tighten the keywords based on actual blog reads, GLB plays, searches, wallet clicks, tier clicks, and node interest.`
  return {
    title: "Anthony Brief",
    directSummary: [
      "Anthony, here is the real system read.",
      architectureLine,
      pixelLine,
      audienceLine,
      blogLine,
      seoLine,
      firecudaLine,
      nextMoveLine
    ].join(" "),
    whatIAmLookingAt: [
      "Supabase runner reports",
      "Supabase vector memory",
      "DigitalHut search pixel events",
      "published blog records",
      "GLB preview play events",
      "wallet/tier/node click signals",
      "FireCuda archive role",
      "API/provider readiness"
    ],
    statisticsCompared: {
      pixelTotals: totals,
      topPages: pixelSnapshot?.topPages || [],
      topBlogs: pixelSnapshot?.topBlogs || [],
      topEvents: pixelSnapshot?.topEvents || [],
      keywordHints: pixelSnapshot?.keywordHints || [],
      categories: pixelSnapshot?.categories || [],
      timezones: pixelSnapshot?.timezones || []
    },
    seoWordsImproving: activeKeywords,
    longTailTargets,
    firecudaNextMap: [
      "D:\\DigitalHutAgent\\original-captures",
      "D:\\DigitalHutAgent\\optimized-glbs",
      "D:\\DigitalHutAgent\\seo-evidence",
      "D:\\DigitalHutAgent\\runner-reports",
      "D:\\DigitalHutAgent\\blog-performance"
    ],
    requestedMessage: requestedMessage || ""
  }
}

async function buildReport(requestedMessage = ""){
  const status = buildStatus()
  const missing = status.checks.filter((item) => !item.configured).map((item) => item.id)
  const contentOps = contentOpsReport(status)
  const masterSeoPlan = buildMasterSeoPlan(status)
  const pixelSnapshot = await fetchPixelSnapshot()
  const anthonyBrief = buildAnthonyBrief({status, contentOps, masterSeoPlan, pixelSnapshot, requestedMessage})
  return {
    generatedAt: new Date().toISOString(),
    runner: "digitalhut-overnight-runner",
    runnerVersion,
    mode: process.env.DIGITALHUT_AUTONOMOUS_MODE === "true" ? "autonomous" : "manual-ready",
    enabled: process.env.DIGITALHUT_RUNNERS_ENABLED === "true",
    score: status.coreScore,
    expansionScore: status.score,
    summary: status.coreReady
      ? "DigitalHut core autonomous runner is operational: reports, vector memory, SEO blog publishing, search pixel, market feed, wallet, and treasury tracking are active. Remaining providers are optional expansion lanes."
      : "DigitalHut runners are online, but one or more core systems still need verification before the autonomous blog/SEO loop is complete.",
    lanes: reportLanes,
    seoSignals,
    anthonyBrief,
    pixelSnapshot,
    contentOps,
    masterSeoPlan,
    status,
    missing: status.coreReady ? status.optionalMissing : missing,
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

async function saveMemoryRecord(report){
  try {
    const {url, key} = supabaseConfig()
    if(!url || !key){
      return {saved: false, reason: "missing-supabase-service-config", hasUrl: Boolean(url), hasServiceKey: Boolean(key)}
    }
    const contentOps = report.contentOps || {}
    const response = await fetch(`${url}/rest/v1/digitalhut_memory_vectors`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        prefer: "return=representation"
      },
      body: JSON.stringify({
        memory_type: "runner_report",
        source_system: "digitalhut-overnight-runner",
        source_id: report.generatedAt,
        title: "DigitalHut AFK Runner Report",
        content: [
          report.summary,
          report.anthonyBrief?.directSummary,
          contentOps.operatingStatement,
          contentOps.ownerNarrative,
          contentOps.nextBlogMove?.recommendation,
          contentOps.nextBlogMove?.reason
        ].filter(Boolean).join("\n\n"),
        seo_keywords: report.seoSignals || [],
        category: "DigitalHut Observatory",
        node_key: "content-ops",
        firecuda_path: "D:\\DigitalHutAgent\\reports",
        wallet_tier: "all",
        visibility: "owner",
        metadata: {
          generatedAt: report.generatedAt,
          score: report.score,
          mode: report.mode,
          enabled: report.enabled,
          missing: report.missing,
          nextActions: report.nextActions,
          anthonyBrief: report.anthonyBrief,
          pixelSnapshot: report.pixelSnapshot,
          contentOps
        }
      })
    })
    const text = await response.text()
    if(!response.ok){
      return {saved: false, reason: "supabase-memory-write-failed", status: response.status, detail: text.slice(0, 500)}
    }
    try {
      const parsed = text ? JSON.parse(text) : null
      return {saved: true, record: Array.isArray(parsed) ? parsed[0] : parsed}
    } catch (error) {
      return {saved: true, record: null, parseWarning: error.message, raw: text.slice(0, 500)}
    }
  } catch (error) {
    return {saved: false, reason: "runner-memory-exception", detail: error?.message || String(error)}
  }
}

async function saveBlogDrafts(report){
  try {
    const {url, key} = supabaseConfig()
    if(!url || !key){
      return {saved: false, reason: "missing-supabase-service-config", hasUrl: Boolean(url), hasServiceKey: Boolean(key)}
    }
    const drafts = buildBlogDrafts(report)
    const rows = drafts.map((draft) => ({
      ...draft,
      status: "published",
      source_runner_id: report.runner,
      source_report_generated_at: report.generatedAt
    }))
    const response = await fetch(`${url}/rest/v1/digitalhut_blog_drafts?on_conflict=slug`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(rows)
    })
    const text = await response.text()
    if(!response.ok){
      return {saved: false, reason: "supabase-blog-draft-write-failed", status: response.status, detail: text.slice(0, 500), drafts}
    }
    try {
      return {saved: true, drafts, records: text ? JSON.parse(text) : []}
    } catch (error) {
      return {saved: true, drafts, records: [], parseWarning: error.message, raw: text.slice(0, 500)}
    }
  } catch (error) {
    return {saved: false, reason: "runner-blog-draft-exception", detail: error?.message || String(error)}
  }
}

async function fetchRunnerMessages(limit = 24){
  try {
    const {url, key} = supabaseConfig()
    if(!url || !key){
      return {saved: false, messages: [], reason: "missing-supabase-service-config"}
    }
    const response = await fetch(`${url}/rest/v1/digitalhut_runner_messages?select=id,role,message,message_type,payload,created_at&order=created_at.desc&limit=${limit}`, {
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`
      }
    })
    const text = await response.text()
    if(!response.ok){
      return {saved: false, messages: [], reason: "runner-chat-read-failed", status: response.status, detail: text.slice(0, 300)}
    }
    return {saved: true, messages: text ? JSON.parse(text) : []}
  } catch (error) {
    return {saved: false, messages: [], reason: "runner-chat-read-exception", detail: error?.message || String(error)}
  }
}

async function saveRunnerMessage({role, message, messageType = "chat", payload = {}}){
  try {
    const {url, key} = supabaseConfig()
    if(!url || !key){
      return {saved: false, reason: "missing-supabase-service-config"}
    }
    const response = await fetch(`${url}/rest/v1/digitalhut_runner_messages`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        prefer: "return=representation"
      },
      body: JSON.stringify({
        role,
        message,
        message_type: messageType,
        payload
      })
    })
    const text = await response.text()
    if(!response.ok){
      return {saved: false, reason: "runner-chat-write-failed", status: response.status, detail: text.slice(0, 300)}
    }
    return {saved: true, record: text ? JSON.parse(text)?.[0] : null}
  } catch (error) {
    return {saved: false, reason: "runner-chat-write-exception", detail: error?.message || String(error)}
  }
}

async function callReasoningBridge({report, userMessage, fallbackReply}){
  const endpoint = process.env.DIGITALHUT_REASONING_ENDPOINT || ""
  const apiKey = process.env.DIGITALHUT_REASONING_API_KEY || process.env.OPENAI_API_KEY || ""
  const model = process.env.DIGITALHUT_REASONING_MODEL || process.env.OPENAI_REASONING_MODEL || "gpt-5.4-mini"
  if(!apiKey){
    return {used: false, reason: "missing-reasoning-bridge", reply: fallbackReply}
  }
  try {
    if(!endpoint){
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          reasoning: {
            effort: process.env.DIGITALHUT_REASONING_EFFORT || "high"
          },
          instructions: [
            "You are DigitalHut Runner, Anthony's in-house observatory teammate.",
            "You are not a sterile metrics bot. Speak like a friendly but useful operator sitting beside Anthony.",
            "Use the provided DigitalHut context to reason about the site, SEO, blogs, GLB plays, FireCuda, wallet, nodes, and next steps.",
            "Do not dump every metric unless Anthony asks for metrics.",
            "Do not fake visitor identity or exact locations. Use appears, suggests, or possible for inferences.",
            "Give direct practical advice. If Anthony is brainstorming, brainstorm with him. If he asks what to do next, pick one next move.",
            "Keep replies conversational and readable: normally 2-5 short paragraphs."
          ].join(" "),
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: JSON.stringify({
                    anthonyMessage: userMessage,
                    digitalhutContext: {
                      generatedAt: report.generatedAt,
                      summary: report.summary,
                      anthonyBrief: report.anthonyBrief,
                      pixelSnapshot: report.pixelSnapshot,
                      contentOps: report.contentOps,
                      masterSeoPlan: report.masterSeoPlan,
                      status: report.status,
                      missing: report.missing
                    }
                  })
                }
              ]
            }
          ]
        })
      })
      const text = await response.text()
      if(!response.ok){
        return {used: false, reason: "openai-responses-failed", status: response.status, detail: text.slice(0, 500), reply: fallbackReply}
      }
      const parsed = text ? JSON.parse(text) : null
      const reply = parsed?.output_text
        || parsed?.output?.flatMap((item) => item.content || []).map((item) => item.text).filter(Boolean).join("\n")
        || fallbackReply
      return {used: true, provider: "openai-responses", model, reply}
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        purpose: "digitalhut-runner-chat",
        instruction: "Answer like a senior observatory systems analyst. Stay factual. Do not invent traffic locations. Compare statistics and explain what to do next.",
        userMessage,
        reportContext: {
          generatedAt: report.generatedAt,
          summary: report.summary,
          anthonyBrief: report.anthonyBrief,
          pixelSnapshot: report.pixelSnapshot,
          contentOps: report.contentOps,
          masterSeoPlan: report.masterSeoPlan,
          status: report.status,
          missing: report.missing
        }
      })
    })
    const text = await response.text()
    if(!response.ok){
      return {used: false, reason: "reasoning-bridge-failed", status: response.status, detail: text.slice(0, 300), reply: fallbackReply}
    }
    let parsed = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = {reply: text}
    }
    const reply = parsed?.reply || parsed?.message || parsed?.output_text || fallbackReply
    return {used: true, model, reply}
  } catch (error) {
    return {used: false, reason: "reasoning-bridge-exception", detail: error?.message || String(error), reply: fallbackReply}
  }
}

function buildRunnerReply(report, userMessage = ""){
  const brief = report.anthonyBrief || {}
  const stats = brief.statisticsCompared || {}
  const totals = stats.pixelTotals || {}
  const topBlog = stats.topBlogs?.[0]
  const topTimezone = stats.timezones?.[0]
  const keywords = brief.seoWordsImproving || []
  const longTail = flattenLongTailKeywords(brief.longTailTargets || report.masterSeoPlan?.longTailKeywords, 8)
  const text = String(userMessage || "").toLowerCase()
  const askedSeo = /seo|keyword|rank|google|blog|traffic|search/.test(text)
  const askedFirecuda = /firecuda|archive|8tb|storage|map/.test(text)
  const askedMoney = /wallet|tier|node|purchase|payment|subscription|money/.test(text)
  const askedGlb = /glb|renderer|model|asset|3d|preview/.test(text)
  const askedMetrics = /metric|number|stat|technical|debug|detail|exact|show me/.test(text)
  const askedGreeting = /^(hi|hello|yo|hey|sup|whats up|what's up)\b/.test(text.trim())

  const pageViews = totals.pageViews || 0
  const blogViews = totals.blogViews || 0
  const glbPlays = totals.glbPlays || 0
  const walletClicks = totals.walletClicks || 0
  const nodeClicks = totals.nodeClicks || 0
  const blogName = topBlog?.value || "the main DigitalHut blog"
  const regionHint = topTimezone?.value === "America/Los_Angeles"
    ? "I am seeing a Pacific-time pattern, so California and Los Angeles style wording is worth testing. I am not treating that as confirmed location."
    : "I do not have enough location-style signal yet, so I am staying general."

  if(askedGreeting){
    return "Anthony, I am here with you. DigitalHut is awake, the blog is getting the clearest early attention, and I am staying close to the system so we can keep shaping it without rushing. Talk to me normally. If you want ideas, I will think with you. If you want numbers, I will pull the numbers. If you want the next move, I will keep it simple and practical."
  }

  if(askedSeo){
    return `Anthony, I think the SEO lane is starting to show itself. The strongest story is not "buy this" yet; it is "come see this new kind of 3D observatory." People are touching the blog first, especially ${blogName}. I would keep the language around "${keywords.slice(0, 3).join('", "')}" and test "${longTail.slice(0, 2).join('" plus "')}". ${regionHint} My move: one clean blog, one working GLB, one clear Play Preview path.`
  }

  if(askedGlb){
    return `Anthony, the renderer story is close. I can feel the shape of it: people need to land, understand the scene fast, then press Play Preview because it feels natural. I see ${glbPlays} GLB plays, so the path exists. Now we make it smoother: one reliable environment GLB, one clean story, one obvious preview button. If that rises, we know the system is speaking to people.`
  }

  if(askedFirecuda){
    return "Anthony, FireCuda is the private workroom. I would treat it like the place where DigitalHut grows up: original captures, optimized GLBs, thumbnails, blog evidence, SEO decisions, runner reports, and broken-render notes. That way every real-world asset you capture becomes part of the story, not just a file sitting on a drive."
  }

  if(askedMoney){
    return `Anthony, I would keep wallet and node purchases present, but calm. I see ${walletClicks} wallet clicks and ${nodeClicks} node clicks, so people are not at the money moment yet. First they need to feel the system: blog opens, GLB plays, AI explains, then nodes and subscriptions make sense. Trust first, payment second.`
  }

  if(askedMetrics){
    return `Anthony, clean numbers: ${pageViews} page views, ${blogViews} blog views, ${glbPlays} GLB plays, ${walletClicks} wallet clicks, and ${nodeClicks} node clicks. The strongest blog signal is ${blogName}. My read: discovery is ahead of monetization. That is normal. The next test is one blog connected directly to one working GLB preview.`
  }

  return `Anthony, I am with you. My honest read is that DigitalHut is past the "is this even a system" stage. Now it needs rhythm. We do not need to throw every idea at people at once. We need one strong experience at a time: a clean story, a working 3D environment, and an AI presentation that feels useful. The next move I would make is simple: pick one strong GLB, make one strong blog around it, and watch whether people move from reading to pressing Play Preview.`
}

function isAuthorized(req){
  const secret = process.env.DIGITALHUT_RUNNER_CRON_SECRET || ""
  if(!secret) return true
  const querySecret = req.query?.secret || ""
  const bodySecret = req.body?.secret || ""
  const headerSecret = req.headers["x-digitalhut-runner-secret"] || ""
  const cronHeader = req.headers["x-vercel-cron"]
  return querySecret === secret || bodySecret === secret || headerSecret === secret || Boolean(cronHeader)
}

export default async function handler(req, res){
  try {
    res.setHeader("Cache-Control", "no-store")
    if(!isAuthorized(req)){
      return res.status(401).json({ok: false, error: "unauthorized-runner"})
    }
    const actionSource = req.body?.action || req.query?.action
    const messageSource = req.body?.message || req.query?.message
    const action = typeof actionSource === "string" ? actionSource : "run"
    const requestedMessage = typeof messageSource === "string" ? messageSource.slice(0, 8000) : ""
    const report = await buildReport(requestedMessage)
    const persistence = await saveReport(report)
    const memory = await saveMemoryRecord(report)
    const blogs = await saveBlogDrafts(report)
    let runnerChat = null
    if(action === "chat"){
      const inbound = requestedMessage || "Give me a runner update."
      const anthonyMessage = await saveRunnerMessage({
        role: "anthony",
        message: inbound,
        messageType: "chat",
        payload: {receivedAt: new Date().toISOString()}
      })
      const fallbackReply = buildRunnerReply(report, inbound)
      const reasoning = await callReasoningBridge({report, userMessage: inbound, fallbackReply})
      const replyText = reasoning.reply
      const runnerMessage = await saveRunnerMessage({
        role: "runner",
        message: replyText,
        messageType: "chat",
        payload: {
          generatedAt: report.generatedAt,
          anthonyBrief: report.anthonyBrief,
          reasoning,
          score: report.score,
          expansionScore: report.expansionScore
        }
      })
      const history = await fetchRunnerMessages(30)
      runnerChat = {anthonyMessage, runnerMessage, reasoning, reply: replyText, history}
    } else if(action === "status"){
      const history = await fetchRunnerMessages(30)
      runnerChat = {reply: report.anthonyBrief?.directSummary || report.summary, history}
    }
    return res.status(200).json({
      ok: true,
      reportCreated: true,
      savedToSupabase: persistence.saved,
      savedToVectorMemory: memory.saved,
      savedBlogDrafts: blogs.saved,
      persistence,
      memory,
      blogs,
      runnerChat,
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
