import {useEffect, useMemo} from "react"
import {Link, useParams} from "react-router-dom"
import {seoBlogPosts, seoLaunchTargetsForCategory, seoPlatformCadenceProof, seoRunnerProofPosts, seoSearchIntentRadarProof, seoUsefulnessLaneFor, seoWebCastForCategory, seoWebCastKeywordsFor} from "../lib/seoContentEngine"
import "./TrustPage.css"
import "./BlogPage.css"

function slugify(value = ""){
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "digitalhut"
}

function allProofPosts(){
  const seen = new Set()
  return [...seoRunnerProofPosts, ...seoBlogPosts].filter((post) => {
    const slug = post.slug || post.id
    if(!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  })
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
  const posts = useMemo(() => allProofPosts(), [])
  const activePosts = useMemo(() => {
    const categoryPosts = posts.filter((post) => slugify(post.category) === slug)
    return categoryPosts.length ? categoryPosts : posts.slice(0, 8)
  }, [posts, slug])
  const categoryName = activePosts[0]?.category || "DigitalHut"
  const leadKeyword = activePosts[0]?.keywords?.[0] || activePosts[0]?.title || "DigitalHut proof"
  const usefulnessLane = seoUsefulnessLaneFor({category: categoryName, title: leadKeyword, keywords: activePosts.flatMap((post) => post.keywords || []).slice(0, 12)})
  const launchTargets = useMemo(() => seoLaunchTargetsForCategory(categoryName), [categoryName])
  const launchKeywords = useMemo(() => launchTargets.flatMap((lane) => lane.targets).slice(0, 18), [launchTargets])
  const webCast = useMemo(() => seoWebCastForCategory(categoryName), [categoryName])
  const webCastKeywords = useMemo(() => seoWebCastKeywordsFor({category: categoryName, title: leadKeyword, keywords: activePosts.flatMap((post) => post.keywords || []).slice(0, 8)}, 18), [activePosts, categoryName, leadKeyword])

  useEffect(() => {
    document.title = launchTargets.length ? `${launchKeywords[0]} | DigitalHut Category Proof Lane` : `${categoryName} Proof Lane | DigitalHut`
    let meta = document.querySelector('meta[name="description"]')
    if(!meta){
      meta = document.createElement("meta")
      meta.name = "description"
      document.head.appendChild(meta)
    }
    meta.content = launchTargets.length
      ? `${categoryName} DigitalHut launch lane for ${launchKeywords.slice(0, 4).join(", ")} with video, GLB, podcast/source, watch, blog, category, and backlink proof.`
      : `${categoryName} DigitalHut proof lane for ${leadKeyword}, GLB renderer proof, watch pages, backlinks, and long-tail SEO evidence.`
    let keywordMeta = document.querySelector('meta[name="keywords"]')
    if(!keywordMeta){
      keywordMeta = document.createElement("meta")
      keywordMeta.name = "keywords"
      document.head.appendChild(keywordMeta)
    }
    keywordMeta.content = Array.from(new Set([...(launchKeywords.length ? launchKeywords : activePosts.flatMap((post) => post.keywords || []).slice(0, 18)), ...webCastKeywords])).slice(0, 28).join(", ")
    let canonical = document.querySelector('link[rel="canonical"]')
    if(!canonical){
      canonical = document.createElement("link")
      canonical.rel = "canonical"
      document.head.appendChild(canonical)
    }
    canonical.href = `https://www.digitalhut.app/category/${slug || slugify(categoryName)}`
    upsertJsonLd("dh-category-proof-jsonld", {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${categoryName} Proof Lane | DigitalHut`,
      description: meta.content,
      url: canonical.href,
      audience: usefulnessLane.audience,
      keywords: launchKeywords.join(", "),
      mentions: [
        usefulnessLane.humanNeed,
        ...webCast.webFamilies,
        ...webCast.searcherRoles,
        ...webCast.backlinkAngles,
        seoPlatformCadenceProof.searchIntent,
        seoSearchIntentRadarProof.searchIntent,
        ...usefulnessLane.internationalSideMarkets,
        ...usefulnessLane.backlinkTargets,
        ...seoPlatformCadenceProof.supabaseSignals,
        ...seoSearchIntentRadarProof.supabaseSignals
      ],
      mainEntity: {
        "@type": "ItemList",
        itemListElement: activePosts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.digitalhut.app/blog/${post.slug}`,
          name: post.title,
          description: post.description || post.summary
        }))
      }
    })
  }, [activePosts, categoryName, leadKeyword, launchKeywords, launchTargets.length, slug, usefulnessLane, webCast, webCastKeywords])

  return <main className="dh-trust-page dh-blog-page dh-category-proof-page">
    <header className="dh-trust-nav">
      <Link to="/">DigitalHut</Link>
      <nav>
        <Link to="/blog">Blog</Link>
        <Link to="/asset-lab">Backend</Link>
        <Link to="/insights">Insights</Link>
      </nav>
    </header>

    <section className="dh-category-proof-hero">
      <span>Category Proof Lane</span>
      <h1>{categoryName}</h1>
      <p>This category groups FireCuda-ranked proof pages by practical use: episode topic, GLB proof, source evidence, timeline context, backlink path, and pixel goal.</p>
    </section>

    <section className="dh-category-lane-radar" aria-label={`${categoryName} long-tail usefulness map`}>
      {launchTargets.length > 0 && <article>
        <span>Launch Ranking Targets</span>
        <h2>{launchTargets.length} High-Demand Lanes</h2>
        <p>These targets make the category readable across high-search head terms and long-tail proof routes.</p>
        <div>{launchKeywords.map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
      </article>}
      <article>
        <span>Human Role</span>
        <h2>{usefulnessLane.audience}</h2>
        <p>{usefulnessLane.humanNeed}</p>
      </article>
      <article>
        <span>Full Web Cast</span>
        <h2>{webCast.category} expands past the site category</h2>
        <p>This lane casts into searcher roles, backlink sources, proof routes, and real human questions so the category does not bottleneck at one DigitalHut label.</p>
        <div>{webCastKeywords.slice(0, 10).map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
        <small>Proof route: {webCast.proofRoute}</small>
      </article>
      <article>
        <span>International Side Markets</span>
        <h2>Side Markets To Reach</h2>
        <div>{usefulnessLane.internationalSideMarkets.map((item) => <b key={item}>{item}</b>)}</div>
      </article>
      <article>
        <span>Backlink / Supabase Loop</span>
        <h2>{usefulnessLane.observatoryPlacement}</h2>
        <p>Backlink targets: {usefulnessLane.backlinkTargets.join(", ")}.</p>
        <small>Signals: {usefulnessLane.supabaseSignals.join(" / ")}</small>
      </article>
      <article>
        <span>{seoPlatformCadenceProof.label}</span>
        <h2>{seoPlatformCadenceProof.headline}</h2>
        <p>{seoPlatformCadenceProof.searchIntent}</p>
        <small>Signals: {seoPlatformCadenceProof.supabaseSignals.join(" / ")}</small>
      </article>
      <article>
        <span>{seoSearchIntentRadarProof.label}</span>
        <h2>{seoSearchIntentRadarProof.headline}</h2>
        <p>{seoSearchIntentRadarProof.searchIntent}</p>
        <small>Signals: {seoSearchIntentRadarProof.supabaseSignals.join(" / ")}</small>
      </article>
    </section>

    <section className="dh-category-proof-grid" aria-label={`${categoryName} DigitalHut proof posts`}>
      {activePosts.map((post) => <article key={post.slug}>
        <span>{post.featuredSlot || "proof page"}</span>
        <h2>{post.title}</h2>
        <p>{post.description || post.summary}</p>
        <div>{(post.keywords || []).slice(0, 3).map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
        <footer>
          <Link to={`/blog/${post.slug}`}>Article</Link>
          <Link to={post.watchPageRoute || `/watch/${post.slug}`}>Watch proof</Link>
        </footer>
      </article>)}
    </section>
  </main>
}
