import {Link} from "react-router-dom"
import {seoBlogPosts, seoKeywordClusters, seoTrendSignals} from "../lib/seoContentEngine"
import "./TrustPage.css"
import "./BlogPage.css"

export default function BlogPage(){
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

    <section className="dh-blog-grid" aria-label="DigitalHut blog posts">
      {seoBlogPosts.map((post) => <article key={post.slug} id={post.slug}>
        <span>{post.category}</span>
        <h2>{post.title}</h2>
        <p>{post.description}</p>
        <div>{post.keywords.map((keyword) => <b key={keyword}>{keyword}</b>)}</div>
        <Link to={`/blog/${post.slug}`}>Read report</Link>
      </article>)}
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
