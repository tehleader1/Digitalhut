function normalizeSymbol(value) {
  const raw = String(value || "BTC").trim().toUpperCase()
  if (["BTC", "ETH", "SOL", "DOGE"].includes(raw)) return `${raw}/USD`
  if (["BTCUSD", "ETHUSD", "SOLUSD", "DOGEUSD"].includes(raw)) return `${raw.slice(0, -3)}/USD`
  return raw.replace(/\s+/g, "")
}

function rootSymbol(symbol) {
  return String(symbol || "BTC").split("/")[0].toUpperCase()
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
  const key = rootSymbol(symbol)
  return fallbackProfiles[key] || { base: 120, volatility: 0.9, trend: 0.6, sweep: "none", gap: 0.001 }
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

function sma(values, period) {
  return values.map((_, index) => {
    const start = Math.max(0, index - period + 1)
    const slice = values.slice(start, index + 1)
    return slice.reduce((sum, value) => sum + value, 0) / slice.length
  })
}

function ema(values, period) {
  const k = 2 / (period + 1)
  const out = []
  values.forEach((value, index) => {
    out.push(index === 0 ? value : value * k + out[index - 1] * (1 - k))
  })
  return out
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
  const rangeHigh = Math.max(...highs, pdh)
  const rangeLow = Math.min(...lows, pdl)

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
    rangeHigh,
    rangeLow,
    overlays: {
      ema20: ema20.map(Number),
      ema50: ema50.map(Number),
      sma200: sma200.map(Number),
      pdh,
      pdl
    }
  }
}

function candleHeights(bars) {
  const closes = bars.map(bar => Number(bar.c)).filter(Number.isFinite)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const span = max - min || 1
  return closes.map(close => Math.max(8, Math.round(((close - min) / span) * 28) + 8))
}

function pickEnv(names) {
  const name = names.find(item => Boolean(process.env[item]))
  return { name: name || null, value: name ? process.env[name] : null }
}

function alpacaCredentials() {
  const key = pickEnv(["ALPACA_API_KEY", "ALPACA_KEY_ID", "APCA_API_KEY_ID", "NEXT_SERVER_ALPACA_API_KEY"])
  const secret = pickEnv(["ALPACA_SECRET_KEY", "ALPACA_API_SECRET", "ALPACA_SECRET", "APCA_API_SECRET_KEY", "NEXT_SERVER_ALPACA_SECRET_KEY"])
  return { key: key.value, secret: secret.value, keyEnv: key.name, secretEnv: secret.name, present: Boolean(key.value && secret.value) }
}

async function fetchAlpacaBars(symbol) {
  const credentials = alpacaCredentials()
  const baseDiagnostics = {
    credentialsPresent: credentials.present,
    alpacaKeyEnv: credentials.keyEnv,
    alpacaSecretEnv: credentials.secretEnv,
    requestStatus: null,
    feed: "fallback",
    mode: "fallback",
    reason: credentials.present ? "Alpaca credentials detected; live request has not confirmed candles yet" : "Render is not seeing Alpaca keys yet"
  }

  if (!credentials.present) return { bars: null, diagnostics: baseDiagnostics }

  const headers = { "APCA-API-KEY-ID": credentials.key, "APCA-API-SECRET-KEY": credentials.secret }

  try {
    if (symbol.includes("/")) {
      const url = new URL("https://data.alpaca.markets/v1beta3/crypto/us/bars")
      url.searchParams.set("symbols", symbol)
      url.searchParams.set("timeframe", "1Day")
      url.searchParams.set("limit", "24")
      const response = await fetch(url, { headers })
      const diagnostics = { ...baseDiagnostics, requestStatus: response.status, feed: "alpaca", endpoint: "crypto-bars" }
      if (!response.ok) return { bars: null, diagnostics: { ...diagnostics, reason: `Alpaca crypto request returned ${response.status}` } }
      const data = await response.json()
      const bars = data.bars?.[symbol] || []
      return { bars, diagnostics: { ...diagnostics, mode: bars.length ? "live" : "fallback", reason: bars.length ? "Live Alpaca crypto candles confirmed" : "Alpaca returned no crypto bars" } }
    }

    const url = new URL(`https://data.alpaca.markets/v2/stocks/${symbol}/bars`)
    url.searchParams.set("timeframe", "1Day")
    url.searchParams.set("limit", "24")
    url.searchParams.set("feed", "iex")
    const response = await fetch(url, { headers })
    const diagnostics = { ...baseDiagnostics, requestStatus: response.status, feed: "alpaca", endpoint: "stock-bars-iex" }
    if (!response.ok) return { bars: null, diagnostics: { ...diagnostics, reason: `Alpaca stock request returned ${response.status}` } }
    const data = await response.json()
    const bars = data.bars || []
    return { bars, diagnostics: { ...diagnostics, mode: bars.length ? "live" : "fallback", reason: bars.length ? "Live Alpaca stock candles confirmed" : "Alpaca returned no stock bars" } }
  } catch (error) {
    return { bars: null, diagnostics: { ...baseDiagnostics, reason: error?.message || "Alpaca request failed" } }
  }
}

async function marketResponse(query) {
  const symbol = normalizeSymbol(query)
  const market = await fetchAlpacaBars(symbol)
  const live = Boolean(market.bars?.length)
  const bars = live ? market.bars : fallbackBars(symbol)
  const candles = candleHeights(bars)
  const last = bars.at(-1)
  const price = last?.c ? Number(last.c).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "Live provider pending"
  const technicals = buildTechnicals(symbol, bars, live)
  const diagnostics = live
    ? { ...market.diagnostics, credentialsPresent: true, feed: "alpaca", mode: "live" }
    : { ...market.diagnostics, feed: market.diagnostics.feed === "alpaca" ? "alpaca" : "fallback", mode: "fallback" }
  const setupHint = live
    ? "Live Alpaca candles confirmed."
    : `${diagnostics.reason}. Showing premium fallback technicals until live candles confirm.`

  return {
    symbol,
    price,
    provider: live ? "alpaca-live" : "premium-fallback",
    diagnostics,
    ai: live
      ? `Live Alpaca market scan for ${symbol}: last close ${price}. ${technicals.summary}`
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
