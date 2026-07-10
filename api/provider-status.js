import crypto from "node:crypto"

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
  ["firecuda-storage", ["SUPABASE_FIRECUDA_ASSET_BASE", "VITE_SUPABASE_FIRECUDA_ASSET_BASE", "SUPABASE_FIRECUDA_AVAILABLE_FILES"], "verified-glb-storage"]
]

function envValue(key){
  return String(process.env[key] || "").replace(/^['"]|['"]$/g, "").trim()
}

function configured(keys){
  return keys.filter((key) => Boolean(envValue(key)))
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

export default async function handler(req, res){
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
