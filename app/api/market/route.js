function normalizeSymbol(value) {
  const raw = String(value || "BTC").trim().toUpperCase()
  if (["BTC", "ETH", "SOL", "DOGE"].includes(raw)) return `${raw}/USD`
  if (["BTCUSD", "ETHUSD", "SOLUSD", "DOGEUSD"].includes(raw)) return `${raw.slice(0, -3)}/USD`
  return raw.replace(/\s+/g, "")
}

function fallbackCandles() {
  return [12, 15, 13, 18, 17, 22, 20, 26, 24, 29]
}

function candleHeights(bars) {
  const closes = bars.map(bar => Number(bar.c)).filter(Number.isFinite)
  if (!closes.length) return fallbackCandles()
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const span = max - min || 1
  return closes.map(close => Math.max(8, Math.round(((close - min) / span) * 28) + 8))
}

function alpacaCredentials() {
  const key = process.env.ALPACA_API_KEY ||
    process.env.ALPACA_KEY_ID ||
    process.env.APCA_API_KEY_ID ||
    process.env.NEXT_SERVER_ALPACA_API_KEY
  const secret = process.env.ALPACA_SECRET_KEY ||
    process.env.ALPACA_API_SECRET ||
    process.env.ALPACA_SECRET ||
    process.env.APCA_API_SECRET_KEY ||
    process.env.NEXT_SERVER_ALPACA_SECRET_KEY
  return { key, secret, present: Boolean(key && secret) }
}

async function fetchAlpacaBars(symbol) {
  const credentials = alpacaCredentials()
  if (!credentials.present) return { bars: null, credentialsPresent: false, status: null }

  const headers = {
    "APCA-API-KEY-ID": credentials.key,
    "APCA-API-SECRET-KEY": credentials.secret
  }

  if (symbol.includes("/")) {
    const url = new URL("https://data.alpaca.markets/v1beta3/crypto/us/bars")
    url.searchParams.set("symbols", symbol)
    url.searchParams.set("timeframe", "1Day")
    url.searchParams.set("limit", "10")
    const response = await fetch(url, { headers })
    if (!response.ok) return { bars: null, credentialsPresent: true, status: response.status }
    const data = await response.json()
    return { bars: data.bars?.[symbol] || [], credentialsPresent: true, status: response.status }
  }

  const url = new URL(`https://data.alpaca.markets/v2/stocks/${symbol}/bars`)
  url.searchParams.set("timeframe", "1Day")
  url.searchParams.set("limit", "10")
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
  const candles = live ? candleHeights(market.bars) : fallbackCandles()
  const last = live ? market.bars.at(-1) : null
  const price = last?.c ? Number(last.c).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "Live provider pending"
  const setupHint = market.credentialsPresent
    ? `Alpaca keys are present, but the live request returned status ${market.status}. Check the key, secret, plan permissions, and whether the symbol is supported.`
    : "Add ALPACA_API_KEY and ALPACA_SECRET_KEY to Render, then redeploy, to enable live candles."

  return Response.json({
    symbol,
    price,
    provider: live ? "alpaca-live" : "fallback",
    ai: live
      ? `Live Alpaca market scan for ${symbol}: last close ${price}. Review trend direction, volatility, liquidity, candle structure, and risk before action.`
      : `Market Intelligence scan for ${symbol}: ${setupHint} Review trend direction, volatility, liquidity, candle structure, and risk before action.`,
    candles
  })
}
