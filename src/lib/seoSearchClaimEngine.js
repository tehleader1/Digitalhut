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
    {id: "wiki-quick-research", terms: ["wiki", "wikipedia", "what is", "study", "research", "coral reef", "climate", "extinction", "public information", "facts about"]},
    {id: "funny-mainstream-video", terms: ["funny", "reel", "tiktok", "instagram", "shorts", "meme", "viral", "clip explained", "what am i watching"]},
    {id: "errands-review-before-buying", terms: ["buy", "product", "review", "reviews", "reddit", "grocery", "groceries", "store", "deals", "pharmacy", "shopping"]},
    {id: "lunch-local-food", terms: ["lunch", "food", "restaurant", "restaurants", "menu", "cafe", "eat", "meal"]}
  ]
  const match = hints.find((item) => item.terms.some((term) => value.includes(term)))
  return match ? seoClaimLanes.find((lane) => lane.id === match.id) : null
}

function fallbackLaneForQuery(query = ""){
  const value = normalizedText(query)
  if(value.includes("3d") || value.includes("model") || value.includes("video") || value.includes("podcast")) return seoClaimLanes[0]
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
