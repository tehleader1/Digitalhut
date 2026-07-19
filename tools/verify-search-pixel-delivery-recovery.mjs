import assert from "node:assert/strict"
import {deliverPixelWithRetry, shouldRetryPixelStatus} from "../src/lib/digitalhutPixelDelivery.js"

let checked = 0
const check = (condition, message) => { checked += 1; assert.ok(condition, message) }
const body = {eventName:"page_view",metadata:{clientEventId:"dh_e_fixed",deliveryAttempt:1,deliveryRecoveredAfterFailure:false}}
const immediate = callback => { callback(); return 1 }

for(const status of [408,425,429,500,503,599]) check(shouldRetryPixelStatus(status), `${status} should retry`)
for(const status of [200,201,400,401,403,404,422]) check(!shouldRetryPixelStatus(status), `${status} should not retry`)

async function run(responses){
  const requests=[]
  const fetchFn=async (_url,options)=>{
    requests.push(JSON.parse(options.body))
    const next=responses.shift()
    if(next instanceof Error) throw next
    return {ok:next>=200&&next<300,status:next}
  }
  const result=await deliverPixelWithRetry(structuredClone(body),{fetchFn,scheduleFn:immediate,delayMs:0})
  return {requests,result}
}

const success=await run([202])
check(success.requests.length===1,"success must not retry")
check(success.result.delivered===true&&success.result.retried===false,"success receipt incorrect")

const unavailable=await run([503,202])
check(unavailable.requests.length===2,"503 must retry once")
check(unavailable.requests[0].metadata.clientEventId===unavailable.requests[1].metadata.clientEventId,"retry must preserve clientEventId")
check(unavailable.requests[1].metadata.deliveryAttempt===2,"retry attempt must be 2")
check(unavailable.requests[1].metadata.deliveryRecoveredAfterFailure===true,"retry recovery marker missing")
check(unavailable.result.delivered===true&&unavailable.result.retried===true,"503 recovery receipt incorrect")

const permanent=await run([400])
check(permanent.requests.length===1,"permanent 400 must not retry")
check(permanent.result.delivered===false&&permanent.result.retried===false,"400 refusal receipt incorrect")

const network=await run([new Error("network"),202])
check(network.requests.length===2,"network rejection must retry once")
check(network.requests[0].metadata.clientEventId===network.requests[1].metadata.clientEventId,"network retry must preserve clientEventId")
check(network.result.delivered===true&&network.result.retried===true,"network recovery receipt incorrect")

const repeatedFailure=await run([503,503])
check(repeatedFailure.requests.length===2,"retry budget must remain one")
check(repeatedFailure.result.delivered===false&&repeatedFailure.result.retried===true,"repeated failure receipt incorrect")

console.log(JSON.stringify({ok:true,checked,retryBudget:1},null,2))
