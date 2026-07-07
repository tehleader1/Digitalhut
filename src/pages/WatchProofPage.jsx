import {useEffect, useMemo} from "react"
import {Link, useParams} from "react-router-dom"
import {seoBlogPosts} from "../lib/seoContentEngine"
import "./TrustPage.css"
import "./BlogPage.css"

function slugify(value = ""){
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "digitalhut"
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

export default function WatchProofPage(){
  const {slug} = useParams()
  const post = useMemo(() => seoBlogPosts.find((item) => item.slug === slug) || seoBlogPosts[0], [slug])
  const keywords = post.keywords || []
  const categorySlug = slugify(post.category)
  const canonicalPath = `/watch/${post.slug || slug || "full-view-episode-alternative"}`

  useEffect(() => {
    const title = `${post.title} | DigitalHut Watch Proof`
    const description = `${post.description || post.summary || post.title} DigitalHut connects the episode to video watching, 3D Model View, podcast/source moments, live analytics, proof routes, and source/backlink signals.`
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
    canonical.href = `https://www.digitalhut.app${canonicalPath}`
    upsertJsonLd("dh-watch-proof-jsonld", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonical.href,
      keywords: keywords.join(", "),
      about: ["video watching", "3D Model View", "podcast/source moments", "live analytics", "DigitalHut observatory"]
    })
  }, [canonicalPath, keywords, post])

  return <main className="dh-trust-page dh-blog-page dh-watch-proof-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/system-proof">System Proof</Link>
        <Link to={`/category/${categorySlug}`}>Category Proof</Link>
        <Link to="/blog">Blog</Link>
      </nav>
    </header>

    <section className="dh-watch-proof-hero">
      <div>
        <span>{post.category || "DigitalHut"}</span>
        <h1>{post.title}</h1>
        <p>{post.description || post.summary}</p>
        <div className="dh-watch-proof-actions">
          <Link to={`/?category=${encodeURIComponent(post.category || "Mainstream Streaming")}&episode=${encodeURIComponent(keywords[0] || post.title)}`}>Open live observatory</Link>
          <Link to={`/blog/${post.slug}`}>Read proof article</Link>
          <Link to="/system-proof">System proof</Link>
        </div>
      </div>
      <img src="/seo-thumbnails/automatic-3d-autoplay-system.svg" alt={`${post.title} DigitalHut watch proof`} loading="eager" decoding="async" />
    </section>

    <section className="dh-watch-proof-grid" aria-label="DigitalHut watch proof system">
      <article><span>Full System Anchor</span><h2>Video + 3D Model View + Podcast + Live Analytics</h2><p>This route proves the complete DigitalHut experience instead of ranking a thin keyword page.</p></article>
      <article><span>Keyword Stack</span><h2>{keywords[0] || post.title}</h2><div>{keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}</div></article>
      <article><span>Behavior Signals</span><h2>Rows need people and Google impressions</h2><p>The route is built to capture page views, autoplay starts, GLB plays, podcast/source moments, proof opens, and source/backlink opens.</p></article>
      <article><span>Search Console Goal</span><h2>Indexed HTML first</h2><p>Once Google indexes this page and serves it in search, it can produce query/page rows with impressions, clicks, and average position.</p></article>
    </section>
  </main>
}
