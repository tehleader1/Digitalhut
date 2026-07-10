import {useEffect, useMemo, useState} from "react"
import {Link, useParams} from "react-router-dom"
import {seoBlogPosts, seoKeywordClusters, seoLaunchTargetsForPost, seoMetadataForProof, seoPlatformCadenceProof, seoRunnerProofPosts, seoSearchIntentRadarProof, seoTrendSignals} from "../lib/seoContentEngine"
import {digitalhutMasterListBridge, digitalhutSourceBridgePath} from "../lib/digitalhutMasterListBridge"
import "./TrustPage.css"
import "./BlogPage.css"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const blogThumbnailBySlug = {
  "automatic-3d-autoplay-system": "/seo-thumbnails/automatic-3d-autoplay-system.svg",
  "3d-imagery-helping-research-communities": "/seo-thumbnails/researcher-3d-imagery.svg",
  "mainstream-feed-to-3d-assets": "/seo-thumbnails/mainstream-3d-feed.svg",
  "planetary-views-and-orbital-compute": "/seo-thumbnails/planetary-orbital-compute.svg",
  "gamer-programmer-renderer-hubs": "/seo-thumbnails/gamer-programmer-renderer.svg"
}
const categoryThumbnailMap = [
  ["planet", "/seo-thumbnails/planetary-orbital-compute.svg"],
  ["orbital", "/seo-thumbnails/planetary-orbital-compute.svg"],
  ["research", "/seo-thumbnails/researcher-3d-imagery.svg"],
  ["science", "/seo-thumbnails/researcher-3d-imagery.svg"],
  ["gamer", "/seo-thumbnails/gamer-programmer-renderer.svg"],
  ["programmer", "/seo-thumbnails/gamer-programmer-renderer.svg"],
  ["mainstream", "/seo-thumbnails/mainstream-3d-feed.svg"]
]

function thumbnailForPost(post){
  const slug = post?.slug || ""
  if(blogThumbnailBySlug[slug]) return blogThumbnailBySlug[slug]
  const category = String(post?.category || "").toLowerCase()
  return categoryThumbnailMap.find(([key]) => category.includes(key))?.[1] || blogThumbnailBySlug["automatic-3d-autoplay-system"]
}

function altForPost(post){
  const keyword = post?.primary_keyword || post?.keywords?.[0] || post?.seo_keywords?.[0] || "3D observatory"
  return `${post?.title || "DigitalHut report"} thumbnail for ${keyword} and real 3D render preview`
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

function mergePosts(...groups){
  const seen = new Set()
  return groups.flat().filter((post) => {
    const slug = post?.slug || post?.id
    if(!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  })
}

function BlogCard({post, runner = false}){
  const slug = post.slug || post.id
  const keywords = post.keywords || post.seo_keywords || []
  const description = post.description || post.summary || ""
  const category = post.category || "DigitalHut Report"
  return <article id={slug}>
    <Link
      className="dh-blog-thumb-link"
      to={`/blog/${slug}`}
      aria-label={`Open ${post.title} report and 3D render preview`}
      data-dh-thumbnail-render={runner ? "system-blog-thumbnail-to-report" : "blog-thumbnail-to-report"}
      data-dh-category={category}
      data-dh-asset-id={slug}
    >
      <img
        src={thumbnailForPost(post)}
        alt={altForPost(post)}
        loading="lazy"
        decoding="async"
      />
    </Link>
    <span>{category}</span>
    <h2>{post.title}</h2>
    <p>{description}</p>
    <div>{keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
    <Link
      to={`/blog/${slug}`}
      data-dh-thumbnail-render={runner ? "system-blog-read-report-to-render" : "blog-read-report-to-render"}
      data-dh-category={category}
      data-dh-asset-id={slug}
    >
      Read report
    </Link>
  </article>
}

function ProofDetail({post}){
  const keywords = post.keywords || post.seo_keywords || []
  const launch = seoLaunchTargetsForPost(post)
  const proofFocus = post.proofFocus || post.heroProof || "video radar, GLB proof, source evidence, timeline, and backlink route"
  const watchPageRoute = post.watchPageRoute || `/watch/${post.slug || post.id}`
  const displayProof = post.displayProof || [
        "Current episode title and selected category lane",
        "Platform cadence rail showing queue, proof, timing, analyzer, and market state",
        "Search intent radar showing proof keyword, long-tail phrase, video topic, GLB source phrase, and market branch",
        "GLB proof dock with expanded 3D Model View",
    "Bubble map showing source evidence and backlink value",
    "Timeline showing key finds without duplicate filler metrics",
    "Podcast/source moment when the episode needs extra context",
    "Clear internal link back to the watch page and category lane"
  ]
  const placementPitch = post.longTailPlacementPitch || `Pitch this as a useful visual proof page for people searching ${keywords[0] || post.title}, not as generic AI content.`
  return <section className="dh-blog-proof-detail">
    <Link className="dh-blog-backlink" to="/blog">Back to proof stack</Link>
    <div className="dh-blog-proof-hero">
      <div>
        <span>{post.featuredSlot || "DigitalHut proof page"}</span>
        <h1>{post.title}</h1>
        <p>{post.description || post.summary}</p>
      </div>
      <img src={thumbnailForPost(post)} alt={altForPost(post)} loading="eager" decoding="async" />
    </div>
    <div className="dh-blog-proof-actions">
      <Link to={watchPageRoute}>Open watch proof</Link>
      <Link to={`/category/${String(post.category || "digitalhut").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>Open category lane</Link>
      <a href={digitalhutSourceBridgePath({proof: post.slug || post.id || "blog-proof", source: "blog-proof-detail"})}>Open source bridge</a>
    </div>
    <div className="dh-blog-proof-body">
      <article>
        <span>Proof Focus</span>
        <h2>{proofFocus}</h2>
        <p>{placementPitch}</p>
      </article>
      <article>
        <span>Keyword Lane</span>
        <h2>{keywords[0] || post.title}</h2>
        <div>{keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
      </article>
      {launch && <article>
        <span>Launch Ranking Targets</span>
        <h2>{launch.lane}</h2>
        <p>{launch.proofAngle}</p>
        <div>{launch.targets.map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
      </article>}
      <article>
        <span>Display Proof</span>
        <h2>What The Page Must Show</h2>
        <ul>{displayProof.map((item) => <li key={item}>{item}</li>)}</ul>
      </article>
      <article>
        <span>{seoPlatformCadenceProof.label}</span>
        <h2>{seoPlatformCadenceProof.headline}</h2>
        <p>{seoPlatformCadenceProof.searchIntent}</p>
        <div>{seoPlatformCadenceProof.longTailKeywords.slice(0, 4).map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
      </article>
      <article>
        <span>{seoSearchIntentRadarProof.label}</span>
        <h2>{seoSearchIntentRadarProof.headline}</h2>
        <p>{seoSearchIntentRadarProof.searchIntent}</p>
        <div>{seoSearchIntentRadarProof.longTailKeywords.slice(0, 4).map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
      </article>
      <article>
        <span>No Filler Rule</span>
        <h2>Useful Observatory Content Only</h2>
        <p>{post.noFillerRule || "Visible text must explain the current episode, source value, GLB proof, backlink route, or podcast/sponsor moment."}</p>
      </article>
    </div>
  </section>
}

export default function BlogPage(){
  const {slug} = useParams()
  const [runnerPosts, setRunnerPosts] = useState([])
  const allPosts = useMemo(() => mergePosts(runnerPosts, seoRunnerProofPosts, seoBlogPosts), [runnerPosts])
  const selectedPost = slug ? allPosts.find((post) => (post.slug || post.id) === slug) : null

  useEffect(() => {
    if(!supabaseUrl || !supabaseAnonKey) return
    let cancelled = false
    const url = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/digitalhut_blog_drafts?status=eq.published&select=id,title,slug,category,primary_keyword,seo_keywords,summary,evidence,created_at&order=created_at.desc&limit=12`
    fetch(url, {
      headers: {
        apikey: supabaseAnonKey,
        authorization: `Bearer ${supabaseAnonKey}`
      }
    })
      .then((response) => response.ok ? response.json() : [])
      .then((posts) => {
        if(!cancelled && Array.isArray(posts)) setRunnerPosts(posts)
      })
      .catch(() => {
        if(!cancelled) setRunnerPosts([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const metadata = selectedPost ? seoMetadataForProof(selectedPost, "blog") : null
    const title = selectedPost
      ? metadata.title
      : "DigitalHut 3D Observatory Blog And FireCuda Proof Stack"
    const description = selectedPost
      ? metadata.description
      : "DigitalHut publishes FireCuda-ranked long-tail proof pages for GLB rendering, 3D visual search, research, video analytics, source links, and observatory watch pages."
    document.title = title
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = description
    let keywordMeta = document.querySelector('meta[name="keywords"]')
    if(!keywordMeta){
      keywordMeta = document.createElement("meta")
      keywordMeta.name = "keywords"
      document.head.appendChild(keywordMeta)
    }
    keywordMeta.content = selectedPost ? metadata.keywords.join(", ") : Object.values(seoKeywordClusters).flat().join(", ")
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = selectedPost ? `https://www.digitalhut.app/blog/${selectedPost.slug || selectedPost.id}` : "https://www.digitalhut.app/blog"
    const pageUrl = canonical.href
    upsertJsonLd("dh-blog-proof-jsonld", selectedPost ? {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: selectedPost.title,
      description,
      image: `https://www.digitalhut.app${thumbnailForPost(selectedPost)}`,
      mainEntityOfPage: pageUrl,
      author: {
        "@type": "Organization",
        name: "DigitalHut"
      },
      publisher: {
        "@type": "Organization",
        name: "DigitalHut"
      },
      keywords: metadata.keywords.join(", "),
      about: metadata.proofAngle,
      audience: metadata.demandClass
    } : {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description,
      url: pageUrl,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: allPosts.slice(0, 18).map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.digitalhut.app/blog/${post.slug || post.id}`,
          name: post.title
        }))
      }
    })
  }, [allPosts, selectedPost])

  return <main className="dh-trust-page dh-blog-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/blog">Blog</Link>
        <Link to="/system-proof">System Proof</Link>
        <Link to="/master-keyword-coverage">Keyword Map</Link>
        <Link to="/daily-situations">Daily Situations</Link>
        <Link to="/asset-lab">Backend</Link>
        <Link to="/faq">FAQ</Link>
      </nav>
    </header>

    {selectedPost ? <ProofDetail post={selectedPost} /> : <>
    <section className="dh-trust-intro dh-blog-intro">
      <span>DigitalHut SEO Observatory</span>
      <h1>3D Observatory Blog, GLB Renderer Reports, And Automatic System Presentations</h1>
      <p>DigitalHut publishes useful explainers around 3D assets, GLB renderer sessions, public observatory feeds, planetary views, researcher workflows, gamer environments, programmer APIs, backlinks, comments, ratings, and new uploads. The FireCuda SEO system turns long-tail phrases into proof pages, watch routes, and measurable pixel goals.</p>
    </section>

    <section className="dh-category-lane-radar" aria-label="DigitalHut crawl bridge from indexed blog pages">
      <article>
        <span>Known Page Bridge</span>
        <h2>Move From Blog To System Proof</h2>
        <p>This route tells crawlers and readers that DigitalHut is one entertainment observatory system, not loose articles.</p>
        <Link to="/system-proof">Open system proof</Link>
      </article>
      <article>
        <span>50K Sitemap Bridge</span>
        <h2>Master Keyword Map</h2>
        <p>The capped sitemap maps the strongest longtail phrases back into real watch proof routes with rank, lane, and query context.</p>
        <Link to="/master-keyword-coverage">Open keyword map</Link>
      </article>
      <article>
        <span>Behavior Bridge</span>
        <h2>Full Entertainment Proof</h2>
        <p>This is the anchor route for video watching, 3D Model View, podcast/source moments, and live analytics in one view.</p>
        <Link to="/watch/full-view-episode-alternative">Open watch proof</Link>
      </article>
      <article>
        <span>Source Bridge</span>
        <h2>Open The Whole-System Trail</h2>
        <p>This direct proof artifact connects the blog layer back to the 200M longtail universe, source opens, GLB, podcast, autoplay, search, market, and Supabase movement.</p>
        <a href={digitalhutMasterListBridge.sourceBridgePath}>Open 200M SEO source proof artifact</a>
      </article>
    </section>

    <section className="dh-blog-runner-proof" aria-label="FireCuda Week 001 proof stack">
      <header>
        <div>
          <span>FireCuda Week 001</span>
          <h2>Featured Long-Tail Proof Stack</h2>
        </div>
        <b>{seoRunnerProofPosts.length} proof pages</b>
      </header>
      <div>
        {seoRunnerProofPosts.slice(0, 6).map((post) => <Link key={post.slug} to={`/blog/${post.slug}`}>
          <small>#{post.rank} / score {post.score}</small>
          <b>{post.keywords[0]}</b>
          <span>{post.proofFocus}</span>
        </Link>)}
      </div>
    </section>

    <section className="dh-blog-keywords" aria-label="DigitalHut keyword lanes">
      {Object.entries(seoKeywordClusters).map(([group, terms]) => <article key={group}>
        <h2>{group}</h2>
        <p>{terms.join(" / ")}</p>
      </article>)}
    </section>

    {runnerPosts.length > 0 && <section className="dh-blog-grid" aria-label="DigitalHut system blog posts">
      {runnerPosts.map((post) => <BlogCard key={post.id || post.slug} post={post} runner />)}
    </section>}

    <section className="dh-blog-grid" aria-label="DigitalHut FireCuda proof posts">
      {mergePosts(seoRunnerProofPosts, seoBlogPosts).map((post) => <BlogCard key={post.slug} post={post} runner={Boolean(post.rank)} />)}
    </section>

    <section className="dh-blog-trends">
      <div>
        <span>System Targets</span>
        <h2>Unusual Trends And Untapped Markets</h2>
        <p>The preservation system should expand into a discovery lane that brings back niches between GLB rendering, automatic 3D presentations, community ratings, SEO backlinks, and fresh API feeds.</p>
      </div>
      <ul>
        {seoTrendSignals.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
    </>}
  </main>
}
