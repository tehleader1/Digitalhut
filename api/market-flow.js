const marketWindows = [
  {id: "12h", hours: 12},
  {id: "6h", hours: 6},
  {id: "3h", hours: 3},
  {id: "1h", hours: 1}
]

const knownTickerHints = new Set([
  "AAPL", "LOW", "F", "TSLA", "AMZN", "MSFT", "NVDA", "META", "GOOGL", "GOOG", "AMD", "NFLX", "SPY", "QQQ", "IWM", "DIA"
])

function cleanSymbol(value){
  const match = String(value || "").toUpperCase().match(/\b[A-Z]{1,5}\b/)
  return match ? match[0] : ""
}

function isoAgo(hours){
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function alpacaHeaders(){
  const key = process.env.ALPACA_API_KEY || process.env.VITE_ALPACA_API_KEY || ""
  const secret = process.env.ALPACA_SECRET_KEY || process.env.VITE_ALPACA_SECRET_KEY || ""
  return {
    "APCA-API-KEY-ID": key,
    "APCA-API-SECRET-KEY": secret,
    Accept: "application/json"
  }
}

function hasAlpaca(){
  return Boolean((process.env.ALPACA_API_KEY || process.env.VITE_ALPACA_API_KEY) && (process.env.ALPACA_SECRET_KEY || process.env.VITE_ALPACA_SECRET_KEY))
}

async function fetchTrades(symbol, hours){
  const params = new URLSearchParams({
    start: isoAgo(hours),
    end: new Date().toISOString(),
    limit: "10000",
    sort: "asc",
    feed: process.env.ALPACA_MARKET_DATA_FEED || "iex"
  })
  const response = await fetch(`https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/trades?${params}`, {
    headers: alpacaHeaders()
  })
  const text = await response.text()
  if(!response.ok) throw new Error(`Alpaca returned ${response.status}: ${text.slice(0, 180)}`)
  const payload = JSON.parse(text)
  return payload.trades || []
}

function classifyTrades(trades){
  let previousPrice = 0
  return trades.map((trade) => {
    const price = Number(trade.p || trade.price || 0)
    const size = Number(trade.s || trade.size || 0)
    const notional = price * size
    let side = "neutral"
    if(previousPrice && price > previousPrice) side = "buy-pressure"
    if(previousPrice && price < previousPrice) side = "sell-pressure"
    previousPrice = price || previousPrice
    return {
      time: trade.t,
      price,
      size,
      notional: Number(notional.toFixed(2)),
      exchange: trade.x || "",
      conditions: trade.c || [],
      tape: trade.z || "",
      side,
      confidence: side === "neutral" ? "low" : "inferred-from-tick-direction"
    }
  })
}

function summarizeWindow(symbol, id, trades){
  const classified = classifyTrades(trades)
  const largest = [...classified].sort((a, b) => b.notional - a.notional).slice(0, 10)
  const buyPrints = classified.filter((item) => item.side === "buy-pressure")
  const sellPrints = classified.filter((item) => item.side === "sell-pressure")
  const buyNotional = buyPrints.reduce((sum, item) => sum + item.notional, 0)
  const sellNotional = sellPrints.reduce((sum, item) => sum + item.notional, 0)
  const totalNotional = classified.reduce((sum, item) => sum + item.notional, 0)
  const totalVolume = classified.reduce((sum, item) => sum + item.size, 0)
  const biggestBuy = [...buyPrints].sort((a, b) => b.notional - a.notional).slice(0, 5)
  const biggestSell = [...sellPrints].sort((a, b) => b.notional - a.notional).slice(0, 5)
  const pressure = buyNotional > sellNotional * 1.08 ? "bullish-pressure" : sellNotional > buyNotional * 1.08 ? "bearish-pressure" : "mixed-pressure"
  return {
    id,
    symbol,
    tradeCount: classified.length,
    totalVolume,
    totalNotional: Number(totalNotional.toFixed(2)),
    buyPressureNotional: Number(buyNotional.toFixed(2)),
    sellPressureNotional: Number(sellNotional.toFixed(2)),
    pressure,
    largestPrints: largest,
    biggestInferredBuys: biggestBuy,
    biggestInferredSells: biggestSell
  }
}

export default async function handler(req, res){
  const symbol = cleanSymbol(req.query?.symbol || req.query?.ticker || req.query?.q)
  if(!symbol) return res.status(400).json({error: "Ticker symbol required", examples: [...knownTickerHints].slice(0, 8)})
  if(!hasAlpaca()){
    return res.status(200).json({
      symbol,
      configured: false,
      message: "ALPACA_API_KEY and ALPACA_SECRET_KEY are required for trade-flow windows.",
      windows: []
    })
  }

  const windows = []
  const errors = []
  for(const windowDef of marketWindows){
    try {
      const trades = await fetchTrades(symbol, windowDef.hours)
      windows.push(summarizeWindow(symbol, windowDef.id, trades))
    } catch (error) {
      errors.push({window: windowDef.id, error: error?.message || "Alpaca request failed"})
    }
  }

  const latest = windows[windows.length - 1] || windows[0]
  const summary = latest
    ? `${symbol} ${latest.id} window shows ${latest.pressure}, ${latest.tradeCount} trade prints, ${latest.totalVolume.toLocaleString()} shares, and about $${Math.round(latest.totalNotional).toLocaleString()} notional. Buy/sell side is inferred, not trader identity.`
    : `${symbol} did not return usable Alpaca trade windows.`

  res.setHeader("Cache-Control", "no-store")
  return res.status(200).json({
    symbol,
    configured: true,
    source: "Alpaca Market Data API",
    feed: process.env.ALPACA_MARKET_DATA_FEED || "iex",
    checkedAt: new Date().toISOString(),
    disclaimer: "Public market-data APIs do not identify individual traders. Buy/sell pressure is inferred from trade direction and should not be treated as exact order-flow attribution.",
    summary,
    windows,
    errors
  })
}
