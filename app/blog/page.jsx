import { buildDailyBriefing } from "../lib/blog/dailyPosts"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "DigitalHut Observatory Daily",
  description: "Public 3D model news, market context, wallet signals, and observatory feed coverage."
}

export default function BlogPage() {
  const briefing = buildDailyBriefing({ intent: "public-observatory" })
  const { featured, posts } = briefing

  return (
    <main style={shell}>
      <a href="/" style={back}>Back to DigitalHut</a>
      <section style={hero}>
        <div style={eyebrow}>DigitalHut Observatory Daily</div>
        <h1 style={title}>Public 3D feeds, market context, and prototype views.</h1>
        <p style={lede}>A daily newsdesk for visitors who want to explore orbiting models, market-linked locations, wallet-aware signals, and fresh observatory content without friction.</p>
      </section>

      <section style={featuredCard}>
        <div style={eyebrow}>{featured.section}</div>
        <h2 style={featuredTitle}>{featured.headline}</h2>
        <p style={lede}>{featured.deck}</p>
        <div style={metaGrid}>
          <Info label="3D preload" value={featured.observatoryQuery} />
          <Info label="Markets" value={featured.marketSymbols.join(" / ")} />
          <Info label="Orbit mode" value={featured.orbitMode} />
        </div>
      </section>

      <section style={grid}>
        {posts.map(post => (
          <article key={post.id} style={card}>
            <div style={eyebrow}>{post.section}</div>
            <h2 style={cardTitle}>{post.headline}</h2>
            <p style={copy}>{post.deck}</p>
            <p style={small}>3D feed: {post.observatoryQuery}</p>
            <p style={small}>Symbols: {post.marketSymbols.join(" / ")}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

function Info({ label, value }) {
  return <div style={info}><span>{label}</span><b>{value}</b></div>
}

const shell = { minHeight: "100vh", padding: 28, background: "linear-gradient(135deg,#06111f,#020617 45%,#12231f)", color: "white", fontFamily: "Arial, sans-serif" }
const back = { color: "#67e8f9", fontWeight: 900, textDecoration: "none" }
const hero = { maxWidth: 1180, margin: "28px auto 20px" }
const eyebrow = { fontSize: 12, textTransform: "uppercase", letterSpacing: 0, fontWeight: 900, color: "#67e8f9" }
const title = { fontSize: "clamp(42px,7vw,74px)", lineHeight: .96, margin: "10px 0 16px", letterSpacing: 0, maxWidth: 940 }
const lede = { fontSize: 18, lineHeight: 1.55, color: "#dbeafe", maxWidth: 860 }
const featuredCard = { maxWidth: 1180, margin: "0 auto 20px", border: "1px solid rgba(251,191,36,.34)", borderRadius: 8, background: "rgba(15,23,42,.78)", padding: 22 }
const featuredTitle = { fontSize: 38, lineHeight: 1.05, margin: "8px 0 12px", letterSpacing: 0 }
const metaGrid = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 18 }
const info = { border: "1px solid rgba(148,163,184,.24)", borderRadius: 8, padding: 14, background: "rgba(2,6,23,.42)", display: "grid", gap: 8, color: "#dbeafe", overflowWrap: "anywhere" }
const grid = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 16 }
const card = { border: "1px solid rgba(148,163,184,.24)", borderRadius: 8, background: "rgba(15,23,42,.68)", padding: 18 }
const cardTitle = { fontSize: 26, lineHeight: 1.1, margin: "8px 0 10px", letterSpacing: 0 }
const copy = { color: "#cbd5e1", lineHeight: 1.5 }
const small = { color: "#a7f3d0", fontSize: 13, lineHeight: 1.35, overflowWrap: "anywhere" }
