function cleanSymbol(symbol = "AAPL") {
  return String(symbol || "AAPL").toUpperCase().replace("/", "")
}

function classifyHttpStatus(response, provider) {
  if (response.status === 401 || response.status === 403) return "permission-failed"
  if (response.status === 429) return "rate-limited"
  return `${provider}-request-failed`
}

function numberValue(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function buildQuoteVisual({ symbol, price, change, changePercent, label }) {
  return {
    symbol,
    label: label || `${symbol} market profile`,
    price: numberValue(price),
    change: numberValue(change),
    changePercent: String(changePercent || "").replace(/[()%]/g, ""),
    tone: numberValue(change) >= 0 ? "bullish" : "bearish"
  }
}

export async function testPolygonMarketSource(symbol = "AAPL") {
  const apiKey = process.env.POLYGON_API_KEY
  const ticker = cleanSymbol(symbol)
  if (!apiKey) {
    return {
      provider: "polygon",
      category: "stock-options-market",
      visualType: "market-profile-missing-key",
      keyPresent: false,
      status: "missing-key",
      symbol: ticker,
      canRender: false,
      fallbackReason: "Set POLYGON_API_KEY to enable Polygon ticker/options profile tests."
    }
  }

  try {
    const response = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`)
    if (!response.ok) {
      return {
        provider: "polygon",
        category: "stock-options-market",
        visualType: "market-profile-error",
        keyPresent: true,
        status: classifyHttpStatus(response, "polygon"),
        symbol: ticker,
        canRender: false,
        fallbackReason: `Polygon returned ${response.status}.`
      }
    }
    const data = await response.json()
    const result = data.results
    return {
      provider: "polygon",
      category: "stock-options-market",
      visualType: "company-profile-card",
      keyPresent: true,
      status: result ? "live" : "no-result",
      symbol: ticker,
      sampleTitle: result?.name || ticker,
      market: result ? {
        ticker: result.ticker,
        name: result.name,
        market: result.market,
        locale: result.locale,
        type: result.type,
        currency: result.currency_name,
        exchange: result.primary_exchange
      } : null,
      visual: result ? {
        symbol: result.ticker,
        label: result.name,
        market: result.market,
        exchange: result.primary_exchange,
        type: result.type,
        currency: result.currency_name
      } : null,
      canRender: Boolean(result),
      fallbackReason: result ? null : "Polygon returned no ticker profile result."
    }
  } catch (error) {
    return {
      provider: "polygon",
      category: "stock-options-market",
      visualType: "market-profile-error",
      keyPresent: true,
      status: "request-error",
      symbol: ticker,
      canRender: false,
      fallbackReason: error?.message || "Polygon request failed."
    }
  }
}

export async function testAlphaVantageMarketSource(symbol = "AAPL") {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  const ticker = cleanSymbol(symbol)
  if (!apiKey) {
    return {
      provider: "alpha-vantage",
      category: "technical-market-data",
      visualType: "quote-missing-key",
      keyPresent: false,
      status: "missing-key",
      symbol: ticker,
      canRender: false,
      fallbackReason: "Set ALPHA_VANTAGE_API_KEY to enable quote and technical indicator tests."
    }
  }

  try {
    const url = new URL("https://www.alphavantage.co/query")
    url.searchParams.set("function", "GLOBAL_QUOTE")
    url.searchParams.set("symbol", ticker)
    url.searchParams.set("apikey", apiKey)
    const response = await fetch(url)
    if (!response.ok) {
      return {
        provider: "alpha-vantage",
        category: "technical-market-data",
        visualType: "quote-error",
        keyPresent: true,
        status: classifyHttpStatus(response, "alpha-vantage"),
        symbol: ticker,
        canRender: false,
        fallbackReason: `Alpha Vantage returned ${response.status}.`
      }
    }
    const data = await response.json()
    const quote = data["Global Quote"]
    const note = data.Note || data.Information
    const hasQuote = quote && Object.keys(quote).length
    return {
      provider: "alpha-vantage",
      category: "technical-market-data",
      visualType: "quote-card",
      keyPresent: true,
      status: hasQuote ? "live" : note ? "rate-limited-or-info" : "no-result",
      symbol: ticker,
      sampleTitle: `${ticker} Global Quote`,
      market: hasQuote ? quote : null,
      visual: hasQuote ? buildQuoteVisual({
        symbol: ticker,
        label: `${ticker} Global Quote`,
        price: quote["05. price"],
        change: quote["09. change"],
        changePercent: quote["10. change percent"]
      }) : null,
      canRender: Boolean(hasQuote),
      fallbackReason: hasQuote ? null : note || "Alpha Vantage returned no quote result."
    }
  } catch (error) {
    return {
      provider: "alpha-vantage",
      category: "technical-market-data",
      visualType: "quote-error",
      keyPresent: true,
      status: "request-error",
      symbol: ticker,
      canRender: false,
      fallbackReason: error?.message || "Alpha Vantage request failed."
    }
  }
}

export async function testFmpMarketSource(symbol = "AAPL") {
  const apiKey = process.env.FMP_API_KEY
  const ticker = cleanSymbol(symbol)
  if (!apiKey) {
    return {
      provider: "fmp",
      category: "company-profile-fundamentals",
      visualType: "company-profile-missing-key",
      keyPresent: false,
      status: "missing-key",
      symbol: ticker,
      canRender: false,
      fallbackReason: "Set FMP_API_KEY to enable Financial Modeling Prep company profile tests."
    }
  }

  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${apiKey}`)
    if (!response.ok) {
      return {
        provider: "fmp",
        category: "company-profile-fundamentals",
        visualType: "company-profile-error",
        keyPresent: true,
        status: classifyHttpStatus(response, "fmp"),
        symbol: ticker,
        canRender: false,
        fallbackReason: `FMP returned ${response.status}.`
      }
    }
    const data = await response.json()
    const profile = Array.isArray(data) ? data[0] : null
    return {
      provider: "fmp",
      category: "company-profile-fundamentals",
      visualType: "company-profile-card",
      keyPresent: true,
      status: profile ? "live" : "no-result",
      symbol: ticker,
      sampleTitle: profile?.companyName || `${ticker} Company Profile`,
      sampleImage: profile?.image || null,
      market: profile ? {
        companyName: profile.companyName,
        price: profile.price,
        beta: profile.beta,
        mktCap: profile.mktCap,
        industry: profile.industry,
        sector: profile.sector,
        exchange: profile.exchangeShortName,
        website: profile.website
      } : null,
      visual: profile ? buildQuoteVisual({
        symbol: ticker,
        label: profile.companyName,
        price: profile.price,
        change: null,
        changePercent: "",
      }) : null,
      canRender: Boolean(profile),
      fallbackReason: profile ? null : "FMP returned no company profile result."
    }
  } catch (error) {
    return {
      provider: "fmp",
      category: "company-profile-fundamentals",
      visualType: "company-profile-error",
      keyPresent: true,
      status: "request-error",
      symbol: ticker,
      canRender: false,
      fallbackReason: error?.message || "FMP request failed."
    }
  }
}

export async function testAllMarketSources(symbol = "AAPL") {
  const [polygon, alphaVantage, fmp] = await Promise.all([
    testPolygonMarketSource(symbol),
    testAlphaVantageMarketSource(symbol),
    testFmpMarketSource(symbol)
  ])
  return [polygon, alphaVantage, fmp]
}
