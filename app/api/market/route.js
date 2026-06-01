function normalizeSymbol(value) {
  const raw = String(value || "BTC").trim().toUpperCase()
  if (["BTC", "ETH", "SOL", "DOGE"].includes(raw)) return `${raw}/USD`
  if (["BTCUSD", "ETHUSD", "SOLUSD", "DOGEUSD"].includes(raw)) return `${raw.slice(0, -3)}/USD`
  return raw.replace(/\s+/g, "")
}

function fallbackBars(symbol) {
  const base = symbol.includes("BTC") ? 101800 : symbol.includes("ETH") ? 3820 : 188
  const offsets = [-320, -110, 260, 90, 430, 610, 520, 790, 680, 930, 1040, 880, 1180, 1410, 1320, 1540, 1710, 1630, 1880, 2110, 1960, 2320, 2510, 2740]
  return offsets.map((offset, i) => {
    const open = base + offset
    const close = open + (i % 3 === 0 ? -180 : 220) + (i % 5) * 24
    const high = Math.max(open, close) + 210 + (i % 4) * 32
    const low = Math.min(open, close) - 190 - (i % 3) * 28
    return { t: new Date(Date.now() - (offsets.length - i) * 86400000).toISOString(), o: open, h: high, l: low, c: close, v: 1000 + i * 85 }
  })
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
  const momentum = Math.max(-1, Math.min(1, (last.c - closes.at(-6)) / Math.max(1, closes.at(-6))))
  const bullishScore = Math.max(1, Math.min(99, Math.round(58 + momentum * 120 + (last.c > pdh ? 10 : 0) + (trend === "Bullish" ? 12 : 0))))
  const bearishScore = 100 - bullishScore
  const gap = bars.length > 1 ? last.o - previous.c : 0
  const gapStatus = Math.abs(gap) < Math.max(1, previous.c * 0.002) ? "No material gap" : gap > 0 ? "Gap up" : "Gap down"
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

function alpacaCredentials() {
  const key = process.env.ALPACA_API_KEY || process.env.ALPACA_KEY_ID || process.env.APCA_API_KEY_ID || process.env.NEXT_SERVER_ALPACA_API_KEY
  const secret = process.env.ALPACA_SECRET_KEY || process.env.ALPACA_API_SECRET || process.env.ALPACA_SECRET || process.env.APCA_API_SECRET_KEY || process.env.NEXT_SERVER_ALPACA_SECRET_KEY
  return { key, secret, present: Boolean(key && secret) }
}

async function fetchAlpacaBars(symbol) {
  const credentials = alpacaCredentials()
  if (!credentials.present) return { bars: null, credentialsPresent: false, status: null }

  const headers = { "APCA-API-KEY-ID": credentials.key, "APCA-API-SECRET-KEY": credentials.secret }

  if (symbol.includes("/")) {
    const url = new URL("https://data.alpaca.markets/v1beta3/crypto/us/bars")
    url.searchParams.set("symbols", symbol)
    url.searchParams.set("timeframe", "1Day")
    url.searchParams.set("limit", "24")
    const response = await fetch(url, { headers })
    if (!response.ok) return { bars: null, credentialsPresent: true, status: response.status }
    const data = await response.json()
    return { bars: data.bars?.[symbol] || [], credentialsPresent: true, status: response.status }
  }

  const url = new URL(`https://data.alpaca.markets/v2/stocks/${symbol}/bars`)
  url.searchParams.set("timeframe", "1Day")
  url.searchParams.set("limit", "24")
  url.searchParams.set("feed", "iex")
  const response = await fetch(url, { headers })
  if (!response.ok) return { bars: null, credentialsPresent: true, status: response.status }
  const data = await response.json()
  return { bars: data.bars || [], credentialsPresent: true, status: response.status }
}

export async function POST(req) {
  const { query = "BTC" } = await req.json()
  const symbol = normalizeSymbol(query)
  const market = await fetchAlpacaBars(symbol)
  const live = Boolean(market.bars?.length)
  const bars = live ? market.bars : fallbackBars(symbol)
  const candles = candleHeights(bars)
  const last = bars.at(-1)
  const price = last?.c ? Number(last.c).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "Live provider pending"
  const technicals = buildTechnicals(symbol, bars, live)
  const setupHint = market.credentialsPresent
    ? `Alpaca keys are present, but live request status is ${market.status}. Showing premium fallback technicals until provider candles confirm.`
    : "Render is not seeing Alpaca keys yet. Showing premium fallback technicals until live candles confirm."

  return Response.json({
    symbol,
    price,
    provider: live ? "alpaca-live" : "premium-fallback",
    ai: live
      ? `Live Alpaca market scan for ${symbol}: last close ${price}. ${technicals.summary}`
      : `Market Intelligence scan for ${symbol}: ${setupHint} ${technicals.summary}`,
    candles,
    bars,
    technicals
  })
}
