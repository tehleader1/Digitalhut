const seoClaimLanes = [
  {
    id: "full-system-entertainment-observatory",
    lane: "Full System Entertainment Observatory",
    role: "daily video watcher looking for a richer session than a plain video page",
    variationCapacity: 386640,
    countedRankSlots: false,
    proofRoute: "/watch/full-view-episode-alternative",
    measurementSignals: ["homepage entry", "autoplay start", "3D Model View open", "podcast/source interrupt", "search intent"],
    backlinkTargets: ["watch proof route", "blog proof route", "3D model source", "podcast/source page", "AI discovery packet", "sitemap metadata"]
  },
  {
    id: "full-entertainment-dapp-alternative",
    lane: "Full Entertainment Dapp Alternative",
    role: "viewer looking for a complete alternative to a plain YouTube session",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/full-view-episode-alternative",
    measurementSignals: ["homepage entry", "autoplay start", "next episode", "3D Model View open", "podcast/source interrupt", "live analytics read"],
    backlinkTargets: ["YouTube session tool discussion", "AI video tool page", "3D viewer source", "podcast/source page", "watch proof route"]
  },
  {
    id: "gaming-3d-world-observatory",
    lane: "Gaming 3D World Observatory",
    role: "gamer searching builds, worlds, servers, maps, walkthroughs, and 3D previews",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/game-world-glb-presentation",
    measurementSignals: ["GLB Model View open", "autoplay start", "watch route open", "source/backlink open"],
    backlinkTargets: ["game build source", "mod page", "3D model source", "server guide", "watch proof route"]
  },
  {
    id: "real-estate-3d-tour-observatory",
    lane: "Real Estate 3D Tour Observatory",
    role: "buyer, agent, or client comparing homes, agencies, resorts, rentals, and property models",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/real-estate-3d-tour-observatory",
    measurementSignals: ["GLB place preview", "category lane select", "source/backlink open", "watch proof open"],
    backlinkTargets: ["agency listing", "property page", "virtual tour source", "local market guide", "watch proof route"]
  },
  {
    id: "planetary-space-observatory",
    lane: "Planetary And Space Observatory",
    role: "viewer researching planets, launches, telescopes, orbital visuals, and space explainers",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/planetary-space-visual-observatory",
    measurementSignals: ["research source open", "GLB environment preview", "timeline read", "blog proof open"],
    backlinkTargets: ["space agency source", "launch article", "research dataset", "orbital model source", "watch proof route"]
  },
  {
    id: "exotic-environment-visual-experience",
    lane: "Exotic Environment Visual Experience",
    role: "traveler, gamer, or researcher exploring unusual environments, caves, reefs, islands, ruins, and resorts",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/exotic-environment-visual-experience",
    measurementSignals: ["GLB environment preview", "source/backlink open", "autoplay start", "watch proof open"],
    backlinkTargets: ["environment source", "travel guide", "research article", "3D environment source", "watch proof route"]
  },
  {
    id: "architecture-structure-engineering",
    lane: "Architecture Structure Engineering",
    role: "builder, engineer, student, or owner studying structures, layouts, materials, and 3D models",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/architecture-structure-engineering-visual",
    measurementSignals: ["GLB structure preview", "source route open", "timeline read", "search intent"],
    backlinkTargets: ["engineering source", "architecture model", "building code explainer", "project guide", "watch proof route"]
  },
  {
    id: "developer-programmer-research",
    lane: "Developer Programmer Research",
    role: "developer, programmer, or technical researcher studying tools, APIs, code, docs, and demos",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/developer-programmer-research-observatory",
    measurementSignals: ["documentation source open", "blog proof open", "search intent", "watch proof open", "Supabase event read", "Search Console row"],
    backlinkTargets: ["official documentation", "GitHub source", "API guide", "developer article", "cloud architecture note", "watch proof route"]
  },
  {
    id: "ai-video-podcast-source-explainer",
    lane: "AI Video Podcast Source Explainer",
    role: "viewer asking what a video or podcast is saying and wanting source-backed context",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/ai-video-podcast-source-explainer",
    measurementSignals: ["podcast/source interrupt", "search intent", "source/backlink open", "autoplay start"],
    backlinkTargets: ["podcast source", "video source", "summary proof", "creator page", "watch proof route"]
  },
  {
    id: "social-reel-meme-analysis",
    lane: "Social Reel Meme Analysis",
    role: "viewer decoding reels, shorts, memes, funny clips, trends, and social moments",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/social-reel-meme-analysis",
    measurementSignals: ["autoplay start", "watch route open", "podcast/source interrupt", "source/backlink open"],
    backlinkTargets: ["creator page", "trend source", "mainstream video source", "podcast/source moment", "watch proof route"]
  },
  {
    id: "virtual-travel-resort-vacation",
    lane: "Virtual Travel Resort Vacation",
    role: "traveler comparing vacation ideas, resorts, rentals, places, and visual previews before booking",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/virtual-travel-resort-vacation",
    measurementSignals: ["GLB place preview", "category lane select", "source/backlink open", "watch proof open"],
    backlinkTargets: ["resort page", "travel guide", "map source", "vacation review", "watch proof route"]
  },
  {
    id: "market-company-observatory",
    lane: "Market Company Observatory",
    role: "viewer checking companies, stocks, business signals, charts, products, and source-backed market context",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/market-company-observatory",
    measurementSignals: ["market open", "source/backlink open", "search intent", "watch proof open"],
    backlinkTargets: ["company source", "market chart", "financial source", "product page", "watch proof route"]
  },
  {
    id: "workforce-training-visual-system",
    lane: "Workforce Training Visual System",
    role: "worker, trainer, or team lead using visual media to understand jobs, safety, tools, and workflows",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/workforce-training-visual-system",
    measurementSignals: ["watch route open", "source route open", "timeline read", "search intent"],
    backlinkTargets: ["training source", "workflow guide", "tool documentation", "safety article", "watch proof route"]
  },
  {
    id: "education-study-visual-research",
    lane: "Education Study Visual Research",
    role: "student, teacher, parent, or researcher seeking visual explainers, studies, facts, and source trails",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/education-study-visual-research",
    measurementSignals: ["blog proof open", "source route open", "search intent", "watch route open"],
    backlinkTargets: ["education source", "dataset", "research article", "reference page", "watch proof route"]
  },
  {
    id: "local-life-errands-companion",
    lane: "Local Life Errands Companion",
    role: "everyday person searching local food, stores, rides, chores, deals, schedules, and decisions",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/local-life-errands-companion",
    measurementSignals: ["search intent", "quick panel select", "source/backlink open", "watch route open"],
    backlinkTargets: ["local source", "store page", "review source", "map source", "watch proof route"]
  },
  {
    id: "home-project-diy-visual",
    lane: "Home Project DIY Visual",
    role: "homeowner or renter planning repairs, projects, rooms, furniture, tools, and visual walkthroughs",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/home-project-diy-visual",
    measurementSignals: ["GLB structure preview", "source route open", "search intent", "watch route open"],
    backlinkTargets: ["DIY guide", "tool source", "room model", "project checklist", "watch proof route"]
  },
  {
    id: "lifestyle-event-visual-experience",
    lane: "Lifestyle Event Visual Experience",
    role: "viewer exploring family events, concerts, sports, fitness, food, culture, and lifestyle media",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/lifestyle-event-visual-experience",
    measurementSignals: ["autoplay start", "watch route open", "source/backlink open", "podcast/source interrupt"],
    backlinkTargets: ["event source", "creator page", "venue guide", "lifestyle article", "watch proof route"]
  },
  {
    id: "creator-brand-product-showcase",
    lane: "Creator Brand Product Showcase",
    role: "creator, client, or buyer comparing products, brands, demos, reviews, and social proof",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/creator-brand-product-showcase",
    measurementSignals: ["source/backlink open", "watch route open", "search intent", "GLB Model View open"],
    backlinkTargets: ["brand page", "product source", "creator page", "review source", "watch proof route"]
  },
  {
    id: "international-language-side-markets",
    lane: "International Language Side Markets",
    role: "global viewer searching local-language entertainment, research, travel, products, and visual media context",
    variationCapacity: 11000000,
    countedRankSlots: true,
    proofRoute: "/watch/international-language-side-markets",
    measurementSignals: ["referral entry", "search intent", "source/backlink open", "watch proof open"],
    backlinkTargets: ["regional source", "translated guide", "local market source", "international community", "watch proof route"]
  },  {
    id: "lunch-local-food",
    lane: "Lunch And Local Food",
    role: "everyday person choosing food, lunch, menu, or local reviews during off time",
    variationCapacity: 571536,
    countedRankSlots: true,
    proofRoute: "/watch/looking-for-lunch-visual-observatory",
    measurementSignals: ["search intent", "backlink source open", "watch route open"],
    backlinkTargets: ["restaurant/menu source", "local review source", "food map source", "watch proof route"]
  },
  {
    id: "rideshare-commute",
    lane: "Rideshare And Commute",
    role: "traveler or commuter checking pickup, traffic, airport, or late-night route context",
    variationCapacity: 344064,
    countedRankSlots: true,
    proofRoute: "/watch/calling-an-uber-visual-trip-guide",
    measurementSignals: ["quick panel select", "timeline read", "source/backlink open"],
    backlinkTargets: ["rideshare/travel guide", "airport source", "traffic source", "watch proof route"]
  },
  {
    id: "flight-travel-booking",
    lane: "Flight And Travel Booking",
    role: "traveler comparing flights, airports, delays, layovers, and booking decisions",
    variationCapacity: 419328,
    countedRankSlots: true,
    proofRoute: "/watch/booking-flight-ticket-visual-guide",
    measurementSignals: ["category lane select", "GLB place preview", "watch proof open"],
    backlinkTargets: ["airline or airport source", "flight status source", "travel guide", "watch proof route"]
  },
  {
    id: "wiki-quick-research",
    lane: "Wiki And Quick Research",
    role: "student, parent, researcher, or developer looking for a source-backed quick explanation",
    variationCapacity: 344064,
    countedRankSlots: true,
    proofRoute: "/watch/wiki-lookup-visual-research-hub",
    measurementSignals: ["blog proof open", "source route open", "search intent"],
    backlinkTargets: ["reference page", "dataset", "official documentation", "research article"]
  },
  {
    id: "funny-mainstream-video",
    lane: "Funny Mainstream Video",
    role: "viewer trying to understand a funny, viral, reel, shorts, meme, or mainstream video moment",
    variationCapacity: 442368,
    countedRankSlots: true,
    proofRoute: "/watch/funny-mainstream-video-explained",
    measurementSignals: ["autoplay start", "watch route open", "podcast/source interrupt"],
    backlinkTargets: ["creator/source page", "first-source article", "mainstream video source", "podcast/source moment"]
  },
  {
    id: "errands-review-before-buying",
    lane: "Errands And Review Before Buying",
    role: "buyer checking groceries, stores, product reviews, deals, and local errands before spending",
    variationCapacity: 451584,
    countedRankSlots: true,
    proofRoute: "/watch/search-intent-radar-visual-experience",
    measurementSignals: ["source/backlink open", "blog proof open", "quick panel select"],
    backlinkTargets: ["review source", "product source", "local store source", "watch proof route"]
  }
]

const seoRankOwnership = {
  owner: "Digitalhut.app",
  canonicalDomain: "https://www.digitalhut.app",
  globalRankStart: 1,
  countedLanes: seoClaimLanes.filter((lane) => lane.countedRankSlots !== false),
  umbrellaLanes: seoClaimLanes.filter((lane) => lane.countedRankSlots === false)
}

seoRankOwnership.totalIndividualRanks = seoRankOwnership.countedLanes.reduce((total, lane) => total + lane.variationCapacity, 0)
seoRankOwnership.globalRankEnd = seoRankOwnership.totalIndividualRanks

function normalizedText(value = ""){
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

function deterministicSeoHash(value = ""){
  return Array.from(String(value || "")).reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) >>> 0, 2166136261)
}

function rankOffsetForLane(laneId = ""){
  let offset = 0
  for(const lane of seoRankOwnership.countedLanes){
    if(lane.id === laneId) return offset
    offset += lane.variationCapacity || 0
  }
  return 0
}

function explicitClaimLaneForQuery(query = ""){
  const value = normalizedText(query)
  const hints = [
    {id: "rideshare-commute", terms: ["uber", "rideshare", "ride share", "taxi", "pickup", "commute", "train station", "late night ride"]},
    {id: "flight-travel-booking", terms: ["flight", "flights", "airline", "airport", "layover", "boarding", "cheap ticket", "travel booking"]},
    {id: "wiki-quick-research", terms: ["wiki", "wikipedia", "what is", "coral reef", "climate", "extinction", "public information", "facts about"]},
    {id: "funny-mainstream-video", terms: ["funny", "funny grocery", "clip explained", "what am i watching"]},
    {id: "errands-review-before-buying", terms: ["buy", "product", "reviews", "reddit", "grocery", "groceries", "store", "deals", "pharmacy", "shopping"]},
    {id: "lunch-local-food", terms: ["lunch", "food", "restaurant", "restaurants", "menu", "cafe", "eat", "meal"]},
    {id: "full-entertainment-dapp-alternative", terms: ["youtube alternative", "entertainment dapp", "autoplay next episode", "3d model view podcast", "observatory entertainment", "video watching 3d podcast"]},
    {id: "gaming-3d-world-observatory", terms: ["game world", "gaming", "gamer", "server build", "top builds", "horror corridor", "vr room", "map walkthrough", "game build"]},
    {id: "real-estate-3d-tour-observatory", terms: ["real estate", "house model", "property", "agency", "housing model", "virtual tour", "rental walkthrough"]},
    {id: "planetary-space-observatory", terms: ["planet", "space", "launch", "moon", "mars", "orbital", "telescope", "nasa", "rocket"]},
    {id: "exotic-environment-visual-experience", terms: ["exotic", "reef", "island", "cave", "jungle", "desert", "resort environment", "ancient ruins"]},
    {id: "architecture-structure-engineering", terms: ["architecture", "structure", "engineering", "building", "floor plan", "material", "construction", "bridge", "layout"]},
    {id: "developer-programmer-research", terms: ["developer", "programmer", "coding", "api", "github", "documentation", "framework", "software", "code", "on call", "on-call", "system engineer", "devops", "infrastructure", "uptime", "incident", "supabase", "vercel", "google cloud", "firecuda", "database maintenance", "cloud database"]},
    {id: "ai-video-podcast-source-explainer", terms: ["ai video", "podcast", "source moment", "explain this video", "video summary", "what is this video", "transcript", "speaker"]},
    {id: "social-reel-meme-analysis", terms: ["reel", "tiktok", "instagram", "shorts", "meme", "viral", "social media"]},
    {id: "virtual-travel-resort-vacation", terms: ["vacation", "resort", "hotel", "travel", "tour", "destination", "beach", "booking trip"]},
    {id: "market-company-observatory", terms: ["stock", "market", "company", "ticker", "earnings", "chart", "volume", "bullish", "bearish"]},
    {id: "workforce-training-visual-system", terms: ["workforce", "training", "job", "safety", "workflow", "equipment", "employee", "worksite"]},
    {id: "education-study-visual-research", terms: ["study", "research", "school", "education", "student", "teacher", "facts", "dataset"]},
    {id: "local-life-errands-companion", terms: ["errand", "local", "near me", "schedule", "chores", "store hours", "daily"]},
    {id: "home-project-diy-visual", terms: ["home project", "diy", "repair", "renovation", "furniture", "room", "garage", "yard"]},
    {id: "lifestyle-event-visual-experience", terms: ["family", "event", "concert", "sports", "fitness", "culture", "vlog", "lifestyle"]},
    {id: "creator-brand-product-showcase", terms: ["brand", "creator", "product demo", "showcase", "unboxing", "client", "portfolio"]},
    {id: "international-language-side-markets", terms: ["international", "global", "spanish", "french", "arabic", "hindi", "local language", "regional"]},
  ]
  const match = hints.find((item) => item.terms.some((term) => value.includes(term)))
  return match ? seoClaimLanes.find((lane) => lane.id === match.id) : null
}

function fallbackLaneForQuery(query = ""){
  const value = normalizedText(query)
  if(value.includes("3d") || value.includes("model") || value.includes("video") || value.includes("podcast") || value.includes("youtube")) return seoClaimLanes.find((lane) => lane.id === "full-entertainment-dapp-alternative") || seoClaimLanes[0]
  return seoClaimLanes.find((lane) => lane.id === "errands-review-before-buying")
}

export function seoSearchClaimForQuery(query = "", context = {}){
  const rawQuery = String(query || "").replace(/\s+/g, " ").trim()
  const lane = explicitClaimLaneForQuery(rawQuery) || fallbackLaneForQuery(`${context.category || ""} ${rawQuery}`)
  const umbrellaLane = seoRankOwnership.umbrellaLanes[0]
  const capacity = Math.max(1, lane.variationCapacity || 1)
  const clusterRankNumber = (deterministicSeoHash(`${lane.id}:${rawQuery.toLowerCase()}`) % capacity) + 1
  const globalRankNumber = lane.countedRankSlots === false ? null : rankOffsetForLane(lane.id) + clusterRankNumber
  const rankParams = lane.countedRankSlots === false
    ? `dh_lane=${encodeURIComponent(lane.id)}&dh_claim=umbrella-anchor`
    : `dh_rank=${clusterRankNumber}&dh_global_rank=${globalRankNumber}&dh_lane=${encodeURIComponent(lane.id)}`
  const canonicalRoute = lane.proofRoute
  return {
    query: rawQuery,
    owner: seoRankOwnership.owner,
    canonicalDomain: seoRankOwnership.canonicalDomain,
    laneId: lane.id,
    lane: lane.lane,
    umbrellaLane: umbrellaLane?.lane || "Full System Entertainment Observatory",
    rankOwnershipMode: lane.countedRankSlots === false ? "umbrella-anchor" : "counted-rank-slot",
    clusterRankNumber,
    globalRankNumber,
    globalRange: `${seoRankOwnership.globalRankStart}-${seoRankOwnership.globalRankEnd}`,
    totalIndividualRanks: seoRankOwnership.totalIndividualRanks,
    canonicalRoute,
    rankUrl: `${canonicalRoute}?${rankParams}`,
    metadataTitle: `${rawQuery || lane.lane} | DigitalHut ${lane.lane} Proof`,
    metadataDescription: `${rawQuery || lane.lane} on Digitalhut.app: video, 3D Model View, podcast/source moments, live analytics, watch proof, category proof, and backlink/source routing for ${lane.lane}.`,
    measurementSignals: lane.measurementSignals,
    backlinkTargets: lane.backlinkTargets,
    supabaseSignals: ["search_run", "proof_route_open", "backlink_source_open", "watch_route_open", "category_proof_open"],
    nextAction: "Route the search into the canonical proof page, measure search/proof/source behavior, and promote only if real visitors open the watch, blog, source, GLB, podcast, or category proof path."
  }
}

function regeneratedBacklinkPlanForClaim(claim, query = ""){
  const anchor = query || `${claim.lane} DigitalHut observatory`
  const ownedUrl = `${claim.canonicalDomain}${claim.rankUrl}`
  const proofUrl = `${claim.canonicalDomain}${claim.canonicalRoute}`
  return {
    anchorText: anchor,
    ownedReturnPath: ownedUrl,
    placements: [
      {type: "watch-proof", label: `${anchor} watch proof`, url: proofUrl},
      {type: "blog-proof", label: `${anchor} blog proof`, url: `${claim.canonicalDomain}/blog?dh_lane=${encodeURIComponent(claim.laneId)}`},
      {type: "category-proof", label: `${claim.lane} category proof`, url: `${claim.canonicalDomain}/category/${encodeURIComponent(claim.laneId)}`},
      {type: "source-backlink-target", label: `${anchor} source trail`, url: ownedUrl},
      {type: "crawler-receipt", label: "DigitalHut SEO claim coverage", url: `${claim.canonicalDomain}/digitalhut-seo-claim-coverage.json`},
      {type: "operator-receipt", label: "DigitalHut operator search trail", url: `${claim.canonicalDomain}/digitalhut-operator-search-trail-latest.json`}
    ],
    externalCandidateRules: [
      "Only place a backlink where the answer is useful and human-readable.",
      "Do not spam comments, profiles, or irrelevant directories.",
      "Prefer source pages, community discussions, docs, creator pages, podcast pages, and GLB/source references that match the lane."
    ]
  }
}
export function seoOperatorSearchTrailForRun(input = {}){
  const query = String(input.query || input.search || input.keyword || "").replace(/\s+/g, " ").trim()
  const claim = seoSearchClaimForQuery(query, {category: input.audience || input.category || "operator-search-run"})
  const runId = String(input.runId || `dh_search_run_${deterministicSeoHash(`${query}:${input.audience || ""}:${input.source || ""}`)}`)
  const movement = input.movement && typeof input.movement === "object" ? input.movement : {}
  const decision = String(input.decision || "watch-for-receipts")
  const status = decision.includes("promote") || Number(movement.pageViewsDelta || 0) > 0 || Number(movement.uniqueVisitorsDelta || 0) > 0
    ? "movement-candidate"
    : decision.includes("dry") || decision.includes("skip")
      ? "dry-pool"
      : "trail-planted"
  return {
    runId,
    createdAt: input.createdAt || new Date().toISOString(),
    operator: "DigitalHut Codex Overseer",
    runType: "operator-search-and-backlink-trail",
    query,
    audience: input.audience || "full entertainment observatory",
    source: input.source || "codex-search-cycle",
    status,
    decision,
    claim: {
      lane: claim.lane,
      laneId: claim.laneId,
      mode: claim.rankOwnershipMode,
      globalRankNumber: claim.globalRankNumber,
      totalIndividualRanks: claim.totalIndividualRanks,
      canonicalRoute: claim.canonicalRoute,
      rankUrl: claim.rankUrl,
      ownedReturnPath: `${claim.canonicalDomain}${claim.rankUrl}`
    },
    trail: {
      searchPhrase: query,
      proofRoute: `${claim.canonicalDomain}${claim.canonicalRoute}`,
      ownedReturnPath: `${claim.canonicalDomain}${claim.rankUrl}`,
      backlinkTargets: claim.backlinkTargets,
      regeneratedBacklinks: regeneratedBacklinkPlanForClaim(claim, query),
      measurementSignals: claim.measurementSignals,
      supabaseSignals: claim.supabaseSignals,
      sitemap: `${claim.canonicalDomain}/sitemap.xml`,
      publicReceipt: `${claim.canonicalDomain}/digitalhut-operator-search-trail-latest.json`
    },
    movement,
    nextAction: input.nextAction || claim.nextAction
  }
}
export function seoEntryTrailForEvent(eventName = "", input = {}){
  const path = String(input.path || input.routePath || "").split(/[?#]/)[0]
  const routeSlug = String(input.routeSlug || path.split("/").filter(Boolean).pop() || "")
  const label = String(input.label || input.title || input.category || "")
  const referrer = String(input.referrer || "")
  const sourceText = String(input.search || input.query || input.keywordHint || routeSlug || label || path || referrer || "")
  const routeType = path.startsWith("/watch/")
    ? "watch-proof-route"
    : path.startsWith("/blog/")
      ? "blog-proof-route"
      : path.startsWith("/category/")
        ? "category-proof-route"
        : path === "/" || path === ""
          ? "homepage-entry"
          : "system-route"
  const sourceType = eventName === "search_run"
    ? "typed-search"
    : eventName.includes("source") || eventName.includes("backlink")
      ? "source-backlink"
      : eventName.includes("glb")
        ? "3d-model-view"
        : eventName.includes("podcast")
          ? "podcast-source-moment"
          : eventName.includes("proof") || eventName.includes("route")
            ? routeType
            : "interaction"
  const claim = seoSearchClaimForQuery(sourceText, {category: input.category || routeType})
  return {
    sourceType,
    routeType,
    sourceText,
    referrerHost: hostFromUrl(referrer),
    ownedReturnPath: `${claim.canonicalDomain}${claim.rankUrl}`,
    trailTargets: [
      `${claim.canonicalDomain}${claim.canonicalRoute}`,
      `${claim.canonicalDomain}/blog`,
      `${claim.canonicalDomain}/digitalhut-seo-claim-coverage.json`,
      `${claim.canonicalDomain}/sitemap.xml`
    ],
    backlinkTrail: {
      lane: claim.lane,
      mode: claim.rankOwnershipMode,
      rankUrl: claim.rankUrl,
      measurementSignals: claim.measurementSignals,
      backlinkTargets: claim.backlinkTargets
    }
  }
}

function hostFromUrl(value = ""){
  try {
    return value ? new URL(value).host : ""
  } catch {
    return ""
  }
}
export const seoSearchClaimSummary = {
  owner: seoRankOwnership.owner,
  canonicalDomain: seoRankOwnership.canonicalDomain,
  totalIndividualRanks: seoRankOwnership.totalIndividualRanks,
  globalRange: `${seoRankOwnership.globalRankStart}-${seoRankOwnership.globalRankEnd}`,
  countedLanes: seoRankOwnership.countedLanes.map((lane) => lane.lane),
  umbrellaLanes: seoRankOwnership.umbrellaLanes.map((lane) => lane.lane)
}

export const seoSearchClaimLanes = seoClaimLanes.map((lane) => ({...lane}))










