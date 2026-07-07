import {seoSearchClaimForQuery, seoSearchClaimSummary} from "../src/lib/seoSearchClaimEngine.js"

const expectedTotal = 2572944
const samples = [
  ["looking for lunch near me open now", "Lunch And Local Food"],
  ["calling an uber at airport pickup", "Rideshare And Commute"],
  ["booking a flight ticket cheap 2026", "Flight And Travel Booking"],
  ["wiki lookup coral reef study", "Wiki And Quick Research"],
  ["funny grocery reel explained", "Funny Mainstream Video"],
  ["should I buy this product reddit reviews", "Errands And Review Before Buying"],
  ["youtube alternative with 3d model view podcast live analytics", "Full System Entertainment Observatory"]
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
assert(seoSearchClaimSummary.countedLanes.length === 6, "expected six counted lanes")
assert(seoSearchClaimSummary.umbrellaLanes.length === 1, "expected one umbrella lane")

const countedRoutes = new Set(claims.filter((claim) => claim.rankOwnershipMode === "counted-rank-slot").map((claim) => claim.canonicalRoute))
assert(countedRoutes.size === 6, "counted samples should cover six unique watch proof routes")

const result = {
  status: "pass",
  benchmark: "DigitalHut full-system claim coverage",
  owner: seoSearchClaimSummary.owner,
  totalIndividualRanks: seoSearchClaimSummary.totalIndividualRanks,
  countedLanes: seoSearchClaimSummary.countedLanes,
  umbrellaLanes: seoSearchClaimSummary.umbrellaLanes,
  guardrail: "This verifies DigitalHut-owned route and measurement coverage, not live Google #1 ranking.",
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
