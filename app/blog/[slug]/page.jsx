import { buildFeatureSlug, listPersonaFeatures } from "../../../lib/personaFeature"
import { buildFeatureSchemaBundle } from "../../../lib/seoSchema"

function featureFromSlug(slug) {
  return listPersonaFeatures().find((feature) => buildFeatureSlug(feature.mainFeatureTitle) === slug) ||
    listPersonaFeatures().find((feature) => feature.intent === "home-project") ||
    listPersonaFeatures()[0]
}

export function generateStaticParams() {
  return listPersonaFeatures().map((feature) => ({ slug: buildFeatureSlug(feature.mainFeatureTitle) }))
}

export async function generateMetadata({ params }) {
  const resolved = await params
  const feature = featureFromSlug(resolved.slug)
  return {
    title: feature.seoTitle,
    description: feature.seoDescription,
    keywords: feature.seoKeywords
  }
}

export default async function PersonaBlogFeaturePage({ params }) {
  const resolved = await params
  const feature = featureFromSlug(resolved.slug)
  const schema = buildFeatureSchemaBundle(feature)

  return <main style={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <article style={styles.article}>
      <p style={styles.eyebrow}>{feature.label} feature brief</p>
      <h1 style={styles.title}>{feature.mainFeatureTitle}</h1>
      <p style={styles.lede}>{feature.blogAngle}</p>

      <section style={styles.grid}>
        <div style={styles.panel}>
          <h2 style={styles.h2}>Main 3D Model</h2>
          <p style={styles.bigText}>{feature.mainGLBSearch}</p>
          <p style={styles.text}>{feature.primaryRenderRole}</p>
        </div>
        <div style={styles.panel}>
          <h2 style={styles.h2}>Context Render</h2>
          <p style={styles.bigText}>{feature.contextGLBSearch}</p>
          <p style={styles.text}>{feature.contextRenderRole}</p>
        </div>
      </section>

      <section style={styles.grid}>
        <div style={styles.panel}>
          <h2 style={styles.h2}>Wallet Access</h2>
          <p style={styles.bigText}>{feature.downloadTier}</p>
          <p style={styles.text}>{feature.walletAction}</p>
        </div>
        <div style={styles.panel}>
          <h2 style={styles.h2}>Market Profile</h2>
          <p style={styles.bigText}>{feature.marketProfile}</p>
          <p style={styles.text}>{feature.market?.symbols?.join(" / ")}</p>
        </div>
      </section>

      <section style={styles.panel}>
        <h2 style={styles.h2}>Why This Feature Matters</h2>
        <p style={styles.text}>{feature.seoDescription}</p>
        <div style={styles.tags}>{feature.seoKeywords?.map((keyword) => <span key={keyword} style={styles.tag}>{keyword}</span>)}</div>
      </section>

      <nav style={styles.links} aria-label="Feature links">
        {feature.internalLinks?.map((href) => <a key={href} href={href} style={styles.link}>{href.replace("/", "") || "home"}</a>)}
      </nav>
    </article>
  </main>
}

const styles = {
  shell: { minHeight: "100vh", padding: "28px 16px", background: "radial-gradient(circle at top left,#12343b 0,#020617 35%,#07111f 100%)", color: "white", fontFamily: "Arial, sans-serif", overflowX: "hidden" },
  article: { width: "min(100%, 1180px)", margin: "0 auto" },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: "0 0 14px", fontSize: "clamp(40px,7vw,78px)", lineHeight: .96, letterSpacing: 0, overflowWrap: "anywhere" },
  lede: { maxWidth: 850, margin: "0 0 22px", color: "#d8e4ee", fontSize: 19, lineHeight: 1.55 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 18, marginBottom: 18 },
  panel: { minWidth: 0, padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.74)", marginBottom: 18 },
  h2: { margin: "0 0 10px", fontSize: 24, lineHeight: 1.15 },
  bigText: { margin: "0 0 10px", color: "#a5f3fc", fontSize: 20, lineHeight: 1.25, fontWeight: 900, overflowWrap: "anywhere" },
  text: { margin: 0, color: "#cbd5e1", lineHeight: 1.55, overflowWrap: "anywhere" },
  tags: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 },
  tag: { padding: "7px 10px", borderRadius: 999, background: "rgba(56,189,248,.14)", color: "#bae6fd", fontSize: 12, fontWeight: 900 },
  links: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 },
  link: { padding: "13px 16px", borderRadius: 8, background: "#38bdf8", color: "#06111a", fontWeight: 900, textDecoration: "none" }
}
