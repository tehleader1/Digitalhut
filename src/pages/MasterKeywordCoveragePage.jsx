import {useEffect, useMemo} from "react"
import {Link} from "react-router-dom"
import {seoSearchClaimLanes, seoSearchClaimSummary} from "../lib/seoSearchClaimEngine"
import {digitalhutMasterListBridge} from "../lib/digitalhutMasterListBridge"
import "./TrustPage.css"
import "./BlogPage.css"

const countedLanes = seoSearchClaimLanes.filter((lane) => lane.countedRankSlots !== false)
const sitemapLimit = 50000

function formatNumber(value){
  return Number(value || 0).toLocaleString()
}

function allocationFor(lane){
  const total = countedLanes.reduce((sum, item) => sum + Number(item.variationCapacity || 0), 0)
  return Math.max(1, Math.round((Number(lane.variationCapacity || 0) / total) * sitemapLimit))
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

export default function MasterKeywordCoveragePage(){
  const strongestLanes = useMemo(() => {
    return [...countedLanes].sort((a, b) => Number(b.variationCapacity || 0) - Number(a.variationCapacity || 0))
  }, [])

  useEffect(() => {
    const title = "DigitalHut Master Keyword Coverage | 50,000 URL Sitemap From 200M Longtail Map"
    const description = `DigitalHut maps ${digitalhutMasterListBridge.universe.toLocaleString()} longtail search variations into proof lanes and exposes the strongest ${digitalhutMasterListBridge.publicSitemapWindow.toLocaleString()} crawlable URLs through a dedicated sitemap tied to video, 3D Model View, podcast/source moments, live analytics, and Search Console evidence.`
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
    canonical.href = "https://www.digitalhut.app/master-keyword-coverage"
    upsertJsonLd("dh-master-keyword-coverage-jsonld", {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: title,
      description,
      url: canonical.href,
      creator: {
        "@type": "Organization",
        name: "DigitalHut"
      },
      keywords: [
        "DigitalHut 200 million longtail keywords",
        "50,000 URL sitemap",
        "video 3D Model View podcast analytics",
        "Search Console proof routes",
        "GLB entertainment observatory"
      ],
      distribution: [
        {
          "@type": "DataDownload",
          contentUrl: "https://www.digitalhut.app/sitemap-master-keyword-50000.xml",
          encodingFormat: "application/xml"
        },
        {
          "@type": "DataDownload",
          contentUrl: "https://www.digitalhut.app/digitalhut-master-keyword-coverage.json",
          encodingFormat: "application/json"
        },
        {
          "@type": "DataDownload",
          contentUrl: "https://www.digitalhut.app/digitalhut-seo-cycle-receipt-latest.json",
          encodingFormat: "application/json"
        }
      ]
    })
  }, [])

  return <main className="dh-trust-page dh-blog-page dh-master-keyword-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/system-proof">System Proof</Link>
        <Link to="/insights">Insights</Link>
        <Link to="/watch/full-view-episode-alternative">Watch Proof</Link>
        <Link to="/blog">Blog</Link>
      </nav>
    </header>

    <section className="dh-category-proof-hero">
      <span>Master Keyword Coverage</span>
      <h1>{formatNumber(seoSearchClaimSummary.totalIndividualRanks)} Longtail Variations</h1>
      <p>DigitalHut turns the 200M universe into proof lanes first, then exposes the strongest {formatNumber(sitemapLimit)} crawlable URLs through a capped sitemap. The goal is Search Console rows backed by real routes, user behavior, source opens, and useful DigitalHut functionality.</p>
      <div className="dh-watch-proof-actions">
        <Link to={digitalhutMasterListBridge.proofRoute}>Open system proof</Link>
        <Link to="/watch/full-view-episode-alternative">Open full-system watch proof</Link>
        <a href={digitalhutMasterListBridge.sourceBridgePath}>Open 200M SEO source bridge</a>
      </div>
    </section>

    <section className="dh-category-lane-radar" aria-label="DigitalHut sitemap proof files">
      <article>
        <span>Sitemap Index</span>
        <h2>Two files, inside limits</h2>
        <p>The index points to the core sitemap and the 50,000 URL master keyword sitemap.</p>
        <a href="/sitemap-index.xml">Open source sitemap index</a>
      </article>
      <article>
        <span>Master URL Push</span>
        <h2>{formatNumber(sitemapLimit)} strongest URLs</h2>
        <p>Each URL carries a rank number, lane id, and query phrase back to a DigitalHut watch proof route.</p>
        <a href="/sitemap-master-keyword-50000.xml">Open source 50,000 URL sitemap</a>
      </article>
      <article>
        <span>Coverage Receipt</span>
        <h2>JSON proof map</h2>
        <p>The receipt shows lane capacity, proof routes, sitemap allocation, and the full coverage sum.</p>
        <a href="/digitalhut-master-keyword-coverage.json">Open source coverage JSON</a>
      </article>
      <article>
        <span>Database Receipt</span>
        <h2>Supabase cycle write</h2>
        <p>The latest SEO cycle receipt records the measured traffic, Search Console state, sitemap surface, and next compare-and-contrast decision without inflating visitor metrics.</p>
        <a href="/digitalhut-seo-cycle-receipt-latest.json">Open source latest receipt</a>
      </article>
    </section>

    <section className="dh-category-proof-grid" aria-label="DigitalHut master keyword lane allocation">
      {strongestLanes.map((lane) => <article key={lane.id}>
        <span>{lane.id}</span>
        <h2>{lane.lane}</h2>
        <p>{lane.role}</p>
        <div>
          <b>{formatNumber(lane.variationCapacity)} variations</b>
          <b>{formatNumber(allocationFor(lane))} sitemap URLs</b>
          {(lane.measurementSignals || []).slice(0, 4).map((signal) => <b key={signal}>{signal}</b>)}
        </div>
        <footer>
          <Link to={lane.proofRoute}>Open proof route</Link>
          <Link to={`/category/${lane.id}`}>Open category lane</Link>
        </footer>
      </article>)}
    </section>
  </main>
}
