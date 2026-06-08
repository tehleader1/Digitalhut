const SKETCHFAB_SEARCH = "https://api.sketchfab.com/v3/search"
const CESIUM_ASSETS = "https://api.cesium.com/v1/assets"

const MARKET_SYMBOLS = [
  "BTC", "ETH", "SPY", "QQQ", "DIA", "AAPL", "MSFT", "NVDA", "TSLA", "META", "GOOGL", "AMZN", "AMD", "PLTR", "COIN"
]

const CATEGORY_SYMBOL = {
  Continent: "SPY",
  Planetary: "NVDA",
  Gamer: "NVDA",
  "Real Estate": "SPY",
  Workforce: "DIA",
  "Home Project": "HD",
  Political: "SPY",
  Programmer: "NVDA",
  Researcher: "QQQ"
}

export function providerHealth(){
  return {
    sketchfab: Boolean(process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN),
    cesium: Boolean(process.env.CESIUM_ION_TOKEN),
    fmp: Boolean(process.env.FMP_API_KEY),
    polygon: Boolean(process.env.POLYGON_API_KEY),
    alphaVantage: Boolean(process.env.ALPHA_VANTAGE_API_KEY),
    alpaca: Boolean(process.env.ALPACA_API_KEY && process.env.ALPACA_SECRET_KEY)
  }
}

function getQuery(req){
  return String(req.query?.query || req.query?.q || req.query?.category || "observatory 3d model").trim()
}

function getCategory(req){
  return String(req.query?.category || "Continent").trim()
}

function cleanUrl(value){
  if(!value || typeof value !== "string") return ""
  if(value.startsWith("//")) return `https:${value}`
  return value
}

async function fetchJson(url, options = {}){
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeout || 6500)
  try{
    const response = await fetch(url, {...options, signal: controller.signal})
    const payload = await response.json().catch(() => ({}))
    return {ok: response.ok, status: response.status, payload}
  } catch(error){
    return {ok: false, status: 0, payload: {error: error?.message || "request failed"}}
  } finally {
    clearTimeout(timer)
  }
}

function firstThumbnail(model){
  const images = model?.thumbnails?.images || model?.thumbnail?.images || []
  if(!Array.isArray(images) || images.length === 0) return ""
  const best = [...images].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
  return cleanUrl(best?.url || best?.src)
}

function symbolFromQuery(query, category){
  const upper = `${query} ${category}`.toUpperCase()
  const found = MARKET_SYMBOLS.find((symbol) => upper.includes(symbol))
  if(found) return found
  if(upper.includes("BITCOIN")) return "BTC"
  if(upper.includes("ETHEREUM")) return "ETH"
  if(upper.includes("APPLE")) return "AAPL"
  if(upper.includes("NVIDIA")) return "NVDA"
  if(upper.includes("TESLA")) return "TSLA"
  if(upper.includes("WALL STREET") || upper.includes("MARKET") || upper.includes("STOCK")) return "SPY"
  return CATEGORY_SYMBOL[category] || "SPY"
}

function polygonSymbol(symbol){
  if(symbol === "BTC") return "X:BTCUSD"
  if(symbol === "ETH") return "X:ETHUSD"
  return symbol
}

function summarizeQuote({symbol, fmp, alpha, polygon}){
  const quote = fmp?.quote || {}
  const globalQuote = alpha?.["Global Quote"] || {}
  const polygonBar = polygon?.results?.[0] || {}
  const price = quote.price || Number(globalQuote["05. price"]) || polygonBar.c || null
  const change = quote.change || Number(globalQuote["09. change"]) || null
  const changePercent = quote.changesPercentage || globalQuote["10. change percent"] || null
  if(!price) return `${symbol} market layer attached.`
  return `${symbol} market layer: ${Number(price).toFixed(2)}${change ? `, change ${Number(change).toFixed(2)}` : ""}${changePercent ? `, ${String(changePercent).replace(/[()]/g, "")}` : ""}.`
}

async function getMarketContext(query, category){
  const symbol = symbolFromQuery(query, category)
  const context = {symbol, providers: [], summary: `${symbol} market layer ready.`}

  const [fmpQuote, fmpProfile, alphaQuote, polygonPrev] = await Promise.all([
    process.env.FMP_API_KEY ? fetchJson(`https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${process.env.FMP_API_KEY}`) : null,
    process.env.FMP_API_KEY ? fetchJson(`https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(symbol)}?apikey=${process.env.FMP_API_KEY}`) : null,
    process.env.ALPHA_VANTAGE_API_KEY ? fetchJson(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`) : null,
    process.env.POLYGON_API_KEY ? fetchJson(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(polygonSymbol(symbol))}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`) : null
  ])

  if(fmpQuote?.ok){
    context.providers.push("fmp")
    context.quote = Array.isArray(fmpQuote.payload) ? fmpQuote.payload[0] : fmpQuote.payload
  }
  if(fmpProfile?.ok){
    context.profile = Array.isArray(fmpProfile.payload) ? fmpProfile.payload[0] : fmpProfile.payload
  }
  if(alphaQuote?.ok){
    context.providers.push("alpha-vantage")
    context.alpha = alphaQuote.payload
  }
  if(polygonPrev?.ok){
    context.providers.push("polygon")
    context.polygon = polygonPrev.payload
  }

  context.summary = summarizeQuote({symbol, fmp: {quote: context.quote}, alpha: context.alpha, polygon: context.polygon})
  return context
}

async function getCesiumContext(query){
  if(!process.env.CESIUM_ION_TOKEN) return {providers: [], assets: [], summary: "Cesium ion layer not configured."}
  const url = new URL(CESIUM_ASSETS)
  url.searchParams.set("limit", "8")
  url.searchParams.set("search", query)
  const response = await fetchJson(url, {headers: {Authorization: `Bearer ${process.env.CESIUM_ION_TOKEN}`, Accept: "application/json"}})
  if(!response.ok) return {providers: ["cesium"], assets: [], summary: "Cesium ion layer available; asset search returned no public match."}
  const raw = Array.isArray(response.payload?.items) ? response.payload.items : Array.isArray(response.payload) ? response.payload : []
  const assets = raw.slice(0, 8).map((asset) => ({
    id: asset.id,
    title: asset.name || `Cesium asset ${asset.id}`,
    type: asset.type || asset.assetType || "ion-asset",
    description: asset.description || "Cesium ion geospatial asset."
  }))
  return {providers: ["cesium"], assets, summary: assets.length ? `Cesium ion layer found ${assets.length} geospatial assets.` : "Cesium ion layer connected."}
}

async function getSketchfabModels(query){
  const url = new URL(SKETCHFAB_SEARCH)
  url.searchParams.set("type", "models")
  url.searchParams.set("q", query)
  url.searchParams.set("downloadable", "false")
  url.searchParams.set("sort_by", "-likeCount")

  const headers = {Accept: "application/json"}
  const token = process.env.SKETCHFAB_ACCESS_TOKEN || process.env.SKETCHFAB_API_TOKEN
  if(token) headers.Authorization = `Bearer ${token}`

  const response = await fetchJson(url, {headers})
  if(!response.ok) return {providers: ["sketchfab"], models: [], status: response.status}
  const models = Array.isArray(response.payload?.results) ? response.payload.results : []
  return {providers: ["sketchfab"], models, status: response.status}
}

function normalizeSketchfabModel(model, index, query, category, context){
  const uid = model?.uid || ""
  const title = model?.name || `Sketchfab result ${index + 1}`
  const thumbnail = firstThumbnail(model)
  const marketLine = context.market?.summary || "Market layer attached."
  const cesiumLine = context.cesium?.summary || "Cesium layer attached."
  const providerMix = ["sketchfab", ...(context.market?.providers || []), ...(context.cesium?.providers || [])]
  return {
    uid,
    id: uid || `${query}-${index}`,
    title,
    name: title,
    note: [model?.description || `Live 3D API result for ${query}.`, marketLine, cesiumLine].filter(Boolean).join(" "),
    description: model?.description || "",
    query,
    category,
    providerMix: [...new Set(providerMix)],
    apiSource: "observatory-multi",
    apiStatus: "connected",
    viewerUrl: cleanUrl(model?.viewerUrl || (uid ? `https://sketchfab.com/3d-models/${uid}` : "")),
    embedUrl: cleanUrl(model?.embedUrl || (uid ? `https://sketchfab.com/models/${uid}/embed?autostart=1&ui_theme=dark&ui_infos=0&ui_controls=1&ui_watermark=0` : "")),
    thumbnail,
    thumbnailUrl: thumbnail,
    market: context.market,
    cesium: context.cesium,
    stats: {
      likes: model?.likeCount || 0,
      views: model?.viewCount || 0,
      comments: model?.commentCount || 0
    }
  }
}

function dataOnlyFeed(query, category, context){
  const providers = [...new Set([...(context.market?.providers || []), ...(context.cesium?.providers || [])])]
  return {
    id: `data:${category}:${query}`,
    title: `${category} data observatory`,
    name: `${category} data observatory`,
    note: [context.market?.summary, context.cesium?.summary, "Visual renderer is ready for the next 3D source."].filter(Boolean).join(" "),
    query,
    category,
    providerMix: providers,
    apiSource: "observatory-multi",
    apiStatus: providers.length ? "data-connected" : "preview",
    market: context.market,
    cesium: context.cesium
  }
}

export async function buildObservatoryPayload(req, options = {}){
  const query = getQuery(req)
  const category = getCategory(req)
  const [market, cesium, sketchfab] = await Promise.all([
    getMarketContext(query, category),
    getCesiumContext(query),
    options.skipSketchfab ? Promise.resolve({providers: [], models: []}) : getSketchfabModels(query)
  ])
  const context = {market, cesium}
  const visual = sketchfab.models.slice(0, 8).map((model, index) => normalizeSketchfabModel(model, index, query, category, context))
  const assets = visual.length ? visual : [dataOnlyFeed(query, category, context)]
  const providers = [...new Set([...(sketchfab.providers || []), ...(market.providers || []), ...(cesium.providers || [])])]

  return {
    ok: true,
    provider: "observatory-multi",
    query,
    category,
    providers,
    detected: providerHealth(),
    context,
    results: assets,
    assets,
    diagnostics: {
      visualCount: visual.length,
      cesiumAssets: cesium.assets?.length || 0,
      marketSymbol: market.symbol,
      sketchfabStatus: sketchfab.status || null
    }
  }
}

export async function sendObservatoryPayload(req, res, options = {}){
  try{
    const payload = await buildObservatoryPayload(req, options)
    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=900")
    res.status(200).json(payload)
  } catch(error){
    res.status(500).json({ok: false, provider: "observatory-multi", error: error?.message || "Observatory provider failure"})
  }
}
