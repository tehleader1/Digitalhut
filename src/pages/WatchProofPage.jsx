import {useEffect, useMemo} from "react"
import {Link, useLocation, useParams} from "react-router-dom"
import {digitalhutMasterListBridge, digitalhutSourceBridgePath} from "../lib/digitalhutMasterListBridge"
import {seoBlogPosts, seoLaunchTargetsForPost, seoMetadataForProof, seoPlatformCadenceProof, seoRunnerProofPosts, seoSearchIntentRadarProof, seoUsefulnessLaneFor} from "../lib/seoContentEngine"
import {seoSearchClaimForQuery} from "../lib/seoSearchClaimEngine"
import "./TrustPage.css"
import "./BlogPage.css"

const fallbackThumb = "/seo-thumbnails/automatic-3d-autoplay-system.svg"
const categoryThumbs = [
  ["research", "/seo-thumbnails/researcher-3d-imagery.svg"],
  ["planet", "/seo-thumbnails/planetary-orbital-compute.svg"],
  ["orbital", "/seo-thumbnails/planetary-orbital-compute.svg"],
  ["gamer", "/seo-thumbnails/gamer-programmer-renderer.svg"],
  ["programmer", "/seo-thumbnails/gamer-programmer-renderer.svg"],
  ["mainstream", "/seo-thumbnails/mainstream-3d-feed.svg"]
]
const watchProofSteps = [
  ["video radar", "Searches and metadata choose the episode topic before the analytics start moving."],
  ["platform cadence", seoPlatformCadenceProof.headline],
  ["search intent", seoSearchIntentRadarProof.headline],
  ["category fit", "The route separates live API-matched video from quota-safe storyboards so the proof does not overclaim the source."],
  ["GLB proof", "The 3D Model View gives a visible model/source lane instead of a plain article."],
  ["bubble map", "Source evidence, backlinks, page value, and category meaning are grouped together."],
  ["timeline", "Key finds are staged as moments so the proof can be compared against the video."],
  ["podcast/source", "Important context can interrupt the feed and return the viewer to the story."],
  ["pixel goal", "The route is built to measure page view, blog view, GLB play, source click, and wallet interest."]
]

function allProofPosts(){
  const seen = new Set()
  return [...seoRunnerProofPosts, ...seoBlogPosts].filter((post) => {
    const slug = post.slug || post.id
    if(!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  })
}

function thumbnailFor(post){
  const category = String(post?.category || "").toLowerCase()
  return categoryThumbs.find(([key]) => category.includes(key))?.[1] || fallbackThumb
}

function sourceBridgeHref(post, item){
  const bridgeAnchor = String(item || "source").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  return digitalhutSourceBridgePath({
    lane: post?.category || "DigitalHut",
    proof: post?.slug || post?.id || "",
    source: item
  }, bridgeAnchor)
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
  const location = useLocation()
  const posts = useMemo(() => allProofPosts(), [])
  const post = useMemo(() => posts.find((item) => item.slug === slug) || posts[0], [posts, slug])
  const rankParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const rankQuery = rankParams.get("dh_query") || ""
  const rankClaim = useMemo(() => {
    return rankQuery ? seoSearchClaimForQuery(rankQuery, {category: post.category || "DigitalHut"}) : null
  }, [post.category, rankQuery])
  const rankNumber = rankParams.get("dh_rank")
  const globalRankNumber = rankParams.get("dh_global_rank")
  const laneId = rankParams.get("dh_lane")
  const keywords = post.keywords || post.seo_keywords || []
  const proofFocus = post.proofFocus || "video radar, GLB proof dock, timeline, source evidence, and backlink route"
  const launch = seoLaunchTargetsForPost(post)
  const usefulnessLane = seoUsefulnessLaneFor(post)
  const categorySlug = String(post.category || "digitalhut").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const observatoryUrl = `/?category=${encodeURIComponent(post.category || "Mainstream Streaming")}&episode=${encodeURIComponent(keywords[0] || post.title)}&proof=${encodeURIComponent(post.slug || slug || "")}`

  useEffect(() => {
    const metadata = seoMetadataForProof(post, "watch")
    const title = rankClaim ? rankClaim.metadataTitle : metadata.title
    const description = rankClaim ? rankClaim.metadataDescription : metadata.description
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
    keywordMeta.content = rankClaim ? [rankQuery, rankClaim.lane, ...(rankClaim.measurementSignals || [])].join(", ") : metadata.keywords.join(", ")
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = rankClaim
      ? `https://www.digitalhut.app${location.pathname}${location.search}`
      : `https://www.digitalhut.app/watch/${post.slug || slug}`
    upsertJsonLd("dh-watch-proof-jsonld", {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description,
      url: canonical.href,
      about: rankClaim?.lane || metadata.proofAngle,
      audience: usefulnessLane.audience,
      keywords: rankClaim ? [rankQuery, rankClaim.lane, ...(rankClaim.measurementSignals || [])].join(", ") : metadata.keywords.join(", "),
      mentions: [
        usefulnessLane.humanNeed,
        rankClaim?.canonicalRoute,
        rankClaim?.rankUrl,
        seoPlatformCadenceProof.searchIntent,
        seoSearchIntentRadarProof.searchIntent,
        ...usefulnessLane.backlinkTargets,
        ...seoPlatformCadenceProof.supabaseSignals,
        ...seoSearchIntentRadarProof.supabaseSignals,
        ...usefulnessLane.supabaseSignals
      ],
      mainEntity: {
        "@type": "ItemList",
        name: "DigitalHut observatory proof system",
        itemListElement: watchProofSteps.map(([label, detail], index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: label,
          description: detail
        }))
      },
      relatedLink: [
        `https://www.digitalhut.app/blog/${post.slug}`,
        `https://www.digitalhut.app/category/${categorySlug}`
      ]
    })
  }, [categorySlug, location.pathname, location.search, post, proofFocus, rankClaim, rankQuery, slug])

  return <main className="dh-trust-page dh-blog-page dh-watch-proof-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/blog">Blog</Link>
        <Link to={`/blog/${post.slug}`}>Proof Article</Link>
        <Link to="/system-proof">System Proof</Link>
        <Link to="/master-keyword-coverage">Keyword Map</Link>
        <Link to="/asset-lab">Backend</Link>
      </nav>
    </header>

    <section className="dh-watch-proof-hero">
      <div>
        <span>{post.category}</span>
        <h1>{post.title}</h1>
        <p>{post.description || post.summary}</p>
        <div className="dh-watch-proof-actions">
          <Link to={observatoryUrl}>Open live observatory</Link>
          <Link to={`/blog/${post.slug}`}>Read proof article</Link>
          <Link to={`/category/${categorySlug}`}>Category lane</Link>
          <a href={sourceBridgeHref(post, "whole-system source bridge")}>Open source bridge</a>
        </div>
      </div>
      <img src={thumbnailFor(post)} alt={`${post.title} watch proof thumbnail`} loading="eager" decoding="async" />
    </section>

    <section className="dh-watch-proof-grid" aria-label="DigitalHut watch proof system">
      {rankClaim && <article className="dh-rank-proof-card">
        <span>Master Keyword Rank Signal</span>
        <h2>{rankQuery}</h2>
        <p>This URL is part of the {digitalhutMasterListBridge.publicSitemapWindow.toLocaleString()} URL sitemap sample from the {digitalhutMasterListBridge.universe.toLocaleString()} DigitalHut longtail universe. It maps the search phrase into a real watch proof route, then waits for Search Console rows, source opens, proof opens, and Supabase behavior before claiming ranking movement.</p>
        <div>
          <b>{rankClaim.lane}</b>
          {rankNumber && <b>Lane rank {Number(rankNumber).toLocaleString()}</b>}
          {globalRankNumber && <b>Global rank {Number(globalRankNumber).toLocaleString()}</b>}
          {laneId && <b>{laneId}</b>}
          <b>{rankClaim.rankOwnershipMode}</b>
        </div>
      </article>}
      <article>
        <span>Proof Focus</span>
        <h2>{proofFocus}</h2>
        <p>{post.longTailPlacementPitch || `This watch page exists for people searching ${keywords[0] || post.title}. It connects the phrase to a real DigitalHut episode path instead of generic AI filler.`}</p>
        <div>
          <b>video watching</b>
          <b>3D Model View</b>
          <b>podcast/source moments</b>
          <b>live analytics</b>
          <b>Search Console proof route</b>
        </div>
      </article>
      <article>
        <span>Keyword Stack</span>
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
        <span>{seoPlatformCadenceProof.label}</span>
        <h2>{seoPlatformCadenceProof.headline}</h2>
        <p>{seoPlatformCadenceProof.searchIntent}</p>
      </article>
      <article>
        <span>{seoSearchIntentRadarProof.label}</span>
        <h2>{seoSearchIntentRadarProof.headline}</h2>
        <p>{seoSearchIntentRadarProof.searchIntent}</p>
      </article>
      {watchProofSteps.map(([label, detail]) => <article key={label}>
        <span>{label}</span>
        <h2>{detail}</h2>
      </article>)}
    </section>

    <section className="dh-watch-usefulness-radar" aria-label={`${post.title} usefulness radar`}>
      <article>
        <span>Human Role</span>
        <h2>{usefulnessLane.audience}</h2>
        <p>{usefulnessLane.humanNeed}</p>
      </article>
      <article>
        <span>International Side Markets</span>
        <h2>Where The Long-Tail Search Can Spread</h2>
        <div>{usefulnessLane.internationalSideMarkets.map((item) => <b key={item}>{item}</b>)}</div>
      </article>
      <article>
        <span>Backlink Targets</span>
        <h2>Source Proof To Earn</h2>
        <ul>{usefulnessLane.backlinkTargets.map((item) => <li key={item}><a href={sourceBridgeHref(post, item)}>Open source bridge: {item}</a></li>)}</ul>
      </article>
      <article>
        <span>Supabase Signals</span>
        <h2>Behavior This Route Should Prove</h2>
        <div>{usefulnessLane.supabaseSignals.map((item) => <b key={item}>{item}</b>)}</div>
      </article>
      <article>
        <span>Observatory Placement</span>
        <h2>{usefulnessLane.observatoryPlacement}</h2>
      </article>
    </section>
  </main>
}
