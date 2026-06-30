import {useEffect, useState} from "react"
import {Link} from "react-router-dom"
import {seoBlogPosts, seoKeywordClusters, seoTrendSignals} from "../lib/seoContentEngine"
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
      data-dh-thumbnail-render={runner ? "runner-blog-thumbnail-to-report" : "blog-thumbnail-to-report"}
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
      data-dh-thumbnail-render={runner ? "runner-blog-read-report-to-render" : "blog-read-report-to-render"}
      data-dh-category={category}
      data-dh-asset-id={slug}
    >
      Read report
    </Link>
  </article>
}

export default function BlogPage(){
  const [runnerPosts, setRunnerPosts] = useState([])

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

  return <main className="dh-trust-page dh-blog-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/blog">Blog</Link>
        <Link to="/daily-situations">Daily Situations</Link>
        <Link to="/asset-lab">Backend</Link>
        <Link to="/faq">FAQ</Link>
      </nav>
    </header>

    <section className="dh-trust-intro dh-blog-intro">
      <span>DigitalHut SEO Observatory</span>
      <h1>3D Observatory Blog, GLB Renderer Reports, And Automatic System Presentations</h1>
      <p>DigitalHut publishes useful explainers around 3D assets, GLB renderer sessions, public observatory feeds, planetary views, researcher workflows, gamer environments, programmer APIs, backlinks, comments, ratings, and new uploads.</p>
    </section>

    <section className="dh-blog-keywords" aria-label="DigitalHut keyword lanes">
      {Object.entries(seoKeywordClusters).map(([group, terms]) => <article key={group}>
        <h2>{group}</h2>
        <p>{terms.join(" / ")}</p>
      </article>)}
    </section>

    {runnerPosts.length > 0 && <section className="dh-blog-grid" aria-label="DigitalHut autonomous runner blog posts">
      {runnerPosts.map((post) => <BlogCard key={post.id || post.slug} post={post} runner />)}
    </section>}

    <section className="dh-blog-grid" aria-label="DigitalHut blog posts">
      {seoBlogPosts.map((post) => <BlogCard key={post.slug} post={post} />)}
    </section>

    <section className="dh-blog-trends">
      <div>
        <span>Runner Targets</span>
        <h2>Unusual Trends And Untapped Markets</h2>
        <p>The preservation runners should expand into a discovery lane that brings back niches between GLB rendering, automatic 3D presentations, community ratings, SEO backlinks, and fresh API feeds.</p>
      </div>
      <ul>
        {seoTrendSignals.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  </main>
}
