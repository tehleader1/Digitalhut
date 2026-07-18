import assert from "node:assert/strict"
import {readFileSync} from "node:fs"
import handler from "../api/audience-live.js"
import {audienceSnapshotEtag, resetAudienceSnapshotCacheForTests} from "../api/_audience-snapshot.js"

process.env.SUPABASE_URL = "https://example.supabase.co"
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key"

function responseHarness(){
  return {statusCode:200,headers:{},body:undefined,ended:false,setHeader(key,value){this.headers[key]=value},status(value){this.statusCode=value;return this},json(value){this.body=value;return this},end(){this.ended=true;return this}}
}

const summary = {global:{page_views:2202,total_events:3813,latest_event_at:"2026-07-17T22:12:46.114101Z"},uniqueVisitors:253}
const acquisition = {ready:true,sourceUnit:"first-recorded-page-source-evidence",sourceAttributionVerified:false,coverage:{recordedBrowserIds:253,pageBearingBrowserIds:252,pinnedSessions:439,pageSessions:430,firstLandingViews:430,laterNavigationViews:30,repeatedSameRouteViews:1742,previewOrTestPageViews:442,nonPreviewRecordedPageViews:1760},rows:[{source:"direct-or-private-referrer",landingPath:"/",events:3000,pageViews:1650,uniqueVisitors:189,pinnedSessions:317,pageSessions:317,viewsPerPinnedSession:5.21,viewsPerPageSession:5.21,firstLandingViews:317,laterNavigationViews:20,repeatedSameRouteViews:1313,secondActions:12,proofOpens:3,checkoutIntents:0,verifiedConversions:0,firstSeenAt:"2026-06-29T19:54:32Z",latest:"2026-07-17T22:12:46Z",visitor_id:"must-not-leak",sessionHash:"must-not-leak",secretUnexpected:"must-not-leak",nested:{identifier:"must-not-leak"}}]}
const returns = {ready:true,observedVisitors:253,repeatSessionVisitors:22,multiDayVisitors:12,repeatSessionRatePercent:8.7,multiDayRatePercent:4.7,observedEvents:3808,firstSeen:"2026-06-29T19:54:32Z",latestSeen:"2026-07-17T22:12:46Z",truthBoundary:"Aggregate browser return evidence; not people or accounts."}

function rpcFetch({summaryValue=summary,acquisitionValue=acquisition,returnValue=returns}={}){
  return async (url) => {
    if(String(url).includes("summary_read")) return new Response(JSON.stringify(summaryValue),{status:200,headers:{"content-type":"application/json"}})
    if(String(url).includes("acquisition_read")) return new Response(JSON.stringify(acquisitionValue),{status:200,headers:{"content-type":"application/json"}})
    if(String(url).includes("return_cohort_read")) return new Response(JSON.stringify(returnValue),{status:200,headers:{"content-type":"application/json"}})
    throw new Error("unexpected-rpc")
  }
}

let fetchCount=0
globalThis.fetch=async (...args)=>{fetchCount+=1;return rpcFetch()(...args)}
const live=responseHarness()
await handler({method:"GET",headers:{}},live)
assert.equal(live.statusCode,200)
assert.deepEqual({pageViews:live.body.audience.pageViews,uniqueVisitors:live.body.audience.uniqueVisitors,totalEvents:live.body.audience.totalEvents},{pageViews:2202,uniqueVisitors:253,totalEvents:3813})
assert.equal(live.body.audience.recordedBrowserIds,253)
assert.equal(live.body.audience.pageBearingBrowserIds,252)
assert.equal(live.body.audience.pinnedSessions,439)
assert.equal(live.body.audience.pageSessions,430)
assert.equal(live.body.audience.nonPageOnlyPinnedSessions,9)
assert.equal(live.body.audience.acquisitionPartitions.previewOrTestPageViews+live.body.audience.acquisitionPartitions.nonPreviewRecordedPageViews,2202)
assert.equal(live.body.audience.acquisitionPartitions.firstLandingViews+live.body.audience.acquisitionPartitions.laterNavigationViews+live.body.audience.acquisitionPartitions.repeatedSameRouteViews,2202)
assert.equal(live.body.audience.pinnedSessions-live.body.audience.pageSessions,live.body.audience.nonPageOnlyPinnedSessions)
assert.ok(live.body.audience.pageBearingBrowserIds<=live.body.audience.pageSessions)
assert.equal(live.body.audience.acquisitionPartitions.unknownOrUnclassified.ready,false)
assert.equal(live.body.audience.acquisitionPartitions.deliberateContinuations.ready,false)
assert.equal(live.body.audience.acquisitionPartitions.interruptionRecovery.ready,false)
assert.equal(live.body.audience.returnBehavior.repeatSessionBrowserIds,22)
assert.equal(live.body.audience.returnBehavior.window,"all-recorded-history")
assert.equal(live.body.audience.returnBehavior.previewTestExcluded,false)
assert.equal(live.body.audience.returnBehavior.automationExcluded,false)
assert.equal(live.body.audience.returnBehavior.culturalValueVerified,false)
assert.equal(live.body.audience.uniqueVisitorUnit,"pseudonymous-browser-ids")
assert.equal(live.body.audience.humanCountVerified,false)
assert.equal(live.headers["Cache-Control"],"private, no-store, max-age=0")
assert.equal(live.headers["CDN-Cache-Control"],"no-store")
assert.equal(fetchCount,3)
assert.doesNotMatch(JSON.stringify(live.body),/(visitor_id|session_id|visitorHash|sessionHash)/i)
assert.equal(live.body.audience.acquisitionPartitions.rows[0].secretUnexpected,undefined)
assert.equal(live.body.audience.acquisitionPartitions.rows[0].nested,undefined)
assert.equal(live.body.audience.acquisitionPartitions.rows[0].events,3000)
assert.equal(live.body.audience.acquisitionPartitions.rows[0].secondActions,12)

const unchanged=responseHarness()
await handler({method:"GET",headers:{"if-none-match":live.headers.ETag}},unchanged)
assert.equal(unchanged.statusCode,304)
assert.equal(unchanged.ended,true)
assert.equal(fetchCount,3)

const stableAudience=live.body.audience
assert.equal(audienceSnapshotEtag(structuredClone(stableAudience)),live.headers.ETag,"identical deep clones must preserve the ETag")
const etagMutations=[
  ["recordedBrowserIds",value=>{value.recordedBrowserIds+=1}],
  ["pageBearingBrowserIds",value=>{value.pageBearingBrowserIds-=1}],
  ["source row source",value=>{value.acquisitionPartitions.rows[0].source="unknown"}],
  ["source row landing",value=>{value.acquisitionPartitions.rows[0].landingPath="/watch/example"}],
  ["source row events",value=>{value.acquisitionPartitions.rows[0].events+=1}],
  ["source row secondActions",value=>{value.acquisitionPartitions.rows[0].secondActions=1}],
  ["acquisition readiness",value=>{value.acquisitionPartitions.ready=false}],
  ["unknown readiness",value=>{value.acquisitionPartitions.unknownOrUnclassified.ready=true}],
  ["unknown reason",value=>{value.acquisitionPartitions.unknownOrUnclassified.missingReason="changed"}],
  ["return observed IDs",value=>{value.returnBehavior.observedBrowserIds+=1}],
  ["return repeat rate",value=>{value.returnBehavior.repeatSessionRatePercent=9}],
  ["return multi-day rate",value=>{value.returnBehavior.multiDayRatePercent=5}],
  ["return readiness",value=>{value.returnBehavior.ready=false}]
]
for(const [label,mutate] of etagMutations){const changed=structuredClone(stableAudience);mutate(changed);assert.notEqual(audienceSnapshotEtag(changed),live.headers.ETag,`${label} must invalidate the ETag`)}

const wrongMethod=responseHarness()
await handler({method:"POST",headers:{}},wrongMethod)
assert.equal(wrongMethod.statusCode,405)
assert.equal(wrongMethod.headers.Allow,"GET")

resetAudienceSnapshotCacheForTests()
globalThis.fetch=rpcFetch({acquisitionValue:{ready:false,reason:"not-ready"},returnValue:{ready:false}})
const fallback=responseHarness()
await handler({method:"GET",headers:{}},fallback)
assert.equal(fallback.statusCode,200)
assert.equal(fallback.body.audience.acquisitionPartitions.ready,false)
assert.equal(fallback.body.audience.pageSessionsReady,false)
assert.equal(fallback.body.audience.pageSessions,null)
assert.equal(fallback.body.audience.returnBehavior.ready,false)
assert.equal(fallback.body.audience.recordedBrowserIds,253,"compatibility fallback may retain the summary browser-ID total")

async function invalidAcquisitionFallback(change){
  resetAudienceSnapshotCacheForTests()
  const invalid=structuredClone(acquisition)
  change(invalid.coverage)
  globalThis.fetch=rpcFetch({acquisitionValue:invalid})
  const response=responseHarness()
  await handler({method:"GET",headers:{}},response)
  assert.equal(response.body.audience.acquisitionPartitions.ready,false)
  assert.equal(response.body.audience.pageSessionsReady,false)
}
await invalidAcquisitionFallback(value=>{value.pageBearingBrowserIds=value.pageSessions+1})
await invalidAcquisitionFallback(value=>{value.pageBearingBrowserIds=value.recordedBrowserIds+1})
await invalidAcquisitionFallback(value=>{value.firstLandingViews=value.pageSessions-1;value.laterNavigationViews+=1})
await invalidAcquisitionFallback(value=>{value.previewOrTestPageViews+=1})
resetAudienceSnapshotCacheForTests()
const invalidRowAcquisition=structuredClone(acquisition)
invalidRowAcquisition.rows.push({...invalidRowAcquisition.rows[0],source:"external-referrer",events:1.5})
globalThis.fetch=rpcFetch({acquisitionValue:invalidRowAcquisition})
const invalidRowResponse=responseHarness()
await handler({method:"GET",headers:{}},invalidRowResponse)
assert.equal(invalidRowResponse.body.audience.acquisitionPartitions.ready,false,"an invalid approved row field must fail the advanced partition closed")

async function invalidReturnFallback(returnValue){
  resetAudienceSnapshotCacheForTests()
  globalThis.fetch=rpcFetch({returnValue})
  const response=responseHarness()
  await handler({method:"GET",headers:{}},response)
  assert.equal(response.body.audience.returnBehavior.ready,false)
}
const missingReturn=structuredClone(returns);delete missingReturn.observedEvents
await invalidReturnFallback(missingReturn)
await invalidReturnFallback({...returns,repeatSessionRatePercent:101})
await invalidReturnFallback({...returns,multiDayRatePercent:5.1})

resetAudienceSnapshotCacheForTests()
globalThis.fetch=async url=>String(url).includes("summary_read")?new Response("<html>bad upstream</html>",{status:200}):rpcFetch()(url)
const malformed=responseHarness()
await handler({method:"GET",headers:{}},malformed)
assert.equal(malformed.statusCode,503)
assert.equal(malformed.body.audience.reason,"audience-read-json-invalid")

const vercel=JSON.parse(readFileSync("vercel.json","utf8"))
const apiRewrite=vercel.rewrites.findIndex(item=>item.source==="/api/(.*)")
const spaRewrites=vercel.rewrites.map((item,index)=>({...item,index})).filter(item=>item.destination==="/index.html")
assert.ok(apiRewrite>=0&&spaRewrites.every(item=>apiRewrite<item.index))
assert.ok(!spaRewrites.some(item=>item.source==="/(.*)"))
assert.ok(readFileSync("public/404.html","utf8").includes('content="noindex,follow"'))
assert.ok(!readFileSync("vite.config.js","utf8").includes("runtimeCaching"))
assert.ok(readFileSync("tools/verify-audience-live-production.mjs","utf8").includes("non-JSON SPA or proxy fallback"))

console.log(JSON.stringify({ok:true,checked:73,states:["json-200","identical-304","method-405","no-store","compatibility-alias","acquisition-partitions","preview-partition","page-quality-partition","non-page-pinned-session","return-browser-operational-aggregate","privacy-safe","canonical-digest-etag","legacy-fallback-not-ready","adversarial-invariant-fallback","adversarial-return-fallback","malformed-503","api-before-finite-spa"]},null,2))
