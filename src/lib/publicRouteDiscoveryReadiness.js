export const DISCOVERY_EVIDENCE_STATUS = Object.freeze({
  CONFIRMED: "Confirmed",
  FAILED: "Failed",
  UNKNOWN: "Unknown"
})

export const PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT = Object.freeze({
  version: "1.0.0",
  stages: [
    "sourcePrepared",
    "deployed",
    "crawlDiscoverable",
    "providerObserved",
    "qualifiedActionObserved",
    "conversionConfirmed"
  ],
  evidenceClasses: {
    deployment: "immutable-deployment",
    publicRender: "public-render",
    provider: "external-provider",
    qualifiedAction: "first-party-qualified-action",
    conversion: "verified-conversion"
  },
  truthBoundary: {
    missingProviderEvidence: "Unknown",
    unknownArrival: "Unknown/Unattributed",
    internalCountersCanConfirmOrganicRank: false,
    internalCountersCanConfirmCodexCausation: false,
    providerObservationAloneCanConfirmCausation: false
  }
})

const {CONFIRMED, FAILED, UNKNOWN} = DISCOVERY_EVIDENCE_STATUS
const trackingPrefixes = ["dh_", "utm_", "mtm_", "pk_"]
const trackingNames = new Set([
  "_gl",
  "dclid",
  "fbclid",
  "gad_source",
  "gbraid",
  "gclid",
  "li_fat_id",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "srsltid",
  "ttclid",
  "twclid",
  "wbraid"
])

function evidence(status, reason, details = {}){
  return {status, reason, ...details}
}

function isPresent(value){
  return value !== undefined && value !== null
}

function isNonEmptyString(value){
  return typeof value === "string" && value.trim().length > 0
}

function isTimestamp(value){
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value))
}

function publicUrl(value){
  if(!isNonEmptyString(value)) return null
  try{
    const url = new URL(value)
    if(url.protocol !== "https:" && url.protocol !== "http:") return null
    url.hash = ""
    return url
  }catch{
    return null
  }
}

function normalizedPublicUrl(value){
  return publicUrl(value)?.href || null
}

function trackingParameters(value){
  const url = publicUrl(value)
  if(!url) return []
  return [...new Set([...url.searchParams.keys()]
    .map((name) => name.toLowerCase())
    .filter((name) => trackingNames.has(name) || trackingPrefixes.some((prefix) => name.startsWith(prefix))))]
}

function booleanEvidence(value, label){
  if(value === true) return evidence(CONFIRMED, `${label} is explicitly confirmed.`)
  if(value === false) return evidence(FAILED, `${label} is explicitly false.`)
  return evidence(UNKNOWN, `${label} has no evidence.`)
}

function textEvidence(value, label){
  if(!isPresent(value)) return evidence(UNKNOWN, `${label} has no evidence.`)
  if(isNonEmptyString(value)) return evidence(CONFIRMED, `${label} is present.`)
  return evidence(FAILED, `${label} is empty.`)
}

function canonicalEvidence(route){
  if(!isPresent(route?.semanticUrl) || !isPresent(route?.canonicalUrl)){
    return evidence(UNKNOWN, "The semantic URL or canonical URL is missing.")
  }
  const semantic = publicUrl(route.semanticUrl)
  const canonical = publicUrl(route.canonicalUrl)
  if(!semantic || !canonical) return evidence(FAILED, "The semantic URL or canonical URL is invalid.")
  if(canonical.protocol !== "https:") return evidence(FAILED, "The canonical URL is not HTTPS.")
  const canonicalTracking = trackingParameters(canonical.href)
  if(canonicalTracking.length){
    return evidence(FAILED, "The canonical URL contains arrival or tracking parameters.", {
      trackingParameters: canonicalTracking
    })
  }
  if(trackingParameters(semantic.href).length){
    return evidence(FAILED, "The declared semantic URL contains arrival or tracking parameters.")
  }
  if(canonical.href !== semantic.href){
    return evidence(FAILED, "The canonical URL does not match the declared semantic route.", {
      expected: semantic.href,
      actual: canonical.href
    })
  }
  return evidence(CONFIRMED, "The HTTPS canonical matches the semantic route and excludes tracking parameters.", {
    canonicalUrl: canonical.href
  })
}

function usefulActionEvidence(action, baseUrl){
  if(!isPresent(action)) return evidence(UNKNOWN, "The first useful action has no evidence.")
  if(!isNonEmptyString(action.label) || !isNonEmptyString(action.href)){
    return evidence(FAILED, "The first useful action needs a non-empty label and destination.")
  }
  try{
    new URL(action.href, baseUrl || "https://www.digitalhut.app")
  }catch{
    return evidence(FAILED, "The first useful action destination is invalid.")
  }
  return evidence(CONFIRMED, "The route exposes a labeled first useful action.")
}

function indexabilityEvidence(value){
  if(!isPresent(value)) return evidence(UNKNOWN, "Indexability has no evidence.")
  if(value === "index") return evidence(CONFIRMED, "The route declares indexability.")
  if(value === "noindex") return evidence(FAILED, "The route explicitly declares noindex.")
  return evidence(FAILED, "Indexability is not a recognized index/noindex value.")
}

function routeBoundReceipt(receipt, {
  evidenceClass,
  canonicalUrl,
  observedAtField,
  label
}){
  if(!isPresent(receipt)) return evidence(UNKNOWN, `${label} is missing.`)
  if(receipt.evidenceClass !== evidenceClass){
    return evidence(FAILED, `${label} has the wrong evidence class.`)
  }
  if(!isNonEmptyString(receipt.receiptId) || !isTimestamp(receipt[observedAtField])){
    return evidence(FAILED, `${label} is missing a receipt ID or valid timestamp.`)
  }
  const receiptUrl = normalizedPublicUrl(receipt.url)
  const expectedUrl = normalizedPublicUrl(canonicalUrl)
  if(!receiptUrl || !expectedUrl || receiptUrl !== expectedUrl){
    return evidence(FAILED, `${label} is not bound to the stable canonical URL.`)
  }
  return evidence(CONFIRMED, `${label} is receipt-bound to the stable canonical URL.`, {
    receiptId: receipt.receiptId
  })
}

function deploymentEvidence(deployment, canonicalUrl){
  if(!isPresent(deployment)) return evidence(UNKNOWN, "An immutable deployment receipt is missing.")
  if(deployment.deployed === false) return evidence(FAILED, "The route is explicitly not deployed.")
  if(deployment.deployed !== true || !isNonEmptyString(deployment.immutableRef)){
    return evidence(FAILED, "The deployment is not explicitly true or lacks an immutable reference.")
  }
  return routeBoundReceipt(deployment, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.deployment,
    canonicalUrl,
    observedAtField: "deployedAt",
    label: "The immutable deployment receipt"
  })
}

function renderEvidence(publicEvidence, canonicalUrl){
  const screenshot = routeBoundReceipt(publicEvidence?.screenshotReceipt, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.publicRender,
    canonicalUrl,
    observedAtField: "capturedAt",
    label: "The screenshot receipt"
  })
  const media = routeBoundReceipt(publicEvidence?.mediaReceipt, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.publicRender,
    canonicalUrl,
    observedAtField: "capturedAt",
    label: "The media receipt"
  })
  if(screenshot.status === CONFIRMED || media.status === CONFIRMED){
    return evidence(CONFIRMED, "At least one public screenshot or media receipt is confirmed.", {
      screenshot,
      media
    })
  }
  if(screenshot.status === FAILED || media.status === FAILED){
    return evidence(FAILED, "Provided screenshot or media evidence is invalid.", {screenshot, media})
  }
  return evidence(UNKNOWN, "No public screenshot or media receipt is present.", {screenshot, media})
}

function providerOutcomeEvidence(receipt, canonicalUrl, outcomeField, label){
  const base = routeBoundReceipt(receipt, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.provider,
    canonicalUrl,
    observedAtField: "observedAt",
    label
  })
  if(base.status !== CONFIRMED) return base
  if(!isNonEmptyString(receipt.provider)) return evidence(FAILED, `${label} does not identify an external provider.`)
  if(receipt[outcomeField] === true) return evidence(CONFIRMED, `${label} confirms ${outcomeField}.`, {
    receiptId: receipt.receiptId,
    provider: receipt.provider
  })
  if(receipt[outcomeField] === false) return evidence(FAILED, `${label} explicitly reports ${outcomeField} as false.`, {
    receiptId: receipt.receiptId,
    provider: receipt.provider
  })
  return evidence(FAILED, `${label} does not contain an explicit ${outcomeField} outcome.`)
}

function providerSearchEvidence(receipt, canonicalUrl){
  const base = routeBoundReceipt(receipt, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.provider,
    canonicalUrl,
    observedAtField: "observedAt",
    label: "The external provider search receipt"
  })
  if(base.status !== CONFIRMED) return base
  if(!isNonEmptyString(receipt.provider)) return evidence(FAILED, "The search receipt does not identify an external provider.")
  if(!Number.isFinite(receipt.impressions) || receipt.impressions < 0 || !Number.isFinite(receipt.clicks) || receipt.clicks < 0){
    return evidence(FAILED, "The search receipt needs non-negative numeric impressions and clicks.")
  }
  return evidence(CONFIRMED, "The external provider search receipt is structurally valid.", {
    receiptId: receipt.receiptId,
    provider: receipt.provider,
    impressions: receipt.impressions,
    clicks: receipt.clicks
  })
}

function positiveMetricEvidence(providerSearch, metric){
  if(providerSearch.status !== CONFIRMED) return evidence(providerSearch.status, `Provider ${metric} remain ${providerSearch.status}.`)
  const value = providerSearch[metric]
  if(value > 0) return evidence(CONFIRMED, `The external provider reports positive ${metric}.`, {value})
  return evidence(FAILED, `The external provider reports zero ${metric}.`, {value})
}

function qualifiedActionEvidence(qualifiedAction, canonicalUrl){
  const receipt = qualifiedAction?.receipt
  const base = routeBoundReceipt(receipt, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.qualifiedAction,
    canonicalUrl,
    observedAtField: "observedAt",
    label: "The qualified-action receipt"
  })
  if(base.status !== CONFIRMED) return base
  if(!isNonEmptyString(receipt.action)){
    return evidence(FAILED, "The qualified-action receipt does not name the useful action.")
  }
  return evidence(CONFIRMED, "A route-bound qualified action is observed.", {
    receiptId: receipt.receiptId,
    action: receipt.action
  })
}

function organicAttributionEvidence(qualifiedAction, qualifiedActionCheck, providerSearch, providerSearchCheck){
  if(qualifiedActionCheck.status !== CONFIRMED){
    return evidence(qualifiedActionCheck.status, "Organic attribution cannot exceed the qualified-action evidence.")
  }
  const attribution = qualifiedAction?.attribution
  if(!isPresent(attribution) || attribution.kind === "unknown" || attribution.kind === "unattributed"){
    return evidence(UNKNOWN, "The qualified action remains Unknown/Unattributed.")
  }
  if(attribution.kind !== "organic"){
    return evidence(FAILED, "The qualified action is explicitly attributed to a non-organic source.")
  }
  if(providerSearchCheck.status === UNKNOWN){
    return evidence(UNKNOWN, "The claimed organic attribution lacks an external provider search receipt.")
  }
  if(providerSearchCheck.status === FAILED){
    return evidence(FAILED, "The claimed organic attribution relies on an invalid provider search receipt.")
  }
  if(!isNonEmptyString(attribution.providerReceiptId)){
    return evidence(UNKNOWN, "The organic attribution does not link a provider receipt ID.")
  }
  if(attribution.providerReceiptId !== providerSearch.receiptId){
    return evidence(FAILED, "The qualified action references a different provider receipt.")
  }
  if(providerSearch.clicks <= 0){
    return evidence(FAILED, "The provider receipt reports no click that could support organic attribution.")
  }
  return evidence(CONFIRMED, "The qualified action is linked to a positive-click external provider receipt.", {
    providerReceiptId: attribution.providerReceiptId
  })
}

function conversionReceiptEvidence(conversion, canonicalUrl){
  const receipt = conversion?.receipt
  const base = routeBoundReceipt(receipt, {
    evidenceClass: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.evidenceClasses.conversion,
    canonicalUrl,
    observedAtField: "observedAt",
    label: "The verified-conversion receipt"
  })
  if(base.status !== CONFIRMED) return base
  if(receipt.verified !== true) return evidence(FAILED, "The conversion receipt is not explicitly verified.")
  if(!isNonEmptyString(receipt.qualifiedActionReceiptId)){
    return evidence(FAILED, "The conversion receipt does not link a qualified-action receipt.")
  }
  return evidence(CONFIRMED, "A route-bound verified conversion receipt is present.", {
    receiptId: receipt.receiptId,
    qualifiedActionReceiptId: receipt.qualifiedActionReceiptId
  })
}

function conversionLinkEvidence(conversion, conversionReceiptCheck, qualifiedActionCheck, qualifiedAction){
  if(conversionReceiptCheck.status === FAILED || qualifiedActionCheck.status === FAILED){
    return evidence(FAILED, "The conversion-to-action link relies on failed evidence.")
  }
  if(conversionReceiptCheck.status === UNKNOWN || qualifiedActionCheck.status === UNKNOWN){
    return evidence(UNKNOWN, "The conversion-to-action link is missing evidence.")
  }
  if(conversion.receipt.qualifiedActionReceiptId !== qualifiedAction.receipt.receiptId){
    return evidence(FAILED, "The conversion receipt links a different qualified action.")
  }
  return evidence(CONFIRMED, "The verified conversion links the observed qualified action.")
}

function stageFrom(checks, requiredChecks){
  const failedChecks = requiredChecks.filter((name) => checks[name]?.status === FAILED)
  const missingEvidence = requiredChecks.filter((name) => checks[name]?.status === UNKNOWN)
  const status = failedChecks.length ? FAILED : missingEvidence.length ? UNKNOWN : CONFIRMED
  return {status, requiredChecks, failedChecks, missingEvidence}
}

export function evaluatePublicRouteDiscoveryReadiness(input = {}){
  const route = input.route || {}
  const discovery = input.discovery || {}
  const canonicalUrl = route.canonicalUrl
  const provider = input.provider || {}
  const qualifiedAction = input.qualifiedAction || {}
  const conversion = input.conversion || {}

  const checks = {
    sourceRouteExists: booleanEvidence(route.sourceExists, "The source route"),
    stableCanonical: canonicalEvidence(route),
    title: textEvidence(route.title, "The document title"),
    h1: textEvidence(route.h1, "The H1"),
    main: booleanEvidence(route.hasMain, "The main landmark"),
    usefulAction: usefulActionEvidence(route.usefulAction, route.semanticUrl),
    indexability: indexabilityEvidence(route.indexability),
    robotsAllowed: booleanEvidence(discovery.robotsAllowed, "Robots crawl permission"),
    sitemapIncluded: booleanEvidence(discovery.sitemapIncluded, "Sitemap inclusion"),
    deploymentReceipt: deploymentEvidence(input.deployment, canonicalUrl),
    publicRenderEvidence: renderEvidence(input.publicEvidence, canonicalUrl)
  }

  checks.providerCrawl = providerOutcomeEvidence(
    provider.crawlReceipt,
    canonicalUrl,
    "crawled",
    "The external provider crawl receipt"
  )
  checks.providerIndex = providerOutcomeEvidence(
    provider.indexReceipt,
    canonicalUrl,
    "indexed",
    "The external provider index receipt"
  )
  checks.providerSearchReceipt = providerSearchEvidence(provider.searchReceipt, canonicalUrl)
  checks.providerImpressions = positiveMetricEvidence(checks.providerSearchReceipt, "impressions")
  checks.providerClicks = positiveMetricEvidence(checks.providerSearchReceipt, "clicks")
  checks.qualifiedActionReceipt = qualifiedActionEvidence(qualifiedAction, canonicalUrl)
  checks.qualifiedActionOrganicAttribution = organicAttributionEvidence(
    qualifiedAction,
    checks.qualifiedActionReceipt,
    provider.searchReceipt,
    checks.providerSearchReceipt
  )
  checks.conversionReceipt = conversionReceiptEvidence(conversion, canonicalUrl)
  checks.conversionLink = conversionLinkEvidence(
    conversion,
    checks.conversionReceipt,
    checks.qualifiedActionReceipt,
    qualifiedAction
  )

  const stages = {}
  stages.sourcePrepared = stageFrom(checks, [
    "sourceRouteExists",
    "stableCanonical",
    "title",
    "h1",
    "main",
    "usefulAction"
  ])
  stages.deployed = stageFrom(checks, ["deploymentReceipt", "publicRenderEvidence"])
  stages.crawlDiscoverable = stageFrom({
    ...checks,
    sourcePrepared: stages.sourcePrepared,
    deployed: stages.deployed
  }, [
    "sourcePrepared",
    "deployed",
    "stableCanonical",
    "indexability",
    "robotsAllowed",
    "sitemapIncluded"
  ])
  stages.providerObserved = stageFrom(checks, ["providerCrawl", "providerIndex"])
  stages.qualifiedActionObserved = stageFrom(checks, ["qualifiedActionReceipt"])
  stages.conversionConfirmed = stageFrom(checks, ["conversionReceipt", "conversionLink"])

  const chainChecks = {
    ...stages,
    qualifiedActionOrganicAttribution: checks.qualifiedActionOrganicAttribution,
    conversionOrganicAttribution: checks.qualifiedActionOrganicAttribution.status === CONFIRMED
      && stages.conversionConfirmed.status === CONFIRMED
      ? evidence(CONFIRMED, "The linked conversion inherits the receipt-confirmed organic attribution.")
      : evidence(
        checks.qualifiedActionOrganicAttribution.status === FAILED || stages.conversionConfirmed.status === FAILED ? FAILED : UNKNOWN,
        "The conversion cannot be organically attributed without both confirmed action attribution and conversion linkage."
      )
  }

  const organicEvidenceChain = stageFrom(chainChecks, [
    "sourcePrepared",
    "deployed",
    "crawlDiscoverable",
    "providerObserved",
    "qualifiedActionObserved",
    "qualifiedActionOrganicAttribution",
    "conversionConfirmed",
    "conversionOrganicAttribution"
  ])

  return {
    contractVersion: PUBLIC_ROUTE_DISCOVERY_READINESS_CONTRACT.version,
    routeIdentity: {
      requestedUrl: route.requestedUrl || null,
      semanticUrl: normalizedPublicUrl(route.semanticUrl),
      canonicalUrl: normalizedPublicUrl(route.canonicalUrl),
      requestedTrackingParameters: trackingParameters(route.requestedUrl),
      canonicalTrackingParameters: trackingParameters(route.canonicalUrl)
    },
    checks,
    stages,
    attribution: {
      arrival: checks.qualifiedActionOrganicAttribution.status === CONFIRMED
        ? "Organic (external receipt linked)"
        : "Unknown/Unattributed",
      organicQualifiedAction: checks.qualifiedActionOrganicAttribution
    },
    organicEvidenceChain,
    claimBoundary: {
      missingProviderEvidence: UNKNOWN,
      internalCountersPresent: Boolean(input.internalCounters && Object.keys(input.internalCounters).length),
      internalCountersAcceptedAsProviderEvidence: false,
      organicRankCausation: evidence(UNKNOWN, "This contract does not infer organic rank movement or causation from internal counters."),
      codexCausation: evidence(UNKNOWN, "No route, provider, action, or conversion receipt alone proves Codex causation.")
    }
  }
}
