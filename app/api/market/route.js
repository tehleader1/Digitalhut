function normalizeSymbol(value) {
  const raw = String(value || "BTC").trim().toUpperCase()
  if (["BTC", "ETH", "SOL", "DOGE"].includes(raw)) return `${raw}/USD`
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

async function fetchAlpacaBars(symbol) {
  const key = process.env.ALPACA_API_KEY
  const secret = process.env.ALPACA_SECRET_KEY
  if (!key || !secret) return null

  const headers = {
    "APCA-API-KEY-ID": key,
    "APCA-API-SECRET-KEY": secret
  }

  if (symbol.includes("/")) {
    const url = new URL("https://data.alpaca.markets/v1beta3/crypto/us/bars")
    url.searchParams.set("symbols", symbol)
    url.searchParams.set("timeframe", "1Day")
    url.searchParams.set("limit", "10")
    const response = await fetch(url, { headers })
    if (!response.ok) return null
    const data = await response.json()
    return data.bars?.[symbol] || []
  }

  const url = new URL(`https://data.alpaca.markets/v2/stocks/${symbol}/bars`)
  url.searchParams.set("timeframe", "1Day")
  url.searchParams.set("limit", "10")
  url.searchParams.set("feed", "iex")
  const response = await fetch(url, { headers })
  if (!response.ok) return null
  const data = await response.json()
  return data.bars || []
}

export async function POST(req) {
  const { query = "BTC" } = await req.json()
  const symbol = normalizeSymbol(query)
  const bars = await fetchAlpacaBars(symbol)
  const live = Boolean(bars?.length)
  const candles = live ? candleHeights(bars) : fallbackCandles()
  const last = live ? bars.at(-1) : null
  const price = last?.c ? Number(last.c).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "Live provider pending"

  return Response.json({
    symbol,
    price,
    provider: live ? "alpaca-live" : "fallback",
    ai: live
      ? `Live Alpaca market scan for ${symbol}: last close ${price}. Review trend direction, volatility, liquidity, candle structure, and risk before action.`
      : `Market Intelligence scan for ${symbol}: add ALPACA_API_KEY and ALPACA_SECRET_KEY to enable live candles. Review trend direction, volatility, liquidity, candle structure, and risk before action.`,
    candles
  })
}
