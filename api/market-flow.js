const marketWindows = [
  {id: "1h", hours: 1},
  {id: "3h", hours: 3},
  {id: "6h", hours: 6},
  {id: "12h", hours: 12},
  {id: "since-thursday", since: "thursday"}
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

function recentThursdayStartIso(){
  const date = new Date()
  const day = date.getUTCDay()
  const daysSinceThursday = (day + 7 - 4) % 7
  date.setUTCDate(date.getUTCDate() - daysSinceThursday)
  date.setUTCHours(0, 0, 0, 0)
  return date.toISOString()
}

function windowStart(windowDef){
  if(windowDef?.since === "thursday") return recentThursdayStartIso()
  return isoAgo(windowDef.hours || 12)
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

async function fetchTrades(symbol, windowDef){
  const params = new URLSearchParams({
    start: windowStart(windowDef),
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

async function fetchBars(symbol, windowDef){
  const params = new URLSearchParams({
    start: windowDef?.since === "thursday" ? recentThursdayStartIso() : isoAgo(Math.max(windowDef.hours || 12, 24)),
    end: new Date().toISOString(),
    timeframe: "5Min",
    limit: "1000",
    feed: process.env.ALPACA_MARKET_DATA_FEED || "iex"
  })
  const response = await fetch(`https://data.alpaca.markets/v2/stocks/${encodeURIComponent(symbol)}/bars?${params}`, {
    headers: alpacaHeaders()
  })
  const text = await response.text()
  if(!response.ok) throw new Error(`Alpaca bars returned ${response.status}: ${text.slice(0, 180)}`)
  const payload = JSON.parse(text)
  return payload.bars || []
}

function average(values){
  const clean = values.map(Number).filter(Number.isFinite)
  if(!clean.length) return 0
  return clean.reduce((sum, value) => sum + value, 0) / clean.length
}

function summarizeTechnicalTiming(bars){
  const closes = bars.map((bar) => Number(bar.c || bar.close || 0)).filter(Boolean)
  const volumes = bars.map((bar) => Number(bar.v || bar.volume || 0)).filter(Boolean)
  if(closes.length < 6){
    return {
      timingScore: 0,
      timingSignal: "insufficient-chart-context",
      chartContext: "Not enough recent bars to judge timing."
    }
  }

  const last = closes[closes.length - 1]
  const previous = closes[closes.length - 2] || last
  const dayOpen = closes[0]
  const shortSma = average(closes.slice(-6))
  const longSma = average(closes.slice(-24))
  const recentVolume = average(volumes.slice(-6))
  const baseVolume = average(volumes.slice(-48)) || recentVolume || 1
  const volumeRatio = recentVolume / baseVolume
  const dayMovePct = dayOpen ? ((last - dayOpen) / dayOpen) * 100 : 0
  const lastMovePct = previous ? ((last - previous) / previous) * 100 : 0

  let timingScore = 0
  if(last > shortSma) timingScore += 18
  if(shortSma > longSma) timingScore += 22
  if(volumeRatio > 1.25) timingScore += 20
  if(Math.abs(dayMovePct) > 1) timingScore += 18
  if(Math.abs(lastMovePct) > 0.2) timingScore += 12
  timingScore = Math.min(100, Math.round(timingScore))

  const direction = last >= dayOpen ? "uptrend" : "downtrend"
  const timingSignal = timingScore >= 70
    ? `${direction}-strong-timing`
    : timingScore >= 45
      ? `${direction}-watch-timing`
      : `${direction}-weak-timing`

  return {
    timingScore,
    timingSignal,
    lastPrice: Number(last.toFixed(2)),
    shortSma: Number(shortSma.toFixed(2)),
    longSma: Number(longSma.toFixed(2)),
    dayMovePct: Number(dayMovePct.toFixed(2)),
    lastMovePct: Number(lastMovePct.toFixed(2)),
    volumeRatio: Number(volumeRatio.toFixed(2)),
    chartContext: `Last $${last.toFixed(2)}, ${dayMovePct.toFixed(2)}% window move, ${volumeRatio.toFixed(2)}x recent volume, ${shortSma > longSma ? "short trend above long trend" : "short trend below long trend"}.`
  }
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

function summarizeWindow(symbol, id, trades, bars = []){
  const classified = classifyTrades(trades)
  const largest = [...classified].sort((a, b) => b.notional - a.notional).slice(0, 10)
  const largestPrint = largest[0] || null
  const buyPrints = classified.filter((item) => item.side === "buy-pressure")
  const sellPrints = classified.filter((item) => item.side === "sell-pressure")
  const buyNotional = buyPrints.reduce((sum, item) => sum + item.notional, 0)
  const sellNotional = sellPrints.reduce((sum, item) => sum + item.notional, 0)
  const totalNotional = classified.reduce((sum, item) => sum + item.notional, 0)
  const totalVolume = classified.reduce((sum, item) => sum + item.size, 0)
  const biggestBuy = [...buyPrints].sort((a, b) => b.notional - a.notional).slice(0, 5)
  const biggestSell = [...sellPrints].sort((a, b) => b.notional - a.notional).slice(0, 5)
  const technical = summarizeTechnicalTiming(bars)
  const pressure = largestPrint?.side === "buy-pressure" && technical.timingSignal.includes("uptrend")
    ? "bullish-timed-large-print"
    : largestPrint?.side === "sell-pressure" && technical.timingSignal.includes("downtrend")
      ? "bearish-timed-large-print"
      : largestPrint?.side === "buy-pressure"
        ? "large-buy-print"
        : largestPrint?.side === "sell-pressure"
          ? "large-sell-print"
          : "mixed-print-pressure"
  return {
    id,
    symbol,
    tradeCount: classified.length,
    totalVolume,
    totalNotional: Number(totalNotional.toFixed(2)),
    buyPressureNotional: Number(buyNotional.toFixed(2)),
    sellPressureNotional: Number(sellNotional.toFixed(2)),
    largestPrintAmount: Number((largestPrint?.notional || 0).toFixed(2)),
    largestPrintSide: largestPrint?.side || "neutral",
    pressure,
    technical,
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
      const [trades, bars] = await Promise.all([
        fetchTrades(symbol, windowDef),
        fetchBars(symbol, windowDef)
      ])
      windows.push(summarizeWindow(symbol, windowDef.id, trades, bars))
    } catch (error) {
      errors.push({window: windowDef.id, error: error?.message || "Alpaca request failed"})
    }
  }

  const latest = windows[windows.length - 1] || windows[0]
  const summary = latest
    ? `${symbol} ${latest.id} window shows ${latest.pressure}. Largest print amount was about $${Math.round(latest.largestPrintAmount).toLocaleString()} with ${latest.largestPrintSide}; chart timing score ${latest.technical?.timingScore || 0}/100. Buy/sell side is inferred, not trader identity.`
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
