import {useEffect, useMemo, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./InsightsPage.css"

function readLocalJson(key, fallback){
  if(typeof window === "undefined") return fallback
  try {
    return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback))
  } catch {
    return fallback
  }
}

function summarizeLocalSignals(){
  const reviews = readLocalJson("digitalhut:assetReviews", {})
  const reviewItems = Object.values(reviews)
  const livePosts = readLocalJson("digitalhut:livePosts", [])
  const assetLab = readLocalJson("digitalhut:assetLab", [])
  const nodeFeeds = readLocalJson("digitalhut:nodeApiFeeds", [])
  const paymentEntitlement = readLocalJson("digitalhut:paymentEntitlement", null)
  const pendingPurchase = readLocalJson("digitalhut:pendingPurchase", null)
  const backlinks = reviewItems.map((item) => item.backlink).filter(Boolean)
  const ratingSum = reviewItems.reduce((sum, item) => sum + Number(item.rating || 0), 0)
  const reviewTextCount = reviewItems.filter((item) => item.review).length
  return {
    reviews: reviewItems.length,
    reviewTextCount,
    averageRating: reviewItems.length ? Number((ratingSum / reviewItems.length).toFixed(2)) : 0,
    backlinks: new Set(backlinks).size,
    livePosts: livePosts.length,
    savedAssets: assetLab.length,
    nodeApiFeeds: nodeFeeds.length,
    paymentStatus: paymentEntitlement?.status || (pendingPurchase ? "prepared" : "not-started"),
    recentReviews: reviewItems.slice(-5).reverse()
  }
}

const fallbackInsightMap = {
  generatedAt: new Date().toISOString(),
  status: {
    app: "DigitalHut 2026 3D renderer observatory AI system",
    deployment: "local-fallback",
    rendererMode: "browser-fallback",
    firecuda: "not verified by API",
    supabase: "not verified by API",
    sketchfab: "not verified by API",
    payments: "not verified by API"
  },
  stack: {
    configuredCount: 0,
    totalProviders: 11,
    liveScore: 0,
    providers: [
      {id: "vercel", role: "deployment-runtime", configured: false, configuredKeys: []},
      {id: "supabase", role: "asset-storage-database", configured: false, configuredKeys: []},
      {id: "firecuda-storage", role: "verified-glb-storage", configured: false, configuredKeys: []},
      {id: "sketchfab", role: "3d-model-search", configured: false, configuredKeys: []},
      {id: "cesium", role: "maps-terrain-3d", configured: false, configuredKeys: []},
      {id: "alchemy", role: "chain-rpc-verification", configured: false, configuredKeys: []},
      {id: "reown", role: "wallet-connect", configured: false, configuredKeys: []},
      {id: "alpha-vantage", role: "market-statistics", configured: false, configuredKeys: []},
      {id: "fmp", role: "market-statistics", configured: false, configuredKeys: []},
      {id: "polygon", role: "market-statistics", configured: false, configuredKeys: []},
      {id: "alpaca", role: "market-statistics", configured: false, configuredKeys: []}
    ]
  },
  runnerDiscoveries: [
    {
      id: "insight-api-missing",
      title: "Insight API Not Serving JSON",
      status: "needs deploy",
      detail: "The browser received HTML instead of JSON from /api/insight-map. Push api/insight-map.js and redeploy to activate live stack checks."
    },
    {
      id: "browser-local-signals",
      title: "Browser Local Signals Still Available",
      status: "active",
      detail: "Ratings, saved reviews, backlinks, node feed counts, payment staging, and local browser history can still render from localStorage."
    }
  ],
  seoOpportunities: [
    "2026 3D renderer observatory AI system",
    "automatic GLB autoplay presentation",
    "DigitalHut insight map",
    "3D observatory SEO dashboard",
    "GLB ratings reviews backlinks"
  ],
  scorecard: {
    stackPower: 0,
    rendererPower: 35,
    seoPower: 45,
    communityPower: 0,
    paymentPower: 0
  },
  nextMeasurements: [
    "deploy api/insight-map.js",
    "verify Supabase environment variables",
    "verify Reown and Alchemy environment variables",
    "record GLB render-complete events"
  ]
}

export default function InsightsPage(){
  const [insight, setInsight] = useState(null)
  const [error, setError] = useState("")
  const [localNonce, setLocalNonce] = useState(0)
  const localSignals = useMemo(() => summarizeLocalSignals(), [localNonce])

  useEffect(() => {
    let cancelled = false
    fetch("/api/insight-map")
      .then(async (response) => {
        const text = await response.text()
        const contentType = response.headers.get("content-type") || ""
        if(!response.ok || !contentType.includes("application/json") || text.trim().startsWith("<")){
          throw new Error("Insight API is not deployed yet; showing local/browser signals.")
        }
        return JSON.parse(text)
      })
      .then((payload) => {
        if(!cancelled) setInsight(payload)
      })
      .catch((nextError) => {
        if(!cancelled){
          setInsight(fallbackInsightMap)
          setError(nextError.message || "Unable to load insight map")
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const scorecard = insight?.scorecard || {}
  const stack = insight?.stack || {providers: []}
  const status = insight?.status || {}
  const pixel = insight?.pixel || {}

  return <main className="dh-trust-page dh-insights-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/insights">Insights</Link>
        <Link to="/markets">Markets</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/daily-situations">Daily Situations</Link>
        <Link to="/asset-lab">Backend</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-insights-intro">
      <span>DigitalHut Insight Map</span>
      <h1>Measure The 2026 3D Renderer Observatory AI System</h1>
      <p>This dashboard separates live stack power from local community signals. It measures providers, renderer mode, FireCuda status, Supabase readiness, API discovery, ratings, backlinks, saved assets, node feeds, and payment staging.</p>
    </section>

    {error && <section className="dh-insight-alert">Insight map error: {error}</section>}

    <section className="dh-insight-pixel">
      <div>
        <span>Search Pixel</span>
        <h2>Total Page Views And Live Activity</h2>
        <p>{pixel.ready ? "DigitalHut first-party pixel is recording real behavior from blogs, renderer actions, searches, wallet clicks, tiers, and node interest." : `Pixel summary waiting: ${pixel.reason || "loading"}`}</p>
      </div>
      <div className="dh-insight-pixel-grid">
        {[
          ["Total events", pixel.totalEvents ?? 0],
          ["Page views", pixel.totalPageViews ?? 0],
          ["Unique visitors", pixel.uniqueVisitors ?? 0],
          ["Blog views", pixel.totalBlogViews ?? 0],
          ["GLB plays", pixel.totalGlbPreviewPlays ?? 0],
          ["Thumbnail renders", pixel.totalThumbnailRenderClicks ?? 0],
          ["Searches", pixel.totalSearchRuns ?? 0],
          ["Wallet clicks", pixel.totalWalletClicks ?? 0],
          ["Tier clicks", pixel.totalTierClicks ?? 0],
          ["Node clicks", pixel.totalNodeClicks ?? 0]
        ].map(([label, value]) => <article key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </article>)}
      </div>
    </section>

    <section className="dh-insight-pixel-lists">
      <article>
        <h2>48 Hour Activity</h2>
        {(pixel.last48Hours || []).length ? (pixel.last48Hours || []).map((item) => <div className="dh-insight-kv" key={item.eventName}>
          <span>{item.eventName}</span><b>{item.count}</b>
        </div>) : <p>No 48-hour events yet.</p>}
      </article>
      <article>
        <h2>Top Pages</h2>
        {(pixel.topPages || []).length ? (pixel.topPages || []).map((item) => <div className="dh-insight-kv" key={item.value}>
          <span>{item.value}</span><b>{item.count}</b>
        </div>) : <p>No page views yet.</p>}
      </article>
      <article>
        <h2>Top Blogs</h2>
        {(pixel.topBlogs || []).length ? (pixel.topBlogs || []).map((item) => <div className="dh-insight-kv" key={item.value}>
          <span>{item.value}</span><b>{item.count}</b>
        </div>) : <p>No blog activity yet.</p>}
      </article>
      <article>
        <h2>Keyword Hints</h2>
        {(pixel.topKeywordHints || []).length ? (pixel.topKeywordHints || []).map((item) => <div className="dh-insight-kv" key={item.value}>
          <span>{item.value}</span><b>{item.count}</b>
        </div>) : <p>No keyword hints yet.</p>}
      </article>
      <article>
        <h2>Render Categories</h2>
        {(pixel.topRenderCategories || []).length ? (pixel.topRenderCategories || []).map((item) => <div className="dh-insight-kv" key={item.value}>
          <span>{item.value}</span><b>{item.count}</b>
        </div>) : <p>No thumbnail-to-render category data yet.</p>}
      </article>
      <article>
        <h2>Render Assets</h2>
        {(pixel.topRenderAssets || []).length ? (pixel.topRenderAssets || []).map((item) => <div className="dh-insight-kv" key={item.value}>
          <span>{item.value}</span><b>{item.count}</b>
        </div>) : <p>No thumbnail-to-render asset data yet.</p>}
      </article>
    </section>

    <section className="dh-insight-scoregrid">
      {[
        ["Stack Power", scorecard.stackPower ?? 0, "Vercel, Supabase, APIs, Reown, Alchemy, and provider visibility."],
        ["Renderer Power", scorecard.rendererPower ?? 0, "GLB renderer, FireCuda mode, API-first feed mode, and environment source readiness."],
        ["SEO Power", scorecard.seoPower ?? 0, "Blog surfaces, keyword lanes, sitemap, backlinks, comments, ratings, and upload loops."],
        ["Community Power", Math.max(scorecard.communityPower ?? 0, Math.min(100, localSignals.reviews * 12 + localSignals.backlinks * 8)), "Browser-local ratings, reviews, backlinks, saved assets, and live posts."],
        ["Payment Power", scorecard.paymentPower ?? 0, "Reown wallet connect, Alchemy receipt checks, Base checkout, and Supabase entitlement path."]
      ].map(([label, value, detail]) => <article key={label}>
        <span>{label}</span>
        <b>{value}%</b>
        <meter min="0" max="100" value={value} />
        <p>{detail}</p>
      </article>)}
    </section>

    <section className="dh-insight-panels">
      <article>
        <h2>Live Stack Status</h2>
        <div className="dh-insight-kv"><span>Mode</span><b>{status.rendererMode || "loading"}</b></div>
        <div className="dh-insight-kv"><span>FireCuda</span><b>{status.firecuda || "loading"}</b></div>
        <div className="dh-insight-kv"><span>Supabase</span><b>{status.supabase || "loading"}</b></div>
        <div className="dh-insight-kv"><span>Sketchfab</span><b>{status.sketchfab || "loading"}</b></div>
        <div className="dh-insight-kv"><span>Payments</span><b>{status.payments || "loading"}</b></div>
      </article>

      <article>
        <h2>Ratings And Backlinks</h2>
        <div className="dh-insight-kv"><span>Total ratings</span><b>{localSignals.reviews}</b></div>
        <div className="dh-insight-kv"><span>Written reviews</span><b>{localSignals.reviewTextCount}</b></div>
        <div className="dh-insight-kv"><span>Average rating</span><b>{localSignals.averageRating}/5</b></div>
        <div className="dh-insight-kv"><span>Generated backlinks</span><b>{localSignals.backlinks}</b></div>
        <button type="button" onClick={() => setLocalNonce((value) => value + 1)}>Refresh Local Signals</button>
      </article>

      <article>
        <h2>Library And Feed Signals</h2>
        <div className="dh-insight-kv"><span>Saved GLB assets</span><b>{localSignals.savedAssets}</b></div>
        <div className="dh-insight-kv"><span>Live posts</span><b>{localSignals.livePosts}</b></div>
        <div className="dh-insight-kv"><span>Node API feeds</span><b>{localSignals.nodeApiFeeds}</b></div>
        <div className="dh-insight-kv"><span>Payment status</span><b>{localSignals.paymentStatus}</b></div>
      </article>
    </section>

    <section className="dh-insight-wide">
      <article>
        <h2>Runner Discoveries</h2>
        {(insight?.runnerDiscoveries || []).map((item) => <section key={item.id}>
          <span>{item.status}</span>
          <b>{item.title}</b>
          <p>{item.detail}</p>
        </section>)}
      </article>
      <article>
        <h2>SEO Opportunities</h2>
        <ul>
          {(insight?.seoOpportunities || []).map((item) => <li key={item}>{item}</li>)}
        </ul>
      </article>
    </section>

    <section className="dh-insight-provider-grid">
      {(stack.providers || []).map((provider) => <article key={provider.id} className={provider.configured ? "ready" : "missing"}>
        <span>{provider.role}</span>
        <b>{provider.id}</b>
        <p>{provider.configured ? `Configured: ${provider.configuredKeys.join(", ")}` : "Not visible to this runtime yet."}</p>
      </article>)}
    </section>

    <section className="dh-insight-actions">
      <Link to="/">Open Observatory</Link>
      <Link to="/markets">Open Markets</Link>
      <Link to="/blog">Open SEO Blog</Link>
      <Link to="/asset-lab">Open Backend</Link>
    </section>
  </main>
}
