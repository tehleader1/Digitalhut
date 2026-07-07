import {useEffect, useMemo} from "react"
import {Link, useParams} from "react-router-dom"
import {seoBlogPosts} from "../lib/seoContentEngine"
import "./TrustPage.css"
import "./BlogPage.css"

function slugify(value = ""){
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "digitalhut"
}

function labelFromSlug(value = ""){
  return String(value || "digitalhut").split("-").filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
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

export default function CategoryProofPage(){
  const {slug} = useParams()
  const categoryName = labelFromSlug(slug)
  const activePosts = useMemo(() => {
    const matches = seoBlogPosts.filter((post) => slugify(post.category) === slug)
    return matches.length ? matches : seoBlogPosts.slice(0, 8)
  }, [slug])
  const keywords = Array.from(new Set(activePosts.flatMap((post) => post.keywords || []))).slice(0, 18)

  useEffect(() => {
    const title = `${categoryName} | DigitalHut Category Proof Lane`
    const description = `${categoryName} category proof for DigitalHut: video watching, 3D Model View, podcast/source moments, live analytics, GLB renderer proof, and longtail search routes.`
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
    canonical.href = `https://www.digitalhut.app/category/${slug || "mainstream-streaming"}`
    upsertJsonLd("dh-category-proof-jsonld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: canonical.href,
      keywords: keywords.join(", "),
      about: ["DigitalHut category lane", "longtail search routes", "3D Model View", "podcast/source moments", "live analytics"],
      mainEntity: {
        "@type": "ItemList",
        itemListElement: activePosts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: post.title,
          url: `https://www.digitalhut.app/watch/${post.slug}`
        }))
      }
    })
  }, [activePosts, categoryName, keywords, slug])

  return <main className="dh-trust-page dh-blog-page dh-category-proof-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/system-proof">System Proof</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/insights">Insights</Link>
      </nav>
    </header>

    <section className="dh-category-proof-hero">
      <span>Category Proof Lane</span>
      <h1>{categoryName}</h1>
      <p>This lane casts the DigitalHut master keyword list into crawlable proof pages: watch routes, blog routes, source paths, GLB model context, podcast/source moments, and live analytics behavior.</p>
    </section>

    <section className="dh-category-lane-radar" aria-label={`${categoryName} longtail proof map`}>
      <article><span>Full System Angle</span><h2>Entertainment observatory, not a plain article</h2><p>Every category ties back to video watching, 3D Model View, podcast/source moments, and live analytics in one dapp interface.</p></article>
      <article><span>Keyword Cast</span><h2>{keywords[0] || categoryName}</h2><div>{keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}</div></article>
      <article><span>Search Console Goal</span><h2>Produce query/page rows</h2><p>This category groups related watch and blog routes so Google has a clean lane to crawl and test in search.</p></article>
    </section>

    <section className="dh-category-proof-grid" aria-label={`${categoryName} DigitalHut proof posts`}>
      {activePosts.map((post) => <article key={post.slug}>
        <span>{post.category}</span>
        <h2>{post.title}</h2>
        <p>{post.description || post.summary}</p>
        <footer>
          <Link to={`/watch/${post.slug}`}>Watch proof</Link>
          <Link to={`/blog/${post.slug}`}>Article</Link>
        </footer>
      </article>)}
    </section>
  </main>
}
