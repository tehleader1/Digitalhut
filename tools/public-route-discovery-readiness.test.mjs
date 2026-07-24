import assert from "node:assert/strict"
import test from "node:test"
import {
  DISCOVERY_EVIDENCE_STATUS,
  evaluatePublicRouteDiscoveryReadiness
} from "../src/lib/publicRouteDiscoveryReadiness.js"

const {CONFIRMED, FAILED, UNKNOWN} = DISCOVERY_EVIDENCE_STATUS
const canonicalUrl = "https://www.digitalhut.app/watch/search-intent-radar-visual-experience"
const observedAt = "2026-07-24T12:00:00.000Z"

function completeInput(){
  return {
    route: {
      sourceExists: true,
      requestedUrl: canonicalUrl,
      semanticUrl: canonicalUrl,
      canonicalUrl,
      title: "Search Intent Radar | DigitalHut",
      h1: "Search Intent Radar",
      hasMain: true,
      usefulAction: {
        label: "Open live observatory",
        href: "/?category=search"
      },
      indexability: "index"
    },
    discovery: {
      robotsAllowed: true,
      sitemapIncluded: true
    },
    deployment: {
      evidenceClass: "immutable-deployment",
      receiptId: "deploy-receipt-1",
      immutableRef: "deployment-sha-1",
      url: canonicalUrl,
      deployedAt: observedAt,
      deployed: true
    },
    publicEvidence: {
      screenshotReceipt: {
        evidenceClass: "public-render",
        receiptId: "screenshot-receipt-1",
        url: canonicalUrl,
        capturedAt: observedAt
      }
    },
    provider: {
      crawlReceipt: {
        evidenceClass: "external-provider",
        receiptId: "crawl-receipt-1",
        provider: "search-provider",
        url: canonicalUrl,
        observedAt,
        crawled: true
      },
      indexReceipt: {
        evidenceClass: "external-provider",
        receiptId: "index-receipt-1",
        provider: "search-provider",
        url: canonicalUrl,
        observedAt,
        indexed: true
      },
      searchReceipt: {
        evidenceClass: "external-provider",
        receiptId: "search-receipt-1",
        provider: "search-provider",
        url: canonicalUrl,
        observedAt,
        impressions: 42,
        clicks: 3
      }
    },
    qualifiedAction: {
      receipt: {
        evidenceClass: "first-party-qualified-action",
        receiptId: "action-receipt-1",
        url: canonicalUrl,
        observedAt,
        action: "open-live-observatory"
      },
      attribution: {
        kind: "organic",
        providerReceiptId: "search-receipt-1"
      }
    },
    conversion: {
      receipt: {
        evidenceClass: "verified-conversion",
        receiptId: "conversion-receipt-1",
        url: canonicalUrl,
        observedAt,
        verified: true,
        qualifiedActionReceiptId: "action-receipt-1"
      }
    }
  }
}

test("arrival tracking parameters never become stable-canonical evidence", () => {
  const input = completeInput()
  input.route.requestedUrl = `${canonicalUrl}?dh_query=visual+search&utm_source=search&gclid=click-id`
  input.internalCounters = {pageViews: 2520, sessions: 557}
  input.provider = {}
  input.qualifiedAction = {}
  input.conversion = {}

  const result = evaluatePublicRouteDiscoveryReadiness(input)
  assert.equal(result.checks.stableCanonical.status, CONFIRMED)
  assert.deepEqual(result.routeIdentity.requestedTrackingParameters, ["dh_query", "utm_source", "gclid"])
  assert.deepEqual(result.routeIdentity.canonicalTrackingParameters, [])
  assert.equal(result.stages.providerObserved.status, UNKNOWN)
  assert.equal(result.claimBoundary.internalCountersAcceptedAsProviderEvidence, false)
  assert.equal(result.claimBoundary.organicRankCausation.status, UNKNOWN)

  input.route.canonicalUrl = `${canonicalUrl}?utm_source=search`
  assert.equal(evaluatePublicRouteDiscoveryReadiness(input).checks.stableCanonical.status, FAILED)
})

test("an unknown source route fails source preparation", () => {
  const result = evaluatePublicRouteDiscoveryReadiness({
    route: {
      sourceExists: false,
      requestedUrl: "https://www.digitalhut.app/watch/not-published",
      semanticUrl: "https://www.digitalhut.app/watch/not-published",
      canonicalUrl: "https://www.digitalhut.app/watch/not-published"
    }
  })

  assert.equal(result.checks.sourceRouteExists.status, FAILED)
  assert.equal(result.stages.sourcePrepared.status, FAILED)
  assert.equal(result.organicEvidenceChain.status, FAILED)
})

test("a canonical mismatch fails source and crawl readiness", () => {
  const input = completeInput()
  input.route.canonicalUrl = "https://www.digitalhut.app/watch/different-proof"

  const result = evaluatePublicRouteDiscoveryReadiness(input)
  assert.equal(result.checks.stableCanonical.status, FAILED)
  assert.equal(result.stages.sourcePrepared.status, FAILED)
  assert.equal(result.stages.crawlDiscoverable.status, FAILED)
})

test("noindex explicitly fails crawl discoverability", () => {
  const input = completeInput()
  input.route.indexability = "noindex"

  const result = evaluatePublicRouteDiscoveryReadiness(input)
  assert.equal(result.checks.indexability.status, FAILED)
  assert.equal(result.stages.crawlDiscoverable.status, FAILED)
})

test("sitemap inclusion alone remains an Unknown crawl state", () => {
  const result = evaluatePublicRouteDiscoveryReadiness({
    discovery: {sitemapIncluded: true}
  })

  assert.equal(result.checks.sitemapIncluded.status, CONFIRMED)
  assert.equal(result.stages.sourcePrepared.status, UNKNOWN)
  assert.equal(result.stages.deployed.status, UNKNOWN)
  assert.equal(result.stages.crawlDiscoverable.status, UNKNOWN)
})

test("provider crawl without an index receipt remains Unknown", () => {
  const input = completeInput()
  delete input.provider.indexReceipt
  delete input.qualifiedAction
  delete input.conversion

  const result = evaluatePublicRouteDiscoveryReadiness(input)
  assert.equal(result.stages.crawlDiscoverable.status, CONFIRMED)
  assert.equal(result.checks.providerCrawl.status, CONFIRMED)
  assert.equal(result.checks.providerIndex.status, UNKNOWN)
  assert.equal(result.stages.providerObserved.status, UNKNOWN)
})

test("impressions without clicks do not imply a qualified action", () => {
  const input = completeInput()
  input.provider.searchReceipt.clicks = 0
  delete input.qualifiedAction
  delete input.conversion

  const result = evaluatePublicRouteDiscoveryReadiness(input)
  assert.equal(result.stages.providerObserved.status, CONFIRMED)
  assert.equal(result.checks.providerImpressions.status, CONFIRMED)
  assert.equal(result.checks.providerClicks.status, FAILED)
  assert.equal(result.stages.qualifiedActionObserved.status, UNKNOWN)
  assert.equal(result.attribution.arrival, "Unknown/Unattributed")
})

test("a qualified action without attribution stays Unknown/Unattributed", () => {
  const input = completeInput()
  input.qualifiedAction.attribution = {kind: "unattributed"}
  delete input.conversion

  const result = evaluatePublicRouteDiscoveryReadiness(input)
  assert.equal(result.stages.qualifiedActionObserved.status, CONFIRMED)
  assert.equal(result.checks.qualifiedActionOrganicAttribution.status, UNKNOWN)
  assert.equal(result.attribution.arrival, "Unknown/Unattributed")
  assert.equal(result.organicEvidenceChain.status, UNKNOWN)
})

test("the complete receipt-linked chain confirms conversion but not Codex causation", () => {
  const result = evaluatePublicRouteDiscoveryReadiness(completeInput())

  for(const check of [
    "sourceRouteExists",
    "stableCanonical",
    "title",
    "h1",
    "main",
    "usefulAction",
    "indexability",
    "robotsAllowed",
    "sitemapIncluded",
    "deploymentReceipt",
    "publicRenderEvidence"
  ]){
    assert.equal(result.checks[check].status, CONFIRMED)
  }
  for(const stage of Object.values(result.stages)){
    assert.equal(stage.status, CONFIRMED)
  }
  assert.equal(result.checks.providerImpressions.status, CONFIRMED)
  assert.equal(result.checks.providerClicks.status, CONFIRMED)
  assert.equal(result.checks.qualifiedActionOrganicAttribution.status, CONFIRMED)
  assert.equal(result.organicEvidenceChain.status, CONFIRMED)
  assert.equal(result.claimBoundary.organicRankCausation.status, UNKNOWN)
  assert.equal(result.claimBoundary.codexCausation.status, UNKNOWN)
})

test("evaluation is deterministic and does not mutate its evidence input", () => {
  const input = completeInput()
  const before = JSON.stringify(input)
  const first = evaluatePublicRouteDiscoveryReadiness(input)
  const second = evaluatePublicRouteDiscoveryReadiness(input)

  assert.equal(JSON.stringify(input), before)
  assert.deepEqual(second, first)
})
