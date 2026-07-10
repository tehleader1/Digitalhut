import {useEffect} from "react"
import {Link, useLocation} from "react-router-dom"
import {digitalhutMasterListBridge} from "../lib/digitalhutMasterListBridge"
import "./TrustPage.css"
import "./BlogPage.css"

const bridgeSteps = [
  ["Door", "A visitor enters through a route, category, search phrase, or keyword URL connected to the 200M master list."],
  ["Use", "The system looks for a real second action: GLB, podcast, autoplay, search, market, proof, or source."],
  ["Proof", "The visitor can open a watch, blog, category, or system proof page tied to the same intent."],
  ["Source", "The visitor can open the source bridge so DigitalHut records a source-backed continuation, not just a passive page view."]
]

const weakAreas = [
  ["Proof route opens", "Traffic and GLB behavior exist, but proof opens are still 0. The route must make proof feel like the natural next useful action."],
  ["Source/backlink opens", "The old source bridge was mostly JSON. This page turns it into a readable source lane for humans while preserving machine evidence."],
  ["Unassigned homepage pockets", "New homepage entries now carry a master-list trail so future reads stop drifting into unassigned intent."],
  ["Comparable-system clarity", "DigitalHut competes as a full entertainment observatory, not as only a video site, only a GLB viewer, or only a podcast tool."]
]

const stackSignals = [
  "video watching/session flow",
  "3D Model View and GLB interaction",
  "podcast/source moment",
  "live analytics",
  "search and category routing",
  "Supabase behavior telemetry",
  "Google Search Console rows",
  "Vercel production sitemap",
  "FireCuda keyword mapping",
  "Codex compare-and-contrast oversight"
]

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

export default function SourceBridgePage(){
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const lane = params.get("lane") || digitalhutMasterListBridge.lane
  const proof = params.get("proof") || "whole-system"
  const source = params.get("source") || "source-bridge"

  useEffect(() => {
    const title = "DigitalHut Source Bridge | 200M SEO Master List Proof Path"
    const description = "DigitalHut source bridge explains how door events from the 200M SEO Master List convert into proof routes, source opens, GLB, podcast, autoplay, search, and Search Console evidence."
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
    canonical.href = "https://www.digitalhut.app/source-bridge"
    upsertJsonLd("dh-source-bridge-jsonld", {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: title,
      description,
      url: canonical.href,
      about: digitalhutMasterListBridge.lane,
      mainEntity: {
        "@type": "ItemList",
        name: "DigitalHut source conversion sequence",
        itemListElement: bridgeSteps.map(([name, detail], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          description: detail
        }))
      }
    })
  }, [])

  return <main className="dh-trust-page dh-blog-page dh-watch-proof-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/system-proof">System Proof</Link>
        <Link to="/master-keyword-coverage">Keyword Map</Link>
        <Link to="/watch/full-view-episode-alternative">Watch Proof</Link>
        <Link to="/insights">Insights</Link>
      </nav>
    </header>

    <section className="dh-watch-proof-hero">
      <div>
        <span>Source Bridge</span>
        <h1>Where Door Events Become Proof And Source Actions</h1>
        <p>DigitalHut is reading the {digitalhutMasterListBridge.universe.toLocaleString()} longtail universe as one measurable entertainment dapp system. This bridge explains how a doorway becomes a useful proof/source trail instead of a passive visit.</p>
        <div className="dh-watch-proof-actions">
          <Link to={digitalhutMasterListBridge.proofRoute}>Open system proof</Link>
          <Link to={digitalhutMasterListBridge.keywordCoverageRoute}>Open master keyword map</Link>
          <a href={digitalhutMasterListBridge.sourceBridgeJsonPath}>Open raw JSON bridge</a>
        </div>
      </div>
      <img src="/seo-thumbnails/mainstream-3d-feed.svg" alt="DigitalHut source bridge for proof route, source trail, 3D Model View, podcast, and live analytics" loading="eager" decoding="async" />
    </section>

    <section className="dh-watch-proof-grid" aria-label="DigitalHut active source bridge context">
      <article>
        <span>Active Lane</span>
        <h2>{lane}</h2>
        <p>This source bridge keeps the visitor inside the full DigitalHut proof system instead of splitting the signal into disconnected category wins.</p>
        <div>
          <b>{proof}</b>
          <b>{source}</b>
          <b>{digitalhutMasterListBridge.publicSitemapWindow.toLocaleString()} sitemap rows</b>
        </div>
      </article>
      <article>
        <span>Measurable Facet</span>
        <h2>{digitalhutMasterListBridge.lane}</h2>
        <p>Categories, watch pages, blog pages, GLB moments, podcast moments, and market reads are sub-signals inside the same master-list proof path.</p>
      </article>
      <article>
        <span>Conversion Target</span>
        <h2>Door Event To Proof/Source</h2>
        <p>The next win is not more passive page views. The next win is a visitor opening proof or source after seeing the full-system observatory value.</p>
      </article>
      <article>
        <span>Search Truth</span>
        <h2>Rows Before Rank Claims</h2>
        <p>Search Console ranking movement becomes real when query rows, impressions, clicks, indexed routes, and user behavior agree.</p>
      </article>
    </section>

    <section className="dh-category-proof-grid" aria-label="DigitalHut source bridge steps">
      {bridgeSteps.map(([name, detail]) => <article key={name}>
        <span>{name}</span>
        <h2>{detail}</h2>
      </article>)}
    </section>

    <section className="dh-watch-usefulness-radar" aria-label="DigitalHut natural competition weak areas">
      {weakAreas.map(([name, detail]) => <article key={name}>
        <span>{name}</span>
        <h2>{detail}</h2>
      </article>)}
    </section>

    <section className="dh-category-lane-radar" aria-label="DigitalHut whole stack source signals">
      {stackSignals.map((signal) => <article key={signal}>
        <span>Stack Signal</span>
        <h2>{signal}</h2>
      </article>)}
    </section>
  </main>
}
