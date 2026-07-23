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

function envValue(...keys){
  return keys.map((key) => String(process.env[key] || "").trim()).find(Boolean) || ""
}

function hasGeneralMarketProvider(){
  return Boolean(
    envValue("FMP_API_KEY", "VITE_FMP_API_KEY") ||
    envValue("ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY") ||
    envValue("POLYGON_API_KEY", "VITE_POLYGON_API_KEY")
  )
}

async function readJson(url, source){
  const response = await fetch(url, {headers: {Accept: "application/json", "User-Agent": "DigitalHut/1.0 market-read"}})
  const text = await response.text()
  if(!response.ok) throw new Error(`${source} returned ${response.status}: ${text.slice(0, 160)}`)
  return JSON.parse(text)
}

function quoteWindowFor(symbol, quote){
  const price = Number(quote.price || 0)
  const volume = Number(quote.volume || 0)
  const changePct = Number(quote.changePct || 0)
  const side = changePct >= 0 ? "buy-pressure" : "sell-pressure"
  const notional = price && volume ? price * volume : 0
  const timingScore = Math.max(24, Math.min(96, Math.round(52 + Math.abs(changePct) * 9 + (volume ? 10 : 0))))
  const print = {
    time: quote.checkedAt,
    price,
    size: volume,
    notional: Number(notional.toFixed(2)),
    exchange: quote.source,
    conditions: ["provider-quote"],
    tape: "quote",
    side,
    confidence: "provider-quote-stat"
  }
  return {
    id: "provider-quote",
    symbol,
    tradeCount: price ? 1 : 0,
    totalVolume: volume,
    totalNotional: Number(notional.toFixed(2)),
    buyPressureNotional: side === "buy-pressure" ? Number(notional.toFixed(2)) : 0,
    sellPressureNotional: side === "sell-pressure" ? Number(notional.toFixed(2)) : 0,
    largestPrintAmount: Number(notional.toFixed(2)),
    largestPrintSide: side,
    pressure: changePct >= 0 ? "provider-quote-up" : "provider-quote-down",
    technical: {
      timingScore,
      timingSignal: changePct >= 0 ? "quote-up-watch" : "quote-down-watch",
      lastPrice: price,
      dayMovePct: Number(changePct.toFixed(2)),
      chartContext: `${quote.source} reports ${symbol} near $${price || "pending"} with ${changePct.toFixed(2)}% move and ${volume ? volume.toLocaleString() : "pending"} volume.`
    },
    largestPrints: price ? [print] : [],
    biggestInferredBuys: side === "buy-pressure" && price ? [print] : [],
    biggestInferredSells: side === "sell-pressure" && price ? [print] : []
  }
}

async function fetchGeneralMarketSnapshot(symbol){
  const checkedAt = new Date().toISOString()
  const fmpKey = envValue("FMP_API_KEY", "VITE_FMP_API_KEY")
  if(fmpKey){
    const payload = await readJson(`https://financialmodelingprep.com/api/v3/quote/${encodeURIComponent(symbol)}?apikey=${encodeURIComponent(fmpKey)}`, "FMP")
    const row = Array.isArray(payload) ? payload[0] : payload
    if(row?.price){
      return {
        symbol,
        checkedAt,
        source: "Financial Modeling Prep API",
        price: Number(row.price || 0),
        changePct: Number(row.changesPercentage || row.changePercentage || 0),
        volume: Number(row.volume || 0)
      }
    }
  }
  const alphaKey = envValue("ALPHA_VANTAGE_API_KEY", "VITE_ALPHA_VANTAGE_API_KEY")
  if(alphaKey){
    const payload = await readJson(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(alphaKey)}`, "Alpha Vantage")
    const row = payload?.["Global Quote"] || {}
    const price = Number(row["05. price"] || 0)
    if(price){
      return {
        symbol,
        checkedAt,
        source: "Alpha Vantage Global Quote",
        price,
        changePct: Number(String(row["10. change percent"] || "0").replace("%", "")),
        volume: Number(row["06. volume"] || 0)
      }
    }
  }
  const polygonKey = envValue("POLYGON_API_KEY", "VITE_POLYGON_API_KEY")
  if(polygonKey){
    const payload = await readJson(`https://api.polygon.io/v2/aggs/ticker/${encodeURIComponent(symbol)}/prev?adjusted=true&apiKey=${encodeURIComponent(polygonKey)}`, "Polygon")
    const row = Array.isArray(payload?.results) ? payload.results[0] : null
    const price = Number(row?.c || 0)
    if(price){
      const open = Number(row?.o || price)
      return {
        symbol,
        checkedAt,
        source: "Polygon Previous Close API",
        price,
        changePct: open ? ((price - open) / open) * 100 : 0,
        volume: Number(row?.v || 0)
      }
    }
  }
  throw new Error("No general market quote provider returned a usable price.")
}

async function generalMarketPayload(symbol){
  const quote = await fetchGeneralMarketSnapshot(symbol)
  const window = quoteWindowFor(symbol, quote)
  const summary = `${symbol} ${quote.source} read: price near $${quote.price || "pending"}, ${Number(quote.changePct || 0).toFixed(2)}% move, ${quote.volume ? quote.volume.toLocaleString() : "pending"} volume.`
  return {
    symbol,
    configured: true,
    source: quote.source,
    feed: "general-market-provider",
    checkedAt: quote.checkedAt,
    disclaimer: "General quote/stat providers do not identify individual traders. This is market context for the observatory view, not financial advice.",
    summary,
    windows: [window],
    errors: []
  }
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
  const normalizedBars = bars.map((bar) => ({
    open:Number(bar.o || bar.open || 0),
    high:Number(bar.h || bar.high || 0),
    low:Number(bar.l || bar.low || 0),
    close:Number(bar.c || bar.close || 0),
    volume:Number(bar.v || bar.volume || 0)
  })).filter((bar) => bar.close > 0)
  const closes = normalizedBars.map((bar) => bar.close)
  const volumes = normalizedBars.map((bar) => bar.volume).filter(Boolean)
  if(normalizedBars.length < 6){
    return {
      timingScore: 0,
      timingSignal: "insufficient-chart-context",
      chartContext: "Not enough recent bars to judge timing.",
      ichimokuSignal:"insufficient-bars",
      engulfingPattern:"not-detected",
      indicatorBasis:"provider OHLCV bars"
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
  const midpointFor = (count) => {
    const sample = normalizedBars.slice(-count)
    if(sample.length < Math.min(count, 6)) return null
    const high = Math.max(...sample.map((bar) => bar.high || bar.close))
    const low = Math.min(...sample.map((bar) => bar.low || bar.close))
    return Number(((high + low) / 2).toFixed(2))
  }
  const conversionLine = midpointFor(9)
  const baseLine = midpointFor(26)
  const cloudSpanA = conversionLine !== null && baseLine !== null ? Number(((conversionLine + baseLine) / 2).toFixed(2)) : null
  const cloudSpanB = normalizedBars.length >= 52 ? midpointFor(52) : null
  const cloudTop = cloudSpanA !== null && cloudSpanB !== null ? Math.max(cloudSpanA, cloudSpanB) : null
  const cloudBottom = cloudSpanA !== null && cloudSpanB !== null ? Math.min(cloudSpanA, cloudSpanB) : null
  const ichimokuSignal = cloudTop === null
    ? "building-52-bar-cloud"
    : last > cloudTop
      ? "price-above-cloud"
      : last < cloudBottom
        ? "price-below-cloud"
        : "price-inside-cloud"
  const priorBar = normalizedBars[normalizedBars.length - 2]
  const lastBar = normalizedBars[normalizedBars.length - 1]
  const priorBullish = priorBar.close > priorBar.open
  const lastBullish = lastBar.close > lastBar.open
  const bullishEngulfing = !priorBullish && lastBullish && lastBar.open <= priorBar.close && lastBar.close >= priorBar.open
  const bearishEngulfing = priorBullish && !lastBullish && lastBar.open >= priorBar.close && lastBar.close <= priorBar.open
  const engulfingPattern = bullishEngulfing ? "bullish-engulfing" : bearishEngulfing ? "bearish-engulfing" : "not-detected"

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
    conversionLine,
    baseLine,
    cloudSpanA,
    cloudSpanB,
    ichimokuSignal,
    engulfingPattern,
    indicatorBasis:"provider OHLCV bars",
    chartContext: `Last $${last.toFixed(2)}, ${dayMovePct.toFixed(2)}% window move, ${volumeRatio.toFixed(2)}x recent volume, ${shortSma > longSma ? "short trend above long trend" : "short trend below long trend"}, ${ichimokuSignal}, ${engulfingPattern}.`
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
  const deltaNotional = buyNotional - sellNotional
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
    deltaNotional: Number(deltaNotional.toFixed(2)),
    deltaSignal: deltaNotional > 0 ? "inferred-positive-delta" : deltaNotional < 0 ? "inferred-negative-delta" : "inferred-flat-delta",
    deltaBasis: "tick-direction inference, not exchange aggressor labeling",
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
    if(hasGeneralMarketProvider()){
      try {
        const payload = await generalMarketPayload(symbol)
        res.setHeader("Cache-Control", "no-store")
        return res.status(200).json(payload)
      } catch (error) {
        return res.status(200).json({
          symbol,
          configured: false,
          message: `General market provider configured, but no quote was returned: ${error?.message || "quote unavailable"}`,
          windows: []
        })
      }
    }
    return res.status(200).json({
      symbol,
      configured: false,
      message: "Add ALPACA_API_KEY/ALPACA_SECRET_KEY for trade-flow windows, or ALPHA_VANTAGE_API_KEY/FMP_API_KEY/POLYGON_API_KEY for general stock market reads.",
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
  if(!latest && hasGeneralMarketProvider()){
    try {
      const payload = await generalMarketPayload(symbol)
      payload.errors = errors
      res.setHeader("Cache-Control", "no-store")
      return res.status(200).json(payload)
    } catch {}
  }
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
