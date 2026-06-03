"use client"

const apiVisuals = [
  {
    name: "Sketchfab",
    role: "3D model discovery",
    copy: "Searches downloadable models, previews, creators, categories, and GLB-ready assets for the observatory.",
    accent: "#14b8a6"
  },
  {
    name: "Cesium Ion",
    role: "Global environments",
    copy: "Frames terrain, cities, maps, tilesets, and planetary-style world context for richer scenes.",
    accent: "#38bdf8"
  },
  {
    name: "Polygon",
    role: "Market movement",
    copy: "Feeds fast market aggregates and symbol movement into the market desk and agent blog context.",
    accent: "#a78bfa"
  },
  {
    name: "FMP",
    role: "Company profiles",
    copy: "Adds quote, profile, calendar, and financial research layers for agents writing market features.",
    accent: "#facc15"
  },
  {
    name: "Alpha Vantage",
    role: "Technical signals",
    copy: "Adds time series and technical fallback signals when agents need a second market lens.",
    accent: "#fb7185"
  }
]

export default function ApiVisualShowcase() {
  return <section style={styles.wrap} aria-labelledby="api-visual-title">
    <div style={styles.header}>
      <p style={styles.eyebrow}>Connected API engines</p>
      <h2 id="api-visual-title" style={styles.title}>The agents pull models, markets, and world context from five source lanes.</h2>
    </div>
    <div style={styles.grid}>
      {apiVisuals.map((api) => <article key={api.name} style={{...styles.card, borderColor: `${api.accent}66`}}>
        <div style={{...styles.mark, background: api.accent}}>{api.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <h3 style={styles.cardTitle}>{api.name}</h3>
          <p style={{...styles.role, color: api.accent}}>{api.role}</p>
        </div>
        <p style={styles.copy}>{api.copy}</p>
      </article>)}
    </div>
  </section>
}

const styles = {
  wrap: { maxWidth: 1180, margin: "22px auto", padding: 20, border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "rgba(15,23,42,.72)", boxSizing: "border-box" },
  header: { maxWidth: 860, marginBottom: 16 },
  eyebrow: { margin: "0 0 8px", color: "#67e8f9", fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: 0 },
  title: { margin: 0, fontSize: "clamp(26px,4vw,42px)", lineHeight: 1.06, letterSpacing: 0, overflowWrap: "anywhere" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,210px),1fr))", gap: 14 },
  card: { minWidth: 0, padding: 16, border: "1px solid", borderRadius: 8, background: "rgba(2,6,23,.45)", display: "grid", gap: 10, alignContent: "start" },
  mark: { width: 48, height: 48, borderRadius: 8, display: "grid", placeItems: "center", color: "#021014", fontWeight: 900, fontSize: 16 },
  cardTitle: { margin: 0, fontSize: 22, lineHeight: 1.1 },
  role: { margin: "4px 0 0", fontSize: 13, fontWeight: 900, textTransform: "uppercase" },
  copy: { margin: 0, color: "#cbd5e1", lineHeight: 1.48, overflowWrap: "anywhere" }
}
