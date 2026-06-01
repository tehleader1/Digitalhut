const sectorWeights = {
  technology: { volatility: 1.35, trend: 1.25, liquidity: 1.2 },
  finance: { volatility: 0.95, trend: 0.85, liquidity: 1.15 },
  energy: { volatility: 1.15, trend: 0.8, liquidity: 0.95 },
  healthcare: { volatility: 0.85, trend: 0.75, liquidity: 0.9 },
  consumer: { volatility: 0.9, trend: 0.8, liquidity: 0.85 },
  industrial: { volatility: 0.95, trend: 0.82, liquidity: 0.82 },
  broad: { volatility: 0.7, trend: 0.72, liquidity: 1.25 }
}

function hashSymbol(symbol) {
  return String(symbol || "")
    .split("")
    .reduce((total, char, index) => total + char.charCodeAt(0) * (index + 11), 17)
}

function sectorFor(symbol = "") {
  const s = symbol.toUpperCase()
  if (["AAPL", "MSFT", "NVDA", "AMD", "META", "GOOGL", "GOOG", "AVGO", "ORCL", "CRM", "ADBE"].includes(s)) return "technology"
  if (["JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "AXP", "C"].includes(s)) return "finance"
  if (["XOM", "CVX", "COP", "SLB", "EOG"].includes(s)) return "energy"
  if (["UNH", "LLY", "JNJ", "MRK", "ABBV", "PFE"].includes(s)) return "healthcare"
  if (["AMZN", "TSLA", "WMT", "COST", "HD", "MCD", "NKE"].includes(s)) return "consumer"
  if (["SPY", "QQQ", "DIA", "IWM"].includes(s)) return "broad"
  return "industrial"
}

function round(value, places = 2) {
  const power = 10 ** places
  return Math.round(value * power) / power
}

export function buildStockProfile(input = {}) {
  const symbol = String(input.symbol || "SPY").toUpperCase()
  const name = input.name || `${symbol} security profile`
  const universe = input.universe || input.exchange || "market"
  const seed = hashSymbol(symbol)
  const sector = input.sector || sectorFor(symbol)
  const weights = sectorWeights[sector] || sectorWeights.industrial
  const basePrice = input.price || round(18 + (seed % 620) * weights.liquidity, 2)
  const volatility = round(weights.volatility * (0.75 + (seed % 29) / 40), 2)
  const trendBias = round(weights.trend * (((seed % 41) - 18) / 22), 2)
  const bullScore = Math.max(12, Math.min(88, Math.round(50 + trendBias * 14 + volatility * 4)))
  const bearScore = 100 - bullScore
  const range = Math.max(0.35, basePrice * volatility * 0.018)
  const support = round(basePrice - range * (1.4 + (seed % 5) / 10), 2)
  const resistance = round(basePrice + range * (1.6 + (seed % 7) / 10), 2)
  const takeProfitOne = round(resistance + range * 0.65, 2)
  const takeProfitTwo = round(resistance + range * 1.35, 2)
  const invalidation = round(support - range * 0.55, 2)
  const trend = bullScore >= 62 ? "bullish-run-watch" : bearScore >= 62 ? "bearish-run-watch" : "balanced-range"

  return {
    symbol,
    name,
    universe,
    sector,
    generatedAt: new Date().toISOString(),
    profileYear: 2026,
    dataMode: input.dataMode || "scenario-profile",
    price: basePrice,
    volatility,
    trend,
    bullScore,
    bearScore,
    technicals: {
      ema20: round(basePrice + trendBias * 0.9, 2),
      ema50: round(basePrice + trendBias * 0.55, 2),
      sma200: round(basePrice - trendBias * 0.75, 2),
      support,
      resistance,
      liquidity: weights.liquidity >= 1 ? "deep" : "moderate"
    },
    bullishRun: {
      trigger: `Acceptance above ${resistance}`,
      takeProfit: [takeProfitOne, takeProfitTwo],
      confirmation: "Higher low holds while volume expands into resistance."
    },
    bearishRun: {
      trigger: `Break and close below ${support}`,
      downsideTargets: [invalidation, round(invalidation - range * 1.05, 2)],
      confirmation: "Failed reclaim of support after a downside break."
    },
    riskRead: {
      invalidation,
      note: "Scenario analysis only. Confirm with live candles, filings, liquidity, and user risk rules before acting."
    }
  }
}

export function buildStockProfiles(symbols = [], options = {}) {
  return symbols.map(item => buildStockProfile({ ...item, dataMode: options.dataMode || "scenario-profile" }))
}
