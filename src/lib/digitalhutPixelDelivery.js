export const pixelEndpoint = "/api/insight-map"
export const deliveryRetryDelayMs = 900

export function shouldRetryPixelStatus(status){
  const value = Number(status)
  return value === 408 || value === 425 || value === 429 || (value >= 500 && value <= 599)
}

export async function deliverPixelWithRetry(body, {fetchFn = fetch, scheduleFn = setTimeout, delayMs = deliveryRetryDelayMs} = {}){
  const clientEventId = body?.metadata?.clientEventId
  const request = payload => fetchFn(pixelEndpoint, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(payload),
    keepalive: true
  })
  let firstResponse = null
  try { firstResponse = await request(body) } catch {}
  if(firstResponse?.ok) return {delivered: true, retried: false, status: firstResponse.status}
  if(firstResponse && !shouldRetryPixelStatus(firstResponse.status)) return {delivered: false, retried: false, status: firstResponse.status}
  const retryBody = {
    ...body,
    metadata: {...body.metadata, clientEventId, deliveryAttempt: 2, deliveryRecoveredAfterFailure: true}
  }
  return new Promise(resolve => scheduleFn(async () => {
    try {
      const retryResponse = await request(retryBody)
      resolve({delivered: retryResponse.ok, retried: true, status: retryResponse.status})
    } catch {
      resolve({delivered: false, retried: true, status: null})
    }
  }, delayMs))
}
