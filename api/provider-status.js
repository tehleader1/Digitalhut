import crypto from "node:crypto"
import {handleAiLayer} from "./_ai-layer.js"

const providers = [
  ["sketchfab", ["SKETCHFAB_API_TOKEN", "SKETCHFAB_ACCESS_TOKEN", "VITE_SKETCHFAB_API_TOKEN", "VITE_SKETCHFAB_ACCESS_TOKEN"], "3d-model-search"],
  ["cesium", ["CESIUM_ION_TOKEN", "VITE_CESIUM_ION_TOKEN"], "maps-terrain-3d"],
  ["alpha-vantage", ["ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY"], "market-statistics"],
  ["fmp", ["FMP_API_KEY", "VITE_FMP_API_KEY"], "market-statistics"],
  ["polygon", ["POLYGON_API_KEY", "VITE_POLYGON_API_KEY"], "market-statistics"],
  ["alpaca", ["ALPACA_API_KEY", "ALPACA_SECRET_KEY"], "stock-and-options-print-flow"],
  ["supabase", ["SUPABASE_URL", "VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_PUBLISHABLE_KEY"], "asset-storage"],
  ["supabase-backend", ["SUPABASE_SERVICE_ROLE_KEY", "DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY"], "backend-capture"],
  ["google-cloud", ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_CLOUD_PROJECT"], "speech-tts-backup-worker"],
  ["google-search-console", ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_SEARCH_CONSOLE_SITE_URL", "GOOGLE_CLOUD_PROJECT"], "real-google-sitemap-rank-read"],
  ["openai-billing", ["OPENAI_ADMIN_KEY", "OPENAI_ORG_ADMIN_KEY"], "api-cost-verification"],
  ["firecuda-storage", ["SUPABASE_FIRECUDA_ASSET_BASE", "VITE_SUPABASE_FIRECUDA_ASSET_BASE", "SUPABASE_FIRECUDA_AVAILABLE_FILES"], "verified-glb-storage"],
  ["paypal", ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_PLAN_STANDARD_ID", "PAYPAL_PLAN_PREMIUM_ID", "PAYPAL_PLAN_PRO_ID"], "subscription-checkout"],
  ["google-analytics-data", ["GA4_SERVICE_ACCOUNT_EMAIL", "GA4_PROPERTY_ID"], "provider-native-analytics-read"]
]

function envValue(key){
  return String(process.env[key] || "").replace(/^['"]|['"]$/g, "").trim()
}

function configured(keys){
  return keys.filter((key) => Boolean(envValue(key)))
}

const paypalRateWindows = new Map()
let ga4Cache = null

function requestPayload(req){
  if(req.body && typeof req.body === "object") return req.body
  if(typeof req.body !== "string") return {}
  try { return JSON.parse(req.body) } catch { return {} }
}

function consumePaypalRate(req, now = Date.now()){
  const forwarded = String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim()
  const key = forwarded || String(req.socket?.remoteAddress || "unknown")
  const windowMs = 15 * 60 * 1000
  const current = paypalRateWindows.get(key)
  if(!current || current.resetAt <= now){
    paypalRateWindows.set(key, {count:1, resetAt:now + windowMs})
    return {allowed:true, retryAfterSeconds:0}
  }
  current.count += 1
  if(paypalRateWindows.size > 2000) paypalRateWindows.delete(paypalRateWindows.keys().next().value)
  return {allowed:current.count <= 20, retryAfterSeconds:Math.max(1, Math.ceil((current.resetAt - now) / 1000))}
}

function paypalSettings(){
  const environment = envValue("PAYPAL_ENV").toLowerCase() === "sandbox" ? "sandbox" : "live"
  return {
    environment,
    apiBase: environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com",
    clientId: envValue("PAYPAL_CLIENT_ID"),
    clientSecret: envValue("PAYPAL_CLIENT_SECRET"),
    plans: {
      "tier-standard": envValue("PAYPAL_PLAN_STANDARD_ID"),
      "tier-premium": envValue("PAYPAL_PLAN_PREMIUM_ID"),
      "tier-pro": envValue("PAYPAL_PLAN_PRO_ID")
    }
  }
}

const PAYPAL_BINDING_TTL_MS = 60 * 60 * 1000
const paypalTierCodes = {
  "tier-standard":"s",
  "tier-premium":"m",
  "tier-pro":"p"
}
const paypalTierIds = Object.fromEntries(Object.entries(paypalTierCodes).map(([tierId, code]) => [code, tierId]))

function paypalBindingRootSecret(){
  return envValue("DIGITALHUT_PAYPAL_BINDING_SECRET")
    || envValue("PAYPAL_CLIENT_SECRET")
    || envValue("SUPABASE_SERVICE_ROLE_KEY")
    || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY")
    || envValue("SUPABASE_SECRET_KEY")
}

function paypalBindingSigningKey(rootSecret){
  return crypto.createHmac("sha256", rootSecret).update("digitalhut-paypal-subscription-binding-v1").digest()
}

function paypalBindingSignature(unsignedToken, rootSecret){
  return crypto.createHmac("sha256", paypalBindingSigningKey(rootSecret))
    .update(unsignedToken)
    .digest()
    .subarray(0, 24)
    .toString("base64url")
}

export function mintPaypalSubscriptionBinding({userId, tierId, rootSecret, now = Date.now(), nonce = crypto.randomBytes(9).toString("base64url")}){
  const normalizedUserId = String(userId || "").replaceAll("-", "").toLowerCase()
  const tierCode = paypalTierCodes[tierId]
  if(!/^[a-f0-9]{32}$/.test(normalizedUserId) || !tierCode || !rootSecret || !/^[A-Za-z0-9_-]{8,24}$/.test(nonce)) {
    throw new Error("invalid-paypal-binding-input")
  }
  const expiresAtMs = now + PAYPAL_BINDING_TTL_MS
  const unsignedToken = `dh1.${normalizedUserId}.${tierCode}.${Math.floor(expiresAtMs / 1000).toString(36)}.${nonce}`
  return {
    token:`${unsignedToken}.${paypalBindingSignature(unsignedToken, rootSecret)}`,
    expiresAt:new Date(expiresAtMs).toISOString()
  }
}

export function verifyPaypalSubscriptionBinding({token, userId, tierId, rootSecret, now = Date.now()}){
  const parts = String(token || "").split(".")
  if(parts.length !== 6 || parts[0] !== "dh1" || !rootSecret) return {valid:false, reason:"paypal-account-binding-missing"}
  const [version, tokenUserId, tierCode, expiryBase36, nonce, suppliedSignature] = parts
  const expectedTierId = paypalTierIds[tierCode]
  const normalizedUserId = String(userId || "").replaceAll("-", "").toLowerCase()
  if(!/^[a-f0-9]{32}$/.test(tokenUserId) || !/^[A-Za-z0-9_-]{8,24}$/.test(nonce) || !/^[a-z0-9]+$/.test(expiryBase36)) {
    return {valid:false, reason:"paypal-account-binding-malformed"}
  }
  if(tokenUserId !== normalizedUserId) return {valid:false, reason:"paypal-account-binding-user-mismatch"}
  if(!expectedTierId || expectedTierId !== tierId) return {valid:false, reason:"paypal-account-binding-tier-mismatch"}
  const expiresAtMs = Number.parseInt(expiryBase36, 36) * 1000
  if(!Number.isFinite(expiresAtMs) || expiresAtMs <= now) return {valid:false, reason:"paypal-account-binding-expired"}
  const unsignedToken = `${version}.${tokenUserId}.${tierCode}.${expiryBase36}.${nonce}`
  const expectedSignature = Buffer.from(paypalBindingSignature(unsignedToken, rootSecret))
  const actualSignature = Buffer.from(suppliedSignature)
  if(expectedSignature.length !== actualSignature.length || !crypto.timingSafeEqual(expectedSignature, actualSignature)) {
    return {valid:false, reason:"paypal-account-binding-invalid"}
  }
  return {
    valid:true,
    tierId:expectedTierId,
    expiresAt:new Date(expiresAtMs).toISOString(),
    bindingHash:crypto.createHash("sha256").update(token).digest("hex")
  }
}

function publicPaypalStatus(){
  const settings = paypalSettings()
  const plans = Object.fromEntries(Object.entries(settings.plans).filter(([, value]) => Boolean(value)))
  const missingPlanTiers = ["tier-standard", "tier-premium", "tier-pro"].filter((tier) => !plans[tier])
  return {
    configured:Boolean(settings.clientId && settings.clientSecret),
    environment:settings.environment,
    clientId:settings.clientId || null,
    plans,
    missingPlanTiers,
    subscriptionReady:Boolean(settings.clientId && settings.clientSecret && missingPlanTiers.length === 0),
    receiptCaptureReady:Boolean((envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY"))),
    note:"Secrets remain server-side. Paid access requires an ACTIVE PayPal subscription and an idempotent server receipt."
  }
}

async function paypalAccessToken(){
  const settings = paypalSettings()
  if(!settings.clientId || !settings.clientSecret) return {ok:false, reason:"missing-paypal-client-credentials"}
  try {
    const response = await fetch(`${settings.apiBase}/v1/oauth2/token`, {
      method:"POST",
      headers:{Authorization:`Basic ${Buffer.from(`${settings.clientId}:${settings.clientSecret}`).toString("base64")}`, "Content-Type":"application/x-www-form-urlencoded"},
      body:"grant_type=client_credentials",
      signal:AbortSignal.timeout(8000)
    })
    const payload = await response.json().catch(() => ({}))
    if(!response.ok || !payload.access_token) return {ok:false, reason:`paypal-oauth-${response.status || "failed"}`}
    return {ok:true, accessToken:payload.access_token, settings}
  } catch { return {ok:false, reason:"paypal-oauth-request-failed"} }
}

async function validatePaypalPlan(payload){
  const planId = String(payload?.planId || "").trim()
  const tierId = String(payload?.tierId || "").trim()
  if(!/^tier-(standard|premium|pro)$/.test(tierId) || !planId || planId.length > 180) return {active:false, reason:"invalid-paypal-plan-selection"}
  const token = await paypalAccessToken()
  if(!token.ok) return {active:false, reason:token.reason}
  if(token.settings.plans[tierId] !== planId) return {active:false, reason:"plan-does-not-match-selected-tier"}
  try {
    const response = await fetch(`${token.settings.apiBase}/v1/billing/plans/${encodeURIComponent(planId)}`, {
      headers:{Authorization:`Bearer ${token.accessToken}`},
      signal:AbortSignal.timeout(8000)
    })
    const plan = await response.json().catch(() => ({}))
    const status = String(plan.status || "").toUpperCase()
    return {active:response.ok && status === "ACTIVE", status, reason:response.ok ? (status === "ACTIVE" ? "" : "paypal-plan-not-active") : `paypal-plan-read-${response.status}`}
  } catch { return {active:false, reason:"paypal-plan-read-request-failed"} }
}

function paypalReceiptSupabaseConfig(){
  const configuredUrl = envValue("SUPABASE_URL") || envValue("VITE_SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL")
  const url = configuredUrl.includes("fzloxqgzihxiqqrlmyoz.supabase.co")
    ? configuredUrl
    : "https://fzloxqgzihxiqqrlmyoz.supabase.co"
  const serviceKey = envValue("SUPABASE_SERVICE_ROLE_KEY") || envValue("DIGITALHUT_SUPABASE_SERVICE_ROLE_KEY") || envValue("SUPABASE_SECRET_KEY")
  return {url:url.replace(/\/+$/, ""), serviceKey}
}

function supabasePublicKey(){
  return envValue("SUPABASE_ANON_KEY")
    || envValue("VITE_SUPABASE_ANON_KEY")
    || envValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    || envValue("SUPABASE_PUBLISHABLE_KEY")
}

async function authenticatedProviderUser(req){
  const bearer = String(req.headers?.authorization || "").replace(/^Bearer\s+/i, "").trim()
  if(!bearer) return null
  const {url, serviceKey} = paypalReceiptSupabaseConfig()
  // Validate checkout sessions against the same canonical Supabase project used
  // for entitlement receipts. A stale public key must not override the verified
  // server credential and make valid signed-in sessions look anonymous.
  const apiKey = serviceKey || supabasePublicKey()
  if(!apiKey) return null
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers:{apikey:apiKey, authorization:`Bearer ${bearer}`},
      signal:AbortSignal.timeout(8000)
    })
    if(!response.ok) return null
    const user = await response.json().catch(() => null)
    return user?.id ? user : null
  } catch { return null }
}

async function createPaypalSubscriptionBinding(req, payload){
  const user = await authenticatedProviderUser(req)
  if(!user) return {ready:false, reason:"sign-in-required"}
  const tierId = String(payload?.tierId || "").trim()
  const settings = paypalSettings()
  if(!paypalTierCodes[tierId] || !settings.plans[tierId]) return {ready:false, reason:"invalid-paypal-plan-selection"}
  const rootSecret = paypalBindingRootSecret()
  if(!settings.clientId || !settings.clientSecret || !rootSecret) return {ready:false, reason:"paypal-binding-not-configured"}
  try {
    const binding = mintPaypalSubscriptionBinding({userId:user.id, tierId, rootSecret})
    return {
      ready:true,
      tierId,
      customId:binding.token,
      expiresAt:binding.expiresAt
    }
  } catch {
    return {ready:false, reason:"paypal-binding-create-failed"}
  }
}

async function writePaypalEntitlement({userId, subscriptionId, tierId, planId, status, subscription, bindingHash}){
  const {url, serviceKey} = paypalReceiptSupabaseConfig()
  if(!serviceKey) return {recorded:false, reason:"supabase-server-entitlement-not-configured"}
  const accessEndsAt = subscription?.billing_info?.next_billing_time || null
  try {
    const response = await fetch(`${url}/rest/v1/rpc/digitalhut_record_paypal_entitlement`, {
      method:"POST",
      headers:{
        apikey:serviceKey,
        authorization:`Bearer ${serviceKey}`,
        "content-type":"application/json"
      },
      body:JSON.stringify({
        p_user_id:userId,
        p_tier_id:tierId,
        p_subscription_id:subscriptionId,
        p_plan_id:planId,
        p_provider_status:status,
        p_provider_receipt:{
          provider:"paypal",
          providerVerified:true,
          subscriptionId,
          planId,
          status,
          accountBindingVerified:true,
          accountBindingHash:bindingHash,
          environment:paypalSettings().environment
        },
        p_access_ends_at:accessEndsAt
      }),
      signal:AbortSignal.timeout(8000)
    })
    const row = await response.json().catch(() => null)
    return response.ok && row?.user_id === userId
      ? {recorded:true, row}
      : {recorded:false, reason:`supabase-entitlement-write-${response.status}`}
  } catch { return {recorded:false, reason:"supabase-entitlement-write-request-failed"} }
}

async function recordPaypalReceipt({subscriptionId, tierId, planId, status, environment, bindingHash}){
  const {url, serviceKey} = paypalReceiptSupabaseConfig()
  if(!serviceKey) return {recorded:false, reason:"supabase-server-receipt-not-configured"}
  const receiptHash = crypto.createHash("sha256").update(subscriptionId).digest("hex")
  const clientEventId = `paypal-subscription-${receiptHash}`
  const row = {
    event_name:"paypal_subscription_verified",
    session_id:`paypal-${receiptHash.slice(0, 32)}`,
    path:"/checkout/paypal",
    referrer:"paypal-subscription",
    title:"DigitalHut PayPal subscription verified",
    source:"paypal-provider-status",
    tier_key:tierId,
    metadata:{
      status,
      environment,
      subscriptionId,
      planId,
      accountBindingVerified:true,
      accountBindingHash:bindingHash,
      clientEventId,
      providerVerified:true,
      receiptType:"paypal-subscription-verification"
    }
  }
  const headers = {apikey:serviceKey, authorization:`Bearer ${serviceKey}`, "content-type":"application/json"}
  try {
    const response = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events`, {
      method:"POST",
      headers:{...headers, Prefer:"return=minimal"},
      body:JSON.stringify(row),
      signal:AbortSignal.timeout(8000)
    })
    if(response.ok) return {recorded:true, duplicate:false}
    if(response.status !== 409) return {recorded:false, reason:`supabase-receipt-write-${response.status}`}
    const query = new URLSearchParams({select:"id", "metadata->>clientEventId":`eq.${clientEventId}`, limit:"1"})
    const existing = await fetch(`${url}/rest/v1/digitalhut_search_pixel_events?${query}`, {
      headers,
      signal:AbortSignal.timeout(8000)
    })
    const rows = await existing.json().catch(() => [])
    return existing.ok && Array.isArray(rows) && rows.length
      ? {recorded:true, duplicate:true}
      : {recorded:false, reason:"supabase-receipt-conflict-not-confirmed"}
  } catch { return {recorded:false, reason:"supabase-receipt-write-request-failed"} }
}

async function verifyPaypalSubscription(req, payload){
  const user = await authenticatedProviderUser(req)
  if(!user) return {verified:false, reason:"sign-in-required"}
  const subscriptionId = String(payload?.subscriptionId || "").trim()
  const tierId = String(payload?.tierId || "").trim()
  if(!/^[A-Z0-9-]{8,160}$/i.test(subscriptionId) || !/^tier-(standard|premium|pro)$/.test(tierId)) return {verified:false, reason:"invalid-subscription-selection"}
  const token = await paypalAccessToken()
  if(!token.ok) return {verified:false, reason:token.reason}
  try {
    const response = await fetch(`${token.settings.apiBase}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      headers:{Authorization:`Bearer ${token.accessToken}`},
      signal:AbortSignal.timeout(8000)
    })
    const subscription = await response.json().catch(() => ({}))
    const status = String(subscription.status || "").toUpperCase()
    const planMatches = Boolean(token.settings.plans[tierId] && subscription.plan_id === token.settings.plans[tierId])
    if(!response.ok || status !== "ACTIVE" || !planMatches) return {
      verified:false,
      status,
      planMatches,
      reason:!response.ok ? "paypal-subscription-read-failed" : !planMatches ? "plan-does-not-match-tier" : "subscription-not-active"
    }
    const binding = verifyPaypalSubscriptionBinding({
      token:subscription.custom_id,
      userId:user.id,
      tierId,
      rootSecret:paypalBindingRootSecret()
    })
    if(!binding.valid) return {
      verified:false,
      providerVerified:true,
      status,
      planMatches:true,
      accountBindingVerified:false,
      reason:binding.reason
    }
    const receipt = await recordPaypalReceipt({
      subscriptionId:subscription.id || subscriptionId,
      tierId,
      planId:subscription.plan_id,
      status,
      environment:token.settings.environment,
      bindingHash:binding.bindingHash
    })
    const entitlement = receipt.recorded
      ? await writePaypalEntitlement({
        userId:user.id,
        subscriptionId:subscription.id || subscriptionId,
        tierId,
        planId:subscription.plan_id,
        status,
        subscription,
        bindingHash:binding.bindingHash
      })
      : {recorded:false, reason:receipt.reason}
    return {
      verified:receipt.recorded && entitlement.recorded,
      providerVerified:true,
      accountBindingVerified:true,
      status,
      planMatches:true,
      receiptRecorded:receipt.recorded,
      entitlementRecorded:entitlement.recorded,
      receiptDuplicate:receipt.duplicate === true,
      reason:receipt.recorded && entitlement.recorded ? "" : entitlement.reason || receipt.reason
    }
  } catch { return {verified:false, reason:"paypal-subscription-read-request-failed"} }
}

async function providerJson(response, label){
  const body = await response.json().catch(() => ({}))
  if(!response.ok) throw new Error(`${label}:${response.status}:${body?.error?.status || "request-failed"}`)
  return body
}

async function ga4FederatedToken(req){
  const oidcToken = String(req.headers?.["x-vercel-oidc-token"] || "").trim()
  const audience = envValue("GOOGLE_WIF_AUDIENCE") || "//iam.googleapis.com/projects/648891242266/locations/global/workloadIdentityPools/vercel-digitalhut-prod/providers/vercel"
  if(!oidcToken) throw new Error("vercel-oidc-token-missing")
  const response = await fetch("https://sts.googleapis.com/v1/token", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({
      audience,
      grant_type:"urn:ietf:params:oauth:grant-type:token-exchange",
      requested_token_type:"urn:ietf:params:oauth:token-type:access_token",
      scope:"https://www.googleapis.com/auth/cloud-platform",
      subject_token:oidcToken,
      subject_token_type:"urn:ietf:params:oauth:token-type:jwt"
    }),
    signal:AbortSignal.timeout(10000)
  })
  return providerJson(response, "sts")
}

async function ga4ServiceAccountToken(federatedAccessToken){
  const serviceAccountEmail = envValue("GA4_SERVICE_ACCOUNT_EMAIL") || "digitalhut-ga4-reader@digitalhut-503212.iam.gserviceaccount.com"
  const target = encodeURIComponent(serviceAccountEmail)
  const response = await fetch(`https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${target}:generateAccessToken`, {
    method:"POST",
    headers:{Authorization:`Bearer ${federatedAccessToken}`, "Content-Type":"application/json"},
    body:JSON.stringify({scope:["https://www.googleapis.com/auth/analytics.readonly"], lifetime:"900s"}),
    signal:AbortSignal.timeout(10000)
  })
  return providerJson(response, "iam")
}

function ga4MetricMap(report){
  const names = report?.metricHeaders?.map((item) => item.name) || []
  const values = report?.totals?.[0]?.metricValues || report?.rows?.[0]?.metricValues || []
  return Object.fromEntries(names.map((name, index) => [name, Number(values[index]?.value || 0)]))
}

function ga4EventRows(report){
  return (report?.rows || []).map((row) => ({
    eventName:String(row.dimensionValues?.[0]?.value || "unknown").slice(0, 80),
    eventCount:Number(row.metricValues?.[0]?.value || 0)
  }))
}

async function googleAnalyticsStatus(req){
  const propertyId = envValue("GA4_PROPERTY_ID") || "546662169"
  if(!privateStatusAllowed(req)){
    return {
      ok:false,
      configured:true,
      access:"admin-token-required",
      provider:"Google Analytics Data API",
      propertyId,
      truthBoundary:"Provider-native GA4 statistics are private and are never substituted with DigitalHut internal counters."
    }
  }
  if(ga4Cache && Date.now() - ga4Cache.at < 120000) return ga4Cache.value
  try {
    const federated = await ga4FederatedToken(req)
    const serviceAccount = await ga4ServiceAccountToken(federated.access_token)
    const headers = {Authorization:`Bearer ${serviceAccount.accessToken}`, "Content-Type":"application/json"}
    const [standardResponse, realtimeResponse] = await Promise.all([
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`, {
        method:"POST",
        headers,
        body:JSON.stringify({requests:[
          {dateRanges:[{startDate:"today",endDate:"today"}],metrics:[{name:"activeUsers"},{name:"sessions"},{name:"screenPageViews"},{name:"eventCount"},{name:"keyEvents"}],metricAggregations:["TOTAL"]},
          {dateRanges:[{startDate:"today",endDate:"today"}],dimensions:[{name:"eventName"}],metrics:[{name:"eventCount"}],orderBys:[{metric:{metricName:"eventCount"},desc:true}],limit:20}
        ]}),
        signal:AbortSignal.timeout(12000)
      }),
      fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
        method:"POST",
        headers,
        body:JSON.stringify({metrics:[{name:"activeUsers"},{name:"eventCount"}],dimensions:[{name:"eventName"}],metricAggregations:["TOTAL"],orderBys:[{metric:{metricName:"eventCount"},desc:true}],limit:20}),
        signal:AbortSignal.timeout(12000)
      })
    ])
    const [standardPayload, realtimePayload] = await Promise.all([
      providerJson(standardResponse, "analytics-data-standard"),
      providerJson(realtimeResponse, "analytics-data-realtime")
    ])
    const reports = standardPayload.reports || []
    const value = {
      ok:true,
      provider:"Google Analytics Data API",
      propertyId,
      today:{dateRange:{start:"today",end:"today"}, totals:ga4MetricMap(reports[0]), events:ga4EventRows(reports[1])},
      realtime:{totals:ga4MetricMap(realtimePayload), events:ga4EventRows(realtimePayload)},
      generatedAt:new Date().toISOString(),
      truthBoundary:"Google-recorded GA4 aggregates. Active users are not a claim of unique people."
    }
    ga4Cache = {at:Date.now(), value}
    return value
  } catch(error){
    return {
      ok:false,
      provider:"Google Analytics Data API",
      propertyId,
      error:String(error?.message || "").includes("vercel-oidc-token-missing") ? "production-vercel-oidc-token-missing" : "provider-read-failed"
    }
  }
}

function unixDaysAgo(days){
  return Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000)
}

function publicBillingStatus(reason){
  return {
    configured: Boolean(envValue("OPENAI_ADMIN_KEY") || envValue("OPENAI_ORG_ADMIN_KEY")),
    verified: false,
    reason,
    access: "admin-token-required",
    apiUsageBilling: {
      status: "not-public",
      endpoint: "https://api.openai.com/v1/organization/costs"
    },
    codexProClaim: {
      status: "user-attested",
      note: "Codex/ChatGPT plan billing is account-side and is not exposed through DigitalHut."
    }
  }
}

async function openAiBillingStatus(req){
  const statusToken = envValue("DIGITALHUT_ADMIN_STATUS_TOKEN")
  const requestToken = String(req.headers["x-digitalhut-admin-token"] || req.headers.authorization?.replace(/^Bearer\s+/i, "") || "").trim()
  if(!statusToken || requestToken !== statusToken){
    return publicBillingStatus("private billing verification requires DIGITALHUT_ADMIN_STATUS_TOKEN")
  }

  const adminKey = envValue("OPENAI_ADMIN_KEY") || envValue("OPENAI_ORG_ADMIN_KEY")
  if(!adminKey){
    return publicBillingStatus("missing OPENAI_ADMIN_KEY or OPENAI_ORG_ADMIN_KEY")
  }

  const url = new URL("https://api.openai.com/v1/organization/costs")
  url.searchParams.set("start_time", String(unixDaysAgo(30)))
  url.searchParams.set("bucket_width", "1d")

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${adminKey}`,
        "Content-Type": "application/json"
      }
    })
    const body = await response.json().catch(() => ({}))
    if(!response.ok){
      return {
        configured: true,
        verified: false,
        reason: "OpenAI organization costs endpoint did not authorize or return a valid response.",
        statusCode: response.status,
        apiUsageBilling: {
          status: "configured-not-verified",
          endpoint: "https://api.openai.com/v1/organization/costs"
        },
        codexProClaim: {
          status: "user-attested",
          note: "Codex/ChatGPT plan billing is separate from OpenAI API organization cost verification."
        }
      }
    }
    const buckets = Array.isArray(body?.data) ? body.data : []
    return {
      configured: true,
      verified: true,
      provider: "openai-organization-costs",
      windowDays: 30,
      bucketCount: buckets.length,
      apiUsageBilling: {
        status: "verified",
        endpoint: "https://api.openai.com/v1/organization/costs"
      },
      codexProClaim: {
        status: "user-attested",
        note: "This verifies API organization cost endpoint access, not private cost totals or the Codex/ChatGPT subscription entitlement."
      }
    }
  } catch {
    return {
      configured: true,
      verified: false,
      reason: "OpenAI billing status request failed at runtime.",
      apiUsageBilling: {
        status: "request-failed",
        endpoint: "https://api.openai.com/v1/organization/costs"
      },
      codexProClaim: {
        status: "user-attested",
        note: "Codex/ChatGPT plan billing remains account-side and is not exposed here."
      }
    }
  }
}

function base64url(input){
  return Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function serviceAccountFromEnv(){
  const rawJson = envValue("GOOGLE_SERVICE_ACCOUNT_JSON")
  if(rawJson){
    try {
      return JSON.parse(rawJson)
    } catch {
      return null
    }
  }
  return null
}

async function googleAccessToken(scopes){
  const account = serviceAccountFromEnv()
  if(!account?.client_email || !account?.private_key){
    return {ok: false, reason: "missing GOOGLE_SERVICE_ACCOUNT_JSON with client_email/private_key"}
  }
  const now = Math.floor(Date.now() / 1000)
  const header = {alg: "RS256", typ: "JWT"}
  const claim = {
    iss: account.client_email,
    scope: scopes.join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600
  }
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`
  const signer = crypto.createSign("RSA-SHA256")
  signer.update(unsigned)
  const signature = signer.sign(account.private_key).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
  const assertion = `${unsigned}.${signature}`
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion
  })
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {"Content-Type": "application/x-www-form-urlencoded"},
    body
  })
  const json = await response.json().catch(() => ({}))
  if(!response.ok || !json.access_token){
    return {ok: false, reason: "Google OAuth token request failed", statusCode: response.status}
  }
  return {ok: true, accessToken: json.access_token}
}

function dateDaysAgo(days){
  const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

function privateStatusAllowed(req){
  const statusToken = envValue("DIGITALHUT_ADMIN_STATUS_TOKEN")
  const requestToken = String(req.headers["x-digitalhut-admin-token"] || req.headers.authorization?.replace(/^Bearer\s+/i, "") || "").trim()
  return Boolean(statusToken && requestToken === statusToken)
}

async function googleSearchConsoleStatus(req){
  const account = serviceAccountFromEnv()
  const siteUrl = envValue("GOOGLE_SEARCH_CONSOLE_SITE_URL") || "https://www.digitalhut.app/"
  const sitemapUrl = envValue("GOOGLE_SEARCH_CONSOLE_SITEMAP_URL") || "https://www.digitalhut.app/sitemap.xml"
  const sitemapUrls = [...new Set([
    sitemapUrl,
    "https://www.digitalhut.app/sitemap-index.xml",
    "https://www.digitalhut.app/sitemap-master-keyword-50000.xml"
  ])]
  if(!privateStatusAllowed(req)){
    return {
      configured: Boolean(envValue("GOOGLE_SERVICE_ACCOUNT_JSON")),
      verified: false,
      siteUrl,
      sitemapUrl,
      sitemapUrls,
      access: "admin-token-required",
      googleActualRankStatus: "private-admin-read-required",
      googleSitemapStatus: "private-admin-read-required",
      rankHigherStatus: "not-public",
      note: "Search Console impressions, clicks, queries, pages, countries, and positions are private and require DIGITALHUT_ADMIN_STATUS_TOKEN."
    }
  }
  const token = await googleAccessToken(["https://www.googleapis.com/auth/webmasters.readonly"])
  if(!token.ok){
    return {
      configured: false,
      verified: false,
      siteUrl,
      sitemapUrl,
      googleActualRankStatus: "not-verified",
      reason: token.reason,
      requiredSetup: "Add GOOGLE_SERVICE_ACCOUNT_JSON, then add the service account email as a user/owner in Google Search Console for DigitalHut."
    }
  }

  const encodedSite = encodeURIComponent(siteUrl)
  const authHeaders = {Authorization: `Bearer ${token.accessToken}`}
  const sitesResponse = await fetch("https://www.googleapis.com/webmasters/v3/sites", {headers: authHeaders})
  const sitesJson = await sitesResponse.json().catch(() => ({}))
  const sitemapsResponse = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps`, {headers: authHeaders})
  const sitemapsJson = await sitemapsResponse.json().catch(() => ({}))
  const queryResponse = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`, {
    method: "POST",
    headers: {...authHeaders, "Content-Type": "application/json"},
    body: JSON.stringify({
      startDate: dateDaysAgo(30),
      endDate: dateDaysAgo(3),
      dimensions: ["query", "page", "country"],
      rowLimit: 100,
      type: "web",
      dataState: "final"
    })
  })
  const queryJson = await queryResponse.json().catch(() => ({}))
  const rows = Array.isArray(queryJson?.rows) ? queryJson.rows : []
  const totalClicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0)
  const totalImpressions = rows.reduce((sum, row) => sum + Number(row.impressions || 0), 0)
  const weightedPosition = rows.reduce((sum, row) => sum + (Number(row.position || 0) * Number(row.impressions || 0)), 0)
  const averagePosition = totalImpressions ? Number((weightedPosition / totalImpressions).toFixed(2)) : null
  const sitemapRows = Array.isArray(sitemapsJson?.sitemap) ? sitemapsJson.sitemap : []
  const matchingSitemap = sitemapRows.find((item) => item?.path === sitemapUrl) || null
  const matchingSitemaps = sitemapUrls.map((url) => {
    const match = sitemapRows.find((item) => item?.path === url) || null
    return match ? {
      path: match.path,
      lastSubmitted: match.lastSubmitted,
      lastDownloaded: match.lastDownloaded,
      isPending: match.isPending,
      isSitemapsIndex: match.isSitemapsIndex,
      warnings: match.warnings,
      errors: match.errors
    } : {
      path: url,
      visible: false
    }
  })
  const visibleSitemapCount = matchingSitemaps.filter((item) => item.visible !== false).length
  const pendingSitemapCount = matchingSitemaps.filter((item) => item.isPending).length

  return {
    configured: true,
    verified: sitesResponse.ok && sitemapsResponse.ok && queryResponse.ok,
    serviceAccountEmail: account?.client_email || null,
    siteUrl,
    sitemapUrl,
    sitemapUrls,
    googleActualRankStatus: rows.length ? "google-search-console-read" : "google-read-no-search-rows-yet",
    googleSitemapStatus: visibleSitemapCount === sitemapUrls.length ? "all-digitalhut-sitemaps-visible-in-search-console" : matchingSitemap ? "primary-sitemap-visible-extra-sitemaps-pending" : "sitemap-not-returned-in-list",
    sitesAccessible: Array.isArray(sitesJson?.siteEntry) ? sitesJson.siteEntry.map((site) => ({siteUrl: site.siteUrl, permissionLevel: site.permissionLevel})) : [],
    googleApiDiagnostics: {
      sites: {
        ok: sitesResponse.ok,
        status: sitesResponse.status,
        error: sitesJson?.error?.message || null
      },
      sitemaps: {
        ok: sitemapsResponse.ok,
        status: sitemapsResponse.status,
        error: sitemapsJson?.error?.message || null
      },
      searchAnalytics: {
        ok: queryResponse.ok,
        status: queryResponse.status,
        error: queryJson?.error?.message || null
      }
    },
    sitemap: matchingSitemap ? {
      path: matchingSitemap.path,
      lastSubmitted: matchingSitemap.lastSubmitted,
      lastDownloaded: matchingSitemap.lastDownloaded,
      isPending: matchingSitemap.isPending,
      isSitemapsIndex: matchingSitemap.isSitemapsIndex,
      warnings: matchingSitemap.warnings,
      errors: matchingSitemap.errors
    } : null,
    sitemaps: matchingSitemaps,
    sitemapCoverage: {
      requestedSitemapCount: sitemapUrls.length,
      visibleSitemapCount,
      pendingSitemapCount,
      masterKeywordSitemapVisible: matchingSitemaps.some((item) => item.path === "https://www.digitalhut.app/sitemap-master-keyword-50000.xml" && item.visible !== false),
      sitemapIndexVisible: matchingSitemaps.some((item) => item.path === "https://www.digitalhut.app/sitemap-index.xml" && item.visible !== false)
    },
    searchAnalytics: {
      rowCount: rows.length,
      totalClicks,
      totalImpressions,
      averagePosition,
      topRows: rows.slice(0, 20).map((row) => ({
        keys: row.keys,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position
      }))
    },
    rankHigherStatus: "needs-previous-search-console-snapshot-to-compare",
    note: "Real rank-higher claims require comparing average position/query/page rows against a previous Search Console snapshot."
  }
}

function subscriptionReadModel(userId, row = null){
  const checkedAtDate = new Date()
  const checkedAt = checkedAtDate.toISOString()
  const freshUntil = new Date(checkedAtDate.getTime() + 5 * 60 * 1000).toISOString()
  const tierId = row?.tier_id || "tier-none"
  const version = Math.max(1, Number(row?.receipt_version || 1))
  const receiptSeed = row?.provider_subscription_id || `missing:${userId}`
  const receiptId = `receipt-${crypto.createHash("sha256").update(receiptSeed).digest("hex").slice(0, 32)}`
  const signingSecret = paypalBindingRootSecret()
  const signaturePayload = `${userId}:${receiptId}:${version}:${checkedAt}`
  const signatureId = signingSecret
    ? `sig-${crypto.createHmac("sha256", paypalBindingSigningKey(signingSecret)).update(signaturePayload).digest("hex").slice(0, 32)}`
    : ""
  const accessEnd = row?.access_ends_at && Date.parse(row.access_ends_at) > checkedAtDate.getTime()
    ? new Date(row.access_ends_at).toISOString()
    : null
  return {
    authority:"digitalhut-server-entitlement-read-model-v1",
    signatureVerified:Boolean(signatureId),
    signatureKeyId:signatureId ? "paypal-entitlement-hmac-v1" : "missing",
    signatureId,
    userId,
    tierId,
    receiptId,
    receiptTierId:tierId,
    version,
    receiptVersion:version,
    checkedAt,
    freshUntil,
    state:row?.state || "missing",
    accessEndsAt:accessEnd
  }
}

async function subscriptionEntitlementStatus(req){
  const user = await authenticatedProviderUser(req)
  if(!user) return {ok:false, access:"sign-in-required", reason:"sign-in-required"}
  const {url, serviceKey} = paypalReceiptSupabaseConfig()
  if(!serviceKey) return {ok:false, access:"provider-error", reason:"supabase-server-entitlement-not-configured"}
  const headers={apikey:serviceKey, authorization:`Bearer ${serviceKey}`}
  try {
    const query = new URLSearchParams({
      select:"user_id,tier_id,provider_subscription_id,provider_plan_id,provider_status,state,receipt_version,verified_at,access_ends_at",
      user_id:`eq.${user.id}`,
      limit:"1"
    })
    const response = await fetch(`${url}/rest/v1/digitalhut_subscription_entitlements?${query}`, {
      headers,
      signal:AbortSignal.timeout(8000)
    })
    if(!response.ok) return {ok:false, access:"provider-error", reason:`entitlement-read-${response.status}`}
    const rows = await response.json().catch(() => [])
    let row = Array.isArray(rows) ? rows[0] : null
    if(!row) return {ok:true, readModel:subscriptionReadModel(user.id)}

    const token = await paypalAccessToken()
    if(!token.ok) return {ok:false, access:"provider-error", reason:token.reason}
    const providerResponse = await fetch(`${token.settings.apiBase}/v1/billing/subscriptions/${encodeURIComponent(row.provider_subscription_id)}`, {
      headers:{Authorization:`Bearer ${token.accessToken}`},
      signal:AbortSignal.timeout(8000)
    })
    const subscription = await providerResponse.json().catch(() => ({}))
    const status = String(subscription.status || "").toUpperCase()
    const planMatches = providerResponse.ok
      && subscription.plan_id === row.provider_plan_id
      && token.settings.plans[row.tier_id] === row.provider_plan_id
    if(!planMatches) return {ok:false, access:"provider-error", reason:"paypal-entitlement-plan-mismatch"}
    const refreshed = await writePaypalEntitlement({
      userId:user.id,
      subscriptionId:row.provider_subscription_id,
      tierId:row.tier_id,
      planId:row.provider_plan_id,
      status,
      subscription
    })
    if(!refreshed.recorded) return {ok:false, access:"provider-error", reason:refreshed.reason}
    row = refreshed.row
    return {ok:true, readModel:subscriptionReadModel(user.id, row)}
  } catch { return {ok:false, access:"provider-error", reason:"entitlement-read-request-failed"} }
}

export default async function handler(req, res){
  if(req.query?.scope === "ai"){
    res.setHeader("Cache-Control", "no-store")
    const result = await handleAiLayer(req)
    return res.status(result.status).json(result.body)
  }
  if(req.query?.scope === "paypal"){
    res.setHeader("Cache-Control", "no-store")
    if(req.method === "GET") return res.status(200).json(publicPaypalStatus())
    if(req.method !== "POST") return res.status(405).json({verified:false, reason:"method-not-allowed"})
    const rate = consumePaypalRate(req)
    if(!rate.allowed){
      res.setHeader("Retry-After", String(rate.retryAfterSeconds))
      return res.status(429).json({verified:false, reason:"paypal-verification-rate-limited", retryAfterSeconds:rate.retryAfterSeconds})
    }
    const payload = requestPayload(req)
    if(payload.action === "validate-plan") return res.status(200).json(await validatePaypalPlan(payload))
    if(payload.action === "create-binding"){
      const binding = await createPaypalSubscriptionBinding(req, payload)
      return res.status(binding.ready ? 200 : binding.reason === "sign-in-required" ? 401 : 503).json(binding)
    }
    if(payload.action === "verify-subscription") return res.status(200).json(await verifyPaypalSubscription(req, payload))
    return res.status(400).json({verified:false, reason:"unsupported-paypal-action"})
  }
  if(req.query?.scope === "entitlement"){
    res.setHeader("Cache-Control", "no-store")
    if(req.method !== "GET") return res.status(405).json({ok:false, reason:"method-not-allowed"})
    const status = await subscriptionEntitlementStatus(req)
    return res.status(status.ok ? 200 : status.access === "sign-in-required" ? 401 : 503).json(status)
  }
  if(req.query?.scope === "ga4"){
    res.setHeader("Cache-Control", "no-store")
    if(req.method !== "GET") return res.status(405).json({ok:false, error:"method-not-allowed"})
    return res.status(200).json(await googleAnalyticsStatus(req))
  }
  if(req.query?.scope === "openai-billing"){
    res.setHeader("Cache-Control", "no-store")
    return res.status(200).json(await openAiBillingStatus(req))
  }
  if(req.query?.scope === "google-search-console"){
    res.setHeader("Cache-Control", "no-store")
    return res.status(200).json(await googleSearchConsoleStatus(req))
  }

  const status = providers.map(([id, keys, role]) => {
    const configuredKeys = configured(keys)
    return {
      id,
      role,
      configured: configuredKeys.length > 0,
      configuredKeys
    }
  })
  res.setHeader("Cache-Control", "no-store")
  return res.status(200).json({status})
}
