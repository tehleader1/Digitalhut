const sources = {
  sp500: {
    label: "S&P 500",
    url: "https://datahub.io/core/s-and-p-500-companies/r/constituents.csv",
    format: "csv",
    symbolField: "Symbol",
    nameField: "Name",
    exchange: "SP500"
  },
  nasdaq: {
    label: "NASDAQ Listed",
    url: "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt",
    format: "pipe",
    symbolField: "Symbol",
    nameField: "Security Name",
    exchange: "NASDAQ"
  },
  nyse: {
    label: "NYSE Listed",
    url: "https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt",
    format: "pipe",
    symbolField: "ACT Symbol",
    nameField: "Security Name",
    exchange: "NYSE",
    filter: row => row.Exchange === "N"
  }
}

const fallbackSeeds = {
  sp500: [
    ["AAPL", "Apple Inc."], ["MSFT", "Microsoft Corporation"], ["NVDA", "NVIDIA Corporation"],
    ["AMZN", "Amazon.com Inc."], ["META", "Meta Platforms Inc."], ["GOOGL", "Alphabet Inc."],
    ["TSLA", "Tesla Inc."], ["BRK.B", "Berkshire Hathaway Inc."], ["JPM", "JPMorgan Chase & Co."], ["SPY", "SPDR S&P 500 ETF Trust"]
  ],
  nasdaq: [
    ["AAPL", "Apple Inc."], ["MSFT", "Microsoft Corporation"], ["NVDA", "NVIDIA Corporation"],
    ["AMZN", "Amazon.com Inc."], ["META", "Meta Platforms Inc."], ["TSLA", "Tesla Inc."],
    ["AMD", "Advanced Micro Devices Inc."], ["COIN", "Coinbase Global Inc."], ["QQQ", "Invesco QQQ Trust"]
  ],
  nyse: [
    ["JPM", "JPMorgan Chase & Co."], ["BRK.B", "Berkshire Hathaway Inc."], ["WMT", "Walmart Inc."],
    ["XOM", "Exxon Mobil Corporation"], ["UNH", "UnitedHealth Group Incorporated"], ["V", "Visa Inc."],
    ["DIS", "The Walt Disney Company"], ["IBM", "International Business Machines Corporation"], ["SPY", "SPDR S&P 500 ETF Trust"]
  ]
}

function parsePipe(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  const headers = lines.shift()?.split("|") || []
  return lines
    .filter(line => !line.startsWith("File Creation Time"))
    .map(line => {
      const values = line.split("|")
      return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]))
    })
}

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ""
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]
    if (char === '"' && quoted && next === '"') {
      cell += '"'
      i++
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === "," && !quoted) {
      row.push(cell)
      cell = ""
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (cell || row.length) {
        row.push(cell)
        rows.push(row)
      }
      row = []
      cell = ""
      if (char === "\r" && next === "\n") i++
    } else {
      cell += char
    }
  }
  if (cell || row.length) rows.push([...row, cell])
  const headers = rows.shift() || []
  return rows.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])))
}

function normalizeSymbol(symbol) {
  return String(symbol || "").trim().replace("/", ".").toUpperCase()
}

function fromFallback(universe) {
  const seed = fallbackSeeds[universe] || fallbackSeeds.sp500
  return seed.map(([symbol, name]) => ({ symbol, name, exchange: sources[universe]?.exchange || universe.toUpperCase(), universe }))
}

async function loadSingleUniverse(universe) {
  const source = sources[universe]
  if (!source) throw new Error(`Unknown universe: ${universe}`)

  try {
    const response = await fetch(source.url, { cache: "no-store" })
    if (!response.ok) throw new Error(`Source returned ${response.status}`)
    const text = await response.text()
    const rows = source.format === "pipe" ? parsePipe(text) : parseCsv(text)
    const symbols = rows
      .filter(row => !source.filter || source.filter(row))
      .filter(row => row[source.symbolField] && row[source.symbolField] !== "Symbol")
      .filter(row => row["Test Issue"] !== "Y")
      .filter(row => row.ETF !== "Y")
      .map(row => ({
        symbol: normalizeSymbol(row[source.symbolField]),
        name: row[source.nameField] || row.Security || row.Name || "Unknown security",
        exchange: source.exchange,
        universe,
        rawExchange: row.Exchange || source.exchange
      }))
      .filter(row => row.symbol)

    return {
      universe,
      label: source.label,
      sourceUrl: source.url,
      sourceStatus: "live-source",
      count: symbols.length,
      symbols
    }
  } catch (error) {
    const symbols = fromFallback(universe)
    return {
      universe,
      label: source.label,
      sourceUrl: source.url,
      sourceStatus: "fallback-seed",
      error: error.message,
      count: symbols.length,
      symbols
    }
  }
}

function applyLimit(symbols, limit) {
  const n = Number(limit)
  if (!Number.isFinite(n) || n <= 0) return symbols
  return symbols.slice(0, n)
}

export function listUniverseSources() {
  return Object.entries(sources).map(([key, source]) => ({ universe: key, label: source.label, sourceUrl: source.url }))
}

export async function loadUniverse(universe = "sp500", options = {}) {
  const limit = options.limit ?? 0
  if (universe === "all") {
    const loaded = await Promise.all([loadSingleUniverse("sp500"), loadSingleUniverse("nasdaq"), loadSingleUniverse("nyse")])
    const bySymbol = new Map()
    loaded.forEach(group => group.symbols.forEach(item => {
      if (!bySymbol.has(item.symbol)) bySymbol.set(item.symbol, { ...item, universes: [item.universe] })
      else bySymbol.get(item.symbol).universes.push(item.universe)
    }))
    const symbols = applyLimit([...bySymbol.values()], limit)
    return {
      universe: "all",
      label: "S&P 500, NASDAQ, and NYSE",
      sourceStatus: loaded.every(group => group.sourceStatus === "live-source") ? "live-source" : "mixed-source",
      count: symbols.length,
      totalAvailable: bySymbol.size,
      sources: loaded.map(group => ({ universe: group.universe, status: group.sourceStatus, count: group.count, error: group.error || null })),
      symbols
    }
  }

  const loaded = await loadSingleUniverse(universe)
  const symbols = applyLimit(loaded.symbols, limit)
  return { ...loaded, count: symbols.length, totalAvailable: loaded.symbols.length, symbols }
}
