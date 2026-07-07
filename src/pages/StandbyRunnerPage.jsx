import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import "./TrustPage.css"
import "./InsightsPage.css"

const fallbackStatus = {
  generatedAt: "",
  mode: "DigitalHut Backend SEO Standby System",
  lastKnownMetrics: {
    pageViews: 299,
    uniqueVisitors: 107,
    searchInteractions: 2,
    autoplayStarts: 5,
    glbPreviewPlays: 83,
    podcastInterrupts: 13,
    marketOpens: 5,
    blogViews: 28
  },
  systemLoop: [
    ["FireCuda", "Stage master keyword maps, proof receipts, and local innovation history."],
    ["SEO Master List", "Turn real human searches into watch, blog, category, and source routes."],
    ["Supabase", "Capture page views, unique visitors, searches, GLB plays, podcast interrupts, autoplay, proof opens, and source opens."],
    ["Google Cloud", "Read Search Console, sitemap status, media metadata, and indexing diagnostics."],
    ["GitHub", "Preserve code structure, proof pages, sitemap, and public status artifacts."],
    ["Vercel", "Serve the public dapp, sitemap, APIs, proof pages, and status JSON."],
    ["Compare & Contrast", "Promote moving lanes, cut filler, and refine the next public push."]
  ]
}

function upsertJsonLd(id, payload){
  let script = document.getElementById(id)
  if(!script){
    script = document.createElement("script")
    script.id = id
    script.type = "application/ld+json"
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(payload)
}

export default function StandbyRunnerPage(){
  const [status, setStatus] = useState(fallbackStatus)

  useEffect(() => {
    let cancelled = false
    fetch("/digitalhut-standby-status.json", {headers: {Accept: "application/json"}})
      .then((response) => response.ok ? response.json() : fallbackStatus)
      .then((payload) => {
        if(!cancelled) setStatus({...fallbackStatus, ...payload})
      })
      .catch(() => {
        if(!cancelled) setStatus(fallbackStatus)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const title = "DigitalHut Backend SEO Standby System"
    const description = "DigitalHut standby proof page for the FireCuda, SEO Master List, Supabase, Google Cloud, GitHub, Vercel, and compare-and-contrast refinement cycle."
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = description
    upsertJsonLd("dh-standby-jsonld", {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      name: title,
      description,
      about: ["FireCuda SEO mapping", "Supabase analytics", "Google Search Console", "Vercel deployment", "DigitalHut observatory"]
    })
  }, [])

  const metrics = status.lastKnownMetrics || fallbackStatus.lastKnownMetrics
  const loop = status.systemLoop || fallbackStatus.systemLoop

  return <main className="dh-trust-page dh-insights-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/system-proof">System Proof</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/blog">Blog</Link>
      </nav>
    </header>

    <section className="dh-trust-intro">
      <span>Backend SEO Standby</span>
      <h1>DigitalHut System Loop</h1>
      <p>The standby layer keeps the mundane SEO and measurement cycle readable while higher-level engineering focuses on the observatory experience.</p>
    </section>

    <section className="dh-watch-proof-grid" aria-label="DigitalHut standby metrics">
      {[
        ["Page views", metrics.pageViews],
        ["Unique visitors", metrics.uniqueVisitors],
        ["Search interactions", metrics.searchInteractions],
        ["Autoplay starts", metrics.autoplayStarts],
        ["GLB plays", metrics.glbPreviewPlays],
        ["Podcast interrupts", metrics.podcastInterrupts],
        ["Market opens", metrics.marketOpens],
        ["Blog views", metrics.blogViews]
      ].map(([label, value]) => <article key={label}><span>{label}</span><h2>{value ?? 0}</h2></article>)}
    </section>

    <section className="dh-category-proof-grid" aria-label="DigitalHut system loop">
      {loop.map((item) => {
        const label = Array.isArray(item) ? item[0] : item.label
        const detail = Array.isArray(item) ? item[1] : item.job
        return <article key={label}><span>{label}</span><h2>{detail}</h2></article>
      })}
    </section>
  </main>
}
