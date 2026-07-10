import {useEffect, useMemo, useRef, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./MarketPage.css"

const defaultSymbols = [
  "SPY", "QQQ", "IWM", "DIA", "AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META",
  "GOOGL", "AMD", "NFLX", "AVGO", "SMCI", "PLTR", "COIN", "MSTR", "SOFI", "RIVN",
  "F", "GM", "LOW", "HD", "COST", "WMT", "TGT", "JPM", "BAC", "GS",
  "XOM", "CVX", "UNH", "LLY", "MRNA", "BA", "DIS", "NKE", "UBER", "SHOP"
]

const marketUniverse = [
  ...defaultSymbols,
  "BABA", "NIO", "PDD", "JD", "TSM", "ARM", "MU", "INTC", "QCOM", "ORCL",
  "CRM", "ADBE", "SNOW", "NET", "DDOG", "CRWD", "PANW", "HOOD", "PYPL", "SQ",
  "MARA", "RIOT", "CLSK", "GME", "AMC", "BROS", "SBUX", "MCD", "CMG", "LULU",
  "ABNB", "BKNG", "DAL", "UAL", "AAL", "LUV", "GE", "CAT", "DE", "RTX",
  "LMT", "NOC", "PFE", "JNJ", "ABBV", "TMO", "CVS", "WBA", "OXY", "SLB",
  "XLE", "XLF", "XLK", "XLY", "XLV", "XLI", "ARKK", "HYG", "TLT", "GLD"
].filter((symbol, index, list) => list.indexOf(symbol) === index)

const sectorLabels = {
  SPY: "S&P 500 market pulse",
  QQQ: "Nasdaq growth pulse",
  IWM: "small-cap pressure",
  DIA: "Dow industrial pressure",
  AAPL: "Apple mega-cap tech",
  MSFT: "Microsoft AI/cloud",
  NVDA: "AI chip momentum",
  TSLA: "EV/robotics volatility",
  AMZN: "retail/cloud flow",
  META: "social/AI platform flow",
  GOOGL: "search/AI advertising",
  AMD: "chip sector pressure",
  NFLX: "streaming media",
  AVGO: "semiconductor infrastructure",
  SMCI: "AI server hardware",
  PLTR: "data/defense software",
  COIN: "crypto equity proxy",
  MSTR: "bitcoin treasury proxy",
  SOFI: "fintech retail flow",
  RIVN: "EV growth flow",
  F: "legacy auto",
  GM: "legacy auto",
  LOW: "home improvement retail",
  HD: "housing/home improvement",
  COST: "consumer defensive retail",
  WMT: "consumer defensive retail",
  TGT: "retail pressure",
  JPM: "banking leader",
  BAC: "banking pressure",
  GS: "institutional finance",
  XOM: "energy major",
  CVX: "energy major",
  UNH: "healthcare insurance",
  LLY: "pharma/weight-loss momentum",
  MRNA: "biotech volatility",
  BA: "aerospace/defense",
  DIS: "media/theme park flow",
  NKE: "consumer brand",
  UBER: "mobility/platform flow",
  SHOP: "commerce software"
}

function parseSymbols(value){
  return String(value || "")
    .toUpperCase()
    .split(/[^A-Z0-9.$]+/)
    .map((item) => item.replace(/^\$/, "").trim())
    .filter((item) => /^[A-Z]{1,5}$/.test(item))
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 24)
}

function money(value){
  const number = Number(value || 0)
  if(number >= 1_000_000) return `$${(number / 1_000_000).toFixed(1)}M`
  if(number >= 1_000) return `$${Math.round(number / 1_000)}K`
  return `$${Math.round(number).toLocaleString()}`
}

function bestStockWindow(payload){
  return [...(payload?.windows || [])].reverse().find((item) => item.tradeCount > 0) || payload?.windows?.[0] || null
}

function bestOptionsWindow(payload){
  return [...(payload?.windows || [])].reverse().find((item) => item.printCount > 0) || payload?.windows?.[0] || null
}

function optionCandidate(windowItem){
  return windowItem?.largestPrints?.[0] || windowItem?.randomBigBuys?.[0] || windowItem?.randomBigSells?.[0] || null
}

function pressureClass(value = ""){
  if(value.includes("bullish")) return "bullish"
  if(value.includes("bearish")) return "bearish"
  return "mixed"
}

function pressureScore(row){
  const stock = row.stockWindow || {}
  const options = row.optionsWindow || {}
  const largestStock = Number(stock.largestPrintAmount || stock.largestPrints?.[0]?.notional || 0)
  const largestOption = Number(row.candidate?.premium || options.largestPrints?.[0]?.premium || 0)
  const timingMultiplier = 1 + Number(stock.technical?.timingScore || 0) / 100
  return Number(((largestStock + largestOption * 2) * timingMultiplier).toFixed(2))
}

function pressureSummary(row){
  const stock = row.stockWindow
  const options = row.optionsWindow
  if(options?.pressure && options.pressure !== "mixed-options-pressure") return options.pressure
  if(stock?.pressure && stock.pressure !== "mixed-pressure") return stock.pressure
  return options?.pressure || stock?.pressure || "queued-pressure"
}

function trackMarketPixel(eventName, data = {}){
  try {
    window.digitalhutPixel?.track?.(eventName, {
      category: "Current Market Observatory",
      keywordHint: data.keywordHint || "current market video observatory",
      search: data.search || "",
      assetId: data.assetId || "",
      metadata: {
        source: "market-page",
        ...data.metadata
      }
    })
  } catch {
    // Market analytics must never interrupt the market feed.
  }
}

function rotateUniverse(seed = Date.now(), count = 28){
  const scored = marketUniverse.map((symbol, index) => {
    const wave = Math.sin((seed / 1000) + index * 2.31)
    const priority = defaultSymbols.includes(symbol) ? 1 : 0
    return {symbol, rank: wave + priority}
  })
  return scored
    .sort((a, b) => b.rank - a.rank)
    .slice(0, count)
    .map((item) => item.symbol)
}

async function fetchJson(url){
  const response = await fetch(url, {headers: {Accept: "application/json"}})
  const text = await response.text()
  if(!response.ok || text.trim().startsWith("<")) throw new Error(`Endpoint unavailable: ${url}`)
  return JSON.parse(text)
}

async function scanSymbol(symbol){
  const [stock, options] = await Promise.allSettled([
    fetchJson(`/api/market-flow?symbol=${encodeURIComponent(symbol)}`),
    fetchJson(`/api/options-flow?symbol=${encodeURIComponent(symbol)}`)
  ])
  const stockPayload = stock.status === "fulfilled" ? stock.value : {symbol, error: stock.reason?.message || "stock flow failed", windows: []}
  const optionsPayload = options.status === "fulfilled" ? options.value : {symbol, error: options.reason?.message || "options flow failed", windows: []}
  const stockWindow = bestStockWindow(stockPayload)
  const optionsWindow = bestOptionsWindow(optionsPayload)
  const candidate = optionCandidate(optionsWindow)
  const result = {
    symbol,
    stockPayload,
    optionsPayload,
    stockWindow,
    optionsWindow,
    candidate,
    score: Number(stockWindow?.totalNotional || 0) + Number(optionsWindow?.totalPremium || 0)
  }
  return {...result, pressureScore: pressureScore(result), pressureSummary: pressureSummary(result)}
}

async function scanSymbols(symbols, onResult){
  const queue = [...symbols]
  const workers = Array.from({length: Math.min(5, queue.length)}, async () => {
    while(queue.length){
      const symbol = queue.shift()
      const result = await scanSymbol(symbol)
      onResult(result)
    }
  })
  await Promise.all(workers)
}

function pendingRow(symbol){
  return {
    symbol,
    sector: sectorLabels[symbol] || "market watch candidate",
    stockWindow: null,
    optionsWindow: null,
    candidate: null,
    score: 0,
    pending: true
  }
}

export default function MarketPage(){
  const [input, setInput] = useState(defaultSymbols.join(", "))
  const [rows, setRows] = useState(defaultSymbols.map(pendingRow))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const started = useRef(false)
  const symbols = useMemo(() => parseSymbols(input), [input])
  const hotRows = rows
    .filter((row) => row.stockWindow || row.optionsWindow)
    .slice()
    .sort((a, b) => (b.pressureScore || 0) - (a.pressureScore || 0))
    .slice(0, 8)

  async function runScan(nextSymbols = symbols){
    const activeSymbols = nextSymbols.length ? nextSymbols : defaultSymbols
    trackMarketPixel("ticker_search", {
      search: activeSymbols.join(","),
      keywordHint: `${activeSymbols.slice(0, 4).join(" ")} market visual analysis`,
      metadata: {symbolCount: activeSymbols.length, control: "market-scan"}
    })
    setLoading(true)
    setError("")
    setRows(activeSymbols.map(pendingRow))
    try {
      await scanSymbols(activeSymbols, (result) => {
        setRows((currentRows) => {
          const nextRows = currentRows.map((row) => row.symbol === result.symbol ? {...result, sector: sectorLabels[result.symbol] || row.sector} : row)
          return nextRows.sort((a, b) => (b.pressureScore || b.score || 0) - (a.pressureScore || a.score || 0))
        })
      })
    } catch (nextError) {
      setError(nextError.message || "Market scan failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if(started.current) return
    started.current = true
    trackMarketPixel("market_view_open", {
      search: defaultSymbols.join(","),
      keywordHint: "preloaded market print feed",
      metadata: {symbolCount: defaultSymbols.length, control: "initial-market-page-load"}
    })
    runScan(defaultSymbols)
  }, [])

  useEffect(() => {
    const title = "Current Market Video Observatory | DigitalHut Market Intelligence"
    const description = "DigitalHut Current Market connects stock and options print flow, bullish and bearish pressure, company search, source proof, 3D observatory context, and watch routes."
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = description
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = "https://www.digitalhut.app/markets"
    let script = document.getElementById("dh-market-jsonld")
    if(!script){
      script = document.createElement("script")
      script.id = "dh-market-jsonld"
      script.type = "application/ld+json"
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: title,
      description,
      url: canonical.href,
      keywords: [
        "current market video observatory",
        "stock market visual analysis 3D",
        "top volume stock video research hub",
        "options flow visual research",
        "market feed with source proof"
      ],
      creator: {
        "@type": "Organization",
        name: "DigitalHut"
      },
      isAccessibleForFree: true,
      dateModified: new Date().toISOString()
    })
  }, [])

  function reloadPressureFeed(){
    const rotated = rotateUniverse(Date.now(), 32)
    trackMarketPixel("market_view_open", {
      search: rotated.join(","),
      keywordHint: "reload pressure feed market observatory",
      metadata: {symbolCount: rotated.length, control: "reload-pressure-feed"}
    })
    setInput(rotated.join(", "))
    runScan(rotated)
  }

  return <main className="dh-trust-page dh-market-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/markets">Markets</Link>
        <Link to="/experiments">Experiments</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/asset-lab">Backend</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-market-intro">
      <span>DigitalHut Market Intelligence</span>
      <h1>Preloaded Market Print Feed</h1>
      <p>DigitalHut opens with a live preloaded watchlist across indexes, mega-cap technology, AI chips, autos, retail, banking, energy, healthcare, aerospace, streaming, and platform stocks. The main read now includes a Thursday-to-now window for stock and options prints, while 1h/3h/6h/12h remain available for short-term timing.</p>
    </section>

    <section className="dh-market-control">
      <label>
        Optional Watchlist Override
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
      </label>
      <div>
        <button type="button" onClick={() => runScan(symbols)} disabled={loading || !symbols.length}>{loading ? "Loading Live Feed" : "Refresh / Narrow Feed"}</button>
        <button type="button" onClick={reloadPressureFeed} disabled={loading}>{loading ? "Reading Pressure" : "Reload Pressure Feed"}</button>
        <small>{symbols.length} selected. Default feed preloads {defaultSymbols.length} symbols and reads prints from Thursday through now.</small>
      </div>
    </section>

    {error && <section className="dh-market-alert">{error}</section>}

    <section className="dh-market-hot-strip" aria-label="Highest pressure market prints">
      <header>
        <span>Pressure Reload</span>
        <b>Largest prints ranked by amount, Thursday-to-now context, and chart timing</b>
      </header>
      <div>
        {(hotRows.length ? hotRows : rows.slice(0, 8)).map((row) => (
          <button key={row.symbol} type="button" onClick={() => runScan([row.symbol])}>
            <strong>{row.symbol}</strong>
            <span>{money(row.stockWindow?.largestPrintAmount || row.candidate?.premium || 0)}</span>
            <em>{row.stockWindow?.technical?.timingScore ? `${row.stockWindow.technical.timingScore}/100 timing` : "queued"}</em>
          </button>
        ))}
      </div>
    </section>

    <section className="dh-market-grid">
      {(rows.length ? rows : symbols.map((symbol) => ({symbol}))).map((row) => {
        const stockPressure = row.stockWindow?.pressure || "pending"
        const optionsPressure = row.optionsWindow?.pressure || "pending"
        return <article key={row.symbol} className="dh-market-card">
          <header>
            <b>{row.symbol}</b>
            <span className={pressureClass(`${stockPressure} ${optionsPressure}`)}>{optionsPressure !== "pending" ? optionsPressure : stockPressure}</span>
          </header>
          <p className="dh-market-sector">{row.sector || sectorLabels[row.symbol] || "market watch candidate"}</p>
          <div className="dh-market-card-body">
            <section>
              <small>Stock Prints</small>
              <strong>{row.stockWindow ? money(row.stockWindow.totalNotional) : loading ? "Loading" : "Pending"}</strong>
              <span>{row.stockWindow ? `${row.stockWindow.id} / ${row.stockWindow.tradeCount.toLocaleString()} prints` : "Preloaded feed"}</span>
              <em>{row.stockWindow?.largestPrints?.[0] ? `Largest amount ${money(row.stockWindow.largestPrintAmount)} / ${row.stockWindow.largestPrintSide} / timing ${row.stockWindow.technical?.timingScore || 0}/100` : "Largest pending"}</em>
              {row.stockWindow?.technical?.chartContext && <em>{row.stockWindow.technical.chartContext}</em>}
            </section>
            <section>
              <small>Options Prints</small>
              <strong>{row.optionsWindow ? money(row.optionsWindow.totalPremium) : loading ? "Loading" : "Pending"}</strong>
              <span>{row.optionsWindow ? `${row.optionsWindow.id} / ${row.optionsWindow.printCount.toLocaleString()} prints` : "Options feed queued"}</span>
              <em>{row.candidate ? `${row.candidate.contract} ${money(row.candidate.premium)}` : "Candidate pending"}</em>
            </section>
          </div>
          <footer>
            <Link to={`/?market=${encodeURIComponent(row.symbol)}`} onClick={() => trackMarketPixel("market_view_open", {search: row.symbol, keywordHint: `${row.symbol} market observatory`, assetId: row.symbol, metadata: {control: "open-in-observatory", pressure: pressureSummary(row)}})}>Open In Observatory</Link>
            {row.candidate?.contract && <a href={`/api/options-flow?symbol=${encodeURIComponent(row.symbol)}&contract=${encodeURIComponent(row.candidate.contract)}`} target="_blank" rel="noreferrer" onClick={() => trackMarketPixel("backlink_source_open", {search: row.symbol, keywordHint: `${row.symbol} options flow source`, assetId: row.symbol, metadata: {control: "run-option-json", contract: row.candidate.contract}})}>Run Option JSON</a>}
          </footer>
        </article>
      })}
    </section>

    <section className="dh-market-disclaimer">
      Public market data does not identify individual traders. Buy/sell pressure is inferred from print direction and contract behavior. This page is market intelligence and research tooling, not financial advice.
    </section>
  </main>
}
