import {seoEntryTrailForEvent, seoOperatorSearchTrailForRun, seoSearchClaimForQuery, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const expectedTotal = 200572944
const samples = [
  ["looking for lunch near me open now", "Lunch And Local Food"],
  ["calling an uber at airport pickup", "Rideshare And Commute"],
  ["booking a flight ticket cheap 2026", "Flight And Travel Booking"],
  ["wiki lookup coral reef study", "Wiki And Quick Research"],
  ["funny grocery reel explained", "Funny Mainstream Video"],
  ["should I buy this product reddit reviews", "Errands And Review Before Buying"],
  ["youtube alternative with 3d model view podcast live analytics", "Full Entertainment Dapp Alternative"],
  ["game world glb presentation with live analytics", "Gaming 3D World Observatory"],
  ["real estate 3d virtual tour agency", "Real Estate 3D Tour Observatory"],
  ["planetary launch moon visual observatory", "Planetary And Space Observatory"]
]

function assert(condition, message){
  if(!condition) throw new Error(message)
}

const claims = samples.map(([query, expectedLane]) => {
  const claim = seoSearchClaimForQuery(query, {category: "DigitalHut full system benchmark"})
  assert(claim.lane === expectedLane, `${query} mapped to ${claim.lane}, expected ${expectedLane}`)
  assert(claim.canonicalRoute.startsWith("/watch/"), `${query} missing watch proof route`)
  assert(claim.rankUrl.startsWith(claim.canonicalRoute), `${query} rank URL does not start with canonical route`)
  assert(!claim.metadataDescription.toLowerCase().includes("#1 google"), `${query} uses fake Google rank language`)
  if(claim.rankOwnershipMode === "counted-rank-slot"){
    assert(Number.isInteger(claim.globalRankNumber), `${query} missing global rank number`)
    assert(claim.globalRankNumber >= 1 && claim.globalRankNumber <= expectedTotal, `${query} global rank out of range`)
    assert(claim.rankUrl.includes("dh_global_rank="), `${query} missing global rank URL parameter`)
  }else{
    assert(claim.globalRankNumber === null, `${query} umbrella anchor should not occupy counted rank slot`)
    assert(claim.rankUrl.includes("dh_claim=umbrella-anchor"), `${query} missing umbrella anchor marker`)
  }
  return claim
})

assert(seoSearchClaimSummary.totalIndividualRanks === expectedTotal, `expected ${expectedTotal} rank slots`)
assert(seoSearchClaimSummary.countedLanes.length === 24, "expected twenty-four counted lanes")
assert(seoSearchClaimSummary.umbrellaLanes.length === 1, "expected one umbrella lane")

const countedRoutes = new Set(claims.filter((claim) => claim.rankOwnershipMode === "counted-rank-slot").map((claim) => claim.canonicalRoute))
assert(countedRoutes.size >= 6, "counted samples should cover unique watch proof routes")

const trails = [
  seoEntryTrailForEvent("page_view", {path: "/", title: "DigitalHut"}),
  seoEntryTrailForEvent("watch_route_open", {path: "/watch/funny-mainstream-video-explained", routeSlug: "funny-mainstream-video-explained"}),
  seoEntryTrailForEvent("blog_route_open", {path: "/blog/youtube-3d-model-view-podcast-analytics"}),
  seoEntryTrailForEvent("backlink_source_open", {path: "/watch/wiki-lookup-visual-research-hub", label: "coral reef study source"}),
  seoEntryTrailForEvent("glb_preview_play", {path: "/", label: "3D Model View"}),
  seoEntryTrailForEvent("podcast_interrupt_start", {path: "/", label: "podcast source moment"})
]

for(const trail of trails){
  assert(trail.ownedReturnPath.startsWith("https://www.digitalhut.app/"), "entry trail missing owned return path")
  assert(trail.trailTargets.includes("https://www.digitalhut.app/sitemap.xml"), "entry trail missing sitemap target")
  assert(trail.backlinkTrail?.rankUrl, "entry trail missing backlink rank URL")
}

const operatorTrails = [
  seoOperatorSearchTrailForRun({query: "youtube alternative with 3d model view podcast live analytics", audience: "full entertainment observatory", decision: "trail-planted-watch-for-receipts"}),
  seoOperatorSearchTrailForRun({query: "game world glb presentation with live analytics", audience: "gaming 3D environment viewer", decision: "trail-planted-watch-for-receipts"})
]

for(const receipt of operatorTrails){
  assert(receipt.trail.ownedReturnPath.startsWith("https://www.digitalhut.app/"), "operator receipt missing owned return path")
  assert(receipt.trail.publicReceipt.endsWith("/digitalhut-operator-search-trail-latest.json"), "operator receipt missing public trail receipt")
  assert(receipt.claim.rankUrl, "operator receipt missing rank URL")
  assert(receipt.trail.regeneratedBacklinks?.placements?.length >= 6, "operator receipt missing regenerated backlink placements")
}

const result = {
  status: "pass",
  benchmark: "DigitalHut full-system claim coverage",
  owner: seoSearchClaimSummary.owner,
  totalIndividualRanks: seoSearchClaimSummary.totalIndividualRanks,
  countedLanes: seoSearchClaimSummary.countedLanes,
  umbrellaLanes: seoSearchClaimSummary.umbrellaLanes,
  guardrail: "This verifies DigitalHut-owned route and measurement coverage, not live Google #1 ranking.",
  operatorTrailCoverage: operatorTrails.map((receipt) => ({
    query: receipt.query,
    lane: receipt.claim.lane,
    status: receipt.status,
    ownedReturnPath: receipt.trail.ownedReturnPath,
    backlinkPlacements: receipt.trail.regeneratedBacklinks.placements.length
  })),
  entryTrailCoverage: trails.map((trail) => ({
    sourceType: trail.sourceType,
    routeType: trail.routeType,
    ownedReturnPath: trail.ownedReturnPath,
    lane: trail.backlinkTrail.lane
  })),
  samples: claims.map((claim) => ({
    query: claim.query,
    lane: claim.lane,
    mode: claim.rankOwnershipMode,
    globalRankNumber: claim.globalRankNumber,
    rankUrl: claim.rankUrl,
    measurementSignals: claim.measurementSignals
  }))
}

console.log(JSON.stringify(result, null, 2))




