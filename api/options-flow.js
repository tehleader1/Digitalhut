const windows = [
  {id: "1h", hours: 1},
  {id: "3h", hours: 3},
  {id: "6h", hours: 6},
  {id: "12h", hours: 12},
  {id: "since-thursday", since: "thursday"}
]

function cleanSymbol(value){
  const match = String(value || "").toUpperCase().match(/\b[A-Z]{1,5}\b/)
  return match ? match[0] : ""
}

function cleanContract(value){
  const match = String(value || "").toUpperCase().match(/\b[A-Z]{1,6}\d{6}[CP]\d{8}\b/)
  return match ? match[0] : ""
}

function parseContractSymbol(contractSymbol, underlying = ""){
  const match = String(contractSymbol || "").toUpperCase().match(/^([A-Z]{1,6})(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/)
  if(!match) return {symbol: contractSymbol, type: "", strike: 0, expiration: ""}
  const [, root, yy, mm, dd, cp, strikeRaw] = match
  return {
    symbol: contractSymbol,
    root: underlying || root,
    type: cp === "C" ? "call" : "put",
    strike: Number(strikeRaw) / 1000,
    expiration: `20${yy}-${mm}-${dd}`
  }
}

function dateOffset(days){
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
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
  return {
    "APCA-API-KEY-ID": process.env.ALPACA_API_KEY || process.env.VITE_ALPACA_API_KEY || "",
    "APCA-API-SECRET-KEY": process.env.ALPACA_SECRET_KEY || process.env.VITE_ALPACA_SECRET_KEY || "",
    Accept: "application/json"
  }
}

function hasAlpaca(){
  return Boolean((process.env.ALPACA_API_KEY || process.env.VITE_ALPACA_API_KEY) && (process.env.ALPACA_SECRET_KEY || process.env.VITE_ALPACA_SECRET_KEY))
}

async function fetchOptionContracts(symbol){
  const params = new URLSearchParams({
    underlying_symbols: symbol,
    status: "active",
    expiration_date_gte: dateOffset(0),
    expiration_date_lte: dateOffset(45),
    limit: "80"
  })
  const base = process.env.ALPACA_TRADING_API_BASE || "https://paper-api.alpaca.markets"
  const response = await fetch(`${base.replace(/\/+$/, "")}/v2/options/contracts?${params}`, {headers: alpacaHeaders()})
  const text = await response.text()
  if(!response.ok) throw new Error(`Alpaca option contracts returned ${response.status}: ${text.slice(0, 180)}`)
  const payload = JSON.parse(text)
  return payload.option_contracts || payload.contracts || []
}

async function fetchOptionTrades(symbols, windowDef){
  if(!symbols.length) return []
  const params = new URLSearchParams({
    symbols: symbols.slice(0, 80).join(","),
    start: windowStart(windowDef),
    end: new Date().toISOString(),
    limit: "10000",
    sort: "asc"
  })
  const response = await fetch(`https://data.alpaca.markets/v1beta1/options/trades?${params}`, {headers: alpacaHeaders()})
  const text = await response.text()
  if(!response.ok) throw new Error(`Alpaca option trades returned ${response.status}: ${text.slice(0, 180)}`)
  const payload = JSON.parse(text)
  const tradesBySymbol = payload.trades || {}
  if(Array.isArray(tradesBySymbol)) return tradesBySymbol
  return Object.entries(tradesBySymbol).flatMap(([contractSymbol, trades]) => (Array.isArray(trades) ? trades.map((trade) => ({...trade, S: trade.S || contractSymbol})) : []))
}

function contractMap(contracts){
  return new Map(contracts.map((contract) => [
    contract.symbol,
    {
      symbol: contract.symbol,
      type: contract.type || contract.option_type || "",
      strike: Number(contract.strike_price || contract.strike || 0),
      expiration: contract.expiration_date || ""
    }
  ]))
}

function classify(trades, contracts){
  const meta = contractMap(contracts)
  const previous = new Map()
  return trades.map((trade) => {
    const contractSymbol = trade.S || trade.symbol || trade.contract_symbol || ""
    const price = Number(trade.p || trade.price || 0)
    const size = Number(trade.s || trade.size || 0)
    const premium = Number((price * size * 100).toFixed(2))
    const contract = meta.get(contractSymbol) || {symbol: contractSymbol, type: "", strike: 0, expiration: ""}
    const prev = previous.get(contractSymbol) || 0
    let side = "neutral"
    if(prev && price > prev) side = "buy-pressure"
    if(prev && price < prev) side = "sell-pressure"
    previous.set(contractSymbol, price || prev)
    const directionalPressure = contract.type === "call" && side === "buy-pressure"
      ? "bullish-call-pressure"
      : contract.type === "put" && side === "buy-pressure"
        ? "bearish-put-pressure"
        : contract.type === "call" && side === "sell-pressure"
          ? "call-selling-pressure"
          : contract.type === "put" && side === "sell-pressure"
            ? "put-selling-pressure"
            : "mixed-options-pressure"
    return {
      time: trade.t,
      contract: contractSymbol,
      type: contract.type,
      strike: contract.strike,
      expiration: contract.expiration,
      price,
      size,
      premium,
      exchange: trade.x || "",
      conditions: trade.c || [],
      side,
      directionalPressure,
      confidence: side === "neutral" ? "low" : "inferred-from-contract-tick-direction"
    }
  })
}

function pickRandomLarge(list, count = 5){
  const pool = [...list].sort((a, b) => b.premium - a.premium).slice(0, 30)
  return pool.sort(() => Math.random() - 0.5).slice(0, count)
}

function summarize(symbol, id, trades, contracts){
  const prints = classify(trades, contracts)
  const buys = prints.filter((item) => item.side === "buy-pressure")
  const sells = prints.filter((item) => item.side === "sell-pressure")
  const callBuyPremium = buys.filter((item) => item.type === "call").reduce((sum, item) => sum + item.premium, 0)
  const putBuyPremium = buys.filter((item) => item.type === "put").reduce((sum, item) => sum + item.premium, 0)
  const totalPremium = prints.reduce((sum, item) => sum + item.premium, 0)
  const pressure = callBuyPremium > putBuyPremium * 1.12 ? "bullish-options-pressure" : putBuyPremium > callBuyPremium * 1.12 ? "bearish-options-pressure" : "mixed-options-pressure"
  return {
    id,
    symbol,
    printCount: prints.length,
    totalPremium: Number(totalPremium.toFixed(2)),
    callBuyPremium: Number(callBuyPremium.toFixed(2)),
    putBuyPremium: Number(putBuyPremium.toFixed(2)),
    pressure,
    largestPrints: [...prints].sort((a, b) => b.premium - a.premium).slice(0, 10),
    randomBigBuys: pickRandomLarge(buys),
    randomBigSells: pickRandomLarge(sells)
  }
}

export default async function handler(req, res){
  const symbol = cleanSymbol(req.query?.symbol || req.query?.ticker || req.query?.q)
  const selectedContract = cleanContract(req.query?.contract || req.query?.option || req.query?.option_symbol)
  if(!symbol) return res.status(400).json({error: "Ticker symbol required"})
  if(!hasAlpaca()){
    return res.status(200).json({
      symbol,
      configured: false,
      message: "ALPACA_API_KEY and ALPACA_SECRET_KEY are required for the Options Market Print Feed.",
      windows: []
    })
  }

  const errors = []
  let contracts = []
  if(selectedContract){
    contracts = [parseContractSymbol(selectedContract, symbol)]
  } else {
    try {
      contracts = await fetchOptionContracts(symbol)
    } catch (error) {
      return res.status(200).json({symbol, configured: true, contracts: 0, selectedContract, windows: [], errors: [{stage: "contracts", error: error?.message || "contract lookup failed"}]})
    }
  }
  const contractSymbols = contracts.map((contract) => contract.symbol).filter(Boolean)
  const resultWindows = []
  for(const item of windows){
    try {
      const trades = await fetchOptionTrades(contractSymbols, item)
      resultWindows.push(summarize(symbol, item.id, trades, contracts))
    } catch (error) {
      errors.push({window: item.id, error: error?.message || "option trades failed"})
    }
  }
  const latest = [...resultWindows].reverse().find((item) => item.printCount > 0) || resultWindows[0]
  const summary = latest
    ? `${symbol} Options Market Print Feed shows ${latest.pressure} in the ${latest.id} window with ${latest.printCount} option prints and about $${Math.round(latest.totalPremium).toLocaleString()} premium. Random big prints are sampled from the largest buy/sell pressure candidates.`
    : `${symbol} options feed returned contracts but no usable option prints in the checked windows.`
  res.setHeader("Cache-Control", "no-store")
  return res.status(200).json({
    symbol,
    selectedContract,
    configured: true,
    source: "Alpaca Options Market Data API",
    checkedAt: new Date().toISOString(),
    contracts: contractSymbols.length,
    disclaimer: "Options buy/sell pressure is inferred from contract trade direction. This is not trader identity, not exact bid/ask aggressor data, and not financial advice.",
    summary,
    windows: resultWindows,
    errors
  })
}
