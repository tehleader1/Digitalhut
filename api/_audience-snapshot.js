import {createHash} from "node:crypto"

function envValue(key){
  return String(process.env[key] || "").replace(/^['"]|['"]$/g, "").trim()
}

function supabaseUrl(){
  for(const key of ["SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]){
    const value = envValue(key)
    if(!value) continue
    try {
      const url = new URL(value)
      if(["http:", "https:"].includes(url.protocol)) return url.toString().replace(/\/+$/, "")
    } catch {}
  }
  return ""
}

function serviceKey(){
  return envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY")
}

function numberValue(value){
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function countValue(value){
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null
}

function boundedTimestamp(value){
  const text = String(value || "").trim()
  return text.length <= 40 && Number.isFinite(Date.parse(text)) ? text : ""
}

function sanitizeAcquisitionRow(row){
  const source = String(row?.source || "").trim()
  const landingPath = String(row?.landingPath || "").trim()
  if(!/^[a-z0-9:-]{1,80}$/.test(source) || !/^\/[A-Za-z0-9/_-]{0,160}$/.test(landingPath)) return null
  const count = key => countValue(row?.[key])
  const ratio = key => {
    const value = numberValue(row?.[key])
    return value !== null && value <= 1000000 ? value : null
  }
  const sanitized = {
    source,
    landingPath,
    events: count("events"),
    pageViews: count("pageViews"),
    uniqueVisitors: count("uniqueVisitors"),
    pinnedSessions: count("pinnedSessions"),
    pageSessions: count("pageSessions"),
    viewsPerPinnedSession: ratio("viewsPerPinnedSession"),
    viewsPerPageSession: ratio("viewsPerPageSession"),
    firstLandingViews: count("firstLandingViews"),
    laterNavigationViews: count("laterNavigationViews"),
    repeatedSameRouteViews: count("repeatedSameRouteViews"),
    secondActions: count("secondActions"),
    proofOpens: count("proofOpens"),
    checkoutIntents: count("checkoutIntents"),
    verifiedConversions: count("verifiedConversions"),
    firstSeenAt: boundedTimestamp(row?.firstSeenAt || row?.firstSeen),
    latest: boundedTimestamp(row?.latest || row?.latestEventAt)
  }
  const counts = [sanitized.events, sanitized.pageViews, sanitized.uniqueVisitors, sanitized.pinnedSessions,
    sanitized.pageSessions, sanitized.firstLandingViews, sanitized.laterNavigationViews,
    sanitized.repeatedSameRouteViews, sanitized.secondActions, sanitized.proofOpens,
    sanitized.checkoutIntents, sanitized.verifiedConversions]
  if(counts.some(value => value === null) || sanitized.viewsPerPinnedSession === null || sanitized.viewsPerPageSession === null) return null
  if(sanitized.firstSeenAt === "" || sanitized.latest === "") return null
  if(sanitized.firstLandingViews + sanitized.laterNavigationViews + sanitized.repeatedSameRouteViews !== sanitized.pageViews) return null
  if(sanitized.pinnedSessions < sanitized.pageSessions || sanitized.uniqueVisitors > sanitized.pageSessions) return null
  if(sanitized.firstLandingViews !== sanitized.pageSessions) return null
  return sanitized
}

async function readRpc(url, key, rpc, body){
  let response
  try {
    response = await fetch(`${url}/rest/v1/rpc/${rpc}`, {
      method: "POST",
      headers: {apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json"},
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000)
    })
  } catch(error){
    return {ok: false, reason: error?.name === "TimeoutError" ? `${rpc}-timeout` : `${rpc}-unavailable`}
  }
  if(!response.ok) return {ok: false, reason: `${rpc}-failed-${response.status}`}
  try { return {ok: true, value: await response.json()} }
  catch { return {ok: false, reason: `${rpc}-json-invalid`} }
}

const snapshotTtlMs = 1000
let cachedSnapshot = null
let snapshotReadInFlight = null

async function readAudienceSnapshotUncached(){
  const url = supabaseUrl()
  const key = serviceKey()
  if(!url || !key) return {ready: false, reason: "missing-supabase-service-config"}

  const [summaryResult, acquisitionResult, returnResult, pageReceiptResult] = await Promise.all([
    readRpc(url, key, "digitalhut_search_pixel_summary_read", {p_location_limit: 1}),
    readRpc(url, key, "digitalhut_search_pixel_acquisition_read", {p_limit: 24}),
    readRpc(url, key, "digitalhut_search_pixel_return_cohort_read", {}),
    readRpc(url, key, "digitalhut_search_pixel_page_receipt_read", {})
  ])
  if(!summaryResult.ok) return {ready: false, reason: summaryResult.reason.replace("digitalhut_search_pixel_summary_read", "audience-read")}
  const summary = summaryResult.value
  const global = summary?.global || {}
  const pageViews = countValue(global.page_views)
  const uniqueVisitors = countValue(summary?.uniqueVisitors)
  const totalEvents = countValue(global.total_events)
  if(pageViews === null || uniqueVisitors === null || totalEvents === null){
    return {ready: false, reason: "audience-summary-incomplete"}
  }
  const taxonomyValues = {
    explicitHuman: countValue(global.explicit_human_events),
    systemAutomatic: countValue(global.system_automatic_events),
    navigation: countValue(global.navigation_events),
    commerceIntent: countValue(global.commerce_intent_events),
    serverVerified: countValue(global.server_verified_events),
    otherRecordedEvents: countValue(global.other_recorded_events)
  }
  const taxonomyReady = Object.values(taxonomyValues).every((value) => value !== null)
    && Object.values(taxonomyValues).reduce((sum, value) => sum + value, 0) === totalEvents
  const eventTaxonomy = taxonomyReady
    ? taxonomyValues
    : {explicitHuman: 0, systemAutomatic: 0, navigation: 0, commerceIntent: 0, serverVerified: 0, otherRecordedEvents: totalEvents}
  const acquisition = acquisitionResult.ok ? acquisitionResult.value : null
  const coverage = acquisition?.coverage || {}
  const recordedBrowserIds = countValue(coverage.recordedBrowserIds)
  const pageBearingBrowserIds = countValue(coverage.pageBearingBrowserIds)
  const pinnedSessions = countValue(coverage.pinnedSessions)
  const pageSessions = countValue(coverage.pageSessions)
  const previewOrTestPageViews = countValue(coverage.previewOrTestPageViews)
  const nonPreviewRecordedPageViews = countValue(coverage.nonPreviewRecordedPageViews)
  const firstLandingViews = countValue(coverage.firstLandingViews)
  const laterNavigationViews = countValue(coverage.laterNavigationViews)
  const repeatedSameRouteViews = countValue(coverage.repeatedSameRouteViews)
  const rawAcquisitionRows = Array.isArray(acquisition?.rows) ? acquisition.rows.slice(0, 24) : []
  const sanitizedAcquisitionRows = rawAcquisitionRows.map(sanitizeAcquisitionRow).filter(Boolean)
  const acquisitionReady = acquisition?.ready === true
    && [recordedBrowserIds, pageBearingBrowserIds, pinnedSessions, pageSessions, previewOrTestPageViews,
      nonPreviewRecordedPageViews, firstLandingViews, laterNavigationViews, repeatedSameRouteViews].every(value => value !== null)
    && previewOrTestPageViews + nonPreviewRecordedPageViews === pageViews
    && firstLandingViews + laterNavigationViews + repeatedSameRouteViews === pageViews
    && pinnedSessions >= pageSessions
    && firstLandingViews === pageSessions
    && pageBearingBrowserIds <= pageSessions
    && pageBearingBrowserIds <= recordedBrowserIds
    && sanitizedAcquisitionRows.length === rawAcquisitionRows.length
  const returnCohort = returnResult.ok && returnResult.value?.ready === true ? returnResult.value : null
  const observedReturnBrowserIds = countValue(returnCohort?.observedVisitors)
  const repeatSessionBrowserIds = countValue(returnCohort?.repeatSessionVisitors)
  const multiDayBrowserIds = countValue(returnCohort?.multiDayVisitors)
  const repeatSessionRatePercent = numberValue(returnCohort?.repeatSessionRatePercent)
  const multiDayRatePercent = numberValue(returnCohort?.multiDayRatePercent)
  const observedReturnEvents = countValue(returnCohort?.observedEvents)
  const returnFirstSeenAt = boundedTimestamp(returnCohort?.firstSeen)
  const returnLatestSeenAt = boundedTimestamp(returnCohort?.latestSeen)
  const expectedRepeatRate = observedReturnBrowserIds > 0 ? Math.round((repeatSessionBrowserIds / observedReturnBrowserIds) * 1000) / 10 : 0
  const expectedMultiDayRate = observedReturnBrowserIds > 0 ? Math.round((multiDayBrowserIds / observedReturnBrowserIds) * 1000) / 10 : 0
  const returnBehaviorReady = returnCohort !== null
    && [observedReturnBrowserIds, repeatSessionBrowserIds, multiDayBrowserIds, repeatSessionRatePercent, multiDayRatePercent, observedReturnEvents].every(value => value !== null)
    && repeatSessionBrowserIds <= observedReturnBrowserIds
    && multiDayBrowserIds <= observedReturnBrowserIds
    && repeatSessionRatePercent <= 100
    && multiDayRatePercent <= 100
    && repeatSessionRatePercent === expectedRepeatRate
    && multiDayRatePercent === expectedMultiDayRate
    && (observedReturnBrowserIds === 0 || (returnFirstSeenAt !== "" && returnLatestSeenAt !== ""))
  const pageReceipt = pageReceiptResult.ok && pageReceiptResult.value?.ready === true ? pageReceiptResult.value : null
  const grossRecordedPageViews = countValue(pageReceipt?.grossRecordedPageViews)
  const qualifiedPageViews = countValue(pageReceipt?.qualifiedPageViews)
  const receiptClasses = {
    firstRecordedArrival: countValue(pageReceipt?.classes?.firstRecordedArrival),
    sameSessionRefreshRemount: countValue(pageReceipt?.classes?.sameSessionRefreshRemount),
    sameSessionDeliberateReturn: countValue(pageReceipt?.classes?.sameSessionDeliberateReturn),
    newSessionReturn: countValue(pageReceipt?.classes?.newSessionReturn),
    newDayReturn: countValue(pageReceipt?.classes?.newDayReturn),
    previewTest: countValue(pageReceipt?.classes?.previewTest),
    knownAutomaticActivity: countValue(pageReceipt?.classes?.knownAutomaticActivity),
    unknownClassification: countValue(pageReceipt?.classes?.unknownClassification)
  }
  const receiptClassSum = Object.values(receiptClasses).every(value => value !== null)
    ? Object.values(receiptClasses).reduce((sum, value) => sum + value, 0)
    : null
  const duplicateGroups = countValue(pageReceipt?.duplicates?.durableDuplicateGroups)
  const deliberateContinuationCount = countValue(pageReceipt?.deliberateContinuations?.count)
  const deliberatePageReturnCount = countValue(pageReceipt?.deliberateContinuations?.sameSessionDeliberatePageReturns)
  const recoveryCount = countValue(pageReceipt?.interruptionRecovery?.count)
  const pageReceiptReady = pageReceipt !== null
    && [grossRecordedPageViews, qualifiedPageViews, receiptClassSum, duplicateGroups,
      deliberateContinuationCount, deliberatePageReturnCount, recoveryCount].every(value => value !== null)
    && grossRecordedPageViews === pageViews
    && receiptClassSum === grossRecordedPageViews
    && qualifiedPageViews === grossRecordedPageViews - receiptClasses.previewTest - receiptClasses.knownAutomaticActivity
    && duplicateGroups === 0
  return {
    ready: true,
    pageViews,
    grossRecordedPageViews: pageReceiptReady ? grossRecordedPageViews : pageViews,
    qualifiedPageViews: pageReceiptReady ? qualifiedPageViews : null,
    uniqueVisitors,
    recordedBrowserIds: acquisitionReady ? recordedBrowserIds : uniqueVisitors,
    pageBearingBrowserIds: acquisitionReady ? pageBearingBrowserIds : null,
    pageSessions: acquisitionReady ? pageSessions : null,
    pageSessionUnit: "page-receipt-sessions",
    pageSessionsReady: acquisitionReady,
    pinnedSessions: acquisitionReady ? pinnedSessions : null,
    nonPageOnlyPinnedSessions: acquisitionReady ? pinnedSessions - pageSessions : null,
    acquisitionPartitions: acquisitionReady ? {
      ready: true,
      sourceUnit: acquisition.sourceUnit || "first-recorded-page-source-evidence",
      sourceAttributionVerified: acquisition.sourceAttributionVerified === true,
      firstLandingViews,
      laterNavigationViews,
      repeatedSameRouteViews,
      previewOrTestPageViews,
      nonPreviewRecordedPageViews,
      rows: sanitizedAcquisitionRows,
      pageReceiptClassification: pageReceiptReady ? {
        ready: true,
        version: "page-receipt-v1",
        unit: "accepted-page-receipts",
        countsPeople: false,
        classes: receiptClasses,
        partitionExact: receiptClassSum === grossRecordedPageViews,
        qualifiedDefinition: pageReceipt.qualifiedDefinition,
        duplicatesSuppressed: pageReceipt.duplicates?.suppressedByClientEventIdUniqueIndex === true,
        unknown: {
          count: receiptClasses.unknownClassification,
          includedInQualified: true,
          historicalMissingReason: "historical-navigation-evidence-unavailable"
        }
      } : {ready: false, missingReason: pageReceiptResult.reason || "page-receipt-classification-incomplete"},
      unknownOrUnclassified: pageReceiptReady
        ? {ready: true, value: receiptClasses.unknownClassification, unit: "accepted-page-receipts", includedInQualified: true}
        : {ready: false, value: null, missingReason: pageReceiptResult.reason || "page-receipt-classification-incomplete"},
      deliberateContinuations: pageReceiptReady ? {
        ready: pageReceipt.deliberateContinuations?.contractReady === true,
        value: deliberateContinuationCount,
        sameSessionDeliberatePageReturns: deliberatePageReturnCount,
        unit: "accepted-explicit-action-receipts-with-prior-page-in-session",
        identityCreated: false
      } : {ready: false, value: null, missingReason: pageReceiptResult.reason || "page-receipt-classification-incomplete"},
      interruptionRecovery: pageReceiptReady ? {
        ready: pageReceipt.interruptionRecovery?.contractReady === true && pageReceipt.interruptionRecovery?.observed === true,
        contractReady: pageReceipt.interruptionRecovery?.contractReady === true,
        observed: pageReceipt.interruptionRecovery?.observed === true,
        value: recoveryCount,
        unit: "accepted-page-receipts-recovered-after-bounded-delivery-failure",
        missingReason: pageReceipt.interruptionRecovery?.observed === true ? "" : "no-recovery-receipt-observed"
      } : {ready: false, value: null, missingReason: pageReceiptResult.reason || "page-receipt-classification-incomplete"}
    } : {
      ready: false,
      missingReason: acquisitionResult.reason || acquisition?.reason || "acquisition-partitions-incomplete"
    },
    returnBehavior: returnBehaviorReady ? {
      ready: true,
      unit: "pseudonymous-browser-ids",
      source: "durable-all-history-rollup",
      window: "all-recorded-history",
      previewTestExcluded: false,
      automationExcluded: false,
      culturalValueVerified: false,
      observedBrowserIds: observedReturnBrowserIds,
      observedEvents: observedReturnEvents,
      repeatSessionBrowserIds,
      multiDayBrowserIds,
      repeatSessionRatePercent,
      multiDayRatePercent,
      firstSeenAt: returnFirstSeenAt,
      latestSeenAt: returnLatestSeenAt,
      truthBoundary: returnCohort.truthBoundary || "Return behavior is aggregate browser evidence, not people or accounts."
    } : {ready: false, missingReason: returnResult.reason || "return-cohort-incomplete"},
    totalEvents,
    totals: {
      blogViews: countValue(global.blog_views) || 0,
      searches: countValue(global.search_runs) || 0,
      proof: countValue(global.proof_route_opens) || 0,
      source: countValue(global.source_opens) || 0,
      autoplay: countValue(global.autoplay_starts) || 0,
      podcast: countValue(global.podcast_interrupts) || 0,
      glb: (countValue(global.glb_preview_plays) || 0) + (countValue(global.glb_replica_plays) || 0),
      market: countValue(global.market_opens) || 0
    },
    eventTaxonomy: {...eventTaxonomy, total: totalEvents, ready: taxonomyReady, explicitHumanVerified: false},
    latestEventAt: global.latest_event_at || "",
    uniqueVisitorUnit: "pseudonymous-browser-ids",
    humanCountVerified: false,
    knownAutomationSignaturesExcluded: true
  }
}

export async function readAudienceSnapshot(now = Date.now()){
  if(cachedSnapshot && now < cachedSnapshot.expiresAt) return cachedSnapshot.value
  if(snapshotReadInFlight) return snapshotReadInFlight
  snapshotReadInFlight = readAudienceSnapshotUncached()
  try {
    const value = await snapshotReadInFlight
    cachedSnapshot = {value, expiresAt: Date.now() + snapshotTtlMs}
    return value
  } finally {
    snapshotReadInFlight = null
  }
}

export function resetAudienceSnapshotCacheForTests(){
  cachedSnapshot = null
  snapshotReadInFlight = null
}

export function audienceSnapshotEtag(snapshot){
  const canonical = value => {
    if(Array.isArray(value)) return value.map(canonical)
    if(value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
    return value
  }
  const digest = createHash("sha256").update(JSON.stringify(canonical(snapshot))).digest("hex").slice(0, 32)
  return `W/\"dh-audience-${digest}\"`
}

export async function handleAudienceLive(req, res){
  if(req.method !== "GET"){
    res.setHeader("Allow", "GET")
    return res.status(405).json({ok: false, reason: "method-not-allowed"})
  }
  res.setHeader("Cache-Control", "private, no-store, max-age=0")
  res.setHeader("CDN-Cache-Control", "no-store")
  res.setHeader("Vary", "If-None-Match")
  const audience = await readAudienceSnapshot()
  if(!audience.ready) return res.status(503).json({ok: false, audience})
  const etag = audienceSnapshotEtag(audience)
  res.setHeader("ETag", etag)
  if(req.headers["if-none-match"] === etag) return res.status(304).end()
  return res.status(200).json({ok: true, generatedAt: new Date().toISOString(), audience})
}
