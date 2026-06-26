import {useMemo, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./MarketPage.css"

const defaultSymbols = ["SPY", "QQQ", "AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "META", "LOW", "F", "AMD", "IWM"]

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
  return {
    symbol,
    stockPayload,
    optionsPayload,
    stockWindow,
    optionsWindow,
    candidate,
    score: Number(stockWindow?.totalNotional || 0) + Number(optionsWindow?.totalPremium || 0)
  }
}

export default function MarketPage(){
  const [input, setInput] = useState(defaultSymbols.join(", "))
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const symbols = useMemo(() => parseSymbols(input), [input])

  async function runScan(){
    setLoading(true)
    setError("")
    try {
      const results = await Promise.all(symbols.map((symbol) => scanSymbol(symbol)))
      setRows(results.sort((a, b) => b.score - a.score))
    } catch (nextError) {
      setError(nextError.message || "Market scan failed")
    } finally {
      setLoading(false)
    }
  }

  return <main className="dh-trust-page dh-market-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/markets">Markets</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/asset-lab">Backend</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-market-intro">
      <span>DigitalHut Market Intelligence</span>
      <h1>General Market Print Feed</h1>
      <p>Scan NYSE, Nasdaq, S&amp;P 500, ETF, and high-interest ticker symbols together. DigitalHut ranks stock prints, options premium prints, inferred bullish or bearish pressure, and the option candidate worth saying “there it is” on.</p>
    </section>

    <section className="dh-market-control">
      <label>
        Watchlist
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
      </label>
      <div>
        <button type="button" onClick={runScan} disabled={loading || !symbols.length}>{loading ? "Scanning" : "Scan Market Prints"}</button>
        <small>{symbols.length} symbols. Default scan covers major indexes, mega-cap tech, LOW, F, and AMD.</small>
      </div>
    </section>

    {error && <section className="dh-market-alert">{error}</section>}

    <section className="dh-market-grid">
      {(rows.length ? rows : symbols.map((symbol) => ({symbol}))).map((row) => {
        const stockPressure = row.stockWindow?.pressure || "pending"
        const optionsPressure = row.optionsWindow?.pressure || "pending"
        return <article key={row.symbol} className="dh-market-card">
          <header>
            <b>{row.symbol}</b>
            <span className={pressureClass(`${stockPressure} ${optionsPressure}`)}>{optionsPressure !== "pending" ? optionsPressure : stockPressure}</span>
          </header>
          <div className="dh-market-card-body">
            <section>
              <small>Stock Prints</small>
              <strong>{row.stockWindow ? money(row.stockWindow.totalNotional) : "Not scanned"}</strong>
              <span>{row.stockWindow ? `${row.stockWindow.id} / ${row.stockWindow.tradeCount.toLocaleString()} prints` : "Run scan"}</span>
              <em>{row.stockWindow?.largestPrints?.[0] ? `Largest ${row.stockWindow.largestPrints[0].size.toLocaleString()} @ $${row.stockWindow.largestPrints[0].price}` : "Largest pending"}</em>
            </section>
            <section>
              <small>Options Prints</small>
              <strong>{row.optionsWindow ? money(row.optionsWindow.totalPremium) : "Not scanned"}</strong>
              <span>{row.optionsWindow ? `${row.optionsWindow.id} / ${row.optionsWindow.printCount.toLocaleString()} prints` : "Run scan"}</span>
              <em>{row.candidate ? `${row.candidate.contract} ${money(row.candidate.premium)}` : "Candidate pending"}</em>
            </section>
          </div>
          <footer>
            <Link to={`/?market=${encodeURIComponent(row.symbol)}`}>Open In Observatory</Link>
            {row.candidate?.contract && <a href={`/api/options-flow?symbol=${encodeURIComponent(row.symbol)}&contract=${encodeURIComponent(row.candidate.contract)}`} target="_blank" rel="noreferrer">Run Option JSON</a>}
          </footer>
        </article>
      })}
    </section>

    <section className="dh-market-disclaimer">
      Public market data does not identify individual traders. Buy/sell pressure is inferred from print direction and contract behavior. This page is market intelligence and research tooling, not financial advice.
    </section>
  </main>
}
