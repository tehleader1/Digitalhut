const STS_URL = "https://sts.googleapis.com/v1/token"
const IAM_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
const SERVICE_ACCOUNT_EMAIL = process.env.GA4_SERVICE_ACCOUNT_EMAIL || "digitalhut-ga4-reader@digitalhut-503212.iam.gserviceaccount.com"
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || "546662169"
const WIF_AUDIENCE = process.env.GOOGLE_WIF_AUDIENCE || ""
let cache = null

async function readJson(response, label){
  const body = await response.json().catch(() => ({}))
  if(!response.ok) throw new Error(`${label}:${response.status}:${body?.error?.status || "request-failed"}`)
  return body
}

async function federatedToken(){
  const oidcToken = process.env.VERCEL_OIDC_TOKEN
  if(!oidcToken || !WIF_AUDIENCE) throw new Error("keyless-auth-not-configured")
  const response = await fetch(STS_URL, {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      audience:WIF_AUDIENCE,
      grant_type:"urn:ietf:params:oauth:grant-type:token-exchange",
      requested_token_type:"urn:ietf:params:oauth:token-type:access_token",
      scope:IAM_SCOPE,
      subject_token:oidcToken,
      subject_token_type:"urn:ietf:params:oauth:token-type:jwt",
    }),
  })
  return readJson(response, "sts")
}

async function serviceAccountToken(federatedAccessToken){
  const target = encodeURIComponent(SERVICE_ACCOUNT_EMAIL)
  const response = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${target}:generateAccessToken`, {
    method:"POST",
    headers:{Authorization:`Bearer ${federatedAccessToken}`, "Content-Type":"application/json"},
    body:JSON.stringify({scope:[IAM_SCOPE], lifetime:"900s"}),
  })
  return readJson(response, "iam")
}

function metricMap(report){
  const names = report?.metricHeaders?.map((item) => item.name) || []
  const values = report?.rows?.[0]?.metricValues || []
  return Object.fromEntries(names.map((name, index) => [name, Number(values[index]?.value || 0)]))
}

function eventRows(report){
  return (report?.rows || []).map((row) => ({
    eventName:String(row.dimensionValues?.[0]?.value || "unknown").slice(0, 80),
    eventCount:Number(row.metricValues?.[0]?.value || 0),
  }))
}

async function googleAnalyticsReport(){
  const federated = await federatedToken()
  const serviceAccount = await serviceAccountToken(federated.access_token)
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:batchRunReports`, {
    method:"POST",
    headers:{Authorization:`Bearer ${serviceAccount.accessToken}`, "Content-Type":"application/json"},
    body:JSON.stringify({requests:[
      {dateRanges:[{startDate:"7daysAgo",endDate:"today"}],metrics:[{name:"activeUsers"},{name:"sessions"},{name:"screenPageViews"},{name:"eventCount"},{name:"keyEvents"}]},
      {dateRanges:[{startDate:"7daysAgo",endDate:"today"}],dimensions:[{name:"eventName"}],metrics:[{name:"eventCount"}],orderBys:[{metric:{metricName:"eventCount"},desc:true}],limit:20},
    ]}),
  })
  const payload = await readJson(response, "analytics-data")
  const reports = payload.reports || []
  return {
    ok:true,
    provider:"Google Analytics Data API",
    propertyId:PROPERTY_ID,
    dateRange:{start:"7daysAgo",end:"today"},
    totals:metricMap(reports[0]),
    events:eventRows(reports[1]),
    generatedAt:new Date().toISOString(),
    truthBoundary:"Google-recorded GA4 aggregates. These are not DigitalHut internal counters and activeUsers are not a claim of unique people.",
  }
}

export default async function handler(req, res){
  res.setHeader("Allow", "GET")
  if(req.method !== "GET") return res.status(405).json({ok:false,error:"method-not-allowed"})
  if(cache && Date.now() - cache.at < 120000){
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300")
    return res.status(200).json(cache.value)
  }
  try {
    const value = await googleAnalyticsReport()
    cache = {at:Date.now(), value}
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300")
    return res.status(200).json(value)
  } catch(error){
    const configurationMissing = String(error?.message || "").includes("keyless-auth-not-configured")
    res.setHeader("Cache-Control", "no-store")
    return res.status(configurationMissing ? 503 : 502).json({
      ok:false,
      provider:"Google Analytics Data API",
      error:configurationMissing ? "keyless-auth-not-configured" : "provider-read-failed",
      required:configurationMissing ? ["VERCEL_OIDC_TOKEN", "GOOGLE_WIF_AUDIENCE"] : undefined,
    })
  }
}
