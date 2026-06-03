function normalizeSymbol(value) {
  const raw = String(value || "BTC").trim().toUpperCase()
  if (["BTC", "ETH", "SOL", "DOGE"].includes(raw)) return raw
  if (["BTCUSD", "ETHUSD", "SOLUSD", "DOGEUSD"].includes(raw)) return raw.slice(0, -3)
  return raw.replace(/\s+/g, "")
}

const fallbackProfiles = {
  BTC: { base: 101800, volatility: 1.8, trend: 1.2, sweep: "high", gap: 0.001 },
  ETH: { base: 3820, volatility: 1.5, trend: 1.1, sweep: "low", gap: -0.0015 },
  SOL: { base: 188, volatility: 1.6, trend: 0.8, sweep: "none", gap: 0.002 },
  DOGE: { base: 0.18, volatility: 1.9, trend: 0.4, sweep: "high", gap: 0.003 },
  TSLA: { base: 182, volatility: 1.4, trend: 0.9, sweep: "high", gap: 0.004 },
  NVDA: { base: 118, volatility: 1.3, trend: 1.4, sweep: "none", gap: 0.002 },
  AAPL: { base: 191, volatility: 0.8, trend: 0.7, sweep: "low", gap: -0.001 },
  SPY: { base: 589, volatility: 0.4, trend: 0.5, sweep: "none", gap: 0.0005 }
}

function profileFor(symbol) {
  return fallbackProfiles[symbol] || { base: 120, volatility: 0.9, trend: 0.6, sweep: "none", gap: 0.001 }
}

function fallbackBars(symbol) {
  const profile = profileFor(symbol)
  const bars = []
  let previousClose = profile.base * (1 - profile.trend * 0.012)

  for (let i = 0; i < 24; i++) {
    const progress = i / 23
    const wave = Math.sin(i * 0.95) * profile.base * 0.0035 * profile.volatility
    const slope = profile.base * 0.0018 * profile.trend * i
    const gap = i === 23 ? profile.base * profile.gap : Math.sin(i * 0.45) * profile.base * 0.0008 * profile.volatility
    const open = previousClose + gap
    const directional = profile.base * 0.0012 * profile.trend + wave * 0.42
    let close = open + directional
    let high = Math.max(open, close) + profile.base * 0.0028 * profile.volatility * (1 + (i % 4) * 0.14)
    let low = Math.min(open, close) - profile.base * 0.0025 * profile.volatility * (1 + (i % 3) * 0.16)

    if (i === 23 && bars.length) {
      const previous = bars.at(-1)
      if (profile.sweep === "high") {
        high = previous.h + profile.base * 0.003 * profile.volatility
        close = previous.h - profile.base * 0.0014 * profile.volatility
      }
      if (profile.sweep === "low") {
        low = previous.l - profile.base * 0.003 * profile.volatility
        close = previous.l + profile.base * 0.0016 * profile.volatility
      }
    }

    const bar = {
      t: new Date(Date.now() - (24 - i) * 86400000).toISOString(),
      o: Number(open.toFixed(4)),
      h: Number(high.toFixed(4)),
      l: Number(low.toFixed(4)),
      c: Number(close.toFixed(4)),
      v: Math.round(1000 * profile.volatility + i * 87 + progress * 1200)
    }
    bars.push(bar)
    previousClose = close
  }

  return bars
}

function ema(values, period) {
  const k = 2 / (period + 1)
  const out = []
  values.forEach((value, index) => out.push(index === 0 ? value : value * k + out[index - 1] * (1 - k)))
  return out
}

function sma(values, period) {
  return values.map((_, index) => {
    const start = Math.max(0, index - period + 1)
    const slice = values.slice(start, index + 1)
    return slice.reduce((sum, value) => sum + value, 0) / slice.length
  })
}

function round(value) {
  return Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })
}

function buildTechnicals(symbol, bars, live) {
  const closes = bars.map(bar => Number(bar.c))
  const highs = bars.map(bar => Number(bar.h))
  const lows = bars.map(bar => Number(bar.l))
  const ema20 = ema(closes, 20)
  const ema50 = ema(closes, 50)
  const sma200 = sma(closes, 200)
  const last = bars.at(-1)
  const previous = bars.at(-2) || last
  const pdh = previous.h
  const pdl = previous.l
  const trend = last.c >= ema20.at(-1) && ema20.at(-1) >= ema50.at(-1) ? "Bullish" : last.c < ema20.at(-1) ? "Bearish" : "Neutral"
  const momentumBase = closes.at(-6) || previous.c || last.c
  const momentum = Math.max(-1, Math.min(1, (last.c - momentumBase) / Math.max(1, Math.abs(momentumBase))))
  const bullishScore = Math.max(1, Math.min(99, Math.round(58 + momentum * 120 + (last.c > pdh ? 10 : 0) + (trend === "Bullish" ? 12 : 0))))
  const bearishScore = 100 - bullishScore
  const gap = bars.length > 1 ? last.o - previous.c : 0
  const gapStatus = Math.abs(gap) < Math.max(1, Math.abs(previous.c) * 0.002) ? "No material gap" : gap > 0 ? "Gap up" : "Gap down"
  const sweptHigh = last.h > pdh && last.c < pdh
  const sweptLow = last.l < pdl && last.c > pdl
  const liquiditySweep = sweptHigh ? "High sweep rejected" : sweptLow ? "Low sweep reclaimed" : "No sweep confirmed"

  return {
    symbol,
    live,
    trend,
    bullishScore,
    bearishScore,
    ema20: round(ema20.at(-1)),
    ema50: round(ema50.at(-1)),
    sma200: round(sma200.at(-1)),
    pdh: round(pdh),
    pdl: round(pdl),
    gapStatus,
    liquiditySweep,
    summary: `${trend} structure. Bullish ${bullishScore}, bearish ${bearishScore}. ${gapStatus}. ${liquiditySweep}.`,
    rangeHigh: Math.max(...highs, pdh),
    rangeLow: Math.min(...lows, pdl),
    overlays: { ema20: ema20.map(Number), ema50: ema50.map(Number), sma200: sma200.map(Number), pdh, pdl }
  }
}

function candleHeights(bars) {
  const closes = bars.map(bar => Number(bar.c)).filter(Number.isFinite)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const span = max - min || 1
  return closes.map(close => Math.max(8, Math.round(((close - min) / span) * 28) + 8))
}

function dateOffset(days) {
  const date = new Date(Date.now() - days * 86400000)
  return date.toISOString().slice(0, 10)
}

function cryptoPair(symbol) {
  return ["BTC", "ETH", "SOL", "DOGE"].includes(symbol) ? `X:${symbol}USD` : symbol
}

async function fetchPolygonBars(symbol) {
  const key = process.env.POLYGON_API_KEY
  const diagnostics = { feed: "polygon", credentialsPresent: Boolean(key), requestStatus: null, mode: "fallback", reason: key ? "Polygon key detected" : "POLYGON_API_KEY missing" }
  if (!key) return { bars: null, diagnostics }

  try {
    const ticker = cryptoPair(symbol)
    const url = new URL(`https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dateOffset(35)}/${dateOffset(1)}`)
    url.searchParams.set("adjusted", "true")
    url.searchParams.set("sort", "asc")
    url.searchParams.set("limit", "24")
    url.searchParams.set("apiKey", key)
    const response = await fetch(url)
    const data = await response.json()
    const bars = Array.isArray(data.results) ? data.results.slice(-24).map((bar) => ({
      t: new Date(bar.t).toISOString(),
      o: Number(bar.o),
      h: Number(bar.h),
      l: Number(bar.l),
      c: Number(bar.c),
      v: Number(bar.v || 0)
    })) : []
    return { bars: bars.length ? bars : null, diagnostics: { ...diagnostics, requestStatus: response.status, mode: bars.length ? "live" : "fallback", reason: bars.length ? "Polygon aggregates confirmed" : data.error || data.message || "Polygon returned no bars" } }
  } catch (error) {
    return { bars: null, diagnostics: { ...diagnostics, reason: error?.message || "Polygon request failed" } }
  }
}

async function fetchFmpBars(symbol) {
  const key = process.env.FMP_API_KEY
  const diagnostics = { feed: "fmp", credentialsPresent: Boolean(key), requestStatus: null, mode: "fallback", reason: key ? "FMP key detected" : "FMP_API_KEY missing" }
  if (!key || ["BTC", "ETH", "SOL", "DOGE"].includes(symbol)) return { bars: null, diagnostics: { ...diagnostics, reason: key ? "FMP skipped for crypto symbol" : diagnostics.reason } }

  try {
    const url = new URL(`https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}`)
    url.searchParams.set("timeseries", "24")
    url.searchParams.set("apikey", key)
    const response = await fetch(url)
    const data = await response.json()
    const bars = Array.isArray(data.historical) ? data.historical.slice(0, 24).reverse().map((bar) => ({
      t: new Date(bar.date).toISOString(),
      o: Number(bar.open),
      h: Number(bar.high),
      l: Number(bar.low),
      c: Number(bar.close),
      v: Number(bar.volume || 0)
    })) : []
    return { bars: bars.length ? bars : null, diagnostics: { ...diagnostics, requestStatus: response.status, mode: bars.length ? "live" : "fallback", reason: bars.length ? "FMP historical prices confirmed" : data["Error Message"] || "FMP returned no bars" } }
  } catch (error) {
    return { bars: null, diagnostics: { ...diagnostics, reason: error?.message || "FMP request failed" } }
  }
}

async function fetchAlphaVantageBars(symbol) {
  const key = process.env.ALPHA_VANTAGE_API_KEY
  const diagnostics = { feed: "alpha-vantage", credentialsPresent: Boolean(key), requestStatus: null, mode: "fallback", reason: key ? "Alpha Vantage key detected" : "ALPHA_VANTAGE_API_KEY missing" }
  if (!key) return { bars: null, diagnostics }

  try {
    const url = new URL("https://www.alphavantage.co/query")
    if (["BTC", "ETH", "SOL", "DOGE"].includes(symbol)) {
      url.searchParams.set("function", "DIGITAL_CURRENCY_DAILY")
      url.searchParams.set("symbol", symbol)
      url.searchParams.set("market", "USD")
    } else {
      url.searchParams.set("function", "TIME_SERIES_DAILY_ADJUSTED")
      url.searchParams.set("symbol", symbol)
      url.searchParams.set("outputsize", "compact")
    }
    url.searchParams.set("apikey", key)
    const response = await fetch(url)
    const data = await response.json()
    const series = data["Time Series (Digital Currency Daily)"] || data["Time Series (Daily)"] || {}
    const bars = Object.entries(series).slice(0, 24).reverse().map(([date, bar]) => ({
      t: new Date(date).toISOString(),
      o: Number(bar["1. open"]),
      h: Number(bar["2. high"]),
      l: Number(bar["3. low"]),
      c: Number(bar["4. close"]),
      v: Number(bar["5. volume"] || bar["5. adjusted close"] || 0)
    })).filter((bar) => Number.isFinite(bar.c))
    return { bars: bars.length ? bars : null, diagnostics: { ...diagnostics, requestStatus: response.status, mode: bars.length ? "live" : "fallback", reason: bars.length ? "Alpha Vantage time series confirmed" : data.Note || data.Information || data["Error Message"] || "Alpha Vantage returned no bars" } }
  } catch (error) {
    return { bars: null, diagnostics: { ...diagnostics, reason: error?.message || "Alpha Vantage request failed" } }
  }
}

async function fetchProviderBars(symbol) {
  const attempts = []
  for (const fetcher of [fetchPolygonBars, fetchFmpBars, fetchAlphaVantageBars]) {
    const result = await fetcher(symbol)
    attempts.push(result.diagnostics)
    if (result.bars?.length) return { bars: result.bars, diagnostics: result.diagnostics, attempts }
  }
  return { bars: null, diagnostics: { feed: "fallback", mode: "fallback", reason: "Polygon, FMP, and Alpha Vantage did not return live bars" }, attempts }
}

async function marketResponse(query) {
  const symbol = normalizeSymbol(query)
  const market = await fetchProviderBars(symbol)
  const live = Boolean(market.bars?.length)
  const bars = live ? market.bars : fallbackBars(symbol)
  const candles = candleHeights(bars)
  const last = bars.at(-1)
  const price = last?.c ? Number(last.c).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "Live provider pending"
  const technicals = buildTechnicals(symbol, bars, live)
  const diagnostics = live ? { ...market.diagnostics, attempts: market.attempts } : { ...market.diagnostics, attempts: market.attempts }
  const setupHint = live ? `${diagnostics.feed} live market data confirmed.` : `${diagnostics.reason}. Showing curated fallback technicals until a selected API confirms.`

  return {
    symbol,
    price,
    provider: live ? `${diagnostics.feed}-live` : "selected-api-fallback",
    diagnostics,
    ai: live
      ? `Live ${diagnostics.feed} market scan for ${symbol}: last close ${price}. ${technicals.summary}`
      : `Market Intelligence scan for ${symbol}: ${setupHint} ${technicals.summary}`,
    candles,
    bars,
    technicals
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  return Response.json(await marketResponse(searchParams.get("symbol") || searchParams.get("query") || "BTC"))
}

export async function POST(req) {
  const { query = "BTC" } = await req.json()
  return Response.json(await marketResponse(query))
}
