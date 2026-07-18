import {mkdir, readFile, writeFile} from "node:fs/promises"
import {existsSync, statSync} from "node:fs"
import path from "node:path"
import {fileURLToPath} from "node:url"
import {seoBlogPosts, seoLaunchTargetsForCategory, seoMetadataForProof, seoRunnerProofPosts} from "../src/lib/seoContentEngine.js"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const docsDir = path.join(repoRoot, "docs")
const publicDir = path.join(repoRoot, "public")
const generatedAt = new Date().toISOString()

const files = {
  observatory: path.join(repoRoot, "src", "components", "FullscreenObservatoryV2.jsx"),
  css: path.join(repoRoot, "src", "components", "FullscreenObservatory.css"),
  seo: path.join(repoRoot, "src", "lib", "seoContentEngine.js"),
  blogPage: path.join(repoRoot, "src", "pages", "BlogPage.jsx"),
  watchPage: path.join(repoRoot, "src", "pages", "WatchProofPage.jsx"),
  categoryPage: path.join(repoRoot, "src", "pages", "CategoryProofPage.jsx"),
  marketPage: path.join(repoRoot, "src", "pages", "MarketPage.jsx"),
  sitemap: path.join(publicDir, "sitemap.xml"),
  robots: path.join(publicDir, "robots.txt"),
  vercelJson: path.join(repoRoot, "vercel.json"),
  npmrc: path.join(repoRoot, ".npmrc"),
  supabaseSeoRefinementMigration: path.join(repoRoot, "supabase", "migrations", "202607060001_digitalhut_seo_refinement_views.sql"),
  viralSourcePacket: path.join(publicDir, "digitalhut-viral-source-packet.json"),
  systemCapabilities: path.join(publicDir, "digitalhut-system-capabilities.json"),
  systemCapabilityDelta: path.join(publicDir, "digitalhut-system-capability-delta.json"),
  packageJson: path.join(repoRoot, "package.json"),
  packageLock: path.join(repoRoot, "package-lock.json")
}

let lastKnownMetrics = {
  pageViews: 225,
  uniqueVisitors: 72,
  searchInteractions: 0,
  autoplayStarts: 1,
  glbPreviewPlays: 62,
  podcastInterrupts: 2,
  marketOpens: 0,
  blogViews: 14,
  source: "last-known production metric snapshot; not live-rechecked by backend SEO standby system",
  capturedAt: null,
  liveRefreshStatus: "not-live-refreshed-this-cycle"
}

async function refreshProductionMetrics(fallback = lastKnownMetrics){
  try {
    const response = await fetch("https://www.digitalhut.app/api/insight-map", {
      headers: {"User-Agent": "DigitalHut-SEO-Standby/1.0"},
      signal: AbortSignal.timeout(12_000)
    })
    if(!response.ok) throw new Error(`insight-map returned ${response.status}`)
    const payload = await response.json()
    const pixel = payload?.pixel || {}
    return {
      pageViews: Number(pixel.totalPageViews || pixel.interactionTotals?.pageViews || fallback.pageViews || 0),
      uniqueVisitors: Number(pixel.uniqueVisitors || fallback.uniqueVisitors || 0),
      searchInteractions: Number(pixel.totalSearchRuns || pixel.interactionTotals?.searchRuns || fallback.searchInteractions || 0),
      autoplayStarts: Number(pixel.totalAutoplayStarts || pixel.interactionTotals?.autoplayStarts || fallback.autoplayStarts || 0),
      glbPreviewPlays: Number(pixel.totalGlbPreviewPlays || pixel.interactionTotals?.glbPreviewPlays || fallback.glbPreviewPlays || 0),
      podcastInterrupts: Number(pixel.totalPodcastInterrupts || pixel.interactionTotals?.podcastInterrupts || fallback.podcastInterrupts || 0),
      marketOpens: Number(pixel.totalMarketOpens || pixel.interactionTotals?.marketOpens || fallback.marketOpens || 0),
      blogViews: Number(pixel.totalBlogViews || pixel.interactionTotals?.blogViews || fallback.blogViews || 0),
      proofRouteOpens: Number(pixel.totalProofRouteOpens || pixel.interactionTotals?.proofRouteOpens || 0),
      sourceOpens: Number(pixel.totalSourceOpens || pixel.interactionTotals?.sourceOpens || 0),
      masterKeywordDoorEvents: Number(pixel.totalMasterKeywordDoorEvents || 0),
      source: "live production /api/insight-map Supabase rollup",
      capturedAt: payload?.generatedAt || new Date().toISOString(),
      liveRefreshStatus: "live-refreshed"
    }
  } catch(error){
    return {
      ...fallback,
      source: `${fallback.source}; live refresh failed: ${error?.message || "unknown error"}`,
      liveRefreshStatus: "live-refresh-failed"
    }
  }
}

const lastKnownFireCudaCapacityReceipt = {
  capturedAt: "2026-07-07T01:23:00-04:00",
  source: "Get-CimInstance Win32_LogicalDisk capacity receipt",
  deviceId: "D:",
  volumeName: "Seagate",
  sizeTb: 7.28,
  freeTb: 7.26,
  usedTb: 0.02,
  usedPct: 0.2,
  pressureStage: "normal",
  nextRackTarget: "30TB database rack expansion",
  read: "FireCuda/Seagate staging drive is breathing comfortably. No 30TB rack pressure yet."
}

function buildMetricFreshnessPacket(metrics = lastKnownMetrics){
  const capturedAtMs = metrics.capturedAt ? Date.parse(metrics.capturedAt) : NaN
  const generatedAtMs = Date.parse(generatedAt)
  const ageHours = Number.isFinite(capturedAtMs) && Number.isFinite(generatedAtMs)
    ? Math.max(0, Math.round(((generatedAtMs - capturedAtMs) / 36_000) / 10))
    : null
  const stale = !metrics.capturedAt || (ageHours !== null && ageHours >= 24) || metrics.liveRefreshStatus !== "live-refreshed"
  const status = stale ? "stale-live-refresh-needed" : "fresh-live-metrics"
  return {
    generatedAt,
    mode: "DigitalHut Metric Freshness Gate",
    status,
    capturedAt: metrics.capturedAt || "unknown",
    ageHours,
    source: metrics.source,
    liveRefreshStatus: metrics.liveRefreshStatus,
    stale,
    guardrail: "Do not present repeated production numbers as new statistics. Treat them as last-known until Supabase, Vercel analytics, or another approved live source refreshes them.",
    currentRead: stale
      ? "The same production metric snapshot is being repeated. Keep it as last-known evidence, but clear it from promotion decisions until a live Supabase/Vercel refresh is captured."
      : "Metrics have a live refresh timestamp and can participate in promotion decisions.",
    lastKnownMetrics: metrics,
    requiredRefreshSources: [
      "Supabase event rollup by page_view, search_run, autoplay_start, glb_preview_play, podcast_interrupt, market_view_open, blog_view",
      "Vercel route/runtime read for deploy proof and public route stability",
      "Search Console or crawler proof for watch/blog/category route discovery"
    ],
    nextSystemMove: stale
      ? "Move current numbers into stale-read hold, stage fresh clusters, and wait for live measurement proof before promoting or rewriting rank lanes."
      : "Use refreshed metrics to promote, rewrite, or hold FireCuda clusters."
  }
}

const ventureBaselineAudit = {
  generatedFor: "DigitalHut venture starting point before full FireCuda SEO system mode",
  stack: ["FireCuda", "Supabase", "Google Cloud", "Vercel", "GitHub", "Compare & Contrast"],
  intelligenceBoundary: {
    label: "Paid-tier intelligence boundary",
    rule: "DigitalHut's backend system stores, measures, classifies, routes, and compares evidence. It does not claim paid-tier reasoning is active when Codex or another approved AI service is not live.",
    codexRole: "Codex handles high-level engineering judgment, SEO strategy, code upgrades, and compare/refine decisions during live paid-tier sessions.",
    systemRole: "The DigitalHut system handles durable tasks: FireCuda maps, Supabase analytics, Google media packets, Vercel status, GitHub sync proof, sitemap counts, and refinement packets."
  },
  operatingContract: {
    label: "System-first operating contract",
    purpose: "Preserve paid-tier capacity by letting DigitalHut's backend system handle repeatable evidence movement while Codex oversees only the decisions that need judgment.",
    backendSystemPass: [
      "FireCuda maps everyday long-tail lanes, category replicas, international side markets, backlink targets, GLB evidence, and proof-route history.",
      "Supabase records how real visitors use search, autoplay, category panels, GLB, podcast, market, wallet, blog, watch routes, source links, and backlink events.",
      "Google Cloud prepares media and infrastructure packets: YouTube discovery, metadata/provided transcript analysis, Speech/TTS readiness, quota state, and backup readiness.",
      "Vercel stays deploy-ready by keeping public routes, API rewrites, sitemap metadata, quota messages, and production status visible.",
      "Compare & Contrast reads old and new packets, separates lag from winners, and sends the next useful input back into FireCuda."
    ],
    reflectionFlow: [
      "Each system layer outputs a reflection packet that proves what changed, what was measured, and what is still weak.",
      "Codex Pro High reasoning reads those packets, connects them to the product experience, and chooses the next meaningful code, SEO, or infrastructure refinement.",
      "The refined decision becomes the next FireCuda input, then moves through Supabase, Google Cloud, Vercel, Compare & Contrast, and back into the next cycle."
    ],
    codexOversightPass: [
      "Choose which system signals deserve advanced code structure work.",
      "Make the SEO language fit the entertainment observatory instead of adding filler content.",
      "Decide when the system is already maxing out and should be left to collect more behavior.",
      "Turn measured behavior into a clear founder-level perspective on what real visitors are seeing."
    ],
    hardBoundary: "No unpaid or offline component should be described as doing paid-tier reasoning. When Codex or an approved AI service is not live, the system prepares evidence packets and waits for oversight."
  },
  githubSourceAnchor: {
    repository: "tehleader1/Digitalhut",
    url: "https://github.com/tehleader1/Digitalhut",
    defaultBranch: "main",
    visibility: "public",
    permissions: "connector verified admin/maintain/push/pull access",
    localCheckoutStatus: "clean deploy folder is not a normal git checkout",
    syncStatus: "remote main is behind the deployed clean build until the baseline batch is pushed"
  },
  storage: {
    localSystemDrive: "C: about 511GB total / about 467GB free at audit",
    firecudaDrive: "D: Seagate about 8TB total / about 7.98TB free at audit",
    purpose: "Use FireCuda as the staging ground for keyword maps, GLB evidence, screenshots, system reports, backup packets, and compare/refine history."
  },
  stackStatus: [
    {id: "firecuda", status: "confirmed-local-drive", proof: "D: Seagate 8TB class drive available with about 7.98TB free."},
    {id: "supabase", status: "configured-in-code", proof: "Migrations, REST reads/writes, analytics events, blog drafts, FireCuda storage base, and live feed capture paths exist."},
    {id: "google-cloud", status: "configured-in-code", proof: "YouTube search, Google Speech analyzer, Google TTS, service account path, project, region, and backup env names are present."},
    {id: "vercel", status: "production-runtime", proof: "Vite/Vercel config, serverless API rewrites, SPA fallback, project binding, and prior production deployment are present."},
    {id: "github", status: "source-anchor-confirmed-sync-needed", proof: "GitHub repo tehleader1/Digitalhut exists on main with connector-verified write access, but this clean deploy folder is not a normal git checkout and remote main needs the baseline batch synced."},
    {id: "compare-contrast", status: "active-system-board", proof: "Standby system records last-known metrics, proof counts, product readiness, and next refinement lanes without claiming paid-tier reasoning."}
  ],
  productBaseline: [
    {area: "GLB renderer", status: "strongest engagement signal", proof: "62 GLB preview plays from last-known metric snapshot."},
    {area: "YouTube/category renderer", status: "working with category-fit hardening", proof: "API search and quota-safe/category storyboard labels are separated in the UI."},
    {area: "Podcast feature", status: "source-only lane corrected", proof: "Podcast no longer falls back into a YouTube iframe; publisher audio or source hold is used."},
    {area: "Market feed", status: "built but unproven by behavior", proof: "Market view exists, but last-known market opens are 0."},
    {area: "SEO proof layer", status: "crawlable structure ready", proof: "101 sitemap URLs with watch, blog, and category routes."}
  ],
  nextVentureCheckpoint: "Sync the deployed baseline batch back to GitHub main or a review branch, then start FireCuda SEO system mode from measured behavior."
}

const systemLoop = [
  {
    id: "firecuda",
    label: "FireCuda",
    status: "staging-ground",
    job: "Hold raw keyword maps, system reports, GLB evidence, screenshots, and cycle history before public release."
  },
  {
    id: "seo-master-list",
    label: "SEO Master List",
    status: "keyword-engine",
    job: "Convert raw market/research/video ideas into ranked long-tail targets, watch proof pages, blog proof posts, and category lanes."
  },
  {
    id: "sector-expansion",
    label: "Sector Expansion",
    status: "measured-sector-mapping",
    job: "Map new dapp sectors through verified sources, query families, system-fit coverage, and measured human behavior before public promotion."
  },
  {
    id: "supabase",
    label: "Supabase",
    status: "memory-and-pixel-store",
    job: "Store page views, search interactions, GLB plays, podcast interrupts, backlink events, saved assets, and future user tiers."
  },
  {
    id: "google-cloud",
    label: "Google Cloud",
    status: "media-intelligence",
    job: "Feed YouTube discovery, transcript/metadata analysis, Speech/TTS expansion, and cloud backup tasks."
  },
  {
    id: "github",
    label: "GitHub",
    status: "source-control",
    job: "Preserve code, SEO documents, route changes, and rollback points for every meaningful DigitalHut cycle."
  },
  {
    id: "vercel",
    label: "Vercel",
    status: "public-runtime",
    job: "Deploy the observatory, API routes, sitemap, proof pages, and public status surfaces to digitalhut.app."
  },
  {
    id: "compare-refine",
    label: "Compare & Contrast Refinement",
    status: "feedback-loop",
    job: "Compare page views, searches, autoplay, GLB plays, podcast starts, blog views, and market opens against the keyword master list."
  },
  {
    id: "rinse-repeat",
    label: "Rinse & Repeat",
    status: "next-cycle",
    job: "Promote winners, rewrite weak lanes, add missing backlinks, refresh episodes, and queue the next system batch."
  }
]

const taskSplit = {
  simultaneousSupportMode: {
    label: "Simultaneous Support Mode",
    job: "Run deterministic SEO system checks beside live engineering so measurements, FireCuda map updates, proof counts, and refinement queues stay ready while Codex handles advanced code and entertainment-SEO upgrades."
  },
  mundaneBackendLayer: [
    {
      id: "refresh-seo-packet",
      task: "Refresh standby status JSON, system docs, sitemap counts, route counts, and readiness markers."
    },
    {
      id: "compare-metrics",
      task: "Compare last master list targets against measured page views, GLB plays, podcast starts, blog views, searches, and market opens."
    },
    {
      id: "queue-refinement",
      task: "Convert weak signals into the next SEO cycle queue without spending live engineering time on manual bookkeeping."
    },
    {
      id: "firecuda-map-hygiene",
      task: "Keep FireCuda staging useful: master keyword movement, proof docs, backlink targets, and cycle reports stay organized."
    },
    {
      id: "cloud-space-check",
      task: "Keep the cloud/server path visible so Vercel, Supabase, Google Cloud, and sitemap proof have room to breathe."
    }
  ],
  liveEngineeringLayer: [
    {
      id: "advanced-code-structure",
      task: "Upgrade the DigitalHut entertainment dapp structure, renderer controls, API lanes, and backend/frontend integration."
    },
    {
      id: "seo-entertainment-intertwine",
      task: "Intertwine long-tail SEO into video, GLB, podcast, market, blog, watch, category, and sitemap surfaces without filler."
    },
    {
      id: "refinement-judgment",
      task: "Understand the difference between the last master list and the next measured data, then choose what gets promoted, rewritten, or removed."
    },
    {
      id: "firecuda-strategy",
      task: "Use the FireCuda map as a strategic staging ground for latest SEO measurements, market lanes, and proof routes."
    }
  ]
}

const mundanePipeline = [
  {
    id: "firecuda",
    label: "FireCuda SEO Map",
    job: "Stage the full long-tail universe before publishing: everyday people, category replicas, international side markets, backlink sources, proof routes, and keyword movement history.",
    outputs: [
      "home project, family, grocery, travel, real estate, gaming, developer, research, market, and creator lanes",
      "digital nomad and everyday user phrases that sound searched by real people",
      "international side-market variants for country, city, language, and local service intent",
      "keyword movement files that explain what to promote, rewrite, or retire"
    ]
  },
  {
    id: "seo-master-list",
    label: "SEO Master List",
    job: "Turn FireCuda findings into original long-tail keyword clusters that can be woven into episodes, watch routes, blog proof, sponsor moments, and category pages.",
    outputs: [
      "ranked long-tail phrases by human role and market lane",
      "episode intro, sponsor stack, timeline, conclusion, and backlink phrase placements",
      "freshness tags for 2026 research, dapp structure, visual experience, and real-world use cases",
      "rewrite queue for pages that are visible but not earning behavior"
    ]
  },
  {
    id: "supabase",
    label: "Supabase Analytics Memory",
    job: "Track how people use the observatory and reflect those signals back into the SEO map without guessing.",
    outputs: [
      "page view, unique visitor, autoplay, search, category, quick-panel, GLB, podcast, market, wallet, blog, watch, and backlink events",
      "human role tagging for researcher, developer, gamer, home project user, real estate buyer, creator, market watcher, and digital nomad",
      "feature usefulness scores that show what visitors actually touch",
      "database-ready event names so the backend can compare behavior across cycles"
    ]
  },
  {
    id: "google-cloud",
    label: "Google Cloud Infrastructure",
    job: "Keep the media and developer infrastructure credible: YouTube discovery, metadata/transcript processing, Speech/TTS expansion, cloud backups, quotas, and API readiness.",
    outputs: [
      "YouTube topic and category checks before episodes appear in the feed",
      "speech, metadata, and content analysis packets for bubble map, timeline, and 3D reader summaries",
      "developer proof markers that show real infrastructure instead of filler UI",
      "cloud backup and quota readiness notes for production stability"
    ]
  },
  {
    id: "github-vercel",
    label: "GitHub And Vercel Release Path",
    job: "Keep code history and public deployment aligned so the live dapp shows the same functionality the local build proves.",
    outputs: [
      "source-controlled code, docs, generated JSON, sitemap, watch routes, and rollback points",
      "deploy-ready checks for routes, renderer controls, public status JSON, API quota messaging, and sitemap metadata",
      "production release notes that explain what changed for visitors and search engines",
      "stable batch deployment decisions instead of tiny churn deploys"
    ]
  },
  {
    id: "compare-contrast",
    label: "Compare And Contrast Refinement",
    job: "Read the old build against the new build, then decide what is lagging the system, what improves it, and what deserves the next SEO push.",
    outputs: [
      "before-and-after reads for metrics, UX controls, renderers, category accuracy, and keyword proof",
      "lag sources such as heavy animation, confusing controls, duplicate analytics, or weak category mapping",
      "winner signals such as GLB plays, watch proof clicks, source links, blog views, or market opens",
      "the next FireCuda cycle input so the loop keeps learning"
    ]
  }
]

const fireCudaKeywordMap = [
  {
    lane: "Everyday Home And Family",
    roles: ["parent planning a room", "home project buyer", "family creator", "local service shopper"],
    internationalMarkets: ["United States suburbs", "UK flats", "Canada renovation", "Australia holiday homes"],
    longTailSeeds: [
      "funny grocery reel visual experience",
      "home project 3d visual experience before buying",
      "smiley face filter reaction reel",
      "family vacation observatory episode ideas",
      "local contractor visual walkthrough dapp"
    ]
  },
  {
    lane: "3D Visual Experience And Creator Media",
    roles: ["social reel creator", "3D artist", "podcast producer", "short-form video editor"],
    internationalMarkets: ["global TikTok creators", "Instagram Reels creators", "YouTube Shorts publishers", "remote creator studios"],
    longTailSeeds: [
      "ai guided 3d visual experience for social media reels",
      "magic reel face conversion observatory",
      "AI microdrama visual observatory",
      "nostalgia filter 2016 reel map",
      "best interactive observatory video presentation 2026",
      "podcast speaker moment visual analytics",
      "3d model preview for creator portfolio dapp"
    ]
  },
  {
    lane: "Research And Developer Study",
    roles: ["developer", "researcher", "student", "data analyst", "open-source reviewer"],
    internationalMarkets: ["US university search", "European research labs", "India developer market", "MENA technology research"],
    longTailSeeds: [
      "coral reef study 2026 3d visual experience",
      "ai research engine timeline bubble map",
      "face swap trust visual research",
      "developer dapp observatory backend proof",
      "climate data visual experience for research presentation"
    ]
  },
  {
    lane: "Real Estate Resort And Travel",
    roles: ["real estate agent", "home buyer", "vacation planner", "resort marketer"],
    internationalMarkets: ["Florida real estate", "Dubai resort search", "Caribbean vacation rentals", "European city apartments"],
    longTailSeeds: [
      "housing model 3d experience real estate agency",
      "2026 real estate agency virtual model",
      "resort visual walkthrough observatory episode",
      "local business reel transformation map",
      "vacation rental 3d guided experience"
    ]
  },
  {
    lane: "Gaming Market And Tech",
    roles: ["gamer", "PC builder", "stock watcher", "tech reviewer", "server community owner"],
    internationalMarkets: ["US gaming search", "Japan PC parts", "Germany hardware buyers", "global market watchers"],
    longTailSeeds: [
      "top 10 new gaming build visual experience",
      "who has top builds in the server visual experience",
      "graphics card statistics observatory episode",
      "current market video analytics with 3d company model"
    ]
  }
]

const fireCudaOverseerMap = {
  label: "FireCuda Overseer Category Balancer",
  storageRole: "Use the 8TB FireCuda staging ground as the durable map for category groups, keyword tier movement, backlink defense, and compare/contrast history before public deployment.",
  judgmentRules: [
    "Promote a keyword group when search, proof-route opens, watch-route opens, GLB plays, or backlink clicks rise together.",
    "Move a keyword group to second-place when monthly intent cools but the yearly topic still supports authority.",
    "Increase backlinks for cooled evergreen lanes instead of deleting them, especially when they support research, travel, real estate, or GLB source trust.",
    "Intermix feeds when two lanes explain the same human behavior from different angles, such as creator reels plus face-conversion safety, or market videos plus 3D company models.",
    "Never let a beautiful renderer lane outrank messy human behavior if visitors keep choosing simpler reels, filters, quick reactions, or local business clips."
  ],
  categoryGroups: [
    {
      id: "featured-visual-content",
      tier: "main-featured",
      currentRead: "Human-interest visual content gets the lead lane because it catches everyday searches before people know DigitalHut terms.",
      keywordGroups: ["magic reel face conversion observatory", "smiley face filter reaction reel", "AI microdrama visual observatory", "nostalgia filter 2016 reel map", "funny grocery reel visual experience"],
      intermixFeedIdeas: ["YouTube short-form topic read", "search intent chips", "podcast/source moment", "light GLB context", "blog/watch proof"],
      humanSignals: ["search_intent_chip_select", "search_run", "autoplay_start", "blog_route_open", "watch_route_open"]
    },
    {
      id: "exotic-environment-defense",
      tier: "second-place-backlink-defense",
      currentRead: "Scenario input: exotic environment demand is treated as cooler this month, but still useful for yearly authority, GLB trust, travel, game, and research backlinks.",
      keywordGroups: ["exotic environment GLB viewer", "vacation resort 3D preview", "AI tour guide for 3D places", "gaming 3D environment viewer", "planetary research data 3D observatory"],
      intermixFeedIdeas: ["backlink source cards", "category proof routes", "GLB source click prompts", "travel/research watch pages", "creator asset notes"],
      humanSignals: ["glb_preview_open", "glb_source_click", "backlink_source_open", "category_lane_select", "watch_route_open"]
    },
    {
      id: "developer-research-trust",
      tier: "authority-support",
      currentRead: "Developer/research language supports credibility and should feed proof pages, not dominate every entertainment entry.",
      keywordGroups: ["face swap trust visual research", "developer dapp observatory backend proof", "Google Cloud speech 3D experience", "AI research engine with visual analysis", "backend analytics for 3D dapp structure"],
      intermixFeedIdeas: ["source evidence notes", "Google Cloud media packet", "Supabase signal map", "watch proof citation", "wallet/developer proof"],
      humanSignals: ["watch_route_open", "blog_route_open", "wallet_render_check", "backlink_source_open", "search_intent_chip_select"]
    },
    {
      id: "market-local-business",
      tier: "conversion-support",
      currentRead: "Business and market lanes should appear when a visitor clicks into them, then tie video, podcast, GLB, and chart/source proof together.",
      keywordGroups: ["local business reel transformation map", "current market video observatory", "stock market visual analysis 3D", "barber shop social media reel", "restaurant remodel visual reel"],
      intermixFeedIdeas: ["Current Market teaser", "top 3 option pressure", "company GLB environment", "local backlink route", "business proof article"],
      humanSignals: ["market_panel_open", "ticker_search", "search_intent_chip_select", "backlink_source_open", "blog_route_open"]
    }
  ],
  currentTierMovement: [
    {
      keywordGroup: "exotic environments",
      fromTier: "main-featured",
      toTier: "second-place-backlink-defense",
      trigger: "Scenario: monthly search interest cools while yearly authority and GLB usefulness remain valuable.",
      action: "Keep exotic environments in sitemap/watch/blog proof, increase backlink support, and stop letting it crowd the main featured visual content lane."
    },
    {
      keywordGroup: "messy social visual behavior",
      fromTier: "gap-scouting",
      toTier: "main-featured",
      trigger: "Scenario: people react to magic reels, smiley filters, face conversions, nostalgia clips, and AI microdrama before they ask for formal 3D renderer terms.",
      action: "Promote these phrases into FireCuda map, proof posts, watch routes, and search intent chip candidates."
    },
    {
      keywordGroup: "3D renderer proof",
      fromTier: "main-featured",
      toTier: "credibility-anchor",
      trigger: "Last-known GLB plays are strong, but the content should support the chosen topic instead of forcing every visitor into renderer-first language.",
      action: "Keep GLB proof as the authority hook, then let video/search behavior choose the topic lane."
    }
  ],
  nextCompareReads: [
    "Compare search_intent_chip_select against typed search_run to learn whether visitors choose suggested lanes.",
    "Compare GLB plays against blog/watch route opens to see whether 3D proof is creating research behavior.",
    "Compare exotic environment backlinks against featured social visual searches before moving exotic terms back to first place.",
    "Compare podcast interrupts against video/autoplay behavior to decide whether Apple Podcasts remains a support lane or becomes featured.",
    "Compare market opens against local business transformation searches before expanding market-specific proof pages."
  ]
}

const viralFirstSourceSystem = {
  label: "New Viral Video First-Source Backend Packet",
  frontendLock: "No visible observatory UI changes. This packet only prepares SEO, analytics, source, GLB, and podcast readiness until measured client behavior proves a front-end change is needed.",
  scenario: "A new viral video releases and DigitalHut needs to be ready as a first-source observatory feed without rushing a visual rewrite.",
  stackFlow: [
    {layer: "FireCuda", work: "Stage the viral topic, first-source phrase set, international side-market variants, backlink candidates, and related category lanes before public rewrite."},
    {layer: "Supabase", work: "Track source opens, watch route opens, search intent, autoplay, GLB plays, podcast starts, and backlink clicks under the same viral-source packet."},
    {layer: "Google Cloud", work: "Use YouTube metadata, allowed transcripts or user-provided transcripts, Speech/TTS readiness, and quota-safe discovery to prepare the content read."},
    {layer: "Vercel", work: "Keep the existing public shell stable while sitemap, status JSON, watch/blog/category proof, and source routes are ready for the next deploy gate."},
    {layer: "Compare & Contrast", work: "Compare whether the viral packet creates search, watch, GLB, podcast, backlink, or blog movement before promoting the next keyword lane."}
  ],
  keywordSeeds: [
    "new viral video first source feed",
    "new viral video 2026 visual analytics",
    "viral video GLB renderer proof",
    "viral video Apple Podcasts source moment",
    "first source video backlink route",
    "viral video observatory research hub",
    "breaking video visual experience",
    "same day viral video source verification",
    "viral topic 3D evidence map",
    "creator trend first source observatory"
  ],
  eventSignals: [
    "viral_source_packet_ready",
    "viral_source_route_open",
    "viral_source_backlink_open",
    "viral_glb_proof_play",
    "viral_podcast_source_start",
    "viral_watch_route_open"
  ],
  proofTargets: [
    "watch route for the viral topic when it earns behavior",
    "blog proof post only after the first-source phrase has a useful angle",
    "GLB model proof attached to the topic instead of generic blocks",
    "Apple Podcasts/source moment that supports the topic without stealing the YouTube feed",
    "source/backlink route that helps search engines understand DigitalHut as the observer"
  ],
  deployGate: "Deploy only when the packet affects crawlable proof, analytics coverage, or a stable backend status update. Do not deploy for cosmetic movement."
}

const buriedTreasureNicheMap = {
  label: "Claimable Observatory Entertainment Niche",
  claim: "Own the 'what am I watching?' entertainment observatory lane: people do not only want a video, they want the video explained through source proof, 3D context, podcast/source moments, and useful long-tail paths.",
  status: "claimable-backend-system-capability",
  whyOpen: [
    "YouTube, social feeds, podcasts, 3D asset sites, and market/news sources usually live in separate tabs instead of one useful entertainment observatory.",
    "Most SEO pages explain a topic after the fact; DigitalHut can prepare the live proof structure first: video topic, GLB proof, podcast/source moment, backlink/source route, watch proof, and blog proof.",
    "Everyday searches are messy: people ask about funny reels, face filters, home projects, gaming builds, local businesses, viral clips, and research topics before they know formal product keywords.",
    "DigitalHut already has the rare combination needed to claim it: video renderer, GLB renderer, podcast/source interrupt, market panel, Supabase events, Google media readiness, and crawlable proof routes."
  ],
  contentFormula: "Video topic read + GLB proof + podcast/source moment + backlink/source route + watch proof + blog proof + system capability alert.",
  longTailClusters: [
    {
      id: "what-am-i-watching",
      lane: "Everyday viral explanation",
      role: "everyday viewer",
      formatFit: "main feed, watch proof, source route",
      keywords: [
        "what am I watching viral video explained",
        "viral video source map visual experience",
        "funny reel explained with sources",
        "new viral clip visual research hub",
        "why is this video trending observatory"
      ],
      proofSignal: "source opens + watch route opens + autoplay starts"
    },
    {
      id: "creator-proof-reels",
      lane: "Creator and social reel proof",
      role: "creator",
      formatFit: "search chip, podcast/source moment, blog proof",
      keywords: [
        "ai reel visual experience proof",
        "face filter reaction reel observatory",
        "smiley face filter source moment",
        "creator trend 3d evidence map",
        "short video idea visual analytics"
      ],
      proofSignal: "search intent chips + quick panel selections + blog route opens"
    },
    {
      id: "3d-decision-proof",
      lane: "3D decision support",
      role: "home buyer, gamer, traveler, researcher",
      formatFit: "GLB renderer, category lane, watch route",
      keywords: [
        "watch video with 3d model proof",
        "home project 3d video explanation",
        "gaming build visual experience map",
        "real estate video 3d model observatory",
        "vacation place 3d source preview"
      ],
      proofSignal: "GLB plays + GLB source clicks + watch proof opens"
    },
    {
      id: "podcast-source-moment",
      lane: "Podcast/source authority",
      role: "researcher, creator, developer",
      formatFit: "podcast interrupt, source panel, blog proof",
      keywords: [
        "podcast source moment for viral video",
        "apple podcast clip with video analysis",
        "special guest source moment observatory",
        "podcast backed video research hub",
        "audio source proof for trending topic"
      ],
      proofSignal: "podcast starts + podcast ends + backlink opens"
    },
    {
      id: "market-story-proof",
      lane: "Market and business story proof",
      role: "market watcher, local business owner",
      formatFit: "market panel, source route, watch proof",
      keywords: [
        "stock video visual analysis with sources",
        "company news 3d observatory",
        "local business reel transformation proof",
        "market story video source map",
        "top volume stock video research hub"
      ],
      proofSignal: "market opens + ticker searches + source opens"
    }
  ],
  systemPlacement: [
    "FireCuda stores the phrase universe, niche movement, proof notes, and backlink targets.",
    "Supabase records which cluster real visitors touch through search, autoplay, GLB, podcast, market, watch, blog, and source events.",
    "Google Cloud prepares YouTube/media metadata, allowed transcript or provided transcript analysis, Speech/TTS readiness, and quota-safe fallback notes.",
    "Vercel receives only stable crawlable proof: sitemap routes, watch/blog/category proof, public JSON packets, and deploy status.",
    "Compare & Contrast promotes clusters that earn behavior and holds clusters that are only interesting ideas."
  ],
  expansionGate: "Promote a cluster only when it has at least two supporting behavior lanes, such as search + watch, GLB + source, podcast + blog, market + ticker, or autoplay + backlink.",
  nextMove: "Claim the what-am-I-watching lane first, then let real interactions decide whether creator reels, 3D decision proof, podcast authority, or market story proof gets the next public route batch."
}

const mundaneOffTimeExperienceMap = {
  label: "Mundane Off-Time Experience",
  claim: "Own normal off-time searches before they vanish into single-use tabs: lunch, rideshare, flight booking, wiki lookup, funny videos, errands, quick reviews, and small daily decisions.",
  status: "backend-seo-system-capability",
  contentFormula: "Everyday intent + source/backlink proof + video topic read + GLB life-context preview + podcast/source moment + watch/blog/category proof.",
  whyOpen: [
    "Normal people search constantly during breaks, commutes, errands, and planning windows, but most results stop at a list, review, or video.",
    "DigitalHut can turn a small everyday search into a useful observatory page with video, GLB context, podcast/source authority, timeline proof, and backlinks.",
    "This lane reaches people before they know technical words like dapp, GLB, observatory, or analytics."
  ],
  clusters: [
    {
      id: "lunch-local-food",
      lane: "Lunch And Local Food",
      role: "person on break",
      keywords: [
        "looking for lunch near me visual guide",
        "what should I eat today visual experience",
        "local restaurant video review source proof",
        "cheap lunch spot near me source map",
        "family lunch place visual observatory"
      ],
      variationDimensions: {
        intents: ["looking for lunch", "what should I eat", "best lunch near me", "cheap lunch spot", "family lunch place", "office lunch idea", "quick food nearby", "local restaurant review", "healthy lunch option", "late lunch place", "food truck nearby", "restaurant menu preview", "lunch break meal", "nearby cafe choice"],
        contexts: ["lunch break", "after work", "family weekend", "downtown", "near the office", "near home", "while traveling", "before appointment", "between errands"],
        modifiers: ["cheap", "best", "funny", "local", "open now", "2026", "quick", "review-backed", "source-backed"],
        formats: ["visual guide", "video map", "source map", "3D preview", "watch route", "podcast source moment", "review observatory", "backlink proof", "decision guide"],
        proofAngles: ["menu source", "review source", "local backlink", "video proof", "GLB place context", "timeline decision", "quick panel signal"],
        geoScopes: ["near me", "city center", "suburb", "airport area", "college town", "tourist district", "work district", "international city"]
      },
      proofSignal: "search intent + backlink source open + watch route open"
    },
    {
      id: "rideshare-commute",
      lane: "Rideshare And Commute",
      role: "traveler or worker between places",
      keywords: [
        "calling an Uber visual trip guide",
        "rideshare pickup location explained",
        "airport Uber pickup visual guide",
        "commute delay visual observatory",
        "rideshare price spike explained"
      ],
      variationDimensions: {
        intents: ["calling an Uber", "rideshare pickup", "airport Uber pickup", "late night ride", "commute delay", "pickup location", "rideshare price spike", "Uber vs train", "downtown pickup", "safe pickup spot", "ride after work", "hotel pickup"],
        contexts: ["after work", "airport arrival", "downtown event", "late night", "rainy commute", "family trip", "business travel", "college campus"],
        modifiers: ["safe", "cheap", "fast", "open now", "2026", "local", "source-backed", "visual"],
        formats: ["visual trip guide", "route map", "3D pickup view", "watch route", "source map", "timeline guide", "podcast source moment", "backlink proof"],
        proofAngles: ["pickup source", "price signal", "route timing", "local guide", "video proof", "GLB location context", "quick panel signal"],
        geoScopes: ["near me", "airport", "downtown", "hotel zone", "stadium area", "train station", "suburb", "international city"]
      },
      proofSignal: "quick panel select + timeline read + source/backlink open"
    },
    {
      id: "flight-travel-booking",
      lane: "Flight And Travel Booking",
      role: "traveler comparing money, timing, and trust",
      keywords: [
        "booking a flight ticket visual guide",
        "cheap flight ticket 2026 source map",
        "flight layover 3D map guide",
        "airport delay visual observatory",
        "travel booking source proof"
      ],
      variationDimensions: {
        intents: ["booking a flight ticket", "cheap flight ticket", "flight delay", "airport layover", "family vacation flight", "last minute flight", "airline ticket comparison", "airport route", "travel deal", "flight change", "best airport connection", "international flight booking", "airport delay update"],
        contexts: ["family trip", "business trip", "vacation", "holiday travel", "same day booking", "layover", "airport delay", "international route"],
        modifiers: ["cheap", "best", "2026", "last minute", "source-backed", "visual", "family", "safe"],
        formats: ["visual guide", "source map", "3D map guide", "watch route", "timeline explainer", "podcast source moment", "travel observatory", "backlink proof", "decision guide"],
        proofAngles: ["airline source", "airport source", "booking source", "price signal", "delay source", "GLB airport context", "video proof", "timeline decision"],
        geoScopes: ["near me", "domestic", "international", "airport hub", "vacation city", "business city", "family route"]
      },
      proofSignal: "category lane select + GLB place preview + watch proof open"
    },
    {
      id: "wiki-quick-research",
      lane: "Wiki And Quick Research",
      role: "curious viewer looking something up",
      keywords: [
        "wiki lookup visual research hub",
        "what is this topic explained with sources",
        "public information 3D observatory",
        "beginner research visual observatory",
        "topic timeline with source links"
      ],
      variationDimensions: {
        intents: ["wiki lookup", "what is this topic", "beginner research", "public information", "topic timeline", "quick facts", "source-backed summary", "explained with sources", "research before buying", "history lookup", "science lookup", "technology lookup"],
        contexts: ["lunch break", "home research", "student question", "developer question", "family question", "news context", "podcast context", "video context"],
        modifiers: ["beginner", "quick", "2026", "source-backed", "visual", "simple", "deep", "trusted"],
        formats: ["visual research hub", "source map", "3D observatory", "watch route", "timeline guide", "podcast source moment", "backlink proof", "decision guide"],
        proofAngles: ["wiki source", "reference source", "video proof", "timeline source", "GLB context", "blog proof", "source route", "quick panel signal"],
        topicScopes: ["science", "business", "technology", "history", "health context", "travel context", "local topic"]
      },
      proofSignal: "blog proof open + source route open + search intent"
    },
    {
      id: "funny-mainstream-video",
      lane: "Funny Mainstream Video",
      role: "viewer killing time",
      keywords: [
        "funny video explained with sources",
        "mainstream website funny clip explained",
        "what am I watching funny video",
        "meme video timeline explained",
        "viral clip source map"
      ],
      variationDimensions: {
        intents: ["funny video explained", "mainstream funny clip", "what am I watching funny video", "meme video", "viral clip", "reaction reel", "short video source", "YouTube funny video", "TikTok funny moment", "Instagram reel moment", "Reddit funny clip", "family funny clip"],
        contexts: ["off time", "lunch break", "late night", "family room", "after work", "weekend", "friend group", "mainstream feed"],
        modifiers: ["funny", "viral", "new", "2026", "source-backed", "weird", "quick", "trending"],
        formats: ["explained with sources", "source map", "timeline explained", "watch route", "3D context", "podcast source moment", "reaction observatory", "backlink proof", "visual guide"],
        proofAngles: ["original source", "creator source", "comment source", "video proof", "podcast/source moment", "GLB context", "trend signal", "watch proof"],
        platforms: ["YouTube", "TikTok", "Instagram", "Reddit", "Facebook", "mainstream website", "shorts feed", "podcast clip"]
      },
      proofSignal: "autoplay start + watch route open + podcast/source interrupt"
    },
    {
      id: "errands-review-before-buying",
      lane: "Errands And Review Before Buying",
      role: "person making a small spending decision",
      keywords: [
        "grocery run visual guide",
        "closest store with best deals source map",
        "should I buy this product video proof",
        "Reddit review visual summary",
        "trusted review map 2026"
      ],
      variationDimensions: {
        intents: ["grocery run", "closest store", "best deals", "should I buy this product", "Reddit review", "trusted review", "pharmacy run", "weekend errands", "home supply run", "coffee shop stop", "quick stop before work", "family shopping", "product comparison", "local store review"],
        contexts: ["after work", "before work", "weekend", "family trip", "near home", "near office", "while traveling", "between errands", "same day"],
        modifiers: ["cheap", "best", "trusted", "quick", "2026", "local", "review-backed", "source-backed"],
        formats: ["visual guide", "source map", "video proof", "3D preview", "watch route", "timeline guide", "review observatory", "backlink proof"],
        proofAngles: ["store source", "review source", "product source", "price signal", "video proof", "GLB product context", "blog proof", "quick panel signal"],
        geoScopes: ["near me", "suburb", "downtown", "mall area", "airport area", "college town", "international city"]
      },
      proofSignal: "source/backlink open + blog proof open + quick panel select"
    }
  ],
  systemPlacement: [
    "FireCuda stores the broad phrase universe and separates lunch, rideshare, flight, wiki, funny-video, errand, and review clusters.",
    "Supabase measures whether real people touch these normal lanes through search, category, autoplay, GLB, podcast, source, blog, and watch events.",
    "Google Cloud can enrich allowed video metadata, source-safe descriptions, and future transcript/user-provided analysis for the everyday topic.",
    "Vercel receives only stable proof routes and public status packets when a cluster is ready to be crawled.",
    "Compare & Contrast promotes ordinary searches only when they show behavior, because this lane can grow huge fast."
  ],
  expansionGate: "Promote an off-time cluster when it has at least one intent signal and one proof signal, such as search + watch, category + GLB, source + blog, autoplay + podcast, or quick panel + backlink.",
  nextMove: "Stage the mundane off-time category as the next dapp experience, then let Supabase behavior decide whether lunch, rideshare, flight, wiki, funny video, or errands earns the next public expansion."
}

const codexOversightCapabilities = {
  label: "Codex Oversight Capabilities",
  role: "Codex oversees the DigitalHut system capabilities during live work: I decide what matters, what to hold, what to claim, and what deserves code, SEO, proof, or deployment movement.",
  boundary: "DigitalHut system capabilities store, render, and measure. Codex oversight capabilities judge, connect, prioritize, and upgrade when active with the owner.",
  capabilities: [
    {
      id: "claim-buried-niche",
      lane: "Niche Claiming",
      capability: "Spot underfilled entertainment/research lanes and turn them into structured long-tail packets instead of generic content.",
      evidenceUsed: ["FireCuda keyword map", "proof depth", "source behavior", "GLB engagement", "podcast/source behavior", "market gaps"],
      output: "claimable niche map, expansion gate, keyword cluster, proof route plan"
    },
    {
      id: "compare-and-hold",
      lane: "Compare And Hold",
      capability: "Decide when the system is already steady and should collect behavior instead of churning visual or SEO changes.",
      evidenceUsed: ["capability delta", "last-known metrics", "alert movement", "product markers", "sitemap depth"],
      output: "hold/readiness call, next real movement target"
    },
    {
      id: "proof-over-filler",
      lane: "Proof Discipline",
      capability: "Reject filler phrases and only promote keywords that can live inside a video, GLB, podcast/source, backlink, watch, blog, market, or category proof surface.",
      evidenceUsed: ["long-tail clusters", "proof gates", "route counts", "Supabase event coverage"],
      output: "public-proof eligible phrases and withheld phrases"
    },
    {
      id: "frontend-lock-judgment",
      lane: "Interface Judgment",
      capability: "Keep the website visually locked unless live client behavior or an overdue implementation flaw proves a premium interface change is worth it.",
      evidenceUsed: ["client behavior", "active conditions", "known visual blockers", "feature readiness"],
      output: "no-change call or justified UI change target"
    },
    {
      id: "deploy-gate-judgment",
      lane: "Deploy Judgment",
      capability: "Separate deploy-worthy backend/proof batches from small local bookkeeping.",
      evidenceUsed: ["product marker gate", "proof route changes", "public JSON packet changes", "Vercel status", "sitemap changes"],
      output: "deploy, hold, or stage call"
    }
  ],
  currentOversightRead: "The system is capability-ready and visually locked. The strongest owner move is to claim the what-am-I-watching entertainment observatory niche in backend SEO while waiting for search/source behavior before public expansion.",
  nextOwnerVisibleUpdate: "Only surface a visual update when capability delta, visitor behavior, or a confirmed system flaw proves the interface needs it."
}

const supabaseAnalyticsCoverage = [
  "page_view",
  "blog_view",
  "unique_visitor",
  "autoplay_start",
  "autoplay_pause",
  "episode_preview_autoplay_start",
  "autoplay_episode_shift",
  "youtube_category_select",
  "category_lane_select",
  "category_proof_open",
  "search_run",
  "search_intent_chip_select",
  "quick_panel_select",
  "proof_route_open",
  "platform_cadence_read",
  "glb_preview_play",
  "glb_preview_collapse",
  "glb_replica_play",
  "glb_source_click",
  "podcast_interrupt_play",
  "podcast_interrupt_end",
  "podcast_source_open",
  "market_view_open",
  "ticker_search",
  "timeline_scrub",
  "wallet_render_check",
  "watch_route_open",
  "blog_route_open",
  "backlink_source_open",
  "sponsor_stack_view",
  "viral_source_packet_ready",
  "viral_source_route_open",
  "viral_source_backlink_open",
  "viral_glb_proof_play",
  "viral_podcast_source_start",
  "viral_watch_route_open"
]

const supabaseMeasurementEvents = [
  {
    canonicalEvent: "page_view",
    aliases: ["blog_view"],
    feature: "Page and proof-route visibility",
    humanRole: "everyday viewer",
    requiredFields: ["session_id", "visitor_id", "path", "title", "category"],
    seoDecision: "Decides whether a route deserves more internal links, better title copy, or FireCuda hold."
  },
  {
    canonicalEvent: "search_run",
    aliases: ["youtube_search_submit"],
    feature: "Search intent",
    humanRole: "researcher",
    requiredFields: ["session_id", "visitor_id", "search", "keyword_hint", "category"],
    seoDecision: "Promotes exact typed phrases from FireCuda into watch/blog/category proof."
  },
  {
    canonicalEvent: "search_intent_chip_select",
    aliases: ["quick_panel_select", "category_lane_select"],
    feature: "Suggested intent selection",
    humanRole: "digital nomad",
    requiredFields: ["session_id", "visitor_id", "keyword_hint", "category", "metadata"],
    seoDecision: "Separates phrases visitors choose from phrases that only look good in the master list."
  },
  {
    canonicalEvent: "glb_preview_play",
    aliases: ["glb_preview_open", "glb_replica_play", "viral_glb_proof_play"],
    feature: "3D/GLB proof",
    humanRole: "developer",
    requiredFields: ["session_id", "visitor_id", "asset_id", "category", "metadata"],
    seoDecision: "Turns renderer interest into GLB source/backlink proof and 3D route priority."
  },
  {
    canonicalEvent: "podcast_interrupt_play",
    aliases: ["podcast_interrupt_start", "podcast_interrupt_end", "podcast_source_open", "viral_podcast_source_start"],
    feature: "Podcast/source moment",
    humanRole: "creator",
    requiredFields: ["session_id", "visitor_id", "keyword_hint", "category", "metadata"],
    seoDecision: "Decides whether podcast/source moments deserve featured support copy or stay secondary."
  },
  {
    canonicalEvent: "market_view_open",
    aliases: ["market_panel_open", "ticker_search"],
    feature: "Market feed",
    humanRole: "market watcher",
    requiredFields: ["session_id", "visitor_id", "search", "keyword_hint", "category", "metadata"],
    seoDecision: "Decides when market keywords should route into market view instead of the regular feed."
  },
  {
    canonicalEvent: "proof_route_open",
    aliases: ["watch_route_open", "blog_route_open", "category_proof_open", "zone_checkpoint_open", "viral_watch_route_open", "viral_source_route_open"],
    feature: "Watch/blog/category proof",
    humanRole: "researcher",
    requiredFields: ["session_id", "visitor_id", "path", "keyword_hint", "blog_slug", "metadata"],
    seoDecision: "Moves crawlable proof pages between launch-primary, support, rewrite, and FireCuda hold."
  },
  {
    canonicalEvent: "backlink_source_open",
    aliases: ["glb_source_click", "podcast_source_open", "viral_source_backlink_open"],
    feature: "Source and backlink trust",
    humanRole: "developer",
    requiredFields: ["session_id", "visitor_id", "path", "keyword_hint", "source", "metadata"],
    seoDecision: "Identifies which source links help the observatory look useful instead of decorative."
  },
  {
    canonicalEvent: "autoplay_start",
    aliases: ["episode_preview_autoplay_start", "autoplay_pause", "autoplay_episode_shift"],
    feature: "Presentation control",
    humanRole: "everyday viewer",
    requiredFields: ["session_id", "visitor_id", "category", "asset_id", "metadata"],
    seoDecision: "Shows whether people let the observatory presentation run or bounce back to passive video."
  },
  {
    canonicalEvent: "timeline_scrub",
    aliases: ["platform_cadence_read"],
    feature: "Timeline and system reading",
    humanRole: "researcher",
    requiredFields: ["session_id", "visitor_id", "keyword_hint", "category", "metadata"],
    seoDecision: "Proves whether the analytics timeline is useful enough to support deeper proof-page language."
  }
]

const humanRoleDatabaseMap = [
  {role: "everyday viewer", meaning: "Needs a useful reason to keep watching beyond YouTube.", signals: ["autoplay_start", "quick_panel_select", "backlink_source_open"]},
  {role: "researcher", meaning: "Needs source links, timeline evidence, and readable topic summaries.", signals: ["watch_route_open", "backlink_source_open", "blog_route_open"]},
  {role: "developer", meaning: "Needs cloud, API, wallet, renderer, and code proof that the dapp is technically real.", signals: ["glb_source_click", "wallet_render_check", "watch_route_open"]},
  {role: "creator", meaning: "Needs remixable visual moments, podcast moments, and social proof lanes.", signals: ["podcast_interrupt_start", "glb_preview_open", "quick_panel_select"]},
  {role: "market watcher", meaning: "Needs ticker context, market videos, chart panels, and fast source confirmation.", signals: ["market_panel_open", "ticker_search", "backlink_source_open"]},
  {role: "digital nomad", meaning: "Needs original long-tail topics that cross travel, work, research, markets, media, and proof pages.", signals: ["category_select", "blog_route_open", "watch_route_open"]}
]

const cloudInfrastructureChecks = [
  {area: "YouTube Data", check: "Category and next-episode queues should verify topic fit before a video becomes featured."},
  {area: "Speech And TTS", check: "Speech/metadata packets should feed bubble map, timeline, 3D reader, and podcast moment copy."},
  {area: "Cloud Backup", check: "Generated status, system reports, SEO maps, and proof files should be backup-ready before each deploy."},
  {area: "Developer Spotlight", check: "Public pages should expose renderer, API, sitemap, wallet, and event-tracking proof without leaking secrets."},
  {area: "Quota Readiness", check: "Video, market, speech, and model calls should show fallback behavior instead of broken panels when quota is tight."}
]

const decentralizedDappChecks = [
  "Wallet render path remains visible and testable in the observatory shell.",
  "Supabase holds behavior data without becoming the only proof of product value.",
  "Google Cloud powers media intelligence and backup while public routes remain crawlable.",
  "Vercel serves the production dapp, status JSON, sitemap, blog proof, and watch proof.",
  "Source links, backlink opens, model source clicks, and wallet checks keep the dapp proof connected to real systems."
]

const digitalNomadSeoPerspective = {
  thesis: "DigitalHut should target original long-tail searches that sound like real people trying to understand, compare, build, travel, buy, research, or create with visual media.",
  strongestAngle: "A digital nomad SEO map is not one niche. It is a moving proof system that connects everyday searches to video, 3D, podcast, market, research, and source-backed pages.",
  practicalRule: "Every phrase must earn a place in an episode, sponsor stack, timeline moment, bubble map node, 3D model panel, blog proof post, watch route, or backlink source."
}

const operatingStack = ["FireCuda", "Supabase", "Google Cloud", "Vercel", "Compare & Contrast"]

const categoryRouteProfiles = {
  "mainstream-streaming": {
    name: "Mainstream Streaming",
    keywords: ["YouTube video content radar", "mainstream video observatory", "video analytics 3D experience", "source-backed entertainment dapp"]
  },
  researcher: {
    name: "Researcher",
    keywords: ["AI research engine with visual analysis", "research engine for 3D evidence", "source-backed visual research hub", "GLB research assistant"]
  },
  planetary: {
    name: "Planetary",
    keywords: ["planetary research data 3D observatory", "orbital compute 3D explainer", "space science GLB presentation", "planetary visual research hub"]
  },
  mobility: {
    name: "Mobility",
    keywords: ["traffic study 2026 mainstream information", "city planning 3D visual experience", "public infrastructure 3D situation report", "mobility visual observatory"]
  },
  programmer: {
    name: "Programmer",
    keywords: ["developer 3D observatory system", "API powered 3D renderer dapp", "backend analytics for 3D dapp structure", "Supabase backend visual guide"]
  },
  "real-estate": {
    name: "Real Estate",
    keywords: ["real estate 3D house walkthrough", "housing model 3D experience", "property listing social media reel", "international real estate 3D visualization"]
  },
  gamer: {
    name: "Gamer",
    keywords: ["gaming 3D environment viewer", "gamer top 10 new build visual experience", "interactive 3D game map viewer", "game world GLB presentation"]
  },
  continent: {
    name: "Continent",
    keywords: ["vacation resort 3D preview", "AI tour guide for 3D places", "family travel 3D observatory", "tourist city 3D walkthrough"]
  },
  science: {
    name: "Science",
    keywords: ["climate control data 3D visual experience", "scientific visualization with 3D models", "environmental research 3D observatory", "science field study 3D model report"]
  },
  "automatic-system-presentation": {
    name: "Automatic System Presentation",
    keywords: ["automatic 3D autoplay system", "DigitalHut 3D observatory experience", "GLB renderer for live presentation", "AI guided visual experience"]
  },
  "current-market-observatory": {
    name: "Current Market Observatory",
    keywords: ["current market video observatory", "stock market visual analysis 3D", "top volume stock video research hub", "TradingView market video proof"]
  },
  "what-am-i-watching-observatory": {
    name: "What Am I Watching Observatory",
    keywords: ["what am I watching viral video explained", "viral video source map visual experience", "watch video with 3D model proof", "podcast source moment for viral video"]
  },
  "mundane-off-time-experience": {
    name: "Mundane Off-Time Experience",
    keywords: ["restaurants near me visual guide", "cheap flights visual guide", "funny videos explained with sources", "product reviews visual summary", "Uber pickup visual guide", "Wikipedia visual research hub"]
  },
  "social-media-reel-3d": {
    name: "Social Media Reel 3D",
    keywords: ["social media reel 3D visualizer", "TikTok funny video source proof", "Instagram reel visual experience", "AI 3D reel maker"]
  },
  "podcast-moment-analysis": {
    name: "Podcast Moment Analysis",
    keywords: ["podcast source moment for viral video", "Apple podcast clip with video analysis", "special guest source moment observatory", "podcast backed video research hub"]
  },
  "3d-model-view": {
    name: "3D Model View",
    keywords: ["watch video with 3D model proof", "GLB renderer for live presentation", "3D evidence map for viral topic", "3D model proof for video"]
  },
  "researcher-hub": {
    name: "Researcher Hub",
    keywords: ["AI research engine with visual analysis", "university research 3D experience", "visual evidence notes for research studies", "researcher hub 3D proof"]
  },
  "mainstream-feed": {
    name: "Mainstream Feed",
    keywords: ["mainstream feed to 3D assets", "YouTube video content radar", "viral video source map visual experience", "public observatory feed"]
  },
  "planetary-views": {
    name: "Planetary Views",
    keywords: ["planetary views and orbital compute", "space science GLB presentation", "orbital compute 3D explainer", "planetary research visual experience"]
  },
  "gamer-hub-programmer-hub": {
    name: "Gamer Hub Programmer Hub",
    keywords: ["gamer programmer renderer hubs", "developer 3D observatory system", "gaming 3D environment viewer", "API powered 3D renderer dapp"]
  }
}

function routeSlug(value = ""){
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "digitalhut"
}

function titleFromSlug(slug = ""){
  return String(slug).split("-").filter(Boolean).map((word) => word.length <= 3 ? word.toUpperCase() : `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ") || "DigitalHut"
}

function uniquePosts(...groups){
  const seen = new Set()
  return groups.flat().filter((post) => {
    const slug = post?.slug || post?.id
    if(!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  })
}

const launchRankingAnchors = {
  "lunch-local-food": {
    demandClass: "very-high local commercial intent",
    headTerms: ["restaurants near me", "food near me", "lunch near me", "best restaurants near me", "menu near me", "food open now"],
    professionalAngle: "DigitalHut adds video context, local source/backlink proof, GLB place context, and a watch route instead of another plain restaurant list.",
    firstDeployTargets: [
      "restaurants near me visual guide",
      "food near me video map",
      "lunch near me source-backed review",
      "best restaurants near me 3D preview",
      "menu near me visual observatory",
      "food open now watch route"
    ]
  },
  "rideshare-commute": {
    demandClass: "high local travel/transport intent",
    headTerms: ["Uber", "Uber near me", "rideshare", "airport Uber pickup", "ride to airport", "taxi near me"],
    professionalAngle: "DigitalHut turns ride intent into route context, pickup-source proof, safety/location notes, and a timeline instead of a dead single-action search.",
    firstDeployTargets: [
      "Uber pickup visual guide",
      "airport Uber pickup source map",
      "rideshare pickup location explained",
      "ride to airport visual route",
      "taxi near me 3D pickup view",
      "rideshare price spike explained"
    ]
  },
  "flight-travel-booking": {
    demandClass: "very-high travel purchase intent",
    headTerms: ["cheap flights", "flights", "flight status", "flight tickets", "Google Flights", "airport delays"],
    professionalAngle: "DigitalHut can connect price/search intent to video, timeline, source links, GLB airport context, and podcast/source notes before a travel decision.",
    firstDeployTargets: [
      "cheap flights visual guide",
      "flight tickets source map",
      "flight status visual observatory",
      "airport delays 3D map guide",
      "Google Flights alternative visual guide",
      "flight layover watch route"
    ]
  },
  "wiki-quick-research": {
    demandClass: "high informational intent",
    headTerms: ["Wikipedia", "wiki", "what is", "meaning of", "history of", "facts about"],
    professionalAngle: "DigitalHut makes quick research useful with source maps, timeline summaries, watch proof, and GLB context for subjects that need visual understanding.",
    firstDeployTargets: [
      "Wikipedia visual research hub",
      "wiki lookup source map",
      "what is this topic explained with sources",
      "meaning of topic visual guide",
      "history of topic timeline",
      "facts about topic 3D observatory"
    ]
  },
  "funny-mainstream-video": {
    demandClass: "very-high entertainment discovery intent",
    headTerms: ["funny videos", "viral videos", "YouTube funny videos", "TikTok funny videos", "memes", "Reddit funny videos"],
    professionalAngle: "DigitalHut makes entertainment search useful by attaching source proof, podcast/source moments, timeline context, GLB scene context, and watch/blog backlinks.",
    firstDeployTargets: [
      "funny videos explained with sources",
      "viral videos source map",
      "YouTube funny video observatory",
      "TikTok funny video source proof",
      "meme video timeline explained",
      "Reddit funny video visual guide"
    ]
  },
  "errands-review-before-buying": {
    demandClass: "very-high shopping/review intent",
    headTerms: ["product reviews", "Reddit reviews", "best deals", "grocery near me", "pharmacy near me", "should I buy"],
    professionalAngle: "DigitalHut connects review and errand searches to source links, product/place context, GLB proof, blog/watch proof, and behavior feedback.",
    firstDeployTargets: [
      "product reviews visual summary",
      "Reddit reviews source map",
      "best deals near me visual guide",
      "grocery near me source proof",
      "pharmacy near me visual guide",
      "should I buy this product video proof"
    ]
  }
}

function buildCompareContrastRefinement({metrics, proof, product}){
  const glbToPageRatio = metrics.pageViews ? Number((metrics.glbPreviewPlays / metrics.pageViews).toFixed(2)) : 0
  const blogToPageRatio = metrics.pageViews ? Number((metrics.blogViews / metrics.pageViews).toFixed(2)) : 0
  const podcastToGlbRatio = metrics.glbPreviewPlays ? Number((metrics.podcastInterrupts / metrics.glbPreviewPlays).toFixed(2)) : 0
  const readyCount = Object.values(product).filter(Boolean).length
  const readyTotal = Object.keys(product).length
  const actions = [
    {
      id: "promote-glb-render-proof",
      lane: "GLB renderer",
      signal: `${metrics.glbPreviewPlays} GLB plays / ${metrics.pageViews} page views`,
      reading: glbToPageRatio >= .2 ? "GLB proof is the strongest current engagement signal." : "GLB proof needs clearer call-to-action placement.",
      action: "Promote 3D Model View proof in watch pages, blog intros, and category snippets before adding more generic copy.",
      nextMetric: "GLB preview plays, source clicks, 3D Model View collapse/open rate"
    },
    {
      id: "repair-search-zero",
      lane: "YouTube/category search",
      signal: `${metrics.searchInteractions} recorded search interactions`,
      reading: metrics.searchInteractions === 0 ? "Search is not yet proving user intent." : "Search is contributing to topic discovery.",
      action: "Move category lane dropdown and quick panel wording toward obvious search intent: next episode stays in lane, search creates radar, market clicks route to market view.",
      nextMetric: "search interactions, quick panel clicks, same-category next episode plays"
    },
    {
      id: "prove-platform-cadence",
      lane: "Platform timing",
      signal: `${metrics.autoplayStarts} autoplay starts / ${metrics.pageViews} page views`,
      reading: product.platformCadenceRail ? "The live observatory now exposes queue, proof, analyzer, timing, and market cadence in the category-locked panel." : "Platform timing still needs a visible queue/proof/analyzer state.",
      action: "Use the cadence rail to measure whether visitors understand the YouTube-style queue, same-category rotation, proof routes, and market/podcast routing before adding more pages.",
      nextMetric: "platform cadence reads, episode preview starts, proof route opens, same-category next episode plays"
    },
    {
      id: "expand-podcast-interrupt-proof",
      lane: "Podcast moments",
      signal: `${metrics.podcastInterrupts} podcast interrupts / ${metrics.glbPreviewPlays} GLB plays`,
      reading: podcastToGlbRatio < .08 ? "Podcast feature is underused compared with GLB interaction." : "Podcast interruptions are starting to prove the special guest lane.",
      action: "Keep podcast as a click-to-interrupt moment with clearer speaker/source panel and return-to-YouTube state.",
      nextMetric: "podcast interrupts, podcast resume clicks, source page opens"
    },
    {
      id: "activate-market-entry",
      lane: "Current Market",
      signal: `${metrics.marketOpens} market opens`,
      reading: metrics.marketOpens === 0 ? "Market view needs stronger entry from regular feed." : "Market feed is getting direct interest.",
      action: "Keep Market in the regular feed, but make the top 3 bullish/bearish options a compact teaser that routes to the full market view.",
      nextMetric: "market opens, ticker searches, TradingView panel opens"
    },
    {
      id: "tighten-blog-watch-chain",
      lane: "SEO proof",
      signal: `${proof.blogProofPosts} proof posts / ${proof.watchProofRoutes} watch URLs / ${proof.sitemapUrls} sitemap URLs`,
      reading: blogToPageRatio < .1 ? "Blog proof exists, but needs more movement from live experience to proof routes." : "Blog proof is starting to support page behavior.",
      action: "Interlink standby, insights, blog, watch proof, and category pages so the crawler sees a complete DigitalHut observatory evidence loop.",
      nextMetric: "blog views, watch route views, category route views, sitemap indexed URL count"
    },
    {
      id: "balance-vacant-gap-keywords",
      lane: "FireCuda keyword tiering",
      signal: "Scenario input: exotic environments cool monthly while messy visual content, filters, reels, and quick transformations need more first-page capture.",
      reading: "The map should not delete exotic environments; it should move them into second-place backlink defense while promoting broader visual-content searches into the featured lane.",
      action: "Use FireCuda overseer groups to separate main-featured visual content, second-place exotic environment backlinks, developer/research trust, and market/local business conversion lanes.",
      nextMetric: "search intent chips, blog/watch route opens, backlink source opens, GLB source clicks by keyword group"
    },
    {
      id: "prepare-viral-first-source-packet",
      lane: "New viral video first-source feed",
      signal: "Scenario input: a fresh viral video needs DigitalHut ready across analytics, GLB proof, podcast/source moment, backlinks, and crawlable proof without changing the live UI.",
      reading: "The front-end stays locked. Backend SEO and analytics should be ready to classify the topic, capture source behavior, connect GLB/podcast proof, and decide whether the viral lane deserves a public proof route.",
      action: "Stage the viral first-source keyword packet, Supabase event names, source/backlink targets, Google media checks, and compare/refine gate before any visible product change.",
      nextMetric: "viral source route opens, viral GLB proof plays, viral podcast source starts, watch route opens, backlink opens, search intent chips"
    },
    {
      id: "deploy-stable-batch",
      lane: "Vercel/GitHub",
      signal: readyCount === readyTotal ? `${readyCount}/${readyTotal} product markers ready` : `${readyCount}/${readyTotal} product markers ready`,
      reading: "Local code is ahead of production until the stable batch deploys.",
      action: "Deploy only after the GLB collapse, podcast click, standby proof page, and refinement board are in the same stable build.",
      nextMetric: "production page views, GLB plays, podcast interrupts, standby route views"
    }
  ]
  return {
    generatedAt,
    ratios: {
      glbToPageRatio,
      blogToPageRatio,
      podcastToGlbRatio
    },
    actions
  }
}

function buildOverseerCycle({metrics, proof, product, refinement}){
  const readyCount = Object.values(product).filter(Boolean).length
  const readyTotal = Object.keys(product).length
  const signals = {
    productReadiness: `${readyCount}/${readyTotal}`,
    pageViews: metrics.pageViews,
    uniqueVisitors: metrics.uniqueVisitors,
    searchInteractions: metrics.searchInteractions,
    autoplayStarts: metrics.autoplayStarts,
    glbPreviewPlays: metrics.glbPreviewPlays,
    podcastInterrupts: metrics.podcastInterrupts,
    marketOpens: metrics.marketOpens,
    blogViews: metrics.blogViews,
    sitemapUrls: proof.sitemapUrls,
    watchProofRoutes: proof.watchProofRoutes,
    blogRoutes: proof.blogRoutes,
    categoryRoutes: proof.categoryRoutes
  }
  const conditions = [
    {
      id: "search-intent-gap",
      active: metrics.searchInteractions === 0,
      severity: "high",
      lane: "YouTube category and search",
      reason: "Search has not proven active user intent yet.",
      nextMove: "Make category switching and next-episode controls read as the main content radar, then map the first real searches back into FireCuda."
    },
    {
      id: "market-entry-gap",
      active: metrics.marketOpens === 0,
      severity: "high",
      lane: "Current Market",
      reason: "Market view is built but not earning opens yet.",
      nextMove: "Keep the regular-feed market teaser compact, but route ticker curiosity into the Current Market panel and watch proof routes."
    },
    {
      id: "podcast-proof-gap",
      active: metrics.podcastInterrupts < 5,
      severity: "medium",
      lane: "Podcast moments",
      reason: "Podcast interrupts are now functional but still need more measured use.",
      nextMove: "Track podcast interrupt, resume, source, and fallback clip events before adding more podcast UI."
    },
    {
      id: "blog-proof-gap",
      active: refinement.ratios.blogToPageRatio < .1,
      severity: "medium",
      lane: "Blog and watch proof",
      reason: "Blog proof exists but should receive more traffic from the live observatory.",
      nextMove: "Add tighter links from episode controls, category lanes, and watch routes into the ranked proof blog pages."
    },
    {
      id: "glb-strength",
      active: refinement.ratios.glbToPageRatio >= .25,
      severity: "winner",
      lane: "GLB renderer",
      reason: "GLB plays are the strongest last-known engagement signal.",
      nextMove: "Use GLB proof as the lead credibility hook in category snippets, watch pages, and sponsor stack reads."
    }
  ]
  const activeConditions = conditions.filter((item) => item.active)
  const priority = activeConditions.find((item) => item.severity === "high")
    || activeConditions.find((item) => item.severity === "medium")
    || activeConditions[0]
    || conditions[conditions.length - 1]
  const stackReads = [
    {
      layer: "FireCuda",
      read: `Queue "${priority.lane}" as the next master-list movement while preserving GLB as the credibility winner.`,
      proof: "keyword map, human roles, international side markets, backlink targets"
    },
    {
      layer: "Supabase",
      read: "Capture behavior before rewriting: search, autoplay, GLB, podcast, market, blog/watch, source, and wallet events.",
      proof: "event coverage and human-role analytics"
    },
    {
      layer: "Google Cloud",
      read: "Keep YouTube/media intelligence, Speech/TTS expansion, and fallback readiness visible so the dapp feels developer-grade.",
      proof: "media analysis packets, quota-safe fallbacks, cloud backup readiness"
    },
    {
      layer: "Vercel",
      read: readyCount === readyTotal ? "Stable product markers are deployable as a batch." : "Hold deploy until product markers are complete.",
      proof: "production route, status JSON, sitemap, watch/blog/category pages"
    },
    {
      layer: "Compare & Contrast",
      read: "Compare the next metrics snapshot against this packet before creating another keyword batch.",
      proof: "winner signals, lag signals, next FireCuda input"
    }
  ]
  return {
    generatedAt,
    operatingStack,
    signals,
    priority,
    activeConditions,
    stackReads,
    overseerRead: `Current overseer call: ${priority.lane}. ${priority.reason} Next move: ${priority.nextMove}`
  }
}

function buildOperatorPerspective({metrics, proof, product, refinement}){
  const readyCount = Object.values(product).filter(Boolean).length
  const readyTotal = Object.keys(product).length
  const glbRatio = refinement.ratios.glbToPageRatio
  const blogRatio = refinement.ratios.blogToPageRatio
  const searchQuiet = metrics.searchInteractions === 0
  const marketQuiet = metrics.marketOpens === 0
  const systemMaxing = readyCount === readyTotal && proof.sitemapUrls >= 100 && glbRatio >= .25
  const importantMoments = [
    {
      id: "glb-proof-spike",
      condition: `${metrics.glbPreviewPlays} GLB plays`,
      meaning: glbRatio >= .25 ? "Visitors are noticing the 3D proof layer more than the written proof layer." : "3D proof is present but needs stronger placement.",
      jumpAction: "When GLB plays rise, promote 3D Model View language into watch pages, category cards, and blog intros."
    },
    {
      id: "search-silence",
      condition: `${metrics.searchInteractions} searches`,
      meaning: searchQuiet ? "Visitors may be watching without understanding search is a control surface." : "Search is starting to show active intent.",
      jumpAction: searchQuiet ? "Clarify the category/search control and quick panels before adding more content." : "Map search phrases into the next master keyword list."
    },
    {
      id: "market-silence",
      condition: `${metrics.marketOpens} market opens`,
      meaning: marketQuiet ? "Market is not yet visible enough from the regular entertainment feed." : "Market view is proving a separate research lane.",
      jumpAction: marketQuiet ? "Keep market teaser compact but more obvious: top 3 bullish/bearish options route to Current Market." : "Expand market watch proof and company-specific keyword lanes."
    },
    {
      id: "seo-proof-depth",
      condition: `${proof.sitemapUrls} sitemap URLs`,
      meaning: proof.sitemapUrls >= 100 ? "The public SEO proof structure is deep enough for measured refinement." : "The proof structure still needs more crawlable routes.",
      jumpAction: "Compare route activity against the master list before creating the next batch of pages."
    }
  ]
  return {
    generatedAt,
    visitorPerspective: glbRatio >= .25
      ? "Visitors are likely seeing DigitalHut as a 3D-first observatory experience with SEO proof underneath."
      : "Visitors are likely seeing a broad observatory system, but the strongest useful action still needs to be made more obvious.",
    improveNow: [
      searchQuiet ? "Make search/category controls feel like the main content radar instead of a side option." : "Feed successful search terms into the master list.",
      marketQuiet ? "Make Current Market entry more visible without letting it cover the main analytics." : "Create market-specific proof routes from active tickers.",
      blogRatio < .1 ? "Push more live-view traffic into watch proof and blog proof pages." : "Promote best-performing proof articles."
    ],
    waitState: systemMaxing
      ? "Wait: local product markers, sitemap depth, and GLB engagement are already strong. Let the deployed system collect fresh page/search/podcast/market data before rewriting the master list again."
      : "Keep refining: the system still needs stronger measured signals before calling the current loop maxed out.",
    importantMoments
  }
}

function buildReadyAlerts({metrics, proof, product, refinement, viralPacket = null}){
  const readyCount = Object.values(product).filter(Boolean).length
  const readyTotal = Object.keys(product).length
  const alerts = [
    {
      id: "frontend-locked",
      level: "ready",
      lane: "Website Surface",
      trigger: "User rule: no visual changes unless live data requires it.",
      read: "The observatory UI is locked for this cycle. Backend SEO analytics can move without adding new panels or changing the live visual surface.",
      nextAction: "Only propose a front-end change when client behavior, lag, or a missing implemented system proves it is needed."
    },
    {
      id: "viral-first-source-ready",
      level: "ready",
      lane: "New Viral Video",
      trigger: viralFirstSourceSystem.scenario,
      read: "FireCuda keywords, Supabase event names, Google media checks, GLB proof hooks, podcast/source hooks, and compare/refine gates are staged as a backend packet.",
      nextAction: "When a viral topic is selected, classify the topic, attach the first-source route, and measure watch/source/GLB/podcast/backlink movement before public expansion."
    },
    ...(viralPacket?.readyAlert ? [{
      ...viralPacket.readyAlert,
      trigger: `${viralPacket.input?.topic || "viral source packet"} / ${viralPacket.input?.platform || "source"} / ${viralPacket.input?.category || "category"}`,
      read: `${viralPacket.readyAlert.read} Latest packet: ${viralPacket.slug || "digitalhut-viral-source"}.`,
      nextAction: viralPacket.readyAlert.nextAction
    }] : []),
    {
      id: "buried-treasure-niche-ready",
      level: "ready",
      lane: "Claimable Niche",
      trigger: buriedTreasureNicheMap.claim,
      read: "DigitalHut has a backend-ready niche map for the what-am-I-watching entertainment observatory lane, with long-tail clusters, proof signals, and expansion gates.",
      nextAction: buriedTreasureNicheMap.nextMove
    },
    {
      id: "mundane-off-time-experience-ready",
      level: "ready",
      lane: "Mundane Off-Time Experience",
      trigger: mundaneOffTimeExperienceMap.claim,
      read: "DigitalHut now has a backend-ready map for ordinary off-time searches: lunch, rideshare, flight booking, wiki lookup, funny clips, errands, and review-before-buying behavior.",
      nextAction: mundaneOffTimeExperienceMap.nextMove
    },
    {
      id: "codex-oversight-ready",
      level: "ready",
      lane: "Codex Oversight",
      trigger: codexOversightCapabilities.role,
      read: codexOversightCapabilities.currentOversightRead,
      nextAction: codexOversightCapabilities.nextOwnerVisibleUpdate
    },
    {
      id: "glb-proof-winner",
      level: refinement.ratios.glbToPageRatio >= .25 ? "ready" : "watch",
      lane: "GLB Renderer",
      trigger: `${metrics.glbPreviewPlays} GLB plays / ${metrics.pageViews} page views`,
      read: refinement.ratios.glbToPageRatio >= .25 ? "GLB remains the strongest proven engagement signal." : "GLB is useful but needs stronger measured engagement before it carries another SEO lane.",
      nextAction: "Use GLB as proof attached to the chosen topic, not as generic filler."
    },
    {
      id: "search-intent-watch",
      level: metrics.searchInteractions === 0 ? "watch" : "ready",
      lane: "Search Intent",
      trigger: `${metrics.searchInteractions} search interactions`,
      read: metrics.searchInteractions === 0 ? "Search is still quiet, so keyword movement should be staged carefully instead of assumed." : "Search behavior is ready to feed the master keyword list.",
      nextAction: metrics.searchInteractions === 0 ? "Let category, source, quick-panel, and watch-route signals help validate intent." : "Promote proven search phrases into FireCuda and proof routes."
    },
    {
      id: "proof-depth-ready",
      level: proof.sitemapUrls >= 100 ? "ready" : "watch",
      lane: "SEO Proof",
      trigger: `${proof.sitemapUrls} sitemap URLs / ${proof.blogProofPosts} proof posts / ${proof.watchProofRoutes} watch routes`,
      read: proof.sitemapUrls >= 100 ? "The crawlable proof layer is deep enough for compare-and-contrast refinement." : "The crawlable proof layer still needs more route depth before a major SEO push.",
      nextAction: "Compare behavior against proof depth before adding another visible content batch."
    },
    {
      id: "product-marker-gate",
      level: readyCount === readyTotal ? "ready" : "watch",
      lane: "Deploy Gate",
      trigger: `${readyCount}/${readyTotal} product markers ready`,
      read: readyCount === readyTotal ? "Stable backend/product markers can support a meaningful deploy batch." : "Hold deploy until incomplete product markers are resolved or intentionally deferred.",
      nextAction: "Deploy only after a stable batch, not for small backend bookkeeping."
    }
  ]
  return {
    generatedAt,
    summary: `${alerts.filter((item) => item.level === "ready").length} ready alerts / ${alerts.length} total system capability alerts`,
    alerts
  }
}

function buildSystemCapabilities({status, product, seoProof, readyAlerts, latestViralSourcePacket, overseerCycle, compareContrastRefinement}){
  const claimLanePosts = [...(status?.seoProof?.claimLanePosts || [])]
  return {
    generatedAt,
    mode: "DigitalHut System Rendered Capabilities",
    frontendLock: "Locked: no visible website changes unless live client behavior or an overdue system flaw proves the interface needs it.",
    operatingStack,
    capabilityCounts: {
      productReady: Object.values(product).filter(Boolean).length,
      productTotal: Object.keys(product).length,
      sitemapUrls: seoProof.sitemapUrls,
      blogProofPosts: seoProof.blogProofPosts,
      watchProofRoutes: seoProof.watchProofRoutes,
      categoryRoutes: seoProof.categoryRoutes,
      systemCapabilityAlerts: readyAlerts.alerts.length,
      readyCapabilityAlerts: readyAlerts.alerts.filter((item) => item.level === "ready").length,
      refinementActions: compareContrastRefinement.actions.length
    },
    lastKnownMetrics,
    product: status.product,
    seoProof,
    claimLaneSummary: {
      category: "What Am I Watching Observatory",
      proofPages: claimLanePosts,
      proofPageCount: claimLanePosts.length,
      route: "/category/what-am-i-watching-observatory"
    },
    readyAlerts,
    buriedTreasureNicheMap,
    mundaneOffTimeExperienceMap,
    codexOversightCapabilities,
    latestViralSourcePacket,
    stackReads: overseerCycle.stackReads,
    activeConditions: overseerCycle.activeConditions,
    compareContrastActions: compareContrastRefinement.actions,
    nextSystemMove: overseerCycle.overseerRead
  }
}

function productCount(dimensions = {}){
  return Object.values(dimensions).reduce((total, values) => total * Math.max(1, Array.isArray(values) ? values.length : 0), 1)
}

function dimensionCounts(dimensions = {}){
  return Object.fromEntries(Object.entries(dimensions).map(([key, values]) => [key, Array.isArray(values) ? values.length : 0]))
}

function sampleKeywordSet(cluster){
  const dimensions = cluster.variationDimensions || {}
  const first = (key, index = 0) => dimensions[key]?.[index] || ""
  return [
    `${first("modifiers")} ${first("intents")} ${first("geoScopes") || first("topicScopes") || first("platforms")} ${first("formats")}`.replace(/\s+/g, " ").trim(),
    `${first("intents", 1)} ${first("contexts", 1)} ${first("formats", 1)} ${first("proofAngles", 1)}`.replace(/\s+/g, " ").trim(),
    `${first("platforms", 1) || first("geoScopes", 1) || first("topicScopes", 1)} ${first("intents", 2)} ${first("modifiers", 2)} ${first("formats", 2)}`.replace(/\s+/g, " ").trim(),
    `${first("intents", 3)} ${first("contexts", 3)} ${first("modifiers", 3)} ${first("proofAngles", 3)} ${first("formats", 3)}`.replace(/\s+/g, " ").trim(),
    ...(cluster.keywords || []).slice(0, 3)
  ].filter(Boolean)
}

function proofSlugForCluster(clusterId){
  return clusterId === "lunch-local-food" ? "looking-for-lunch-visual-observatory"
    : clusterId === "rideshare-commute" ? "calling-an-uber-visual-trip-guide"
      : clusterId === "flight-travel-booking" ? "booking-flight-ticket-visual-guide"
        : clusterId === "wiki-quick-research" ? "wiki-lookup-visual-research-hub"
          : clusterId === "funny-mainstream-video" ? "funny-mainstream-video-explained"
            : "search-intent-radar-visual-experience"
}

function candidateKeywordQueue(cluster, limit = 30){
  const dimensions = cluster.variationDimensions || {}
  const intents = dimensions.intents || []
  const contexts = dimensions.contexts || [""]
  const modifiers = dimensions.modifiers || [""]
  const formats = dimensions.formats || [""]
  const proofAngles = dimensions.proofAngles || [""]
  const scopes = dimensions.geoScopes || dimensions.topicScopes || dimensions.platforms || [""]
  const candidates = []
  for(let index = 0; index < limit; index += 1){
    const intent = intents[index % intents.length] || cluster.keywords?.[index % (cluster.keywords?.length || 1)] || cluster.lane
    const context = contexts[(index + Math.floor(index / 2)) % contexts.length] || ""
    const modifier = modifiers[(index + 2) % modifiers.length] || ""
    const format = formats[(index + 3) % formats.length] || ""
    const proofAngle = proofAngles[(index + 4) % proofAngles.length] || ""
    const scope = scopes[(index + 5) % scopes.length] || ""
    const keyword = `${modifier} ${intent} ${scope} ${context} ${format}`.replace(/\s+/g, " ").trim()
    candidates.push({
      keyword,
      clusterId: cluster.id,
      lane: cluster.lane,
      stage: index < 5 ? "proof-route-seed" : index < 15 ? "supabase-watch-candidate" : "firecuda-hold-candidate",
      proofAngle,
      measurementSignals: cluster.proofSignal.split("+").map((item) => item.trim()),
      routeTarget: cluster.proofRoutes?.watch || `/watch/${proofSlugForCluster(cluster.id)}`,
      backlinkIntent: `${proofAngle || "source proof"} for ${intent}`
    })
  }
  return candidates
}

function candidateSignalScore(candidate, metrics = lastKnownMetrics){
  const signalValues = candidate.measurementSignals.map((signal) => {
    const lower = signal.toLowerCase()
    if(lower.includes("search")) return {signal, value: metrics.searchInteractions, metric: "searchInteractions"}
    if(lower.includes("quick panel")) return {signal, value: 0, metric: "quickPanelSelectsNotYetSeparated"}
    if(lower.includes("timeline")) return {signal, value: 0, metric: "timelineReadsNotYetSeparated"}
    if(lower.includes("backlink") || lower.includes("source route") || lower.includes("source open")) return {signal, value: 0, metric: "sourceBacklinkOpensNotYetSeparated"}
    if(lower.includes("watch route")) return {signal, value: 0, metric: "watchRouteOpensNotYetSeparated"}
    if(lower.includes("glb")) return {signal, value: metrics.glbPreviewPlays, metric: "glbPreviewPlays"}
    if(lower.includes("blog")) return {signal, value: metrics.blogViews, metric: "blogViews"}
    if(lower.includes("autoplay")) return {signal, value: metrics.autoplayStarts, metric: "autoplayStarts"}
    if(lower.includes("podcast")) return {signal, value: metrics.podcastInterrupts, metric: "podcastInterrupts"}
    if(lower.includes("market")) return {signal, value: metrics.marketOpens, metric: "marketOpens"}
    return {signal, value: 0, metric: "unmapped"}
  })
  const provenSignals = signalValues.filter((item) => Number(item.value || 0) > 0)
  return {
    score: provenSignals.length,
    signalValues,
    provenSignals: provenSignals.map((item) => item.signal)
  }
}

function promotionStageForCandidate(candidate, signalScore){
  if(candidate.stage === "proof-route-seed" && signalScore.score >= 2) return "promote-next-proof"
  if(candidate.stage === "proof-route-seed" && signalScore.score === 1) return "route-staged-watch"
  if(candidate.stage === "proof-route-seed") return "route-staged-needs-intent"
  if(candidate.stage === "supabase-watch-candidate" && signalScore.score >= 1) return "supabase-watch-priority"
  if(candidate.stage === "supabase-watch-candidate") return "supabase-watch-wait"
  return "firecuda-hold"
}

function buildCandidatePromotionBoard(candidates, metrics = lastKnownMetrics){
  const evaluated = candidates.map((candidate) => {
    const signalScore = candidateSignalScore(candidate, metrics)
    return {
      ...candidate,
      signalScore: signalScore.score,
      provenSignals: signalScore.provenSignals,
      signalValues: signalScore.signalValues,
      promotionStage: promotionStageForCandidate(candidate, signalScore)
    }
  })
  const countsByStage = evaluated.reduce((counts, item) => {
    counts[item.promotionStage] = (counts[item.promotionStage] || 0) + 1
    return counts
  }, {})
  const byCluster = Object.values(evaluated.reduce((clusters, item) => {
    clusters[item.clusterId] ||= {
      clusterId: item.clusterId,
      lane: item.lane,
      total: 0,
      promoteNextProof: 0,
      routeStagedWatch: 0,
      needsIntent: 0,
      supabaseWatch: 0,
      hold: 0,
      topCandidates: []
    }
    const cluster = clusters[item.clusterId]
    cluster.total += 1
    if(item.promotionStage === "promote-next-proof") cluster.promoteNextProof += 1
    if(item.promotionStage === "route-staged-watch") cluster.routeStagedWatch += 1
    if(item.promotionStage === "route-staged-needs-intent") cluster.needsIntent += 1
    if(item.promotionStage.startsWith("supabase-watch")) cluster.supabaseWatch += 1
    if(item.promotionStage === "firecuda-hold") cluster.hold += 1
    if(cluster.topCandidates.length < 3 && item.signalScore > 0) {
      cluster.topCandidates.push({
        keyword: item.keyword,
        promotionStage: item.promotionStage,
        signalScore: item.signalScore,
        provenSignals: item.provenSignals,
        routeTarget: item.routeTarget
      })
    }
    return clusters
  }, {}))
  const topCandidates = evaluated
    .filter((item) => item.signalScore > 0)
    .sort((a, b) => b.signalScore - a.signalScore || a.keyword.localeCompare(b.keyword))
    .slice(0, 12)
    .map((item) => ({
      keyword: item.keyword,
      lane: item.lane,
      promotionStage: item.promotionStage,
      signalScore: item.signalScore,
      provenSignals: item.provenSignals,
      routeTarget: item.routeTarget
    }))
  return {
    generatedAt,
    countsByStage,
    byCluster,
    topCandidates,
    read: topCandidates.length
      ? "Promote only candidates with proven behavior signals; hold broad FireCuda variations until search/source/watch events separate them."
      : "No queued candidates have behavior proof yet. Hold public expansion and wait for search, source, watch, GLB, podcast, or blog movement.",
    missingSeparatedMetrics: [
      "quick_panel_select by keyword",
      "watch_route_open by keyword",
      "backlink_source_open by keyword",
      "timeline_read by keyword",
      "category_lane_select by keyword"
    ]
  }
}

const freshSeoClusterDumpSeeds = [
  {
    id: "fresh-local-decision-loop",
    lane: "Everyday Local Decisions",
    intent: "normal people choosing lunch, errands, stores, repairs, local services, or quick family plans",
    keywords: [
      "best lunch near me visual source map",
      "grocery deal visual observatory",
      "local repair quote video proof",
      "family weekend plan source-backed guide",
      "nearby store review timeline"
    ],
    proofTargets: ["/watch/looking-for-lunch-visual-observatory", "/blog/grocery-shopping-3d-experience", "/category/mundane-off-time-experience"],
    requiredSignals: ["search_run", "backlink_source_open", "watch_route_open"]
  },
  {
    id: "fresh-viral-first-source-loop",
    lane: "Viral First-Source Entertainment",
    intent: "new video, reel, clip, or topic appears and DigitalHut can become a source-backed first observer",
    keywords: [
      "new viral video source map",
      "what is this viral clip about",
      "funny video explained with backlinks",
      "trending reel visual timeline",
      "first source viral video observatory"
    ],
    proofTargets: ["/watch/funny-mainstream-video-explained", "/blog/funny-mainstream-video-explained", "/category/what-am-i-watching-observatory"],
    requiredSignals: ["autoplay_start", "podcast_interrupt", "proof_route_open"]
  },
  {
    id: "fresh-research-developer-loop",
    lane: "Research Developer Proof",
    intent: "developer, researcher, student, or analyst needs a sourced visual read instead of a loose summary",
    keywords: [
      "developer dapp analytics proof",
      "research topic 3d visual source map",
      "AI video analysis timeline for researchers",
      "backend analytics observatory proof",
      "programmer research hub with source links"
    ],
    proofTargets: ["/watch/wiki-lookup-visual-research-hub", "/blog/wiki-lookup-visual-research-hub", "/category/system-presentation-proof"],
    requiredSignals: ["blog_view", "source_route_open", "search_intent_chip_select"]
  },
  {
    id: "fresh-market-company-loop",
    lane: "Market Company Story",
    intent: "market user searches company, ticker, video, podcast, and 3D context together",
    keywords: [
      "stock video analytics with sources",
      "company news 3d market observatory",
      "top volume stock visual research",
      "market podcast company source map",
      "ticker search video timeline"
    ],
    proofTargets: ["/market", "/watch/current-market-video-observatory", "/blog/current-market-video-observatory"],
    requiredSignals: ["market_view_open", "ticker_search", "glb_preview_play"]
  },
  {
    id: "fresh-creator-3d-podcast-loop",
    lane: "Creator 3D Podcast Authority",
    intent: "creator or viewer wants video, 3D model, and podcast/source moment to explain the same topic",
    keywords: [
      "3d model video podcast observatory",
      "creator reel source-backed 3d preview",
      "podcast speaker moment video analytics",
      "GLB model view for video research",
      "interactive visual experience with podcast proof"
    ],
    proofTargets: ["/watch/search-intent-radar-visual-experience", "/blog/search-intent-radar-visual-experience", "/category/3d-visual-experience"],
    requiredSignals: ["glb_preview_play", "podcast_source_open", "search_run"]
  }
]

function buildFreshClusterDumpPacket({seoMasterListPacket, metricFreshnessPacket} = {}){
  const staleMetrics = metricFreshnessPacket?.stale !== false
  const clusters = freshSeoClusterDumpSeeds.map((cluster, index) => ({
    ...cluster,
    priority: index + 1,
    status: staleMetrics ? "staged-waiting-fresh-statistics" : "ready-for-compare-refine",
    fireCudaAction: staleMetrics
      ? "dump into FireCuda staging and hold public promotion until live evidence refreshes"
      : "compare against refreshed Supabase behavior and promote only winners",
    routeAction: cluster.proofTargets.map((route) => ({
      route,
      action: staleMetrics ? "hold-receipt-pending" : "compare-for-promotion"
    }))
  }))
  return {
    generatedAt,
    mode: "DigitalHut Fresh SEO Cluster Dump",
    status: staleMetrics ? "fresh-clusters-staged-statistics-stale" : "fresh-clusters-ready-for-refinement",
    purpose: "Double the backend update quality by staging fresh cluster universes while clearing repeated metric reads into a stale-read hold.",
    frontendLock: "No UI change. This is FireCuda, Supabase, Google Cloud, Vercel, and compare/refine backend routing only.",
    metricFreshnessStatus: metricFreshnessPacket?.status || "unknown",
    recentReadAction: staleMetrics
      ? "Clear repeated 24-hour statistics from promotion decisions; keep them visible only as last-known context."
      : "Use refreshed statistics for promotion, rewrite, and hold decisions.",
    clusterCount: clusters.length,
    keywordSeedCount: clusters.reduce((total, cluster) => total + cluster.keywords.length, 0),
    proofTargetCount: clusters.reduce((total, cluster) => total + cluster.proofTargets.length, 0),
    clusters,
    nextSystemMove: staleMetrics
      ? "Run standby with fresh clusters staged, then wait for live Supabase/Vercel/Search Console evidence before claiming changed stats."
      : "Promote or rewrite clusters based on refreshed behavior."
  }
}

function freshClusterDumpMarkdown(packet){
  return `# DigitalHut Fresh SEO Cluster Dump

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Frontend lock: ${packet.frontendLock}

Metric freshness: ${packet.metricFreshnessStatus}

Recent read action: ${packet.recentReadAction}

Clusters: ${packet.clusterCount}

Keyword seeds: ${packet.keywordSeedCount}

Proof targets: ${packet.proofTargetCount}

| Priority | Cluster | Status | Required Signals |
| ---: | --- | --- | --- |
${packet.clusters.map((cluster) => `| ${cluster.priority} | ${cluster.lane} | ${cluster.status} | ${cluster.requiredSignals.join(" + ")} |`).join("\n")}

## Cluster Seeds

${packet.clusters.map((cluster) => `### ${cluster.lane}

Intent: ${cluster.intent}

FireCuda action: ${cluster.fireCudaAction}

Keywords:
${cluster.keywords.map((keyword) => `- ${keyword}`).join("\n")}

Proof targets:
${cluster.proofTargets.map((route) => `- ${route}`).join("\n")}`).join("\n\n")}

Next system move: ${packet.nextSystemMove}
`
}

function metricFreshnessMarkdown(packet){
  return `# DigitalHut Metric Freshness Gate

Generated: ${packet.generatedAt}

Status: ${packet.status}

Captured at: ${packet.capturedAt}

Age hours: ${packet.ageHours ?? "unknown"}

Source: ${packet.source}

Live refresh status: ${packet.liveRefreshStatus}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

Required refresh sources:

${packet.requiredRefreshSources.map((source) => `- ${source}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildWebsiteLanguageImpactPacket({seoMasterListPacket, freshClusterDumpPacket, metricFreshnessPacket, deployReadinessAudit} = {}){
  const coreShift = [
    {
      from: "DigitalHut as a cool 3D/video analytics display",
      to: "DigitalHut as a useful source-backed observatory that explains what a person is watching, searching, buying, researching, or comparing"
    },
    {
      from: "broad dapp / GLB / analytics language",
      to: "normal human phrases like lunch, groceries, Uber, flights, funny videos, product reviews, developer proof, market story, and viral source map"
    },
    {
      from: "visual experience as the whole message",
      to: "video + GLB + podcast/source + backlink + watch/blog proof as one useful research presentation"
    }
  ]
  const masterClusters = (seoMasterListPacket?.clusters || []).map((cluster) => ({
    lane: cluster.lane,
    role: cluster.role,
    visibleLanguage: cluster.sampleKeywords?.slice(0, 4) || [],
    proofRoutes: cluster.proofRoutes,
    languageEffect: `This lane makes DigitalHut read like a ${cluster.role} tool instead of a generic AI page.`
  }))
  const freshClusters = (freshClusterDumpPacket?.clusters || []).map((cluster) => ({
    lane: cluster.lane,
    intent: cluster.intent,
    visibleLanguage: cluster.keywords,
    proofTargets: cluster.proofTargets,
    status: cluster.status
  }))
  return {
    generatedAt,
    mode: "DigitalHut Website Language Impact Read",
    status: "language-impact-visible-backend-staged",
    purpose: "Show how the FireCuda SEO structure is changing DigitalHut's public-facing language, route proof, and visitor meaning without forcing a UI change.",
    frontendLock: "No visual change. This read explains the language and route direction that the current SEO structure is feeding into the website.",
    metricFreshnessStatus: metricFreshnessPacket?.status || "unknown",
    deployGate: deployReadinessAudit?.status || "unknown",
    oneLineRead: "DigitalHut is moving from a showcase of moving analytics into a useful 2026 entertainment/research observatory: every topic should read as video explained with sources, GLB context, podcast/source authority, backlinks, and proof routes.",
    coreShift,
    websiteVoiceNow: [
      "Useful first, impressive second.",
      "Everyday search language before technical dapp language.",
      "Source-backed proof instead of filler motion.",
      "Video topic, 3D context, podcast/source moment, market/source panel, watch route, blog route, and backlink path should all speak about the same subject.",
      "Stale metrics are labeled stale until Supabase/Vercel/Search Console refresh them."
    ],
    visitorShouldFeel: [
      "I can understand what this video/topic is about faster than plain YouTube.",
      "The 3D and podcast panels are extra research proof, not decoration.",
      "The blog/watch pages prove this system has routes and sources behind the presentation.",
      "The category language feels like something I would actually search."
    ],
    masterClusters,
    freshClusters,
    currentPublicProofRead: {
      sitemapUrls: seoMasterListPacket?.counts?.sitemapUrls || 0,
      blogProofPosts: seoMasterListPacket?.counts?.blogProofPosts || 0,
      watchProofRoutes: seoMasterListPacket?.counts?.watchProofRoutes || 0,
      categoryRoutes: seoMasterListPacket?.counts?.categoryRoutes || 0,
      totalRankSlots: seoMasterListPacket?.counts?.totalVariationCapacity || 0
    },
    nextLanguageMove: "When metrics refresh, promote whichever language lane gets real behavior: local decisions, viral first-source, research/developer proof, market/company story, or creator 3D podcast authority."
  }
}

function websiteLanguageImpactMarkdown(packet){
  return `# DigitalHut Website Language Impact Read

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Frontend lock: ${packet.frontendLock}

Metric freshness: ${packet.metricFreshnessStatus}

Deploy gate: ${packet.deployGate}

One-line read: ${packet.oneLineRead}

## Core Language Shift

${packet.coreShift.map((shift) => `- From: ${shift.from}\n  To: ${shift.to}`).join("\n")}

## Website Voice Now

${packet.websiteVoiceNow.map((item) => `- ${item}`).join("\n")}

## What Visitors Should Feel

${packet.visitorShouldFeel.map((item) => `- ${item}`).join("\n")}

## Master SEO Language Lanes

| Lane | Role | Language Effect |
| --- | --- | --- |
${packet.masterClusters.map((cluster) => `| ${cluster.lane} | ${cluster.role} | ${cluster.languageEffect} |`).join("\n")}

## Fresh Cluster Language Dump

| Lane | Status | Example Language |
| --- | --- | --- |
${packet.freshClusters.map((cluster) => `| ${cluster.lane} | ${cluster.status} | ${cluster.visibleLanguage.slice(0, 2).join("; ")} |`).join("\n")}

## Public Proof Read

- Sitemap URLs: ${packet.currentPublicProofRead.sitemapUrls}
- Blog proof posts: ${packet.currentPublicProofRead.blogProofPosts}
- Watch proof routes: ${packet.currentPublicProofRead.watchProofRoutes}
- Category routes: ${packet.currentPublicProofRead.categoryRoutes}
- Rank slots: ${packet.currentPublicProofRead.totalRankSlots.toLocaleString("en-US")}

Next language move: ${packet.nextLanguageMove}
`
}

const rankBenchmarkCompanyTiers = {
  local: {
    tier: "small-company",
    label: "Small Company / Local Operator",
    competitors: ["local restaurants", "local repair shops", "independent creators", "small investor blogs", "local real estate agencies"],
    benchmark: "Can win fast on specific city, service, creator, or niche phrases if DigitalHut has better source proof and richer media context."
  },
  mid: {
    tier: "mid-size-company",
    label: "Mid-Size Company / Specialist Platform",
    competitors: ["Yelp", "Tripadvisor", "Angi", "Seeking Alpha", "Sketchfab creators", "Matterport service providers", "university labs"],
    benchmark: "Harder to outrank on head terms, but DigitalHut can attack compound long-tail terms that combine video, source map, GLB, podcast, and proof route language."
  },
  enterprise: {
    tier: "enterprise-company",
    label: "Enterprise Company",
    competitors: ["Google", "YouTube", "Reddit", "Wikipedia", "Yahoo Finance", "Bloomberg", "TikTok", "Instagram"],
    benchmark: "Do not fight the homepage head term first. Use DigitalHut as the source-backed observatory layer that explains what the enterprise feed is showing."
  },
  platform: {
    tier: "platform-layer",
    label: "Platform / Search Surface",
    competitors: ["Google Search", "YouTube Search", "TikTok discovery", "Reddit search", "Apple Podcasts", "TradingView"],
    benchmark: "DigitalHut should become the bridge page that connects platform content, source proof, 3D context, podcast/source authority, and measurable visitor behavior."
  }
}

function benchmarkForLane(lane = ""){
  const lower = lane.toLowerCase()
  if(/market|stock|company/.test(lower)) {
    return {
      competitorExamples: {
        small: ["independent market newsletters", "local business finance blogs"],
        mid: ["Seeking Alpha", "The Motley Fool", "TradingView authors"],
        enterprise: ["Yahoo Finance", "Bloomberg", "CNBC", "MarketWatch"],
        platform: ["Google Finance", "YouTube market search", "TradingView"]
      },
      innovationAngle: "Connect ticker search, video context, company story, GLB environment, podcast/source moment, and chart/source proof."
    }
  }
  if(/research|developer|wiki|programmer/.test(lower)) {
    return {
      competitorExamples: {
        small: ["developer blogs", "student research pages", "independent documentation sites"],
        mid: ["university labs", "Stack Overflow-style answers", "research institute pages"],
        enterprise: ["Wikipedia", "Google Scholar", "GitHub", "YouTube education"],
        platform: ["Google Search", "YouTube Search", "GitHub search"]
      },
      innovationAngle: "Turn topic lookup into a visual research proof page with source links, timeline, GLB context, and developer-readable evidence."
    }
  }
  if(/viral|funny|creator|podcast|3d/.test(lower)) {
    return {
      competitorExamples: {
        small: ["independent creators", "podcast clip blogs", "3D artist portfolios"],
        mid: ["Know Your Meme", "Sketchfab creators", "creator newsletters"],
        enterprise: ["YouTube", "TikTok", "Instagram", "Reddit", "Apple Podcasts"],
        platform: ["YouTube Search", "TikTok discovery", "Apple Podcasts", "Reddit search"]
      },
      innovationAngle: "Explain the clip or creator moment while matching it to GLB preview, podcast/source authority, backlinks, and watch/blog proof."
    }
  }
  return {
    competitorExamples: {
      small: ["local service businesses", "local review blogs", "independent guide sites"],
      mid: ["Yelp", "Tripadvisor", "Angi", "local marketplace sites"],
      enterprise: ["Google Maps", "DoorDash", "Uber", "Reddit", "YouTube"],
      platform: ["Google Search", "Google Maps", "YouTube Search", "Reddit search"]
    },
    innovationAngle: "Own the normal-person search by turning it into a source-backed visual decision guide with video, GLB context, and proof routes."
  }
}

function rankBandForPriority(priority = 1, stale = true){
  const base = 236_000_000
  const estimatedCurrent = stale ? base + (priority - 1) * 1_250_000 : Math.max(1, base - priority * 5_000_000)
  return {
    searchUniversePosition: estimatedCurrent,
    rankRead: `estimated #${estimatedCurrent.toLocaleString("en-US")} until live Search Console or SEO API proof is captured`,
    targetNextBand: priority <= 2 ? "top 1,000,000 long-tail proof band" : "top 5,000,000 long-tail proof band",
    targetLaunchBand: "top 100,000 after route indexing + behavior proof",
    targetAuthorityBand: "top 10,000 after backlinks + repeated interaction proof",
    numberOneRequirement: "indexed proof route + source backlinks + visitor behavior + same-topic video/GLB/podcast alignment"
  }
}

function buildRankFindingBenchmarkPacket({seoMasterListPacket, freshClusterDumpPacket, metricFreshnessPacket, websiteLanguageImpactPacket} = {}){
  const stale = metricFreshnessPacket?.stale !== false
  const masterRows = (seoMasterListPacket?.clusters || []).map((cluster, index) => {
    const benchmark = benchmarkForLane(cluster.lane)
    return {
      id: cluster.id,
      lane: cluster.lane,
      source: "seo-master-list",
      priority: index + 1,
      role: cluster.role,
      keywordCategory: cluster.sampleKeywords?.[0] || cluster.lane,
      benchmark,
      mediaIntake: ["watch route", "blog proof", "category lane", "source/backlink proof", "GLB or podcast support"],
      seoRanking: rankBandForPriority(index + 1, stale),
      proofRoutes: cluster.proofRoutes,
      measurementNeeded: ["Search Console query position", "Supabase route/event behavior", "backlink/source click proof"]
    }
  })
  const freshRows = (freshClusterDumpPacket?.clusters || []).map((cluster, index) => {
    const benchmark = benchmarkForLane(cluster.lane)
    return {
      id: cluster.id,
      lane: cluster.lane,
      source: "fresh-cluster-dump",
      priority: index + 1,
      role: cluster.intent,
      keywordCategory: cluster.keywords[0],
      benchmark,
      mediaIntake: cluster.requiredSignals,
      seoRanking: rankBandForPriority(index + 1, stale),
      proofRoutes: cluster.proofTargets,
      measurementNeeded: ["Search Console query position", "Supabase event receipt", "Vercel route proof", "source/backlink open"]
    }
  })
  const rows = [...freshRows, ...masterRows]
  return {
    generatedAt,
    mode: "DigitalHut Rank Finding Benchmark",
    status: stale ? "rank-benchmark-staged-waiting-live-rank-proof" : "rank-benchmark-ready-for-live-refinement",
    purpose: "Benchmark DigitalHut cluster language against small companies, mid-size companies, enterprise companies, and platform competitors while reserving live rank claims for measured Search Console/SEO API proof.",
    guardrail: "Do not claim live ranking positions from this packet alone. The #236,000,000 scale is a starting search-universe estimate until Search Console, Supabase, Vercel, or an approved SEO API fills measured position fields.",
    metricFreshnessStatus: metricFreshnessPacket?.status || "unknown",
    websiteLanguageStatus: websiteLanguageImpactPacket?.status || "unknown",
    benchmarkTiers: rankBenchmarkCompanyTiers,
    rankUniverseFloor: 236_000_000,
    rowCount: rows.length,
    rows,
    topImmediateTargets: rows.slice(0, 6).map((row) => ({
      lane: row.lane,
      keywordCategory: row.keywordCategory,
      rankRead: row.seoRanking.rankRead,
      innovationAngle: row.benchmark.innovationAngle,
      targetNextBand: row.seoRanking.targetNextBand
    })),
    nextSystemMove: stale
      ? "Keep benchmark rows staged. Refresh live metrics/rank proof before promoting any cluster as improving against competitors."
      : "Compare refreshed ranks and behavior against each competitor tier, then promote the lanes climbing fastest."
  }
}

function rankFindingBenchmarkMarkdown(packet){
  return `# DigitalHut Rank Finding Benchmark

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Metric freshness: ${packet.metricFreshnessStatus}

Website language status: ${packet.websiteLanguageStatus}

Rank universe floor: #${packet.rankUniverseFloor.toLocaleString("en-US")}

Rows: ${packet.rowCount}

## Company Benchmark Tiers

${Object.values(packet.benchmarkTiers).map((tier) => `### ${tier.label}

Competitors: ${tier.competitors.join(", ")}

Benchmark: ${tier.benchmark}`).join("\n\n")}

## Top Immediate Rank Targets

| Lane | Keyword Category | Current Rank Read | Target Band |
| --- | --- | --- | --- |
${packet.topImmediateTargets.map((row) => `| ${row.lane} | ${row.keywordCategory} | ${row.rankRead} | ${row.targetNextBand} |`).join("\n")}

## Cluster Rank Board

| Source | Lane | Small | Mid-Size | Enterprise | Platform | Innovation |
| --- | --- | --- | --- | --- | --- | --- |
${packet.rows.map((row) => `| ${row.source} | ${row.lane} | ${row.benchmark.competitorExamples.small.join("; ")} | ${row.benchmark.competitorExamples.mid.join("; ")} | ${row.benchmark.competitorExamples.enterprise.join("; ")} | ${row.benchmark.competitorExamples.platform.join("; ")} | ${row.benchmark.innovationAngle} |`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

const rankJumpGuardrails = {
  maxBlogPostsPer24Hours: 4,
  emergencyBlogCeilingPer24Hours: 5,
  maxWatchRoutePushesPer24Hours: 8,
  maxCategoryRouteChangesPer24Hours: 3,
  minimumHumanReasoningScore: 70,
  minimumProofScore: 55,
  fillerRejectScore: 35,
  publishMode: "stage-first-measure-before-publication",
  rule: "Do not flood the site. Stage keyword clusters in FireCuda/Supabase, publish only a small proof batch, normally capped at 4 blog posts per 24 hours, then wait for Search Console, Supabase, Vercel, source/backlink, and route behavior."
}

const humanReasoningSignals = [
  "near me", "what should", "should i", "best", "cheap", "open now", "source", "review", "proof", "explained", "price", "guide", "ticket", "pickup", "lunch", "grocery", "repair", "family", "developer", "research", "market", "stock", "viral", "clip", "video"
]

const fillerSignals = [
  "visual experience", "ai experience", "3d experience", "observatory experience", "digital experience", "future system", "best platform", "next generation", "cutting edge", "powerful solution"
]

function keywordHumanReasoningScore(keyword = "", lane = ""){
  const text = `${keyword} ${lane}`.toLowerCase()
  const humanHits = humanReasoningSignals.filter((signal) => text.includes(signal))
  const fillerHits = fillerSignals.filter((signal) => text.includes(signal))
  const hasSpecificNoun = /\b(lunch|grocery|uber|flight|restaurant|repair|market|stock|developer|research|podcast|video|clip|reel|source|review|ticket|pickup|company)\b/.test(text)
  const hasAction = /\b(looking|calling|booking|buy|compare|explained|guide|map|review|search|watch|open|near|proof)\b/.test(text)
  const base = 42
  const humanScore = base + humanHits.length * 8 + (hasSpecificNoun ? 14 : 0) + (hasAction ? 12 : 0) - fillerHits.length * 14
  return {
    score: Math.max(0, Math.min(100, humanScore)),
    humanHits,
    fillerHits,
    hasSpecificNoun,
    hasAction,
    verdict: fillerHits.length && humanHits.length < 2
      ? "reject-filler"
      : humanScore >= rankJumpGuardrails.minimumHumanReasoningScore
        ? "human-search-ready"
        : "stage-needs-more-human-intent"
  }
}

function proofScoreForRankRow(row = {}){
  const routes = row.proofRoutes || []
  const media = row.mediaIntake || []
  const measurements = row.measurementNeeded || []
  const routeScore = Array.isArray(routes) ? Math.min(30, routes.length * 10) : 10
  const mediaScore = Array.isArray(media) ? Math.min(30, media.length * 8) : 8
  const measurementScore = Array.isArray(measurements) ? Math.min(25, measurements.length * 7) : 7
  const innovationScore = row.benchmark?.innovationAngle ? 15 : 0
  return Math.min(100, routeScore + mediaScore + measurementScore + innovationScore)
}

function buildRankJumpAlgorithmPacket({rankFindingBenchmarkPacket, metricFreshnessPacket, freshClusterDumpPacket} = {}){
  const rows = rankFindingBenchmarkPacket?.rows || []
  const stale = metricFreshnessPacket?.stale !== false
  const scoredRows = rows.map((row) => {
    const keyword = row.keywordCategory || row.lane
    const human = keywordHumanReasoningScore(keyword, row.lane)
    const proofScore = proofScoreForRankRow(row)
    const currentPosition = row.seoRanking?.searchUniversePosition || rankFindingBenchmarkPacket?.rankUniverseFloor || 236_000_000
    const targetPosition = human.score >= 80 && proofScore >= 75 ? 100_000 : human.score >= 70 ? 1_000_000 : 5_000_000
    const jumpPotential = Math.max(0, currentPosition - targetPosition)
    const action = stale
      ? "stage-only-wait-live-proof"
      : human.verdict === "reject-filler"
        ? "eliminate-filler"
        : human.score >= rankJumpGuardrails.minimumHumanReasoningScore && proofScore >= rankJumpGuardrails.minimumProofScore
          ? "eligible-small-proof-batch"
          : "rewrite-for-human-intent"
    return {
      id: row.id,
      lane: row.lane,
      source: row.source,
      keyword,
      humanReasoningScore: human.score,
      proofScore,
      fillerHits: human.fillerHits,
      humanHits: human.humanHits,
      verdict: human.verdict,
      currentEstimatedPosition: currentPosition,
      targetPosition,
      jumpPotential,
      action,
      mediaIntake: row.mediaIntake,
      proofRoutes: row.proofRoutes,
      numberOneRequirement: row.seoRanking?.numberOneRequirement || "proof route + behavior + backlinks"
    }
  }).sort((a, b) => {
    const actionWeight = (value) => value === "eligible-small-proof-batch" ? 3 : value === "stage-only-wait-live-proof" ? 2 : value === "rewrite-for-human-intent" ? 1 : 0
    return actionWeight(b.action) - actionWeight(a.action)
      || b.humanReasoningScore - a.humanReasoningScore
      || b.proofScore - a.proofScore
      || b.jumpPotential - a.jumpPotential
  })
  const eliminated = scoredRows.filter((row) => row.action === "eliminate-filler" || row.verdict === "reject-filler")
  const rewriteQueue = scoredRows.filter((row) => row.action === "rewrite-for-human-intent")
  const eligible = scoredRows.filter((row) => row.action === "eligible-small-proof-batch")
  const staged = scoredRows.filter((row) => row.action === "stage-only-wait-live-proof")
  const blogProofBudgetRemaining = rankJumpGuardrails.maxBlogPostsPer24Hours
  const nextBlogProofBatch = (stale ? [] : eligible).slice(0, blogProofBudgetRemaining)
  return {
    generatedAt,
    mode: "DigitalHut Rank Jump SEO Mapping Algorithm",
    status: stale ? "rank-jump-staged-live-proof-needed" : "rank-jump-ready-small-batch",
    purpose: "Move DigitalHut from the #236,000,000 search-universe floor toward real rank gains by prioritizing human-useful long-tail keywords, rejecting filler, and throttling publication to avoid spam behavior.",
    rankUniverseFloor: rankFindingBenchmarkPacket?.rankUniverseFloor || 236_000_000,
    guardrails: rankJumpGuardrails,
    metricFreshnessStatus: metricFreshnessPacket?.status || "unknown",
    cloudDatabaseAlgorithm: {
      fireCuda: "holds the full keyword universe, rejected filler list, rewrite queue, and rank-jump history",
      supabase: "stores event receipts by keyword, route, search, GLB, podcast, market, backlink, and watch/blog behavior",
      googleCloud: "enriches allowed video metadata, source summaries, transcript/provided transcript reads, and media-intake packets",
      vercel: "serves only stable proof routes, public JSON packets, sitemap entries, and measured release batches",
      codexReasoning: "oversees whether keywords sound like real human searches and whether proof is strong enough to publish"
    },
    counts: {
      scoredRows: scoredRows.length,
      eligibleSmallProofBatch: eligible.length,
      stagedWaitingLiveProof: staged.length,
      rewriteForHumanIntent: rewriteQueue.length,
      eliminatedFiller: eliminated.length,
      blogProofBudgetRemaining,
      nextBlogProofBatch: nextBlogProofBatch.length,
      freshClusterCount: freshClusterDumpPacket?.clusterCount || 0
    },
    nextBlogProofBatch,
    rewriteQueue: rewriteQueue.slice(0, 10),
    eliminatedFiller: eliminated.slice(0, 10),
    stagedWaitingLiveProof: staged.slice(0, 10),
    scoredRows,
    nextSystemMove: stale
      ? `Do not publish new blog floods. Keep all rank-jump candidates staged, refresh live metrics/rank proof, then release at most ${rankJumpGuardrails.maxBlogPostsPer24Hours} blog proof posts in 24 hours.`
      : "Publish only the next small proof batch, then wait for behavior before another release."
  }
}

function rankJumpAlgorithmMarkdown(packet){
  return `# DigitalHut Rank Jump SEO Mapping Algorithm

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Rank universe floor: #${packet.rankUniverseFloor.toLocaleString("en-US")}

Metric freshness: ${packet.metricFreshnessStatus}

## Guardrails

- Max blog proof posts per 24 hours: ${packet.guardrails.maxBlogPostsPer24Hours}
- Max watch route pushes per 24 hours: ${packet.guardrails.maxWatchRoutePushesPer24Hours}
- Max category route changes per 24 hours: ${packet.guardrails.maxCategoryRouteChangesPer24Hours}
- Minimum human reasoning score: ${packet.guardrails.minimumHumanReasoningScore}
- Minimum proof score: ${packet.guardrails.minimumProofScore}
- Publish mode: ${packet.guardrails.publishMode}

Rule: ${packet.guardrails.rule}

## System Algorithm

- FireCuda: ${packet.cloudDatabaseAlgorithm.fireCuda}
- Supabase: ${packet.cloudDatabaseAlgorithm.supabase}
- Google Cloud: ${packet.cloudDatabaseAlgorithm.googleCloud}
- Vercel: ${packet.cloudDatabaseAlgorithm.vercel}
- Codex reasoning: ${packet.cloudDatabaseAlgorithm.codexReasoning}

## Counts

| Queue | Count |
| --- | ---: |
| Scored rows | ${packet.counts.scoredRows} |
| Eligible small proof batch | ${packet.counts.eligibleSmallProofBatch} |
| Staged waiting live proof | ${packet.counts.stagedWaitingLiveProof} |
| Rewrite for human intent | ${packet.counts.rewriteForHumanIntent} |
| Eliminated filler | ${packet.counts.eliminatedFiller} |
| Blog proof budget remaining | ${packet.counts.blogProofBudgetRemaining} |
| Next blog proof batch | ${packet.counts.nextBlogProofBatch} |

## Next Blog Proof Batch

${packet.nextBlogProofBatch.length
  ? packet.nextBlogProofBatch.map((row) => `- **${row.lane}**: ${row.keyword} / human ${row.humanReasoningScore} / proof ${row.proofScore} / target #${row.targetPosition.toLocaleString("en-US")}`).join("\n")
  : "- No blog proof posts released from this packet. Candidates are staged until live rank/behavior proof refreshes."}

## Rewrite Queue

${packet.rewriteQueue.length
  ? packet.rewriteQueue.map((row) => `- **${row.lane}**: ${row.keyword} / human ${row.humanReasoningScore} / proof ${row.proofScore} / action ${row.action}`).join("\n")
  : "- No rewrite rows."}

## Staged Waiting Live Proof

${packet.stagedWaitingLiveProof.map((row) => `- **${row.lane}**: ${row.keyword} / estimated #${row.currentEstimatedPosition.toLocaleString("en-US")} -> target #${row.targetPosition.toLocaleString("en-US")} / jump potential ${row.jumpPotential.toLocaleString("en-US")}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildWhiteboardSeoStructurePacket({rankJumpAlgorithmPacket, metricFreshnessPacket, freshClusterDumpPacket, rankFindingBenchmarkPacket} = {}){
  const stages = [
    {
      id: "blog-cadence",
      label: "x4 Blog / 24 Hours",
      job: "Limit public blog proof movement to four meaningful posts in a 24-hour period, with a fifth only for a clear proof emergency.",
      guardrail: "No post flood. Every blog must connect to a watch route, backlink/source path, and measurable Supabase event."
    },
    {
      id: "intertwine-backlinks",
      label: "Intertwine Backlinks",
      job: "Backlinks are not separate decoration. They must connect to the exact video topic, GLB/source proof, podcast/source moment, watch route, and category lane.",
      guardrail: "Reject backlinks that do not explain the same human intent as the keyword."
    },
    {
      id: "compare-master-list",
      label: "Compare Against Master List",
      job: "Every candidate keyword is compared against the FireCuda master list, rank universe floor, filler filter, and human reasoning score before it can move.",
      guardrail: "Do not add duplicate or generic long-tail rows just to increase volume."
    },
    {
      id: "database-confirmation",
      label: "Supabase / Google Cloud Database Confirmation",
      job: "Supabase confirms behavior; Google Cloud confirms allowed media metadata, source processing, and cloud-readiness lanes.",
      guardrail: "No fresh statistics or rank claims without a live measurement receipt."
    },
    {
      id: "firecuda-mapping",
      label: "FireCuda Mapping",
      job: "FireCuda is the staging ground for category groups, rejected filler, backlink candidates, international markets, secondary markets, and variation formulas.",
      guardrail: "FireCuda can hold millions of variations; the public site only gets measured proof batches."
    },
    {
      id: "category-rides",
      label: "Category Rides",
      job: "Each category lane rides across video, watch proof, blog proof, GLB context, podcast/source authority, backlink proof, and sitemap metadata.",
      guardrail: "A category does not publish unless the cluster has a useful visitor role and a proof route."
    },
    {
      id: "international-secondary-market",
      label: "International / Secondary Market",
      job: "Build side-market keyword variations for local language, city, country, travel, service, creator, research, and market intent.",
      guardrail: "Secondary markets stay staged until primary proof shows which human intent is real."
    },
    {
      id: "codex-reasoning",
      label: "Codex Reasoning",
      job: "Codex only performs final judgment: human realism, trend/backlink fit, compare/contrast, rank-jump readiness, and whether to publish, rewrite, or hold.",
      guardrail: "Codex does not replace the database. It oversees the database and rejects filler."
    }
  ]
  const currentRead = [
    "The whiteboard structure is now the operating map for DigitalHut SEO.",
    "Rank jumping starts from the #236,000,000 floor, but public publishing stays throttled.",
    "Fresh clusters are staged until live Supabase/Vercel/Search Console proof refreshes stale metrics.",
    "The system should create human-search keywords, not abstract filler phrases."
  ]
  return {
    generatedAt,
    mode: "DigitalHut Whiteboard SEO Structure Contract",
    status: "whiteboard-structure-locked",
    sourceImage: "C:\\Users\\Admin\\Downloads\\7362.jpg",
    purpose: "Convert the owner's whiteboard SEO structure into the backend operating contract for FireCuda, Supabase, Google Cloud, Vercel, and Codex reasoning.",
    normalBlogCap24h: rankJumpAlgorithmPacket?.guardrails?.maxBlogPostsPer24Hours || 4,
    emergencyBlogCeiling24h: rankJumpAlgorithmPacket?.guardrails?.emergencyBlogCeilingPer24Hours || 5,
    metricFreshnessStatus: metricFreshnessPacket?.status || "unknown",
    rankJumpStatus: rankJumpAlgorithmPacket?.status || "unknown",
    rankBenchmarkStatus: rankFindingBenchmarkPacket?.status || "unknown",
    freshClusterStatus: freshClusterDumpPacket?.status || "unknown",
    stages,
    currentRead,
    databaseHumanReasoningLoop: [
      "Collect real human trend, source, backlink, route, search, and media-intake signals.",
      "Compare those signals against the master list and the rank-jump benchmark.",
      "Eliminate filler long-tail keywords that only sound technical but do not match a human search.",
      "Add long-tail keywords that match real daily searches, creator behavior, research needs, market decisions, and video-source questions.",
      "Publish only a small proof batch, then measure before the next batch."
    ],
    nextSystemMove: "Use this whiteboard contract before every standby run: FireCuda map first, confirm with Supabase/Google, compare against master list, apply Codex reasoning, and publish at most four blog proof posts per 24 hours."
  }
}

function whiteboardSeoStructureMarkdown(packet){
  return `# DigitalHut Whiteboard SEO Structure Contract

Generated: ${packet.generatedAt}

Status: ${packet.status}

Source image: ${packet.sourceImage}

Purpose: ${packet.purpose}

Normal blog cap per 24h: ${packet.normalBlogCap24h}

Emergency blog ceiling per 24h: ${packet.emergencyBlogCeiling24h}

Metric freshness: ${packet.metricFreshnessStatus}

Rank jump status: ${packet.rankJumpStatus}

Rank benchmark status: ${packet.rankBenchmarkStatus}

Fresh cluster status: ${packet.freshClusterStatus}

## Current Read

${packet.currentRead.map((item) => `- ${item}`).join("\n")}

## Whiteboard Stages

| Stage | Job | Guardrail |
| --- | --- | --- |
${packet.stages.map((stage) => `| ${stage.label} | ${stage.job} | ${stage.guardrail} |`).join("\n")}

## Database Human Reasoning Loop

${packet.databaseHumanReasoningLoop.map((item) => `- ${item}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildFunctionalRankBoostClusterPushPacket({metrics = lastKnownMetrics, rankJumpAlgorithmPacket, whiteboardSeoStructurePacket, rankFindingBenchmarkPacket} = {}){
  const glbShare = metrics.pageViews ? Math.round((metrics.glbPreviewPlays / metrics.pageViews) * 1000) / 10 : 0
  const blogShare = metrics.pageViews ? Math.round((metrics.blogViews / metrics.pageViews) * 1000) / 10 : 0
  const searchQuiet = metrics.searchInteractions === 0
  const marketQuiet = metrics.marketOpens === 0
  const audienceConclusion = {
    status: "last-known-stale-but-directional",
    read: "The current audience appears visual-proof curious before it is search-panel or market-panel active.",
    evidence: [
      `${metrics.glbPreviewPlays} GLB previews against ${metrics.pageViews} page views (${glbShare}% of page views) shows the 3D proof lane is the strongest visible behavior.`,
      `${metrics.blogViews} blog views (${blogShare}% of page views) shows proof pages have some traction but need stronger route/source connection.`,
      `${metrics.searchInteractions} search interactions means the system should create clearer human-intent entry points before expecting typed search behavior.`,
      `${metrics.marketOpens} market opens means market rank clusters should stay staged until the market panel earns behavior.`,
      `${metrics.podcastInterrupts} podcast interrupts means podcast/source authority is present but still a support lane, not the lead lane.`
    ],
    audienceRequestInference: [
      "Show me useful proof, not a sales landing page.",
      "Let me inspect 3D/source context quickly.",
      "Explain what the video/topic is about without making me search manually.",
      "Give me proof routes and backlinks that make the presentation credible."
    ]
  }
  const clusters = [
    {
      id: "functional-3d-proof-over-landing-page",
      lane: "3D Proof Beats Sales Page",
      audienceNeed: "Visitors are proving they want inspectable 3D/GLB context, not just a company asking for money.",
      competitorGap: "Most small and mid-size companies have front-facing service pages, image galleries, or forms, but no live 3D proof route tied to video/source context.",
      keywords: [
        "3d model proof instead of landing page",
        "inspectable 3d visual source map",
        "business with real 3d preview proof",
        "video explained with 3d model proof"
      ],
      proofRoutes: ["/watch/search-intent-radar-visual-experience", "/blog/search-intent-radar-visual-experience", "/category/3d-visual-experience"],
      currentEstimatedRank: 236_000_000,
      nextTargetRank: 1_000_000,
      authorityTargetRank: 100_000,
      systemPush: "Lead with GLB/source proof because last-known behavior favors GLB previews."
    },
    {
      id: "functional-video-source-observatory",
      lane: "Video Source Observatory",
      audienceNeed: "Visitors need the system to explain a video/topic with sources, backlinks, and route proof before they trust the analytics.",
      competitorGap: "Most media pages embed video or summarize it, but do not combine video, source links, backlink proof, GLB context, podcast/source moments, and measured behavior.",
      keywords: [
        "video explained with source map",
        "youtube video source proof observatory",
        "what am i watching video backlinks",
        "viral video explained with proof routes"
      ],
      proofRoutes: ["/watch/funny-mainstream-video-explained", "/blog/funny-mainstream-video-explained", "/category/what-am-i-watching-observatory"],
      currentEstimatedRank: 237_250_000,
      nextTargetRank: 1_000_000,
      authorityTargetRank: 100_000,
      systemPush: "Attach every entertainment/video cluster to backlinks and watch/blog proof before public promotion."
    },
    {
      id: "functional-everyday-decision-map",
      lane: "Everyday Decision Map",
      audienceNeed: "Normal users need useful local decisions: lunch, groceries, repairs, tickets, rides, and reviews with source proof.",
      competitorGap: "Most local companies and directories show listings, reviews, or booking forms, but do not build a source-backed visual decision map.",
      keywords: [
        "best lunch near me visual source map",
        "grocery deal visual proof route",
        "local service source backed visual guide",
        "nearby store review timeline proof"
      ],
      proofRoutes: ["/watch/looking-for-lunch-visual-observatory", "/blog/grocery-shopping-3d-experience", "/category/mundane-off-time-experience"],
      currentEstimatedRank: 236_000_000,
      nextTargetRank: 1_000_000,
      authorityTargetRank: 100_000,
      systemPush: "Use everyday language first because search is quiet and typed behavior needs clearer entry points."
    },
    {
      id: "functional-developer-research-proof",
      lane: "Developer Research Proof",
      audienceNeed: "Technical visitors need evidence that the system is infrastructure-backed, not a visual demo.",
      competitorGap: "Many developer/research pages explain features, but do not show route proof, cloud readiness, source events, GLB proof, and measurement contracts together.",
      keywords: [
        "developer dapp analytics proof",
        "backend analytics observatory proof",
        "research topic 3d visual source map",
        "programmer research hub with source links"
      ],
      proofRoutes: ["/watch/wiki-lookup-visual-research-hub", "/blog/wiki-lookup-visual-research-hub", "/category/system-presentation-proof"],
      currentEstimatedRank: 238_500_000,
      nextTargetRank: 1_000_000,
      authorityTargetRank: 100_000,
      systemPush: "Use build/system proof to show DigitalHut has real infrastructure behind the media presentation."
    }
  ].map((cluster, index) => ({
    ...cluster,
    priority: index + 1,
    blogReleaseStatus: index < (whiteboardSeoStructurePacket?.normalBlogCap24h || 4) ? "within-4-per-24h-cap-staged" : "held-over-cap",
    rankJumpPotential: cluster.currentEstimatedRank - cluster.authorityTargetRank,
    requiredReceipts: [
      "Search Console query position",
      "Supabase route/event behavior",
      "backlink/source click",
      "watch/blog/category proof",
      "same-topic video/GLB/podcast alignment"
    ]
  }))
  return {
    generatedAt,
    mode: "DigitalHut Functional Rank Boost Cluster Push",
    status: "functional-rank-boost-staged-15-minute-standby-ready",
    purpose: "Stage the first reasonable cluster dumps that can boost DigitalHut where competitors have sales pages but not built observatory functionality.",
    guardrail: "No public flood. These clusters are staged into the system and respect the 4 blog posts per 24 hours whiteboard cap until live rank/behavior proof refreshes.",
    metricFreshnessStatus: "stale-live-refresh-needed",
    rankBenchmarkStatus: rankFindingBenchmarkPacket?.status || "unknown",
    rankJumpStatus: rankJumpAlgorithmPacket?.status || "unknown",
    normalBlogCap24h: whiteboardSeoStructurePacket?.normalBlogCap24h || 4,
    audienceConclusion,
    clusterCount: clusters.length,
    clusters,
    systemCombinationPush: [
      "FireCuda stores the four cluster dumps, rank targets, filler rejects, and backlink candidates.",
      "Supabase waits for route, source, GLB, podcast, search, blog, and category receipts before promotion.",
      "Google Cloud supports media/source metadata enrichment when allowed by API/source rules.",
      "Vercel serves only stable proof packets and route metadata after build/deploy proof.",
      "Codex reasoning compares the audience read against the cluster map and keeps filler out."
    ],
    nextSystemMove: "Run a 15-minute standby so the whole system refreshes around these four functionality-first rank clusters, then review live-proof blockers before any publish/deploy step."
  }
}

function functionalRankBoostClusterPushMarkdown(packet){
  return `# DigitalHut Functional Rank Boost Cluster Push

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Metric freshness: ${packet.metricFreshnessStatus}

Rank benchmark: ${packet.rankBenchmarkStatus}

Rank jump: ${packet.rankJumpStatus}

Normal blog cap per 24h: ${packet.normalBlogCap24h}

## Audience Conclusion

Status: ${packet.audienceConclusion.status}

Read: ${packet.audienceConclusion.read}

Evidence:

${packet.audienceConclusion.evidence.map((item) => `- ${item}`).join("\n")}

Audience request inference:

${packet.audienceConclusion.audienceRequestInference.map((item) => `- ${item}`).join("\n")}

## First Cluster Dumps

| Priority | Lane | Current Rank | Next Target | Authority Target | Release Status |
| ---: | --- | ---: | ---: | ---: | --- |
${packet.clusters.map((cluster) => `| ${cluster.priority} | ${cluster.lane} | #${cluster.currentEstimatedRank.toLocaleString("en-US")} | #${cluster.nextTargetRank.toLocaleString("en-US")} | #${cluster.authorityTargetRank.toLocaleString("en-US")} | ${cluster.blogReleaseStatus} |`).join("\n")}

## Cluster Detail

${packet.clusters.map((cluster) => `### ${cluster.lane}

Audience need: ${cluster.audienceNeed}

Competitor gap: ${cluster.competitorGap}

System push: ${cluster.systemPush}

Rank jump potential: ${cluster.rankJumpPotential.toLocaleString("en-US")}

Keywords:
${cluster.keywords.map((keyword) => `- ${keyword}`).join("\n")}

Proof routes:
${cluster.proofRoutes.map((route) => `- ${route}`).join("\n")}

Required receipts:
${cluster.requiredReceipts.map((receipt) => `- ${receipt}`).join("\n")}`).join("\n\n")}

## Whole System Combination Push

${packet.systemCombinationPush.map((item) => `- ${item}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildLongtailCompetitionNeighborhoodPacket({functionalRankBoostClusterPushPacket, rankFindingBenchmarkPacket, metricFreshnessPacket} = {}){
  const clusters = functionalRankBoostClusterPushPacket?.clusters || []
  const stale = metricFreshnessPacket?.stale !== false
  const rows = clusters.map((cluster) => ({
    id: cluster.id,
    lane: cluster.lane,
    keywordSet: cluster.keywords,
    currentEstimatedRank: cluster.currentEstimatedRank,
    rankState: stale
      ? "not-live-confirmed-staged-from-rank-floor"
      : "ready-for-live-rank-comparison",
    realNeighborhoodRead: "DigitalHut is not yet competing like an established authority page. It is most likely sitting in the long-tail staging layer beside unproven or weakly connected pages until indexing, Search Console impressions, backlinks, and visitor receipts prove movement.",
    likelyAdjacentCompetitors: [
      "unindexed or newly indexed proof pages",
      "thin affiliate or roundup posts",
      "local service landing pages with weak source proof",
      "directory/listing pages that answer only one piece of the search",
      "forum and Reddit-style discussion pages",
      "YouTube or short-video result pages without a full research layer",
      "small SaaS feature pages that describe functionality but do not prove it live",
      "old blog posts with stale metadata"
    ],
    competitorBands: [
      {
        band: "top-10",
        whoUsuallyLivesThere: "platforms, big directories, high-authority publications, dominant local/map results",
        digitalhutMove: "Do not fight head terms first. Use long-tail proof phrases that combine video, source, GLB, podcast, and route proof."
      },
      {
        band: "top-100",
        whoUsuallyLivesThere: "specialist blogs, niche SaaS pages, creator posts, strong review pages, indexed YouTube/Reddit results",
        digitalhutMove: "Push proof pages with exact human language and same-topic backlinks."
      },
      {
        band: "top-1,000",
        whoUsuallyLivesThere: "small company pages, thin how-to posts, forum threads, local landing pages, older content",
        digitalhutMove: "This is the first realistic climb target after indexing and a few source/backlink receipts."
      },
      {
        band: "deep-rank-floor",
        whoUsuallyLivesThere: "unindexed, newly staged, duplicate, weak, or low-proof content",
        digitalhutMove: "Current estimated starting floor. Move up by proving route usefulness, not by adding filler keywords."
      }
    ],
    exactProofNeeded: [
      "Search Console query, impression, click, and average position for each keyword",
      "SERP/API rank check for each keyword and route",
      "Supabase receipt tying the keyword to route opens, source opens, GLB plays, podcast starts, and search behavior",
      "Backlink/source receipt proving another useful page points to the proof route",
      "Vercel/index proof confirming the route is crawlable and stable"
    ],
    rankPushConclusion: `For ${cluster.lane}, DigitalHut should assume it is near the deep rank floor until indexed behavior proves otherwise. The first win is not #1; it is escaping the weak/unproven long-tail neighborhood into a visible proof band.`
  }))
  return {
    generatedAt,
    mode: "DigitalHut Longtail Competition Neighborhood",
    status: stale ? "competition-neighborhood-staged-live-rank-proof-needed" : "competition-neighborhood-ready-for-live-rank-read",
    purpose: "Boil down where DigitalHut really sits around long-tail keyword competition instead of only naming company-size competitors.",
    guardrail: "This packet does not pretend to know exact live rank. It defines the real competition neighborhood and the receipts required to replace estimates with measured ranking.",
    metricFreshnessStatus: metricFreshnessPacket?.status || "unknown",
    rankBenchmarkStatus: rankFindingBenchmarkPacket?.status || "unknown",
    sourceRead: "Public quick searches may not surface new/low-authority routes. Real position must come from Search Console, SERP API, Supabase receipts, and index proof.",
    rowCount: rows.length,
    rows,
    firstRankPush: rows.slice(0, 4).map((row) => ({
      lane: row.lane,
      currentEstimatedRank: row.currentEstimatedRank,
      likelyCompetitionBand: "deep-rank-floor",
      firstRealisticEscapeTarget: "top-1,000 long-tail proof band",
      requiredProof: row.exactProofNeeded.slice(0, 3)
    })),
    nextSystemMove: "Stop describing only company sizes. Track the actual long-tail neighborhood: platforms at the top, niche/affiliate/forum/local pages in the middle, and weak/unindexed proof pages near the floor. Use receipts to climb one band at a time."
  }
}

function longtailCompetitionNeighborhoodMarkdown(packet){
  return `# DigitalHut Longtail Competition Neighborhood

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Metric freshness: ${packet.metricFreshnessStatus}

Rank benchmark: ${packet.rankBenchmarkStatus}

Source read: ${packet.sourceRead}

Rows: ${packet.rowCount}

## First Rank Push

| Lane | Estimated Rank | Competition Band | First Escape Target |
| --- | ---: | --- | --- |
${packet.firstRankPush.map((row) => `| ${row.lane} | #${row.currentEstimatedRank.toLocaleString("en-US")} | ${row.likelyCompetitionBand} | ${row.firstRealisticEscapeTarget} |`).join("\n")}

## Neighborhood Detail

${packet.rows.map((row) => `### ${row.lane}

Rank state: ${row.rankState}

Real neighborhood read: ${row.realNeighborhoodRead}

Likely adjacent competitors:
${row.likelyAdjacentCompetitors.map((item) => `- ${item}`).join("\n")}

Competitor bands:
${row.competitorBands.map((band) => `- **${band.band}**: ${band.whoUsuallyLivesThere}. DigitalHut move: ${band.digitalhutMove}`).join("\n")}

Exact proof needed:
${row.exactProofNeeded.map((item) => `- ${item}`).join("\n")}

Conclusion: ${row.rankPushConclusion}`).join("\n\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildMovementProofAudienceOriginPacket({metrics = lastKnownMetrics, functionalRankBoostClusterPushPacket, longtailCompetitionNeighborhoodPacket, metricFreshnessPacket, rankFindingBenchmarkPacket} = {}){
  const pageViews = metrics.pageViews || 0
  const uniqueVisitors = metrics.uniqueVisitors || 0
  const glbRate = pageViews ? Number(((metrics.glbPreviewPlays / pageViews) * 100).toFixed(1)) : 0
  const blogRate = pageViews ? Number(((metrics.blogViews / pageViews) * 100).toFixed(1)) : 0
  const podcastRate = pageViews ? Number(((metrics.podcastInterrupts / pageViews) * 100).toFixed(1)) : 0
  const autoplayRate = pageViews ? Number(((metrics.autoplayStarts / pageViews) * 100).toFixed(1)) : 0
  const movementProofStatus = metricFreshnessPacket?.stale === false
    ? "ready-for-live-movement-proof"
    : "movement-proof-contract-ready-live-receipts-needed"
  const originBuckets = [
    {
      bucket: "direct",
      proofField: "referrer empty or direct",
      currentStatus: "not-present-in-local-snapshot",
      extractionMove: "Tie direct sessions to first route, dwell events, GLB plays, and return visits before treating them as brand demand."
    },
    {
      bucket: "organic-search",
      proofField: "Search Console query plus landing route",
      currentStatus: "not-present-in-local-snapshot",
      extractionMove: "Promote only keywords that gain impressions, clicks, or position movement against a DigitalHut proof route."
    },
    {
      bucket: "social-video",
      proofField: "utm_source, referrer, shared video route",
      currentStatus: "not-present-in-local-snapshot",
      extractionMove: "Map viral or funny video interest into watch/blog/category proof pages with the same media subject."
    },
    {
      bucket: "referral-backlink",
      proofField: "external referrer and backlink target route",
      currentStatus: "not-present-in-local-snapshot",
      extractionMove: "Keep backlinks only when they send route behavior, GLB inspection, source clicks, or blog continuation."
    },
    {
      bucket: "local-dev",
      proofField: "local host, preview host, internal test route",
      currentStatus: "not-present-in-local-snapshot",
      extractionMove: "Separate testing traffic from public proof so rank decisions do not chase false audience signals."
    },
    {
      bucket: "unknown",
      proofField: "missing referrer/country/device fields",
      currentStatus: "dominant-until-live-origin-capture-exists",
      extractionMove: "Treat unknown traffic as useful only after it produces route-level behavior like GLB preview, podcast interrupt, search, market, or source click."
    }
  ]
  const currentAudienceSignals = [
    {
      signal: "GLB preview",
      value: metrics.glbPreviewPlays,
      rate: `${glbRate}% of page views`,
      read: "Strongest last-known behavior. This is where the next rank push should extract more similar visitors.",
      push: "Feature 3D proof, source routes, and Babylon system language in proof pages before expanding broad generic keywords."
    },
    {
      signal: "Blog proof",
      value: metrics.blogViews,
      rate: `${blogRate}% of page views`,
      read: "Useful but still early. Blog should prove the system, not act like filler content.",
      push: "Intertwine blog posts with exact watch routes, backlinks, GLB proof, and source authority."
    },
    {
      signal: "Podcast interrupt",
      value: metrics.podcastInterrupts,
      rate: `${podcastRate}% of page views`,
      read: "Support lane. It should build trust when a source moment matters, not lead the whole campaign yet.",
      push: "Attach podcast moments to source proof and topic authority after GLB/video interest is proven."
    },
    {
      signal: "Autoplay",
      value: metrics.autoplayStarts,
      rate: `${autoplayRate}% of page views`,
      read: "Very low. The system must create stronger human entry points before assuming visitors want a full autoplay presentation.",
      push: "Make SEO language promise useful proof first: what the video is about, why the 3D model matters, and what source backs it."
    },
    {
      signal: "Search interaction",
      value: metrics.searchInteractions,
      rate: "0 active searches",
      read: "Search is not yet a user behavior. Do not overbuild around typed search until the route language earns it.",
      push: "Seed pages with natural everyday questions so visitors understand what they can ask the observatory."
    },
    {
      signal: "Market open",
      value: metrics.marketOpens,
      rate: "0 market opens",
      read: "Market should stay an optional category until actual interest appears.",
      push: "Keep market proof tied to quick stock signals and source-backed examples, not broad finance spam."
    }
  ]
  const movementProofLadder = [
    {
      layer: "FireCuda",
      proves: "master-list delta, cluster added, filler rejected, backlink receipt staged, keyword variation owner",
      currentState: "cluster and rank contracts staged locally",
      nextPush: `Keep the ${seoSearchClaimSummary.totalIndividualRanks.toLocaleString("en-US")}-slot universe gated and promote only clusters with route behavior or Search Console movement.`
    },
    {
      layer: "Supabase",
      proves: "page view, unique visitor, event type, route, session, referrer, source click, GLB play, podcast interrupt, search, market open",
      currentState: "measurement-ready, origin proof not present in the local snapshot",
      nextPush: "Capture origin fields and feature events so the first 200-view neighborhood becomes repeatable audience knowledge."
    },
    {
      layer: "Google Cloud and Search Console",
      proves: "query impressions, clicks, average position, index status, source metadata enrichment",
      currentState: "API/cloud path staged, live rank proof not in this local packet",
      nextPush: "Use query movement to decide which long-tail clusters graduate from staged to pushed."
    },
    {
      layer: "Vercel",
      proves: "stable route delivery, public crawl path, deployment health, live proof packet availability",
      currentState: "deploy readiness still held by local build tooling status",
      nextPush: "Do not claim deployment movement until build/deploy proof is clean."
    },
    {
      layer: "Codex overseer",
      proves: "compare and contrast reasoning, no fake metrics, no filler expansion, next rank target chosen",
      currentState: "overseer packet active",
      nextPush: "Use the strongest observed behavior, GLB proof, to pull neighboring audiences before broad expansion."
    }
  ]
  const rankEscapePlan = [
    {
      band: "deep floor",
      target: "#236,000,000 starting assumption",
      proofToLeave: "index proof plus one real query impression or measured referrer route",
      action: "Do not flood. Publish route proof and record receipts."
    },
    {
      band: "first escape",
      target: "top 1,000,000 long-tail proof band",
      proofToLeave: "repeat route behavior, GLB/source click behavior, or Search Console position movement",
      action: "Push the winning cluster into watch/blog/category pairs and backlink targets."
    },
    {
      band: "visible proof",
      target: "top 100,000 narrow human-intent phrases",
      proofToLeave: "clicks, source opens, backlinks, and non-test visitors from the same intent lane",
      action: "Increase content depth and source authority around the exact phrase family."
    },
    {
      band: "traffic target",
      target: "50,000+ participating browser IDs",
      proofToLeave: "cluster repeatability across organic, referral, and social-video origins",
      action: "Scale only clusters that show audience pull, not keyword volume alone."
    }
  ]
  const clusterPushes = (functionalRankBoostClusterPushPacket?.clusters || []).map((cluster, index) => ({
    priority: index + 1,
    lane: cluster.lane,
    estimatedRank: cluster.currentEstimatedRank,
    nextTargetRank: cluster.nextTargetRank,
    authorityTargetRank: cluster.authorityTargetRank,
    whyThisPush: index === 0
      ? "It matches the strongest last-known behavior: GLB preview interest."
      : "It becomes a follow-up push only after origin and behavior receipts confirm the lane.",
    extractMoreFromAudience: cluster.systemPush,
    requiredReceiptBeforeScaling: [
      "origin/referrer bucket",
      "landing route",
      "feature event",
      "source/backlink click",
      "Search Console query or index proof"
    ]
  }))
  return {
    generatedAt,
    mode: "DigitalHut Movement Proof And Audience Origin",
    status: movementProofStatus,
    movementProofStatus,
    originProofStatus: "origin-proof-missing-live-capture-needed",
    purpose: "Prove movement by connecting rank, origin, route behavior, feature usage, and cluster pushes instead of only counting page views.",
    source: metrics.source,
    lastKnownMetrics: metrics,
    lastKnownAudienceRead: {
      pageViews,
      uniqueVisitors,
      strongestLane: "GLB preview proof",
      weakestLanes: ["search interaction", "market open"],
      conclusion: "The first audience appears to be inspecting the system visually before using search or market tools. The next push should extract more visitors from GLB/video/source proof neighborhoods."
    },
    currentAudienceSignals,
    originBuckets,
    originBucketCount: originBuckets.length,
    movementProofLadder,
    rankEscapePlan,
    clusterPushes,
    competitionNeighborhoodStatus: longtailCompetitionNeighborhoodPacket?.status || "unknown",
    rankBenchmarkStatus: rankFindingBenchmarkPacket?.status || "unknown",
    rankUniverseFloor: rankFindingBenchmarkPacket?.rankUniverseFloor || 236_000_000,
    firstEscapeTarget: 1_000_000,
    visibleProofTarget: 100_000,
    nextVisitorTarget: 50_000,
    fifteenMinuteSystemJob: [
      "Refresh packet timestamps and staged cluster decisions.",
      "Keep GLB/source proof as the lead extraction lane until live origin receipts say otherwise.",
      "Hold search and market expansion until behavior appears.",
      "Prepare Supabase/Vercel/Search Console origin fields for the next live verification cycle.",
      "Compare each cluster against the competition neighborhood before promotion."
    ],
    nextSystemMove: "Reset the 15-minute standby with movement proof active. The next real unlock is origin/referrer/query proof so DigitalHut can push the exact neighborhoods that produced the first audience."
  }
}

function movementProofAudienceOriginMarkdown(packet){
  return `# DigitalHut Movement Proof And Audience Origin

Generated: ${packet.generatedAt}

Status: ${packet.status}

Movement proof: ${packet.movementProofStatus}

Origin proof: ${packet.originProofStatus}

Purpose: ${packet.purpose}

Source: ${packet.source}

Competition neighborhood: ${packet.competitionNeighborhoodStatus}

Rank benchmark: ${packet.rankBenchmarkStatus}

Rank universe floor: #${packet.rankUniverseFloor.toLocaleString("en-US")}

First escape target: top ${packet.firstEscapeTarget.toLocaleString("en-US")}

Visible proof target: top ${packet.visibleProofTarget.toLocaleString("en-US")}

Next visitor target: ${packet.nextVisitorTarget.toLocaleString("en-US")}+ participating browser IDs

## Last Known Audience Read

- Page views: ${packet.lastKnownAudienceRead.pageViews}
- Participating browser IDs: ${packet.lastKnownAudienceRead.uniqueVisitors}
- Strongest lane: ${packet.lastKnownAudienceRead.strongestLane}
- Weakest lanes: ${packet.lastKnownAudienceRead.weakestLanes.join(", ")}
- Conclusion: ${packet.lastKnownAudienceRead.conclusion}

## Current Audience Signals

| Signal | Value | Rate | Read | Push |
| --- | ---: | --- | --- | --- |
${packet.currentAudienceSignals.map((signal) => `| ${signal.signal} | ${signal.value} | ${signal.rate} | ${signal.read} | ${signal.push} |`).join("\n")}

## Origin Buckets To Prove

| Bucket | Proof Field | Current Status | Extraction Move |
| --- | --- | --- | --- |
${packet.originBuckets.map((bucket) => `| ${bucket.bucket} | ${bucket.proofField} | ${bucket.currentStatus} | ${bucket.extractionMove} |`).join("\n")}

## Movement Proof Ladder

${packet.movementProofLadder.map((layer) => `### ${layer.layer}

Proves: ${layer.proves}

Current state: ${layer.currentState}

Next push: ${layer.nextPush}`).join("\n\n")}

## Rank Escape Plan

| Band | Target | Proof To Leave | Action |
| --- | --- | --- | --- |
${packet.rankEscapePlan.map((row) => `| ${row.band} | ${row.target} | ${row.proofToLeave} | ${row.action} |`).join("\n")}

## Cluster Pushes

${packet.clusterPushes.map((cluster) => `### ${cluster.priority}. ${cluster.lane}

Estimated rank: #${cluster.estimatedRank.toLocaleString("en-US")}

Next target rank: #${cluster.nextTargetRank.toLocaleString("en-US")}

Authority target rank: #${cluster.authorityTargetRank.toLocaleString("en-US")}

Why this push: ${cluster.whyThisPush}

Extract more from audience: ${cluster.extractMoreFromAudience}

Required receipt before scaling:
${cluster.requiredReceiptBeforeScaling.map((item) => `- ${item}`).join("\n")}`).join("\n\n")}

## 15-Minute System Job

${packet.fifteenMinuteSystemJob.map((item) => `- ${item}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildCompetitionFrameworkMetricPushPacket({metrics = lastKnownMetrics, movementProofAudienceOriginPacket, longtailCompetitionNeighborhoodPacket, rankFindingBenchmarkPacket} = {}){
  const pageViews = metrics.pageViews || 0
  const uniqueVisitors = metrics.uniqueVisitors || 0
  const glbRate = pageViews ? Number(((metrics.glbPreviewPlays / pageViews) * 100).toFixed(1)) : 0
  const blogRate = pageViews ? Number(((metrics.blogViews / pageViews) * 100).toFixed(1)) : 0
  const podcastRate = pageViews ? Number(((metrics.podcastInterrupts / pageViews) * 100).toFixed(1)) : 0
  const searchRate = pageViews ? Number(((metrics.searchInteractions / pageViews) * 100).toFixed(1)) : 0
  const marketRate = pageViews ? Number(((metrics.marketOpens / pageViews) * 100).toFixed(1)) : 0
  const autoplayRate = pageViews ? Number(((metrics.autoplayStarts / pageViews) * 100).toFixed(1)) : 0
  const featureScore = Math.min(100, Math.round(glbRate * 1.8 + blogRate * 1.2 + podcastRate * 4 + autoplayRate * 3 + searchRate * 2 + marketRate * 2))
  const proofScore = Math.min(100, Math.round((metrics.blogViews || 0) * 2 + (metrics.podcastInterrupts || 0) * 5 + (metrics.searchInteractions || 0) * 3))
  const expansionScore = Math.min(100, Math.round(glbRate + blogRate + searchRate + marketRate))
  const frameworkRead = featureScore >= 55
    ? "compatible-enough-to-attack-niche-frameworks"
    : "compatible-staged-needs-live-proof-and-more-intent-events"
  const competitorFrameworks = [
    {
      id: "thin-sales-page",
      className: "Thin Sales Page / Give Me Money Site",
      competitorFunction: "Landing copy, form, basic images, maybe a blog.",
      digitalhutFunction: "Video story, Babylon/GLB proof, podcast/source moment, backlinks, watch/blog/category routes, Supabase event receipts.",
      metricGate: "Beat when DigitalHut route gets any GLB play or source click and the competitor page has no comparable interactive proof layer.",
      currentDigitalhutAdvantage: glbRate >= 10 ? "active-advantage" : "staged-advantage",
      seoIntertwineMove: "Use phrases that expose the functional gap: visual proof, 3D preview, source-backed observatory, video explained with model context.",
      nextCompatibleCompetition: "small-company and local operator pages"
    },
    {
      id: "single-medium-video",
      className: "Single-Medium Video Page",
      competitorFunction: "Video playback, comments, title/description, platform recommendations.",
      digitalhutFunction: "Video plus analytics map, source backlinks, GLB context, podcast/source interrupt, route proof, and SEO packet metadata.",
      metricGate: "Beat when same-topic route holds GLB/source/blog continuation beyond raw video playback.",
      currentDigitalhutAdvantage: metrics.autoplayStarts > 0 || metrics.glbPreviewPlays > 0 ? "partial-advantage" : "staged-advantage",
      seoIntertwineMove: "Target long-tail phrases where people ask what the video means, what sources back it, and what 3D/context explains it.",
      nextCompatibleCompetition: "YouTube result pages, creator blogs, short-video explainers"
    },
    {
      id: "3d-portfolio-gallery",
      className: "3D Portfolio / Model Gallery",
      competitorFunction: "Model preview, title, artist profile, asset page.",
      digitalhutFunction: "GLB/Babylon model tied to video topic, analytics explanation, backlink/source proof, and route-level audience receipts.",
      metricGate: "Beat when GLB preview rate stays above 20% of page views and route proof connects model to topic/source.",
      currentDigitalhutAdvantage: glbRate >= 20 ? "active-advantage" : "near-advantage",
      seoIntertwineMove: "Push inspectable model proof phrases, not generic 3D gallery terms.",
      nextCompatibleCompetition: "Sketchfab creators, 3D artist pages, Matterport-style tours"
    },
    {
      id: "static-research-blog",
      className: "Static Research Blog / Wiki-Style Result",
      competitorFunction: "Article, citations, maybe images or embedded video.",
      digitalhutFunction: "Research topic rendered as video context, GLB visual, timeline/bubble analytics, source/podcast proof, and followable proof routes.",
      metricGate: "Beat when blog/watch pair gets source click, GLB play, or repeat route behavior.",
      currentDigitalhutAdvantage: blogRate >= 5 ? "partial-advantage" : "staged-advantage",
      seoIntertwineMove: "Compete on research questions that need visual explanation, not pure encyclopedia head terms.",
      nextCompatibleCompetition: "niche research blogs, university explainers, wiki-adjacent pages"
    },
    {
      id: "market-dashboard",
      className: "Market Dashboard / Finance Result",
      competitorFunction: "Ticker price, chart, news headline, stock list.",
      digitalhutFunction: "Ticker plus company story, connected media, GLB environment, podcast/source moment, and analytics summary.",
      metricGate: "Beat only after market opens or ticker searches appear in Supabase.",
      currentDigitalhutAdvantage: marketRate > 0 ? "ready-to-attack" : "hold-until-market-behavior",
      seoIntertwineMove: "Hold broad market expansion. Use quick proof snippets inside regular feed until behavior appears.",
      nextCompatibleCompetition: "small finance blogs first, not enterprise finance portals"
    }
  ]
  const metricTests = [
    {
      test: "Feature usefulness",
      currentValue: featureScore,
      passAt: 55,
      status: featureScore >= 55 ? "pass-last-known" : "needs-more-live-proof",
      reads: `${metrics.glbPreviewPlays} GLB plays, ${metrics.blogViews} blog views, ${metrics.podcastInterrupts} podcast interrupts, ${metrics.searchInteractions} searches, ${metrics.marketOpens} market opens`
    },
    {
      test: "Proof depth",
      currentValue: proofScore,
      passAt: 40,
      status: proofScore >= 40 ? "pass-last-known" : "needs-source-backlink-events",
      reads: "Measures whether proof routes create continuation beyond the first visual hit."
    },
    {
      test: "Expansion readiness",
      currentValue: expansionScore,
      passAt: 35,
      status: expansionScore >= 35 ? "expand-compatible-competitors" : "hold-broad-expansion",
      reads: "Measures whether DigitalHut should climb to stronger competitors or keep extracting the current neighborhood."
    }
  ]
  const competitionProgression = competitorFrameworks.map((framework, index) => ({
    step: index + 1,
    className: framework.className,
    currentDigitalhutAdvantage: framework.currentDigitalhutAdvantage,
    metricGate: framework.metricGate,
    moveWhenBeat: framework.nextCompatibleCompetition,
    seoIntertwineMove: framework.seoIntertwineMove
  }))
  const seoPushQueue = [
    {
      priority: 1,
      push: "Attack thin sales pages and 3D galleries first",
      reason: "DigitalHut has a real interaction layer where many competitors only show copy, images, or static embeds.",
      keywordAngle: "3d visual proof, source-backed video explanation, inspectable model route, observatory proof page",
      metricRequired: "GLB preview or source click tied to route"
    },
    {
      priority: 2,
      push: "Attack single-medium video explainers second",
      reason: "DigitalHut can separate itself by explaining the video with GLB, podcast/source, backlinks, and analytics.",
      keywordAngle: "what is this video about, video explained with source map, viral video proof route",
      metricRequired: "watch/blog pair plus source/backlink receipt"
    },
    {
      priority: 3,
      push: "Hold market and broad enterprise fights",
      reason: "Last-known market and search behavior are quiet; fighting enterprise head terms now wastes rank energy.",
      keywordAngle: "only use market as a connected proof lane until market opens appear",
      metricRequired: "market open, ticker search, or company route receipt"
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut Competition Framework Metric Push",
    status: "competition-framework-metric-push-staged",
    frameworkRead,
    purpose: "Physically compare DigitalHut against competitor framework/functionality before advancing SEO intertwine to stronger compatible competitors.",
    guardrail: "No claim of beating a competitor without a metric receipt. This packet stages the beat gates and moves only when DigitalHut wins the metric test.",
    source: metrics.source,
    lastKnownMetrics: metrics,
    metricRates: {
      glbRate,
      blogRate,
      podcastRate,
      searchRate,
      marketRate,
      autoplayRate
    },
    scores: {
      featureScore,
      proofScore,
      expansionScore
    },
    metricTests,
    competitorFrameworks,
    competitionProgression,
    seoPushQueue,
    compatibleNow: competitorFrameworks
      .filter((framework) => /active|partial|near/.test(framework.currentDigitalhutAdvantage))
      .map((framework) => framework.className),
    heldUntilReceipts: competitorFrameworks
      .filter((framework) => /hold|staged/.test(framework.currentDigitalhutAdvantage))
      .map((framework) => framework.className),
    movementProofStatus: movementProofAudienceOriginPacket?.movementProofStatus || "unknown",
    originProofStatus: movementProofAudienceOriginPacket?.originProofStatus || "unknown",
    competitionNeighborhoodStatus: longtailCompetitionNeighborhoodPacket?.status || "unknown",
    rankBenchmarkStatus: rankFindingBenchmarkPacket?.status || "unknown",
    nextMeasuredPush: "Use GLB/source proof to beat thin sales pages, 3D galleries, and single-medium video pages first. Move to stronger competitors only after Supabase/Search Console/Vercel receipts prove the win."
  }
}

function competitionFrameworkMetricPushMarkdown(packet){
  return `# DigitalHut Competition Framework Metric Push

Generated: ${packet.generatedAt}

Status: ${packet.status}

Framework read: ${packet.frameworkRead}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Source: ${packet.source}

Movement proof: ${packet.movementProofStatus}

Origin proof: ${packet.originProofStatus}

Competition neighborhood: ${packet.competitionNeighborhoodStatus}

Rank benchmark: ${packet.rankBenchmarkStatus}

## Last Known Metric Rates

- GLB preview rate: ${packet.metricRates.glbRate}%
- Blog proof rate: ${packet.metricRates.blogRate}%
- Podcast interrupt rate: ${packet.metricRates.podcastRate}%
- Search interaction rate: ${packet.metricRates.searchRate}%
- Market open rate: ${packet.metricRates.marketRate}%
- Autoplay rate: ${packet.metricRates.autoplayRate}%

## Scoreboard

| Test | Current | Pass At | Status | Reads |
| --- | ---: | ---: | --- | --- |
${packet.metricTests.map((test) => `| ${test.test} | ${test.currentValue} | ${test.passAt} | ${test.status} | ${test.reads} |`).join("\n")}

## Competitor Frameworks

${packet.competitorFrameworks.map((framework) => `### ${framework.className}

Competitor function: ${framework.competitorFunction}

DigitalHut function: ${framework.digitalhutFunction}

Metric gate: ${framework.metricGate}

Current advantage: ${framework.currentDigitalhutAdvantage}

SEO intertwine move: ${framework.seoIntertwineMove}

Next compatible competition: ${framework.nextCompatibleCompetition}`).join("\n\n")}

## Competition Progression

| Step | Competitor Class | Current Advantage | Move When Beat |
| ---: | --- | --- | --- |
${packet.competitionProgression.map((row) => `| ${row.step} | ${row.className} | ${row.currentDigitalhutAdvantage} | ${row.moveWhenBeat} |`).join("\n")}

## SEO Push Queue

${packet.seoPushQueue.map((item) => `### ${item.priority}. ${item.push}

Reason: ${item.reason}

Keyword angle: ${item.keywordAngle}

Metric required: ${item.metricRequired}`).join("\n\n")}

## Compatible Now

${packet.compatibleNow.map((item) => `- ${item}`).join("\n")}

## Held Until Receipts

${packet.heldUntilReceipts.map((item) => `- ${item}`).join("\n")}

Next measured push: ${packet.nextMeasuredPush}
`
}

function buildExperienceCycleNicheOwnershipPacket({metrics = lastKnownMetrics, competitionFrameworkMetricPushPacket, movementProofAudienceOriginPacket} = {}){
  const pageViews = metrics.pageViews || 0
  const safeRate = (value) => pageViews ? Number(((value / pageViews) * 100).toFixed(1)) : 0
  const cycleStages = [
    {
      stage: "autoplay-start",
      label: "Auto Play",
      currentEvents: metrics.autoplayStarts,
      rate: safeRate(metrics.autoplayStarts),
      requiredReceipt: "presentation_started",
      seoMeaning: "Visitor allowed the observatory to begin instead of treating the page as a static article."
    },
    {
      stage: "glb-open",
      label: "3D GLB Open",
      currentEvents: metrics.glbPreviewPlays,
      rate: safeRate(metrics.glbPreviewPlays),
      requiredReceipt: "glb_preview_opened",
      seoMeaning: "Visitor inspected the functional layer competitors usually do not have."
    },
    {
      stage: "glb-manipulate",
      label: "3D Rotate / Zoom",
      currentEvents: 0,
      rate: 0,
      requiredReceipt: "glb_rotated_or_zoomed",
      seoMeaning: "This is the strongest proof that DigitalHut is being used as a tool, not just viewed as media."
    },
    {
      stage: "podcast-source",
      label: "Podcast / Source Moment",
      currentEvents: metrics.podcastInterrupts,
      rate: safeRate(metrics.podcastInterrupts),
      requiredReceipt: "podcast_source_started",
      seoMeaning: "Visitor accepted a source-authority interruption inside the video/research flow."
    },
    {
      stage: "system-search",
      label: "System Search",
      currentEvents: metrics.searchInteractions,
      rate: safeRate(metrics.searchInteractions),
      requiredReceipt: "observatory_search_used",
      seoMeaning: "Visitor trusted the system enough to ask it a follow-up question."
    },
    {
      stage: "category-hop",
      label: "Category Aspect Check",
      currentEvents: 0,
      rate: 0,
      requiredReceipt: "category_lane_selected",
      seoMeaning: "Visitor moved from one niche post to another, proving the cluster can branch."
    },
    {
      stage: "proof-route",
      label: "Blog / Watch Proof",
      currentEvents: metrics.blogViews,
      rate: safeRate(metrics.blogViews),
      requiredReceipt: "proof_route_opened",
      seoMeaning: "Visitor crossed from entertainment into crawlable proof content."
    }
  ]
  const completedStageCount = cycleStages.filter((stage) => stage.currentEvents > 0).length
  const strongestStage = cycleStages
    .filter((stage) => stage.currentEvents > 0)
    .sort((a, b) => b.currentEvents - a.currentEvents)[0]?.label || "none"
  const cycleScore = Math.min(100, Math.round(
    safeRate(metrics.glbPreviewPlays) * 1.5
    + safeRate(metrics.blogViews) * 1.1
    + safeRate(metrics.podcastInterrupts) * 4
    + safeRate(metrics.autoplayStarts) * 3
    + (completedStageCount * 5)
  ))
  const nichePosts = [
    {
      id: "3d-visual-proof-post",
      niche: "3D visual proof over static pages",
      occupiedPost: "DigitalHut proves the subject with a video-linked Babylon/GLB inspection layer.",
      currentEvidence: `${metrics.glbPreviewPlays} GLB preview events`,
      cycleGap: "Need rotate/zoom receipts to prove hands-on inspection, not only model opening.",
      competitorToBeat: "3D portfolio/gallery and thin sales pages",
      pushAction: "Keep this as the lead post until GLB manipulation and source clicks are measured.",
      status: metrics.glbPreviewPlays > 0 ? "occupy-and-push" : "staged"
    },
    {
      id: "video-explained-source-post",
      niche: "Video explained with source proof",
      occupiedPost: "DigitalHut sits between raw video and research, explaining what the content means with sources and backlinks.",
      currentEvidence: `${metrics.blogViews} blog proof views and ${metrics.podcastInterrupts} podcast/source moments`,
      cycleGap: "Need source/backlink clicks and same-topic watch/blog continuation.",
      competitorToBeat: "single-medium video page and static explainers",
      pushAction: "Use watch/blog pairs around specific videos, not broad entertainment keywords.",
      status: metrics.blogViews > 0 ? "occupy-and-refine" : "staged"
    },
    {
      id: "search-opinion-post",
      niche: "Search based on system opinion",
      occupiedPost: "DigitalHut should let visitors search after the system forms an opinion from video, GLB, and source context.",
      currentEvidence: `${metrics.searchInteractions} search events`,
      cycleGap: "Search is quiet, so the system needs clearer prompts and proof of what search can do.",
      competitorToBeat: "generic search result pages and Q&A pages",
      pushAction: "Hold scale. Seed intent examples in proof routes until visitors search.",
      status: metrics.searchInteractions > 0 ? "push" : "hold-for-behavior"
    },
    {
      id: "category-branch-post",
      niche: "Category-aspect branching",
      occupiedPost: "DigitalHut should make one completed experience branch into related category lanes.",
      currentEvidence: "category aspect events not present in last-known local snapshot",
      cycleGap: "Need category lane selected receipts and next-episode/category continuation.",
      competitorToBeat: "directories and listing pages",
      pushAction: "Capture category hop events before expanding more category SEO.",
      status: "receipt-needed"
    }
  ]
  const ownershipGates = [
    {
      gate: "occupy",
      passRule: "Any real cycle stage has measurable behavior and a crawlable proof route exists.",
      currentStatus: completedStageCount > 0 ? "pass" : "hold",
      nextMove: "Keep the post active and measure which event pulls the visitor deeper."
    },
    {
      gate: "defend",
      passRule: "At least three cycle stages fire in the same niche family.",
      currentStatus: completedStageCount >= 3 ? "pass" : "near",
      nextMove: "Connect GLB proof, blog proof, and podcast/source moments into the same niche page family."
    },
    {
      gate: "scale",
      passRule: "Cycle score passes 55 and proof depth beats competitor framework score.",
      currentStatus: cycleScore >= 55 && (competitionFrameworkMetricPushPacket?.scores?.proofScore || 0) >= 40 ? "pass" : "hold",
      nextMove: "Scale only after source/backlink, rotate/zoom, search, or category-hop receipts improve."
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut Experience Cycle Niche Ownership",
    status: "experience-cycle-niche-ownership-staged",
    purpose: "Make DigitalHut own niches by proving that visitors complete richer experience cycles than competitor frameworks provide.",
    source: metrics.source,
    lastKnownMetrics: metrics,
    cycleScore,
    completedStageCount,
    strongestStage,
    cycleStages,
    nichePosts,
    ownershipGates,
    competitiveRead: competitionFrameworkMetricPushPacket?.frameworkRead || "unknown",
    featureScore: competitionFrameworkMetricPushPacket?.scores?.featureScore || 0,
    proofScore: competitionFrameworkMetricPushPacket?.scores?.proofScore || 0,
    movementProofStatus: movementProofAudienceOriginPacket?.movementProofStatus || "unknown",
    originProofStatus: movementProofAudienceOriginPacket?.originProofStatus || "unknown",
    nextSystemMove: "Occupy the 3D visual proof post first, add rotate/zoom and source-click receipts, then return between runs to decide whether the niche post pushes, holds, rewrites, or moves to stronger competition."
  }
}

function experienceCycleNicheOwnershipMarkdown(packet){
  return `# DigitalHut Experience Cycle Niche Ownership

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Source: ${packet.source}

Cycle score: ${packet.cycleScore}

Completed stage count: ${packet.completedStageCount}

Strongest stage: ${packet.strongestStage}

Competitive read: ${packet.competitiveRead}

Feature score: ${packet.featureScore}

Proof score: ${packet.proofScore}

Movement proof: ${packet.movementProofStatus}

Origin proof: ${packet.originProofStatus}

## Cycle Stages

| Stage | Events | Rate | Required Receipt | SEO Meaning |
| --- | ---: | ---: | --- | --- |
${packet.cycleStages.map((stage) => `| ${stage.label} | ${stage.currentEvents} | ${stage.rate}% | ${stage.requiredReceipt} | ${stage.seoMeaning} |`).join("\n")}

## Occupied Niche Posts

${packet.nichePosts.map((post) => `### ${post.niche}

Status: ${post.status}

Occupied post: ${post.occupiedPost}

Current evidence: ${post.currentEvidence}

Cycle gap: ${post.cycleGap}

Competitor to beat: ${post.competitorToBeat}

Push action: ${post.pushAction}`).join("\n\n")}

## Ownership Gates

| Gate | Pass Rule | Current Status | Next Move |
| --- | --- | --- | --- |
${packet.ownershipGates.map((gate) => `| ${gate.gate} | ${gate.passRule} | ${gate.currentStatus} | ${gate.nextMove} |`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildFireCudaInnovationMappingLayerPacket({metrics = lastKnownMetrics, capacityReceipt = lastKnownFireCudaCapacityReceipt, seoMasterListPacket, routeMetadataManifest, competitionFrameworkMetricPushPacket, experienceCycleNicheOwnershipPacket, movementProofAudienceOriginPacket} = {}){
  const totalVariationSlots = seoMasterListPacket?.counts?.totalVariationCapacity || 0
  const rankOwnershipSlots = seoMasterListPacket?.individualRankingIndex?.totalIndividualRanks || totalVariationSlots
  const routeCount = routeMetadataManifest?.routeCount || 0
  const launchTargetRoutes = routeMetadataManifest?.launchTargetRoutes || 0
  const cycleScore = experienceCycleNicheOwnershipPacket?.cycleScore || 0
  const featureScore = competitionFrameworkMetricPushPacket?.scores?.featureScore || 0
  const proofScore = competitionFrameworkMetricPushPacket?.scores?.proofScore || 0
  const mapAuthorityScore = Math.min(100, Math.round(
    (cycleScore * 0.35)
    + (featureScore * 0.25)
    + (proofScore * 0.2)
    + (launchTargetRoutes > 0 ? 10 : 0)
    + (rankOwnershipSlots > 1_000_000 ? 10 : 0)
  ))
  const architectureLayers = [
    {
      layer: "frontend-experience",
      role: "User-facing DigitalHut observatory: video, live analytics, GLB, podcast/source moments, category lanes, market panel, and proof navigation.",
      ownedBy: "Digitalhut.app interface",
      fireCudaDependency: "Frontend sends receipts into the map: what the visitor watched, opened, rotated, searched, clicked, or ignored."
    },
    {
      layer: "backend-measurement",
      role: "Event capture, API mediation, source packets, route metadata, watch/blog/category proof, and Supabase refinement views.",
      ownedBy: "DigitalHut backend and Supabase contracts",
      fireCudaDependency: "Backend normalizes receipts so the map can compare clusters and decide what deserves promotion."
    },
    {
      layer: "cloud-distribution",
      role: "Vercel deploy surface, Google Cloud/Search Console/source metadata, public JSON packets, sitemap, crawler guidance, and structured data.",
      ownedBy: "Vercel, Google Cloud, Supabase, GitHub",
      fireCudaDependency: "Cloud turns selected map decisions into crawlable, measurable public proof."
    },
    {
      layer: "firecuda-innovation-map",
      role: "The DigitalHut innovation layer: deep cluster storage, rank-slot ownership, receipt ledgers, competition gaps, niche posts, rewrite/hold/promote decisions, and enterprise-scale interface planning.",
      ownedBy: "FireCuda 8TB staging ground with 100TB-class database interface design target",
      fireCudaDependency: "This is the layer that decides what the product should occupy next."
    }
  ]
  const mapTables = [
    {
      table: "cluster_universe_map",
      purpose: "Stores every lane, niche, keyword variation, rank owner, proof route, and target audience.",
      currentCardinality: `${totalVariationSlots.toLocaleString("en-US")} variation slots`,
      enterpriseScaleRole: "Can shard by lane, language, region, platform, and intent when the database interface grows beyond the local 8TB staging layer."
    },
    {
      table: "experience_cycle_receipts",
      purpose: "Stores completed visitor stages: autoplay, GLB open, GLB rotate/zoom, podcast, search, category hop, proof route, backlink/source click.",
      currentCardinality: `${metrics.pageViews} page views / ${metrics.uniqueVisitors} participating browser IDs last-known`,
      enterpriseScaleRole: "Turns a few real full cycles into proof that DigitalHut outperforms static competitor frameworks."
    },
    {
      table: "competition_framework_matrix",
      purpose: "Compares DigitalHut against sales pages, video pages, 3D galleries, research blogs, dashboards, and stronger compatible competitors.",
      currentCardinality: `${competitionFrameworkMetricPushPacket?.competitorFrameworks?.length || 0} framework classes`,
      enterpriseScaleRole: "Prevents wasted SEO fights by only advancing when the system beats the current class by metric."
    },
    {
      table: "niche_post_occupancy",
      purpose: "Tracks which niche post DigitalHut currently occupies, defends, scales, rewrites, or abandons.",
      currentCardinality: `${experienceCycleNicheOwnershipPacket?.nichePosts?.length || 0} occupied/staged posts`,
      enterpriseScaleRole: "Lets the system return between runs and check individual posts instead of restarting from scratch."
    },
    {
      table: "origin_and_backlink_receipts",
      purpose: "Stores direct/search/social/referral/local/unknown origin buckets plus backlink/source proof.",
      currentCardinality: `${movementProofAudienceOriginPacket?.originBucketCount || 0} origin buckets staged`,
      enterpriseScaleRole: "Turns traffic origin into repeatable audience extraction."
    },
    {
      table: "promotion_decision_ledger",
      purpose: "Records why a cluster was promoted, held, rewritten, paired with routes, or blocked from scale.",
      currentCardinality: "decision contract staged",
      enterpriseScaleRole: "Creates an audit trail for enterprise SEO decisions instead of loose keyword dumping."
    }
  ]
  const mapOperations = [
    {
      operation: "map",
      input: "FireCuda cluster universe, everyday search language, route metadata, platform/source packets",
      output: "rank-owned keyword slots and niche post candidates",
      decisionRule: "Only store candidates that can connect to a DigitalHut function or proof route."
    },
    {
      operation: "measure",
      input: "Supabase/Vercel/Search Console/user-cycle receipts",
      output: "cycle score, proof score, origin proof, feature usefulness",
      decisionRule: "Do not claim movement without a receipt."
    },
    {
      operation: "compare",
      input: "DigitalHut cycle data and competitor framework classes",
      output: "compatible competitor to attack next",
      decisionRule: "Beat thin/static frameworks before fighting enterprise head terms."
    },
    {
      operation: "occupy",
      input: "winning niche post and proof route family",
      output: "watch/blog/category/source-backed cluster position",
      decisionRule: "Hold the post while behavior improves; rewrite if receipts stay weak."
    },
    {
      operation: "scale",
      input: "repeatable full-cycle behavior and backlinks/source clicks",
      output: "larger cluster expansion and stronger competition lane",
      decisionRule: "Scale only when the full experience cycle outpaces competitor usefulness."
    }
  ]
  const innovationClaims = [
    "FireCuda is the DigitalHut innovation layer after frontend and backend.",
    "The map turns storage into decisions: promote, hold, rewrite, occupy, defend, scale.",
    "The current 8TB staging ground is treated as the local enterprise map base.",
    "The 100TB database interface is the expansion model for sharded clusters, receipt history, media/source packets, and competition matrices.",
    "The map is what makes DigitalHut more than a website: it remembers which niches were tested and why they moved."
  ]
  const capacityGovernance = {
    currentPhysicalTier: "8TB FireCuda local staging ground",
    nextRackTarget: "30TB database rack expansion",
    enterpriseInterfaceCeiling: "100TB-class sharded database interface",
    currentUsageReceiptStatus: "actual-disk-usage-receipt-captured",
    capacityReceipt,
    utilizationRead: `${capacityReceipt.deviceId} ${capacityReceipt.volumeName}: ${capacityReceipt.usedTb}TB used of ${capacityReceipt.sizeTb}TB (${capacityReceipt.usedPct}% used), ${capacityReceipt.freeTb}TB free`,
    currentPressureStage: capacityReceipt.pressureStage,
    currentRackDecision: capacityReceipt.usedPct >= 82
      ? "rack-trigger"
      : capacityReceipt.usedPct >= 70
        ? "expansion-planning"
        : capacityReceipt.usedPct >= 55
          ? "pressure-watch"
          : "stay-on-8tb-firecuda-base",
    measurementContract: [
      "Measure raw media/source packets separately from public deploy artifacts.",
      "Measure cluster universe rows separately from generated watch/blog/category routes.",
      "Measure receipt ledgers by event volume, retention window, route, origin bucket, and niche post.",
      "Measure GLB/media cache pressure separately from SEO text/map metadata.",
      "Promote to a larger rack only when useful receipts, media/source growth, and cluster replay value justify the storage."
    ],
    pressureStages: [
      {
        stage: "normal",
        estimatedUtilization: "0-55%",
        systemMeaning: "8TB is breathing comfortably. Keep mapping clusters, receipts, and proof routes locally.",
        action: "Stay on FireCuda base and refine quality."
      },
      {
        stage: "pressure-watch",
        estimatedUtilization: "55-70%",
        systemMeaning: "The map is becoming a real database layer. Begin pruning filler packets and compressing stale source caches.",
        action: "Start weekly retention rules and archive weak/no-receipt clusters."
      },
      {
        stage: "expansion-planning",
        estimatedUtilization: "70-82%",
        systemMeaning: "DigitalHut is nearing enterprise storage pressure. The next 30TB rack should be quoted and staged.",
        action: "Prepare sharding by niche, media type, origin bucket, and receipt class."
      },
      {
        stage: "rack-trigger",
        estimatedUtilization: "82-90%",
        systemMeaning: "The 8TB base is no longer enough for reliable growth.",
        action: "Move hot receipt ledgers and media/source caches into the 30TB rack expansion."
      },
      {
        stage: "hard-limit",
        estimatedUtilization: "90%+",
        systemMeaning: "Do not keep dumping data into the local map. Data quality and system stability are now at risk.",
        action: "Freeze filler expansion, archive cold lanes, and migrate before scaling SEO."
      }
    ],
    upgradeSignals: [
      "Full-cycle receipts grow faster than stale/filler clusters.",
      "GLB/media source cache becomes repeatedly useful in multiple niches.",
      "Search Console/Supabase origins prove repeat visitors from several clusters.",
      "Backlink/source receipts require longer retention for compare-and-contrast decisions.",
      "Route metadata and proof packets become too valuable to prune aggressively."
    ]
  }
  return {
    generatedAt,
    mode: "DigitalHut FireCuda Innovation Mapping Layer",
    status: "firecuda-innovation-map-artifact-ready",
    purpose: "Artifact the 8TB FireCuda mapping system as the DigitalHut innovation layer that sits after frontend, backend, and cloud.",
    physicalBase: "FireCuda 8TB staging ground",
    enterpriseInterfaceTarget: "100TB-class database interface model for cluster maps, receipt ledgers, media/source indexes, and competition matrices",
    mapAuthorityScore,
    totalVariationSlots,
    rankOwnershipSlots,
    routeCount,
    launchTargetRoutes,
    cycleScore,
    featureScore,
    proofScore,
    architectureLayers,
    mapTables,
    mapOperations,
    innovationClaims,
    capacityGovernance,
    currentLeadPost: experienceCycleNicheOwnershipPacket?.strongestStage || "unknown",
    currentLeadNiche: experienceCycleNicheOwnershipPacket?.nichePosts?.find((post) => post.status === "occupy-and-push")?.niche || "3D visual proof over static pages",
    nextSystemMove: "Keep the FireCuda map as the enterprise innovation artifact. Use it to judge every cluster by receipts, not by keyword volume alone, then deploy only meaningful map changes that improve DigitalHut's public proof."
  }
}

function fireCudaInnovationMappingLayerMarkdown(packet){
  return `# DigitalHut FireCuda Innovation Mapping Layer

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Physical base: ${packet.physicalBase}

Enterprise interface target: ${packet.enterpriseInterfaceTarget}

Map authority score: ${packet.mapAuthorityScore}

Variation slots: ${packet.totalVariationSlots.toLocaleString("en-US")}

Rank ownership slots: ${packet.rankOwnershipSlots.toLocaleString("en-US")}

Route count: ${packet.routeCount}

Launch target routes: ${packet.launchTargetRoutes}

Cycle score: ${packet.cycleScore}

Feature score: ${packet.featureScore}

Proof score: ${packet.proofScore}

Current lead post: ${packet.currentLeadPost}

Current lead niche: ${packet.currentLeadNiche}

## Capacity Governance

Current physical tier: ${packet.capacityGovernance.currentPhysicalTier}

Next rack target: ${packet.capacityGovernance.nextRackTarget}

Enterprise interface ceiling: ${packet.capacityGovernance.enterpriseInterfaceCeiling}

Usage receipt status: ${packet.capacityGovernance.currentUsageReceiptStatus}

Capacity receipt: ${packet.capacityGovernance.utilizationRead}

Receipt captured: ${packet.capacityGovernance.capacityReceipt.capturedAt}

Current pressure stage: ${packet.capacityGovernance.currentPressureStage}

Current rack decision: ${packet.capacityGovernance.currentRackDecision}

Measurement contract:

${packet.capacityGovernance.measurementContract.map((item) => `- ${item}`).join("\n")}

### Pressure Stages

| Stage | Utilization | Meaning | Action |
| --- | --- | --- | --- |
${packet.capacityGovernance.pressureStages.map((stage) => `| ${stage.stage} | ${stage.estimatedUtilization} | ${stage.systemMeaning} | ${stage.action} |`).join("\n")}

### Upgrade Signals

${packet.capacityGovernance.upgradeSignals.map((signal) => `- ${signal}`).join("\n")}

## Architecture Layers

| Layer | Role | Owned By | FireCuda Dependency |
| --- | --- | --- | --- |
${packet.architectureLayers.map((layer) => `| ${layer.layer} | ${layer.role} | ${layer.ownedBy} | ${layer.fireCudaDependency} |`).join("\n")}

## Map Tables

${packet.mapTables.map((table) => `### ${table.table}

Purpose: ${table.purpose}

Current cardinality: ${table.currentCardinality}

Enterprise scale role: ${table.enterpriseScaleRole}`).join("\n\n")}

## Map Operations

| Operation | Input | Output | Decision Rule |
| --- | --- | --- | --- |
${packet.mapOperations.map((operation) => `| ${operation.operation} | ${operation.input} | ${operation.output} | ${operation.decisionRule} |`).join("\n")}

## Innovation Claims

${packet.innovationClaims.map((claim) => `- ${claim}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildNicheFunctionalityLadderMatchPacket({metrics = lastKnownMetrics, competitionFrameworkMetricPushPacket, experienceCycleNicheOwnershipPacket, fireCudaInnovationMappingLayerPacket, rankFindingBenchmarkPacket} = {}){
  const targetWinRatio = 77
  const cycleScore = experienceCycleNicheOwnershipPacket?.cycleScore || 0
  const featureScore = competitionFrameworkMetricPushPacket?.scores?.featureScore || 0
  const proofScore = competitionFrameworkMetricPushPacket?.scores?.proofScore || 0
  const mapAuthorityScore = fireCudaInnovationMappingLayerPacket?.mapAuthorityScore || 0
  const glbRate = metrics.pageViews ? Number(((metrics.glbPreviewPlays / metrics.pageViews) * 100).toFixed(1)) : 0
  const blogRate = metrics.pageViews ? Number(((metrics.blogViews / metrics.pageViews) * 100).toFixed(1)) : 0
  const baseFunctionalityScore = Math.min(100, Math.round(
    (cycleScore * 0.34)
    + (featureScore * 0.24)
    + (proofScore * 0.18)
    + (mapAuthorityScore * 0.16)
    + (glbRate > 20 ? 8 : 0)
  ))
  const nicheShouts = [
    {
      id: "3d-video-source-observatory",
      exactShout: "DigitalHut turns a video into a source-backed 3D observatory: watch it, inspect the GLB, follow the podcast/source moment, and prove the niche with receipts.",
      niche: "3D visual proof over static pages",
      directFunctionality: ["video presentation", "Babylon/GLB inspection", "podcast/source authority", "watch/blog/category proof", "FireCuda receipt mapping"],
      rankIntent: "3d visual proof for video explanation",
      publicPosture: "This is the lead claim because GLB opens are the strongest last-known behavior."
    },
    {
      id: "video-explained-with-research-map",
      exactShout: "DigitalHut explains what a video is about with a live research map, 3D model context, source links, and a proof route instead of leaving the viewer with a plain embed.",
      niche: "video explained with source proof",
      directFunctionality: ["content radar", "analytics map", "source/backlink bridge", "proof route", "same-topic category lane"],
      rankIntent: "video explained with source map",
      publicPosture: "This claim supports the lead GLB lane and attacks single-medium video pages."
    },
    {
      id: "experience-cycle-seo-proof",
      exactShout: "DigitalHut ranks niches by completed experience cycles: autoplay, GLB open, rotate or zoom, podcast, search, category hop, and proof route behavior.",
      niche: "experience cycle SEO proof",
      directFunctionality: ["cycle scoring", "event receipts", "competitor class matching", "77 percent ladder gate", "FireCuda promotion ledger"],
      rankIntent: "interactive observatory SEO proof system",
      publicPosture: "This is the enterprise engineering stance that separates DigitalHut from filler SEO."
    }
  ]
  const ladderMatches = [
    {
      rung: 1,
      competitorClass: "thin sales page",
      matchingFunctionality: "copy, images, form, maybe a blog",
      digitalhutEdge: "video + GLB inspection + source/podcast + proof route + receipt map",
      winRatio: Math.min(96, baseFunctionalityScore + 12),
      passReason: "DigitalHut has functional layers the competitor class usually does not offer.",
      nextWhenPassed: "Attack local operator and small-company proof pages."
    },
    {
      rung: 2,
      competitorClass: "3D gallery or portfolio page",
      matchingFunctionality: "model preview, title, creator profile, asset page",
      digitalhutEdge: "GLB preview tied to a video topic, analytics explanation, source proof, and route receipts",
      winRatio: Math.min(94, baseFunctionalityScore + 8),
      passReason: "GLB preview rate is already the strongest behavior signal.",
      nextWhenPassed: "Attack Matterport-style tours, Sketchfab-adjacent creator pages, and niche 3D model explainers."
    },
    {
      rung: 3,
      competitorClass: "single-medium video explainer",
      matchingFunctionality: "video embed, title, comments, basic description",
      digitalhutEdge: "video plus 3D context, research map, source/podcast moment, and crawlable proof route",
      winRatio: Math.min(90, baseFunctionalityScore + 2),
      passReason: "DigitalHut needs stronger source/backlink continuation before fully passing this rung.",
      nextWhenPassed: "Attack YouTube-result support pages and creator explainer blogs."
    },
    {
      rung: 4,
      competitorClass: "static research or wiki-style page",
      matchingFunctionality: "article, citations, images, occasional video",
      digitalhutEdge: "research topic becomes an interactive observatory with GLB, timeline/bubble analytics, source moments, and route proof",
      winRatio: Math.min(88, baseFunctionalityScore - 1),
      passReason: "Blog proof exists, but source clicks and search usage need receipts before this becomes a clean win.",
      nextWhenPassed: "Attack niche research blogs and university-adjacent explainers."
    },
    {
      rung: 5,
      competitorClass: "market dashboard or finance result",
      matchingFunctionality: "ticker, chart, news, stock list",
      digitalhutEdge: "company story plus video, GLB environment, podcast/source moment, and analytics highlight feed",
      winRatio: Math.max(35, baseFunctionalityScore - 18),
      passReason: "Held because market opens are still zero in the last-known snapshot.",
      nextWhenPassed: "Attack small finance blogs first, not enterprise finance portals."
    }
  ].map((match) => ({
    ...match,
    status: match.winRatio >= targetWinRatio ? "ladder-pass" : "hold-until-receipts",
    requiredReceiptsToClimb: [
      "same-niche route view",
      "GLB open or rotate/zoom",
      "source/backlink click",
      "proof route continuation",
      "Search Console or origin receipt"
    ]
  }))
  const passedMatches = ladderMatches.filter((match) => match.status === "ladder-pass")
  const heldMatches = ladderMatches.filter((match) => match.status !== "ladder-pass")
  const universalRankPush = {
    currentFloor: rankFindingBenchmarkPacket?.rankUniverseFloor || 236_000_000,
    firstEscapeTarget: 1_000_000,
    authorityTarget: 100_000,
    rule: "DigitalHut only climbs the universal rank ladder when a same-function competitor class is beaten at 77% or better and the receipt map confirms the behavior.",
    nextRankMove: passedMatches.length >= 2
      ? "Push the 3D visual proof and video-source observatory claims into watch/blog/category metadata."
      : "Hold broad rank expansion and collect source, rotate/zoom, search, and category-hop receipts."
  }
  return {
    generatedAt,
    mode: "DigitalHut Niche Functionality Ladder Match",
    status: "niche-functionality-ladder-match-ready",
    purpose: "Prepare exact functionality-based niche claims and match DigitalHut only against competitors with comparable user intent before climbing rank ladders.",
    targetWinRatio,
    baseFunctionalityScore,
    cycleScore,
    featureScore,
    proofScore,
    mapAuthorityScore,
    glbRate,
    blogRate,
    nicheShouts,
    ladderMatches,
    passedMatches: passedMatches.length,
    heldMatches: heldMatches.length,
    universalRankPush,
    leadExactShout: nicheShouts[0].exactShout,
    nextSystemMove: "Use the lead exact shout for 3D visual proof over static pages, push only passed ladder matches, and keep market/static research rungs held until receipts lift the win ratio above 77%."
  }
}

function nicheFunctionalityLadderMatchMarkdown(packet){
  return `# DigitalHut Niche Functionality Ladder Match

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Target win ratio: ${packet.targetWinRatio}%

Base functionality score: ${packet.baseFunctionalityScore}

Cycle score: ${packet.cycleScore}

Feature score: ${packet.featureScore}

Proof score: ${packet.proofScore}

Map authority score: ${packet.mapAuthorityScore}

GLB rate: ${packet.glbRate}%

Blog proof rate: ${packet.blogRate}%

Passed matches: ${packet.passedMatches}

Held matches: ${packet.heldMatches}

Lead exact shout: ${packet.leadExactShout}

## Exact Niche Shouts

${packet.nicheShouts.map((shout) => `### ${shout.niche}

Exact shout: ${shout.exactShout}

Rank intent: ${shout.rankIntent}

Direct functionality:
${shout.directFunctionality.map((item) => `- ${item}`).join("\n")}

Public posture: ${shout.publicPosture}`).join("\n\n")}

## Ladder Matches

| Rung | Competitor Class | Win Ratio | Status | DigitalHut Edge |
| ---: | --- | ---: | --- | --- |
${packet.ladderMatches.map((match) => `| ${match.rung} | ${match.competitorClass} | ${match.winRatio}% | ${match.status} | ${match.digitalhutEdge} |`).join("\n")}

## Match Detail

${packet.ladderMatches.map((match) => `### Rung ${match.rung}: ${match.competitorClass}

Matching functionality: ${match.matchingFunctionality}

DigitalHut edge: ${match.digitalhutEdge}

Pass reason: ${match.passReason}

Next when passed: ${match.nextWhenPassed}

Required receipts to climb:
${match.requiredReceiptsToClimb.map((receipt) => `- ${receipt}`).join("\n")}`).join("\n\n")}

## Universal Rank Push

- Current floor: #${packet.universalRankPush.currentFloor.toLocaleString("en-US")}
- First escape target: top ${packet.universalRankPush.firstEscapeTarget.toLocaleString("en-US")}
- Authority target: top ${packet.universalRankPush.authorityTarget.toLocaleString("en-US")}
- Rule: ${packet.universalRankPush.rule}
- Next rank move: ${packet.universalRankPush.nextRankMove}

Next system move: ${packet.nextSystemMove}
`
}

function buildLadderReceiptAccelerationPacket({metrics = lastKnownMetrics, nicheFunctionalityLadderMatchPacket, fireCudaInnovationMappingLayerPacket} = {}){
  const targetWinRatio = nicheFunctionalityLadderMatchPacket?.targetWinRatio || 77
  const heldMatches = (nicheFunctionalityLadderMatchPacket?.ladderMatches || []).filter((match) => match.status !== "ladder-pass")
  const accelerationRows = heldMatches.map((match) => {
    const gapToPass = Math.max(0, targetWinRatio - match.winRatio)
    const primaryReceipts = []
    if(/3D gallery|portfolio/i.test(match.competitorClass)){
      primaryReceipts.push("glb_rotated_or_zoomed", "glb_source_opened", "same_topic_model_reopened")
    } else if(/video/i.test(match.competitorClass)){
      primaryReceipts.push("source_backlink_click", "watch_to_blog_continuation", "podcast_source_completed")
    } else if(/research|wiki/i.test(match.competitorClass)){
      primaryReceipts.push("proof_route_opened", "source_backlink_click", "observatory_search_used")
    } else if(/market|finance/i.test(match.competitorClass)){
      primaryReceipts.push("market_view_open", "ticker_search", "market_source_click")
    } else {
      primaryReceipts.push("same_niche_route_view", "proof_route_continuation", "source_backlink_click")
    }
    return {
      rung: match.rung,
      competitorClass: match.competitorClass,
      currentWinRatio: match.winRatio,
      targetWinRatio,
      gapToPass,
      status: gapToPass <= 3 ? "near-pass-accelerate-now" : "needs-receipt-buildout",
      primaryReceipts,
      exactAction: gapToPass <= 3
        ? "Prioritize this rung in the next measurement cycle because one strong receipt class can push it over 77%."
        : "Hold broad SEO push and build the missing interaction/source receipts first.",
      seoUseWhenPassed: match.nextWhenPassed
    }
  })
  const receiptQueues = [
    {
      queue: "GLB manipulation receipts",
      targetEvents: ["glb_rotated_or_zoomed", "glb_zoomed", "glb_orbit_duration_10s", "glb_model_source_opened"],
      unlocks: "Push 3D gallery/portfolio rung above 77%.",
      currentRead: `${metrics.glbPreviewPlays} GLB opens, but rotate/zoom receipts are not present in the last-known local snapshot.`
    },
    {
      queue: "Source and backlink receipts",
      targetEvents: ["source_backlink_click", "external_referrer_captured", "watch_to_blog_continuation", "blog_to_watch_return"],
      unlocks: "Push video explainer and static research rungs toward 77%.",
      currentRead: `${metrics.blogViews} blog proof views and ${metrics.podcastInterrupts} podcast/source moments need source-click confirmation.`
    },
    {
      queue: "Search and category receipts",
      targetEvents: ["observatory_search_used", "category_lane_selected", "next_episode_same_category", "category_to_proof_route"],
      unlocks: "Proves DigitalHut is being used as an observatory system, not just watched.",
      currentRead: `${metrics.searchInteractions} search events and no local category-hop count in the last-known packet.`
    },
    {
      queue: "Market receipts",
      targetEvents: ["market_view_open", "ticker_search", "market_video_connected", "market_glb_opened"],
      unlocks: "Only then should the market dashboard rung enter real competition.",
      currentRead: `${metrics.marketOpens} market opens; market remains held.`
    }
  ]
  const priority = accelerationRows
    .slice()
    .sort((a, b) => a.gapToPass - b.gapToPass)
    .slice(0, 3)
  return {
    generatedAt,
    mode: "DigitalHut Ladder Receipt Acceleration",
    status: "ladder-receipt-acceleration-ready",
    purpose: "Turn held ladder matches into exact receipt queues so DigitalHut can reach 77%+ win ratios without broad filler SEO.",
    targetWinRatio,
    passedMatches: nicheFunctionalityLadderMatchPacket?.passedMatches || 0,
    heldMatches: nicheFunctionalityLadderMatchPacket?.heldMatches || heldMatches.length,
    fireCudaMapAuthorityScore: fireCudaInnovationMappingLayerPacket?.mapAuthorityScore || 0,
    accelerationRows,
    receiptQueues,
    priority,
    nextSystemMove: "Attack the near-pass 3D gallery/portfolio rung first by capturing GLB rotate/zoom and source-open receipts, then use source/backlink continuation to lift video and research rungs."
  }
}

function ladderReceiptAccelerationMarkdown(packet){
  return `# DigitalHut Ladder Receipt Acceleration

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Target win ratio: ${packet.targetWinRatio}%

Passed matches: ${packet.passedMatches}

Held matches: ${packet.heldMatches}

FireCuda map authority score: ${packet.fireCudaMapAuthorityScore}

## Priority Rungs

| Rung | Competitor Class | Current Win | Gap To Pass | Status | Exact Action |
| ---: | --- | ---: | ---: | --- | --- |
${packet.priority.map((row) => `| ${row.rung} | ${row.competitorClass} | ${row.currentWinRatio}% | ${row.gapToPass}% | ${row.status} | ${row.exactAction} |`).join("\n")}

## Acceleration Rows

${packet.accelerationRows.map((row) => `### Rung ${row.rung}: ${row.competitorClass}

Current win ratio: ${row.currentWinRatio}%

Gap to 77%: ${row.gapToPass}%

Status: ${row.status}

Primary receipts:
${row.primaryReceipts.map((receipt) => `- ${receipt}`).join("\n")}

Exact action: ${row.exactAction}

SEO use when passed: ${row.seoUseWhenPassed}`).join("\n\n")}

## Receipt Queues

${packet.receiptQueues.map((queue) => `### ${queue.queue}

Target events:
${queue.targetEvents.map((event) => `- ${event}`).join("\n")}

Unlocks: ${queue.unlocks}

Current read: ${queue.currentRead}`).join("\n\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildClientRankMovementSnapshotPacket({
  metrics = lastKnownMetrics,
  backlinkAuthorityPacket,
  masterListExpansionGatePacket,
  ladderReceiptAccelerationPacket,
  routePairEvidenceLedgerPacket,
  movementProofAudienceOriginPacket
} = {}){
  const pageViews = metrics.pageViews || 0
  const autoplayRate = pageViews ? Number(((metrics.autoplayStarts / pageViews) * 100).toFixed(2)) : 0
  const glbRate = pageViews ? Number(((metrics.glbPreviewPlays / pageViews) * 100).toFixed(2)) : 0
  const podcastRate = pageViews ? Number(((metrics.podcastInterrupts / pageViews) * 100).toFixed(2)) : 0
  const blogRate = pageViews ? Number(((metrics.blogViews / pageViews) * 100).toFixed(2)) : 0
  const searchRate = pageViews ? Number(((metrics.searchInteractions / pageViews) * 100).toFixed(2)) : 0
  const marketRate = pageViews ? Number(((metrics.marketOpens / pageViews) * 100).toFixed(2)) : 0
  const authorityPlans = backlinkAuthorityPacket?.routeAuthorityPlans || []
  const regionMarketTargets = [
    {
      regionMarket: "local city food and lunch intent",
      route: "/watch/looking-for-lunch-visual-observatory",
      liveHitStatus: "targeted-not-live-region-refreshed",
      authorityCategories: ["local restaurant guides", "food review blogs", "city tourism directories", "neighborhood newsletters"],
      role: "Capture everyday off-time searches and move them into watch/blog/source proof."
    },
    {
      regionMarket: "airport, rideshare, hotel, and commuter intent",
      route: "/watch/calling-an-uber-visual-trip-guide",
      liveHitStatus: "targeted-not-live-region-refreshed",
      authorityCategories: ["airport travel guides", "rideshare pickup explainers", "hotel concierge pages", "city mobility resources"],
      role: "Turn trip planning into a visual observatory route with second-action proof."
    },
    {
      regionMarket: "developer finance and market research intent",
      route: "/watch/current-market-video-observatory",
      liveHitStatus: "targeted-not-live-region-refreshed",
      authorityCategories: ["market research blogs", "company analysis newsletters", "developer finance communities", "TradingView idea pages"],
      role: "Keep market queries in market view until ticker/source behavior proves expansion."
    },
    {
      regionMarket: "home project, real estate, contractor, and DIY planning intent",
      route: "/watch/home-project-3d-visual-planner",
      liveHitStatus: "targeted-not-live-region-refreshed",
      authorityCategories: ["home improvement blogs", "contractor portfolios", "DIY planning guides", "real estate staging pages"],
      role: "Use GLB/3D source proof to compete beyond a normal home project article."
    },
    {
      regionMarket: "grocery, review, deal, and buying-research intent",
      route: "/watch/grocery-shopping-3d-experience",
      liveHitStatus: "targeted-not-live-region-refreshed",
      authorityCategories: ["consumer review blogs", "shopping guides", "local grocery resources", "deal research newsletters"],
      role: "Turn mundane product research into a ranked DigitalHut proof loop."
    }
  ]
  const affectedSectors = [
    {
      sector: "3D gallery and portfolio pages",
      currentSignal: `${metrics.glbPreviewPlays} GLB preview plays in the last-known packet`,
      seoEffect: "Strongest current sales node; needs rotate/zoom/source-open receipts to pass the 77% ladder gate.",
      status: "near-pass"
    },
    {
      sector: "video explainer and creator support pages",
      currentSignal: `${metrics.autoplayStarts} autoplay start and ${metrics.podcastInterrupts} podcast/source interrupts in the last-known packet`,
      seoEffect: "Needs watch-to-blog and source/backlink continuation before broader ranking expansion.",
      status: "build-receipts"
    },
    {
      sector: "research/wiki-style pages",
      currentSignal: `${metrics.searchInteractions} search interactions in the last-known packet`,
      seoEffect: "Search intent is not proven yet, so research expansion stays gated.",
      status: "held"
    },
    {
      sector: "market and finance dashboards",
      currentSignal: `${metrics.marketOpens} market opens in the last-known packet`,
      seoEffect: "Market SEO stays held until market view, ticker search, and market source-click receipts exist.",
      status: "held"
    },
    {
      sector: "blog/watch proof routes",
      currentSignal: `${metrics.blogViews} blog views and ${routePairEvidenceLedgerPacket?.pairCount || 0} route pairs staged`,
      seoEffect: "Proof pages exist as the display proof; expansion waits for Search Console and Supabase evidence.",
      status: "staged"
    }
  ]
  const backlinkSystem = authorityPlans.slice(0, 6).map((plan) => ({
    route: plan.route,
    canonical: plan.canonical,
    stage: plan.promotionStage,
    status: plan.status,
    authorityCategories: plan.authorityCategories,
    anchors: plan.backlinkAnchors,
    eventsToProve: plan.measurementEvents
  }))
  const ladderMatches = ladderReceiptAccelerationPacket?.accelerationRows || []
  return {
    generatedAt,
    mode: "DigitalHut Client Rank Movement Snapshot",
    status: "client-rank-movement-board-ready",
    guardrail: "Page views, regions, clicks, and ladder lifts are separated between last-known local receipts and live-refreshed proof. Do not claim live movement without Supabase, Vercel, Search Console, or analytics refresh evidence.",
    refreshedPageViews: {
      status: metrics.liveRefreshStatus === "not-live-refreshed-this-cycle" ? "not-live-refreshed" : "refreshed",
      pageViews: metrics.pageViews,
      uniqueVisitors: metrics.uniqueVisitors,
      searchInteractions: metrics.searchInteractions,
      autoplayStarts: metrics.autoplayStarts,
      glbPreviewPlays: metrics.glbPreviewPlays,
      podcastInterrupts: metrics.podcastInterrupts,
      marketOpens: metrics.marketOpens,
      blogViews: metrics.blogViews,
      source: metrics.source,
      capturedAt: metrics.capturedAt,
      liveRefreshStatus: metrics.liveRefreshStatus
    },
    interactionRates: {
      autoplayRatePct: autoplayRate,
      glbPreviewRatePct: glbRate,
      podcastInterruptRatePct: podcastRate,
      blogProofRatePct: blogRate,
      searchRatePct: searchRate,
      marketOpenRatePct: marketRate
    },
    seoMasterListRole: {
      totalRankSlots: masterListExpansionGatePacket?.totalVariationCapacity || 0,
      openSlots: masterListExpansionGatePacket?.allowedSlotTotal || 0,
      heldSlots: masterListExpansionGatePacket?.heldSlotTotal || 0,
      gateStatus: masterListExpansionGatePacket?.status || "unknown",
      systemRole: "FireCuda owns the full variation universe, but only receipt-backed watch/blog/category/source/GLB/podcast/market routes should unlock public ranking expansion."
    },
    regionMarketTargets,
    backlinkSystem,
    affectedSectors,
    ladderMatches,
    movementProofStatus: movementProofAudienceOriginPacket?.movementProofStatus || "unknown",
    originProofStatus: movementProofAudienceOriginPacket?.originProofStatus || "unknown",
    nextSystemMove: "Wire a live Supabase/Vercel/Search Console refresh into this board, then promote only the sectors where second-action receipts prove users are doing more than opening the page."
  }
}

function clientRankMovementSnapshotMarkdown(packet){
  return `# DigitalHut Client Rank Movement Snapshot

Generated: ${packet.generatedAt}

Status: ${packet.status}

Guardrail: ${packet.guardrail}

## Refreshed Page Views

Status: ${packet.refreshedPageViews.status}

Page views: ${packet.refreshedPageViews.pageViews}

Participating browser IDs: ${packet.refreshedPageViews.uniqueVisitors}

Search interactions: ${packet.refreshedPageViews.searchInteractions}

Autoplay starts: ${packet.refreshedPageViews.autoplayStarts}

GLB preview plays: ${packet.refreshedPageViews.glbPreviewPlays}

Podcast interrupts: ${packet.refreshedPageViews.podcastInterrupts}

Market opens: ${packet.refreshedPageViews.marketOpens}

Blog views: ${packet.refreshedPageViews.blogViews}

Source: ${packet.refreshedPageViews.source}

Live refresh status: ${packet.refreshedPageViews.liveRefreshStatus}

## Interaction Rates

| Signal | Rate |
| --- | ---: |
| Autoplay | ${packet.interactionRates.autoplayRatePct}% |
| GLB preview | ${packet.interactionRates.glbPreviewRatePct}% |
| Podcast interrupt | ${packet.interactionRates.podcastInterruptRatePct}% |
| Blog proof | ${packet.interactionRates.blogProofRatePct}% |
| Search | ${packet.interactionRates.searchRatePct}% |
| Market open | ${packet.interactionRates.marketOpenRatePct}% |

## SEO Master List Role

Total rank slots: ${packet.seoMasterListRole.totalRankSlots}

Open slots: ${packet.seoMasterListRole.openSlots}

Held slots: ${packet.seoMasterListRole.heldSlots}

Gate status: ${packet.seoMasterListRole.gateStatus}

System role: ${packet.seoMasterListRole.systemRole}

## Current Region Markets

${packet.regionMarketTargets.map((market) => `### ${market.regionMarket}

Route: ${market.route}

Live hit status: ${market.liveHitStatus}

Authority categories: ${market.authorityCategories.join(", ")}

Role: ${market.role}`).join("\n\n")}

## Backlink Long-Tail System

${packet.backlinkSystem.map((plan) => `### ${plan.route}

Stage: ${plan.stage}

Status: ${plan.status}

Authority categories: ${plan.authorityCategories.join(", ")}

Anchors: ${plan.anchors.join(" | ")}

Events to prove: ${plan.eventsToProve.join(", ")}`).join("\n\n")}

## Affected Sectors

| Sector | Current Signal | SEO Effect | Status |
| --- | --- | --- | --- |
${packet.affectedSectors.map((sector) => `| ${sector.sector} | ${sector.currentSignal} | ${sector.seoEffect} | ${sector.status} |`).join("\n")}

## Ladder Matches

| Rung | Competitor Class | Current Win | Gap | Status |
| ---: | --- | ---: | ---: | --- |
${packet.ladderMatches.map((match) => `| ${match.rung} | ${match.competitorClass} | ${match.currentWinRatio}% | ${match.gapToPass}% | ${match.status} |`).join("\n")}

Movement proof: ${packet.movementProofStatus}

Origin proof: ${packet.originProofStatus}

Next system move: ${packet.nextSystemMove}
`
}

function buildFullSystemLadderPushPacket({
  metrics = lastKnownMetrics,
  clientRankMovementSnapshotPacket,
  ladderReceiptAccelerationPacket,
  fireCudaInnovationMappingLayerPacket,
  supabaseMeasurementContract,
  deployReadinessAudit,
  deploymentRuntimeCompatibilityPacket,
  receiptEvidenceIntakeSchemaPacket,
  backlinkAuthorityPacket
} = {}){
  const liveRefreshed = clientRankMovementSnapshotPacket?.refreshedPageViews?.status === "refreshed"
  const ladderRows = (ladderReceiptAccelerationPacket?.accelerationRows || []).map((row) => {
    const proofStatus = row.gapToPass <= 3 ? "one-receipt-class-from-pass" : row.gapToPass <= 12 ? "needs-second-action-proof" : "hold-until-core-events-fire"
    const requiredSystemPush = row.primaryReceipts.map((receipt) => {
      if(/glb|model/i.test(receipt)) return "Babylon/GLB renderer receipt"
      if(/source|backlink|blog|podcast/i.test(receipt)) return "Supabase source/backlink and continuation receipt"
      if(/search|proof|category/i.test(receipt)) return "Search intent and proof-route receipt"
      if(/market|ticker/i.test(receipt)) return "Market API and source-click receipt"
      return "General human behavior receipt"
    })
    return {
      rung: row.rung,
      competitorClass: row.competitorClass,
      currentWinRatio: row.currentWinRatio,
      targetWinRatio: row.targetWinRatio,
      gapToPass: row.gapToPass,
      status: row.status,
      proofStatus,
      requiredReceipts: row.primaryReceipts,
      requiredSystemPush: [...new Set(requiredSystemPush)],
      rankDropStatus: liveRefreshed ? "eligible-for-live-rank-compare" : "pending-live-rank-refresh",
      pushDecision: row.gapToPass <= 3
        ? "Push this first. It is the closest functionality-compatible ladder match."
        : row.gapToPass <= 12
          ? "Queue after GLB proof. Needs source and search behavior before rank expansion."
          : "Hold. Do not spend broad SEO slots until real client behavior appears."
    }
  })
  const fullSystemPushes = [
    {
      system: "FireCuda human positioning map",
      currentRole: `Hold the ${seoSearchClaimSummary.totalIndividualRanks.toLocaleString("en-US")}-slot internal universe while keeping expansion closed until real receipts unlock a lane.`,
      currentStatus: fireCudaInnovationMappingLayerPacket?.status || "unknown",
      proofNeeded: "Human-role buckets: everyday viewer, researcher, developer, creator, market watcher, digital nomad.",
      nextPush: "Prioritize the 3D/GLB human role because it is closest to a 77% ladder win."
    },
    {
      system: "Supabase real human database",
      currentRole: "Store page views, GLB opens, rotate/zoom, source clicks, podcast completions, search runs, category hops, and market opens.",
      currentStatus: supabaseMeasurementContract?.status || "unknown",
      proofNeeded: "Live refreshed events by route, region, role, and second action.",
      nextPush: "Turn GLB preview plays into rotate/zoom/source-open rows."
    },
    {
      system: "Google Cloud and search proof",
      currentRole: "Provide API-backed discovery, YouTube/category context, source metadata, and Search Console proof when connected.",
      currentStatus: clientRankMovementSnapshotPacket?.refreshedPageViews?.liveRefreshStatus || "not-live-refreshed-this-cycle",
      proofNeeded: "Search Console impressions, clicks, average position, query, country, and page.",
      nextPush: "Attach live rank deltas to the route-pair evidence ledger."
    },
    {
      system: "GitHub and Vercel deployment proof",
      currentRole: "Ship stable route metadata, public JSON boards, sitemap, llms.txt, structured data, and API-facing proof artifacts.",
      currentStatus: deployReadinessAudit?.status || "unknown",
      proofNeeded: "Cloud build success plus production URL response after meaningful batches.",
      nextPush: "Deploy after this full-system ladder packet is generated cleanly."
    },
    {
      system: "Babylon rendering and GLB proof",
      currentRole: "Separate DigitalHut from thin pages by proving interactive 3D usefulness.",
      currentStatus: `${metrics.glbPreviewPlays || 0} last-known GLB preview plays`,
      proofNeeded: "Rotate, zoom, orbit duration, source click, same-topic model reopen.",
      nextPush: "This is the closest rank lever: push the 3D gallery rung from 74% to 77%+."
    },
    {
      system: "Codex compare and contrast reasoning",
      currentRole: "Choose ladder fights based on compatibility, receipts, user usefulness, and rank movement evidence.",
      currentStatus: "active-overseer",
      proofNeeded: "Do not unlock broad SEO until live client behavior proves a lane.",
      nextPush: "Hold filler. Promote only receipt-backed exact niches."
    }
  ]
  const backlinkPush = (backlinkAuthorityPacket?.routeAuthorityPlans || []).slice(0, 5).map((plan) => ({
    route: plan.route,
    stage: plan.promotionStage,
    status: plan.status,
    authorityTargets: plan.authorityCategories,
    anchorSet: plan.backlinkAnchors,
    measuredBy: plan.measurementEvents
  }))
  return {
    generatedAt,
    mode: "DigitalHut Full System Ladder Push",
    status: "full-system-ladder-push-ready",
    liveRankDropStatus: liveRefreshed ? "ready-to-compare-live-rank-drop" : "pending-live-rank-refresh",
    guardrail: "Live rank drops require refreshed Search Console, Supabase, Vercel, or analytics proof. This packet lines up the push; it does not fabricate movement.",
    rankUniverseFloor: 236000000,
    nextRankEscapeTarget: 1000000,
    nextVisitorTarget: 50000,
    fullSystemPushes,
    ladderRows,
    backlinkPush,
    apiAndRenderStack: {
      youtube: "category/content radar source",
      googleCloud: "speech/search/source infrastructure when live keys and services are connected",
      supabase: "human behavior and SEO receipt database",
      vercel: "production deployment and public proof artifact host",
      github: "versioned source and change history",
      babylon: "3D/GLB renderer proof layer",
      fireCuda: "local innovation map and rank universe staging layer"
    },
    currentMetricRead: clientRankMovementSnapshotPacket?.refreshedPageViews || {},
    nextSystemMove: "Deploy the full-system ladder packet after local generation, then wait for live receipts before claiming rank drops. First active match remains the 3D gallery/portfolio rung."
  }
}

function fullSystemLadderPushMarkdown(packet){
  return `# DigitalHut Full System Ladder Push

Generated: ${packet.generatedAt}

Status: ${packet.status}

Live rank drop status: ${packet.liveRankDropStatus}

Guardrail: ${packet.guardrail}

Rank universe floor: ${packet.rankUniverseFloor}

Next rank escape target: ${packet.nextRankEscapeTarget}

Next visitor target: ${packet.nextVisitorTarget}

## Full System Pushes

| System | Current Status | Proof Needed | Next Push |
| --- | --- | --- | --- |
${packet.fullSystemPushes.map((push) => `| ${push.system} | ${push.currentStatus} | ${push.proofNeeded} | ${push.nextPush} |`).join("\n")}

## Ladder Match Lineup

| Rung | Competitor Class | Current Win | Gap | Rank Drop Status | Push Decision |
| ---: | --- | ---: | ---: | --- | --- |
${packet.ladderRows.map((row) => `| ${row.rung} | ${row.competitorClass} | ${row.currentWinRatio}% | ${row.gapToPass}% | ${row.rankDropStatus} | ${row.pushDecision} |`).join("\n")}

## Required Receipts By Rung

${packet.ladderRows.map((row) => `### Rung ${row.rung}: ${row.competitorClass}

Proof status: ${row.proofStatus}

Required receipts: ${row.requiredReceipts.join(", ")}

Required system push: ${row.requiredSystemPush.join(", ")}`).join("\n\n")}

## Backlink Push

${packet.backlinkPush.map((plan) => `### ${plan.route}

Stage: ${plan.stage}

Status: ${plan.status}

Authority targets: ${plan.authorityTargets.join(", ")}

Anchor set: ${plan.anchorSet.join(" | ")}

Measured by: ${plan.measuredBy.join(", ")}`).join("\n\n")}

## API And Render Stack

${Object.entries(packet.apiAndRenderStack).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildSystemClaimVerificationPacket({packageJson, vercelJson, deploymentRuntimeCompatibilityPacket, supabaseMeasurementContract, fullSystemLadderPushPacket} = {}){
  const packageText = packageJson || ""
  const vercelText = vercelJson || ""
  const hasDependency = (name) => packageText.includes(`"${name}"`)
  const hasScript = (name) => packageText.includes(`"${name}"`)
  const envChecks = [
    {
      id: "openai-billing-admin-key",
      claim: "OpenAI API billing access can be checked by a private backend endpoint.",
      envNames: ["OPENAI_ADMIN_KEY", "OPENAI_ORG_ADMIN_KEY", "DIGITALHUT_ADMIN_STATUS_TOKEN"],
      localPresence: "not-read-from-env-in-generator",
      verificationRoute: "/api/provider-status?scope=openai-billing",
      status: "private-endpoint-added-admin-token-required"
    },
    {
      id: "supabase-database",
      claim: "Supabase backs human behavior and SEO receipt storage.",
      envNames: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
      localPresence: hasDependency("@supabase/supabase-js") ? "project-wired" : "missing-dependency",
      verificationRoute: "/api/provider-status",
      status: supabaseMeasurementContract?.status || "unknown"
    },
    {
      id: "google-cloud",
      claim: "Google Cloud backs YouTube, speech, text-to-speech, and cloud service claims when env keys are present.",
      envNames: ["GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_CLOUD_PROJECT", "GOOGLE_CLOUD_API_KEY", "GOOGLE_SPEECH_API_KEY", "GOOGLE_TEXT_TO_SPEECH_API_KEY", "YOUTUBE_API_KEY"],
      localPresence: "env-presence-checked-by-provider-status",
      verificationRoute: "/api/provider-status",
      status: "provider-status-backed"
    },
    {
      id: "vercel-production",
      claim: "Vercel backs the public deployment and API routes.",
      envNames: ["VERCEL_OIDC_TOKEN"],
      localPresence: vercelText.includes('"framework": "vite"') ? "vercel-vite-config-present" : "vercel-config-needs-check",
      verificationRoute: "/api/provider-status",
      status: deploymentRuntimeCompatibilityPacket?.status || "unknown"
    }
  ]
  const nodeServer = {
    packageEngine: packageText.includes('"node": "24.x"') ? "node-24-configured" : "node-engine-not-confirmed",
    backendScript: hasScript("backend") ? "backend-script-present" : "backend-script-missing",
    startScript: hasScript("start") ? "start-script-present" : "start-script-missing",
    devScript: hasScript("dev") ? "vite-dev-script-present" : "dev-script-missing",
    livePortStatus: "not-detected-in-last-local-port-check",
    verificationNeeded: "Run a local listener check when the server is expected to be active."
  }
  const renderStack = {
    babylonCore: hasDependency("@babylonjs/core") || hasDependency("babylonjs"),
    babylonLoaders: hasDependency("@babylonjs/loaders") || hasDependency("babylonjs-loaders"),
    threeFiber: hasDependency("@react-three/fiber"),
    drei: hasDependency("@react-three/drei"),
    modelViewer: hasDependency("@google/model-viewer"),
    status: (hasDependency("@babylonjs/core") || hasDependency("babylonjs")) ? "babylon-render-stack-present" : "babylon-render-stack-missing"
  }
  const fullVideoObservatoryCapabilities = [
    {
      capability: "GLB and 3D rendering",
      status: renderStack.status,
      proof: "Babylon dependencies, model-viewer, asset conversion API, Sketchfab API, GLB promotion lanes, and GLB receipt queues.",
      verifies: "DigitalHut can claim an interactive 3D renderer layer when GLB route behavior is live-measured."
    },
    {
      capability: "Apple/podcast source lane",
      status: "podcast-api-and-promotion-lanes-present",
      proof: "Podcast search API, podcast source promotion packet, podcast interrupt receipts, and source-completion measurement contract.",
      verifies: "DigitalHut can claim a podcast/source moment lane; Apple-specific branding should be used only when the source is actually Apple Podcasts or compatible metadata."
    },
    {
      capability: "YouTube analytics and content radar",
      status: "youtube-search-and-observatory-feed-present",
      proof: "YouTube search API, observatory feed API, Google speech analyzer, insight map, category queues, and search-intent promotion packet.",
      verifies: "DigitalHut can claim video-aware analytics when API/search/transcript/source metadata is available."
    },
    {
      capability: "Full-video observatory presentation",
      status: fullSystemLadderPushPacket?.status || "unknown",
      proof: "Autoplay, category lanes, GLB, podcast, source/backlink, market, timeline, watch/blog proof routes, and Supabase receipt contracts.",
      verifies: "DigitalHut can claim a full presentation system, with live usefulness proven by second-action receipts."
    },
    {
      capability: "Codex reasoning and SEO oversight",
      status: "codex-overseer-artifact-backed",
      proof: "FireCuda innovation map, ladder receipt acceleration, full-system ladder push, client rank movement snapshot, and system claim verification packets.",
      verifies: "DigitalHut can claim Codex-supervised refinement as an operator workflow, not an autonomous public bot."
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut System Claim Verification",
    status: "system-claim-verification-ready",
    guardrail: "Only backend API usage billing can be verified by OpenAI Admin API. Codex/ChatGPT subscription billing remains account-side unless OpenAI provides a plan entitlement API for this surface.",
    codexProClaim: {
      claimedTier: "$100 Codex Pro / Pro High user account claim",
      verificationStatus: "user-attested-not-api-verifiable-from-project",
      publicClaimUse: "Use as founder/operator context, not as an automated billing proof."
    },
    openaiBillingApi: {
      route: "/api/provider-status?scope=openai-billing",
      requiredEnv: ["OPENAI_ADMIN_KEY", "OPENAI_ORG_ADMIN_KEY", "DIGITALHUT_ADMIN_STATUS_TOKEN"],
      exposedToClient: "401 private unless admin token is provided",
      secretExposure: "never-return-admin-key",
      verifies: "OpenAI API organization costs endpoint access, not private cost totals or Codex subscription entitlement"
    },
    nodeServer,
    renderStack,
    fullVideoObservatoryCapabilities,
    envChecks,
    cloudDatabaseClaim: {
      supabaseStatus: supabaseMeasurementContract?.status || "unknown",
      googleCloudStatus: "provider-status-backed",
      vercelStatus: deploymentRuntimeCompatibilityPacket?.status || "unknown",
      githubStatus: "version-control-backed-when-committed",
      ladderPushStatus: fullSystemLadderPushPacket?.status || "unknown"
    },
    nextSystemMove: "Add OPENAI_ADMIN_KEY or OPENAI_ORG_ADMIN_KEY plus DIGITALHUT_ADMIN_STATUS_TOKEN only in Vercel/server env, then call /api/provider-status?scope=openai-billing with the admin token to verify API cost endpoint access without exposing secrets or totals."
  }
}

function systemClaimVerificationMarkdown(packet){
  return `# DigitalHut System Claim Verification

Generated: ${packet.generatedAt}

Status: ${packet.status}

Guardrail: ${packet.guardrail}

## Codex Pro Claim

Claimed tier: ${packet.codexProClaim.claimedTier}

Verification status: ${packet.codexProClaim.verificationStatus}

Public claim use: ${packet.codexProClaim.publicClaimUse}

## OpenAI Billing API

Route: ${packet.openaiBillingApi.route}

Required env: ${packet.openaiBillingApi.requiredEnv.join(", ")}

Exposed to client: ${packet.openaiBillingApi.exposedToClient}

Secret exposure: ${packet.openaiBillingApi.secretExposure}

Verifies: ${packet.openaiBillingApi.verifies}

## Node Server

| Check | Status |
| --- | --- |
| Package engine | ${packet.nodeServer.packageEngine} |
| Backend script | ${packet.nodeServer.backendScript} |
| Start script | ${packet.nodeServer.startScript} |
| Dev script | ${packet.nodeServer.devScript} |
| Live port | ${packet.nodeServer.livePortStatus} |

## Render Stack

| Check | Status |
| --- | --- |
| Babylon core | ${packet.renderStack.babylonCore} |
| Babylon loaders | ${packet.renderStack.babylonLoaders} |
| React Three Fiber | ${packet.renderStack.threeFiber} |
| Drei helpers | ${packet.renderStack.drei} |
| Model viewer | ${packet.renderStack.modelViewer} |
| Overall | ${packet.renderStack.status} |

## Full Video Observatory Capabilities

${packet.fullVideoObservatoryCapabilities.map((item) => `### ${item.capability}

Status: ${item.status}

Proof: ${item.proof}

Verifies: ${item.verifies}`).join("\n\n")}

## Cloud And Database Checks

${packet.envChecks.map((check) => `### ${check.id}

Claim: ${check.claim}

Env names: ${check.envNames.join(", ")}

Local presence: ${check.localPresence}

Verification route: ${check.verificationRoute}

Status: ${check.status}`).join("\n\n")}

Next system move: ${packet.nextSystemMove}
`
}

function buildGoogleSearchConsoleRankVerificationPacket({
  seoProof,
  routeCoverageAudit,
  seoSubmissionQueue,
  clientRankMovementSnapshotPacket,
  fullSystemLadderPushPacket,
  systemClaimVerificationPacket,
  deployReadinessAudit
} = {}){
  const sitemapUrls = seoProof?.sitemapUrls || 0
  const proofRoutes = (seoProof?.watchProofRoutes || 0) + (seoProof?.blogRoutes || 0) + (seoProof?.categoryRoutes || 0)
  const routeGroups = [
    {
      group: "watch proof",
      count: seoProof?.watchProofRoutes || 0,
      role: "Google-style sitemap discovery surface for video observatory routes."
    },
    {
      group: "blog proof",
      count: seoProof?.blogRoutes || 0,
      role: "Readable long-tail support layer that explains why each watch route exists."
    },
    {
      group: "category proof",
      count: seoProof?.categoryRoutes || 0,
      role: "Internal linking and topic-cluster layer for route families."
    },
    {
      group: "launch targets",
      count: routeCoverageAudit?.launchTargetRoutes || 0,
      role: "First rank push routes with metadata and proof alignment."
    }
  ]
  const searchReadinessGates = [
    {
      gate: "sitemap present",
      status: sitemapUrls > 0 ? "pass" : "missing",
      read: `${sitemapUrls} sitemap URLs generated.`
    },
    {
      gate: "metadata matches sitemap",
      status: routeCoverageAudit?.status || "unknown",
      read: routeCoverageAudit?.read || "Route coverage not available."
    },
    {
      gate: "Google live read",
      status: "pending-search-console-proof",
      read: "Needs /api/provider-status?scope=google-search-console to return sitemap and search analytics rows before claiming real Google rank movement."
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut Google Search Console Rank Verification",
    status: "google-rank-verification-ready",
    guardrail: "This packet is not a made-up ranking system. It reflects sitemap/metadata readiness and waits for real Google Search Console sitemap, query, page, click, impression, CTR, and average-position rows before claiming rank movement.",
    googleLiveRankStatus: "pending-search-console-proof",
    googleProviderRoute: "/api/provider-status?scope=google-search-console",
    rankHigherStatus: "not-claimed-until-search-console-comparison",
    googleSitemapReflection: {
      sitemapUrls,
      proofRoutes,
      metadataRoutes: routeCoverageAudit?.metadataRoutes || 0,
      sitemapProofRoutes: routeCoverageAudit?.sitemapProofRoutes || 0,
      launchTargetRoutes: routeCoverageAudit?.launchTargetRoutes || 0,
      coverageStatus: routeCoverageAudit?.status || "unknown",
      immediateSubmissionRoutes: seoSubmissionQueue?.immediateSubmissionCount || 0,
      supportSubmissionRoutes: seoSubmissionQueue?.supportRouteCount || 0
    },
    searchConsoleFieldsRequired: ["query", "page", "country", "clicks", "impressions", "ctr", "position"],
    rankHigherRule: "A route/query is only marked ranked higher when the latest Search Console average position is numerically lower than the previous stored average position for the same query+page.",
    routeGroups,
    searchReadinessGates,
    publicClaimLanguage: "DigitalHut has sitemap-backed proof routes ready for Google to read. Real Google rank movement is pending Search Console proof.",
    nextSystemMove: "Add GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_SEARCH_CONSOLE_SITE_URL, add the service account in Search Console, then call /api/provider-status?scope=google-search-console and store snapshots for rank-higher comparisons."
  }
}

function googleSearchConsoleRankVerificationMarkdown(packet){
  return `# DigitalHut Google Search Console Rank Verification

Generated: ${packet.generatedAt}

Status: ${packet.status}

Guardrail: ${packet.guardrail}

Google live rank status: ${packet.googleLiveRankStatus}

Google provider route: ${packet.googleProviderRoute}

Rank higher status: ${packet.rankHigherStatus}

## Google Sitemap Reflection

| Signal | Count |
| --- | ---: |
| Sitemap URLs | ${packet.googleSitemapReflection.sitemapUrls} |
| Sitemap proof routes | ${packet.googleSitemapReflection.sitemapProofRoutes} |
| Metadata routes | ${packet.googleSitemapReflection.metadataRoutes} |
| Launch target routes | ${packet.googleSitemapReflection.launchTargetRoutes} |
| Immediate submission routes | ${packet.googleSitemapReflection.immediateSubmissionRoutes} |
| Support submission routes | ${packet.googleSitemapReflection.supportSubmissionRoutes} |

Coverage status: ${packet.googleSitemapReflection.coverageStatus}

## Search Console Fields Required

${packet.searchConsoleFieldsRequired.map((field) => `- ${field}`).join("\n")}

Rank higher rule: ${packet.rankHigherRule}

## Route Groups

${packet.routeGroups.map((group) => `- ${group.group}: ${group.count} routes. ${group.role}`).join("\n")}

## Search Readiness Gates

${packet.searchReadinessGates.map((gate) => `- ${gate.gate}: ${gate.status}. ${gate.read}`).join("\n")}

Public claim language: ${packet.publicClaimLanguage}

Next system move: ${packet.nextSystemMove}
`
}

function individualRankingBlueprint(cluster, rangeStart = 1){
  const dimensions = cluster.variationDimensions || {}
  const entries = Object.entries(dimensions).map(([name, values]) => ({name, count: Array.isArray(values) ? values.length : 0}))
  const total = Number(cluster.variationCapacity || entries.reduce((value, entry) => value * Math.max(1, entry.count), 1))
  const rangeEnd = rangeStart + total - 1
  const rankFormula = entries.map((entry) => entry.name).join(" x ")
  return {
    clusterId: cluster.id,
    lane: cluster.lane,
    totalIndividualRanks: total,
    globalRankStart: rangeStart,
    globalRankEnd: rangeEnd,
    globalRankRange: `${rangeStart}-${rangeEnd}`,
    rankingOwner: "Digitalhut.app",
    canonicalDomain: "https://www.digitalhut.app",
    rankingIntent: "Each deterministic variation is assigned to Digitalhut.app through a canonical proof route, metadata rule, backlink target, and promotion stage before any mass publication.",
    rankFormula,
    dimensionOrder: entries,
    rankIdPattern: `dh-${cluster.id}-rank-{clusterRankNumber}`,
    globalRankIdPattern: "dh-global-rank-{globalRankNumber}",
    targetUrlPattern: `${cluster.proofRoutes?.watch || "/watch/search-intent-radar-visual-experience"}?dh_rank={clusterRankNumber}&dh_global_rank={globalRankNumber}&dh_lane=${cluster.id}`,
    metadataPattern: {
      title: `{keyword} | DigitalHut ${cluster.lane} Proof`,
      description: `{keyword} on Digitalhut.app: video, GLB, podcast/source, watch, blog, category, and backlink proof for ${cluster.lane}.`,
      canonical: cluster.proofRoutes?.watch || "/watch/search-intent-radar-visual-experience",
      owner: "Digitalhut.app"
    },
    materializationPolicy: "FireCuda can materialize any rank on demand and assign it to Digitalhut.app. Git stores the formula, counts, canonical ownership, proof routes, and promotion gates instead of committing millions of rows.",
    firstRank: {
      rankId: `dh-${cluster.id}-rank-1`,
      globalRankId: `dh-global-rank-${rangeStart}`,
      globalRankNumber: rangeStart,
      keyword: cluster.nextCandidateQueue?.[0]?.keyword || cluster.sampleKeywords?.[0] || cluster.lane,
      routeTarget: cluster.proofRoutes?.watch,
      launchTarget: launchRankingAnchors[cluster.id]?.firstDeployTargets?.[0] || cluster.sampleKeywords?.[0] || cluster.lane
    },
    lastRank: {
      rankId: `dh-${cluster.id}-rank-${total}`,
      globalRankId: `dh-global-rank-${rangeEnd}`,
      globalRankNumber: rangeEnd,
      routeTarget: cluster.proofRoutes?.watch,
      launchTarget: launchRankingAnchors[cluster.id]?.firstDeployTargets?.at(-1) || cluster.sampleKeywords?.at(-1) || cluster.lane
    }
  }
}

function launchRankingScoreForCluster(cluster, metrics = lastKnownMetrics){
  const anchor = launchRankingAnchors[cluster.id] || {}
  const demandScore = anchor.demandClass?.includes("very-high") ? 35 : anchor.demandClass?.includes("high") ? 28 : 20
  const productProofScore = 10
    + (metrics.glbPreviewPlays > 0 ? 10 : 0)
    + (metrics.podcastInterrupts > 0 ? 6 : 0)
    + (metrics.autoplayStarts > 0 ? 5 : 0)
    + (metrics.blogViews > 0 ? 5 : 0)
  const routeProofScore = cluster.proofRoutes?.watch && cluster.proofRoutes?.blog && cluster.proofRoutes?.category ? 18 : 8
  const refinementPenalty = metrics.searchInteractions === 0 ? 6 : 0
  const professionalismScore = demandScore + productProofScore + routeProofScore - refinementPenalty
  return {
    demandScore,
    productProofScore,
    routeProofScore,
    refinementPenalty,
    professionalismScore
  }
}

function buildLaunchRankingLayer(clusters, metrics = lastKnownMetrics){
  const lanes = clusters.map((cluster) => {
    const anchor = launchRankingAnchors[cluster.id] || {}
    const score = launchRankingScoreForCluster(cluster, metrics)
    return {
      clusterId: cluster.id,
      lane: cluster.lane,
      demandClass: anchor.demandClass || "long-tail intent",
      headTerms: anchor.headTerms || [],
      firstDeployTargets: anchor.firstDeployTargets || cluster.sampleKeywords.slice(0, 6),
      professionalAngle: anchor.professionalAngle || "Attach keyword intent to DigitalHut video, GLB, podcast/source, watch, blog, category, and backlink proof.",
      score,
      launchStage: score.professionalismScore >= 60 ? "launch-primary" : score.professionalismScore >= 50 ? "launch-secondary" : "hold-for-behavior",
      routeTargets: cluster.proofRoutes,
      longTailCapacity: cluster.variationCapacity,
      queuedCandidates: cluster.nextCandidateQueue.length
    }
  }).sort((a, b) => b.score.professionalismScore - a.score.professionalismScore)
  return {
    generatedAt,
    mode: "DigitalHut Launch Ranking Layer",
    purpose: "Rank for high-demand search while long-tail coverage makes DigitalHut readable across everyday intent, source proof, video, GLB, podcast, watch routes, blog proof, and category lanes.",
    googleAlignedPrinciples: [
      "People-first usefulness before raw keyword stuffing.",
      "Clear title/description/page purpose tied to the actual DigitalHut experience.",
      "Video and source proof should be discoverable from crawlable routes.",
      "Long-tail expansion should be measured by behavior before mass publication."
    ],
    lanes,
    primaryLaunchLanes: lanes.filter((lane) => lane.launchStage === "launch-primary").map((lane) => lane.lane),
    secondaryLaunchLanes: lanes.filter((lane) => lane.launchStage === "launch-secondary").map((lane) => lane.lane),
    deployReadiness: "Ready as backend SEO staging. Deploy after stable public route batch and metadata review, not as a cosmetic update.",
    nextMetadataMove: "Use each lane's firstDeployTargets in page titles, descriptions, watch headings, blog intros, category snippets, sitemap proof, and source/backlink copy."
  }
}

function buildSeoMasterListPacket({seoProof, metrics = lastKnownMetrics}){
  const mundaneClustersById = new Map(mundaneOffTimeExperienceMap.clusters.map((cluster) => [cluster.id, cluster]))
  const clusters = seoSearchClaimLanes
    .filter((lane) => lane.countedRankSlots !== false)
    .map((lane) => {
    const mundaneCluster = mundaneClustersById.get(lane.id)
    const dimensions = mundaneCluster?.variationDimensions || {
      intents: [lane.lane, lane.role].filter(Boolean),
      contexts: ["daily session", "research session", "after work"],
      modifiers: ["2026", "source-backed", "interactive"],
      formats: ["video observatory", "3D Model View", "podcast source moment"],
      proofAngles: (lane.backlinkTargets || ["source proof", "watch proof"]).slice(0, 5),
      geoScopes: ["global", "local", "international"]
    }
    const shapedCluster = {
      id: lane.id,
      lane: lane.lane,
      role: lane.role,
      keywords: Array.from(new Set([
        lane.lane,
        lane.role,
        ...(lane.measurementSignals || []),
        ...(lane.backlinkTargets || [])
      ].filter(Boolean))).slice(0, 8),
      variationDimensions: dimensions,
      variationCapacity: Number(lane.variationCapacity || 0),
      proofSignal: (lane.measurementSignals || ["proof route open", "source/backlink open"]).join(" + "),
      proofRoutes: {
        category: `/category/${lane.id}`,
        watch: lane.proofRoute || `/watch/${proofSlugForCluster(lane.id)}`,
        blog: `/blog/${lane.id}`
      }
    }
    const variationCapacity = shapedCluster.variationCapacity
    return {
      ...shapedCluster,
      seedKeywordCount: shapedCluster.keywords.length,
      variationDimensions: dimensions,
      dimensionCounts: dimensionCounts(dimensions),
      variationCapacity,
      sampleKeywords: sampleKeywordSet(shapedCluster),
      nextCandidateQueue: candidateKeywordQueue(shapedCluster, mundaneCluster ? 30 : 8)
    }
  })
  const totalVariationCapacity = clusters.reduce((total, cluster) => total + cluster.variationCapacity, 0)
  const nextCandidateQueue = clusters.flatMap((cluster) => cluster.nextCandidateQueue)
  const candidatePromotionBoard = buildCandidatePromotionBoard(nextCandidateQueue, metrics)
  const launchRankingLayer = buildLaunchRankingLayer(clusters, metrics)
  let nextGlobalRankStart = 1
  const individualRankingClusters = clusters.map((cluster) => {
    const blueprint = individualRankingBlueprint(cluster, nextGlobalRankStart)
    nextGlobalRankStart = blueprint.globalRankEnd + 1
    return blueprint
  })
  const individualRankingIndex = {
    generatedAt,
    totalIndividualRanks: totalVariationCapacity,
    rankingOwner: "Digitalhut.app",
    canonicalDomain: "https://www.digitalhut.app",
    globalRankStart: 1,
    globalRankEnd: totalVariationCapacity,
    indexPolicy: "Every variation is individually assigned to Digitalhut.app by deterministic global rank, cluster rank, canonical proof route, metadata rule, and promotion gate. Full materialization belongs on FireCuda or a database table, while the repo keeps deploy-safe formulas and proof gates.",
    clusters: individualRankingClusters
  }
  return {
    generatedAt,
    mode: "DigitalHut FireCuda SEO Master List Packet",
    scope: "Full DigitalHut 200M longtail claim universe, including mundane-life entry lanes",
    frontendLock: "No public UI change. This packet is backend SEO, Supabase measurement, Google metadata, Vercel route proof, and compare/refine input.",
    operatingStack,
    counts: {
      clusterCount: clusters.length,
      totalVariationCapacity,
      seedKeywords: clusters.reduce((total, cluster) => total + cluster.seedKeywordCount, 0),
      queuedCandidateKeywords: nextCandidateQueue.length,
      proofRouteSeedCandidates: nextCandidateQueue.filter((item) => item.stage === "proof-route-seed").length,
      supabaseWatchCandidates: nextCandidateQueue.filter((item) => item.stage === "supabase-watch-candidate").length,
      firecudaHoldCandidates: nextCandidateQueue.filter((item) => item.stage === "firecuda-hold-candidate").length,
      sitemapUrls: seoProof.sitemapUrls,
      blogProofPosts: seoProof.blogProofPosts,
      watchProofRoutes: seoProof.watchProofRoutes,
      categoryRoutes: seoProof.categoryRoutes
    },
    clusters,
    nextCandidateQueue,
    candidatePromotionBoard,
    launchRankingLayer,
    individualRankingIndex,
    metricFreshness: buildMetricFreshnessPacket(metrics),
    promotionRules: [
      "Do not publish every variation. FireCuda holds the universe; Supabase behavior decides winners.",
      "Promote a cluster when it earns at least one intent signal and one proof signal.",
      "Move winning phrases into blog proof, watch proof, category lanes, source backlinks, and episode/ad/conclusion copy.",
      "Hold phrases that create filler, duplicate analytics, or cannot attach to video, GLB, podcast/source, market, watch, blog, or backlink proof."
    ],
    lastKnownMetrics,
    nextSystemMove: `${mundaneOffTimeExperienceMap.nextMove} The active internal source of truth is ${seoSearchClaimSummary.totalIndividualRanks.toLocaleString("en-US")} variations across ${clusters.length} full-system lanes.`
  }
}

function seoMasterListMarkdown(packet){
  return `# DigitalHut FireCuda SEO Master List Packet

Generated: ${packet.generatedAt}

Scope: ${packet.scope}

Frontend lock: ${packet.frontendLock}

Operating stack: ${packet.operatingStack.join(" > ")}

## Actual Keyword Variation Capacity

Total variation capacity: ${packet.counts.totalVariationCapacity.toLocaleString("en-US")}

Seed keywords: ${packet.counts.seedKeywords}

Queued candidate keywords: ${packet.counts.queuedCandidateKeywords}

Proof-route seed candidates: ${packet.counts.proofRouteSeedCandidates}

Supabase watch candidates: ${packet.counts.supabaseWatchCandidates}

FireCuda hold candidates: ${packet.counts.firecudaHoldCandidates}

Clusters: ${packet.counts.clusterCount}

| Cluster | Seeds | Variation Capacity | Proof Signal |
| --- | ---: | ---: | --- |
${packet.clusters.map((cluster) => `| ${cluster.lane} | ${cluster.seedKeywordCount} | ${cluster.variationCapacity.toLocaleString("en-US")} | ${cluster.proofSignal} |`).join("\n")}

## Cluster Dimension Counts

${packet.clusters.map((cluster) => `### ${cluster.lane}

${Object.entries(cluster.dimensionCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

Sample keywords:
${cluster.sampleKeywords.map((keyword) => `- ${keyword}`).join("\n")}

Next candidate queue:
${cluster.nextCandidateQueue.slice(0, 10).map((item) => `- [${item.stage}] ${item.keyword} -> ${item.routeTarget}`).join("\n")}

Proof routes:
- ${cluster.proofRoutes.category}
- ${cluster.proofRoutes.watch}
- ${cluster.proofRoutes.blog}`).join("\n\n")}

## Candidate Promotion Board

Read: ${packet.candidatePromotionBoard.read}

Stage counts:
${Object.entries(packet.candidatePromotionBoard.countsByStage).map(([stage, count]) => `- ${stage}: ${count}`).join("\n")}

Cluster promotion read:

${packet.candidatePromotionBoard.byCluster.map((cluster) => `- **${cluster.lane}**: total ${cluster.total}; promote ${cluster.promoteNextProof}; staged-watch ${cluster.routeStagedWatch}; needs-intent ${cluster.needsIntent}; supabase-watch ${cluster.supabaseWatch}; hold ${cluster.hold}.`).join("\n")}

Top behavior-backed candidates:

${packet.candidatePromotionBoard.topCandidates.length
  ? packet.candidatePromotionBoard.topCandidates.map((item) => `- **${item.lane}** / ${item.promotionStage} / score ${item.signalScore}: ${item.keyword} -> ${item.routeTarget}`).join("\n")
  : "- None yet."}

Missing separated metrics:
${packet.candidatePromotionBoard.missingSeparatedMetrics.map((item) => `- ${item}`).join("\n")}

## Launch Ranking Layer

Purpose: ${packet.launchRankingLayer.purpose}

Primary launch lanes:
${packet.launchRankingLayer.primaryLaunchLanes.map((lane) => `- ${lane}`).join("\n") || "- None yet."}

Secondary launch lanes:
${packet.launchRankingLayer.secondaryLaunchLanes.map((lane) => `- ${lane}`).join("\n") || "- None yet."}

Deploy readiness: ${packet.launchRankingLayer.deployReadiness}

Next metadata move: ${packet.launchRankingLayer.nextMetadataMove}

| Lane | Stage | Score | Demand | First Deploy Targets |
| --- | --- | ---: | --- | --- |
${packet.launchRankingLayer.lanes.map((lane) => `| ${lane.lane} | ${lane.launchStage} | ${lane.score.professionalismScore} | ${lane.demandClass} | ${lane.firstDeployTargets.slice(0, 4).join("; ")} |`).join("\n")}

## Digitalhut.app Individual Ranking Ownership

Total Digitalhut.app-owned rank slots: ${packet.individualRankingIndex.totalIndividualRanks.toLocaleString("en-US")}

Global rank range: ${packet.individualRankingIndex.globalRankStart.toLocaleString("en-US")}-${packet.individualRankingIndex.globalRankEnd.toLocaleString("en-US")}

Policy: ${packet.individualRankingIndex.indexPolicy}

${packet.individualRankingIndex.clusters.map((cluster) => `- **${cluster.lane}**: global ranks ${cluster.globalRankRange}; ${cluster.totalIndividualRanks.toLocaleString("en-US")} slots owned by ${cluster.rankingOwner}. URL pattern: ${cluster.targetUrlPattern}. Metadata title: ${cluster.metadataPattern.title}`).join("\n")}

## Promotion Rules

${packet.promotionRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

- Page views: ${packet.lastKnownMetrics.pageViews}
- Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
- Search interactions: ${packet.lastKnownMetrics.searchInteractions}
- Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
- GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
- Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
- Market opens: ${packet.lastKnownMetrics.marketOpens}
- Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

## Next System Move

${packet.nextSystemMove}
`
}

function rankOwnershipMarkdown(index){
  return `# DigitalHut Rank Ownership Index

Generated: ${index.generatedAt}

Owner: ${index.rankingOwner}

Canonical domain: ${index.canonicalDomain}

Global rank range: ${index.globalRankStart.toLocaleString("en-US")}-${index.globalRankEnd.toLocaleString("en-US")}

Total assigned keyword slots: ${index.totalIndividualRanks.toLocaleString("en-US")}

Policy: ${index.indexPolicy}

## Cluster Ranges

| Lane | Global Range | Slots | First Rank | Last Rank |
| --- | --- | ---: | --- | --- |
${index.clusters.map((cluster) => `| ${cluster.lane} | ${cluster.globalRankRange} | ${cluster.totalIndividualRanks.toLocaleString("en-US")} | ${cluster.firstRank.globalRankId} | ${cluster.lastRank.globalRankId} |`).join("\n")}

## Canonical Assignment Rule

Each rank slot points back to ${index.rankingOwner} through:

- canonical domain: ${index.canonicalDomain}
- cluster proof route
- rank URL pattern with \`dh_global_rank\`
- metadata title and description pattern
- FireCuda materialization policy
- Supabase promotion/hold signals

## First Rank Samples

${index.clusters.map((cluster) => `- **${cluster.lane}**: ${cluster.firstRank.globalRankId} / ${cluster.firstRank.keyword} / ${cluster.firstRank.routeTarget}`).join("\n")}
`
}

function buildRankSlotMaterializationSamples(index){
  const samples = index.clusters.flatMap((cluster) => {
    const start = cluster.globalRankStart
    const end = cluster.globalRankEnd
    const midpoint = start + Math.floor((end - start) / 2)
    const clusterMidpoint = 1 + Math.floor((cluster.totalIndividualRanks - 1) / 2)
    const points = [
      {sampleType: "first", globalRankNumber: start, clusterRankNumber: 1, launchTarget: cluster.firstRank.launchTarget},
      {sampleType: "midpoint", globalRankNumber: midpoint, clusterRankNumber: clusterMidpoint, launchTarget: cluster.metadataPattern.title.replace(" | DigitalHut", "")},
      {sampleType: "last", globalRankNumber: end, clusterRankNumber: cluster.totalIndividualRanks, launchTarget: cluster.lastRank.launchTarget}
    ]
    return points.map((point) => ({
      sampleType: point.sampleType,
      lane: cluster.lane,
      rankingOwner: index.rankingOwner,
      globalRankId: `dh-global-rank-${point.globalRankNumber}`,
      globalRankNumber: point.globalRankNumber,
      clusterRankNumber: point.clusterRankNumber,
      canonicalRoute: cluster.metadataPattern?.canonical || cluster.firstRank?.routeTarget || cluster.lastRank?.routeTarget || "/watch/search-intent-radar-visual-experience",
      canonicalUrl: `${index.canonicalDomain}${cluster.metadataPattern?.canonical || cluster.firstRank?.routeTarget || cluster.lastRank?.routeTarget || "/watch/search-intent-radar-visual-experience"}`,
      rankUrl: `${index.canonicalDomain}${cluster.targetUrlPattern
        .replace("{clusterRankNumber}", point.clusterRankNumber)
        .replace("{globalRankNumber}", point.globalRankNumber)}`,
      title: cluster.metadataPattern.title,
      description: cluster.metadataPattern.description,
      launchTarget: point.launchTarget.replace("{keyword}", cluster.lane.toLowerCase()),
      promotionGate: "Supabase behavior must show intent before this rank slot becomes a public writing priority."
    }))
  })
  return {
    generatedAt,
    mode: "DigitalHut Rank Slot Materialization Samples",
    rankingOwner: index.rankingOwner,
    canonicalDomain: index.canonicalDomain,
    totalIndividualRanks: index.totalIndividualRanks,
    purpose: `Prove that the full ${index.totalIndividualRanks.toLocaleString("en-US")} keyword universe can resolve into deterministic DigitalHut planning slots without generating millions of static files.`,
    materializationPolicy: index.indexPolicy,
    sampleCount: samples.length,
    samples
  }
}

function rankSlotMaterializationMarkdown(packet){
  return `# DigitalHut Rank Slot Materialization Samples

Generated: ${packet.generatedAt}

Owner: ${packet.rankingOwner}

Total individual rank slots: ${packet.totalIndividualRanks.toLocaleString("en-US")}

Purpose: ${packet.purpose}

Policy: ${packet.materializationPolicy}

| Sample | Lane | Global Rank | Cluster Rank | Canonical Route | Launch Target |
| --- | --- | ---: | ---: | --- | --- |
${packet.samples.map((sample) => `| ${sample.sampleType} | ${sample.lane} | ${sample.globalRankNumber.toLocaleString("en-US")} | ${sample.clusterRankNumber.toLocaleString("en-US")} | ${sample.canonicalRoute} | ${sample.launchTarget} |`).join("\n")}

## Read

These are deploy-safe proof samples. FireCuda or Supabase can materialize the full table when behavior proves a lane is worth expanding.
`
}

function buildAiDiscoveryPacket({status, seoMasterListPacket, routeMetadataManifest, routeCoverageAudit, deployReadinessAudit, systemCapabilities}){
  const launchRoutes = routeMetadataManifest.routes
    .filter((route) => route.keywords.some((keyword) => /near me|cheap flights|funny videos|product reviews|Uber|Wikipedia|Reddit/i.test(keyword)))
    .slice(0, 24)
  const rankedLanes = seoMasterListPacket.launchRankingLayer.lanes.slice(0, 8)
  const discoveryRoutes = routeMetadataManifest.routes
    .filter((route) => route.type !== "category-proof" || route.relatedRoutes.length)
    .slice(0, 60)
    .map((route) => ({
      route: route.route,
      canonical: route.canonical,
      type: route.type,
      title: route.title,
      description: route.description,
      keywords: route.keywords.slice(0, 12),
      proofAngle: route.proofAngle,
      relatedRoutes: route.relatedRoutes.slice(0, 6)
    }))
  return {
    generatedAt,
    mode: "DigitalHut AI And Search Discovery Packet",
    productName: "DigitalHut Presents",
    canonicalDomain: "https://www.digitalhut.app",
    oneLineRead: "A 2026 dapp entertainment observatory that connects YouTube-style video topics, 3D/GLB context, podcast/source moments, market panels, watch proof, blog proof, and long-tail search routes.",
    crawlGuidance: {
      sitemap: "https://www.digitalhut.app/sitemap.xml",
      robots: "https://www.digitalhut.app/robots.txt",
      routeCoverageStatus: routeCoverageAudit.status,
      deployReadinessStatus: deployReadinessAudit.status,
      frontendLock: status.frontendLock || "Backend SEO/system proof only unless measured client behavior requires visual change."
    },
    lastKnownMetrics,
    systemCapabilities: {
      productReady: systemCapabilities.capabilityCounts.productReady,
      productTotal: systemCapabilities.capabilityCounts.productTotal,
      sitemapUrls: systemCapabilities.capabilityCounts.sitemapUrls,
      readyAlerts: systemCapabilities.capabilityCounts.readyCapabilityAlerts,
      refinementActions: systemCapabilities.capabilityCounts.refinementActions
    },
    rankOwnership: {
      owner: seoMasterListPacket.individualRankingIndex.rankingOwner,
      totalIndividualRanks: seoMasterListPacket.individualRankingIndex.totalIndividualRanks,
      globalRange: `${seoMasterListPacket.individualRankingIndex.globalRankStart}-${seoMasterListPacket.individualRankingIndex.globalRankEnd}`,
      policy: seoMasterListPacket.individualRankingIndex.indexPolicy
    },
    rankedLanes: rankedLanes.map((lane) => ({
      lane: lane.lane,
      stage: lane.launchStage,
      score: lane.score.professionalismScore,
      demandClass: lane.demandClass,
      firstDeployTargets: lane.firstDeployTargets.slice(0, 8),
      professionalAngle: lane.professionalAngle,
      routeTargets: lane.routeTargets
    })),
    launchRoutes: launchRoutes.map((route) => ({
      route: route.route,
      type: route.type,
      title: route.title,
      keywords: route.keywords.slice(0, 8),
      relatedRoutes: route.relatedRoutes.slice(0, 4)
    })),
    discoveryRoutes,
    safeUse: [
      "Use this packet to understand DigitalHut route intent, not as a live visitor analytics replacement.",
      "Use Supabase events before promoting a rank slot into heavy page copy.",
      "Use the sitemap and route metadata manifest as the crawlable truth.",
      "Do not describe the offline backend system as paid-tier reasoning; it prepares evidence packets for Codex or approved AI oversight."
    ]
  }
}

function aiDiscoveryMarkdown(packet){
  return `# DigitalHut AI And Search Discovery Packet

Generated: ${packet.generatedAt}

Product: ${packet.productName}

Canonical domain: ${packet.canonicalDomain}

Read: ${packet.oneLineRead}

## Crawl Guidance

- Sitemap: ${packet.crawlGuidance.sitemap}
- Robots: ${packet.crawlGuidance.robots}
- Route coverage: ${packet.crawlGuidance.routeCoverageStatus}
- Deploy readiness: ${packet.crawlGuidance.deployReadinessStatus}
- Frontend lock: ${packet.crawlGuidance.frontendLock}

## Rank Ownership

Owner: ${packet.rankOwnership.owner}

Total individual ranks: ${packet.rankOwnership.totalIndividualRanks.toLocaleString("en-US")}

Global range: ${packet.rankOwnership.globalRange}

Policy: ${packet.rankOwnership.policy}

## Ranked Lanes

${packet.rankedLanes.map((lane) => `- **${lane.lane}** (${lane.stage}, score ${lane.score}): ${lane.firstDeployTargets.slice(0, 5).join("; ")}`).join("\n")}

## Launch Route Samples

${packet.launchRoutes.slice(0, 16).map((route) => `- **${route.route}** (${route.type}): ${route.title}`).join("\n")}

## Last Known Metrics

- Page views: ${packet.lastKnownMetrics.pageViews}
- Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
- Search interactions: ${packet.lastKnownMetrics.searchInteractions}
- Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
- GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
- Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
- Market opens: ${packet.lastKnownMetrics.marketOpens}
- Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

## Safe Use

${packet.safeUse.map((item) => `- ${item}`).join("\n")}
`
}

function buildSeoSubmissionQueue({aiDiscoveryPacket, seoMasterListPacket, routeMetadataManifest, routeCoverageAudit, deployReadinessAudit}){
  const routeByPath = new Map(routeMetadataManifest.routes.map((route) => [route.route, route]))
  const primaryLaneRoutes = seoMasterListPacket.launchRankingLayer.lanes
    .filter((lane) => lane.launchStage === "launch-primary")
    .flatMap((lane) => [
      {lane: lane.lane, type: "watch", route: lane.routeTargets?.watch, targets: lane.firstDeployTargets.slice(0, 6), score: lane.score.professionalismScore},
      {lane: lane.lane, type: "blog", route: lane.routeTargets?.blog, targets: lane.firstDeployTargets.slice(0, 6), score: lane.score.professionalismScore},
      {lane: lane.lane, type: "category", route: lane.routeTargets?.category, targets: lane.firstDeployTargets.slice(0, 6), score: lane.score.professionalismScore}
    ])
    .filter((item) => item.route && routeByPath.has(item.route))
  const uniquePrimaryRoutes = Array.from(primaryLaneRoutes.reduce((routes, item) => {
    const existing = routes.get(item.route)
    if(!existing) {
      routes.set(item.route, {...item, lanes: [item.lane], targets: [...item.targets]})
      return routes
    }
    existing.lanes = Array.from(new Set([...existing.lanes, item.lane]))
    existing.lane = existing.lanes.join(" + ")
    existing.targets = Array.from(new Set([...existing.targets, ...item.targets]))
    existing.score = Math.max(existing.score, item.score)
    return routes
  }, new Map()).values())
  const routePriority = (item) => {
    const typeBoost = item.type === "watch" ? 12 : item.type === "blog" ? 8 : 5
    const behaviorBoost = lastKnownMetrics.glbPreviewPlays > 0 ? 5 : 0
    const searchPenalty = lastKnownMetrics.searchInteractions === 0 ? 3 : 0
    return item.score + typeBoost + behaviorBoost - searchPenalty
  }
  const immediateSubmission = uniquePrimaryRoutes
    .map((item) => {
      const manifest = routeByPath.get(item.route)
      return {
        priority: routePriority(item),
        lane: item.lane,
        route: item.route,
        canonical: manifest.canonical,
        type: manifest.type,
        title: manifest.title,
        targetKeywords: Array.from(new Set([...(item.targets || []), ...(manifest.keywords || []).slice(0, 4)])).slice(0, 10),
        proofAngle: manifest.proofAngle,
        internalLinks: manifest.relatedRoutes.slice(0, 4),
        submissionAction: "Include in next sitemap/deploy proof batch and Search Console URL inspection queue after the stable deploy."
      }
    })
    .sort((a, b) => b.priority - a.priority || a.route.localeCompare(b.route))
  const supportRoutes = aiDiscoveryPacket.launchRoutes
    .filter((route) => !immediateSubmission.some((item) => item.route === route.route))
    .slice(0, 18)
    .map((route) => ({
      priority: 60,
      lane: route.title.split("|")[0].trim(),
      route: route.route,
      canonical: `https://www.digitalhut.app${route.route}`,
      type: route.type,
      title: route.title,
      targetKeywords: route.keywords.slice(0, 8),
      proofAngle: "launch-support route that reinforces the primary high-demand lane",
      internalLinks: route.relatedRoutes,
      submissionAction: "Hold for sitemap crawl; promote only if Supabase sees blog/watch/category movement."
    }))
  const batches = [
    {
      id: "batch-001-primary-watch-proof",
      purpose: "Push watch routes first because they connect the entertainment presentation to source/backlink/GLB proof.",
      routes: immediateSubmission.filter((item) => item.type === "watch-proof").slice(0, 8)
    },
    {
      id: "batch-002-primary-blog-proof",
      purpose: "Back the watch routes with blog proof for readable long-tail keyword context.",
      routes: immediateSubmission.filter((item) => item.type === "blog-proof").slice(0, 8)
    },
    {
      id: "batch-003-category-and-support",
      purpose: "Let category/support routes broaden the lane without stuffing the site.",
      routes: [...immediateSubmission.filter((item) => item.type === "category-proof"), ...supportRoutes].slice(0, 14)
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut SEO Submission Queue",
    purpose: `Turn the ${seoMasterListPacket.individualRankingIndex.totalIndividualRanks.toLocaleString("en-US")}-variation FireCuda universe into a disciplined crawl/deploy queue that starts with high-demand useful pages and holds the rest for behavior.`,
    status: routeCoverageAudit.status === "pass" && deployReadinessAudit.checks.some((check) => check.id === "ai-search-discovery" && check.status === "pass")
      ? "submission-staged"
      : "submission-review",
    guardrail: "Do not create millions of thin pages. Submit the sitemap and strongest proof routes; materialize rank slots only when Supabase behavior separates real demand.",
    immediateSubmissionCount: immediateSubmission.length,
    supportRouteCount: supportRoutes.length,
    batches,
    holdInFireCuda: {
      totalRankSlots: seoMasterListPacket.individualRankingIndex.totalIndividualRanks,
      queuedCandidates: seoMasterListPacket.counts.queuedCandidateKeywords,
      holdReason: "FireCuda owns the full universe; public crawl surfaces get only routes that can explain video, GLB, podcast/source, market, watch, blog, and backlink proof."
    },
    lastKnownMetrics
  }
}

function seoSubmissionQueueMarkdown(queue){
  return `# DigitalHut SEO Submission Queue

Generated: ${queue.generatedAt}

Status: ${queue.status}

Purpose: ${queue.purpose}

Guardrail: ${queue.guardrail}

Immediate submission routes: ${queue.immediateSubmissionCount}

Support routes: ${queue.supportRouteCount}

FireCuda held rank slots: ${queue.holdInFireCuda.totalRankSlots.toLocaleString("en-US")}

Queued candidates: ${queue.holdInFireCuda.queuedCandidates}

## Batches

${queue.batches.map((batch) => `### ${batch.id}

Purpose: ${batch.purpose}

${batch.routes.length ? batch.routes.map((route) => `- **${route.route}** (${route.type}, priority ${route.priority}): ${route.targetKeywords.slice(0, 5).join("; ")}`).join("\n") : "- No routes in this batch yet."}`).join("\n\n")}

## Last Known Metrics

- Page views: ${queue.lastKnownMetrics.pageViews}
- Participating browser IDs: ${queue.lastKnownMetrics.uniqueVisitors}
- Search interactions: ${queue.lastKnownMetrics.searchInteractions}
- Autoplay starts: ${queue.lastKnownMetrics.autoplayStarts}
- GLB preview plays: ${queue.lastKnownMetrics.glbPreviewPlays}
- Podcast interrupts: ${queue.lastKnownMetrics.podcastInterrupts}
- Market opens: ${queue.lastKnownMetrics.marketOpens}
- Blog views: ${queue.lastKnownMetrics.blogViews}

Source: ${queue.lastKnownMetrics.source}
`
}

function buildSearchIntentPromotionPacket({seoMasterListPacket, seoSubmissionQueue, routeMetadataManifest, supabaseMeasurementContract} = {}){
  const routeByPath = new Map(routeMetadataManifest.routes.map((route) => [route.route, route]))
  const behaviorRead = {
    searchInteractions: lastKnownMetrics.searchInteractions,
    autoplayStarts: lastKnownMetrics.autoplayStarts,
    glbPreviewPlays: lastKnownMetrics.glbPreviewPlays,
    podcastInterrupts: lastKnownMetrics.podcastInterrupts,
    blogViews: lastKnownMetrics.blogViews,
    marketOpens: lastKnownMetrics.marketOpens
  }
  const measurementEvents = new Set((supabaseMeasurementContract?.events || []).flatMap((event) => [event.canonicalEvent, ...(event.aliases || [])]))
  const requiredEvents = [
    "search_run",
    "search_intent_chip_select",
    "category_lane_select",
    "proof_route_open",
    "watch_route_open",
    "blog_route_open",
    "backlink_source_open",
    "glb_preview_play",
    "podcast_interrupt_play",
    "market_view_open"
  ]
  const eventReadiness = requiredEvents.map((eventName) => ({
    eventName,
    status: measurementEvents.has(eventName) ? "covered" : "missing",
    role: eventName.includes("search") ? "intent"
      : eventName.includes("route") || eventName.includes("blog") ? "proof"
        : eventName.includes("backlink") ? "source"
          : eventName.includes("glb") ? "3d"
            : eventName.includes("podcast") ? "podcast"
              : eventName.includes("market") ? "market"
                : "support"
  }))
  const candidateQueue = mundaneOffTimeExperienceMap.clusters.flatMap((cluster) => candidateKeywordQueue(cluster, 30))
  const candidates = candidateQueue
    .map((candidate) => {
      const signalScore = candidateSignalScore(candidate, lastKnownMetrics)
      const route = routeByPath.get(candidate.routeTarget)
      return {
        keyword: candidate.keyword,
        lane: candidate.lane,
        clusterId: candidate.clusterId,
        routeTarget: candidate.routeTarget,
        routeTitle: route?.title || "DigitalHut proof route",
        canonical: route?.canonical || `https://www.digitalhut.app${candidate.routeTarget}`,
        stage: candidate.stage,
        promotionStage: promotionStageForCandidate(candidate, signalScore),
        provenSignals: signalScore.provenSignals,
        missingSignals: signalScore.signalValues.filter((signal) => Number(signal.value || 0) === 0).map((signal) => signal.signal),
        backlinkIntent: candidate.backlinkIntent
      }
    })
  const stagedRoutes = Array.from(new Map(seoSubmissionQueue.batches
    .flatMap((batch) => batch.routes.map((route) => [route.route, {
      route: route.route,
      lane: route.lane,
      type: route.type,
      title: route.title,
      topKeywords: route.targetKeywords.slice(0, 6),
      action: route.submissionAction
    }]))).values())
  const intentPriority = candidates
    .filter((candidate) => ["route-staged-watch", "route-staged-needs-intent", "supabase-watch-priority", "supabase-watch-wait"].includes(candidate.promotionStage))
    .slice(0, 24)
  const sourceBridge = intentPriority.slice(0, 12).map((candidate) => ({
    keyword: candidate.keyword,
    routeTarget: candidate.routeTarget,
    sourceNeed: candidate.backlinkIntent,
    measurementPath: ["search_intent_chip_select", "proof_route_open", "backlink_source_open"],
    fireCudaAction: "Hold broad variation rank, surface this phrase through category chips and proof routes until source/backlink opens confirm real demand."
  }))
  const zeroSearchMode = lastKnownMetrics.searchInteractions === 0
  return {
    generatedAt,
    mode: "DigitalHut Search Intent Promotion Packet",
    status: eventReadiness.every((event) => event.status === "covered") ? "measurement-covered" : "measurement-review",
    purpose: "Turn quiet search behavior into a disciplined promotion path: category chips, proof routes, watch/blog support, source opens, then FireCuda rank movement.",
    currentRead: zeroSearchMode
      ? "Search interactions are still zero, so DigitalHut should not pretend typed demand exists. Use category chips, proof routes, GLB plays, blog views, podcast starts, and source opens to validate intent."
      : "Search interactions are active and can begin promoting exact phrases from FireCuda into proof routes.",
    guardrail: `Do not publish thin pages for all ${seoMasterListPacket.individualRankingIndex.totalIndividualRanks.toLocaleString("en-US")} variations. Stage every phrase behind measured intent and proof-route behavior.`,
    behaviorRead,
    eventReadiness,
    promotionCounts: intentPriority.reduce((counts, candidate) => {
      counts[candidate.promotionStage] = (counts[candidate.promotionStage] || 0) + 1
      return counts
    }, {}),
    priorityIntentCandidates: intentPriority,
    stagedProofRoutes: stagedRoutes.slice(0, 18),
    sourceBacklinkBridge: sourceBridge,
    nextFireCudaMove: zeroSearchMode
      ? "Keep search phrases staged, improve measurement visibility, and let category/proof/source behavior choose the first promotion lane."
      : "Promote exact typed phrases into FireCuda master-list winners and attach the strongest source/backlink proof routes.",
    lastKnownMetrics
  }
}

function searchIntentPromotionMarkdown(packet){
  return `# DigitalHut Search Intent Promotion Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

## Behavior Read

| Metric | Value |
| --- | ---: |
| Search interactions | ${packet.behaviorRead.searchInteractions} |
| Autoplay starts | ${packet.behaviorRead.autoplayStarts} |
| GLB preview plays | ${packet.behaviorRead.glbPreviewPlays} |
| Podcast interrupts | ${packet.behaviorRead.podcastInterrupts} |
| Blog views | ${packet.behaviorRead.blogViews} |
| Market opens | ${packet.behaviorRead.marketOpens} |

## Event Readiness

${packet.eventReadiness.map((event) => `- **${event.eventName}** (${event.role}): ${event.status}`).join("\n")}

## Priority Intent Candidates

${packet.priorityIntentCandidates.slice(0, 18).map((candidate) => `- **${candidate.keyword}** -> ${candidate.routeTarget} (${candidate.promotionStage}). Missing: ${candidate.missingSignals.slice(0, 4).join(", ") || "none"}`).join("\n")}

## Staged Proof Routes

${packet.stagedProofRoutes.map((route) => `- **${route.route}** (${route.type}): ${route.topKeywords.slice(0, 4).join("; ")}`).join("\n")}

## Source And Backlink Bridge

${packet.sourceBacklinkBridge.map((item) => `- **${item.keyword}**: ${item.sourceNeed}. Path: ${item.measurementPath.join(" > ")}.`).join("\n")}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildMarketPromotionPacket({routeMetadataManifest, supabaseMeasurementContract, searchIntentPromotionPacket} = {}){
  const marketStocks = [
    {symbol: "NVDA", company: "NVIDIA", lane: "AI chips", keywords: ["NVIDIA stock AI data center market analysis 2026", "AI chip market visual observatory", "GPU data center 3D stock view"], glb: "AI data center stock exchange 3D environment", podcast: "NVIDIA AI chip market podcast interview"},
    {symbol: "TSLA", company: "Tesla", lane: "EV robotics", keywords: ["Tesla stock EV robotics market analysis 2026", "electric vehicle factory 3D stock view", "robotics market video observatory"], glb: "electric vehicle factory stock market 3D environment", podcast: "Tesla EV robotics market podcast"},
    {symbol: "AAPL", company: "Apple", lane: "consumer tech", keywords: ["Apple stock product ecosystem market analysis 2026", "Apple Vision Pro market observatory", "consumer technology 3D retail stock view"], glb: "consumer technology retail stock market 3D environment", podcast: "Apple consumer technology market podcast"},
    {symbol: "MSFT", company: "Microsoft", lane: "cloud AI", keywords: ["Microsoft stock cloud AI market analysis 2026", "Azure cloud market visual observatory", "AI software infrastructure stock view"], glb: "cloud server campus stock market 3D environment", podcast: "Microsoft cloud AI market podcast"},
    {symbol: "AMD", company: "AMD", lane: "semiconductors", keywords: ["AMD stock semiconductor GPU market analysis 2026", "Radeon Ryzen market visual observatory", "semiconductor lab 3D stock view"], glb: "semiconductor lab stock market 3D environment", podcast: "AMD semiconductor market podcast"},
    {symbol: "AMZN", company: "Amazon", lane: "commerce cloud", keywords: ["Amazon stock AWS commerce market analysis 2026", "warehouse cloud logistics stock view", "AWS commerce market visual observatory"], glb: "warehouse cloud logistics stock market 3D environment", podcast: "Amazon AWS commerce market podcast"},
    {symbol: "META", company: "Meta", lane: "social AI", keywords: ["Meta stock social media AI market analysis 2026", "Instagram reels market visual observatory", "social AI 3D stock view"], glb: "social media data hub stock market 3D environment", podcast: "Meta social media AI market podcast"},
    {symbol: "GOOGL", company: "Alphabet", lane: "search cloud", keywords: ["Alphabet Google YouTube AI stock market analysis 2026", "YouTube search cloud market observatory", "Google AI 3D stock view"], glb: "search engine cloud campus stock market 3D environment", podcast: "Google AI search cloud market podcast"},
    {symbol: "AVGO", company: "Broadcom", lane: "network chips", keywords: ["Broadcom stock AI networking chip market analysis 2026", "network chip data center stock view", "AI networking market visual observatory"], glb: "network chip data center stock market 3D environment", podcast: "Broadcom networking chips market podcast"},
    {symbol: "NFLX", company: "Netflix", lane: "streaming media", keywords: ["Netflix stock streaming ads market analysis 2026", "streaming media market visual observatory", "Netflix ad tier 3D stock view"], glb: "streaming studio stock market 3D environment", podcast: "Netflix streaming media market podcast"}
  ]
  const marketRoute = routeMetadataManifest.routes.find((route) => route.route === "/watch/current-market-video-observatory")
    || routeMetadataManifest.routes.find((route) => route.keywords.some((keyword) => /stock market|current market/i.test(keyword)))
  const measurementEvents = new Set((supabaseMeasurementContract?.events || []).flatMap((event) => [event.canonicalEvent, ...(event.aliases || [])]))
  const requiredEvents = ["market_view_open", "ticker_search", "search_intent_chip_select", "proof_route_open", "backlink_source_open", "glb_preview_play", "podcast_interrupt_play"]
  const eventReadiness = requiredEvents.map((eventName) => ({
    eventName,
    status: measurementEvents.has(eventName) ? "covered" : "missing"
  }))
  const behaviorRead = {
    marketOpens: lastKnownMetrics.marketOpens,
    searchInteractions: lastKnownMetrics.searchInteractions,
    glbPreviewPlays: lastKnownMetrics.glbPreviewPlays,
    podcastInterrupts: lastKnownMetrics.podcastInterrupts,
    blogViews: lastKnownMetrics.blogViews
  }
  const routeProof = {
    route: marketRoute?.route || "/watch/current-market-video-observatory",
    canonical: marketRoute?.canonical || "https://www.digitalhut.app/watch/current-market-video-observatory",
    title: marketRoute?.title || "Current Market Video Observatory: DigitalHut Proof",
    keywords: marketRoute?.keywords?.slice(0, 10) || ["current market video observatory", "stock market visual analysis 3D", "top volume stock video research hub"],
    proofAngle: marketRoute?.proofAngle || "connected market video, stock data, podcast/source moment, GLB environment, and backlink proof"
  }
  const marketLanes = marketStocks.map((stock, index) => {
    const hasBehavior = lastKnownMetrics.marketOpens > 0 || lastKnownMetrics.searchInteractions > 0
    const supportSignals = [
      lastKnownMetrics.glbPreviewPlays > 0 ? "GLB proof is active" : "needs GLB market proof",
      lastKnownMetrics.podcastInterrupts > 0 ? "podcast interrupt proof is active" : "needs podcast market proof",
      lastKnownMetrics.blogViews > 0 ? "blog proof is active" : "needs market proof-page opens"
    ]
    return {
      rank: index + 1,
      symbol: stock.symbol,
      company: stock.company,
      lane: stock.lane,
      status: hasBehavior ? "ready-for-market-refinement" : "market-open-needed",
      routeTarget: routeProof.route,
      videoSearch: stock.keywords[0],
      podcastSearch: stock.podcast,
      glbSearch: stock.glb,
      keywords: stock.keywords,
      sourceBacklinkNeed: `${stock.company} source/backlink proof for ${stock.lane} market context`,
      measurementPath: ["market_view_open", "ticker_search", "proof_route_open", "backlink_source_open"],
      supportSignals
    }
  })
  const regularFeedBridge = marketLanes.slice(0, 3).map((lane) => ({
    symbol: lane.symbol,
    label: `${lane.symbol} ${lane.lane}`,
    regularFeedRole: "Quick market pulse in the regular feed; click routes into Current Market view.",
    observatoryReturn: `${lane.symbol} should return video, stock context, podcast/source moment, and GLB environment in the same DigitalHut presentation format.`
  }))
  const searchBridge = (searchIntentPromotionPacket?.priorityIntentCandidates || []).slice(0, 6).map((candidate) => ({
    keyword: candidate.keyword,
    marketConnection: "If a visitor turns this into a ticker/company query, route into Current Market instead of creating a duplicate entertainment lane.",
    marketEvents: ["search_run", "ticker_search", "market_view_open"]
  }))
  return {
    generatedAt,
    mode: "DigitalHut Market Promotion Packet",
    status: eventReadiness.every((event) => event.status === "covered") ? "measurement-covered" : "measurement-review",
    purpose: "Make Current Market useful as a measured extension of the observatory: ticker search, TradingView chart, options print feed, connected video, connected podcast, GLB environment, and source/backlink proof.",
    currentRead: lastKnownMetrics.marketOpens === 0
      ? "Market opens are still zero. Keep the market lane staged as a premium proof surface and let quick market pulses route users into it before expanding market SEO."
      : "Market behavior is active and can start promoting stock/company phrases into the master SEO list.",
    guardrail: "Do not turn DigitalHut into a trading site. Market is an observatory/research lane with source proof, not financial advice.",
    behaviorRead,
    eventReadiness,
    routeProof,
    marketLaneCount: marketLanes.length,
    marketLanes,
    regularFeedBridge,
    searchBridge,
    nextFireCudaMove: lastKnownMetrics.marketOpens === 0
      ? "Stage the top 10 market lanes, keep regular-feed market pulses compact, and wait for market_view_open or ticker_search before expanding stock-specific SEO."
      : "Promote the stock/company phrases with market opens, ticker searches, source opens, and GLB/podcast proof into the FireCuda master list.",
    lastKnownMetrics
  }
}

function marketPromotionMarkdown(packet){
  return `# DigitalHut Market Promotion Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

## Behavior Read

| Metric | Value |
| --- | ---: |
| Market opens | ${packet.behaviorRead.marketOpens} |
| Search interactions | ${packet.behaviorRead.searchInteractions} |
| GLB preview plays | ${packet.behaviorRead.glbPreviewPlays} |
| Podcast interrupts | ${packet.behaviorRead.podcastInterrupts} |
| Blog views | ${packet.behaviorRead.blogViews} |

## Route Proof

- Route: ${packet.routeProof.route}
- Canonical: ${packet.routeProof.canonical}
- Title: ${packet.routeProof.title}
- Proof angle: ${packet.routeProof.proofAngle}

## Event Readiness

${packet.eventReadiness.map((event) => `- **${event.eventName}**: ${event.status}`).join("\n")}

## Top Market Lanes

${packet.marketLanes.map((lane) => `- **${lane.rank}. ${lane.symbol} ${lane.company}** (${lane.status}): ${lane.videoSearch}; GLB: ${lane.glbSearch}; Podcast: ${lane.podcastSearch}.`).join("\n")}

## Regular Feed Bridge

${packet.regularFeedBridge.map((lane) => `- **${lane.label}**: ${lane.regularFeedRole} ${lane.observatoryReturn}`).join("\n")}

## Search Bridge

${packet.searchBridge.length ? packet.searchBridge.map((item) => `- **${item.keyword}**: ${item.marketConnection}`).join("\n") : "- No search candidates attached yet."}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildPodcastPromotionPacket({routeMetadataManifest, supabaseMeasurementContract, searchIntentPromotionPacket, marketPromotionPacket} = {}){
  const podcastRoutes = routeMetadataManifest.routes
    .filter((route) => /podcast|source moment|audio clip|speaker pulse/i.test(`${route.title} ${route.description} ${(route.keywords || []).join(" ")} ${route.proofAngle || ""}`))
    .slice(0, 12)
  const measurementEvents = new Set((supabaseMeasurementContract?.events || []).flatMap((event) => [event.canonicalEvent, ...(event.aliases || [])]))
  const requiredEvents = [
    "podcast_interrupt_play",
    "podcast_source_open",
    "viral_podcast_source_start",
    "proof_route_open",
    "backlink_source_open",
    "search_intent_chip_select",
    "glb_preview_play",
    "autoplay_start"
  ]
  const eventReadiness = requiredEvents.map((eventName) => ({
    eventName,
    status: measurementEvents.has(eventName) ? "covered" : "missing",
    role: eventName.includes("podcast") ? "podcast"
      : eventName.includes("proof") || eventName.includes("route") ? "proof"
        : eventName.includes("backlink") ? "source"
          : eventName.includes("search") ? "intent"
            : eventName.includes("glb") ? "3d"
              : "presentation"
  }))
  const podcastLanes = [
    {
      id: "viral-source-authority",
      title: "Viral Source Authority",
      queries: ["podcast source moment for viral video", "Apple podcast clip with video analysis", "audio source moment for trending video"],
      proofRoute: "/watch/podcast-source-moment-for-viral-video",
      role: "Support trending video explainers with publisher audio/source authority."
    },
    {
      id: "video-research-interrupt",
      title: "Video Research Interrupt",
      queries: ["podcast feature interrupt for video research", "AI podcast moment for YouTube analysis", "speaker pulse source panel"],
      proofRoute: "/watch/podcast-moment-visual-analysis",
      role: "Pause the video intentionally, play the source moment, then return to the observatory story."
    },
    {
      id: "market-podcast-context",
      title: "Market Podcast Context",
      queries: ["NVIDIA AI chip market podcast interview", "Tesla EV robotics market podcast", "Microsoft cloud AI market podcast"],
      proofRoute: "/watch/current-market-video-observatory",
      role: "Attach market/company podcast context to ticker searches without turning the product into financial advice."
    },
    {
      id: "research-podcast-context",
      title: "Research Podcast Context",
      queries: ["university research podcast visual analysis", "science research podcast source map", "climate study podcast source moment"],
      proofRoute: "/watch/source-backed-video-summary",
      role: "Turn research videos into source-backed listening moments with GLB/timeline proof."
    },
    {
      id: "everyday-podcast-guide",
      title: "Everyday Podcast Guide",
      queries: ["restaurants near me podcast source guide", "flight delay podcast travel source", "funny video podcast source moment"],
      proofRoute: "/watch/search-intent-radar-visual-experience",
      role: "Let ordinary searches inherit a useful source/audio layer when a topic needs more context."
    }
  ]
  const routeByPath = new Map(routeMetadataManifest.routes.map((route) => [route.route, route]))
  const measuredProofLanes = podcastLanes.map((lane) => {
    const route = routeByPath.get(lane.proofRoute) || podcastRoutes[0]
    return {
      ...lane,
      status: lastKnownMetrics.podcastInterrupts > 0 ? "interrupt-proof-active" : "needs-podcast-play",
      routeTitle: route?.title || "DigitalHut podcast proof route",
      canonical: route?.canonical || `https://www.digitalhut.app${lane.proofRoute}`,
      proofKeywords: route?.keywords?.slice(0, 8) || lane.queries,
      measurementPath: ["podcast_interrupt_play", "podcast_source_open", "proof_route_open", "backlink_source_open"],
      supportSignals: [
        lastKnownMetrics.podcastInterrupts > 0 ? "podcast interrupt proof is active" : "needs podcast interrupt proof",
        lastKnownMetrics.glbPreviewPlays > 0 ? "GLB proof is active" : "needs GLB context",
        lastKnownMetrics.blogViews > 0 ? "blog proof is active" : "needs proof-page reads"
      ]
    }
  })
  const searchBridge = (searchIntentPromotionPacket?.priorityIntentCandidates || []).slice(0, 6).map((candidate) => ({
    keyword: candidate.keyword,
    podcastRole: "If this topic needs human context, attach a podcast/source moment before promoting the phrase.",
    routeTarget: candidate.routeTarget,
    measurementPath: ["search_intent_chip_select", "podcast_interrupt_play", "podcast_source_open", "proof_route_open"]
  }))
  const marketBridge = (marketPromotionPacket?.marketLanes || []).slice(0, 5).map((lane) => ({
    symbol: lane.symbol,
    company: lane.company,
    podcastSearch: lane.podcastSearch,
    routeTarget: lane.routeTarget,
    measurementPath: ["market_view_open", "podcast_interrupt_play", "podcast_source_open", "backlink_source_open"]
  }))
  return {
    generatedAt,
    mode: "DigitalHut Podcast Source Promotion Packet",
    status: eventReadiness.every((event) => event.status === "covered") ? "measurement-covered" : "measurement-review",
    purpose: "Make podcast/source moments useful: verified publisher audio when available, clear source fallback when audio is blocked, video pause/return behavior, proof routes, and backlink/source measurement.",
    currentRead: lastKnownMetrics.podcastInterrupts > 0
      ? "Podcast interrupts have early proof. The next move is to connect every interrupt to a proof route and source/backlink open before expanding podcast SEO."
      : "Podcast source moments are code-ready but need visitor play proof before broad SEO expansion.",
    guardrail: "Do not clone voices, fabricate recordings, or imply endorsement. Use publisher audio/source pages and label blocked previews honestly.",
    behaviorRead: {
      podcastInterrupts: lastKnownMetrics.podcastInterrupts,
      glbPreviewPlays: lastKnownMetrics.glbPreviewPlays,
      blogViews: lastKnownMetrics.blogViews,
      searchInteractions: lastKnownMetrics.searchInteractions,
      marketOpens: lastKnownMetrics.marketOpens
    },
    eventReadiness,
    routeCount: podcastRoutes.length,
    podcastRoutes: podcastRoutes.map((route) => ({
      route: route.route,
      canonical: route.canonical,
      title: route.title,
      keywords: route.keywords.slice(0, 8),
      proofAngle: route.proofAngle
    })),
    podcastLanes: measuredProofLanes,
    searchBridge,
    marketBridge,
    nextFireCudaMove: lastKnownMetrics.podcastInterrupts > 0
      ? "Promote podcast/source moments only where interrupt plays pair with proof-route opens, source/backlink opens, GLB context, or blog reads."
      : "Keep podcast phrases staged and wait for podcast_interrupt_play before moving podcast keywords into the master winners list.",
    lastKnownMetrics
  }
}

function podcastPromotionMarkdown(packet){
  return `# DigitalHut Podcast Source Promotion Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

## Behavior Read

| Metric | Value |
| --- | ---: |
| Podcast interrupts | ${packet.behaviorRead.podcastInterrupts} |
| GLB preview plays | ${packet.behaviorRead.glbPreviewPlays} |
| Blog views | ${packet.behaviorRead.blogViews} |
| Search interactions | ${packet.behaviorRead.searchInteractions} |
| Market opens | ${packet.behaviorRead.marketOpens} |

## Event Readiness

${packet.eventReadiness.map((event) => `- **${event.eventName}** (${event.role}): ${event.status}`).join("\n")}

## Podcast Proof Routes

${packet.podcastRoutes.length ? packet.podcastRoutes.map((route) => `- **${route.route}**: ${route.title}. Keywords: ${route.keywords.slice(0, 4).join("; ")}`).join("\n") : "- No podcast proof routes found."}

## Source Moment Lanes

${packet.podcastLanes.map((lane) => `- **${lane.title}** (${lane.status}): ${lane.role} Route: ${lane.proofRoute}. Queries: ${lane.queries.slice(0, 3).join("; ")}.`).join("\n")}

## Search Bridge

${packet.searchBridge.length ? packet.searchBridge.map((item) => `- **${item.keyword}** -> ${item.routeTarget}: ${item.podcastRole}`).join("\n") : "- No search bridge candidates attached yet."}

## Market Bridge

${packet.marketBridge.length ? packet.marketBridge.map((item) => `- **${item.symbol} ${item.company}** -> ${item.routeTarget}: ${item.podcastSearch}`).join("\n") : "- No market bridge candidates attached yet."}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildGlbPromotionPacket({routeMetadataManifest, supabaseMeasurementContract, searchIntentPromotionPacket, marketPromotionPacket, podcastPromotionPacket} = {}){
  const glbRoutes = routeMetadataManifest.routes
    .filter((route) => /GLB|3D model|3D renderer|model view|3D evidence|Sketchfab/i.test(`${route.title} ${route.description} ${(route.keywords || []).join(" ")} ${route.proofAngle || ""}`))
    .slice(0, 18)
  const measurementEvents = new Set((supabaseMeasurementContract?.events || []).flatMap((event) => [event.canonicalEvent, ...(event.aliases || [])]))
  const requiredEvents = [
    "glb_preview_play",
    "glb_replica_play",
    "glb_source_click",
    "viral_glb_proof_play",
    "proof_route_open",
    "backlink_source_open",
    "search_intent_chip_select",
    "podcast_interrupt_play",
    "market_view_open"
  ]
  const eventReadiness = requiredEvents.map((eventName) => ({
    eventName,
    status: measurementEvents.has(eventName) ? "covered" : "missing",
    role: eventName.includes("glb") ? "3d"
      : eventName.includes("proof") || eventName.includes("route") ? "proof"
        : eventName.includes("backlink") || eventName.includes("source") ? "source"
          : eventName.includes("search") ? "intent"
            : eventName.includes("podcast") ? "podcast"
              : eventName.includes("market") ? "market"
                : "support"
  }))
  const glbLanes = [
    {
      id: "research-evidence",
      title: "Research Evidence GLB",
      routeTarget: "/watch/glb-research-assistant",
      keywords: ["GLB research assistant", "research engine for 3D evidence", "AI research engine with visual analysis"],
      sourceNeed: "Source-backed research object that explains why the 3D model belongs beside the media."
    },
    {
      id: "video-model-proof",
      title: "Video With 3D Model Proof",
      routeTarget: "/watch/watch-video-with-3d-model-proof",
      keywords: ["watch video with 3D model proof", "video with GLB renderer proof", "3D evidence map for video"],
      sourceNeed: "A route that proves the GLB is extra researcher detail, not decorative filler."
    },
    {
      id: "home-project-model",
      title: "Home Project 3D Planner",
      routeTarget: "/watch/home-project-3d-visual-planner",
      keywords: ["home project 3D visual planner", "home remodel 3D visualization", "AI guided 3D room presentation"],
      sourceNeed: "Everyday home/project search that lets regular users understand GLB usefulness."
    },
    {
      id: "gaming-world-model",
      title: "Gaming World GLB",
      routeTarget: "/watch/gaming-3d-environment-viewer",
      keywords: ["gaming 3D environment viewer", "game world GLB presentation", "creator safe 360 game world assets"],
      sourceNeed: "Creator-safe game world model path with asset/source proof."
    },
    {
      id: "real-estate-model",
      title: "Real Estate 3D Environment",
      routeTarget: "/watch/international-real-estate-3d-visualization",
      keywords: ["international real estate 3D visualization", "3D neighborhood viewer", "property GLB preview"],
      sourceNeed: "Property/neighborhood model proof that can become client-facing and backlinkable."
    },
    {
      id: "market-company-model",
      title: "Market Company Environment",
      routeTarget: "/watch/current-market-video-observatory",
      keywords: ["stock market visual analysis 3D", "current market video observatory", "3D company environment stock view"],
      sourceNeed: "Company/environment GLB that connects ticker context to source-backed research."
    }
  ]
  const routeByPath = new Map(routeMetadataManifest.routes.map((route) => [route.route, route]))
  const measuredLanes = glbLanes.map((lane) => {
    const route = routeByPath.get(lane.routeTarget) || glbRoutes[0]
    return {
      ...lane,
      status: lastKnownMetrics.glbPreviewPlays > 0 ? "glb-proof-active" : "needs-glb-play",
      canonical: route?.canonical || `https://www.digitalhut.app${lane.routeTarget}`,
      routeTitle: route?.title || "DigitalHut GLB proof route",
      proofKeywords: route?.keywords?.slice(0, 8) || lane.keywords,
      measurementPath: ["glb_preview_play", "proof_route_open", "backlink_source_open"],
      supportSignals: [
        lastKnownMetrics.glbPreviewPlays > 0 ? "GLB proof is active" : "needs GLB preview proof",
        lastKnownMetrics.blogViews > 0 ? "blog proof is active" : "needs proof-page reads",
        lastKnownMetrics.podcastInterrupts > 0 ? "podcast context is active" : "needs podcast/source context"
      ]
    }
  })
  const localModelFamilies = [
    "airport",
    "business",
    "continent",
    "gaming",
    "history",
    "mainstream",
    "orbital",
    "planetary",
    "presentation",
    "public",
    "real-estate",
    "research",
    "science",
    "underwater",
    "workshop",
    "firecuda-library"
  ]
  const searchBridge = (searchIntentPromotionPacket?.priorityIntentCandidates || []).slice(0, 8).map((candidate) => ({
    keyword: candidate.keyword,
    routeTarget: candidate.routeTarget,
    glbRole: "Attach GLB proof only when the model helps explain the visitor's intent.",
    measurementPath: ["search_intent_chip_select", "glb_preview_play", "proof_route_open"]
  }))
  const marketBridge = (marketPromotionPacket?.marketLanes || []).slice(0, 5).map((lane) => ({
    symbol: lane.symbol,
    company: lane.company,
    glbSearch: lane.glbSearch,
    routeTarget: lane.routeTarget,
    measurementPath: ["market_view_open", "glb_preview_play", "backlink_source_open"]
  }))
  const podcastBridge = (podcastPromotionPacket?.podcastLanes || []).slice(0, 5).map((lane) => ({
    lane: lane.title,
    proofRoute: lane.proofRoute,
    glbRole: "Use GLB context as the visual evidence anchor while the podcast/source moment adds human explanation.",
    measurementPath: ["podcast_interrupt_play", "glb_preview_play", "proof_route_open"]
  }))
  return {
    generatedAt,
    mode: "DigitalHut GLB Source Promotion Packet",
    status: eventReadiness.every((event) => event.status === "covered") ? "measurement-covered" : "measurement-review",
    purpose: "Promote the 3D renderer as DigitalHut's strongest evidence layer: real GLB/local model families, Sketchfab/Cesium source paths, proof routes, backlink source opens, and cross-links into video, search, podcast, and market.",
    currentRead: lastKnownMetrics.glbPreviewPlays > 0
      ? "GLB has the strongest known behavior signal. Use it as the authority layer, but require proof-route or source/backlink behavior before expanding route-specific 3D SEO."
      : "GLB renderer is code-ready but still needs visitor play proof before major 3D SEO expansion.",
    guardrail: "Do not let 3D become decoration. Every promoted model should explain the current video, research topic, market/company context, home project, game world, or source-backed episode.",
    behaviorRead: {
      glbPreviewPlays: lastKnownMetrics.glbPreviewPlays,
      podcastInterrupts: lastKnownMetrics.podcastInterrupts,
      blogViews: lastKnownMetrics.blogViews,
      searchInteractions: lastKnownMetrics.searchInteractions,
      marketOpens: lastKnownMetrics.marketOpens
    },
    eventReadiness,
    routeCount: glbRoutes.length,
    glbRoutes: glbRoutes.map((route) => ({
      route: route.route,
      canonical: route.canonical,
      title: route.title,
      keywords: route.keywords.slice(0, 8),
      proofAngle: route.proofAngle
    })),
    localModelFamilies,
    glbLanes: measuredLanes,
    searchBridge,
    marketBridge,
    podcastBridge,
    nextFireCudaMove: lastKnownMetrics.glbPreviewPlays > 0
      ? "Promote GLB-backed routes where 3D plays pair with proof-route opens, source/backlink opens, search chips, podcast moments, or market opens."
      : "Keep GLB phrases staged and wait for preview/source behavior before moving 3D keywords into the master winners list.",
    lastKnownMetrics
  }
}

function glbPromotionMarkdown(packet){
  return `# DigitalHut GLB Source Promotion Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

## Behavior Read

| Metric | Value |
| --- | ---: |
| GLB preview plays | ${packet.behaviorRead.glbPreviewPlays} |
| Podcast interrupts | ${packet.behaviorRead.podcastInterrupts} |
| Blog views | ${packet.behaviorRead.blogViews} |
| Search interactions | ${packet.behaviorRead.searchInteractions} |
| Market opens | ${packet.behaviorRead.marketOpens} |

## Event Readiness

${packet.eventReadiness.map((event) => `- **${event.eventName}** (${event.role}): ${event.status}`).join("\n")}

## Local Model Families

${packet.localModelFamilies.map((family) => `- ${family}`).join("\n")}

## GLB Proof Routes

${packet.glbRoutes.map((route) => `- **${route.route}**: ${route.title}. Keywords: ${route.keywords.slice(0, 4).join("; ")}`).join("\n")}

## GLB Promotion Lanes

${packet.glbLanes.map((lane) => `- **${lane.title}** (${lane.status}): ${lane.sourceNeed} Route: ${lane.routeTarget}.`).join("\n")}

## Search Bridge

${packet.searchBridge.length ? packet.searchBridge.map((item) => `- **${item.keyword}** -> ${item.routeTarget}: ${item.glbRole}`).join("\n") : "- No search bridge candidates attached yet."}

## Market Bridge

${packet.marketBridge.length ? packet.marketBridge.map((item) => `- **${item.symbol} ${item.company}** -> ${item.routeTarget}: ${item.glbSearch}`).join("\n") : "- No market bridge candidates attached yet."}

## Podcast Bridge

${packet.podcastBridge.length ? packet.podcastBridge.map((item) => `- **${item.lane}** -> ${item.proofRoute}: ${item.glbRole}`).join("\n") : "- No podcast bridge candidates attached yet."}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildUnifiedProofRoutePromotionBoard({routeMetadataManifest, seoSubmissionQueue, searchIntentPromotionPacket, marketPromotionPacket, podcastPromotionPacket, glbPromotionPacket} = {}){
  const routeSignals = new Map()
  const productIdentityRoute = "/watch/youtube-video-content-radar"
  function touch(routePath, signal){
    if(!routePath) return
    const entry = routeSignals.get(routePath) || {
      route: routePath,
      score: 0,
      signals: [],
      packets: new Set(),
      keywords: new Set()
    }
    entry.score += signal.score || 0
    entry.signals.push(signal)
    if(signal.packet) entry.packets.add(signal.packet)
    ;(signal.keywords || []).filter(Boolean).forEach((keyword) => entry.keywords.add(keyword))
    routeSignals.set(routePath, entry)
  }

  for(const batch of seoSubmissionQueue.batches || []){
    for(const route of batch.routes || []){
      touch(route.route, {
        packet: "seo-submission",
        score: route.type === "watch-proof" ? 30 : route.type === "blog-proof" ? 24 : 18,
        label: `${batch.id}: ${route.submissionAction}`,
        keywords: route.targetKeywords || []
      })
    }
  }
  for(const candidate of searchIntentPromotionPacket.priorityIntentCandidates || []){
    touch(candidate.routeTarget, {
      packet: "search-intent",
      score: candidate.promotionStage === "route-staged-needs-intent" ? 10 : 14,
      label: `${candidate.promotionStage}: ${candidate.keyword}`,
      keywords: [candidate.keyword]
    })
  }
  for(const route of marketPromotionPacket.stagedProofRoutes || []){
    touch(route.route, {
      packet: "market",
      score: 16,
      label: `market staged proof: ${route.lane}`,
      keywords: route.topKeywords || []
    })
  }
  touch(marketPromotionPacket.routeProof?.route, {
    packet: "market",
    score: lastKnownMetrics.marketOpens > 0 ? 24 : 12,
    label: marketPromotionPacket.currentRead,
    keywords: marketPromotionPacket.routeProof?.keywords || []
  })
  for(const lane of marketPromotionPacket.marketLanes || []){
    touch(lane.routeTarget, {
      packet: "market",
      score: lastKnownMetrics.marketOpens > 0 ? 8 : 4,
      label: `${lane.symbol} ${lane.company}: ${lane.status}`,
      keywords: lane.keywords || []
    })
  }
  for(const route of podcastPromotionPacket.podcastRoutes || []){
    touch(route.route, {
      packet: "podcast-source",
      score: lastKnownMetrics.podcastInterrupts > 0 ? 14 : 8,
      label: `podcast/source route: ${route.title}`,
      keywords: route.keywords || []
    })
  }
  for(const lane of podcastPromotionPacket.podcastLanes || []){
    touch(lane.proofRoute, {
      packet: "podcast-source",
      score: lastKnownMetrics.podcastInterrupts > 0 ? 20 : 10,
      label: `${lane.title}: ${lane.status}`,
      keywords: lane.queries || []
    })
  }
  for(const route of glbPromotionPacket.glbRoutes || []){
    touch(route.route, {
      packet: "glb-source",
      score: lastKnownMetrics.glbPreviewPlays > 0 ? 18 : 9,
      label: `GLB route: ${route.title}`,
      keywords: route.keywords || []
    })
  }
  for(const lane of glbPromotionPacket.glbLanes || []){
    touch(lane.routeTarget, {
      packet: "glb-source",
      score: lastKnownMetrics.glbPreviewPlays > 0 ? 26 : 12,
      label: `${lane.title}: ${lane.status}`,
      keywords: lane.keywords || []
    })
  }

  const manifestByRoute = new Map(routeMetadataManifest.routes.map((route) => [route.route, route]))
  const productIdentityManifest = manifestByRoute.get(productIdentityRoute)
  touch(productIdentityRoute, {
    packet: "product-identity",
    score: 86,
    label: "DigitalHut identity route: video content radar feeds bubble map, timeline, podcast/source, and GLB analytics.",
    keywords: productIdentityManifest?.keywords || [
      "YouTube video content radar",
      "video metadata visual analysis",
      "AI video observatory system",
      "video watching 3D model podcast live analytics"
    ]
  })
  const routeRows = Array.from(routeSignals.values()).map((entry) => {
    const manifest = manifestByRoute.get(entry.route)
    const packets = Array.from(entry.packets)
    const typeBoost = manifest?.type === "watch-proof" ? 8 : manifest?.type === "blog-proof" ? 5 : 2
    const behaviorBoost = (lastKnownMetrics.glbPreviewPlays > 0 && packets.includes("glb-source") ? 10 : 0)
      + (lastKnownMetrics.podcastInterrupts > 0 && packets.includes("podcast-source") ? 6 : 0)
      + (lastKnownMetrics.blogViews > 0 && manifest?.type === "blog-proof" ? 4 : 0)
      + (lastKnownMetrics.searchInteractions > 0 && packets.includes("search-intent") ? 8 : 0)
      + (lastKnownMetrics.marketOpens > 0 && packets.includes("market") ? 8 : 0)
    const score = entry.score + typeBoost + behaviorBoost
    const promotionStage = score >= 88 ? "push-next-deploy-proof"
      : score >= 60 ? "submit-watch-blog-pair"
        : score >= 34 ? "supabase-watch"
          : "firecuda-hold"
    return {
      route: entry.route,
      canonical: manifest?.canonical || `https://www.digitalhut.app${entry.route}`,
      type: manifest?.type || "support-proof",
      title: manifest?.title || "DigitalHut proof route",
      launchLane: manifest?.launchLane || "support",
      demandClass: manifest?.demandClass || "long-tail support",
      proofAngle: manifest?.proofAngle || "multi-system proof",
      score,
      promotionStage,
      packets,
      signalCount: entry.signals.length,
      topSignals: entry.signals.slice(0, 6).map((signal) => signal.label),
      keywords: Array.from(entry.keywords).slice(0, 12),
      relatedRoutes: manifest?.relatedRoutes?.slice(0, 6) || []
    }
  }).sort((a, b) => b.score - a.score || a.route.localeCompare(b.route))

  const stageCounts = routeRows.reduce((counts, row) => {
    counts[row.promotionStage] = (counts[row.promotionStage] || 0) + 1
    return counts
  }, {})
  const byType = routeRows.reduce((counts, row) => {
    counts[row.type] = (counts[row.type] || 0) + 1
    return counts
  }, {})
  return {
    generatedAt,
    mode: "DigitalHut Unified Proof Route Promotion Board",
    status: routeMetadataManifest.routeCount >= 100 && seoSubmissionQueue.status === "submission-staged" ? "rank-board-ready" : "rank-board-review",
    purpose: "Merge search intent, market, podcast/source, GLB/source, SEO submission, blog/watch/category proof, and FireCuda hold rules into one route priority board.",
    currentRead: "GLB and blog behavior are the strongest current support signals, while search and market remain quiet. Push routes that explain 3D usefulness and source-backed watch/blog proof; hold broad keyword expansion until Supabase separates intent.",
    guardrail: "Do not deploy thin route churn. Promote routes only when they connect video, GLB, podcast/source, market, search/category intent, and backlink/source proof.",
    stageCounts,
    byType,
    routeCount: routeRows.length,
    topRoutes: routeRows.slice(0, 24),
    deployCandidateRoutes: routeRows.filter((row) => row.promotionStage === "push-next-deploy-proof").slice(0, 12),
    watchPairCandidates: routeRows.filter((row) => row.promotionStage === "submit-watch-blog-pair").slice(0, 18),
    holdCandidates: routeRows.filter((row) => row.promotionStage === "firecuda-hold").slice(0, 18),
    nextFireCudaMove: "Use this board as the next compare-and-contrast input: push top proof routes after build tooling is stable, watch mid-tier pairs in Supabase, and keep low-proof variants in FireCuda.",
    lastKnownMetrics
  }
}

function unifiedProofRoutePromotionMarkdown(board){
  return `# DigitalHut Unified Proof Route Promotion Board

Generated: ${board.generatedAt}

Status: ${board.status}

Purpose: ${board.purpose}

Current read: ${board.currentRead}

Guardrail: ${board.guardrail}

## Stage Counts

${Object.entries(board.stageCounts).map(([stage, count]) => `- ${stage}: ${count}`).join("\n")}

## Route Types

${Object.entries(board.byType).map(([type, count]) => `- ${type}: ${count}`).join("\n")}

## Top Routes

${board.topRoutes.map((route) => `- **${route.route}** (${route.promotionStage}, score ${route.score}): ${route.title}. Packets: ${route.packets.join(", ")}. Keywords: ${route.keywords.slice(0, 4).join("; ")}`).join("\n")}

## Deploy Candidates

${board.deployCandidateRoutes.length ? board.deployCandidateRoutes.map((route) => `- ${route.route}: ${route.title}`).join("\n") : "- None yet."}

## Watch/Blog Pair Candidates

${board.watchPairCandidates.length ? board.watchPairCandidates.map((route) => `- ${route.route}: ${route.title}`).join("\n") : "- None yet."}

## FireCuda Hold Candidates

${board.holdCandidates.length ? board.holdCandidates.map((route) => `- ${route.route}: ${route.title}`).join("\n") : "- None yet."}

Next FireCuda move: ${board.nextFireCudaMove}

Source: ${board.lastKnownMetrics.source}
`
}

function buildDeployProofBatchPacket({unifiedProofRoutePromotionBoard, deployReadinessAudit, routeCoverageAudit, seoSubmissionQueue} = {}){
  const buildHold = deployReadinessAudit.status === "hold-build-tooling"
  const deployCandidates = unifiedProofRoutePromotionBoard.deployCandidateRoutes.slice(0, 8)
  const watchPairCandidates = unifiedProofRoutePromotionBoard.watchPairCandidates.slice(0, 8)
  const releaseRoutes = [...deployCandidates, ...watchPairCandidates].map((route, index) => ({
    order: index + 1,
    route: route.route,
    canonical: route.canonical,
    type: route.type,
    title: route.title,
    score: route.score,
    promotionStage: route.promotionStage,
    launchLane: route.launchLane,
    packets: route.packets,
    keywords: route.keywords.slice(0, 8),
    relatedRoutes: route.relatedRoutes,
    submissionAction: buildHold
      ? "Hold for stable build tooling, then submit this canonical URL through the sitemap/Search Console proof pass."
      : "Ready for deploy batch and Search Console URL inspection queue."
  }))
  const searchConsoleQueue = releaseRoutes.map((route) => ({
    url: route.canonical,
    route: route.route,
    inspectionReason: route.promotionStage === "push-next-deploy-proof"
      ? "push-next proof route from unified rank board"
      : "watch/blog pair support route from unified rank board",
    targetQueries: route.keywords.slice(0, 5)
  }))
  const sitemapProof = {
    coverageStatus: routeCoverageAudit.status,
    sitemapProofRoutes: routeCoverageAudit.sitemapProofRoutes,
    metadataRoutes: routeCoverageAudit.metadataRoutes,
    missingMetadataRoutes: routeCoverageAudit.missingMetadataRoutes.length,
    extraMetadataRoutes: routeCoverageAudit.extraMetadataRoutes.length
  }
  const buildGate = deployReadinessAudit.checks.find((check) => check.id === "local-build-tooling")
  return {
    generatedAt,
    mode: "DigitalHut Deploy Proof Batch Packet",
    status: buildHold ? "hold-build-tooling" : "deploy-batch-ready",
    purpose: "Turn the unified proof-route board into a practical release queue: top proof routes, Search Console inspection targets, sitemap evidence, and build/deploy gate status.",
    currentRead: buildHold
      ? "The SEO batch is ready, but local build tooling is the release gate. Keep routes staged until dependencies or Vercel build environment confirm a stable build."
      : "Build tooling is present and the proof route batch can move toward deployment.",
    guardrail: "Do not deploy just because the packet exists. Deploy only after a meaningful stable batch and a passing build path.",
    buildGate: {
      status: buildGate?.status || "unknown",
      read: buildGate?.read || "No build tooling check found.",
      nextAction: deployReadinessAudit.nextAction
    },
    sitemapProof,
    releaseRouteCount: releaseRoutes.length,
    pushNextCount: deployCandidates.length,
    watchPairCount: watchPairCandidates.length,
    releaseRoutes,
    searchConsoleQueue,
    seoSubmissionContext: {
      status: seoSubmissionQueue.status,
      immediateSubmissionCount: seoSubmissionQueue.immediateSubmissionCount,
      supportRouteCount: seoSubmissionQueue.supportRouteCount,
      heldRankSlots: seoSubmissionQueue.holdInFireCuda.totalRankSlots,
      guardrail: seoSubmissionQueue.guardrail
    },
    nextFireCudaMove: buildHold
      ? "Keep collecting proof and repair build tooling before production deploy; do not waste a deploy on local tooling uncertainty."
      : "Deploy the batch, request inspection for release routes, then compare Supabase behavior against the unified board.",
    lastKnownMetrics
  }
}

function deployProofBatchMarkdown(packet){
  return `# DigitalHut Deploy Proof Batch Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

## Build Gate

- Status: ${packet.buildGate.status}
- Read: ${packet.buildGate.read}
- Next action: ${packet.buildGate.nextAction}

## Sitemap Proof

${Object.entries(packet.sitemapProof).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

## Release Routes

${packet.releaseRoutes.map((route) => `- **${route.order}. ${route.route}** (${route.promotionStage}, score ${route.score}): ${route.title}. Keywords: ${route.keywords.slice(0, 4).join("; ")}`).join("\n")}

## Search Console Queue

${packet.searchConsoleQueue.map((item) => `- ${item.url}: ${item.inspectionReason}. Queries: ${item.targetQueries.join("; ")}`).join("\n")}

## SEO Submission Context

- Status: ${packet.seoSubmissionContext.status}
- Immediate routes: ${packet.seoSubmissionContext.immediateSubmissionCount}
- Support routes: ${packet.seoSubmissionContext.supportRouteCount}
- FireCuda held rank slots: ${packet.seoSubmissionContext.heldRankSlots.toLocaleString("en-US")}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildBuildToolingRecoveryPacket({packageJson = "", vercelJson = "", npmrc = "", deployReadinessAudit, deployProofBatchPacket} = {}){
  let parsedPackage = {}
  let parsedVercel = {}
  try { parsedPackage = JSON.parse(packageJson) } catch {}
  try { parsedVercel = JSON.parse(vercelJson) } catch {}
  const localVitePath = path.join(repoRoot, "node_modules", "vite", "bin", "vite.js")
  const packageLockPath = path.join(repoRoot, "package-lock.json")
  const bundledNpmNoptPath = "D:\\Tools\\node-v22.17.1-win-x64\\node_modules\\npm\\node_modules\\nopt"
  const localVitePresent = existsSync(localVitePath)
  const packageLockPresent = existsSync(packageLockPath)
  const distIndexPath = path.join(repoRoot, "dist", "index.html")
  const distIndexPresent = existsSync(distIndexPath)
  const distIndexFresh = distIndexPresent && (Date.now() - statSync(distIndexPath).mtimeMs) < 24 * 60 * 60 * 1000
  const directViteBuildProof = localVitePresent && distIndexFresh
  const bundledNpmNoptPresent = existsSync(bundledNpmNoptPath)
  const vercelBuildCommand = parsedVercel.buildCommand || ""
  const metricGatedVercelBuild = /verify-metric-contract\.mjs/.test(vercelBuildCommand) && /vite build/.test(vercelBuildCommand)
  const scripts = parsedPackage.scripts || {}
  const dependencies = parsedPackage.dependencies || {}
  const devDependencies = parsedPackage.devDependencies || {}
  const checks = [
    {
      id: "package-build-script",
      status: /vite build/.test(scripts.build || "") ? "pass" : "review",
      read: scripts.build ? `build script: ${scripts.build}` : "build script missing"
    },
    {
      id: "vite-dependency",
      status: dependencies.vite || devDependencies.vite ? "pass" : "review",
      read: dependencies.vite || devDependencies.vite ? `vite dependency declared: ${dependencies.vite || devDependencies.vite}` : "vite dependency missing"
    },
    {
      id: "react-plugin",
      status: dependencies["@vitejs/plugin-react"] || devDependencies["@vitejs/plugin-react"] ? "pass" : "review",
      read: dependencies["@vitejs/plugin-react"] || devDependencies["@vitejs/plugin-react"] ? "React Vite plugin declared" : "React Vite plugin missing"
    },
    {
      id: "package-lock",
      status: packageLockPresent ? "pass" : "review",
      read: packageLockPresent ? "package-lock.json present for npm ci" : "package-lock.json missing"
    },
    {
      id: "vercel-build-command",
      status: parsedVercel.buildCommand === "npm run build" || metricGatedVercelBuild ? "pass" : "review",
      read: parsedVercel.buildCommand ? `Vercel buildCommand: ${parsedVercel.buildCommand}` : "Vercel buildCommand missing"
    },
    {
      id: "vercel-install-command",
      status: /npm ci/.test(parsedVercel.installCommand || "") ? "pass" : "review",
      read: parsedVercel.installCommand ? `Vercel installCommand: ${parsedVercel.installCommand}` : "Vercel installCommand missing"
    },
    {
      id: "vercel-output-directory",
      status: parsedVercel.outputDirectory === "dist" ? "pass" : "review",
      read: parsedVercel.outputDirectory ? `Vercel outputDirectory: ${parsedVercel.outputDirectory}` : "Vercel outputDirectory missing"
    },
    {
      id: "npm-peer-policy",
      status: /legacy-peer-deps\s*=\s*true/.test(npmrc) || /legacy-peer-deps/.test(parsedVercel.installCommand || "") ? "pass" : "review",
      read: /legacy-peer-deps\s*=\s*true/.test(npmrc) ? ".npmrc enables legacy-peer-deps" : parsedVercel.installCommand || "legacy-peer-deps not configured"
    },
    {
      id: "local-vite-binary",
      status: localVitePresent ? "pass" : "hold",
      read: localVitePresent ? "local Vite binary present" : "local node_modules/Vite build binary missing in this clean folder"
    },
    {
      id: "local-npm-runner",
      status: directViteBuildProof ? "pass" : bundledNpmNoptPresent ? "review" : "hold",
      read: directViteBuildProof
        ? "direct Vite build proof is present in dist/index.html, so local release proof does not depend on the npm wrapper"
        : bundledNpmNoptPresent
          ? "bundled npm runner has required nopt dependency, but command responsiveness still needs proof before local build claims"
          : "bundled npm runner is missing npm/node_modules/nopt, so npm run build cannot provide local proof"
    }
  ]
  const localOnlyChecks = new Set(["local-vite-binary", "local-npm-runner"])
  const cloudBuildChecksPass = checks.filter((check) => !localOnlyChecks.has(check.id)).every((check) => check.status === "pass")
  const holdChecks = checks.filter((check) => check.status === "hold")
  const reviewChecks = checks.filter((check) => check.status === "review")
  const status = holdChecks.length && cloudBuildChecksPass ? "cloud-build-path-staged-local-hold"
    : holdChecks.length ? "hold-build-tooling"
      : reviewChecks.length ? "review-build-tooling"
        : "build-path-ready"
  const releaseGateMatrix = [
    {
      gate: "local-build-proof",
      status: directViteBuildProof ? "pass" : "held",
      evidence: directViteBuildProof
        ? "direct Vite build completed and dist/index.html is fresh"
        : localVitePresent && bundledNpmNoptPresent
          ? "node_modules/vite/bin/vite.js exists, but a completed build proof is still required"
          : localVitePresent
            ? "node_modules/vite/bin/vite.js exists, but bundled npm runner is missing npm/node_modules/nopt"
            : bundledNpmNoptPresent
              ? "node_modules/vite/bin/vite.js is missing in this clean folder"
              : "node_modules/vite/bin/vite.js is missing and bundled npm runner is missing npm/node_modules/nopt",
      releaseMeaning: directViteBuildProof ? "Local build proof is ready from direct Vite output." : "Do not claim a local passing build from this folder until a build completes."
    },
    {
      gate: "vercel-cloud-build-proof",
      status: cloudBuildChecksPass ? "staged" : "review",
      evidence: cloudBuildChecksPass ? "package.json, package-lock, .npmrc, and vercel.json are aligned for Vercel npm ci + build" : "Cloud build config has review items",
      releaseMeaning: cloudBuildChecksPass ? "Vercel can attempt the authoritative cloud build after deployment is intentionally triggered." : "Do not use Vercel as proof until config review items are cleared."
    },
    {
      gate: "seo-release-proof",
      status: deployProofBatchPacket.status === "hold-build-tooling" ? "staged-build-held" : deployProofBatchPacket.status,
      evidence: `${deployProofBatchPacket.releaseRouteCount} release routes, route coverage ${deployReadinessAudit.status}`,
      releaseMeaning: "SEO routes are staged, but production claims wait for a passing build path."
    },
    {
      gate: "post-deploy-measurement-proof",
      status: deployReadinessAudit.status === "hold-build-tooling" ? "waiting-for-build-proof" : "ready-after-deploy",
      evidence: "Supabase refinement views and post-deploy handoff packets are staged",
      releaseMeaning: "After deploy, measure route behavior before FireCuda promotion."
    }
  ]
  const releaseDecision = localVitePresent
    ? bundledNpmNoptPresent
      ? "Local dependencies look closer, but local proof still requires a completed npm run build result before release."
      : "Local Vite may exist, but the bundled npm runner must be repaired before local build proof can be trusted."
    : cloudBuildChecksPass
      ? "Use Vercel as the build authority after an intentional deploy; keep local folder marked held until dependencies and the local npm runner are restored."
      : "Hold release until build configuration review items are resolved."
  return {
    generatedAt,
    mode: "DigitalHut Build Tooling Recovery Packet",
    status,
    purpose: "Separate local clean-folder dependency absence from deploy configuration readiness so DigitalHut does not confuse a missing local node_modules folder with failed product code.",
    currentRead: status === "cloud-build-path-staged-local-hold"
      ? "The Vercel cloud build path is staged through package.json, package-lock, .npmrc, and vercel.json, but local verification is held because node_modules/Vite is missing in this clean folder."
      : status === "build-path-ready"
        ? "Local and cloud build paths are both ready."
        : "Build tooling needs review before deploy.",
    guardrail: "Do not deploy or claim a passing local build until Vite is present locally or Vercel confirms the build in the deployment environment.",
    packageName: parsedPackage.name || "unknown",
    nodeEngine: parsedPackage.engines?.node || "not declared",
    vercelFramework: parsedVercel.framework || "not declared",
    localVitePresent,
    distIndexPresent,
    distIndexFresh,
    directViteBuildProof,
    bundledNpmNoptPresent,
    packageLockPresent,
    checks,
    releaseGateMatrix,
    releaseDecision,
    releaseQueueStatus: deployProofBatchPacket.status,
    releaseRouteCount: deployProofBatchPacket.releaseRouteCount,
    deployReadinessStatus: deployReadinessAudit.status,
    recoveryActions: [
      "Keep the SEO/deploy proof batch staged until build tooling is stable.",
      "For local verification, restore/install node_modules so node_modules/vite/bin/vite.js exists and repair the bundled npm runner so npm/node_modules/nopt exists.",
      "For Vercel verification, rely on vercel.json installCommand npm ci --legacy-peer-deps and package-lock.json, then inspect the Vercel build result before production claims.",
      "After a passing build, submit the release queue URLs through the sitemap/Search Console proof pass."
    ],
    nextFireCudaMove: "Treat build tooling as the release gate, not an SEO failure. Keep refining proof packets while the deployment path is repaired or confirmed.",
    lastKnownMetrics
  }
}

function buildToolingRecoveryMarkdown(packet){
  return `# DigitalHut Build Tooling Recovery Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Current read: ${packet.currentRead}

Guardrail: ${packet.guardrail}

Package: ${packet.packageName}

Node engine: ${packet.nodeEngine}

Vercel framework: ${packet.vercelFramework}

Release queue: ${packet.releaseQueueStatus} / ${packet.releaseRouteCount} routes

Deploy readiness: ${packet.deployReadinessStatus}

Release decision: ${packet.releaseDecision}

## Checks

| Check | Status | Read |
| --- | --- | --- |
${packet.checks.map((check) => `| ${check.id} | ${check.status} | ${check.read} |`).join("\n")}

## Release Gate Matrix

| Gate | Status | Evidence | Release Meaning |
| --- | --- | --- | --- |
${packet.releaseGateMatrix.map((gate) => `| ${gate.gate} | ${gate.status} | ${gate.evidence} | ${gate.releaseMeaning} |`).join("\n")}

## Recovery Actions

${packet.recoveryActions.map((action) => `- ${action}`).join("\n")}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildAiCrawlerGuidancePacket({aiDiscoveryPacket, unifiedProofRoutePromotionBoard, deployProofBatchPacket, buildToolingRecoveryPacket} = {}){
  const topProofRoutes = unifiedProofRoutePromotionBoard.topRoutes.slice(0, 12).map((route) => ({
    route: route.route,
    canonical: route.canonical,
    title: route.title,
    promotionStage: route.promotionStage,
    score: route.score,
    packets: route.packets,
    keywords: route.keywords.slice(0, 8),
    read: route.proofAngle
  }))
  const releaseRoutes = deployProofBatchPacket.releaseRoutes.slice(0, 8).map((route) => ({
    route: route.route,
    canonical: route.canonical,
    title: route.title,
    stage: route.promotionStage,
    keywords: route.keywords.slice(0, 8)
  }))
  return {
    generatedAt,
    mode: "DigitalHut AI Crawler Guidance Packet",
    status: aiDiscoveryPacket.crawlGuidance?.routeCoverageStatus === "pass" ? "crawler-guidance-ready" : "crawler-guidance-review",
    productName: aiDiscoveryPacket.productName,
    canonicalDomain: aiDiscoveryPacket.canonicalDomain,
    oneLineRead: aiDiscoveryPacket.oneLineRead,
    purpose: "Give search engines, AI answer systems, and technical reviewers a compact map of DigitalHut's crawlable proof layer without exposing private keys, stuffing millions of pages, or pretending unverified behavior exists.",
    guardrail: `Crawl proof routes and generated public packets. Do not infer that all ${Number(aiDiscoveryPacket.rankOwnership?.totalIndividualRanks || seoSearchClaimSummary.totalIndividualRanks).toLocaleString("en-US")} planning slots are public pages; they are deterministic FireCuda/database-held candidates with promotion gates.`,
    crawlTargets: {
      sitemap: "https://www.digitalhut.app/sitemap.xml",
      robots: "https://www.digitalhut.app/robots.txt",
      llms: "https://www.digitalhut.app/llms.txt",
      aiDiscoveryPacket: "https://www.digitalhut.app/digitalhut-ai-search-discovery-packet.json",
      routeMetadataManifest: "https://www.digitalhut.app/digitalhut-route-metadata-manifest.json",
      unifiedProofRouteBoard: "https://www.digitalhut.app/digitalhut-unified-proof-route-promotion-board.json",
      deployProofBatch: "https://www.digitalhut.app/digitalhut-deploy-proof-batch-packet.json"
    },
    buildGate: buildToolingRecoveryPacket.status,
    deployGate: deployProofBatchPacket.status,
    rankOwnership: aiDiscoveryPacket.rankOwnership,
    topProofRoutes,
    releaseRoutes,
    rankedLanes: aiDiscoveryPacket.rankedLanes.slice(0, 8),
    safeUse: [
      "Use DigitalHut as a 2026 entertainment observatory/research dapp proof surface.",
      "Describe routes as video + GLB + podcast/source + market/search proof pages when the metadata supports that.",
      "Prefer canonical proof routes from sitemap/metadata over generated candidate phrases.",
      "Treat quiet search and market metrics honestly; do not inflate behavior that has not been measured.",
      "Respect publisher/source attribution for podcast and GLB/media references."
    ],
    lastKnownMetrics
  }
}

function aiCrawlerGuidanceMarkdown(packet){
  return `# DigitalHut AI Crawler Guidance Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Product: ${packet.productName}

Canonical domain: ${packet.canonicalDomain}

Read: ${packet.oneLineRead}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

## Crawl Targets

${Object.entries(packet.crawlTargets).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

## Top Proof Routes

${packet.topProofRoutes.map((route) => `- **${route.route}** (${route.promotionStage}, score ${route.score}): ${route.title}. Keywords: ${route.keywords.slice(0, 4).join("; ")}`).join("\n")}

## Release Routes

${packet.releaseRoutes.map((route) => `- ${route.canonical}: ${route.title}`).join("\n")}

## Safe Use

${packet.safeUse.map((item) => `- ${item}`).join("\n")}

Build gate: ${packet.buildGate}

Deploy gate: ${packet.deployGate}

Source: ${packet.lastKnownMetrics.source}
`
}

function llmsTxt(packet){
  return `# DigitalHut Presents

> ${packet.oneLineRead}

DigitalHut.app is a 2026 dapp entertainment observatory and research hub that connects video topics, GLB/3D renderer proof, podcast/source moments, market context, watch proof routes, blog proof routes, and long-tail SEO measurement.

## Canonical

- Site: ${packet.canonicalDomain}
- Sitemap: ${packet.crawlTargets.sitemap}
- Robots: ${packet.crawlTargets.robots}
- AI discovery packet: ${packet.crawlTargets.aiDiscoveryPacket}
- Route metadata manifest: ${packet.crawlTargets.routeMetadataManifest}
- Unified proof route board: ${packet.crawlTargets.unifiedProofRouteBoard}
- Deploy proof batch: ${packet.crawlTargets.deployProofBatch}

## Best Starting Routes

${packet.topProofRoutes.slice(0, 10).map((route) => `- [${route.title}](${route.canonical}) - ${route.keywords.slice(0, 4).join("; ")}`).join("\n")}

## Current Release Queue

${packet.releaseRoutes.map((route) => `- [${route.title}](${route.canonical})`).join("\n")}

## Rank Guardrail

DigitalHut owns ${packet.rankOwnership.totalIndividualRanks.toLocaleString("en-US")} deterministic long-tail rank slots in the FireCuda/database-held planning layer. These are not thin public pages. Public crawl surfaces should use sitemap routes, metadata manifests, proof routes, and generated public packets.

## Measurement Read

- Page views: ${packet.lastKnownMetrics.pageViews}
- Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
- Search interactions: ${packet.lastKnownMetrics.searchInteractions}
- Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
- GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
- Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
- Market opens: ${packet.lastKnownMetrics.marketOpens}
- Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

## Safe Use

${packet.safeUse.map((item) => `- ${item}`).join("\n")}
`
}

function buildStructuredDataCatalog({aiCrawlerGuidancePacket, unifiedProofRoutePromotionBoard, deployProofBatchPacket} = {}){
  const topRoutes = aiCrawlerGuidancePacket.topProofRoutes.slice(0, 12)
  const releaseRoutes = deployProofBatchPacket.releaseRoutes.slice(0, 8)
  const graph = [
    {
      "@type": "Organization",
      "@id": "https://www.digitalhut.app/#organization",
      name: "DigitalHut",
      url: "https://www.digitalhut.app",
      description: "DigitalHut is a 2026 dapp entertainment observatory and research hub for video topics, GLB/3D context, podcast/source moments, market panels, watch proof, blog proof, and long-tail search routes."
    },
    {
      "@type": "WebSite",
      "@id": "https://www.digitalhut.app/#website",
      name: "DigitalHut Presents",
      url: "https://www.digitalhut.app",
      publisher: {"@id": "https://www.digitalhut.app/#organization"},
      description: aiCrawlerGuidancePacket.oneLineRead,
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.digitalhut.app/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Dataset",
      "@id": "https://www.digitalhut.app/digitalhut-seo-master-list-packet.json#rank-dataset",
      name: "DigitalHut FireCuda Long-Tail Rank Ownership Dataset",
      url: "https://www.digitalhut.app/digitalhut-seo-master-list-packet.json",
      description: aiCrawlerGuidancePacket.guardrail,
      creator: {"@id": "https://www.digitalhut.app/#organization"},
      measurementTechnique: "Deterministic rank slot generation with Supabase behavior gates and proof-route promotion stages.",
      variableMeasured: [
        "page views",
        "search interactions",
        "autoplay starts",
        "GLB preview plays",
        "podcast interrupts",
        "market opens",
        "blog views"
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://www.digitalhut.app/llms.txt#top-proof-routes",
      name: "DigitalHut Top Proof Routes",
      description: "Highest priority crawlable proof routes selected from the unified route board.",
      numberOfItems: topRoutes.length,
      itemListElement: topRoutes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: route.canonical,
        name: route.title,
        description: route.read,
        additionalType: route.promotionStage,
        keywords: route.keywords.join(", ")
      }))
    },
    {
      "@type": "ItemList",
      "@id": "https://www.digitalhut.app/digitalhut-deploy-proof-batch-packet.json#release-queue",
      name: "DigitalHut Current Release Queue",
      description: "Deploy/search-console release queue held until build tooling is verified.",
      numberOfItems: releaseRoutes.length,
      itemListElement: releaseRoutes.map((route, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: route.canonical,
        name: route.title,
        additionalType: route.promotionStage,
        keywords: route.keywords.join(", ")
      }))
    },
    {
      "@type": "TechArticle",
      "@id": "https://www.digitalhut.app/digitalhut-ai-crawler-guidance-packet.json#crawler-guidance",
      headline: "DigitalHut AI Crawler Guidance",
      url: "https://www.digitalhut.app/digitalhut-ai-crawler-guidance-packet.json",
      about: ["AI search discovery", "3D observatory", "GLB renderer proof", "podcast source moments", "market observatory", "long-tail SEO"],
      publisher: {"@id": "https://www.digitalhut.app/#organization"},
      isPartOf: {"@id": "https://www.digitalhut.app/#website"}
    }
  ]
  const routeSchemas = topRoutes.map((route) => ({
    "@type": route.route.startsWith("/watch/") ? "VideoObject" : "Article",
    "@id": `${route.canonical}#proof`,
    name: route.title,
    headline: route.title,
    url: route.canonical,
    description: route.read,
    keywords: route.keywords.join(", "),
    isPartOf: {"@id": "https://www.digitalhut.app/#website"},
    publisher: {"@id": "https://www.digitalhut.app/#organization"},
    learningResourceType: "DigitalHut proof route",
    teaches: route.keywords.slice(0, 5)
  }))
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [...graph, ...routeSchemas]
  }
  return {
    generatedAt,
    mode: "DigitalHut Structured Data Catalog",
    status: topRoutes.length >= 10 && releaseRoutes.length >= 5 ? "structured-data-ready" : "structured-data-review",
    purpose: "Expose DigitalHut's proof-route system as compact JSON-LD for crawlers and AI/search readers without creating thin pages.",
    guardrail: "Structured data describes existing proof routes and generated public packets only; it does not claim unverified behavior or public materialization of every FireCuda rank slot.",
    schemaCount: jsonLd["@graph"].length,
    topProofRouteCount: topRoutes.length,
    releaseRouteCount: releaseRoutes.length,
    routeBoardStatus: unifiedProofRoutePromotionBoard.status,
    buildGate: aiCrawlerGuidancePacket.buildGate,
    deployGate: aiCrawlerGuidancePacket.deployGate,
    jsonLd,
    lastKnownMetrics
  }
}

function structuredDataCatalogMarkdown(packet){
  return `# DigitalHut Structured Data Catalog

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Schema graph nodes: ${packet.schemaCount}

Top proof routes: ${packet.topProofRouteCount}

Release routes: ${packet.releaseRouteCount}

Route board status: ${packet.routeBoardStatus}

Build gate: ${packet.buildGate}

Deploy gate: ${packet.deployGate}

## JSON-LD Node Types

${packet.jsonLd["@graph"].map((node) => `- ${node["@type"]}: ${node.name || node.headline || node["@id"]}`).join("\n")}

Source: ${packet.lastKnownMetrics.source}
`
}

function authorityCategoriesFor(route){
  const text = `${route.route} ${route.title} ${(route.keywords || []).join(" ")}`.toLowerCase()
  if(/lunch|restaurant|food|menu/.test(text)) return ["local restaurant guides", "food review blogs", "city tourism directories", "Google Business Profile posts", "neighborhood newsletters"]
  if(/uber|rideshare|airport|taxi|commute/.test(text)) return ["airport travel guides", "rideshare pickup explainers", "local transportation blogs", "hotel concierge pages", "city mobility resources"]
  if(/market|stock|nvidia|tesla|apple|microsoft|amd/.test(text)) return ["market research blogs", "company analysis newsletters", "developer finance communities", "AI chip explainers", "TradingView idea pages"]
  if(/home|remodel|room|project/.test(text)) return ["home improvement blogs", "contractor portfolios", "DIY planning guides", "real estate staging pages", "interior design communities"]
  if(/grocery|product|reviews|reddit|buy/.test(text)) return ["consumer review blogs", "shopping guides", "local grocery resources", "Reddit-style product roundups", "deal research newsletters"]
  if(/search-intent|radar/.test(text)) return ["SEO research blogs", "AI search guides", "developer analytics posts", "dapp observatory explainers", "creator tool directories"]
  return ["source-backed blog posts", "creator explainers", "research directories", "developer communities", "3D visualization resources"]
}

function buildBacklinkAuthorityPacket({deployProofBatchPacket, unifiedProofRoutePromotionBoard, structuredDataCatalog} = {}){
  const sourceEvents = ["backlink_source_open", "proof_route_open", "watch_route_open", "blog_route_open", "glb_source_click"]
  const routeAuthorityPlans = deployProofBatchPacket.releaseRoutes.map((route) => {
    const categories = authorityCategoriesFor(route)
    const relatedBlog = route.relatedRoutes?.find((item) => item.startsWith("/blog/")) || route.route.replace("/watch/", "/blog/")
    const relatedCategory = route.relatedRoutes?.find((item) => item.startsWith("/category/")) || "/category/mundane-off-time-experience"
    return {
      route: route.route,
      canonical: route.canonical,
      title: route.title,
      promotionStage: route.promotionStage,
      score: route.score,
      authorityCategories: categories,
      backlinkAnchors: [
        route.keywords[0],
        route.keywords[1],
        `${route.launchLane} DigitalHut observatory proof`,
        `${route.title.replace(/\s*\|\s*DigitalHut.*$/i, "")} source map`,
        `video + GLB proof for ${route.keywords[0] || route.launchLane}`
      ].filter(Boolean),
      sourceAngles: [
        `Use ${route.title} as the proof destination, not a thin keyword page.`,
        `Pair ${route.route} with ${relatedBlog} for readable blog proof.`,
        `Route category support through ${relatedCategory}.`,
        "Measure source/backlink clicks before expanding the keyword lane."
      ],
      internalSupportRoutes: Array.from(new Set([relatedBlog, relatedCategory, ...route.relatedRoutes])).filter(Boolean).slice(0, 6),
      measurementEvents: sourceEvents,
      status: route.promotionStage === "push-next-deploy-proof" ? "authority-priority" : "authority-support"
    }
  })
  const categoryCounts = routeAuthorityPlans.flatMap((plan) => plan.authorityCategories).reduce((counts, category) => {
    counts[category] = (counts[category] || 0) + 1
    return counts
  }, {})
  return {
    generatedAt,
    mode: "DigitalHut Backlink Authority Packet",
    status: routeAuthorityPlans.length >= 5 && structuredDataCatalog.status === "structured-data-ready" ? "authority-map-ready" : "authority-map-review",
    purpose: "Turn release routes into backlink/source authority targets with clean anchor language, internal support routes, and Supabase events to measure.",
    guardrail: "Backlinks should point to useful proof routes with source context. Do not spam comments, fabricate endorsements, buy low-quality links, or create doorway pages.",
    releaseRouteCount: routeAuthorityPlans.length,
    priorityRouteCount: routeAuthorityPlans.filter((plan) => plan.status === "authority-priority").length,
    supportRouteCount: routeAuthorityPlans.filter((plan) => plan.status === "authority-support").length,
    categoryCounts,
    routeAuthorityPlans,
    measurementEvents: sourceEvents,
    routeBoardStatus: unifiedProofRoutePromotionBoard.status,
    structuredDataStatus: structuredDataCatalog.status,
    nextFireCudaMove: "Use source/backlink opens to decide which release-route authority lanes deserve broader FireCuda keyword promotion after deploy.",
    lastKnownMetrics
  }
}

function backlinkAuthorityMarkdown(packet){
  return `# DigitalHut Backlink Authority Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Release routes: ${packet.releaseRouteCount}

Priority routes: ${packet.priorityRouteCount}

Support routes: ${packet.supportRouteCount}

## Authority Categories

${Object.entries(packet.categoryCounts).map(([category, count]) => `- ${category}: ${count}`).join("\n")}

## Route Authority Plans

${packet.routeAuthorityPlans.map((plan) => `### ${plan.route}

Status: ${plan.status}

Title: ${plan.title}

Authority categories: ${plan.authorityCategories.join(", ")}

Backlink anchors:
${plan.backlinkAnchors.map((anchor) => `- ${anchor}`).join("\n")}

Internal support:
${plan.internalSupportRoutes.map((route) => `- ${route}`).join("\n")}

Measurement: ${plan.measurementEvents.join(", ")}
`).join("\n")}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildSupabaseRefinementViewsPacket({supabaseMeasurementContract, backlinkAuthorityPacket, deployProofBatchPacket, migrationSql = ""} = {}){
  const views = [
    {
      name: "public.digitalhut_seo_event_rollup",
      purpose: "Group raw visitor events by event, path, category, and keyword hint.",
      feeds: ["FireCuda event quality", "event family sanity check", "human-role behavior reads"],
      requiredEvents: supabaseMeasurementContract.events.map((event) => event.canonicalEvent)
    },
    {
      name: "public.digitalhut_seo_route_refinement",
      purpose: "Score routes by page, proof, source, GLB, podcast, market, and intent behavior.",
      feeds: ["unified proof-route board", "deploy proof batch", "Search Console queue"],
      requiredEvents: ["page_view", "blog_view", "proof_route_open", "backlink_source_open", "glb_preview_play", "podcast_interrupt_play", "market_view_open"]
    },
    {
      name: "public.digitalhut_seo_keyword_refinement",
      purpose: "Separate keywords that get real interactions from FireCuda-held candidates.",
      feeds: ["SEO master list", "backlink authority map", "rank-slot promotion gates"],
      requiredEvents: ["search_run", "search_intent_chip_select", "proof_route_open", "backlink_source_open", "glb_preview_play"]
    }
  ]
  const migrationReady = migrationSql.includes("create or replace view public.digitalhut_seo_event_rollup")
    && migrationSql.includes("create or replace view public.digitalhut_seo_route_refinement")
    && migrationSql.includes("create or replace view public.digitalhut_seo_keyword_refinement")
  return {
    generatedAt,
    mode: "DigitalHut Supabase SEO Refinement Views Packet",
    status: migrationReady && supabaseMeasurementContract.status === "measurement-ready" ? "refinement-views-ready" : "refinement-views-review",
    purpose: "Give Supabase a readable comparison layer for FireCuda SEO cycles without changing the raw pixel event table.",
    guardrail: "Views are additive and read-only. Apply only after reviewing migration SQL in Supabase; do not delete raw events or overwrite measured behavior.",
    migration: "supabase/migrations/202607060001_digitalhut_seo_refinement_views.sql",
    table: supabaseMeasurementContract.table,
    measurementStatus: supabaseMeasurementContract.status,
    backlinkAuthorityStatus: backlinkAuthorityPacket.status,
    releaseRouteCount: deployProofBatchPacket.releaseRouteCount,
    viewCount: views.length,
    views,
    compareCycle: [
      "Read route_refinement for proof-route winners and lagging release routes.",
      "Read keyword_refinement for exact phrases earning search/source/GLB behavior.",
      "Read event_rollup to catch duplicate or missing event families before changing UI.",
      "Feed promoted route/keyword pairs back into FireCuda and the unified proof board."
    ],
    nextFireCudaMove: "After these views are applied in Supabase, compare route and keyword behavior against the release batch before expanding long-tail public surfaces.",
    lastKnownMetrics
  }
}

function supabaseRefinementViewsMarkdown(packet){
  return `# DigitalHut Supabase SEO Refinement Views Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Migration: ${packet.migration}

Raw table: ${packet.table}

Measurement status: ${packet.measurementStatus}

Backlink authority status: ${packet.backlinkAuthorityStatus}

Release routes: ${packet.releaseRouteCount}

## Views

${packet.views.map((view) => `### ${view.name}

Purpose: ${view.purpose}

Feeds: ${view.feeds.join(", ")}

Required events: ${view.requiredEvents.join(", ")}
`).join("\n")}

## Compare Cycle

${packet.compareCycle.map((item) => `- ${item}`).join("\n")}

Next FireCuda move: ${packet.nextFireCudaMove}

Source: ${packet.lastKnownMetrics.source}
`
}

function buildPostDeployCompareHandoffPacket({deployProofBatchPacket, supabaseRefinementViewsPacket, aiCrawlerGuidancePacket, structuredDataCatalog, backlinkAuthorityPacket, deltaCompareRefinementPacket = null} = {}){
  const releaseRoutes = deployProofBatchPacket.releaseRoutes.map((route) => ({
    route: route.route,
    canonical: route.canonical,
    launchLane: route.launchLane,
    promotionStage: route.promotionStage,
    score: route.score,
    measurementEvents: [
      "page_view",
      "proof_route_open",
      "backlink_source_open",
      route.packets.includes("glb-source") ? "glb_preview_play" : null,
      route.packets.includes("podcast-source") ? "podcast_interrupt_play" : null,
      route.packets.includes("market") ? "market_view_open" : null,
      route.packets.includes("search-intent") ? "search_run" : null
    ].filter(Boolean),
    compareQuestion: `Does ${route.route} create useful visitor behavior beyond a page load?`,
    nextFireCudaDecision: "promote on measured behavior, hold if only crawled, rewrite if source/backlink clicks stay quiet"
  }))
  const status = deployProofBatchPacket.releaseRouteCount >= 7
    && supabaseRefinementViewsPacket.status === "refinement-views-ready"
    && structuredDataCatalog.status === "structured-data-ready"
    ? "post-deploy-compare-staged"
    : "post-deploy-compare-review"
  return {
    generatedAt,
    mode: "DigitalHut Post-Deploy Compare Handoff",
    status,
    purpose: "Connect the next stable Vercel release to Supabase measurement, Google/Search discovery, FireCuda promotion, and compare/refine decisions.",
    guardrail: "This is a backend SEO and analytics handoff. It does not change the locked public UI and does not claim new live metrics until a fresh measurement pull is performed.",
    releaseRouteCount: releaseRoutes.length,
    releaseRoutes,
    systemPushOrder: [
      {
        layer: "Vercel",
        work: "Ship only the stable release batch after build tooling is confirmed.",
        evidence: `${deployProofBatchPacket.releaseRouteCount} release routes, deploy status ${deployProofBatchPacket.status}, build gate ${deployProofBatchPacket.buildGate.status}`
      },
      {
        layer: "Supabase",
        work: "Read route, keyword, and event refinement views after traffic lands.",
        evidence: `${supabaseRefinementViewsPacket.viewCount} refinement views staged`
      },
      {
        layer: "Google Cloud And Search",
        work: "Use sitemap, llms.txt, structured data, and media metadata to make the crawler understand the observatory proof routes.",
        evidence: `${aiCrawlerGuidancePacket.topProofRoutes.length} top proof routes, ${structuredDataCatalog.schemaCount} structured-data nodes`
      },
      {
        layer: "FireCuda",
        work: "Promote only the routes and keyword clusters that earn behavior; keep the full rank universe staged without publishing thin pages.",
        evidence: `${backlinkAuthorityPacket.releaseRouteCount} authority routes and ${backlinkAuthorityPacket.priorityRouteCount} priority backlink plans`
      },
      {
        layer: "Compare & Contrast",
        work: deltaCompareRefinementPacket?.pairDecisionCount
          ? "Compare route opens, searches, GLB plays, podcast interrupts, market opens, source/backlink clicks, and release-pair delta decisions before the next SEO expansion."
          : "Compare route opens, searches, GLB plays, podcast interrupts, market opens, and source/backlink clicks before the next SEO expansion.",
        evidence: deltaCompareRefinementPacket?.pairDecisionCount
          ? `${deltaCompareRefinementPacket.pairDecisionCount} delta pair decisions plus last-known metrics baseline`
          : "last-known metrics baseline plus next Supabase refinement read"
      }
    ],
    promotionRules: [
      "Promote a watch route when page views are joined by proof route opens, source opens, GLB plays, podcast interrupts, market opens, or search runs.",
      "Hold a route in FireCuda when it receives crawl proof but no visitor behavior.",
      "Rewrite metadata before UI when search intent is quiet but crawl structure is strong.",
      "Trigger a UI review only when Supabase shows a repeated client behavior gap or a feature is blocking a measured action."
    ],
    firstCompareQuestions: [
      "Did the lunch and rideshare routes create everyday-person behavior or only SEO surface area?",
      "Did Current Market earn any market opens after being connected to watch proof and GLB/podcast lanes?",
      "Did GLB remain the strongest useful signal after the model view fix?",
      "Did podcast interrupts climb above the current low baseline?",
      "Did blog proof receive enough traffic to justify more long-form proof pages?"
    ],
    deltaDecisionStatus: deltaCompareRefinementPacket?.status || "not-attached",
    deltaPairDecisionCount: deltaCompareRefinementPacket?.pairDecisionCount || 0,
    deltaPairDecisions: (deltaCompareRefinementPacket?.pairDecisions || []).map((pair) => ({
      pairSlug: pair.pairSlug,
      launchLane: pair.launchLane,
      routes: pair.routes,
      currentRead: pair.currentRead,
      promoteWhen: pair.promoteWhen,
      rewriteWhen: pair.rewriteWhen,
      holdWhen: pair.holdWhen
    })),
    lastKnownMetrics,
    nextFireCudaMove: deltaCompareRefinementPacket?.pairDecisionCount
      ? "After the next deployed traffic read, promote only routes with behavior and run Current Market/Home Project through the delta promote-rewrite-hold path before expanding supporting clusters."
      : "After the next deployed traffic read, promote only routes with behavior into the master SEO list and keep quiet clusters in staged FireCuda maps."
  }
}

function postDeployCompareHandoffMarkdown(packet){
  return `# DigitalHut Post-Deploy Compare Handoff

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Release routes: ${packet.releaseRouteCount}

## System Push Order

${packet.systemPushOrder.map((item) => `- **${item.layer}**: ${item.work} Evidence: ${item.evidence}`).join("\n")}

## Release Route Measurement

${packet.releaseRoutes.map((route) => `### ${route.route}

Lane: ${route.launchLane}

Stage: ${route.promotionStage}

Score: ${route.score}

Events to watch: ${route.measurementEvents.join(", ")}

Compare question: ${route.compareQuestion}

FireCuda decision: ${route.nextFireCudaDecision}
`).join("\n")}

## Promotion Rules

${packet.promotionRules.map((item) => `- ${item}`).join("\n")}

## Delta Decisions

Status: ${packet.deltaDecisionStatus}

Pair decisions: ${packet.deltaPairDecisionCount}

${packet.deltaPairDecisions.length ? packet.deltaPairDecisions.map((pair) => `- **${pair.pairSlug}** (${pair.launchLane}): ${pair.currentRead} Promote: ${pair.promoteWhen} Rewrite: ${pair.rewriteWhen} Hold: ${pair.holdWhen}`).join("\n") : "- No delta decisions attached."}

## First Compare Questions

${packet.firstCompareQuestions.map((item) => `- ${item}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildQuietSignalActivationPacket({searchIntentPromotionPacket, marketPromotionPacket, postDeployCompareHandoffPacket, supabaseRefinementViewsPacket} = {}){
  const quietSignals = [
    {
      id: "search-intent",
      metric: "searchInteractions",
      value: lastKnownMetrics.searchInteractions,
      status: lastKnownMetrics.searchInteractions === 0 ? "quiet" : "active",
      risk: "Visitors may not understand search/category as the content radar yet.",
      promotionGate: "Do not promote typed-search keyword winners until search_run or search_intent_chip_select appears."
    },
    {
      id: "current-market",
      metric: "marketOpens",
      value: lastKnownMetrics.marketOpens,
      status: lastKnownMetrics.marketOpens === 0 ? "quiet" : "active",
      risk: "Current Market is staged but not yet earning measured opens.",
      promotionGate: "Do not expand stock-specific SEO until market_view_open or ticker_search appears."
    }
  ]
  const activationRoutes = [
    ...(searchIntentPromotionPacket?.priorityIntentCandidates || []).slice(0, 8).map((candidate) => ({
      type: "search-intent",
      label: candidate.keyword,
      route: candidate.routeTarget,
      currentStage: candidate.promotionStage,
      watchEvents: ["search_intent_chip_select", "proof_route_open", "backlink_source_open"],
      fireCudaDecision: "promote exact phrase only after intent and proof behavior show together"
    })),
    ...(marketPromotionPacket?.marketLanes || []).slice(0, 6).map((lane) => ({
      type: "market",
      label: `${lane.symbol} ${lane.company} ${lane.lane}`,
      route: lane.routeTarget,
      currentStage: lane.status,
      watchEvents: ["market_view_open", "ticker_search", "proof_route_open", "backlink_source_open"],
      fireCudaDecision: "promote company/market phrase only after market open or ticker search proves demand"
    }))
  ]
  const releaseRouteMap = new Map((postDeployCompareHandoffPacket?.releaseRoutes || []).map((route) => [route.route, route]))
  const prioritizedRoutes = activationRoutes.map((item) => {
    const release = releaseRouteMap.get(item.route)
    return {
      ...item,
      releaseScore: release?.score || 0,
      releaseStage: release?.promotionStage || "firecuda-held",
      compareQuestion: release?.compareQuestion || `Does ${item.label} create measurable intent beyond a passive page view?`
    }
  }).sort((a, b) => b.releaseScore - a.releaseScore || a.label.localeCompare(b.label))
  const status = quietSignals.some((signal) => signal.status === "quiet")
    && supabaseRefinementViewsPacket?.status === "refinement-views-ready"
    ? "quiet-signal-activation-staged"
    : "quiet-signal-activation-review"
  return {
    generatedAt,
    mode: "DigitalHut Quiet Signal Activation Packet",
    status,
    purpose: "Turn zero search interactions and zero market opens into a measured backend plan instead of guessing or changing the locked UI.",
    guardrail: "Backend SEO only. Use this packet to wait, measure, and promote proven routes; do not publish thin pages or make visual changes without repeated measured friction.",
    quietSignals,
    activationRouteCount: prioritizedRoutes.length,
    prioritizedRoutes,
    measurementViews: (supabaseRefinementViewsPacket?.views || []).map((view) => ({
      name: view.name,
      role: view.purpose
    })),
    activationRules: [
      "If search remains zero but proof/source opens rise, rewrite metadata and category copy before making UI changes.",
      "If market opens remain zero after deployment, keep market in FireCuda staging and do not expand stock pages.",
      "If GLB plays keep rising while search is quiet, use GLB language as the bridge into search/category education.",
      "If podcast interrupts rise with a market route, promote that ticker/source lane into the next proof batch.",
      "If a route only receives page views, keep it crawlable but hold long-tail expansion until a second behavior appears."
    ],
    nextFireCudaMove: "Use Supabase route_refinement and keyword_refinement to choose whether quiet search/market lanes become promoted winners, metadata rewrites, or FireCuda-held backlog.",
    lastKnownMetrics
  }
}

function quietSignalActivationMarkdown(packet){
  return `# DigitalHut Quiet Signal Activation Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

## Quiet Signals

${packet.quietSignals.map((signal) => `- **${signal.id}**: ${signal.metric} = ${signal.value} (${signal.status}). Risk: ${signal.risk} Gate: ${signal.promotionGate}`).join("\n")}

## Activation Routes

${packet.prioritizedRoutes.map((route) => `- **${route.label}** -> ${route.route} (${route.type}, ${route.currentStage}, release ${route.releaseStage}, score ${route.releaseScore}). Watch: ${route.watchEvents.join(", ")}. Decision: ${route.fireCudaDecision}`).join("\n")}

## Supabase Views Used

${packet.measurementViews.map((view) => `- **${view.name}**: ${view.role}`).join("\n")}

## Activation Rules

${packet.activationRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildRankedBlogWatchBridgePacket({routeMetadataManifest, deployProofBatchPacket, unifiedProofRoutePromotionBoard, quietSignalActivationPacket, backlinkAuthorityPacket} = {}){
  const productIdentitySlug = "youtube-video-content-radar"
  const fullSystemAnchorSlugs = new Map([
    [productIdentitySlug, 0],
    ["search-intent-radar-visual-experience", 1],
    ["game-world-glb-presentation", 2],
    ["video-topic-glb-renderer", 3],
    ["ai-video-podcast-observatory", 4],
    ["research-summary-source-explainer", 5]
  ])
  const routes = routeMetadataManifest?.routes || []
  const blogRoutes = routes.filter((route) => route.type === "blog-proof")
  const watchRoutes = routes.filter((route) => route.type === "watch-proof")
  const watchBySlug = new Map(watchRoutes.map((route) => [route.route.replace(/^\/watch\//, ""), route]))
  const releaseRoutes = new Map((deployProofBatchPacket?.releaseRoutes || []).map((route) => [route.route, route]))
  const boardRoutes = new Map((unifiedProofRoutePromotionBoard?.topRoutes || []).map((route) => [route.route, route]))
  const authorityPlans = new Map((backlinkAuthorityPacket?.routeAuthorityPlans || []).map((plan) => [plan.route, plan]))
  const quietRouteSet = new Set((quietSignalActivationPacket?.prioritizedRoutes || []).map((route) => route.route))
  const pairs = blogRoutes.map((blog) => {
    const slug = blog.route.replace(/^\/blog\//, "")
    const watch = watchBySlug.get(slug)
    const release = watch ? releaseRoutes.get(watch.route) : null
    const board = watch ? boardRoutes.get(watch.route) : null
    const authority = watch ? authorityPlans.get(watch.route) : null
    const keywords = Array.from(new Set([...(blog.keywords || []), ...(watch?.keywords || [])])).slice(0, 12)
    const proofText = `${blog.title || ""} ${blog.description || ""} ${blog.proofAngle || ""} ${keywords.join(" ")}`
    const rawScore = (release?.score || 0)
      + (board?.score || 0)
      + (quietRouteSet.has(watch?.route) ? 18 : 0)
      + (/market|stock|ticker|NVIDIA|Tesla|Apple|Google/i.test(proofText) ? 14 : 0)
      + (/GLB|3D|model|visual/i.test(proofText) ? 12 : 0)
      + (/podcast|source|speaker/i.test(proofText) ? 8 : 0)
      + (/restaurant|lunch|uber|flight|grocery|review/i.test(proofText) ? 10 : 0)
      + (authority ? 10 : 0)
    const anchorPriority = fullSystemAnchorSlugs.has(slug) ? fullSystemAnchorSlugs.get(slug) : 20
    const score = slug === productIdentitySlug ? Math.max(rawScore, 640) : rawScore
    const promotionStage = release ? "release-pair"
      : score >= 80 ? "next-proof-pair"
        : score >= 45 ? "supabase-watch-pair"
          : "firecuda-hold-pair"
    return {
      slug,
      blogRoute: blog.route,
      watchRoute: watch?.route || null,
      canonicalBlog: blog.canonical,
      canonicalWatch: watch?.canonical || null,
      title: blog.title,
      launchLane: blog.launchLane || watch?.launchLane || blog.category || "DigitalHut",
      score,
      promotionStage,
      anchorPriority,
      keywords,
      proofAngle: blog.proofAngle || watch?.proofAngle || "DigitalHut watch/blog proof pair",
      measurementEvents: [
        "blog_view",
        "page_view",
        "proof_route_open",
        "backlink_source_open",
        "glb_preview_play",
        /podcast|source|speaker/i.test(proofText) ? "podcast_interrupt_play" : null,
        /market|stock|ticker/i.test(proofText) ? "market_view_open" : null,
        /search|intent|near me|guide/i.test(proofText) ? "search_intent_chip_select" : null
      ].filter(Boolean),
      backlinkAnchors: authority?.backlinkAnchors?.slice(0, 4) || keywords.slice(0, 4),
      fireCudaDecision: promotionStage === "release-pair"
        ? "ship with the next stable proof batch, then compare blog/watch behavior before expanding the cluster"
        : promotionStage === "next-proof-pair"
          ? "stage as the next blog/watch proof pair if Supabase confirms source or GLB behavior"
          : promotionStage === "supabase-watch-pair"
            ? "watch route behavior before creating more supporting keyword surfaces"
            : "hold in FireCuda until stronger behavior appears"
    }
  }).filter((pair) => pair.watchRoute)
    .sort((a, b) => a.anchorPriority - b.anchorPriority || b.score - a.score || a.slug.localeCompare(b.slug))
  const stageCounts = pairs.reduce((counts, pair) => {
    counts[pair.promotionStage] = (counts[pair.promotionStage] || 0) + 1
    return counts
  }, {})
  const blogViewRatio = lastKnownMetrics.pageViews ? Number((lastKnownMetrics.blogViews / lastKnownMetrics.pageViews).toFixed(3)) : 0
  return {
    generatedAt,
    mode: "DigitalHut Ranked Blog Watch Bridge Packet",
    status: pairs.length >= 50 ? "ranked-blog-watch-bridge-ready" : "ranked-blog-watch-bridge-review",
    purpose: "Rank matching blog/watch proof pairs so DigitalHut can promote useful proof pages without flooding the site with thin keyword pages.",
    guardrail: "Backend SEO only. Do not add visible UI or publish new thin pages; use this to decide which existing blog/watch proof pairs deserve crawl, backlink, and source attention.",
    blogRoutes: blogRoutes.length,
    watchRoutes: watchRoutes.length,
    pairedRoutes: pairs.length,
    blogViewRatio,
    stageCounts,
    topPairs: pairs.slice(0, 18),
    holdPairs: pairs.filter((pair) => pair.promotionStage === "firecuda-hold-pair").slice(0, 12),
    compareRules: [
      "Promote a blog/watch pair when blog_view is joined by proof_route_open, source open, GLB play, podcast interrupt, market open, or search intent.",
      "Hold pairs that only have crawl structure and no human behavior.",
      "Use watch route behavior to decide whether the matching blog page needs metadata rewriting or backlink work.",
      "If blog views stay below ten percent of page views, improve internal proof routing before adding more blog pages."
    ],
    nextFireCudaMove: "Use the top blog/watch pairs as the next ranked proof candidates, then compare Supabase route_refinement before expanding supporting keywords.",
    lastKnownMetrics
  }
}

function rankedBlogWatchBridgeMarkdown(packet){
  return `# DigitalHut Ranked Blog Watch Bridge Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Blog routes: ${packet.blogRoutes}

Watch routes: ${packet.watchRoutes}

Paired routes: ${packet.pairedRoutes}

Blog view ratio: ${packet.blogViewRatio}

Stage counts: ${Object.entries(packet.stageCounts).map(([stage, count]) => `${stage}: ${count}`).join(", ")}

## Top Blog/Watch Pairs

${packet.topPairs.map((pair) => `- **${pair.blogRoute}** <-> **${pair.watchRoute}** (${pair.promotionStage}, score ${pair.score}). Events: ${pair.measurementEvents.join(", ")}. FireCuda: ${pair.fireCudaDecision}`).join("\n")}

## FireCuda Hold Pairs

${packet.holdPairs.map((pair) => `- **${pair.blogRoute}** <-> **${pair.watchRoute}** (${pair.launchLane}). Hold reason: ${pair.fireCudaDecision}`).join("\n") || "- No hold pairs in this packet."}

## Compare Rules

${packet.compareRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildRoutePairEvidenceLedgerPacket({rankedBlogWatchBridgePacket, deployMeasurementActivationPacket, supabaseMeasurementContract, postDeployMeasurementProofPacket} = {}){
  const buildHeld = deployMeasurementActivationPacket?.status?.includes("build-held")
  const firstWaveRoutes = new Set((deployMeasurementActivationPacket?.firstWaveRoutes || []).map((route) => route.route))
  const closedLoopEvents = new Set((supabaseMeasurementContract?.events || [])
    .filter((event) => event.coverageStatus === "closed-loop")
    .flatMap((event) => [event.canonicalEvent, ...(event.aliases || [])]))
  const pairs = (rankedBlogWatchBridgePacket?.topPairs || []).map((pair, index) => {
    const firstWave = firstWaveRoutes.has(pair.watchRoute) || firstWaveRoutes.has(pair.blogRoute)
    const expectedSignals = Array.from(new Set(pair.measurementEvents || ["blog_view", "page_view", "proof_route_open"]))
    const coveredSignals = expectedSignals.filter((signal) => closedLoopEvents.has(signal))
    const missingSignals = expectedSignals.filter((signal) => !closedLoopEvents.has(signal))
    const secondActionSignals = expectedSignals.filter((signal) => !["page_view", "blog_view"].includes(signal))
    const inspectionStatus = buildHeld ? "waiting-build-proof"
      : firstWave ? "inspect-first-wave"
        : pair.promotionStage === "next-proof-pair" ? "inspect-after-first-wave"
          : "hold-until-behavior"
    const decisionSlot = pair.promotionStage === "release-pair" ? "promote-or-rewrite-after-second-action"
      : pair.promotionStage === "next-proof-pair" ? "candidate-after-source-or-glb-behavior"
        : pair.promotionStage === "supabase-watch-pair" ? "watch-before-expansion"
          : "firecuda-hold"
    return {
      order: index + 1,
      pairSlug: pair.slug,
      blogRoute: pair.blogRoute,
      watchRoute: pair.watchRoute,
      launchLane: pair.launchLane,
      promotionStage: pair.promotionStage,
      score: pair.score,
      firstWave,
      inspectionStatus,
      decisionSlot,
      expectedSignals,
      coveredSignals,
      missingSignals,
      secondActionSignals,
      searchConsoleStatus: buildHeld ? "not-submitted-build-held" : firstWave ? "ready-for-url-inspection" : "wait",
      supabaseStatus: buildHeld ? "schema-ready-waiting-traffic" : "ready-to-read-route-refinement",
      fireCudaAction: pair.fireCudaDecision,
      nextAction: buildHeld
        ? "Keep staged until build proof exists."
        : firstWave
          ? "Inspect watch route, inspect blog route, then compare second-action signals."
          : "Keep in ranked backlog until first-wave route behavior indicates expansion."
    }
  })
  const ledgerCounts = pairs.reduce((counts, pair) => {
    counts[pair.inspectionStatus] = (counts[pair.inspectionStatus] || 0) + 1
    counts[pair.decisionSlot] = (counts[pair.decisionSlot] || 0) + 1
    return counts
  }, {})
  const firstWavePairs = pairs.filter((pair) => pair.firstWave)
  const releasePairs = pairs.filter((pair) => pair.promotionStage === "release-pair")
  return {
    generatedAt,
    mode: "DigitalHut Route Pair Evidence Ledger",
    status: buildHeld ? "route-pair-ledger-staged-build-held" : "route-pair-ledger-ready",
    purpose: "Give each ranked watch/blog proof pair a measurable slot for Search Console inspection, Supabase evidence, FireCuda decision, and next SEO action.",
    guardrail: "Backend SEO only. This ledger records evidence expectations and decisions; it does not publish new pages or claim live behavior.",
    buildProofStatus: deployMeasurementActivationPacket?.buildProofStatus || "unknown",
    activationStatus: deployMeasurementActivationPacket?.status || "unknown",
    measurementProofStatus: postDeployMeasurementProofPacket?.status || "unknown",
    supabaseMeasurementStatus: supabaseMeasurementContract?.status || "unknown",
    pairCount: pairs.length,
    firstWavePairCount: firstWavePairs.length,
    releasePairCount: releasePairs.length,
    ledgerCounts,
    evidenceColumns: [
      "pairSlug",
      "watchRoute",
      "blogRoute",
      "searchConsoleStatus",
      "supabaseStatus",
      "expectedSignals",
      "coveredSignals",
      "missingSignals",
      "secondActionSignals",
      "fireCudaAction"
    ],
    ledgers: pairs,
    firstWaveLedgers: firstWavePairs,
    compareInstructions: [
      "Do not promote a pair from page_view or blog_view alone.",
      "Promote only when at least one second-action signal appears: proof route, backlink, GLB, podcast, market, search intent, or search run.",
      "Rewrite metadata when Search Console or page traffic appears but second-action signals stay quiet.",
      "Hold pairs with no route activity after the inspection window.",
      "Expand the master keyword list only from pairs that earn promote or rewrite evidence."
    ],
    nextFireCudaMove: buildHeld
      ? "Keep the ledger staged; after build proof, inspect first-wave routes and fill evidence slots from Supabase refinement views."
      : "Begin first-wave evidence capture and move each pair into promote, rewrite, or hold.",
    lastKnownMetrics
  }
}

function routePairEvidenceLedgerMarkdown(packet){
  return `# DigitalHut Route Pair Evidence Ledger

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Build proof: ${packet.buildProofStatus}

Activation: ${packet.activationStatus}

Measurement proof: ${packet.measurementProofStatus}

Supabase measurement: ${packet.supabaseMeasurementStatus}

Pairs: ${packet.pairCount}

First-wave pairs: ${packet.firstWavePairCount}

Release pairs: ${packet.releasePairCount}

Ledger counts: ${Object.entries(packet.ledgerCounts).map(([key, value]) => `${key}: ${value}`).join(", ")}

Evidence columns: ${packet.evidenceColumns.join(", ")}

## First-Wave Ledgers

${packet.firstWaveLedgers.map((pair) => `- **${pair.pairSlug}** (${pair.inspectionStatus}, ${pair.decisionSlot}): watch ${pair.watchRoute}; blog ${pair.blogRoute}; signals ${pair.expectedSignals.join(", ")}; covered ${pair.coveredSignals.join(", ") || "none"}; missing ${pair.missingSignals.join(", ") || "none"}. Next: ${pair.nextAction}`).join("\n")}

## Top Ledger Slots

${packet.ledgers.slice(0, 18).map((pair) => `- **${pair.order}. ${pair.pairSlug}** (${pair.promotionStage}, score ${pair.score}): Search Console ${pair.searchConsoleStatus}; Supabase ${pair.supabaseStatus}; FireCuda ${pair.decisionSlot}.`).join("\n")}

## Compare Instructions

${packet.compareInstructions.map((instruction) => `- ${instruction}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildFirstWaveActionQueuePacket({routePairEvidenceLedgerPacket, deployMeasurementActivationPacket, postDeployMeasurementProofPacket} = {}){
  const buildHeld = routePairEvidenceLedgerPacket?.status?.includes("build-held")
  const firstWaveLedgers = routePairEvidenceLedgerPacket?.firstWaveLedgers || []
  const actions = firstWaveLedgers.flatMap((pair, pairIndex) => {
    const baseOrder = pairIndex * 4
    const secondActionSignals = pair.secondActionSignals?.length
      ? pair.secondActionSignals
      : pair.expectedSignals.filter((signal) => !["page_view", "blog_view"].includes(signal))
    return [
      {
        order: baseOrder + 1,
        pairSlug: pair.pairSlug,
        phase: "inspect-watch-route",
        status: buildHeld ? "held-build-proof" : "ready",
        route: pair.watchRoute,
        system: "Google Search Console",
        evidenceNeeded: "URL inspection can read the watch proof route after stable deployment.",
        successSignal: "page_view or proof_route_open appears for the watch route.",
        nextIfSuccess: "inspect matching blog proof route",
        nextIfQuiet: "check route metadata and internal proof links before rewrite"
      },
      {
        order: baseOrder + 2,
        pairSlug: pair.pairSlug,
        phase: "inspect-blog-route",
        status: buildHeld ? "held-build-proof" : "ready",
        route: pair.blogRoute,
        system: "Google Search Console",
        evidenceNeeded: "URL inspection can read the blog support route after stable deployment.",
        successSignal: "blog_view or page_view appears for the blog route.",
        nextIfSuccess: "wait for Supabase second-action window",
        nextIfQuiet: "rewrite blog title/description/internal link context after measurement window"
      },
      {
        order: baseOrder + 3,
        pairSlug: pair.pairSlug,
        phase: "wait-supabase-second-action",
        status: buildHeld ? "held-build-proof" : "ready",
        route: `${pair.watchRoute} + ${pair.blogRoute}`,
        system: "Supabase refinement views",
        evidenceNeeded: secondActionSignals.join(", "),
        successSignal: "At least one second-action signal appears beyond page_view/blog_view.",
        nextIfSuccess: "route pair to FireCuda promote queue",
        nextIfQuiet: "route pair to metadata rewrite queue"
      },
      {
        order: baseOrder + 4,
        pairSlug: pair.pairSlug,
        phase: "firecuda-decision",
        status: buildHeld ? "held-build-proof" : "ready",
        route: `${pair.watchRoute} + ${pair.blogRoute}`,
        system: "FireCuda decision queue",
        evidenceNeeded: "Search Console visibility plus Supabase route_refinement and keyword_refinement.",
        successSignal: pair.decisionSlot,
        nextIfSuccess: "promote/rewrite/hold and update master SEO list",
        nextIfQuiet: "hold expansion and preserve crawl budget"
      }
    ]
  })
  const phaseCounts = actions.reduce((counts, action) => {
    counts[action.phase] = (counts[action.phase] || 0) + 1
    counts[action.status] = (counts[action.status] || 0) + 1
    return counts
  }, {})
  const releaseReadiness = [
    {
      gate: "build-proof",
      status: routePairEvidenceLedgerPacket?.buildProofStatus || "unknown",
      requiredBeforeAction: true
    },
    {
      gate: "activation",
      status: deployMeasurementActivationPacket?.status || "unknown",
      requiredBeforeAction: true
    },
    {
      gate: "measurement-proof",
      status: postDeployMeasurementProofPacket?.status || "unknown",
      requiredBeforeAction: true
    },
    {
      gate: "ledger",
      status: routePairEvidenceLedgerPacket?.status || "unknown",
      requiredBeforeAction: true
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut First-Wave Action Queue",
    status: buildHeld ? "first-wave-action-queue-staged-build-held" : "first-wave-action-queue-ready",
    purpose: "Turn first-wave watch/blog evidence ledger slots into exact post-deploy actions: inspect, measure, decide, and feed FireCuda.",
    guardrail: "Backend SEO operation only. This queue does not deploy, submit, or claim results; it waits for build proof and then defines the order of work.",
    pairCount: firstWaveLedgers.length,
    actionCount: actions.length,
    phaseCounts,
    releaseReadiness,
    actions,
    operatingRules: [
      "Do not start URL inspection until build proof exists.",
      "Always inspect the watch route before the matching blog route.",
      "Never promote from page_view or blog_view alone.",
      "Promote when a second action appears: proof route, backlink, GLB, podcast, market, search intent, or search run.",
      "Rewrite quiet but visible pairs; hold pairs with no measured route activity."
    ],
    nextFireCudaMove: buildHeld
      ? "Keep the queue staged; once build proof lands, run actions in order and record outcomes into FireCuda promote/rewrite/hold."
      : "Run the first-wave queue and update FireCuda decisions from Supabase second-action evidence.",
    lastKnownMetrics
  }
}

function firstWaveActionQueueMarkdown(packet){
  return `# DigitalHut First-Wave Action Queue

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Pairs: ${packet.pairCount}

Actions: ${packet.actionCount}

Phase counts: ${Object.entries(packet.phaseCounts).map(([key, value]) => `${key}: ${value}`).join(", ")}

## Release Readiness

${packet.releaseReadiness.map((gate) => `- **${gate.gate}** (${gate.status}): required before action ${gate.requiredBeforeAction}`).join("\n")}

## Action Queue

${packet.actions.map((action) => `- **${action.order}. ${action.phase}** (${action.status}): ${action.pairSlug}; ${action.system}; route ${action.route}. Need: ${action.evidenceNeeded}. Success: ${action.successSignal}.`).join("\n")}

## Operating Rules

${packet.operatingRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildFireCudaPromotionReceiptPacket({firstWaveActionQueuePacket, fireCudaDecisionQueueTemplatePacket, routePairEvidenceLedgerPacket} = {}){
  const buildHeld = firstWaveActionQueuePacket?.status?.includes("build-held")
  const actionsByPair = (firstWaveActionQueuePacket?.actions || []).reduce((groups, action) => {
    groups[action.pairSlug] = groups[action.pairSlug] || []
    groups[action.pairSlug].push(action)
    return groups
  }, {})
  const promotionByPair = new Map((fireCudaDecisionQueueTemplatePacket?.promotionQueueTemplate || []).map((item) => [item.pairSlug, item]))
  const rewriteByPair = new Map((fireCudaDecisionQueueTemplatePacket?.rewriteQueueTemplate || []).map((item) => [item.pairSlug, item]))
  const holdByPair = new Map((fireCudaDecisionQueueTemplatePacket?.holdQueueTemplate || []).map((item) => [item.pairSlug, item]))
  const ledgerByPair = new Map((routePairEvidenceLedgerPacket?.firstWaveLedgers || []).map((item) => [item.pairSlug, item]))
  const pairSlugs = Object.keys(actionsByPair)
  const receipts = pairSlugs.map((pairSlug, index) => {
    const actions = actionsByPair[pairSlug] || []
    const ledger = ledgerByPair.get(pairSlug)
    const promote = promotionByPair.get(pairSlug)
    const rewrite = rewriteByPair.get(pairSlug)
    const hold = holdByPair.get(pairSlug)
    return {
      order: index + 1,
      pairSlug,
      launchLane: ledger?.launchLane || promote?.launchLane || "DigitalHut",
      status: buildHeld ? "receipt-waiting-build-proof" : "receipt-ready-for-evidence",
      watchRoute: ledger?.watchRoute || actions.find((action) => action.phase === "inspect-watch-route")?.route || null,
      blogRoute: ledger?.blogRoute || actions.find((action) => action.phase === "inspect-blog-route")?.route || null,
      actionCount: actions.length,
      requiredActionPhases: actions.map((action) => action.phase),
      coveredSignals: ledger?.coveredSignals || [],
      secondActionSignals: ledger?.secondActionSignals || [],
      outcomeSlots: {
        promote: promote ? {
          condition: promote.promoteWhen,
          fireCudaAction: promote.fireCudaAction
        } : null,
        rewrite: rewrite ? {
          condition: rewrite.rewriteWhen,
          rewriteTargets: rewrite.rewriteTargets
        } : null,
        hold: hold ? {
          condition: hold.holdWhen,
          fireCudaAction: hold.fireCudaAction
        } : null
      },
      receiptFields: {
        searchConsoleEvidence: "pending",
        supabaseRouteRefinement: "pending",
        supabaseKeywordRefinement: "pending",
        secondActionWinner: "pending",
        decision: "pending",
        masterListAction: "pending",
        backlinkAction: "pending",
        nextReviewWindow: "pending"
      },
      expansionRule: "Allow master-list expansion only after promote or rewrite evidence; hold inactive pairs without adding more keyword surfaces.",
      nextAction: buildHeld
        ? "Wait for build proof, then execute the first-wave action queue before filling this receipt."
        : "Fill receipt fields from Search Console and Supabase evidence."
    }
  })
  const receiptCounts = receipts.reduce((counts, receipt) => {
    counts[receipt.status] = (counts[receipt.status] || 0) + 1
    return counts
  }, {})
  return {
    generatedAt,
    mode: "DigitalHut FireCuda Promotion Receipt Packet",
    status: buildHeld ? "firecuda-promotion-receipts-staged-build-held" : "firecuda-promotion-receipts-ready",
    purpose: "Create a structured receipt for each first-wave pair so DigitalHut records the evidence and final FireCuda promote/rewrite/hold decision before expanding SEO keywords.",
    guardrail: "Receipt slots are not decisions. They stay pending until build proof, Search Console inspection, and Supabase refinement evidence exist.",
    buildProofStatus: buildHeld ? "waiting-build-proof" : (routePairEvidenceLedgerPacket?.buildProofStatus || "build-proof-ready"),
    receiptCount: receipts.length,
    receiptCounts,
    firstWaveActionQueueStatus: firstWaveActionQueuePacket?.status || "unknown",
    fireCudaDecisionQueueStatus: fireCudaDecisionQueueTemplatePacket?.status || "unknown",
    routePairLedgerStatus: routePairEvidenceLedgerPacket?.status || "unknown",
    receipts,
    decisionRules: [
      "Promote when visibility is joined by at least one second action.",
      "Rewrite when visibility appears but second-action proof stays quiet.",
      "Hold when no route_refinement or keyword_refinement movement appears after the inspection window.",
      "Never expand the master SEO list from pending receipts.",
      "Record backlink action only after the visitor/source behavior proves the route was useful."
    ],
    nextFireCudaMove: buildHeld
      ? "Keep receipts staged; after build proof and first-wave queue execution, fill one receipt per pair before expanding the master list."
      : "Fill receipts from Search Console and Supabase evidence, then update promote/rewrite/hold queues.",
    lastKnownMetrics
  }
}

function fireCudaPromotionReceiptMarkdown(packet){
  return `# DigitalHut FireCuda Promotion Receipt Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Build proof status: ${packet.buildProofStatus}

Receipts: ${packet.receiptCount}

Receipt counts: ${Object.entries(packet.receiptCounts).map(([key, value]) => `${key}: ${value}`).join(", ")}

First-wave action queue: ${packet.firstWaveActionQueueStatus}

FireCuda decision queue: ${packet.fireCudaDecisionQueueStatus}

Route-pair ledger: ${packet.routePairLedgerStatus}

## Receipt Slots

${packet.receipts.map((receipt) => `- **${receipt.order}. ${receipt.pairSlug}** (${receipt.status}, ${receipt.launchLane}): watch ${receipt.watchRoute}; blog ${receipt.blogRoute}; actions ${receipt.requiredActionPhases.join(" -> ")}; second actions ${receipt.secondActionSignals.join(", ") || "none"}; decision ${receipt.receiptFields.decision}.`).join("\n")}

## Decision Rules

${packet.decisionRules.map((rule) => `- ${rule}`).join("\n")}

## Receipt Fields

${packet.receipts.slice(0, 6).map((receipt) => `- **${receipt.pairSlug}**: Search Console ${receipt.receiptFields.searchConsoleEvidence}; route refinement ${receipt.receiptFields.supabaseRouteRefinement}; keyword refinement ${receipt.receiptFields.supabaseKeywordRefinement}; second action ${receipt.receiptFields.secondActionWinner}; master list ${receipt.receiptFields.masterListAction}; backlink ${receipt.receiptFields.backlinkAction}.`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildMasterListExpansionGatePacket({seoMasterListPacket, fireCudaPromotionReceiptPacket} = {}){
  const totalVariationCapacity = seoMasterListPacket?.counts?.totalVariationCapacity || 0
  const clusterByLane = new Map((seoMasterListPacket?.clusters || []).map((cluster) => [cluster.lane, cluster]))
  const receipts = fireCudaPromotionReceiptPacket?.receipts || []
  const gates = receipts.map((receipt) => {
    const cluster = clusterByLane.get(receipt.launchLane)
    const decision = receipt.receiptFields?.decision || "pending"
    const secondActionWinner = receipt.receiptFields?.secondActionWinner || "pending"
    const masterListAction = receipt.receiptFields?.masterListAction || "pending"
    const canExpand = ["promote", "rewrite"].includes(decision) && secondActionWinner !== "pending"
    const laneBridgeStatus = cluster ? "inside-counted-master-universe" : "needs-separate-lane-universe"
    const expansionStatus = canExpand ? "open-earned-expansion" : "closed-pending-evidence"
    const allowedSlots = canExpand
      ? Math.min(cluster?.variationCapacity || 0, decision === "promote" ? 500 : 120)
      : 0
    return {
      pairSlug: receipt.pairSlug,
      launchLane: receipt.launchLane,
      watchRoute: receipt.watchRoute,
      blogRoute: receipt.blogRoute,
      receiptStatus: receipt.status,
      decision,
      secondActionWinner,
      masterListAction,
      expansionStatus,
      allowedSlots,
      laneVariationCapacity: cluster?.variationCapacity || 0,
      laneBridgeStatus,
      proofRoutes: cluster?.proofRoutes || {
        watch: receipt.watchRoute,
        blog: receipt.blogRoute
      },
      unlockRequires: [
        "build proof",
        "Search Console route visibility",
        "Supabase route_refinement",
        "Supabase keyword_refinement",
        "second-action evidence"
      ],
      blockedReason: canExpand ? "none" : cluster ? "receipt still pending or missing second-action evidence" : "receipt pending and launch lane is outside the counted mundane master-list universe"
    }
  })
  const openGates = gates.filter((gate) => gate.expansionStatus === "open-earned-expansion")
  const closedGates = gates.filter((gate) => gate.expansionStatus !== "open-earned-expansion")
  const allowedSlotTotal = gates.reduce((total, gate) => total + gate.allowedSlots, 0)
  const heldSlotTotal = Math.max(totalVariationCapacity - allowedSlotTotal, 0)
  return {
    generatedAt,
    mode: "DigitalHut Master List Expansion Gate",
    status: openGates.length ? "master-list-expansion-gated-open-partial" : "master-list-expansion-gated-closed",
    purpose: `Protect the ${seoSearchClaimSummary.totalIndividualRanks.toLocaleString("en-US")}-variation FireCuda universe from thin expansion until receipts earn promote or rewrite evidence.`,
    guardrail: "Do not generate, publish, or submit expanded keyword pages from pending receipts. FireCuda stores the universe; receipts unlock measured expansion.",
    totalVariationCapacity,
    allowedSlotTotal,
    heldSlotTotal,
    gateCount: gates.length,
    openGateCount: openGates.length,
    closedGateCount: closedGates.length,
    receiptStatus: fireCudaPromotionReceiptPacket?.status || "unknown",
    gates,
    expansionRules: [
      "Pending receipts keep all matching rank slots closed.",
      "Promote receipts can unlock a small winner batch after second-action evidence.",
      "Rewrite receipts can unlock a smaller metadata test batch after visibility evidence.",
      "Hold receipts unlock zero new keyword surfaces.",
      "Every opened slot must point back to a watch route, blog route, source/backlink, GLB, podcast, market, or search-intent proof."
    ],
    nextFireCudaMove: openGates.length
      ? "Expand only the open earned gates and keep the rest of the master list held."
      : "Keep the full master list held until receipts gain promote or rewrite evidence.",
    lastKnownMetrics
  }
}

function masterListExpansionGateMarkdown(packet){
  return `# DigitalHut Master List Expansion Gate

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Total variation capacity: ${packet.totalVariationCapacity.toLocaleString("en-US")}

Allowed slots now: ${packet.allowedSlotTotal.toLocaleString("en-US")}

Held slots: ${packet.heldSlotTotal.toLocaleString("en-US")}

Gates: ${packet.gateCount}

Open gates: ${packet.openGateCount}

Closed gates: ${packet.closedGateCount}

Receipt status: ${packet.receiptStatus}

## Expansion Gates

${packet.gates.map((gate) => `- **${gate.pairSlug}** (${gate.expansionStatus}, ${gate.laneBridgeStatus}): lane ${gate.launchLane}; decision ${gate.decision}; second action ${gate.secondActionWinner}; allowed slots ${gate.allowedSlots.toLocaleString("en-US")} / lane capacity ${gate.laneVariationCapacity.toLocaleString("en-US")}; blocked ${gate.blockedReason}.`).join("\n")}

## Expansion Rules

${packet.expansionRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildSeparateLaneUniverseStarterPacket({masterListExpansionGatePacket} = {}){
  const laneBlueprints = {
    Businesses: {
      universeId: "market-business-observatory",
      lane: "Businesses",
      receiptPair: "current-market-video-observatory",
      proofRoutes: {
        watch: "/watch/current-market-video-observatory",
        blog: "/blog/current-market-video-observatory",
        category: "/category/current-market-observatory"
      },
      proofSignal: "market view open + ticker search + source/backlink open + GLB market environment",
      dimensions: {
        tickers: ["NVDA", "TSLA", "AAPL", "MSFT", "GOOGL", "AMD", "META", "AMZN", "PLTR", "SMCI"],
        intents: ["current market video", "stock research observatory", "bullish or bearish read", "top volume stock", "earnings visual analysis", "company research video"],
        contexts: ["pre market", "market open", "earnings week", "after hours", "breaking market news", "sector rotation"],
        formats: ["video observatory", "3D company environment", "podcast source moment", "TradingView-style chart read", "backlink proof page", "watch route proof"],
        proofAngles: ["volume spike", "news catalyst", "price reaction", "developer infrastructure", "AI market read", "company source proof"],
        geoScopes: ["US market", "global market", "retail investor", "developer investor", "small business owner"]
      }
    },
    "Mainstream Streaming": {
      universeId: "home-visual-build-observatory",
      lane: "Mainstream Streaming",
      receiptPair: "home-project-3d-visual-planner",
      proofRoutes: {
        watch: "/watch/home-project-3d-visual-planner",
        blog: "/blog/home-project-3d-visual-planner",
        category: "/category/home-project-3d-experience"
      },
      proofSignal: "home project visual planning + GLB preview + source/backlink open + watch proof route",
      dimensions: {
        projects: ["kitchen remodel", "garage build", "backyard patio", "gaming room", "home office", "bathroom upgrade", "basement studio", "rental property refresh"],
        intents: ["3D home project planner", "visual remodel idea", "before and after build", "home project video guide", "room design observatory", "contractor research view"],
        contexts: ["weekend project", "budget planning", "family upgrade", "real estate showing", "DIY research", "contractor quote"],
        formats: ["3D model preview", "timeline map", "source proof page", "watch route", "podcast expert moment", "visual checklist"],
        proofAngles: ["cost clue", "material choice", "layout comparison", "space planning", "resale value", "safety and permit research"],
        geoScopes: ["suburban home", "city apartment", "rental unit", "vacation property", "starter home"]
      }
    },
    "Automatic System Presentation": {
      universeId: "search-intent-system-presentation",
      lane: "Automatic System Presentation",
      receiptPair: "search-intent-radar-visual-experience",
      proofRoutes: {
        watch: "/watch/search-intent-radar-visual-experience",
        blog: "/blog/search-intent-radar-visual-experience",
        category: "/category/search-intent-radar"
      },
      proofSignal: "search run + intent chip select + timeline scrub + proof route open",
      dimensions: {
        searches: ["what am I watching", "explain this video", "best source for this topic", "turn video into research", "visual search engine", "AI video analysis"],
        intents: ["search intent radar", "video research hub", "observatory system read", "developer analytics view", "content source map", "watch route summary"],
        contexts: ["viral video", "coding video", "case study", "family reel", "real estate clip", "gaming build", "market video"],
        formats: ["bubble map", "timeline proof", "3D source view", "podcast source popup", "backlink map", "blog proof"],
        proofAngles: ["source credibility", "second action", "viewer curiosity", "topic extraction", "trend match", "research usefulness"],
        geoScopes: ["US viewer", "global viewer", "creator", "developer", "researcher", "everyday viewer"]
      }
    }
  }
  const separateGates = (masterListExpansionGatePacket?.gates || [])
    .filter((gate) => gate.laneBridgeStatus === "needs-separate-lane-universe")
  const universes = separateGates.map((gate) => {
    const blueprint = laneBlueprints[gate.launchLane] || {
      universeId: gate.launchLane.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      lane: gate.launchLane,
      receiptPair: gate.pairSlug,
      proofRoutes: gate.proofRoutes,
      proofSignal: "receipt-backed proof route behavior",
      dimensions: {
        intents: ["visual experience", "research observatory", "source proof", "watch route"],
        contexts: ["general search", "video analysis", "developer research"],
        formats: ["watch route", "blog proof", "backlink map"],
        proofAngles: ["second-action evidence", "source behavior", "useful read"]
      }
    }
    const variationCapacity = productCount(blueprint.dimensions)
    return {
      ...blueprint,
      pairSlug: gate.pairSlug,
      receiptStatus: gate.receiptStatus,
      expansionStatus: gate.expansionStatus,
      variationCapacity,
      dimensionCounts: dimensionCounts(blueprint.dimensions),
      sampleKeywords: [
        `${blueprint.lane} ${Object.values(blueprint.dimensions)[1]?.[0] || "visual observatory"}`,
        `${Object.values(blueprint.dimensions)[0]?.[0] || blueprint.lane} ${Object.values(blueprint.dimensions)[3]?.[0] || "watch route"}`,
        `${blueprint.proofRoutes.watch.replace("/watch/", "").replace(/-/g, " ")} source proof`,
        `${blueprint.lane} podcast GLB backlink research view`
      ],
      unlockRule: "Only count as expandable after the matching receipt earns promote or rewrite evidence.",
      currentAction: "stage universe formula; do not publish expanded routes"
    }
  })
  const totalSeparateCapacity = universes.reduce((total, universe) => total + universe.variationCapacity, 0)
  return {
    generatedAt,
    mode: "DigitalHut Separate Lane Universe Starter",
    status: universes.length ? "separate-lane-universes-staged-receipt-held" : "separate-lane-universes-not-needed",
    purpose: "Create counted SEO universe starters for first-wave lanes that sit outside the current mundane off-time master list.",
    guardrail: "These are formulas and staging maps only. Do not publish, submit, or expand them until receipts earn promote or rewrite evidence.",
    sourceGateStatus: masterListExpansionGatePacket?.status || "unknown",
    separateLaneCount: universes.length,
    totalSeparateCapacity,
    combinedHeldCapacity: (masterListExpansionGatePacket?.heldSlotTotal || 0) + totalSeparateCapacity,
    universes,
    expansionRules: [
      "Keep market/business, home visual build, and system presentation separate from mundane off-time SEO.",
      "Use receipt evidence to decide whether each universe earns promote, rewrite, or hold.",
      `Do not merge separate-lane capacity into the ${seoSearchClaimSummary.totalIndividualRanks.toLocaleString("en-US")} master list until a receipt proves behavior.`,
      "Every separate lane must keep a watch route, blog route, GLB/source/podcast/backlink proof path, and Supabase measurement lane."
    ],
    nextFireCudaMove: universes.length
      ? "Hold these separate universes behind receipts; after evidence lands, open only the specific lane that earned promote or rewrite."
      : "No separate universe is needed from the current gate.",
    lastKnownMetrics
  }
}

function separateLaneUniverseStarterMarkdown(packet){
  return `# DigitalHut Separate Lane Universe Starter

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Source gate: ${packet.sourceGateStatus}

Separate lanes: ${packet.separateLaneCount}

Separate lane capacity: ${packet.totalSeparateCapacity.toLocaleString("en-US")}

Combined held capacity: ${packet.combinedHeldCapacity.toLocaleString("en-US")}

## Separate Universes

${packet.universes.map((universe) => `- **${universe.lane}** (${universe.universeId}): ${universe.variationCapacity.toLocaleString("en-US")} staged slots; pair ${universe.pairSlug}; receipt ${universe.receiptStatus}; proof ${universe.proofSignal}; action ${universe.currentAction}.`).join("\n") || "- No separate universes needed."}

## Dimension Counts

${packet.universes.map((universe) => `### ${universe.lane}

${Object.entries(universe.dimensionCounts).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

Sample keywords:
${universe.sampleKeywords.map((keyword) => `- ${keyword}`).join("\n")}

Proof routes:
- ${universe.proofRoutes.category}
- ${universe.proofRoutes.watch}
- ${universe.proofRoutes.blog}`).join("\n\n")}

## Expansion Rules

${packet.expansionRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildSeparateLaneReceiptBridgePacket({separateLaneUniverseStarterPacket, fireCudaPromotionReceiptPacket} = {}){
  const receiptByPair = new Map((fireCudaPromotionReceiptPacket?.receipts || []).map((receipt) => [receipt.pairSlug, receipt]))
  const bridges = (separateLaneUniverseStarterPacket?.universes || []).map((universe) => {
    const receipt = receiptByPair.get(universe.pairSlug)
    const decision = receipt?.receiptFields?.decision || "pending"
    const secondActionWinner = receipt?.receiptFields?.secondActionWinner || "pending"
    const canOpen = ["promote", "rewrite"].includes(decision) && secondActionWinner !== "pending"
    const openBatchSize = canOpen ? Math.min(universe.variationCapacity, decision === "promote" ? 400 : 90) : 0
    return {
      universeId: universe.universeId,
      lane: universe.lane,
      pairSlug: universe.pairSlug,
      receiptStatus: receipt?.status || "missing-receipt",
      bridgeStatus: canOpen ? "bridge-open-earned-evidence" : "bridge-staged-receipt-held",
      decision,
      secondActionWinner,
      requiredSecondActions: receipt?.secondActionSignals || [],
      watchRoute: universe.proofRoutes.watch,
      blogRoute: universe.proofRoutes.blog,
      categoryRoute: universe.proofRoutes.category,
      universeCapacity: universe.variationCapacity,
      openBatchSize,
      heldSlots: Math.max(universe.variationCapacity - openBatchSize, 0),
      unlockSequence: [
        "build proof",
        "watch route inspection",
        "blog route inspection",
        "Supabase second-action signal",
        "FireCuda receipt decision",
        "separate-lane batch open"
      ],
      expansionAction: canOpen
        ? "Open a measured separate-lane batch and keep remaining slots gated."
        : "Keep separate universe staged; do not publish expanded routes."
    }
  })
  const openBridges = bridges.filter((bridge) => bridge.bridgeStatus === "bridge-open-earned-evidence")
  const heldSlots = bridges.reduce((total, bridge) => total + bridge.heldSlots, 0)
  const openSlots = bridges.reduce((total, bridge) => total + bridge.openBatchSize, 0)
  return {
    generatedAt,
    mode: "DigitalHut Separate Lane Receipt Bridge",
    status: openBridges.length ? "separate-lane-receipt-bridge-open-partial" : "separate-lane-receipt-bridge-staged-held",
    purpose: "Connect each separate SEO universe to the exact FireCuda receipt evidence that can unlock measured expansion.",
    guardrail: "This bridge is not a publishing action. It keeps separate-lane universes closed until receipt decisions prove second-action behavior.",
    sourceUniverseStatus: separateLaneUniverseStarterPacket?.status || "unknown",
    receiptStatus: fireCudaPromotionReceiptPacket?.status || "unknown",
    bridgeCount: bridges.length,
    openBridgeCount: openBridges.length,
    openSlots,
    heldSlots,
    bridges,
    bridgeRules: [
      "A separate lane cannot open from page_view or blog_view alone.",
      "A separate lane opens only when its receipt has promote or rewrite plus a second-action winner.",
      "Market/business requires market, ticker, backlink, GLB, podcast, or search-intent proof.",
      "Home/visual build requires GLB, proof route, backlink, podcast, or search-intent proof.",
      "System presentation requires search, intent-chip, proof route, market, GLB, or podcast proof."
    ],
    nextFireCudaMove: openBridges.length
      ? "Open only the bridges with earned evidence and keep all other separate-lane slots held."
      : "Keep all separate-lane bridges staged until their receipts earn promote or rewrite evidence.",
    lastKnownMetrics
  }
}

function separateLaneReceiptBridgeMarkdown(packet){
  return `# DigitalHut Separate Lane Receipt Bridge

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Source universe status: ${packet.sourceUniverseStatus}

Receipt status: ${packet.receiptStatus}

Bridges: ${packet.bridgeCount}

Open bridges: ${packet.openBridgeCount}

Open slots: ${packet.openSlots.toLocaleString("en-US")}

Held slots: ${packet.heldSlots.toLocaleString("en-US")}

## Bridges

${packet.bridges.map((bridge) => `- **${bridge.lane}** (${bridge.bridgeStatus}): universe ${bridge.universeId}; pair ${bridge.pairSlug}; receipt ${bridge.receiptStatus}; decision ${bridge.decision}; second action ${bridge.secondActionWinner}; open ${bridge.openBatchSize.toLocaleString("en-US")} / ${bridge.universeCapacity.toLocaleString("en-US")}; action ${bridge.expansionAction}`).join("\n")}

## Bridge Rules

${packet.bridgeRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildReceiptEvidenceIntakeSchemaPacket({fireCudaPromotionReceiptPacket, supabaseRefinementViewsPacket, separateLaneReceiptBridgePacket, buildToolingRecoveryPacket, deployReadinessAudit} = {}){
  const receipts = fireCudaPromotionReceiptPacket?.receipts || []
  const bridgeByPair = new Map((separateLaneReceiptBridgePacket?.bridges || []).map((bridge) => [bridge.pairSlug, bridge]))
  const buildProofReady = buildToolingRecoveryPacket?.status === "build-path-ready" || deployReadinessAudit?.status === "deploy-ready-staged"
  const receiptSchemas = receipts.map((receipt) => {
    const bridge = bridgeByPair.get(receipt.pairSlug)
    const isSeparateLane = !!bridge
    const secondActionSignals = receipt.secondActionSignals || []
    return {
      pairSlug: receipt.pairSlug,
      lane: receipt.launchLane,
      receiptStatus: receipt.status,
      separateLaneBridge: bridge?.bridgeStatus || "not-separate-lane",
      intakeStatus: buildProofReady ? "intake-ready-for-measurement" : "intake-staged-waiting-build-proof",
      fields: [
        {
          field: "searchConsoleEvidence",
          source: "Google Search Console URL inspection",
          acceptedValues: ["indexed", "discovered", "crawled-not-indexed", "not-found", "pending"],
          requiredForDecision: true,
          writesTo: "receiptFields.searchConsoleEvidence"
        },
        {
          field: "supabaseRouteRefinement",
          source: "public.digitalhut_seo_route_refinement",
          acceptedValues: ["route-visible", "route-visible-with-second-action", "route-quiet", "pending"],
          requiredForDecision: true,
          writesTo: "receiptFields.supabaseRouteRefinement"
        },
        {
          field: "supabaseKeywordRefinement",
          source: "public.digitalhut_seo_keyword_refinement",
          acceptedValues: ["keyword-earned", "keyword-quiet", "keyword-not-seen", "pending"],
          requiredForDecision: false,
          writesTo: "receiptFields.supabaseKeywordRefinement"
        },
        {
          field: "secondActionWinner",
          source: "Supabase second-action event family",
          acceptedValues: secondActionSignals.length ? [...secondActionSignals, "none", "pending"] : ["none", "pending"],
          requiredForDecision: true,
          writesTo: "receiptFields.secondActionWinner"
        },
        {
          field: "decision",
          source: "FireCuda decision queue",
          acceptedValues: ["promote", "rewrite", "hold", "pending"],
          requiredForDecision: true,
          writesTo: "receiptFields.decision"
        },
        {
          field: "masterListAction",
          source: isSeparateLane ? "Separate lane receipt bridge" : "Master list expansion gate",
          acceptedValues: isSeparateLane ? ["open-separate-lane-batch", "rewrite-separate-lane-metadata", "hold-separate-lane", "pending"] : ["open-master-list-batch", "rewrite-master-list-metadata", "hold-master-list", "pending"],
          requiredForDecision: false,
          writesTo: "receiptFields.masterListAction"
        },
        {
          field: "backlinkAction",
          source: "backlink_source_open or source behavior",
          acceptedValues: ["strengthen-source-link", "add-internal-support", "hold-backlink", "pending"],
          requiredForDecision: false,
          writesTo: "receiptFields.backlinkAction"
        }
      ],
      decisionLogic: [
        "promote when route is visible and secondActionWinner is not none or pending",
        "rewrite when route is visible but secondActionWinner stays none after the measurement window",
        "hold when Search Console and Supabase both stay quiet after inspection",
        isSeparateLane ? "separate lane opens only after promote or rewrite" : "master list batch opens only after promote or rewrite"
      ],
      nextAction: buildProofReady
        ? "Fill fields from Search Console and Supabase views, then choose promote, rewrite, or hold."
        : "Wait for build proof, then fill fields from Search Console and Supabase views."
    }
  })
  return {
    generatedAt,
    mode: "DigitalHut Receipt Evidence Intake Schema",
    status: receipts.length ? (buildProofReady ? "receipt-evidence-intake-ready-for-measurement" : "receipt-evidence-intake-staged-build-held") : "receipt-evidence-intake-empty",
    purpose: "Define the exact evidence fields and accepted values that fill FireCuda receipts after build proof and measurement.",
    guardrail: "This schema does not claim evidence. It only defines how evidence is accepted into pending receipt fields.",
    buildProofStatus: buildProofReady ? "build-proof-ready" : "waiting-build-proof",
    receiptCount: receipts.length,
    schemaCount: receiptSchemas.length,
    supabaseRefinementStatus: supabaseRefinementViewsPacket?.status || "unknown",
    separateLaneBridgeStatus: separateLaneReceiptBridgePacket?.status || "unknown",
    receiptStatus: fireCudaPromotionReceiptPacket?.status || "unknown",
    receiptSchemas,
    intakeOrder: [
      "Confirm build proof",
      "Record Search Console URL inspection for watch and blog routes",
      "Read Supabase route_refinement",
      "Read Supabase keyword_refinement",
      "Pick secondActionWinner",
      "Write FireCuda decision",
      "Write masterListAction or separate-lane action",
      "Write backlinkAction if source behavior supports it"
    ],
    nextFireCudaMove: buildProofReady
      ? "Use this schema to fill receipts from Search Console and Supabase before opening any master-list or separate-lane expansion."
      : "After build proof, use this schema to fill receipts consistently before opening any master-list or separate-lane expansion.",
    lastKnownMetrics
  }
}

function receiptEvidenceIntakeSchemaMarkdown(packet){
  return `# DigitalHut Receipt Evidence Intake Schema

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Build proof status: ${packet.buildProofStatus}

Receipts: ${packet.receiptCount}

Schemas: ${packet.schemaCount}

Supabase refinement: ${packet.supabaseRefinementStatus}

Separate lane bridge: ${packet.separateLaneBridgeStatus}

Receipt status: ${packet.receiptStatus}

## Intake Order

${packet.intakeOrder.map((step) => `- ${step}`).join("\n")}

## Receipt Schemas

${packet.receiptSchemas.map((schema) => `- **${schema.pairSlug}** (${schema.intakeStatus}, ${schema.separateLaneBridge}): fields ${schema.fields.map((field) => field.field).join(", ")}.`).join("\n")}

## Accepted Fields

${packet.receiptSchemas.slice(0, 6).map((schema) => `### ${schema.pairSlug}

${schema.fields.map((field) => `- **${field.field}** from ${field.source}: ${field.acceptedValues.join(", ")} -> ${field.writesTo}`).join("\n")}

Decision logic:
${schema.decisionLogic.map((rule) => `- ${rule}`).join("\n")}`).join("\n\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildReleasePairSubmissionPacket({rankedBlogWatchBridgePacket, seoSubmissionQueue, deployReadinessAudit, routeCoverageAudit, aiCrawlerGuidancePacket} = {}){
  const releasePairs = (rankedBlogWatchBridgePacket?.topPairs || [])
    .filter((pair) => pair.promotionStage === "release-pair")
  const existingSubmissionUrls = new Set((seoSubmissionQueue?.batches || [])
    .flatMap((batch) => batch.routes.map((route) => route.canonical)))
  const routeCoverageReady = routeCoverageAudit?.status === "pass"
  const deployHeld = deployReadinessAudit?.status === "hold-build-tooling"
  const submissionTargets = releasePairs.flatMap((pair, index) => {
    const basePriority = 100 - index
    return [
      {
        priority: basePriority,
        pairSlug: pair.slug,
        url: pair.canonicalWatch,
        route: pair.watchRoute,
        type: "watch-proof",
        launchLane: pair.launchLane,
        existingSubmissionQueue: existingSubmissionUrls.has(pair.canonicalWatch),
        inspectionReason: "Watch proof is the first crawler target because it connects video, GLB, podcast/source, category, and backlink evidence.",
        keywords: pair.keywords.slice(0, 8),
        measurementEvents: pair.measurementEvents,
        backlinkAnchors: pair.backlinkAnchors,
        fireCudaDecision: pair.fireCudaDecision
      },
      {
        priority: basePriority - 5,
        pairSlug: pair.slug,
        url: pair.canonicalBlog,
        route: pair.blogRoute,
        type: "blog-proof",
        launchLane: pair.launchLane,
        existingSubmissionQueue: existingSubmissionUrls.has(pair.canonicalBlog),
        inspectionReason: "Blog proof backs the watch route with readable long-tail context, source language, and crawlable keyword proof.",
        keywords: pair.keywords.slice(0, 8),
        measurementEvents: ["blog_view", ...pair.measurementEvents.filter((event) => event !== "blog_view")],
        backlinkAnchors: pair.backlinkAnchors,
        fireCudaDecision: pair.fireCudaDecision
      }
    ]
  })
  const missingFromBroadQueue = submissionTargets.filter((target) => !target.existingSubmissionQueue)
  const status = releasePairs.length >= 6 && routeCoverageReady
    ? deployHeld ? "release-pair-submission-staged-build-held" : "release-pair-submission-ready"
    : "release-pair-submission-review"
  return {
    generatedAt,
    mode: "DigitalHut Release Pair Submission Packet",
    status,
    purpose: "Create a narrow sitemap/Search Console queue for the strongest ranked blog/watch pairs so DigitalHut can promote proof without overpublishing weak long-tail pages.",
    guardrail: "Submit and inspect strongest existing proof URLs only after a stable deploy path. Keep FireCuda-held pairs out of the public push until Supabase behavior proves demand.",
    releasePairCount: releasePairs.length,
    submissionTargetCount: submissionTargets.length,
    missingFromBroadQueueCount: missingFromBroadQueue.length,
    routeCoverageStatus: routeCoverageAudit?.status || "unknown",
    deployReadinessStatus: deployReadinessAudit?.status || "unknown",
    aiCrawlerGuidanceStatus: aiCrawlerGuidancePacket?.status || "unknown",
    submissionTargets,
    missingFromBroadQueue,
    searchConsoleSteps: [
      "Submit sitemap after the stable Vercel build/deploy path is confirmed.",
      "Inspect watch URLs first because they prove the DigitalHut presentation system.",
      "Inspect matching blog URLs second because they carry readable long-tail proof.",
      "Compare Supabase route_refinement after traffic lands before promoting supporting keywords.",
      "Hold non-release pairs in FireCuda until route behavior shows a second useful action."
    ],
    compareRules: [
      "Promote a pair when watch route and blog route both earn more than page_view.",
      "Rewrite metadata when crawler proof exists but source/backlink/GLB behavior is quiet.",
      "Keep the broad submission queue, but use this packet as the first tight proof pass.",
      "Do not submit FireCuda-held pairs as if they are winners."
    ],
    nextFireCudaMove: "After stable deploy and Search Console inspection, compare the 12 release-pair URLs against Supabase behavior and promote only the pairs with proof/source/GLB/podcast/search movement.",
    lastKnownMetrics
  }
}

function releasePairSubmissionMarkdown(packet){
  return `# DigitalHut Release Pair Submission Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Release pairs: ${packet.releasePairCount}

Submission targets: ${packet.submissionTargetCount}

Missing from broad queue: ${packet.missingFromBroadQueueCount}

Route coverage: ${packet.routeCoverageStatus}

Deploy readiness: ${packet.deployReadinessStatus}

AI crawler guidance: ${packet.aiCrawlerGuidanceStatus}

## Submission Targets

${packet.submissionTargets.map((target) => `- **${target.type}** ${target.url} (${target.launchLane}, priority ${target.priority}). Broad queue: ${target.existingSubmissionQueue ? "yes" : "no"}. Inspect: ${target.inspectionReason} Events: ${target.measurementEvents.join(", ")}.`).join("\n")}

## Missing From Broad Queue

${packet.missingFromBroadQueue.length ? packet.missingFromBroadQueue.map((target) => `- ${target.url} (${target.type})`).join("\n") : "- None. All release targets already exist in the broad queue or are represented by this tight release-pair packet."}

## Search Console Steps

${packet.searchConsoleSteps.map((step) => `- ${step}`).join("\n")}

## Compare Rules

${packet.compareRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildReleasePairSubmissionDeltaPacket({releasePairSubmissionPacket, deployReadinessAudit, supabaseRefinementViewsPacket} = {}){
  const missingTargets = releasePairSubmissionPacket?.missingFromBroadQueue || []
  const groupedByPair = missingTargets.reduce((groups, target) => {
    if(!groups[target.pairSlug]){
      groups[target.pairSlug] = {
        pairSlug: target.pairSlug,
        launchLane: target.launchLane,
        routes: [],
        measurementEvents: new Set(),
        backlinkAnchors: new Set()
      }
    }
    groups[target.pairSlug].routes.push({
      route: target.route,
      url: target.url,
      type: target.type,
      priority: target.priority,
      inspectionReason: target.inspectionReason,
      keywords: target.keywords
    })
    target.measurementEvents.forEach((event) => groups[target.pairSlug].measurementEvents.add(event))
    target.backlinkAnchors.forEach((anchor) => groups[target.pairSlug].backlinkAnchors.add(anchor))
    return groups
  }, {})
  const deltaPairs = Object.values(groupedByPair).map((pair) => ({
    ...pair,
    measurementEvents: Array.from(pair.measurementEvents),
    backlinkAnchors: Array.from(pair.backlinkAnchors).slice(0, 6),
    catchupAction: "Add these URLs to the next stable Search Console inspection pass and compare route_refinement before expanding supporting keywords."
  }))
  const status = missingTargets.length
    ? deployReadinessAudit?.status === "hold-build-tooling" ? "submission-delta-staged-build-held" : "submission-delta-ready"
    : "submission-delta-clear"
  return {
    generatedAt,
    mode: "DigitalHut Release Pair Submission Delta",
    status,
    purpose: "Keep release-pair URLs missing from the broad SEO submission queue visible as a safe catch-up board.",
    guardrail: "Do not force deploy. This packet preserves missing proof URLs for the next stable push and Search Console inspection pass.",
    missingTargetCount: missingTargets.length,
    deltaPairCount: deltaPairs.length,
    deployReadinessStatus: deployReadinessAudit?.status || "unknown",
    supabaseRefinementStatus: supabaseRefinementViewsPacket?.status || "unknown",
    missingTargets,
    deltaPairs,
    catchupOrder: [
      "Keep missing URLs staged until build/deploy path is stable.",
      "Inspect watch targets before blog targets inside each missing pair.",
      "Use Supabase route_refinement to compare page views against proof/source/GLB/podcast/search behavior.",
      "Promote only pairs that earn a second action beyond page_view.",
      "Keep all other related variations held in FireCuda."
    ],
    nextFireCudaMove: missingTargets.length
      ? "Preserve the Current Market and Home Project release-pair URLs as the next submission delta; promote only after Search Console and Supabase behavior confirm movement."
      : "No release-pair submission delta is currently missing from the broad queue.",
    lastKnownMetrics
  }
}

function releasePairSubmissionDeltaMarkdown(packet){
  return `# DigitalHut Release Pair Submission Delta

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Missing targets: ${packet.missingTargetCount}

Delta pairs: ${packet.deltaPairCount}

Deploy readiness: ${packet.deployReadinessStatus}

Supabase refinement: ${packet.supabaseRefinementStatus}

## Delta Pairs

${packet.deltaPairs.length ? packet.deltaPairs.map((pair) => `### ${pair.pairSlug}

Lane: ${pair.launchLane}

Routes:
${pair.routes.map((route) => `- ${route.type}: ${route.url} (priority ${route.priority})`).join("\n")}

Events to compare: ${pair.measurementEvents.join(", ")}

Backlink anchors: ${pair.backlinkAnchors.join("; ")}

Catch-up action: ${pair.catchupAction}
`).join("\n") : "No missing release-pair targets."}

## Catch-Up Order

${packet.catchupOrder.map((item) => `- ${item}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildDeltaCompareRefinementPacket({releasePairSubmissionDeltaPacket, supabaseRefinementViewsPacket, compareContrastRefinement} = {}){
  const deltaPairs = releasePairSubmissionDeltaPacket?.deltaPairs || []
  const pairDecisions = deltaPairs.map((pair) => {
    const hasMarketEvent = pair.measurementEvents.includes("market_view_open")
    const pairSignals = [
      {signal: "page_view", baseline: lastKnownMetrics.pageViews, meaning: "proves traffic reached the proof route"},
      {signal: "blog_view", baseline: lastKnownMetrics.blogViews, meaning: "proves readable proof page attention"},
      {signal: "glb_preview_play", baseline: lastKnownMetrics.glbPreviewPlays, meaning: "proves 3D model usefulness"},
      {signal: "podcast_interrupt_play", baseline: lastKnownMetrics.podcastInterrupts, meaning: "proves source/audio usefulness"},
      {signal: "search_intent_chip_select", baseline: lastKnownMetrics.searchInteractions, meaning: "proves active keyword intent"},
      hasMarketEvent ? {signal: "market_view_open", baseline: lastKnownMetrics.marketOpens, meaning: "proves Current Market demand"} : null,
      {signal: "backlink_source_open", baseline: 0, meaning: "proves source/backlink curiosity"}
    ].filter(Boolean)
    const currentRead = hasMarketEvent && lastKnownMetrics.marketOpens === 0
      ? "Current Market is a release-pair delta but still has zero market opens, so it needs measured proof before stock SEO expands."
      : pair.pairSlug.includes("home-project")
        ? "Home Project is a release-pair delta with strong GLB relevance, so it should lean on 3D usefulness before broad home-project SEO expands."
        : "Release-pair delta needs a second behavior before promotion."
    return {
      pairSlug: pair.pairSlug,
      launchLane: pair.launchLane,
      routes: pair.routes.map((route) => route.route),
      currentRead,
      signalsToCompare: pairSignals,
      promoteWhen: "page_view is joined by at least one proof action: proof_route_open, backlink_source_open, glb_preview_play, podcast_interrupt_play, market_view_open, or search_intent_chip_select",
      rewriteWhen: "crawler/page activity appears but the second action stays quiet",
      holdWhen: "no route activity appears after stable deployment and Search Console inspection",
      fireCudaDecision: "promote, rewrite, or hold this pair before expanding supporting long-tail variations"
    }
  })
  const status = releasePairSubmissionDeltaPacket?.missingTargetCount
    ? supabaseRefinementViewsPacket?.status === "refinement-views-ready" ? "delta-compare-refinement-ready" : "delta-compare-refinement-review"
    : "delta-compare-clear"
  return {
    generatedAt,
    mode: "DigitalHut Delta Compare Refinement Packet",
    status,
    purpose: "Give the release-pair submission delta a clear promote/rewrite/hold decision path after deployment traffic lands.",
    guardrail: "Do not promote Current Market or Home Project only because they are staged. Require Search Console visibility plus Supabase behavior before expanding keywords.",
    deltaStatus: releasePairSubmissionDeltaPacket?.status || "unknown",
    missingTargetCount: releasePairSubmissionDeltaPacket?.missingTargetCount || 0,
    pairDecisionCount: pairDecisions.length,
    supabaseRefinementStatus: supabaseRefinementViewsPacket?.status || "unknown",
    globalCompareActions: (compareContrastRefinement?.actions || []).map((action) => ({
      lane: action.lane,
      signal: action.signal,
      reading: action.reading,
      action: action.action
    })),
    pairDecisions,
    compareOrder: [
      "Confirm stable deploy and sitemap/Search Console visibility.",
      "Read Supabase route_refinement for each watch/blog route in the delta.",
      "Compare page_view against second-action proof events.",
      "Promote pairs with second-action behavior into FireCuda winners.",
      "Rewrite metadata for crawled-but-quiet pairs.",
      "Hold inactive pairs without creating more public pages."
    ],
    nextFireCudaMove: "After deployment, run Current Market and Home Project through this compare path before expanding market, home project, or 3D planner long-tail clusters.",
    lastKnownMetrics
  }
}

function deltaCompareRefinementMarkdown(packet){
  return `# DigitalHut Delta Compare Refinement Packet

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Delta status: ${packet.deltaStatus}

Missing targets: ${packet.missingTargetCount}

Pair decisions: ${packet.pairDecisionCount}

Supabase refinement: ${packet.supabaseRefinementStatus}

## Pair Decisions

${packet.pairDecisions.map((pair) => `### ${pair.pairSlug}

Lane: ${pair.launchLane}

Routes: ${pair.routes.join(", ")}

Current read: ${pair.currentRead}

Promote when: ${pair.promoteWhen}

Rewrite when: ${pair.rewriteWhen}

Hold when: ${pair.holdWhen}

Signals:
${pair.signalsToCompare.map((signal) => `- ${signal.signal}: baseline ${signal.baseline}. ${signal.meaning}`).join("\n")}
`).join("\n")}

## Compare Order

${packet.compareOrder.map((item) => `- ${item}`).join("\n")}

## Global Compare Actions

${packet.globalCompareActions.map((action) => `- **${action.lane}** (${action.signal}): ${action.reading} Action: ${action.action}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildPostDeployMeasurementProofPacket({buildToolingRecoveryPacket, postDeployCompareHandoffPacket, supabaseMeasurementContract, deltaCompareRefinementPacket, releasePairSubmissionPacket} = {}){
  const eventMap = new Map((supabaseMeasurementContract?.events || []).map((event) => [event.canonicalEvent, event]))
  const proofEvents = [
    "page_view",
    "proof_route_open",
    "backlink_source_open",
    "glb_preview_play",
    "podcast_interrupt_play",
    "market_view_open",
    "search_intent_chip_select",
    "search_run"
  ].map((eventName) => {
    const event = eventMap.get(eventName)
    return {
      eventName,
      status: event?.coverageStatus || "missing",
      feature: event?.feature || "not mapped",
      humanRole: event?.humanRole || "not mapped",
      seoDecision: event?.seoDecision || "Needs event mapping before promotion decisions."
    }
  })
  const releaseGate = (buildToolingRecoveryPacket?.releaseGateMatrix || []).map((gate) => ({
    gate: gate.gate,
    status: gate.status,
    releaseMeaning: gate.releaseMeaning
  }))
  const releaseTargets = (releasePairSubmissionPacket?.submissionTargets || []).slice(0, 12).map((target) => ({
    route: target.route,
    type: target.type,
    launchLane: target.launchLane,
    priority: target.priority,
    requiredEvents: target.measurementEvents.filter((eventName, index, arr) => arr.indexOf(eventName) === index),
    searchConsoleAction: target.existingSubmissionQueue ? "Inspect after sitemap submission and compare behavior." : "Add to release-pair delta inspection set after stable build."
  }))
  const watchTargets = releaseTargets.filter((target) => target.type === "watch-proof")
    .sort((a, b) => b.priority - a.priority || a.route.localeCompare(b.route))
  const blogTargets = releaseTargets.filter((target) => target.type === "blog-proof")
    .sort((a, b) => b.priority - a.priority || a.route.localeCompare(b.route))
  const orderedInspectionSequence = [
    ...watchTargets.map((target, index) => ({
      order: index + 1,
      phase: "inspect-watch-proof",
      route: target.route,
      type: target.type,
      priority: target.priority,
      launchLane: target.launchLane,
      requiredEvents: target.requiredEvents,
      action: target.searchConsoleAction,
      waitFor: "Search Console URL inspection plus Supabase route_refinement after traffic"
    })),
    ...blogTargets.map((target, index) => ({
      order: watchTargets.length + index + 1,
      phase: "inspect-blog-proof",
      route: target.route,
      type: target.type,
      priority: target.priority,
      launchLane: target.launchLane,
      requiredEvents: target.requiredEvents,
      action: target.searchConsoleAction,
      waitFor: "Blog view, proof route, source/backlink, GLB, podcast, market, or search-intent behavior"
    })),
    {
      order: releaseTargets.length + 1,
      phase: "wait-and-measure",
      route: "Supabase route_refinement + keyword_refinement",
      type: "measurement-window",
      priority: 0,
      launchLane: "All release pairs",
      requiredEvents: proofEvents.map((event) => event.eventName),
      action: "Wait for enough real behavior to separate promote, rewrite, and hold decisions.",
      waitFor: "At least one second useful action beyond page_view on a release target"
    },
    {
      order: releaseTargets.length + 2,
      phase: "compare-and-decide",
      route: "FireCuda promotion board",
      type: "decision-pass",
      priority: 0,
      launchLane: "FireCuda > Supabase > Search Console",
      requiredEvents: ["proof_route_open", "backlink_source_open", "glb_preview_play", "podcast_interrupt_play", "market_view_open", "search_intent_chip_select"],
      action: "Promote winners, rewrite crawled-but-quiet routes, and hold inactive routes.",
      waitFor: "Compare result recorded before expanding keywords"
    }
  ]
  const inspectionPhaseCounts = orderedInspectionSequence.reduce((counts, item) => {
    counts[item.phase] = (counts[item.phase] || 0) + 1
    return counts
  }, {})
  const deltaDecisions = (deltaCompareRefinementPacket?.pairDecisions || []).map((pair) => ({
    pairSlug: pair.pairSlug,
    routes: pair.routes,
    promoteWhen: pair.promoteWhen,
    rewriteWhen: pair.rewriteWhen,
    holdWhen: pair.holdWhen
  }))
  const allEventsCovered = proofEvents.every((event) => event.status === "closed-loop")
  const buildGateHeld = buildToolingRecoveryPacket?.status !== "build-path-ready"
  const status = allEventsCovered
    ? buildGateHeld ? "measurement-proof-ready-build-held" : "measurement-proof-ready"
    : "measurement-proof-review"
  return {
    generatedAt,
    mode: "DigitalHut Post-Deploy Measurement Proof",
    status,
    purpose: "Define exactly which Supabase events decide Search Console submission, FireCuda promotion, metadata rewrite, or hold after a stable Vercel build.",
    guardrail: "No live metric claim is made here. This packet is a post-deploy measurement contract that activates only after build proof and traffic data exist.",
    releaseDecision: buildToolingRecoveryPacket?.releaseDecision || "unknown",
    releaseGate,
    releaseRouteCount: postDeployCompareHandoffPacket?.releaseRouteCount || 0,
    measurementEventCount: proofEvents.length,
    proofEvents,
    releaseTargets,
    orderedInspectionSequence,
    inspectionPhaseCounts,
    deltaDecisions,
    decisionMatrix: [
      {
        outcome: "Search Console submit/inspect",
        condition: "stable build proof exists and route is in releaseTargets",
        requiredEvidence: ["sitemap route present", "canonical URL present", "Vercel build proof"]
      },
      {
        outcome: "FireCuda promote",
        condition: "route receives page/proof traffic plus at least one second useful action",
        requiredEvidence: ["page_view or proof_route_open", "glb_preview_play or podcast_interrupt_play or market_view_open or search_intent_chip_select or backlink_source_open"]
      },
      {
        outcome: "metadata rewrite",
        condition: "route receives crawl/page activity but no second useful action",
        requiredEvidence: ["page_view or Search Console visibility", "no second action in Supabase route_refinement"]
      },
      {
        outcome: "FireCuda hold",
        condition: "route receives no measured activity after stable deploy and inspection window",
        requiredEvidence: ["no route_refinement movement", "no keyword_refinement movement"]
      }
    ],
    nextFireCudaMove: "After Vercel build proof, use this measurement matrix to decide Search Console inspection, FireCuda promotion, metadata rewrite, or hold for the release routes and delta pairs.",
    lastKnownMetrics
  }
}

function postDeployMeasurementProofMarkdown(packet){
  return `# DigitalHut Post-Deploy Measurement Proof

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Release decision: ${packet.releaseDecision}

Release routes: ${packet.releaseRouteCount}

Measurement events: ${packet.measurementEventCount}

## Release Gate

${packet.releaseGate.map((gate) => `- **${gate.gate}** (${gate.status}): ${gate.releaseMeaning}`).join("\n")}

## Proof Events

${packet.proofEvents.map((event) => `- **${event.eventName}** (${event.status}): ${event.feature}; role ${event.humanRole}. Decision: ${event.seoDecision}`).join("\n")}

## Release Targets

${packet.releaseTargets.map((target) => `- **${target.route}** (${target.type}, priority ${target.priority}): ${target.searchConsoleAction} Events: ${target.requiredEvents.join(", ")}`).join("\n")}

## Ordered Inspection Sequence

${packet.orderedInspectionSequence.map((item) => `- **${item.order}. ${item.phase}**: ${item.route} (${item.type}, ${item.launchLane}). Action: ${item.action} Wait for: ${item.waitFor}`).join("\n")}

## Delta Decisions

${packet.deltaDecisions.map((decision) => `- **${decision.pairSlug}**: Promote when ${decision.promoteWhen}; rewrite when ${decision.rewriteWhen}; hold when ${decision.holdWhen}.`).join("\n") || "- No delta decisions attached."}

## Decision Matrix

${packet.decisionMatrix.map((item) => `- **${item.outcome}**: ${item.condition}. Evidence: ${item.requiredEvidence.join("; ")}.`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildFireCudaDecisionQueueTemplatePacket({postDeployMeasurementProofPacket, rankedBlogWatchBridgePacket, deltaCompareRefinementPacket} = {}){
  const releaseTargets = postDeployMeasurementProofPacket?.releaseTargets || []
  const targetByRoute = new Map(releaseTargets.map((target) => [target.route, target]))
  const releasePairs = (rankedBlogWatchBridgePacket?.topPairs || [])
    .filter((pair) => pair.promotionStage === "release-pair")
    .map((pair) => {
      const watchTarget = targetByRoute.get(pair.watchRoute)
      const blogTarget = targetByRoute.get(pair.blogRoute)
      const hasMarketProof = pair.measurementEvents.includes("market_view_open")
      return {
        pairSlug: pair.slug,
        launchLane: pair.launchLane,
        watchRoute: pair.watchRoute,
        blogRoute: pair.blogRoute,
        score: pair.score,
        requiredEvents: Array.from(new Set([...(watchTarget?.requiredEvents || []), ...(blogTarget?.requiredEvents || [])])),
        secondActionEvents: ["proof_route_open", "backlink_source_open", "glb_preview_play", "podcast_interrupt_play", hasMarketProof ? "market_view_open" : null, "search_intent_chip_select"].filter(Boolean),
        keywords: pair.keywords.slice(0, 8),
        backlinkAnchors: pair.backlinkAnchors,
        baselineRead: {
          pageViews: lastKnownMetrics.pageViews,
          blogViews: lastKnownMetrics.blogViews,
          glbPreviewPlays: lastKnownMetrics.glbPreviewPlays,
          podcastInterrupts: lastKnownMetrics.podcastInterrupts,
          marketOpens: lastKnownMetrics.marketOpens,
          searchInteractions: lastKnownMetrics.searchInteractions
        }
      }
    })
  const deltaRouteSet = new Set((deltaCompareRefinementPacket?.pairDecisions || []).flatMap((pair) => pair.routes))
  const promotionQueueTemplate = releasePairs.map((pair, index) => ({
    order: index + 1,
    pairSlug: pair.pairSlug,
    routes: [pair.watchRoute, pair.blogRoute],
    launchLane: pair.launchLane,
    condition: "Promote only if page_view or proof_route_open is joined by at least one second-action proof event.",
    secondActionEvents: pair.secondActionEvents,
    fireCudaAction: "Move pair keywords into FireCuda winner list, strengthen internal links, and prepare supporting long-tail expansion.",
    searchConsoleAction: "Keep URL inspected and watch for continued route refinement movement.",
    sourceAction: "Attach backlink/source anchors that matched the second-action behavior.",
    priority: pair.score,
    deltaTracked: deltaRouteSet.has(pair.watchRoute) || deltaRouteSet.has(pair.blogRoute)
  }))
  const rewriteQueueTemplate = releasePairs.map((pair, index) => ({
    order: index + 1,
    pairSlug: pair.pairSlug,
    routes: [pair.watchRoute, pair.blogRoute],
    launchLane: pair.launchLane,
    condition: "Rewrite if Search Console or page_view proves visibility but second-action proof events stay quiet.",
    rewriteTargets: ["title", "description", "proofAngle", "internal link anchor", "category route language"],
    fireCudaAction: "Keep pair in measured rewrite queue and avoid adding new public pages until behavior improves.",
    priority: pair.score,
    deltaTracked: deltaRouteSet.has(pair.watchRoute) || deltaRouteSet.has(pair.blogRoute)
  }))
  const holdQueueTemplate = releasePairs.map((pair, index) => ({
    order: index + 1,
    pairSlug: pair.pairSlug,
    routes: [pair.watchRoute, pair.blogRoute],
    launchLane: pair.launchLane,
    condition: "Hold if no route_refinement or keyword_refinement movement appears after stable deployment and inspection window.",
    fireCudaAction: "Return pair keywords to FireCuda backlog, keep canonical route crawlable, and do not expand supporting variations.",
    priority: pair.score,
    deltaTracked: deltaRouteSet.has(pair.watchRoute) || deltaRouteSet.has(pair.blogRoute)
  }))
  const status = postDeployMeasurementProofPacket?.status?.startsWith("measurement-proof-ready")
    ? "firecuda-decision-queues-ready"
    : "firecuda-decision-queues-review"
  return {
    generatedAt,
    mode: "DigitalHut FireCuda Decision Queue Template",
    status,
    purpose: "Pre-stage the promote, rewrite, and hold queues that will sort release-pair routes after Vercel build proof and Supabase traffic measurement.",
    guardrail: "These are queue templates, not live decisions. Do not promote, rewrite, or hold a pair until post-deploy measurement data exists.",
    releasePairCount: releasePairs.length,
    promotionQueueCount: promotionQueueTemplate.length,
    rewriteQueueCount: rewriteQueueTemplate.length,
    holdQueueCount: holdQueueTemplate.length,
    measurementProofStatus: postDeployMeasurementProofPacket?.status || "unknown",
    orderedInspectionSteps: postDeployMeasurementProofPacket?.orderedInspectionSequence?.length || 0,
    promotionQueueTemplate,
    rewriteQueueTemplate,
    holdQueueTemplate,
    queueDecisionRules: [
      "Promotion queue requires visibility plus a second action.",
      "Rewrite queue is for crawled or visited routes that fail to earn second-action proof.",
      "Hold queue is for routes with no measurable movement after the inspection window.",
      "Delta-tracked pairs stay visible in every queue until Current Market and Home Project are proven or held."
    ],
    nextFireCudaMove: "After traffic lands, populate one of these queues for each release pair before expanding the master SEO list.",
    lastKnownMetrics
  }
}

function fireCudaDecisionQueueTemplateMarkdown(packet){
  return `# DigitalHut FireCuda Decision Queue Template

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Release pairs: ${packet.releasePairCount}

Promotion queue: ${packet.promotionQueueCount}

Rewrite queue: ${packet.rewriteQueueCount}

Hold queue: ${packet.holdQueueCount}

Measurement proof: ${packet.measurementProofStatus}

Ordered inspection steps: ${packet.orderedInspectionSteps}

## Promotion Queue Template

${packet.promotionQueueTemplate.map((item) => `- **${item.order}. ${item.pairSlug}** (${item.launchLane}, priority ${item.priority}, delta ${item.deltaTracked ? "yes" : "no"}): ${item.condition} FireCuda: ${item.fireCudaAction}`).join("\n")}

## Rewrite Queue Template

${packet.rewriteQueueTemplate.map((item) => `- **${item.order}. ${item.pairSlug}** (${item.launchLane}, priority ${item.priority}, delta ${item.deltaTracked ? "yes" : "no"}): ${item.condition} Rewrite: ${item.rewriteTargets.join(", ")}.`).join("\n")}

## Hold Queue Template

${packet.holdQueueTemplate.map((item) => `- **${item.order}. ${item.pairSlug}** (${item.launchLane}, priority ${item.priority}, delta ${item.deltaTracked ? "yes" : "no"}): ${item.condition} FireCuda: ${item.fireCudaAction}`).join("\n")}

## Queue Decision Rules

${packet.queueDecisionRules.map((rule) => `- ${rule}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildReleaseCommandCenterPacket({buildToolingRecoveryPacket, postDeployCompareHandoffPacket, postDeployMeasurementProofPacket, fireCudaDecisionQueueTemplatePacket, releasePairSubmissionPacket} = {}){
  const buildHeld = buildToolingRecoveryPacket?.status !== "build-path-ready"
  const vercelProjectPath = path.join(repoRoot, ".vercel", "project.json")
  const vercelAuthPath = path.join(process.env.USERPROFILE || process.env.HOME || "", ".vercel", "auth.json")
  const localVercelCliPresent = existsSync(path.join(repoRoot, "node_modules", ".bin", "vercel.cmd"))
    || existsSync(path.join(repoRoot, "node_modules", ".bin", "vercel"))
    || existsSync(path.join(repoRoot, "node_modules", "vercel"))
  const vercelProjectLinked = existsSync(vercelProjectPath)
  const vercelTokenPresent = !!process.env.VERCEL_TOKEN
  const vercelAuthPresent = vercelTokenPresent || existsSync(vercelAuthPath)
  const deploymentAuthStatus = vercelProjectLinked && vercelAuthPresent
    ? "vercel-deploy-auth-ready"
    : vercelProjectLinked
      ? "vercel-deploy-auth-missing"
      : "vercel-project-link-missing"
  const deployExecutableStatus = localVercelCliPresent ? "local-vercel-cli-present" : "use-npx-or-install-vercel-cli"
  const status = buildHeld ? "release-command-center-staged-build-held"
    : deploymentAuthStatus === "vercel-deploy-auth-ready" ? "release-command-center-ready"
      : "release-command-center-ready-auth-needed"
  const buildProofAcceptanceChecklist = [
    {
      proof: "local-build-proof",
      required: [
        "node_modules/vite/bin/vite.js or node_modules/.bin/vite exists",
        "npm run build completes without timeout or missing npm dependency errors",
        "dist output is written for the current Vite/Vercel configuration"
      ],
      currentRead: buildToolingRecoveryPacket?.localVitePresent
        ? "Vite binary present; still wait for completed build output before unlocking release."
        : "Vite binary missing locally; local proof remains held."
    },
    {
      proof: "vercel-build-proof",
      required: [
        "Vercel npm ci --legacy-peer-deps completes from the committed package-lock",
        "Vercel npm run build completes with framework vite and output dist",
        "preview or production URL serves the same sitemap/watch/blog route set"
      ],
      currentRead: "Cloud build path is staged; accept Vercel as authority only after an intentional deployment result."
    },
    {
      proof: "vercel-deploy-auth-proof",
      required: [
        "Vercel project is linked in .vercel/project.json",
        "Either VERCEL_TOKEN or ~/.vercel/auth.json is present for non-interactive deploy",
        "Vercel CLI is available locally or npx can fetch it during the deploy command"
      ],
      currentRead: `${deploymentAuthStatus}; ${deployExecutableStatus}`
    },
    {
      proof: "post-deploy-measurement-proof",
      required: [
        "watch routes are inspectable before matching blog routes",
        "Supabase records page/search/autoplay/GLB/podcast/market/blog behavior",
        "FireCuda promotes, rewrites, or holds each route pair from behavior evidence"
      ],
      currentRead: "Measurement layer is ready, but it stays held until build proof lands."
    }
  ]
  const commandLanes = [
    {
      lane: "Build Gate",
      status: buildToolingRecoveryPacket?.status || "unknown",
      read: buildToolingRecoveryPacket?.releaseDecision || "No release decision recorded.",
      nextAction: buildHeld ? "Use Vercel as build authority after intentional deploy, or restore local node_modules for local proof." : "Build proof is ready for release sequence."
    },
    {
      lane: "Vercel Deployment Auth",
      status: deploymentAuthStatus,
      read: `${deployExecutableStatus}; project link ${vercelProjectLinked ? "present" : "missing"}`,
      nextAction: deploymentAuthStatus === "vercel-deploy-auth-ready"
        ? "Deploy can run once the release decision is made."
        : "Add VERCEL_TOKEN or complete Vercel login before claiming the cloud build/deploy proof."
    },
    {
      lane: "Search Console Inspection",
      status: postDeployMeasurementProofPacket?.status || "unknown",
      read: `${postDeployMeasurementProofPacket?.orderedInspectionSequence?.length || 0} ordered steps / ${releasePairSubmissionPacket?.submissionTargetCount || 0} release targets`,
      nextAction: "Inspect watch routes first, matching blog routes second, then wait for Supabase refinement."
    },
    {
      lane: "Supabase Measurement",
      status: postDeployMeasurementProofPacket?.status || "unknown",
      read: `${postDeployMeasurementProofPacket?.measurementEventCount || 0} proof events / ${postDeployMeasurementProofPacket?.deltaDecisions?.length || 0} delta decisions`,
      nextAction: "Compare route_refinement and keyword_refinement before promoting FireCuda keywords."
    },
    {
      lane: "FireCuda Decisions",
      status: fireCudaDecisionQueueTemplatePacket?.status || "unknown",
      read: `promote ${fireCudaDecisionQueueTemplatePacket?.promotionQueueCount || 0} / rewrite ${fireCudaDecisionQueueTemplatePacket?.rewriteQueueCount || 0} / hold ${fireCudaDecisionQueueTemplatePacket?.holdQueueCount || 0}`,
      nextAction: "Populate exactly one queue per release pair after real behavior lands."
    },
    {
      lane: "Post-Deploy Handoff",
      status: postDeployCompareHandoffPacket?.status || "unknown",
      read: `${postDeployCompareHandoffPacket?.releaseRouteCount || 0} release routes / delta ${postDeployCompareHandoffPacket?.deltaPairDecisionCount || 0}`,
      nextAction: postDeployCompareHandoffPacket?.nextFireCudaMove || "No handoff action recorded."
    }
  ]
  const launchSequence = [
    "Hold public release claims while local build proof is missing.",
    "Use the staged Vercel cloud build path only after an intentional deploy decision.",
    "Confirm Vercel project link and deploy auth before claiming cloud build proof.",
    "After build proof, inspect six watch URLs before six blog URLs.",
    "Wait for Supabase route_refinement and keyword_refinement to show behavior.",
    "Move every release pair into promote, rewrite, or hold without expanding thin pages."
  ]
  return {
    generatedAt,
    mode: "DigitalHut Release Command Center",
    status,
    purpose: "Provide one compact backend command center for the next deploy moment: build gate, inspection order, measurement proof, FireCuda queues, and compare/refine handoff.",
    guardrail: "This does not deploy and does not claim live traffic. It is the operational command center for the next intentional release.",
    commandLanes,
    buildProofAcceptanceChecklist,
    launchSequence,
    deploymentAuthStatus,
    deployExecutableStatus,
    vercelProjectLinked,
    currentBuildGate: buildToolingRecoveryPacket?.status || "unknown",
    releaseTargets: releasePairSubmissionPacket?.submissionTargetCount || 0,
    orderedInspectionSteps: postDeployMeasurementProofPacket?.orderedInspectionSequence?.length || 0,
    proofEvents: postDeployMeasurementProofPacket?.measurementEventCount || 0,
    promoteQueue: fireCudaDecisionQueueTemplatePacket?.promotionQueueCount || 0,
    rewriteQueue: fireCudaDecisionQueueTemplatePacket?.rewriteQueueCount || 0,
    holdQueue: fireCudaDecisionQueueTemplatePacket?.holdQueueCount || 0,
    nextAction: buildHeld
      ? "Keep backend SEO packets staged; next release action requires Vercel build proof or restored local dependencies."
      : deploymentAuthStatus !== "vercel-deploy-auth-ready"
        ? "Add VERCEL_TOKEN or complete Vercel login before the next cloud deploy; keep Search Console and FireCuda queues staged until production proof lands."
        : "Run the ordered inspection sequence and then populate FireCuda decision queues from Supabase behavior.",
    lastKnownMetrics
  }
}

function releaseCommandCenterMarkdown(packet){
  return `# DigitalHut Release Command Center

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Build gate: ${packet.currentBuildGate}

Deployment auth: ${packet.deploymentAuthStatus}

Deploy executable: ${packet.deployExecutableStatus}

Release targets: ${packet.releaseTargets}

Ordered inspection steps: ${packet.orderedInspectionSteps}

Proof events: ${packet.proofEvents}

Queues: promote ${packet.promoteQueue} / rewrite ${packet.rewriteQueue} / hold ${packet.holdQueue}

## Command Lanes

${packet.commandLanes.map((lane) => `- **${lane.lane}** (${lane.status}): ${lane.read} Next: ${lane.nextAction}`).join("\n")}

## Build Proof Acceptance Checklist

${packet.buildProofAcceptanceChecklist.map((item) => `- **${item.proof}**: ${item.required.join("; ")}. Current read: ${item.currentRead}`).join("\n")}

## Launch Sequence

${packet.launchSequence.map((step) => `- ${step}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next action: ${packet.nextAction}
`
}

function buildDeploymentRuntimeCompatibilityPacket({packageJson = "", packageLock = "", vercelJson = "", buildToolingRecoveryPacket, releaseCommandCenterPacket} = {}){
  let parsedPackage = {}
  let parsedVercel = {}
  let parsedLock = {}
  try { parsedPackage = JSON.parse(packageJson) } catch {}
  try { parsedVercel = JSON.parse(vercelJson) } catch {}
  try { parsedLock = JSON.parse(packageLock) } catch {}
  const nodeEngine = parsedPackage.engines?.node || "not declared"
  const scripts = parsedPackage.scripts || {}
  const dependencies = parsedPackage.dependencies || {}
  const devDependencies = parsedPackage.devDependencies || {}
  const vercelRewrites = Array.isArray(parsedVercel.rewrites) ? parsedVercel.rewrites : []
  const checks = [
    {
      id: "node-engine-cloud-confirmation",
      status: nodeEngine === "not declared" ? "review" : "needs-cloud-confirmation",
      read: `package.json declares node ${nodeEngine}`,
      releaseRisk: "Confirm the Vercel build environment accepts this engine before claiming production build proof."
    },
    {
      id: "lockfile-npm-ci",
      status: parsedLock.lockfileVersion ? "pass" : "review",
      read: parsedLock.lockfileVersion ? `package-lock lockfileVersion ${parsedLock.lockfileVersion}` : "package-lock could not be parsed",
      releaseRisk: "npm ci needs a readable lockfile."
    },
    {
      id: "vite-build-entry",
      status: /vite build/.test(scripts.build || "") && (dependencies.vite || devDependencies.vite) ? "pass" : "review",
      read: /vite build/.test(scripts.build || "") ? `build script ${scripts.build}` : "build script does not include vite build",
      releaseRisk: "Vite build must stay aligned with Vercel outputDirectory dist."
    },
    {
      id: "react-vite-plugin",
      status: dependencies["@vitejs/plugin-react"] || devDependencies["@vitejs/plugin-react"] ? "pass" : "review",
      read: dependencies["@vitejs/plugin-react"] || devDependencies["@vitejs/plugin-react"] ? "React Vite plugin declared" : "React Vite plugin missing",
      releaseRisk: "React build pipeline needs plugin dependency available during install."
    },
    {
      id: "serverless-api-rewrite",
      status: vercelRewrites.some((rewrite) => rewrite.source === "/api/(.*)" && rewrite.destination === "/api/$1") ? "pass" : "review",
      read: "Vercel API rewrite checked",
      releaseRisk: "API routes should remain reachable after SPA fallback rewrites."
    },
    {
      id: "spa-fallback-rewrite",
      status: vercelRewrites.some((rewrite) => rewrite.source === "/(.*)" && rewrite.destination === "/index.html") ? "pass" : "review",
      read: "SPA fallback rewrite checked",
      releaseRisk: "Watch/blog/category proof routes need SPA fallback for crawlable rendering."
    },
    {
      id: "local-dependency-proof",
      status: buildToolingRecoveryPacket?.localVitePresent ? "pass" : "hold",
      read: buildToolingRecoveryPacket?.localVitePresent ? "local Vite binary present" : "local Vite binary missing",
      releaseRisk: "Local build proof is unavailable until dependencies are restored."
    }
  ]
  const statusCounts = checks.reduce((counts, check) => {
    counts[check.status] = (counts[check.status] || 0) + 1
    return counts
  }, {})
  const status = statusCounts.review ? "runtime-compatibility-review"
    : statusCounts.hold ? "runtime-compatibility-staged-needs-build-proof"
      : statusCounts["needs-cloud-confirmation"] ? "runtime-compatibility-local-ready-cloud-confirmation-needed"
        : "runtime-compatibility-ready"
  return {
    generatedAt,
    mode: "DigitalHut Deployment Runtime Compatibility",
    status,
    purpose: "Make runtime and deploy-config risk visible before DigitalHut treats the Vercel path as production proof.",
    guardrail: "This packet does not verify Vercel externally and does not deploy. It only records local evidence and the cloud confirmations still needed.",
    nodeEngine,
    vercelFramework: parsedVercel.framework || "not declared",
    installCommand: parsedVercel.installCommand || "not declared",
    buildCommand: parsedVercel.buildCommand || "not declared",
    outputDirectory: parsedVercel.outputDirectory || "not declared",
    lockfileVersion: parsedLock.lockfileVersion || "unknown",
    checks,
    statusCounts,
    releaseCommandCenterStatus: releaseCommandCenterPacket?.status || "unknown",
    releaseDecision: buildToolingRecoveryPacket?.releaseDecision || "unknown",
    nextAction: status === "runtime-compatibility-local-ready-cloud-confirmation-needed"
      ? "Local build proof is ready; next proof is Vercel cloud build confirmation for the declared Node/runtime path."
      : "Before production claims, get either local dependency proof or a Vercel build result that confirms the declared Node/runtime path.",
    lastKnownMetrics
  }
}

function deploymentRuntimeCompatibilityMarkdown(packet){
  return `# DigitalHut Deployment Runtime Compatibility

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Node engine: ${packet.nodeEngine}

Vercel framework: ${packet.vercelFramework}

Install command: ${packet.installCommand}

Build command: ${packet.buildCommand}

Output directory: ${packet.outputDirectory}

Lockfile version: ${packet.lockfileVersion}

Release command center: ${packet.releaseCommandCenterStatus}

Release decision: ${packet.releaseDecision}

## Checks

| Check | Status | Read | Release Risk |
| --- | --- | --- | --- |
${packet.checks.map((check) => `| ${check.id} | ${check.status} | ${check.read} | ${check.releaseRisk} |`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next action: ${packet.nextAction}
`
}

function buildDeploymentRuntimeFallbackPacket({deploymentRuntimeCompatibilityPacket, releaseCommandCenterPacket} = {}){
  const needsCloudConfirmation = (deploymentRuntimeCompatibilityPacket?.checks || []).some((check) => check.status === "needs-cloud-confirmation")
  const localHeld = (deploymentRuntimeCompatibilityPacket?.checks || []).some((check) => check.id === "local-dependency-proof" && check.status === "hold")
  const fallbackTriggers = [
    {
      trigger: "Vercel rejects declared Node engine",
      active: needsCloudConfirmation,
      evidenceNeeded: "Cloud build log that names the unsupported engine or runtime mismatch.",
      response: "Do not guess locally. Change engine only after Vercel provides rejection evidence."
    },
    {
      trigger: "Local build proof is required before deploy",
      active: localHeld,
      evidenceNeeded: "node_modules/vite/bin/vite.js present and a completed local build result.",
      response: "Restore dependencies before claiming local build proof."
    },
    {
      trigger: "Cloud build passes",
      active: true,
      evidenceNeeded: "Vercel build success for the current commit/config.",
      response: "Keep package engine as declared and move into ordered inspection sequence."
    }
  ]
  const fallbackOrder = [
    {
      order: 1,
      action: "Keep current package engine unchanged until a build result exists.",
      reason: "The repo declares node 24.x, but local evidence cannot prove Vercel support or failure."
    },
    {
      order: 2,
      action: "If Vercel build passes, mark runtime confirmed and continue release command center.",
      reason: "Cloud build success is the authoritative evidence for this staged path."
    },
    {
      order: 3,
      action: "If Vercel build rejects the engine, change only the engine declaration in a controlled follow-up patch.",
      reason: "A narrow engine-only change keeps SEO, UI, and generated packets stable."
    },
    {
      order: 4,
      action: "After any engine fallback patch, regenerate standby packets and rerun build proof.",
      reason: "Runtime decisions must flow back into release gate, measurement proof, and command center."
    }
  ]
  const status = needsCloudConfirmation || localHeld ? "runtime-fallback-staged" : "runtime-fallback-clear"
  return {
    generatedAt,
    mode: "DigitalHut Deployment Runtime Fallback Plan",
    status,
    purpose: "Stage the safe response if the declared runtime cannot be confirmed by local proof or Vercel build proof.",
    guardrail: "Do not change package.json engine preemptively. Runtime fallback requires explicit build evidence.",
    currentNodeEngine: deploymentRuntimeCompatibilityPacket?.nodeEngine || "unknown",
    compatibilityStatus: deploymentRuntimeCompatibilityPacket?.status || "unknown",
    releaseCommandCenterStatus: releaseCommandCenterPacket?.status || "unknown",
    fallbackTriggers,
    fallbackOrder,
    nextAction: "Wait for local dependency proof or Vercel build proof; only apply runtime fallback after concrete build evidence.",
    lastKnownMetrics
  }
}

function deploymentRuntimeFallbackMarkdown(packet){
  return `# DigitalHut Deployment Runtime Fallback Plan

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Current Node engine: ${packet.currentNodeEngine}

Compatibility status: ${packet.compatibilityStatus}

Release command center: ${packet.releaseCommandCenterStatus}

## Fallback Triggers

${packet.fallbackTriggers.map((trigger) => `- **${trigger.trigger}** (${trigger.active ? "active" : "inactive"}): Need ${trigger.evidenceNeeded} Response: ${trigger.response}`).join("\n")}

## Fallback Order

${packet.fallbackOrder.map((item) => `- **${item.order}.** ${item.action} Reason: ${item.reason}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next action: ${packet.nextAction}
`
}

function buildBuildProofIntakePacket({buildToolingRecoveryPacket, deploymentRuntimeCompatibilityPacket, deploymentRuntimeFallbackPacket, releaseCommandCenterPacket, postDeployMeasurementProofPacket} = {}){
  const localVitePresent = !!buildToolingRecoveryPacket?.localVitePresent
  const localNpmRunnerCheck = (buildToolingRecoveryPacket?.checks || []).find((check) => check.id === "local-npm-runner")
  const needsCloudConfirmation = (deploymentRuntimeCompatibilityPacket?.checks || []).some((check) => check.status === "needs-cloud-confirmation")
  const buildHeld = buildToolingRecoveryPacket?.status !== "build-path-ready"
  const evidenceTypes = [
    {
      id: "local-build-proof",
      status: localVitePresent ? "ready-to-accept" : "waiting-dependency-restore",
      acceptedEvidence: [
        "node_modules/vite/bin/vite.js or node_modules/.bin/vite present",
        "npm runner responds and completed npm run build result is captured",
        "dist output written for the current package/vercel config"
      ],
      routesTo: ["build-tooling-recovery", "deployment-runtime-compatibility", "release-command-center"],
      promotedResult: "Mark local build proof as usable and allow release proof batch to move from held to ready."
    },
    {
      id: "vercel-build-proof",
      status: "ready-to-accept",
      acceptedEvidence: [
        "Vercel deployment build success for the current commit/config",
        "framework vite, build command npm run build, output dist",
        "production or preview URL serving the same route set"
      ],
      routesTo: ["deployment-runtime-compatibility", "release-command-center", "post-deploy-measurement-proof"],
      promotedResult: "Confirm cloud runtime path and start ordered watch/blog inspection sequence."
    },
    {
      id: "vercel-runtime-rejection",
      status: needsCloudConfirmation ? "ready-to-accept" : "not-needed",
      acceptedEvidence: [
        "Vercel log names unsupported Node engine or runtime mismatch",
        "build failure is tied to runtime rather than app code",
        "same config still has lockfile and Vite build command intact"
      ],
      routesTo: ["deployment-runtime-fallback", "deployment-runtime-compatibility"],
      promotedResult: "Apply the narrow runtime fallback only after concrete cloud rejection evidence."
    },
    {
      id: "dependency-restore-proof",
      status: localVitePresent ? "already-present" : "waiting-restore",
      acceptedEvidence: [
        "npm ci completed from package-lock",
        "Vite binary appears locally",
        "npm runner proof is not stuck, timed out, or missing its own internal dependencies",
        "dependency restore did not change SEO/UI source files"
      ],
      routesTo: ["build-tooling-recovery", "local-build-proof"],
      promotedResult: "Unlock local build proof without changing DigitalHut product surface."
    }
  ]
  const intakeFlow = [
    {
      order: 1,
      system: "FireCuda",
      action: "Keep SEO and route packets staged while build proof is missing.",
      output: "No rank claims advance past release-command-center until build evidence lands."
    },
    {
      order: 2,
      system: "GitHub",
      action: "Treat the current commit/config as the evidence boundary.",
      output: "Every accepted proof must map back to the same generated packets and route set."
    },
    {
      order: 3,
      system: "Vercel",
      action: "Use cloud build success or rejection as the runtime authority.",
      output: "Cloud pass starts inspection; cloud runtime rejection triggers fallback only."
    },
    {
      order: 4,
      system: "Supabase",
      action: "After deployment proof, collect page/search/autoplay/GLB/podcast/market/blog behavior.",
      output: "Refinement views decide promote, rewrite, or hold."
    },
    {
      order: 5,
      system: "Google Cloud/Search",
      action: "Submit only the release pair routes after build proof.",
      output: "Watch routes first, blog proof second, then compare behavior."
    }
  ]
  const affectedPackets = [
    {
      packet: "digitalhut-build-tooling-recovery-packet",
      currentStatus: buildToolingRecoveryPacket?.status || "unknown",
      updateWhenEvidenceArrives: "local build proof or Vercel build proof changes build gate from held to ready."
    },
    {
      packet: "digitalhut-deployment-runtime-compatibility",
      currentStatus: deploymentRuntimeCompatibilityPacket?.status || "unknown",
      updateWhenEvidenceArrives: "cloud build pass confirms runtime; runtime rejection keeps fallback controlled."
    },
    {
      packet: "digitalhut-deployment-runtime-fallback",
      currentStatus: deploymentRuntimeFallbackPacket?.status || "unknown",
      updateWhenEvidenceArrives: "fallback stays staged unless Vercel rejects the declared runtime."
    },
    {
      packet: "digitalhut-release-command-center",
      currentStatus: releaseCommandCenterPacket?.status || "unknown",
      updateWhenEvidenceArrives: "moves from build-held command center into ordered deploy/inspection command center."
    },
    {
      packet: "digitalhut-post-deploy-measurement-proof",
      currentStatus: postDeployMeasurementProofPacket?.status || "unknown",
      updateWhenEvidenceArrives: "starts measuring the selected watch/blog route pairs after deployment proof."
    }
  ]
  const acceptanceChecklist = [
    {
      id: "local-proof-chain",
      state: localVitePresent && localNpmRunnerCheck?.status === "pass" ? "candidate" : "held",
      requiredEvidence: [
        "dependency restore proof",
        "local npm runner responsiveness",
        "completed npm run build",
        "dist output"
      ],
      currentRead: localVitePresent
        ? "Local Vite exists, but the build command still needs proof before release."
        : "Local Vite is missing, so the local proof chain is held."
    },
    {
      id: "cloud-proof-chain",
      state: "ready-to-accept",
      requiredEvidence: [
        "Vercel install log",
        "Vercel build log",
        "served preview or production URL",
        "same route set as staged sitemap"
      ],
      currentRead: "Cloud proof can unlock the release sequence without local browser verification."
    },
    {
      id: "measurement-proof-chain",
      state: buildHeld ? "held-until-build-proof" : "ready-after-build-proof",
      requiredEvidence: [
        "watch route inspection",
        "blog route inspection",
        "Supabase second-action signal",
        "FireCuda promote/rewrite/hold decision"
      ],
      currentRead: "Measurement proof is prepared, but cannot claim ranking movement until build proof lands."
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut Build Proof Intake",
    status: buildHeld ? "build-proof-intake-ready-waiting-evidence" : "build-proof-intake-ready",
    purpose: "Define exactly how DigitalHut absorbs local or Vercel build evidence before SEO submission, Search Console inspection, and Supabase refinement advance.",
    guardrail: "This packet does not deploy, does not run browser verification, and does not change UI. It waits for evidence and routes it into the backend command system.",
    buildGate: buildToolingRecoveryPacket?.status || "unknown",
    runtimeCompatibility: deploymentRuntimeCompatibilityPacket?.status || "unknown",
    fallbackStatus: deploymentRuntimeFallbackPacket?.status || "unknown",
    releaseCommandCenter: releaseCommandCenterPacket?.status || "unknown",
    postDeployMeasurementProof: postDeployMeasurementProofPacket?.status || "unknown",
    evidenceTypes,
    acceptanceChecklist,
    intakeFlow,
    affectedPackets,
    nextAction: buildHeld
      ? "Keep staging backend SEO proof; accept dependency restore, local build, Vercel build, or Vercel runtime rejection evidence when it appears."
      : "Use accepted build proof to begin ordered watch/blog inspection and Supabase compare/refine measurement.",
    lastKnownMetrics
  }
}

function buildProofIntakeMarkdown(packet){
  return `# DigitalHut Build Proof Intake

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Build gate: ${packet.buildGate}

Runtime compatibility: ${packet.runtimeCompatibility}

Fallback status: ${packet.fallbackStatus}

Release command center: ${packet.releaseCommandCenter}

Post-deploy measurement proof: ${packet.postDeployMeasurementProof}

## Evidence Types

${packet.evidenceTypes.map((type) => `- **${type.id}** (${type.status}): accepts ${type.acceptedEvidence.join("; ")}. Routes to ${type.routesTo.join(", ")}. Result: ${type.promotedResult}`).join("\n")}

## Acceptance Checklist

${packet.acceptanceChecklist.map((item) => `- **${item.id}** (${item.state}): requires ${item.requiredEvidence.join(", ")}. Current read: ${item.currentRead}`).join("\n")}

## Intake Flow

${packet.intakeFlow.map((step) => `- **${step.order}. ${step.system}**: ${step.action} Output: ${step.output}`).join("\n")}

## Affected Packets

${packet.affectedPackets.map((item) => `- **${item.packet}** (${item.currentStatus}): ${item.updateWhenEvidenceArrives}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next action: ${packet.nextAction}
`
}

function buildDeployMeasurementActivationPacket({buildProofIntakePacket, postDeployMeasurementProofPacket, fireCudaDecisionQueueTemplatePacket, releasePairSubmissionPacket, supabaseRefinementViewsPacket} = {}){
  const buildHeld = buildProofIntakePacket?.status?.includes("waiting-evidence")
  const releaseTargets = postDeployMeasurementProofPacket?.releaseTargets || []
  const targetSignals = (target) => target?.measurementEvents || target?.events || target?.requiredSignals || ["page_view", "proof_route_open", "glb_preview_play", "podcast_interrupt_play", "search_intent_chip_select"]
  const watchTargets = releaseTargets.filter((target) => target.type === "watch-proof")
  const blogTargets = releaseTargets.filter((target) => target.type === "blog-proof")
  const firstWaveRoutes = [
    ...watchTargets.slice(0, 6).map((target, index) => ({
      order: index + 1,
      route: target.route,
      type: target.type,
      lane: target.launchLane,
      requiredSignals: targetSignals(target).filter((event) => event !== "blog_view").slice(0, 6),
      activation: buildHeld ? "held-for-build-proof" : "activate-watch-first"
    })),
    ...blogTargets.slice(0, 6).map((target, index) => ({
      order: watchTargets.slice(0, 6).length + index + 1,
      route: target.route,
      type: target.type,
      lane: target.launchLane,
      requiredSignals: targetSignals(target).slice(0, 6),
      activation: buildHeld ? "held-for-build-proof" : "activate-blog-support"
    }))
  ]
  const activationSignals = [
    {
      signal: "page_view",
      role: "baseline visibility",
      promoteUse: "Never promotes alone; it proves the route loaded and starts the comparison window."
    },
    {
      signal: "proof_route_open",
      role: "research intent",
      promoteUse: "Shows the visitor treated the page as a proof/research route rather than decorative content."
    },
    {
      signal: "glb_preview_play",
      role: "3D renderer value",
      promoteUse: "Raises priority for 3D experience, GLB source, and model-view keywords."
    },
    {
      signal: "podcast_interrupt_play",
      role: "source/audio value",
      promoteUse: "Raises priority for podcast-source, interview, and episode-context keywords."
    },
    {
      signal: "market_view_open",
      role: "market feed value",
      promoteUse: "Routes market-specific behavior into the market lane instead of the general video feed."
    },
    {
      signal: "search_intent_chip_select",
      role: "human keyword choice",
      promoteUse: "Turns FireCuda long-tail candidates into real chosen intent when users click the idea."
    },
    {
      signal: "search_run",
      role: "typed demand",
      promoteUse: "Promotes exact phrases typed by visitors into the master list and related proof pages."
    },
    {
      signal: "backlink_source_open",
      role: "authority proof",
      promoteUse: "Shows a visitor trusted the source/backlink layer enough to leave the main view."
    }
  ]
  const activationWindows = [
    {
      window: "0-15 minutes after stable build",
      job: "Confirm watch routes load and emit page/proof events.",
      decision: "Do not promote yet; only catch broken routes or missing event lanes."
    },
    {
      window: "15-60 minutes",
      job: "Compare watch routes against matching blog support routes.",
      decision: "Promote pairs only if page_view is joined by a second useful action."
    },
    {
      window: "1-6 hours",
      job: "Read Supabase route_refinement and keyword_refinement.",
      decision: "Send winners to FireCuda promote queue, quiet-but-loaded routes to rewrite, inactive routes to hold."
    },
    {
      window: "6-24 hours",
      job: "Compare route pair behavior against category lane and source/backlink behavior.",
      decision: "Expand only the lanes with measured proof, not the full 2.57M variation universe at once."
    }
  ]
  const decisionOutputs = [
    {
      output: "FireCuda promote",
      condition: "Route has page/proof visibility plus GLB, podcast, market, search, or backlink second action.",
      queueCount: fireCudaDecisionQueueTemplatePacket?.promotionQueueCount || 0
    },
    {
      output: "Metadata rewrite",
      condition: "Route loads or is crawled, but second useful action stays quiet.",
      queueCount: fireCudaDecisionQueueTemplatePacket?.rewriteQueueCount || 0
    },
    {
      output: "FireCuda hold",
      condition: "Route receives no measured activity after stable deploy and inspection window.",
      queueCount: fireCudaDecisionQueueTemplatePacket?.holdQueueCount || 0
    }
  ]
  return {
    generatedAt,
    mode: "DigitalHut Deploy Measurement Activation",
    status: buildHeld ? "measurement-activation-staged-build-held" : "measurement-activation-ready",
    purpose: "Convert accepted build proof into the first measured SEO/analytics cycle: watch routes, blog proof, Supabase reads, and FireCuda promote/rewrite/hold decisions.",
    guardrail: "This is not a deploy and not a traffic claim. It is the activation map that runs after build proof exists.",
    buildProofStatus: buildProofIntakePacket?.status || "unknown",
    measurementProofStatus: postDeployMeasurementProofPacket?.status || "unknown",
    releasePairSubmissionStatus: releasePairSubmissionPacket?.status || "unknown",
    supabaseRefinementStatus: supabaseRefinementViewsPacket?.status || "unknown",
    firstWaveRouteCount: firstWaveRoutes.length,
    firstWaveRoutes,
    activationSignals,
    activationWindows,
    decisionOutputs,
    activationRule: "After stable build proof, inspect watch routes first, pair each with its blog proof, wait for Supabase second-action evidence, then update FireCuda queues.",
    nextFireCudaMove: buildHeld
      ? "Stay staged until local or Vercel build proof lands; then begin first-wave watch/blog measurement."
      : "Activate first-wave watch/blog measurement and route every pair to promote, rewrite, or hold.",
    lastKnownMetrics
  }
}

function deployMeasurementActivationMarkdown(packet){
  return `# DigitalHut Deploy Measurement Activation

Generated: ${packet.generatedAt}

Status: ${packet.status}

Purpose: ${packet.purpose}

Guardrail: ${packet.guardrail}

Build proof: ${packet.buildProofStatus}

Measurement proof: ${packet.measurementProofStatus}

Release pair submission: ${packet.releasePairSubmissionStatus}

Supabase refinement: ${packet.supabaseRefinementStatus}

First-wave routes: ${packet.firstWaveRouteCount}

Activation rule: ${packet.activationRule}

## First-Wave Routes

${packet.firstWaveRoutes.map((route) => `- **${route.order}. ${route.route}** (${route.type}, ${route.activation}): lane ${route.lane}; required signals ${route.requiredSignals.join(", ")}`).join("\n")}

## Activation Signals

${packet.activationSignals.map((signal) => `- **${signal.signal}**: ${signal.role}. ${signal.promoteUse}`).join("\n")}

## Activation Windows

${packet.activationWindows.map((window) => `- **${window.window}**: ${window.job} Decision: ${window.decision}`).join("\n")}

## Decision Outputs

${packet.decisionOutputs.map((output) => `- **${output.output}** (${output.queueCount} queued templates): ${output.condition}`).join("\n")}

## Last Known Metrics

Page views: ${packet.lastKnownMetrics.pageViews}
Participating browser IDs: ${packet.lastKnownMetrics.uniqueVisitors}
Search interactions: ${packet.lastKnownMetrics.searchInteractions}
Autoplay starts: ${packet.lastKnownMetrics.autoplayStarts}
GLB preview plays: ${packet.lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${packet.lastKnownMetrics.podcastInterrupts}
Market opens: ${packet.lastKnownMetrics.marketOpens}
Blog views: ${packet.lastKnownMetrics.blogViews}

Source: ${packet.lastKnownMetrics.source}

Next FireCuda move: ${packet.nextFireCudaMove}
`
}

function buildSupabaseMeasurementContract({seoSubmissionQueue} = {}){
  const emittedEvents = new Set([
    "page_view",
    "blog_view",
    "glb_preview_play",
    "episode_preview_autoplay_start",
    "category_lane_select",
    "market_view_open",
    "search_run",
    "search_intent_chip_select",
    "autoplay_episode_shift",
    "timeline_scrub",
    "podcast_interrupt_play",
    "podcast_interrupt_end",
    "podcast_source_open",
    "ticker_search",
    "glb_replica_play",
    "autoplay_pause",
    "autoplay_start",
    "category_proof_open",
    "platform_cadence_read",
    "proof_route_open",
    "backlink_source_open",
    "wallet_connect_click",
    "tier_click",
    "node_click",
    "thumbnail_render_click"
  ])
  const apiReadEvents = new Set([
    "page_view",
    "blog_view",
    "search_run",
    "youtube_search_submit",
    "search_intent_chip_select",
    "quick_panel_select",
    "category_lane_select",
    "proof_route_open",
    "watch_route_open",
    "blog_route_open",
    "category_proof_open",
    "viral_watch_route_open",
    "viral_source_route_open",
    "backlink_source_open",
    "glb_source_click",
    "viral_source_backlink_open",
    "autoplay_start",
    "episode_preview_autoplay_start",
    "autoplay_pause",
    "autoplay_episode_shift",
    "podcast_interrupt_play",
    "podcast_interrupt_start",
    "podcast_interrupt_end",
    "podcast_source_open",
    "viral_podcast_source_start",
    "glb_preview_play",
    "glb_preview_open",
    "glb_replica_play",
    "viral_glb_proof_play",
    "timeline_scrub",
    "platform_cadence_read",
    "market_view_open",
    "market_panel_open",
    "ticker_search",
    "wallet_connect_click",
    "tier_click",
    "node_click",
    "thumbnail_render_click"
  ])
  const contractEvents = supabaseMeasurementEvents.map((event) => {
    const names = [event.canonicalEvent, ...event.aliases]
    const emitted = names.filter((name) => emittedEvents.has(name))
    const readable = names.filter((name) => apiReadEvents.has(name))
    return {
      ...event,
      emittedNames: emitted,
      apiReadNames: readable,
      coverageStatus: emitted.length && readable.length ? "closed-loop" : emitted.length ? "emitted-needs-reader" : readable.length ? "reader-needs-emitter" : "planned",
      seoSubmissionTie: seoSubmissionQueue?.batches?.flatMap((batch) => batch.routes).some((route) => event.seoDecision.toLowerCase().includes("proof") && /proof/.test(route.type))
        ? "attached-to-submission-queue"
        : "measurement-only"
    }
  })
  const statusCounts = contractEvents.reduce((counts, event) => {
    counts[event.coverageStatus] = (counts[event.coverageStatus] || 0) + 1
    return counts
  }, {})
  const actionableGapCount = contractEvents.filter((event) => !["closed-loop", "planned"].includes(event.coverageStatus)).length
  return {
    generatedAt,
    mode: "DigitalHut Supabase Measurement Contract",
    purpose: "Make every tracked human interaction readable by the SEO system, even when the product emits one name and the analytics reader uses a legacy alias.",
    table: "public.digitalhut_search_pixel_events",
    requiredColumns: ["event_name", "session_id", "visitor_id", "path", "search", "keyword_hint", "category", "asset_id", "blog_slug", "metadata", "created_at"],
    status: actionableGapCount ? "review" : statusCounts.planned ? "measurement-ready-with-staged-lanes" : "measurement-ready",
    statusCounts,
    eventCount: contractEvents.length,
    events: contractEvents,
    immediateGaps: contractEvents
      .filter((event) => !["closed-loop", "planned"].includes(event.coverageStatus))
      .map((event) => ({
        canonicalEvent: event.canonicalEvent,
        coverageStatus: event.coverageStatus,
        fix: event.coverageStatus === "emitted-needs-reader"
          ? "Add this emitted event to the insight-map summary reader."
          : event.coverageStatus === "reader-needs-emitter"
            ? "Emit this event from the visitor action that represents the feature."
            : "Keep staged until the feature is active."
      })),
    lastKnownMetrics
  }
}

function supabaseMeasurementContractMarkdown(contract){
  return `# DigitalHut Supabase Measurement Contract

Generated: ${contract.generatedAt}

Status: ${contract.status}

Table: ${contract.table}

Purpose: ${contract.purpose}

Event groups: ${contract.eventCount}

Status counts:
${Object.entries(contract.statusCounts).map(([status, count]) => `- ${status}: ${count}`).join("\n")}

## Event Contract

| Canonical Event | Aliases | Feature | Human Role | Coverage | SEO Decision |
| --- | --- | --- | --- | --- | --- |
${contract.events.map((event) => `| ${event.canonicalEvent} | ${event.aliases.join(", ")} | ${event.feature} | ${event.humanRole} | ${event.coverageStatus} | ${event.seoDecision} |`).join("\n")}

## Immediate Gaps

${contract.immediateGaps.length ? contract.immediateGaps.map((gap) => `- **${gap.canonicalEvent}** (${gap.coverageStatus}): ${gap.fix}`).join("\n") : "- None. Core measurement loop is closed."}

## Last Known Metrics

- Page views: ${contract.lastKnownMetrics.pageViews}
- Participating browser IDs: ${contract.lastKnownMetrics.uniqueVisitors}
- Search interactions: ${contract.lastKnownMetrics.searchInteractions}
- Autoplay starts: ${contract.lastKnownMetrics.autoplayStarts}
- GLB preview plays: ${contract.lastKnownMetrics.glbPreviewPlays}
- Podcast interrupts: ${contract.lastKnownMetrics.podcastInterrupts}
- Market opens: ${contract.lastKnownMetrics.marketOpens}
- Blog views: ${contract.lastKnownMetrics.blogViews}

Source: ${contract.lastKnownMetrics.source}
`
}

function buildRouteMetadataManifest({sitemap = ""} = {}){
  const posts = uniquePosts(seoRunnerProofPosts, seoBlogPosts)
  const routes = []
  const sitemapCategorySlugs = [...sitemap.matchAll(/<loc>https:\/\/www\.digitalhut\.app\/category\/([^<]+)<\/loc>/g)].map((match) => match[1])
  for(const post of posts){
    const slug = post.slug || post.id
    const blogMeta = seoMetadataForProof(post, "blog")
    const watchMeta = seoMetadataForProof(post, "watch")
    const categorySlug = routeSlug(post.category || "digitalhut")
    routes.push({
      route: `/blog/${slug}`,
      type: "blog-proof",
      canonical: `https://www.digitalhut.app/blog/${slug}`,
      title: blogMeta.title,
      description: blogMeta.description,
      keywords: blogMeta.keywords,
      launchLane: blogMeta.launchLane,
      demandClass: blogMeta.demandClass,
      proofAngle: blogMeta.proofAngle,
      relatedRoutes: [`/watch/${slug}`, `/category/${categorySlug}`]
    })
    routes.push({
      route: `/watch/${slug}`,
      type: "watch-proof",
      canonical: `https://www.digitalhut.app/watch/${slug}`,
      title: watchMeta.title,
      description: watchMeta.description,
      keywords: watchMeta.keywords,
      launchLane: watchMeta.launchLane,
      demandClass: watchMeta.demandClass,
      proofAngle: watchMeta.proofAngle,
      relatedRoutes: [`/blog/${slug}`, `/category/${categorySlug}`]
    })
  }
  const knownRoutes = new Set(routes.map((route) => route.route))
  for(const lane of seoSearchClaimLanes.filter((item) => item.countedRankSlots !== false)){
    const route = lane.proofRoute || `/watch/${lane.id}`
    if(!route.startsWith("/watch/") || knownRoutes.has(route)) continue
    const keywords = Array.from(new Set([
      lane.lane,
      lane.role,
      ...(lane.measurementSignals || []),
      ...(lane.backlinkTargets || []),
      `${lane.lane} 3D Model View`,
      `${lane.lane} video observatory`,
      `${lane.lane} podcast source moment`
    ].filter(Boolean)))
    routes.push({
      route,
      type: "watch-proof",
      canonical: `https://www.digitalhut.app${route}`,
      title: `${lane.lane} | DigitalHut Video, 3D And Podcast Observatory`,
      description: `${lane.role}. DigitalHut connects the video topic, 3D Model View, podcast/source moment, live analytics, and canonical source proof for ${lane.lane}.`,
      keywords,
      launchLane: lane.lane,
      demandClass: "universal long-tail proof lane",
      proofAngle: "full-system video, GLB, podcast/source, analytics, and backlink proof",
      relatedRoutes: [`/category/${lane.id}`, "/master-keyword-coverage", "/system-proof"]
    })
    knownRoutes.add(route)
  }
  const fallbackCategorySlugs = Array.from(new Set(posts.map((post) => routeSlug(post.category)).filter(Boolean)))
  const categorySlugs = sitemapCategorySlugs.length ? sitemapCategorySlugs : fallbackCategorySlugs
  for(const categorySlug of categorySlugs){
    const profile = categoryRouteProfiles[categorySlug]
    const category = profile?.name || posts.find((post) => routeSlug(post.category) === categorySlug)?.category || titleFromSlug(categorySlug)
    const launchTargets = seoLaunchTargetsForCategory(category)
    const categoryKeywords = launchTargets.flatMap((lane) => lane.targets)
    const profileKeywords = profile?.keywords || []
    const postKeywords = posts.filter((post) => routeSlug(post.category) === categorySlug).flatMap((post) => post.keywords || []).slice(0, 24)
    const keywords = Array.from(new Set([...categoryKeywords, ...profileKeywords, ...postKeywords])).filter(Boolean)
    routes.push({
      route: `/category/${categorySlug}`,
      type: "category-proof",
      canonical: `https://www.digitalhut.app/category/${categorySlug}`,
      title: keywords[0] ? `${keywords[0]} | DigitalHut Category Proof Lane` : `${category} Proof Lane | DigitalHut`,
      description: keywords.length
        ? `${category} DigitalHut launch lane for ${keywords.slice(0, 4).join(", ")} with video, GLB, podcast/source, watch, blog, category, and backlink proof.`
        : `${category} DigitalHut proof lane with GLB renderer proof, watch pages, backlinks, and long-tail SEO evidence.`,
      keywords,
      launchLane: category,
      demandClass: launchTargets.length || profileKeywords.length ? "launch category" : "long-tail category",
      proofAngle: "category route, watch proof, blog proof, GLB proof, source/backlink path, and Supabase behavior signals",
      relatedRoutes: posts.filter((post) => routeSlug(post.category) === categorySlug).slice(0, 8).map((post) => `/watch/${post.slug || post.id}`)
    })
  }
  return {
    generatedAt,
    mode: "DigitalHut Deploy Route Metadata Manifest",
    canonicalDomain: "https://www.digitalhut.app",
    routeCount: routes.length,
    blogProofRoutes: routes.filter((route) => route.type === "blog-proof").length,
    watchProofRoutes: routes.filter((route) => route.type === "watch-proof").length,
    categoryProofRoutes: routes.filter((route) => route.type === "category-proof").length,
    launchTargetRoutes: routes.filter((route) => route.keywords.some((keyword) => /near me|cheap flights|funny videos|product reviews|Uber|Wikipedia|Reddit/i.test(keyword))).length,
    routes
  }
}

function routeMetadataMarkdown(manifest){
  return `# DigitalHut Deploy Route Metadata Manifest

Generated: ${manifest.generatedAt}

Canonical domain: ${manifest.canonicalDomain}

Total routes: ${manifest.routeCount}

- Blog proof routes: ${manifest.blogProofRoutes}
- Watch proof routes: ${manifest.watchProofRoutes}
- Category proof routes: ${manifest.categoryProofRoutes}
- Launch-target routes: ${manifest.launchTargetRoutes}

## Launch Route Samples

${manifest.routes.filter((route) => route.keywords.some((keyword) => /near me|cheap flights|funny videos|product reviews|Uber|Wikipedia|Reddit/i.test(keyword))).slice(0, 18).map((route) => `- **${route.route}**: ${route.title}. Keywords: ${route.keywords.slice(0, 4).join("; ")}`).join("\n")}

## Metadata Rule

Every route is assigned to ${manifest.canonicalDomain} with:

- route type
- canonical URL
- title
- description
- keyword stack
- launch lane
- demand class
- proof angle
- related blog/watch/category routes
`
}

function buildRouteCoverageAudit({sitemap = "", routeMetadataManifest} = {}){
  const sitemapProofRoutes = [...sitemap.matchAll(/<loc>https:\/\/www\.digitalhut\.app([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((route) => /^\/(blog|watch|category)\//.test(route))
  const manifestRoutes = routeMetadataManifest.routes.map((route) => route.route)
  const manifestSet = new Set(manifestRoutes)
  const sitemapSet = new Set(sitemapProofRoutes)
  const missingMetadataRoutes = sitemapProofRoutes.filter((route) => !manifestSet.has(route))
  const extraMetadataRoutes = manifestRoutes.filter((route) => !sitemapSet.has(route))
  const duplicatedSitemapRoutes = sitemapProofRoutes.filter((route, index) => sitemapProofRoutes.indexOf(route) !== index)
  const duplicatedManifestRoutes = manifestRoutes.filter((route, index) => manifestRoutes.indexOf(route) !== index)
  const status = missingMetadataRoutes.length === 0 && extraMetadataRoutes.length === 0 && duplicatedSitemapRoutes.length === 0 && duplicatedManifestRoutes.length === 0 ? "pass" : "review"
  return {
    generatedAt,
    mode: "DigitalHut Route Coverage Audit",
    status,
    sitemapProofRoutes: sitemapProofRoutes.length,
    metadataRoutes: routeMetadataManifest.routeCount,
    missingMetadataRoutes,
    extraMetadataRoutes,
    duplicatedSitemapRoutes: Array.from(new Set(duplicatedSitemapRoutes)),
    duplicatedManifestRoutes: Array.from(new Set(duplicatedManifestRoutes)),
    launchTargetRoutes: routeMetadataManifest.launchTargetRoutes,
    read: status === "pass"
      ? "Every sitemap blog/watch/category proof route has a Digitalhut.app metadata manifest record, with no extras or duplicates."
      : "Route coverage needs review before the next deploy."
  }
}

function routeCoverageAuditMarkdown(audit){
  return `# DigitalHut Route Coverage Audit

Generated: ${audit.generatedAt}

Status: ${audit.status.toUpperCase()}

Read: ${audit.read}

| Area | Count |
| --- | ---: |
| Sitemap proof routes | ${audit.sitemapProofRoutes} |
| Metadata routes | ${audit.metadataRoutes} |
| Launch-target routes | ${audit.launchTargetRoutes} |
| Missing metadata routes | ${audit.missingMetadataRoutes.length} |
| Extra metadata routes | ${audit.extraMetadataRoutes.length} |
| Duplicate sitemap routes | ${audit.duplicatedSitemapRoutes.length} |
| Duplicate metadata routes | ${audit.duplicatedManifestRoutes.length} |

## Missing Metadata Routes

${audit.missingMetadataRoutes.length ? audit.missingMetadataRoutes.map((route) => `- ${route}`).join("\n") : "- None"}

## Extra Metadata Routes

${audit.extraMetadataRoutes.length ? audit.extraMetadataRoutes.map((route) => `- ${route}`).join("\n") : "- None"}

## Duplicate Routes

Sitemap:
${audit.duplicatedSitemapRoutes.length ? audit.duplicatedSitemapRoutes.map((route) => `- ${route}`).join("\n") : "- None"}

Metadata:
${audit.duplicatedManifestRoutes.length ? audit.duplicatedManifestRoutes.map((route) => `- ${route}`).join("\n") : "- None"}
`
}

function buildDeployReadinessAudit({product, seoProof, routeCoverageAudit, routeMetadataManifest, rankOwnershipIndex, rankSlotMaterializationSamples = null, aiDiscoveryPacket = null, robots = "", packageJson = "", vercelJson = "", npmrc = ""} = {}){
  let parsedPackage = {}
  let parsedVercel = {}
  try { parsedPackage = JSON.parse(packageJson) } catch {}
  try { parsedVercel = JSON.parse(vercelJson) } catch {}
  const scripts = parsedPackage.scripts || {}
  const dependencies = parsedPackage.dependencies || {}
  const devDependencies = parsedPackage.devDependencies || {}
  const productReady = Object.values(product).filter(Boolean).length
  const productTotal = Object.keys(product).length
  const supabaseRefinementViewsReady = existsSync(files.supabaseSeoRefinementMigration)
  const packageLockPresent = existsSync(files.packageLock)
  const vercelBuildCommand = parsedVercel.buildCommand || ""
  const metricGatedVercelBuild = /verify-metric-contract\.mjs/.test(vercelBuildCommand) && /vite build/.test(vercelBuildCommand)
  const cloudBuildConfigReady =
    /vite build/.test(scripts.build || "") &&
    !!(dependencies.vite || devDependencies.vite) &&
    packageLockPresent &&
    parsedVercel.framework === "vite" &&
    (parsedVercel.buildCommand === "npm run build" || metricGatedVercelBuild) &&
    /npm ci/.test(parsedVercel.installCommand || "") &&
    parsedVercel.outputDirectory === "dist" &&
    (/legacy-peer-deps\s*=\s*true/.test(npmrc) || /legacy-peer-deps/.test(parsedVercel.installCommand || ""))
  const checks = [
    {
      id: "product-markers",
      status: productReady === productTotal ? "pass" : "review",
      read: `${productReady}/${productTotal} product markers ready`
    },
    {
      id: "route-coverage",
      status: routeCoverageAudit.status === "pass" ? "pass" : "review",
      read: `${routeCoverageAudit.metadataRoutes}/${routeCoverageAudit.sitemapProofRoutes} proof routes have metadata`
    },
    {
      id: "rank-ownership",
      status: rankOwnershipIndex.totalIndividualRanks === 2572944 && rankOwnershipIndex.rankingOwner === "Digitalhut.app" ? "pass" : "review",
      read: `${rankOwnershipIndex.totalIndividualRanks.toLocaleString("en-US")} keyword slots assigned to ${rankOwnershipIndex.rankingOwner}`
    },
    {
      id: "sitemap-depth",
      status: seoProof.sitemapUrls >= 100 && seoProof.watchProofRoutes >= 50 && seoProof.blogRoutes >= 50 ? "pass" : "review",
      read: `${seoProof.sitemapUrls} sitemap URLs / ${seoProof.watchProofRoutes} watch / ${seoProof.blogRoutes} blog`
    },
    {
      id: "robots-sitemap",
      status: /Sitemap: https:\/\/www\.digitalhut\.app\/sitemap(?:-index)?\.xml/.test(robots) ? "pass" : "review",
      read: /Sitemap: https:\/\/www\.digitalhut\.app\/sitemap(?:-index)?\.xml/.test(robots) ? "robots.txt points to canonical sitemap surface" : "robots.txt needs sitemap pointer"
    },
    {
      id: "route-metadata-launch",
      status: routeMetadataManifest.launchTargetRoutes >= 30 ? "pass" : "review",
      read: `${routeMetadataManifest.launchTargetRoutes} launch-target metadata routes`
    },
    {
      id: "rank-slot-samples",
      status: rankSlotMaterializationSamples?.sampleCount >= 18 ? "pass" : "review",
      read: rankSlotMaterializationSamples
        ? `${rankSlotMaterializationSamples.sampleCount} rank-slot proof samples generated`
        : "rank-slot materialization samples need to be generated"
    },
    {
      id: "ai-search-discovery",
      status: aiDiscoveryPacket?.discoveryRoutes?.length >= 50 && aiDiscoveryPacket?.launchRoutes?.length >= 20 ? "pass" : "review",
      read: aiDiscoveryPacket
        ? `${aiDiscoveryPacket.discoveryRoutes.length} AI/search discovery routes / ${aiDiscoveryPacket.launchRoutes.length} launch samples`
        : "AI/search discovery packet needs to be generated"
    },
    {
      id: "supabase-refinement-views",
      status: supabaseRefinementViewsReady ? "pass" : "review",
      read: supabaseRefinementViewsReady
        ? "3 Supabase SEO refinement views staged for route, keyword, and event comparison"
        : "Supabase SEO refinement migration needs to be staged before measured compare/refine"
    },
    {
      id: "vercel-cloud-build-config",
      status: cloudBuildConfigReady ? "pass" : "review",
      read: cloudBuildConfigReady
        ? "Vercel cloud build config is staged for npm ci --legacy-peer-deps, Vite build, and dist output"
        : "Vercel/package build config needs review before using cloud build as proof"
    },
    {
      id: "local-build-tooling",
      status: existsSync(path.join(repoRoot, "node_modules", "vite", "bin", "vite.js")) ? "pass" : "hold",
      read: existsSync(path.join(repoRoot, "node_modules", "vite", "bin", "vite.js"))
        ? "local Vite build binary present"
        : "local node_modules/Vite build binary missing in this clean folder"
    }
  ]
  const holdChecks = checks.filter((check) => check.status === "hold")
  const reviewChecks = checks.filter((check) => check.status === "review")
  const status = holdChecks.length ? "hold-build-tooling" : reviewChecks.length ? "review" : "deploy-ready-staged"
  return {
    generatedAt,
    mode: "DigitalHut Deploy Readiness Audit",
    status,
    cloudBuildConfigReady,
    buildAuthority: status === "hold-build-tooling" && cloudBuildConfigReady ? "cloud-build-staged-local-proof-held" : status,
    read: status === "deploy-ready-staged"
      ? "SEO proof, route coverage, rank ownership, robots, and local build tooling are ready for a stable deploy batch."
      : status === "hold-build-tooling"
        ? cloudBuildConfigReady
          ? "SEO proof and Vercel cloud build config are staged, but local proof is missing because node_modules/Vite is absent in this clean folder."
          : "SEO proof is staged, but local build tooling is missing in this clean folder. Repair dependencies or build in the deployment environment before deploy."
        : "Deploy readiness has review items before release.",
    checks,
    nextAction: status === "hold-build-tooling"
      ? cloudBuildConfigReady
        ? "Use Vercel/cloud build as the next proof path when deployment is intentionally triggered, or restore local node_modules for a local proof pass."
        : "Use the current SEO artifacts as deploy-ready content, then repair/install local dependencies or rely on Vercel build dependencies before production deployment."
      : "Deploy only after a meaningful stable batch and final route/metadata check."
  }
}

function deployReadinessAuditMarkdown(audit){
  return `# DigitalHut Deploy Readiness Audit

Generated: ${audit.generatedAt}

Status: ${audit.status.toUpperCase()}

Build authority: ${audit.buildAuthority}

Cloud build config ready: ${audit.cloudBuildConfigReady ? "yes" : "no"}

Read: ${audit.read}

| Check | Status | Read |
| --- | --- | --- |
${audit.checks.map((check) => `| ${check.id} | ${check.status} | ${check.read} |`).join("\n")}

Next action: ${audit.nextAction}
`
}

function countDelta(current = 0, previous = 0){
  return Number(current || 0) - Number(previous || 0)
}

function buildCapabilityDelta({previousCapabilities = null, currentCapabilities}){
  const previousCounts = previousCapabilities?.capabilityCounts || {}
  const currentCounts = currentCapabilities.capabilityCounts || {}
  const previousAlerts = new Map((previousCapabilities?.readyAlerts?.alerts || []).map((item) => [item.id, item]))
  const currentAlerts = currentCapabilities.readyAlerts.alerts || []
  const alertDelta = currentAlerts.map((item) => {
    const previous = previousAlerts.get(item.id)
    return {
      id: item.id,
      lane: item.lane,
      currentLevel: item.level,
      previousLevel: previous?.level || "new",
      changed: !previous || previous.level !== item.level || previous.read !== item.read || previous.nextAction !== item.nextAction
    }
  })
  const changedAlerts = alertDelta.filter((item) => item.changed)
  const countChanges = {
    productReady: countDelta(currentCounts.productReady, previousCounts.productReady),
    sitemapUrls: countDelta(currentCounts.sitemapUrls, previousCounts.sitemapUrls),
    blogProofPosts: countDelta(currentCounts.blogProofPosts, previousCounts.blogProofPosts),
    watchProofRoutes: countDelta(currentCounts.watchProofRoutes, previousCounts.watchProofRoutes),
    categoryRoutes: countDelta(currentCounts.categoryRoutes, previousCounts.categoryRoutes),
    readyCapabilityAlerts: countDelta(currentCounts.readyCapabilityAlerts, previousCounts.readyCapabilityAlerts),
    systemCapabilityAlerts: countDelta(currentCounts.systemCapabilityAlerts, previousCounts.systemCapabilityAlerts),
    refinementActions: countDelta(currentCounts.refinementActions, previousCounts.refinementActions)
  }
  const movementScore = Object.values(countChanges).reduce((total, value) => total + Math.abs(value), 0) + changedAlerts.length
  const primaryMovement = changedAlerts[0]?.lane
    || Object.entries(countChanges).find(([, value]) => value !== 0)?.[0]
    || "steady-state"
  return {
    generatedAt,
    mode: "DigitalHut System Capability Compare Delta",
    frontendLock: currentCapabilities.frontendLock,
    baseline: previousCapabilities?.generatedAt || "first recorded capability packet in this workspace",
    current: currentCapabilities.generatedAt,
    movementScore,
    primaryMovement,
    countChanges,
    alertDelta,
    compareRead: movementScore === 0
      ? "System capability state is steady. Let behavior accumulate before changing the public interface."
      : `System capability state moved through ${primaryMovement}. Review changed alerts before the next FireCuda map adjustment.`,
    nextSystemMove: currentCapabilities.nextSystemMove
  }
}

function systemCapabilitiesMarkdown(capabilities){
  return `# DigitalHut System Rendered Capabilities

Generated: ${capabilities.generatedAt}

Frontend lock: ${capabilities.frontendLock}

Operating stack: ${capabilities.operatingStack.join(" > ")}

## Capability Counts

| Area | Count |
| --- | ---: |
| Product markers ready | ${capabilities.capabilityCounts.productReady}/${capabilities.capabilityCounts.productTotal} |
| System capability alerts | ${capabilities.capabilityCounts.readyCapabilityAlerts}/${capabilities.capabilityCounts.systemCapabilityAlerts} ready |
| Sitemap URLs | ${capabilities.capabilityCounts.sitemapUrls} |
| Blog proof posts | ${capabilities.capabilityCounts.blogProofPosts} |
| Watch proof routes | ${capabilities.capabilityCounts.watchProofRoutes} |
| Category routes | ${capabilities.capabilityCounts.categoryRoutes} |
| Compare actions | ${capabilities.capabilityCounts.refinementActions} |

## Ready Alerts

${capabilities.readyAlerts.alerts.map((item) => `- **${item.lane}** (${item.level.toUpperCase()}): ${item.read} Next: ${item.nextAction}`).join("\n")}

## Latest Viral Source Capability

${capabilities.latestViralSourcePacket
  ? `Topic: ${capabilities.latestViralSourcePacket.input?.topic || "not set"}

Keywords: ${(capabilities.latestViralSourcePacket.keywords || []).length}

Proof gates: ${(capabilities.latestViralSourcePacket.proofGates || []).map((item) => `${item.gate}=${item.status}`).join(", ")}

Frontend lock: ${capabilities.latestViralSourcePacket.frontendLock}`
  : "No viral source capability packet has been generated yet."}

## Claimable Niche

Claim: ${capabilities.buriedTreasureNicheMap.claim}

Status: ${capabilities.buriedTreasureNicheMap.status}

Content formula: ${capabilities.buriedTreasureNicheMap.contentFormula}

Clusters:

${capabilities.buriedTreasureNicheMap.longTailClusters.map((cluster) => `- **${cluster.lane}**: ${cluster.keywords.slice(0, 3).join("; ")}. Proof: ${cluster.proofSignal}.`).join("\n")}

Expansion gate: ${capabilities.buriedTreasureNicheMap.expansionGate}

Claimed category route: ${capabilities.claimLaneSummary.route}

Claimed proof pages:

${capabilities.claimLaneSummary.proofPages.map((slug) => `- ${slug}`).join("\n")}

## Mundane Off-Time Experience

Claim: ${capabilities.mundaneOffTimeExperienceMap.claim}

Status: ${capabilities.mundaneOffTimeExperienceMap.status}

Content formula: ${capabilities.mundaneOffTimeExperienceMap.contentFormula}

Clusters:

${capabilities.mundaneOffTimeExperienceMap.clusters.map((cluster) => `- **${cluster.lane}**: ${cluster.keywords.slice(0, 3).join("; ")}. Proof: ${cluster.proofSignal}.`).join("\n")}

Expansion gate: ${capabilities.mundaneOffTimeExperienceMap.expansionGate}

Next move: ${capabilities.mundaneOffTimeExperienceMap.nextMove}

## Codex Oversight Capabilities

Boundary: ${capabilities.codexOversightCapabilities.boundary}

Current read: ${capabilities.codexOversightCapabilities.currentOversightRead}

${capabilities.codexOversightCapabilities.capabilities.map((item) => `- **${item.lane}**: ${item.capability}`).join("\n")}

## Stack Reads

${capabilities.stackReads.map((item) => `- **${item.layer}**: ${item.read}`).join("\n")}

## Active Conditions

${capabilities.activeConditions.map((item) => `- **${item.lane}** (${item.severity}): ${item.reason} Next: ${item.nextMove}`).join("\n")}

## Last Known Metrics

- Page views: ${capabilities.lastKnownMetrics.pageViews}
- Participating browser IDs: ${capabilities.lastKnownMetrics.uniqueVisitors}
- Search interactions: ${capabilities.lastKnownMetrics.searchInteractions}
- Autoplay starts: ${capabilities.lastKnownMetrics.autoplayStarts}
- GLB preview plays: ${capabilities.lastKnownMetrics.glbPreviewPlays}
- Podcast interrupts: ${capabilities.lastKnownMetrics.podcastInterrupts}
- Market opens: ${capabilities.lastKnownMetrics.marketOpens}
- Blog views: ${capabilities.lastKnownMetrics.blogViews}

Source: ${capabilities.lastKnownMetrics.source}

## Next System Move

${capabilities.nextSystemMove}
`
}

function systemCapabilityDeltaMarkdown(delta){
  return `# DigitalHut System Capability Compare Delta

Generated: ${delta.generatedAt}

Baseline: ${delta.baseline}

Current: ${delta.current}

Frontend lock: ${delta.frontendLock}

Movement score: ${delta.movementScore}

Primary movement: ${delta.primaryMovement}

Compare read: ${delta.compareRead}

## Count Changes

${Object.entries(delta.countChanges).map(([key, value]) => `- **${key}**: ${value > 0 ? `+${value}` : value}`).join("\n")}

## Alert Movement

${delta.alertDelta.map((item) => `- **${item.lane}**: ${item.previousLevel} > ${item.currentLevel}${item.changed ? " changed" : " steady"}`).join("\n")}

## Next System Move

${delta.nextSystemMove}
`
}

async function readText(file){
  try {
    return await readFile(file, "utf8")
  } catch {
    return ""
  }
}

async function readJson(file, fallback = null){
  try {
    return JSON.parse(await readFile(file, "utf8"))
  } catch {
    return fallback
  }
}

function has(text, marker){
  return text.includes(marker)
}

function count(text, pattern){
  return (text.match(pattern) || []).length
}

function claimLanePostsFromSeo(seo){
  return seo
    .split(/\n\s*\{\n\s*rank:/)
    .slice(1)
    .map((block) => `rank:${block}`)
    .filter((block) => /category:\s*"What Am I Watching Observatory"/.test(block))
    .map((block) => block.match(/slug:\s*"([^"]+)"/)?.[1])
    .filter(Boolean)
}

function statusLabel(value){
  return value ? "ready" : "needs backend SEO refresh"
}

async function main(){
  await mkdir(docsDir, {recursive: true})
  await mkdir(publicDir, {recursive: true})

  lastKnownMetrics = await refreshProductionMetrics(lastKnownMetrics)

  const [observatory, css, seo, blogPage, watchPage, categoryPage, marketPage, sitemap, robots, vercelJson, npmrc, supabaseSeoRefinementMigration, packageJson, packageLock] = await Promise.all([
    readText(files.observatory),
    readText(files.css),
    readText(files.seo),
    readText(files.blogPage),
    readText(files.watchPage),
    readText(files.categoryPage),
    readText(files.marketPage),
    readText(files.sitemap),
    readText(files.robots),
    readText(files.vercelJson),
    readText(files.npmrc),
    readText(files.supabaseSeoRefinementMigration),
    readText(files.packageJson),
    readText(files.packageLock)
  ])
  const latestViralSourcePacket = await readJson(files.viralSourcePacket, null)
  const previousSystemCapabilities = await readJson(files.systemCapabilities, null)
  const metricFreshnessPacket = buildMetricFreshnessPacket(lastKnownMetrics)

  const product = {
    podcastClickSystem: has(observatory, "Podcast ready") && has(observatory, "podcastAudio.load?.()"),
    podcastRetrySourceReady: has(observatory, "fetchApplePodcastFallbackSeries") && has(observatory, "podcastFallbackTermsFor"),
    glbCollapseControl: has(observatory, "Close 3D View") && has(observatory, "dh-glb-play-footer-actions"),
    idlePausedGlbRemoved: has(observatory, "Timeout no longer opens a paused GLB") && has(observatory, "openIdleModelView()"),
    marketFeed: has(observatory, "Current Market") && has(observatory, "TradingView chart"),
    youtubeCategoryQueue: has(observatory, "category-locked YouTube episode queue") && has(observatory, "youtube-search"),
    contentAnalyzer: has(observatory, "google-speech-analyzer") && has(observatory, "contentAnalyzer"),
    marketMeasurementReady: has(marketPage, "trackMarketPixel") && has(marketPage, "market_view_open") && has(marketPage, "ticker_search") && has(marketPage, "dh-market-jsonld"),
    compactCategoryLock: has(css, "compact category lock") || has(css, "dh-episode-preview-dock"),
    liveProofRouteRail: has(observatory, "dh-episode-proof-rail") && has(observatory, "proof_route_open") && has(observatory, "category_proof_open"),
    platformCadenceRail: has(observatory, "dh-platform-cadence-rail") && has(observatory, "platform_cadence_read") && has(observatory, "cadenceSlot"),
    platformCadenceSeoProof: has(seo, "seoPlatformCadenceProof") && has(blogPage, "seoPlatformCadenceProof") && has(watchPage, "seoPlatformCadenceProof") && has(categoryPage, "seoPlatformCadenceProof") && has(sitemap, "platform-cadence-content-routing-system"),
    searchIntentRadar: has(observatory, "dh-search-intent-radar") && has(observatory, "search_intent_chip_select") && has(observatory, "searchIntentSuggestionsFor"),
    searchIntentSeoProof: has(seo, "seoSearchIntentRadarProof") && has(blogPage, "seoSearchIntentRadarProof") && has(watchPage, "seoSearchIntentRadarProof") && has(categoryPage, "seoSearchIntentRadarProof") && has(sitemap, "search-intent-radar-visual-experience"),
    usefulnessLaneProof: has(seo, "seoUsefulnessLaneMap") && has(seo, "seoUsefulnessLaneFor")
  }

  const seoProof = {
    blogProofPosts: count(seo, /watchPageRoute:/g),
    watchProofRoutes: count(sitemap, /\/watch\//g),
    blogRoutes: count(sitemap, /\/blog\//g),
    categoryRoutes: count(sitemap, /\/category\//g),
    sitemapUrls: count(sitemap, /<url>/g),
    claimLanePosts: claimLanePostsFromSeo(seo),
    systemDocs: [
      ["manual-system-cycle-002", "digitalhut-manual-runner-cycle-002.md"],
      ["tightened-publishing-stack-cycle-002", "digitalhut-tightened-publishing-stack-cycle-002.md"],
      ["ranked-blog-proof-system-cycle-002", "digitalhut-ranked-blog-proof-system-cycle-002.md"]
    ].map(([title, fileName]) => ({title, exists: existsSync(path.join(docsDir, fileName))}))
  }

  const resumeQueue = [
    {
      id: "deploy-ui-glb-podcast-standby",
      priority: "high",
      target: "production",
      status: "waiting-for-vercel-deploy",
      detail: "Deploy the podcast click system, visible GLB collapse controls, and idle paused-GLB removal after build/deploy tooling is available."
    },
    {
      id: "verify-podcast-live-source",
      priority: "high",
      target: "podcast",
      status: product.podcastClickSystem ? "code-ready" : "needs-code",
      detail: "Check that Apple podcast audio or fallback source opens from the Podcast Clip button without starting over the YouTube feed."
    },
    {
      id: "glb-api-render-proof",
      priority: "high",
      target: "3d-model-view",
      status: product.glbCollapseControl ? "code-ready" : "needs-code",
      detail: "Confirm Sketchfab/Cesium/backup GLB model appears in the 3D Model View and the close control is visible on desktop and mobile."
    },
    {
      id: "seo-master-cycle-003",
      priority: "medium",
      target: "FireCuda SEO",
      status: "ready-to-run",
      detail: "Use cycle-002 proof docs as the base for the next master list refinement, with blog proof, watch proof, and category lane injection."
    },
    {
      id: "viral-first-source-backend-packet",
      priority: "medium",
      target: "backend SEO analytics",
      status: "staged-no-ui-change",
      detail: "Prepare new viral video tracking through FireCuda keywords, Supabase event names, Google media checks, GLB proof, podcast/source moments, and compare/refine gates before any visible interface change."
    }
  ]
  const compareContrastRefinement = buildCompareContrastRefinement({metrics: lastKnownMetrics, proof: seoProof, product})
  const operatorPerspective = buildOperatorPerspective({metrics: lastKnownMetrics, proof: seoProof, product, refinement: compareContrastRefinement})
  const overseerCycle = buildOverseerCycle({metrics: lastKnownMetrics, proof: seoProof, product, refinement: compareContrastRefinement})
  const readyAlerts = buildReadyAlerts({metrics: lastKnownMetrics, proof: seoProof, product, refinement: compareContrastRefinement, viralPacket: latestViralSourcePacket})

  const status = {
    generatedAt,
    mode: "DigitalHut Backend SEO Standby System",
    limitation: "This is a backend-connected Babylon SEO content mover. It preserves SEO state, runs the professional system loop, and keeps pure SEO refinement moving before, during, and after live engineering cycles.",
    operatingStack,
    systemLoop,
    taskSplit,
    mundanePipeline,
    fireCudaKeywordMap,
    fireCudaOverseerMap,
    viralFirstSourceSystem,
    buriedTreasureNicheMap,
    codexOversightCapabilities,
    latestViralSourcePacket,
    supabaseAnalyticsCoverage,
    humanRoleDatabaseMap,
    cloudInfrastructureChecks,
    decentralizedDappChecks,
    digitalNomadSeoPerspective,
    packageScripts: packageJson.includes("seo:standby") ? "registered" : "script-not-registered",
    product: Object.fromEntries(Object.entries(product).map(([key, value]) => [key, statusLabel(value)])),
    seoProof,
    compareContrastRefinement,
    operatorPerspective,
    overseerCycle,
    readyAlerts,
    ventureBaselineAudit,
    lastKnownMetrics,
    metricFreshness: metricFreshnessPacket,
    resumeQueue
  }
  const systemCapabilities = buildSystemCapabilities({status, product, seoProof, readyAlerts, latestViralSourcePacket, overseerCycle, compareContrastRefinement})
  const systemCapabilityDelta = buildCapabilityDelta({previousCapabilities: previousSystemCapabilities, currentCapabilities: systemCapabilities})
  const seoMasterListPacket = buildSeoMasterListPacket({seoProof})
  const freshClusterDumpPacket = buildFreshClusterDumpPacket({seoMasterListPacket, metricFreshnessPacket})
  status.freshClusterDump = freshClusterDumpPacket
  const routeMetadataManifest = buildRouteMetadataManifest({sitemap})
  const routeCoverageAudit = buildRouteCoverageAudit({sitemap, routeMetadataManifest})
  const rankSlotMaterializationSamples = buildRankSlotMaterializationSamples(seoMasterListPacket.individualRankingIndex)
  const preliminaryDeployReadinessAudit = buildDeployReadinessAudit({
    product,
    seoProof,
    routeCoverageAudit,
    routeMetadataManifest,
    rankOwnershipIndex: seoMasterListPacket.individualRankingIndex,
    rankSlotMaterializationSamples,
    robots,
    packageJson,
    vercelJson,
    npmrc
  })
  const aiDiscoveryPacket = buildAiDiscoveryPacket({
    status,
    seoMasterListPacket,
    routeMetadataManifest,
    routeCoverageAudit,
    deployReadinessAudit: preliminaryDeployReadinessAudit,
    systemCapabilities
  })
  const deployReadinessAudit = buildDeployReadinessAudit({
    product,
    seoProof,
    routeCoverageAudit,
    routeMetadataManifest,
    rankOwnershipIndex: seoMasterListPacket.individualRankingIndex,
    rankSlotMaterializationSamples,
    aiDiscoveryPacket,
    robots,
    packageJson,
    vercelJson,
    npmrc
  })
  const websiteLanguageImpactPacket = buildWebsiteLanguageImpactPacket({
    seoMasterListPacket,
    freshClusterDumpPacket,
    metricFreshnessPacket,
    deployReadinessAudit
  })
  status.websiteLanguageImpact = websiteLanguageImpactPacket
  const rankFindingBenchmarkPacket = buildRankFindingBenchmarkPacket({
    seoMasterListPacket,
    freshClusterDumpPacket,
    metricFreshnessPacket,
    websiteLanguageImpactPacket
  })
  status.rankFindingBenchmark = rankFindingBenchmarkPacket
  const rankJumpAlgorithmPacket = buildRankJumpAlgorithmPacket({
    rankFindingBenchmarkPacket,
    metricFreshnessPacket,
    freshClusterDumpPacket
  })
  status.rankJumpAlgorithm = rankJumpAlgorithmPacket
  const whiteboardSeoStructurePacket = buildWhiteboardSeoStructurePacket({
    rankJumpAlgorithmPacket,
    metricFreshnessPacket,
    freshClusterDumpPacket,
    rankFindingBenchmarkPacket
  })
  status.whiteboardSeoStructure = whiteboardSeoStructurePacket
  const functionalRankBoostClusterPushPacket = buildFunctionalRankBoostClusterPushPacket({
    metrics: lastKnownMetrics,
    rankJumpAlgorithmPacket,
    whiteboardSeoStructurePacket,
    rankFindingBenchmarkPacket
  })
  status.functionalRankBoostClusterPush = functionalRankBoostClusterPushPacket
  const longtailCompetitionNeighborhoodPacket = buildLongtailCompetitionNeighborhoodPacket({
    functionalRankBoostClusterPushPacket,
    rankFindingBenchmarkPacket,
    metricFreshnessPacket
  })
  status.longtailCompetitionNeighborhood = longtailCompetitionNeighborhoodPacket
  const movementProofAudienceOriginPacket = buildMovementProofAudienceOriginPacket({
    metrics: lastKnownMetrics,
    functionalRankBoostClusterPushPacket,
    longtailCompetitionNeighborhoodPacket,
    metricFreshnessPacket,
    rankFindingBenchmarkPacket
  })
  status.movementProofAudienceOrigin = movementProofAudienceOriginPacket
  const competitionFrameworkMetricPushPacket = buildCompetitionFrameworkMetricPushPacket({
    metrics: lastKnownMetrics,
    movementProofAudienceOriginPacket,
    longtailCompetitionNeighborhoodPacket,
    rankFindingBenchmarkPacket
  })
  status.competitionFrameworkMetricPush = competitionFrameworkMetricPushPacket
  const experienceCycleNicheOwnershipPacket = buildExperienceCycleNicheOwnershipPacket({
    metrics: lastKnownMetrics,
    competitionFrameworkMetricPushPacket,
    movementProofAudienceOriginPacket
  })
  status.experienceCycleNicheOwnership = experienceCycleNicheOwnershipPacket
  const fireCudaInnovationMappingLayerPacket = buildFireCudaInnovationMappingLayerPacket({
    metrics: lastKnownMetrics,
    seoMasterListPacket,
    routeMetadataManifest,
    competitionFrameworkMetricPushPacket,
    experienceCycleNicheOwnershipPacket,
    movementProofAudienceOriginPacket
  })
  status.fireCudaInnovationMappingLayer = fireCudaInnovationMappingLayerPacket
  const nicheFunctionalityLadderMatchPacket = buildNicheFunctionalityLadderMatchPacket({
    metrics: lastKnownMetrics,
    competitionFrameworkMetricPushPacket,
    experienceCycleNicheOwnershipPacket,
    fireCudaInnovationMappingLayerPacket,
    rankFindingBenchmarkPacket
  })
  status.nicheFunctionalityLadderMatch = nicheFunctionalityLadderMatchPacket
  const ladderReceiptAccelerationPacket = buildLadderReceiptAccelerationPacket({
    metrics: lastKnownMetrics,
    nicheFunctionalityLadderMatchPacket,
    fireCudaInnovationMappingLayerPacket
  })
  status.ladderReceiptAcceleration = ladderReceiptAccelerationPacket
  const seoSubmissionQueue = buildSeoSubmissionQueue({
    aiDiscoveryPacket,
    seoMasterListPacket,
    routeMetadataManifest,
    routeCoverageAudit,
    deployReadinessAudit
  })
  const supabaseMeasurementContract = buildSupabaseMeasurementContract({seoSubmissionQueue})
  const searchIntentPromotionPacket = buildSearchIntentPromotionPacket({
    seoMasterListPacket,
    seoSubmissionQueue,
    routeMetadataManifest,
    supabaseMeasurementContract
  })
  const marketPromotionPacket = buildMarketPromotionPacket({
    routeMetadataManifest,
    supabaseMeasurementContract,
    searchIntentPromotionPacket
  })
  const podcastPromotionPacket = buildPodcastPromotionPacket({
    routeMetadataManifest,
    supabaseMeasurementContract,
    searchIntentPromotionPacket,
    marketPromotionPacket
  })
  const glbPromotionPacket = buildGlbPromotionPacket({
    routeMetadataManifest,
    supabaseMeasurementContract,
    searchIntentPromotionPacket,
    marketPromotionPacket,
    podcastPromotionPacket
  })
  const unifiedProofRoutePromotionBoard = buildUnifiedProofRoutePromotionBoard({
    routeMetadataManifest,
    seoSubmissionQueue,
    searchIntentPromotionPacket,
    marketPromotionPacket,
    podcastPromotionPacket,
    glbPromotionPacket
  })
  const deployProofBatchPacket = buildDeployProofBatchPacket({
    unifiedProofRoutePromotionBoard,
    deployReadinessAudit,
    routeCoverageAudit,
    seoSubmissionQueue
  })
  const buildToolingRecoveryPacket = buildBuildToolingRecoveryPacket({
    packageJson,
    vercelJson,
    npmrc,
    deployReadinessAudit,
    deployProofBatchPacket
  })
  const aiCrawlerGuidancePacket = buildAiCrawlerGuidancePacket({
    aiDiscoveryPacket,
    unifiedProofRoutePromotionBoard,
    deployProofBatchPacket,
    buildToolingRecoveryPacket
  })
  const structuredDataCatalog = buildStructuredDataCatalog({
    aiCrawlerGuidancePacket,
    unifiedProofRoutePromotionBoard,
    deployProofBatchPacket
  })
  const backlinkAuthorityPacket = buildBacklinkAuthorityPacket({
    deployProofBatchPacket,
    unifiedProofRoutePromotionBoard,
    structuredDataCatalog
  })
  const supabaseRefinementViewsPacket = buildSupabaseRefinementViewsPacket({
    supabaseMeasurementContract,
    backlinkAuthorityPacket,
    deployProofBatchPacket,
    migrationSql: supabaseSeoRefinementMigration
  })
  let postDeployCompareHandoffPacket = buildPostDeployCompareHandoffPacket({
    deployProofBatchPacket,
    supabaseRefinementViewsPacket,
    aiCrawlerGuidancePacket,
    structuredDataCatalog,
    backlinkAuthorityPacket
  })
  const quietSignalActivationPacket = buildQuietSignalActivationPacket({
    searchIntentPromotionPacket,
    marketPromotionPacket,
    postDeployCompareHandoffPacket,
    supabaseRefinementViewsPacket
  })
  const rankedBlogWatchBridgePacket = buildRankedBlogWatchBridgePacket({
    routeMetadataManifest,
    deployProofBatchPacket,
    unifiedProofRoutePromotionBoard,
    quietSignalActivationPacket,
    backlinkAuthorityPacket
  })
  const releasePairSubmissionPacket = buildReleasePairSubmissionPacket({
    rankedBlogWatchBridgePacket,
    seoSubmissionQueue,
    deployReadinessAudit,
    routeCoverageAudit,
    aiCrawlerGuidancePacket
  })
  const releasePairSubmissionDeltaPacket = buildReleasePairSubmissionDeltaPacket({
    releasePairSubmissionPacket,
    deployReadinessAudit,
    supabaseRefinementViewsPacket
  })
  const deltaCompareRefinementPacket = buildDeltaCompareRefinementPacket({
    releasePairSubmissionDeltaPacket,
    supabaseRefinementViewsPacket,
    compareContrastRefinement
  })
  postDeployCompareHandoffPacket = buildPostDeployCompareHandoffPacket({
    deployProofBatchPacket,
    supabaseRefinementViewsPacket,
    aiCrawlerGuidancePacket,
    structuredDataCatalog,
    backlinkAuthorityPacket,
    deltaCompareRefinementPacket
  })
  const postDeployMeasurementProofPacket = buildPostDeployMeasurementProofPacket({
    buildToolingRecoveryPacket,
    postDeployCompareHandoffPacket,
    supabaseMeasurementContract,
    deltaCompareRefinementPacket,
    releasePairSubmissionPacket
  })
  const fireCudaDecisionQueueTemplatePacket = buildFireCudaDecisionQueueTemplatePacket({
    postDeployMeasurementProofPacket,
    rankedBlogWatchBridgePacket,
    deltaCompareRefinementPacket
  })
  const releaseCommandCenterPacket = buildReleaseCommandCenterPacket({
    buildToolingRecoveryPacket,
    postDeployCompareHandoffPacket,
    postDeployMeasurementProofPacket,
    fireCudaDecisionQueueTemplatePacket,
    releasePairSubmissionPacket
  })
  const deploymentRuntimeCompatibilityPacket = buildDeploymentRuntimeCompatibilityPacket({
    packageJson,
    packageLock,
    vercelJson,
    buildToolingRecoveryPacket,
    releaseCommandCenterPacket
  })
  const deploymentRuntimeFallbackPacket = buildDeploymentRuntimeFallbackPacket({
    deploymentRuntimeCompatibilityPacket,
    releaseCommandCenterPacket
  })
  const buildProofIntakePacket = buildBuildProofIntakePacket({
    buildToolingRecoveryPacket,
    deploymentRuntimeCompatibilityPacket,
    deploymentRuntimeFallbackPacket,
    releaseCommandCenterPacket,
    postDeployMeasurementProofPacket
  })
  const deployMeasurementActivationPacket = buildDeployMeasurementActivationPacket({
    buildProofIntakePacket,
    postDeployMeasurementProofPacket,
    fireCudaDecisionQueueTemplatePacket,
    releasePairSubmissionPacket,
    supabaseRefinementViewsPacket
  })
  const routePairEvidenceLedgerPacket = buildRoutePairEvidenceLedgerPacket({
    rankedBlogWatchBridgePacket,
    deployMeasurementActivationPacket,
    supabaseMeasurementContract,
    postDeployMeasurementProofPacket
  })
  const firstWaveActionQueuePacket = buildFirstWaveActionQueuePacket({
    routePairEvidenceLedgerPacket,
    deployMeasurementActivationPacket,
    postDeployMeasurementProofPacket
  })
  const fireCudaPromotionReceiptPacket = buildFireCudaPromotionReceiptPacket({
    firstWaveActionQueuePacket,
    fireCudaDecisionQueueTemplatePacket,
    routePairEvidenceLedgerPacket
  })
  const masterListExpansionGatePacket = buildMasterListExpansionGatePacket({
    seoMasterListPacket,
    fireCudaPromotionReceiptPacket
  })
  const clientRankMovementSnapshotPacket = buildClientRankMovementSnapshotPacket({
    metrics: lastKnownMetrics,
    backlinkAuthorityPacket,
    masterListExpansionGatePacket,
    ladderReceiptAccelerationPacket,
    routePairEvidenceLedgerPacket,
    movementProofAudienceOriginPacket
  })
  const separateLaneUniverseStarterPacket = buildSeparateLaneUniverseStarterPacket({
    masterListExpansionGatePacket
  })
  const separateLaneReceiptBridgePacket = buildSeparateLaneReceiptBridgePacket({
    separateLaneUniverseStarterPacket,
    fireCudaPromotionReceiptPacket
  })
  const receiptEvidenceIntakeSchemaPacket = buildReceiptEvidenceIntakeSchemaPacket({
    fireCudaPromotionReceiptPacket,
    supabaseRefinementViewsPacket,
    separateLaneReceiptBridgePacket,
    buildToolingRecoveryPacket,
    deployReadinessAudit
  })
  const fullSystemLadderPushPacket = buildFullSystemLadderPushPacket({
    metrics: lastKnownMetrics,
    clientRankMovementSnapshotPacket,
    ladderReceiptAccelerationPacket,
    fireCudaInnovationMappingLayerPacket,
    supabaseMeasurementContract,
    deployReadinessAudit,
    deploymentRuntimeCompatibilityPacket,
    receiptEvidenceIntakeSchemaPacket,
    backlinkAuthorityPacket
  })
  const systemClaimVerificationPacket = buildSystemClaimVerificationPacket({
    packageJson,
    vercelJson,
    deploymentRuntimeCompatibilityPacket,
    supabaseMeasurementContract,
    fullSystemLadderPushPacket
  })
  const googleSearchConsoleRankVerificationPacket = buildGoogleSearchConsoleRankVerificationPacket({
    seoProof,
    routeCoverageAudit,
    seoSubmissionQueue,
    clientRankMovementSnapshotPacket,
    fullSystemLadderPushPacket,
    systemClaimVerificationPacket,
    deployReadinessAudit
  })
  status.supabaseMeasurementContract = supabaseMeasurementContract
  status.searchIntentPromotionSummary = {
    status: searchIntentPromotionPacket.status,
    currentRead: searchIntentPromotionPacket.currentRead,
    guardrail: searchIntentPromotionPacket.guardrail,
    priorityCandidateCount: searchIntentPromotionPacket.priorityIntentCandidates.length,
    sourceBridgeCount: searchIntentPromotionPacket.sourceBacklinkBridge.length,
    eventCoverage: `${searchIntentPromotionPacket.eventReadiness.filter((event) => event.status === "covered").length}/${searchIntentPromotionPacket.eventReadiness.length}`,
    promotionCounts: searchIntentPromotionPacket.promotionCounts,
    topCandidates: searchIntentPromotionPacket.priorityIntentCandidates.slice(0, 6).map((candidate) => ({
      keyword: candidate.keyword,
      lane: candidate.lane,
      routeTarget: candidate.routeTarget,
      promotionStage: candidate.promotionStage,
      missingSignals: candidate.missingSignals.slice(0, 4)
    })),
    stagedProofRoutes: searchIntentPromotionPacket.stagedProofRoutes.slice(0, 6).map((route) => ({
      route: route.route,
      lane: route.lane,
      type: route.type,
      topKeywords: route.topKeywords.slice(0, 4)
    })),
    nextFireCudaMove: searchIntentPromotionPacket.nextFireCudaMove
  }
  status.marketPromotionSummary = {
    status: marketPromotionPacket.status,
    currentRead: marketPromotionPacket.currentRead,
    guardrail: marketPromotionPacket.guardrail,
    marketLaneCount: marketPromotionPacket.marketLaneCount,
    eventCoverage: `${marketPromotionPacket.eventReadiness.filter((event) => event.status === "covered").length}/${marketPromotionPacket.eventReadiness.length}`,
    routeProof: marketPromotionPacket.routeProof,
    topMarketLanes: marketPromotionPacket.marketLanes.slice(0, 5).map((lane) => ({
      symbol: lane.symbol,
      company: lane.company,
      lane: lane.lane,
      status: lane.status,
      routeTarget: lane.routeTarget,
      videoSearch: lane.videoSearch,
      glbSearch: lane.glbSearch,
      podcastSearch: lane.podcastSearch
    })),
    regularFeedBridge: marketPromotionPacket.regularFeedBridge,
    nextFireCudaMove: marketPromotionPacket.nextFireCudaMove
  }
  status.podcastPromotionSummary = {
    status: podcastPromotionPacket.status,
    currentRead: podcastPromotionPacket.currentRead,
    guardrail: podcastPromotionPacket.guardrail,
    routeCount: podcastPromotionPacket.routeCount,
    eventCoverage: `${podcastPromotionPacket.eventReadiness.filter((event) => event.status === "covered").length}/${podcastPromotionPacket.eventReadiness.length}`,
    podcastLanes: podcastPromotionPacket.podcastLanes.map((lane) => ({
      id: lane.id,
      title: lane.title,
      status: lane.status,
      proofRoute: lane.proofRoute,
      queries: lane.queries.slice(0, 3)
    })),
    searchBridgeCount: podcastPromotionPacket.searchBridge.length,
    marketBridgeCount: podcastPromotionPacket.marketBridge.length,
    nextFireCudaMove: podcastPromotionPacket.nextFireCudaMove
  }
  status.glbPromotionSummary = {
    status: glbPromotionPacket.status,
    currentRead: glbPromotionPacket.currentRead,
    guardrail: glbPromotionPacket.guardrail,
    routeCount: glbPromotionPacket.routeCount,
    eventCoverage: `${glbPromotionPacket.eventReadiness.filter((event) => event.status === "covered").length}/${glbPromotionPacket.eventReadiness.length}`,
    localModelFamilies: glbPromotionPacket.localModelFamilies,
    glbLanes: glbPromotionPacket.glbLanes.map((lane) => ({
      id: lane.id,
      title: lane.title,
      status: lane.status,
      routeTarget: lane.routeTarget,
      keywords: lane.keywords.slice(0, 3)
    })),
    searchBridgeCount: glbPromotionPacket.searchBridge.length,
    marketBridgeCount: glbPromotionPacket.marketBridge.length,
    podcastBridgeCount: glbPromotionPacket.podcastBridge.length,
    nextFireCudaMove: glbPromotionPacket.nextFireCudaMove
  }
  status.unifiedProofRoutePromotionSummary = {
    status: unifiedProofRoutePromotionBoard.status,
    currentRead: unifiedProofRoutePromotionBoard.currentRead,
    guardrail: unifiedProofRoutePromotionBoard.guardrail,
    routeCount: unifiedProofRoutePromotionBoard.routeCount,
    stageCounts: unifiedProofRoutePromotionBoard.stageCounts,
    byType: unifiedProofRoutePromotionBoard.byType,
    topRoutes: unifiedProofRoutePromotionBoard.topRoutes.slice(0, 8).map((route) => ({
      route: route.route,
      title: route.title,
      score: route.score,
      promotionStage: route.promotionStage,
      packets: route.packets,
      keywords: route.keywords.slice(0, 5)
    })),
    deployCandidateRoutes: unifiedProofRoutePromotionBoard.deployCandidateRoutes.map((route) => route.route),
    watchPairCandidates: unifiedProofRoutePromotionBoard.watchPairCandidates.slice(0, 10).map((route) => route.route),
    nextFireCudaMove: unifiedProofRoutePromotionBoard.nextFireCudaMove
  }
  status.deployProofBatchSummary = {
    status: deployProofBatchPacket.status,
    currentRead: deployProofBatchPacket.currentRead,
    guardrail: deployProofBatchPacket.guardrail,
    buildGate: deployProofBatchPacket.buildGate,
    releaseRouteCount: deployProofBatchPacket.releaseRouteCount,
    pushNextCount: deployProofBatchPacket.pushNextCount,
    watchPairCount: deployProofBatchPacket.watchPairCount,
    releaseRoutes: deployProofBatchPacket.releaseRoutes.slice(0, 8).map((route) => ({
      route: route.route,
      title: route.title,
      score: route.score,
      promotionStage: route.promotionStage,
      keywords: route.keywords.slice(0, 5)
    })),
    searchConsoleQueue: deployProofBatchPacket.searchConsoleQueue.slice(0, 8),
    nextFireCudaMove: deployProofBatchPacket.nextFireCudaMove
  }
  status.buildToolingRecoverySummary = {
    status: buildToolingRecoveryPacket.status,
    currentRead: buildToolingRecoveryPacket.currentRead,
    guardrail: buildToolingRecoveryPacket.guardrail,
    nodeEngine: buildToolingRecoveryPacket.nodeEngine,
    vercelFramework: buildToolingRecoveryPacket.vercelFramework,
    localVitePresent: buildToolingRecoveryPacket.localVitePresent,
    bundledNpmNoptPresent: buildToolingRecoveryPacket.bundledNpmNoptPresent,
    packageLockPresent: buildToolingRecoveryPacket.packageLockPresent,
    checks: buildToolingRecoveryPacket.checks,
    releaseGateMatrix: buildToolingRecoveryPacket.releaseGateMatrix,
    releaseDecision: buildToolingRecoveryPacket.releaseDecision,
    recoveryActions: buildToolingRecoveryPacket.recoveryActions,
    nextFireCudaMove: buildToolingRecoveryPacket.nextFireCudaMove
  }
  status.aiCrawlerGuidanceSummary = {
    status: aiCrawlerGuidancePacket.status,
    productName: aiCrawlerGuidancePacket.productName,
    read: aiCrawlerGuidancePacket.oneLineRead,
    crawlTargets: aiCrawlerGuidancePacket.crawlTargets,
    topProofRouteCount: aiCrawlerGuidancePacket.topProofRoutes.length,
    releaseRouteCount: aiCrawlerGuidancePacket.releaseRoutes.length,
    buildGate: aiCrawlerGuidancePacket.buildGate,
    deployGate: aiCrawlerGuidancePacket.deployGate,
    safeUse: aiCrawlerGuidancePacket.safeUse
  }
  status.structuredDataCatalogSummary = {
    status: structuredDataCatalog.status,
    purpose: structuredDataCatalog.purpose,
    guardrail: structuredDataCatalog.guardrail,
    schemaCount: structuredDataCatalog.schemaCount,
    topProofRouteCount: structuredDataCatalog.topProofRouteCount,
    releaseRouteCount: structuredDataCatalog.releaseRouteCount,
    routeBoardStatus: structuredDataCatalog.routeBoardStatus,
    buildGate: structuredDataCatalog.buildGate,
    deployGate: structuredDataCatalog.deployGate
  }
  status.backlinkAuthoritySummary = {
    status: backlinkAuthorityPacket.status,
    purpose: backlinkAuthorityPacket.purpose,
    guardrail: backlinkAuthorityPacket.guardrail,
    releaseRouteCount: backlinkAuthorityPacket.releaseRouteCount,
    priorityRouteCount: backlinkAuthorityPacket.priorityRouteCount,
    supportRouteCount: backlinkAuthorityPacket.supportRouteCount,
    categoryCounts: backlinkAuthorityPacket.categoryCounts,
    topAuthorityPlans: backlinkAuthorityPacket.routeAuthorityPlans.slice(0, 5).map((plan) => ({
      route: plan.route,
      status: plan.status,
      authorityCategories: plan.authorityCategories.slice(0, 4),
      backlinkAnchors: plan.backlinkAnchors.slice(0, 4),
      internalSupportRoutes: plan.internalSupportRoutes
    })),
    measurementEvents: backlinkAuthorityPacket.measurementEvents,
    nextFireCudaMove: backlinkAuthorityPacket.nextFireCudaMove
  }
  status.supabaseRefinementViewsSummary = {
    status: supabaseRefinementViewsPacket.status,
    purpose: supabaseRefinementViewsPacket.purpose,
    guardrail: supabaseRefinementViewsPacket.guardrail,
    migration: supabaseRefinementViewsPacket.migration,
    table: supabaseRefinementViewsPacket.table,
    viewCount: supabaseRefinementViewsPacket.viewCount,
    views: supabaseRefinementViewsPacket.views.map((view) => ({
      name: view.name,
      purpose: view.purpose,
      feeds: view.feeds
    })),
    compareCycle: supabaseRefinementViewsPacket.compareCycle,
    nextFireCudaMove: supabaseRefinementViewsPacket.nextFireCudaMove
  }
  status.postDeployCompareHandoffSummary = {
    status: postDeployCompareHandoffPacket.status,
    purpose: postDeployCompareHandoffPacket.purpose,
    guardrail: postDeployCompareHandoffPacket.guardrail,
    releaseRouteCount: postDeployCompareHandoffPacket.releaseRouteCount,
    deltaDecisionStatus: postDeployCompareHandoffPacket.deltaDecisionStatus,
    deltaPairDecisionCount: postDeployCompareHandoffPacket.deltaPairDecisionCount,
    deltaPairDecisions: postDeployCompareHandoffPacket.deltaPairDecisions,
    systemPushOrder: postDeployCompareHandoffPacket.systemPushOrder,
    firstCompareQuestions: postDeployCompareHandoffPacket.firstCompareQuestions,
    topReleaseRoutes: postDeployCompareHandoffPacket.releaseRoutes.slice(0, 5).map((route) => ({
      route: route.route,
      launchLane: route.launchLane,
      promotionStage: route.promotionStage,
      measurementEvents: route.measurementEvents
    })),
    nextFireCudaMove: postDeployCompareHandoffPacket.nextFireCudaMove
  }
  status.quietSignalActivationSummary = {
    status: quietSignalActivationPacket.status,
    purpose: quietSignalActivationPacket.purpose,
    guardrail: quietSignalActivationPacket.guardrail,
    quietSignals: quietSignalActivationPacket.quietSignals,
    activationRouteCount: quietSignalActivationPacket.activationRouteCount,
    topActivationRoutes: quietSignalActivationPacket.prioritizedRoutes.slice(0, 8).map((route) => ({
      type: route.type,
      label: route.label,
      route: route.route,
      currentStage: route.currentStage,
      releaseStage: route.releaseStage,
      watchEvents: route.watchEvents
    })),
    activationRules: quietSignalActivationPacket.activationRules,
    nextFireCudaMove: quietSignalActivationPacket.nextFireCudaMove
  }
  status.rankedBlogWatchBridgeSummary = {
    status: rankedBlogWatchBridgePacket.status,
    purpose: rankedBlogWatchBridgePacket.purpose,
    guardrail: rankedBlogWatchBridgePacket.guardrail,
    blogRoutes: rankedBlogWatchBridgePacket.blogRoutes,
    watchRoutes: rankedBlogWatchBridgePacket.watchRoutes,
    pairedRoutes: rankedBlogWatchBridgePacket.pairedRoutes,
    blogViewRatio: rankedBlogWatchBridgePacket.blogViewRatio,
    stageCounts: rankedBlogWatchBridgePacket.stageCounts,
    topPairs: rankedBlogWatchBridgePacket.topPairs.slice(0, 8).map((pair) => ({
      blogRoute: pair.blogRoute,
      watchRoute: pair.watchRoute,
      promotionStage: pair.promotionStage,
      score: pair.score,
      measurementEvents: pair.measurementEvents
    })),
    nextFireCudaMove: rankedBlogWatchBridgePacket.nextFireCudaMove
  }
  status.releasePairSubmissionSummary = {
    status: releasePairSubmissionPacket.status,
    purpose: releasePairSubmissionPacket.purpose,
    guardrail: releasePairSubmissionPacket.guardrail,
    releasePairCount: releasePairSubmissionPacket.releasePairCount,
    submissionTargetCount: releasePairSubmissionPacket.submissionTargetCount,
    missingFromBroadQueueCount: releasePairSubmissionPacket.missingFromBroadQueueCount,
    routeCoverageStatus: releasePairSubmissionPacket.routeCoverageStatus,
    deployReadinessStatus: releasePairSubmissionPacket.deployReadinessStatus,
    submissionTargets: releasePairSubmissionPacket.submissionTargets.slice(0, 12).map((target) => ({
      route: target.route,
      type: target.type,
      priority: target.priority,
      launchLane: target.launchLane,
      existingSubmissionQueue: target.existingSubmissionQueue,
      measurementEvents: target.measurementEvents
    })),
    searchConsoleSteps: releasePairSubmissionPacket.searchConsoleSteps,
    nextFireCudaMove: releasePairSubmissionPacket.nextFireCudaMove
  }
  status.releasePairSubmissionDeltaSummary = {
    status: releasePairSubmissionDeltaPacket.status,
    purpose: releasePairSubmissionDeltaPacket.purpose,
    guardrail: releasePairSubmissionDeltaPacket.guardrail,
    missingTargetCount: releasePairSubmissionDeltaPacket.missingTargetCount,
    deltaPairCount: releasePairSubmissionDeltaPacket.deltaPairCount,
    deployReadinessStatus: releasePairSubmissionDeltaPacket.deployReadinessStatus,
    supabaseRefinementStatus: releasePairSubmissionDeltaPacket.supabaseRefinementStatus,
    deltaPairs: releasePairSubmissionDeltaPacket.deltaPairs.map((pair) => ({
      pairSlug: pair.pairSlug,
      launchLane: pair.launchLane,
      routeCount: pair.routes.length,
      measurementEvents: pair.measurementEvents
    })),
    nextFireCudaMove: releasePairSubmissionDeltaPacket.nextFireCudaMove
  }
  status.deltaCompareRefinementSummary = {
    status: deltaCompareRefinementPacket.status,
    purpose: deltaCompareRefinementPacket.purpose,
    guardrail: deltaCompareRefinementPacket.guardrail,
    deltaStatus: deltaCompareRefinementPacket.deltaStatus,
    missingTargetCount: deltaCompareRefinementPacket.missingTargetCount,
    pairDecisionCount: deltaCompareRefinementPacket.pairDecisionCount,
    supabaseRefinementStatus: deltaCompareRefinementPacket.supabaseRefinementStatus,
    pairDecisions: deltaCompareRefinementPacket.pairDecisions.map((pair) => ({
      pairSlug: pair.pairSlug,
      launchLane: pair.launchLane,
      routes: pair.routes,
      promoteWhen: pair.promoteWhen,
      rewriteWhen: pair.rewriteWhen,
      holdWhen: pair.holdWhen
    })),
    nextFireCudaMove: deltaCompareRefinementPacket.nextFireCudaMove
  }
  status.postDeployMeasurementProofSummary = {
    status: postDeployMeasurementProofPacket.status,
    purpose: postDeployMeasurementProofPacket.purpose,
    guardrail: postDeployMeasurementProofPacket.guardrail,
    releaseDecision: postDeployMeasurementProofPacket.releaseDecision,
    releaseRouteCount: postDeployMeasurementProofPacket.releaseRouteCount,
    measurementEventCount: postDeployMeasurementProofPacket.measurementEventCount,
    releaseGate: postDeployMeasurementProofPacket.releaseGate,
    proofEvents: postDeployMeasurementProofPacket.proofEvents,
    releaseTargetCount: postDeployMeasurementProofPacket.releaseTargets.length,
    orderedInspectionCount: postDeployMeasurementProofPacket.orderedInspectionSequence.length,
    inspectionPhaseCounts: postDeployMeasurementProofPacket.inspectionPhaseCounts,
    orderedInspectionSequence: postDeployMeasurementProofPacket.orderedInspectionSequence,
    deltaDecisionCount: postDeployMeasurementProofPacket.deltaDecisions.length,
    decisionMatrix: postDeployMeasurementProofPacket.decisionMatrix,
    nextFireCudaMove: postDeployMeasurementProofPacket.nextFireCudaMove
  }
  status.fireCudaDecisionQueueTemplateSummary = {
    status: fireCudaDecisionQueueTemplatePacket.status,
    purpose: fireCudaDecisionQueueTemplatePacket.purpose,
    guardrail: fireCudaDecisionQueueTemplatePacket.guardrail,
    releasePairCount: fireCudaDecisionQueueTemplatePacket.releasePairCount,
    promotionQueueCount: fireCudaDecisionQueueTemplatePacket.promotionQueueCount,
    rewriteQueueCount: fireCudaDecisionQueueTemplatePacket.rewriteQueueCount,
    holdQueueCount: fireCudaDecisionQueueTemplatePacket.holdQueueCount,
    orderedInspectionSteps: fireCudaDecisionQueueTemplatePacket.orderedInspectionSteps,
    queueDecisionRules: fireCudaDecisionQueueTemplatePacket.queueDecisionRules,
    promotionQueueTemplate: fireCudaDecisionQueueTemplatePacket.promotionQueueTemplate.map((item) => ({
      pairSlug: item.pairSlug,
      routes: item.routes,
      launchLane: item.launchLane,
      deltaTracked: item.deltaTracked,
      secondActionEvents: item.secondActionEvents
    })),
    nextFireCudaMove: fireCudaDecisionQueueTemplatePacket.nextFireCudaMove
  }
  status.releaseCommandCenterSummary = {
    status: releaseCommandCenterPacket.status,
    purpose: releaseCommandCenterPacket.purpose,
    guardrail: releaseCommandCenterPacket.guardrail,
    currentBuildGate: releaseCommandCenterPacket.currentBuildGate,
    deploymentAuthStatus: releaseCommandCenterPacket.deploymentAuthStatus,
    deployExecutableStatus: releaseCommandCenterPacket.deployExecutableStatus,
    vercelProjectLinked: releaseCommandCenterPacket.vercelProjectLinked,
    releaseTargets: releaseCommandCenterPacket.releaseTargets,
    orderedInspectionSteps: releaseCommandCenterPacket.orderedInspectionSteps,
    proofEvents: releaseCommandCenterPacket.proofEvents,
    promoteQueue: releaseCommandCenterPacket.promoteQueue,
    rewriteQueue: releaseCommandCenterPacket.rewriteQueue,
    holdQueue: releaseCommandCenterPacket.holdQueue,
    commandLanes: releaseCommandCenterPacket.commandLanes,
    launchSequence: releaseCommandCenterPacket.launchSequence,
    nextAction: releaseCommandCenterPacket.nextAction
  }
  status.deploymentRuntimeCompatibilitySummary = {
    status: deploymentRuntimeCompatibilityPacket.status,
    purpose: deploymentRuntimeCompatibilityPacket.purpose,
    guardrail: deploymentRuntimeCompatibilityPacket.guardrail,
    nodeEngine: deploymentRuntimeCompatibilityPacket.nodeEngine,
    vercelFramework: deploymentRuntimeCompatibilityPacket.vercelFramework,
    installCommand: deploymentRuntimeCompatibilityPacket.installCommand,
    buildCommand: deploymentRuntimeCompatibilityPacket.buildCommand,
    outputDirectory: deploymentRuntimeCompatibilityPacket.outputDirectory,
    lockfileVersion: deploymentRuntimeCompatibilityPacket.lockfileVersion,
    statusCounts: deploymentRuntimeCompatibilityPacket.statusCounts,
    checks: deploymentRuntimeCompatibilityPacket.checks,
    nextAction: deploymentRuntimeCompatibilityPacket.nextAction
  }
  status.deploymentRuntimeFallbackSummary = {
    status: deploymentRuntimeFallbackPacket.status,
    purpose: deploymentRuntimeFallbackPacket.purpose,
    guardrail: deploymentRuntimeFallbackPacket.guardrail,
    currentNodeEngine: deploymentRuntimeFallbackPacket.currentNodeEngine,
    compatibilityStatus: deploymentRuntimeFallbackPacket.compatibilityStatus,
    releaseCommandCenterStatus: deploymentRuntimeFallbackPacket.releaseCommandCenterStatus,
    fallbackTriggers: deploymentRuntimeFallbackPacket.fallbackTriggers,
    fallbackOrder: deploymentRuntimeFallbackPacket.fallbackOrder,
    nextAction: deploymentRuntimeFallbackPacket.nextAction
  }
  status.buildProofIntakeSummary = {
    status: buildProofIntakePacket.status,
    purpose: buildProofIntakePacket.purpose,
    guardrail: buildProofIntakePacket.guardrail,
    buildGate: buildProofIntakePacket.buildGate,
    runtimeCompatibility: buildProofIntakePacket.runtimeCompatibility,
    fallbackStatus: buildProofIntakePacket.fallbackStatus,
    releaseCommandCenter: buildProofIntakePacket.releaseCommandCenter,
    postDeployMeasurementProof: buildProofIntakePacket.postDeployMeasurementProof,
    evidenceTypes: buildProofIntakePacket.evidenceTypes.map((type) => ({
      id: type.id,
      status: type.status,
      routesTo: type.routesTo,
      promotedResult: type.promotedResult
    })),
    intakeFlow: buildProofIntakePacket.intakeFlow,
    affectedPackets: buildProofIntakePacket.affectedPackets,
    nextAction: buildProofIntakePacket.nextAction
  }
  status.deployMeasurementActivationSummary = {
    status: deployMeasurementActivationPacket.status,
    purpose: deployMeasurementActivationPacket.purpose,
    guardrail: deployMeasurementActivationPacket.guardrail,
    buildProofStatus: deployMeasurementActivationPacket.buildProofStatus,
    measurementProofStatus: deployMeasurementActivationPacket.measurementProofStatus,
    releasePairSubmissionStatus: deployMeasurementActivationPacket.releasePairSubmissionStatus,
    supabaseRefinementStatus: deployMeasurementActivationPacket.supabaseRefinementStatus,
    firstWaveRouteCount: deployMeasurementActivationPacket.firstWaveRouteCount,
    firstWaveRoutes: deployMeasurementActivationPacket.firstWaveRoutes.map((route) => ({
      route: route.route,
      type: route.type,
      lane: route.lane,
      activation: route.activation,
      requiredSignals: route.requiredSignals
    })),
    activationSignals: deployMeasurementActivationPacket.activationSignals,
    activationWindows: deployMeasurementActivationPacket.activationWindows,
    decisionOutputs: deployMeasurementActivationPacket.decisionOutputs,
    activationRule: deployMeasurementActivationPacket.activationRule,
    nextFireCudaMove: deployMeasurementActivationPacket.nextFireCudaMove
  }
  status.routePairEvidenceLedgerSummary = {
    status: routePairEvidenceLedgerPacket.status,
    purpose: routePairEvidenceLedgerPacket.purpose,
    guardrail: routePairEvidenceLedgerPacket.guardrail,
    buildProofStatus: routePairEvidenceLedgerPacket.buildProofStatus,
    activationStatus: routePairEvidenceLedgerPacket.activationStatus,
    measurementProofStatus: routePairEvidenceLedgerPacket.measurementProofStatus,
    supabaseMeasurementStatus: routePairEvidenceLedgerPacket.supabaseMeasurementStatus,
    pairCount: routePairEvidenceLedgerPacket.pairCount,
    firstWavePairCount: routePairEvidenceLedgerPacket.firstWavePairCount,
    releasePairCount: routePairEvidenceLedgerPacket.releasePairCount,
    ledgerCounts: routePairEvidenceLedgerPacket.ledgerCounts,
    evidenceColumns: routePairEvidenceLedgerPacket.evidenceColumns,
    firstWaveLedgers: routePairEvidenceLedgerPacket.firstWaveLedgers.map((pair) => ({
      pairSlug: pair.pairSlug,
      watchRoute: pair.watchRoute,
      blogRoute: pair.blogRoute,
      inspectionStatus: pair.inspectionStatus,
      decisionSlot: pair.decisionSlot,
      expectedSignals: pair.expectedSignals,
      coveredSignals: pair.coveredSignals,
      missingSignals: pair.missingSignals,
      nextAction: pair.nextAction
    })),
    compareInstructions: routePairEvidenceLedgerPacket.compareInstructions,
    nextFireCudaMove: routePairEvidenceLedgerPacket.nextFireCudaMove
  }
  status.firstWaveActionQueueSummary = {
    status: firstWaveActionQueuePacket.status,
    purpose: firstWaveActionQueuePacket.purpose,
    guardrail: firstWaveActionQueuePacket.guardrail,
    pairCount: firstWaveActionQueuePacket.pairCount,
    actionCount: firstWaveActionQueuePacket.actionCount,
    phaseCounts: firstWaveActionQueuePacket.phaseCounts,
    releaseReadiness: firstWaveActionQueuePacket.releaseReadiness,
    actions: firstWaveActionQueuePacket.actions.map((action) => ({
      order: action.order,
      pairSlug: action.pairSlug,
      phase: action.phase,
      status: action.status,
      route: action.route,
      system: action.system,
      evidenceNeeded: action.evidenceNeeded,
      successSignal: action.successSignal
    })),
    operatingRules: firstWaveActionQueuePacket.operatingRules,
    nextFireCudaMove: firstWaveActionQueuePacket.nextFireCudaMove
  }
  status.fireCudaPromotionReceiptSummary = {
    status: fireCudaPromotionReceiptPacket.status,
    purpose: fireCudaPromotionReceiptPacket.purpose,
    guardrail: fireCudaPromotionReceiptPacket.guardrail,
    receiptCount: fireCudaPromotionReceiptPacket.receiptCount,
    receiptCounts: fireCudaPromotionReceiptPacket.receiptCounts,
    buildProofStatus: fireCudaPromotionReceiptPacket.buildProofStatus,
    firstWaveActionQueueStatus: fireCudaPromotionReceiptPacket.firstWaveActionQueueStatus,
    fireCudaDecisionQueueStatus: fireCudaPromotionReceiptPacket.fireCudaDecisionQueueStatus,
    routePairLedgerStatus: fireCudaPromotionReceiptPacket.routePairLedgerStatus,
    receipts: fireCudaPromotionReceiptPacket.receipts.map((receipt) => ({
      pairSlug: receipt.pairSlug,
      status: receipt.status,
      watchRoute: receipt.watchRoute,
      blogRoute: receipt.blogRoute,
      actionCount: receipt.actionCount,
      secondActionSignals: receipt.secondActionSignals,
      decision: receipt.receiptFields.decision,
      masterListAction: receipt.receiptFields.masterListAction,
      backlinkAction: receipt.receiptFields.backlinkAction
    })),
    decisionRules: fireCudaPromotionReceiptPacket.decisionRules,
    nextFireCudaMove: fireCudaPromotionReceiptPacket.nextFireCudaMove
  }
  status.masterListExpansionGateSummary = {
    status: masterListExpansionGatePacket.status,
    purpose: masterListExpansionGatePacket.purpose,
    guardrail: masterListExpansionGatePacket.guardrail,
    totalVariationCapacity: masterListExpansionGatePacket.totalVariationCapacity,
    allowedSlotTotal: masterListExpansionGatePacket.allowedSlotTotal,
    heldSlotTotal: masterListExpansionGatePacket.heldSlotTotal,
    gateCount: masterListExpansionGatePacket.gateCount,
    openGateCount: masterListExpansionGatePacket.openGateCount,
    closedGateCount: masterListExpansionGatePacket.closedGateCount,
    receiptStatus: masterListExpansionGatePacket.receiptStatus,
    gates: masterListExpansionGatePacket.gates.map((gate) => ({
      pairSlug: gate.pairSlug,
      launchLane: gate.launchLane,
      expansionStatus: gate.expansionStatus,
      decision: gate.decision,
      secondActionWinner: gate.secondActionWinner,
      allowedSlots: gate.allowedSlots,
      laneVariationCapacity: gate.laneVariationCapacity,
      laneBridgeStatus: gate.laneBridgeStatus,
      blockedReason: gate.blockedReason
    })),
    expansionRules: masterListExpansionGatePacket.expansionRules,
    nextFireCudaMove: masterListExpansionGatePacket.nextFireCudaMove
  }
  status.separateLaneUniverseStarterSummary = {
    status: separateLaneUniverseStarterPacket.status,
    purpose: separateLaneUniverseStarterPacket.purpose,
    guardrail: separateLaneUniverseStarterPacket.guardrail,
    sourceGateStatus: separateLaneUniverseStarterPacket.sourceGateStatus,
    separateLaneCount: separateLaneUniverseStarterPacket.separateLaneCount,
    totalSeparateCapacity: separateLaneUniverseStarterPacket.totalSeparateCapacity,
    combinedHeldCapacity: separateLaneUniverseStarterPacket.combinedHeldCapacity,
    universes: separateLaneUniverseStarterPacket.universes.map((universe) => ({
      universeId: universe.universeId,
      lane: universe.lane,
      pairSlug: universe.pairSlug,
      variationCapacity: universe.variationCapacity,
      proofSignal: universe.proofSignal,
      unlockRule: universe.unlockRule,
      currentAction: universe.currentAction
    })),
    expansionRules: separateLaneUniverseStarterPacket.expansionRules,
    nextFireCudaMove: separateLaneUniverseStarterPacket.nextFireCudaMove
  }
  status.separateLaneReceiptBridgeSummary = {
    status: separateLaneReceiptBridgePacket.status,
    purpose: separateLaneReceiptBridgePacket.purpose,
    guardrail: separateLaneReceiptBridgePacket.guardrail,
    sourceUniverseStatus: separateLaneReceiptBridgePacket.sourceUniverseStatus,
    receiptStatus: separateLaneReceiptBridgePacket.receiptStatus,
    bridgeCount: separateLaneReceiptBridgePacket.bridgeCount,
    openBridgeCount: separateLaneReceiptBridgePacket.openBridgeCount,
    openSlots: separateLaneReceiptBridgePacket.openSlots,
    heldSlots: separateLaneReceiptBridgePacket.heldSlots,
    bridges: separateLaneReceiptBridgePacket.bridges.map((bridge) => ({
      universeId: bridge.universeId,
      lane: bridge.lane,
      pairSlug: bridge.pairSlug,
      bridgeStatus: bridge.bridgeStatus,
      decision: bridge.decision,
      secondActionWinner: bridge.secondActionWinner,
      openBatchSize: bridge.openBatchSize,
      heldSlots: bridge.heldSlots,
      expansionAction: bridge.expansionAction
    })),
    bridgeRules: separateLaneReceiptBridgePacket.bridgeRules,
    nextFireCudaMove: separateLaneReceiptBridgePacket.nextFireCudaMove
  }
  status.receiptEvidenceIntakeSchemaSummary = {
    status: receiptEvidenceIntakeSchemaPacket.status,
    purpose: receiptEvidenceIntakeSchemaPacket.purpose,
    guardrail: receiptEvidenceIntakeSchemaPacket.guardrail,
    receiptCount: receiptEvidenceIntakeSchemaPacket.receiptCount,
    schemaCount: receiptEvidenceIntakeSchemaPacket.schemaCount,
    supabaseRefinementStatus: receiptEvidenceIntakeSchemaPacket.supabaseRefinementStatus,
    separateLaneBridgeStatus: receiptEvidenceIntakeSchemaPacket.separateLaneBridgeStatus,
    receiptStatus: receiptEvidenceIntakeSchemaPacket.receiptStatus,
    intakeOrder: receiptEvidenceIntakeSchemaPacket.intakeOrder,
    receiptSchemas: receiptEvidenceIntakeSchemaPacket.receiptSchemas.map((schema) => ({
      pairSlug: schema.pairSlug,
      lane: schema.lane,
      intakeStatus: schema.intakeStatus,
      separateLaneBridge: schema.separateLaneBridge,
      fieldCount: schema.fields.length,
      nextAction: schema.nextAction
    })),
    nextFireCudaMove: receiptEvidenceIntakeSchemaPacket.nextFireCudaMove
  }
  status.fullSystemLadderPushSummary = {
    status: fullSystemLadderPushPacket.status,
    liveRankDropStatus: fullSystemLadderPushPacket.liveRankDropStatus,
    ladderRows: fullSystemLadderPushPacket.ladderRows.length,
    systemPushes: fullSystemLadderPushPacket.fullSystemPushes.length,
    backlinkPushRoutes: fullSystemLadderPushPacket.backlinkPush.length,
    nextSystemMove: fullSystemLadderPushPacket.nextSystemMove
  }
  status.systemClaimVerificationSummary = {
    status: systemClaimVerificationPacket.status,
    codexProVerificationStatus: systemClaimVerificationPacket.codexProClaim.verificationStatus,
    openaiBillingRoute: systemClaimVerificationPacket.openaiBillingApi.route,
    nodeServerLivePortStatus: systemClaimVerificationPacket.nodeServer.livePortStatus,
    renderStackStatus: systemClaimVerificationPacket.renderStack.status,
    nextSystemMove: systemClaimVerificationPacket.nextSystemMove
  }
  status.googleSearchConsoleRankVerificationSummary = {
    status: googleSearchConsoleRankVerificationPacket.status,
    googleLiveRankStatus: googleSearchConsoleRankVerificationPacket.googleLiveRankStatus,
    rankHigherStatus: googleSearchConsoleRankVerificationPacket.rankHigherStatus,
    providerRoute: googleSearchConsoleRankVerificationPacket.googleProviderRoute,
    sitemapUrls: googleSearchConsoleRankVerificationPacket.googleSitemapReflection.sitemapUrls,
    metadataRoutes: googleSearchConsoleRankVerificationPacket.googleSitemapReflection.metadataRoutes,
    launchTargetRoutes: googleSearchConsoleRankVerificationPacket.googleSitemapReflection.launchTargetRoutes,
    nextSystemMove: googleSearchConsoleRankVerificationPacket.nextSystemMove
  }
  status.seoSubmissionQueueSummary = {
    status: seoSubmissionQueue.status,
    purpose: seoSubmissionQueue.purpose,
    immediateSubmissionCount: seoSubmissionQueue.immediateSubmissionCount,
    supportRouteCount: seoSubmissionQueue.supportRouteCount,
    fireCudaHeldRankSlots: seoSubmissionQueue.holdInFireCuda.totalRankSlots,
    queuedCandidates: seoSubmissionQueue.holdInFireCuda.queuedCandidates,
    guardrail: seoSubmissionQueue.guardrail,
    batches: seoSubmissionQueue.batches.map((batch) => ({
      id: batch.id,
      purpose: batch.purpose,
      routeCount: batch.routes.length,
      topRoutes: batch.routes.slice(0, 4).map((route) => ({
        route: route.route,
        priority: route.priority,
        lane: route.lane,
        title: route.title,
        targetKeywords: route.targetKeywords.slice(0, 5)
      }))
    }))
  }
  status.aiSearchDiscoverySummary = {
    mode: aiDiscoveryPacket.mode,
    productName: aiDiscoveryPacket.productName,
    read: aiDiscoveryPacket.oneLineRead,
    discoveryRoutes: aiDiscoveryPacket.discoveryRoutes.length,
    launchRoutes: aiDiscoveryPacket.launchRoutes.length,
    rankedLanes: aiDiscoveryPacket.rankedLanes.slice(0, 6).map((lane) => ({
      lane: lane.lane,
      stage: lane.stage,
      score: lane.score,
      demandClass: lane.demandClass,
      targets: lane.firstDeployTargets.slice(0, 5)
    })),
    crawlGuidance: aiDiscoveryPacket.crawlGuidance
  }
  status.rankOwnershipSummary = {
    owner: seoMasterListPacket.individualRankingIndex.rankingOwner,
    canonicalDomain: seoMasterListPacket.individualRankingIndex.canonicalDomain,
    totalIndividualRanks: seoMasterListPacket.individualRankingIndex.totalIndividualRanks,
    globalRange: `${seoMasterListPacket.individualRankingIndex.globalRankStart}-${seoMasterListPacket.individualRankingIndex.globalRankEnd}`,
    sampleCount: rankSlotMaterializationSamples.sampleCount,
    sampleRoutes: rankSlotMaterializationSamples.samples.slice(0, 6).map((sample) => ({
      lane: sample.lane,
      sampleType: sample.sampleType,
      globalRankId: sample.globalRankId,
      rankUrl: sample.rankUrl,
      launchTarget: sample.launchTarget
    }))
  }
  status.deployReadinessSummary = {
    status: deployReadinessAudit.status,
    read: deployReadinessAudit.read,
    checks: deployReadinessAudit.checks.map((check) => ({
      id: check.id,
      status: check.status,
      read: check.read
    })),
    nextAction: deployReadinessAudit.nextAction
  }

  const markdown = `# DigitalHut Backend SEO Standby System

Generated: ${generatedAt}

This is the local backend SEO standby system for DigitalHut. It keeps the Babylon renderer, FireCuda SEO staging, sitemap proof, and public content movement organized before, during, and after live engineering cycles.

## Professional System Loop

${systemLoop.map((item, index) => `${index + 1}. **${item.label}** (${item.status}): ${item.job}`).join("\n")}

## Task Split

**${taskSplit.simultaneousSupportMode.label}**: ${taskSplit.simultaneousSupportMode.job}

### Mundane Backend Layer

${taskSplit.mundaneBackendLayer.map((item) => `- **${item.id}**: ${item.task}`).join("\n")}

### Live Engineering Layer

${taskSplit.liveEngineeringLayer.map((item) => `- **${item.id}**: ${item.task}`).join("\n")}

## System-First Operating Contract

${ventureBaselineAudit.operatingContract.purpose}

### Backend System Pass

${ventureBaselineAudit.operatingContract.backendSystemPass.map((item) => `- ${item}`).join("\n")}

### Reflection To Codex Pro High

${ventureBaselineAudit.operatingContract.reflectionFlow.map((item) => `- ${item}`).join("\n")}

### Codex Oversight Pass

${ventureBaselineAudit.operatingContract.codexOversightPass.map((item) => `- ${item}`).join("\n")}

Hard boundary: ${ventureBaselineAudit.operatingContract.hardBoundary}

## Mundane SEO Pipeline

${mundanePipeline.map((item, index) => `${index + 1}. **${item.label}**: ${item.job}\n   - Outputs: ${item.outputs.join("; ")}`).join("\n")}

## FireCuda Everyday Long-Tail Map

${fireCudaKeywordMap.map((item) => `### ${item.lane}\n\nRoles: ${item.roles.join(", ")}\n\nInternational markets: ${item.internationalMarkets.join(", ")}\n\nSeeds:\n${item.longTailSeeds.map((seed) => `- ${seed}`).join("\n")}`).join("\n\n")}

## FireCuda Overseer Category Balancer

${fireCudaOverseerMap.storageRole}

### Judgment Rules

${fireCudaOverseerMap.judgmentRules.map((item) => `- ${item}`).join("\n")}

### Category Groups

${fireCudaOverseerMap.categoryGroups.map((group) => `#### ${group.id}\n\nTier: ${group.tier}\n\nRead: ${group.currentRead}\n\nKeyword groups:\n${group.keywordGroups.map((item) => `- ${item}`).join("\n")}\n\nIntermix feed ideas:\n${group.intermixFeedIdeas.map((item) => `- ${item}`).join("\n")}\n\nHuman signals: ${group.humanSignals.join(", ")}`).join("\n\n")}

### Current Tier Movement

${fireCudaOverseerMap.currentTierMovement.map((move) => `- **${move.keywordGroup}**: ${move.fromTier} > ${move.toTier}. Trigger: ${move.trigger} Action: ${move.action}`).join("\n")}

### Next Compare Reads

${fireCudaOverseerMap.nextCompareReads.map((item) => `- ${item}`).join("\n")}

## Viral First-Source System Capability

${viralFirstSourceSystem.scenario}

Frontend lock: ${viralFirstSourceSystem.frontendLock}

### Stack Flow

${viralFirstSourceSystem.stackFlow.map((item) => `- **${item.layer}**: ${item.work}`).join("\n")}

### Keyword Seeds

${viralFirstSourceSystem.keywordSeeds.map((item) => `- ${item}`).join("\n")}

### Event Signals

${viralFirstSourceSystem.eventSignals.map((item) => `- ${item}`).join("\n")}

### Proof Targets

${viralFirstSourceSystem.proofTargets.map((item) => `- ${item}`).join("\n")}

Deploy gate: ${viralFirstSourceSystem.deployGate}

## Buried Treasure Niche Map

Claim: ${buriedTreasureNicheMap.claim}

Status: ${buriedTreasureNicheMap.status}

Why open:

${buriedTreasureNicheMap.whyOpen.map((item) => `- ${item}`).join("\n")}

Content formula: ${buriedTreasureNicheMap.contentFormula}

### Long-Tail Clusters

${buriedTreasureNicheMap.longTailClusters.map((cluster) => `#### ${cluster.lane}

Role: ${cluster.role}

Format fit: ${cluster.formatFit}

Keywords:
${cluster.keywords.map((item) => `- ${item}`).join("\n")}

Proof signal: ${cluster.proofSignal}`).join("\n\n")}

Expansion gate: ${buriedTreasureNicheMap.expansionGate}

Next move: ${buriedTreasureNicheMap.nextMove}

## Mundane Off-Time Experience Map

Claim: ${mundaneOffTimeExperienceMap.claim}

Status: ${mundaneOffTimeExperienceMap.status}

Why open:

${mundaneOffTimeExperienceMap.whyOpen.map((item) => `- ${item}`).join("\n")}

Content formula: ${mundaneOffTimeExperienceMap.contentFormula}

### Off-Time Clusters

${mundaneOffTimeExperienceMap.clusters.map((cluster) => `#### ${cluster.lane}

Role: ${cluster.role}

Keywords:
${cluster.keywords.map((item) => `- ${item}`).join("\n")}

Proof signal: ${cluster.proofSignal}`).join("\n\n")}

Expansion gate: ${mundaneOffTimeExperienceMap.expansionGate}

Next move: ${mundaneOffTimeExperienceMap.nextMove}

## Codex Oversight Capabilities

Role: ${codexOversightCapabilities.role}

Boundary: ${codexOversightCapabilities.boundary}

${codexOversightCapabilities.capabilities.map((item) => `- **${item.lane}**: ${item.capability} Evidence: ${item.evidenceUsed.join(", ")}. Output: ${item.output}.`).join("\n")}

Current oversight read: ${codexOversightCapabilities.currentOversightRead}

## Supabase Analytics Coverage

${supabaseAnalyticsCoverage.map((eventName) => `- ${eventName}`).join("\n")}

## Human Role Database Map

${humanRoleDatabaseMap.map((item) => `- **${item.role}**: ${item.meaning} Signals: ${item.signals.join(", ")}`).join("\n")}

## Google Cloud Infrastructure Checks

${cloudInfrastructureChecks.map((item) => `- **${item.area}**: ${item.check}`).join("\n")}

## Decentralized Dapp Checks

${decentralizedDappChecks.map((item) => `- ${item}`).join("\n")}

## Digital Nomad SEO Perspective

Thesis: ${digitalNomadSeoPerspective.thesis}

Strongest angle: ${digitalNomadSeoPerspective.strongestAngle}

Practical rule: ${digitalNomadSeoPerspective.practicalRule}

## Venture Baseline Audit

Purpose: ${ventureBaselineAudit.generatedFor}

Operating stack: ${ventureBaselineAudit.stack.join(" > ")}

GitHub source anchor: ${ventureBaselineAudit.githubSourceAnchor.repository} (${ventureBaselineAudit.githubSourceAnchor.defaultBranch}, ${ventureBaselineAudit.githubSourceAnchor.visibility}). ${ventureBaselineAudit.githubSourceAnchor.syncStatus}

### Paid-Tier Intelligence Boundary

${ventureBaselineAudit.intelligenceBoundary.rule}

Codex role: ${ventureBaselineAudit.intelligenceBoundary.codexRole}

DigitalHut system role: ${ventureBaselineAudit.intelligenceBoundary.systemRole}

Operating contract: ${ventureBaselineAudit.operatingContract.hardBoundary}

Storage baseline: ${ventureBaselineAudit.storage.firecudaDrive}. ${ventureBaselineAudit.storage.purpose}

### Stack Status

${ventureBaselineAudit.stackStatus.map((item) => `- **${item.id}** (${item.status}): ${item.proof}`).join("\n")}

### Product Baseline

${ventureBaselineAudit.productBaseline.map((item) => `- **${item.area}** (${item.status}): ${item.proof}`).join("\n")}

Next checkpoint: ${ventureBaselineAudit.nextVentureCheckpoint}

## Overseer Stack Cycle

Operating stack: ${overseerCycle.operatingStack.join(" > ")}

Current call: ${overseerCycle.overseerRead}

## System Capability Ready Alerts

${readyAlerts.summary}

${readyAlerts.alerts.map((item) => `- **${item.lane}** (${item.level.toUpperCase()}): ${item.trigger}. Read: ${item.read} Next: ${item.nextAction}`).join("\n")}

### Stack Reads

${overseerCycle.stackReads.map((item) => `- **${item.layer}**: ${item.read} Proof: ${item.proof}.`).join("\n")}

### Active Conditions

${overseerCycle.activeConditions.map((item) => `- **${item.lane}** (${item.severity}): ${item.reason} Next: ${item.nextMove}`).join("\n")}

## Product State

| Area | Status |
| --- | --- |
| Podcast click system | ${status.product.podcastClickSystem} |
| Podcast retry source ready | ${status.product.podcastRetrySourceReady} |
| GLB collapse control | ${status.product.glbCollapseControl} |
| Idle paused GLB removal | ${status.product.idlePausedGlbRemoved} |
| Market feed | ${status.product.marketFeed} |
| YouTube category queue | ${status.product.youtubeCategoryQueue} |
| Content analyzer | ${status.product.contentAnalyzer} |
| Compact category lock | ${status.product.compactCategoryLock} |
| Live proof route rail | ${status.product.liveProofRouteRail} |
| Platform cadence rail | ${status.product.platformCadenceRail} |
| Platform cadence SEO proof | ${status.product.platformCadenceSeoProof} |
| Search intent radar | ${status.product.searchIntentRadar} |
| Search intent SEO proof | ${status.product.searchIntentSeoProof} |
| Usefulness lane proof | ${status.product.usefulnessLaneProof} |

## SEO Proof State

| Area | Count |
| --- | ---: |
| Blog/watch proof posts in engine | ${seoProof.blogProofPosts} |
| Sitemap watch URLs | ${seoProof.watchProofRoutes} |
| Sitemap blog URLs | ${seoProof.blogRoutes} |
| Sitemap category URLs | ${seoProof.categoryRoutes} |
| Sitemap total URLs | ${seoProof.sitemapUrls} |

## FireCuda SEO Master List Packet

Total counted variation capacity: ${seoMasterListPacket.counts.totalVariationCapacity.toLocaleString("en-US")}

${seoMasterListPacket.clusters.map((cluster) => `- **${cluster.lane}**: ${cluster.variationCapacity.toLocaleString("en-US")} variations from ${Object.entries(cluster.dimensionCounts).map(([key, value]) => `${value} ${key}`).join(", ")}.`).join("\n")}

Candidate promotion board: ${seoMasterListPacket.candidatePromotionBoard.read}

${Object.entries(seoMasterListPacket.candidatePromotionBoard.countsByStage).map(([stage, count]) => `- ${stage}: ${count}`).join("\n")}

Launch ranking layer: ${seoMasterListPacket.launchRankingLayer.purpose}

Primary launch lanes: ${seoMasterListPacket.launchRankingLayer.primaryLaunchLanes.join(", ") || "none"}

${seoMasterListPacket.launchRankingLayer.lanes.slice(0, 4).map((lane) => `- **${lane.lane}** (${lane.launchStage}, score ${lane.score.professionalismScore}): ${lane.firstDeployTargets.slice(0, 3).join("; ")}`).join("\n")}

Digitalhut.app rank ownership: ${seoMasterListPacket.individualRankingIndex.totalIndividualRanks.toLocaleString("en-US")} deterministic keyword slots assigned to Digitalhut.app canonical proof routes.

Deploy route metadata manifest: ${routeMetadataManifest.routeCount} routes / ${routeMetadataManifest.launchTargetRoutes} launch-target routes assigned to Digitalhut.app canonical metadata.

Route coverage audit: ${routeCoverageAudit.status.toUpperCase()} / ${routeCoverageAudit.sitemapProofRoutes} sitemap proof routes / ${routeCoverageAudit.metadataRoutes} metadata routes / ${routeCoverageAudit.missingMetadataRoutes.length} missing / ${routeCoverageAudit.extraMetadataRoutes.length} extra.

Deploy readiness audit: ${deployReadinessAudit.status.toUpperCase()}. ${deployReadinessAudit.read}

AI/search discovery packet: ${aiDiscoveryPacket.discoveryRoutes.length} discovery routes / ${aiDiscoveryPacket.launchRoutes.length} launch route samples / ${aiDiscoveryPacket.rankedLanes.length} ranked lanes.

Rank-slot materialization samples: ${rankSlotMaterializationSamples.sampleCount} proof samples across ${seoMasterListPacket.individualRankingIndex.clusters.length} clusters.

SEO submission queue: ${seoSubmissionQueue.status.toUpperCase()} / ${seoSubmissionQueue.immediateSubmissionCount} immediate routes / ${seoSubmissionQueue.supportRouteCount} support routes / ${seoSubmissionQueue.holdInFireCuda.totalRankSlots.toLocaleString("en-US")} FireCuda-held rank slots.

Supabase measurement contract: ${supabaseMeasurementContract.status.toUpperCase()} / ${supabaseMeasurementContract.eventCount} event groups / ${Object.entries(supabaseMeasurementContract.statusCounts).map(([status, count]) => `${count} ${status}`).join(", ")}.

Search intent promotion: ${searchIntentPromotionPacket.status.toUpperCase()} / ${searchIntentPromotionPacket.priorityIntentCandidates.length} priority candidates / ${searchIntentPromotionPacket.sourceBacklinkBridge.length} source bridges. Next: ${searchIntentPromotionPacket.nextFireCudaMove}

Market promotion: ${marketPromotionPacket.status.toUpperCase()} / ${marketPromotionPacket.marketLaneCount} stock lanes / route ${marketPromotionPacket.routeProof.route}. Next: ${marketPromotionPacket.nextFireCudaMove}

Podcast/source promotion: ${podcastPromotionPacket.status.toUpperCase()} / ${podcastPromotionPacket.podcastLanes.length} source moment lanes / ${podcastPromotionPacket.routeCount} proof routes. Next: ${podcastPromotionPacket.nextFireCudaMove}

GLB/source promotion: ${glbPromotionPacket.status.toUpperCase()} / ${glbPromotionPacket.glbLanes.length} 3D lanes / ${glbPromotionPacket.routeCount} proof routes. Next: ${glbPromotionPacket.nextFireCudaMove}

Unified proof-route board: ${unifiedProofRoutePromotionBoard.status.toUpperCase()} / ${unifiedProofRoutePromotionBoard.routeCount} scored routes / ${Object.entries(unifiedProofRoutePromotionBoard.stageCounts).map(([stage, count]) => `${count} ${stage}`).join(", ")}.

Deploy proof batch: ${deployProofBatchPacket.status.toUpperCase()} / ${deployProofBatchPacket.releaseRouteCount} release routes / build gate ${deployProofBatchPacket.buildGate.status}. Next: ${deployProofBatchPacket.nextFireCudaMove}

Build tooling recovery: ${buildToolingRecoveryPacket.status.toUpperCase()} / local Vite ${buildToolingRecoveryPacket.localVitePresent ? "present" : "missing"} / Vercel framework ${buildToolingRecoveryPacket.vercelFramework}. Next: ${buildToolingRecoveryPacket.nextFireCudaMove}

AI crawler guidance: ${aiCrawlerGuidancePacket.status.toUpperCase()} / ${aiCrawlerGuidancePacket.topProofRoutes.length} top proof routes / ${aiCrawlerGuidancePacket.releaseRoutes.length} release routes / llms.txt generated.

Structured data catalog: ${structuredDataCatalog.status.toUpperCase()} / ${structuredDataCatalog.schemaCount} JSON-LD graph nodes / ${structuredDataCatalog.topProofRouteCount} proof routes.

Backlink authority map: ${backlinkAuthorityPacket.status.toUpperCase()} / ${backlinkAuthorityPacket.releaseRouteCount} release routes / ${backlinkAuthorityPacket.priorityRouteCount} priority authority routes.

Supabase refinement views: ${supabaseRefinementViewsPacket.status.toUpperCase()} / ${supabaseRefinementViewsPacket.viewCount} views / migration ${supabaseRefinementViewsPacket.migration}.

Post-deploy compare handoff: ${postDeployCompareHandoffPacket.status.toUpperCase()} / ${postDeployCompareHandoffPacket.releaseRouteCount} release routes / next ${postDeployCompareHandoffPacket.nextFireCudaMove}

Quiet signal activation: ${quietSignalActivationPacket.status.toUpperCase()} / ${quietSignalActivationPacket.activationRouteCount} activation routes / next ${quietSignalActivationPacket.nextFireCudaMove}

Ranked blog/watch bridge: ${rankedBlogWatchBridgePacket.status.toUpperCase()} / ${rankedBlogWatchBridgePacket.pairedRoutes} paired routes / blog ratio ${rankedBlogWatchBridgePacket.blogViewRatio}.

Release pair submission: ${releasePairSubmissionPacket.status.toUpperCase()} / ${releasePairSubmissionPacket.submissionTargetCount} targets / missing broad queue ${releasePairSubmissionPacket.missingFromBroadQueueCount}.

Release pair submission delta: ${releasePairSubmissionDeltaPacket.status.toUpperCase()} / ${releasePairSubmissionDeltaPacket.missingTargetCount} missing targets / ${releasePairSubmissionDeltaPacket.deltaPairCount} pairs.

Delta compare refinement: ${deltaCompareRefinementPacket.status.toUpperCase()} / ${deltaCompareRefinementPacket.pairDecisionCount} pair decisions / next ${deltaCompareRefinementPacket.nextFireCudaMove}

Post-deploy measurement proof: ${postDeployMeasurementProofPacket.status.toUpperCase()} / ${postDeployMeasurementProofPacket.measurementEventCount} proof events / ${postDeployMeasurementProofPacket.releaseTargets.length} release targets.

FireCuda decision queues: ${fireCudaDecisionQueueTemplatePacket.status.toUpperCase()} / promote ${fireCudaDecisionQueueTemplatePacket.promotionQueueCount} / rewrite ${fireCudaDecisionQueueTemplatePacket.rewriteQueueCount} / hold ${fireCudaDecisionQueueTemplatePacket.holdQueueCount}.

Release command center: ${releaseCommandCenterPacket.status.toUpperCase()} / targets ${releaseCommandCenterPacket.releaseTargets} / inspection steps ${releaseCommandCenterPacket.orderedInspectionSteps}.

Deployment runtime compatibility: ${deploymentRuntimeCompatibilityPacket.status.toUpperCase()} / node ${deploymentRuntimeCompatibilityPacket.nodeEngine} / checks ${deploymentRuntimeCompatibilityPacket.checks.length}.

Deployment runtime fallback: ${deploymentRuntimeFallbackPacket.status.toUpperCase()} / current node ${deploymentRuntimeFallbackPacket.currentNodeEngine}.

SEO submission queue: ${status.seoSubmissionQueueSummary.status.toUpperCase()} / ${status.seoSubmissionQueueSummary.immediateSubmissionCount} immediate routes / ${status.seoSubmissionQueueSummary.supportRouteCount} support routes.

AI/search discovery: ${status.aiSearchDiscoverySummary.discoveryRoutes} discovery routes / ${status.aiSearchDiscoverySummary.launchRoutes} launch routes / ${status.aiSearchDiscoverySummary.rankedLanes.length} ranked lanes.

Rank ownership summary: ${status.rankOwnershipSummary.totalIndividualRanks.toLocaleString("en-US")} Digitalhut.app slots / ${status.rankOwnershipSummary.sampleCount} materialized samples.

## Last Known Metrics

Page views: ${lastKnownMetrics.pageViews}
Participating browser IDs: ${lastKnownMetrics.uniqueVisitors}
Search interactions: ${lastKnownMetrics.searchInteractions}
Autoplay starts: ${lastKnownMetrics.autoplayStarts}
GLB preview plays: ${lastKnownMetrics.glbPreviewPlays}
Podcast interrupts: ${lastKnownMetrics.podcastInterrupts}
Market opens: ${lastKnownMetrics.marketOpens}
Blog views: ${lastKnownMetrics.blogViews}

Source: ${lastKnownMetrics.source}

Metric freshness: ${metricFreshnessPacket.status}

Fresh cluster dump: ${freshClusterDumpPacket.status} / ${freshClusterDumpPacket.clusterCount} clusters / ${freshClusterDumpPacket.keywordSeedCount} keyword seeds

Website language impact: ${websiteLanguageImpactPacket.status}

Language read: ${websiteLanguageImpactPacket.oneLineRead}

Rank finding benchmark: ${rankFindingBenchmarkPacket.status} / ${rankFindingBenchmarkPacket.rowCount} rows / rank floor #${rankFindingBenchmarkPacket.rankUniverseFloor.toLocaleString("en-US")}

Rank jump algorithm: ${rankJumpAlgorithmPacket.status} / scored ${rankJumpAlgorithmPacket.counts.scoredRows} / staged ${rankJumpAlgorithmPacket.counts.stagedWaitingLiveProof} / blog cap ${rankJumpAlgorithmPacket.guardrails.maxBlogPostsPer24Hours}/24h

Whiteboard SEO structure: ${whiteboardSeoStructurePacket.status} / blog cap ${whiteboardSeoStructurePacket.normalBlogCap24h}/24h / stages ${whiteboardSeoStructurePacket.stages.length}

Functional rank boost: ${functionalRankBoostClusterPushPacket.status} / ${functionalRankBoostClusterPushPacket.clusterCount} clusters / audience ${functionalRankBoostClusterPushPacket.audienceConclusion.status}

Longtail competition neighborhood: ${longtailCompetitionNeighborhoodPacket.status} / ${longtailCompetitionNeighborhoodPacket.rowCount} rows

Movement proof and audience origin: ${movementProofAudienceOriginPacket.status} / origin ${movementProofAudienceOriginPacket.originProofStatus} / next visitor target ${movementProofAudienceOriginPacket.nextVisitorTarget.toLocaleString("en-US")}+

Competition framework metric push: ${competitionFrameworkMetricPushPacket.status} / framework ${competitionFrameworkMetricPushPacket.frameworkRead} / feature score ${competitionFrameworkMetricPushPacket.scores.featureScore}

Experience cycle niche ownership: ${experienceCycleNicheOwnershipPacket.status} / cycle score ${experienceCycleNicheOwnershipPacket.cycleScore} / strongest ${experienceCycleNicheOwnershipPacket.strongestStage}

FireCuda innovation mapping layer: ${fireCudaInnovationMappingLayerPacket.status} / map authority ${fireCudaInnovationMappingLayerPacket.mapAuthorityScore} / ${fireCudaInnovationMappingLayerPacket.totalVariationSlots.toLocaleString("en-US")} slots

Niche functionality ladder match: ${nicheFunctionalityLadderMatchPacket.status} / ${nicheFunctionalityLadderMatchPacket.passedMatches} passed / target ${nicheFunctionalityLadderMatchPacket.targetWinRatio}%

Ladder receipt acceleration: ${ladderReceiptAccelerationPacket.status} / priority ${ladderReceiptAccelerationPacket.priority.length} rungs / held ${ladderReceiptAccelerationPacket.heldMatches}

## Compare And Contrast Refinement Board

| Lane | Signal | Reading | Next Action |
| --- | --- | --- | --- |
${compareContrastRefinement.actions.map((item) => `| ${item.lane} | ${item.signal} | ${item.reading} | ${item.action} |`).join("\n")}

## Operator Perspective

Visitor perspective: ${operatorPerspective.visitorPerspective}

Wait state: ${operatorPerspective.waitState}

Important moments:

${operatorPerspective.importantMoments.map((item) => `- **${item.id}** (${item.condition}): ${item.meaning} Action: ${item.jumpAction}`).join("\n")}

## SEO Cycle Queue

${resumeQueue.map((item) => `- ${item.priority.toUpperCase()} / ${item.id}: ${item.detail}`).join("\n")}
`

  await writeFile(path.join(docsDir, "digitalhut-codex-standby-runner.md"), markdown, "utf8")
  await writeFile(path.join(docsDir, "digitalhut-codex-resume-queue.json"), `${JSON.stringify(status, null, 2)}\n`, "utf8")
  await writeFile(path.join(docsDir, "digitalhut-metric-freshness-gate.md"), metricFreshnessMarkdown(metricFreshnessPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-fresh-seo-cluster-dump.md"), freshClusterDumpMarkdown(freshClusterDumpPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-website-language-impact.md"), websiteLanguageImpactMarkdown(websiteLanguageImpactPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-rank-finding-benchmark.md"), rankFindingBenchmarkMarkdown(rankFindingBenchmarkPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-rank-jump-algorithm.md"), rankJumpAlgorithmMarkdown(rankJumpAlgorithmPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-whiteboard-seo-structure.md"), whiteboardSeoStructureMarkdown(whiteboardSeoStructurePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-functional-rank-boost-cluster-push.md"), functionalRankBoostClusterPushMarkdown(functionalRankBoostClusterPushPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-longtail-competition-neighborhood.md"), longtailCompetitionNeighborhoodMarkdown(longtailCompetitionNeighborhoodPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-movement-proof-audience-origin.md"), movementProofAudienceOriginMarkdown(movementProofAudienceOriginPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-competition-framework-metric-push.md"), competitionFrameworkMetricPushMarkdown(competitionFrameworkMetricPushPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-experience-cycle-niche-ownership.md"), experienceCycleNicheOwnershipMarkdown(experienceCycleNicheOwnershipPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-firecuda-innovation-mapping-layer.md"), fireCudaInnovationMappingLayerMarkdown(fireCudaInnovationMappingLayerPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-niche-functionality-ladder-match.md"), nicheFunctionalityLadderMatchMarkdown(nicheFunctionalityLadderMatchPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-ladder-receipt-acceleration.md"), ladderReceiptAccelerationMarkdown(ladderReceiptAccelerationPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-client-rank-movement-snapshot.md"), clientRankMovementSnapshotMarkdown(clientRankMovementSnapshotPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-full-system-ladder-push.md"), fullSystemLadderPushMarkdown(fullSystemLadderPushPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-system-claim-verification.md"), systemClaimVerificationMarkdown(systemClaimVerificationPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-google-search-console-rank-verification.md"), googleSearchConsoleRankVerificationMarkdown(googleSearchConsoleRankVerificationPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-system-capabilities.md"), systemCapabilitiesMarkdown(systemCapabilities), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-system-capability-delta.md"), systemCapabilityDeltaMarkdown(systemCapabilityDelta), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-seo-master-list-packet.md"), seoMasterListMarkdown(seoMasterListPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-rank-ownership-index.md"), rankOwnershipMarkdown(seoMasterListPacket.individualRankingIndex), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-route-metadata-manifest.md"), routeMetadataMarkdown(routeMetadataManifest), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-route-coverage-audit.md"), routeCoverageAuditMarkdown(routeCoverageAudit), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-deploy-readiness-audit.md"), deployReadinessAuditMarkdown(deployReadinessAudit), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-rank-slot-materialization-samples.md"), rankSlotMaterializationMarkdown(rankSlotMaterializationSamples), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-ai-search-discovery-packet.md"), aiDiscoveryMarkdown(aiDiscoveryPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-seo-submission-queue.md"), seoSubmissionQueueMarkdown(seoSubmissionQueue), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-supabase-measurement-contract.md"), supabaseMeasurementContractMarkdown(supabaseMeasurementContract), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-search-intent-promotion-packet.md"), searchIntentPromotionMarkdown(searchIntentPromotionPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-market-promotion-packet.md"), marketPromotionMarkdown(marketPromotionPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-podcast-source-promotion-packet.md"), podcastPromotionMarkdown(podcastPromotionPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-glb-source-promotion-packet.md"), glbPromotionMarkdown(glbPromotionPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-unified-proof-route-promotion-board.md"), unifiedProofRoutePromotionMarkdown(unifiedProofRoutePromotionBoard), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-deploy-proof-batch-packet.md"), deployProofBatchMarkdown(deployProofBatchPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-build-tooling-recovery-packet.md"), buildToolingRecoveryMarkdown(buildToolingRecoveryPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-ai-crawler-guidance-packet.md"), aiCrawlerGuidanceMarkdown(aiCrawlerGuidancePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-structured-data-catalog.md"), structuredDataCatalogMarkdown(structuredDataCatalog), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-backlink-authority-packet.md"), backlinkAuthorityMarkdown(backlinkAuthorityPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-supabase-seo-refinement-views.md"), supabaseRefinementViewsMarkdown(supabaseRefinementViewsPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-post-deploy-compare-handoff.md"), postDeployCompareHandoffMarkdown(postDeployCompareHandoffPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-quiet-signal-activation-packet.md"), quietSignalActivationMarkdown(quietSignalActivationPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-ranked-blog-watch-bridge-packet.md"), rankedBlogWatchBridgeMarkdown(rankedBlogWatchBridgePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-release-pair-submission-packet.md"), releasePairSubmissionMarkdown(releasePairSubmissionPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-release-pair-submission-delta.md"), releasePairSubmissionDeltaMarkdown(releasePairSubmissionDeltaPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-delta-compare-refinement-packet.md"), deltaCompareRefinementMarkdown(deltaCompareRefinementPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-post-deploy-measurement-proof.md"), postDeployMeasurementProofMarkdown(postDeployMeasurementProofPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-firecuda-decision-queue-template.md"), fireCudaDecisionQueueTemplateMarkdown(fireCudaDecisionQueueTemplatePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-release-command-center.md"), releaseCommandCenterMarkdown(releaseCommandCenterPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-deployment-runtime-compatibility.md"), deploymentRuntimeCompatibilityMarkdown(deploymentRuntimeCompatibilityPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-deployment-runtime-fallback.md"), deploymentRuntimeFallbackMarkdown(deploymentRuntimeFallbackPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-build-proof-intake.md"), buildProofIntakeMarkdown(buildProofIntakePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-deploy-measurement-activation.md"), deployMeasurementActivationMarkdown(deployMeasurementActivationPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-route-pair-evidence-ledger.md"), routePairEvidenceLedgerMarkdown(routePairEvidenceLedgerPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-first-wave-action-queue.md"), firstWaveActionQueueMarkdown(firstWaveActionQueuePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-firecuda-promotion-receipts.md"), fireCudaPromotionReceiptMarkdown(fireCudaPromotionReceiptPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-master-list-expansion-gate.md"), masterListExpansionGateMarkdown(masterListExpansionGatePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-separate-lane-universe-starter.md"), separateLaneUniverseStarterMarkdown(separateLaneUniverseStarterPacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-separate-lane-receipt-bridge.md"), separateLaneReceiptBridgeMarkdown(separateLaneReceiptBridgePacket), "utf8")
  await writeFile(path.join(docsDir, "digitalhut-receipt-evidence-intake-schema.md"), receiptEvidenceIntakeSchemaMarkdown(receiptEvidenceIntakeSchemaPacket), "utf8")
  await writeFile(path.join(publicDir, "digitalhut-standby-status.json"), `${JSON.stringify(status, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-metric-freshness-gate.json"), `${JSON.stringify(metricFreshnessPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-fresh-seo-cluster-dump.json"), `${JSON.stringify(freshClusterDumpPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-website-language-impact.json"), `${JSON.stringify(websiteLanguageImpactPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-rank-finding-benchmark.json"), `${JSON.stringify(rankFindingBenchmarkPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-rank-jump-algorithm.json"), `${JSON.stringify(rankJumpAlgorithmPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-whiteboard-seo-structure.json"), `${JSON.stringify(whiteboardSeoStructurePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-functional-rank-boost-cluster-push.json"), `${JSON.stringify(functionalRankBoostClusterPushPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-longtail-competition-neighborhood.json"), `${JSON.stringify(longtailCompetitionNeighborhoodPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-movement-proof-audience-origin.json"), `${JSON.stringify(movementProofAudienceOriginPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-competition-framework-metric-push.json"), `${JSON.stringify(competitionFrameworkMetricPushPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-experience-cycle-niche-ownership.json"), `${JSON.stringify(experienceCycleNicheOwnershipPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-firecuda-innovation-mapping-layer.json"), `${JSON.stringify(fireCudaInnovationMappingLayerPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-niche-functionality-ladder-match.json"), `${JSON.stringify(nicheFunctionalityLadderMatchPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-ladder-receipt-acceleration.json"), `${JSON.stringify(ladderReceiptAccelerationPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-client-rank-movement-snapshot.json"), `${JSON.stringify(clientRankMovementSnapshotPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-full-system-ladder-push.json"), `${JSON.stringify(fullSystemLadderPushPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-system-claim-verification.json"), `${JSON.stringify(systemClaimVerificationPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-google-search-console-rank-verification.json"), `${JSON.stringify(googleSearchConsoleRankVerificationPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-system-capabilities.json"), `${JSON.stringify(systemCapabilities, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-seo-master-list-packet.json"), `${JSON.stringify(seoMasterListPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-rank-ownership-index.json"), `${JSON.stringify(seoMasterListPacket.individualRankingIndex, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-route-metadata-manifest.json"), `${JSON.stringify(routeMetadataManifest, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-route-coverage-audit.json"), `${JSON.stringify(routeCoverageAudit, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-deploy-readiness-audit.json"), `${JSON.stringify(deployReadinessAudit, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-rank-slot-materialization-samples.json"), `${JSON.stringify(rankSlotMaterializationSamples, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-ai-search-discovery-packet.json"), `${JSON.stringify(aiDiscoveryPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-seo-submission-queue.json"), `${JSON.stringify(seoSubmissionQueue, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-supabase-measurement-contract.json"), `${JSON.stringify(supabaseMeasurementContract, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-search-intent-promotion-packet.json"), `${JSON.stringify(searchIntentPromotionPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-market-promotion-packet.json"), `${JSON.stringify(marketPromotionPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-podcast-source-promotion-packet.json"), `${JSON.stringify(podcastPromotionPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-glb-source-promotion-packet.json"), `${JSON.stringify(glbPromotionPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-unified-proof-route-promotion-board.json"), `${JSON.stringify(unifiedProofRoutePromotionBoard, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-deploy-proof-batch-packet.json"), `${JSON.stringify(deployProofBatchPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-build-tooling-recovery-packet.json"), `${JSON.stringify(buildToolingRecoveryPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-ai-crawler-guidance-packet.json"), `${JSON.stringify(aiCrawlerGuidancePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-structured-data-catalog.json"), `${JSON.stringify(structuredDataCatalog, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-structured-data.jsonld"), `${JSON.stringify(structuredDataCatalog.jsonLd, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-backlink-authority-packet.json"), `${JSON.stringify(backlinkAuthorityPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-supabase-seo-refinement-views.json"), `${JSON.stringify(supabaseRefinementViewsPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-post-deploy-compare-handoff.json"), `${JSON.stringify(postDeployCompareHandoffPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-quiet-signal-activation-packet.json"), `${JSON.stringify(quietSignalActivationPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-ranked-blog-watch-bridge-packet.json"), `${JSON.stringify(rankedBlogWatchBridgePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-release-pair-submission-packet.json"), `${JSON.stringify(releasePairSubmissionPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-release-pair-submission-delta.json"), `${JSON.stringify(releasePairSubmissionDeltaPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-delta-compare-refinement-packet.json"), `${JSON.stringify(deltaCompareRefinementPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-post-deploy-measurement-proof.json"), `${JSON.stringify(postDeployMeasurementProofPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-firecuda-decision-queue-template.json"), `${JSON.stringify(fireCudaDecisionQueueTemplatePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-release-command-center.json"), `${JSON.stringify(releaseCommandCenterPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-deployment-runtime-compatibility.json"), `${JSON.stringify(deploymentRuntimeCompatibilityPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-deployment-runtime-fallback.json"), `${JSON.stringify(deploymentRuntimeFallbackPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-build-proof-intake.json"), `${JSON.stringify(buildProofIntakePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-deploy-measurement-activation.json"), `${JSON.stringify(deployMeasurementActivationPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-route-pair-evidence-ledger.json"), `${JSON.stringify(routePairEvidenceLedgerPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-first-wave-action-queue.json"), `${JSON.stringify(firstWaveActionQueuePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-firecuda-promotion-receipts.json"), `${JSON.stringify(fireCudaPromotionReceiptPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-master-list-expansion-gate.json"), `${JSON.stringify(masterListExpansionGatePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-separate-lane-universe-starter.json"), `${JSON.stringify(separateLaneUniverseStarterPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-separate-lane-receipt-bridge.json"), `${JSON.stringify(separateLaneReceiptBridgePacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "digitalhut-receipt-evidence-intake-schema.json"), `${JSON.stringify(receiptEvidenceIntakeSchemaPacket, null, 2)}\n`, "utf8")
  await writeFile(path.join(publicDir, "llms.txt"), llmsTxt(aiCrawlerGuidancePacket), "utf8")
  await writeFile(files.systemCapabilityDelta, `${JSON.stringify(systemCapabilityDelta, null, 2)}\n`, "utf8")

  console.log(JSON.stringify({
    generatedAt,
    productReady: Object.values(product).filter(Boolean).length,
    productTotal: Object.keys(product).length,
    sitemapUrls: seoProof.sitemapUrls,
    refinementActions: compareContrastRefinement.actions.length,
    readyAlerts: readyAlerts.alerts.length,
    systemCapabilities: "rendered",
    capabilityDelta: systemCapabilityDelta.movementScore,
    metricFreshnessStatus: metricFreshnessPacket.status,
    freshClusterDumpStatus: freshClusterDumpPacket.status,
    freshClusterDumpClusters: freshClusterDumpPacket.clusterCount,
    freshClusterKeywordSeeds: freshClusterDumpPacket.keywordSeedCount,
    websiteLanguageImpactStatus: websiteLanguageImpactPacket.status,
    rankFindingBenchmarkStatus: rankFindingBenchmarkPacket.status,
    rankFindingBenchmarkRows: rankFindingBenchmarkPacket.rowCount,
    rankUniverseFloor: rankFindingBenchmarkPacket.rankUniverseFloor,
    rankJumpAlgorithmStatus: rankJumpAlgorithmPacket.status,
    rankJumpScoredRows: rankJumpAlgorithmPacket.counts.scoredRows,
    rankJumpStagedRows: rankJumpAlgorithmPacket.counts.stagedWaitingLiveProof,
    rankJumpBlogCap24h: rankJumpAlgorithmPacket.guardrails.maxBlogPostsPer24Hours,
    whiteboardSeoStructureStatus: whiteboardSeoStructurePacket.status,
    whiteboardBlogCap24h: whiteboardSeoStructurePacket.normalBlogCap24h,
    whiteboardStages: whiteboardSeoStructurePacket.stages.length,
    functionalRankBoostStatus: functionalRankBoostClusterPushPacket.status,
    functionalRankBoostClusters: functionalRankBoostClusterPushPacket.clusterCount,
    competitionNeighborhoodStatus: longtailCompetitionNeighborhoodPacket.status,
    competitionNeighborhoodRows: longtailCompetitionNeighborhoodPacket.rowCount,
    movementProofStatus: movementProofAudienceOriginPacket.movementProofStatus,
    originProofStatus: movementProofAudienceOriginPacket.originProofStatus,
    originBuckets: movementProofAudienceOriginPacket.originBucketCount,
    rankEscapeTarget: movementProofAudienceOriginPacket.firstEscapeTarget,
    nextVisitorTarget: movementProofAudienceOriginPacket.nextVisitorTarget,
    competitionFrameworkMetricPushStatus: competitionFrameworkMetricPushPacket.status,
    competitionFrameworkRead: competitionFrameworkMetricPushPacket.frameworkRead,
    competitionFeatureScore: competitionFrameworkMetricPushPacket.scores.featureScore,
    competitionProofScore: competitionFrameworkMetricPushPacket.scores.proofScore,
    competitionExpansionScore: competitionFrameworkMetricPushPacket.scores.expansionScore,
    compatibleCompetitorClasses: competitionFrameworkMetricPushPacket.compatibleNow.length,
    heldCompetitorClasses: competitionFrameworkMetricPushPacket.heldUntilReceipts.length,
    experienceCycleNicheOwnershipStatus: experienceCycleNicheOwnershipPacket.status,
    experienceCycleScore: experienceCycleNicheOwnershipPacket.cycleScore,
    experienceCycleCompletedStages: experienceCycleNicheOwnershipPacket.completedStageCount,
    experienceCycleStrongestStage: experienceCycleNicheOwnershipPacket.strongestStage,
    occupiedNichePosts: experienceCycleNicheOwnershipPacket.nichePosts.length,
    fireCudaInnovationMappingStatus: fireCudaInnovationMappingLayerPacket.status,
    fireCudaMapAuthorityScore: fireCudaInnovationMappingLayerPacket.mapAuthorityScore,
    fireCudaPhysicalBase: fireCudaInnovationMappingLayerPacket.physicalBase,
    fireCudaEnterpriseInterfaceTarget: fireCudaInnovationMappingLayerPacket.enterpriseInterfaceTarget,
    fireCudaMapTables: fireCudaInnovationMappingLayerPacket.mapTables.length,
    fireCudaCurrentPhysicalTier: fireCudaInnovationMappingLayerPacket.capacityGovernance.currentPhysicalTier,
    fireCudaNextRackTarget: fireCudaInnovationMappingLayerPacket.capacityGovernance.nextRackTarget,
    fireCudaCapacityUsageReceiptStatus: fireCudaInnovationMappingLayerPacket.capacityGovernance.currentUsageReceiptStatus,
    nicheFunctionalityLadderStatus: nicheFunctionalityLadderMatchPacket.status,
    nicheFunctionalityTargetWinRatio: nicheFunctionalityLadderMatchPacket.targetWinRatio,
    nicheFunctionalityPassedMatches: nicheFunctionalityLadderMatchPacket.passedMatches,
    nicheFunctionalityHeldMatches: nicheFunctionalityLadderMatchPacket.heldMatches,
    nicheFunctionalityLeadShout: nicheFunctionalityLadderMatchPacket.leadExactShout,
    ladderReceiptAccelerationStatus: ladderReceiptAccelerationPacket.status,
    ladderReceiptPriorityRungs: ladderReceiptAccelerationPacket.priority.length,
    ladderReceiptHeldMatches: ladderReceiptAccelerationPacket.heldMatches,
    clientRankMovementSnapshotStatus: clientRankMovementSnapshotPacket.status,
    clientRankMovementPageViewStatus: clientRankMovementSnapshotPacket.refreshedPageViews.status,
    clientRankMovementRegionMarkets: clientRankMovementSnapshotPacket.regionMarketTargets.length,
    clientRankMovementBacklinkRoutes: clientRankMovementSnapshotPacket.backlinkSystem.length,
    fullSystemLadderPushStatus: fullSystemLadderPushPacket.status,
    fullSystemLadderLiveRankDropStatus: fullSystemLadderPushPacket.liveRankDropStatus,
    systemClaimVerificationStatus: systemClaimVerificationPacket.status,
    systemClaimOpenAiBillingRoute: systemClaimVerificationPacket.openaiBillingApi.route,
    systemClaimCodexProStatus: systemClaimVerificationPacket.codexProClaim.verificationStatus,
    googleSearchConsoleRankVerificationStatus: googleSearchConsoleRankVerificationPacket.status,
    googleLiveRankStatus: googleSearchConsoleRankVerificationPacket.googleLiveRankStatus,
    googleRankHigherStatus: googleSearchConsoleRankVerificationPacket.rankHigherStatus,
    googleRankProviderRoute: googleSearchConsoleRankVerificationPacket.googleProviderRoute,
    seoMasterListVariations: seoMasterListPacket.counts.totalVariationCapacity,
    rankOwnershipSlots: seoMasterListPacket.individualRankingIndex.totalIndividualRanks,
    routeMetadataRoutes: routeMetadataManifest.routeCount,
    launchTargetRoutes: routeMetadataManifest.launchTargetRoutes,
    routeCoverageStatus: routeCoverageAudit.status,
    routeCoverageMissing: routeCoverageAudit.missingMetadataRoutes.length,
    routeCoverageExtra: routeCoverageAudit.extraMetadataRoutes.length,
    deployReadinessStatus: deployReadinessAudit.status,
    aiDiscoveryRoutes: aiDiscoveryPacket.discoveryRoutes.length,
    rankSlotMaterializationSamples: rankSlotMaterializationSamples.sampleCount,
    seoSubmissionStatus: seoSubmissionQueue.status,
    seoSubmissionImmediateRoutes: seoSubmissionQueue.immediateSubmissionCount,
    supabaseMeasurementStatus: supabaseMeasurementContract.status,
    supabaseMeasurementEventGroups: supabaseMeasurementContract.eventCount,
    searchIntentPromotionStatus: searchIntentPromotionPacket.status,
    searchIntentPromotionCandidates: searchIntentPromotionPacket.priorityIntentCandidates.length,
    searchIntentSourceBridges: searchIntentPromotionPacket.sourceBacklinkBridge.length,
    marketPromotionStatus: marketPromotionPacket.status,
    marketPromotionLanes: marketPromotionPacket.marketLaneCount,
    podcastPromotionStatus: podcastPromotionPacket.status,
    podcastPromotionLanes: podcastPromotionPacket.podcastLanes.length,
    podcastPromotionRoutes: podcastPromotionPacket.routeCount,
    glbPromotionStatus: glbPromotionPacket.status,
    glbPromotionLanes: glbPromotionPacket.glbLanes.length,
    glbPromotionRoutes: glbPromotionPacket.routeCount,
    unifiedProofRouteBoardStatus: unifiedProofRoutePromotionBoard.status,
    unifiedProofRouteBoardRoutes: unifiedProofRoutePromotionBoard.routeCount,
    unifiedProofRouteBoardPushNext: unifiedProofRoutePromotionBoard.stageCounts["push-next-deploy-proof"] || 0,
    deployProofBatchStatus: deployProofBatchPacket.status,
    deployProofBatchRoutes: deployProofBatchPacket.releaseRouteCount,
    buildToolingRecoveryStatus: buildToolingRecoveryPacket.status,
    localVitePresent: buildToolingRecoveryPacket.localVitePresent,
    releaseGateMatrix: buildToolingRecoveryPacket.releaseGateMatrix.length,
    aiCrawlerGuidanceStatus: aiCrawlerGuidancePacket.status,
    llmsTxt: "generated",
    structuredDataCatalogStatus: structuredDataCatalog.status,
    structuredDataGraphNodes: structuredDataCatalog.schemaCount,
    backlinkAuthorityStatus: backlinkAuthorityPacket.status,
    backlinkAuthorityRoutes: backlinkAuthorityPacket.releaseRouteCount,
    supabaseRefinementViewsStatus: supabaseRefinementViewsPacket.status,
    supabaseRefinementViews: supabaseRefinementViewsPacket.viewCount,
    postDeployCompareHandoffStatus: postDeployCompareHandoffPacket.status,
    postDeployCompareHandoffRoutes: postDeployCompareHandoffPacket.releaseRouteCount,
    quietSignalActivationStatus: quietSignalActivationPacket.status,
    quietSignalActivationRoutes: quietSignalActivationPacket.activationRouteCount,
    rankedBlogWatchBridgeStatus: rankedBlogWatchBridgePacket.status,
    rankedBlogWatchBridgePairs: rankedBlogWatchBridgePacket.pairedRoutes,
    releasePairSubmissionStatus: releasePairSubmissionPacket.status,
    releasePairSubmissionTargets: releasePairSubmissionPacket.submissionTargetCount,
    releasePairSubmissionDeltaStatus: releasePairSubmissionDeltaPacket.status,
    releasePairSubmissionDeltaTargets: releasePairSubmissionDeltaPacket.missingTargetCount,
    deltaCompareRefinementStatus: deltaCompareRefinementPacket.status,
    deltaCompareRefinementPairs: deltaCompareRefinementPacket.pairDecisionCount,
    postDeployMeasurementProofStatus: postDeployMeasurementProofPacket.status,
    postDeployMeasurementProofEvents: postDeployMeasurementProofPacket.measurementEventCount,
    orderedInspectionSteps: postDeployMeasurementProofPacket.orderedInspectionSequence.length,
    fireCudaDecisionQueueStatus: fireCudaDecisionQueueTemplatePacket.status,
    fireCudaDecisionQueuePromote: fireCudaDecisionQueueTemplatePacket.promotionQueueCount,
    fireCudaDecisionQueueRewrite: fireCudaDecisionQueueTemplatePacket.rewriteQueueCount,
    fireCudaDecisionQueueHold: fireCudaDecisionQueueTemplatePacket.holdQueueCount,
    releaseCommandCenterStatus: releaseCommandCenterPacket.status,
    releaseCommandCenterTargets: releaseCommandCenterPacket.releaseTargets,
    deploymentRuntimeCompatibilityStatus: deploymentRuntimeCompatibilityPacket.status,
    deploymentRuntimeCompatibilityChecks: deploymentRuntimeCompatibilityPacket.checks.length,
    deploymentRuntimeFallbackStatus: deploymentRuntimeFallbackPacket.status,
    buildProofIntakeStatus: buildProofIntakePacket.status,
    buildProofIntakeEvidenceTypes: buildProofIntakePacket.evidenceTypes.length,
    deployMeasurementActivationStatus: deployMeasurementActivationPacket.status,
    deployMeasurementActivationRoutes: deployMeasurementActivationPacket.firstWaveRouteCount,
    routePairEvidenceLedgerStatus: routePairEvidenceLedgerPacket.status,
    routePairEvidenceLedgerPairs: routePairEvidenceLedgerPacket.pairCount,
    routePairEvidenceLedgerFirstWave: routePairEvidenceLedgerPacket.firstWavePairCount,
    firstWaveActionQueueStatus: firstWaveActionQueuePacket.status,
    firstWaveActionQueueActions: firstWaveActionQueuePacket.actionCount,
    fireCudaPromotionReceiptStatus: fireCudaPromotionReceiptPacket.status,
    fireCudaPromotionReceiptCount: fireCudaPromotionReceiptPacket.receiptCount,
    masterListExpansionGateStatus: masterListExpansionGatePacket.status,
    masterListExpansionGateOpen: masterListExpansionGatePacket.openGateCount,
    masterListExpansionGateHeldSlots: masterListExpansionGatePacket.heldSlotTotal,
    separateLaneUniverseStatus: separateLaneUniverseStarterPacket.status,
    separateLaneUniverseCount: separateLaneUniverseStarterPacket.separateLaneCount,
    separateLaneUniverseCapacity: separateLaneUniverseStarterPacket.totalSeparateCapacity,
    separateLaneReceiptBridgeStatus: separateLaneReceiptBridgePacket.status,
    separateLaneReceiptBridgeOpen: separateLaneReceiptBridgePacket.openBridgeCount,
    separateLaneReceiptBridgeHeldSlots: separateLaneReceiptBridgePacket.heldSlots,
    receiptEvidenceIntakeStatus: receiptEvidenceIntakeSchemaPacket.status,
    receiptEvidenceIntakeSchemas: receiptEvidenceIntakeSchemaPacket.schemaCount,
    resumeItems: resumeQueue.length
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})









